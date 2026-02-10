/**
 * Port : inventaire des souvenirs en base (état done/webp/miniature).
 * Architecture hexagonale : le domaine ne dépend pas de l'infra.
 */
export interface SouvenirInventoryRepository {
  upsert(nom: string, done: number, webp: number, miniature: number): Promise<void>;
  delete(nom: string): Promise<void>;
}
