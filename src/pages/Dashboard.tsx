import { Link } from 'react-router-dom';
import { Markdown } from '../components/Markdown';
import { formatPoints, ihkGrade } from '../lib/grading';
import { isDue } from '../lib/progress';
import { daysUntilExam, examTrends, isoWeek, studyStreak, topicStats } from '../lib/stats';
import { useStore } from '../lib/store';

const pct = (v?: number) => (v === undefined ? '–' : `${Math.round(v)} %`);

export function Dashboard() {
  const { content, progress } = useStore();
  const stats = topicStats(content, progress);
  const trends = examTrends(content, progress);
  const streak = studyStreak(progress);
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
          <span className="kpi-label">Ø Übungsklausuren{avgExam !== undefined && ` · Note ${ihkGrade(avgExam).note}`}</span>
        </div>
        <div className="kpi" title="Tage in Folge mit Aufgaben, Klausuren oder Karteikarten">
          <span className="kpi-value">
            {streak.current > 0 ? '🔥 ' : ''}
            {streak.current} {streak.current === 1 ? 'Tag' : 'Tage'}
          </span>
          <span className="kpi-label">
            Lernserie
            {streak.current > 0 && !streak.today && ' · heute noch lernen, sonst reißt sie'}
            {streak.longest > streak.current && ` · Rekord ${streak.longest}`}
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

      {!!trends.length && (
        <section className="card">
          <h2>Klausur-Trend je Thema</h2>
          <div className="table-wrap">
            <table className="stats">
              <thead>
                <tr>
                  <th>Thema</th>
                  <th>Verlauf</th>
                  <th>Letzte</th>
                  <th>Veränderung</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((t) => (
                  <tr key={t.topic.id}>
                    <td>
                      <Link to={`/klausur/${t.topic.id}`}>{t.topic.title}</Link>
                      <span className="muted small"> ({t.runs.length}×)</span>
                    </td>
                    <td>
                      <Sparkline values={t.runs.map((r) => r.pct)} />
                    </td>
                    <td>
                      <Bar value={t.latest} />
                    </td>
                    <td>
                      <Delta value={t.delta} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="hint">Veränderung: letzte gegenüber vorletzter Klausur zum selben Thema, in Prozentpunkten.</p>
        </section>
      )}

      {!!finished.length && (
        <section className="card">
          <h2>Letzte Klausuren</h2>
          <ul className="plain">
            {finished
              .slice(-5)
              .reverse()
              .map((e) => {
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

/** Mini-Verlauf der Klausurergebnisse (0–100 %) als Inline-SVG; die gestrichelte Linie markiert 50 % (bestanden). */
function Sparkline({ values }: { values: number[] }) {
  const w = 110;
  const h = 26;
  const pad = 3;
  const x = (i: number) => (values.length === 1 ? w / 2 : pad + (i * (w - 2 * pad)) / (values.length - 1));
  const y = (v: number) => pad + ((100 - Math.max(0, Math.min(100, v))) * (h - 2 * pad)) / 100;
  const label = `Klausurergebnisse: ${values.map((v) => `${Math.round(v)} %`).join(', ')}`;
  return (
    <svg className="sparkline" width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
      <title>{label}</title>
      <line className="sparkline-pass" x1={0} x2={w} y1={y(50)} y2={y(50)} />
      {values.length > 1 && <polyline points={values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />}
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={i === values.length - 1 ? 3 : 2} />
      ))}
    </svg>
  );
}

function Delta({ value }: { value?: number }) {
  if (value === undefined) return <span className="muted small">erst ab 2 Klausuren</span>;
  const rounded = Math.round(value);
  if (rounded === 0) return <span className="muted">± 0</span>;
  return (
    <span className={rounded > 0 ? 'ok' : 'bad'}>
      {rounded > 0 ? '▲ +' : '▼ −'}
      {Math.abs(rounded)} %-Pkt.
    </span>
  );
}
