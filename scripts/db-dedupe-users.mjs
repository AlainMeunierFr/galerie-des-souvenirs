#!/usr/bin/env node
/**
 * Supprime les doublons d'utilisateurs (même email).
 * Garde le plus ancien (id min), supprime les autres.
 * À lancer une fois si tu as des doublons.
 * Usage: node scripts/db-dedupe-users.mjs
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@libsql/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

const url = process.env.TURSO_DATABASE_URL;
if (!url || url.startsWith('file:')) {
  console.error('Ce script doit utiliser la base Turso cloud (TURSO_DATABASE_URL).');
  process.exit(1);
}

const db = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  const dupes = await db.execute(`
    SELECT email, GROUP_CONCAT(id) as ids, COUNT(*) as n
    FROM user GROUP BY email HAVING COUNT(*) > 1
  `);
  if (dupes.rows.length === 0) {
    console.log('Aucun doublon d\'email trouvé.');
    return;
  }
  for (const row of dupes.rows) {
    const { email, ids, n } = row;
    const idList = String(ids).split(',').map(Number).sort((a, b) => a - b);
    const toKeep = idList[0];
    const toDelete = idList.slice(1);
    console.log(`Email ${email}: ${n} utilisateur(s), garde id=${toKeep}, supprime ${toDelete.join(', ')}`);
    for (const id of toDelete) {
      await db.execute('DELETE FROM interet WHERE user_id = ?', { args: [id] });
      await db.execute('DELETE FROM user WHERE id = ?', { args: [id] });
      console.log(`  Supprimé user id=${id}`);
    }
  }
  console.log('Déduplication terminée.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
