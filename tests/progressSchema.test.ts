import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkProgressPut, isSuspiciousAttemptDrop, ProgressSchema } from '../shared/progressSchema';
import { emptyProgress, recordAttempt } from '../src/lib/progress';

const withAttempts = (n: number) => {
  let p = emptyProgress();
  for (let i = 0; i < n; i++) p = recordAttempt(p, { taskId: `01-A${i}`, date: '2026-09-21', points: 1, max: 1, mode: 'einzel' }, '2026-09-21');
  return p;
};

describe('ProgressSchema', () => {
  it('akzeptiert einen leeren und einen gefüllten Fortschritt', () => {
    expect(ProgressSchema.safeParse(emptyProgress()).success).toBe(true);
    expect(ProgressSchema.safeParse(withAttempts(3)).success).toBe(true);
  });

  it('behält unbekannte Felder und ergänzt fehlende Sammlungen', () => {
    const parsed = ProgressSchema.parse({ version: 1, attempts: [], zukunft: 42 });
    expect(parsed).toMatchObject({ zukunft: 42, exams: [], cards: {}, journal: {}, lernziele: {} });
  });

  it('lehnt leere und kaputte Daten ab', () => {
    for (const body of [null, {}, [], 'x', { version: 1 }, { version: 1, attempts: 'nein' }, { version: 1, attempts: [{ taskId: 1 }] }]) {
      expect(ProgressSchema.safeParse(body).success).toBe(false);
    }
  });

  it('akzeptiert die echte data/fortschritt.json (nur lesend)', () => {
    const file = join(import.meta.dirname, '..', 'data', 'fortschritt.json');
    if (!existsSync(file)) return;
    const result = ProgressSchema.safeParse(JSON.parse(readFileSync(file, 'utf8')));
    expect(result.error?.issues ?? []).toEqual([]);
  });
});

describe('checkProgressPut', () => {
  it('lehnt ungültige Bodies mit deutscher Meldung ab', () => {
    const r = checkProgressPut({}, withAttempts(2));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/^Fortschritt nicht gespeichert: Die Daten sind ungültig \(Fehler bei /);
  });

  it('erlaubt normales Weiterlernen und einen ersten Stand ohne Datei', () => {
    expect(checkProgressPut(withAttempts(11), withAttempts(10)).ok).toBe(true);
    expect(checkProgressPut(withAttempts(0), null).ok).toBe(true);
  });

  it('lehnt deutlich weniger Versuche ohne reset ab', () => {
    const r = checkProgressPut(emptyProgress(), withAttempts(16));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('nur 0 statt 16 Versuche');
  });

  it('erlaubt das bewusste Zurücksetzen und speichert das reset-Flag nicht mit', () => {
    const r = checkProgressPut({ ...emptyProgress(), reset: true }, withAttempts(16));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.progress).not.toHaveProperty('reset');
  });

  it('Schwelle: mehr als 5 weniger oder weniger als die Hälfte', () => {
    expect(isSuspiciousAttemptDrop(10, 10)).toBe(false);
    expect(isSuspiciousAttemptDrop(10, 12)).toBe(false);
    expect(isSuspiciousAttemptDrop(20, 15)).toBe(false);
    expect(isSuspiciousAttemptDrop(20, 14)).toBe(true);
    expect(isSuspiciousAttemptDrop(4, 1)).toBe(true);
    expect(isSuspiciousAttemptDrop(4, 2)).toBe(false);
  });
});
