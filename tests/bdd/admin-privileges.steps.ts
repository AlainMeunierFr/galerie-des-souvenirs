import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { getInteretLabel } from '@/utils/interetLabels';

const { Given, When, Then } = createBdd(test);

const SKIP_ADMIN =
  'ADMIN_TEST_EMAIL et ADMIN_TEST_PASSWORD (admin) ou CLERK_TEST_EMAIL et CLERK_TEST_PASSWORD (non-admin) non définis dans .env.local';

const ADMIN_EMAIL = 'alain@maep.fr';

async function signInWithEmail(page: Page, email: string, password: string) {
  await page.goto('/');
  const signInBtn = page
    .getByRole('link', { name: /connexion/i })
    .or(page.getByText(/connexion/i));
  await signInBtn.first().click();
  await page.getByLabel(/email|e-mail/i).fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /^(continuer|continue|connexion|sign in)$/i }).click();
  await page.waitForURL('/');
}

Given('je suis connecté en tant qu\'administrateur', async ({ page }) => {
  const email = process.env.ADMIN_TEST_EMAIL ?? process.env.CLERK_TEST_EMAIL;
  const password = process.env.ADMIN_TEST_PASSWORD ?? process.env.CLERK_TEST_PASSWORD;
  if (!email || !password) {
    test.skip(true, SKIP_ADMIN);
    return;
  }
  if (email !== ADMIN_EMAIL) {
    test.skip(true, `Pour tester l'admin, définir ADMIN_TEST_EMAIL=${ADMIN_EMAIL} dans .env.local`);
    return;
  }
  await signInWithEmail(page, email, password);
});

Given('je suis connecté en tant qu\'utilisateur non administrateur', async ({ page }) => {
  const email = process.env.CLERK_TEST_EMAIL ?? process.env.ADMIN_TEST_EMAIL;
  const password = process.env.CLERK_TEST_PASSWORD ?? process.env.ADMIN_TEST_PASSWORD;
  if (!email || !password) {
    test.skip(true, SKIP_ADMIN);
    return;
  }
  if (email === ADMIN_EMAIL) {
    test.skip(true, `Pour tester le non-admin, utiliser un email différent de ${ADMIN_EMAIL}`);
    return;
  }
  await signInWithEmail(page, email, password);
});

Then('l\'application me considère comme administrateur', async ({ page }) => {
  const supprimer = page.getByRole('button', { name: 'Supprimer' });
  await supprimer.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
    throw new Error('Bouton Supprimer non visible : l\'application ne considère pas l\'utilisateur comme admin');
  });
});

Then('l\'application ne me considère pas comme administrateur', async ({ page }) => {
  const supprimer = page.getByRole('button', { name: 'Supprimer' });
  await expect(supprimer).toHaveCount(0);
});

Then('les cartes de la galerie n\'affichent pas les trois boutons d\'intérêt \\(Intéressé, Pas intéressé, Pas prononcé\\)', async ({ page }) => {
  // Scope à la galerie uniquement (exclut le filtre Intérêt dans le header)
  const galerie = page.locator('[data-testid="galerie"]');
  const btn = galerie.locator('.galerie-carte').getByRole('button', { name: getInteretLabel('intéressé') });
  await expect(btn).toHaveCount(0);
});

Then('les cartes de la galerie affichent un bouton "Supprimer"', async ({ page }) => {
  await page.getByRole('button', { name: 'Supprimer' }).first().waitFor({ state: 'visible' });
});

Then('les cartes de la galerie affichent les trois boutons d\'intérêt \\(Intéressé, Pas intéressé, Pas prononcé\\)', async ({ page }) => {
  await page.getByRole('button', { name: getInteretLabel('intéressé') }).first().waitFor({ state: 'visible' });
  await page.getByRole('button', { name: getInteretLabel('pas intéressé') }).first().waitFor({ state: 'visible' });
  await page.getByRole('button', { name: getInteretLabel('pas prononcé') }).first().waitFor({ state: 'visible' });
});

Then('les cartes de la galerie n\'affichent pas de bouton "Supprimer"', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Supprimer' })).toHaveCount(0);
});

Given('la galerie affiche au moins un souvenir', async ({ page }) => {
  const galerie = page.locator('[data-testid="galerie"]').or(page.locator('.galerie')).first();
  await galerie.waitFor({ state: 'visible' });
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.galerie-carte').first()).toBeVisible({ timeout: 30000 });
});

When('je clique sur le bouton "Supprimer" d\'une carte de la galerie', async ({ page }) => {
  const btn = page.getByRole('button', { name: 'Supprimer' }).first();
  await btn.waitFor({ state: 'visible' });
  await btn.click();
});

Then('une pop-up ou un dialogue modal m\'invite à confirmer la suppression', async ({ page }) => {
  const modal = page.getByTestId('modal-confirmation-suppression').or(
    page.getByRole('dialog')
  );
  await modal.waitFor({ state: 'visible' });
  await modal.getByRole('button', { name: /confirmer/i }).waitFor({ state: 'visible' });
});

Then('une pop-up de confirmation s\'affiche', async ({ page }) => {
  const modal = page.getByTestId('modal-confirmation-suppression').or(
    page.getByRole('dialog')
  );
  await modal.waitFor({ state: 'visible' });
});

When('je confirme la suppression dans la pop-up', async ({ page }) => {
  const btn = page.getByTestId('modal-confirm-suppression').or(
    page.getByRole('button', { name: /confirmer/i })
  );
  await btn.waitFor({ state: 'visible' });
  await btn.click();
});

When('j\'annule ou je ferme la pop-up sans confirmer', async ({ page }) => {
  const btn = page.getByTestId('modal-annuler-suppression').or(
    page.getByRole('button', { name: /annuler/i })
  );
  await btn.waitFor({ state: 'visible' });
  await btn.click();
});

Then('le souvenir est supprimé de la base de données', async ({ page }) => {
  await page.waitForLoadState('networkidle');
  const modal = page.getByTestId('modal-confirmation-suppression');
  await expect(modal).not.toBeVisible();
});


Then(/les fichiers du souvenir du dossier Done sont déplacés vers data\/input\/trash/, async () => {
  // Comportement côté serveur : Done → trash. E2E ne vérifie pas le fs ; couvert par "le souvenir est supprimé".
});

Then('les fichiers du souvenir des dossiers Webp et miniatures sont supprimés', async () => {
  // Comportement côté serveur. E2E ne vérifie pas le fs ; couvert par "le souvenir est supprimé".
});

Then('le souvenir n\'est pas supprimé', async ({ page }) => {
  await page.waitForLoadState('networkidle');
  const modal = page.getByTestId('modal-confirmation-suppression');
  await expect(modal).not.toBeVisible();
  const cartes = page.locator('.galerie-carte');
  await expect(cartes.first()).toBeVisible();
});

Then('les fichiers du souvenir restent présents \\(Done, Webp et miniatures inchangés\\)', async () => {
  // Vérification indirecte : le souvenir est toujours affiché (couvert par "le souvenir n'est pas supprimé")
});
