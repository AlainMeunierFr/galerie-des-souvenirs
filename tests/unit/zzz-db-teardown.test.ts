/**
 * S'exécute en dernier (séquenceur) : ferme la connexion libsql pour que Jest puisse se terminer.
 */
import { db } from '@/lib/db';

describe('teardown db', () => {
  afterAll(() => {
    if (!db.closed) {
      db.close();
    }
  });

  it('placeholder', () => {
    expect(true).toBe(true);
  });
});
