import type { Content, Topic } from '../../shared/types';
import { percent } from './grading';
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
      avgTaskPct: last.length ? percent(last.reduce((s, a) => s + a.points, 0), last.reduce((s, a) => s + a.max, 0)) : undefined,
      attempts: last.length,
      cardsTotal: cards.length,
      cardsKnown: cards.filter((c) => (progress.cards[c.id]?.box ?? 0) >= 3).length,
      lernzieleDone: topic.lernziele.filter((_, i) => progress.lernziele[`${topic.id}-${i}`]).length,
      openJournal: Object.values(progress.journal).filter((j) => !j.resolvedAt && content.tasks[j.taskId]?.topicId === topic.id).length,
    };
  });
}
