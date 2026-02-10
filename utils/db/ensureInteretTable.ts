import type { Client } from '@libsql/client';

const INTERET_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS interet (
  user_id INTEGER NOT NULL REFERENCES user(id),
  souvenir_nom TEXT NOT NULL,
  interet TEXT CHECK (interet IS NULL OR interet IN ('oui', 'non')),
  PRIMARY KEY (user_id, souvenir_nom)
);
`;

export async function ensureInteretTable(db: Client): Promise<void> {
  await db.execute(INTERET_TABLE_SQL);
}
