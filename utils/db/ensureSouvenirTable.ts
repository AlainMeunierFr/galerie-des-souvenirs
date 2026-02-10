import type { Client } from '@libsql/client';

const SOUVENIR_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS souvenir (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT UNIQUE NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  webp INTEGER NOT NULL DEFAULT 0,
  miniature INTEGER NOT NULL DEFAULT 0
);
`;

export async function ensureSouvenirTable(db: Client): Promise<void> {
  await db.execute(SOUVENIR_TABLE_SQL);
}
