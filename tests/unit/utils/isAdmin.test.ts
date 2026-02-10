import { isAdminEmail } from '@/utils/isAdmin';

describe('isAdminEmail', () => {
  it('retourne true pour alain@maep.fr', () => {
    expect(isAdminEmail('alain@maep.fr')).toBe(true);
  });

  it('retourne false pour un autre email', () => {
    expect(isAdminEmail('autre@test.fr')).toBe(false);
  });

  it('retourne false pour une chaîne vide', () => {
    expect(isAdminEmail('')).toBe(false);
  });
});
