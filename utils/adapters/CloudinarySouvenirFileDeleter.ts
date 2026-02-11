import { v2 as cloudinary } from 'cloudinary';
import type { SouvenirFileDeleter } from '@/utils/domain/ports/SouvenirFileDeleter';

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

export class CloudinarySouvenirFileDeleter implements SouvenirFileDeleter {
  async deleteFilesForNom(nom: string): Promise<void> {
    initCloudinary();
    const ids = [`miniature/${nom}`, `webp/${nom}`];
    for (const publicId of ids) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch {
        // Ignore si l'asset n'existe pas
      }
    }
  }
}
