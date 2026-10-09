// Stern zum Markieren einer Karteikarte (Umsetzungsplan Phase 4). Gespeichert in progress.markiert, ohne Einfluss auf das Leitner-Fach.

import { useEffect } from 'react';
import { istMarkiert, wechsleMarkierung } from '../lib/markiert';
import { useStore } from '../lib/store';
import { Icon } from './Icon';

/**
 * Umschaltknopf (aria-pressed) mit Stern; gefüllt, solange die Karte markiert ist.
 * `taste`: zusätzlich Kurzbefehl M (nicht beim Tippen, nicht mit Strg/Alt/⌘) – nur für die gerade gezeigte Karte setzen.
 * `nurIcon`: ohne sichtbaren Text, z. B. in Listen; der Name steht dann im aria-label (`label`, sonst „Karte markieren“).
 * `text`: sichtbarer Text (Standard „Markieren“).
 */
export function MarkierStern(props: { cardId: string; taste?: boolean; nurIcon?: boolean; label?: string; text?: string }) {
  const { cardId, taste = false, nurIcon = false, label = 'Karte markieren', text = 'Markieren' } = props;
  const { progress, update } = useStore();
  const an = istMarkiert(progress, cardId);
  const wechsle = () => update((p) => wechsleMarkierung(p, cardId));

  useEffect(() => {
    if (!taste) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'm' && e.key !== 'M') return;
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest('input, select, textarea, [contenteditable="true"]')) return;
      e.preventDefault();
      update((p) => wechsleMarkierung(p, cardId));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [taste, cardId, update]);

  return (
    <button
      type="button"
      className={`stern ${nurIcon ? 'nur-icon' : ''}`}
      aria-pressed={an}
      aria-label={nurIcon ? label : undefined}
      title={an ? 'Markiert – zum Entfernen klicken' : 'Karte markieren'}
      onClick={wechsle}
    >
      <Icon name="star" />
      {!nurIcon && (
        <>
          {' '}
          {text}
          {taste && (
            <>
              {' '}
              <kbd>M</kbd>
            </>
          )}
        </>
      )}
    </button>
  );
}
