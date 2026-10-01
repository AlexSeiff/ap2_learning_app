import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { defaultSettings, emptyProgress } from '../shared/progress';
import type { Content } from '../shared/types';
import { CONTENT_DIR, loadContent } from '../server/loadContent';
import { ConfirmContext } from '../src/hooks/useConfirm';
import {
  baueGlossar,
  begriffAusFrage,
  begriffeAusZeile,
  glossarBuchstaben,
  glossarSchluessel,
  glossarSuchEintraege,
  guteDefinition,
  pruefeBegriff,
} from '../src/lib/glossar';
import { baueSuchIndex, suche } from '../src/lib/suche';

// Glossar (ROADMAP 8.9): Begriffe aus Karten und Lernblättern, Zusammenlegen, Sortierung, Seite und Suche.

const content = loadContent(CONTENT_DIR);
const progress = emptyProgress();

vi.mock('../src/lib/store', () => ({
  useStore: () => ({ content, progress, update: () => {}, aiEnabled: false, aiModel: '' }),
}));

const { Glossar } = await import('../src/pages/Glossar');
const { Material } = await import('../src/pages/Material');

function render(path: string): string {
  const routes = createElement(
    Routes,
    null,
    createElement(Route, { path: '/material/glossar', element: createElement(Glossar) }),
    createElement(Route, { path: '/material', element: createElement(Material) }),
  );
  const app = createElement(MemoryRouter, { initialEntries: [path] }, routes);
  return renderToString(createElement(ConfirmContext.Provider, { value: async () => true }, app)).replace(/<!-- -->/g, '');
}

const glossar = baueGlossar(content);

describe('Begriffe erkennen (rein)', () => {
  it('aus Kartenfragen', () => {
    expect(begriffAusFrage('Was ist eine funktionale Abhängigkeit?')).toBe('funktionale Abhängigkeit');
    expect(begriffAusFrage('Was ist der Interquartilsabstand, und warum ist er robust?')).toBe('Interquartilsabstand');
    expect(begriffAusFrage('Wofür steht ACID?')).toBe('ACID');
    expect(begriffAusFrage('Was versteht man unter Scope Creep?')).toBe('Scope Creep');
    expect(begriffAusFrage('Was bedeutet referenzielle Integrität, und welche Löschoptionen gibt es?')).toBe('referenzielle Integrität');
    expect(begriffAusFrage('Was sind Entität, Attribut und Beziehung im ERM?')).toBeUndefined();
    expect(begriffAusFrage('Was ist bei externen Dienstleistern zwingend erforderlich?')).toBeUndefined();
    expect(begriffAusFrage('Wie berechnest du b und a?')).toBeUndefined();
  });

  it('prüft fette Begriffe: Fachbegriffe ja, Ergebnisse, Sätze und Betonungen nein', () => {
    for (const ok of [
      'Median',
      'OLAP',
      'k-Means',
      '3. Normalform',
      'Drittvariable (Confounder)',
      'funktionale Abhängigkeit'.replace('f', 'F'),
    ])
      expect(pruefeBegriff(ok), ok).toBeDefined();
    expect(pruefeBegriff('Median:')).toBe('Median');
    for (const nein of [
      'A1 (6 P)',
      'Σ 25',
      '70,00 Minuten',
      'nicht',
      'Drei',
      'Achtung',
      'Datum gibt es nicht',
      'Art. 25',
      'Die klassische Falle',
      'Amtszeit: 4 Jahre',
      'x = 5',
    ])
      expect(pruefeBegriff(nein), nein).toBeUndefined();
  });

  it('Definition aus der Zeile: Doppelpunkt, Gedankenstrich, Satz, Tabelle; sonst ohne', () => {
    expect(begriffeAusZeile('- **Median:** der mittlere Wert der sortierten Reihe')).toEqual([
      { begriff: 'Median', definition: 'der mittlere Wert der sortierten Reihe' },
    ]);
    expect(begriffeAusZeile('**OLTP** – operative Systeme für viele kleine Transaktionen')[0]).toEqual({
      begriff: 'OLTP',
      definition: 'operative Systeme für viele kleine Transaktionen',
    });
    expect(begriffeAusZeile('**Scheinkorrelation** bezeichnet einen Zusammenhang ohne Ursache.')[0].definition).toBe(
      '**Scheinkorrelation** bezeichnet einen Zusammenhang ohne Ursache.',
    );
    expect(begriffeAusZeile('| **Kernprozess** | schafft direkt Wert für den Kunden |')).toEqual([
      { begriff: 'Kernprozess', definition: 'schafft direkt Wert für den Kunden' },
    ]);
    expect(begriffeAusZeile('Der **Median** ist robust, der **Mittelwert** nicht.')).toEqual([
      { begriff: 'Median', imSatz: true },
      { begriff: 'Mittelwert', imSatz: true },
    ]);
    expect(begriffeAusZeile('**AG:** **50.000 €**')).toEqual([{ begriff: 'AG' }]);
    expect(guteDefinition('**50.000 €**')).toBe(false);
  });
});

describe('Glossar aus content/', () => {
  it('Umfang, keine Doppelten, deutsch sortiert, Buchstaben passen', () => {
    expect(glossar.length).toBeGreaterThan(400);
    expect(glossar.filter((e) => e.definition).length).toBeGreaterThan(300);
    const keys = glossar.map((e) => glossarSchluessel(e.begriff));
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(glossar.map((e) => e.id)).size).toBe(glossar.length);
    const collator = new Intl.Collator('de', { sensitivity: 'base', numeric: true });
    for (let i = 1; i < glossar.length; i++) expect(collator.compare(glossar[i - 1].begriff, glossar[i].begriff)).toBeLessThanOrEqual(0);
    for (const e of glossar) expect(e.buchstabe).toMatch(/^[A-Z#]$/);
    expect(glossar.find((e) => e.begriff.startsWith('Ä'))?.buchstabe ?? 'A').toBe('A');
  });

  it('enthält Kernbegriffe, Kartendefinitionen haben Vorrang', () => {
    const finde = (b: string) => glossar.find((e) => glossarSchluessel(e.begriff) === glossarSchluessel(b));
    for (const b of ['ACID', 'Median', 'Interquartilsabstand', 'Data Mart', 'Pseudonymisierung', 'Kritischer Pfad'])
      expect(finde(b), b).toBeDefined();
    expect(finde('ACID')).toMatchObject({ definitionAus: 'karte' });
    expect(finde('Interquartilsabstand')?.definition).toBeTruthy();
  });

  it('jede Fundstelle führt zu einem Abschnitt oder einer Karte', () => {
    const sektionen = new Set(content.topics.flatMap((t) => t.sections.map((s) => `/lernen/${t.id}?stelle=${encodeURIComponent(s.id)}`)));
    const karten = new Set(content.flashcards.map((c) => `/karteikarten?karten=${encodeURIComponent(c.id)}&von=suche`));
    for (const e of glossar) {
      expect(e.quellen.length).toBeGreaterThan(0);
      for (const q of e.quellen) expect(sektionen.has(q.link) || karten.has(q.link), q.link).toBe(true);
    }
  });

  it('legt Karte und Lernblatt zusammen (gleicher Begriff, Klammerzusatz egal)', () => {
    const mini = {
      ...content,
      topics: [
        {
          id: '99',
          number: 99,
          title: 'Test',
          file: 'x.md',
          lernziele: [],
          sections: [
            {
              id: '99-a',
              title: 'A',
              level: 2,
              markdown: '- **OLAP (Online Analytical Processing):** Auswertungssysteme für Analysen\n\nDer **OLAP**-Würfel …',
            },
          ],
        },
      ],
      flashcards: [
        { id: 'K1', kind: 'lernkarte', typ: 'wissen', question: 'Was ist OLAP?', answer: 'Analytische Verarbeitung großer Datenmengen.' },
      ],
      decks: [],
    } as unknown as Content;
    const g = baueGlossar(mini);
    expect(g).toHaveLength(1);
    expect(g[0]).toMatchObject({ begriff: 'OLAP', definition: 'Analytische Verarbeitung großer Datenmengen.', definitionAus: 'karte' });
    expect(g[0].quellen.map((q) => q.link)).toEqual(['/karteikarten?karten=K1&von=suche', '/lernen/99?stelle=99-a']);
  });

  it('Buchstabenleiste A–Z mit Anzahl', () => {
    const abc = glossarBuchstaben(glossar);
    expect(abc.filter((b) => b.buchstabe !== '#')).toHaveLength(26);
    expect(abc.reduce((s, b) => s + b.anzahl, 0)).toBe(glossar.length);
  });
});

describe('Suche und Seiten', () => {
  it('Glossareinträge sind in der Suche und führen zum Eintrag', () => {
    const index = baueSuchIndex(content, defaultSettings(), glossarSuchEintraege(glossar));
    const acid = suche(index, 'ACID')[0];
    expect(acid.eintrag.art).toBe('glossar');
    expect(acid.eintrag.link).toMatch(/^\/material\/glossar\?stelle=g-/);
  });

  it('Seite mit Sprungleiste, Ankern und Fundstellen; Kachel unter Material', () => {
    const html = render('/material/glossar');
    expect(html).toContain('📚 Glossar');
    expect(html).toContain('aria-label="Buchstaben"');
    expect(html).toContain('id="buchstabe-A"');
    for (const e of glossar.slice(0, 20)) expect(html).toContain(`id="g-${e.id}"`);
    expect(html).toContain('/lernen/');
    expect(render('/material')).toContain('href="/material/glossar"');
  });
});
