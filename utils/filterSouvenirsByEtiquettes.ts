/** Option spéciale du filtre pour inclure les souvenirs sans étiquette (US-5.6). */
export const SANS_ETIQUETTE = 'Sans étiquette';

/** Étiquettes dont le libellé commence par * sont réservées à l'admin (masquées pour l'utilisateur). */
export function isEtiquetteAdminOnly(libelle: string): boolean {
  return libelle.startsWith('*');
}

/**
 * Filtre les souvenirs par étiquettes sélectionnées (logique OU).
 * US-5.6 : Filtre par étiquette pour voter par thème.
 */
export function filterSouvenirsByEtiquettes(
  souvenirs: { nom: string; etiquettes: string[] }[],
  selectedEtiquettes: string[]
): { nom: string; etiquettes: string[] }[] {
  if (souvenirs.length === 0) return [];
  return souvenirs.filter((s) => {
    const hasSansEtiquette = selectedEtiquettes.includes(SANS_ETIQUETTE);
    const hasEtiquette = s.etiquettes.length > 0;
    if (hasSansEtiquette && !hasEtiquette) return true;
    return (
      hasEtiquette && s.etiquettes.some((e) => selectedEtiquettes.includes(e))
    );
  });
}
