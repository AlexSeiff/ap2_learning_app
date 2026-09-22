import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { ExamRun, Progress } from '../../shared/progress';
import type { Task, Topic } from '../../shared/types';
import { AnswerInput } from '../components/AnswerInput';
import { Markdown } from '../components/Markdown';
import { Attachments, GradePanel, TaskText } from '../components/TaskParts';
import { formatPoints, ihkGrade, percent } from '../lib/grading';
import { recordAttempt } from '../lib/progress';
import { useStore } from '../lib/store';
import { EXAM_MINUTES } from '../../shared/config';

export function KlausurAuswahl() {
  const { content, progress } = useStore();
  const active = progress.activeExam;
  const activeTopic = active && content.topics.find((t) => t.id === active.topicId);
  return (
    <div className="page">
      <h1>Übungsklausur</h1>
      <p className="lead">
        90 Minuten, 100 Punkte, ohne Unterlagen – wie in der IHK-Prüfung. Die Musterlösungen bleiben gesperrt, bis du abgibst.
      </p>
      {activeTopic && (
        <div className="card warn">
          Laufende Klausur: <b>{activeTopic.title}</b> ({active.submittedAt ? 'abgegeben, Bewertung offen' : 'in Bearbeitung'}) –{' '}
          <Link to={`/klausur/${activeTopic.id}`}>fortsetzen →</Link>
        </div>
      )}
      <div className="grid">
        {content.topics.filter((t) => t.exam).map((t) => {
          const runs = progress.exams.filter((e) => e.topicId === t.id && e.total !== undefined);
          const best = runs.length ? Math.max(...runs.map((e) => percent(e.total!, e.max))) : undefined;
          return (
            <Link key={t.id} to={`/klausur/${t.id}`} className="tile">
              <span className="tile-num">{t.id === '00' ? '＋' : t.number}</span>
              <span className="tile-title">{t.title}</span>
              <span className="tile-meta">
                {runs.length ? `${runs.length}× geschrieben · bestes ${Math.round(best!)} % (Note ${ihkGrade(best!).note})` : 'noch nicht geschrieben'}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
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

export function Klausur() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { content, progress, update } = useStore();
  const topic = content.topics.find((t) => t.id === topicId);
  const run = progress.activeExam?.topicId === topicId ? progress.activeExam : undefined;
  const otherRun = progress.activeExam && !run ? progress.activeExam : undefined;
  const [result, setResult] = useState<ExamRun | null>(null);
  const now = useNow(!!run && !run.submittedAt);

  const deadline = run ? new Date(run.startedAt).getTime() + EXAM_MINUTES * 60_000 : 0;
  const remaining = Math.max(0, deadline - now);

  // Zeit abgelaufen → automatisch abgeben (wie in der echten Prüfung).
  useEffect(() => {
    if (run && !run.submittedAt && remaining === 0) {
      update((p) => (p.activeExam ? { ...p, activeExam: { ...p.activeExam, submittedAt: new Date().toISOString() } } : p));
    }
  }, [run, remaining, update]);

  if (!topic?.exam) return <div className="page"><h1>Keine Klausur für dieses Thema</h1></div>;
  const exam = topic.exam;
  const tasks = exam.blocks.flatMap((b) => b.taskIds.map((id) => content.tasks[id])).filter(Boolean);

  if (result) return <ExamResult topic={topic} run={result} />;
  const traps = content.flashcards.filter((c) => c.topicId === topic.id && c.typ === 'falle').length;

  if (!run) {
    return (
      <div className="page narrow">
        <p className="crumbs"><Link to="/klausur">Übungsklausur</Link></p>
        <h1>{exam.title}</h1>
        <p className="lead">Deep Dive {topic.number}: {topic.title}</p>
        {exam.intro && <Markdown>{exam.intro}</Markdown>}
        <ul className="plain">
          {exam.blocks.map((b) => (
            <li key={b.letter}>
              Block {b.letter} – {b.title} <span className="muted">({formatPoints(b.points)} P, {b.taskIds.length} Aufgaben)</span>
            </li>
          ))}
        </ul>
        {otherRun && (
          <p className="card warn">
            Es läuft noch eine andere Klausur. Beim Start hier wird sie verworfen.
          </p>
        )}
        <div className="actions">
          <button
            type="button"
            onClick={() => {
              if (otherRun && !confirm('Die andere laufende Klausur wird verworfen. Fortfahren?')) return;
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
            }}
          >
            ▶ Klausur starten ({EXAM_MINUTES} min)
          </button>
          {traps > 0 && (
            <Link className="button secondary" to={`/karteikarten?thema=${topic.id}&typ=falle`} title="Typische Prüfungsfehler vor der Klausur wiederholen">
              ⚠️ {traps} Fallen-Karten vorher
            </Link>
          )}
          <Link className="button secondary" to={`/druck?art=aufgaben&thema=${topic.id}`}>🖨️ Aufgabenblatt (PDF)</Link>
          <Link className="button secondary" to={`/druck?art=loesungen&thema=${topic.id}`}>🖨️ Lösungsblatt (PDF)</Link>
        </div>
        <p className="hint">Tipp: Aufgabenblatt ausdrucken, handschriftlich lösen und danach hier nur noch die Punkte eintragen – so trainierst du wie in der Prüfung.</p>
      </div>
    );
  }

  const setAnswer = (taskId: string, value: string) =>
    update((p) => (p.activeExam ? { ...p, activeExam: { ...p.activeExam, answers: { ...p.activeExam.answers, [taskId]: value } } } : p));
  const setScore = (taskId: string, value: number) =>
    update((p) => (p.activeExam ? { ...p, activeExam: { ...p.activeExam, scores: { ...p.activeExam.scores, [taskId]: value } } } : p));

  const submitted = !!run.submittedAt;
  const answered = tasks.filter((t) => run.answers[t.id]?.trim()).length;
  const scored = tasks.filter((t) => run.scores[t.id] !== undefined).length;
  const sum = tasks.reduce((s, t) => s + (run.scores[t.id] ?? 0), 0);
  const mm = Math.floor(remaining / 60_000);
  const ss = Math.floor((remaining % 60_000) / 1000);

  return (
    <div className="page exam">
      <div className="exam-bar">
        <b>{exam.title}</b>
        {!submitted ? (
          <>
            <span className={`timer ${remaining < 10 * 60_000 ? 'low' : ''}`}>⏱ {String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}</span>
            <span className="muted">{answered}/{tasks.length} beantwortet</span>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Klausur abgeben? ${tasks.length - answered} Aufgaben sind noch leer.`)) {
                  update((p) => (p.activeExam ? { ...p, activeExam: { ...p.activeExam, submittedAt: new Date().toISOString() } } : p));
                  window.scrollTo(0, 0);
                }
              }}
            >
              Abgeben
            </button>
          </>
        ) : (
          <>
            <span className="muted">Bewertet: {scored}/{tasks.length} · Zwischenstand {formatPoints(sum)} P</span>
            <button
              type="button"
              onClick={() => {
                const missing = tasks.length - scored;
                if (missing && !confirm(`${missing} Aufgaben sind noch nicht bewertet und zählen 0 Punkte. Abschließen?`)) return;
                const final: ExamRun = { ...run, scores: Object.fromEntries(tasks.map((t) => [t.id, run.scores[t.id] ?? 0])) };
                update((p) => finishExam(p, final, tasks));
                setResult({ ...final, total: Object.values(final.scores).reduce((a, b) => a + b, 0) });
                window.scrollTo(0, 0);
              }}
            >
              Bewertung abschließen
            </button>
          </>
        )}
        <button
          type="button"
          className="ghost"
          onClick={() => {
            if (confirm('Klausur abbrechen? Alle Antworten dieser Klausur werden verworfen.')) {
              update((p) => ({ ...p, activeExam: undefined }));
              navigate('/klausur');
            }
          }}
        >
          Abbrechen
        </button>
      </div>

      {submitted && (
        <div className="card info">
          <b>Lösungsblatt freigeschaltet.</b> Vergleiche jede Antwort mit der Musterlösung und vergib Punkte wie ein Prüfer –
          Kriterien abhaken, Punkte eintragen oder die KI-Bewertung nutzen.{' '}
          <Link to={`/druck?art=loesungen&thema=${topic.id}`}>Lösungsblatt drucken</Link>
        </div>
      )}

      <Attachments items={exam.attachments} open={!submitted} />

      {exam.blocks.map((b) => (
        <section key={b.letter} className="exam-block">
          <h2>
            Block {b.letter} – {b.title} <span className="muted">({formatPoints(b.points)} P)</span>
          </h2>
          {b.intro && <Markdown>{b.intro}</Markdown>}
          {b.taskIds.map((id) => {
            const task = content.tasks[id];
            if (!task) return null;
            return (
              <div key={id} className={`task-card ${submitted ? 'review' : ''}`}>
                <TaskText task={task} />
                <AnswerInput task={task} value={run.answers[id]} onChange={(v) => setAnswer(id, v)} disabled={submitted} />
                {submitted && (
                  <GradePanel task={task} answer={run.answers[id]} points={run.scores[id]} onPoints={(v) => setScore(id, v)} />
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}

function ExamResult({ topic, run }: { topic: Topic; run: ExamRun }) {
  const { content } = useStore();
  const total = run.total ?? 0;
  const pct = percent(total, run.max);
  const grade = ihkGrade(pct);
  const lost = Object.entries(run.scores)
    .map(([id, pts]) => ({ task: content.tasks[id], pts }))
    .filter((x) => x.task && x.pts < x.task.points);
  return (
    <div className="page narrow">
      <h1>Ergebnis: {topic.title}</h1>
      <div className={`result grade-${grade.note}`}>
        <span className="result-points">{formatPoints(total)} / {formatPoints(run.max)} P</span>
        <span className="result-grade">
          Note {grade.note} – {grade.label}
        </span>
      </div>
      <p>
        {pct >= 92
          ? 'Stark – das Thema sitzt auf Einser-Niveau.'
          : `Bis zur 1 fehlen dir ${formatPoints(Math.max(0, Math.ceil(0.92 * run.max) - total))} Punkte.`}{' '}
        {lost.length > 0 && `${lost.length} Aufgaben unter voller Punktzahl wurden ins Fehlerjournal übernommen (Wiederholung morgen, dann nach 3 und 7 Tagen).`}
      </p>
      {lost.length > 0 && (
        <ul className="plain">
          {lost.map(({ task, pts }) => (
            <li key={task.id}>
              <Link to={`/aufgabe/${task.id}`}>{task.code}</Link> – {formatPoints(pts)} / {formatPoints(task.points)} P
            </li>
          ))}
        </ul>
      )}
      <div className="actions">
        <Link className="button" to="/fehlerjournal">Zum Fehlerjournal</Link>
        <Link className="button secondary" to="/klausur">Weitere Klausur</Link>
      </div>
    </div>
  );
}
