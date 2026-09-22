// Restzeit der Übungsklausur: sichtbare Anzeige (mm:ss) und Ansage für Screenreader.

/** Sichtbare Restzeit als „mm:ss“. */
export function formatRemaining(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

/**
 * Text für die aria-live-Region des Timers. Er ändert sich nur alle 5 Minuten und in der letzten Minute –
 * Screenreader sagen eine Live-Region nur bei Änderung an, eine sekündliche Ansage wäre unbenutzbar.
 */
export function timerAnnouncement(remainingMs: number): string {
  if (remainingMs <= 0) return 'Die Zeit ist abgelaufen.';
  const minutesLeft = Math.ceil(remainingMs / 60_000);
  if (minutesLeft <= 1) return 'Noch 1 Minute.';
  // Angesagt wird beim Erreichen von 90, 85, 80, … Minuten; bis zur nächsten Marke bleibt der Text gleich.
  const mark = Math.ceil(minutesLeft / 5) * 5;
  return `Noch ${mark} Minuten.`;
}
