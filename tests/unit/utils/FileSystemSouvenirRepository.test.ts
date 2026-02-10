import { FileSystemSouvenirRepository } from '@/utils/adapters/FileSystemSouvenirRepository';

describe('FileSystemSouvenirRepository', () => {
  const repo = new FileSystemSouvenirRepository();

  it('liste les noms de fichiers JPEG du répertoire data/souvenirs', async () => {
    const filenames = await repo.listFilenames();
    expect(Array.isArray(filenames)).toBe(true);
    expect(filenames.every((f) => typeof f === 'string')).toBe(true);
    expect(filenames.every((f) => /\.(jpe?g|webp)$/i.test(f))).toBe(true);
    expect(filenames).toEqual([...filenames].sort());
  });

  it('retourne un buffer pour un fichier existant', async () => {
    const filenames = await repo.listFilenames();
    if (filenames.length === 0) return;
    const buffer = await repo.getBuffer(filenames[0]);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('rejette si le filename contient ..', async () => {
    await expect(repo.getBuffer('../etc/passwd')).rejects.toThrow();
  });

  it('rejette si le fichier n\'existe pas', async () => {
    await expect(repo.getBuffer('inexistant.jpeg')).rejects.toThrow();
  });
});
