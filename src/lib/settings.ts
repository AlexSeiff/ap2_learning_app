// Persönliche Einstellungen (Progress.settings): reine Update-Funktion. Typ, Standardwerte und Migration stehen in shared/progress.ts.

import type { Progress, Settings } from '../../shared/progress';

/** Übernimmt Änderungen an den Einstellungen; ein leerer oder fehlender Prüfungstermin wird entfernt. */
export function withSettings(p: Progress, changes: Partial<Settings>): Progress {
  const settings: Settings = { ...p.settings, ...changes };
  if (!settings.examDate) delete settings.examDate;
  return { ...p, settings };
}
