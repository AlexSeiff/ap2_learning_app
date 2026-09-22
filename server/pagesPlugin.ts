// Vite-Plugin für `npm run build:pages`: legt die geparsten Lernblätter als content.json neben die App.
// Quelle ist content/ im Repository (npm run sync-content), nicht der Ordner AP-2 – so baut GitHub Actions dasselbe wie lokal.
// KI-Aufgaben aus data/ kommen bewusst nicht hinein (data/ ist privat).

import type { Plugin } from 'vite';
import { CONTENT_DIR, loadContent } from './loadContent';

export function contentJsonPlugin(): Plugin {
  return {
    name: 'ap2-content-json',
    apply: 'build',
    generateBundle() {
      const content = loadContent(CONTENT_DIR);
      if (content.topics.length === 0) this.error(`Keine Lernblätter in ${CONTENT_DIR} – zuerst \`npm run sync-content\` ausführen.`);
      this.emitFile({ type: 'asset', fileName: 'content.json', source: JSON.stringify(content) });
    },
  };
}
