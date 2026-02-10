import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd(test);

/** Index 1-based (1ère = 0, 2e = 1, etc.). */
function ordinalToIndex(ordinal: number): number {
  return ordinal - 1;
}

Given('la galerie affiche au moins trois souvenirs', async ({ page }) => {
  const galerie = page.locator('[data-testid="galerie"]').or(page.locator('.galerie')).first();
  await galerie.waitFor({ state: 'visible' });
  const cartes = page.locator('.galerie-carte');
  await expect(cartes.nth(0)).toBeVisible();
  await expect(cartes.nth(1)).toBeVisible({ timeout: 5000 });
  await expect(cartes.nth(2)).toBeVisible({ timeout: 5000 });
});

Given('la galerie affiche au moins quatre souvenirs', async ({ page }) => {
  const galerie = page.locator('[data-testid="galerie"]').or(page.locator('.galerie')).first();
  await galerie.waitFor({ state: 'visible' });
  const cartes = page.locator('.galerie-carte');
  await expect(cartes.nth(0)).toBeVisible();
  await expect(cartes.nth(1)).toBeVisible({ timeout: 5000 });
  await expect(cartes.nth(2)).toBeVisible({ timeout: 5000 });
  await expect(cartes.nth(3)).toBeVisible({ timeout: 5000 });
});

When('je clique sur la case à cocher de la {int}ère carte', async ({ page }, ord: number) => {
  const index = ordinalToIndex(ord);
  await page.locator('.galerie-carte').nth(index).getByRole('checkbox').click();
});

When('je clique sur la case à cocher de la {int}e carte', async ({ page }, ord: number) => {
  const index = ordinalToIndex(ord);
  await page.locator('.galerie-carte').nth(index).getByRole('checkbox').click();
});

When(
  'je maintiens la touche Shift et je clique sur la case à cocher de la {int}ère carte',
  async ({ page }, ord: number) => {
    const index = ordinalToIndex(ord);
    await page.keyboard.down('Shift');
    await page.locator('.galerie-carte').nth(index).getByRole('checkbox').click();
    await page.keyboard.up('Shift');
  }
);

When(
  'je maintiens la touche Shift et je clique sur la case à cocher de la {int}e carte',
  async ({ page }, ord: number) => {
    const index = ordinalToIndex(ord);
    await page.keyboard.down('Shift');
    await page.locator('.galerie-carte').nth(index).getByRole('checkbox').click();
    await page.keyboard.up('Shift');
  }
);

Then(
  'les cartes de la {int}ère à la {int}e sont cochées',
  async ({ page }, ordStart: number, ordEnd: number) => {
    const start = ordinalToIndex(ordStart);
    const end = ordinalToIndex(ordEnd);
    const cartes = page.locator('.galerie-carte');
    for (let i = start; i <= end; i++) {
      await expect(cartes.nth(i).getByRole('checkbox')).toBeChecked();
    }
  }
);

Then(
  'les cartes de la {int}e à la {int}e sont cochées',
  async ({ page }, ordStart: number, ordEnd: number) => {
    const start = ordinalToIndex(ordStart);
    const end = ordinalToIndex(ordEnd);
    const cartes = page.locator('.galerie-carte');
    for (let i = start; i <= end; i++) {
      await expect(cartes.nth(i).getByRole('checkbox')).toBeChecked();
    }
  }
);

Then(
  'les cartes de la {int}ère à la {int}e sont décochées',
  async ({ page }, ordStart: number, ordEnd: number) => {
    const start = ordinalToIndex(ordStart);
    const end = ordinalToIndex(ordEnd);
    const cartes = page.locator('.galerie-carte');
    for (let i = start; i <= end; i++) {
      await expect(cartes.nth(i).getByRole('checkbox')).not.toBeChecked();
    }
  }
);

Then(
  'les cartes de la {int}e à la {int}e sont décochées',
  async ({ page }, ordStart: number, ordEnd: number) => {
    const start = ordinalToIndex(ordStart);
    const end = ordinalToIndex(ordEnd);
    const cartes = page.locator('.galerie-carte');
    for (let i = start; i <= end; i++) {
      await expect(cartes.nth(i).getByRole('checkbox')).not.toBeChecked();
    }
  }
);

Then('la {int}ère carte est décochée', async ({ page }, ord: number) => {
  const index = ordinalToIndex(ord);
  await expect(page.locator('.galerie-carte').nth(index).getByRole('checkbox')).not.toBeChecked();
});

Then('la {int}ère carte reste cochée', async ({ page }, ord: number) => {
  const index = ordinalToIndex(ord);
  await expect(page.locator('.galerie-carte').nth(index).getByRole('checkbox')).toBeChecked();
});

Given('seule la {int}ère carte est cochée', async ({ page }, ord: number) => {
  const cartes = page.locator('.galerie-carte');
  const count = await cartes.count();
  const targetIndex = ordinalToIndex(ord);
  for (let i = 0; i < count; i++) {
    const cb = cartes.nth(i).getByRole('checkbox');
    if (i === targetIndex) {
      await cb.check();
    } else {
      await cb.uncheck();
    }
  }
});

Given('j\'ai coché les cartes de la {int}ère à la {int}e', async ({ page }, ordStart: number, ordEnd: number) => {
  const start = ordinalToIndex(ordStart);
  const end = ordinalToIndex(ordEnd);
  const cartes = page.locator('.galerie-carte');
  for (let i = start; i <= end; i++) {
    await cartes.nth(i).getByRole('checkbox').check();
  }
});

Then('le comportement Shift n\'est pas exposé à l\'utilisateur', async ({ page }) => {
  const checkboxes = page.locator('.galerie-carte').getByRole('checkbox');
  await expect(checkboxes).toHaveCount(0);
});
