// SQLite-Fehlermeldung → kurzer deutscher Hinweis (tabellengesteuert, rein).

export type ErrorSchema = { tables: string[]; columns: string[] };

type Rule = { pattern: RegExp; hint: (m: RegExpMatchArray, schema: ErrorSchema) => string };

/** Levenshtein-Distanz (Groß-/Kleinschreibung wird vorher angeglichen). */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/** Ähnlichster Name aus `candidates` (z. B. `kunden` → `kunde`) oder undefined, wenn nichts nah genug ist. */
export function closestMatch(name: string, candidates: string[]): string | undefined {
  const needle = name.toLowerCase();
  let best: string | undefined;
  let bestDist = Infinity;
  for (const c of candidates) {
    const dist = levenshtein(needle, c.toLowerCase());
    if (dist < bestDist) {
      best = c;
      bestDist = dist;
    }
  }
  if (best === undefined || bestDist === 0) return best;
  const limit = Math.max(2, Math.floor(Math.min(needle.length, best.length) / 3));
  return bestDist <= limit ? best : undefined;
}

function unique(list: string[]): string[] {
  return [...new Set(list)];
}

/** Name ohne Tabellenpräfix/Anführungszeichen: `k.nme` → `nme`. */
function bareName(name: string): string {
  const parts = name.replace(/["`[\]]/g, '').split('.');
  return parts[parts.length - 1];
}

function suggestion(name: string, candidates: string[]): string {
  const match = closestMatch(bareName(name), unique(candidates));
  return match && match.toLowerCase() !== bareName(name).toLowerCase() ? ` Meintest du \`${match}\`?` : '';
}

const DATE_FUNCTIONS: Record<string, string> = {
  YEAR: "strftime('%Y', datum)",
  MONTH: "strftime('%m', datum)",
  DAY: "strftime('%d', datum)",
  DATE_FORMAT: "strftime('%d.%m.%Y', datum)",
  NOW: "datetime('now')",
  CURDATE: "date('now')",
  GETDATE: "datetime('now')",
  SYSDATE: "datetime('now')",
  DATEDIFF: 'julianday(bis) - julianday(von)',
  TO_CHAR: "strftime('%Y-%m-%d', datum)",
};

const OTHER_FUNCTIONS: Record<string, string> = {
  CONCAT: '`a || b` (Verkettung mit ||)',
  LEN: '`length(text)`',
  ISNULL: '`IFNULL(wert, ersatz)` oder `COALESCE(…)`',
  NVL: '`IFNULL(wert, ersatz)` oder `COALESCE(…)`',
  LEFT: '`substr(text, 1, n)`',
  RIGHT: '`substr(text, -n)`',
  TRUNCATE: '`CAST(x AS INTEGER)` oder `round(x, n)`',
};

const RULES: Rule[] = [
  {
    pattern: /Abfrage nach \d+ s abgebrochen/,
    hint: () => 'Die Abfrage lief zu lange. Prüfe rekursive CTEs auf eine Abbruchbedingung und JOINs auf fehlende ON-Bedingungen.',
  },
  {
    pattern: /no such table: (\S+)/i,
    hint: (m, s) => {
      const list = s.tables.length ? ` Verfügbar: ${s.tables.join(', ')}.` : '';
      return `Tabelle \`${m[1]}\` gibt es nicht.${suggestion(m[1], s.tables)}${list}`;
    },
  },
  {
    pattern: /no such column: (\S+)/i,
    hint: (m, s) => `Spalte \`${m[1]}\` unbekannt. Tippfehler oder Tabellenalias vergessen?${suggestion(m[1], s.columns)}`,
  },
  {
    pattern: /ambiguous column name: (\S+)/i,
    hint: (m) => {
      const col = bareName(m[1]);
      return `\`${col}\` gibt es in mehreren Tabellen – mit Alias qualifizieren, z. B. \`k.${col}\`.`;
    },
  },
  {
    pattern: /misuse of aggregate/i,
    hint: () => 'Aggregatfunktion in WHERE? Bedingungen auf Gruppen gehören in HAVING (nach GROUP BY).',
  },
  {
    pattern: /misuse of window function/i,
    hint: () => 'Fensterfunktionen (… OVER (…)) dürfen nicht in WHERE, GROUP BY oder HAVING stehen – nutze eine Unterabfrage.',
  },
  {
    pattern: /a GROUP BY clause is required before HAVING|HAVING clause on a non-aggregate query/i,
    hint: () => 'HAVING filtert Gruppen – dafür brauchst du vorher ein GROUP BY. Für Zeilenfilter nimm WHERE.',
  },
  {
    pattern: /no such function: (\w+)/i,
    hint: (m) => {
      const fn = m[1].toUpperCase();
      if (DATE_FUNCTIONS[fn]) return `Diese Funktion kennt SQLite nicht – nutze \`${DATE_FUNCTIONS[fn]}\`.`;
      if (OTHER_FUNCTIONS[fn]) return `Diese Funktion kennt SQLite nicht – nutze ${OTHER_FUNCTIONS[fn]}.`;
      return `Die Funktion \`${m[1]}\` kennt SQLite nicht. Tippfehler? Datumswerte bearbeitest du mit \`strftime\`, \`date\` und \`julianday\`.`;
    },
  },
  {
    pattern: /incomplete input/i,
    hint: () =>
      'Die Abfrage hört mittendrin auf – fehlt eine schließende Klammer, ein Anführungszeichen oder der Teil nach dem letzten Schlüsselwort?',
  },
  {
    pattern: /unrecognized token: "?(.+?)"?$/i,
    hint: (m) =>
      `Unbekanntes Zeichen \`${m[1]}\` – oft ein nicht geschlossenes Anführungszeichen. Texte stehen in einfachen Anführungszeichen: 'München'.`,
  },
  {
    pattern: /near "([^"]*)": syntax error/i,
    hint: (m) =>
      `Syntaxfehler bei \`${m[1]}\` – Komma, Klammer oder Schlüsselwort prüfen (auch die Reihenfolge SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY).`,
  },
  {
    pattern: /UNIQUE constraint failed: (\S+)/i,
    hint: (m) =>
      `Eindeutigkeit verletzt: In \`${m[1]}\` gibt es diesen Wert schon. Primärschlüssel und UNIQUE-Spalten dürfen keinen Wert doppelt enthalten – wähle einen anderen Wert oder ändere den vorhandenen Datensatz mit UPDATE.`,
  },
  {
    pattern: /FOREIGN KEY constraint failed/i,
    hint: () =>
      'Referenzielle Integrität verletzt: Ein Fremdschlüssel muss auf einen vorhandenen Datensatz zeigen. Beim INSERT/UPDATE gibt es den referenzierten Schlüssel nicht; beim DELETE hängen noch abhängige Datensätze daran – erst die abhängigen Zeilen löschen (oder ON DELETE CASCADE festlegen).',
  },
  {
    pattern: /NOT NULL constraint failed: (\S+)/i,
    hint: (m) => `\`${m[1]}\` ist ein Pflichtfeld (NOT NULL) – gib beim INSERT einen Wert dafür an oder setze einen DEFAULT.`,
  },
  {
    pattern: /CHECK constraint failed: ?(.*)$/i,
    hint: (m) =>
      `Die CHECK-Bedingung${m[1] ? ` \`${m[1]}\`` : ''} ist verletzt – der Wert liegt außerhalb des erlaubten Bereichs (z. B. negativer Betrag).`,
  },
  {
    pattern: /datatype mismatch/i,
    hint: () => 'Datentyp passt nicht – z. B. Text in einer INTEGER PRIMARY KEY-Spalte.',
  },
  {
    pattern: /table (\S+) has (\d+) columns but (\d+) values were supplied/i,
    hint: (m) =>
      `\`${m[1]}\` hat ${m[2]} Spalten, du lieferst ${m[3]} Werte. Gib die Spalten beim INSERT ausdrücklich an: INSERT INTO t (a, b) VALUES (…).`,
  },
  {
    pattern: /(\d+) values for (\d+) columns/i,
    hint: (m) => `Anzahl passt nicht: ${m[1]} Werte für ${m[2]} Spalten – Spaltenliste und VALUES müssen gleich lang sein.`,
  },
  {
    pattern: /(?:table|index|view) (\S+) already exists/i,
    hint: (m) => `\`${m[1]}\` gibt es schon. Vorher mit DROP TABLE löschen oder CREATE TABLE IF NOT EXISTS verwenden.`,
  },
  {
    pattern: /do not have the same number of result columns/i,
    hint: () => 'Bei UNION/INTERSECT/EXCEPT müssen beide SELECTs gleich viele Spalten liefern.',
  },
  {
    pattern: /sub-select returns (\d+) columns - expected 1/i,
    hint: (m) => `Die Unterabfrage liefert ${m[1]} Spalten, hier ist genau eine erwartet (z. B. bei IN oder einem Vergleich).`,
  },
  {
    pattern: /no tables specified/i,
    hint: () => 'SELECT * braucht ein FROM mit einer Tabelle.',
  },
  {
    pattern: /Setup-Skript fehlerhaft/i,
    hint: () => 'Das Setup-Skript des Datensatzes lief nicht durch – das ist ein Fehler in den Übungsdaten, nicht in deiner Abfrage.',
  },
];

const FALLBACK = 'SQLite meldet einen Fehler – lies die Meldung genau und prüfe die Abfrage Klausel für Klausel.';

/** Deutscher Hinweis zu einer SQLite-Fehlermeldung; `schema` liefert Tabellen-/Spaltennamen für „Meintest du …?“. */
export function translateError(message: string, schema: ErrorSchema = { tables: [], columns: [] }): string {
  for (const rule of RULES) {
    const m = message.match(rule.pattern);
    if (m) return rule.hint(m, schema);
  }
  return FALLBACK;
}
