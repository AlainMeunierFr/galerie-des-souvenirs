#!/usr/bin/env node
/**
 * Initialise le schéma de la base Turso (crée les tables si elles n'existent pas).
 * À lancer une fois sur une base vierge.
 * Usage: npm run db:init
 * Requiert TURSO_DATABASE_URL (et TURSO_AUTH_TOKEN) dans .env.local ou .env.
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

const USER_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

const SOUVENIR_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS souvenir (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT UNIQUE NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  webp INTEGER NOT NULL DEFAULT 0,
  miniature INTEGER NOT NULL DEFAULT 0
);
`;

const INTERET_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS interet (
  user_id INTEGER NOT NULL REFERENCES user(id),
  souvenir_nom TEXT NOT NULL,
  interet TEXT CHECK (interet IS NULL OR interet IN ('oui', 'non')),
  PRIMARY KEY (user_id, souvenir_nom)
);
`;

async function main() {
  console.log('Initialisation du schéma...');
  await db.execute(USER_TABLE_SQL);
  console.log('Table user créée ou déjà existante.');
  await db.execute(SOUVENIR_TABLE_SQL);
  console.log('Table souvenir créée ou déjà existante.');
  await db.execute(INTERET_TABLE_SQL);
  console.log('Table interet créée ou déjà existante.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
