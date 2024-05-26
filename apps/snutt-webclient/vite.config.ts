import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    plugins: [react()],
    resolve: { alias: [{ find: '@', replacement: resolve(__dirname, 'src/') }] },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  });
};
