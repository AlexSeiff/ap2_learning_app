import 'katex/dist/katex.min.css';
import katex from 'katex';
import { useMemo } from 'react';
import { formatErgebnis, type RechenSchritt, rundungsHinweis } from '../../shared/rechenweg';

// Zieht KaTeX nach: nur in lazy geladenen Seiten verwenden (z. B. Rechenübungen, ROADMAP Phase 5), nicht im Hauptbundle.

/** LaTeX als Formel (inline). Fehler erscheinen rot statt die Seite abstürzen zu lassen. */
export function Tex({ tex }: { tex: string }) {
  const html = useMemo(() => katex.renderToString(tex, { throwOnError: false, strict: 'ignore', errorColor: 'var(--low)' }), [tex]);
  return <span className="rw-tex" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Nummerierter Rechenweg: je Schritt Formel → Einsetzen → Ergebnis (deutsches Zahlenformat, Einheit, Rundungshinweis). */
export function Rechenweg({ schritte }: { schritte: RechenSchritt[] }) {
  return (
    <ol className="rechenweg">
      {schritte.map((s, i) => {
        const gerundet = rundungsHinweis(s.ergebnis, s.runden);
        return (
          <li key={i} className="rw-schritt">
            <div className="rw-titel">{s.titel}</div>
            <dl className="rw-zeilen">
              <dt>Formel</dt>
              <dd>
                <Tex tex={s.formel} />
              </dd>
              {s.einsetzen && (
                <>
                  <dt>Einsetzen</dt>
                  <dd>
                    <Tex tex={s.einsetzen} />
                  </dd>
                </>
              )}
              <dt>Ergebnis</dt>
              <dd>
                <strong className="rw-ergebnis">{formatErgebnis(s)}</strong>
                {gerundet && <span className="hint"> ({gerundet})</span>}
              </dd>
            </dl>
            {s.hinweis && <p className="hint">{s.hinweis}</p>}
          </li>
        );
      })}
    </ol>
  );
}
