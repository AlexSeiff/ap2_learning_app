import { Link } from 'react-router-dom';
import type { CardType, Flashcard } from '../../shared/types';
import { AntwortVergleich, EigeneAntwortFeld } from '../components/EigeneAntwort';
import { LeichtOptionen } from '../components/LeichtOptionen';
import { Markdown } from '../components/Markdown';
import { useCardFilters, useCardSession } from '../hooks/useCardSession';
import { leichtZahlen } from '../lib/leicht';
import { isDue, LEICHT_MAX_BOX } from '../lib/progress';
import { withSettings } from '../lib/settings';
import { useStore } from '../lib/store';
import { NEW_PER_SESSION } from '../../shared/config';

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
  const { settings } = progress;
  const { f, set, deck, alle, pool, leicht, leichtModus, auswahl, ausSuche } = useCardFilters();
  const { session, index, card, flipped, done, start, end, flip, rate, runde, waehle, next, eigeneAntwort, setEigeneAntwort } =
    useCardSession();
  const startRunde = (cards: Flashcard[]) => start(cards, leichtModus ? leicht : null);

  const due = deck.filter((c) => progress.cards[c.id] && isDue(progress.cards[c.id].due));
  const fresh = deck.filter((c) => !progress.cards[c.id]);

  if (session && card && runde) {
    const topic = content.topics.find((t) => t.id === card.topicId);
    const cardDeck = content.decks.find((d) => d.id === card.deckId);
    const fertig = runde.gewaehlt !== null;
    const richtig = fertig && runde.optionen[runde.gewaehlt!].richtig;
    return (
      <div className="page narrow">
        <div className="session-head">
          <button type="button" className="ghost" onClick={end}>
            ← Beenden
          </button>
          <span>
            🟢 Leicht · Karte {index + 1} / {session.length}
          </span>
        </div>
        <div className={`flashcard leicht ${card.typ === 'falle' ? 'trap' : ''}`}>
          <div className="fc-meta">
            <span>
              {KIND_LABELS[card.kind]} · {cardDeck?.title ?? topic?.title}
            </span>
            {card.typ && <span className={`badge typ-${card.typ}`}>{CARD_TYPE_LABELS[card.typ]}</span>}
            {runde.karte.art === 'automatisch' && (
              <span
                className="badge auto"
                title="Die falschen Antworten stammen von anderen Karten dieses Decks – nicht von Hand geschrieben."
              >
                🤖 automatisch
              </span>
            )}
            <span className="muted small">{card.id}</span>
          </div>
          <Markdown className="fc-question">{card.question}</Markdown>
          <LeichtOptionen optionen={runde.optionen} gewaehlt={runde.gewaehlt} onWaehle={waehle} tasten label="Antworten" />
          {fertig && (
            <div className="fc-answer leicht-feedback" role="status">
              <p className={`verdict ${richtig ? 'ok' : 'bad'}`}>
                {richtig
                  ? `✅ Richtig! Die Karte kommt höchstens in Fach ${LEICHT_MAX_BOX}.`
                  : '❌ Leider falsch – die Karte kommt in dieser Runde noch einmal.'}
              </p>
              {card.answer && (
                <>
                  <h4>Ganze Antwort</h4>
                  <Markdown>{card.answer}</Markdown>
                </>
              )}
              {runde.karte.erklaerung && (
                <>
                  <h4>Warum die anderen falsch sind</h4>
                  <Markdown>{runde.karte.erklaerung}</Markdown>
                </>
              )}
            </div>
          )}
        </div>
        {fertig ? (
          <div className="actions">
            <button type="button" onClick={next} autoFocus>
              Weiter → <kbd>Enter</kbd>
            </button>
          </div>
        ) : (
          <p className="hint">
            Wähle die richtige Antwort: klicken oder <kbd>1</kbd>–<kbd>4</kbd>.
          </p>
        )}
      </div>
    );
  }

  if (session && card) {
    const topic = content.topics.find((t) => t.id === card.topicId);
    const cardDeck = content.decks.find((d) => d.id === card.deckId);
    return (
      <div className="page narrow">
        <div className="session-head">
          <button type="button" className="ghost" onClick={end}>
            ← Beenden
          </button>
          <span>
            Karte {index + 1} / {session.length}
          </span>
        </div>
        {/* Kein <button>: die Karte enthält Markdown mit Absätzen, Listen und Codeblöcken – das ist in einem Button ungültig. */}
        <div
          className={`flashcard ${flipped ? 'flipped' : ''} ${card.typ === 'falle' ? 'trap' : ''}`}
          role="button"
          tabIndex={0}
          aria-expanded={flipped}
          onClick={flip}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            if (!e.repeat) flip();
          }}
        >
          <div className="fc-meta">
            <span>
              {KIND_LABELS[card.kind]} · {cardDeck?.title ?? topic?.title}
            </span>
            {card.typ && <span className={`badge typ-${card.typ}`}>{CARD_TYPE_LABELS[card.typ]}</span>}
            {card.schwierigkeit && <span className="badge muted">{LEVEL_LABELS[card.schwierigkeit] ?? card.schwierigkeit}</span>}
            <span className="muted small">{card.id}</span>
          </div>
          <Markdown className="fc-question">{card.question}</Markdown>
          {card.typ === 'rechnung' && !flipped && <p className="hint">✏️ Erst auf Papier rechnen, dann umdrehen.</p>}
          {flipped && (
            <div className="fc-answer">
              <AntwortVergleich
                eigene={eigeneAntwort}
                muster={
                  card.answer ? (
                    <Markdown>{card.answer}</Markdown>
                  ) : (
                    <p className="muted">
                      Keine Musterantwort im Lernblatt – beantworte die Frage laut und prüfe dich anhand des Theorieteils.
                    </p>
                  )
                }
              />
              {!!card.tags?.length && (
                <div className="tags">
                  {card.tags.map((t) => (
                    <span key={t} className="tag">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          {!flipped && card.typ !== 'rechnung' && (
            <p className="hint">Antwort formulieren – im Kopf oder unten aufschreiben –, dann klicken oder Leertaste drücken.</p>
          )}
        </div>
        {!flipped && <EigeneAntwortFeld value={eigeneAntwort} onChange={setEigeneAntwort} onFertig={flip} />}
        {flipped && (
          <div className="rate-buttons">
            <button type="button" className="good" onClick={() => rate('gewusst')}>
              ✓ Gewusst <kbd>1</kbd>
            </button>
            <button type="button" className="mid" onClick={() => rate('unsicher')}>
              ~ Unsicher <kbd>2</kbd>
            </button>
            <button type="button" className="low" onClick={() => rate('nicht')}>
              ✗ Nicht gewusst <kbd>3</kbd>
            </button>
          </div>
        )}
      </div>
    );
  }

  const traps = pool.filter(
    (c) => c.typ === 'falle' && (f.thema === 'alle' || c.topicId === f.thema) && (!leichtModus || leicht.has(c.id)),
  );
  const lz = leichtZahlen(alle, leicht);
  const typLeicht = (typ: string) => pool.filter((c) => c.typ === typ && leicht.has(c.id)).length;
  const setMode = (an: boolean) => update((p) => withSettings(p, { leichtModus: an }));
  const known = (ids: Flashcard[]) => ids.filter((c) => (progress.cards[c.id]?.box ?? 0) >= 3).length;

  return (
    <div className="page">
      <h1>Karteikarten</h1>
      {session && (
        <div className="card success">
          Runde beendet: ✓ {done.gewusst} gewusst · ~ {done.unsicher} unsicher · ✗ {done.nicht} nicht gewusst
        </div>
      )}
      {auswahl && (
        <div className="card info actions">
          <span>
            {ausSuche
              ? `🔎 Aus der Suche: ${deck.length} ${deck.length === 1 ? 'Karte' : 'Karten'}.`
              : `▶ Heute lernen: ${deck.length} ${deck.length === 1 ? 'Karte' : 'Karten'} für diesen Schritt.`}
          </span>
          {deck.length > 0 && (
            <button type="button" onClick={() => startRunde(deck)} autoFocus={!session}>
              🃏 {session ? 'Noch einmal' : 'Diese Karten lernen'}
            </button>
          )}
          <Link to="/karteikarten" className="small">
            alle Karten
          </Link>
        </div>
      )}
      <div className="mode-switch" role="group" aria-label="Modus">
        <button type="button" aria-pressed={!leichtModus} onClick={() => setMode(false)}>
          🃏 Aufdecken
        </button>
        <button type="button" aria-pressed={leichtModus} onClick={() => setMode(true)}>
          🟢 Leicht (4 Antworten)
        </button>
      </div>
      {leichtModus && (
        <p className="hint">
          🟢 {lz.mc + lz.automatisch} von {lz.gesamt} Karten dieser Auswahl haben 4 Antworten
          {lz.automatisch > 0 && ` (${lz.automatisch} davon 🤖 automatisch aus anderen Karten des Decks)`}. Leicht-Modus ist zum Einstieg –
          für die Prüfung frei antworten: Mit 4 Antworten kommt eine Karte höchstens in Fach {LEICHT_MAX_BOX}.
        </p>
      )}
      <div className="filters">
        <label>
          Deep Dive
          <select value={f.thema} onChange={(e) => set({ thema: e.target.value, deck: 'alle' })}>
            <option value="alle">Alle Themen</option>
            {content.topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Deck
          <select value={f.deck} onChange={(e) => set({ deck: e.target.value, thema: 'alle' })}>
            <option value="alle">Alle Decks</option>
            {content.decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
                {d.status === 'offen' ? ' (ohne Deep Dive)' : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          Kartenart
          <select value={f.art} onChange={(e) => set({ art: e.target.value })}>
            <option value="alle">Alle</option>
            <option value="lernkarte">Lernkarten</option>
            {settings.prueferfragen && <option value="prueferfrage">Prüferfragen</option>}
            {settings.fachgespraech && !leichtModus && <option value="fachgespraech">Fachgespräch-Fragen</option>}
          </select>
        </label>
        <label>
          Typ
          <select value={f.typ} onChange={(e) => set({ typ: e.target.value })}>
            <option value="alle">Alle</option>
            {Object.entries(CARD_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
                {leichtModus ? ` (${typLeicht(k)} mit 4 Antworten)` : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          Schwierigkeit
          <select value={f.stufe} onChange={(e) => set({ stufe: e.target.value })}>
            <option value="alle">Alle</option>
            {Object.entries(LEVEL_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {k} – {v}
              </option>
            ))}
          </select>
        </label>
        <label className="check" title="Auch unter ⚙️ Einstellungen – ausgeblendete Karten behalten ihren Lernstand">
          <input
            type="checkbox"
            checked={settings.prueferfragen}
            onChange={(e) => update((p) => withSettings(p, { prueferfragen: e.target.checked }))}
          />
          ❓ Prüferfragen einbeziehen
        </label>
        <label className="check" title="Auch unter ⚙️ Einstellungen – ausgeblendete Karten behalten ihren Lernstand">
          <input
            type="checkbox"
            checked={settings.fachgespraech}
            onChange={(e) => update((p) => withSettings(p, { fachgespraech: e.target.checked }))}
          />
          🎤 Fachgespräch einbeziehen
        </label>
      </div>
      <div className="kpis">
        <div className="kpi">
          <span className="kpi-value">{due.length}</span>
          <span className="kpi-label">fällig</span>
        </div>
        <div className="kpi">
          <span className="kpi-value">{fresh.length}</span>
          <span className="kpi-label">neu</span>
        </div>
        <div className="kpi">
          <span className="kpi-value">
            {known(deck)}/{deck.length}
          </span>
          <span className="kpi-label">sicher (ab Fach 3)</span>
        </div>
      </div>
      <div className="actions">
        <button
          type="button"
          disabled={!due.length && !fresh.length}
          onClick={() => startRunde([...due, ...fresh.slice(0, NEW_PER_SESSION)])}
        >
          Lernen starten ({due.length + Math.min(fresh.length, NEW_PER_SESSION)})
        </button>
        <button type="button" className="secondary" disabled={!deck.length} onClick={() => startRunde(deck)}>
          Alle {deck.length} durchgehen
        </button>
        {traps.length > 0 && (
          <button
            type="button"
            className="secondary"
            onClick={() => startRunde(traps)}
            title="Typische Prüfungsfehler – vor jeder Übungsklausur wiederholen"
          >
            ⚠️ Fallen wiederholen ({traps.length})
          </button>
        )}
      </div>

      {content.cardHints.length > 0 && (
        <ul className="hint">
          {content.cardHints.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}

      {content.decks.length > 0 && (
        <section className="card">
          <h2>Decks</h2>
          <div className="table-wrap">
            <table className="stats">
              <thead>
                <tr>
                  <th>Deck</th>
                  <th>Prüfungsbereich</th>
                  <th>Quelle</th>
                  <th>Karten</th>
                  <th>sicher</th>
                  <th>fällig</th>
                </tr>
              </thead>
              <tbody>
                {content.decks.map((d) => {
                  const cards = pool.filter((c) => c.deckId === d.id && (!leichtModus || leicht.has(c.id)));
                  const dueCount = cards.filter((c) => progress.cards[c.id] && isDue(progress.cards[c.id].due)).length;
                  return (
                    <tr key={d.id}>
                      <td>
                        <a
                          href={`#/karteikarten?deck=${d.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            set({ deck: d.id, thema: 'alle' });
                          }}
                        >
                          {d.title}
                        </a>
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
        Leitner-System mit 5 Fächern: „Gewusst" schiebt die Karte ein Fach weiter (Abstände 1 · 3 · 7 · 14 · 30 Tage), „Nicht gewusst"
        zurück in Fach 1. Tastatur: <kbd>Leertaste</kbd> umdrehen, <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> bewerten. Im Leicht-Modus wählst
        du mit <kbd>1</kbd>–<kbd>4</kbd>; richtig bringt die Karte höchstens in Fach {LEICHT_MAX_BOX}, falsch zurück in Fach 1.
      </p>
    </div>
  );
}
