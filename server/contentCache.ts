// Zwischenspeicher für die geparsten Lernblätter: Lesen + Parsen aller Markdown-Dateien kostet bei jedem Request Zeit.
// Der Datei-Watcher im apiPlugin leert den Cache, sobald sich ein Lernblatt ändert.

import type { Content, Task } from '../shared/types';

export interface ContentCache {
  /** Geparste Inhalte; beim ersten Aufruf (bzw. nach invalidate) wird `load` ausgeführt. Nicht verändern! */
  get(): Content;
  invalidate(): void;
}

export function createContentCache(load: () => Content): ContentCache {
  let cached: Content | undefined;
  return {
    get: () => (cached ??= load()),
    invalidate: () => {
      cached = undefined;
    },
  };
}

/** Generierte Aufgaben dazumischen – als Kopie, das (gecachte) Original bleibt unverändert. */
export function withGenerated(content: Content, generated: Task[]): Content {
  if (generated.length === 0) return content;
  const tasks = { ...content.tasks };
  for (const task of generated) tasks[task.id] = task;
  return { ...content, tasks };
}
