/**
 * Fisher–Yates-Mischen: jede Reihenfolge ist gleich wahrscheinlich
 * (anders als `sort(() => Math.random() - 0.5)`). Verändert das Original nicht.
 * `rng` liefert Zahlen in [0, 1) – austauschbar für Tests.
 */
export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
