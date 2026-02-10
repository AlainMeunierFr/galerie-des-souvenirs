import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import type { SouvenirRepository } from '@/utils/domain/ports/SouvenirRepository';

const SOUVENIRS_DIR = join(process.cwd(), 'data', 'souvenirs', 'miniature');

export class FileSystemSouvenirRepository implements SouvenirRepository {
  async listFilenames(): Promise<string[]> {
    const files = await readdir(SOUVENIRS_DIR);
    return files
      .filter((f) => /\.(jpe?g|webp)$/i.test(f))
      .sort();
  }

  async getBuffer(filename: string): Promise<Buffer> {
    if (filename.includes('..')) {
      throw new Error('Invalid filename');
    }
    return readFile(join(SOUVENIRS_DIR, filename));
  }
}
