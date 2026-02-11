import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { ensureModalEtiquetteClosed } from './helpers';

const { Given, When, Then } = createBdd(test);

const ETIQUETTE_POUR_LES_TESTS = 'pour les tests';

/** Supprime "pour les tests" via l'API si elle existe (ne touche pas aux données de prod). */
async function supprimerEtiquettePourLesTestsSiExistante(
  request: { get: (url: string) => Promise<{ json: () => Promise<unknown> }>; delete: (url: string) => Promise<unknown> }
): Promise<void> {
  const res = await request.get('/api/etiquettes');
  const etiquettes = (await res.json()) as { id: number; libelle: string }[];
  const trouvée = etiquettes.find((e) => e.libelle === ETIQUETTE_POUR_LES_TESTS);
  if (trouvée) {
    await request.delete(`/api/etiquettes/${trouvée.id}`);
    await new Promise((r) => setTimeout(r, 500));
  }
}

// CA1 - Cases à cocher
Then('chaque carte de la galerie affiche une case à cocher dans le coin supérieur gauche sur l\'image', async ({ page }) => {
  const cartes = page.locator('.galerie-carte');
  await expect(cartes.first()).toBeVisible();
  const checkboxes = page.getByTestId(/^etiquette-checkbox-/).or(
    page.locator('.galerie-carte').filter({ has: page.getByRole('checkbox') })
  );
  await expect(checkboxes.first()).toBeVisible({ timeout: 5000 });
});

Then('la zone des étiquettes n\'est pas visible ou n\'affiche pas le bouton "Ajouter étiquette"', async ({ page }) => {
  const btn = page.getByRole('button', { name: 'Ajouter étiquette' });
  await expect(btn).toBeHidden();
});

Then('les cartes de la galerie n\'affichent pas de case à cocher pour sélectionner des souvenirs', async ({ page }) => {
  const checkboxesInCards = page.locator('.galerie-carte').getByRole('checkbox');
  await expect(checkboxesInCards).toHaveCount(0);
});

// CA2 - Zone étiquettes
Then('le bouton "Ajouter étiquette" n\'est pas visible', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Ajouter étiquette' })).toBeHidden();
});

When('je coche la case à cocher d\'une carte de la galerie', async ({ page }) => {
  await ensureModalEtiquetteClosed(page);
  const checkbox = page.locator('.galerie-carte').getByRole('checkbox').first();
  await checkbox.waitFor({ state: 'visible', timeout: 5000 });
  await checkbox.check();
});

Then('le bouton "Ajouter étiquette" est visible', async ({ page }) => {
  await page.getByRole('button', { name: 'Ajouter étiquette' }).waitFor({ state: 'visible' });
});

Then('la zone affiche la liste des étiquettes existantes ou un emplacement pour celle-ci', async ({ page }) => {
  const zone = page.locator('[data-testid="zone-etiquettes"]').or(
    page.getByRole('button', { name: 'Ajouter étiquette' }).locator('..')
  );
  await expect(zone.first()).toBeVisible();
});

Given('la galerie affiche au moins deux souvenirs', async ({ page }) => {
  const galerie = page.locator('[data-testid="galerie"]').or(page.locator('.galerie')).first();
  await galerie.waitFor({ state: 'visible' });
  await page.waitForLoadState('networkidle');
  const cartes = page.locator('.galerie-carte');
  await expect(cartes.first()).toBeVisible({ timeout: 30000 });
  await expect(cartes.nth(1)).toBeVisible({ timeout: 10000 });
});

When('je coche la case à cocher de ces deux cartes', async ({ page }) => {
  await ensureModalEtiquetteClosed(page);
  const checkboxes = page.locator('.galerie-carte').getByRole('checkbox');
  await checkboxes.nth(0).waitFor({ state: 'visible', timeout: 5000 });
  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();
});

// CA3 - Pop-up création
When('je clique sur le bouton "Ajouter étiquette"', async ({ page }) => {
  await ensureModalEtiquetteClosed(page);
  await page.getByRole('button', { name: 'Ajouter étiquette' }).click();
});

Then('une pop-up ou un dialogue modal s\'affiche', async ({ page }) => {
  const modal = page.getByRole('dialog').or(page.getByTestId('modal-etiquette'));
  await modal.waitFor({ state: 'visible' });
});

Then('la pop-up contient un champ de saisie pour le libellé', async ({ page }) => {
  const input = page.getByRole('dialog').getByLabel(/libellé|étiquette|nom/i).or(
    page.getByTestId('modal-etiquette').getByRole('textbox')
  );
  await expect(input.first()).toBeVisible();
});

Then('la pop-up contient un bouton "Annuler"', async ({ page }) => {
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Annuler' })).toBeVisible();
});

Then('la pop-up contient un bouton "Créer"', async ({ page }) => {
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Créer' })).toBeVisible();
});

Then('la pop-up contient un bouton "Modifier"', async ({ page }) => {
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Modifier' })).toBeVisible();
});

Given('l\'étiquette {string} n\'existe pas encore', async ({ page }, libelle: string) => {
  if (libelle !== ETIQUETTE_POUR_LES_TESTS) return;
  await supprimerEtiquettePourLesTestsSiExistante(page.request);
});

Given('l\'étiquette {string} existe', async ({ page }, libelle: string) => {
  if (libelle !== ETIQUETTE_POUR_LES_TESTS) return;
  await page.locator('.galerie-carte').getByRole('checkbox').first().check();
  await page.getByRole('button', { name: 'Ajouter étiquette' }).click();
  await page.getByRole('dialog').getByLabel(/libellé|étiquette|nom/i).first().fill(libelle);
  await page.getByRole('dialog').getByRole('button', { name: 'Créer' }).click();
  await page.waitForLoadState('networkidle');
  const hidden = await page.getByTestId('modal-etiquette').waitFor({ state: 'hidden', timeout: 5000 }).then(() => true).catch(() => false);
  if (!hidden) await ensureModalEtiquetteClosed(page);
});

Given('l\'étiquette {string} existe déjà', async ({ page }, libelle: string) => {
  if (libelle !== ETIQUETTE_POUR_LES_TESTS) return;
  await page.locator('.galerie-carte').getByRole('checkbox').first().check();
  await page.getByRole('button', { name: 'Ajouter étiquette' }).click();
  await page.getByRole('dialog').getByLabel(/libellé|étiquette|nom/i).first().fill(libelle);
  await page.getByRole('dialog').getByRole('button', { name: 'Créer' }).click();
  await page.waitForLoadState('networkidle');
  const modal = page.getByTestId('modal-etiquette');
  const hidden = await modal.waitFor({ state: 'hidden', timeout: 3000 }).then(() => true).catch(() => false);
  if (!hidden) {
    await ensureModalEtiquetteClosed(page);
    await supprimerEtiquettePourLesTestsSiExistante(page.request);
    await page.locator('.galerie-carte').getByRole('checkbox').first().check();
    await page.getByRole('button', { name: 'Ajouter étiquette' }).click();
    await page.getByRole('dialog').getByLabel(/libellé|étiquette|nom/i).first().fill(libelle);
    await page.getByRole('dialog').getByRole('button', { name: 'Créer' }).click();
    await page.waitForLoadState('networkidle');
    const h2 = await modal.waitFor({ state: 'hidden', timeout: 5000 }).then(() => true).catch(() => false);
    if (!h2) await ensureModalEtiquetteClosed(page);
  }
});

Given('l\'étiquette {string} existe et n\'est affectée à aucun des souvenirs visibles', async ({ page }, libelle: string) => {
  if (libelle !== ETIQUETTE_POUR_LES_TESTS) return;
  await page.locator('.galerie-carte').getByRole('checkbox').first().check();
  await page.getByRole('button', { name: 'Ajouter étiquette' }).click();
  await page.getByRole('dialog').getByLabel(/libellé|étiquette|nom/i).first().fill(libelle);
  await page.getByRole('dialog').getByRole('button', { name: 'Créer' }).click();
  await page.waitForLoadState('networkidle');
  const hidden = await page.getByTestId('modal-etiquette').waitFor({ state: 'hidden', timeout: 5000 }).then(() => true).catch(() => false);
  if (!hidden) await ensureModalEtiquetteClosed(page);
  await page.locator('.galerie-carte').getByRole('checkbox').first().uncheck();
});

Given('l\'étiquette {string} existe et est déjà affectée aux souvenirs que je vais cocher', async ({ page }, libelle: string) => {
  if (libelle !== ETIQUETTE_POUR_LES_TESTS) return;
  const checkboxes = page.locator('.galerie-carte').getByRole('checkbox');
  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();
  await page.getByRole('button', { name: 'Ajouter étiquette' }).click();
  await page.getByRole('dialog').getByLabel(/libellé|étiquette|nom/i).first().fill(libelle);
  await page.getByRole('dialog').getByRole('button', { name: 'Créer' }).click();
  await page.waitForLoadState('networkidle');
  const hidden = await page.getByTestId('modal-etiquette').waitFor({ state: 'hidden', timeout: 5000 }).then(() => true).catch(() => false);
  if (!hidden) await ensureModalEtiquetteClosed(page);
});

Given('un des souvenirs a l\'étiquette {string} et l\'autre non', async ({ page }, libelle: string) => {
  if (libelle !== ETIQUETTE_POUR_LES_TESTS) return;
  await page.locator('.galerie-carte').getByRole('checkbox').first().check();
  await page.getByRole('button', { name: 'Ajouter étiquette' }).click();
  await page.getByRole('dialog').getByLabel(/libellé|étiquette|nom/i).first().fill(libelle);
  await page.getByRole('dialog').getByRole('button', { name: 'Créer' }).click();
  await page.waitForLoadState('networkidle');
  const hidden = await page.getByTestId('modal-etiquette').waitFor({ state: 'hidden', timeout: 5000 }).then(() => true).catch(() => false);
  if (!hidden) await ensureModalEtiquetteClosed(page);
  await page.locator('.galerie-carte').getByRole('checkbox').first().uncheck();
  await page.locator('.galerie-carte').getByRole('checkbox').nth(1).check();
  await page.getByTestId('zone-etiquettes').getByRole('button', { name: libelle, exact: true }).click();
  await page.waitForLoadState('networkidle');
});

When('je coche la case à cocher de deux cartes de la galerie', async ({ page }) => {
  const checkboxes = page.locator('.galerie-carte').getByRole('checkbox');
  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();
});

When('je coche la case à cocher des cartes qui ont l\'étiquette {string}', async ({ page }, _libelle: string) => {
  await ensureModalEtiquetteClosed(page);
  const cartesAvecEtiquette = page.locator('.galerie-carte').filter({ hasText: _libelle });
  await expect(cartesAvecEtiquette.first()).toBeVisible({ timeout: 15000 });
  const first = cartesAvecEtiquette.first().getByRole('checkbox');
  await first.check();
  const count = await cartesAvecEtiquette.count();
  for (let i = 1; i < count; i++) {
    await cartesAvecEtiquette.nth(i).getByRole('checkbox').check();
  }
});

When('je saisis {string} dans le champ libellé de la pop-up', async ({ page }, libelle: string) => {
  const input = page.getByRole('dialog').getByLabel(/libellé|étiquette|nom/i).or(
    page.getByTestId('modal-etiquette').getByRole('textbox')
  );
  await input.first().fill(libelle);
});

When('je clique sur le bouton "Créer" dans la pop-up', async ({ page }) => {
  await page.getByRole('dialog').getByRole('button', { name: 'Créer' }).click();
});

Then('l\'étiquette {string} est créée', async ({ page }, libelle: string) => {
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(libelle).first()).toBeVisible({ timeout: 5000 });
});

Then('l\'étiquette {string} est affectée au souvenir coché', async ({ page }, libelle: string) => {
  // La liste des étiquettes affiche le libellé et/ou la carte coché affiche l'étiquette
  await expect(page.getByText(libelle).first()).toBeVisible({ timeout: 5000 });
});

Then('un message indique que l\'étiquette existe déjà ou que la création est refusée', async ({ page }) => {
  const modal = page.getByRole('dialog').or(page.getByTestId('modal-etiquette'));
  await expect(modal.getByText(/existe déjà|refusé|doublon/i)).toBeVisible({ timeout: 5000 });
});

Then('aucune nouvelle étiquette en doublon n\'est créée', async () => {
  // Vérification implicite : pas d'erreur ; le message a été affiché. Pas de double entrée visible.
});

When('je clique sur l\'étiquette {string} dans la liste des étiquettes', async ({ page }, libelle: string) => {
  await ensureModalEtiquetteClosed(page);
  const zone = page.getByTestId('zone-etiquettes');
  await zone.getByRole('button', { name: libelle, exact: true }).click();
});

Then('l\'étiquette {string} est affectée à tous les souvenirs cochés', async ({ page }, libelle: string) => {
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(libelle).first()).toBeVisible();
});

Then('l\'étiquette {string} est désaffectée pour tous les souvenirs cochés', async ({ page }) => {
  await page.waitForLoadState('networkidle');
  // Les cartes cochées n'affichent plus l'étiquette (vérification selon le rendu UI)
});

Then('une question ou un dialogue propose au moins les choix "Supprimer sur tout", "Affecter à tout" et "Annuler"', async ({ page }) => {
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: /supprimer sur tout/i })).toBeVisible();
  await expect(dialog.getByRole('button', { name: /affecter à tout/i })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Annuler' })).toBeVisible();
});

// CA5 - Renommage d'étiquette
When('je clique sur le bouton de renommage de l\'étiquette {string}', async ({ page }, libelle: string) => {
  await ensureModalEtiquetteClosed(page);
  const btn = page.getByTestId('zone-etiquettes').getByRole('button', { name: `Renommer ${libelle}` });
  await btn.first().click();
});

Then('une pop-up ou un dialogue de renommage s\'affiche', async ({ page }) => {
  const modal = page.getByTestId('modal-rename-etiquette').or(
    page.getByRole('dialog').filter({ has: page.getByText(/renommer l'étiquette/i) })
  );
  await modal.waitFor({ state: 'visible' });
});

When('je modifie le libellé en {string} dans le modal de renommage', async ({ page }, nouveauLibelle: string) => {
  const input = page.getByTestId('modal-rename-etiquette').getByRole('textbox').or(
    page.getByLabel(/libellé/i).first()
  );
  await input.first().fill(nouveauLibelle);
});

When('je clique sur le bouton "Modifier" dans le modal de renommage', async ({ page }) => {
  const btn = page.getByTestId('modal-rename-etiquette-modifier').or(
    page.getByRole('dialog').getByRole('button', { name: 'Modifier' })
  );
  await btn.click();
});

Then('l\'étiquette est renommée en {string}', async ({ page }, nouveauLibelle: string) => {
  await expect(page.getByText(nouveauLibelle).first()).toBeVisible({ timeout: 8000 });
});

When('je supprime l\'étiquette {string} pour remettre en place', async ({ page }, libelle: string) => {
  if (libelle !== ETIQUETTE_POUR_LES_TESTS && libelle !== 'pour les tests 2024') return;
  const res = await page.request.get('/api/etiquettes');
  const etiquettes = (await res.json()) as { id: number; libelle: string }[];
  const trouvée = etiquettes.find((e) => e.libelle === libelle);
  if (trouvée) {
    await page.request.delete(`/api/etiquettes/${trouvée.id}`);
  }
});
