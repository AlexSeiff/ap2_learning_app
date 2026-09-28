import initSqlJs, { type SqlJsStatic } from 'sql.js';
import { beforeAll, describe, expect, it } from 'vitest';
import { createDatabase, lastResultSet, readSchema, runCheck, runOnFreshDb, runScript } from '../src/sql/runner';

// Kleiner Ausschnitt des Möbelhaus-Datensatzes (DD1).
const SETUP = `
CREATE TABLE kunde (kunden_id INTEGER PRIMARY KEY, name TEXT NOT NULL, ort TEXT);
CREATE TABLE bestellung (
  bestell_id INTEGER PRIMARY KEY,
  kunden_id INTEGER NOT NULL REFERENCES kunde,
  betrag DECIMAL(8,2) CHECK (betrag >= 0)
);
INSERT INTO kunde VALUES (1, 'Huber GmbH', 'München'), (2, 'Schmidt AG', 'Hamburg'), (3, 'Fischer KG', 'München');
INSERT INTO bestellung VALUES (101, 1, 100), (102, 1, 50), (103, 2, 20);
`;

let SQL: SqlJsStatic;
beforeAll(async () => {
  SQL = await initSqlJs();
});

describe('runScript', () => {
  it('führt mehrere Anweisungen aus und zählt Änderungen je Anweisung', () => {
    const db = createDatabase(SQL, SETUP);
    const r = runScript(
      db,
      `-- Kommentar
      INSERT INTO kunde VALUES (4, 'Krause OHG', 'Bremen');
      UPDATE kunde SET ort = 'Berlin' WHERE ort = 'München';
      CREATE TABLE notiz (id INTEGER);
      SELECT ort, COUNT(*) AS anzahl FROM kunde GROUP BY ort ORDER BY ort;
      DELETE FROM bestellung;`,
    );
    expect(r.ok).toBe(true);
    expect(r.statements.map((s) => s.changes)).toEqual([1, 2, 0, 0, 3]);
    expect(r.statements[0].sql).toMatch(/^INSERT INTO kunde/);
    const sel = r.statements[3];
    expect(sel.columns).toEqual(['ort', 'anzahl']);
    expect(sel.rows).toEqual([
      ['Berlin', 2],
      ['Bremen', 1],
      ['Hamburg', 1],
    ]);
    expect(lastResultSet(r)).toBe(sel);
    expect(r.ms).toBeGreaterThanOrEqual(0);
    db.close();
  });

  it('liefert NULL und Dezimalzahlen unverändert', () => {
    const db = createDatabase(SQL, SETUP);
    const r = runScript(db, "SELECT NULL AS a, '' AS b, 0 AS c, 5 / 2 AS d, 5.0 / 2 AS e");
    expect(r.ok && r.statements[0].rows).toEqual([[null, '', 0, 2, 2.5]]);
    db.close();
  });

  it('bricht beim ersten Fehler ab und behält die bisherigen Ergebnisse', () => {
    const db = createDatabase(SQL, SETUP);
    const r = runScript(db, 'SELECT 1; SELECT * FROM kunden; SELECT 2');
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toBe('no such table: kunden');
    expect(r.statements).toHaveLength(1);
    db.close();
  });

  it('prüft Fremdschlüssel (PRAGMA foreign_keys = ON) und andere Constraints', () => {
    const db = createDatabase(SQL, SETUP);
    const fk = runScript(db, 'INSERT INTO bestellung VALUES (104, 99, 10)');
    expect(fk).toMatchObject({ ok: false, error: 'FOREIGN KEY constraint failed' });
    expect(runScript(db, 'DELETE FROM kunde WHERE kunden_id = 1')).toMatchObject({ ok: false, error: 'FOREIGN KEY constraint failed' });
    expect(runScript(db, "INSERT INTO kunde VALUES (1, 'Doppelt', 'X')")).toMatchObject({
      ok: false,
      error: 'UNIQUE constraint failed: kunde.kunden_id',
    });
    expect(runScript(db, 'INSERT INTO kunde (kunden_id) VALUES (9)')).toMatchObject({
      ok: false,
      error: 'NOT NULL constraint failed: kunde.name',
    });
    expect(runScript(db, 'INSERT INTO bestellung VALUES (105, 3, -1)')).toMatchObject({ ok: false });
    // Kunde 3 hat keine Bestellungen → Löschen erlaubt
    expect(runScript(db, 'DELETE FROM kunde WHERE kunden_id = 3')).toMatchObject({ ok: true, statements: [{ changes: 1 }] });
    db.close();
  });

  it('behält die Spaltennamen bei leerem Ergebnis und liest pragma-Funktionen mit "…"-Bezeichnern', () => {
    const db = createDatabase(SQL, SETUP);
    const empty = runScript(db, "SELECT ort, COUNT(*) AS anzahl FROM kunde WHERE ort = 'Nirgendwo' GROUP BY ort");
    expect(empty).toMatchObject({ ok: true, statements: [{ columns: ['ort', 'anzahl'], rows: [] }] });
    const fk = runScript(db, `SELECT "table", "from", "to" FROM pragma_foreign_key_list('bestellung')`);
    expect(fk.ok && fk.statements[0].rows).toEqual([['kunde', 'kunden_id', null]]);
    const nn = runScript(db, `SELECT name FROM pragma_table_info('kunde') WHERE "notnull" = 1`);
    expect(nn.ok && nn.statements[0].rows).toEqual([['name']]);
    db.close();
  });

  it('kommt mit leerem Skript klar', () => {
    const db = createDatabase(SQL, '');
    expect(runScript(db, '  -- nur ein Kommentar\n')).toMatchObject({ ok: true, statements: [] });
    db.close();
  });
});

describe('createDatabase', () => {
  it('wirft bei fehlerhaftem Setup', () => {
    expect(() => createDatabase(SQL, 'CREATE TABLE x (a); INSERT INTO y VALUES (1)')).toThrow(/Setup-Skript fehlerhaft: no such table: y/);
  });
});

describe('readSchema', () => {
  it('liest Tabellen in Anlagereihenfolge mit Zeilenzahl, Typen, PK und FK', () => {
    const db = createDatabase(SQL, SETUP);
    expect(readSchema(db)).toEqual([
      {
        name: 'kunde',
        rowCount: 3,
        columns: [
          { name: 'kunden_id', type: 'INTEGER', pk: true },
          { name: 'name', type: 'TEXT', pk: false },
          { name: 'ort', type: 'TEXT', pk: false },
        ],
      },
      {
        name: 'bestellung',
        rowCount: 3,
        columns: [
          { name: 'bestell_id', type: 'INTEGER', pk: true },
          { name: 'kunden_id', type: 'INTEGER', pk: false, fk: { table: 'kunde', column: 'kunden_id' } },
          { name: 'betrag', type: 'DECIMAL(8,2)', pk: false },
        ],
      },
    ]);
    db.close();
  });
});

describe('runOnFreshDb / runCheck', () => {
  it('nutzt für jede Abfrage eine frische Datenbank', () => {
    const { user, solution } = runCheck(
      SQL,
      SETUP,
      'DELETE FROM bestellung; SELECT COUNT(*) FROM bestellung',
      'SELECT COUNT(*) FROM bestellung',
    );
    expect(user.ok && lastResultSet(user)?.rows).toEqual([[0]]);
    expect(solution.ok && lastResultSet(solution)?.rows).toEqual([[3]]);
  });

  it('führt die Prüfabfrage nach DML auf derselben Datenbank aus', () => {
    const check = 'SELECT kunden_id, name, ort FROM kunde ORDER BY kunden_id';
    const { user, solution } = runCheck(
      SQL,
      SETUP,
      "INSERT INTO kunde VALUES (4, 'Krause OHG', 'Bremen')",
      "INSERT INTO kunde (kunden_id, name, ort) VALUES (4, 'Krause OHG', 'Bremen')",
      check,
    );
    expect(user.ok).toBe(true);
    expect(user.statements.map((s) => s.changes)).toEqual([1, 0]);
    expect(lastResultSet(user)?.rows).toEqual(lastResultSet(solution)?.rows);
    expect(lastResultSet(user)?.rows).toHaveLength(4);
  });

  it('lässt die Prüfabfrage aus, wenn das Skript scheitert', () => {
    const r = runOnFreshDb(SQL, SETUP, 'INSERT INTO bestellung VALUES (104, 99, 10)', 'SELECT * FROM bestellung');
    expect(r).toMatchObject({ ok: false, error: 'FOREIGN KEY constraint failed', statements: [] });
  });
});
