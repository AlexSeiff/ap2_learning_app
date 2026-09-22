// Lernfortschritt: reine Update-Funktionen (Fehlerjournal, Klausur, Karteikarten). Das gespeicherte Datenmodell liegt in shared/progress.ts.

import { CARD_INTERVALS, JOURNAL_INTERVALS } from '../../shared/config';
import type { Attempt, ExamRun, Progress, Rating } from '../../shared/progress';
import type { Task } from '../../shared/types';

export function localDate(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return localDate(new Date(y, m - 1, d + days));
}

/**
 * Speichert einen Bearbeitungsversuch und pflegt das Fehlerjournal:
 * Unter voller Punktzahl → (zurück) auf Stufe 0, Wiederholung morgen.
 * Volle Punktzahl bei offenem Eintrag → nächste Stufe (3, dann 7 Tage); nach der 7-Tage-Wiederholung erledigt.
 */
export function recordAttempt(p: Progress, attempt: Attempt, today = localDate()): Progress {
  const journal = { ...p.journal };
  const entry = journal[attempt.taskId];
  const open = entry && !entry.resolvedAt;
  if (attempt.points < attempt.max) {
    journal[attempt.taskId] = {
      taskId: attempt.taskId,
      addedAt: open ? entry.addedAt : today,
      stage: 0,
      due: addDays(today, JOURNAL_INTERVALS[0]),
      lastPoints: attempt.points,
      max: attempt.max,
    };
  } else if (open) {
    const stage = entry.stage + 1;
    journal[attempt.taskId] =
      stage >= JOURNAL_INTERVALS.length
        ? { ...entry, stage, lastPoints: attempt.points, resolvedAt: today }
        : { ...entry, stage, due: addDays(today, JOURNAL_INTERVALS[stage]), lastPoints: attempt.points };
  }
  return { ...p, attempts: [...p.attempts, attempt], journal };
}

/** Überträgt eine bewertete Klausur in die Historie und alle Einzelergebnisse ins Fehlerjournal. */
export function finishExam(p: Progress, run: ExamRun, tasks: Task[], now = new Date().toISOString()): Progress {
  let next = p;
  for (const t of tasks) {
    next = recordAttempt(next, { taskId: t.id, date: now, points: run.scores[t.id] ?? 0, max: t.points, mode: 'klausur' });
  }
  const total = tasks.reduce((s, t) => s + (run.scores[t.id] ?? 0), 0);
  return { ...next, activeExam: undefined, exams: [...next.exams, { ...run, total, finishedAt: now }] };
}

/** Gibt die laufende Klausur ab. Eine bereits abgegebene behält ihren Zeitpunkt (Timer und StrictMode können doppelt auslösen). */
export function submitExam(p: Progress, now = new Date().toISOString()): Progress {
  if (!p.activeExam || p.activeExam.submittedAt) return p;
  return { ...p, activeExam: { ...p.activeExam, submittedAt: now } };
}

export function rateCard(p: Progress, cardId: string, rating: Rating, today = localDate()): Progress {
  const prev = p.cards[cardId] ?? { box: 1, due: today, reviews: 0 };
  const box = rating === 'gewusst' ? Math.min(prev.box + 1, 5) : rating === 'unsicher' ? Math.max(prev.box, 1) : 1;
  const days = rating === 'gewusst' ? CARD_INTERVALS[box] : rating === 'unsicher' ? 1 : 0;
  return {
    ...p,
    cards: { ...p.cards, [cardId]: { box, due: addDays(today, days), reviews: prev.reviews + 1, last: rating } },
  };
}

export const isDue = (due: string, today = localDate()) => due <= today;
