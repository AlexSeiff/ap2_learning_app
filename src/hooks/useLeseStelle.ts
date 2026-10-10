import { useEffect } from 'react';
import { merkeLeseStelle, obersterAbschnitt } from '../lib/leseStelle';

/**
 * Merkt sich beim Lesen eines Lernblatts den Abschnitt, der oben steht (für „Weiterlesen“ auf der Übersicht). Beim Öffnen gilt der
 * erste Abschnitt, danach höchstens alle 400 ms beim Scrollen.
 */
export function useLeseStelle(topicId: string | undefined, sectionIds: string[]) {
  const schluessel = sectionIds.join('|');
  useEffect(() => {
    if (!topicId || !sectionIds.length) return;
    let letzte = '';
    const merke = () => {
      const kopf = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--kopf-hoehe')) || 56;
      const tops = sectionIds.flatMap((id) => {
        const el = document.getElementById(id);
        return el ? [{ id, top: el.getBoundingClientRect().top }] : [];
      });
      const id = obersterAbschnitt(tops, kopf + 80);
      if (id && id !== letzte) {
        letzte = id;
        merkeLeseStelle(topicId, id);
      }
    };
    merke();
    let t = 0;
    const onScroll = () => {
      if (!t) {
        t = window.setTimeout(() => {
          t = 0;
          merke();
        }, 400);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(t);
    };
    // sectionIds steckt in `schluessel`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, schluessel]);
}
