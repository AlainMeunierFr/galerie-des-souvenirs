import { LibsqlSouvenirInventoryRepository } from '@/utils/adapters/LibsqlSouvenirInventoryRepository';
import { ensureSouvenirTable } from '@/utils/db';
import { db } from '@/lib/db';

describe('LibsqlSouvenirInventoryRepository', () => {
  const repo = new LibsqlSouvenirInventoryRepository(db);

  beforeAll(async () => {
    await ensureSouvenirTable(db);
  });

  beforeEach(async () => {
    await db.execute('DELETE FROM souvenir');
  });

  it('supprime un enregistrement après upsert', async () => {
    await repo.upsert('IMG_001', 1, 1, 1);
    await repo.delete('IMG_001');
    const r = await db.execute({
      sql: 'SELECT nom FROM souvenir WHERE nom = ?',
      args: ['IMG_001'],
    });
    expect(r.rows.length).toBe(0);
  });
});
