import type { Client } from '@libsql/client';

const USER_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

export async function ensureUserTable(db: Client): Promise<void> {
  await db.execute(USER_TABLE_SQL);
}
