import type { Content, Task, TaskType } from '../../shared/types';

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

export const api = {
  content: () => request<Content>('GET', '/api/content'),
  progress: () => request<unknown>('GET', '/api/progress'),
  saveProgress: (p: unknown) => request<{ ok: true; revision: number }>('PUT', '/api/progress', p),
  backups: () => request<{ newest: string | null; count: number }>('GET', '/api/progress/backups'),
  aiStatus: () => request<{ enabled: boolean; model: string }>('GET', '/api/ai/status'),
  generate: (topicId: string, count: number, types: TaskType[]) =>
    request<Task[]>('POST', '/api/ai/generate', { topicId, count, types }),
  grade: (taskId: string, answer: string) =>
    request<{ points: number; feedback: string; missing: string[] }>('POST', '/api/ai/grade', { taskId, answer }),
  deleteGenerated: (id: string) => request<{ ok: true }>('DELETE', `/api/generated/${encodeURIComponent(id)}`),
};
