// Schema der Übungsdatenbank: Tabellen mit Zeilenzahl, Spalten mit Typ und PK/FK.
// Klick auf eine Spalte fügt ihren Namen in den Editor ein, „Tabelle anzeigen“ führt SELECT * aus.

import { useState } from 'react';
import type { SchemaTable } from '../sql/types';

type Props = {
  tables: SchemaTable[];
  onInsert: (text: string) => void;
  onShowTable?: (table: string) => void;
  /** Anfangs aufgeklappt? (Standard: auf breiten Bildschirmen ja, auf dem Handy nein) */
  defaultOpen?: boolean;
};

const wide = () => typeof window === 'undefined' || !window.matchMedia || window.matchMedia('(min-width: 901px)').matches;

export function SchemaBrowser({ tables, onInsert, onShowTable, defaultOpen }: Props) {
  // Nur der Anfangszustand – danach klappt der Browser selbst (sonst würde ein Re-Render die Auswahl überschreiben).
  const [open] = useState(() => defaultOpen ?? wide());
  return (
    <details className="schema" open={open}>
      <summary>🗂️ Schema</summary>
      {!tables.length && <p className="muted small">Lade Datenbank …</p>}
      {tables.map((table) => (
        <details key={table.name} className="schema-table">
          <summary>
            <b>{table.name}</b> <span className="muted small">({table.rowCount.toLocaleString('de-DE')})</span>
          </summary>
          <ul className="schema-cols">
            {table.columns.map((col) => (
              <li key={col.name}>
                <button
                  type="button"
                  className="ghost schema-col"
                  title={`„${col.name}“ in den Editor einfügen`}
                  onClick={() => onInsert(col.name)}
                >
                  {col.pk && (
                    <span className="key pk" title="Primärschlüssel">
                      PK
                    </span>
                  )}
                  {col.fk && (
                    <span className="key fk" title={`Fremdschlüssel → ${col.fk.table}.${col.fk.column}`}>
                      FK
                    </span>
                  )}
                  <span className="mono">{col.name}</span>
                  <span className="muted small">{col.type}</span>
                </button>
                {col.fk && (
                  <span className="muted small schema-ref">
                    → {col.fk.table}.{col.fk.column}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="schema-actions">
            <button type="button" className="secondary small" onClick={() => onInsert(table.name)}>
              ＋ Name einfügen
            </button>
            {onShowTable && (
              <button type="button" className="secondary small" onClick={() => onShowTable(table.name)}>
                Tabelle anzeigen
              </button>
            )}
          </div>
        </details>
      ))}
    </details>
  );
}
