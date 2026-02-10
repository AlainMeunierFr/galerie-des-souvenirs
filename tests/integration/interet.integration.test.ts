/**
 * Tests d'intégration : table interet, LibsqlInteretRepository.
 * Utilise une base SQLite en mémoire (JEST_WORKER_ID défini).
 */
import { db } from '@/lib/db';
import { ensureUserTable, ensureInteretTable } from '@/utils/db';
import { LibsqlInteretRepository } from '@/utils/adapters/LibsqlInteretRepository';
import { interetTableExists } from '@/utils/db/interetTableSchema';

describe('Interet — intégration', () => {
  const repo = new LibsqlInteretRepository(db);

  beforeAll(async () => {
    await ensureUserTable(db);
    await ensureInteretTable(db);
  });

  beforeEach(async () => {
    await db.execute('DELETE FROM interet');
    await db.execute('DELETE FROM user');
  });

  afterAll(() => {
    if (!db.closed) db.close();
  });

  it('la table interet existe après ensureInteretTable', async () => {
    const exists = await interetTableExists(db);
    expect(exists).toBe(true);
  });

  it('upsert puis findByUser retourne les intérêts', async () => {
    const insertUser = await db.execute({
      sql: "INSERT INTO user (clerk_id, email, created_at) VALUES ('clerk_test', 'test@test.fr', datetime('now')) RETURNING id",
      args: [],
    });
    const userId = (insertUser.rows[0] as unknown as { id: number }).id;

    await repo.upsert(userId, 'IMG_001', 'oui');
    await repo.upsert(userId, 'IMG_002', 'non');
    await repo.upsert(userId, 'IMG_003', null);

    const map = await repo.findByUser(userId);
    expect(map.get('IMG_001')).toBe('oui');
    expect(map.get('IMG_002')).toBe('non');
    expect(map.get('IMG_003')).toBe(null);
  });

  it('upsert met à jour un intérêt existant', async () => {
    const insertUser = await db.execute({
      sql: "INSERT INTO user (clerk_id, email, created_at) VALUES ('clerk_test2', 'test2@test.fr', datetime('now')) RETURNING id",
      args: [],
    });
    const userId = (insertUser.rows[0] as unknown as { id: number }).id;

    await repo.upsert(userId, 'IMG_010', 'oui');
    await repo.upsert(userId, 'IMG_010', 'non');

    const map = await repo.findByUser(userId);
    expect(map.get('IMG_010')).toBe('non');
  });

  it('findByUser retourne une map vide si aucun intérêt', async () => {
    const insertUser = await db.execute({
      sql: "INSERT INTO user (clerk_id, email, created_at) VALUES ('clerk_empty', 'empty@test.fr', datetime('now')) RETURNING id",
      args: [],
    });
    const userId = (insertUser.rows[0] as unknown as { id: number }).id;

    const map = await repo.findByUser(userId);
    expect(map.size).toBe(0);
  });
});
