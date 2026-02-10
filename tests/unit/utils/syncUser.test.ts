import { syncUser } from '@/utils/use-cases/syncUser';
import type { UserRepository } from '@/utils/domain/ports/UserRepository';

describe('syncUser', () => {
  it('crée un utilisateur si aucun avec ce clerk_id', async () => {
    const repo: UserRepository = {
      ensureTable: jest.fn(),
      findByClerkId: () => Promise.resolve(null),
      findByEmail: () => Promise.resolve(null),
      create: jest.fn().mockResolvedValue({
        id: 1,
        clerk_id: 'clerk_1',
        email: 'new@test.fr',
        created_at: '2024-01-01',
      }),
      updateEmail: jest.fn(),
      updateClerkId: jest.fn(),
    };
    await syncUser(repo, 'clerk_1', 'new@test.fr');
    expect(repo.create).toHaveBeenCalledWith('clerk_1', 'new@test.fr');
    expect(repo.updateEmail).not.toHaveBeenCalled();
  });

  it('met à jour l\'email si l\'utilisateur existe et l\'email a changé', async () => {
    const repo: UserRepository = {
      ensureTable: jest.fn(),
      findByClerkId: () =>
        Promise.resolve({
          id: 1,
          clerk_id: 'clerk_1',
          email: 'old@test.fr',
          created_at: '2024-01-01',
        }),
      findByEmail: () => Promise.resolve(null),
      create: jest.fn(),
      updateEmail: jest.fn(),
      updateClerkId: jest.fn(),
    };
    await syncUser(repo, 'clerk_1', 'new@test.fr');
    expect(repo.updateEmail).toHaveBeenCalledWith('clerk_1', 'new@test.fr');
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('met à jour clerk_id si l\'email existe déjà avec un autre clerk_id', async () => {
    const repo: UserRepository = {
      ensureTable: jest.fn(),
      findByClerkId: () => Promise.resolve(null),
      findByEmail: () =>
        Promise.resolve({
          id: 1,
          clerk_id: 'clerk_old',
          email: 'same@test.fr',
          created_at: '2024-01-01',
        }),
      create: jest.fn(),
      updateEmail: jest.fn(),
      updateClerkId: jest.fn(),
    };
    await syncUser(repo, 'clerk_new', 'same@test.fr');
    expect(repo.updateClerkId).toHaveBeenCalledWith('clerk_old', 'clerk_new');
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('ne fait rien si l\'utilisateur existe avec le même email', async () => {
    const repo: UserRepository = {
      ensureTable: jest.fn(),
      findByClerkId: () =>
        Promise.resolve({
          id: 1,
          clerk_id: 'clerk_1',
          email: 'same@test.fr',
          created_at: '2024-01-01',
        }),
      findByEmail: () => Promise.resolve(null),
      create: jest.fn(),
      updateEmail: jest.fn(),
      updateClerkId: jest.fn(),
    };
    await syncUser(repo, 'clerk_1', 'same@test.fr');
    expect(repo.updateEmail).not.toHaveBeenCalled();
    expect(repo.create).not.toHaveBeenCalled();
  });
});
