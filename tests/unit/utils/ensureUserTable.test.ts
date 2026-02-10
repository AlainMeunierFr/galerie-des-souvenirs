import { ensureUserTable } from '@/utils/db/ensureUserTable';
import { db } from '@/lib/db';

describe('ensureUserTable', () => {
  it('crée la table user si elle n\'existe pas', async () => {
    await ensureUserTable(db);
    const result = await db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='user'"
    );
    expect(result.rows.length).toBe(1);
  });

  it('ne modifie pas la table si elle existe déjà', async () => {
    await ensureUserTable(db);
    await ensureUserTable(db);
    const result = await db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='user'"
    );
    expect(result.rows.length).toBe(1);
  });
});
