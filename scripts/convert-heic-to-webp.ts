#!/usr/bin/env node
/**
 * Convertit les images HEIC du dossier INPUT vers Cloudinary :
 * - miniature/{nom} (512px max, qualité 85)
 * - webp/{nom} (hauteur max 2000 px, qualité 85)
 * Puis déplace les HEIC vers input/done (local).
 * Référence chaque conversion via SouvenirInventoryRepository.
 *
 * Variables : INPUT_DIR (défaut data/input), CLOUDINARY_*, TURSO_*.
 */

import { readdir, readFile, rename, mkdir, access } from 'fs/promises';
import { join, resolve } from 'path';
import { constants } from 'fs';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';
import { LibsqlSouvenirInventoryRepository } from '@/utils/adapters/LibsqlSouvenirInventoryRepository';
import type { SouvenirInventoryRepository } from '@/utils/domain/ports/SouvenirInventoryRepository';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const INPUT_DIR = process.env.INPUT_DIR ?? join(process.cwd(), 'data', 'input');
const DONE_DIR = join(INPUT_DIR, 'done');
const MAX_SIZE = 512;
const WEBP_MAX_HEIGHT = 2000;

function initCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET sont requis.'
    );
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

async function uploadToCloudinary(
  buffer: Buffer,
  publicId: string
): Promise<void> {
  const base64 = buffer.toString('base64');
  await cloudinary.uploader.upload(`data:image/webp;base64,${base64}`, {
    public_id: publicId,
    overwrite: true,
  });
}

async function getInventoryRepository(): Promise<SouvenirInventoryRepository | null> {
  if (!process.env.TURSO_DATABASE_URL) return null;
  const { db } = await import('@/lib/db');
  return new LibsqlSouvenirInventoryRepository(db);
}

async function main() {
  initCloudinary();

  try {
    await access(INPUT_DIR, constants.R_OK);
  } catch {
    console.error(
      `Dossier source introuvable ou illisible : ${INPUT_DIR}\n` +
        `Définissez INPUT_DIR ou créez le dossier (ex. ${join(process.cwd(), 'data', 'input')}).`
    );
    process.exit(1);
  }

  const convert = (await import('heic-convert')).default;
  const inventoryRepo = await getInventoryRepository();

  const files = await readdir(INPUT_DIR);
  const heicFiles = files.filter((f) => f.toLowerCase().endsWith('.heic'));

  if (heicFiles.length === 0) {
    console.log('Aucun fichier HEIC trouvé dans', INPUT_DIR);
    return;
  }

  await mkdir(DONE_DIR, { recursive: true });

  console.log(
    `Conversion de ${heicFiles.length} fichier(s) HEIC → Cloudinary (miniature + webp)...`
  );

  let ok = 0;
  let failed = 0;

  for (const file of heicFiles) {
    const baseName = file.replace(/\.heic$/i, '');
    const srcPath = join(INPUT_DIR, file);

    try {
      const inputBuffer = await readFile(srcPath);
      const jpegBuffer = await convert({
        buffer: inputBuffer as unknown as ArrayBufferLike,
        format: 'JPEG',
        quality: 0.9,
      });

      const pipeline = sharp(jpegBuffer).webp({ quality: 85 });
      const miniatureBuffer = await pipeline
        .clone()
        .resize(MAX_SIZE, MAX_SIZE, { fit: 'inside', withoutEnlargement: true })
        .toBuffer();
      const webpFullBuffer = await pipeline
        .clone()
        .resize({ height: WEBP_MAX_HEIGHT, fit: 'inside', withoutEnlargement: true })
        .toBuffer();

      await uploadToCloudinary(miniatureBuffer, `miniature/${baseName}`);
      await uploadToCloudinary(webpFullBuffer, `webp/${baseName}`);

      await rename(srcPath, join(DONE_DIR, file));

      if (inventoryRepo) {
        try {
          await inventoryRepo.upsert(baseName, 1, 1, 1);
        } catch (e) {
          console.error(`  (référencement base: ${(e as Error).message})`);
        }
      }
      console.log(`  ${file} → Cloudinary miniature/ + webp/ ${baseName}.webp → done/`);
      ok++;
    } catch (err) {
      console.error(`  ✗ ${file}: ${(err as Error).message}`);
      failed++;
    }
  }

  if (failed > 0) {
    console.log(`\nTerminé: ${ok} converti(s), ${failed} échec(s).`);
  }

  console.log('Conversion terminée.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
