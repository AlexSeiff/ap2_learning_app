import { describe, expect, it } from 'vitest';
import { emptyProgress, ProgressSchema } from '../shared/progress';
import { addDays } from '../src/lib/progress';
import { rechenStatus, rechenSummary, recordRechenCheck, recordRechenHint, recordRechenLoesung, setRechenSeed } from '../src/lib/rechnen';
import { activityDays, studyStreak } from '../src/lib/stats';

const T0 = '2026-09-28';
const ID = 'RE-ST1-001';
const A = { mittel: '70', median: '55' };

describe('recordRechenCheck', () => {
  it('richtig beim ersten Mal → gelöst, keine Wiederholung, Antworten und Lerntag gespeichert', () => {
    const before = emptyProgress();
    const p = recordRechenCheck(before, ID, true, A, T0);
    expect(p.rechnen[ID]).toEqual({ attempts: 1, hintsUsed: 0, lastCheckedAt: T0, antworten: A, solvedAt: T0 });
    expect(p.rechnenDays).toEqual({ [T0]: 1 });
    expect(rechenStatus(p.rechnen[ID], T0)).toBe('geloest');
    expect(before).toEqual(emptyProgress());
    expect(ProgressSchema.safeParse(p).success).toBe(true);
  });

  it('falsch → Stufe 1, morgen fällig; Stufen 1 → 3 → 7 Tage, danach erledigt', () => {
    let p = recordRechenCheck(emptyProgress(), ID, false, A, T0);
    expect(p.rechnen[ID]).toMatchObject({ attempts: 1, stage: 1, due: addDays(T0, 1) });
    expect(rechenStatus(p.rechnen[ID], T0)).toBe('offen');
    expect(rechenStatus(p.rechnen[ID], addDays(T0, 1))).toBe('faellig');
    const d1 = addDays(T0, 1);
    p = recordRechenCheck(p, ID, true, A, d1);
    expect(p.rechnen[ID]).toMatchObject({ stage: 2, due: addDays(d1, 3), solvedAt: d1 });
    const d2 = addDays(d1, 3);
    p = recordRechenCheck(p, ID, true, A, d2);
    expect(p.rechnen[ID]).toMatchObject({ stage: 3, due: addDays(d2, 7) });
    p = recordRechenCheck(p, ID, true, A, addDays(d2, 7));
    expect(p.rechnen[ID].stage).toBeUndefined();
    expect(p.rechnen[ID].due).toBeUndefined();
    expect(rechenStatus(p.rechnen[ID], addDays(d2, 30))).toBe('geloest');
  });

  it('kürzt sehr lange Antworten', () => {
    const p = recordRechenCheck(emptyProgress(), ID, false, { x: '1'.repeat(1000) }, T0);
    expect(p.rechnen[ID].antworten?.x).toHaveLength(200);
  });
});

describe('Hinweise, Lösung, Seed', () => {
  it('Lösung gezeigt → „mit Lösung“, morgen fällig; danach richtig zählt nicht als gelöst', () => {
    let p = recordRechenHint(emptyProgress(), ID);
    expect(p.rechnen[ID]).toEqual({ attempts: 0, hintsUsed: 1 });
    p = recordRechenLoesung(p, ID, T0);
    expect(p.rechnen[ID]).toMatchObject({ solutionShown: true, stage: 1, due: addDays(T0, 1) });
    expect(rechenStatus(p.rechnen[ID], T0)).toBe('mit-loesung');
    p = recordRechenCheck(p, ID, true, A, T0);
    expect(p.rechnen[ID].solvedAt).toBeUndefined();
  });

  it('Neue Zahlen merken sich den Seed und verwerfen alte Antworten; Originalzahlen entfernen den Seed', () => {
    let p = recordRechenCheck(emptyProgress(), ID, false, A, T0);
    p = setRechenSeed(p, ID, 4711);
    expect(p.rechnen[ID].lastSeed).toBe(4711);
    expect(p.rechnen[ID].antworten).toBeUndefined();
    expect(p.rechnen[ID].attempts).toBe(1);
    p = setRechenSeed(p, ID, undefined);
    expect(p.rechnen[ID]).not.toHaveProperty('lastSeed');
    expect(ProgressSchema.safeParse(p).success).toBe(true);
  });
});

describe('rechenSummary und Lernserie', () => {
  it('zählt gelöste und fällige Übungen nur aus der gegebenen Liste', () => {
    let p = recordRechenCheck(emptyProgress(), 'a', true, {}, T0);
    p = recordRechenCheck(p, 'b', false, {}, T0);
    p = recordRechenCheck(p, 'alt', true, {}, T0);
    expect(rechenSummary(p, ['a', 'b', 'c'], addDays(T0, 1))).toEqual({ solved: 1, total: 3, due: 1 });
  });

  it('geprüfte Rechenübungen zählen als Lerntag', () => {
    const p = recordRechenCheck(emptyProgress(), ID, false, {}, T0);
    expect(activityDays(p).has(T0)).toBe(true);
    expect(studyStreak(p, T0)).toMatchObject({ current: 1, today: true });
  });
});
