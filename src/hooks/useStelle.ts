import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Springt zu `?stelle=<id>` (Ziel der globalen Suche, ROADMAP 8.8): scrollt das Element mit dieser ID in den Blick und hebt es kurz
 * hervor. Ein Hash-Anker geht nicht, weil die App den HashRouter nutzt. `bereit` = Inhalt ist gerendert (z. B. Thema gefunden).
 */
export function useStelle(bereit = true) {
  const [params] = useSearchParams();
  const stelle = params.get('stelle');
  useEffect(() => {
    if (!stelle || !bereit) return;
    // Nach dem Rendern (und nachdem lazy Teile wie KaTeX Platz bekommen haben) springen.
    const t = window.setTimeout(() => {
      const el = document.getElementById(stelle);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('stelle-ziel');
      window.setTimeout(() => el.classList.remove('stelle-ziel'), 2500);
    }, 80);
    return () => window.clearTimeout(t);
  }, [stelle, bereit]);
  return stelle;
}
