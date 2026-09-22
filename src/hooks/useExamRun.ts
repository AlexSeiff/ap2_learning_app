import { useCallback, useEffect, useState } from 'react';
import { EXAM_MINUTES } from '../../shared/config';
import type { ExamRun } from '../../shared/progress';
import type { Task } from '../../shared/types';
import { finishExam, submitExam } from '../lib/progress';
import { useStore } from '../lib/store';

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
}

/**
 * Ablauf einer Übungsklausur: starten, beantworten, abgeben (auch automatisch bei Zeitablauf),
 * bewerten und abschließen. Rückfragen (confirm) und Navigation bleiben in der Seite.
 */
export function useExamRun(topicId: string | undefined) {
  const { content, progress, update } = useStore();
  const topic = content.topics.find((t) => t.id === topicId);
  const exam = topic?.exam;
  const tasks: Task[] = exam ? exam.blocks.flatMap((b) => b.taskIds.map((id) => content.tasks[id])).filter(Boolean) : [];
  const run = progress.activeExam?.topicId === topicId ? progress.activeExam : undefined;
  const otherRun = progress.activeExam && !run ? progress.activeExam : undefined;
  const [result, setResult] = useState<ExamRun | null>(null);
  const now = useNow(!!run && !run.submittedAt);

  const deadline = run ? new Date(run.startedAt).getTime() + EXAM_MINUTES * 60_000 : 0;
  const remaining = Math.max(0, deadline - now);

  // Zeit abgelaufen → automatisch abgeben (wie in der echten Prüfung). submitExam arbeitet auf dem aktuellen Stand, nicht auf `run`.
  useEffect(() => {
    if (run && !run.submittedAt && remaining === 0) update((p) => submitExam(p));
  }, [run, remaining, update]);

  const start = () => {
    if (!topic || !exam) return;
    update((p) => ({
      ...p,
      activeExam: {
        id: `ex-${Date.now().toString(36)}`,
        topicId: topic.id,
        startedAt: new Date().toISOString(),
        answers: {},
        scores: {},
        max: exam.totalPoints,
      },
    }));
  };

  const setAnswer = useCallback(
    (taskId: string, value: string) =>
      update((p) => (p.activeExam ? { ...p, activeExam: { ...p.activeExam, answers: { ...p.activeExam.answers, [taskId]: value } } } : p)),
    [update],
  );
  const setScore = useCallback(
    (taskId: string, value: number) =>
      update((p) => (p.activeExam ? { ...p, activeExam: { ...p.activeExam, scores: { ...p.activeExam.scores, [taskId]: value } } } : p)),
    [update],
  );

  const submit = () => update((p) => submitExam(p));

  /** Unbewertete Aufgaben zählen 0 Punkte; Ergebnis landet in der Historie und im Fehlerjournal. */
  const finish = () => {
    if (!run) return;
    const final: ExamRun = { ...run, scores: Object.fromEntries(tasks.map((t) => [t.id, run.scores[t.id] ?? 0])) };
    update((p) => finishExam(p, final, tasks));
    setResult({ ...final, total: Object.values(final.scores).reduce((a, b) => a + b, 0) });
  };

  const abort = () => update((p) => ({ ...p, activeExam: undefined }));

  const answered = run ? tasks.filter((t) => run.answers[t.id]?.trim()).length : 0;
  const scored = run ? tasks.filter((t) => run.scores[t.id] !== undefined).length : 0;
  const sum = run ? tasks.reduce((s, t) => s + (run.scores[t.id] ?? 0), 0) : 0;

  return {
    topic,
    exam,
    tasks,
    run,
    otherRun,
    result,
    submitted: !!run?.submittedAt,
    remaining,
    answered,
    scored,
    sum,
    start,
    setAnswer,
    setScore,
    submit,
    finish,
    abort,
  };
}
