import { readdir, unlink, rename, mkdir } from 'fs/promises';
import { join } from 'path';
import type { SouvenirFileDeleter } from '@/utils/domain/ports/SouvenirFileDeleter';

const EXT_PATTERN = /\.(heic|webp|jpe?g)$/i;

function baseName(file: string): string {
  return file.replace(EXT_PATTERN, '');
}

/**
 * Supprime les fichiers d'un souvenir.
 * - data/input/done/ : déplacés vers data/input/trash/ (pas supprimés).
 * - data/souvenirs/webp/ et miniature/ : supprimés (unlink).
 */
export class FileSystemSouvenirFileDeleter implements SouvenirFileDeleter {
  constructor(
    private doneDir: string,
    private doneTrashDir: string,
    private webpDir: string,
    private miniatureDir: string
  ) {}

  async deleteFilesForNom(nom: string): Promise<void> {
    await this.moveDoneToTrash(nom);
    await this.unlinkInDir(this.webpDir, nom);
    await this.unlinkInDir(this.miniatureDir, nom);
  }

  private async moveDoneToTrash(nom: string): Promise<void> {
    let files: string[];
    try {
      files = await readdir(this.doneDir);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return;
      throw err;
    }
    const toMove = files.filter(
      (f) => EXT_PATTERN.test(f) && baseName(f) === nom
    );
    if (toMove.length === 0) return;
    await mkdir(this.doneTrashDir, { recursive: true });
    await Promise.all(
      toMove.map((f) =>
        rename(join(this.doneDir, f), join(this.doneTrashDir, f))
      )
    );
  }

  private async unlinkInDir(dir: string, nom: string): Promise<void> {
    let files: string[];
    try {
      files = await readdir(dir);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return;
      throw err;
    }
    const toDelete = files.filter(
      (f) => EXT_PATTERN.test(f) && baseName(f) === nom
    );
    await Promise.all(toDelete.map((f) => unlink(join(dir, f))));
  }
}
