import { defineConfig, devices } from '@playwright/test';

/**
 * Tests End-to-End purs (Playwright) — tests/end-to-end/*.spec.ts
 * Distinct des scénarios BDD (Gherkin) dans tests/bdd/
 */
export default defineConfig({
  testDir: 'tests/end-to-end',
  testMatch: /\.spec\.(ts|js)/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report-e2e' }],
    ['json', { outputFile: 'test-results/playwright-e2e.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'on',
    trace: 'on',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
