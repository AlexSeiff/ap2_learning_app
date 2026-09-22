import { existsSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore, RENAME_RETRY_DELAYS_MS, renameWithRetry } from '../server/store';

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

describe('renameWithRetry (OneDrive-Sperren)', () => {
  const locked = (code: string) => Object.assign(new Error(code), { code });

  it('wiederholt bei EPERM/EBUSY/EACCES und hat dann Erfolg', () => {
    const calls: string[] = [];
    const sleeps: number[] = [];
    const errors = [locked('EPERM'), locked('EBUSY'), locked('EACCES')];
    renameWithRetry(
      'a',
      'b',
      (from, to) => {
        calls.push(`${from}->${to}`);
        const err = errors.shift();
        if (err) throw err;
      },
      (ms) => sleeps.push(ms),
    );
    expect(calls).toHaveLength(4);
    expect(sleeps).toEqual(RENAME_RETRY_DELAYS_MS.slice(0, 3));
  });

  it('gibt nach 5 Versuchen (~500 ms) mit deutscher Meldung auf und loggt', () => {
    let calls = 0;
    const sleeps: number[] = [];
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      renameWithRetry(
        'a',
        'b',
        () => {
          calls++;
          throw locked('EBUSY');
        },
        (ms) => sleeps.push(ms),
      ),
    ).toThrow(/gesperrt/);
    expect(error).toHaveBeenCalledOnce();
    error.mockRestore();
    expect(calls).toBe(5);
    expect(sleeps.reduce((a, b) => a + b, 0)).toBe(500);
  });

  it('wiederholt andere Fehler nicht', () => {
    let calls = 0;
    expect(() =>
      renameWithRetry(
        'a',
        'b',
        () => {
          calls++;
          throw locked('ENOENT');
        },
        () => {},
      ),
    ).toThrow('ENOENT');
    expect(calls).toBe(1);
  });

  it('wartet mit der echten Schlaf-Funktion tatsächlich', () => {
    const src = join(dir, 'x.tmp');
    writeFileSync(src, '1');
    let first = true;
    const start = Date.now();
    renameWithRetry(src, join(dir, 'x.json'), (from, to) => {
      if (first) {
        first = false;
        throw locked('EPERM');
      }
      renameSync(from, to);
    });
    expect(Date.now() - start).toBeGreaterThanOrEqual(40);
    expect(existsSync(join(dir, 'x.json'))).toBe(true);
  });
});
