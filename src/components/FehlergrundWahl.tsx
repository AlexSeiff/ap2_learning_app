import type { Fehlergrund } from '../../shared/progress';
import { FEHLERGRUND_LISTE } from '../lib/fehlergruende';

/** „Woran lag's?“ nach der Selbstbewertung unter voller Punktzahl (ROADMAP 8.7). Freiwillig; zweiter Klick hebt die Wahl auf. */
export function FehlergrundWahl({ value, onChange }: { value: Fehlergrund | undefined; onChange: (g: Fehlergrund | undefined) => void }) {
  return (
    <div className="sicherheit fehlergrund" role="group" aria-label="Woran lag's?">
      <span className="sicherheit-frage">Woran lag&apos;s? (optional)</span>
      {FEHLERGRUND_LISTE.map((g) => (
        <button
          key={g.id}
          type="button"
          className="secondary"
          aria-pressed={value === g.id}
          onClick={() => onChange(value === g.id ? undefined : g.id)}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}
