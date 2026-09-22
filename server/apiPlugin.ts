// Vite-Plugin: stellt die lokale API unter /api bereit (Inhalte, Fortschritt, KI).
// So startet die gesamte App mit einem einzigen `npm run dev`.

import { join } from 'node:path';
import type { Plugin } from 'vite';
import { checkProgressPut } from '../shared/progress';
import type { Content } from '../shared/types';
import { aiEnabled, generateTasks, gradeAnswer, MODEL } from './ai';
import { createContentCache, withGenerated } from './contentCache';
import { isContentSource, loadContent, SOURCE_DIR } from './loadContent';
import { GenerateRequestSchema, GradeRequestSchema, HttpError, matchRoute, parseBody, readBody, send, type Route } from './router';
import { backupInfo, readGenerated, readProgress, writeGenerated, writeProgress } from './store';

const contentCache = createContentCache(() => loadContent());

/** Generierte Aufgaben werden bei jedem Request frisch aus data/ gelesen, nur die Lernblätter kommen aus dem Cache. */
function contentWithGenerated(): Content {
  return withGenerated(contentCache.get(), readGenerated());
}

const routes: Route[] = [
  { method: 'GET', path: '/api/content', handler: () => contentWithGenerated() },
  { method: 'GET', path: '/api/progress', handler: () => readProgress() },
  { method: 'GET', path: '/api/progress/backups', handler: () => backupInfo() },
  {
    method: 'PUT',
    path: '/api/progress',
    handler: async ({ req }) => {
      // Nie ungeprüft schreiben: leere/kaputte Daten, ein versehentlich geleerter Stand oder ein veralteter Tab (409)
      // würden echten Fortschritt überschreiben. Lesen, Prüfen und Schreiben laufen synchron – also ohne Wettlauf zweier PUTs.
      const checked = checkProgressPut(await readBody(req), readProgress());
      if (!checked.ok) throw new HttpError(checked.status, checked.error);
      writeProgress(checked.progress);
      return { ok: true, revision: checked.progress.revision };
    },
  },
  { method: 'GET', path: '/api/ai/status', handler: () => ({ enabled: aiEnabled(), model: MODEL }) },
  {
    method: 'POST',
    path: '/api/ai/generate',
    handler: async ({ req }) => {
      const { topicId, count, types } = parseBody(GenerateRequestSchema, await readBody(req));
      const tasks = await generateTasks(contentWithGenerated(), topicId, count, types);
      writeGenerated([...readGenerated(), ...tasks]);
      return tasks;
    },
  },
  {
    method: 'POST',
    path: '/api/ai/grade',
    handler: async ({ req }) => {
      const { taskId, answer } = parseBody(GradeRequestSchema, await readBody(req));
      const task = contentWithGenerated().tasks[taskId];
      if (!task) throw new HttpError(404, 'Aufgabe nicht gefunden.');
      return gradeAnswer(task, answer);
    },
  },
  {
    method: 'DELETE',
    path: /^\/api\/generated\/(.+)$/,
    handler: ({ params: [id] }) => {
      writeGenerated(readGenerated().filter((t) => t.id !== id));
      return { ok: true };
    },
  },
];

export function apiPlugin(): Plugin {
  return {
    name: 'ap2-api',
    configureServer(server) {
      // Lernblatt geändert, neu oder gelöscht → Cache leeren und Seite neu laden, Inhalte werden dabei neu importiert.
      server.watcher.add([join(SOURCE_DIR, '*.md'), join(SOURCE_DIR, '*Lernkarten*.json')]);
      const onSourceEvent = (file: string) => {
        if (!isContentSource(file)) return;
        contentCache.invalidate();
        server.ws.send({ type: 'full-reload' });
      };
      for (const event of ['change', 'add', 'unlink'] as const) server.watcher.on(event, onSourceEvent);

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        if (!url.pathname.startsWith('/api/')) return next();
        try {
          const match = matchRoute(routes, req.method ?? 'GET', url.pathname);
          if (!match) return send(res, 404, { error: `Unbekannte Route ${req.method} ${url.pathname}` });
          send(res, 200, await match.route.handler({ req, params: match.params }));
        } catch (err) {
          const status = err instanceof HttpError ? err.status : 500;
          const message = err instanceof Error ? err.message : String(err);
          if (status === 500) console.error(err);
          send(res, status, { error: message });
        }
      });
    },
  };
}
