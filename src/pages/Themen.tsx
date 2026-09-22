import { Link, useParams } from 'react-router-dom';
import { Markdown } from '../components/Markdown';
import { useStore } from '../lib/store';

export function Themen() {
  const { content } = useStore();
  return (
    <div className="page">
      <h1>Lernen</h1>
      <p className="lead">Theorie aller Deep Dives – mit Prüferfragen, Lernziel-Check und direktem Sprung in Übung und Klausur.</p>
      <div className="grid">
        {content.topics.map((t) => (
          <Link key={t.id} to={`/lernen/${t.id}`} className="tile">
            <span className="tile-num">{t.id === '00' ? '＋' : t.number}</span>
            <span className="tile-title">{t.title}</span>
            <span className="tile-meta">
              {t.week ?? 'Zusatz'} · {t.sections.length} Abschnitte
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Thema() {
  const { topicId } = useParams();
  const { content, progress, update } = useStore();
  const topic = content.topics.find((t) => t.id === topicId);
  if (!topic)
    return (
      <div className="page">
        <h1>Thema nicht gefunden</h1>
      </div>
    );
  const cards = content.flashcards.filter((c) => c.topicId === topic.id).length;

  return (
    <div className="page with-toc">
      <aside className="toc">
        <b>Inhalt</b>
        {topic.sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`toc-l${s.level}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {s.title}
          </a>
        ))}
        {!!topic.lernziele.length && (
          <a
            href="#lernziele"
            className="toc-l2"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('lernziele')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Lernziel-Check
          </a>
        )}
      </aside>
      <article>
        <p className="crumbs">
          <Link to="/lernen">Lernen</Link> / {topic.week ?? 'Zusatz'}
        </p>
        <h1>{topic.title}</h1>
        <div className="actions">
          {topic.exam && (
            <Link className="button" to={`/klausur/${topic.id}`}>
              📝 Übungsklausur
            </Link>
          )}
          <Link className="button secondary" to={`/aufgaben?thema=${topic.id}`}>
            Einzelaufgaben
          </Link>
          {cards > 0 && (
            <Link className="button secondary" to={`/karteikarten?thema=${topic.id}`}>
              🗂️ {cards} Karteikarten
            </Link>
          )}
        </div>
        {topic.sections.map((s) => (
          <section key={s.id} id={s.id} className="theory">
            {s.level <= 1 ? <h2 className="part">{s.title}</h2> : s.level === 2 ? <h2>{s.title}</h2> : <h3>{s.title}</h3>}
            <Markdown>{s.markdown}</Markdown>
          </section>
        ))}
        {!!topic.lernziele.length && (
          <section id="lernziele" className="card">
            <h2>Lernziel-Check</h2>
            {topic.lernziele.map((z, i) => {
              const key = `${topic.id}-${i}`;
              return (
                <label key={key} className="choice">
                  <input
                    type="checkbox"
                    checked={!!progress.lernziele[key]}
                    onChange={(e) => update((p) => ({ ...p, lernziele: { ...p.lernziele, [key]: e.target.checked } }))}
                  />
                  <Markdown className="inline">{z}</Markdown>
                </label>
              );
            })}
          </section>
        )}
      </article>
    </div>
  );
}
