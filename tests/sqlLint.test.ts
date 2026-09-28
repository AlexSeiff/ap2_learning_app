import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { hasBlockingWarning, lintSql } from '../src/sql/lint';

const codes = (sql: string, columns?: string[]) => lintSql(sql, { columns }).map((w) => w.code);

describe('lintSql – GROUP BY', () => {
  it('meldet eine Spalte, die weder gruppiert noch aggregiert ist', () => {
    const w = lintSql('SELECT ort, name, COUNT(*) FROM kunde GROUP BY ort');
    expect(w).toHaveLength(1);
    expect(w[0]).toMatchObject({ code: 'bare-column', blocking: true });
    expect(w[0].message).toContain('`name`');
  });

  it('meldet eine Spalte neben einem Aggregat ohne GROUP BY', () => {
    expect(codes('SELECT name, COUNT(*) FROM kunde')).toEqual(['bare-column']);
  });

  it('bleibt bei korrekten GROUP-BY-Abfragen still', () => {
    for (const sql of [
      'SELECT ort, COUNT(*) AS anzahl FROM kunde GROUP BY ort',
      'SELECT ort, COUNT(*) AS anzahl FROM kunde GROUP BY ort HAVING COUNT(*) > 1',
      'SELECT COUNT(*) FROM kunde',
      'SELECT COUNT(DISTINCT ort) AS orte, MAX(registriert_am) FROM kunde',
      // qualifiziert im SELECT, unqualifiziert im GROUP BY und umgekehrt
      'SELECT k.name, SUM(bp.menge * p.preis) AS umsatz FROM kunde k JOIN bestellung b ON k.kunden_id = b.kunden_id GROUP BY name',
      'SELECT name, COUNT(*) FROM kunde k GROUP BY k.name',
      // Ausdruck im GROUP BY, Alias und Position
      "SELECT strftime('%Y', bestelldatum) AS jahr, COUNT(*) FROM bestellung GROUP BY strftime('%Y', bestelldatum)",
      "SELECT strftime('%Y', bestelldatum) AS jahr, COUNT(*) FROM bestellung GROUP BY jahr",
      'SELECT ort, COUNT(*) FROM kunde GROUP BY 1',
      'SELECT UPPER(ort), COUNT(*) FROM kunde GROUP BY ort',
      "SELECT CASE WHEN preis > 100 THEN 'teuer' ELSE 'günstig' END AS klasse, COUNT(*) FROM produkt GROUP BY klasse",
      // Fensterfunktion ist keine Gruppierung
      'SELECT name, COUNT(*) OVER () AS gesamt FROM kunde',
      'SELECT name, SUM(preis) OVER (PARTITION BY kategorie ORDER BY preis) FROM produkt',
      'SELECT * FROM kunde',
      'SELECT k.* FROM kunde k',
    ]) {
      expect(lintSql(sql), sql).toEqual([]);
    }
  });

  it('meldet nicht gruppierte Spalten in HAVING', () => {
    const w = lintSql("SELECT ort, COUNT(*) FROM kunde GROUP BY ort HAVING registriert_am >= '2025-01-01'");
    expect(w.map((x) => x.code)).toEqual(['bare-column']);
    expect(w[0].message).toContain('HAVING');
    expect(lintSql("SELECT ort, COUNT(*) AS n FROM kunde GROUP BY ort HAVING n > 1 AND ort <> 'Köln'")).toEqual([]);
  });

  it('prüft Unterabfragen getrennt von der äußeren Abfrage', () => {
    // Aggregat nur in der Unterabfrage → außen keine Gruppierung
    expect(codes('SELECT bezeichnung, preis FROM produkt WHERE preis > (SELECT AVG(preis) FROM produkt)')).toEqual([]);
    expect(codes('SELECT name, (SELECT COUNT(*) FROM bestellung b WHERE b.kunden_id = k.kunden_id) AS n FROM kunde k')).toEqual([]);
    // Fehler in der Unterabfrage wird gefunden
    const w = lintSql('SELECT * FROM (SELECT ort, name, COUNT(*) AS n FROM kunde GROUP BY ort) t WHERE n > 1');
    expect(w.map((x) => x.code)).toEqual(['bare-column']);
    expect(w[0].message).toContain('`name`');
  });

  it('ignoriert Kommentare und Texte', () => {
    expect(lintSql('-- SELECT name, COUNT(*) FROM kunde\nSELECT ort FROM kunde WHERE name = \'a "b" -- c\'')).toEqual([]);
    expect(lintSql('/* WHERE anzahl > 1 */ SELECT COUNT(*) AS anzahl FROM kunde')).toEqual([]);
  });
});

describe('lintSql – WHERE', () => {
  it('meldet einen Spaltenalias in WHERE', () => {
    const w = lintSql('SELECT preis * 1.19 AS brutto FROM produkt WHERE brutto > 100');
    expect(w.map((x) => x.code)).toEqual(['alias-in-where']);
    expect(w[0].blocking).toBe(true);
    expect(w[0].message).toContain('preis * 1.19');
  });

  it('meldet Aggregate in WHERE', () => {
    expect(codes('SELECT ort FROM kunde WHERE COUNT(*) > 1 GROUP BY ort')).toEqual(['aggregate-in-where']);
  });

  it('verwechselt echte Spalten nicht mit Aliasen', () => {
    expect(lintSql("SELECT name AS name FROM kunde WHERE name = 'x'")).toEqual([]);
    expect(lintSql('SELECT preis * 2 AS preis FROM produkt WHERE preis > 10')).toEqual([]);
    expect(lintSql('SELECT kategorie AS k FROM produkt WHERE k > 1', { columns: ['kategorie', 'k'] })).toEqual([]);
    expect(lintSql('SELECT k.name AS kunde FROM kunde k WHERE k.name IS NOT NULL')).toEqual([]);
  });

  it('findet die drei Fehler aus DD1 A3', () => {
    const w = lintSql('SELECT ort, COUNT(*) AS anzahl\nFROM kunde\nWHERE anzahl > 1\nGROUP BY name;');
    expect(w.map((x) => x.code).sort()).toEqual(['aggregate-in-where', 'alias-in-where', 'bare-column']);
    expect(hasBlockingWarning(w)).toBe(true);
    expect(w.find((x) => x.code === 'bare-column')?.message).toContain('`ort`');
    expect(w.find((x) => x.code === 'alias-in-where')?.message).toContain('`anzahl`');
    expect(w.find((x) => x.code === 'aggregate-in-where')?.message).toContain('COUNT(*)');
    // korrigierte Fassung
    expect(lintSql('SELECT ort, COUNT(*) AS anzahl FROM kunde GROUP BY ort HAVING COUNT(*) > 1;')).toEqual([]);
  });
});

describe('lintSql – Dialekt-Hinweise', () => {
  it('warnt vor Texten in doppelten Anführungszeichen (ohne Spaltenliste nur bei Vergleichen)', () => {
    const w = lintSql('SELECT name FROM kunde WHERE ort = "München"');
    expect(w).toHaveLength(1);
    expect(w[0]).toMatchObject({ code: 'double-quoted-string', blocking: false });
    expect(w[0].message).toContain("'München'");
    expect(codes('SELECT name FROM kunde WHERE ort IN ("Köln", \'Hamburg\')')).toEqual(['double-quoted-string']);
    expect(codes('SELECT "name" FROM "kunde"')).toEqual([]);
  });

  it('nutzt die Spaltenliste, wenn vorhanden', () => {
    const cols = ['name', 'ort'];
    expect(codes('SELECT "name" FROM kunde WHERE "ort" = \'Köln\'', cols)).toEqual([]);
    expect(codes('SELECT "Name des Kunden" FROM kunde', cols)).toEqual(['double-quoted-string']);
    expect(codes('SELECT name FROM "kunde" k', cols)).toEqual([]);
    expect(codes('INSERT INTO kunde ("name", "ort") VALUES (\'a\', \'b\')', cols)).toEqual([]);
  });

  it('weist auf Ganzzahldivision hin', () => {
    const w = lintSql('SELECT 5 / 2');
    expect(w).toHaveLength(1);
    expect(w[0]).toMatchObject({ code: 'integer-division', blocking: false });
    expect(w[0].message).toContain('ergibt in SQLite 2');
    expect(lintSql('SELECT 5.0 / 2, preis / 2 FROM produkt')).toEqual([]);
  });

  it('prüft mehrere Anweisungen', () => {
    expect(codes('UPDATE produkt SET preis = 1 WHERE kategorie = "Büro"; SELECT name, MAX(preis) FROM produkt')).toEqual([
      'double-quoted-string',
      'bare-column',
    ]);
  });
});

describe('lintSql – Musterlösungen aus DD1', () => {
  const file = join(import.meta.dirname, '..', 'content', 'DeepDive_01_SQL_Loesungen.md');
  it.skipIf(!existsSync(file))('löst bei keiner Musterlösung eine Warnung aus', () => {
    const blocks = [...readFileSync(file, 'utf8').matchAll(/```sql\r?\n([\s\S]*?)```/g)].map((m) => m[1]);
    expect(blocks.length).toBeGreaterThan(5);
    for (const sql of blocks) expect(lintSql(sql), sql).toEqual([]);
  });
});
