import type { Client } from '@libsql/client';
import type {
  InteretRepository,
  InteretValeur,
} from '@/utils/domain/ports/InteretRepository';
import { ensureInteretTable } from '@/utils/db/ensureInteretTable';

export class LibsqlInteretRepository implements InteretRepository {
  constructor(private db: Client) {}

  async ensureTable(): Promise<void> {
    await ensureInteretTable(this.db);
  }

  async upsert(
    user_id: number,
    souvenir_nom: string,
    interet: InteretValeur
  ): Promise<void> {
    const sql = `
      INSERT INTO interet (user_id, souvenir_nom, interet)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, souvenir_nom) DO UPDATE SET interet = excluded.interet
    `;
    const args = [user_id, souvenir_nom, interet];
    await this.db.batch([
      { sql, args },
    ], 'write');
  }

  async findByUser(user_id: number): Promise<Map<string, InteretValeur>> {
    const result = await this.db.execute({
      sql: 'SELECT souvenir_nom, interet FROM interet WHERE user_id = ?',
      args: [user_id],
    });
    const map = new Map<string, InteretValeur>();
    for (const row of result.rows) {
      const r = row as unknown as { souvenir_nom: string; interet: string | null };
      const val =
        r.interet === null || r.interet === undefined
          ? null
          : (r.interet as InteretValeur);
      map.set(r.souvenir_nom, val);
    }
    return map;
  }
}
