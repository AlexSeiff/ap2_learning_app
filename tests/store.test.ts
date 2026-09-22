import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore } from '../server/store';

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'lern-app-store-'));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8'));

describe('Tagessicherung von fortschritt.json', () => {
  it('legt beim ersten Speichern keine Sicherung an, wenn noch keine Datei existiert', () => {
    const store = createStore(dir);
    store.writeProgress({ n: 1 }, '2026-09-22');
    expect(readJson(join(dir, 'fortschritt.json'))).toEqual({ n: 1 });
    expect(store.backupInfo()).toEqual({ newest: null, count: 0 });
  });

  it('sichert den Stand vom Tagesbeginn – höchstens eine Sicherung pro Tag', () => {
    const store = createStore(dir);
    store.writeProgress({ n: 1 }, '2026-09-21');
    store.writeProgress({ n: 2 }, '2026-09-22');
    store.writeProgress({ n: 3 }, '2026-09-22');
    expect(readdirSync(store.backupDir)).toEqual(['fortschritt-2026-09-22.json']);
    expect(readJson(join(store.backupDir, 'fortschritt-2026-09-22.json'))).toEqual({ n: 1 });
    expect(readJson(join(dir, 'fortschritt.json'))).toEqual({ n: 3 });
    expect(store.backupInfo()).toEqual({ newest: '2026-09-22', count: 1 });
  });

  it('behält nur die letzten 14 Tage', () => {
    const store = createStore(dir);
    store.writeProgress({ n: 0 }, '2026-08-31');
    for (let day = 1; day <= 20; day++) store.writeProgress({ n: day }, `2026-09-${String(day).padStart(2, '0')}`);
    const files = readdirSync(store.backupDir).sort();
    expect(files).toHaveLength(14);
    expect(files[0]).toBe('fortschritt-2026-09-07.json');
    expect(store.backupInfo()).toEqual({ newest: '2026-09-20', count: 14 });
  });

  it('speichert trotzdem, wenn die Sicherung fehlschlägt', () => {
    const store = createStore(dir);
    store.writeProgress({ n: 1 }, '2026-09-21');
    // Eine Datei mit dem Namen des Sicherungsordners verhindert das Anlegen von backups/.
    writeFileSync(store.backupDir, 'kein Ordner');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    store.writeProgress({ n: 2 }, '2026-09-22');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
    expect(readJson(join(dir, 'fortschritt.json'))).toEqual({ n: 2 });
    expect(existsSync(join(dir, 'fortschritt.json.tmp'))).toBe(false);
  });
});
