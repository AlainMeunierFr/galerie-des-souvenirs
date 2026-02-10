import type { Client } from '@libsql/client';

export async function userTableExists(db: Client): Promise<boolean> {
  const result = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='user'"
  );
  return result.rows.length > 0;
}

export async function userTableHasColumns(
  db: Client,
  columns: string[]
): Promise<boolean> {
  const result = await db.execute('PRAGMA table_info(user)');
  const existingColumns = result.rows.map(
    (row) => (row as unknown as { name: string }).name
  );
  return columns.every((col) => existingColumns.includes(col));
}
