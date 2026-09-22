import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Task } from '../shared/types';

export const DATA_DIR = join(import.meta.dirname, '..', 'data');

function readJson<T>(file: string, fallback: T): T {
  const path = join(DATA_DIR, file);
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch {
    // Beschädigte Datei nicht überschreiben, sondern sichern und neu beginnen.
    renameSync(path, `${path}.defekt-${Date.now()}`);
    return fallback;
  }
}

/** Schreibt atomar (erst Temp-Datei, dann umbenennen), damit ein Absturz keine halbe Datei hinterlässt. */
function writeJson(file: string, data: unknown) {
  const path = join(DATA_DIR, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(`${path}.tmp`, JSON.stringify(data, null, 2), 'utf8');
  renameSync(`${path}.tmp`, path);
}

export const readProgress = () => readJson<unknown>('fortschritt.json', null);
export const writeProgress = (data: unknown) => writeJson('fortschritt.json', data);

export const readGenerated = () => readJson<Task[]>('generierte-aufgaben.json', []);
export const writeGenerated = (tasks: Task[]) => writeJson('generierte-aufgaben.json', tasks);
