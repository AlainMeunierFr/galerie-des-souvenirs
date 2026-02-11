import type { Page } from '@playwright/test';

/** Ferme le modal étiquette s'il est ouvert (évite les blocages de clics). */
export async function ensureModalEtiquetteClosed(page: Page): Promise<void> {
  const modal = page.getByTestId('modal-etiquette');
  const visible = await modal.isVisible().catch(() => false);
  if (visible) {
    await page.getByRole('dialog').getByRole('button', { name: 'Annuler' }).click().catch(() => {});
    await modal.waitFor({ state: 'hidden' }).catch(() => {});
  }
}
