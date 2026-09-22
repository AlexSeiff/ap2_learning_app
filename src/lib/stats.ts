import type { Content, Topic } from '../../shared/types';
import { percent } from './grading';
import { addDays, localDate } from './progress';
import type { Progress } from '../../shared/progress';
import { EXAM_DATE } from '../../shared/config';

export function daysUntilExam(today = new Date()): number {
  const [y, m, d] = EXAM_DATE.split('-').map(Number);
  const exam = new Date(y, m - 1, d);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((exam.getTime() - start.getTime()) / 86_400_000);
}

/** ISO-Kalenderwoche. */
export function isoWeek(date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

export interface TopicStats {
  topic: Topic;
  bestExam?: number;
  lastExam?: number;
  avgTaskPct?: number;
  attempts: number;
  cardsTotal: number;
  cardsKnown: number;
  lernzieleDone: number;
  openJournal: number;
}

export function topicStats(content: Content, progress: Progress): TopicStats[] {
  return content.topics.map((topic) => {
    const exams = progress.exams.filter((e) => e.topicId === topic.id && e.total !== undefined);
    const examPcts = exams.map((e) => percent(e.total!, e.max));
    // Nur der jeweils letzte Versuch je Aufgabe zählt für den Durchschnitt → Fortschritt wird sichtbar.
    const lastByTask = new Map<string, { points: number; max: number }>();
    for (const a of progress.attempts) {
      if (content.tasks[a.taskId]?.topicId === topic.id) lastByTask.set(a.taskId, a);
    }
    const last = [...lastByTask.values()];
    const cards = content.flashcards.filter((c) => c.topicId === topic.id);
    return {
      topic,
      bestExam: examPcts.length ? Math.max(...examPcts) : undefined,
      lastExam: examPcts.length ? examPcts[examPcts.length - 1] : undefined,
      avgTaskPct: last.length
        ? percent(
            last.reduce((s, a) => s + a.points, 0),
            last.reduce((s, a) => s + a.max, 0),
          )
        : undefined,
      attempts: last.length,
      cardsTotal: cards.length,
      cardsKnown: cards.filter((c) => (progress.cards[c.id]?.box ?? 0) >= 3).length,
      lernzieleDone: topic.lernziele.filter((_, i) => progress.lernziele[`${topic.id}-${i}`]).length,
      openJournal: Object.values(progress.journal).filter((j) => !j.resolvedAt && content.tasks[j.taskId]?.topicId === topic.id).length,
    };
  });
}

/** Lokales Datum (YYYY-MM-DD) eines gespeicherten Zeitpunkts; reine Datumsangaben bleiben unverändert, Ungültiges → undefined. */
export function toLocalDay(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : localDate(d);
}

/**
 * Alle Tage (lokales Datum), an denen gelernt wurde: Aufgabenversuche (auch aus Klausuren und dem Fehlerjournal),
 * Klausuren (gestartet, abgegeben, abgeschlossen) und bewertete Karteikarten. Lernziele abhaken zählt nicht – dafür gibt es kein Datum.
 */
export function activityDays(progress: Progress): Set<string> {
  const days = new Set<string>();
  const add = (value: string | undefined) => {
    const day = toLocalDay(value);
    if (day) days.add(day);
  };
  for (const a of progress.attempts) add(a.date);
  for (const e of [...progress.exams, ...(progress.activeExam ? [progress.activeExam] : [])]) {
    add(e.startedAt);
    add(e.submittedAt);
    add(e.finishedAt);
  }
  for (const [day, count] of Object.entries(progress.cardReviewDays)) if (count > 0) add(day);
  return days;
}

export interface StudyStreak {
  /** Aufeinanderfolgende Lerntage bis heute – oder bis gestern, solange heute noch nichts gelernt wurde (die Serie reißt erst morgen). */
  current: number;
  /** Wurde heute schon gelernt? */
  today: boolean;
  /** Längste Serie überhaupt. */
  longest: number;
}

/** Lernserie aus activityDays(); `today` als lokales Datum, damit testbar. */
export function studyStreak(progress: Progress, today = localDate()): StudyStreak {
  const days = activityDays(progress);
  const learnedToday = days.has(today);
  let current = 0;
  for (let day = learnedToday ? today : addDays(today, -1); days.has(day); day = addDays(day, -1)) current++;

  let longest = 0;
  for (const day of days) {
    if (days.has(addDays(day, -1))) continue; // nur ab dem ersten Tag einer Serie zählen
    let length = 1;
    while (days.has(addDays(day, length))) length++;
    longest = Math.max(longest, length);
  }
  return { current, today: learnedToday, longest };
}

export interface ExamTrend {
  topic: Topic;
  /** Abgeschlossene Klausuren zu diesem Thema, älteste zuerst. */
  runs: { date: string; pct: number }[];
  /** Ergebnis der letzten Klausur in Prozent. */
  latest: number;
  /** Veränderung der letzten gegenüber der vorletzten Klausur in Prozentpunkten (erst ab zwei Klausuren). */
  delta?: number;
}

/** Klausurergebnisse je Thema im Zeitverlauf – nur Themen mit mindestens einer abgeschlossenen Klausur. */
export function examTrends(content: Content, progress: Progress): ExamTrend[] {
  const trends: ExamTrend[] = [];
  for (const topic of content.topics) {
    const runs = progress.exams
      .filter((e) => e.topicId === topic.id && typeof e.total === 'number' && e.max > 0)
      .map((e) => ({ date: e.finishedAt ?? e.submittedAt ?? e.startedAt, pct: percent(e.total!, e.max) }))
      .sort((a, b) => a.date.localeCompare(b.date));
    if (!runs.length) continue;
    const latest = runs[runs.length - 1].pct;
    const previous = runs.length > 1 ? runs[runs.length - 2].pct : undefined;
    trends.push({ topic, runs, latest, ...(previous !== undefined ? { delta: latest - previous } : {}) });
  }
  return trends;
}
