import { getSouvenirBuffer } from '@/utils/use-cases/getSouvenirBuffer';
import type { SouvenirRepository } from '@/utils/domain/ports/SouvenirRepository';

describe('getSouvenirBuffer', () => {
  it('retourne le buffer pour un filename valide', async () => {
    const buffer = Buffer.from('fake-jpeg');
    const repo: SouvenirRepository = {
      listFilenames: () => Promise.resolve([]),
      getBuffer: () => Promise.resolve(buffer),
    };
    const result = await getSouvenirBuffer(repo, 'souvenir.jpeg');
    expect(result).toBe(buffer);
  });

  it('rejette si le filename contient ..', async () => {
    const repo: SouvenirRepository = {
      listFilenames: () => Promise.resolve([]),
      getBuffer: () => Promise.resolve(Buffer.from('')),
    };
    await expect(getSouvenirBuffer(repo, '../etc/passwd')).rejects.toThrow(
      'Invalid filename'
    );
  });

  it('rejette si le filename est vide', async () => {
    const repo: SouvenirRepository = {
      listFilenames: () => Promise.resolve([]),
      getBuffer: () => Promise.resolve(Buffer.from('')),
    };
    await expect(getSouvenirBuffer(repo, '')).rejects.toThrow('Invalid filename');
  });

  it('propage l\'erreur du repo si le fichier n\'existe pas', async () => {
    const repo: SouvenirRepository = {
      listFilenames: () => Promise.resolve([]),
      getBuffer: () => Promise.reject(new Error('ENOENT')),
    };
    await expect(getSouvenirBuffer(repo, 'inexistant.jpeg')).rejects.toThrow(
      'ENOENT'
    );
  });
});
