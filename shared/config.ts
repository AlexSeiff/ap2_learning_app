// Zentrale Einstellungen der Lern-App. Nur Werte, keine Logik – wird von Client, Server und vite.config.ts importiert.

/** Datum der schriftlichen Prüfung AP2 (YYYY-MM-DD). */
export const EXAM_DATE = '2026-11-25';

/** Bearbeitungszeit einer Übungsklausur in Minuten. */
export const EXAM_MINUTES = 90;

/** Höchstzahl neuer Karteikarten pro Lernrunde (fällige Karten kommen immer dazu). */
export const NEW_PER_SESSION = 20;

/** Wiederholungsabstände im Fehlerjournal (Tage) je Stufe. */
export const JOURNAL_INTERVALS = [1, 3, 7];

/** Abstände für Karteikarten-Fächer 1–5 (Tage bis zur nächsten Abfrage). */
export const CARD_INTERVALS = [0, 1, 3, 7, 14, 30];

/** Wartezeit in ms, bevor Änderungen am Fortschritt gespeichert werden (sammelt schnelle Folgeänderungen). */
export const SAVE_DELAY_MS = 400;

/** Port des Dev-Servers – `Lern-App starten.cmd` öffnet http://localhost:5178. */
export const DEV_PORT = 5178;
