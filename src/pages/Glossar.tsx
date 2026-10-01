// Glossar (/material/glossar, ROADMAP 8.9): Fachbegriffe aus Wissenskarten und fetten Begriffen der Lernblätter,
// alphabetisch mit Buchstaben-Sprungleiste und Filter. Lazy geladen; Logik in src/lib/glossar.ts.

import { type MouseEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Markdown } from '../components/Markdown';
import { useStelle } from '../hooks/useStelle';
import { baueGlossar, glossarBuchstaben, type GlossarEintrag } from '../lib/glossar';
import { normalisiere } from '../lib/normalisiere';
import { useStore } from '../lib/store';

function springeZu(e: MouseEvent, id: string) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Glossar() {
  const { content } = useStore();
  const eintraege = useMemo(() => baueGlossar(content), [content]);
  const [filter, setFilter] = useState('');
  useStelle();
  const f = normalisiere(filter);
  const sichtbar = f ? eintraege.filter((e) => normalisiere(e.begriff).includes(f)) : eintraege;
  const buchstaben = glossarBuchstaben(sichtbar);
  const mitDefinition = eintraege.filter((e) => e.definition).length;

  return (
    <div className="page glossar">
      <p className="crumbs">
        <Link to="/material">Material</Link> / Glossar
      </p>
      <h1>📚 Glossar</h1>
      <p className="lead">
        {eintraege.length} Fachbegriffe aus den Wissenskarten und den fett gedruckten Begriffen der Lernblätter, {mitDefinition} davon mit
        Erklärung. Jeder Begriff führt zur Stelle im Lernblatt oder zur Karte.
      </p>
      <div className="glossar-filter">
        <input
          type="search"
          placeholder="Begriff filtern …"
          aria-label="Begriffe filtern"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        {f && (
          <span className="muted small">
            {sichtbar.length} von {eintraege.length}
          </span>
        )}
      </div>
      <nav className="glossar-abc" aria-label="Buchstaben">
        {buchstaben.map(({ buchstabe, anzahl }) =>
          anzahl ? (
            <a key={buchstabe} href={`#buchstabe-${buchstabe}`} onClick={(e) => springeZu(e, `buchstabe-${buchstabe}`)}>
              {buchstabe}
            </a>
          ) : (
            <span key={buchstabe} className="muted" aria-hidden="true">
              {buchstabe}
            </span>
          ),
        )}
      </nav>
      {!sichtbar.length && <p className="muted">Kein Begriff passt zu „{filter}“.</p>}
      {buchstaben
        .filter((b) => b.anzahl)
        .map(({ buchstabe }) => (
          <section key={buchstabe} id={`buchstabe-${buchstabe}`} className="glossar-gruppe">
            <h2>{buchstabe}</h2>
            <dl>
              {sichtbar
                .filter((e) => e.buchstabe === buchstabe)
                .map((e) => (
                  <GlossarZeile key={e.id} e={e} />
                ))}
            </dl>
          </section>
        ))}
    </div>
  );
}

function GlossarZeile({ e }: { e: GlossarEintrag }) {
  return (
    <div className="glossar-eintrag" id={`g-${e.id}`}>
      <dt>{e.begriff}</dt>
      <dd>
        {e.definition ? (
          <Markdown math={e.definition.includes('$')} source={false} className="glossar-def">
            {e.definition}
          </Markdown>
        ) : (
          <p className="muted small">Keine Erklärung im Material – schau an der Fundstelle nach.</p>
        )}
        <p className="glossar-quellen small">
          {e.quellen.map((q, i) => (
            <span key={q.link}>
              {i > 0 && ' · '}
              <Link to={q.link}>{q.titel}</Link>
            </span>
          ))}
        </p>
      </dd>
    </div>
  );
}
