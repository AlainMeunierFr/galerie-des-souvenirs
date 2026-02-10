/**
 * Tests d'intégration : tables etiquette, souvenir_etiquette, LibsqlEtiquetteRepository.
 * Utilise une base SQLite en mémoire (JEST_WORKER_ID défini).
 */
import { db } from '@/lib/db';
import {
  ensureEtiquetteTable,
  ensureSouvenirEtiquetteTable,
} from '@/utils/db';
import {
  etiquetteTableExists,
  etiquetteTableHasColumns,
} from '@/utils/db/etiquetteTableSchema';
import {
  souvenirEtiquetteTableExists,
  souvenirEtiquetteTableHasColumns,
} from '@/utils/db/souvenirEtiquetteTableSchema';
import { LibsqlEtiquetteRepository } from '@/utils/adapters/LibsqlEtiquetteRepository';

describe('Etiquettes — intégration', () => {
  const repo = new LibsqlEtiquetteRepository(db);

  beforeAll(async () => {
    await ensureEtiquetteTable(db);
    await ensureSouvenirEtiquetteTable(db);
  });

  beforeEach(async () => {
    await db.execute('DELETE FROM souvenir_etiquette');
    await db.execute('DELETE FROM etiquette');
  });

  afterAll(() => {
    if (!db.closed) db.close();
  });

  it('les tables etiquette et souvenir_etiquette existent après ensure', async () => {
    expect(await etiquetteTableExists(db)).toBe(true);
    expect(await etiquetteTableHasColumns(db, ['id', 'libelle'])).toBe(true);
    expect(await souvenirEtiquetteTableExists(db)).toBe(true);
    expect(
      await souvenirEtiquetteTableHasColumns(db, ['souvenir_nom', 'etiquette_id'])
    ).toBe(true);
  });

  it('create avec libellé non vide retourne un id', async () => {
    const { id } = await repo.create('Vacances');
    expect(typeof id).toBe('number');
    expect(id).toBeGreaterThan(0);
  });

  it('create avec libellé vide lance une erreur', async () => {
    await expect(repo.create('')).rejects.toThrow();
    await expect(repo.create('   ')).rejects.toThrow();
  });

  it('create avec libellé déjà existant lance une erreur', async () => {
    await repo.create('Famille');
    await expect(repo.create('Famille')).rejects.toThrow();
  });

  it('update renomme une étiquette', async () => {
    const { id } = await repo.create('Vacances');
    await repo.update(id, 'Vacances 2024');
    const list = await repo.listAll();
    expect(list.find((e) => e.id === id)?.libelle).toBe('Vacances 2024');
  });

  it('update avec libellé existant lance une erreur', async () => {
    await repo.create('Vacances');
    const { id } = await repo.create('Famille');
    await expect(repo.update(id, 'Vacances')).rejects.toThrow();
  });

  it('listAll retourne les etiquettes créées', async () => {
    const { id: id1 } = await repo.create('Vacances');
    const { id: id2 } = await repo.create('Famille');
    const list = await repo.listAll();
    expect(list).toHaveLength(2);
    expect(list.map((e) => e.libelle).sort()).toEqual(['Famille', 'Vacances']);
    expect(list.find((e) => e.libelle === 'Vacances')?.id).toBe(id1);
    expect(list.find((e) => e.libelle === 'Famille')?.id).toBe(id2);
  });

  it('assign lie une étiquette à des souvenirs', async () => {
    const { id } = await repo.create('Noël');
    await repo.assign(id, ['IMG_001', 'IMG_002']);
    const avec = await repo.getSouvenirNomsWithEtiquette(id, [
      'IMG_001',
      'IMG_002',
      'IMG_003',
    ]);
    expect(avec.sort()).toEqual(['IMG_001', 'IMG_002']);
  });

  it('unassign retire une étiquette des souvenirs', async () => {
    const { id } = await repo.create('Portrait');
    await repo.assign(id, ['IMG_010', 'IMG_011']);
    await repo.unassign(id, ['IMG_010']);
    const avec = await repo.getSouvenirNomsWithEtiquette(id, [
      'IMG_010',
      'IMG_011',
    ]);
    expect(avec).toEqual(['IMG_011']);
  });

  it('getSouvenirNomsWithEtiquette retourne le sous-ensemble des noms qui ont cette étiquette', async () => {
    const { id } = await repo.create('Paysage');
    await repo.assign(id, ['A.jpg', 'C.jpg']);
    const avec = await repo.getSouvenirNomsWithEtiquette(id, [
      'A.jpg',
      'B.jpg',
      'C.jpg',
    ]);
    expect(avec.sort()).toEqual(['A.jpg', 'C.jpg']);
  });
});
