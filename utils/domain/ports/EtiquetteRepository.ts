/**
 * Port : étiquettes sur les souvenirs (admin).
 * Architecture hexagonale : le domaine ne dépend pas de l'infra.
 */
export interface EtiquetteRepository {
  ensureTables(): Promise<void>;
  create(libelle: string): Promise<{ id: number }>;
  update(id: number, libelle: string): Promise<void>;
  delete(id: number): Promise<void>;
  listAll(): Promise<{ id: number; libelle: string }[]>;
  assign(etiquetteId: number, souvenirNoms: string[]): Promise<void>;
  unassign(etiquetteId: number, souvenirNoms: string[]): Promise<void>;
  getSouvenirNomsWithEtiquette(
    etiquetteId: number,
    souvenirNoms: string[]
  ): Promise<string[]>;
}
