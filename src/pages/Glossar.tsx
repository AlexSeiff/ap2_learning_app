// Glossar (/glossar, ROADMAP 8.9; früher /material/glossar): Fachbegriffe aus Begriffs- und Wissenskarten und fetten Begriffen der Lernblätter,
// alphabetisch mit Buchstaben-Sprungleiste und Filter. Lazy geladen; Logik in src/lib/glossar.ts.

import { type MouseEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Markdown } from '../components/Markdown';
import { useStelle } from '../hooks/useStelle';
import { begriffPfad, seitenFinder } from '../lib/begriffe';
import { baueGlossar, glossarBuchstaben, type GlossarEintrag } from '../lib/glossar';
import { normalisiere } from '../lib/normalisiere';
import { useStore } from '../lib/store';
import { Icon } from '../components/Icon';

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
  const begriffskarten = content.flashcards.filter((c) => c.typ === 'begriff').length;
  const seiteZu = useMemo(() => seitenFinder(content.begriffe ?? []), [content]);
  const seitenZahl = content.begriffe?.length ?? 0;

  return (
    <div className="page glossar">
      <h1>
        <Icon name="library" /> Glossar
      </h1>
      <p className="lead">
        {eintraege.length} Fachbegriffe aus den Begriffs- und Wissenskarten und den fett gedruckten Begriffen der Lernblätter,{' '}
        {mitDefinition} davon mit Erklärung
        {seitenZahl > 0 && `, ${seitenZahl} mit eigener Begriffsseite (Erklärung, Beispiel, Abgrenzung, Prüfungsfalle, Übungen)`}. Jeder
        Begriff führt zur Stelle im Lernblatt oder zur Karte.
      </p>
      {begriffskarten > 0 && (
        <p>
          <Link to="/karteikarten?typ=begriff">
            <Icon name="layers" /> {begriffskarten} Begriffskarten lernen
          </Link>{' '}
          ·{' '}
          <Link to="/karteikarten?typ=begriff&blaettern=1">
            <Icon name="book-open" /> durchblättern
          </Link>
          <span className="muted small"> – Vorderseite Begriff, Rückseite Erklärung, mit Wiederholung wie alle Karteikarten.</span>
        </p>
      )}
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
                  <GlossarZeile key={e.id} e={e} seite={seiteZu(e)} />
                ))}
            </dl>
          </section>
        ))}
    </div>
  );
}

function GlossarZeile({ e, seite }: { e: GlossarEintrag; seite?: string }) {
  return (
    <div className="glossar-eintrag" id={`g-${e.id}`}>
      <dt>
        {seite ? (
          <Link to={begriffPfad(seite)} className="glossar-seite-link">
            {e.begriff} <Icon name="chevron-right" />
          </Link>
        ) : (
          e.begriff
        )}
      </dt>
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
              <Link to={q.link}>
                <Icon name={q.art === 'karte' ? 'layers' : 'book-open'} /> {q.titel}
              </Link>
            </span>
          ))}
        </p>
      </dd>
    </div>
  );
}
