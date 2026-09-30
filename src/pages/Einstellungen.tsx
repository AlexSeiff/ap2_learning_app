import { Link } from 'react-router-dom';
import { isIsoDate } from '../../shared/progress';
import { Datenschutz } from '../components/Datenschutz';
import { IS_STATIC } from '../lib/api';
import { withSettings } from '../lib/settings';
import { daysUntilExam } from '../lib/stats';
import { useStore } from '../lib/store';

export function Einstellungen() {
  const { progress, update } = useStore();
  const { settings } = progress;
  const days = daysUntilExam(settings.examDate);

  return (
    <div className="page narrow">
      <h1>⚙️ Einstellungen</h1>
      <p className="lead">Passe die App an dich an. Alles gilt nur für dich.</p>

      <section className="card">
        <h2>📅 Mein Prüfungstermin</h2>
        <p>Trag den Tag deiner schriftlichen Prüfung ein – die Übersicht zählt dann die Tage herunter.</p>
        <div className="actions">
          <label className="field">
            Datum der schriftlichen AP2
            <input
              type="date"
              value={settings.examDate ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || isIsoDate(value)) update((p) => withSettings(p, { examDate: value || undefined }));
              }}
            />
          </label>
          {settings.examDate && (
            <button type="button" className="ghost" onClick={() => update((p) => withSettings(p, { examDate: undefined }))}>
              ✕ Termin entfernen
            </button>
          )}
        </div>
        {days !== undefined && (
          <p className="hint">
            {days > 1
              ? `Noch ${days} Tage.`
              : days === 1
                ? 'Morgen ist es so weit.'
                : days === 0
                  ? 'Heute ist Prüfungstag – viel Erfolg! 🍀'
                  : 'Der Termin liegt in der Vergangenheit.'}
          </p>
        )}
      </section>

      <p className="hint">
        💾 Deine Einstellungen stehen in deinem Fortschritt ({IS_STATIC ? 'in diesem Browser' : 'lokal auf diesem Rechner'}) und ziehen mit
        jeder Sicherung um. Sichern und Einspielen: <Link to="/daten">Daten &amp; Import</Link>. Das Farbschema (🖥️ / 🌙 / ☀️ unten in der
        Navigation) merkt sich jedes Gerät selbst.
      </p>

      <Datenschutz />
    </div>
  );
}
