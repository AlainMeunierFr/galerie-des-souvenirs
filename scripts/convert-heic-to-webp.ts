#!/usr/bin/env node
/**
 * Convertit les images HEIC de "data/input/*.HEIC" vers :
 * - data/souvenirs/miniature/*.webp (512px max, qualité 85)
 * - data/souvenirs/webp/*.webp (taille complète, qualité 85)
 * - data/input/done (HEIC déplacés)
 * Référence chaque conversion réussie via SouvenirInventoryRepository (archi hexagonale).
 */

import { readdir, readFile, writeFile, mkdir, rename } from 'fs/promises';
import { join, resolve } from 'path';
import sharp from 'sharp';
import { config } from 'dotenv';
import { LibsqlSouvenirInventoryRepository } from '@/utils/adapters/LibsqlSouvenirInventoryRepository';
import type { SouvenirInventoryRepository } from '@/utils/domain/ports/SouvenirInventoryRepository';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const SRC_DIR = join(process.cwd(), 'data', 'input');
const DONE_DIR = join(process.cwd(), 'data', 'input', 'done');
const MINIATURE_DIR = join(process.cwd(), 'data', 'souvenirs', 'miniature');
const WEBP_DIR = join(process.cwd(), 'data', 'souvenirs', 'webp');
const MAX_SIZE = 512;

async function getInventoryRepository(): Promise<SouvenirInventoryRepository | null> {
  if (!process.env.TURSO_DATABASE_URL) return null;
  const { db } = await import('@/lib/db');
  return new LibsqlSouvenirInventoryRepository(db);
}

async function main() {
  const convert = (await import('heic-convert')).default;
  const inventoryRepo = await getInventoryRepository();

  const files = await readdir(SRC_DIR);
  const heicFiles = files.filter((f) => f.toLowerCase().endsWith('.heic'));

  if (heicFiles.length === 0) {
    console.log('Aucun fichier HEIC trouvé dans', SRC_DIR);
    return;
  }

  await mkdir(MINIATURE_DIR, { recursive: true });
  await mkdir(WEBP_DIR, { recursive: true });
  await mkdir(DONE_DIR, { recursive: true });

  console.log(
    `Conversion de ${heicFiles.length} fichier(s) HEIC → miniature/ + webp/...`
  );

  let ok = 0;
  let failed = 0;

  for (const file of heicFiles) {
    const baseName = file.replace(/\.heic$/i, '');
    const srcPath = join(SRC_DIR, file);
    const miniaturePath = join(MINIATURE_DIR, `${baseName}.webp`);
    const webpPath = join(WEBP_DIR, `${baseName}.webp`);

    try {
      const inputBuffer = await readFile(srcPath);
      const jpegBuffer = await convert({
        buffer: inputBuffer.buffer.slice(
          inputBuffer.byteOffset,
          inputBuffer.byteOffset + inputBuffer.byteLength
        ) as ArrayBuffer,
        format: 'JPEG',
        quality: 0.9,
      });

      const pipeline = sharp(jpegBuffer).webp({ quality: 85 });
      const miniatureBuffer = await pipeline
        .clone()
        .resize(MAX_SIZE, MAX_SIZE, { fit: 'inside', withoutEnlargement: true })
        .toBuffer();
      const webpFullBuffer = await pipeline.clone().toBuffer();

      await writeFile(miniaturePath, miniatureBuffer);
      await writeFile(webpPath, webpFullBuffer);
      await rename(srcPath, join(DONE_DIR, file));

      if (inventoryRepo) {
        try {
          await inventoryRepo.upsert(baseName, 1, 1, 1);
        } catch (e) {
          console.error(`  (référencement base: ${(e as Error).message})`);
        }
      }
      console.log(`  ${file} → miniature/ + webp/ ${baseName}.webp → done/`);
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
