import { describe, expect, it } from 'vitest';
import { CONTENT_DIR, loadContent } from '../server/loadContent';
import { mcNorm } from '../shared/lernkarten';
import type { Flashcard } from '../shared/types';
import { cardPool } from '../src/lib/cards';
import {
  kartenOptionen,
  LEICHT_AUTO_MAX,
  leichtAutomatischAn,
  leichtKarten,
  leichtZahlen,
  optionText,
  type LeichtKarte,
} from '../src/lib/leicht';

/** mulberry32 – reproduzierbarer Zufall. */
function seeded(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const karte = (id: string, answer: string, extra: Partial<Flashcard> = {}): Flashcard => ({
  id,
  kind: 'lernkarte',
  question: `Frage ${id}`,
  answer,
  deckId: 'd',
  typ: 'wissen',
  tags: [],
  ...extra,
});

describe('optionText', () => {
  it('macht aus Markdown einen einzeiligen Auswahltext', () => {
    expect(optionText('**Fett** und `code`  \nzweite Zeile')).toBe('Fett und code zweite Zeile');
    expect(optionText('```sql\nSELECT 1\n```')).toBe('SELECT 1');
  });
});

describe('leichtKarten', () => {
  const deck = [
    karte('A', 'Antwort A'),
    karte('B', 'Antwort B ist etwas länger'),
    karte('C', 'Antwort C'),
    karte('D', 'Antwort D'),
    karte('E', 'x'.repeat(LEICHT_AUTO_MAX + 1)),
    karte('F', 'Anwendung kurz', { typ: 'anwendung' }),
    karte('G', 'Andere Gruppe', { deckId: 'g' }),
    karte('FG', 'Fachgespräch', { kind: 'fachgespraech', deckId: undefined, typ: undefined }),
  ];

  it('automatisch: kurze Antworten mit 3 anderen aus demselben Deck; lange, anwendung, Fachgespräch und Einzelgänger nicht', () => {
    const m = leichtKarten(deck, { automatisch: true });
    expect([...m.keys()].sort()).toEqual(['A', 'B', 'C', 'D']);
    const a = m.get('A')!;
    expect(a.art).toBe('automatisch');
    expect(a.richtig).toBe('Antwort A');
    // Gleicher Typ reicht (3 andere wissen-Karten) → anwendung und die zu lange Antwort kommen nicht dazu
    expect([...a.falsch].sort()).toEqual(['Antwort B ist etwas länger', 'Antwort C', 'Antwort D']);
  });

  it('gleicher Typ hat Vorrang; reicht er nicht, kommen andere Typen des Decks dazu', () => {
    const m = leichtKarten([karte('A', 'a1'), karte('B', 'b1'), karte('C', 'c1'), karte('D', 'd1'), karte('X', 'x1', { typ: 'falle' })], {
      automatisch: true,
    });
    expect(m.get('A')!.falsch).not.toContain('x1');
    expect([...m.get('X')!.falsch].sort()).toEqual(['a1', 'b1', 'c1', 'd1']);
  });

  it('gleiche Antworten zählen nur einmal und nie als falsche', () => {
    const m = leichtKarten([karte('A', 'Gleich.'), karte('B', 'gleich'), karte('C', 'c'), karte('D', 'd')], { automatisch: true });
    // A: die eigene Antwort „gleich“ fällt weg → nur c, d; C: „Gleich.“ und „gleich“ zählen einmal → nur 2 verschiedene
    expect(m.size).toBe(0);
    const mehr = leichtKarten([karte('A', 'Gleich.'), karte('B', 'gleich'), karte('C', 'c'), karte('D', 'd'), karte('E', 'e')], {
      automatisch: true,
    });
    expect([...mehr.get('A')!.falsch].sort()).toEqual(['c', 'd', 'e']);
    expect(mehr.get('C')!.falsch.filter((f) => mcNorm(f) === 'gleich')).toHaveLength(1);
  });

  it('mc-Block hat Vorrang und gilt auch ohne Automatik und für anwendung; nie für Fachgespräch', () => {
    const mc = { richtig: 'r', falsch: ['f1', 'f2', 'f3'] as [string, string, string], erklaerung: 'weil' };
    const cards = [...deck, karte('M', 'x'.repeat(500), { typ: 'anwendung', mc }), karte('M2', 'kurz', { kind: 'fachgespraech', mc })];
    const ohne = leichtKarten(cards, { automatisch: false });
    expect([...ohne.keys()]).toEqual(['M']);
    expect(ohne.get('M')).toEqual({ art: 'mc', richtig: 'r', falsch: ['f1', 'f2', 'f3'], erklaerung: 'weil' });
    expect(leichtKarten(cards, { automatisch: true }).get('M')!.art).toBe('mc');
  });

  it('Prüferfragen: andere Prüferfragen desselben Themas', () => {
    const pf = (id: string, topicId: string) =>
      karte(id, `Antwort ${id}`, { kind: 'prueferfrage', deckId: undefined, typ: undefined, topicId });
    const m = leichtKarten([pf('P1', '01'), pf('P2', '01'), pf('P3', '01'), pf('P4', '01'), pf('Q1', '02')], { automatisch: true });
    expect([...m.keys()]).toEqual(['P1', 'P2', 'P3', 'P4']);
  });

  it('Einstellung: fehlt = an', () => {
    expect(leichtAutomatischAn({})).toBe(true);
    expect(leichtAutomatischAn({ leichtAutomatisch: true })).toBe(true);
    expect(leichtAutomatischAn({ leichtAutomatisch: false })).toBe(false);
  });
});

describe('kartenOptionen', () => {
  const pruefe = (l: LeichtKarte, seed: number) => {
    const o = kartenOptionen(l, seeded(seed));
    expect(o).toHaveLength(4);
    expect(o.filter((x) => x.richtig)).toEqual([{ text: l.richtig, richtig: true }]);
    expect(new Set(o.map((x) => mcNorm(x.text))).size).toBe(4);
    for (const x of o.filter((y) => !y.richtig)) expect(l.falsch).toContain(x.text);
    return o;
  };

  it('genau 4, die richtige dabei, keine doppelt (mc und automatisch, viele Seeds)', () => {
    const mc: LeichtKarte = { art: 'mc', richtig: 'r', falsch: ['a', 'b', 'c'] };
    const auto: LeichtKarte = { art: 'automatisch', richtig: 'r', falsch: ['a', 'b', 'c', 'd', 'e', 'f'] };
    const plaetze = new Set<number>();
    const gezogen = new Set<string>();
    for (let s = 1; s <= 200; s++) {
      plaetze.add(pruefe(mc, s).findIndex((x) => x.richtig));
      for (const x of pruefe(auto, s)) gezogen.add(x.text);
    }
    expect(plaetze).toEqual(new Set([0, 1, 2, 3])); // gemischt: die richtige steht mal hier, mal da
    expect(gezogen.size).toBe(7); // aus dem Pool wird abwechselnd gezogen
  });

  it('mit dem echten Inhalt: jede unterstützte Karte bekommt 4 verschiedene Antworten', () => {
    const c = loadContent(CONTENT_DIR);
    const m = leichtKarten(c.flashcards, { automatisch: true });
    expect(m.size).toBeGreaterThan(150);
    let s = 1;
    for (const l of m.values()) pruefe(l, s++);
  });
});

describe('leichtZahlen (Filteranzeige)', () => {
  it('zählt unterstützte Karten nach Quelle', () => {
    const m = new Map<string, LeichtKarte>([
      ['A', { art: 'mc', richtig: 'r', falsch: ['a', 'b', 'c'] }],
      ['B', { art: 'automatisch', richtig: 'r', falsch: ['a', 'b', 'c'] }],
    ]);
    expect(leichtZahlen([{ id: 'A' }, { id: 'B' }, { id: 'C' }], m)).toEqual({ gesamt: 3, mc: 1, automatisch: 1 });
  });

  it('ausgeschaltete Prüferfragen fallen auch im Leicht-Modus weg', () => {
    const pf = (id: string) => karte(id, `Antwort ${id}`, { kind: 'prueferfrage', deckId: undefined, typ: undefined, topicId: '01' });
    const cards = [pf('P1'), pf('P2'), pf('P3'), pf('P4'), karte('A', 'a'), karte('B', 'b'), karte('C', 'c'), karte('D', 'd')];
    const pool = cardPool(cards, { prueferfragen: false, fachgespraech: true });
    expect(leichtZahlen(pool, leichtKarten(pool, { automatisch: true }))).toEqual({ gesamt: 4, mc: 0, automatisch: 4 });
  });
});
