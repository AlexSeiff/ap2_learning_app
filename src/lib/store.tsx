import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Content } from '../../shared/types';
import { api } from './api';
import { emptyProgress, migrateProgress, type Progress } from '../../shared/progress';

interface Store {
  content: Content;
  progress: Progress;
  aiEnabled: boolean;
  aiModel: string;
  update: (fn: (p: Progress) => Progress) => void;
  replaceProgress: (p: Progress) => void;
  reload: () => Promise<void>;
  saveState: 'gespeichert' | 'speichert' | 'fehler';
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
  const [saveState, setSaveState] = useState<Store['saveState']>('gespeichert');
  const [saveError, setSaveError] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const latest = useRef<Progress | null>(null);
  // Nach „Zurücksetzen“/„Sicherung einspielen“ darf der Server deutlich weniger Versuche annehmen.
  const resetPending = useRef(false);
  const saveBody = () => (resetPending.current ? { ...latest.current, reset: true } : latest.current);

  const reload = useCallback(async () => {
    setContent(await api.content());
  }, []);

  useEffect(() => {
    Promise.all([api.content(), api.progress(), api.aiStatus()])
      .then(([c, p, s]) => {
        setContent(c);
        setProgress(migrateProgress(p));
        setAi(s);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const persist = useCallback((p: Progress, reset = false) => {
    latest.current = p;
    if (reset) resetPending.current = true;
    setSaveState('speichert');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const wasReset = resetPending.current;
      api.saveProgress(saveBody()).then(
        () => {
          if (wasReset) resetPending.current = false;
          setSaveState('gespeichert');
          setSaveError(null);
        },
        (e: Error) => {
          setSaveState('fehler');
          setSaveError(e.message);
        },
      );
    }, 400);
  }, []);

  // Beim Schließen des Tabs ausstehende Änderungen noch senden.
  useEffect(() => {
    const flush = () => {
      if (timer.current !== undefined && latest.current) {
        fetch('/api/progress', { method: 'PUT', body: JSON.stringify(saveBody()), keepalive: true, headers: { 'Content-Type': 'application/json' } });
      }
    };
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, []);

  const update = useCallback(
    (fn: (p: Progress) => Progress) => {
      setProgress((prev) => {
        const next = fn(prev ?? emptyProgress());
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const replaceProgress = useCallback(
    (p: Progress) => {
      const next = migrateProgress(p);
      setProgress(next);
      persist(next, true);
    },
    [persist],
  );

  if (error) {
    return (
      <div className="page">
        <h1>Fehler beim Laden</h1>
        <p className="error">{error}</p>
        <p>Läuft der Server? Starte die App mit <code>npm run dev</code> im Ordner <code>lern-app</code>.</p>
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
