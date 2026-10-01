import { Link } from 'react-router-dom';
import { isIsoDate } from '../../shared/progress';
import { Datenschutz } from '../components/Datenschutz';
import { IS_STATIC } from '../lib/api';
import { leichtAutomatischAn } from '../lib/leicht';
import { withSettings } from '../lib/settings';
import { daysUntilExam, formatIsoDate } from '../lib/stats';
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

      <section className="card">
        <h2>❓ Fragen aus den Lernblättern</h2>
        <label className="choice">
          <input
            type="checkbox"
            checked={settings.prueferfragen}
            onChange={(e) => update((p) => withSettings(p, { prueferfragen: e.target.checked }))}
          />
          <span>
            <b>❓ Prüferfragen einbeziehen</b>
            <br />
            <span className="hint">Die Prüferfragen aus der Theorie – im Lernen-Teil und als Karteikarten.</span>
          </span>
        </label>
        <label className="choice">
          <input
            type="checkbox"
            checked={settings.fachgespraech}
            onChange={(e) => update((p) => withSettings(p, { fachgespraech: e.target.checked }))}
          />
          <span>
            <b>🎤 Fachgespräch-Fragen einbeziehen</b>
            <br />
            <span className="hint">Die Fragen für das Fachgespräch am Ende jedes Lernblatts – als Karteikarten.</span>
          </span>
        </label>
        <p className="hint">
          Ausgeschaltet heißt nur ausgeblendet: Dein Lernstand dieser Karten bleibt erhalten und ist beim Einschalten wieder da. Der
          Prüferkommentar in den Musterlösungen (das Punkteschema) bleibt immer sichtbar.
        </p>
      </section>

      <section className="card">
        <h2>🟢 Leicht-Modus (4 Antworten)</h2>
        <p>
          Im Leicht-Modus wählst du bei Karteikarten und Rechenübungen aus 4 Antworten die richtige. Das ist zum Einstieg gedacht – für die
          Prüfung frei antworten.
        </p>
        <label className="choice">
          <input
            type="checkbox"
            checked={leichtAutomatischAn(settings)}
            onChange={(e) => update((p) => withSettings(p, { leichtAutomatisch: e.target.checked }))}
          />
          <span>
            <b>🤖 Automatische Antworten erlauben</b>
            <br />
            <span className="hint">
              Karten ohne eigene Auswahlantworten bekommen Antworten anderer Karten desselben Decks als falsche Antworten (markiert mit
              „automatisch“). Aus: nur Karten mit geprüften Auswahlantworten.
            </span>
          </span>
        </label>
      </section>

      {IS_STATIC && (
        <section className="card">
          <h2>💾 Erinnerung an die Sicherung</h2>
          <p>Die Übersicht erinnert dich, eine Sicherung herunterzuladen, wenn die letzte so alt ist und du seitdem gelernt hast.</p>
          <label className="field">
            Erinnern nach … Tagen
            <input
              type="number"
              min={1}
              max={365}
              value={settings.backupReminderDays}
              onChange={(e) => {
                const days = Number(e.target.value);
                if (Number.isInteger(days) && days >= 1 && days <= 365) update((p) => withSettings(p, { backupReminderDays: days }));
              }}
            />
          </label>
          {settings.lastBackupDownloadAt && (
            <p className="hint">Letzte heruntergeladene Sicherung: {formatIsoDate(settings.lastBackupDownloadAt)}.</p>
          )}
        </section>
      )}

      <p className="hint">
        💾 Deine Einstellungen stehen in deinem Fortschritt ({IS_STATIC ? 'in diesem Browser' : 'lokal auf diesem Rechner'}) und ziehen mit
        jeder Sicherung um. Sichern und Einspielen: <Link to="/daten">Daten &amp; Import</Link>. Das Farbschema (🖥️ / 🌙 / ☀️ unten in der
        Navigation) merkt sich jedes Gerät selbst.
      </p>

      <Datenschutz />
    </div>
  );
}
