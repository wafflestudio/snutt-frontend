import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup.ts'],
  },
  resolve: { alias: [{ find: '@', replacement: fileURLToPath(new URL('./src/', import.meta.url)) }] },
});
