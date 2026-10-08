import { lazy, type ReactNode, Suspense, useEffect, useState } from 'react';
import { HashRouter, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { CONFLICT_MESSAGE } from '../shared/progress';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Icon, type IconName } from './components/Icon';
import { HeuteLeiste } from './components/HeuteLeiste';
import { MobileNav } from './components/MobileNav';
import { UpdateHinweis } from './components/UpdateHinweis';
import { IS_STATIC } from './lib/api';
import { GLOSSAR_PFAD, passtZuZiel } from './lib/navigation';
import { isDue } from './lib/progress';
import { rechenSummary } from './lib/rechnen';
import { sqlSummary } from './lib/sql';
import { useStore } from './lib/store';
import { Aufgabe } from './pages/Aufgabe';
import { Aufgaben } from './pages/Aufgaben';
import { Daten } from './pages/Daten';
import { Dashboard } from './pages/Dashboard';
import { Druck } from './pages/Druck';
import { Einstellungen } from './pages/Einstellungen';
import { Fehlerjournal } from './pages/Fehlerjournal';
import { Generator } from './pages/Generator';
import { Karteikarten } from './pages/Karteikarten';
import { Klausur, KlausurAuswahl } from './pages/Klausur';
import { Material } from './pages/Material';
import { Thema, Themen } from './pages/Themen';

// SQL-Seiten lazy: sql.js (WASM) und CodeMirror landen so nicht im Hauptbundle.
const SqlFrei = lazy(() => import('./pages/SqlFrei').then((m) => ({ default: m.SqlFrei })));
const SqlUebungen = lazy(() => import('./pages/SqlUebungen').then((m) => ({ default: m.SqlUebungen })));
const SqlUebung = lazy(() => import('./pages/SqlUebung').then((m) => ({ default: m.SqlUebung })));
// Rechenübungen lazy: Vorlagen, Prüfung und (beim Rechenweg) KaTeX bleiben aus dem Hauptbundle.
const RechenUebungen = lazy(() => import('./pages/RechenUebungen').then((m) => ({ default: m.RechenUebungen })));
const RechenUebung = lazy(() => import('./pages/RechenUebung').then((m) => ({ default: m.RechenUebung })));
// „Heute lernen“ lazy: der Planer braucht nur diese Seite.
const Heute = lazy(() => import('./pages/Heute').then((m) => ({ default: m.Heute })));
// Operatoren-Trainer lazy: Quiz und Tabelle braucht nur diese Seite.
const Operatoren = lazy(() => import('./pages/Operatoren').then((m) => ({ default: m.Operatoren })));
// Formelsammlung lazy: zieht KaTeX nach.
const Formelsammlung = lazy(() => import('./pages/Formelsammlung').then((m) => ({ default: m.Formelsammlung })));
// Glossar lazy: baut den Index der Begriffe erst beim Öffnen.
const Glossar = lazy(() => import('./pages/Glossar').then((m) => ({ default: m.Glossar })));
// Globale Suche lazy: Index und Dialog laden erst beim ersten Öffnen (Strg+K oder „🔎 Suchen“).
const SucheDialog = lazy(() => import('./components/SucheDialog').then((m) => ({ default: m.SucheDialog })));

/** Suche öffnen/schließen; Strg+K (Mac: ⌘K) überall in der App. Nach dem Schließen geht der Fokus zurück. */
function useSuche() {
  const [offen, setOffen] = useState(false);
  const [vorher, setVorher] = useState<HTMLElement | null>(null);
  const oeffnen = () => {
    setVorher(document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setOffen(true);
  };
  const schliessen = () => {
    setOffen(false);
    vorher?.focus();
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setVorher(document.activeElement instanceof HTMLElement ? document.activeElement : null);
        setOffen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return { offen, oeffnen, schliessen };
}

function useTheme() {
  const [theme, setTheme] = useState<string>(() => {
    try {
      return localStorage.getItem('theme') ?? 'system';
    } catch {
      return 'system';
    }
  });
  useEffect(() => {
    if (theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* ohne Speicher einfach nicht merken */
    }
  }, [theme]);
  const next = theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system';
  const icon: IconName = theme === 'dark' ? 'moon' : theme === 'light' ? 'sun' : 'monitor';
  return { icon, toggle: () => setTheme(next), label: `Design: ${theme === 'system' ? 'System' : theme === 'dark' ? 'Dunkel' : 'Hell'}` };
}

function Nav({ onSuche }: { onSuche: () => void }) {
  const { content, progress, saveState } = useStore();
  const { pathname } = useLocation();
  const theme = useTheme();
  const dueJournal = Object.values(progress.journal).filter((j) => !j.resolvedAt && isDue(j.due)).length;
  const dueSql = sqlSummary(
    progress,
    content.sqlExercises.map((e) => e.id),
  ).due;
  const dueRechnen = rechenSummary(
    progress,
    content.rechenUebungen.map((u) => u.id),
  ).due;
  // „Lernen“ ist nicht zusätzlich hervorgehoben, wenn das Glossar-Thema (eigener Eintrag) offen ist.
  const imGlossar = passtZuZiel(GLOSSAR_PFAD, pathname);
  const link = (to: string, icon: IconName, label: string, badge?: number) => (
    <NavLink to={to} end={to === '/'} className={({ isActive }) => (isActive && !(to === '/lernen' && imGlossar) ? 'active' : '')}>
      <span className="nav-label">
        <Icon name={icon} /> {label}
      </span>
      {!!badge && <span className="nav-badge">{badge}</span>}
    </NavLink>
  );
  const saveText =
    saveState === 'gespeichert'
      ? 'Gespeichert'
      : saveState === 'speichert'
        ? 'Speichert …'
        : saveState === 'konflikt'
          ? 'Nicht gespeichert – neu laden'
          : 'Speichern fehlgeschlagen';
  return (
    <>
      <nav className="sidebar">
        <div className="brand">
          <Icon name="graduation-cap" /> AP2 Lern-App
        </div>
        <button type="button" className="suche-knopf" onClick={onSuche} title="Suchen (Strg+K)">
          <span>
            <Icon name="search" /> Suchen
          </span>
          <kbd>Strg K</kbd>
        </button>
        {link('/', 'house', 'Übersicht')}
        {link('/heute', 'play', 'Heute lernen')}
        {link('/lernen', 'book-open', 'Lernen')}
        {content.topics.some((t) => GLOSSAR_PFAD === `/lernen/${t.id}`) && link(GLOSSAR_PFAD, 'book-bookmark', 'Glossar & Diagramme')}
        {link('/karteikarten', 'layers', 'Karteikarten')}
        {link('/klausur', 'timer', 'Übungsklausur')}
        {link('/aufgaben', 'file-pen-line', 'Einzelaufgaben')}
        {link('/sql', 'database', 'SQL-Editor', dueSql)}
        {link('/rechnen', 'calculator', 'Rechenübungen', dueRechnen)}
        {link('/fehlerjournal', 'notebook-pen', 'Fehlerjournal', dueJournal)}
        {/* Pages hat keine KI (Roadmap 7.4, Entscheidung Q3) */}
        {!IS_STATIC && link('/generator', 'sparkles', 'KI-Aufgaben')}
        {link('/material', 'library', 'Material')}
        {link('/einstellungen', 'settings', 'Einstellungen')}
        {link('/daten', 'save', 'Daten & Import')}
        <div className="sidebar-foot">
          <button type="button" className="ghost" onClick={theme.toggle} title={theme.label}>
            <Icon name={theme.icon} /> {theme.label}
          </button>
          <span className={`save-state ${saveState}`}>{saveText}</span>
        </div>
      </nav>
      <MobileNav
        onSuche={onSuche}
        badges={{ sql: dueSql, rechnen: dueRechnen, journal: dueJournal }}
        theme={theme}
        saveText={saveText}
        saveState={saveState}
      />
    </>
  );
}

function SaveErrorBanner() {
  const { saveError, saveState } = useStore();
  if (saveState === 'konflikt') {
    // Dieser Tab speichert nicht mehr, sonst würde er den Fortschritt aus dem anderen Tab überschreiben.
    return (
      <div className="card warn" role="alert">
        <p>
          <Icon name="triangle-alert" /> {CONFLICT_MESSAGE}. Änderungen in diesem Tab werden nicht mehr gespeichert.
        </p>
        <button type="button" onClick={() => window.location.reload()}>
          <Icon name="rotate-cw" /> Neu laden
        </button>
      </div>
    );
  }
  return saveError ? (
    <p className="card warn" role="alert">
      <Icon name="triangle-alert" /> {saveError}
    </p>
  ) : null;
}

// Neuer key pro Route: nach einem Absturz reicht ein Klick in der Navigation, um weiterzulernen.
function PageErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <ErrorBoundary key={pathname}>{children}</ErrorBoundary>;
}

export function App() {
  return (
    <HashRouter>
      <Layout />
    </HashRouter>
  );
}

function Layout() {
  const sucheSteuerung = useSuche();
  return (
    <>
      <Routes>
        <Route path="/druck" element={<Druck />} />
        <Route
          path="*"
          element={
            <div className="layout">
              <Nav onSuche={sucheSteuerung.oeffnen} />
              <main>
                <SaveErrorBanner />
                <HeuteLeiste />
                <PageErrorBoundary>
                  <Suspense fallback={<div className="page loading">Lädt …</div>}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/heute" element={<Heute />} />
                      <Route path="/lernen" element={<Themen />} />
                      <Route path="/lernen/:topicId" element={<Thema />} />
                      <Route path="/karteikarten" element={<Karteikarten />} />
                      <Route path="/klausur" element={<KlausurAuswahl />} />
                      <Route path="/klausur/:topicId" element={<Klausur />} />
                      <Route path="/aufgaben" element={<Aufgaben />} />
                      <Route path="/aufgabe/:taskId" element={<Aufgabe />} />
                      <Route path="/sql" element={<SqlFrei />} />
                      <Route path="/sql/uebungen" element={<SqlUebungen />} />
                      <Route path="/sql/uebung/:id" element={<SqlUebung />} />
                      <Route path="/rechnen" element={<RechenUebungen />} />
                      <Route path="/rechnen/:id" element={<RechenUebung />} />
                      <Route path="/fehlerjournal" element={<Fehlerjournal />} />
                      <Route path="/generator" element={IS_STATIC ? <Navigate to="/" replace /> : <Generator />} />
                      <Route path="/material" element={<Material />} />
                      <Route path="/material/formeln" element={<Formelsammlung />} />
                      <Route path="/material/operatoren" element={<Operatoren />} />
                      <Route path="/material/glossar" element={<Glossar />} />
                      <Route path="/material/:docId" element={<Material />} />
                      <Route path="/einstellungen" element={<Einstellungen />} />
                      <Route path="/daten" element={<Daten />} />
                      <Route
                        path="*"
                        element={
                          <div className="page">
                            <h1>Seite nicht gefunden</h1>
                          </div>
                        }
                      />
                    </Routes>
                  </Suspense>
                </PageErrorBoundary>
              </main>
              {IS_STATIC && <UpdateHinweis />}
              {sucheSteuerung.offen && (
                <Suspense fallback={null}>
                  <SucheDialog onClose={sucheSteuerung.schliessen} />
                </Suspense>
              )}
            </div>
          }
        />
      </Routes>
    </>
  );
}
