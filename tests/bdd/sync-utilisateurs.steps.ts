import { createBdd, test } from 'playwright-bdd';
import { db } from '@/lib/db';
import {
  userTableExists,
  userTableHasColumns,
  defaultUserRepository as userRepo,
} from '@/utils';

const { Given, When, Then } = createBdd(test);

const SKIP_CLERK =
  'Inscription et modification Clerk nécessitent CLERK_TEST_EMAIL, CLERK_TEST_PASSWORD et implémentation des webhooks (TDD-front-end)';

Given('la base de données est initialisée', async () => {
  await userRepo.ensureTable();
});

Then('la table user existe', async () => {
  const exists = await userTableExists(db);
  if (!exists) throw new Error('La table user n\'existe pas');
});

Then('la table user contient les colonnes clerk_id, email, created_at', async () => {
  const hasColumns = await userTableHasColumns(db, [
    'clerk_id',
    'email',
    'created_at',
  ]);
  if (!hasColumns) throw new Error('La table user ne contient pas les colonnes attendues');
});

Then('un utilisateur avec l\'email {string} existe dans la base locale', async ({}, email: string) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new Error(`Aucun utilisateur avec l'email ${email} en base`);
});

Given('je suis connecté avec l\'email {string}', async ({ page }, _email: string) => {
  test.skip(true, SKIP_CLERK);
});

When('je m\'inscris via Clerk avec l\'email {string}', async ({ page }, _email: string) => {
  test.skip(true, SKIP_CLERK);
});

When('je modifie mon email en {string} dans mon profil Clerk', async ({ page }, _newEmail: string) => {
  test.skip(true, SKIP_CLERK);
});

Then('la base locale contient un utilisateur avec l\'email {string}', async ({}, email: string) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new Error(`Aucun utilisateur avec l'email ${email} en base`);
});
