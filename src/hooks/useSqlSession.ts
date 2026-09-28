// Sitzungsdatenbank der SQL-Seiten: öffnet den Datensatz in der (gemeinsamen) SQL-Engine und liefert das Schema.
// Freier Modus und Übungen teilen sich die Engine – deshalb öffnet jede Seite ihr Setup beim Einhängen neu.

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ErrorSchema } from '../sql/errors';
import { getSqlEngine } from '../sql/engine';
import type { ExecResult, SchemaTable } from '../sql/types';

type SessionState = { setup?: string; schema: SchemaTable[]; error?: string };

export function useSqlSession(setup: string | undefined) {
  const [state, setState] = useState<SessionState>({ schema: [] });

  useEffect(() => {
    if (setup === undefined) return;
    let alive = true;
    const engine = getSqlEngine();
    engine
      .open(setup)
      .then(() => engine.schema())
      .then(
        (schema) => alive && setState({ setup, schema }),
        (e: Error) => alive && setState({ setup, schema: [], error: e.message }),
      );
    return () => {
      alive = false;
    };
  }, [setup]);

  const ready = setup !== undefined && state.setup === setup && !state.error;
  const schema = useMemo(() => (state.setup === setup ? state.schema : []), [state, setup]);

  const refreshSchema = useCallback(async () => {
    try {
      const next = await getSqlEngine().schema();
      setState((s) => (s.setup === setup ? { ...s, schema: next } : s));
    } catch {
      /* Schema bleibt, wie es war */
    }
  }, [setup]);

  /** Skript auf der Sitzungsdatenbank ausführen; das Schema (Zeilenzahlen, neue Tabellen) wird danach neu gelesen. */
  const exec = useCallback(
    async (sql: string): Promise<ExecResult> => {
      const r = await getSqlEngine().exec(sql);
      void refreshSchema();
      return r;
    },
    [refreshSchema],
  );

  /** Datenbank auf den Ausgangszustand des Datensatzes zurücksetzen. */
  const reset = useCallback(async () => {
    if (setup === undefined) return;
    try {
      await getSqlEngine().open(setup);
      await refreshSchema();
    } catch (e) {
      setState({ setup, schema: [], error: (e as Error).message });
    }
  }, [setup, refreshSchema]);

  /** Auf frischer Datenbank ausführen (Übungen: „Ausprobieren“ soll immer vom Ausgangszustand starten). */
  const execFresh = useCallback(
    async (sql: string): Promise<ExecResult> => {
      if (setup !== undefined) {
        try {
          await getSqlEngine().open(setup);
        } catch (e) {
          return { ok: false, error: (e as Error).message, statements: [], ms: 0 };
        }
      }
      return getSqlEngine().exec(sql);
    },
    [setup],
  );

  const errorSchema = useMemo<ErrorSchema>(
    () => ({ tables: schema.map((t) => t.name), columns: [...new Set(schema.flatMap((t) => t.columns.map((c) => c.name)))] }),
    [schema],
  );

  return { ready, error: state.setup === setup ? state.error : undefined, schema, errorSchema, exec, execFresh, reset };
}
