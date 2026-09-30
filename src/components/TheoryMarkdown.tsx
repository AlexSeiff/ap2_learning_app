import { splitPrueferfragen, stripPrueferfragen, type TheorySegment } from '../../shared/prueferfragen';
import { Markdown } from './Markdown';

type Prueferfrage = Extract<TheorySegment, { type: 'prueferfrage' }>;

/**
 * Theorie-Abschnitt in „Lernen“. Prüferfragen erscheinen als Box, deren Antwort erst auf Klick aufgeht (aktives Erinnern statt Mitlesen).
 * Sind die Prüferfragen ausgeschaltet, fallen ihre Zitatblöcke (Frage und Antwort) ganz weg.
 */
export function TheoryMarkdown({ markdown, source, prueferfragen }: { markdown: string; source?: string; prueferfragen: boolean }) {
  if (!prueferfragen) return <Markdown source={source}>{stripPrueferfragen(markdown)}</Markdown>;
  return (
    <>
      {splitPrueferfragen(markdown).map((s, i) =>
        s.type === 'text' ? (
          <Markdown key={i} source={source}>
            {s.markdown}
          </Markdown>
        ) : (
          <PrueferfrageBox key={i} pf={s} />
        ),
      )}
    </>
  );
}

function PrueferfrageBox({ pf }: { pf: Prueferfrage }) {
  return (
    <aside className="pf-box">
      <div className="pf-label">
        ❓ {pf.label} – <span className="muted">erst selbst überlegen</span>
      </div>
      <Markdown className="pf-question">{pf.question}</Markdown>
      {pf.answer ? (
        <details className="pf-answer">
          <summary>👁 Antwort zeigen</summary>
          <Markdown>{pf.answer}</Markdown>
        </details>
      ) : (
        <p className="hint">Keine Musterantwort im Lernblatt – beantworte die Frage laut und prüf dich am Text oben.</p>
      )}
    </aside>
  );
}
