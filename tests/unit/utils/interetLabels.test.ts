import { getInteretLabel, getInteretOptions } from '@/utils/interetLabels';

describe('interetLabels', () => {
  describe('getInteretLabel', () => {
    it('retourne le libellé pour la clé "intéressé"', () => {
      expect(getInteretLabel('intéressé')).toBe('Intéressé');
    });

    it('retourne le libellé pour la clé "pas intéressé"', () => {
      expect(getInteretLabel('pas intéressé')).toBe('Pas intéressé');
    });

    it('retourne le libellé pour la clé "pas prononcé"', () => {
      expect(getInteretLabel('pas prononcé')).toBe('Pas prononcé');
    });
  });

  describe('getInteretOptions', () => {
    it('retourne les 3 options (clé, libellé) dans un ordre cohérent', () => {
      const options = getInteretOptions();
      expect(options).toHaveLength(3);
      expect(options.map((o) => o.cle)).toEqual([
        'intéressé',
        'pas intéressé',
        'pas prononcé',
      ]);
      expect(options[0].libelle).toBe('Intéressé');
      expect(options[1].libelle).toBe('Pas intéressé');
      expect(options[2].libelle).toBe('Pas prononcé');
    });
  });
});
