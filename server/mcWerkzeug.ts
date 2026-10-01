// Werkzeug für die Auswahlantworten der Lernkarten (ROADMAP 6.3, nur lokal, die Besitzerin/der Besitzer startet es selbst):
// `npm run mc-entwurf -- --deck sql` lässt Claude mc-Blöcke vorschlagen → data/mc-entwurf.json (zum Durchsehen),
// `npm run mc-uebernehmen` trägt die angenommenen Einträge in AP2_FIDPA_Lernkarten.json ein.
// Hier steht nur die reine Logik (Prompt, Prüfung der Antwort, Entwurf zusammenführen, Datei ändern) – getestet in tests/mcWerkzeug.test.ts.

import type Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { pruefeMc } from '../shared/lernkarten';
import type { KartenMc } from '../shared/types';

/** Kartentypen, für die Auswahlantworten sinnvoll sind (ROADMAP 6.1); `anwendung` nur auf ausdrücklichen Wunsch. */
export const MC_TYPEN = ['wissen', 'abgrenzung', 'falle', 'rechnung'] as const;

/** So viele Karten gehen in eine Anfrage an die API. */
export const MC_JE_ANFRAGE = 15;

/** Eine Karte, wie sie in AP2_FIDPA_Lernkarten.json steht (nur die Felder, die das Werkzeug braucht). */
export interface RohKarte {
  id: string;
  frage: string;
  antwort: string;
  typ?: string;
  mc?: unknown;
  [key: string]: unknown;
}

export interface RohDeck {
  id: string;
  titel?: string;
  pruefungsbereich?: string;
  karten: RohKarte[];
  [key: string]: unknown;
}

export interface RohLernkarten {
  decks: RohDeck[];
  [key: string]: unknown;
}

export type EntwurfStatus = 'offen' | 'angenommen' | 'abgelehnt';

export interface EntwurfEintrag {
  id: string;
  deck: string;
  frage: string;
  antwort: string;
  /** Zum Durchsehen: „offen“ → nach Prüfung „angenommen“ (wird übernommen) oder „abgelehnt“. */
  status: EntwurfStatus;
  mc: KartenMc;
}

export interface Entwurf {
  hinweis: string;
  eintraege: EntwurfEintrag[];
}

export const ENTWURF_HINWEIS =
  'Vorschläge der KI – bitte jeden Eintrag prüfen und bei Bedarf verbessern. Setze "status" auf "angenommen" (wird von ' +
  'npm run mc-uebernehmen in AP2_FIDPA_Lernkarten.json eingetragen) oder "abgelehnt". Die Karten-IDs nicht ändern.';

export const leererEntwurf = (): Entwurf => ({ hinweis: ENTWURF_HINWEIS, eintraege: [] });

const EintragSchema = z.object({
  id: z.string().min(1),
  deck: z.string(),
  frage: z.string(),
  antwort: z.string(),
  status: z.enum(['offen', 'angenommen', 'abgelehnt']),
  mc: z.unknown(),
});

/** Liest data/mc-entwurf.json; ungültige Einträge werden mit Grund gemeldet statt still verworfen. */
export function leseEntwurf(json: string): { entwurf: Entwurf; fehler: string[] } {
  const fehler: string[] = [];
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch (e) {
    return { entwurf: leererEntwurf(), fehler: [`Entwurf ist kein gültiges JSON: ${(e as Error).message}`] };
  }
  const roh = (data as { eintraege?: unknown })?.eintraege;
  if (!Array.isArray(roh)) return { entwurf: leererEntwurf(), fehler: ['Entwurf ohne Feld „eintraege“.'] };
  const eintraege: EntwurfEintrag[] = [];
  roh.forEach((e, i) => {
    const r = EintragSchema.safeParse(e);
    if (!r.success) {
      fehler.push(`Eintrag ${i + 1}: ${r.error.issues[0]?.path.join('.') || 'ungültig'} – ${r.error.issues[0]?.message ?? ''}`);
      return;
    }
    const mc = pruefeMc(r.data.mc);
    if (!mc.mc) {
      fehler.push(`${r.data.id}: mc ungültig (${mc.fehler})`);
      return;
    }
    eintraege.push({ ...r.data, mc: mc.mc });
  });
  return { entwurf: { hinweis: ENTWURF_HINWEIS, eintraege }, fehler };
}

/**
 * Karten eines Decks, für die ein Vorschlag geholt wird: passender Typ, noch ohne mc in der Datei
 * und noch nicht im Entwurf (auch abgelehnte nicht – die bewusst löschen, um sie neu anzufragen).
 */
export function mcKandidaten(data: RohLernkarten, deckId: string, entwurf: Entwurf, opts: { anwendung?: boolean } = {}): RohKarte[] {
  const deck = data.decks.find((d) => d.id === deckId);
  if (!deck) return [];
  const typen = new Set<string>([...MC_TYPEN, ...(opts.anwendung ? ['anwendung'] : [])]);
  const schon = new Set(entwurf.eintraege.map((e) => e.id));
  return deck.karten.filter((k) => k.mc === undefined && typen.has(String(k.typ)) && !schon.has(k.id) && !!k.antwort?.trim());
}

export const MC_SYSTEM = `Du bist erfahrene/r IHK-Prüfer/in für die Abschlussprüfung Teil 2 „Fachinformatiker/-in Daten- und Prozessanalyse".
Du schreibst Auswahlantworten (1 richtig, 3 falsch) zu Lernkarten für einen „Leicht-Modus" zum Einstieg.
Regeln:
- Alles auf Deutsch, kurz und eindeutig. Jede Antwort höchstens ca. 120 Zeichen, ein Satz oder eine Stichpunktzeile, kein Markdown.
- richtig: die Kernaussage der Musterantwort, fachlich korrekt und ohne neue Fakten. Nichts erfinden, was nicht in der Musterantwort steht.
- falsch: genau 3 plausible, aber eindeutig falsche Antworten – typische Verwechslungen und Prüfungsfehler zum Thema
  (z. B. Begriffe vertauscht, falsche Formel, falsche Bezugsgröße, Gegenteil). Keine Scherzantworten, keine „alle/keine der genannten".
- Die vier Antworten sollen ähnlich lang und gleich aufgebaut sein, damit die richtige nicht an der Form zu erkennen ist.
- Die drei falschen Antworten unterscheiden sich voneinander und von der richtigen.
- erklaerung: 1–2 Sätze, warum die falschen Antworten falsch sind (du-Form).
- Gib für jede Karte genau einen Eintrag mit ihrer id zurück.`;

/** Nutzerteil der Anfrage für einige Karten eines Decks. */
export function baueMcPrompt(deck: Pick<RohDeck, 'id' | 'titel' | 'pruefungsbereich'>, karten: RohKarte[]): string {
  const liste = karten
    .map(
      (k) => `<karte id="${k.id}" typ="${k.typ ?? ''}">\n<frage>${k.frage}</frage>\n<musterantwort>${k.antwort}</musterantwort>\n</karte>`,
    )
    .join('\n\n');
  return (
    `<deck id="${deck.id}" titel="${deck.titel ?? deck.id}"${deck.pruefungsbereich ? ` pruefungsbereich="${deck.pruefungsbereich}"` : ''}>\n` +
    `${liste}\n</deck>\n\nSchreibe für jede der ${karten.length} Karten eine richtige und drei falsche Antworten.`
  );
}

/**
 * Format der strukturierten Antwort. Bewusst locker (keine Längen-Vorgaben im JSON-Schema): genau geprüft wird danach
 * mit `pruefeMc`, damit ein einzelner schlechter Vorschlag nicht die ganze Anfrage scheitern lässt.
 */
export const McAntwortSchema = z.object({
  karten: z.array(z.object({ id: z.string(), richtig: z.string(), falsch: z.array(z.string()), erklaerung: z.string() })),
});
export type McAntwort = z.infer<typeof McAntwortSchema>;

/** Prüft die Antwort der KI gegen die angefragten Karten: unbekannte, doppelte, fehlende und ungültige Vorschläge → Meldung. */
export function pruefeMcAntwort(antwort: McAntwort, deckId: string, karten: RohKarte[]): { eintraege: EntwurfEintrag[]; fehler: string[] } {
  const nachId = new Map(karten.map((k) => [k.id, k]));
  const eintraege: EntwurfEintrag[] = [];
  const fehler: string[] = [];
  const gesehen = new Set<string>();
  for (const v of antwort.karten) {
    const k = nachId.get(v.id);
    if (!k) {
      fehler.push(`${v.id}: nicht angefragt – ignoriert.`);
      continue;
    }
    if (gesehen.has(v.id)) {
      fehler.push(`${v.id}: doppelt – nur der erste Vorschlag zählt.`);
      continue;
    }
    gesehen.add(v.id);
    const mc = pruefeMc({ richtig: v.richtig, falsch: v.falsch, ...(v.erklaerung.trim() ? { erklaerung: v.erklaerung } : {}) });
    if (!mc.mc) {
      fehler.push(`${v.id}: Vorschlag verworfen (${mc.fehler}).`);
      continue;
    }
    eintraege.push({ id: k.id, deck: deckId, frage: k.frage, antwort: k.antwort, status: 'offen', mc: mc.mc });
  }
  for (const k of karten) if (!gesehen.has(k.id)) fehler.push(`${k.id}: kein Vorschlag erhalten.`);
  return { eintraege, fehler };
}

/** Hängt neue Vorschläge an; vorhandene (schon durchgesehene) Einträge bleiben unverändert. */
export function ergaenzeEntwurf(entwurf: Entwurf, neu: EntwurfEintrag[]): Entwurf {
  const schon = new Set(entwurf.eintraege.map((e) => e.id));
  return { hinweis: ENTWURF_HINWEIS, eintraege: [...entwurf.eintraege, ...neu.filter((e) => !schon.has(e.id))] };
}

/** Minimale Schnittstelle des Claude-Clients (Anthropic SDK, `messages.parse`) – in Tests durch eine Attrappe ersetzt. */
export interface McClient {
  parse(args: { model: string; max_tokens: number; system: string; user: string }): Promise<{
    stop_reason: string | null;
    parsed_output: McAntwort | null;
  }>;
}

/** Verbindet McClient mit dem Anthropic-SDK: strukturierte Ausgabe über zodOutputFormat wie in server/ai.ts. */
export function mcClientAusAnthropic(anthropic: Pick<Anthropic, 'messages'>): McClient {
  return {
    parse: async ({ model, max_tokens, system, user }) => {
      const r = await anthropic.messages.parse({
        model,
        max_tokens,
        system,
        messages: [{ role: 'user', content: user }],
        output_config: { format: zodOutputFormat(McAntwortSchema) },
      });
      return { stop_reason: r.stop_reason, parsed_output: r.parsed_output ?? null };
    },
  };
}

/** Holt Vorschläge für alle Karten, in Portionen von MC_JE_ANFRAGE. Eine gescheiterte Portion wird gemeldet, die übrigen laufen weiter. */
export async function entwerfeMc(
  client: McClient,
  model: string,
  deck: RohDeck,
  karten: RohKarte[],
  log: (msg: string) => void = () => {},
): Promise<{ eintraege: EntwurfEintrag[]; fehler: string[] }> {
  const eintraege: EntwurfEintrag[] = [];
  const fehler: string[] = [];
  for (let i = 0; i < karten.length; i += MC_JE_ANFRAGE) {
    const teil = karten.slice(i, i + MC_JE_ANFRAGE);
    log(`Anfrage für ${teil[0].id} … ${teil[teil.length - 1].id} (${teil.length} Karten) …`);
    try {
      const r = await client.parse({ model, max_tokens: 8000, system: MC_SYSTEM, user: baueMcPrompt(deck, teil) });
      if (r.stop_reason === 'refusal') throw new Error('vom Modell abgelehnt');
      if (r.stop_reason === 'max_tokens') throw new Error('Antwort abgeschnitten');
      if (!r.parsed_output) throw new Error('Antwort nicht lesbar');
      const g = pruefeMcAntwort(r.parsed_output, deck.id, teil);
      eintraege.push(...g.eintraege);
      fehler.push(...g.fehler);
    } catch (e) {
      fehler.push(`${teil.map((k) => k.id).join(', ')}: ${(e as Error).message}`);
    }
  }
  return { eintraege, fehler };
}

export interface UebernahmeErgebnis {
  /** Neuer Dateiinhalt; gleich dem alten, wenn nichts übernommen wurde. */
  text: string;
  uebernommen: string[];
  hinweise: string[];
}

/**
 * Trägt die angenommenen Einträge als Feld „mc“ (am Ende der Karte) in den Text von AP2_FIDPA_Lernkarten.json ein.
 * Reihenfolge, IDs und Formatierung (2 Leerzeichen Einrückung, Zeilenenden, Schluss-Zeilenumbruch) bleiben erhalten.
 * Weil die Datei sonst neu formatiert würde, bricht die Funktion ab, wenn sie nicht genau im Format von JSON.stringify(…, 2) vorliegt.
 * Karten, die schon einen mc-Block haben, bleiben unverändert (Hinweis).
 */
export function uebernehmeMc(text: string, entwurf: Entwurf): UebernahmeErgebnis {
  const bom = text.startsWith('﻿') ? '﻿' : '';
  const ohneBom = text.slice(bom.length);
  const crlf = ohneBom.includes('\r\n');
  const lf = crlf ? ohneBom.replace(/\r\n/g, '\n') : ohneBom;
  const schluss = /\n*$/.exec(lf)![0];
  const data = JSON.parse(lf) as RohLernkarten;
  if (JSON.stringify(data, null, 2) !== lf.slice(0, lf.length - schluss.length)) {
    throw new Error(
      'Die Lernkarten-Datei ist nicht im Standardformat (JSON mit 2 Leerzeichen Einrückung) – zum Schutz der Formatierung wird nichts geändert.',
    );
  }
  const karten = new Map<string, RohKarte>();
  for (const d of data.decks) for (const k of d.karten) karten.set(k.id, k);

  const uebernommen: string[] = [];
  const hinweise: string[] = [];
  for (const e of entwurf.eintraege) {
    if (e.status !== 'angenommen') continue;
    const k = karten.get(e.id);
    if (!k) {
      hinweise.push(`${e.id}: Karte gibt es in der Datei nicht – übersprungen.`);
      continue;
    }
    if (k.mc !== undefined) {
      hinweise.push(`${e.id}: hat schon einen mc-Block – unverändert.`);
      continue;
    }
    const mc = pruefeMc(e.mc);
    if (!mc.mc) {
      hinweise.push(`${e.id}: mc ungültig (${mc.fehler}) – übersprungen.`);
      continue;
    }
    k.mc = mc.mc;
    uebernommen.push(e.id);
  }
  if (!uebernommen.length) return { text, uebernommen, hinweise };
  let neu = JSON.stringify(data, null, 2) + schluss;
  if (crlf) neu = neu.replace(/\n/g, '\r\n');
  return { text: bom + neu, uebernommen, hinweise };
}
