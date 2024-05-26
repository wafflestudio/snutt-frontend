import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['**.test.ts'] },
  resolve: { alias: [{ find: '@', replacement: resolve(__dirname, 'src/') }] },
});
