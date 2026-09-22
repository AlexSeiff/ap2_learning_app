// Kleiner Router für die lokale API: Routentabelle, Request-Body lesen und mit zod prüfen.
// Bewusst ohne Abhängigkeit zum Claude-SDK, damit Tests ihn direkt nutzen können.

import type { IncomingMessage, ServerResponse } from 'node:http';
import { z } from 'zod';
import { TASK_TYPES } from '../shared/types';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export interface RouteContext {
  req: IncomingMessage;
  /** Treffer der Klammergruppen, wenn der Pfad ein regulärer Ausdruck ist (bereits URL-dekodiert). */
  params: string[];
}

export interface Route {
  method: 'GET' | 'PUT' | 'POST' | 'DELETE';
  /** Exakter Pfad oder regulärer Ausdruck für den ganzen Pfad (mit ^…$). */
  path: string | RegExp;
  /** Rückgabewert wird als JSON mit Status 200 gesendet; Fehler als HttpError werfen. */
  handler: (ctx: RouteContext) => unknown;
}

/** Sucht die passende Route; rein, damit testbar. */
export function matchRoute(routes: readonly Route[], method: string, pathname: string): { route: Route; params: string[] } | undefined {
  for (const route of routes) {
    if (route.method !== method) continue;
    if (typeof route.path === 'string') {
      if (route.path === pathname) return { route, params: [] };
      continue;
    }
    const m = route.path.exec(pathname);
    if (m) return { route, params: m.slice(1).map((p) => decodeURIComponent(p)) };
  }
  return undefined;
}

export async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, 'Ungültiges JSON im Request.');
  }
}

export function send(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

/** Prüft einen Request-Body; bei Fehlern HTTP 400 mit deutscher Meldung. */
export function parseBody<S extends z.ZodType>(schema: S, body: unknown): z.infer<S> {
  const parsed = schema.safeParse(body);
  if (parsed.success) return parsed.data;
  const details = parsed.error.issues
    .slice(0, 3)
    .map((i) => (i.path.length ? `${i.path.join('.')}: ${i.message}` : i.message))
    .join('; ');
  throw new HttpError(400, `Ungültige Anfrage – ${details}`);
}

// Request-Schemas der KI-Routen. Fehlermeldungen auf Deutsch, weil sie direkt in der Oberfläche landen.

const NOT_AN_OBJECT = { error: 'Die Anfrage muss ein JSON-Objekt sein.' };

export const GenerateRequestSchema = z.object(
  {
    topicId: z.string({ error: 'Thema fehlt.' }).min(1, 'Thema fehlt.'),
    count: z
      .number({ error: 'Anzahl muss eine Zahl sein.' })
      .int('Anzahl muss eine ganze Zahl sein.')
      .min(1, 'Anzahl muss zwischen 1 und 10 liegen.')
      .max(10, 'Anzahl muss zwischen 1 und 10 liegen.')
      .default(3),
    types: z
      .array(z.enum(TASK_TYPES, { error: `Unbekannter Aufgabentyp (erlaubt: ${TASK_TYPES.join(', ')}).` }), {
        error: 'Aufgabentypen müssen eine Liste sein.',
      })
      .default([]),
  },
  NOT_AN_OBJECT,
);

export const GradeRequestSchema = z.object(
  {
    taskId: z.string({ error: 'Aufgabe fehlt.' }).min(1, 'Aufgabe fehlt.'),
    answer: z.string({ error: 'Antwort muss Text sein.' }).default(''),
  },
  NOT_AN_OBJECT,
);
