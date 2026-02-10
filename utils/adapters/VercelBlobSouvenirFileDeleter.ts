import { del } from '@vercel/blob';
import type { SouvenirFileDeleter } from '@/utils/domain/ports/SouvenirFileDeleter';

export class VercelBlobSouvenirFileDeleter implements SouvenirFileDeleter {
  async deleteFilesForNom(nom: string): Promise<void> {
    const paths = [
      `miniature/${nom}.webp`,
      `webp/${nom}.webp`,
    ];
    await del(paths);
  }
}
