#!/usr/bin/env node
/**
 * Migration une fois : upload data/souvenirs/miniature et webp vers Vercel Blob.
 * À exécuter si vous aviez des images dans data/ avant de passer à Blob.
 *
 * Usage: npx tsx scripts/migrate-data-to-blob.ts
 * Requiert BLOB_READ_WRITE_TOKEN, TURSO_* dans .env.local
 */

import { readdir, readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { config } from 'dotenv';
import { put } from '@vercel/blob';
import { LibsqlSouvenirInventoryRepository } from '@/utils/adapters/LibsqlSouvenirInventoryRepository';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const BASE = process.cwd();
const MINIATURE_DIR = join(BASE, 'data', 'souvenirs', 'miniature');
const WEBP_DIR = join(BASE, 'data', 'souvenirs', 'webp');

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('BLOB_READ_WRITE_TOKEN est requis.');
    process.exit(1);
  }

  const names = new Set<string>();

  for (const [dir, prefix] of [
    [MINIATURE_DIR, 'miniature/'],
    [WEBP_DIR, 'webp/'],
  ] as const) {
    let files: string[];
    try {
      files = await readdir(dir);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') continue;
      throw err;
    }
    for (const f of files.filter((x) => /\.(webp|jpe?g)$/i.test(x))) {
      const pathname = `${prefix}${f}`;
      const buffer = await readFile(join(dir, f));
      await put(pathname, buffer, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      names.add(f.replace(/\.(webp|jpe?g)$/i, ''));
      console.log(`  ${pathname} uploaded`);
    }
  }

  if (names.size === 0) {
    console.log('Aucun fichier à migrer dans data/souvenirs.');
    return;
  }

  if (process.env.TURSO_DATABASE_URL) {
    const { db } = await import('@/lib/db');
    const repo = new LibsqlSouvenirInventoryRepository(db);
    for (const nom of [...names].sort()) {
      await repo.upsert(nom, 1, 1, 1);
    }
    console.log(`  ${names.size} souvenir(s) synchronisé(s) en base.`);
  }

  console.log('\nMigration terminée.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
