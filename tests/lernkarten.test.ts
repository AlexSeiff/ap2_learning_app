import { describe, expect, it } from 'vitest';
import { answerToMarkdown, parseLernkarten, topicFromSource } from '../shared/lernkarten';
import { loadContent } from '../server/loadContent';

const content = loadContent();
const cards = content.flashcards.filter((c) => c.kind === 'lernkarte');

describe('Lernkarten-Datei AP2_FIDPA_Lernkarten.json', () => {
  it('importiert alle 407 Karten in 24 Decks ohne Hinweise', () => {
    expect(cards).toHaveLength(407);
    expect(content.decks).toHaveLength(24);
    expect(content.issues).toEqual([]);
    expect(new Set(cards.map((c) => c.id)).size).toBe(407);
  });

  it('übernimmt Typ, Schwierigkeit und Tags', () => {
    const byTyp = (t: string) => cards.filter((c) => c.typ === t).length;
    expect([byTyp('wissen'), byTyp('abgrenzung'), byTyp('rechnung'), byTyp('anwendung'), byTyp('falle')]).toEqual([216, 55, 26, 48, 62]);
    expect(cards.every((c) => c.schwierigkeit && c.schwierigkeit >= 1 && c.schwierigkeit <= 3)).toBe(true);
    expect(cards.find((c) => c.id === 'ORG-001')?.tags?.length).toBeGreaterThan(0);
  });

  it('ordnet Decks den Deep Dives zu, WiSo & Co. bleiben ohne Deep Dive', () => {
    const topicOf = (id: string) => content.decks.find((d) => d.id === id)?.topicId;
    expect(topicOf('sql')).toBe('01');
    expect(topicOf('its')).toBe('10');
    expect(topicOf('alg')).toBe('11');
    expect(topicOf('wi')).toBe('12'); // „Deep Dive 5 und 12" → Titel passt zu Projektmanagement & Wirtschaftlichkeit
    expect(topicOf('ws1')).toBeUndefined();
    expect(topicOf('org')).toBeUndefined();
    expect(content.decks.filter((d) => d.status === 'offen').every((d) => !d.topicId)).toBe(true);
  });

  it('übernimmt die Lernhinweise aus meta', () => {
    expect(content.cardHints.some((h) => h.includes('falle'))).toBe(true);
  });
});

describe('Hilfsfunktionen', () => {
  const topics = new Map([['05', 'Prozessanalyse & Prozessmodellierung'], ['12', 'Projektmanagement & Wirtschaftlichkeit']]);

  it('topicFromSource', () => {
    expect(topicFromSource('Deep Dive 5 + BPMN-Vertiefung', 'Prozessanalyse', topics)).toBe('05');
    expect(topicFromSource('Deep Dive 5 und 12', 'Wirtschaftlichkeit', topics)).toBe('12');
    expect(topicFromSource('Themenliste', 'WiSo', topics)).toBeUndefined();
  });

  it('answerToMarkdown macht aus SQL-Zeilen einen Codeblock, Text bleibt Text', () => {
    const md = answerToMarkdown('SELECT a\nFROM t\nAlternative: ohne JOIN');
    expect(md).toBe('```sql\nSELECT a\nFROM t\n```\n\nAlternative: ohne JOIN');
    expect(answerToMarkdown('Zeile 1\nZeile 2')).toBe('Zeile 1  \nZeile 2');
    expect(answerToMarkdown('einzeilig')).toBe('einzeilig');
  });

  it('meldet kaputte Dateien und doppelte IDs statt abzustürzen', () => {
    expect(parseLernkarten('x.json', '{kaputt', topics).issues[0].message).toMatch(/Ungültiges JSON/);
    const json = JSON.stringify({
      decks: [{ id: 'd', titel: 'D', quelle: 'Themenliste', anzahl_karten: 3, karten: [
        { id: 'A-1', frage: 'F', antwort: 'A', typ: 'wissen' },
        { id: 'A-1', frage: 'F2', antwort: 'A2', typ: 'wissen' },
        { id: 'A-2', frage: 'F3', antwort: 'A3', typ: 'quatsch' },
      ] }],
    });
    const r = parseLernkarten('x.json', json, topics);
    expect(r.cards.map((c) => c.id)).toEqual(['A-1', 'A-2']);
    expect(r.issues.map((i) => i.message)).toEqual([
      'Doppelte Karten-ID A-1 übersprungen.',
      'Karte A-2: unbekannter Typ „quatsch".',
      'Deck „d": 2 Karten importiert, laut Datei 3.',
    ]);
  });
});
