/**
 * Port : suppression des fichiers d'un souvenir (done, webp, miniature).
 * Architecture hexagonale : le domaine ne dépend pas de l'infra.
 */
export interface SouvenirFileDeleter {
  deleteFilesForNom(nom: string): Promise<void>;
}
