// SQL-Ausführung auf einer sql.js-Datenbank: rein, ohne DOM. Genutzt vom Web Worker und von den Node-Tests.

import type { Database, SqlJsStatic } from 'sql.js';
import type { ExecResult, SchemaColumn, SchemaTable, SqlValue, StatementResult } from './types';

/** Ergebnis einer Übungsprüfung: Nutzerabfrage und Musterlösung, jeweils auf eigener frischer Datenbank. */
export type CheckRun = { user: ExecResult; solution: ExecResult };

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

/** Leerraum, leere Anweisungen und Kommentare vor einer Anweisung (sql.js liefert sie in getSQL() mit). */
const LEADING_NOISE = /^(?:\s+|;|--[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)+/;

function totalChanges(db: Database): number {
  const r = db.exec('SELECT total_changes()');
  return Number(r[0]?.values[0]?.[0] ?? 0);
}

/**
 * Führt ein Skript (ggf. mehrere Anweisungen, getrennt durch `;`) Anweisung für Anweisung aus.
 * `changes` stimmt je Anweisung: SELECT/DDL liefern 0, INSERT/UPDATE/DELETE die Zahl der geänderten Zeilen.
 * Bei einem Fehler stehen die bis dahin erfolgreichen Anweisungen in `statements`.
 */
export function runScript(db: Database, sql: string): ExecResult {
  const start = now();
  const statements: StatementResult[] = [];
  const ms = () => Math.round((now() - start) * 10) / 10;
  try {
    for (const stmt of db.iterateStatements(sql)) {
      try {
        const before = totalChanges(db);
        const columns = stmt.getColumnNames();
        const rows: SqlValue[][] = [];
        while (stmt.step()) rows.push(stmt.get());
        // sqlite3_changes() bleibt nach SELECT/DDL auf dem alten Wert stehen – nur zählen, wenn sich wirklich etwas geändert hat.
        const changes = totalChanges(db) > before ? db.getRowsModified() : 0;
        statements.push({ sql: stmt.getSQL().replace(LEADING_NOISE, '').trim(), columns, rows, changes });
      } finally {
        stmt.free();
      }
    }
  } catch (e) {
    return { ok: false, error: errorMessage(e), statements, ms: ms() };
  }
  return { ok: true, statements, ms: ms() };
}

/** Neue Datenbank mit Fremdschlüsselprüfung; wirft, wenn das Setup-Skript fehlschlägt. */
export function createDatabase(SQL: SqlJsStatic, setup: string): Database {
  const db = new SQL.Database();
  db.run('PRAGMA foreign_keys = ON');
  const r = runScript(db, setup);
  if (!r.ok) {
    db.close();
    throw new Error(`Setup-Skript fehlerhaft: ${r.error}`);
  }
  return db;
}

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function rowsOf(db: Database, sql: string): SqlValue[][] {
  return db.exec(sql)[0]?.values ?? [];
}

/** Tabellen in Anlagereihenfolge mit Zeilenzahl, Spalten, Primär- und Fremdschlüsseln. */
export function readSchema(db: Database): SchemaTable[] {
  const names = rowsOf(db, "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid").map((r) =>
    String(r[0]),
  );
  const pkOf = (table: string): string =>
    String(rowsOf(db, `PRAGMA table_info(${quoteIdent(table)})`).find((r) => Number(r[5]) > 0)?.[1] ?? '');

  return names.map((name) => {
    const q = quoteIdent(name);
    // foreign_key_list: id, seq, table, from, to, …  (to = NULL heißt: Primärschlüssel der Zieltabelle)
    const fks = new Map<string, { table: string; column: string }>();
    for (const r of rowsOf(db, `PRAGMA foreign_key_list(${q})`)) {
      const table = String(r[2]);
      fks.set(String(r[3]), { table, column: r[4] == null ? pkOf(table) : String(r[4]) });
    }
    // table_info: cid, name, type, notnull, dflt_value, pk
    const columns: SchemaColumn[] = rowsOf(db, `PRAGMA table_info(${q})`).map((r) => {
      const col: SchemaColumn = { name: String(r[1]), type: String(r[2] ?? ''), pk: Number(r[5]) > 0 };
      const fk = fks.get(col.name);
      if (fk) col.fk = fk;
      return col;
    });
    const rowCount = Number(rowsOf(db, `SELECT COUNT(*) FROM ${q}`)[0]?.[0] ?? 0);
    return { name, rowCount, columns };
  });
}

/**
 * Führt ein Skript auf einer frischen Datenbank aus. Mit `pruefabfrage` (DML/DDL-Übungen) läuft sie danach
 * auf derselben Datenbank; ihre Anweisungen werden an `statements` angehängt, die letzte Ergebnismenge ist
 * also das Prüfergebnis. Schlägt schon das Skript fehl, läuft die Prüfabfrage nicht.
 */
export function runOnFreshDb(SQL: SqlJsStatic, setup: string, sql: string, pruefabfrage?: string | null): ExecResult {
  const db = createDatabase(SQL, setup);
  try {
    const r = runScript(db, sql);
    if (!r.ok || !pruefabfrage) return r;
    const p = runScript(db, pruefabfrage);
    const statements = [...r.statements, ...p.statements];
    const ms = r.ms + p.ms;
    return p.ok ? { ok: true, statements, ms } : { ok: false, error: p.error, statements, ms };
  } finally {
    db.close();
  }
}

/** Nutzerabfrage und Musterlösung jeweils auf eigener frischer Datenbank (siehe `runOnFreshDb`). */
export function runCheck(SQL: SqlJsStatic, setup: string, userSql: string, solutionSql: string, pruefabfrage?: string | null): CheckRun {
  return { user: runOnFreshDb(SQL, setup, userSql, pruefabfrage), solution: runOnFreshDb(SQL, setup, solutionSql, pruefabfrage) };
}

/** Letzte Anweisung mit Ergebnisspalten (das, was angezeigt bzw. verglichen wird), sonst undefined. */
export function lastResultSet(r: ExecResult): StatementResult | undefined {
  for (let i = r.statements.length - 1; i >= 0; i--) if (r.statements[i].columns.length > 0) return r.statements[i];
  return undefined;
}
