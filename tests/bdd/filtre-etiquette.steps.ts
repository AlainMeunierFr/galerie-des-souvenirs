/**
 * Steps US-5.6 Filtre par étiquette — alignés avec le code actuel (choix unique, pills, Sans filtre).
 * N'utilise que l'étiquette "pour les tests" pour ne pas toucher aux données de production.
 */
import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { ensureModalEtiquetteClosed } from './helpers';

const { Given, When, Then } = createBdd(test);

const ETIQUETTE_POUR_LES_TESTS = 'pour les tests';

function slug(libelle: string): string {
  return libelle.replace(/\s/g, '-');
}

Given("l'étiquette {string} existe en base", async ({ page }, libelle: string) => {
  if (libelle !== ETIQUETTE_POUR_LES_TESTS) return;
  await page.waitForLoadState('networkidle');
  await page.locator('.galerie-carte').getByRole('checkbox').first().waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('.galerie-carte').getByRole('checkbox').first().check();
  await page.getByRole('button', { name: 'Ajouter étiquette' }).click();
  await page.getByRole('dialog').getByLabel(/libellé|étiquette|nom/i).first().fill(libelle);
  await page.getByRole('dialog').getByRole('button', { name: 'Créer' }).click();
  await page.waitForLoadState('networkidle');
  const hidden = await page.getByTestId('modal-etiquette').waitFor({ state: 'hidden', timeout: 5000 }).then(() => true).catch(() => false);
  if (!hidden) await ensureModalEtiquetteClosed(page);
});

Given("au moins un souvenir a l'étiquette {string}", async ({ page }, libelle: string) => {
  if (libelle !== ETIQUETTE_POUR_LES_TESTS) return;
  await page.waitForLoadState('networkidle');
  const cartesAvecEtiquette = page.locator('.galerie-carte').filter({
    has: page.locator('[aria-label="Étiquettes du souvenir"]').getByText(libelle, { exact: true }),
  });
  if ((await cartesAvecEtiquette.count()) > 0) return;
  const checkboxes = page.locator('.galerie-carte').getByRole('checkbox');
  await checkboxes.first().waitFor({ state: 'visible', timeout: 30000 });
  await checkboxes.first().check();
  const btnEtiquette = page.getByTestId('zone-etiquettes').getByRole('button', { name: libelle, exact: true });
  if ((await btnEtiquette.count()) === 0) {
    await page.getByRole('button', { name: 'Ajouter étiquette' }).click();
    await page.getByRole('dialog').getByLabel(/libellé|étiquette|nom/i).first().fill(libelle);
    await page.getByRole('dialog').getByRole('button', { name: 'Créer' }).click();
    await page.waitForLoadState('networkidle');
    const hidden = await page.getByTestId('modal-etiquette').waitFor({ state: 'hidden', timeout: 5000 }).then(() => true).catch(() => false);
    if (!hidden) await ensureModalEtiquetteClosed(page);
  }
  await page.getByTestId('zone-etiquettes').getByRole('button', { name: libelle, exact: true }).click();
  await page.waitForLoadState('networkidle');
});

Given("au moins un souvenir n'a aucune étiquette", async () => {
  // Les données de production contiennent des souvenirs sans étiquette.
});

When("je sélectionne l'option {string} dans le filtre Étiquette", async ({ page }, option: string) => {
  await ensureModalEtiquetteClosed(page);
  const testId =
    option === 'Sans filtre'
      ? 'filtre-etiquette-sans-filtre'
      : `filtre-etiquette-${slug(option)}`;
  const btn = page.getByTestId(testId);
  await btn.waitFor({ state: 'visible', timeout: 15000 });
  await btn.click();
});

When("je décoche uniquement l'option {string} dans le filtre Étiquette", async ({ page }, option: string) => {
  const testId = `filtre-etiquette-${slug(option)}`;
  const btn = page.getByTestId(testId);
  await btn.waitFor({ state: 'visible' });
  await btn.click();
});

When("je décoche toutes les options du filtre Étiquette sauf {string}", async ({ page }, option: string) => {
  const testId = `filtre-etiquette-${slug(option)}`;
  const btn = page.getByTestId(testId);
  await btn.waitFor({ state: 'visible' });
  await btn.click();
});

When("je décoche toutes les options du filtre Étiquette sauf {string} et {string}", async () => {
  test.skip(true, "Scénario multi-option remplacé par choix unique ; utiliser « je sélectionne l'option X »");
});

Then(
  "la page contient un filtre ou un contrôle intitulé {string} ou dont le libellé évoque les étiquettes",
  async ({ page }) => {
    const filtre = page.getByTestId('filtre-etiquette').or(
      page.locator('[aria-label*="étiquette" i], [aria-label*="Étiquette"]')
    );
    await filtre.first().waitFor({ state: 'visible' });
  }
);

Then("ce filtre propose une option {string}", async ({ page }, option: string) => {
  const testId =
    option === 'Sans filtre'
      ? 'filtre-etiquette-sans-filtre'
      : `filtre-etiquette-${slug(option)}`;
  await page.getByTestId(testId).waitFor({ state: 'visible', timeout: 15000 });
});

Then("le filtre Étiquette est situé dans le header à côté du filtre Intérêt", async ({ page }) => {
  const zone = page.getByTestId('zone-filtres');
  await zone.waitFor({ state: 'visible' });
  await expect(zone.getByTestId('filtre-etiquette')).toBeVisible();
  await expect(zone.getByTestId('filtre-interet')).toBeVisible();
});

Then("le filtre Étiquette propose l'option {string}", async ({ page }, option: string) => {
  const testId =
    option === 'Sans filtre'
      ? 'filtre-etiquette-sans-filtre'
      : `filtre-etiquette-${slug(option)}`;
  await page.getByTestId(testId).waitFor({ state: 'visible', timeout: 15000 });
});

Then("la galerie n'affiche que les souvenirs ayant au moins une étiquette", async ({ page }) => {
  const galerie = page.getByTestId('galerie').or(page.locator('.galerie'));
  await galerie.waitFor({ state: 'visible' });
  const cartes = galerie.locator('.galerie-grid-item');
  const n = await cartes.count();
  for (let i = 0; i < n; i++) {
    const zone = cartes.nth(i).locator('[aria-label="Étiquettes du souvenir"]');
    await expect(zone).toBeVisible();
    await expect(zone.locator('span').first()).toBeVisible();
  }
});

Then("les souvenirs sans étiquette ne sont pas affichés", async ({ page }) => {
  const galerie = page.getByTestId('galerie').or(page.locator('.galerie'));
  const cartes = galerie.locator('.galerie-grid-item');
  const n = await cartes.count();
  for (let i = 0; i < n; i++) {
    const etiquettes = cartes.nth(i).locator('[aria-label="Étiquettes du souvenir"] span');
    await expect(etiquettes.first()).toBeVisible();
  }
});

Then("la galerie n'affiche que les souvenirs ayant l'étiquette {string}", async ({ page }, libelle: string) => {
  const galerie = page.getByTestId('galerie').or(page.locator('.galerie'));
  await galerie.waitFor({ state: 'visible' });
  const cartes = galerie.locator('.galerie-grid-item');
  const n = await cartes.count();
  for (let i = 0; i < n; i++) {
    await expect(cartes.nth(i).locator('[aria-label="Étiquettes du souvenir"]').getByText(libelle, { exact: true })).toBeVisible();
  }
});

Then("les souvenirs ayant uniquement l'étiquette {string} ne sont pas affichés", async ({ page }, other: string) => {
  const galerie = page.getByTestId('galerie').or(page.locator('.galerie'));
  const cartes = galerie.locator('.galerie-grid-item');
  const n = await cartes.count();
  for (let i = 0; i < n; i++) {
    const zone = cartes.nth(i).locator('[aria-label="Étiquettes du souvenir"]');
    const hasOther = zone.getByText(other, { exact: true });
    await expect(hasOther).not.toBeVisible();
  }
});

Then("la galerie affiche les souvenirs ayant l'étiquette {string}", async ({ page }, libelle: string) => {
  const galerie = page.getByTestId('galerie').or(page.locator('.galerie'));
  await galerie.waitFor({ state: 'visible' });
  await expect(galerie.getByText(libelle, { exact: true }).first()).toBeVisible();
});

Then("la galerie affiche les souvenirs sans étiquette", async ({ page }) => {
  const galerie = page.getByTestId('galerie').or(page.locator('.galerie'));
  await galerie.waitFor({ state: 'visible' });
  const cartes = galerie.locator('.galerie-grid-item');
  await expect(cartes.first()).toBeVisible();
});

Then("la galerie n'affiche que les souvenirs sans étiquette", async ({ page }) => {
  const galerie = page.getByTestId('galerie').or(page.locator('.galerie'));
  await galerie.waitFor({ state: 'visible' });
  const cartes = galerie.locator('.galerie-grid-item');
  const n = await cartes.count();
  for (let i = 0; i < n; i++) {
    const zone = cartes.nth(i).locator('[aria-label="Étiquettes du souvenir"]');
    await expect(zone.locator('span')).toHaveCount(0);
  }
});

Then("les souvenirs ayant l'étiquette {string} ne sont pas affichés", async ({ page }, libelle: string) => {
  const galerie = page.getByTestId('galerie').or(page.locator('.galerie'));
  await galerie.waitFor({ state: 'visible' });
  const withLibelle = galerie.locator('[aria-label="Étiquettes du souvenir"]').filter({ has: page.getByText(libelle, { exact: true }) });
  await expect(withLibelle).toHaveCount(0);
});

Then("le filtre Étiquette a toutes ses options cochées ou sélectionnées", async ({ page }) => {
  const sansFiltre = page.getByTestId('filtre-etiquette-sans-filtre');
  await sansFiltre.waitFor({ state: 'visible' });
  await expect(sansFiltre).toHaveAttribute('aria-pressed', 'true');
});

Then('le filtre Étiquette a {string} sélectionné', async ({ page }, option: string) => {
  const testId =
    option === 'Sans filtre'
      ? 'filtre-etiquette-sans-filtre'
      : `filtre-etiquette-${slug(option)}`;
  const btn = page.getByTestId(testId);
  await btn.waitFor({ state: 'visible', timeout: 15000 });
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
});

Then("le filtre Étiquette reste visible dans la zone visible", async ({ page }) => {
  const filtre = page.getByTestId('filtre-etiquette');
  await filtre.waitFor({ state: 'visible' });
  const box = await filtre.boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport) throw new Error('Impossible de récupérer les dimensions');
  const inView = box.y < viewport.height && box.y + box.height > 0;
  if (!inView) {
    throw new Error(`Filtre Étiquette hors de la zone visible (y=${box.y}, viewport height=${viewport.height})`);
  }
});
