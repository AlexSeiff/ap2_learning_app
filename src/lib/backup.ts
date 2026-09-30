// Sicherungsdatei einlesen (Daten & Import, Willkommensseite): rein, damit testbar.

import { migrateProgress, type Progress } from '../../shared/progress';

/**
 * Liest den Text einer Sicherungsdatei und bringt ihn auf das aktuelle Format.
 * Auch ältere Sicherungen gehen: migrateProgress ergänzt fehlende Felder. Nur Dateien ohne Versuchsliste sind keine Sicherung.
 */
export function parseBackup(text: string): Progress {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('Die Datei ist keine Sicherung (kein gültiges JSON).');
  }
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as { attempts?: unknown }).attempts))
    throw new Error('Keine gültige Sicherungsdatei.');
  return migrateProgress(raw);
}
