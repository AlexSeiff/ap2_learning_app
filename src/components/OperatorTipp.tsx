import { useId, type ReactNode } from 'react';
import { BEREICH_TEXT, OPERATOR_NACH_ID } from '../lib/operatoren';

/**
 * Markierter Operator im Aufgabentext (ROADMAP 8.4) mit Tooltip: bei Maus-Hover und Tastaturfokus sichtbar,
 * per aria-describedby vorgelesen, Escape verlässt ihn.
 */
export function OperatorTipp({ id, children }: { id: string; children: ReactNode }) {
  const tipId = useId();
  const op = OPERATOR_NACH_ID[id];
  if (!op) return <>{children}</>;
  return (
    <span
      className="operator"
      tabIndex={0}
      aria-describedby={tipId}
      onKeyDown={(e) => {
        if (e.key === 'Escape') e.currentTarget.blur();
      }}
    >
      {children}
      <span role="tooltip" id={tipId} className="operator-tipp">
        <b>Operator „{op.name}“</b> ({BEREICH_TEXT[op.bereich]}): {op.verlangt} <i>Punkte: {op.punkte}.</i>
      </span>
    </span>
  );
}
