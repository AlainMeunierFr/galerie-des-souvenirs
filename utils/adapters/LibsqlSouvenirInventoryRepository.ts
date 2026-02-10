import type { Client } from '@libsql/client';
import type { SouvenirInventoryRepository } from '@/utils/domain/ports/SouvenirInventoryRepository';

export class LibsqlSouvenirInventoryRepository
  implements SouvenirInventoryRepository
{
  constructor(private db: Client) {}

  async upsert(
    nom: string,
    done: number,
    webp: number,
    miniature: number
  ): Promise<void> {
    await this.db.execute({
      sql: `
        INSERT INTO souvenir (nom, done, webp, miniature)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(nom) DO UPDATE SET done=?, webp=?, miniature=?
      `,
      args: [nom, done, webp, miniature, done, webp, miniature],
    });
  }
}
