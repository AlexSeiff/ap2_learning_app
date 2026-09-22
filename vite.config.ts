/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { apiPlugin } from './server/apiPlugin';
import { contentJsonPlugin } from './server/pagesPlugin';
import { DEV_PORT } from './shared/config';

export default defineConfig(({ mode }) => {
  // npm run build:pages: statische Version für GitHub Pages – ohne Server und KI, Inhalte aus content/ als content.json.
  // Relative Pfade (base './'), damit sie unter https://alexseiff.github.io/ap2_learning_app/ funktioniert (HashRouter).
  // .env.local wird hier gar nicht erst gelesen, der API-Schlüssel kann also nicht in den Build geraten.
  if (mode === 'pages') {
    return { base: './', plugins: [react(), contentJsonPlugin()] };
  }

  // ANTHROPIC_API_KEY / ANTHROPIC_MODEL / LERN_QUELLE dürfen auch in .env.local stehen.
  const env = loadEnv(mode, import.meta.dirname, '');
  for (const key of ['ANTHROPIC_API_KEY', 'ANTHROPIC_MODEL', 'LERN_QUELLE']) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }
  return {
    plugins: [react(), apiPlugin()],
    server: { port: DEV_PORT },
    test: { include: ['tests/**/*.test.ts'] },
  };
});
