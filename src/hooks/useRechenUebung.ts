// Zustand einer Rechenübung (/rechnen/:id): konkrete Zahlen (feste Daten oder Seed), Eingaben, Prüfergebnis,
// aufgedeckte Hinweise und Lösung. Speichert über die reinen Funktionen aus src/lib/rechnen.ts im Fortschritt.
// Die Seite rendert nur.

import { useCallback, useMemo, useState } from 'react';
import type { RechenUebung } from '../../shared/types';
import { recordRechenCheck, recordRechenHint, recordRechenLoesung, setRechenSeed } from '../lib/rechnen';
import { useStore } from '../lib/store';
import { type PruefErgebnis, pruefeAntworten } from '../rechnen/checker';
import { baueInstanz, type RechenInstanz } from '../rechnen/instanz';
import { neuerSeed } from '../rechnen/zufall';

type Gebaut = { inst: RechenInstanz; error?: undefined } | { inst?: undefined; error: string };

/** Instanz mit `seed`; passt der gespeicherte Seed nicht (mehr) zur Vorlage, die festen Zahlen. */
function baue(u: RechenUebung, seed: number | undefined): Gebaut {
  try {
    return { inst: baueInstanz(u, seed) };
  } catch (e) {
    if (seed !== undefined) return baue(u, undefined);
    return { error: (e as Error).message };
  }
}

export function useRechenUebung(u: RechenUebung) {
  const { progress, update } = useStore();
  const id = u.id;
  const state = progress.rechnen[id];

  const [seed, setSeed] = useState<number | undefined>(() => (u.neueZahlen ? state?.lastSeed : undefined));
  const gebaut = useMemo(() => baue(u, seed), [u, seed]);
  const inst = gebaut.inst;

  const [antworten, setAntworten] = useState<Record<string, string>>(() => state?.antworten ?? {});
  const [ergebnis, setErgebnis] = useState<PruefErgebnis | null>(null);
  const [leer, setLeer] = useState(false);
  const hinweise = inst?.hinweise ?? u.hinweise;
  const [hintsShown, setHintsShown] = useState(() => Math.min(state?.hintsUsed ?? 0, hinweise.length));
  const [loesungOffen, setLoesungOffen] = useState(false);

  const setAntwort = useCallback((eingabe: string, text: string) => {
    setAntworten((a) => ({ ...a, [eingabe]: text }));
    setLeer(false);
  }, []);

  /** „✓ Prüfen“: zählt als Versuch, sobald mindestens ein Feld ausgefüllt ist. */
  const pruefen = () => {
    if (!inst) return;
    const eigene = Object.fromEntries(inst.eingaben.map((e) => [e.id, antworten[e.id] ?? '']));
    if (Object.values(eigene).every((t) => !t.trim())) {
      setLeer(true);
      setErgebnis(null);
      return;
    }
    const r = pruefeAntworten(inst, eigene);
    setErgebnis(r);
    update((p) => recordRechenCheck(p, id, r.ok, eigene));
  };

  /** Neue Zufallszahlen („🎲 Neue Zahlen“) oder zurück zu den festen Zahlen der Übung (`undefined`). */
  const wechsleZahlen = (neu: number | undefined) => {
    setSeed(neu);
    setAntworten({});
    setErgebnis(null);
    setLeer(false);
    setLoesungOffen(false);
    update((p) => setRechenSeed(p, id, neu));
  };

  const hinweis = () => {
    if (hintsShown >= hinweise.length) return;
    setHintsShown(hintsShown + 1);
    // Nur neue Hinweise zählen – schon früher aufgedeckte stehen oben wieder da.
    if (hintsShown + 1 > (state?.hintsUsed ?? 0)) update((p) => recordRechenHint(p, id));
  };

  const zeigeLoesung = () => {
    update((p) => recordRechenLoesung(p, id));
    setLoesungOffen(true);
  };

  return {
    state,
    inst,
    error: gebaut.error,
    /** true, wenn gerade Zufallszahlen statt der festen Zahlen zu sehen sind. */
    zufall: seed !== undefined && inst?.seed === seed,
    antworten,
    setAntwort,
    ergebnis,
    leer,
    pruefen,
    neueZahlen: () => wechsleZahlen(neuerSeed()),
    originalZahlen: () => wechsleZahlen(undefined),
    hinweise: hinweise.slice(0, hintsShown),
    hinweiseGesamt: hinweise.length,
    hinweis,
    loesungOffen,
    zeigeLoesung,
  };
}
