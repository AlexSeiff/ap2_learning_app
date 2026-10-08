// Gestaltung der Musterlösungen ohne Änderung der Lernblätter: rehype-Plugins (reine Baum-Umformungen, getestet).
//
// rehypeLoesung (nur in Lösungen, <Markdown loesung>):
// - `*(3 P)*` → Punkte-Abzeichen; steht es am Zeilenende, rechts in der Zeile. Längere Angaben wie
//   `*(je 4 P: 1 P Formel, …)*` bleiben als kleiner Hinweis im Text.
// - Endergebnisse → Kasten „Ergebnis“. Bewusst vorsichtig: nur fetter Text aus Zahl + Einheit direkt nach „=“, „≈“ oder „→“
//   (`= **70,00 Minuten**`) oder eine fette Gleichung, die auf Zahl + Einheit endet (`**IQR = 70 − 40 = 30 Minuten**`).
//   Nicht in Tabellen, Überschriften, Links, Formeln und im Prüferkommentar.
//   Rechenwege als Formel (Roadmap 4.4): Das Endergebnis steht bewusst NICHT in der Formel, sondern fett dahinter –
//   `$\bar{x} = \frac{770}{11}$ = **70,00 Minuten**`. So erkennt diese Regel es weiter (Text „ = “ direkt davor), es bleibt
//   ohne KaTeX (normales Markdown, Markdown-Download) lesbar und die Zahl steht im Lernblatt wie bisher.
// - Absatz `*Prüferkommentar: …*` (auch als Zitat, wie im Lösungsblatt) → Kasten „🧑‍🏫 Prüferkommentar“.
//
// rehypeTabellen (überall): Zahlenspalten rechtsbündig mit gleich breiten Ziffern, Summenzeilen fett mit Linie, bei leerer Ecke oben links
// ist die erste Spalte Zeilenkopf (<th scope="row">).

import type { Element, ElementContent, Root, RootContent } from 'hast';

type Node = Root | RootContent;

/** Reiner Text eines Knotens. */
export function textOf(node: Node): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'element' || node.type === 'root') return node.children.map(textOf).join('');
  return '';
}

function classes(el: Element): string[] {
  const c = el.properties.className;
  return Array.isArray(c) ? c.map(String) : c ? String(c).split(' ') : [];
}

function addClass(el: Element, name: string) {
  const c = classes(el);
  if (!c.includes(name)) el.properties.className = [...c, name];
}

const el = (tagName: string, className: string | undefined, children: ElementContent[]): Element => ({
  type: 'element',
  tagName,
  properties: className ? { className: [className] } : {},
  children,
});

// ---------- Punkte ----------

const PUNKTE = /^\(\s*(?:je\s+)?\d+(?:[,.]\d+)?\s*P\.?\s*\)$/;
const PUNKTE_HINWEIS = /^\(.*\d\s*P\b.*\)$/s;

/** `(3 P)`, `(je 1 P)` → 'abzeichen'; längere Punkteangaben in Klammern → 'hinweis'; sonst null. */
export function punkteArt(text: string): 'abzeichen' | 'hinweis' | null {
  const t = text.trim();
  if (PUNKTE.test(t)) return 'abzeichen';
  if (PUNKTE_HINWEIS.test(t)) return 'hinweis';
  return null;
}

// ---------- Ergebnis ----------

const ZAHL = String.raw`[−–+-]?(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d+)?`;
const WORT = String.raw`[A-Za-zÄÖÜäöüßµ€%][A-Za-zÄÖÜäöüß²³€.\/]*`;
const EINHEIT = String.raw`%|‰|€|${WORT}(?: ${WORT}){0,2}|\([^()]{1,20}\)`;
const ZAHL_EINHEIT = new RegExp(`^${ZAHL} ?(?:${EINHEIT})$`);
// Punkte sind kein Rechenergebnis („→ **−2 P**“ ist ein Abzug).
const PUNKTE_EINHEIT = new RegExp(`^${ZAHL} ?(?:P|Punkte?)$`);

const zahlMitEinheit = (s: string) => ZAHL_EINHEIT.test(s) && !PUNKTE_EINHEIT.test(s);

/**
 * Ist dieser fette Text ein Endergebnis? `davor`: Text direkt vor dem Fettdruck im selben Absatz.
 * - Zahl + Einheit direkt nach „=“, „≈“, „→“ oder „⇒“ (`= **70,00 Minuten**`), oder
 * - eine fette Gleichung bzw. Angabe, die auf „= Zahl Einheit“ oder „: Zahl Einheit“ endet (`**IQR = 70 − 40 = 30 Minuten**`,
 *   `**Projektdauer: 25 Tage**`).
 * Zahlen ohne Einheit und Punkte zählen nicht.
 */
export function istErgebnis(fett: string, davor: string): boolean {
  const t = fett.trim().replace(/\s+/g, ' ');
  if (zahlMitEinheit(t)) return /[=≈→⇒]\s*$/.test(davor);
  const i = Math.max(t.lastIndexOf('='), t.lastIndexOf(':'));
  return i > 0 && zahlMitEinheit(t.slice(i + 1).trim());
}

// ---------- Prüferkommentar ----------

const KOMMENTAR = /^\s*Prüferkommentar:\s*/;

/** Absatz, dessen erstes Element ein kursives „Prüferkommentar: …“ ist → Kasten; sonst null. */
function kommentarBox(p: Element): Element | null {
  const first = p.children.findIndex((c) => !(c.type === 'text' && !c.value.trim()));
  const em = p.children[first];
  if (em?.type !== 'element' || em.tagName !== 'em' || !KOMMENTAR.test(textOf(em))) return null;
  const inner = [...em.children];
  const head = inner[0];
  if (head?.type === 'text') inner[0] = { ...head, value: head.value.replace(KOMMENTAR, '') };
  else return null;
  return el('aside', 'pk-box', [
    el('div', 'pk-label', [{ type: 'text', value: 'Prüferkommentar' }]),
    el('p', undefined, [...inner, ...p.children.slice(first + 1)]),
  ]);
}

function blockquoteKommentar(bq: Element): Element | null {
  const inner = bq.children.filter((c) => !(c.type === 'text' && !c.value.trim()));
  return inner.length === 1 && inner[0].type === 'element' && inner[0].tagName === 'p' ? kommentarBox(inner[0]) : null;
}

// ---------- Plugin: Lösungen ----------

const BLOCK = new Set(['p', 'ul', 'ol', 'table', 'div', 'blockquote', 'pre', 'aside']);
const SKIP = new Set(['td', 'th', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'code', 'pre']);

function skip(node: Element): boolean {
  return SKIP.has(node.tagName) || classes(node).some((c) => c === 'katex' || c === 'katex-display' || c === 'pk-box');
}

function transformChildren(parent: Root | Element) {
  const kids = parent.children;
  for (let i = 0; i < kids.length; i++) {
    const node = kids[i];
    if (node.type !== 'element') continue;

    if (node.tagName === 'p' || node.tagName === 'blockquote') {
      const box = node.tagName === 'p' ? kommentarBox(node) : blockquoteKommentar(node);
      if (box) {
        kids[i] = box;
        continue;
      }
    }

    if (node.tagName === 'em') {
      const art = punkteArt(textOf(node));
      if (art === 'hinweis') {
        kids[i] = el('span', 'punkte-hinweis', node.children);
        continue;
      }
      if (art === 'abzeichen') {
        const next = kids[i + 1];
        const folgt = kids.slice(i + 1).find((r) => !(r.type === 'text' && !r.value.trim()));
        const zeilenende = !folgt || (next.type === 'text' && /^[ \t]*\n/.test(next.value));
        const label = textOf(node).trim().slice(1, -1).trim();
        kids[i] = el('span', zeilenende ? 'punkte rechts' : 'punkte', [{ type: 'text', value: label }]);
        if (zeilenende && parent.type === 'element') addClass(parent, 'mit-punkte');
        // Weiter geht es in einer neuen Zeile – wie im Lernblatt, wo jede Zeile ihre eigenen Punkte hat.
        if (zeilenende && folgt && !(folgt.type === 'element' && BLOCK.has(folgt.tagName))) kids.splice(i + 1, 0, el('br', undefined, []));
        continue;
      }
    }

    if (node.tagName === 'strong') {
      const prev = kids[i - 1];
      if (istErgebnis(textOf(node), prev ? textOf(prev) : '')) {
        kids[i] = el('span', 'ergebnis', [el('span', 'ergebnis-label', [{ type: 'text', value: 'Ergebnis' }]), node]);
        continue;
      }
    }

    if (!skip(node)) transformChildren(node);
  }
}

/** rehype-Plugin für Musterlösungen: Punkte-Abzeichen, Ergebnis-Kasten, Prüferkommentar-Kasten. */
export function rehypeLoesung() {
  return (tree: Root) => transformChildren(tree);
}

// ---------- Plugin: Tabellen ----------

const ZAHL_ZELLE = /^(?:[Σ∑] ?)?[−–+-]? ?(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d+)? ?(?:%|‰|€|P)?$/;
const LEER = /^(?:|[–—-]+)$/;
const SUMME = /^(?:[Σ∑]|summe\b|gesamt|insgesamt\b)/i;

/** Ist der Zellentext eine Zahl (deutsches Format, optional Σ, %, €, P)? */
export function istZahlZelle(text: string): boolean {
  return ZAHL_ZELLE.test(text.trim().replace(/\s+/g, ' '));
}

/** Ist das eine Summenzeile (erste Zelle beginnt mit Σ, „Summe“, „Gesamt“)? */
export function istSummenZeile(ersteZelle: string): boolean {
  return SUMME.test(ersteZelle.trim());
}

const childEls = (node: Element, tag?: string) =>
  node.children.filter((c): c is Element => c.type === 'element' && (!tag || c.tagName === tag));

function styleTable(table: Element) {
  const head = childEls(table, 'thead').flatMap((s) => childEls(s, 'tr'));
  const body = childEls(table, 'tbody').flatMap((s) => childEls(s, 'tr'));
  const cells = (tr: Element) => childEls(tr).filter((c) => c.tagName === 'td' || c.tagName === 'th');
  const cols = Math.max(0, ...[...head, ...body].map((tr) => cells(tr).length));
  for (let c = 0; c < cols; c++) {
    const headCell = head.map((tr) => cells(tr)[c]).find(Boolean);
    if (headCell?.properties.align) continue; // ausdrücklich ausgerichtet (|--:|) – nichts ändern
    const texts = body.map((tr) => cells(tr)[c]).map((cell) => (cell ? textOf(cell).trim() : ''));
    const filled = texts.filter((t) => !LEER.test(t));
    if (!filled.length || !filled.every(istZahlZelle)) continue;
    for (const tr of [...head, ...body]) {
      const cell = cells(tr)[c];
      if (cell) addClass(cell, 'num');
    }
  }
  for (const tr of body) {
    const first = cells(tr)[0];
    if (first && istSummenZeile(textOf(first))) addClass(tr, 'sum-row');
  }
  // Leere Ecke oben links (| | A | B |): Die erste Spalte benennt die Zeilen – als Zeilenkopf auszeichnen (Screenreader, Barrierefreiheit).
  const ecke = head.length ? cells(head[0])[0] : undefined;
  if (ecke && LEER.test(textOf(ecke).trim()) && body.length) {
    for (const tr of body) {
      const first = cells(tr)[0];
      if (first?.tagName === 'td' && !LEER.test(textOf(first).trim())) {
        first.tagName = 'th';
        first.properties.scope = 'row';
      }
    }
  }
}

function walkTables(node: Root | Element) {
  for (const c of node.children) {
    if (c.type !== 'element') continue;
    if (c.tagName === 'table') styleTable(c);
    else walkTables(c);
  }
}

/** rehype-Plugin für alle Tabellen: Zahlenspalten rechtsbündig (Klasse num), Summenzeilen (Klasse sum-row). */
export function rehypeTabellen() {
  return (tree: Root) => walkTables(tree);
}
