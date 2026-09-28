// Dialekt-Warnungen: Stellen, die SQLite durchgehen lässt, die in der IHK-Prüfung aber als Fehler zählen (Plan § 6.4).
// Leichte tokenbasierte Analyse ohne vollständigen Parser: jede SELECT-Ebene (auch Unterabfragen) wird einzeln geprüft.

import type { LintWarning } from './types';

type TokKind = 'word' | 'ident' | 'dq' | 'num' | 'str' | 'op' | 'lp' | 'rp' | 'comma' | 'dot' | 'semi';
type Tok = { kind: TokKind; text: string; upper: string; depth: number; isInt?: boolean };

export type LintOptions = { columns?: string[] };

const AGGREGATES = new Set(['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'TOTAL', 'GROUP_CONCAT', 'STRING_AGG']);

const KEYWORDS = new Set(
  `SELECT FROM WHERE GROUP BY HAVING ORDER LIMIT OFFSET AS AND OR NOT NULL IS IN LIKE GLOB REGEXP BETWEEN EXISTS CASE WHEN THEN
  ELSE END DISTINCT ALL ASC DESC JOIN INNER LEFT RIGHT FULL OUTER CROSS NATURAL ON USING UNION INTERSECT EXCEPT WITH RECURSIVE
  CAST COLLATE NOCASE BINARY RTRIM ESCAPE TRUE FALSE CURRENT_DATE CURRENT_TIME CURRENT_TIMESTAMP OVER PARTITION FILTER WINDOW
  ROWS RANGE GROUPS UNBOUNDED PRECEDING FOLLOWING CURRENT ROW NULLS FIRST LAST INSERT INTO VALUES UPDATE SET DELETE CREATE
  ALTER DROP TABLE VIEW INDEX PRIMARY KEY FOREIGN REFERENCES DEFAULT CHECK UNIQUE CONSTRAINT INTEGER INT TEXT REAL NUMERIC
  DECIMAL VARCHAR CHAR DATE DATETIME FLOAT DOUBLE BOOLEAN BLOB INTERVAL`.split(/\s+/),
);

const CLAUSES = new Set(['FROM', 'WHERE', 'GROUP', 'HAVING', 'ORDER', 'LIMIT', 'WINDOW']);
const COMPOUND = new Set(['UNION', 'INTERSECT', 'EXCEPT']);
const COMPARISON = new Set(['=', '==', '<>', '!=', '<', '>', '<=', '>=', 'LIKE', 'GLOB']);

// ---------- Tokenizer ----------

function tokenize(sql: string): Tok[] {
  const toks: Tok[] = [];
  const push = (kind: TokKind, text: string, isInt?: boolean) => toks.push({ kind, text, upper: text.toUpperCase(), depth: 0, isInt });
  let i = 0;
  while (i < sql.length) {
    const c = sql[i];
    const rest = sql.slice(i);
    if (/\s/.test(c)) {
      i++;
    } else if (rest.startsWith('--')) {
      const nl = sql.indexOf('\n', i);
      i = nl < 0 ? sql.length : nl + 1;
    } else if (rest.startsWith('/*')) {
      const end = sql.indexOf('*/', i + 2);
      i = end < 0 ? sql.length : end + 2;
    } else if (c === "'" || c === '"' || c === '`' || c === '[') {
      const close = c === '[' ? ']' : c;
      let j = i + 1;
      let text = '';
      while (j < sql.length) {
        if (sql[j] === close) {
          if (close !== ']' && sql[j + 1] === close) {
            text += close;
            j += 2;
            continue;
          }
          break;
        }
        text += sql[j++];
      }
      push(c === "'" ? 'str' : c === '"' ? 'dq' : 'ident', text);
      i = j + 1;
    } else if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(sql[i + 1] ?? ''))) {
      const m = /^(\d*\.?\d*(?:[eE][+-]?\d+)?)/.exec(rest)!;
      push('num', m[1], /^\d+$/.test(m[1]));
      i += m[1].length;
    } else if (/[\p{L}_]/u.test(c)) {
      const m = /^[\p{L}\p{N}_$]+/u.exec(rest)!;
      push('word', m[0]);
      i += m[0].length;
    } else if (c === '(') {
      push('lp', c);
      i++;
    } else if (c === ')') {
      push('rp', c);
      i++;
    } else if (c === ',') {
      push('comma', c);
      i++;
    } else if (c === '.') {
      push('dot', c);
      i++;
    } else if (c === ';') {
      push('semi', c);
      i++;
    } else {
      const op = /^(<>|!=|<=|>=|==|\|\||[-+*/%<>=|&~?:@$!])/.exec(rest);
      const text = op ? op[1] : c;
      push('op', text);
      i += text.length;
    }
  }
  return toks;
}

/** Zerlegt in Anweisungen und setzt die Klammertiefe: `(` und `)` liegen auf der äußeren Ebene, der Inhalt eine tiefer. */
function statements(toks: Tok[]): Tok[][] {
  const out: Tok[][] = [];
  let cur: Tok[] = [];
  let depth = 0;
  for (const t of toks) {
    if (t.kind === 'semi') {
      if (cur.length) out.push(cur);
      cur = [];
      depth = 0;
      continue;
    }
    if (t.kind === 'rp') depth = Math.max(0, depth - 1);
    t.depth = depth;
    if (t.kind === 'lp') depth++;
    cur.push(t);
  }
  if (cur.length) out.push(cur);
  return out;
}

// ---------- Hilfen ----------

const isName = (t: Tok | undefined): boolean => !!t && ((t.kind === 'word' && !KEYWORDS.has(t.upper)) || t.kind === 'ident');

/** Index der zu `toks[open]` gehörenden schließenden Klammer (bzw. Ende). */
function matching(toks: Tok[], open: number): number {
  const d = toks[open].depth;
  for (let j = open + 1; j < toks.length; j++) if (toks[j].kind === 'rp' && toks[j].depth === d) return j;
  return toks.length - 1;
}

const isSubquery = (toks: Tok[], i: number): boolean => toks[i].kind === 'lp' && ['SELECT', 'WITH'].includes(toks[i + 1]?.upper ?? '');

function splitTop(toks: Tok[], depth: number): Tok[][] {
  const parts: Tok[][] = [[]];
  for (const t of toks) {
    if (t.kind === 'comma' && t.depth === depth) parts.push([]);
    else parts[parts.length - 1].push(t);
  }
  return parts.filter((p) => p.length > 0);
}

function show(toks: Tok[]): string {
  let s = '';
  toks.forEach((t, i) => {
    const prev = toks[i - 1];
    const text = t.kind === 'str' ? `'${t.text}'` : t.kind === 'dq' ? `"${t.text}"` : t.text;
    const glue = !prev || prev.kind === 'lp' || prev.kind === 'dot' || t.kind === 'rp' || t.kind === 'comma' || t.kind === 'dot';
    const call = t.kind === 'lp' && prev && (prev.kind === 'word' || prev.kind === 'ident');
    s += (glue || call ? '' : ' ') + text;
  });
  return s;
}

const key = (toks: Tok[]): string => toks.map((t) => (t.kind === 'str' ? `'${t.text}'` : t.upper)).join(' ');

type Ref = { name: string; display: string; qualified: boolean };

/**
 * Spaltenbezüge in `toks`. Unterabfragen werden immer übersprungen; mit `skipAggregates` auch der Inhalt von
 * Aggregatfunktionen und Fensterausdrücken (… OVER (…)).
 */
function refs(toks: Tok[], skipAggregates: boolean): Ref[] {
  const out: Ref[] = [];
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (isSubquery(toks, i)) {
      i = matching(toks, i);
      continue;
    }
    if (skipAggregates && t.kind === 'word' && toks[i + 1]?.kind === 'lp') {
      const close = matching(toks, i + 1);
      const windowed = toks[close + 1]?.upper === 'OVER';
      if (AGGREGATES.has(t.upper) || windowed) {
        i = close;
        if (windowed && toks[close + 2]?.kind === 'lp') i = matching(toks, close + 2);
        continue;
      }
    }
    if (skipAggregates && (t.upper === 'FILTER' || t.upper === 'OVER') && toks[i + 1]?.kind === 'lp') {
      i = matching(toks, i + 1);
      continue;
    }
    if (!isName(t)) continue;
    const next = toks[i + 1];
    const prev = toks[i - 1];
    if (next?.kind === 'lp' || next?.kind === 'dot' || prev?.upper === 'AS') continue;
    const qualified = prev?.kind === 'dot' && isName(toks[i - 2]);
    out.push({ name: t.text.toLowerCase(), display: qualified ? `${toks[i - 2].text}.${t.text}` : t.text, qualified });
  }
  return out;
}

/** Aggregataufrufe (keine Fensterfunktionen) außerhalb von Unterabfragen, als Anzeige-Text. */
function aggregateCalls(toks: Tok[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < toks.length; i++) {
    if (isSubquery(toks, i)) {
      i = matching(toks, i);
      continue;
    }
    const t = toks[i];
    if (t.kind === 'word' && AGGREGATES.has(t.upper) && toks[i + 1]?.kind === 'lp') {
      const close = matching(toks, i + 1);
      if (toks[close + 1]?.upper !== 'OVER') out.push(show(toks.slice(i, close + 1)));
      i = close;
    }
  }
  return out;
}

// ---------- SELECT-Ebenen ----------

type Clauses = { select: Tok[]; where: Tok[]; group: Tok[]; having: Tok[]; hasGroup: boolean; hasHaving: boolean };

/** Alle SELECT-Ebenen einer Anweisung, jeweils mit ihrer Tiefe und den Klauseln ihrer Ebene. */
function selects(toks: Tok[]): { depth: number; clauses: Clauses }[] {
  const out: { depth: number; clauses: Clauses }[] = [];
  toks.forEach((t, i) => {
    if (t.upper !== 'SELECT' || t.kind !== 'word') return;
    const d = t.depth;
    const c: Clauses = { select: [], where: [], group: [], having: [], hasGroup: false, hasHaving: false };
    let current: Tok[] | null = c.select;
    for (let j = i + 1; j < toks.length; j++) {
      const u = toks[j];
      if (u.depth < d || (u.depth === d && COMPOUND.has(u.upper))) break;
      if (u.depth === d && u.kind === 'word' && CLAUSES.has(u.upper)) {
        if (u.upper === 'WHERE') current = c.where;
        else if (u.upper === 'GROUP') {
          current = c.group;
          c.hasGroup = true;
        } else if (u.upper === 'HAVING') {
          current = c.having;
          c.hasHaving = true;
        } else current = null;
        if (toks[j + 1]?.upper === 'BY') j++;
        continue;
      }
      current?.push(u);
    }
    out.push({ depth: d, clauses: c });
  });
  return out;
}

type Item = { expr: Tok[]; alias?: string; plainCol?: string; star: boolean };

function selectItems(select: Tok[], depth: number): Item[] {
  const list = [...select];
  while (list[0] && (list[0].upper === 'DISTINCT' || list[0].upper === 'ALL')) list.shift();
  return splitTop(list, depth).map((toks) => {
    const last = toks[toks.length - 1];
    if (last.text === '*' && last.kind === 'op' && (toks.length === 1 || toks[toks.length - 2].kind === 'dot'))
      return { expr: toks, star: true };
    let expr = toks;
    let alias: string | undefined;
    const prev = toks[toks.length - 2];
    const aliasTok = isName(last) || last.kind === 'dq' || last.kind === 'str';
    if (toks.length >= 3 && prev.upper === 'AS' && aliasTok) {
      alias = last.text;
      expr = toks.slice(0, -2);
    } else if (
      toks.length >= 2 &&
      (isName(last) || last.kind === 'dq') &&
      (['ident', 'num', 'str', 'rp', 'dq'].includes(prev.kind) ||
        (prev.kind === 'word' && (!KEYWORDS.has(prev.upper) || prev.upper === 'END')))
    ) {
      alias = last.text;
      expr = toks.slice(0, -1);
    }
    let plainCol: string | undefined;
    if (expr.length === 1 && isName(expr[0])) plainCol = expr[0].text;
    else if (expr.length === 3 && expr[1].kind === 'dot' && isName(expr[2])) plainCol = expr[2].text;
    return { expr, alias, plainCol: plainCol?.toLowerCase(), star: false };
  });
}

function lintSelect(depth: number, c: Clauses, columns: Set<string> | undefined, warn: (w: LintWarning) => void): void {
  const items = selectItems(c.select, depth);
  const hasAggregate = aggregateCalls(c.select).length > 0;

  // 1. Nicht aggregierte Spalte, die nicht im GROUP BY steht.
  if (c.hasGroup || hasAggregate || c.hasHaving) {
    const groupKeys = new Set(splitTop(c.group, depth).map(key));
    const groupRefs = new Set(refs(c.group, false).map((r) => r.name));
    items.forEach((item, idx) => {
      if (item.star || item.expr.some((t) => t.upper === 'OVER')) return;
      if (groupKeys.has(key(item.expr)) || groupKeys.has(String(idx + 1))) return;
      if (item.alias && groupKeys.has(item.alias.toUpperCase())) return;
      for (const r of refs(item.expr, true)) {
        if (groupRefs.has(r.name)) continue;
        warn({
          code: 'bare-column',
          blocking: true,
          message: c.hasGroup
            ? `Spalte \`${r.display}\` steht weder im GROUP BY noch in einer Aggregatfunktion – in der Prüfung ein Fehler.`
            : `Spalte \`${r.display}\` steht neben einer Aggregatfunktion, aber ohne GROUP BY – in der Prüfung ein Fehler. Ergänze GROUP BY ${r.display}.`,
        });
      }
    });
    const selectAliases = new Set(items.map((i) => i.alias?.toLowerCase()));
    for (const r of refs(c.having, true)) {
      if (groupRefs.has(r.name) || selectAliases.has(r.name)) continue;
      warn({
        code: 'bare-column',
        blocking: true,
        message: `Spalte \`${r.display}\` steht in HAVING, aber weder im GROUP BY noch in einer Aggregatfunktion – in der Prüfung ein Fehler. Zeilenbedingungen gehören in WHERE.`,
      });
    }
  }

  // 2. Spaltenalias oder Aggregat in WHERE.
  if (c.where.length === 0) return;
  const selectCols = new Set(items.flatMap((i) => refs(i.expr, false).map((r) => r.name)));
  const aliases = new Map<string, Item>();
  for (const item of items) {
    if (!item.alias) continue;
    const a = item.alias.toLowerCase();
    if (item.plainCol === a || selectCols.has(a) || columns?.has(a)) continue;
    aliases.set(a, item);
  }
  const reported = new Set<string>();
  for (const r of refs(c.where, false)) {
    const item = aliases.get(r.name);
    if (!item || r.qualified || reported.has(r.name)) continue;
    reported.add(r.name);
    const expr = show(item.expr);
    warn({
      code: 'alias-in-where',
      blocking: true,
      message: `\`${item.alias}\` ist ein Spaltenalias aus dem SELECT – WHERE wird vor SELECT ausgewertet und kennt ihn noch nicht. Schreib den Ausdruck aus (\`${expr}\`).`,
    });
    const agg = aggregateCalls(item.expr);
    if (agg.length) warn(aggregateInWhere(agg[0]));
  }
  for (const agg of aggregateCalls(c.where)) warn(aggregateInWhere(agg));
}

function aggregateInWhere(call: string): LintWarning {
  return {
    code: 'aggregate-in-where',
    blocking: true,
    message: `Aggregatfunktion \`${call}\` in WHERE – WHERE filtert einzelne Zeilen, bevor gruppiert wird. Bedingungen auf Gruppen gehören in HAVING (nach GROUP BY).`,
  };
}

// ---------- Anweisungsweite Prüfungen ----------

function lintDoubleQuotes(toks: Tok[], columns: Set<string> | undefined, warn: (w: LintWarning) => void): void {
  if (['CREATE', 'ALTER', 'DROP'].includes(toks[0]?.upper ?? '')) return;
  // Spaltenliste von INSERT INTO t ( … ) enthält Bezeichner.
  const skip = new Set<number>();
  toks.forEach((t, i) => {
    if (t.upper === 'INTO' && toks[i + 2]?.kind === 'lp' && !isSubquery(toks, i + 2)) {
      for (let j = i + 2; j <= matching(toks, i + 2); j++) skip.add(j);
    }
  });
  toks.forEach((t, i) => {
    if (t.kind !== 'dq' || skip.has(i)) return;
    const prev = toks[i - 1];
    const next = toks[i + 1];
    if (next?.kind === 'dot' || next?.kind === 'lp' || prev?.kind === 'dot') return;
    if (['FROM', 'JOIN', 'INTO', 'UPDATE', 'TABLE', 'AS', 'REFERENCES'].includes(prev?.upper ?? '')) return;
    let suspicious: boolean;
    if (columns) {
      suspicious = !columns.has(t.text.toLowerCase());
    } else {
      suspicious = COMPARISON.has(prev?.upper ?? '') || COMPARISON.has(next?.upper ?? '') || inInList(toks, i);
    }
    if (!suspicious) return;
    warn({
      code: 'double-quoted-string',
      blocking: false,
      message: `"${t.text}" steht in doppelten Anführungszeichen – die sind für Bezeichner (Spalten, Tabellen). Texte gehören in einfache Anführungszeichen: '${t.text}'.`,
    });
  });
}

function inInList(toks: Tok[], i: number): boolean {
  const d = toks[i].depth;
  for (let j = i - 1; j >= 0; j--) {
    if (toks[j].kind === 'lp' && toks[j].depth === d - 1) return toks[j - 1]?.upper === 'IN';
  }
  return false;
}

function lintIntegerDivision(toks: Tok[], warn: (w: LintWarning) => void): void {
  toks.forEach((t, i) => {
    const a = toks[i - 1];
    const b = toks[i + 1];
    if (t.kind !== 'op' || t.text !== '/' || !a?.isInt || !b?.isInt || toks[i - 2]?.kind === 'dot') return;
    const q = Number(b.text) === 0 ? 'NULL' : String(Math.trunc(Number(a.text) / Number(b.text)));
    warn({
      code: 'integer-division',
      blocking: false,
      message: `Ganzzahldivision: \`${a.text} / ${b.text}\` ergibt in SQLite ${q} – für Dezimalwerte \`${a.text}.0 / ${b.text}\` oder CAST(… AS REAL).`,
    });
  });
}

/** Dialekt-Warnungen für ein SQL-Skript. `columns`: bekannte Spaltennamen des Datensatzes (verbessert die "…"-Prüfung). */
export function lintSql(sql: string, opts: LintOptions = {}): LintWarning[] {
  const columns = opts.columns ? new Set(opts.columns.map((c) => c.toLowerCase())) : undefined;
  const out: LintWarning[] = [];
  const seen = new Set<string>();
  const warn = (w: LintWarning) => {
    const k = `${w.code}|${w.message}`;
    if (seen.has(k)) return;
    seen.add(k);
    out.push(w);
  };
  for (const toks of statements(tokenize(sql))) {
    for (const s of selects(toks)) lintSelect(s.depth, s.clauses, columns, warn);
    lintDoubleQuotes(toks, columns, warn);
    lintIntegerDivision(toks, warn);
  }
  return out;
}

/** true, wenn eine Warnung eine Übung als „nicht gelöst“ zählen lässt. */
export function hasBlockingWarning(warnings: LintWarning[]): boolean {
  return warnings.some((w) => w.blocking);
}
