import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Content } from '../../shared/types';
import { api, IS_STATIC } from './api';
import { createProgressSaver, type SaveState } from './progressSaver';
import { emptyProgress, migrateProgress, type Progress } from '../../shared/progress';

interface Store {
  content: Content;
  progress: Progress;
  aiEnabled: boolean;
  aiModel: string;
  update: (fn: (p: Progress) => Progress) => void;
  replaceProgress: (p: Progress) => void;
  reload: () => Promise<void>;
  saveState: SaveState;
  /** Meldung des Servers, wenn das Speichern abgelehnt wurde (z. B. HTTP 400). */
  saveError: string | null;
}

const StoreContext = createContext<Store | null>(null);

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore außerhalb des StoreProvider');
  return s;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [ai, setAi] = useState({ enabled: false, model: '' });
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('gespeichert');
  const [saveError, setSaveError] = useState<string | null>(null);
  // Immer der neueste Stand – auch wenn mehrere update()-Aufrufe vor dem nächsten Rendern kommen.
  const progressRef = useRef<Progress | null>(null);
  const [saver] = useState(() =>
    createProgressSaver({
      send: api.saveProgress,
      onState: (state, err) => {
        setSaveState(state);
        if (err !== undefined) setSaveError(err);
      },
    }),
  );

  const reload = useCallback(async () => {
    setContent(await api.content());
  }, []);

  useEffect(() => {
    Promise.all([api.content(), api.progress(), api.aiStatus()])
      .then(([c, p, s]) => {
        setContent(c);
        progressRef.current = migrateProgress(p);
        saver.setBaseRevision(progressRef.current.revision);
        setProgress(progressRef.current);
        setAi(s);
      })
      .catch((e: Error) => setError(e.message));
  }, [saver]);

  // Beim Schließen des Tabs noch nicht bestätigte Änderungen senden.
  useEffect(() => {
    const flush = () => {
      const body = saver.flushBody();
      if (body !== undefined) api.saveProgressOnUnload(body);
    };
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, [saver]);

  // Pages-Version: Hat ein anderer Tab gespeichert, ist dieser veraltet – gleich den Hinweis „anderer Tab“ zeigen.
  useEffect(() => api.watchOtherTabs(() => saver.markConflict()), [saver]);

  // Den neuen Stand außerhalb des State-Updaters berechnen und speichern – Updater müssen rein sein (StrictMode ruft sie doppelt auf).
  const commit = useCallback(
    (next: Progress, reset = false) => {
      progressRef.current = next;
      setProgress(next);
      saver.schedule(next, reset);
    },
    [saver],
  );

  const update = useCallback((fn: (p: Progress) => Progress) => commit(fn(progressRef.current ?? emptyProgress())), [commit]);

  const replaceProgress = useCallback((p: Progress) => commit(migrateProgress(p), true), [commit]);

  if (error) {
    return (
      <div className="page">
        <h1>Fehler beim Laden</h1>
        <p className="error">{error}</p>
        {IS_STATIC ? (
          <p>Prüf deine Internetverbindung und lade die Seite neu.</p>
        ) : (
          <p>
            Läuft der Server? Starte die App mit <code>npm run dev</code> im Ordner <code>lern-app</code>.
          </p>
        )}
      </div>
    );
  }
  if (!content || !progress) return <div className="page loading">Lade Lernblätter …</div>;

  return (
    <StoreContext.Provider
      value={{ content, progress, aiEnabled: ai.enabled, aiModel: ai.model, update, replaceProgress, reload, saveState, saveError }}
    >
      {children}
    </StoreContext.Provider>
  );
}
