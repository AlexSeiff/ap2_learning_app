# AP2 Lern-App – Technical Documentation

> Merges the earlier working documents `IMPROVEMENTS_PROMPT.md` (refactoring/safety plan, P0–P3) and `SQL_EDITOR_PLAN.md`
> (SQL editor, phases 1–4) and the original build prompt (`../Prompt_Lern_App.md`). Everything in them has been implemented;
> this file describes **the app as it is** (state: commit `06d77e7`, September 2026).
> Planned changes are in [`ROADMAP.md`](ROADMAP.md). How to install and start the app is in `README.md` (German).

---

## 1. Purpose

A learning app for the IHK exam **Abschlussprüfung Teil 2 – Fachinformatiker/-in Daten- und Prozessanalyse (FIDPA)**.
It turns German Markdown learning sheets ("Deep Dives") and a flashcard JSON into interactive exercises: theory, flashcards,
timed practice exams with **separate solution sheets**, single tasks, an error journal with spaced repetition, a browser SQL editor
with auto-checked exercises, and optional AI-generated tasks.

**Conventions**
- All UI text is German, informal *du*, short sentences, emoji in nav and buttons.
- Code identifiers are mixed German/English; don't rename public identifiers just to change the language.
- Content files (Markdown sheets, JSON) are **read only** by the app.
- No heavy dependencies (no state library, no CSS framework, no backend framework). `zod` is used for validation.

## 2. Run modes

One React UI, three ways to run it:

| | `npm run dev` | `npm start` (vite preview) | `npm run build:pages` (GitHub Pages) |
|---|---|---|---|
| API `/api/…` | `server/apiPlugin.ts` via `configureServer` | same middleware via `configurePreviewServer` | none; `src/lib/staticApi.ts` |
| Learning sheets | live from `AP-2/`, page reloads on change | from `AP-2/`, cache cleared on change (F5) | `content/` → `content.json` in the build |
| Progress | `data/fortschritt.json` + daily backups | like dev | `localStorage` of the browser |
| AI (`.env.local`) | yes | yes | never read, the key can't end up in the build |

- `src/lib/api.ts` picks the data source by `import.meta.env.MODE` (`pages` → static API).
- Public URL: **https://alexseiff.github.io/ap2_learning_app/** (HashRouter, `base: './'`).
- Every push to `main` runs `.github/workflows/pages.yml`: `npm ci` → `npm test` → `npm run lint` → `npm run build:pages` → deploy.
- The Pages version is **used by several people**. Each browser has its own progress; there is no shared state and no account.
- Uncommitted work in progress (not on GitHub): an Electron desktop build (`electron/`, `vite.electron.config.ts`, `src/lib/desktopApi.ts`,
  `npm run build:desktop`, `npm run dist:win`). See ROADMAP step 0.

## 3. Architecture

Stack: React 19, Vite 8, TypeScript 7 (`@typescript/native` for `tsc`; TypeScript 6 under the name `typescript` for typescript-eslint),
Vitest 5, React Router 7 (HashRouter), react-markdown + remark-gfm, zod 4, sql.js (SQLite/WASM), CodeMirror 6, `@anthropic-ai/sdk`.

```
lern-app/
├─ shared/            used by client, server and tests (no file-system access)
│  ├─ config.ts         constants: EXAM_DATE, EXAM_MINUTES, NEW_PER_SESSION, JOURNAL_INTERVALS, CARD_INTERVALS, SAVE_DELAY_MS, DEV_PORT
│  ├─ types.ts          content model (Topic, Task, Flashcard, Deck, Exam, SqlDataset, SqlExercise, Content …)
│  ├─ parser.ts         Markdown sheet + solution parser (pure, line/regex based)
│  ├─ lernkarten.ts     flashcard JSON import (zod, ImportIssues)
│  ├─ sqlUebungen.ts    SQL exercise JSON import (zod, ImportIssues)
│  ├─ progress.ts       persisted progress: types, zod schema, checkProgressPut, migrateProgress
│  └─ api.ts            API contract: request schemas + response types per route
├─ server/            runs only inside Vite (dev/preview)
│  ├─ apiPlugin.ts      route table + middleware for /api/*
│  ├─ router.ts         tiny router (method, path/regex, handler)
│  ├─ store.ts          JSON files in data/, atomic write (temp + rename, retry for OneDrive EPERM/EBUSY), daily backups
│  ├─ contentCache.ts   cached loadContent(), cleared by the file watcher
│  ├─ loadContent.ts    reads AP-2/*.md, *Lernkarten*.json, *SQL_Uebungen*.json → buildContent()
│  ├─ ai.ts             Claude: generateTasks(), gradeAnswer() with structured output
│  ├─ pagesPlugin.ts    emits content.json for the Pages build
│  ├─ report.ts         npm run import-report
│  └─ syncContent.ts    npm run sync-content (AP-2 → content/)
├─ content/           copy of sheets + JSON for Pages and tests (committed, therefore public)
├─ src/
│  ├─ pages/            one file per page, mostly rendering
│  ├─ hooks/            useExamRun, useCardSession (+ useCardFilters), useSqlSession, useConfirm
│  ├─ components/       AnswerInput, Markdown, TaskParts, ErrorBoundary, ConfirmDialog, SqlEditor, ResultTable, SchemaBrowser, SqlTabs
│  ├─ lib/              pure logic (progress, grading, stats, cards, shuffle, examTimer, sheets, sql, sqlLinks)
│  │                    + store.tsx (React context), progressSaver.ts, api.ts, staticApi.ts, apiError.ts
│  └─ sql/              sqlWorker.ts, engine.ts, runner.ts, checker.ts, errors.ts, lint.ts, types.ts
├─ tests/             Vitest; fixtures/ with old progress formats and a mini sheet set
└─ data/              fortschritt.json, generierte-aufgaben.json, backups/ (gitignored, local app only)
```

## 4. Content

### 4.1 Learning sheets (Markdown)

| File | Parsed into |
|---|---|
| `DeepDive_NN_Thema.md` | `Topic`: theory sections (`# Teil …`, `## 1.1 …`), `lernziele` (`- [ ]` under `## Lernziel-Check…`), flashcards from Prüferfragen and Fachgespräch, `Exam` from `# Übungsklausur …` with blocks `## Block A – Titel (19 P)` and tasks `**A1 (6 P):** …`, attachments (Anlagen) |
| `DeepDive_NN_Thema_Loesungen.md` | `Solution` per task (`**A1 (6 P):**`), `kommentar` from `*Prüferkommentar: …*`, `criteria` from a points table `| Element | P |` |
| `Deep_Dive_SQL_KW28_29.md` | extra topic (id `00`), solutions inside the sheet; keep the file name (SQL links depend on it) |
| `Lernzettel_Kernthemen.md`, `AP2_Themenliste_und_Beispielfragen.md` | `MaterialDoc` (Material page) |
| `Lernplan_*.md`, `Prompt_*.md` | **not read** (`isContentFile`), not synced – the personal study plan is not part of the app |

- **Prüferfragen**: `> ❓ **Prüferfrage:** Frage` with the italic answer in the next quote line → `Flashcard{kind:'prueferfrage'}`.
  They also remain inside the section Markdown, so they show up in the Lernen view.
- **Fachgespräch**: numbered list under `## Fachgespräch…` → `Flashcard{kind:'fachgespraech'}`.
- A trailing `(KW …)` in a sheet or section title is removed (`stripKw`); there is no calendar week in the data model any more.
  The sheets themselves no longer contain personal time references ("am Ende des Themas" instead of "am Ende von KW 31").
- Problems (task without solution etc.) are collected as `ImportIssue`s and shown on *Daten & Import* / `npm run import-report`.

### 4.2 Flashcards `AP2_FIDPA_Lernkarten.json`

```json
{ "meta": { "hinweise": ["…"] },
  "decks": [ { "id": "sql", "titel": "SQL", "pruefungsbereich": "…", "quelle": "Deep Dive 1", "status": "behandelt",
               "karten": [ { "id": "SQL-001", "frage": "…", "antwort": "…", "typ": "wissen", "schwierigkeit": 1, "tags": ["join"] } ] } ] }
```

- Currently 24 decks and 407 cards (typ: wissen 216, falle 62, abgrenzung 55, anwendung 48, rechnung 26).
- `quelle` containing "Deep Dive N" maps the deck to a topic; decks without one (WiSo, project work) are reachable via the deck filter.
- Progress is keyed by card `id`. **Never change IDs.**

### 4.3 SQL exercises `AP2_SQL_Uebungen.json`

```jsonc
{
  "meta": { "version": "1.0", "hinweise": ["…"] },
  "datensaetze": [ { "id": "moebelhaus", "titel": "Möbelhaus Nordholz GmbH", "quelle": "Deep Dive 1",
                     "beschreibung": "…", "setup": "PRAGMA foreign_keys = ON; CREATE TABLE …", "variante": "UPDATE …" } ],
  "uebungen": [ {
    "id": "SQL-MH-008", "datensatz": "moebelhaus", "thema": "Deep Dive 1", "titel": "Umsatz je Kunde",
    "aufgabe": "…", "schwierigkeit": 3, "tags": ["join", "group by"],
    "loesung": "SELECT …",
    "vergleich": { "reihenfolge": "auto", "spaltennamen": ["name", "umsatz"], "toleranz": 0.005 },
    "pruefabfrage": null, "leerErlaubt": false,
    "hinweise": ["…", "…"], "erklaerung": "…", "quelle_aufgabe": "DD1 Übungsklausur B8"
  } ]
}
```

Currently 3 datasets (`moebelhaus`, `datafit`, `kundenimport`) and 59 exercises.

### 4.4 Updating content for Pages

Edit files in `AP-2/`, then `npm run sync-content` (copies to `content/`), commit, push. The Pages build reads `content/` only.
AI-generated tasks (`data/`) never go into the Pages build.

## 5. Features (pages and routes)

| Route | Page | What it does |
|---|---|---|
| `/` | Dashboard | countdown to `EXAM_DATE`, study streak, due journal items/cards, SQL KPI, average exam score + IHK grade, progress and exam trend per topic, weakest topics |
| `/lernen`, `/lernen/:topicId` | Themen / Thema | theory with table of contents, Prüferfragen inline, ticking off learning goals |
| `/karteikarten` | Karteikarten | filters (Deep Dive, deck, kind, typ, difficulty; kept in the URL), Leitner boxes (`CARD_INTERVALS`), max `NEW_PER_SESSION` new cards per round, "⚠️ Fallen wiederholen", keyboard: Space flip, 1/2/3 rate |
| `/klausur`, `/klausur/:topicId` | Übungsklausur | 90-min timer (`aria-live` announcements), attachments, solutions locked until submission, self-assessment with criteria checkboxes, IHK grade, auto-submit on timeout, resumable (`activeExam`) |
| `/aufgaben`, `/aufgabe/:taskId` | Einzelaufgaben | filter by topic/block/difficulty/status/search; export a selection as task sheet/solution sheet |
| `/druck` | Druck | print view (task sheet or solution sheet, same numbering) → "Als PDF speichern"; also Markdown download |
| `/sql`, `/sql/uebungen`, `/sql/uebung/:id` | SQL-Editor | free mode + exercises (see § 7) |
| `/fehlerjournal` | Fehlerjournal | every task below full points comes back after 1, 3, 7 days (`JOURNAL_INTERVALS`) |
| `/generator` | KI-Aufgaben | Claude generates IHK-style tasks (mc, lueckentext, zuordnung, rechnen, offen) with model solution; local app only |
| `/material`, `/material/:docId` | Material | cheat sheet, topic list |
| `/daten` | Daten & Import | import report, re-import (local), backup download/upload, reset, newest daily backup (local) |

**Grading**
- Automatic: MC, Lückentext, Zuordnung, numeric (`rechnen`, with tolerance). These types currently only exist for AI-generated tasks.
- Sheet tasks are `offen`: self-assessment against the model solution; a points table becomes checkable criteria.
- Optional AI grading (local app): points suggestion + feedback + missing aspects; the user can adjust.
- IHK scale: 100–92 = 1 · 91–81 = 2 · 80–67 = 3 · 66–50 = 4 · 49–30 = 5 · 29–0 = 6.

**Other**: theme toggle (system/dark/light, localStorage), error boundary per route, own confirm dialog (`useConfirm`),
print CSS, responsive layout below 900 px (sidebar becomes a wrapped row at the top).

## 6. Progress (persisted data)

Defined in `shared/progress.ts`, **`PROGRESS_VERSION = 4`**.

```ts
type Progress = {
  version: 4;
  revision: number;                        // bumped on every save; stale tab → 409 (v2)
  attempts: Attempt[];                     // task attempts (taskId, points, max, date, answer)
  exams: ExamRun[]; activeExam?: ExamRun;
  cards: Record<string, CardState>;        // Leitner box + due, keyed by flashcard id
  journal: Record<string, JournalEntry>;   // error journal (stage, due, resolvedAt)
  lernziele: Record<string, boolean>;
  cardReviewDays: Record<string, number>;  // YYYY-MM-DD → count, for the streak (v3)
  sql: Record<string, SqlState>;           // attempts, solvedAt, hintsUsed, solutionShown, lastQuery, stage, due (v4)
  sqlDays: Record<string, number>;         // for the streak (v4)
};
```

**Safety rules (all implemented, keep them):**
- `checkProgressPut` validates with zod, rejects a strong drop in `attempts` unless `reset: true` (reset button, backup restore),
  and rejects a stale `revision` with 409. Same rules on the server and in `staticApi.ts`.
- `migrateProgress(raw)` runs versioned `MIGRATIONS` (1→2 revision, 2→3 cardReviewDays, 3→4 sql/sqlDays) and fills missing fields.
  **Every schema change:** bump `PROGRESS_VERSION`, add a migration step, extend `tests/progress.test.ts` (fixtures in `tests/fixtures/`).
- Local app: atomic writes with retry, daily backup `data/backups/fortschritt-YYYY-MM-DD.json` (last 14 kept), broken file → `*.defekt-<ts>`.
- Pages: `localStorage` key `ap2-fortschritt`; an unreadable value is moved to `ap2-fortschritt-defekt`. No automatic backups yet.
- Saving is debounced (`SAVE_DELAY_MS`), flushed on `pagehide`; state updates are pure, persisting happens outside the updater.
- Multiple tabs: after a 409 the tab stops saving and shows a reload banner. On Pages the `storage` event marks other tabs as stale.

## 7. SQL editor

**Decisions**
- Engine **sql.js** (SQLite/WASM, ~1 MB), in a **Web Worker** with a 3 s timeout (worker is killed and restarted), lazy-loaded
  with the SQL routes. WASM imported via `?url`, so it works with `base: './'` on Pages.
- Editor **CodeMirror 6** + `@codemirror/lang-sql`, autocomplete of the dataset's tables/columns, Tab accepts completion.
- Shortcuts: `Strg+Enter` run, `Strg+Shift+Enter` check.

**Free mode** (`/sql`): dataset selector, schema browser (row counts, PK/FK markers, click inserts the column), reset DB, examples,
multiple statements (last SELECT shown, DML row counts), max 500 displayed rows, query history (last 30, localStorage) and draft protection.
`NULL` shown greyed and italic; numbers right-aligned.

**Exercises**: list with filters in the URL and progress bar; single exercise with "▶ Ausprobieren" (doesn't count), "✓ Prüfen" (counts),
graded hints, "Lösung zeigen" (after confirmation; then counts as "mit Lösung", comes back for repetition), side-by-side comparison, diff view.

**Checking** (`src/sql/checker.ts`, pure): user query and model solution each run on a **fresh** DB; DML/DDL are checked through
`pruefabfrage`. Compares column count, optional required column names, values (numeric tolerance, `NULL` ≠ `''` ≠ `0`, text exact),
order (`streng`, or `auto` = strict if the solution has a top-level ORDER BY). If the dataset has a `variante`, the query must also match
on the changed data (anti-hardcoding). Feedback like "2 Zeilen fehlen, 1 Zeile zu viel" without giving the solution away.

**German error hints** (`errors.ts`, table-driven): unknown table/column with closest match, ambiguous column, aggregate in WHERE,
syntax error, MySQL date functions → `strftime`, constraint violations. `PRAGMA foreign_keys = ON` in every setup.

**Dialect warnings** (`lint.ts`, token-based): bare column not in GROUP BY, alias in WHERE, `"text"` as a string (these block "gelöst"),
integer division, LIKE case sensitivity, loose DECIMAL/DATE types (info).

**Progress**: `SqlState` per exercise; wrong or "Lösung gezeigt" → due in 1 day, then stages 3 and 7 days (`JOURNAL_INTERVALS`).
SQL exercises are deliberately **not** in `attempts`/`journal`. Checked exercises count for the streak (`sqlDays`).

**Integration**: ```` ```sql ```` blocks in the Lernen pages/solutions get "🧮 Im SQL-Editor öffnen" (dataset derived from the source);
hidden in task texts and exams (`source={false}`), so the editor doesn't reveal results.

## 8. AI (local app only)

- `ANTHROPIC_API_KEY` (and optional `ANTHROPIC_MODEL`, default `claude-sonnet-5`) in `lern-app/.env.local`. The key stays in Node.
- `POST /api/ai/generate` (topicId, count 1–10, types) → tasks with `generated: true`, stored in `data/generierte-aufgaben.json`, deletable.
- `POST /api/ai/grade` (taskId, answer) → `{ points, feedback, missing }`.
- Pages: every AI call rejects with 501 "Nur in der lokalen App verfügbar".

## 9. Quality gates

```bash
npm test            # Vitest: parser (fixtures), smoke test on real content/, progress migration, stats, SQL checker/lint/errors/runner
npm run typecheck   # tsc -b
npm run lint        # ESLint flat config, typescript-eslint, react-hooks, --max-warnings=0
npm run format:check
npm run build && npm run build:pages
```

- Tests don't depend on the live `AP-2/` sheets except one broad smoke test on `content/`.
- The SQL content smoke test runs every setup and solution in Node (sql.js), checks unique IDs, dataset integrity against the DD1 tables
  and that no model solution triggers its own dialect warnings.
- One commit per logical change; formatting-only changes in their own commit.

## 10. Rules for future changes (for AI agents)

1. **Never lose progress.** Schema change ⇒ migration + test with the old fixtures. Old backups must still import.
2. **Never break Pages.** Check `npm run build:pages` + `npx vite preview --mode pages` for anything touching loading, paths, WASM or storage.
3. **Multi-user on Pages:** no personal data, dates or names in code or UI; per-user settings go into progress (so they are in the backup)
   or `localStorage`; no server, no tracking.
4. Keep content read-only in the app; content changes go through `AP-2/` + `npm run sync-content`.
5. Pure logic in `shared/` or `src/lib/` with tests; pages mostly render.
6. German UI, existing tone and style (2 spaces, single quotes, printWidth ~140, trailing commas).
