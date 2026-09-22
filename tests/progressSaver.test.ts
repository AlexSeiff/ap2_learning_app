import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { emptyProgress, type Progress } from '../shared/progress';
import { recordAttempt } from '../src/lib/progress';
import { createProgressSaver, type SaveState } from '../src/lib/progressSaver';

const withAttempts = (n: number): Progress => {
  let p = emptyProgress();
  for (let i = 0; i < n; i++) p = recordAttempt(p, { taskId: `01-A${i}`, date: 'd', points: 1, max: 1, mode: 'einzel' }, '2026-09-22');
  return p;
};

/** Server-Attrappe: jede Anfrage bleibt offen, bis der Test sie beantwortet. */
function fakeServer() {
  const calls: { body: unknown; resolve: () => void; reject: (e: Error) => void }[] = [];
  const send = vi.fn(
    (body: unknown) =>
      new Promise<unknown>((resolve, reject) => {
        calls.push({ body, resolve: () => resolve({ ok: true }), reject });
      }),
  );
  return { calls, send };
}

let states: [SaveState, string | null | undefined][];
const onState = (s: SaveState, e?: string | null) => states.push([s, e]);

beforeEach(() => {
  vi.useFakeTimers();
  states = [];
});
afterEach(() => {
  vi.useRealTimers();
});

describe('createProgressSaver', () => {
  it('fasst schnelle Änderungen zu einem Speichern mit dem neuesten Stand zusammen', async () => {
    const server = fakeServer();
    const saver = createProgressSaver({ send: server.send, onState });
    saver.schedule(withAttempts(1));
    saver.schedule(withAttempts(2));
    saver.schedule(withAttempts(3));
    expect(server.send).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(400);
    expect(server.calls.map((c) => (c.body as Progress).attempts.length)).toEqual([3]);
    server.calls[0].resolve();
    await vi.runAllTimersAsync();
    expect(states.at(-1)).toEqual(['gespeichert', null]);
  });

  it('meldet erst nach dem Speichern nichts Ausstehendes mehr (für den pagehide-Flush)', async () => {
    const server = fakeServer();
    const saver = createProgressSaver({ send: server.send, onState });
    expect(saver.flushBody()).toBeUndefined();
    saver.schedule(withAttempts(1));
    expect(saver.flushBody()).toEqual(withAttempts(1));
    await vi.advanceTimersByTimeAsync(400);
    // Unterwegs, aber noch nicht bestätigt → weiterhin ausstehend.
    expect(saver.pending).toBe(true);
    server.calls[0].resolve();
    await vi.runAllTimersAsync();
    expect(saver.pending).toBe(false);
    expect(saver.flushBody()).toBeUndefined();
  });

  it('speichert nie parallel: eine Änderung während des Speicherns wird danach gesendet', async () => {
    const server = fakeServer();
    const saver = createProgressSaver({ send: server.send, onState });
    saver.schedule(withAttempts(1));
    await vi.advanceTimersByTimeAsync(400);
    saver.schedule(withAttempts(2));
    await vi.advanceTimersByTimeAsync(400);
    expect(server.send).toHaveBeenCalledTimes(1);
    server.calls[0].resolve();
    await vi.advanceTimersByTimeAsync(0);
    expect(states.at(-1)).toEqual(['speichert', null]);
    expect(server.send).toHaveBeenCalledTimes(2);
    expect((server.calls[1].body as Progress).attempts).toHaveLength(2);
    server.calls[1].resolve();
    await vi.runAllTimersAsync();
    expect(saver.pending).toBe(false);
    expect(states.at(-1)).toEqual(['gespeichert', null]);
  });

  it('sendet reset: true, bis ein Zurücksetzen bestätigt ist', async () => {
    const server = fakeServer();
    const saver = createProgressSaver({ send: server.send, onState });
    saver.schedule(emptyProgress(), true);
    await vi.advanceTimersByTimeAsync(400);
    expect(server.calls[0].body).toMatchObject({ reset: true });
    server.calls[0].reject(new Error('Netz weg'));
    await vi.runAllTimersAsync();
    expect(states.at(-1)).toEqual(['fehler', 'Netz weg']);
    // Fehlgeschlagen → ausstehend, und das nächste Speichern trägt das reset-Flag weiter.
    expect(saver.flushBody()).toMatchObject({ reset: true });
    saver.schedule(withAttempts(1));
    await vi.advanceTimersByTimeAsync(400);
    expect(server.calls[1].body).toMatchObject({ reset: true });
    server.calls[1].resolve();
    await vi.runAllTimersAsync();
    saver.schedule(withAttempts(2));
    await vi.advanceTimersByTimeAsync(400);
    expect(server.calls[2].body).not.toHaveProperty('reset');
  });

  it('eine späte Bestätigung löscht keine neuere Reset-Anforderung', async () => {
    const server = fakeServer();
    const saver = createProgressSaver({ send: server.send, onState });
    saver.schedule(withAttempts(1));
    await vi.advanceTimersByTimeAsync(400);
    saver.schedule(emptyProgress(), true);
    server.calls[0].resolve();
    await vi.advanceTimersByTimeAsync(400);
    expect(server.calls[1].body).toMatchObject({ reset: true, attempts: [] });
  });
});
