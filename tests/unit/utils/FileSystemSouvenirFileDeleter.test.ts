import { mkdtemp, writeFile, readdir, rm, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { FileSystemSouvenirFileDeleter } from '@/utils/adapters/FileSystemSouvenirFileDeleter';

describe('FileSystemSouvenirFileDeleter', () => {
  it('déplace les fichiers done vers trash et supprime webp/miniature', async () => {
    const base = await mkdtemp(join(tmpdir(), 'souvenir-deleter-'));
    const doneDir = join(base, 'done');
    const doneTrashDir = join(base, 'trash');
    const webpDir = join(base, 'webp');
    const miniatureDir = join(base, 'miniature');
    await Promise.all([
      mkdir(doneDir, { recursive: true }),
      mkdir(webpDir, { recursive: true }),
      mkdir(miniatureDir, { recursive: true }),
    ]);
    await writeFile(join(doneDir, 'IMG_TEST.HEIC'), 'done');
    await writeFile(join(webpDir, 'IMG_TEST.webp'), 'webp');
    await writeFile(join(miniatureDir, 'IMG_TEST.webp'), 'miniature');

    const deleter = new FileSystemSouvenirFileDeleter(
      doneDir,
      doneTrashDir,
      webpDir,
      miniatureDir
    );
    await deleter.deleteFilesForNom('IMG_TEST');

    const [doneFiles, trashFiles, webpFiles, miniatureFiles] = await Promise.all([
      readdir(doneDir),
      readdir(doneTrashDir),
      readdir(webpDir),
      readdir(miniatureDir),
    ]);
    expect(doneFiles).toHaveLength(0);
    expect(trashFiles).toEqual(['IMG_TEST.HEIC']);
    expect(webpFiles).toHaveLength(0);
    expect(miniatureFiles).toHaveLength(0);

    await rm(base, { recursive: true, force: true });
  });

  it('ne lève pas d\'erreur si un dossier n\'existe pas (ENOENT)', async () => {
    const base = await mkdtemp(join(tmpdir(), 'souvenir-deleter-'));
    const doneDir = join(base, 'inexistant');
    const doneTrashDir = join(base, 'trash');
    const webpDir = join(base, 'webp');
    const miniatureDir = join(base, 'mini');
    await Promise.all([mkdir(webpDir, { recursive: true }), mkdir(miniatureDir, { recursive: true })]);
    await writeFile(join(webpDir, 'IMG_X.webp'), 'x');
    const deleter = new FileSystemSouvenirFileDeleter(
      doneDir,
      doneTrashDir,
      webpDir,
      miniatureDir
    );
    await expect(deleter.deleteFilesForNom('IMG_X')).resolves.not.toThrow();
    const files = await readdir(webpDir);
    expect(files).toHaveLength(0);
    await rm(base, { recursive: true, force: true });
  });
});
