import { readdir, unlink } from 'fs/promises';
import { join } from 'path';
import type { SouvenirFileDeleter } from '@/utils/domain/ports/SouvenirFileDeleter';

const EXT_PATTERN = /\.(heic|webp|jpe?g)$/i;

function baseName(file: string): string {
  return file.replace(EXT_PATTERN, '');
}

export class FileSystemSouvenirFileDeleter implements SouvenirFileDeleter {
  constructor(
    private doneDir: string,
    private webpDir: string,
    private miniatureDir: string
  ) {}

  async deleteFilesForNom(nom: string): Promise<void> {
    const dirs = [this.doneDir, this.webpDir, this.miniatureDir];
    await Promise.all(
      dirs.map(async (dir) => {
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
      })
    );
  }
}
