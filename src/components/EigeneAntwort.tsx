import { useId, type ReactNode } from 'react';

// „Deine Antwort“ auf Karteikarten (ROADMAP 8.2): erst aufschreiben, dann umdrehen. Aufschreiben prüft das Erinnern ehrlicher
// als „wusste ich doch“. Nicht gespeichert – der Text gilt nur für die aktuelle Karte.

/** Eingabefeld unter der Karte (außerhalb der klickbaren Karte, damit Tippen nicht umdreht). Strg+Enter dreht um. */
export function EigeneAntwortFeld({ value, onChange, onFertig }: { value: string; onChange: (v: string) => void; onFertig: () => void }) {
  const id = useId();
  return (
    <div className="eigene-antwort">
      <label htmlFor={id}>✍️ Deine Antwort (optional)</label>
      <textarea
        id={id}
        rows={3}
        value={value}
        placeholder="Schreib deine Antwort in Stichpunkten auf …"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            onFertig();
          }
        }}
      />
      <p className="hint small">
        <kbd>Strg</kbd>+<kbd>Enter</kbd> dreht die Karte um. Beim Tippen sind die Tasten <kbd>Leertaste</kbd> und <kbd>1</kbd>–<kbd>3</kbd>{' '}
        aus.
      </p>
    </div>
  );
}

/** Nach dem Umdrehen: deine Antwort neben der Musterantwort (ohne eigene Antwort nur die Musterantwort). */
export function AntwortVergleich({ eigene, muster }: { eigene: string; muster: ReactNode }) {
  if (!eigene.trim()) return <>{muster}</>;
  return (
    <div className="antwort-vergleich">
      <div>
        <h4>✍️ Deine Antwort</h4>
        <p className="eigene-text">{eigene}</p>
      </div>
      <div>
        <h4>📘 Musterantwort</h4>
        {muster}
      </div>
    </div>
  );
}
