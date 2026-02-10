import type { SouvenirInventoryRepository } from '@/utils/domain/ports/SouvenirInventoryRepository';
import type { SouvenirFileDeleter } from '@/utils/domain/ports/SouvenirFileDeleter';

/**
 * US-5.3 : Supprime un souvenir (fichiers + base).
 * Appelle d'abord la suppression des fichiers (done, webp, miniature), puis la suppression en base.
 */
export async function deleteSouvenir(
  nom: string,
  inventoryRepo: SouvenirInventoryRepository,
  fileDeleter: SouvenirFileDeleter
): Promise<void> {
  await fileDeleter.deleteFilesForNom(nom);
  await inventoryRepo.delete(nom);
}
