import {
  filterSouvenirsByEtiquettes,
  isEtiquetteAdminOnly,
} from '@/utils/filterSouvenirsByEtiquettes';

describe('isEtiquetteAdminOnly', () => {
  it('retourne true si le libellé commence par *', () => {
    expect(isEtiquetteAdminOnly('*Privé')).toBe(true);
    expect(isEtiquetteAdminOnly('*')).toBe(true);
  });
  it('retourne false sinon', () => {
    expect(isEtiquetteAdminOnly('Vacances')).toBe(false);
    expect(isEtiquetteAdminOnly('')).toBe(false);
  });
});

describe('filterSouvenirsByEtiquettes', () => {
  it('baby step 1: listes vides retourne tableau vide', () => {
    expect(filterSouvenirsByEtiquettes([], [])).toEqual([]);
  });

  it('baby step 2: "Sans étiquette" sélectionné, souvenir sans étiquette → inclus', () => {
    const s = { nom: 'IMG_001', etiquettes: [] };
    expect(filterSouvenirsByEtiquettes([s], ['Sans étiquette'])).toEqual([s]);
  });

  it('baby step 3: "Sans étiquette" sélectionné, souvenir ayant une étiquette → exclu', () => {
    const s = { nom: 'IMG_001', etiquettes: ['Vacances'] };
    expect(filterSouvenirsByEtiquettes([s], ['Sans étiquette'])).toEqual([]);
  });

  it('baby step 4: "Vacances" sélectionné, souvenir ayant Vacances → inclus', () => {
    const s = { nom: 'IMG_001', etiquettes: ['Vacances'] };
    expect(filterSouvenirsByEtiquettes([s], ['Vacances'])).toEqual([s]);
  });

  it('baby step 5: "Vacances" seul, s1=Vacances et s2=Famille → uniquement s1 (OU logique)', () => {
    const s1 = { nom: 'IMG_001', etiquettes: ['Vacances'] };
    const s2 = { nom: 'IMG_002', etiquettes: ['Famille'] };
    expect(filterSouvenirsByEtiquettes([s1, s2], ['Vacances'])).toEqual([s1]);
  });

  it('baby step 6: "Vacances" et "Sans étiquette" cochés, s1=Vacances et s2=sans → s1 et s2', () => {
    const s1 = { nom: 'IMG_001', etiquettes: ['Vacances'] };
    const s2 = { nom: 'IMG_002', etiquettes: [] };
    expect(
      filterSouvenirsByEtiquettes([s1, s2], ['Vacances', 'Sans étiquette'])
    ).toEqual([s1, s2]);
  });

  it('aucune option cochée → tableau vide', () => {
    const s = { nom: 'IMG_001', etiquettes: ['Vacances'] };
    expect(filterSouvenirsByEtiquettes([s], [])).toEqual([]);
  });

  it('baby step 7: toutes options cochées (toutes étiquettes + Sans étiquette) → pas de filtrage', () => {
    const s1 = { nom: 'IMG_001', etiquettes: ['Vacances'] };
    const s2 = { nom: 'IMG_002', etiquettes: [] };
    const s3 = { nom: 'IMG_003', etiquettes: ['Famille'] };
    const todos = [s1, s2, s3];
    expect(
      filterSouvenirsByEtiquettes(todos, [
        'Vacances',
        'Famille',
        'Sans étiquette',
      ])
    ).toEqual(todos);
  });
});
