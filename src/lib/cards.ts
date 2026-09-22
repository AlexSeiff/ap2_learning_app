// Karteikarten-Filter: reine Funktionen, der Zustand steht in der URL (?thema=…&deck=…).

import type { Flashcard } from '../../shared/types';

export type CardFilter = { thema: string; deck: string; art: string; typ: string; stufe: string };

/** Liest die Filter aus den URL-Parametern; fehlende Werte bedeuten „alle". */
export function readCardFilter(params: URLSearchParams): CardFilter {
  return {
    thema: params.get('thema') ?? 'alle',
    deck: params.get('deck') ?? 'alle',
    art: params.get('art') ?? 'alle',
    typ: params.get('typ') ?? 'alle',
    stufe: params.get('stufe') ?? 'alle',
  };
}

/** Übernimmt Filteränderungen in neue URL-Parameter; „alle" oder leer entfernt den Parameter. */
export function withCardFilter(params: URLSearchParams, changes: Partial<CardFilter>): URLSearchParams {
  const next = new URLSearchParams(params);
  for (const [k, v] of Object.entries(changes)) {
    if (!v || v === 'alle') next.delete(k);
    else next.set(k, v);
  }
  return next;
}

export function filterCards(cards: Flashcard[], f: CardFilter): Flashcard[] {
  return cards.filter(
    (c) =>
      (f.thema === 'alle' || c.topicId === f.thema) &&
      (f.deck === 'alle' || c.deckId === f.deck) &&
      (f.art === 'alle' || c.kind === f.art) &&
      (f.typ === 'alle' || c.typ === f.typ) &&
      (f.stufe === 'alle' || String(c.schwierigkeit) === f.stufe),
  );
}
