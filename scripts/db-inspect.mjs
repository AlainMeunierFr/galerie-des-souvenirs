#!/usr/bin/env node
/**
 * Consulte le contenu de la base Turso.
 * Usage: npm run db:inspect
 * Requiert TURSO_DATABASE_URL (et TURSO_AUTH_TOKEN pour Turso cloud) dans .env.local ou .env.
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@libsql/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

const url = process.env.TURSO_DATABASE_URL;
if (!url) {
  console.error('TURSO_DATABASE_URL est requis. Définissez-le dans .env.local (voir docs/ENVIRONNEMENT.md).');
  process.exit(1);
}
const authToken = process.env.TURSO_AUTH_TOKEN;
const db = createClient(
  url.startsWith('file:')
    ? { url }
    : { url, authToken: authToken || undefined }
);

async function main() {
  console.log('=== Tables ===');
  const tables = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  if (tables.rows.length === 0) {
    console.log('Aucune table.');
    return;
  }
  for (const row of tables.rows) {
    const name = row.name;
    console.log('\n--- Table:', name, '---');
    const info = await db.execute(`PRAGMA table_info(${name})`);
    console.log('Colonnes:', info.rows.map((r) => r.name).join(', '));
    const data = await db.execute(`SELECT * FROM ${name}`);
    console.log('Lignes:', data.rows.length);
    if (data.rows.length > 0) {
      console.table(data.rows);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
