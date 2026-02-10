import type { SouvenirRepository } from '@/utils/domain/ports/SouvenirRepository';

export async function getSouvenirBuffer(
  repo: SouvenirRepository,
  filename: string
): Promise<Buffer> {
  if (!filename || filename.includes('..')) {
    throw new Error('Invalid filename');
  }
  return repo.getBuffer(filename);
}
