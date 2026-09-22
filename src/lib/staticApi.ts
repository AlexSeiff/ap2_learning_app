// Datenquelle der GitHub-Pages-Version (npm run build:pages): kein Server, keine KI.
// Inhalte kommen aus content.json (beim Build aus content/ erzeugt), der Fortschritt aus dem localStorage des Browsers.
// Gespeichert wird nach denselben Regeln wie auf dem lokalen Server (checkProgressPut: Schema, Revision → 409, Versuchs-Rückgang).

import type { SaveProgressRequest } from '../../shared/api';
import { checkProgressPut } from '../../shared/progress';
import type { Content } from '../../shared/types';
import type { DataSource } from './api';
import { ApiError } from './apiError';

/** Schlüssel des Fortschritts im localStorage. Inhalt: dasselbe JSON wie data/fortschritt.json. */
export const PROGRESS_KEY = 'ap2-fortschritt';
/** Hier landet ein nicht lesbarer Stand, bevor er überschrieben wird (wie *.defekt-* auf dem Server). */
export const BROKEN_KEY = 'ap2-fortschritt-defekt';

export const AI_UNAVAILABLE = 'Nur in der lokalen App verfügbar (braucht den API-Schlüssel).';

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** Fortschritt im Browser lesen und speichern. `storage` als Funktion, weil schon der Zugriff auf localStorage werfen kann. */
export function createLocalProgressStore(storage: () => KeyValueStorage) {
  function readRaw(): unknown {
    const raw = storage().getItem(PROGRESS_KEY);
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      storage().setItem(BROKEN_KEY, raw);
      return null;
    }
  }

  return {
    /** Gespeicherter Stand oder null (noch nichts gespeichert oder localStorage nicht verfügbar). */
    read(): unknown {
      try {
        return readRaw();
      } catch {
        return null;
      }
    },
    /** Wie PUT /api/progress: prüft den Body und speichert ihn mit der nächsten Revision. Wirft ApiError. */
    save(body: SaveProgressRequest): { ok: true; revision: number } {
      let checked: ReturnType<typeof checkProgressPut>;
      try {
        checked = checkProgressPut(body, readRaw());
        if (checked.ok) storage().setItem(PROGRESS_KEY, JSON.stringify(checked.progress));
      } catch (e) {
        throw new ApiError(500, `Speichern im Browser fehlgeschlagen (${(e as Error).message}). Lade zur Sicherheit eine Sicherung herunter.`);
      }
      if (!checked.ok) throw new ApiError(checked.status, checked.error);
      return { ok: true, revision: checked.progress.revision };
    },
  };
}

export function createStaticApi(store = createLocalProgressStore(() => localStorage)): DataSource {
  const aiUnavailable = () => Promise.reject(new ApiError(501, AI_UNAVAILABLE));
  return {
    content: async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}content.json`);
      if (!res.ok) throw new ApiError(res.status, `Die Lernblätter konnten nicht geladen werden (Fehler ${res.status}).`);
      return (await res.json()) as Content;
    },
    progress: async () => store.read(),
    saveProgress: async (p) => store.save(p),
    saveProgressOnUnload: (p) => {
      try {
        store.save(p);
      } catch {
        // Beim Schließen lässt sich kein Fehler mehr anzeigen.
      }
    },
    // Keine automatischen Tagessicherungen im Browser.
    backups: async () => ({ newest: null, count: 0 }),
    aiStatus: async () => ({ enabled: false, model: '' }),
    generate: aiUnavailable,
    grade: aiUnavailable,
    deleteGenerated: aiUnavailable,
    watchOtherTabs: (onChange) => {
      // Das storage-Ereignis kommt nur in den anderen Tabs an – dieser Tab ist dann veraltet.
      const listener = (e: StorageEvent) => {
        if (e.key === PROGRESS_KEY) onChange();
      };
      window.addEventListener('storage', listener);
      return () => window.removeEventListener('storage', listener);
    },
  };
}
