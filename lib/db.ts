import { createClient } from '@libsql/client';

const url =
  process.env.TURSO_DATABASE_URL ??
  (process.env.JEST_WORKER_ID !== undefined ? 'file::memory:' : null);

if (!url) {
  throw new Error(
    'TURSO_DATABASE_URL est requis (voir docs/ENVIRONNEMENT.md).'
  );
}

export const db = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
