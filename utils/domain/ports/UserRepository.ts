import type { User } from '@/types/User';

export interface UserRepository {
  create(clerk_id: string, email: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findByClerkId(clerk_id: string): Promise<User | null>;
  updateEmail(clerk_id: string, email: string): Promise<void>;
}
