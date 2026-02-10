/**
 * Source unique des libellés d'intérêt (US-5.2).
 * Clés de concept : intéressé, pas intéressé, pas prononcé.
 * Utilisée par l'UI (filtre + boutons) et les step definitions BDD.
 */

export type InteretCle = 'intéressé' | 'pas intéressé' | 'pas prononcé';

const LABELS: Record<InteretCle, string> = {
  'intéressé': 'Intéressé',
  'pas intéressé': 'Pas intéressé',
  'pas prononcé': 'Pas prononcé',
};

export function getInteretLabel(cle: InteretCle): string {
  return LABELS[cle];
}

export type InteretOption = { cle: InteretCle; libelle: string };

const ORDRE: InteretCle[] = ['intéressé', 'pas intéressé', 'pas prononcé'];

export function getInteretOptions(): InteretOption[] {
  return ORDRE.map((cle) => ({ cle, libelle: LABELS[cle] }));
}
