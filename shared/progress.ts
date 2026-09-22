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
  version: typeof PROGRESS_VERSION;
  /**
   * Zähler, den der Server bei jedem Speichern erhöht. Ein PUT mit einem anderen Stand als dem gespeicherten
   * kommt aus einem veralteten Tab und wird mit 409 abgelehnt (seit Version 2, ältere Dateien: 0).
   */
  revision: number;
  attempts: Attempt[];
  exams: ExamRun[];
  activeExam?: ExamRun;
  cards: Record<string, CardState>;
  journal: Record<string, JournalEntry>;
  lernziele: Record<string, boolean>;
};

/** Aktuelle Formatversion von data/fortschritt.json. Bei jeder Formatänderung erhöhen und in MIGRATIONS nachziehen. */
export const PROGRESS_VERSION = 2;

export const emptyProgress = (): Progress => ({
  version: PROGRESS_VERSION,
  revision: 0,
  attempts: [],
  exams: [],
  cards: {},
  journal: {},
  lernziele: {},
});

type Raw = Record<string, unknown>;

const isObject = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback);
const num = (v: unknown, fallback = 0) => (typeof v === 'number' ? v : fallback);
/** Optionales Feld nur übernehmen, wenn es den richtigen Typ hat – sonst weglassen statt das Speichern zu blockieren. */
const opt = (key: string, value: unknown, ok: boolean) => (ok ? { [key]: value } : {});

/** Wendet `map` auf jeden Eintrag eines Objekts an und verwirft Einträge, für die es undefined liefert. */
function filterRecord<T>(v: unknown, map: (value: unknown, key: string) => T | undefined): Record<string, T> {
  if (!isObject(v)) return {};
  const out: Record<string, T> = {};
  for (const [key, value] of Object.entries(v)) {
    const mapped = map(value, key);
    if (mapped !== undefined) out[key] = mapped;
  }
  return out;
}

function migrateAttempt(v: unknown): Attempt | undefined {
  if (!isObject(v) || typeof v.taskId !== 'string') return undefined;
  return { ...v, taskId: v.taskId, date: str(v.date), points: num(v.points), max: num(v.max), mode: str(v.mode, 'einzel') as Mode };
}

function migrateExam(v: unknown, index: number | string): ExamRun | undefined {
  if (!isObject(v)) return undefined;
  const { submittedAt, finishedAt, total, ...rest } = v;
  return {
    ...rest,
    ...opt('submittedAt', submittedAt, typeof submittedAt === 'string'),
    ...opt('finishedAt', finishedAt, typeof finishedAt === 'string'),
    ...opt('total', total, typeof total === 'number' || total === null),
    id: str(v.id, `ex-migriert-${index}`),
    topicId: str(v.topicId),
    startedAt: str(v.startedAt),
    answers: filterRecord(v.answers, (a) => (typeof a === 'string' ? a : undefined)),
    // null (aus NaN) bleibt erhalten, damit sich an bewerteten Aufgaben nichts ändert.
    scores: filterRecord(v.scores, (s) => (typeof s === 'number' || s === null ? (s as number) : undefined)),
    max: num(v.max),
  };
}

function migrateCard(v: unknown): CardState | undefined {
  if (!isObject(v)) return undefined;
  const { last, ...rest } = v;
  return { ...rest, ...opt('last', last, typeof last === 'string'), box: num(v.box, 1), due: str(v.due), reviews: num(v.reviews) };
}

function migrateJournalEntry(v: unknown, taskId: string): JournalEntry | undefined {
  if (!isObject(v)) return undefined;
  const { resolvedAt, ...rest } = v;
  return {
    ...rest,
    ...opt('resolvedAt', resolvedAt, typeof resolvedAt === 'string'),
    taskId: str(v.taskId, taskId),
    addedAt: str(v.addedAt),
    stage: num(v.stage),
    due: str(v.due),
    lastPoints: num(v.lastPoints),
    max: num(v.max),
  };
}

/**
 * Schritte von Version n auf n+1, angewendet auf die rohen Daten vor dem Auffüllen.
 * Version 1 ist das erste Format (Dateien ohne `version` gelten als Version 1).
 */
const MIGRATIONS: Record<number, (raw: Raw) => Raw> = {
  // 1 → 2: Revisionszähler gegen Überschreiben aus einem zweiten Tab.
  1: (raw) => ({ ...raw, version: 2, revision: num(raw.revision) }),
};

/**
 * Bringt gespeicherten Fortschritt beliebigen Alters auf das aktuelle Format.
 * Fehlende Sammlungen und Felder werden mit neutralen Werten ergänzt, unbekannte Felder bleiben erhalten.
 * Verworfen wird nur, was sich keinem Eintrag zuordnen lässt (z. B. ein Versuch ohne taskId).
 */
export function migrateProgress(raw: unknown): Progress {
  if (!isObject(raw)) return emptyProgress();
  let data: Raw = raw;
  for (let v = num(data.version, 1); v < PROGRESS_VERSION; v++) data = MIGRATIONS[v]?.(data) ?? data;

  const { activeExam, ...rest } = data;
  const exam = migrateExam(activeExam, 'aktiv');
  return {
    ...rest,
    version: PROGRESS_VERSION,
    revision: revisionOf(data),
    attempts: Array.isArray(data.attempts) ? data.attempts.map(migrateAttempt).filter((a) => a !== undefined) : [],
    exams: Array.isArray(data.exams) ? data.exams.map(migrateExam).filter((e) => e !== undefined) : [],
    ...(exam ? { activeExam: exam } : {}),
    cards: filterRecord(data.cards, migrateCard),
    journal: filterRecord(data.journal, migrateJournalEntry),
    lernziele: filterRecord(data.lernziele, (v) => (typeof v === 'boolean' ? v : undefined)),
  };
}

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
  // Optional, damit Dateien von vor Version 2 gültig bleiben (fehlend = 0).
  revision: z.number().int().min(0).optional(),
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

/** Revision eines gespeicherten oder gesendeten Stands; fehlend (ältere Datei, alter Tab) = 0. */
export function revisionOf(data: unknown): number {
  const revision = (data as { revision?: unknown } | null | undefined)?.revision;
  return typeof revision === 'number' && Number.isInteger(revision) && revision >= 0 ? revision : 0;
}

/**
 * Ist der Stand, auf dem ein Tab aufbaut, veraltet? Bewusst streng (ungleich statt kleiner): Auch eine höhere
 * Revision als gespeichert heißt, dass die Datei inzwischen anders ist (z. B. von Hand zurückgespielt) – dann erst neu laden.
 */
export function isStaleRevision(baseRevision: number, storedRevision: number): boolean {
  return baseRevision !== storedRevision;
}

export const CONFLICT_MESSAGE = 'Die App ist in einem anderen Tab geöffnet – bitte neu laden';

function formatIssue(issue: z.core.$ZodIssue): string {
  return issue.path.length ? issue.path.join('.') : '(gesamt)';
}

export type ProgressPutResult =
  { ok: true; progress: ProgressData & { revision: number } } | { ok: false; status: 400 | 409; error: string };

/**
 * Prüft einen PUT-Body gegen das Schema und gegen den gespeicherten Stand.
 * Rein (ohne Dateizugriff), damit Server und Tests dieselbe Logik nutzen.
 * Bei Erfolg trägt der zurückgegebene Stand die nächste Revision; auch reset: true braucht die aktuelle Revision,
 * damit ein veralteter Tab nicht per „Zurücksetzen“ oder „Sicherung einspielen“ einen neueren Stand überschreibt.
 */
export function checkProgressPut(body: unknown, stored: unknown): ProgressPutResult {
  const parsed = ProgressPutSchema.safeParse(body);
  if (!parsed.success) {
    const where = parsed.error.issues.slice(0, 3).map(formatIssue).join(', ');
    return { ok: false, status: 400, error: `Fortschritt nicht gespeichert: Die Daten sind ungültig (Fehler bei ${where}).` };
  }
  const { reset, ...progress } = parsed.data;
  const storedRevision = revisionOf(stored);
  if (isStaleRevision(revisionOf(progress), storedRevision)) {
    return { ok: false, status: 409, error: `Fortschritt nicht gespeichert: ${CONFLICT_MESSAGE}.` };
  }
  const storedAttempts = (stored as { attempts?: unknown } | null)?.attempts;
  const storedCount = Array.isArray(storedAttempts) ? storedAttempts.length : 0;
  if (!reset && isSuspiciousAttemptDrop(storedCount, progress.attempts.length)) {
    return {
      ok: false,
      status: 400,
      error:
        `Fortschritt nicht gespeichert: Er enthält nur ${progress.attempts.length} statt ${storedCount} Versuche. ` +
        'Zum bewussten Zurücksetzen nutze „Fortschritt zurücksetzen“ oder „Sicherung einspielen“ auf der Seite Daten & Import. ' +
        'Ist die App in einem anderen Tab offen? Dann bitte diese Seite neu laden.',
    };
  }
  return { ok: true, progress: { ...progress, revision: storedRevision + 1 } };
}
