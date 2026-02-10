import type { Client } from '@libsql/client';
import type { User } from '@/types/User';
import type { UserRepository } from '@/utils/domain/ports/UserRepository';

export class LibsqlUserRepository implements UserRepository {
  constructor(private db: Client) {}

  async create(clerk_id: string, email: string): Promise<User> {
    const result = await this.db.execute({
      sql: 'INSERT INTO user (clerk_id, email) VALUES (?, ?) RETURNING *',
      args: [clerk_id, email],
    });
    const row = result.rows[0] as unknown as { id: number; clerk_id: string; email: string; created_at: string };
    return {
      id: row.id,
      clerk_id: row.clerk_id,
      email: row.email,
      created_at: row.created_at,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.execute({
      sql: 'SELECT * FROM user WHERE email = ?',
      args: [email],
    });
    if (result.rows.length === 0) return null;
    const row = result.rows[0] as unknown as { id: number; clerk_id: string; email: string; created_at: string };
    return { id: row.id, clerk_id: row.clerk_id, email: row.email, created_at: row.created_at };
  }

  async findByClerkId(clerk_id: string): Promise<User | null> {
    const result = await this.db.execute({
      sql: 'SELECT * FROM user WHERE clerk_id = ?',
      args: [clerk_id],
    });
    if (result.rows.length === 0) return null;
    const row = result.rows[0] as unknown as { id: number; clerk_id: string; email: string; created_at: string };
    return { id: row.id, clerk_id: row.clerk_id, email: row.email, created_at: row.created_at };
  }

  async updateEmail(clerk_id: string, email: string): Promise<void> {
    await this.db.execute({
      sql: 'UPDATE user SET email = ? WHERE clerk_id = ?',
      args: [email, clerk_id],
    });
  }
}
