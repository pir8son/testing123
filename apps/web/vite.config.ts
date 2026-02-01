import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.jsx', '.js'],
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@repo/shared': path.resolve(__dirname, '../../packages/shared/src')
        }
      }
    };
});
