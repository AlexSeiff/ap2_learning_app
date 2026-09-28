import { Link, useLocation } from 'react-router-dom';

/** Reiter „Freier Modus | Übungen“ – normale Links, damit der Zurück-Button des Browsers funktioniert. */
export function SqlTabs() {
  const { pathname } = useLocation();
  const frei = pathname === '/sql';
  return (
    <nav className="tabs" aria-label="SQL-Editor">
      <Link to="/sql" className={frei ? 'active' : ''} aria-current={frei ? 'page' : undefined}>
        ✏️ Freier Modus
      </Link>
      <Link to="/sql/uebungen" className={frei ? '' : 'active'} aria-current={frei ? undefined : 'page'}>
        🎯 Übungen
      </Link>
    </nav>
  );
}
