import { describe, expect, it } from 'vitest';
import type { Task } from '../shared/types';
import { autoGrade, ihkGrade, parseGermanNumber } from '../src/lib/grading';
import { emptyProgress } from '../shared/progress';
import { addDays, rateCard, recordAttempt } from '../src/lib/progress';
import { daysUntilExam, isoWeek } from '../src/lib/stats';

const T0 = '2026-09-21';
const attempt = (points: number, max = 10) => ({ taskId: '01-A1', date: T0, points, max, mode: 'einzel' as const });

describe('Fehlerjournal (1 · 3 · 7 Tage)', () => {
  it('nimmt Aufgaben unter voller Punktzahl auf, fällig morgen', () => {
    const p = recordAttempt(emptyProgress(), attempt(6), T0);
    expect(p.journal['01-A1']).toMatchObject({ stage: 0, due: '2026-09-22', lastPoints: 6 });
  });

  it('volle Punkte ohne Journaleintrag erzeugen keinen Eintrag', () => {
    expect(recordAttempt(emptyProgress(), attempt(10), T0).journal).toEqual({});
  });

  it('durchläuft 1 → 3 → 7 Tage und ist danach erledigt', () => {
    let p = recordAttempt(emptyProgress(), attempt(5), T0);
    p = recordAttempt(p, attempt(10), '2026-09-22');
    expect(p.journal['01-A1']).toMatchObject({ stage: 1, due: '2026-09-25' });
    p = recordAttempt(p, attempt(10), '2026-09-25');
    expect(p.journal['01-A1']).toMatchObject({ stage: 2, due: '2026-10-02' });
    p = recordAttempt(p, attempt(10), '2026-10-02');
    expect(p.journal['01-A1'].resolvedAt).toBe('2026-10-02');
    expect(p.attempts).toHaveLength(4);
  });

  it('ein Fehler setzt auf Stufe 0 zurück, behält aber das Aufnahmedatum', () => {
    let p = recordAttempt(emptyProgress(), attempt(5), T0);
    p = recordAttempt(p, attempt(10), '2026-09-22');
    p = recordAttempt(p, attempt(7), '2026-09-25');
    expect(p.journal['01-A1']).toMatchObject({ stage: 0, due: '2026-09-26', addedAt: T0 });
  });
});

describe('Karteikarten (Leitner)', () => {
  it('gewusst schiebt ins nächste Fach, nicht gewusst zurück in Fach 1', () => {
    let p = rateCard(emptyProgress(), 'k', 'gewusst', T0);
    expect(p.cards.k).toMatchObject({ box: 2, due: '2026-09-24', reviews: 1 });
    p = rateCard(p, 'k', 'gewusst', T0);
    expect(p.cards.k).toMatchObject({ box: 3, due: '2026-09-28' });
    p = rateCard(p, 'k', 'nicht', T0);
    expect(p.cards.k).toMatchObject({ box: 1, due: T0 });
  });
});

describe('Bewertung', () => {
  it('IHK-Notenschlüssel inkl. Grenzen', () => {
    expect([100, 92, 91.6, 91, 81, 80, 67, 66, 50, 49, 30, 29, 0].map((p) => ihkGrade(p).note)).toEqual([
      1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6,
    ]);
  });

  it('liest deutsche Zahlen', () => {
    expect(parseGermanNumber('1.234,5')).toBe(1234.5);
    expect(parseGermanNumber('12,5 %')).toBe(12.5);
    expect(parseGermanNumber('0.85')).toBe(0.85);
    expect(parseGermanNumber('1.000')).toBe(1000);
    expect(parseGermanNumber('abc')).toBeNull();
  });

  const base: Omit<Task, 'type' | 'auto'> = { id: 'g', code: 'K1', topicId: '01', block: 'KI', points: 4, markdown: '' };

  it('Multiple Choice zählt nur vollständig richtig', () => {
    const task: Task = { ...base, type: 'mc', auto: { options: ['a', 'b', 'c'], correct: [0, 2] } };
    expect(autoGrade(task, { kind: 'mc', selected: [2, 0] }).points).toBe(4);
    expect(autoGrade(task, { kind: 'mc', selected: [0] }).points).toBe(0);
  });

  it('Lückentext und Zuordnung anteilig, Umlaute/Groß-Klein egal', () => {
    const lt: Task = { ...base, type: 'lueckentext', auto: { blanks: ['Primärschlüssel', 'HAVING', 'n:m/m:n'] } };
    const r = autoGrade(lt, { kind: 'lueckentext', values: ['primaerschluessel', 'having', 'x'] });
    expect(r.details).toEqual([true, true, false]);
    expect(r.points).toBe(2.5);
    expect(autoGrade(lt, { kind: 'lueckentext', values: ['', '', 'm:n'] }).details[2]).toBe(true);

    const zu: Task = {
      ...base,
      type: 'zuordnung',
      auto: {
        pairs: [
          { left: 'a', right: '1' },
          { left: 'b', right: '2' },
        ],
      },
    };
    expect(autoGrade(zu, { kind: 'zuordnung', mapping: { 0: 0, 1: 0 } }).points).toBe(2);
  });

  it('Rechenaufgabe mit Toleranz', () => {
    const task: Task = { ...base, type: 'rechnen', auto: { numeric: { value: 0.8333, tolerance: 0.005 } } };
    expect(autoGrade(task, { kind: 'rechnen', value: '0,83' }).points).toBe(4);
    expect(autoGrade(task, { kind: 'rechnen', value: '0,82' }).points).toBe(0);
  });
});

describe('Datum', () => {
  it('addDays über Monatsgrenzen', () => {
    expect(addDays('2026-09-28', 7)).toBe('2026-10-05');
  });
  it('Countdown und Kalenderwoche', () => {
    expect(daysUntilExam(new Date(2026, 8, 21))).toBe(65);
    expect(isoWeek(new Date(2026, 8, 21))).toBe(39);
    expect(isoWeek(new Date(2026, 10, 25))).toBe(48);
  });
});
