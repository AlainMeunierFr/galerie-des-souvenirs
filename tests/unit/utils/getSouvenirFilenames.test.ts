import { getSouvenirFilenames } from '@/utils/use-cases/getSouvenirFilenames';
import type { SouvenirRepository } from '@/utils/domain/ports/SouvenirRepository';

describe('getSouvenirFilenames', () => {
  it('retourne la liste triée des noms de souvenirs', async () => {
    const repo: SouvenirRepository = {
      listFilenames: () => Promise.resolve(['b.jpeg', 'a.jpeg']),
      getBuffer: () => Promise.resolve(Buffer.from('')),
    };
    const result = await getSouvenirFilenames(repo);
    expect(result).toEqual(['a.jpeg', 'b.jpeg']);
  });

  it('retourne un tableau vide si le repo échoue', async () => {
    const repo: SouvenirRepository = {
      listFilenames: () => Promise.reject(new Error('Erreur')),
      getBuffer: () => Promise.resolve(Buffer.from('')),
    };
    const result = await getSouvenirFilenames(repo);
    expect(result).toEqual([]);
  });
});
