// Suchdialog (ROADMAP 8.8): lazy geladen, sobald jemand Strg+K drückt oder auf „🔎 Suchen“ klickt.
// Der Index entsteht hier (einmal je Inhalt und Einstellung), die Logik steht in src/lib/suche.ts.

import { type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { baueGlossar, glossarSuchEintraege } from '../lib/glossar';
import { useStore } from '../lib/store';
import { baueSuchIndex, suche, SUCH_ART } from '../lib/suche';
import { Icon } from './Icon';

export function SucheDialog({ onClose }: { onClose: () => void }) {
  const { content, progress } = useStore();
  const navigate = useNavigate();
  const { prueferfragen, fachgespraech } = progress.settings;
  const index = useMemo(
    () => baueSuchIndex(content, { prueferfragen, fachgespraech }, glossarSuchEintraege(baueGlossar(content), content)),
    [content, prueferfragen, fachgespraech],
  );
  const [anfrage, setAnfrage] = useState('');
  const [aktiv, setAktiv] = useState(0);
  const treffer = useMemo(() => suche(index, anfrage), [index, anfrage]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Der aktive Treffer bleibt beim Blättern mit den Pfeiltasten sichtbar.
  useEffect(() => {
    listRef.current?.querySelector(`[data-i="${aktiv}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [aktiv]);

  const oeffne = (i: number) => {
    const t = treffer[i];
    if (!t) return;
    onClose();
    navigate(t.eintrag.link);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAktiv((a) => Math.min(a + 1, Math.max(0, treffer.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAktiv((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Home' && treffer.length) {
      setAktiv(0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      oeffne(aktiv);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const listId = `${id}-liste`;
  return (
    <div className="suche-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="suche-dialog" role="dialog" aria-modal="true" aria-label="Suche">
        <div className="suche-kopf">
          <span aria-hidden="true">
            <Icon name="search" />
          </span>
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={treffer.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={treffer.length ? `${id}-t${aktiv}` : undefined}
            aria-label="Suchbegriff"
            placeholder="Begriff, Formel, Aufgabe … (z. B. Median, 3. Normalform)"
            value={anfrage}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => {
              setAnfrage(e.target.value);
              setAktiv(0);
            }}
            onKeyDown={onKeyDown}
          />
          <button type="button" className="ghost small" onClick={onClose} aria-label="Suche schließen">
            Esc
          </button>
        </div>
        {anfrage.trim().length >= 2 && !treffer.length && <p className="muted suche-leer">Keine Treffer für „{anfrage.trim()}“.</p>}
        {anfrage.trim().length < 2 && (
          <p className="muted suche-leer">
            Durchsucht Lernblätter, Glossar, Karteikarten, Aufgaben, SQL- und Rechenübungen, Formeln und Operatoren. Umlaute egal:
            „Pruefung“ findet „Prüfung“.
          </p>
        )}
        <ul className="suche-liste" role="listbox" id={listId} ref={listRef} aria-label="Treffer">
          {treffer.map((t, i) => {
            const art = SUCH_ART[t.eintrag.art];
            return (
              <li
                key={`${t.eintrag.link}-${i}`}
                id={`${id}-t${i}`}
                data-i={i}
                role="option"
                aria-selected={i === aktiv}
                className={i === aktiv ? 'aktiv' : undefined}
                onMouseMove={() => i !== aktiv && setAktiv(i)}
                onClick={() => oeffne(i)}
              >
                <span className="suche-art" title={art.name}>
                  <Icon name={art.icon} />
                </span>
                <span className="suche-inhalt">
                  <span className="suche-titel">{t.eintrag.titel}</span>
                  <span className="suche-kontext small muted">
                    {art.name}
                    {t.eintrag.kontext && ` · ${t.eintrag.kontext}`}
                  </span>
                  {t.ausschnitt && <span className="suche-ausschnitt small">{t.ausschnitt}</span>}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="suche-fuss small muted">
          <kbd>↑</kbd> <kbd>↓</kbd> wählen · <kbd>Enter</kbd> öffnen · <kbd>Esc</kbd> schließen
          {treffer.length > 0 && ` · ${treffer.length}${treffer.length === 40 ? '+' : ''} Treffer`}
        </p>
      </div>
    </div>
  );
}
