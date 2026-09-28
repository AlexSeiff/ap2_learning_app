# Plan: Integrated SQL editor with exercises

> Implementation plan for the AP2 Lern-App. Written against the current code (`main`, commit `12aef5a`).
> All UI text stays German, in the app's usual tone (informal *du*, short sentences, emoji in nav and buttons).

## 1. Goal

A new area **„🧮 SQL-Editor“** with two modes:

| Mode | What it does |
|---|---|
| **Freier Modus** (`/sql`) | Type any SQL against a practice database, run it, see the result table or a German error hint. Browse the schema, reset the database, switch datasets. |
| **Übungsmodus** (`/sql/uebungen`, `/sql/uebung/:id`) | An exercise states what result is wanted. You type a query; the app runs it and checks whether **the result** matches the model solution. Hints, the model solution and an explanation are available on request. Progress is saved. |

It must work in **all three run modes** (`npm run dev`, `npm start`, GitHub Pages) without a server. So the database runs **in the browser**.

## 2. Key decisions

### 2.1 SQL engine: `sql.js` (SQLite compiled to WebAssembly) ✅ recommended

| Option | Size | Pros | Cons |
|---|---|---|---|
| **sql.js** | ~1 MB WASM | Mature, synchronous API, runs in a Web Worker, also runs in Node, so Vitest can test exercises. Recent builds support `RIGHT` / `FULL OUTER JOIN` and window functions. | SQLite dialect: loose typing, integer division, dates stored as text |
| PGlite (Postgres WASM) | ~3 MB | Closer to "textbook" SQL, strict types | Heavier, async only, slower start, more build friction |
| Own server-side DB | – | – | Doesn't work on GitHub Pages ❌ |

The IHK exam uses dialect-neutral SQL. SQLite's deviations are handled with **dialect warnings** (§ 6.4), not by switching engines.

- Load the engine **lazily**. The `/sql` routes are imported with `React.lazy`, so the main bundle and the other pages don't grow.
- Import the WASM file with Vite's `?url` (`import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'`). This works with `base: './'` on Pages. Check it with `npx vite preview --mode pages`.

### 2.2 Execution in a Web Worker

All queries run in `src/sql/sqlWorker.ts`:
- **Timeout:** if a query takes longer than 3 s (for example an endless recursive CTE), the main thread terminates the worker and starts a new one. Message: „Abfrage nach 3 s abgebrochen – Endlosschleife?“
- **Isolation:** every exercise check runs on a **fresh database** built from the dataset's setup script. Setup takes milliseconds for these tiny tables. The free mode keeps one session database until „↺ Datenbank zurücksetzen“.
- **Result cap:** show at most 500 rows (plus the note „… 1.234 Zeilen, 500 angezeigt“). Comparing results always uses all rows.

### 2.3 Editor: CodeMirror 6 with `@codemirror/lang-sql`

- Syntax highlighting, bracket matching, **autocomplete for the table and column names of the active dataset**, `Strg + Enter` = run.
- Lazy-loaded together with the SQL route (about 150 KB gzip). This is the only new UI dependency. It's justified because a plain `<textarea>` makes typing SQL noticeably worse (no indentation, no highlighting).
- Fallback if the bundle size should stay minimal: `<textarea>` with Tab indentation and `Strg + Enter`. The component interface (`value`, `onChange`, `onRun`, `schema`) stays the same, so it can be swapped later.

### 2.4 Where exercises live: new content file `AP-2/AP2_SQL_Uebungen.json` ✅ recommended

Same workflow as the flashcards: the file lives in the `AP-2` folder, the app only reads it, and `npm run sync-content` copies it to `content/` for Pages and tests.

- `server/loadContent.ts → isContentFile()` also matches `/SQL_Uebungen.*\.json$/i`.
- New pure parser `shared/sqlUebungen.ts`, validated with zod, returning `ImportIssue`s like `lernkarten.ts` does.
- `Content` gets `sqlDatasets` and `sqlExercises`. `content.json` (Pages) includes them automatically.

Alternative (not recommended): parse exercises from the Markdown sheets. The DD1 tasks B1–B10 have solutions, but they lack what an auto-checker needs (dataset, order sensitivity, required aliases). A structured file is more robust.

## 3. Content format

```jsonc
{
  "meta": { "version": "1.0", "hinweise": ["SQLite-Dialekt – siehe Dialekt-Hinweise im Editor"] },
  "datensaetze": [
    {
      "id": "moebelhaus",
      "titel": "Möbelhaus Nordholz GmbH",
      "quelle": "Deep Dive 1",
      "beschreibung": "kunde 1:n bestellung 1:n bestellposition n:1 produkt",
      "setup": "CREATE TABLE kunde (kunden_id INTEGER PRIMARY KEY, name TEXT NOT NULL, ort TEXT, registriert_am DATE);\n…INSERT…"
    },
    { "id": "datafit", "titel": "DataFit (Zusatzmaterial)", "quelle": "Deep_Dive_SQL_KW28_29", "setup": "…" }
  ],
  "uebungen": [
    {
      "id": "SQL-MH-008",                    // stable, progress is keyed by it (like card IDs)
      "datensatz": "moebelhaus",
      "thema": "Deep Dive 1",                // maps to topic 01 (same logic as topicFromSource)
      "titel": "Umsatz je Kunde",
      "aufgabe": "Gesamtumsatz je Kunde (name, umsatz) über alle Bestellungen, absteigend nach Umsatz.",
      "schwierigkeit": 3,                    // 1 Basis · 2 Standard · 3 Transfer
      "tags": ["join", "group by", "order by"],
      "loesung": "SELECT k.name, SUM(bp.menge * p.preis) AS umsatz\nFROM kunde k\nJOIN bestellung b ON …",
      "vergleich": {
        "reihenfolge": "auto",               // auto = strict if the solution has a top-level ORDER BY, else ignored
        "spaltennamen": ["name", "umsatz"],  // optional: required output names (case-insensitive); otherwise by position
        "toleranz": 0.005                    // numeric tolerance
      },
      "pruefabfrage": null,                  // for INSERT/UPDATE/DELETE/CREATE: SELECT that checks the resulting state
      "hinweise": [
        "Du brauchst alle vier Tabellen.",
        "Umsatz = menge × preis, summiert je Kunde.",
        "GROUP BY k.name, danach ORDER BY umsatz DESC."
      ],
      "erklaerung": "Ergebnis: Huber GmbH 1471.80 · Schmidt AG 945.00 · Fischer KG 767.70 …",
      "quelle_aufgabe": "DD1 Übungsklausur B8"
    }
  ]
}
```

**Starting content (about 40 exercises):**
- DD1 exam B1–B10 and the SQL parts of A3/C1 („Ergebnis vorhersagen“ can become „Schreibe die Abfrage, die … liefert“).
- The examples from DD1 Teil 1/2 (WHERE, LIKE, NULL, DISTINCT, aggregates, JOIN types, subqueries, DML, DDL with constraints).
- **„SQL für Datenqualitätsprüfungen“** from DD1 and DD9: duplicates, NULL rates, orphaned foreign keys, out-of-range values. These are relevant to your specialisation.
- DataFit exercises from `Deep_Dive_SQL_KW28_29.md` (the setup script in section 8 is ready to use).
- Tags follow the sheet structure, so exercises can be filtered by topic, like flashcards.

## 4. Checking an exercise (`src/sql/checker.ts`, pure and tested)

```
user query ──► fresh DB ──► result U ─┐
                                       ├─► compare ──► verdict + feedback
model solution ─► fresh DB ─► result L ┘
```

1. **Run both** on separate fresh databases. If the user query fails, show the SQLite error plus a German hint (§ 6.3). This counts as an attempt.
2. **DML/DDL exercises** (`pruefabfrage` set): run the user statement, then run `pruefabfrage` on that database. Do the same for the solution, then compare the two check results.
3. **Compare:**
   - Column count equal? Otherwise: „Deine Abfrage liefert 3 Spalten, erwartet sind 2.“
   - If `spaltennamen` is set: names equal (case-insensitive)? Otherwise: „Spalte 2 soll `durchschnittspreis` heißen – Alias mit AS vergeben.“
   - Normalise values: numbers are rounded by `toleranz`, `NULL` stays distinct from `''` and `0`, and text is compared exactly (no trim, no case folding).
   - **Order:** with `reihenfolge = streng` (or `auto` + ORDER BY in the solution), compare row by row. Otherwise compare sorted multisets.
   - Feedback is specific but doesn't give away the solution: „2 Zeilen fehlen, 1 Zeile zu viel“. „Zeige Unterschiede“ opens a small diff table (missing rows green, extra rows red).
4. **Anti-hardcoding (Phase 4):** an optional `variante` per dataset (extra or changed rows). A query only counts as correct if it also matches on the variant. This stops `SELECT 'Huber GmbH', 1471.8` from passing.

**Why compare results instead of text?** SQL has many correct spellings (JOIN vs. subquery, aliases, formatting). The exam also awards full points for alternative solutions (see DD1 B9). The text of the model solution is shown only as a reference.

## 5. UI

### 5.1 Navigation and routes

- Sidebar: new entry **„🧮 SQL-Editor“** between „Einzelaufgaben“ and „Fehlerjournal“.
- `/sql` – Freier Modus · `/sql/uebungen` – list · `/sql/uebung/:id` – single exercise.
- Tabs at the top of the page: **Freier Modus | Übungen** (plain links, so the browser back button works).

### 5.2 Freier Modus

```
┌──────────────────────────────────────────────────────────────────────┐
│ Datensatz: [Möbelhaus Nordholz ▾]  [↺ Zurücksetzen]  [📋 Beispiele ▾]│
├──────────────┬───────────────────────────────────────────────────────┤
│ Schema       │  SELECT ort, COUNT(*) AS anzahl                       │
│ ▸ kunde (5)  │  FROM kunde                                           │
│   kunden_id  │  GROUP BY ort;                                        │
│   name …     │                                        [▶ Ausführen]  │
│ ▸ produkt (5)├───────────────────────────────────────────────────────┤
│ ▸ bestellung │  ort      │ anzahl        3 Zeilen · 2 ms           │
│ ▸ bestellpos.│  Hamburg  │ 2                                         │
│              │  Köln     │ 1                                         │
│ [Tabelle     │  München  │ 2                                         │
│  anzeigen]   │                                                       │
├──────────────┴───────────────────────────────────────────────────────┤
│ Verlauf: ⟲ SELECT … (vor 2 min) · ⟲ SELECT … (vor 5 min)             │
└──────────────────────────────────────────────────────────────────────┘
```

- **Schema browser:** tables with row count, columns with type and PK/FK marker. Clicking a column inserts its name into the editor. „Tabelle anzeigen“ runs `SELECT * FROM <tabelle>`.
- **Multiple statements** separated by `;`: all are executed. The result of the last `SELECT` is shown, and for DML a line like „3 Zeilen geändert“.
- **Examples** dropdown: queries from the Lernen pages for the active dataset.
- **Query history:** the last 30 queries in `localStorage` (per device; convenience only, wrapped in try/catch).
- **Draft protection:** the editor content survives a page reload (`localStorage`).
- Phone width: schema collapses above the editor, and the result table scrolls horizontally inside its box.

### 5.3 Übungsmodus

**List** (`/sql/uebungen`): filters by Thema, Schwierigkeit, Tag and Status (offen / gelöst / Wiederholung fällig), with the same filter-in-URL behaviour as the Karteikarten page. Progress bar „17 / 40 gelöst“.

**Single exercise** (`/sql/uebung/:id`):
```
┌ SQL-MH-008 · Umsatz je Kunde · ★★★ · Deep Dive 1 ────────────────────┐
│ Gesamtumsatz je Kunde (name, umsatz) über alle Bestellungen,        │
│ absteigend nach Umsatz.                          Datensatz: Möbelhaus │
├──────────────────────────────────────────────────────────────────────┤
│ [editor]                                                             │
│ [▶ Ausprobieren]  [✓ Prüfen]  [💡 Hinweis 1/3]  [👁 Lösung zeigen]    │
├──────────────────────────────────────────────────────────────────────┤
│ ✅ Richtig! 3 Zeilen, Reihenfolge stimmt.       [Weiter →]           │
│ – oder –                                                             │
│ ❌ Noch nicht: 1 Zeile fehlt. Reihenfolge prüfen.  [Unterschiede ▾]  │
└──────────────────────────────────────────────────────────────────────┘
```

- **„▶ Ausprobieren“** only runs the query and shows the result (doesn't count). **„✓ Prüfen“** compares with the solution (counts as an attempt).
- **Hints** are revealed one at a time. **„Lösung zeigen“** asks for confirmation first (`useConfirm`), then shows the model solution, the explanation and your own query side by side. The exercise then counts as „mit Lösung“, not „gelöst“, and comes back for repetition.
- The schema browser is collapsible here too; many exercises need a look at the column names.
- Keyboard: `Strg + Enter` = Ausprobieren, `Strg + Shift + Enter` = Prüfen.

### 5.4 Integration with existing pages

- **Lernen / solutions:** fenced code blocks marked `sql` get a small button „🧮 Im SQL-Editor öffnen“. It opens `/sql` with the query prefilled (`?q=` base64 or `sessionStorage`) and the matching dataset (DD1 → Möbelhaus, the older sheet → DataFit). The only change needed is in `components/Markdown.tsx`.
- **Übersicht (Dashboard):** a card „SQL-Übungen: 17/40 gelöst · 3 Wiederholungen fällig“.
- **Lernserie:** a checked SQL exercise counts as a learning day (see § 7).

## 6. Details that matter for exam preparation

### 6.1 Result display
- `NULL` is shown greyed out as *NULL* (not as an empty cell). The difference between NULL and `''` is exam material.
- Numbers keep the dot and are right-aligned. The column header shows the declared or derived type if known.

### 6.2 Keeping the practice data identical to the sheets
The Möbelhaus setup must reproduce the tables printed in DD1 **exactly**. Otherwise exercise results won't match the numbers in the solutions. This is guarded by a test (§ 9).

### 6.3 German error hints (`src/sql/errors.ts`, table-driven)

| SQLite message (pattern) | Hint |
|---|---|
| `no such table: X` | „Tabelle `X` gibt es nicht. Verfügbar: kunde, produkt, …“ (with the closest match, e.g. `kunden` → `kunde`) |
| `no such column: X` | „Spalte `X` unbekannt. Tippfehler oder Tabellenalias vergessen?“ + closest match |
| `ambiguous column name: X` | „`X` gibt es in mehreren Tabellen – mit Alias qualifizieren, z. B. `k.X`.“ |
| `misuse of aggregate` | „Aggregatfunktion in WHERE? Bedingungen auf Gruppen gehören in HAVING.“ |
| `near "X": syntax error` | „Syntaxfehler bei `X` – Komma, Klammer oder Schlüsselwort prüfen.“ |
| `no such function: YEAR` / `MONTH` / `DATE_FORMAT` | „Diese Funktion kennt SQLite nicht – nutze `strftime('%Y', datum)`.“ |
| `UNIQUE constraint failed` / `FOREIGN KEY constraint failed` / `NOT NULL constraint failed` | Explanation of the violated constraint (referential integrity is exam material) |

`PRAGMA foreign_keys = ON` is set in every setup, so FK violations actually fail like in the exam.

### 6.4 Dialect warnings: where SQLite is more lenient than the exam

SQLite accepts some things the IHK marks as **wrong**. The editor runs them, but shows a yellow warning. It never silently accepts them in exercises.

| Construct | SQLite | Exam | Handling |
|---|---|---|---|
| Non-aggregated column in SELECT that isn't in GROUP BY | allowed ("bare column") | **error** (DD1 A3) | Heuristic check: warning „Spalte `name` steht weder im GROUP BY noch in einer Aggregatfunktion – in der Prüfung ein Fehler.“ In the exercise mode this counts as **not solved**. |
| Column alias used in WHERE | allowed | **error** | Warning; not solved in the exercise mode |
| `"text"` in double quotes as a string | treated as a string if no column matches | identifiers only | Warning „Texte in einfache Anführungszeichen“ |
| `5 / 2` | `2` (integer division) | depends on the dialect | Note in the result: „Ganzzahldivision – für Dezimalwerte `5.0 / 2` oder `CAST`.“ |
| `LIKE` | case-insensitive for ASCII | usually case-sensitive | Info panel „Dialekt-Hinweise“ |
| `DECIMAL(8,2)`, `DATE` | stored loosely, no enforcement | strict types | Info panel |

The check starts as a light token-based analysis (`src/sql/lint.ts`), which is enough for single SELECTs with GROUP BY. Only switch to a full SQL parser if the heuristic produces false alarms in the real exercises.

## 7. Progress (persisted, needs migration)

New field in `shared/progress.ts`, **`PROGRESS_VERSION` 3 → 4**:

```ts
export type SqlState = {
  attempts: number;        // counted "Prüfen" clicks
  solvedAt?: string;       // first correct check without viewing the solution
  lastCheckedAt?: string;
  hintsUsed: number;
  solutionShown?: boolean;
  lastQuery?: string;      // restored when the exercise is reopened (max. 4,000 chars)
  stage?: number;          // repetition stage, like the Fehlerjournal: 1 → 3 → 7 days
  due?: string;
};

Progress.sql: Record<string /* exercise id */, SqlState>;
Progress.sqlDays: Record<string /* YYYY-MM-DD */, number>;  // for the Lernserie, like cardReviewDays
```

- Migration step `3 → 4` in `MIGRATIONS` adds `sql: {}` and `sqlDays: {}`. Extend the zod schema (tolerant, as documented at the top of the file). Extend `tests/progress.test.ts` including the fixture files.
- Pure update functions in `src/lib/sql.ts`: `recordSqlCheck(p, id, ok, query, today)`, `recordSqlHint`, `recordSolutionShown`, tested like `rateCard`.
- **Repetition:** wrong or „Lösung gezeigt“ → due in 1 day. Correct on repetition → next stage (3, then 7 days) → done. This reuses `JOURNAL_INTERVALS`.
- SQL exercises are deliberately **not** put into `progress.journal` or `attempts`: those assume `content.tasks` IDs and points, and `Fehlerjournal.tsx` / `stats.ts` filter unknown IDs anyway.
- `stats.ts → streak` also counts days in `sqlDays`.
- Backup download/import and the Pages localStorage version work automatically because the whole `Progress` object is saved.

## 8. File overview

```
shared/
  sqlUebungen.ts        parse + validate AP2_SQL_Uebungen.json (zod), ImportIssues
  types.ts              + SqlDataset, SqlExercise; Content.sqlDatasets / sqlExercises
  progress.ts           + SqlState, sql, sqlDays, migration 3 → 4, schema
server/
  loadContent.ts        isContentFile(): also *SQL_Uebungen*.json
  report.ts             import report lists datasets and exercise counts
src/sql/
  sqlWorker.ts          sql.js in a Web Worker: open(setup), exec(sql), reset
  engine.ts             Promise API for the worker, timeout + restart
  checker.ts            result comparison (pure, no DOM)
  errors.ts             SQLite error → German hint
  lint.ts               dialect warnings (GROUP BY, alias in WHERE, "…")
src/components/
  SqlEditor.tsx         CodeMirror wrapper (value, onChange, onRun, schema)
  ResultTable.tsx       result grid with NULL display, row cap
  SchemaBrowser.tsx
src/pages/
  SqlFrei.tsx, SqlUebungen.tsx, SqlUebung.tsx   (lazy-loaded)
src/lib/sql.ts          progress updates for SQL exercises
tests/
  sqlChecker.test.ts, sqlErrors.test.ts, sqlLint.test.ts, sqlUebungen.test.ts, sqlContent.smoke.test.ts
AP-2/AP2_SQL_Uebungen.json   (content, synced to content/)
```

## 9. Tests

- **checker:** column count, names, order strict/auto/ignored, multisets with duplicates, NULL vs `''`, numeric tolerance, DML via `pruefabfrage`.
- **lint:** a bare column in GROUP BY warns; a correct GROUP BY doesn't; an alias in WHERE warns; the DD1 A3 query triggers all three warnings.
- **errors:** every table row maps; closest-match suggestion (`kunden` → `kunde`).
- **Content smoke test** (real `content/AP2_SQL_Uebungen.json`, sql.js in Node):
  - every setup script runs without error; every `loesung` runs on its dataset and returns ≥ 1 row (unless `leerErlaubt: true`);
  - exercise IDs are unique, and every `datensatz` exists;
  - **the dataset matches the sheet:** `SELECT COUNT(*)` per table matches DD1 (5/5/6/8), and the B8 solution returns Huber GmbH 1471.80 · Schmidt AG 945.00 · Fischer KG 767.70;
  - no model solution triggers its own dialect warnings.
- **progress:** migration 3 → 4 with the old fixtures, `recordSqlCheck` stage progression.
- Manual check before release: `npm run build:pages` + `npx vite preview --mode pages`. The WASM loads, and a query runs offline after the first load.

## 10. Phases (each ends with all checks green: test, typecheck, lint, format:check, build, build:pages)

| Phase | Scope | Done when |
|---|---|---|
| **1 – Freier Modus** | sql.js worker + timeout, Möbelhaus + DataFit datasets (hard-coded setup first), editor, result table, schema browser, reset, German errors, nav entry | Every DD1 example query can be run in the browser, in dev and on Pages |
| **2 – Übungen** | `AP2_SQL_Uebungen.json` + parser + sync, checker, list + single exercise page, hints, show solution; datasets move into the JSON | DD1 B1–B10 and 20+ more exercises can be solved and checked; smoke test green |
| **3 – Fortschritt** | Progress v4 + migration, repetition (1/3/7 days), dashboard card, Lernserie, draft/last-query restore | Solving an exercise survives reload, backup export/import and the Pages version |
| **4 – Feinschliff** | Dialect warnings (lint), „Im SQL-Editor öffnen“ in Markdown code blocks, anti-hardcoding variant datasets, query history, diff view | The DD1 A3 query shows its three exam errors as warnings |

Rough effort: Phase 1 ≈ 1 day, Phase 2 ≈ 1–1.5 days (mostly writing exercises), Phase 3 ≈ ½ day, Phase 4 ≈ 1 day.

## 11. Risks and mitigations

| Risk | Mitigation |
|---|---|
| SQLite accepts queries the exam counts as wrong | Dialect warnings (§ 6.4); in the exercise mode they block „gelöst“ |
| Exercise data drifts from the sheet tables | Smoke test checks row counts and known solution results |
| WASM doesn't load on Pages (path/base) | `?url` import, manual Pages preview is part of the phase-1 definition of done |
| Endless queries freeze the tab | Worker + hard timeout + restart |
| Hard-coded results count as correct | Variant datasets (Phase 4) |
| Bundle size | Lazy route; sql.js and CodeMirror load only when `/sql` is opened |
| Progress schema change | Versioned migration + fixture tests, as for versions 2 and 3 |

## 12. Open questions for you

1. **Engine:** OK with SQLite (sql.js) plus dialect warnings, or do you want PostgreSQL (PGlite, ~3× larger, closer to textbook SQL)?
2. **Editor:** CodeMirror (highlighting + autocomplete, ~150 KB lazy) or a plain textarea?
3. **Exercise source:** a new file `AP-2/AP2_SQL_Uebungen.json` (recommended), or should the exercises come from the Markdown sheets?
4. **Fehlerjournal:** should failed SQL exercises also appear in the main Fehlerjournal, or is the repetition inside the SQL area enough (recommended, simpler)?
