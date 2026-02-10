import { userTableExists, userTableHasColumns } from '@/utils/db/userTableSchema';
import { db } from '@/lib/db';
import { ensureUserTable } from '@/utils/db/ensureUserTable';

describe('userTableSchema', () => {
  beforeAll(async () => {
    await ensureUserTable(db);
  });

  describe('userTableExists', () => {
    it('retourne true si la table user existe', async () => {
      const exists = await userTableExists(db);
      expect(exists).toBe(true);
    });
  });

  describe('userTableHasColumns', () => {
    it('retourne true si la table contient clerk_id, email, created_at', async () => {
      const hasColumns = await userTableHasColumns(db, [
        'clerk_id',
        'email',
        'created_at',
      ]);
      expect(hasColumns).toBe(true);
    });

    it('retourne false si une colonne est manquante', async () => {
      const hasColumns = await userTableHasColumns(db, [
        'clerk_id',
        'email',
        'inexistante',
      ]);
      expect(hasColumns).toBe(false);
    });
  });
});
