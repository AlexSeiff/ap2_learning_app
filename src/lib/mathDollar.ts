// Schutz vor versehentlicher Mathematik: remark-math macht aus jedem Paar einzelner `$` eine Formel
// („5 $ und 3 $" → Formel „ und 3 "). Diese Funktion maskiert vorab jedes `$`, das nach der Pandoc-Regel
// keine Formel begrenzt, als `\$` (bleibt ein normales Dollarzeichen).
//
// Pandoc-Regel für `$…$`: Das öffnende `$` hat direkt rechts ein Nicht-Leerzeichen, das schließende direkt links
// ein Nicht-Leerzeichen und direkt rechts keine Ziffer. Wie remark-math schließt das nächste `$` die Formel.
// Formeln stehen in einer Zeile. `$$` (Blockformeln) bleibt unverändert, Code (```-Blöcke, `Code`) ebenfalls.

const FENCE = /^\s{0,3}(`{3,}|~{3,})/;

/** Maskiert alle `$`, die nach der Pandoc-Regel keine Formel `$…$` öffnen oder schließen. */
export function escapeStrayDollars(markdown: string): string {
  if (!markdown.includes('$')) return markdown;
  let fence: string | null = null;
  let mathBlock = false;
  return markdown
    .split('\n')
    .map((line) => {
      const f = FENCE.exec(line);
      if (fence) {
        if (f && f[1][0] === fence[0] && f[1].length >= fence.length && line.trim() === f[1]) fence = null;
        return line;
      }
      if (f) {
        fence = f[1];
        return line;
      }
      if (line.trim() === '$$') {
        mathBlock = !mathBlock;
        return line;
      }
      return mathBlock ? line : escapeLine(line);
    })
    .join('\n');
}

/** Bereiche mit Inline-Code (`…`, ``…``) einer Zeile als [start, ende). */
function codeRanges(line: string): [number, number][] {
  const ranges: [number, number][] = [];
  const re = /`+/g;
  let open: { len: number; start: number } | null = null;
  for (let m = re.exec(line); m; m = re.exec(line)) {
    if (!open) open = { len: m[0].length, start: m.index };
    else if (m[0].length === open.len) {
      ranges.push([open.start, m.index + m[0].length]);
      open = null;
    }
  }
  return ranges;
}

const isSpace = (c: string | undefined) => c === undefined || /\s/.test(c);

function escapeLine(line: string): string {
  if (!line.includes('$')) return line;
  const code = codeRanges(line);
  const inCode = (i: number) => code.some(([a, b]) => i >= a && i < b);
  // Einzelne, nicht maskierte `$` außerhalb von Code; `$$` wird übersprungen.
  const singles: number[] = [];
  for (let i = 0; i < line.length; i++) {
    if (line[i] !== '$' || inCode(i)) continue;
    let run = 1;
    while (line[i + run] === '$') run++;
    let bs = 0;
    while (line[i - 1 - bs] === '\\') bs++;
    if (run === 1 && bs % 2 === 0) singles.push(i);
    i += run - 1;
  }
  const escape = new Set<number>();
  for (let k = 0; k < singles.length; k++) {
    const open = singles[k];
    const close = singles[k + 1];
    const opens = !isSpace(line[open + 1]);
    const closes = close !== undefined && !isSpace(line[close - 1]) && !/\d/.test(line[close + 1] ?? '');
    if (opens && closes) k++;
    else escape.add(open);
  }
  if (!escape.size) return line;
  let out = '';
  for (let i = 0; i < line.length; i++) out += escape.has(i) ? '\\$' : line[i];
  return out;
}
