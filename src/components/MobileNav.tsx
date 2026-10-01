import { useEffect, useId, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { IS_STATIC } from '../lib/api';
import { aktiveGruppe, badgeSumme, MEHR_ZIELE, type NavBadge, type NavGruppe, type NavZiel, UEBEN_ZIELE } from '../lib/navigation';

type Props = {
  /** Öffnet die globale Suche (ROADMAP 8.8) – erster Eintrag im Menü „Mehr“. */
  onSuche: () => void;
  badges: Record<NavBadge, number>;
  theme: { icon: string; label: string; toggle: () => void };
  saveText: string;
  saveState: string;
};

type Menue = 'ueben' | 'mehr';

const Badge = ({ n }: { n: number }) => (n > 0 ? <span className="nav-badge">{n}</span> : null);

/** Untere Navigation unter 600 px (Roadmap 7.2). Darüber bleibt die Seitenleiste; per CSS ist immer nur eine sichtbar. */
export function MobileNav({ onSuche, badges, theme, saveText, saveState }: Props) {
  const { pathname } = useLocation();
  // Das Menü merkt sich die Seite, auf der es geöffnet wurde – nach einem Seitenwechsel ist es damit zu.
  const [geoeffnet, setGeoeffnet] = useState<{ menue: Menue; pfad: string } | null>(null);
  const offen = geoeffnet?.pfad === pathname ? geoeffnet.menue : null;
  const setOffen = (m: Menue | null) => setGeoeffnet(m && { menue: m, pfad: pathname });
  const navRef = useRef<HTMLElement>(null);
  const knoepfe = { ueben: useRef<HTMLButtonElement>(null), mehr: useRef<HTMLButtonElement>(null) };
  const panelRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const aktiv = aktiveGruppe(pathname);
  const mehrZiele = MEHR_ZIELE.filter((z) => !(z.nurLokal && IS_STATIC));

  useEffect(() => {
    if (!offen) return;
    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    const knopf = knoepfe[offen].current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setGeoeffnet(null);
      knopf?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setGeoeffnet(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
    // knoepfe sind stabile Refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offen]);

  const platz = (to: string, gruppe: NavGruppe, icon: string, label: string) => (
    <NavLink to={to} end={to === '/'} className={aktiv === gruppe ? 'active' : ''} aria-current={aktiv === gruppe ? 'page' : undefined}>
      <span className="bn-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="bn-label">{label}</span>
    </NavLink>
  );

  const menueKnopf = (menue: Menue, icon: string, label: string, badge: number) => (
    <button
      ref={knoepfe[menue]}
      type="button"
      className={`bn-menu${aktiv === menue ? ' active' : ''}`}
      aria-expanded={offen === menue}
      aria-controls={`${id}-${menue}`}
      onClick={() => setOffen(offen === menue ? null : menue)}
    >
      <span className="bn-icon" aria-hidden="true">
        {icon}
        <Badge n={badge} />
      </span>
      <span className="bn-label">{label}</span>
      {badge > 0 && <span className="sr-only">, {badge} fällig</span>}
    </button>
  );

  const liste = (ziele: NavZiel[]) => (
    <ul>
      {ziele.map((z) => (
        <li key={z.to}>
          <NavLink to={z.to} className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setGeoeffnet(null)}>
            {z.label}
            {z.badge && <Badge n={badges[z.badge]} />}
          </NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <nav className="bottom-nav" aria-label="Navigation" ref={navRef}>
      {offen && (
        <div className="bn-panel" id={`${id}-${offen}`} ref={panelRef}>
          {offen === 'ueben' ? (
            liste(UEBEN_ZIELE)
          ) : (
            <>
              <button
                type="button"
                className="bn-suche"
                onClick={() => {
                  setGeoeffnet(null);
                  onSuche();
                }}
              >
                🔎 Suchen
              </button>
              {liste(mehrZiele)}
              <div className="bn-foot">
                <button type="button" className="ghost" onClick={theme.toggle} title={theme.label}>
                  {theme.icon} {theme.label}
                </button>
                <span className={`save-state ${saveState}`}>{saveText}</span>
              </div>
            </>
          )}
        </div>
      )}
      <div className="bn-bar">
        {platz('/', 'uebersicht', '🏠', 'Übersicht')}
        {platz('/lernen', 'lernen', '📖', 'Lernen')}
        {platz('/karteikarten', 'karteikarten', '🃏', 'Karteikarten')}
        {menueKnopf('ueben', '✏️', 'Üben', badgeSumme(UEBEN_ZIELE, badges))}
        {menueKnopf('mehr', '☰', 'Mehr', badgeSumme(mehrZiele, badges))}
      </div>
    </nav>
  );
}
