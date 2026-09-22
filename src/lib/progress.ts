// Lernfortschritt: Datenmodell und reine Update-Funktionen (Fehlerjournal, Karteikarten).

export type Mode = 'klausur' | 'einzel' | 'wiederholung';
export type Rating = 'gewusst' | 'unsicher' | 'nicht';

export interface Attempt {
  taskId: string;
  date: string;
  points: number;
  max: number;
  mode: Mode;
}

export interface ExamRun {
  id: string;
  topicId: string;
  startedAt: string;
  submittedAt?: string;
  finishedAt?: string;
  answers: Record<string, string>;
  scores: Record<string, number>;
  total?: number;
  max: number;
}

export interface CardState {
  box: number;
  due: string;
  reviews: number;
  last?: Rating;
}

export interface JournalEntry {
  taskId: string;
  addedAt: string;
  /** 0 = Wiederholung nach 1 Tag, 1 = nach 3 Tagen, 2 = nach 7 Tagen. */
  stage: number;
  due: string;
  lastPoints: number;
  max: number;
  resolvedAt?: string;
}

export interface Progress {
  version: 1;
  attempts: Attempt[];
  exams: ExamRun[];
  activeExam?: ExamRun;
  cards: Record<string, CardState>;
  journal: Record<string, JournalEntry>;
  lernziele: Record<string, boolean>;
}

export const emptyProgress = (): Progress => ({
  version: 1,
  attempts: [],
  exams: [],
  cards: {},
  journal: {},
  lernziele: {},
});

/** Wiederholungsabstände im Fehlerjournal (Tage) je Stufe. */
export const JOURNAL_INTERVALS = [1, 3, 7];
/** Abstände für Karteikarten-Fächer 1–5 (Tage bis zur nächsten Abfrage). */
export const CARD_INTERVALS = [0, 1, 3, 7, 14, 30];

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
