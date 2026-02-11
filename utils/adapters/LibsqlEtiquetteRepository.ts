import type { Client } from '@libsql/client';
import type { EtiquetteRepository } from '@/utils/domain/ports/EtiquetteRepository';
import { ensureEtiquetteTable } from '@/utils/db/ensureEtiquetteTable';
import { ensureSouvenirEtiquetteTable } from '@/utils/db/ensureSouvenirEtiquetteTable';

export class LibsqlEtiquetteRepository implements EtiquetteRepository {
  constructor(private db: Client) {}

  async ensureTables(): Promise<void> {
    await ensureEtiquetteTable(this.db);
    await ensureSouvenirEtiquetteTable(this.db);
  }

  async create(libelle: string): Promise<{ id: number }> {
    const trimmed = libelle.trim();
    if (!trimmed) {
      throw new Error('Le libellé ne peut pas être vide');
    }
    try {
      const result = await this.db.execute({
        sql: 'INSERT INTO etiquette (libelle) VALUES (?) RETURNING id',
        args: [trimmed],
      });
      const row = result.rows[0] as unknown as { id: number };
      return { id: row.id };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (
        message.includes('UNIQUE') ||
        message.includes('unique') ||
        message.includes('SQLITE_CONSTRAINT')
      ) {
        throw new Error('Une étiquette avec ce libellé existe déjà');
      }
      throw err;
    }
  }

  async update(id: number, libelle: string): Promise<void> {
    const trimmed = libelle.trim();
    if (!trimmed) {
      throw new Error('Le libellé ne peut pas être vide');
    }
    try {
      await this.db.execute({
        sql: 'UPDATE etiquette SET libelle = ? WHERE id = ?',
        args: [trimmed, id],
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (
        message.includes('UNIQUE') ||
        message.includes('unique') ||
        message.includes('SQLITE_CONSTRAINT')
      ) {
        throw new Error('Une étiquette avec ce libellé existe déjà');
      }
      throw err;
    }
  }

  async delete(id: number): Promise<void> {
    await this.db.execute({
      sql: 'DELETE FROM etiquette WHERE id = ?',
      args: [id],
    });
  }

  async listAll(): Promise<{ id: number; libelle: string }[]> {
    const result = await this.db.execute({
      sql: 'SELECT id, libelle FROM etiquette ORDER BY libelle',
      args: [],
    });
    return result.rows.map((row) => {
      const r = row as unknown as { id: number; libelle: string };
      return { id: r.id, libelle: r.libelle };
    });
  }

  async assign(etiquetteId: number, souvenirNoms: string[]): Promise<void> {
    if (souvenirNoms.length === 0) return;
    const statements = souvenirNoms.map((nom) => ({
      sql: 'INSERT OR IGNORE INTO souvenir_etiquette (souvenir_nom, etiquette_id) VALUES (?, ?)',
      args: [nom, etiquetteId],
    }));
    await this.db.batch(statements, 'write');
  }

  async unassign(etiquetteId: number, souvenirNoms: string[]): Promise<void> {
    if (souvenirNoms.length === 0) return;
    const placeholders = souvenirNoms.map(() => '?').join(', ');
    await this.db.execute({
      sql: `DELETE FROM souvenir_etiquette WHERE etiquette_id = ? AND souvenir_nom IN (${placeholders})`,
      args: [etiquetteId, ...souvenirNoms],
    });
  }

  async getSouvenirNomsWithEtiquette(
    etiquetteId: number,
    souvenirNoms: string[]
  ): Promise<string[]> {
    if (souvenirNoms.length === 0) return [];
    const placeholders = souvenirNoms.map(() => '?').join(', ');
    const result = await this.db.execute({
      sql: `SELECT souvenir_nom FROM souvenir_etiquette WHERE etiquette_id = ? AND souvenir_nom IN (${placeholders})`,
      args: [etiquetteId, ...souvenirNoms],
    });
    return result.rows.map(
      (row) => (row as unknown as { souvenir_nom: string }).souvenir_nom
    );
  }
}
