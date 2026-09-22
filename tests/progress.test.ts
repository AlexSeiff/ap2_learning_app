import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  checkProgressPut,
  emptyProgress,
  isSuspiciousAttemptDrop,
  migrateProgress,
  PROGRESS_VERSION,
  ProgressPutSchema,
  ProgressSchema,
  type Progress,
} from '../shared/progress';
import { recordAttempt } from '../src/lib/progress';
import type { z } from 'zod';

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

  it('Typen und Schema passen zusammen: jeder Progress der App erfüllt das Schema', () => {
    // Wird von `npm run typecheck` geprüft – weicht ein Typ vom Schema ab, schlägt der Typcheck fehl.
    const asStored = (p: Progress): z.input<typeof ProgressSchema> => p;
    const asPut = (p: Progress): z.input<typeof ProgressPutSchema> => ({ ...p, reset: true });
    expect(ProgressSchema.safeParse(asStored(withAttempts(1))).success).toBe(true);
    expect(ProgressPutSchema.safeParse(asPut(withAttempts(1))).success).toBe(true);
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

describe('migrateProgress', () => {
  const fixture = (name: string) => JSON.parse(readFileSync(join(import.meta.dirname, 'fixtures', name), 'utf8'));

  it('übernimmt den aktuellen Stand (Kopie von data/fortschritt.json vom 22.09.2026) ohne Verlust', () => {
    const raw = fixture('fortschritt-v1-2026-09-22.json');
    const migrated = migrateProgress(raw);
    expect(migrated).toEqual(raw);
    expect(migrated.attempts).toHaveLength(16);
    expect(migrated.exams).toHaveLength(1);
    expect(Object.keys(migrated.cards)).toHaveLength(8);
    expect(Object.keys(migrated.journal)).toHaveLength(13);
    expect(ProgressSchema.safeParse(migrated).success).toBe(true);
  });

  it('bringt eine alte Datei ohne version und mit fehlenden Feldern auf das aktuelle Format', () => {
    const raw = fixture('fortschritt-alt-ohne-felder.json');
    const migrated = migrateProgress(raw);
    expect(migrated.version).toBe(PROGRESS_VERSION);
    // Alle Einträge bleiben erhalten, fehlende Felder werden ergänzt, unbekannte bleiben stehen.
    expect(migrated.attempts.map((a) => a.taskId)).toEqual(['01-A1', '02-B2', '03-C1']);
    expect(migrated.attempts[1]).toEqual({ taskId: '02-B2', date: '', points: 4, max: 4, mode: 'einzel' });
    expect(migrated.attempts[2]).toMatchObject({ mode: 'wiederholung', notiz: 'alt' });
    expect(migrated.exams[0]).toEqual({ ...raw.exams[0], answers: {} });
    expect(migrated.activeExam).toEqual({ ...raw.activeExam, scores: {} });
    expect(migrated.cards).toEqual({
      '01-pf1': { box: 3, due: '2026-08-10', reviews: 0 },
      '02-fg2': { box: 1, due: '2026-08-05', reviews: 2, last: 'unsicher' },
    });
    expect(migrated.journal['01-A1']).toEqual({ taskId: '01-A1', addedAt: '2026-08-01', stage: 0, due: '2026-08-02', lastPoints: 3, max: 6 });
    expect(migrated.lernziele).toEqual({ '01-1': true, '01-2': false });
    expect(ProgressSchema.safeParse(migrated).success).toBe(true);
  });

  it('ist idempotent und liefert für Unbrauchbares einen leeren Stand', () => {
    const once = migrateProgress(fixture('fortschritt-alt-ohne-felder.json'));
    expect(migrateProgress(once)).toEqual(once);
    for (const raw of [null, undefined, 'x', 42, []]) expect(migrateProgress(raw)).toEqual(emptyProgress());
  });

  it('verwirft nur Einträge, die sich nicht zuordnen lassen, und Felder mit falschem Typ', () => {
    const migrated = migrateProgress({
      version: 1,
      attempts: [{ points: 1 }, 'x', { taskId: '01-A1', points: 1, max: 1, mode: 'einzel', date: 'd' }],
      exams: [null, { id: 'e', topicId: '01', startedAt: 's', submittedAt: null, max: 1, answers: {}, scores: {} }],
      cards: { a: 'kaputt', b: { box: 2, due: 'd', reviews: 1, last: 7 } },
      lernziele: { x: 'ja', y: true },
    });
    expect(migrated.attempts).toHaveLength(1);
    expect(migrated.exams).toEqual([{ id: 'e', topicId: '01', startedAt: 's', max: 1, answers: {}, scores: {} }]);
    expect(migrated.cards).toEqual({ b: { box: 2, due: 'd', reviews: 1 } });
    expect(migrated.lernziele).toEqual({ y: true });
    expect(ProgressSchema.safeParse(migrated).success).toBe(true);
  });

  it('lädt die echte data/fortschritt.json ohne Verlust (nur lesend)', () => {
    const file = join(import.meta.dirname, '..', 'data', 'fortschritt.json');
    if (!existsSync(file)) return;
    const raw = JSON.parse(readFileSync(file, 'utf8'));
    const migrated = migrateProgress(raw);
    expect(migrated.attempts).toEqual(raw.attempts);
    expect(migrated.exams).toEqual(raw.exams ?? []);
    expect(migrated.cards).toEqual(raw.cards ?? {});
    expect(migrated.journal).toEqual(raw.journal ?? {});
    expect(migrated.lernziele).toEqual(raw.lernziele ?? {});
  });
});
