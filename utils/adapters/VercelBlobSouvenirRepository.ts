import { list } from '@vercel/blob';
import type { SouvenirRepository } from '@/utils/domain/ports/SouvenirRepository';

const PREFIX = 'miniature/';

export class VercelBlobSouvenirRepository implements SouvenirRepository {
  async listFilenames(): Promise<string[]> {
    const { blobs } = await list({ prefix: PREFIX });
    const names = blobs
      .map((b) => b.pathname.replace(PREFIX, ''))
      .filter((f) => /\.(jpe?g|webp)$/i.test(f));
    return [...new Set(names)].sort();
  }

  async getBuffer(filename: string): Promise<Buffer> {
    if (filename.includes('..') || !/\.(jpe?g|webp)$/i.test(filename)) {
      throw new Error('Invalid filename');
    }
    const pathname = `${PREFIX}${filename}`;
    const { blobs } = await list({ prefix: pathname });
    const blob = blobs.find((b) => b.pathname === pathname);
    if (!blob) throw new Error('Not found');
    const res = await fetch(blob.url);
    if (!res.ok) throw new Error('Not found');
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  }

  /** Retourne l’URL publique du blob pour redirection (évite de streamer via l’API). */
  async getUrl(filename: string): Promise<string | null> {
    if (filename.includes('..') || !/\.(jpe?g|webp)$/i.test(filename)) return null;
    const pathname = `${PREFIX}${filename}`;
    const { blobs } = await list({ prefix: pathname });
    const blob = blobs.find((b) => b.pathname === pathname);
    return blob?.url ?? null;
  }
}
