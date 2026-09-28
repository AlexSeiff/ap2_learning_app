// Promise-API für den SQL-Worker (Hauptthread). Anfragen laufen nacheinander; jede darf höchstens 3 s dauern,
// sonst wird der Worker beendet, neu gestartet und die zuletzt geöffnete Datenbank neu aufgebaut.

import type { CheckRun } from './runner';
import type { WorkerRequest, WorkerResponse, WorkerResults } from './sqlWorker';
import type { ExecResult, SchemaTable } from './types';

export const TIMEOUT_MS = 3000;
export const TIMEOUT_MESSAGE = 'Abfrage nach 3 s abgebrochen – Endlosschleife?';

type WithoutId<T> = T extends unknown ? Omit<T, 'id'> : never;
type RequestBody = WithoutId<WorkerRequest>;
type Pending = { resolve: (v: unknown) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> };

export class SqlEngine {
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;
  private nextId = 1;
  private pending = new Map<number, Pending>();
  private queue: Promise<unknown> = Promise.resolve();
  private lastSetup: string | null = null;
  private readonly timeoutMs: number;

  constructor(timeoutMs = TIMEOUT_MS) {
    this.timeoutMs = timeoutMs;
  }

  /** Frische Sitzungsdatenbank aus dem Setup-Skript (mit PRAGMA foreign_keys = ON). Wirft bei fehlerhaftem Setup. */
  async open(setup: string): Promise<void> {
    await this.enqueue({ type: 'open', setup });
    this.lastSetup = setup;
  }

  /** Setzt die Sitzungsdatenbank auf das zuletzt geöffnete Setup zurück. */
  async reset(): Promise<void> {
    await this.open(this.lastSetup ?? '');
  }

  /** Führt ein Skript auf der Sitzungsdatenbank aus. Timeout → `{ ok: false, error: TIMEOUT_MESSAGE }`, die Datenbank ist dann zurückgesetzt. */
  async exec(sql: string): Promise<ExecResult> {
    try {
      return (await this.enqueue({ type: 'exec', sql })) as ExecResult;
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e), statements: [], ms: 0 };
    }
  }

  /** Tabellen der Sitzungsdatenbank. */
  async schema(): Promise<SchemaTable[]> {
    return (await this.enqueue({ type: 'schema' })) as SchemaTable[];
  }

  /**
   * Übungsprüfung: Nutzerabfrage und Musterlösung laufen je auf einer eigenen frischen Datenbank aus `setup`,
   * mit `pruefabfrage` danach auf derselben Datenbank (siehe runner.ts → runOnFreshDb). Die Sitzungsdatenbank bleibt unberührt.
   * Bei Timeout sind beide Ergebnisse `{ ok: false, error: TIMEOUT_MESSAGE }`.
   */
  async check(setup: string, userSql: string, solutionSql: string, pruefabfrage?: string | null): Promise<CheckRun> {
    try {
      return (await this.enqueue({ type: 'check', setup, userSql, solutionSql, pruefabfrage })) as CheckRun;
    } catch (e) {
      const failed: ExecResult = { ok: false, error: e instanceof Error ? e.message : String(e), statements: [], ms: 0 };
      return { user: failed, solution: failed };
    }
  }

  /** Beendet den Worker (z. B. beim Verlassen der Seite). Ein späterer Aufruf startet ihn neu. */
  dispose(): void {
    this.worker?.terminate();
    this.worker = null;
    this.ready = null;
    for (const p of this.pending.values()) {
      clearTimeout(p.timer);
      p.reject(new Error('SQL-Engine beendet.'));
    }
    this.pending.clear();
  }

  private start(): Promise<void> {
    const worker = new Worker(new URL('./sqlWorker.ts', import.meta.url), { type: 'module' });
    this.worker = worker;
    this.ready = new Promise<void>((resolve, reject) => {
      worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const msg = e.data;
        if (msg.type === 'ready') resolve();
        else if (msg.type === 'init-error') reject(new Error(`SQL-Engine konnte nicht geladen werden: ${msg.error}`));
        else this.settle(msg);
      };
      worker.onerror = (e) => reject(new Error(`SQL-Engine konnte nicht geladen werden: ${e.message || 'Worker-Fehler'}`));
    });
    // Nach einem Ladefehler beim nächsten Aufruf neu versuchen.
    this.ready.catch(() => {
      if (this.worker === worker) {
        worker.terminate();
        this.worker = null;
        this.ready = null;
      }
    });
    return this.ready;
  }

  private settle(msg: Extract<WorkerResponse, { type: 'result' }>): void {
    const p = this.pending.get(msg.id);
    if (!p) return;
    this.pending.delete(msg.id);
    clearTimeout(p.timer);
    if (msg.ok) p.resolve(msg.result);
    else p.reject(new Error(msg.error));
  }

  /** Nacheinander abarbeiten, damit der 3-s-Timer erst läuft, wenn der Worker die Anfrage wirklich bearbeitet. */
  private enqueue(body: RequestBody): Promise<WorkerResults[keyof WorkerResults]> {
    const run = this.queue.then(() => this.send(body));
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async send(body: RequestBody): Promise<WorkerResults[keyof WorkerResults]> {
    await (this.ready ?? this.start());
    const worker = this.worker!;
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(TIMEOUT_MESSAGE));
        this.restart();
      }, this.timeoutMs);
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject, timer });
      worker.postMessage({ ...body, id } as WorkerRequest);
    });
  }

  /** Hängenden Worker beenden, neu starten und die letzte Sitzungsdatenbank wiederherstellen. */
  private restart(): void {
    this.dispose();
    const setup = this.lastSetup;
    if (setup !== null) {
      const reopen = this.send({ type: 'open', setup }).then(() => undefined);
      this.queue = this.queue.then(() => reopen).catch(() => undefined);
    }
  }
}

let shared: SqlEngine | null = null;

/** Gemeinsame Engine-Instanz für die SQL-Seiten (Worker startet erst beim ersten Aufruf). */
export function getSqlEngine(): SqlEngine {
  shared ??= new SqlEngine();
  return shared;
}
