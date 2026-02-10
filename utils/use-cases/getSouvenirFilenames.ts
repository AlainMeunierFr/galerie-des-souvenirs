import type { SouvenirRepository } from '@/utils/domain/ports/SouvenirRepository';

export async function getSouvenirFilenames(
  repo: SouvenirRepository
): Promise<string[]> {
  try {
    const filenames = await repo.listFilenames();
    return [...filenames].sort();
  } catch {
    return [];
  }
}
