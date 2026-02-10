import type { User } from '@/types/User';

/**
 * Port : persistance des utilisateurs (architecture hexagonale).
 */
export interface UserRepository {
  ensureTable(): Promise<void>;
  create(clerk_id: string, email: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findByClerkId(clerk_id: string): Promise<User | null>;
  updateEmail(clerk_id: string, email: string): Promise<void>;
}
