import type { Client } from '@libsql/client';

const REQUIRED_COLUMNS = ['id', 'nom', 'done', 'webp', 'miniature'];

export async function souvenirTableExists(db: Client): Promise<boolean> {
  const result = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='souvenir'"
  );
  return result.rows.length > 0;
}

export async function souvenirTableHasColumns(
  db: Client,
  columns: string[]
): Promise<boolean> {
  const result = await db.execute('PRAGMA table_info(souvenir)');
  const existingColumns = result.rows.map(
    (row) => (row as unknown as { name: string }).name
  );
  return columns.every((col) => existingColumns.includes(col));
}

export function getRequiredColumns(): string[] {
  return [...REQUIRED_COLUMNS];
}
