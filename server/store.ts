import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Task } from '../shared/types';

export const DATA_DIR = join(import.meta.dirname, '..', 'data');
/** Anzahl der aufbewahrten Tagessicherungen in data/backups/. */
export const BACKUP_KEEP = 14;
const BACKUP_FILE = /^fortschritt-(\d{4}-\d{2}-\d{2})\.json$/;

export interface BackupInfo {
  /** Datum der neuesten Tagessicherung (YYYY-MM-DD) oder null. */
  newest: string | null;
  count: number;
}

function localDate(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Datenablage in einem Ordner – der Ordner ist injizierbar, damit Tests nie data/ berühren. */
export function createStore(dataDir = DATA_DIR) {
  const backupDir = join(dataDir, 'backups');

  function readJson<T>(file: string, fallback: T): T {
    const path = join(dataDir, file);
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
    const path = join(dataDir, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(`${path}.tmp`, JSON.stringify(data, null, 2), 'utf8');
    renameSync(`${path}.tmp`, path);
  }

  function listBackups(): string[] {
    if (!existsSync(backupDir)) return [];
    return readdirSync(backupDir)
      .filter((f) => BACKUP_FILE.test(f))
      .sort();
  }

  /**
   * Legt vor dem ersten Überschreiben eines Tages eine Kopie von fortschritt.json an
   * (also den Stand vom Tagesbeginn) und behält nur die letzten BACKUP_KEEP Tage.
   */
  function backupProgress(today = localDate()) {
    const source = join(dataDir, 'fortschritt.json');
    if (!existsSync(source)) return;
    const target = join(backupDir, `fortschritt-${today}.json`);
    if (existsSync(target)) return;
    mkdirSync(backupDir, { recursive: true });
    copyFileSync(source, target);
    const files = listBackups();
    for (const f of files.slice(0, Math.max(0, files.length - BACKUP_KEEP))) unlinkSync(join(backupDir, f));
  }

  function writeProgress(data: unknown, today = localDate()) {
    try {
      backupProgress(today);
    } catch (err) {
      // Eine fehlgeschlagene Sicherung darf das Speichern nicht verhindern.
      console.warn('[lern-app] Tagessicherung des Fortschritts fehlgeschlagen:', err);
    }
    writeJson('fortschritt.json', data);
  }

  function backupInfo(): BackupInfo {
    const files = listBackups();
    const newest = files.at(-1);
    return { newest: newest ? BACKUP_FILE.exec(newest)![1] : null, count: files.length };
  }

  return {
    dataDir,
    backupDir,
    readProgress: () => readJson<unknown>('fortschritt.json', null),
    writeProgress,
    backupInfo,
    readGenerated: () => readJson<Task[]>('generierte-aufgaben.json', []),
    writeGenerated: (tasks: Task[]) => writeJson('generierte-aufgaben.json', tasks),
  };
}

const store = createStore();

export const readProgress = store.readProgress;
export const writeProgress = (data: unknown) => store.writeProgress(data);
export const backupInfo = store.backupInfo;
export const readGenerated = store.readGenerated;
export const writeGenerated = store.writeGenerated;
