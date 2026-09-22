import { useEffect, useState } from 'react';
import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';
import { isDue } from './lib/progress';
import { useStore } from './lib/store';
import { Aufgabe } from './pages/Aufgabe';
import { Aufgaben } from './pages/Aufgaben';
import { Daten } from './pages/Daten';
import { Dashboard } from './pages/Dashboard';
import { Druck } from './pages/Druck';
import { Fehlerjournal } from './pages/Fehlerjournal';
import { Generator } from './pages/Generator';
import { Karteikarten } from './pages/Karteikarten';
import { Klausur, KlausurAuswahl } from './pages/Klausur';
import { Material } from './pages/Material';
import { Thema, Themen } from './pages/Themen';

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
  const icon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🖥️';
  return { icon, toggle: () => setTheme(next), label: `Design: ${theme === 'system' ? 'System' : theme === 'dark' ? 'Dunkel' : 'Hell'}` };
}

function Nav() {
  const { progress, saveState } = useStore();
  const theme = useTheme();
  const dueJournal = Object.values(progress.journal).filter((j) => !j.resolvedAt && isDue(j.due)).length;
  const link = (to: string, label: string, badge?: number) => (
    <NavLink to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
      {label}
      {!!badge && <span className="nav-badge">{badge}</span>}
    </NavLink>
  );
  return (
    <nav className="sidebar">
      <div className="brand">🎓 AP2 Lern-App</div>
      {link('/', 'Übersicht')}
      {link('/lernen', 'Lernen')}
      {link('/karteikarten', 'Karteikarten')}
      {link('/klausur', 'Übungsklausur')}
      {link('/aufgaben', 'Einzelaufgaben')}
      {link('/fehlerjournal', 'Fehlerjournal', dueJournal)}
      {link('/generator', 'KI-Aufgaben')}
      {link('/material', 'Material')}
      {link('/daten', 'Daten & Import')}
      <div className="sidebar-foot">
        <button type="button" className="ghost" onClick={theme.toggle} title={theme.label}>
          {theme.icon} {theme.label}
        </button>
        <span className={`save-state ${saveState}`}>
          {saveState === 'gespeichert' ? '✓ gespeichert' : saveState === 'speichert' ? '… speichert' : '⚠ Speichern fehlgeschlagen'}
        </span>
      </div>
    </nav>
  );
}

function SaveErrorBanner() {
  const { saveError } = useStore();
  return saveError ? <p className="card warn" role="alert">⚠ {saveError}</p> : null;
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/druck" element={<Druck />} />
        <Route
          path="*"
          element={
            <div className="layout">
              <Nav />
              <main>
                <SaveErrorBanner />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/lernen" element={<Themen />} />
                  <Route path="/lernen/:topicId" element={<Thema />} />
                  <Route path="/karteikarten" element={<Karteikarten />} />
                  <Route path="/klausur" element={<KlausurAuswahl />} />
                  <Route path="/klausur/:topicId" element={<Klausur />} />
                  <Route path="/aufgaben" element={<Aufgaben />} />
                  <Route path="/aufgabe/:taskId" element={<Aufgabe />} />
                  <Route path="/fehlerjournal" element={<Fehlerjournal />} />
                  <Route path="/generator" element={<Generator />} />
                  <Route path="/material" element={<Material />} />
                  <Route path="/material/:docId" element={<Material />} />
                  <Route path="/daten" element={<Daten />} />
                  <Route path="*" element={<div className="page"><h1>Seite nicht gefunden</h1></div>} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </HashRouter>
  );
}
