/**
 * Port : intérêt utilisateur par souvenir (oui / non / non prononcé).
 * Architecture hexagonale : le domaine ne dépend pas de l'infra.
 */
export type InteretValeur = 'oui' | 'non' | null;

export interface InteretRepository {
  ensureTable(): Promise<void>;
  upsert(user_id: number, souvenir_nom: string, interet: InteretValeur): Promise<void>;
  findByUser(user_id: number): Promise<Map<string, InteretValeur>>;
}
