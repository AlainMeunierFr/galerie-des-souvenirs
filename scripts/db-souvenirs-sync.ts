#!/usr/bin/env node
/**
 * Synchronise la table souvenir avec Cloudinary ou dossiers locaux.
 * - Mode Cloudinary (défaut) : liste les miniatures dans Cloudinary.
 * - Mode local (SYNC_FROM_LOCAL=1) : lit data/souvenirs/webp, miniature et data/input/done.
 *
 * Usage: npm run db:souvenirs-sync
 * Requiert TURSO_DATABASE_URL (et TURSO_AUTH_TOKEN). CLOUDINARY_* pour le mode Cloudinary.
 */

import { config } from 'dotenv';
import { resolve, join } from 'path';
import { readdir } from 'fs/promises';
import { LibsqlSouvenirInventoryRepository } from '@/utils/adapters/LibsqlSouvenirInventoryRepository';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function listBaseNames(dir: string): Promise<Set<string>> {
  try {
    const files = await readdir(dir);
    return new Set(
      files
        .filter((f) => /\.(heic|webp|jpe?g)$/i.test(f))
        .map((f) => f.replace(/\.(heic|webp|jpe?g)$/i, ''))
    );
  } catch {
    return new Set();
  }
}

async function syncFromLocal(
  repo: LibsqlSouvenirInventoryRepository,
  cwd: string
): Promise<void> {
  const doneDir = join(cwd, 'data', 'input', 'done');
  const webpDir = join(cwd, 'data', 'souvenirs', 'webp');
  const miniatureDir = join(cwd, 'data', 'souvenirs', 'miniature');

  const [doneSet, webpSet, miniatureSet] = await Promise.all([
    listBaseNames(doneDir),
    listBaseNames(webpDir),
    listBaseNames(miniatureDir),
  ]);

  const allNames = new Set([...doneSet, ...webpSet, ...miniatureSet]);
  if (allNames.size === 0) {
    console.log('Aucun souvenir trouvé dans les dossiers locaux.');
    return;
  }

  for (const nom of [...allNames].sort()) {
    const done = doneSet.has(nom) ? 1 : 0;
    const webp = webpSet.has(nom) ? 1 : 0;
    const miniature = miniatureSet.has(nom) ? 1 : 0;
    await repo.upsert(nom, done, webp, miniature);
  }

  console.log(`  ${allNames.size} souvenir(s) synchronisé(s).`);
}

async function syncFromCloudinary(
  repo: LibsqlSouvenirInventoryRepository
): Promise<void> {
  const { CloudinarySouvenirRepository } = await import(
    '@/utils/adapters/CloudinarySouvenirRepository'
  );
  const souvenirRepo = new CloudinarySouvenirRepository();
  const filenames = await souvenirRepo.listFilenames();
  const allNames = new Set(
    filenames.map((f) => f.replace(/\.(webp|jpe?g)$/i, ''))
  );

  if (allNames.size === 0) {
    console.log('Aucun souvenir trouvé dans Cloudinary.');
    return;
  }

  for (const nom of [...allNames].sort()) {
    await repo.upsert(nom, 1, 1, 1);
  }

  console.log(`  ${allNames.size} souvenir(s) synchronisé(s).`);
}

async function main() {
  if (!process.env.TURSO_DATABASE_URL) {
    console.error('TURSO_DATABASE_URL est requis.');
    process.exit(1);
  }

  const { db } = await import('@/lib/db');
  const repo = new LibsqlSouvenirInventoryRepository(db);
  const fromLocal = process.env.SYNC_FROM_LOCAL === '1';

  if (fromLocal) {
    console.log('Sync des souvenirs depuis les dossiers locaux...\n');
    await syncFromLocal(repo, process.cwd());
  } else {
    console.log('Sync des souvenirs depuis Cloudinary...\n');
    await syncFromCloudinary(repo);
  }

  console.log('\nTable souvenir mise à jour.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
