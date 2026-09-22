import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Rating } from '../../shared/progress';
import type { CardType, Flashcard } from '../../shared/types';
import { Markdown } from '../components/Markdown';
import { isDue, rateCard } from '../lib/progress';
import { useStore } from '../lib/store';

const NEW_PER_SESSION = 20;

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  wissen: 'Wissen',
  abgrenzung: 'Abgrenzung',
  rechnung: 'Rechnung',
  anwendung: 'Anwendung',
  falle: 'Falle',
};
const LEVEL_LABELS: Record<number, string> = { 1: 'Basis', 2: 'Standard', 3: 'Transfer' };
const KIND_LABELS: Record<Flashcard['kind'], string> = {
  lernkarte: '🗂️ Lernkarte',
  prueferfrage: '❓ Prüferfrage',
  fachgespraech: '🎤 Fachgespräch',
};

export function Karteikarten() {
  const { content, progress, update } = useStore();
  const [params, setParams] = useSearchParams();
  const f = {
    thema: params.get('thema') ?? 'alle',
    deck: params.get('deck') ?? 'alle',
    art: params.get('art') ?? 'alle',
    typ: params.get('typ') ?? 'alle',
    stufe: params.get('stufe') ?? 'alle',
  };
  const set = (changes: Partial<typeof f>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (!v || v === 'alle') next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace: true });
  };

  const [session, setSession] = useState<Flashcard[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState({ gewusst: 0, unsicher: 0, nicht: 0 });

  const deck = useMemo(
    () =>
      content.flashcards.filter(
        (c) =>
          (f.thema === 'alle' || c.topicId === f.thema) &&
          (f.deck === 'alle' || c.deckId === f.deck) &&
          (f.art === 'alle' || c.kind === f.art) &&
          (f.typ === 'alle' || c.typ === f.typ) &&
          (f.stufe === 'alle' || String(c.schwierigkeit) === f.stufe),
      ),
    [content, f.thema, f.deck, f.art, f.typ, f.stufe],
  );
  const due = deck.filter((c) => progress.cards[c.id] && isDue(progress.cards[c.id].due));
  const fresh = deck.filter((c) => !progress.cards[c.id]);

  const start = (cards: Flashcard[]) => {
    setSession([...cards].sort(() => Math.random() - 0.5));
    setIndex(0);
    setFlipped(false);
    setDone({ gewusst: 0, unsicher: 0, nicht: 0 });
  };

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

  if (session && card) {
    const topic = content.topics.find((t) => t.id === card.topicId);
    const cardDeck = content.decks.find((d) => d.id === card.deckId);
    return (
      <div className="page narrow">
        <div className="session-head">
          <button type="button" className="ghost" onClick={() => setSession(null)}>← Beenden</button>
          <span>
            Karte {index + 1} / {session.length}
          </span>
        </div>
        <div className={`flashcard ${flipped ? 'flipped' : ''} ${card.typ === 'falle' ? 'trap' : ''}`} onClick={() => setFlipped((x) => !x)}>
          <div className="fc-meta">
            <span>{KIND_LABELS[card.kind]} · {cardDeck?.title ?? topic?.title}</span>
            {card.typ && <span className={`badge typ-${card.typ}`}>{CARD_TYPE_LABELS[card.typ]}</span>}
            {card.schwierigkeit && <span className="badge muted">{LEVEL_LABELS[card.schwierigkeit] ?? card.schwierigkeit}</span>}
            <span className="muted small">{card.id}</span>
          </div>
          <Markdown className="fc-question">{card.question}</Markdown>
          {card.typ === 'rechnung' && !flipped && <p className="hint">✏️ Erst auf Papier rechnen, dann umdrehen.</p>}
          {flipped && (
            <div className="fc-answer">
              {card.answer ? <Markdown>{card.answer}</Markdown> : <p className="muted">Keine Musterantwort im Lernblatt – beantworte die Frage laut und prüfe dich anhand des Theorieteils.</p>}
              {!!card.tags?.length && (
                <div className="tags">
                  {card.tags.map((t) => <span key={t} className="tag">#{t}</span>)}
                </div>
              )}
            </div>
          )}
          {!flipped && card.typ !== 'rechnung' && <p className="hint">Antwort im Kopf formulieren, dann klicken oder Leertaste drücken.</p>}
        </div>
        {flipped && (
          <div className="rate-buttons">
            <button type="button" className="good" onClick={() => rate('gewusst')}>✓ Gewusst <kbd>1</kbd></button>
            <button type="button" className="mid" onClick={() => rate('unsicher')}>~ Unsicher <kbd>2</kbd></button>
            <button type="button" className="low" onClick={() => rate('nicht')}>✗ Nicht gewusst <kbd>3</kbd></button>
          </div>
        )}
      </div>
    );
  }

  const traps = content.flashcards.filter((c) => c.typ === 'falle' && (f.thema === 'alle' || c.topicId === f.thema));
  const known = (ids: Flashcard[]) => ids.filter((c) => (progress.cards[c.id]?.box ?? 0) >= 3).length;

  return (
    <div className="page">
      <h1>Karteikarten</h1>
      {session && (
        <div className="card success">
          Runde beendet: ✓ {done.gewusst} gewusst · ~ {done.unsicher} unsicher · ✗ {done.nicht} nicht gewusst
        </div>
      )}
      <div className="filters">
        <label>
          Deep Dive
          <select value={f.thema} onChange={(e) => set({ thema: e.target.value, deck: 'alle' })}>
            <option value="alle">Alle Themen</option>
            {content.topics.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </label>
        <label>
          Deck
          <select value={f.deck} onChange={(e) => set({ deck: e.target.value, thema: 'alle' })}>
            <option value="alle">Alle Decks</option>
            {content.decks.map((d) => (
              <option key={d.id} value={d.id}>{d.title}{d.status === 'offen' ? ' (ohne Deep Dive)' : ''}</option>
            ))}
          </select>
        </label>
        <label>
          Kartenart
          <select value={f.art} onChange={(e) => set({ art: e.target.value })}>
            <option value="alle">Alle</option>
            <option value="lernkarte">Lernkarten</option>
            <option value="prueferfrage">Prüferfragen</option>
            <option value="fachgespraech">Fachgespräch-Fragen</option>
          </select>
        </label>
        <label>
          Typ
          <select value={f.typ} onChange={(e) => set({ typ: e.target.value })}>
            <option value="alle">Alle</option>
            {Object.entries(CARD_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label>
          Schwierigkeit
          <select value={f.stufe} onChange={(e) => set({ stufe: e.target.value })}>
            <option value="alle">Alle</option>
            {Object.entries(LEVEL_LABELS).map(([k, v]) => <option key={k} value={k}>{k} – {v}</option>)}
          </select>
        </label>
      </div>
      <div className="kpis">
        <div className="kpi"><span className="kpi-value">{due.length}</span><span className="kpi-label">fällig</span></div>
        <div className="kpi"><span className="kpi-value">{fresh.length}</span><span className="kpi-label">neu</span></div>
        <div className="kpi"><span className="kpi-value">{known(deck)}/{deck.length}</span><span className="kpi-label">sicher (ab Fach 3)</span></div>
      </div>
      <div className="actions">
        <button type="button" disabled={!due.length && !fresh.length} onClick={() => start([...due, ...fresh.slice(0, NEW_PER_SESSION)])}>
          Lernen starten ({due.length + Math.min(fresh.length, NEW_PER_SESSION)})
        </button>
        <button type="button" className="secondary" disabled={!deck.length} onClick={() => start(deck)}>
          Alle {deck.length} durchgehen
        </button>
        {traps.length > 0 && (
          <button type="button" className="secondary" onClick={() => start(traps)} title="Typische Prüfungsfehler – vor jeder Übungsklausur wiederholen">
            ⚠️ Fallen wiederholen ({traps.length})
          </button>
        )}
      </div>

      {content.cardHints.length > 0 && (
        <ul className="hint">
          {content.cardHints.map((h) => <li key={h}>{h}</li>)}
        </ul>
      )}

      {content.decks.length > 0 && (
        <section className="card">
          <h2>Decks</h2>
          <div className="table-wrap">
            <table className="stats">
              <thead>
                <tr><th>Deck</th><th>Prüfungsbereich</th><th>Quelle</th><th>Karten</th><th>sicher</th><th>fällig</th></tr>
              </thead>
              <tbody>
                {content.decks.map((d) => {
                  const cards = content.flashcards.filter((c) => c.deckId === d.id);
                  const dueCount = cards.filter((c) => progress.cards[c.id] && isDue(progress.cards[c.id].due)).length;
                  return (
                    <tr key={d.id}>
                      <td>
                        <a href={`#/karteikarten?deck=${d.id}`} onClick={(e) => { e.preventDefault(); set({ deck: d.id, thema: 'alle' }); }}>{d.title}</a>
                        {d.status === 'offen' && <span className="badge muted"> ohne Deep Dive</span>}
                      </td>
                      <td className="small">{d.area}</td>
                      <td className="small muted">{d.source}</td>
                      <td>{cards.length}</td>
                      <td>{known(cards)}</td>
                      <td>{dueCount || ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="hint">
        Leitner-System mit 5 Fächern: „Gewusst" schiebt die Karte ein Fach weiter (Abstände 1 · 3 · 7 · 14 · 30 Tage), „Nicht gewusst" zurück in Fach 1.
        Tastatur: <kbd>Leertaste</kbd> umdrehen, <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> bewerten.
      </p>
    </div>
  );
}
