import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['src/**/*.test.ts'] },
  resolve: { alias: [{ find: '@', replacement: fileURLToPath(new URL('./src/', import.meta.url)) }] },
});
