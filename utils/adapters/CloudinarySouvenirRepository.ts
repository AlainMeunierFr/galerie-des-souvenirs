import { v2 as cloudinary } from 'cloudinary';
import type { SouvenirRepository } from '@/utils/domain/ports/SouvenirRepository';

const FOLDER = 'miniature';

function initCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET sont requis.'
    );
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
}

export class CloudinarySouvenirRepository implements SouvenirRepository {
  async listFilenames(): Promise<string[]> {
    initCloudinary();
    const names = new Set<string>();
    let nextCursor: string | undefined;

    do {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: `${FOLDER}/`,
        max_results: 500,
        next_cursor: nextCursor,
      });
      for (const r of result.resources ?? []) {
        const match = (r.public_id as string).match(new RegExp(`^${FOLDER}/(.+)$`));
        if (match) names.add(`${match[1]}.webp`);
      }
      nextCursor = result.next_cursor;
    } while (nextCursor);

    return [...names].sort();
  }

  async getBuffer(filename: string): Promise<Buffer> {
    if (filename.includes('..') || !/\.(jpe?g|webp)$/i.test(filename)) {
      throw new Error('Invalid filename');
    }
    initCloudinary();
    const baseName = filename.replace(/\.(webp|jpe?g)$/i, '');
    const publicId = `${FOLDER}/${baseName}`;
    const url = cloudinary.url(publicId, { format: 'webp', secure: true });
    const res = await fetch(url);
    if (!res.ok) throw new Error('Not found');
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  }

  /** Retourne l'URL Cloudinary pour redirection (évite de streamer via l'API). */
  async getUrl(filename: string): Promise<string | null> {
    if (filename.includes('..') || !/\.(jpe?g|webp)$/i.test(filename)) return null;
    const baseName = filename.replace(/\.(webp|jpe?g)$/i, '');
    return cloudinary.url(`${FOLDER}/${baseName}`, { format: 'webp', secure: true });
  }
}
