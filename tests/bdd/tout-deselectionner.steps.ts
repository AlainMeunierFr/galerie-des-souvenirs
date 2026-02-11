import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { When, Then } = createBdd(test);

// CA1 - Visibilité du bouton
Then('le bouton "Tout déselectionner" n\'est pas visible', async ({ page }) => {
  const btn = page.getByRole('button', { name: 'Tout déselectionner' }).or(
    page.getByTestId('bouton-tout-deselectionner')
  );
  await expect(btn).toBeHidden();
});

Then('le bouton "Tout déselectionner" est visible', async ({ page }) => {
  const btn = page.getByRole('button', { name: 'Tout déselectionner' }).or(
    page.getByTestId('bouton-tout-deselectionner')
  );
  await expect(btn).toBeVisible();
});

Then('le bouton "Tout déselectionner" est dans la zone étiquettes à côté du bouton "Ajouter étiquette"', async ({ page }) => {
  const zone = page.locator('[data-testid="zone-etiquettes"]');
  await expect(zone).toBeVisible();
  const btnToutDeselectionner = zone.getByRole('button', { name: 'Tout déselectionner' }).or(
    zone.getByTestId('bouton-tout-deselectionner')
  );
  const btnAjouter = zone.getByRole('button', { name: 'Ajouter étiquette' });
  await expect(btnToutDeselectionner).toBeVisible();
  await expect(btnAjouter).toBeVisible();
});

// CA2 - Comportement au clic
When('je clique sur le bouton "Tout déselectionner"', async ({ page }) => {
  const btn = page.getByRole('button', { name: 'Tout déselectionner' }).or(
    page.getByTestId('bouton-tout-deselectionner')
  );
  await btn.click();
});

Then('toutes les cartes de la galerie sont décochées', async ({ page }) => {
  const checkboxes = page.locator('.galerie-carte').getByRole('checkbox');
  const count = await checkboxes.count();
  for (let i = 0; i < count; i++) {
    await expect(checkboxes.nth(i)).not.toBeChecked();
  }
});

Then('la zone étiquettes est masquée ou le bouton "Ajouter étiquette" n\'est pas visible', async ({ page }) => {
  const btn = page.getByRole('button', { name: 'Ajouter étiquette' });
  await expect(btn).toBeHidden();
});
