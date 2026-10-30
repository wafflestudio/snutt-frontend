import { defineConfig, devices } from '@playwright/test';
import { API_BASE_URL } from './tests/msw/server';

const PORT = 3100;

// 프로덕션 빌드를 띄우고 브라우저에서 화면을 따라간다. 서버 요청은 e2e/fixtures.ts 의 가짜 서버가 받는다
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // 데스크톱 전용(최소 1200px)
    viewport: { width: 1440, height: 900 },
    trace: 'on-first-retry',
  },
  projects: [{ name: 'Chrome', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }],
  webServer: {
    command: `yarn build && yarn start -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
    // .env.local 보다 앞선다 (Next 는 이미 있는 환경 변수를 덮어쓰지 않는다)
    env: { NEXT_PUBLIC_API_BASE_URL: API_BASE_URL, NEXT_PUBLIC_CLIENT_KEY: 'e2e-client-key' },
  },
});
