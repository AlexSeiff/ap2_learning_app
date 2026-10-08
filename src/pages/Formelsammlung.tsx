// Formelsammlung (/material/formeln, ROADMAP 4.5): aus src/rechnen/formeln.ts erzeugt – derselben Quelle, die die
// Rechenwege der Rechenübungen nutzen. Lazy geladen (zieht KaTeX nach), druckbar.

import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Tex } from '../components/Rechenweg';
import { useStelle } from '../hooks/useStelle';
import { useStore } from '../lib/store';
import { type Formel, formelnNachThema, THEMA_NAMEN, uebungenLink } from '../rechnen/formeln';
import { Icon } from '../components/Icon';

/** Überschrift der Themengruppe: Titel des Lernblatts, sonst Kurzname. */
function themaTitel(thema: string, topics: { id: string; title: string }[]): string {
  return topics.find((t) => t.id === thema)?.title ?? `Deep Dive ${Number(thema)}: ${THEMA_NAMEN[thema] ?? ''}`.trim();
}

function FormelKarte({ formel, anzahl }: { formel: Formel; anzahl: number }) {
  return (
    <article className="formel" id={`formel-${formel.id}`}>
      <h3>{formel.name}</h3>
      <div className="formel-tex">
        <Tex tex={formel.latex} />
      </div>
      <p>{formel.erklaerung}</p>
      {formel.variablen.length > 0 && (
        <dl className="formel-variablen">
          {formel.variablen.map((v) => (
            <div key={v.symbol}>
              <dt>
                <Tex tex={v.symbol} />
              </dt>
              <dd>{v.bedeutung}</dd>
            </div>
          ))}
        </dl>
      )}
      {anzahl > 0 && (
        <Link className="formel-link no-print" to={uebungenLink(formel)}>
          <Icon name="calculator" /> {anzahl} {anzahl === 1 ? 'Rechenübung' : 'Rechenübungen'} →
        </Link>
      )}
    </article>
  );
}

export function Formelsammlung() {
  const { content } = useStore();
  useStelle();
  const gruppen = formelnNachThema();
  const anzahl = (f: Formel) => content.rechenUebungen.filter((u) => u.vorlage && f.vorlagen.includes(u.vorlage)).length;
  const gesamt = gruppen.reduce((s, g) => s + g.formeln.length, 0);

  return (
    <div className="page formelsammlung">
      <p className="crumbs no-print">
        <Link to="/material">Material</Link> / Formelsammlung
      </p>
      <h1>
        <Icon name="sigma" /> Formelsammlung
      </h1>
      <p className="lead">
        {gesamt} Formeln aus den Lernblättern, nach Thema. Dieselben Formeln stehen im Rechenweg der Rechenübungen – über den Link übst du
        sie direkt.
      </p>
      <div className="no-print formel-aktionen">
        <button type="button" onClick={() => window.print()}>
          <Icon name="printer" /> Drucken / Als PDF speichern
        </button>
      </div>
      <nav className="formel-inhalt no-print" aria-label="Themen">
        {gruppen.map((g) => (
          <a key={g.thema} href={`#thema-${g.thema}`} onClick={(e) => scrollZu(e, `thema-${g.thema}`)}>
            {THEMA_NAMEN[g.thema] ?? g.thema} ({g.formeln.length})
          </a>
        ))}
      </nav>
      {gruppen.map((g) => (
        <section key={g.thema} id={`thema-${g.thema}`} className="formel-gruppe">
          <h2>{themaTitel(g.thema, content.topics)}</h2>
          <div className="formel-raster">
            {g.formeln.map((f) => (
              <FormelKarte key={f.id} formel={f} anzahl={anzahl(f)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** Sprung zur Gruppe ohne den Hash zu ändern (die App nutzt den HashRouter). */
function scrollZu(e: MouseEvent, id: string) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
