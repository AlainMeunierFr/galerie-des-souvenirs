#!/usr/bin/env node
/**
 * Synchronise la table souvenir avec Vercel Blob (miniatures).
 * Chaque miniature dans Blob → enregistrement souvenir avec done=1, webp=1, miniature=1.
 *
 * Usage: npm run db:souvenirs-sync
 * Requiert BLOB_READ_WRITE_TOKEN, TURSO_DATABASE_URL, TURSO_AUTH_TOKEN dans .env.local
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { list } from '@vercel/blob';
import { LibsqlSouvenirInventoryRepository } from '@/utils/adapters/LibsqlSouvenirInventoryRepository';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const PREFIX = 'miniature/';

function baseName(pathname: string): string {
  return pathname.replace(PREFIX, '').replace(/\.(webp|jpe?g)$/i, '');
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('BLOB_READ_WRITE_TOKEN est requis.');
    process.exit(1);
  }
  if (!process.env.TURSO_DATABASE_URL) {
    console.error('TURSO_DATABASE_URL est requis.');
    process.exit(1);
  }

  const { db } = await import('@/lib/db');
  const repo = new LibsqlSouvenirInventoryRepository(db);

  console.log('Sync des souvenirs depuis Vercel Blob...\n');

  const allNames = new Set<string>();
  let cursor: string | undefined;

  do {
    const result = await list({ prefix: PREFIX, limit: 1000, cursor });
    for (const blob of result.blobs) {
      if (/\.(webp|jpe?g)$/i.test(blob.pathname)) {
        allNames.add(baseName(blob.pathname));
      }
    }
    cursor = result.cursor;
  } while (cursor);

  if (allNames.size === 0) {
    console.log('Aucun souvenir trouvé dans Blob.');
    return;
  }

  for (const nom of [...allNames].sort()) {
    await repo.upsert(nom, 1, 1, 1);
  }

  console.log(`  ${allNames.size} souvenir(s) synchronisé(s).`);
  console.log('\nTable souvenir mise à jour.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
