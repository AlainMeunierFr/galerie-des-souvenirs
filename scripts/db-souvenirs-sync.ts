#!/usr/bin/env node
/**
 * Synchronise la table souvenir avec les dossiers :
 * - data/input/done (HEIC convertis, colonne done)
 * - data/souvenirs/webp (webp pleine taille, colonne webp)
 * - data/souvenirs/miniature (miniatures webp, colonne miniature)
 *
 * Usage: npm run db:souvenirs-sync
 * Requiert TURSO_DATABASE_URL et TURSO_AUTH_TOKEN dans .env.local
 * Architecture hexagonale : utilise SouvenirInventoryRepository.
 */

import { config } from 'dotenv';
import { resolve, join } from 'path';
import { readdir } from 'fs/promises';
import { LibsqlSouvenirInventoryRepository } from '@/utils/adapters/LibsqlSouvenirInventoryRepository';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const DONE_DIR = join(process.cwd(), 'data', 'input', 'done');
const WEBP_DIR = join(process.cwd(), 'data', 'souvenirs', 'webp');
const MINIATURE_DIR = join(process.cwd(), 'data', 'souvenirs', 'miniature');

function baseName(file: string): string {
  return file.replace(/\.(heic|webp|jpe?g)$/i, '');
}

async function listBaseNames(
  dir: string,
  pattern = /\.(heic|webp|jpe?g)$/i
): Promise<Set<string>> {
  try {
    const files = await readdir(dir);
    return new Set(files.filter((f) => pattern.test(f)).map(baseName));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return new Set();
    throw err;
  }
}

async function main() {
  if (!process.env.TURSO_DATABASE_URL) {
    console.error(
      'TURSO_DATABASE_URL est requis. Définissez-le dans .env.local (voir docs/ENVIRONNEMENT.md).'
    );
    process.exit(1);
  }

  const { db } = await import('@/lib/db');
  const repo = new LibsqlSouvenirInventoryRepository(db);

  console.log('Sync des souvenirs (Done, Webp, Miniature)...\n');

  const [doneSet, webpSet, miniatureSet] = await Promise.all([
    listBaseNames(DONE_DIR),
    listBaseNames(WEBP_DIR),
    listBaseNames(MINIATURE_DIR),
  ]);

  const allNames = new Set([...doneSet, ...webpSet, ...miniatureSet]);

  if (allNames.size === 0) {
    console.log('Aucun souvenir trouvé dans les dossiers.');
    return;
  }

  for (const nom of [...allNames].sort()) {
    const done = doneSet.has(nom) ? 1 : 0;
    const webp = webpSet.has(nom) ? 1 : 0;
    const miniature = miniatureSet.has(nom) ? 1 : 0;
    await repo.upsert(nom, done, webp, miniature);
  }

  console.log(`  ${allNames.size} souvenir(s) synchronisé(s).`);
  console.log('\nTable souvenir mise à jour.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
