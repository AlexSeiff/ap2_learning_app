import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type Anthropic from '@anthropic-ai/sdk';
import {
  baueMcPrompt,
  entwerfeMc,
  ergaenzeEntwurf,
  leererEntwurf,
  leseEntwurf,
  MC_JE_ANFRAGE,
  mcClientAusAnthropic,
  mcKandidaten,
  pruefeMcAntwort,
  uebernehmeMc,
  type Entwurf,
  type EntwurfEintrag,
  type McAntwort,
  type McClient,
  type RohLernkarten,
} from '../server/mcWerkzeug';

// Kein echter API-Aufruf: der Client ist in allen Tests eine Attrappe.

const daten = (): RohLernkarten => ({
  meta: { titel: 'Test' },
  decks: [
    {
      id: 'sql',
      titel: 'SQL',
      pruefungsbereich: 'Datenqualität',
      karten: [
        { id: 'SQL-001', frage: 'Projektion?', antwort: 'Spalten auswählen.', typ: 'wissen', schwierigkeit: 1, tags: ['select'] },
        { id: 'SQL-002', frage: 'Kunden ohne Bestellung?', antwort: 'LEFT JOIN … IS NULL', typ: 'anwendung', tags: [] },
        { id: 'SQL-003', frage: 'WHERE vs. HAVING?', antwort: 'WHERE filtert Zeilen, HAVING Gruppen.', typ: 'abgrenzung', tags: [] },
        {
          id: 'SQL-004',
          frage: 'COUNT(*) in WHERE?',
          antwort: 'Gehört in HAVING.',
          typ: 'falle',
          tags: [],
          mc: { richtig: 'a', falsch: ['b', 'c', 'd'] },
        },
      ],
    },
    { id: 'wi', titel: 'Wirtschaftlichkeit', karten: [{ id: 'WI-001', frage: 'ROI?', antwort: 'Gewinn / Kapital', typ: 'rechnung' }] },
  ],
});

const eintrag = (id: string, status: EntwurfEintrag['status'] = 'angenommen'): EntwurfEintrag => ({
  id,
  deck: 'sql',
  frage: 'F',
  antwort: 'A',
  status,
  mc: { richtig: `richtig ${id}`, falsch: ['x', 'y', 'z'] },
});

describe('mcKandidaten', () => {
  it('nimmt Karten des Decks mit passendem Typ, ohne mc und noch nicht im Entwurf', () => {
    expect(mcKandidaten(daten(), 'sql', leererEntwurf()).map((k) => k.id)).toEqual(['SQL-001', 'SQL-003']);
    expect(mcKandidaten(daten(), 'sql', leererEntwurf(), { anwendung: true }).map((k) => k.id)).toEqual(['SQL-001', 'SQL-002', 'SQL-003']);
    const entwurf: Entwurf = { ...leererEntwurf(), eintraege: [eintrag('SQL-001', 'abgelehnt')] };
    expect(mcKandidaten(daten(), 'sql', entwurf).map((k) => k.id)).toEqual(['SQL-003']);
    expect(mcKandidaten(daten(), 'gibtsnicht', leererEntwurf())).toEqual([]);
  });
});

describe('baueMcPrompt', () => {
  it('enthält Deck, IDs, Fragen und Musterantworten der Karten', () => {
    const d = daten().decks[0];
    const p = baueMcPrompt(d, [d.karten[0], d.karten[2]]);
    expect(p).toContain('<deck id="sql" titel="SQL" pruefungsbereich="Datenqualität">');
    expect(p).toContain('<karte id="SQL-001" typ="wissen">');
    expect(p).toContain('<musterantwort>WHERE filtert Zeilen, HAVING Gruppen.</musterantwort>');
    expect(p).not.toContain('SQL-002');
    expect(p).toMatch(/für jede der 2 Karten/);
  });
});

describe('pruefeMcAntwort', () => {
  const karten = daten().decks[0].karten.slice(0, 3);
  it('übernimmt gültige Vorschläge als „offen“ und meldet den Rest', () => {
    const antwort: McAntwort = {
      karten: [
        {
          id: 'SQL-001',
          richtig: 'Spalten wählen',
          falsch: ['Zeilen filtern', 'Tabellen verbinden', 'Gruppen bilden'],
          erklaerung: 'Weil …',
        },
        { id: 'SQL-001', richtig: 'doppelt', falsch: ['a', 'b', 'c'], erklaerung: '' },
        { id: 'SQL-002', richtig: 'x', falsch: ['y', 'y', 'z'], erklaerung: '' },
        { id: 'XYZ-9', richtig: 'x', falsch: ['a', 'b', 'c'], erklaerung: '' },
      ],
    };
    const r = pruefeMcAntwort(antwort, 'sql', karten);
    expect(r.eintraege).toEqual([
      {
        id: 'SQL-001',
        deck: 'sql',
        frage: 'Projektion?',
        antwort: 'Spalten auswählen.',
        status: 'offen',
        mc: { richtig: 'Spalten wählen', falsch: ['Zeilen filtern', 'Tabellen verbinden', 'Gruppen bilden'], erklaerung: 'Weil …' },
      },
    ]);
    expect(r.fehler).toEqual([
      'SQL-001: doppelt – nur der erste Vorschlag zählt.',
      'SQL-002: Vorschlag verworfen (falsch: falsche Antworten doppelt).',
      'XYZ-9: nicht angefragt – ignoriert.',
      'SQL-003: kein Vorschlag erhalten.',
    ]);
  });

  it('verwirft Vorschläge mit zu wenigen falschen oder der richtigen unter den falschen', () => {
    const r = pruefeMcAntwort(
      {
        karten: [
          { id: 'SQL-001', richtig: 'a', falsch: ['b', 'c'], erklaerung: '' },
          { id: 'SQL-003', richtig: 'a', falsch: ['A', 'c', 'd'], erklaerung: '' },
        ],
      },
      'sql',
      karten.slice(0, 1).concat(karten[2]),
    );
    expect(r.eintraege).toEqual([]);
    expect(r.fehler).toHaveLength(2);
  });
});

describe('entwerfeMc mit Attrappe des Clients', () => {
  it('fragt in Portionen an und sammelt Vorschläge und Fehler', async () => {
    const deck = daten().decks[0];
    const karten = Array.from({ length: MC_JE_ANFRAGE + 2 }, (_, i) => ({
      id: `K-${i}`,
      frage: `F${i}`,
      antwort: `A${i}`,
      typ: 'wissen',
    }));
    const calls: string[] = [];
    const client: McClient = {
      parse: vi.fn(async ({ user, model, system }) => {
        calls.push(user);
        expect(model).toBe('test-modell');
        expect(system).toMatch(/genau 3 plausible/);
        const ids = [...user.matchAll(/<karte id="([^"]+)"/g)].map((m) => m[1]);
        if (calls.length === 2) return { stop_reason: 'max_tokens', parsed_output: null };
        return {
          stop_reason: 'end_turn',
          parsed_output: { karten: ids.map((id) => ({ id, richtig: `r ${id}`, falsch: ['f1', 'f2', 'f3'], erklaerung: '' })) },
        };
      }),
    };
    const r = await entwerfeMc(client, 'test-modell', deck, karten);
    expect(client.parse).toHaveBeenCalledTimes(2);
    expect(r.eintraege).toHaveLength(MC_JE_ANFRAGE);
    expect(r.eintraege[0]).toMatchObject({ id: 'K-0', status: 'offen', mc: { richtig: 'r K-0', falsch: ['f1', 'f2', 'f3'] } });
    expect(r.eintraege[0].mc).not.toHaveProperty('erklaerung');
    expect(r.fehler).toEqual([`K-${MC_JE_ANFRAGE}, K-${MC_JE_ANFRAGE + 1}: Antwort abgeschnitten`]);
  });

  it('mcClientAusAnthropic schickt strukturierte Ausgabe über messages.parse', async () => {
    const parse = vi.fn(async () => ({ stop_reason: 'end_turn', parsed_output: { karten: [] } }));
    const client = mcClientAusAnthropic({ messages: { parse } } as unknown as Anthropic);
    const r = await client.parse({ model: 'm', max_tokens: 100, system: 'S', user: 'U' });
    expect(r).toEqual({ stop_reason: 'end_turn', parsed_output: { karten: [] } });
    const body = (parse.mock.calls[0] as unknown[])[0] as Record<string, unknown>;
    expect(body).toMatchObject({ model: 'm', max_tokens: 100, system: 'S', messages: [{ role: 'user', content: 'U' }] });
    expect(body.output_config).toHaveProperty('format');
  });
});

describe('Entwurfsdatei', () => {
  it('ergaenzeEntwurf hängt nur neue IDs an, durchgesehene Einträge bleiben', () => {
    const alt: Entwurf = { ...leererEntwurf(), eintraege: [eintrag('SQL-001', 'angenommen')] };
    const neu = ergaenzeEntwurf(alt, [eintrag('SQL-001', 'offen'), eintrag('SQL-003', 'offen')]);
    expect(neu.eintraege.map((e) => [e.id, e.status])).toEqual([
      ['SQL-001', 'angenommen'],
      ['SQL-003', 'offen'],
    ]);
  });

  it('leseEntwurf liest gültige Einträge und meldet kaputte', () => {
    const json = JSON.stringify({
      eintraege: [
        eintrag('A-1'),
        { ...eintrag('A-2'), status: 'vielleicht' },
        { ...eintrag('A-3'), mc: { richtig: 'a', falsch: ['a', 'b', 'c'] } },
      ],
    });
    const r = leseEntwurf(json);
    expect(r.entwurf.eintraege.map((e) => e.id)).toEqual(['A-1']);
    expect(r.fehler).toHaveLength(2);
    expect(leseEntwurf('{kaputt').fehler[0]).toMatch(/kein gültiges JSON/);
  });
});

describe('uebernehmeMc', () => {
  const text = JSON.stringify(daten(), null, 2);
  const entwurf = (...e: EntwurfEintrag[]): Entwurf => ({ ...leererEntwurf(), eintraege: e });

  it('trägt nur angenommene Einträge ein, am Ende der Karte; IDs und Reihenfolge bleiben', () => {
    const r = uebernehmeMc(text, entwurf(eintrag('SQL-001'), eintrag('SQL-003', 'offen'), eintrag('WI-001', 'abgelehnt')));
    expect(r.uebernommen).toEqual(['SQL-001']);
    const neu = JSON.parse(r.text) as RohLernkarten;
    expect(neu.decks.flatMap((d) => d.karten.map((k) => k.id))).toEqual(['SQL-001', 'SQL-002', 'SQL-003', 'SQL-004', 'WI-001']);
    expect(Object.keys(neu.decks[0].karten[0])).toEqual(['id', 'frage', 'antwort', 'typ', 'schwierigkeit', 'tags', 'mc']);
    expect(neu.decks[0].karten[0].mc).toEqual({ richtig: 'richtig SQL-001', falsch: ['x', 'y', 'z'] });
    expect(neu.decks[0].karten[2]).not.toHaveProperty('mc');
    // Nur Zeilen hinzugefügt, keine geändert (abgesehen vom Komma nach "tags").
    const alt = text.split('\n');
    const zeilen = r.text.split('\n');
    expect(zeilen.length).toBeGreaterThan(alt.length);
    expect(zeilen.filter((z) => !alt.includes(z)).every((z) => /mc|richtig|falsch|"[xyz]"|^\s*[\]}],?$|"tags": \[$|"select"/.test(z))).toBe(
      true,
    );
  });

  it('lässt vorhandene mc-Blöcke und unbekannte Karten unverändert', () => {
    const r = uebernehmeMc(text, entwurf(eintrag('SQL-004'), eintrag('GIBT-1')));
    expect(r.uebernommen).toEqual([]);
    expect(r.text).toBe(text);
    expect(r.hinweise).toEqual([
      'SQL-004: hat schon einen mc-Block – unverändert.',
      'GIBT-1: Karte gibt es in der Datei nicht – übersprungen.',
    ]);
  });

  it('behält Zeilenenden, Schluss-Zeilenumbruch und BOM', () => {
    const crlf = '﻿' + text.replace(/\n/g, '\r\n') + '\r\n';
    const r = uebernehmeMc(crlf, entwurf(eintrag('SQL-003')));
    expect(r.text.startsWith('﻿{\r\n')).toBe(true);
    expect(r.text.endsWith('}\r\n')).toBe(true);
    expect(r.text.replace(/\r\n/g, '').includes('\n')).toBe(false);
  });

  it('ändert nichts an einer Datei, die nicht im Standardformat steht', () => {
    const fixture = readFileSync(join(import.meta.dirname, 'fixtures', 'inhalt', 'AP2_FIDPA_Lernkarten.json'), 'utf8');
    expect(() => uebernehmeMc(fixture, entwurf(eintrag('SQL-001')))).toThrow(/nicht im Standardformat/);
  });

  it('die echte Lernkarten-Datei ist im Standardformat (Übernehmen ändert nur die neuen Zeilen)', () => {
    const echt = readFileSync(join(import.meta.dirname, '..', 'content', 'AP2_FIDPA_Lernkarten.json'), 'utf8');
    const data = JSON.parse(echt) as RohLernkarten;
    const id = data.decks[1].karten[0].id;
    const r = uebernehmeMc(echt, entwurf(eintrag(id)));
    expect(r.uebernommen).toEqual([id]);
    const alt = echt.split('\n');
    const neu = r.text.split('\n');
    expect(neu.length - alt.length).toBe(8);
    expect(uebernehmeMc(echt, entwurf()).text).toBe(echt);
  });
});
