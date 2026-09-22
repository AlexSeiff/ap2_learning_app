// Gespeicherter Lernfortschritt (data/fortschritt.json): Typen, zod-Schema und Prüfung von PUT /api/progress.
// Liegt in shared/, weil Client (lib/progress.ts, store.tsx) und Server (apiPlugin.ts) dasselbe Format nutzen.
// Die Typen beschreiben, was die App schreibt. Das Schema ist bewusst toleranter (unbekannte Felder bleiben erhalten,
// `mode` als beliebiger String, `null` statt NaN), damit ältere oder neuere Dateien nicht abgewiesen werden.
// Ein Typtest in tests/progress.test.ts stellt sicher, dass jeder `Progress` das Schema erfüllt.

import { z } from 'zod';

export type Mode = 'klausur' | 'einzel' | 'wiederholung';
export type Rating = 'gewusst' | 'unsicher' | 'nicht';

export type Attempt = {
  taskId: string;
  date: string;
  points: number;
  max: number;
  mode: Mode;
};

export type ExamRun = {
  id: string;
  topicId: string;
  startedAt: string;
  submittedAt?: string;
  finishedAt?: string;
  answers: Record<string, string>;
  scores: Record<string, number>;
  total?: number;
  max: number;
};

export type CardState = {
  box: number;
  due: string;
  reviews: number;
  last?: Rating;
};

export type JournalEntry = {
  taskId: string;
  addedAt: string;
  /** 0 = Wiederholung nach 1 Tag, 1 = nach 3 Tagen, 2 = nach 7 Tagen. */
  stage: number;
  due: string;
  lastPoints: number;
  max: number;
  resolvedAt?: string;
};

export type Progress = {
  version: 1;
  attempts: Attempt[];
  exams: ExamRun[];
  activeExam?: ExamRun;
  cards: Record<string, CardState>;
  journal: Record<string, JournalEntry>;
  lernziele: Record<string, boolean>;
};

export const emptyProgress = (): Progress => ({
  version: 1,
  attempts: [],
  exams: [],
  cards: {},
  journal: {},
  lernziele: {},
});

export const AttemptSchema = z.looseObject({
  taskId: z.string(),
  date: z.string(),
  points: z.number(),
  max: z.number(),
  mode: z.string(),
});

export const ExamRunSchema = z.looseObject({
  id: z.string(),
  topicId: z.string(),
  startedAt: z.string(),
  submittedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  answers: z.record(z.string(), z.string()),
  // NaN aus einem Eingabefeld wird in JSON zu null – das darf das Speichern nicht blockieren.
  scores: z.record(z.string(), z.number().nullable()),
  total: z.number().nullable().optional(),
  max: z.number(),
});

export const CardStateSchema = z.looseObject({
  box: z.number(),
  due: z.string(),
  reviews: z.number(),
  last: z.string().optional(),
});

export const JournalEntrySchema = z.looseObject({
  taskId: z.string(),
  addedAt: z.string(),
  stage: z.number(),
  due: z.string(),
  lastPoints: z.number(),
  max: z.number(),
  resolvedAt: z.string().optional(),
});

export const ProgressSchema = z.looseObject({
  version: z.number().int().min(1),
  attempts: z.array(AttemptSchema),
  exams: z.array(ExamRunSchema).default([]),
  activeExam: ExamRunSchema.optional(),
  cards: z.record(z.string(), CardStateSchema).default({}),
  journal: z.record(z.string(), JournalEntrySchema).default({}),
  lernziele: z.record(z.string(), z.boolean()).default({}),
});

export type ProgressData = z.infer<typeof ProgressSchema>;

/** Body von PUT /api/progress: der Fortschritt plus optional `reset: true` für bewusstes Zurücksetzen/Einspielen. */
export const ProgressPutSchema = ProgressSchema.extend({ reset: z.boolean().optional() });

/**
 * Ab wann ein neuer Stand „viel weniger“ Versuche hat als der gespeicherte.
 * Versuche werden in der App nur angehängt, nie gelöscht. Ein Rückgang um mehr als 5 Versuche
 * oder auf weniger als die Hälfte ist daher fast sicher ein Versehen (leerer Stand, alter Tab, falsche Datei).
 */
export function isSuspiciousAttemptDrop(storedCount: number, newCount: number): boolean {
  return newCount < storedCount && (storedCount - newCount > 5 || newCount < storedCount / 2);
}

function formatIssue(issue: z.core.$ZodIssue): string {
  return issue.path.length ? issue.path.join('.') : '(gesamt)';
}

export type ProgressPutResult = { ok: true; progress: ProgressData } | { ok: false; error: string };

/**
 * Prüft einen PUT-Body gegen das Schema und gegen den gespeicherten Stand.
 * Rein (ohne Dateizugriff), damit Server und Tests dieselbe Logik nutzen.
 */
export function checkProgressPut(body: unknown, stored: unknown): ProgressPutResult {
  const parsed = ProgressPutSchema.safeParse(body);
  if (!parsed.success) {
    const where = parsed.error.issues.slice(0, 3).map(formatIssue).join(', ');
    return { ok: false, error: `Fortschritt nicht gespeichert: Die Daten sind ungültig (Fehler bei ${where}).` };
  }
  const { reset, ...progress } = parsed.data;
  const storedAttempts = (stored as { attempts?: unknown } | null)?.attempts;
  const storedCount = Array.isArray(storedAttempts) ? storedAttempts.length : 0;
  if (!reset && isSuspiciousAttemptDrop(storedCount, progress.attempts.length)) {
    return {
      ok: false,
      error:
        `Fortschritt nicht gespeichert: Er enthält nur ${progress.attempts.length} statt ${storedCount} Versuche. ` +
        'Zum bewussten Zurücksetzen nutze „Fortschritt zurücksetzen“ oder „Sicherung einspielen“ auf der Seite Daten & Import. ' +
        'Ist die App in einem anderen Tab offen? Dann bitte diese Seite neu laden.',
    };
  }
  return { ok: true, progress };
}
