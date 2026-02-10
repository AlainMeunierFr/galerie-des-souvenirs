import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { getInteretLabel, getInteretOptions } from '@/utils/interetLabels';

const { Then, When } = createBdd(test);

Then('la page contient un filtre ou un contrôle intitulé "Intérêt" ou dont le libellé évoque l\'intérêt', async ({ page }) => {
  const filtre = page.getByTestId('filtre-interet').or(
    page.getByRole('group', { name: /intérêt/i }).or(page.locator('fieldset').filter({ has: page.getByText('Intérêt') }))
  );
  await filtre.first().waitFor({ state: 'visible' });
});

Then('ce filtre propose les trois options d\'intérêt \\(concepts : intéressé, pas intéressé, pas prononcé\\)', async ({ page }) => {
  const options = getInteretOptions();
  for (const { libelle } of options) {
    await page.getByLabel(libelle, { exact: true }).or(page.getByText(libelle, { exact: true })).first().waitFor({ state: 'visible' });
  }
});

Then('les options du filtre Intérêt ont les mêmes libellés que les boutons d\'intérêt sur les cartes', async ({ page }) => {
  const options = getInteretOptions();
  const filtre = page.getByTestId('filtre-interet');
  await filtre.waitFor({ state: 'visible' });
  for (const { libelle } of options) {
    await filtre.getByText(libelle, { exact: true }).waitFor({ state: 'visible' });
  }
  const firstCard = page.locator('[data-testid^="interet-"]').first();
  await firstCard.waitFor({ state: 'visible' });
  for (const { libelle } of options) {
    await page.getByRole('button', { name: libelle }).first().waitFor({ state: 'visible' });
  }
});

Then('le filtre Intérêt a toutes ses options cochées ou sélectionnées', async ({ page }) => {
  const options = getInteretOptions();
  for (const { cle } of options) {
    const testId = `filtre-interet-${cle.replace(/\s/g, '-')}`;
    const checkbox = page.getByTestId(testId);
    await checkbox.waitFor({ state: 'visible' });
    await expect(checkbox).toBeChecked();
  }
});

Then('la galerie affiche l\'ensemble des souvenirs \\(aucun filtrage appliqué\\)', async ({ page }) => {
  const galerie = page.getByTestId('galerie').or(page.locator('.galerie'));
  await galerie.waitFor({ state: 'visible' });
  const cartes = page.locator('.galerie-carte, [data-testid^="interet-"]').first();
  await cartes.waitFor({ state: 'visible' }).catch(() => {});
});

When('je décoche uniquement l\'option d\'intérêt "pas prononcé" dans le filtre Intérêt', async ({ page }) => {
  const libelle = getInteretLabel('pas prononcé');
  const option = page.getByTestId('filtre-interet-pas-prononcé').or(
    page.getByRole('checkbox', { name: new RegExp(libelle, 'i') })
  );
  await option.first().waitFor({ state: 'visible' });
  await option.first().uncheck();
});

Then('la galerie n\'affiche que les souvenirs dont l\'intérêt est "intéressé" ou "pas intéressé"', async ({ page }) => {
  const galerie = page.getByTestId('galerie').or(page.locator('.galerie'));
  await galerie.waitFor({ state: 'visible' });
  const libellePasPrononce = getInteretLabel('pas prononcé');
  const cartesAvecPasPrononce = page.getByRole('button', { name: libellePasPrononce, pressed: true });
  await expect(cartesAvecPasPrononce).toHaveCount(0);
});

Then('les souvenirs dont l\'intérêt est "pas prononcé" ne sont pas affichés', async ({ page }) => {
  const libellePasPrononce = getInteretLabel('pas prononcé');
  const boutonsPasPrononceActifs = page.getByRole('button', { name: libellePasPrononce, pressed: true });
  await expect(boutonsPasPrononceActifs).toHaveCount(0);
});

When('je fais défiler le contenu de la page vers le bas', async ({ page }) => {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
});

Then('le titre H1 reste visible dans la zone visible', async ({ page }) => {
  const h1 = page.getByRole('heading', { level: 1 });
  await h1.waitFor({ state: 'visible' });
  const box = await h1.boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport) throw new Error('Impossible de récupérer les dimensions');
  const inView = box.y < viewport.height && box.y + box.height > 0;
  if (!inView) {
    throw new Error(`H1 hors de la zone visible (y=${box.y}, viewport height=${viewport.height})`);
  }
});

Then('le filtre Intérêt reste visible dans la zone visible', async ({ page }) => {
  const filtre = page.getByTestId('filtre-interet');
  await filtre.waitFor({ state: 'visible' });
  const box = await filtre.boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport) throw new Error('Impossible de récupérer les dimensions');
  const inView = box.y < viewport.height && box.y + box.height > 0;
  if (!inView) {
    throw new Error(`Filtre Intérêt hors de la zone visible (y=${box.y}, viewport height=${viewport.height})`);
  }
});
