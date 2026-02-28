import { devices, type PlaywrightTestConfig } from '@playwright/test';

const PORT = 5173;

const config: PlaywrightTestConfig = {
  testDir: './e2e',
  timeout: 5000,
  // timeout: 100000,

  expect: { timeout: 5000 },
  // expect: { timeout: 100000 },

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
    launchOptions: {
      args: ['--disable-gpu'],
      slowMo: 500, // Add this line
    },
  },

  /* Configure projects for major browsers */
  projects: [
    { name: 'Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Firefox', use: { ...devices['Desktop Firefox'] } },
  ],
};

export default config;
