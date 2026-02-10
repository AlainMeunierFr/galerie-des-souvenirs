import type { UserRepository } from '@/utils/domain/ports/UserRepository';

export async function syncUser(
  repo: UserRepository,
  clerk_id: string,
  email: string
): Promise<void> {
  const byClerk = await repo.findByClerkId(clerk_id);
  if (byClerk) {
    if (byClerk.email !== email) {
      await repo.updateEmail(clerk_id, email);
    }
    return;
  }
  const byEmail = await repo.findByEmail(email);
  if (byEmail) {
    await repo.updateClerkId(byEmail.clerk_id, clerk_id);
    return;
  }
  await repo.create(clerk_id, email);
}
