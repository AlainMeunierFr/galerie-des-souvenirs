import { LibsqlUserRepository } from '@/utils/adapters/LibsqlUserRepository';
import { db } from '@/lib/db';

describe('LibsqlUserRepository', () => {
  const repo = new LibsqlUserRepository(db);

  beforeAll(async () => {
    await repo.ensureTable();
  });

  beforeEach(async () => {
    await db.execute('DELETE FROM user');
  });

  it('crée un utilisateur et le retourne', async () => {
    const user = await repo.create('clerk_123', 'test@example.com');
    expect(user.clerk_id).toBe('clerk_123');
    expect(user.email).toBe('test@example.com');
    expect(user.id).toBeDefined();
    expect(user.created_at).toBeDefined();
  });

  it('retourne un utilisateur par email', async () => {
    await repo.create('clerk_456', 'find@example.com');
    const user = await repo.findByEmail('find@example.com');
    expect(user).not.toBeNull();
    expect(user!.email).toBe('find@example.com');
  });

  it('retourne null si l\'email n\'existe pas', async () => {
    const user = await repo.findByEmail('inexistant@example.com');
    expect(user).toBeNull();
  });

  it('retourne un utilisateur par clerk_id', async () => {
    await repo.create('clerk_789', 'clerk@example.com');
    const user = await repo.findByClerkId('clerk_789');
    expect(user).not.toBeNull();
    expect(user!.clerk_id).toBe('clerk_789');
  });

  it('met à jour l\'email d\'un utilisateur', async () => {
    await repo.create('clerk_upd', 'avant@example.com');
    await repo.updateEmail('clerk_upd', 'apres@example.com');
    const user = await repo.findByEmail('apres@example.com');
    expect(user).not.toBeNull();
    expect(user!.email).toBe('apres@example.com');
  });
});
