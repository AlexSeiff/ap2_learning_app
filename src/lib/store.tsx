import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Content } from '../../shared/types';
import { api } from './api';
import { emptyProgress, type Progress } from './progress';

interface Store {
  content: Content;
  progress: Progress;
  aiEnabled: boolean;
  aiModel: string;
  update: (fn: (p: Progress) => Progress) => void;
  replaceProgress: (p: Progress) => void;
  reload: () => Promise<void>;
  saveState: 'gespeichert' | 'speichert' | 'fehler';
}

const StoreContext = createContext<Store | null>(null);

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore außerhalb des StoreProvider');
  return s;
}

function normalizeProgress(raw: unknown): Progress {
  const base = emptyProgress();
  if (!raw || typeof raw !== 'object') return base;
  return { ...base, ...(raw as Partial<Progress>), version: 1 };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [ai, setAi] = useState({ enabled: false, model: '' });
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<Store['saveState']>('gespeichert');
  const timer = useRef<number | undefined>(undefined);
  const latest = useRef<Progress | null>(null);

  const reload = useCallback(async () => {
    setContent(await api.content());
  }, []);

  useEffect(() => {
    Promise.all([api.content(), api.progress(), api.aiStatus()])
      .then(([c, p, s]) => {
        setContent(c);
        setProgress(normalizeProgress(p));
        setAi(s);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const persist = useCallback((p: Progress) => {
    latest.current = p;
    setSaveState('speichert');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      api.saveProgress(latest.current).then(
        () => setSaveState('gespeichert'),
        () => setSaveState('fehler'),
      );
    }, 400);
  }, []);

  // Beim Schließen des Tabs ausstehende Änderungen noch senden.
  useEffect(() => {
    const flush = () => {
      if (timer.current !== undefined && latest.current) {
        fetch('/api/progress', { method: 'PUT', body: JSON.stringify(latest.current), keepalive: true, headers: { 'Content-Type': 'application/json' } });
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

  const replaceProgress = useCallback((p: Progress) => update(() => normalizeProgress(p)), [update]);

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
      value={{ content, progress, aiEnabled: ai.enabled, aiModel: ai.model, update, replaceProgress, reload, saveState }}
    >
      {children}
    </StoreContext.Provider>
  );
}
