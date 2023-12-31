import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

const PORT = 3000;

const config: PlaywrightTestConfig = {
  testDir: './e2e',
  timeout: 10 * 1000,

  expect: { timeout: 5000 },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    video: 'on',
    actionTimeout: 0,
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  /* 사파리에서 되면 되는거아닐까? */
  projects: [{ name: 'Mobile Safari', use: { ...devices['iPhone 12'] } }],
};

export default config;
