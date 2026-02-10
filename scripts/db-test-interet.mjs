#!/usr/bin/env node
/**
 * Test d'écriture dans la table interet.
 * Usage: node scripts/db-test-interet.mjs
 * Vérifie que user existe, insère un intérêt de test, affiche le résultat.
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
  console.error('TURSO_DATABASE_URL requis');
  process.exit(1);
}

const db = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log('URL:', url.replace(/\/\/.*@/, '//***@'));
  const users = await db.execute('SELECT id, clerk_id, email FROM user LIMIT 1');
  if (users.rows.length === 0) {
    console.error('Aucun utilisateur en base. Connectez-vous une fois à l\'app.');
    process.exit(1);
  }
  const userId = users.rows[0].id;
  console.log('User:', users.rows[0]);

  await db.execute({
    sql: `
      INSERT INTO interet (user_id, souvenir_nom, interet)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, souvenir_nom) DO UPDATE SET interet = excluded.interet
    `,
    args: [userId, 'TEST_SCRIPT', 'oui'],
  });

  const rows = await db.execute('SELECT * FROM interet');
  console.log('\nTable interet:', rows.rows.length, 'ligne(s)');
  console.table(rows.rows);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
