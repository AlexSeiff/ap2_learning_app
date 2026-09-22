/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { apiPlugin } from './server/apiPlugin';

export default defineConfig(({ mode }) => {
  // ANTHROPIC_API_KEY / ANTHROPIC_MODEL / LERN_QUELLE dürfen auch in .env.local stehen.
  const env = loadEnv(mode, import.meta.dirname, '');
  for (const key of ['ANTHROPIC_API_KEY', 'ANTHROPIC_MODEL', 'LERN_QUELLE']) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }
  return {
    plugins: [react(), apiPlugin()],
    server: { port: 5178 },
    test: { include: ['tests/**/*.test.ts'] },
  };
});
