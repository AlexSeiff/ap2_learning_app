// Leicht-Modus der Karteikarten (ROADMAP Phase 6): 4 Antworten, 1 richtig. Reine Funktionen, getestet in tests/leicht.test.ts.
// Quelle der Antworten: der geprüfte Block „mc“ der Karte, sonst (abschaltbar) automatisch Antworten anderer Karten desselben Decks.

import { mcNorm } from '../../shared/lernkarten';
import type { Settings } from '../../shared/progress';
import type { CardType, Flashcard } from '../../shared/types';
import { shuffle } from './shuffle';

/** Kartentypen, für die automatische Antworten erzeugt werden (ROADMAP 6.1). `anwendung` nur mit eigenem mc-Block. */
export const LEICHT_TYPEN: readonly CardType[] = ['wissen', 'abgrenzung', 'falle', 'rechnung'];

/**
 * Höchstlänge einer Antwort (als Auswahltext) für automatische Antworten. Die Roadmap nennt 120 Zeichen – damit kämen aber nur
 * 4 der 407 Lernkarten in Frage (die meisten Antworten sind 150–250 Zeichen lang). 200 Zeichen sind noch gut als Auswahl lesbar.
 */
export const LEICHT_AUTO_MAX = 200;

/** Aus so vielen ähnlich langen Antworten werden die 3 falschen zufällig gezogen. */
const AUTO_POOL = 6;

export type LeichtArt = 'mc' | 'automatisch';

export interface LeichtKarte {
  art: LeichtArt;
  richtig: string;
  /** mc: genau 3; automatisch: 3–6 Kandidaten, aus denen je Runde 3 gezogen werden. */
  falsch: string[];
  erklaerung?: string;
}

export interface LeichtOption {
  text: string;
  richtig: boolean;
}

/** Ist der automatische Ersatz eingeschaltet? Fehlt die Einstellung (ältere Stände), gilt: ja. */
export const leichtAutomatischAn = (s: Pick<Settings, 'leichtAutomatisch'>) => s.leichtAutomatisch !== false;

/** Antwort (Markdown aus der Lernkarten-Datei) als einzeiliger Auswahltext: ohne Codezäune, Fettdruck und harte Umbrüche. */
export function optionText(markdown: string): string {
  return markdown
    .replace(/```\w*\n?/g, ' ')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Schlüssel einer automatisch nutzbaren Karte: Antworten kommen aus derselben Gruppe (Deck bzw. Prüferfragen desselben Themas). */
function gruppe(c: Flashcard): string | undefined {
  if (c.kind === 'lernkarte') return c.deckId ? `deck:${c.deckId}` : undefined;
  if (c.kind === 'prueferfrage') return `pf:${c.topicId ?? ''}`;
  return undefined;
}

/**
 * Alle Karten, die den Leicht-Modus unterstützen, mit ihrer Antwortquelle.
 * - Mit Block „mc“: immer (außer Fachgespräch-Fragen – die sind fürs freie Sprechen).
 * - Automatisch (wenn eingeschaltet): Lernkarten der Typen in LEICHT_TYPEN und Prüferfragen, deren Antwort höchstens LEICHT_AUTO_MAX
 *   Zeichen hat. Die falschen Antworten sind Antworten anderer Karten derselben Gruppe – zuerst gleicher Typ, dann ähnliche Länge
 *   (sonst verrät die Länge die richtige). Gleicher Typ hat Vorrang; reicht er nicht für 3, kommen andere Karten des Decks dazu.
 *   Gibt es keine 3 verschiedenen, fällt die Karte im Leicht-Modus weg.
 */
export function leichtKarten(cards: Flashcard[], opts: { automatisch: boolean }): Map<string, LeichtKarte> {
  const out = new Map<string, LeichtKarte>();
  type Kurz = { card: Flashcard; text: string; norm: string };
  const gruppen = new Map<string, Kurz[]>();
  for (const c of cards) {
    if (c.kind === 'fachgespraech') continue;
    if (c.mc) {
      out.set(c.id, {
        art: 'mc',
        richtig: c.mc.richtig,
        falsch: [...c.mc.falsch],
        ...(c.mc.erklaerung ? { erklaerung: c.mc.erklaerung } : {}),
      });
    }
    const g = gruppe(c);
    if (!g || !c.answer) continue;
    const text = optionText(c.answer);
    if (!text || text.length > LEICHT_AUTO_MAX) continue;
    const liste = gruppen.get(g) ?? [];
    liste.push({ card: c, text, norm: mcNorm(text) });
    gruppen.set(g, liste);
  }
  if (!opts.automatisch) return out;

  for (const liste of gruppen.values()) {
    for (const k of liste) {
      const c = k.card;
      if (out.has(c.id)) continue;
      if (c.kind === 'lernkarte' && !(c.typ && LEICHT_TYPEN.includes(c.typ))) continue;
      const naehe = (x: Kurz) => Math.abs(x.text.length - k.text.length);
      const seen = new Set([k.norm]);
      const andere = liste
        .filter((x) => x.card !== c)
        .sort((a, b) => naehe(a) - naehe(b))
        .filter((x) => !seen.has(x.norm) && seen.add(x.norm));
      const gleich = andere.filter((x) => x.card.typ === c.typ);
      const rest = andere.filter((x) => x.card.typ !== c.typ);
      const pool = gleich.length >= 3 ? gleich.slice(0, AUTO_POOL) : [...gleich, ...rest.slice(0, AUTO_POOL - gleich.length)];
      if (pool.length < 3) continue;
      out.set(c.id, { art: 'automatisch', richtig: k.text, falsch: pool.map((x) => x.text) });
    }
  }
  return out;
}

/** Die 4 Auswahlmöglichkeiten einer Karte in zufälliger Reihenfolge (Fisher–Yates): die richtige und 3 verschiedene falsche. */
export function kartenOptionen(l: LeichtKarte, rng: () => number = Math.random): LeichtOption[] {
  const falsch = l.art === 'mc' ? l.falsch.slice(0, 3) : shuffle(l.falsch, rng).slice(0, 3);
  return shuffle([{ text: l.richtig, richtig: true }, ...falsch.map((text) => ({ text, richtig: false }))], rng);
}

export interface LeichtZahlen {
  gesamt: number;
  mc: number;
  automatisch: number;
}

/** Wie viele der Karten den Leicht-Modus unterstützen (für die Anzeige an den Filtern). */
export function leichtZahlen(cards: Pick<Flashcard, 'id'>[], leicht: Map<string, LeichtKarte>): LeichtZahlen {
  const z = { gesamt: cards.length, mc: 0, automatisch: 0 };
  for (const c of cards) {
    const l = leicht.get(c.id);
    if (l?.art === 'mc') z.mc++;
    else if (l) z.automatisch++;
  }
  return z;
}
