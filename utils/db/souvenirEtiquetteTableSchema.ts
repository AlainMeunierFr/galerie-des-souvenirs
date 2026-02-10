import type { Client } from '@libsql/client';

export async function souvenirEtiquetteTableExists(db: Client): Promise<boolean> {
  const result = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='souvenir_etiquette'"
  );
  return result.rows.length > 0;
}

export async function souvenirEtiquetteTableHasColumns(
  db: Client,
  columns: string[]
): Promise<boolean> {
  const result = await db.execute('PRAGMA table_info(souvenir_etiquette)');
  const existingColumns = result.rows.map(
    (row) => (row as unknown as { name: string }).name
  );
  return columns.every((col) => existingColumns.includes(col));
}
