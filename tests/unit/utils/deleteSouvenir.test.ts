import { deleteSouvenir } from '@/utils/use-cases/deleteSouvenir';
import type { SouvenirInventoryRepository } from '@/utils/domain/ports/SouvenirInventoryRepository';
import type { SouvenirFileDeleter } from '@/utils/domain/ports/SouvenirFileDeleter';

describe('deleteSouvenir', () => {
  it('appelle d\'abord la suppression des fichiers puis l\'inventory delete', async () => {
    const calls: string[] = [];
    const inventoryRepo: SouvenirInventoryRepository = {
      upsert: async () => {},
      delete: async (nom: string) => {
        calls.push(`inventory.delete(${nom})`);
      },
    };
    const fileDeleter: SouvenirFileDeleter = {
      deleteFilesForNom: async (nom: string) => {
        calls.push(`fileDeleter.deleteFilesForNom(${nom})`);
      },
    };

    await deleteSouvenir('IMG_001', inventoryRepo, fileDeleter);

    expect(calls).toEqual([
      'fileDeleter.deleteFilesForNom(IMG_001)',
      'inventory.delete(IMG_001)',
    ]);
  });
});
