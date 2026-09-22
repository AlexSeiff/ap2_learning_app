// Vite-Plugin: stellt die lokale API unter /api bereit (Inhalte, Fortschritt, KI).
// So startet die gesamte App mit einem einzigen `npm run dev`.

import type { IncomingMessage, ServerResponse } from 'node:http';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { checkProgressPut } from '../shared/progress';
import type { Content, TaskType } from '../shared/types';
import { aiEnabled, generateTasks, gradeAnswer, HttpError, MODEL } from './ai';
import { loadContent, SOURCE_DIR } from './loadContent';
import { backupInfo, readGenerated, readProgress, writeGenerated, writeProgress } from './store';

function contentWithGenerated(): Content {
  const content = loadContent();
  for (const task of readGenerated()) content.tasks[task.id] = task;
  return content;
}

async function readBody(req: IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, 'Ungültiges JSON im Request.');
  }
}

function send(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

export function apiPlugin(): Plugin {
  return {
    name: 'ap2-api',
    configureServer(server) {
      // Änderungen an den Lernblättern → Seite neu laden, Inhalte werden dabei neu importiert.
      server.watcher.add([join(SOURCE_DIR, '*.md'), join(SOURCE_DIR, '*Lernkarten*.json')]);
      server.watcher.on('change', (file) => {
        if (file.startsWith(SOURCE_DIR) && /\.(md|json)$/.test(file) && !file.includes('lern-app')) {
          server.ws.send({ type: 'full-reload' });
        }
      });

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        if (!url.pathname.startsWith('/api/')) return next();
        const route = `${req.method} ${url.pathname}`;
        try {
          if (route === 'GET /api/content') return send(res, 200, contentWithGenerated());
          if (route === 'GET /api/progress') return send(res, 200, readProgress());
          if (route === 'GET /api/progress/backups') return send(res, 200, backupInfo());
          if (route === 'PUT /api/progress') {
            // Nie ungeprüft schreiben: leere/kaputte Daten, ein versehentlich geleerter Stand oder ein veralteter Tab (409)
            // würden echten Fortschritt überschreiben. Lesen, Prüfen und Schreiben laufen synchron – also ohne Wettlauf zweier PUTs.
            const checked = checkProgressPut(await readBody(req), readProgress());
            if (!checked.ok) throw new HttpError(checked.status, checked.error);
            writeProgress(checked.progress);
            return send(res, 200, { ok: true, revision: checked.progress.revision });
          }
          if (route === 'GET /api/ai/status') return send(res, 200, { enabled: aiEnabled(), model: MODEL });
          if (route === 'POST /api/ai/generate') {
            const { topicId, count, types } = await readBody(req);
            const tasks = await generateTasks(contentWithGenerated(), String(topicId), Number(count) || 3, (types ?? []) as TaskType[]);
            writeGenerated([...readGenerated(), ...tasks]);
            return send(res, 200, tasks);
          }
          if (route === 'POST /api/ai/grade') {
            const { taskId, answer } = await readBody(req);
            const task = contentWithGenerated().tasks[String(taskId)];
            if (!task) throw new HttpError(404, 'Aufgabe nicht gefunden.');
            return send(res, 200, await gradeAnswer(task, String(answer ?? '')));
          }
          const del = /^DELETE \/api\/generated\/(.+)$/.exec(route);
          if (del) {
            const id = decodeURIComponent(del[1]);
            writeGenerated(readGenerated().filter((t) => t.id !== id));
            return send(res, 200, { ok: true });
          }
          send(res, 404, { error: `Unbekannte Route ${route}` });
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
