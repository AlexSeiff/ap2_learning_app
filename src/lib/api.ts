import type { ApiResponses, GenerateRequest, GradeRequest, SaveProgressRequest } from '../../shared/api';
import type { TaskType } from '../../shared/types';

/** Fehler einer API-Anfrage mit HTTP-Status (z. B. 409, wenn ein anderer Tab neuer gespeichert hat). */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
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
export const api = {
  content: () => request<ApiResponses['GET /api/content']>('GET', '/api/content'),
  progress: () => request<ApiResponses['GET /api/progress']>('GET', '/api/progress'),
  saveProgress: (p: SaveProgressRequest) => request<ApiResponses['PUT /api/progress']>('PUT', '/api/progress', p),
  backups: () => request<ApiResponses['GET /api/progress/backups']>('GET', '/api/progress/backups'),
  aiStatus: () => request<ApiResponses['GET /api/ai/status']>('GET', '/api/ai/status'),
  generate: (topicId: string, count: number, types: TaskType[]) =>
    request<ApiResponses['POST /api/ai/generate']>('POST', '/api/ai/generate', { topicId, count, types } satisfies GenerateRequest),
  grade: (taskId: string, answer: string) =>
    request<ApiResponses['POST /api/ai/grade']>('POST', '/api/ai/grade', { taskId, answer } satisfies GradeRequest),
  deleteGenerated: (id: string) => request<ApiResponses['DELETE /api/generated/:id']>('DELETE', `/api/generated/${encodeURIComponent(id)}`),
};
