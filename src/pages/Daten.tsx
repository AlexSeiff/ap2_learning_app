import { useEffect, useRef, useState } from 'react';
import { emptyProgress, migrateProgress } from '../../shared/progress';
import { AI_UNAVAILABLE, api, IS_STATIC } from '../lib/api';
import { downloadText } from '../lib/sheets';
import { localDate } from '../lib/progress';
import { useStore } from '../lib/store';

export function Daten() {
  const { content, progress, reload, replaceProgress, aiEnabled, aiModel } = useStore();
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [backups, setBackups] = useState<{ newest: string | null; count: number } | null>(null);

  useEffect(() => {
    // Tagessicherungen gibt es nur in der lokalen App (data/backups/).
    if (!IS_STATIC) api.backups().then(setBackups, () => setBackups(null));
  }, []);

  const tasks = Object.values(content.tasks);

  const reimport = async () => {
    await reload();
    setMsg(`Neu importiert: ${new Date().toLocaleTimeString('de-DE')}`);
  };

  const importBackup = async (file: File) => {
    try {
      const raw: unknown = JSON.parse(await file.text());
      // Auch ältere Sicherungen einspielen: migrateProgress ergänzt fehlende Felder. Nur Dateien ohne Versuchsliste sind keine Sicherung.
      if (!raw || typeof raw !== 'object' || !Array.isArray((raw as { attempts?: unknown }).attempts)) throw new Error('Keine gültige Sicherungsdatei.');
      if (!confirm('Aktuellen Fortschritt durch die Sicherung ersetzen?')) return;
      replaceProgress(migrateProgress(raw));
      setMsg('Sicherung wiederhergestellt.');
    } catch (e) {
      setMsg(`Fehler: ${(e as Error).message}`);
    }
  };

  return (
    <div className="page">
      <h1>Daten &amp; Import</h1>
      {msg && <p className="card info">{msg}</p>}

      <section className="card">
        <h2>Importbericht</h2>
        <p>
          Stand: {new Date(content.importedAt).toLocaleString('de-DE')} · {content.topics.length} Themen · {tasks.filter((t) => !t.generated).length} Aufgaben aus
          Lernblättern ({tasks.filter((t) => !t.generated && t.solution).length} mit Musterlösung) · {tasks.filter((t) => t.generated).length} KI-Aufgaben ·{' '}
          {content.flashcards.length} Karteikarten · {content.materials.length} Materialien
        </p>
        {IS_STATIC ? (
          <p className="hint">Online-Version: Die Lernblätter sind beim Veröffentlichen eingebaut. Änderungen erscheinen nach dem nächsten Push.</p>
        ) : (
          <>
            <button type="button" onClick={reimport}>↻ Lernblätter neu importieren</button>
            <p className="hint">Änderungen an den .md-Dateien werden auch automatisch erkannt – die Seite lädt dann neu.</p>
          </>
        )}
        {content.issues.length ? (
          <>
            <h3>Hinweise ({content.issues.length})</h3>
            <ul>
              {content.issues.map((i, n) => (
                <li key={n}>
                  <code>{i.file}</code>: {i.message}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="ok">✓ Keine Auffälligkeiten – jede Aufgabe hat eine Musterlösung.</p>
        )}
        <div className="table-wrap">
          <table className="stats">
            <thead>
              <tr><th>Nr.</th><th>Thema</th><th>Datei</th><th>Lösungen</th><th>Aufgaben</th><th>Punkte</th></tr>
            </thead>
            <tbody>
              {content.topics.map((t) => {
                const tt = tasks.filter((x) => x.topicId === t.id && !x.generated);
                return (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.title}</td>
                    <td className="small"><code>{t.file}</code></td>
                    <td className="small"><code>{t.solutionFile ?? (tt.some((x) => x.solution) ? '(im Blatt)' : '–')}</code></td>
                    <td>{tt.filter((x) => x.solution).length}/{tt.length}</td>
                    <td>{t.exam?.totalPoints ?? '–'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Fortschritt</h2>
        <p>
          {IS_STATIC ? (
            <>Gespeichert in diesem Browser (localStorage) – nur auf diesem Gerät.</>
          ) : (
            <>Gespeichert in <code>lern-app/data/fortschritt.json</code> – nur auf diesem Rechner.</>
          )}{' '}
          {progress.attempts.length} Versuche, {progress.exams.length} Klausuren, {Object.keys(progress.cards).length} gelernte Karten.
        </p>
        {IS_STATIC && (
          <p className="hint">
            🗄 Hier gibt es keine automatische Tagessicherung. Lade ab und zu eine Sicherung herunter – Browserdaten löschen löscht auch den Fortschritt.
            Umziehen aus der lokalen App: dort „Sicherung herunterladen“, hier „Sicherung einspielen“ (und umgekehrt).
          </p>
        )}
        {backups && (
          <p className="hint">
            {backups.newest
              ? <>🗄 Automatische Tagessicherung: zuletzt vom {new Date(`${backups.newest}T00:00:00`).toLocaleDateString('de-DE')} ({backups.count} in <code>lern-app/data/backups/</code>, die letzten 14 Tage werden aufbewahrt).</>
              : <>🗄 Noch keine automatische Tagessicherung – sie entsteht beim ersten Speichern eines Tages in <code>lern-app/data/backups/</code>.</>}
          </p>
        )}
        <div className="actions">
          <button type="button" className="secondary" onClick={() => downloadText(`AP2_Fortschritt_${localDate()}.json`, JSON.stringify(progress, null, 2), 'application/json')}>
            ⬇ Sicherung herunterladen
          </button>
          <button type="button" className="secondary" onClick={() => fileRef.current?.click()}>⬆ Sicherung einspielen</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importBackup(e.target.files[0])} />
          <button
            type="button"
            className="ghost danger"
            onClick={() => {
              if (confirm('Wirklich den GESAMTEN Lernfortschritt löschen? Lade vorher am besten eine Sicherung herunter.')) {
                replaceProgress(emptyProgress());
                setMsg('Fortschritt zurückgesetzt.');
              }
            }}
          >
            Fortschritt zurücksetzen
          </button>
        </div>
      </section>

      <section className="card">
        <h2>KI</h2>
        <p>{IS_STATIC ? AI_UNAVAILABLE : aiEnabled ?<>✓ Aktiv mit Modell <code>{aiModel}</code>.</> : 'Deaktiviert – kein ANTHROPIC_API_KEY gesetzt (siehe README).'}</p>
      </section>
    </div>
  );
}
