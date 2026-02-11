import { createBdd, test } from 'playwright-bdd';

const { Given, Then } = createBdd(test);

const SKIP_CONNECTED = 'CLERK_TEST_EMAIL et CLERK_TEST_PASSWORD non définis dans .env.local';

Given('je suis sur la page d\'accueil', async ({ page }) => {
  await page.goto('/');
});

Then('la page contient {string}', async ({ page }, text: string) => {
  await page.getByText(text).waitFor({ state: 'visible' });
});

Then('la page contient un titre H1 avec le texte {string}', async ({ page }, text: string) => {
  const h1 = page.getByRole('heading', { level: 1 });
  await h1.waitFor({ state: 'visible' });
  const content = await h1.textContent();
  if (!content?.includes(text)) {
    throw new Error(`H1 ne contient pas "${text}". Contenu: "${content}"`);
  }
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

// US-1.2 — Message adapté à l'état de connexion
Given('je ne suis pas connecté', async ({ page }) => {
  await page.context().clearCookies();
});

Given('je suis connecté', async ({ page }) => {
  const email = process.env.CLERK_TEST_EMAIL;
  const password = process.env.CLERK_TEST_PASSWORD;
  if (!email || !password) {
    test.skip(true, SKIP_CONNECTED);
    return;
  }
  await page.goto('/');
  const signInBtn = page.getByRole('link', { name: /connexion/i }).or(page.getByText(/connexion/i));
  await signInBtn.first().click();
  await page.getByLabel(/email|e-mail/i).fill(email);
  await page.getByLabel(/mot de passe|password/i).fill(password);
  await page.getByRole('button', { name: /continuer|connexion|sign in/i }).click();
  await page.waitForURL('/');
});

Then('la page contient un sous-titre H2 avec le texte {string}', async ({ page }, text: string) => {
  await page.getByRole('heading', { level: 2, name: text }).waitFor({ state: 'visible' });
});

Then('la page contient le texte {string}', async ({ page }, text: string) => {
  await page.getByText(text).waitFor({ state: 'visible' });
});

// US-2.1 — Afficher la galerie
Then('le titre H1 est en haut à gauche de la zone de contenu', async ({ page }) => {
  const h1 = page.getByRole('heading', { level: 1 });
  await h1.waitFor({ state: 'visible' });
  const box = await h1.boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport) throw new Error('Impossible de récupérer les dimensions');
  // H1 en haut : position Y proche du haut (après la barre Clerk ~64px)
  const topThreshold = 120;
  if (box.y > topThreshold) {
    throw new Error(`H1 trop bas (y=${box.y}), attendu en haut (y < ${topThreshold})`);
  }
  // H1 à gauche : position X proche de 0 ou petit offset
  const leftThreshold = viewport.width * 0.3;
  if (box.x > leftThreshold) {
    throw new Error(`H1 trop à droite (x=${box.x}), attendu à gauche (x < ${leftThreshold})`);
  }
});

Then('la page contient une galerie de photos', async ({ page }) => {
  const galerie = page.getByRole('region', { name: /galerie/i })
    .or(page.locator('[data-testid="galerie"]'))
    .or(page.locator('.galerie'));
  await galerie.first().waitFor({ state: 'visible' });
});

Then('la galerie est affichée sur 4 colonnes', async ({ page }) => {
  const galerie = page.getByRole('region', { name: /galerie/i })
    .or(page.locator('[data-testid="galerie"]'))
    .or(page.locator('.galerie'));
  const container = galerie.first();
  await container.waitFor({ state: 'visible' });
  const has4Cols = await container.evaluate((el) => {
    const style = window.getComputedStyle(el);
    const gridCols = style.gridTemplateColumns;
    if (gridCols && /repeat\s*\(\s*4\s*,/.test(gridCols)) return true;
    if (el.classList.contains('grid-cols-4')) return true;
    return false;
  });
  if (!has4Cols) {
    throw new Error('Galerie sans 4 colonnes. Utiliser grid-cols-4 (Tailwind) ou grid-template-columns: repeat(4, ...).');
  }
});
