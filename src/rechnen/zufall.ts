// Reproduzierbarer Zufall für die Rechenvorlagen: gleicher Seed → gleiche Zahlen („🎲 Neue Zahlen“ wird im Fortschritt
// als lastSeed gemerkt). mulberry32 – klein, schnell und für Übungszahlen völlig ausreichend.

export interface Zufall {
  /** Gleichverteilt in [0, 1). */
  zahl(): number;
  /** Ganze Zahl in [min, max] (beide eingeschlossen); mit `schritt` nur Vielfache davon ab `min`. */
  ganz(min: number, max: number, schritt?: number): number;
  /** Ein Element der Liste. */
  wahl<T>(liste: readonly T[]): T;
  /** Neue, gemischte Kopie (Fisher–Yates). */
  mische<T>(liste: readonly T[]): T[];
  /** `anzahl` verschiedene Elemente der Liste. */
  stichprobe<T>(liste: readonly T[], anzahl: number): T[];
  /** true mit Wahrscheinlichkeit p. */
  ja(p?: number): boolean;
}

export function erzeugeZufall(seed: number): Zufall {
  let a = seed >>> 0 || 0x9e3779b9;
  const zahl = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const ganz = (min: number, max: number, schritt = 1) => {
    const stufen = Math.floor((max - min) / schritt);
    return min + Math.floor(zahl() * (stufen + 1)) * schritt;
  };
  const mische = <T>(liste: readonly T[]): T[] => {
    const out = [...liste];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(zahl() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  return {
    zahl,
    ganz,
    wahl: (liste) => liste[Math.floor(zahl() * liste.length)],
    mische,
    stichprobe: (liste, anzahl) => mische(liste).slice(0, anzahl),
    ja: (p = 0.5) => zahl() < p,
  };
}

/** Seed aus einem Text (z. B. der Übungs-ID), damit erzeugte Übungen ohne gespeicherten Seed stabil bleiben. */
export function seedAusText(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Neuer zufälliger Seed für „🎲 Neue Zahlen“ (nicht 0, damit er sich von „kein Seed“ unterscheidet). */
export function neuerSeed(): number {
  return 1 + Math.floor(Math.random() * 2147483646);
}
