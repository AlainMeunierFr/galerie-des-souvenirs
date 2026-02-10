import type { UserRepository } from '@/utils/domain/ports/UserRepository';

export async function syncUser(
  repo: UserRepository,
  clerk_id: string,
  email: string
): Promise<void> {
  const existing = await repo.findByClerkId(clerk_id);
  if (existing) {
    if (existing.email !== email) {
      await repo.updateEmail(clerk_id, email);
    }
  } else {
    await repo.create(clerk_id, email);
  }
}
