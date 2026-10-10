// Fortschrittsringe als Inline-SVG (Umsetzungsplan Phase 9; ersetzt die Balken mit mix-blend-mode auf der Übersicht).

const kappe = (v: number) => Math.max(0, Math.min(1, v));

/** Farbstufe wie die IHK-Noten: ab 92 % gut, ab 67 % mittel, sonst schwach. */
export const stufe = (pct: number) => (pct >= 92 ? 'good' : pct >= 67 ? 'mid' : 'low');

interface RingWert {
  /** 0–1 */
  wert: number;
  /** CSS-Klasse für die Farbe (ring-karten, ring-uebungen, good, mid, low). */
  klasse: string;
}

/**
 * Konzentrische Ringe (außen der erste Wert) im Stil der Aktivitätsringe. `label` beschreibt alle Werte für Screenreader; die Zahlen
 * stehen zusätzlich als Text neben dem Ring.
 */
export function Ringe({ werte, groesse = 96, label }: { werte: RingWert[]; groesse?: number; label: string }) {
  const staerke = groesse >= 80 ? 10 : 6;
  const abstand = 2;
  return (
    <svg className="ringe" width={groesse} height={groesse} viewBox={`0 0 ${groesse} ${groesse}`} role="img" aria-label={label}>
      <title>{label}</title>
      {werte.map((w, i) => {
        const r = groesse / 2 - staerke / 2 - i * (staerke + abstand);
        if (r <= staerke / 2) return null;
        const v = kappe(w.wert);
        return (
          <g key={i} className={`ring ${w.klasse}`}>
            <circle className="ring-spur" cx={groesse / 2} cy={groesse / 2} r={r} strokeWidth={staerke} />
            {v > 0 && (
              <circle
                className="ring-wert"
                cx={groesse / 2}
                cy={groesse / 2}
                r={r}
                strokeWidth={staerke}
                pathLength={100}
                strokeDasharray={`${v * 100} 100`}
                transform={`rotate(-90 ${groesse / 2} ${groesse / 2})`}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Kleiner Ring mit Prozentzahl daneben (Tabellen der Übersicht); ohne Wert ein Strich. */
export function MiniRing({ pct, titel }: { pct?: number; titel?: string }) {
  if (pct === undefined) return <span className="muted">–</span>;
  const gerundet = Math.round(pct);
  return (
    <span className="mini-ring">
      <Ringe werte={[{ wert: pct / 100, klasse: stufe(pct) }]} groesse={20} label={`${titel ? `${titel}: ` : ''}${gerundet} %`} />
      <span aria-hidden="true">{gerundet} %</span>
    </span>
  );
}
