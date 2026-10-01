// Operatoren in Aufgabentexten markieren (ROADMAP 8.4): rehype-Plugin, nur für <Markdown operatoren> (TaskText).
// Arbeitet auf dem fertigen HTML-Baum, nicht auf dem Markdown – so bleiben Hervorhebungen, Listen, Tabellen und Code unberührt.
// Je Block (Absatz, Listenpunkt, Tabellenzelle, Überschrift) wird der Text zusammengesetzt, damit „*Geben* Sie … *an*“ über
// mehrere Textknoten erkannt wird; markiert wird nur das Verb: <span class="operator" data-operator="angeben">Geben</span>.

import type { Element, ElementContent, Root, RootContent, Text } from 'hast';
import { findeOperatoren } from './operatoren';

const BLOECKE = new Set(['p', 'li', 'td', 'th', 'dt', 'dd', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote']);
/** Darin wird nichts markiert (Code, Links, Formeln, schon markierte Operatoren). */
const AUSLASSEN = new Set(['code', 'pre', 'a', 'kbd', 'script', 'style', 'svg', 'math']);

type Eltern = Root | Element;

const istOperator = (el: Element) => el.properties.dataOperator !== undefined;

/** Textknoten eines Blocks in Reihenfolge, ohne in verschachtelte Blöcke und ausgelassene Elemente zu steigen. */
function textknoten(block: Eltern, out: { node: Text; parent: Eltern }[] = []) {
  for (const child of block.children) {
    if (child.type === 'text') out.push({ node: child, parent: block });
    else if (child.type === 'element' && !BLOECKE.has(child.tagName) && !AUSLASSEN.has(child.tagName) && !istOperator(child)) {
      textknoten(child, out);
    }
  }
  return out;
}

function markiereBlock(block: Eltern) {
  const knoten = textknoten(block);
  if (!knoten.length) return;
  const text = knoten.map((k) => k.node.value).join('');
  const treffer = findeOperatoren(text);
  if (!treffer.length) return;
  let offset = 0;
  for (const { node, parent } of knoten) {
    const anfang = offset;
    const ende = anfang + node.value.length;
    offset = ende;
    const hier = treffer.filter((t) => t.start >= anfang && t.end <= ende);
    if (!hier.length) continue;
    const teile: ElementContent[] = [];
    let pos = 0;
    for (const t of hier) {
      const s = t.start - anfang;
      if (s > pos) teile.push({ type: 'text', value: node.value.slice(pos, s) });
      teile.push({
        type: 'element',
        tagName: 'span',
        properties: { className: ['operator'], dataOperator: t.operatorId },
        children: [{ type: 'text', value: t.wort }],
      });
      pos = t.end - anfang;
    }
    if (pos < node.value.length) teile.push({ type: 'text', value: node.value.slice(pos) });
    const i = parent.children.indexOf(node as RootContent & ElementContent);
    parent.children.splice(i, 1, ...(teile as (RootContent & ElementContent)[]));
  }
}

function besuche(node: Eltern) {
  if (node.type === 'element' && AUSLASSEN.has(node.tagName)) return;
  if (node.type === 'root' || BLOECKE.has(node.tagName)) markiereBlock(node);
  for (const child of node.children) if (child.type === 'element') besuche(child);
}

/** rehype-Plugin: Operatoren in Aufgabentexten als <span class="operator" data-operator="…"> markieren. */
export function rehypeOperatoren() {
  return (tree: Root) => besuche(tree);
}
