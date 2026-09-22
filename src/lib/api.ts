import type { ApiResponses, GenerateRequest, GradeRequest, SaveProgressRequest } from '../../shared/api';
import type { TaskType } from '../../shared/types';
import { ApiError } from './apiError';
import { createStaticApi } from './staticApi';

export { ApiError };
export { AI_UNAVAILABLE } from './staticApi';

/**
 * Statische Version für GitHub Pages (`npm run build:pages` = `vite build --mode pages`)?
 * Dann gibt es keinen Server: Inhalte aus content.json, Fortschritt im localStorage, keine KI.
 * Vite ersetzt MODE beim Build durch einen festen Wert – der nicht benutzte Zweig fällt aus dem Bundle.
 */
export const IS_STATIC = import.meta.env.MODE === 'pages';

/** Woher die App Inhalte und Fortschritt bekommt: lokaler Server (/api/…) oder Browser (staticApi.ts). */
export interface DataSource {
  content(): Promise<ApiResponses['GET /api/content']>;
  progress(): Promise<ApiResponses['GET /api/progress']>;
  saveProgress(p: SaveProgressRequest): Promise<ApiResponses['PUT /api/progress']>;
  /** Letztes Speichern beim Schließen des Tabs – muss das Entladen der Seite überleben. */
  saveProgressOnUnload(p: SaveProgressRequest): void;
  backups(): Promise<ApiResponses['GET /api/progress/backups']>;
  aiStatus(): Promise<ApiResponses['GET /api/ai/status']>;
  generate(topicId: string, count: number, types: TaskType[]): Promise<ApiResponses['POST /api/ai/generate']>;
  grade(taskId: string, answer: string): Promise<ApiResponses['POST /api/ai/grade']>;
  deleteGenerated(id: string): Promise<ApiResponses['DELETE /api/generated/:id']>;
  /** Meldet, wenn ein anderer Tab gespeichert hat; liefert die Abmelde-Funktion. Mit Server merkt das erst der 409 beim Speichern. */
  watchOtherTabs(onChange: () => void): () => void;
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? `Fehler ${res.status}`);
  return data as T;
}

// Antworttypen je Route: shared/api.ts (ApiResponses) – dieselben Typen nutzt der Server.
const serverApi: DataSource = {
  content: () => request('GET', '/api/content'),
  progress: () => request('GET', '/api/progress'),
  saveProgress: (p) => request('PUT', '/api/progress', p),
  // keepalive überlebt das Entladen der Seite.
  saveProgressOnUnload: (p) => {
    fetch('/api/progress', { method: 'PUT', body: JSON.stringify(p), keepalive: true, headers: { 'Content-Type': 'application/json' } });
  },
  backups: () => request('GET', '/api/progress/backups'),
  aiStatus: () => request('GET', '/api/ai/status'),
  generate: (topicId, count, types) => request('POST', '/api/ai/generate', { topicId, count, types } satisfies GenerateRequest),
  grade: (taskId, answer) => request('POST', '/api/ai/grade', { taskId, answer } satisfies GradeRequest),
  deleteGenerated: (id) => request('DELETE', `/api/generated/${encodeURIComponent(id)}`),
  watchOtherTabs: () => () => {},
};

export const api: DataSource = IS_STATIC ? createStaticApi() : serverApi;
