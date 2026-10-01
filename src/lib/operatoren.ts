// Operatoren-Trainer (ROADMAP 8.4): die Operatoren der IHK-Aufgaben – was sie verlangen und wie viele Punkte sie typisch bringen –,
// ein Tokenizer, der sie in Aufgabentexten findet, und die Quizfragen der Seite /material/operatoren. Rein, ohne React.
//
// Auswahl: alle Operatoren, die in den Übungsklausuren der Lernblätter kursiv gesetzt vorkommen (z. B. *Erläutern* Sie,
// *Geben* Sie … *an*), dazu die Du-Formen der Rechenübungen („Berechne …“). Häufigkeit in content/ (Oktober 2026):
// erläutern 58, nennen 44, berechnen 32, angeben 24, beurteilen 23, begründen 18, benennen 15, zuordnen 14, beschreiben 14,
// darstellen 9, abgrenzen 7, erstellen 5, bestimmen 5, … (siehe DOKUMENTATION § 5).

export type Anforderungsbereich = 1 | 2 | 3;

export interface Operator {
  id: string;
  /** Anzeigename (Infinitiv). */
  name: string;
  /** Anforderungsbereich: I Wiedergeben, II Anwenden/Zusammenhänge, III Beurteilen/Problemlösen. */
  bereich: Anforderungsbereich;
  /** Was verlangt wird – ein Satz (Tooltip und Quiz). */
  verlangt: string;
  /** Typische Punkte bzw. wie Punkte vergeben werden. */
  punkte: string;
  /** Häufiger Fehler / Tipp. */
  tipp: string;
  /** Formen, die den Operator auslösen: Infinitiv = Sie-Form („Nennen Sie“) und Du-Imperativ („Nenne“). */
  formen: { sie: string[]; du: string[] };
  /** Trennbares Verb: Verbformen + Partikel im selben Satz („Geben Sie … an“). `optional`: auch ohne Partikel gemeint. */
  trennbar?: { sie: string[]; du: string[]; teil: string[]; optional?: boolean };
}

export const BEREICH_TEXT: Record<Anforderungsbereich, string> = {
  1: 'I – wiedergeben',
  2: 'II – anwenden, Zusammenhänge',
  3: 'III – beurteilen, Probleme lösen',
};

export const OPERATOREN: Operator[] = [
  {
    id: 'nennen',
    name: 'nennen',
    bereich: 1,
    verlangt: 'Begriffe oder Fakten stichpunktartig aufzählen – ohne Erklärung, genau so viele wie verlangt.',
    punkte: 'meist 1 P je Nennung',
    tipp: 'Nicht mehr nennen als gefragt – meist wird nur die verlangte Anzahl gewertet.',
    formen: { sie: ['nennen'], du: ['nenne', 'nenn'] },
  },
  {
    id: 'angeben',
    name: 'angeben',
    bereich: 1,
    verlangt: 'Werte, Fakten oder Begriffe ohne Begründung hinschreiben (z. B. ein Ergebnis, eine Konvention).',
    punkte: 'meist 1 P je Angabe',
    tipp: 'Kurz und eindeutig – eine Begründung bringt hier keine Punkte.',
    formen: { sie: ['angeben'], du: [] },
    trennbar: { sie: ['geben'], du: ['gib', 'gebe'], teil: ['an'] },
  },
  {
    id: 'benennen',
    name: 'benennen',
    bereich: 1,
    verlangt: 'Den passenden Fachbegriff zu einem Sachverhalt bezeichnen.',
    punkte: 'meist 1 P je Begriff',
    tipp: 'Den exakten Fachbegriff verwenden (z. B. „Pareto-Prinzip“), keine Umschreibung.',
    formen: { sie: ['benennen'], du: ['benenne'] },
  },
  {
    id: 'notieren',
    name: 'notieren',
    bereich: 1,
    verlangt: 'Etwas kurz aufschreiben, z. B. eine sortierte Reihe oder einen Zwischenschritt.',
    punkte: 'meist 0,5–1 P',
    tipp: 'Nicht vergessen – es sind leichte Punkte.',
    formen: { sie: ['notieren'], du: ['notiere'] },
  },
  {
    id: 'definieren',
    name: 'definieren',
    bereich: 1,
    verlangt: 'Einen Begriff genau bestimmen: Oberbegriff plus wesentliche Merkmale.',
    punkte: 'meist 1–2 P',
    tipp: 'Nicht mit einem Beispiel definieren – das Beispiel ist höchstens eine Ergänzung.',
    formen: { sie: ['definieren'], du: ['definiere'] },
  },
  {
    id: 'beschreiben',
    name: 'beschreiben',
    bereich: 1,
    verlangt: 'Einen Sachverhalt oder Ablauf in ganzen Sätzen strukturiert wiedergeben – ohne Begründung oder Bewertung.',
    punkte: 'meist 1–2 P je Aspekt',
    tipp: 'Ganze Sätze, sinnvolle Reihenfolge; Stichpunkte reichen nicht.',
    formen: { sie: ['beschreiben'], du: ['beschreibe'] },
  },
  {
    id: 'darstellen',
    name: 'darstellen',
    bereich: 1,
    verlangt: 'Strukturiert wiedergeben, oft als Tabelle, Schema oder Skizze – vollständig und übersichtlich.',
    punkte: 'Punkte für Vollständigkeit und Struktur',
    tipp: 'Steht „tabellarisch“ dabei, gehört eine Tabelle hin – Fließtext kostet Punkte.',
    formen: { sie: ['darstellen'], du: [] },
    trennbar: { sie: ['stellen'], du: ['stelle', 'stell'], teil: ['dar'] },
  },
  {
    id: 'skizzieren',
    name: 'skizzieren',
    bereich: 1,
    verlangt: 'Eine Grafik oder einen Ablauf vereinfacht zeichnen – wesentliche Elemente richtig und beschriftet.',
    punkte: 'Punkte je richtig gezeichnetem und beschriftetem Element',
    tipp: 'Beschriftung nicht vergessen – ohne sie gibt es kaum Punkte.',
    formen: { sie: ['skizzieren'], du: ['skizziere'] },
  },
  {
    id: 'zeichnen',
    name: 'zeichnen',
    bereich: 1,
    verlangt: 'Eine genaue grafische Darstellung anfertigen (maßstäblich, mit Achsen und Beschriftung).',
    punkte: 'Punkte je korrektem Element',
    tipp: 'Achsen, Einheiten und Legende gehören dazu.',
    formen: { sie: ['zeichnen'], du: ['zeichne'] },
  },
  {
    id: 'berechnen',
    name: 'berechnen',
    bereich: 2,
    verlangt: 'Ein Ergebnis mit nachvollziehbarem Rechenweg ermitteln: Formel, eingesetzte Werte, Ergebnis mit Einheit.',
    punkte: 'Teilpunkte für Formel, Einsetzen und Ergebnis (z. B. 1 + 1 + 1 P)',
    tipp: 'Rechenweg immer aufschreiben – Teilpunkte gibt es nur für Nachvollziehbares.',
    formen: { sie: ['berechnen'], du: ['berechne'] },
  },
  {
    id: 'ermitteln',
    name: 'ermitteln',
    bereich: 2,
    verlangt: 'Ein Ergebnis rechnerisch, grafisch oder aus Daten gewinnen – der Weg muss erkennbar sein.',
    punkte: 'Teilpunkte für Weg und Ergebnis',
    tipp: 'Wie „berechnen“, aber der Weg kann auch Zählen oder Ablesen sein.',
    formen: { sie: ['ermitteln'], du: ['ermittle', 'ermittel'] },
  },
  {
    id: 'bestimmen',
    name: 'bestimmen',
    bereich: 2,
    verlangt: 'Einen Wert oder Sachverhalt eindeutig festlegen, mit kurzem Lösungsweg.',
    punkte: 'Teilpunkte für Weg und Ergebnis',
    tipp: 'Das Ergebnis klar hervorheben.',
    formen: { sie: ['bestimmen'], du: ['bestimme'] },
  },
  {
    id: 'zuordnen',
    name: 'zuordnen',
    bereich: 2,
    verlangt: 'Elemente den passenden Kategorien zuweisen – jede Zuordnung zählt einzeln.',
    punkte: 'meist 1 P je Zuordnung (+ Begründung, wenn verlangt)',
    tipp: 'Jedes Element genau einmal zuordnen; steht „begründen“ dabei, braucht jede Zuordnung ein Argument.',
    formen: { sie: ['zuordnen', 'einordnen'], du: [] },
    trennbar: { sie: ['ordnen'], du: ['ordne'], teil: ['zu', 'ein'], optional: true },
  },
  {
    id: 'erstellen',
    name: 'erstellen',
    bereich: 2,
    verlangt: 'Eine Tabelle, ein Diagramm, ein Modell oder eine Abfrage vollständig nach Vorgabe anfertigen.',
    punkte: 'Punkte je korrektem Bestandteil',
    tipp: 'Alle verlangten Spalten bzw. Bestandteile prüfen – Vollständigkeit bringt die Punkte.',
    formen: { sie: ['erstellen'], du: ['erstelle'] },
  },
  {
    id: 'formulieren',
    name: 'formulieren',
    bereich: 2,
    verlangt: 'Eine Aussage, Regel, Hypothese oder Abfrage selbst korrekt aufschreiben.',
    punkte: 'Punkte für Inhalt und korrekte Form',
    tipp: 'Fachlich präzise und vollständig – bei SQL auch syntaktisch korrekt.',
    formen: { sie: ['formulieren'], du: ['formuliere'] },
  },
  {
    id: 'erlaeutern',
    name: 'erläutern',
    bereich: 2,
    verlangt: 'Beschreiben und Zusammenhänge erklären, mit Beispiel oder Bezug zum Fall veranschaulichen – in ganzen Sätzen.',
    punkte: 'meist 2–3 P je Aspekt',
    tipp: 'Der häufigste Operator: Stichpunkte reichen nicht, es braucht das „Warum“ und ein Beispiel.',
    formen: { sie: ['erläutern'], du: ['erläutere', 'erläuter'] },
  },
  {
    id: 'erklaeren',
    name: 'erklären',
    bereich: 2,
    verlangt: 'Ursachen, Gründe oder die Funktionsweise nachvollziehbar machen (Warum? Wie?).',
    punkte: 'meist 2 P je Aspekt',
    tipp: 'Ursache → Wirkung ausdrücklich verbinden („dadurch“, „weil“).',
    formen: { sie: ['erklären'], du: ['erkläre', 'erklär'] },
  },
  {
    id: 'vergleichen',
    name: 'vergleichen',
    bereich: 2,
    verlangt: 'Gemeinsamkeiten und Unterschiede nach Kriterien gegenüberstellen und ein kurzes Fazit ziehen.',
    punkte: 'meist 1–2 P je Kriterium',
    tipp: 'Kriterienweise vergleichen (am besten als Tabelle), nicht zwei getrennte Beschreibungen.',
    formen: { sie: ['vergleichen'], du: ['vergleiche'] },
  },
  {
    id: 'abgrenzen',
    name: 'abgrenzen',
    bereich: 2,
    verlangt: 'Begriffe voneinander unterscheiden: herausarbeiten, worin sie sich unterscheiden und was jeweils dazugehört.',
    punkte: 'meist 1–2 P je Unterscheidungsmerkmal',
    tipp: 'Für jedes Merkmal beide Seiten nennen („A …, B dagegen …“).',
    formen: { sie: ['abgrenzen'], du: [] },
    trennbar: { sie: ['grenzen'], du: ['grenze', 'grenz'], teil: ['ab'] },
  },
  {
    id: 'interpretieren',
    name: 'interpretieren',
    bereich: 2,
    verlangt: 'Ergebnisse oder Kennzahlen deuten: Was bedeuten sie im Sachzusammenhang?',
    punkte: 'meist 2–3 P',
    tipp: 'Nicht die Zahl wiederholen, sondern ihre Bedeutung für den Fall erklären.',
    formen: { sie: ['interpretieren'], du: ['interpretiere'] },
  },
  {
    id: 'analysieren',
    name: 'analysieren',
    bereich: 2,
    verlangt: 'Material oder Sachverhalt systematisch untersuchen: Bestandteile, Ursachen und Wirkungen herausarbeiten.',
    punkte: 'Punkte je herausgearbeitetem Aspekt',
    tipp: 'Gliedern (z. B. nach Ursachen), nicht nur nacherzählen.',
    formen: { sie: ['analysieren'], du: ['analysiere'] },
  },
  {
    id: 'pruefen',
    name: 'prüfen',
    bereich: 2,
    verlangt: 'Eine Aussage oder ein Ergebnis an Kriterien oder Regeln messen und mit einem klaren Ergebnis abschließen.',
    punkte: 'Punkte für Prüfweg und Ergebnis',
    tipp: 'Am Ende ausdrücklich sagen: erfüllt / nicht erfüllt (ja/nein) – mit Begründung.',
    formen: { sie: ['prüfen', 'überprüfen'], du: ['prüfe', 'überprüfe'] },
  },
  {
    id: 'durchfuehren',
    name: 'durchführen',
    bereich: 2,
    verlangt: 'Ein Verfahren Schritt für Schritt anwenden und das Ergebnis angeben.',
    punkte: 'Punkte je richtigem Schritt',
    tipp: 'Jeden Schritt sichtbar machen – nur das Endergebnis reicht nicht.',
    formen: { sie: ['durchführen'], du: [] },
    trennbar: { sie: ['führen'], du: ['führe'], teil: ['durch'] },
  },
  {
    id: 'ableiten',
    name: 'ableiten',
    bereich: 2,
    verlangt: 'Aus gegebenen Informationen eine Folgerung oder Empfehlung schlüssig herleiten.',
    punkte: 'meist 2–3 P',
    tipp: 'Den Bezug zum Gegebenen zeigen („Da …, folgt …“).',
    formen: { sie: ['ableiten'], du: [] },
    trennbar: { sie: ['leiten'], du: ['leite'], teil: ['ab'] },
  },
  {
    id: 'begruenden',
    name: 'begründen',
    bereich: 3,
    verlangt: 'Eine Aussage oder Entscheidung mit stichhaltigen fachlichen Argumenten stützen („…, weil …“).',
    punkte: 'meist 1–2 P je Argument',
    tipp: 'Ohne „weil“ keine Punkte – die Behauptung allein zählt nicht.',
    formen: { sie: ['begründen'], du: ['begründe'] },
  },
  {
    id: 'beurteilen',
    name: 'beurteilen',
    bereich: 3,
    verlangt:
      'Einen Sachverhalt anhand fachlicher Kriterien prüfen und zu einem begründeten Urteil kommen – das Urteil ausdrücklich nennen.',
    punkte: 'meist 3–4 P: Kriterien, Abwägung und Urteil',
    tipp: 'Nach der Zahl kommt ein Satz mit Schlussfolgerung – sonst fehlen genau die Punkte zwischen 85 und 95.',
    formen: { sie: ['beurteilen'], du: ['beurteile'] },
  },
  {
    id: 'bewerten',
    name: 'bewerten',
    bereich: 3,
    verlangt: 'Wie beurteilen, aber mit einem eigenen, offengelegten Wertmaßstab Stellung nehmen.',
    punkte: 'meist 3–4 P: Maßstab, Argumente und Stellungnahme',
    tipp: 'Den Maßstab nennen (z. B. Kosten, Datenschutz) und klar Position beziehen.',
    formen: { sie: ['bewerten'], du: ['bewerte'] },
  },
  {
    id: 'entwickeln',
    name: 'entwickeln',
    bereich: 3,
    verlangt: 'Eigenständig eine Lösung, ein Vorgehen oder Konzept erarbeiten – schlüssig und umsetzbar.',
    punkte: 'Punkte je sinnvollem, begründetem Schritt',
    tipp: 'Konkret auf den Fall beziehen; Schritte nummerieren, wenn eine Anzahl verlangt ist.',
    formen: { sie: ['entwickeln'], du: ['entwickle'] },
  },
  {
    id: 'entwerfen',
    name: 'entwerfen',
    bereich: 3,
    verlangt: 'Ein Modell, Konzept oder eine Struktur in Grundzügen selbst gestalten.',
    punkte: 'Punkte je korrektem Bestandteil des Entwurfs',
    tipp: 'Alle Vorgaben der Aufgabe im Entwurf sichtbar umsetzen.',
    formen: { sie: ['entwerfen'], du: ['entwirf', 'entwerfe'] },
  },
];

export const OPERATOR_NACH_ID: Record<string, Operator> = Object.fromEntries(OPERATOREN.map((o) => [o.id, o]));

// ---------- Tokenizer ----------

type Form = { id: string; du: boolean; teil?: string[]; optional?: boolean };

const FORMEN = new Map<string, Form[]>();
for (const o of OPERATOREN) {
  const add = (wort: string, f: Form) => FORMEN.set(wort, [...(FORMEN.get(wort) ?? []), f]);
  for (const w of o.formen.sie) add(w, { id: o.id, du: false });
  for (const w of o.formen.du) add(w, { id: o.id, du: true });
  if (o.trennbar) {
    const { teil, optional } = o.trennbar;
    for (const w of o.trennbar.sie) add(w, { id: o.id, du: false, teil, optional });
    for (const w of o.trennbar.du) add(w, { id: o.id, du: true, teil, optional });
  }
}

export interface OperatorTreffer {
  /** Position des Verbs im Text (Partikel wie „an“ werden nicht markiert). */
  start: number;
  end: number;
  wort: string;
  operatorId: string;
}

const WORT = /\p{L}+/gu;
/** „Sie“ direkt danach (auch mit Markdown-Hervorhebung dazwischen: „*Nennen* Sie“). */
const MIT_SIE = /^[*_]*\s+[*_]*Sie(?!\p{L})/u;
/** Satz- oder Teilsatzanfang davor: Textanfang, Satzzeichen, Zeilenumbruch, „und“, „oder“, „sowie“, „bzw.“, Komma. */
const SATZANFANG = /(?:^|[.!?:;,\n]|(?:^|[\s(])(?:und|oder|sowie|bzw\.))[\s*_„"(]*$/u;

/**
 * Findet die Operatoren in einem Text (Klartext oder Markdown). Regeln:
 * - Sie-Form (Infinitiv) nur mit „Sie“ dahinter: „Nennen Sie …“, „und *begründen* Sie …“.
 * - Du-Form am (Teil-)Satzanfang: „Berechne …“, „… und gib … an“.
 * - Trennbare Verben nur mit ihrer Partikel im selben Satz: „Geben Sie … an“ (angeben), „Stellen Sie … dar“ (darstellen),
 *   „Grenzen Sie … ab“; „Ordnen Sie …“ ist auch ohne „zu“ eine Zuordnung. „Stellen Sie sich vor“ ist kein Operator.
 * Groß-/Kleinschreibung egal. Markiert wird nur das Verb.
 */
export function findeOperatoren(text: string): OperatorTreffer[] {
  const treffer: OperatorTreffer[] = [];
  for (const m of text.matchAll(WORT)) {
    const formen = FORMEN.get(m[0].toLowerCase());
    if (!formen) continue;
    const start = m.index;
    const end = start + m[0].length;
    const nachher = text.slice(end);
    const mitSie = MIT_SIE.test(nachher);
    const amAnfang = SATZANFANG.test(text.slice(0, start));
    const satzrest = nachher.split(/[.!?\n]/u, 1)[0];
    for (const f of formen) {
      if (!(f.du ? amAnfang || mitSie : mitSie)) continue;
      if (f.teil && !f.optional && !f.teil.some((t) => new RegExp(`(?<!\\p{L})${t}(?!\\p{L})`, 'u').test(satzrest))) continue;
      treffer.push({ start, end, wort: m[0], operatorId: f.id });
      break;
    }
  }
  return treffer;
}

/** Text in Stücke zerlegen: normaler Text und Operatoren (für Tests und einfache Darstellung). */
export function zerlegeText(text: string): { text: string; operatorId?: string }[] {
  const out: { text: string; operatorId?: string }[] = [];
  let pos = 0;
  for (const t of findeOperatoren(text)) {
    if (t.start > pos) out.push({ text: text.slice(pos, t.start) });
    out.push({ text: t.wort, operatorId: t.operatorId });
    pos = t.end;
  }
  if (pos < text.length) out.push({ text: text.slice(pos) });
  return out;
}

/** Wie oft kommt jeder Operator in diesen Texten vor? (Operator-ID → Anzahl Texte) */
export function operatorHaeufigkeit(texte: string[]): Record<string, number> {
  const zahl: Record<string, number> = {};
  for (const text of texte) for (const id of new Set(findeOperatoren(text).map((t) => t.operatorId))) zahl[id] = (zahl[id] ?? 0) + 1;
  return zahl;
}

// ---------- Quiz ----------

export interface OperatorFrage {
  aufgabeId: string;
  /** Das Verb, wie es in der Aufgabe steht. */
  wort: string;
  operatorId: string;
  /** Vier Operator-IDs (eine richtig), gemischt; angezeigt wird jeweils `verlangt`. */
  optionen: string[];
}

/**
 * Eine Quizfrage: zufällige Aufgabe mit Operator, dazu drei andere Operatoren als falsche Antworten
 * (mindestens einer aus einem anderen Anforderungsbereich, damit der Unterschied „nennen“ ↔ „erläutern“ geübt wird).
 */
export function operatorFrage(aufgaben: { id: string; text: string }[], zufall: () => number = Math.random): OperatorFrage | undefined {
  const paare = aufgaben.flatMap((a) => findeOperatoren(a.text).map((t) => ({ aufgabeId: a.id, wort: t.wort, operatorId: t.operatorId })));
  if (!paare.length) return undefined;
  const paar = paare[Math.floor(zufall() * paare.length)];
  const richtig = OPERATOR_NACH_ID[paar.operatorId];
  const mische = <T>(liste: T[]) => {
    const out = [...liste];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(zufall() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const andere = mische(OPERATOREN.filter((o) => o.id !== richtig.id));
  const fremd = andere.find((o) => o.bereich !== richtig.bereich)!;
  const falsch = [fremd, ...andere.filter((o) => o !== fremd).slice(0, 2)];
  return { ...paar, optionen: mische([richtig, ...falsch].map((o) => o.id)) };
}
