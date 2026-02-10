import type { Client } from '@libsql/client';

const SOUVENIR_ETIQUETTE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS souvenir_etiquette (
  souvenir_nom TEXT NOT NULL,
  etiquette_id INTEGER NOT NULL REFERENCES etiquette(id) ON DELETE CASCADE,
  PRIMARY KEY (souvenir_nom, etiquette_id)
);
`;

export async function ensureSouvenirEtiquetteTable(db: Client): Promise<void> {
  await db.execute(SOUVENIR_ETIQUETTE_TABLE_SQL);
}
