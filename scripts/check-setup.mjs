#!/usr/bin/env node
/**
 * Vérifie que l'environnement est prêt : tables, dossiers souvenirs.
 * Usage: node scripts/check-setup.mjs
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

let ok = true;

console.log('=== Vérification de l\'environnement ===\n');

// 1. Variables d'environnement
if (!process.env.TURSO_DATABASE_URL) {
  console.error('❌ TURSO_DATABASE_URL manquant dans .env.local');
  ok = false;
} else {
  console.log('✓ TURSO_DATABASE_URL défini');
}

// 2. Dossier souvenirs
const miniatureDir = resolve(__dirname, '../data/souvenirs/miniature');
if (!existsSync(miniatureDir)) {
  console.error('❌ Dossier data/souvenirs/miniature absent');
  ok = false;
} else {
  const files = readdirSync(miniatureDir).filter((f) =>
    /\.(webp|jpe?g)$/i.test(f)
  );
  console.log(`✓ data/souvenirs/miniature : ${files.length} fichier(s)`);
}

// 3. Tables en base (optionnel, nécessite Turso)
if (process.env.TURSO_DATABASE_URL && !process.env.TURSO_DATABASE_URL.startsWith('file:')) {
  console.log('\nPour créer les tables : npm run db:init');
}

console.log('\n' + (ok ? '✓ Environnement OK' : '❌ Corriger les erreurs ci-dessus'));
