import { Link } from 'react-router-dom';
import { Markdown } from '../components/Markdown';
import { formatPoints, ihkGrade } from '../lib/grading';
import { isDue } from '../lib/progress';
import { daysUntilExam, isoWeek, topicStats } from '../lib/stats';
import { useStore } from '../lib/store';

const pct = (v?: number) => (v === undefined ? '–' : `${Math.round(v)} %`);

export function Dashboard() {
  const { content, progress } = useStore();
  const stats = topicStats(content, progress);
  const days = daysUntilExam();
  const kw = isoWeek();
  const week = content.weeks.find((w) => w.kw === kw) ?? content.weeks.find((w) => w.kw > kw);
  const dueJournal = Object.values(progress.journal).filter((j) => !j.resolvedAt && isDue(j.due)).length;
  const dueCards = content.flashcards.filter((c) => {
    const s = progress.cards[c.id];
    return !s || isDue(s.due);
  }).length;
  const finished = progress.exams.filter((e) => e.total !== undefined);
  const avgExam = finished.length ? finished.reduce((s, e) => s + (e.total! / e.max) * 100, 0) / finished.length : undefined;
  const weakest = stats
    .filter((s) => s.avgTaskPct !== undefined || s.lastExam !== undefined)
    .sort((a, b) => (a.lastExam ?? a.avgTaskPct!) - (b.lastExam ?? b.avgTaskPct!))
    .slice(0, 3);

  return (
    <div className="page">
      <h1>Übersicht</h1>
      <div className="kpis">
        <div className="kpi">
          <span className="kpi-value">{days > 0 ? days : days === 0 ? 'Heute!' : '–'}</span>
          <span className="kpi-label">{days > 0 ? 'Tage bis zur AP2 (25.11.2026)' : 'Prüfungstag'}</span>
        </div>
        <Link to="/fehlerjournal" className="kpi">
          <span className="kpi-value">{dueJournal}</span>
          <span className="kpi-label">Wiederholungen fällig</span>
        </Link>
        <Link to="/karteikarten" className="kpi">
          <span className="kpi-value">{dueCards}</span>
          <span className="kpi-label">Karteikarten fällig</span>
        </Link>
        <div className="kpi">
          <span className="kpi-value">{avgExam === undefined ? '–' : `${Math.round(avgExam)} %`}</span>
          <span className="kpi-label">
            Ø Übungsklausuren{avgExam !== undefined && ` · Note ${ihkGrade(avgExam).note}`}
          </span>
        </div>
      </div>

      {week && (
        <section className="card">
          <h2>
            Lernplan {week.kw === kw ? 'diese Woche' : 'als Nächstes'}: {week.label}
          </h2>
          <Markdown>{week.text}</Markdown>
          <Link to="/material/lernplan">Ganzen Lernplan öffnen →</Link>
        </section>
      )}

      {!!weakest.length && (
        <section className="card">
          <h2>Schwächste Themen</h2>
          <ul className="plain">
            {weakest.map((s) => (
              <li key={s.topic.id}>
                <Link to={`/lernen/${s.topic.id}`}>{s.topic.title}</Link> – {pct(s.lastExam ?? s.avgTaskPct)}{' '}
                <Link className="small" to={`/aufgaben?thema=${s.topic.id}`}>
                  Aufgaben üben
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <h2>Fortschritt je Thema</h2>
        <div className="table-wrap">
          <table className="stats">
            <thead>
              <tr>
                <th>Thema</th>
                <th>KW</th>
                <th>Klausur (bestes)</th>
                <th>Ø Aufgaben</th>
                <th>Karten sicher</th>
                <th>Lernziele</th>
                <th>Fehlerjournal</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.topic.id}>
                  <td>
                    <Link to={`/lernen/${s.topic.id}`}>
                      {s.topic.id === '00' ? '＋' : s.topic.number}. {s.topic.title}
                    </Link>
                  </td>
                  <td className="muted">{s.topic.week?.replace('KW ', '') ?? ''}</td>
                  <td>
                    <Bar value={s.bestExam} />
                  </td>
                  <td>
                    <Bar value={s.avgTaskPct} />
                    {s.attempts > 0 && <span className="muted small"> ({s.attempts})</span>}
                  </td>
                  <td>
                    {s.cardsKnown}/{s.cardsTotal}
                  </td>
                  <td>
                    {s.lernzieleDone}/{s.topic.lernziele.length}
                  </td>
                  <td>{s.openJournal || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint">
          „Ø Aufgaben" zählt jeweils deinen letzten Versuch je Aufgabe. Karten gelten ab Fach 3 als sicher. Ziel für die 1: ≥ 92 %.
        </p>
      </section>

      {!!finished.length && (
        <section className="card">
          <h2>Letzte Klausuren</h2>
          <ul className="plain">
            {finished.slice(-5).reverse().map((e) => {
              const t = content.topics.find((x) => x.id === e.topicId);
              const p = (e.total! / e.max) * 100;
              return (
                <li key={e.id}>
                  {new Date(e.finishedAt ?? e.startedAt).toLocaleDateString('de-DE')} · {t?.title} ·{' '}
                  <b>
                    {formatPoints(e.total!)} / {formatPoints(e.max)} P
                  </b>{' '}
                  · Note {ihkGrade(p).note}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function Bar({ value }: { value?: number }) {
  if (value === undefined) return <span className="muted">–</span>;
  const cls = value >= 92 ? 'good' : value >= 67 ? 'mid' : 'low';
  return (
    <span className="bar" title={`${Math.round(value)} %`}>
      <span className={`bar-fill ${cls}`} style={{ width: `${Math.min(100, value)}%` }} />
      <span className="bar-label">{Math.round(value)} %</span>
    </span>
  );
}
