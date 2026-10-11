import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup.ts'],
    // jsdom 에서 userEvent 로 긴 목록(시간 선택 등)을 여는 테스트는 파일을 동시에 돌리면 기본 5초를 넘길 때가 있다
    testTimeout: 15_000,
  },
  resolve: { alias: [{ find: '@', replacement: fileURLToPath(new URL('./src/', import.meta.url)) }] },
});
