// Web Worker mit sql.js (SQLite als WebAssembly). Der Hauptthread spricht ihn nur über src/sql/engine.ts an.

import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
// ?url: Vite liefert die WASM-Datei als Asset aus – funktioniert auch mit base './' (GitHub Pages).
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { createDatabase, readSchema, runCheck, runScript, type CheckRun } from './runner';
import type { ExecResult, SchemaTable } from './types';

export type WorkerRequest = { id: number } & (
  | { type: 'open'; setup: string }
  | { type: 'exec'; sql: string }
  | { type: 'schema' }
  | { type: 'check'; setup: string; userSql: string; solutionSql: string; pruefabfrage?: string | null }
);

/** Antwortdaten je Anfragetyp. */
export type WorkerResults = { open: null; exec: ExecResult; schema: SchemaTable[]; check: CheckRun };

export type WorkerResponse =
  | { type: 'ready' }
  | { type: 'init-error'; error: string }
  | { type: 'result'; id: number; ok: true; result: WorkerResults[keyof WorkerResults] }
  | { type: 'result'; id: number; ok: false; error: string };

const ctx = self as unknown as { postMessage(msg: WorkerResponse): void; onmessage: ((e: MessageEvent<WorkerRequest>) => void) | null };

const sqlReady = initSqlJs({ locateFile: () => wasmUrl });
let db: Database | null = null;

sqlReady.then(
  () => ctx.postMessage({ type: 'ready' }),
  (e: unknown) => ctx.postMessage({ type: 'init-error', error: e instanceof Error ? e.message : String(e) }),
);

async function handle(req: WorkerRequest): Promise<WorkerResults[keyof WorkerResults]> {
  const SQL = await sqlReady;
  switch (req.type) {
    case 'open': {
      const next = createDatabase(SQL, req.setup);
      db?.close();
      db = next;
      return null;
    }
    case 'exec':
      db ??= createDatabase(SQL, '');
      return runScript(db, req.sql);
    case 'schema':
      return db ? readSchema(db) : [];
    case 'check':
      return runCheck(SQL, req.setup, req.userSql, req.solutionSql, req.pruefabfrage);
  }
}

ctx.onmessage = (e) => {
  const req = e.data;
  handle(req).then(
    (result) => ctx.postMessage({ type: 'result', id: req.id, ok: true, result }),
    (err: unknown) => ctx.postMessage({ type: 'result', id: req.id, ok: false, error: err instanceof Error ? err.message : String(err) }),
  );
};
