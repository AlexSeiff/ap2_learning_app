// Letzte Lesestelle (Umsetzungsplan Phase 9, „Weiterlernen“ auf der Übersicht): welcher Abschnitt welches Lernblatts zuletzt oben
// im Blick war. Nur eine Bequemlichkeit je Browser (localStorage, abgesichert) – nicht Teil des Fortschritts und der Sicherung.

export interface LeseStelle {
  topicId: string;
  sectionId: string;
  /** ISO-Zeitpunkt. */
  am: string;
}

export const LESESTELLE_SPEICHER = 'ap2-lesestelle';

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Gespeicherte Lesestelle tolerant lesen; Unbrauchbares → undefined. */
export function leseLeseStelle(raw: unknown): LeseStelle | undefined {
  if (!isObj(raw)) return undefined;
  const { topicId, sectionId, am } = raw;
  if (typeof topicId !== 'string' || !topicId || typeof sectionId !== 'string' || !sectionId) return undefined;
  return { topicId, sectionId, am: typeof am === 'string' ? am : '' };
}

/**
 * Abschnitt, der gerade oben steht: der letzte, dessen Oberkante höchstens `oben` Pixel unter dem Fensterrand liegt
 * (`tops` in Dokumentreihenfolge, Werte wie getBoundingClientRect().top). Steht noch keiner so weit oben, der erste.
 */
export function obersterAbschnitt(tops: { id: string; top: number }[], oben: number): string | undefined {
  let treffer = tops[0]?.id;
  for (const t of tops) {
    if (t.top <= oben) treffer = t.id;
    else break;
  }
  return treffer;
}

export function holeLeseStelle(): LeseStelle | undefined {
  try {
    const text = localStorage.getItem(LESESTELLE_SPEICHER);
    return text ? leseLeseStelle(JSON.parse(text)) : undefined;
  } catch {
    return undefined;
  }
}

export function merkeLeseStelle(topicId: string, sectionId: string, am = new Date().toISOString()): void {
  try {
    localStorage.setItem(LESESTELLE_SPEICHER, JSON.stringify({ topicId, sectionId, am } satisfies LeseStelle));
  } catch {
    /* ohne Speicher gibt es kein „Weiterlesen“ */
  }
}
