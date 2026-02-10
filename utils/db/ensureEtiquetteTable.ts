import type { Client } from '@libsql/client';

const ETIQUETTE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS etiquette (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  libelle TEXT NOT NULL UNIQUE
);
`;

export async function ensureEtiquetteTable(db: Client): Promise<void> {
  await db.execute(ETIQUETTE_TABLE_SQL);
}
