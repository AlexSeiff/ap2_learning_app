import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { answerToMarkdown, parseLernkarten, topicFromSource } from '../shared/lernkarten';
import { loadContent } from '../server/loadContent';

// Fixture im Format von AP2_FIDPA_Lernkarten.json (3 Decks, 7 Karten) – die echte Datei prüft inhalte.smoke.test.ts grob.
const FIXTURES = join(import.meta.dirname, 'fixtures', 'inhalt');
const content = loadContent(FIXTURES);
const cards = content.flashcards.filter((c) => c.kind === 'lernkarte');

describe('Lernkarten-Format (tests/fixtures/inhalt/AP2_FIDPA_Lernkarten.json)', () => {
  it('importiert alle Karten und Decks ohne Hinweise', () => {
    expect(content.issues).toEqual([]);
    expect(cards.map((c) => c.id)).toEqual(['SQL-001', 'SQL-002', 'SQL-003', 'WI-001', 'WI-002', 'WS1-001', 'WS1-002']);
    expect(content.decks.map((d) => [d.id, d.cardCount, d.status])).toEqual([
      ['sql', 3, 'behandelt'],
      ['wi', 2, 'behandelt'],
      ['ws1', 2, 'offen'],
    ]);
    expect(content.decks[0]).toMatchObject({ title: 'SQL', area: 'Sicherstellen der Datenqualität', source: 'Deep Dive 1' });
  });

  it('übernimmt Typ, Schwierigkeit und Tags', () => {
    const byTyp = (t: string) => cards.filter((c) => c.typ === t).length;
    expect([byTyp('wissen'), byTyp('abgrenzung'), byTyp('rechnung'), byTyp('anwendung'), byTyp('falle')]).toEqual([2, 1, 1, 1, 2]);
    expect(cards.find((c) => c.id === 'WI-001')).toMatchObject({ deckId: 'wi', typ: 'rechnung', schwierigkeit: 3, tags: ['amortisation'] });
    expect(cards.find((c) => c.id === 'WI-002')?.tags).toEqual([]);
  });

  it('macht aus SQL-Zeilen der Antwort einen Codeblock', () => {
    const answer = cards.find((c) => c.id === 'SQL-002')?.answer;
    expect(answer).toBe(answerToMarkdown(
      'SELECT k.name\nFROM kunde k\nLEFT JOIN bestellung b ON b.kunden_id = k.kunden_id\nWHERE b.bestell_id IS NULL\nAlternative: NOT EXISTS',
    ));
    expect(answer).toMatch(/^```sql\nSELECT k\.name\n/);
    expect(answer).toMatch(/Alternative: NOT EXISTS/);
  });

  it('ordnet Decks den Deep Dives zu, WiSo & Co. bleiben ohne Deep Dive', () => {
    // Im Fixture-Ordner gibt es nur Deep Dive 1 – „Deep Dive 5 und 12" findet dort kein Thema.
    expect(content.decks.map((d) => d.topicId)).toEqual(['01', undefined, undefined]);
    const topics = new Map([['01', 'SQL'], ['05', 'Prozessanalyse & Prozessmodellierung'], ['12', 'Projektmanagement & Wirtschaftlichkeit']]);
    const parsed = parseLernkarten('x.json', readFileSync(join(FIXTURES, 'AP2_FIDPA_Lernkarten.json'), 'utf8'), topics);
    const topicOf = (id: string) => parsed.decks.find((d) => d.id === id)?.topicId;
    expect(topicOf('sql')).toBe('01');
    expect(topicOf('wi')).toBe('12'); // Titel „Wirtschaftlichkeit" passt zu Projektmanagement & Wirtschaftlichkeit
    expect(topicOf('ws1')).toBeUndefined();
    expect(parsed.cards.filter((c) => c.deckId === 'wi').every((c) => c.topicId === '12')).toBe(true);
  });

  it('übernimmt die Lernhinweise aus meta', () => {
    expect(content.cardHints).toEqual(['Karten vom Typ „falle“ vor jeder Übungsklausur wiederholen.', 'Rechenkarten auf Papier nachrechnen.']);
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
