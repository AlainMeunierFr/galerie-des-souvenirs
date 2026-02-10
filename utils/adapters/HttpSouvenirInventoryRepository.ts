import { createClient } from 'libsql-stateless-easy';
import type { SouvenirInventoryRepository } from '@/utils/domain/ports/SouvenirInventoryRepository';

function toHttpUrl(libsqlUrl: string): string {
  return libsqlUrl.replace(/^libsql:\/\//, 'https://');
}

/**
 * Adaptateur HTTP pour SouvenirInventoryRepository.
 * Utilise libsql-stateless-easy au lieu de @libsql/client pour les environnements
 * serverless (Vercel) où le client natif dépasse la limite de 300Mo.
 */
export class HttpSouvenirInventoryRepository implements SouvenirInventoryRepository {
  private client = createClient({
    url: toHttpUrl(process.env.TURSO_DATABASE_URL ?? ''),
    authToken: process.env.TURSO_AUTH_TOKEN,
    disableCriticalChecks: true,
  });

  async upsert(
    nom: string,
    done: number,
    webp: number,
    miniature: number
  ): Promise<void> {
    await this.client.execute({
      sql: `
        INSERT INTO souvenir (nom, done, webp, miniature)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(nom) DO UPDATE SET done=?, webp=?, miniature=?
      `,
      args: [nom, done, webp, miniature, done, webp, miniature],
    });
  }

  async delete(nom: string): Promise<void> {
    await this.client.execute({
      sql: 'DELETE FROM souvenir WHERE nom = ?',
      args: [nom],
    });
  }
}
