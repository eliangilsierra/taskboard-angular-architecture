import { defineConfig, devices } from '@playwright/test';

const isCi = !!process.env['CI'];

/**
 * The suite targets an already running deployment, never the dev server:
 * what gets tested is the artifact that ships. Point it elsewhere with E2E_BASE_URL.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  reporter: isCi ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env['E2E_BASE_URL'] ?? 'http://localhost:8080',
    trace: 'on-first-retry'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
