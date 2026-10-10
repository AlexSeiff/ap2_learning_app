import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { quellenNachZiel } from '../../shared/quellen';
import { QuellenListe } from '../components/Quellen';
import { Markdown } from '../components/Markdown';
import { useLeseStelle } from '../hooks/useLeseStelle';
import { useStelle } from '../hooks/useStelle';
import { useStore } from '../lib/store';
import { useThemaTexte } from '../lib/texte';
import { cardPool } from '../lib/cards';
import { TheoryMarkdown } from '../components/TheoryMarkdown';
import type { Topic } from '../../shared/types';
import { Icon } from '../components/Icon';

/** „Deep Dive 3“ oder „Zusatz“ für das ältere SQL-Blatt. */
const topicLabel = (t: Pick<Topic, 'id' | 'number'>) => (t.id === '00' ? 'Zusatz' : `Deep Dive ${t.number}`);

export function Themen() {
  const { content, progress } = useStore();
  return (
    <div className="page">
      <h1>Lernen</h1>
      <p className="lead">
        Theorie aller Deep Dives – mit {progress.settings.prueferfragen ? 'Prüferfragen, ' : ''}Lernziel-Check und direktem Sprung in Übung
        und Klausur.
      </p>
      <div className="grid">
        {content.topics.map((t) => (
          <Link key={t.id} to={`/lernen/${t.id}`} className="tile">
            <span className="tile-num">{t.id === '00' ? '＋' : t.number}</span>
            <span className="tile-title">{t.title}</span>
            <span className="tile-meta">
              {topicLabel(t)} · {t.sections.length} Abschnitte
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
  const quellen = useMemo(() => quellenNachZiel(content.quellen), [content.quellen]);
  const topic = content.topics.find((t) => t.id === topicId);
  // Abschnittstexte kommen nachgeladen (lib/texte.ts); Sprung und Lesestelle erst, wenn sie im Bild stehen.
  const { topic: mitTexten, fehler } = useThemaTexte(topic);
  useStelle(!!mitTexten);
  useLeseStelle(mitTexten?.id, mitTexten?.sections.map((s) => s.id) ?? []);
  if (!topic)
    return (
      <div className="page">
        <h1>Thema nicht gefunden</h1>
      </div>
    );
  const cards = cardPool(content.flashcards, progress.settings).filter((c) => c.topicId === topic.id).length;

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
          <Link to="/lernen">Lernen</Link> / {topicLabel(topic)}
        </p>
        <h1>{topic.title}</h1>
        <div className="actions">
          {/* Nachschlagethemen ohne Übungsklausur (Glossar & Diagramme) haben auch keine Einzelaufgaben. */}
          {topic.exam && (
            <>
              <Link className="button" to={`/klausur/${topic.id}`}>
                <Icon name="file-pen-line" /> Übungsklausur
              </Link>
              <Link className="button secondary" to={`/aufgaben?thema=${topic.id}`}>
                Einzelaufgaben
              </Link>
            </>
          )}
          {cards > 0 && (
            <Link className="button secondary" to={`/karteikarten?thema=${topic.id}`}>
              <Icon name="layers" /> {cards} Karteikarten
            </Link>
          )}
        </div>
        {fehler && <p className="card warn">{fehler}</p>}
        {!mitTexten && !fehler && <p className="loading">Lädt …</p>}
        {mitTexten?.sections.map((s) => (
          <section key={s.id} id={s.id} className="theory">
            {s.level <= 1 ? <h2 className="part">{s.title}</h2> : s.level === 2 ? <h2>{s.title}</h2> : <h3>{s.title}</h3>}
            <TheoryMarkdown source={topic.file} markdown={s.markdown} prueferfragen={progress.settings.prueferfragen} />
            <QuellenListe quellen={quellen.get(`abschnitt:${s.id}`) ?? []} />
          </section>
        ))}
        {mitTexten && !!topic.lernziele.length && (
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
