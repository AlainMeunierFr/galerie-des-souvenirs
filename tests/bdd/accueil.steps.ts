import { createBdd, test } from 'playwright-bdd';

const { Given, Then } = createBdd(test);

Given('je suis sur la page d\'accueil', async ({ page }) => {
  await page.goto('/');
});

Then('la page contient {string}', async ({ page }, text: string) => {
  await page.getByText(text).waitFor({ state: 'visible' });
});

Then('la page contient un titre H1 avec le texte {string}', async ({ page }, text: string) => {
  await page.getByRole('heading', { level: 1, name: text }).waitFor({ state: 'visible' });
});

Given('la largeur du viewport est {int}px', async ({ page }, width: number) => {
  await page.setViewportSize({ width, height: 800 });
});

Then('le titre H1 est centré horizontalement dans la zone visible', async ({ page }) => {
  const h1 = page.getByRole('heading', { level: 1 });
  await h1.waitFor({ state: 'visible' });
  const box = await h1.boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport) throw new Error('Impossible de récupérer les dimensions');
  const h1CenterX = box.x + box.width / 2;
  const viewportCenterX = viewport.width / 2;
  const tolerance = viewport.width * 0.1;
  if (Math.abs(h1CenterX - viewportCenterX) > tolerance) {
    throw new Error(`H1 non centré horizontalement: centre=${h1CenterX}, attendu≈${viewportCenterX}`);
  }
});

Then('le titre H1 est centré verticalement dans la zone visible', async ({ page }) => {
  const h1 = page.getByRole('heading', { level: 1 });
  await h1.waitFor({ state: 'visible' });
  const box = await h1.boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport) throw new Error('Impossible de récupérer les dimensions');
  const h1CenterY = box.y + box.height / 2;
  const viewportCenterY = viewport.height / 2;
  const tolerance = viewport.height * 0.1;
  if (Math.abs(h1CenterY - viewportCenterY) > tolerance) {
    throw new Error(`H1 non centré verticalement: centre=${h1CenterY}, attendu≈${viewportCenterY}`);
  }
});
