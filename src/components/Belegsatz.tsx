// SQL-Belegsatz (Umsetzungsplan Phase 6, Entscheidung E3): Syntax zum Nachschlagen aus AP-2/AP2_SQL_Belegsatz.md (Material „sql-belegsatz“).
// Als Seite unter Glossar (pages/SqlBelegsatz.tsx) und im SQL-Editor als ausklappbares Seitenpanel.

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Icon } from './Icon';
import { Markdown } from './Markdown';

export const BELEGSATZ_ID = 'sql-belegsatz';
export const BELEGSATZ_PFAD = `/material/${BELEGSATZ_ID}`;

/** Der Belegsatz aus dem Inhalt, oder undefined (Datei fehlt). */
export function useBelegsatz() {
  const { content } = useStore();
  return content.materials.find((m) => m.id === BELEGSATZ_ID);
}

/** Inhalt ohne die erste Überschrift (die Seite bzw. das Panel setzt eine eigene). */
export const ohneTitel = (md: string) => md.replace(/^#\s+[^\n]*\n+/, '');

/**
 * Knopf „SQL-Belegsatz“ und das Seitenpanel dazu (rechts, auf dem Handy über die ganze Breite). Esc oder „Schließen“ schließen es,
 * der Fokus geht dann zurück auf den Knopf. Ohne Belegsatz im Inhalt wird nichts gezeigt.
 */
export function BelegsatzPanel() {
  const doc = useBelegsatz();
  const [offen, setOffen] = useState(false);
  const knopf = useRef<HTMLButtonElement>(null);
  const schliessen = useRef<HTMLButtonElement>(null);
  const warOffen = useRef(false);

  useEffect(() => {
    if (offen) {
      schliessen.current?.focus();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOffen(false);
      };
      window.addEventListener('keydown', onKey);
      warOffen.current = true;
      return () => window.removeEventListener('keydown', onKey);
    }
    if (warOffen.current) knopf.current?.focus();
    return undefined;
  }, [offen]);

  if (!doc) return null;
  return (
    <>
      <button
        ref={knopf}
        type="button"
        className="secondary"
        aria-expanded={offen}
        aria-controls="belegsatz-panel"
        onClick={() => setOffen((x) => !x)}
      >
        <Icon name="book-open" /> SQL-Belegsatz
      </button>
      {offen && (
        <aside id="belegsatz-panel" className="belegsatz-panel" aria-label="SQL-Belegsatz">
          <div className="belegsatz-kopf">
            <h2>SQL-Belegsatz</h2>
            <Link to={BELEGSATZ_PFAD} className="small">
              als Seite öffnen
            </Link>
            <button ref={schliessen} type="button" className="ghost" onClick={() => setOffen(false)}>
              <Icon name="x" /> Schließen
            </button>
          </div>
          <Markdown source={false} className="belegsatz">
            {ohneTitel(doc.markdown)}
          </Markdown>
        </aside>
      )}
    </>
  );
}
