import { describe, expect, it } from 'vitest';
import { closestMatch, levenshtein, translateError } from '../src/sql/errors';

const schema = {
  tables: ['kunde', 'produkt', 'bestellung', 'bestellposition'],
  columns: [
    'kunden_id',
    'name',
    'ort',
    'registriert_am',
    'produkt_id',
    'bezeichnung',
    'kategorie',
    'preis',
    'bestell_id',
    'bestelldatum',
    'menge',
  ],
};

describe('closestMatch / levenshtein', () => {
  it('berechnet die Editierdistanz', () => {
    expect(levenshtein('kunden', 'kunde')).toBe(1);
    expect(levenshtein('preis', 'preis')).toBe(0);
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('ort', 'rot')).toBe(2);
  });

  it('findet den ähnlichsten Namen, aber nicht um jeden Preis', () => {
    expect(closestMatch('kunden', schema.tables)).toBe('kunde');
    expect(closestMatch('Produkte', schema.tables)).toBe('produkt');
    expect(closestMatch('bestelungen', schema.tables)).toBe('bestellung');
    expect(closestMatch('mitarbeiter', schema.tables)).toBeUndefined();
    expect(closestMatch('x', [])).toBeUndefined();
  });
});

describe('translateError', () => {
  it('no such table: mit Vorschlag und Liste', () => {
    const h = translateError('no such table: kunden', schema);
    expect(h).toContain('Tabelle `kunden` gibt es nicht.');
    expect(h).toContain('Meintest du `kunde`?');
    expect(h).toContain('Verfügbar: kunde, produkt, bestellung, bestellposition.');
  });

  it('no such column: mit Vorschlag, auch bei qualifizierten Namen', () => {
    expect(translateError('no such column: nme', schema)).toBe(
      'Spalte `nme` unbekannt. Tippfehler oder Tabellenalias vergessen? Meintest du `name`?',
    );
    expect(translateError('no such column: k.prei', schema)).toContain('Meintest du `preis`?');
    expect(translateError('no such column: umsatz', schema)).not.toContain('Meintest du');
  });

  it('ambiguous column name', () => {
    expect(translateError('ambiguous column name: kunden_id', schema)).toBe(
      '`kunden_id` gibt es in mehreren Tabellen – mit Alias qualifizieren, z. B. `k.kunden_id`.',
    );
  });

  it('Aggregat in WHERE (beide SQLite-Varianten)', () => {
    expect(translateError('misuse of aggregate: COUNT()', schema)).toContain('HAVING');
    expect(translateError('misuse of aggregate function COUNT()', schema)).toContain('HAVING');
  });

  it('Syntaxfehler', () => {
    expect(translateError('near "SELEC": syntax error', schema)).toMatch(/^Syntaxfehler bei `SELEC`/);
    expect(translateError('incomplete input', schema)).toContain('Klammer');
    expect(translateError(`unrecognized token: "'abc"`, schema)).toContain('einfachen Anführungszeichen');
  });

  it('unbekannte Funktionen: Datumsfunktionen → strftime', () => {
    expect(translateError('no such function: YEAR', schema)).toBe("Diese Funktion kennt SQLite nicht – nutze `strftime('%Y', datum)`.");
    expect(translateError('no such function: month', schema)).toContain("strftime('%m', datum)");
    expect(translateError('no such function: DATE_FORMAT', schema)).toContain('strftime');
    expect(translateError('no such function: CONCAT', schema)).toContain('||');
    expect(translateError('no such function: FOO', schema)).toContain('`FOO`');
  });

  it('Constraints mit Erklärung', () => {
    expect(translateError('UNIQUE constraint failed: kunde.kunden_id', schema)).toMatch(
      /Eindeutigkeit verletzt.*`kunde\.kunden_id`.*Primärschlüssel/,
    );
    expect(translateError('FOREIGN KEY constraint failed', schema)).toMatch(/Referenzielle Integrität/);
    expect(translateError('NOT NULL constraint failed: kunde.name', schema)).toContain('`kunde.name` ist ein Pflichtfeld');
    expect(translateError('CHECK constraint failed: erstattung >= 0', schema)).toContain('`erstattung >= 0`');
  });

  it('weitere typische Fehler', () => {
    expect(translateError('table kunde has 4 columns but 1 values were supplied', schema)).toContain('4 Spalten');
    expect(translateError('1 values for 2 columns', schema)).toContain('1 Werte für 2 Spalten');
    expect(translateError('table kunde already exists', schema)).toContain('IF NOT EXISTS');
    expect(translateError('HAVING clause on a non-aggregate query', schema)).toContain('GROUP BY');
    expect(translateError('sub-select returns 2 columns - expected 1', schema)).toContain('2 Spalten');
    expect(translateError('SELECTs to the left and right of UNION do not have the same number of result columns', schema)).toContain(
      'UNION',
    );
    expect(translateError('Abfrage nach 3 s abgebrochen – Endlosschleife?', schema)).toContain('zu lange');
  });

  it('liefert für Unbekanntes einen allgemeinen Hinweis und kommt ohne Schema aus', () => {
    expect(translateError('something odd')).toContain('SQLite meldet einen Fehler');
    expect(translateError('no such table: x')).toBe('Tabelle `x` gibt es nicht.');
  });
});
