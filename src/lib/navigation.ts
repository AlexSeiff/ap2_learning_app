// Untere Navigation für schmale Bildschirme (Roadmap 7.2, unter 600 px): fünf Plätze, „Üben“ und „Mehr“ öffnen ein Menü.
// Rein, ohne React – die Komponente steht in components/MobileNav.tsx.

export type NavBadge = 'sql' | 'rechnen' | 'journal';

export type NavZiel = { to: string; label: string; badge?: NavBadge; nurLokal?: boolean };

export type NavGruppe = 'uebersicht' | 'lernen' | 'karteikarten' | 'ueben' | 'mehr';

export const UEBEN_ZIELE: NavZiel[] = [
  { to: '/heute', label: '▶ Heute lernen' },
  { to: '/klausur', label: '⏱️ Übungsklausur' },
  { to: '/aufgaben', label: '📝 Einzelaufgaben' },
  { to: '/sql', label: '🧮 SQL-Editor', badge: 'sql' },
  { to: '/rechnen', label: '📐 Rechenübungen', badge: 'rechnen' },
];

/** Thema „Glossar & Diagramme“ (Deep Dive 17): eigener Eintrag in der Navigation, damit Begriffe und Diagramme mit einem Klick erreichbar sind. */
export const GLOSSAR_PFAD = '/lernen/17';

export const MEHR_ZIELE: NavZiel[] = [
  { to: '/fehlerjournal', label: '📓 Fehlerjournal', badge: 'journal' },
  { to: '/generator', label: '🤖 KI-Aufgaben', nurLokal: true },
  { to: '/material', label: '📚 Material' },
  { to: GLOSSAR_PFAD, label: '📘 Glossar & Diagramme' },
  { to: '/einstellungen', label: '⚙️ Einstellungen' },
  { to: '/daten', label: '💾 Daten & Import' },
];

/** Gehört der Pfad zu diesem Ziel? `/aufgaben` umfasst auch `/aufgabe/:id`, `/sql` auch `/sql/uebungen` usw. */
export function passtZuZiel(to: string, pathname: string): boolean {
  if (to === '/') return pathname === '/';
  if (to === '/aufgaben' && pathname.startsWith('/aufgabe/')) return true;
  return pathname === to || pathname.startsWith(`${to}/`);
}

/** Welcher der fünf Plätze ist für diesen Pfad hervorgehoben? */
export function aktiveGruppe(pathname: string): NavGruppe | undefined {
  if (passtZuZiel('/', pathname)) return 'uebersicht';
  if (passtZuZiel(GLOSSAR_PFAD, pathname)) return 'mehr';
  if (passtZuZiel('/lernen', pathname)) return 'lernen';
  if (passtZuZiel('/karteikarten', pathname)) return 'karteikarten';
  if (UEBEN_ZIELE.some((z) => passtZuZiel(z.to, pathname))) return 'ueben';
  if (MEHR_ZIELE.some((z) => passtZuZiel(z.to, pathname))) return 'mehr';
  return undefined;
}

/** Summe der fälligen Wiederholungen einer Ziel-Liste (Badge am Menüknopf). */
export function badgeSumme(ziele: NavZiel[], badges: Record<NavBadge, number>): number {
  return ziele.reduce((s, z) => s + (z.badge ? badges[z.badge] : 0), 0);
}
