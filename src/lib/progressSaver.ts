// Speichert den Fortschritt verzögert (Debounce) per PUT /api/progress – ohne React, damit es testbar bleibt.
// Es läuft immer höchstens ein Speichern gleichzeitig, sonst könnten Antworten in falscher Reihenfolge ankommen.

import type { Progress } from '../../shared/progress';

export type SaveState = 'gespeichert' | 'speichert' | 'fehler';

export interface SaverOptions {
  /** Sendet den Body an den Server; lehnt mit einer Fehlermeldung ab, wenn das Speichern scheitert. */
  send: (body: unknown) => Promise<unknown>;
  /** `error` undefined = bisherige Fehlermeldung stehen lassen. */
  onState: (state: SaveState, error?: string | null) => void;
  delay?: number;
}

export function createProgressSaver({ send, onState, delay = 400 }: SaverOptions) {
  let latest: Progress | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let inFlight = false;
  /** Während eines Speicherns kam eine Änderung dazu → danach gleich noch einmal speichern. */
  let again = false;
  // Zähler statt Flags: So löscht eine ältere, erfolgreiche Antwort keine neuere Änderung oder Reset-Anforderung.
  let changeSeq = 0;
  let savedSeq = 0;
  let resetSeq = 0;

  /** Nach „Zurücksetzen“/„Sicherung einspielen“ darf der Server deutlich weniger Versuche annehmen. */
  const body = () => (resetSeq ? { ...latest, reset: true } : latest);

  function save() {
    inFlight = true;
    const seq = changeSeq;
    const sentReset = resetSeq;
    send(body())
      .then(
        () => {
          savedSeq = Math.max(savedSeq, seq);
          if (resetSeq === sentReset) resetSeq = 0;
          onState(savedSeq === changeSeq ? 'gespeichert' : 'speichert', null);
        },
        (e: Error) => onState('fehler', e.message),
      )
      .finally(() => {
        inFlight = false;
        if (again) {
          again = false;
          save();
        }
      });
  }

  function fire() {
    timer = undefined;
    if (inFlight) again = true;
    else save();
  }

  return {
    /** Merkt einen neuen Stand vor und speichert ihn nach `delay` ms, falls keine weitere Änderung folgt. */
    schedule(p: Progress, reset = false) {
      latest = p;
      changeSeq++;
      if (reset) resetSeq = changeSeq;
      onState('speichert');
      clearTimeout(timer);
      timer = setTimeout(fire, delay);
    },
    /** Gibt es Änderungen, die der Server noch nicht bestätigt hat (geplant, unterwegs oder fehlgeschlagen)? */
    get pending() {
      return latest !== null && changeSeq !== savedSeq;
    },
    /** Body für das letzte Senden beim Schließen des Tabs – oder undefined, wenn nichts aussteht. */
    flushBody(): unknown {
      return this.pending ? body() : undefined;
    },
  };
}

export type ProgressSaver = ReturnType<typeof createProgressSaver>;
