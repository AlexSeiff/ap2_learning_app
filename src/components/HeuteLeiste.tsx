import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useHeuteSitzung } from '../hooks/useHeute';
import { HEUTE_ICONS } from '../lib/heute';
import { aktuellerSchritt, istFertig, setzeSitzung, weiter } from '../lib/heuteSitzung';
import { Icon } from './Icon';

/**
 * Leiste über jeder Seite, solange eine „Heute lernen“-Runde läuft (ROADMAP 8.1): zeigt den aktuellen Schritt und führt mit
 * „Weiter →“ zum nächsten. Die Seiten selbst bleiben unverändert – gelernt wird wie sonst auch.
 */
export function HeuteLeiste() {
  const sitzung = useHeuteSitzung();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  if (!sitzung || istFertig(sitzung) || pathname === '/heute') return null;
  const schritt = aktuellerSchritt(sitzung)!;
  const naechster = () => {
    const next = weiter(sitzung);
    setzeSitzung(next);
    navigate(istFertig(next) ? '/heute' : aktuellerSchritt(next)!.link);
    window.scrollTo(0, 0);
  };
  return (
    <div className="heute-leiste no-print" role="region" aria-label="Heute lernen">
      <span>
        <Link to="/heute">
          <Icon name="play" /> Heute lernen
        </Link>{' '}
        · Schritt {sitzung.index + 1}/{sitzung.items.length}:{' '}
        <Link to={schritt.link}>
          <Icon name={HEUTE_ICONS[schritt.art]} /> {schritt.titel}
        </Link>
      </span>
      <button type="button" onClick={naechster}>
        {sitzung.index + 1 < sitzung.items.length ? 'Weiter →' : 'Fertig ✓'}
      </button>
    </div>
  );
}
