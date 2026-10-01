// Für Kommandozeilen-Werkzeuge (npm run mc-entwurf): ANTHROPIC_API_KEY / ANTHROPIC_MODEL / LERN_QUELLE aus .env.local übernehmen –
// wie vite.config.ts. Muss vor server/ai.ts und server/loadContent.ts importiert werden, die die Werte beim Import lesen.

import { join } from 'node:path';
import { loadEnv } from 'vite';

const env = loadEnv('development', join(import.meta.dirname, '..'), '');
for (const key of ['ANTHROPIC_API_KEY', 'ANTHROPIC_MODEL', 'LERN_QUELLE']) {
  if (env[key] && !process.env[key]) process.env[key] = env[key];
}
