import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Rating } from '../../shared/progress';
import type { Flashcard } from '../../shared/types';
import { filterCards, readCardFilter, withCardFilter, type CardFilter } from '../lib/cards';
import { rateCard } from '../lib/progress';
import { shuffle } from '../lib/shuffle';
import { useStore } from '../lib/store';

/** Filterzustand der Karteikarten-Seite – liegt in der URL, damit Links wie `?thema=03&typ=falle` funktionieren. */
export function useCardFilters() {
  const { content } = useStore();
  const [params, setParams] = useSearchParams();
  const f = readCardFilter(params);
  const set = (changes: Partial<CardFilter>) => setParams(withCardFilter(params, changes), { replace: true });
  const deck = useMemo(
    () => filterCards(content.flashcards, { thema: f.thema, deck: f.deck, art: f.art, typ: f.typ, stufe: f.stufe }),
    [content, f.thema, f.deck, f.art, f.typ, f.stufe],
  );
  return { f, set, deck };
}

/** Eine Lernrunde: gemischte Kartenfolge, Umdrehen, Bewerten (Leitner) und Tastatur (Leertaste/Enter, 1 2 3). */
export function useCardSession() {
  const { update } = useStore();
  const [session, setSession] = useState<Flashcard[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState({ gewusst: 0, unsicher: 0, nicht: 0 });

  const start = (cards: Flashcard[]) => {
    setSession(shuffle(cards));
    setIndex(0);
    setFlipped(false);
    setDone({ gewusst: 0, unsicher: 0, nicht: 0 });
  };
  const end = () => setSession(null);
  const flip = () => setFlipped((x) => !x);

  const card = session?.[index];

  const rate = useCallback(
    (r: Rating) => {
      if (!card || !session) return;
      update((p) => rateCard(p, card.id, r));
      setDone((d) => ({ ...d, [r]: d[r] + 1 }));
      // „Nicht gewusst" kommt in dieser Runde noch einmal dran.
      if (r === 'nicht') setSession([...session, card]);
      setIndex((i) => i + 1);
      setFlipped(false);
    },
    [card, session, update],
  );

  useEffect(() => {
    if (!card) return;
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === ' ' || e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((x) => !x);
      } else if (flipped && e.key === '1') rate('gewusst');
      else if (flipped && e.key === '2') rate('unsicher');
      else if (flipped && e.key === '3') rate('nicht');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [card, flipped, rate]);

  return { session, index, card, flipped, done, start, end, flip, rate };
}
