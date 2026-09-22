import { describe, expect, it } from 'vitest';
import { shuffle } from '../src/lib/shuffle';

/** Einfacher, deterministischer Zufallsgenerator (mulberry32) für reproduzierbare Tests. */
function seeded(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('shuffle (Fisher–Yates)', () => {
  it('verändert das Original nicht und behält alle Elemente', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const copy = [...input];
    const out = shuffle(input, seeded(1));
    expect(input).toEqual(copy);
    expect(out).not.toBe(input);
    expect([...out].sort((a, b) => a - b)).toEqual(copy);
  });

  it('kommt mit leeren und einelementigen Listen klar', () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle(['a'])).toEqual(['a']);
  });

  it('nutzt den übergebenen Zufallsgenerator (rng = 0 → Rotation)', () => {
    // Mit rng() = 0 tauscht jeder Schritt i mit 0: [a,b,c,d] → [b,c,d,a]
    expect(shuffle(['a', 'b', 'c', 'd'], () => 0)).toEqual(['b', 'c', 'd', 'a']);
  });

  it('verteilt alle Reihenfolgen gleichmäßig', () => {
    const rng = seeded(42);
    const counts = new Map<string, number>();
    const runs = 60000;
    for (let i = 0; i < runs; i++) {
      const key = shuffle([1, 2, 3], rng).join('');
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    expect(counts.size).toBe(6);
    // Erwartet je 10000; ±5 % Toleranz. Das alte sort-Mischen weicht hier deutlich stärker ab.
    for (const n of counts.values()) expect(Math.abs(n - runs / 6)).toBeLessThan(500);
  });
});
