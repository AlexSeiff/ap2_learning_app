# AP2 Lern-App – Technical Documentation

> Merges the earlier working documents `IMPROVEMENTS_PROMPT.md` (refactoring/safety plan, P0–P3) and `SQL_EDITOR_PLAN.md`
> (SQL editor, phases 1–4) and the original build prompt (`../Prompt_Lern_App.md`). Everything in them has been implemented;
> this file describes **the app as it is** (state: ROADMAP phases 0–3, 4.1–4.3 and 5.1–5.7 done, October 2026).
> Planned changes are in [`ROADMAP.md`](ROADMAP.md). How to install and start the app is in `README.md` (German).

---

## 1. Purpose

A learning app for the IHK exam **Abschlussprüfung Teil 2 – Fachinformatiker/-in Daten- und Prozessanalyse (FIDPA)**.
It turns German Markdown learning sheets ("Deep Dives") and a flashcard JSON into interactive exercises: theory, flashcards,
timed practice exams with **separate solution sheets**, single tasks, an error journal with spaced repetition, a browser SQL editor
with auto-checked exercises, auto-checked calculation exercises (Rechenübungen) with new numbers on demand, and optional AI-generated tasks.

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
| Progress | `data/fortschritt.json` + daily backups | like dev | `localStorage` of the browser + daily backups in IndexedDB |
| AI (`.env.local`) | yes | yes | never read, the key can't end up in the build |

- `src/lib/api.ts` picks the data source by `import.meta.env.MODE` (`pages` → static API).
- Public URL: **https://alexseiff.github.io/ap2_learning_app/** (HashRouter, `base: './'`).
- Every push to `main` runs `.github/workflows/pages.yml`: `npm ci` → `npm test` → `npm run lint` → `npm run build:pages` → deploy.
- The Pages version is **used by several people**. Each browser has its own progress; there is no shared state and no account.
- Uncommitted work in progress (not on GitHub): an Electron desktop build (`electron/`, `vite.electron.config.ts`, `src/lib/desktopApi.ts`,
  `npm run build:desktop`, `npm run dist:win`). See ROADMAP step 0.

## 3. Architecture

Stack: React 19, Vite 8, TypeScript 7 (`@typescript/native` for `tsc`; TypeScript 6 under the name `typescript` for typescript-eslint),
Vitest 5, React Router 7 (HashRouter), react-markdown + remark-gfm, remark-math + rehype-katex + KaTeX (formulas, lazy chunk), zod 4,
sql.js (SQLite/WASM), CodeMirror 6, `@anthropic-ai/sdk`.

```
lern-app/
├─ shared/            used by client, server and tests (no file-system access)
│  ├─ config.ts         constants: EXAM_MINUTES, NEW_PER_SESSION, JOURNAL_INTERVALS, CARD_INTERVALS, SAVE_DELAY_MS, DEV_PORT
│  ├─ types.ts          content model (Topic, Task, Flashcard, Deck, Exam, SqlDataset, SqlExercise, Content …)
│  ├─ parser.ts         Markdown sheet + solution parser (pure, line/regex based)
│  ├─ prueferfragen.ts  Prüferfrage blocks: read, split and strip (pure)
│  ├─ lernkarten.ts     flashcard JSON import (zod, ImportIssues)
│  ├─ sqlUebungen.ts    SQL exercise JSON import (zod, ImportIssues)
│  ├─ rechenUebungen.ts Rechenübungen JSON import (zod, ImportIssues); the template check is injected (BuildOptions.pruefeRechenUebung)
│  ├─ progress.ts       persisted progress: types, zod schema, checkProgressPut, migrateProgress
│  ├─ mergeProgress.ts  merge a backup into the current progress (Daten & Import → Zusammenführen)
│  ├─ rechenweg.ts      RechenSchritt type + German number formatting for worked solutions (Rechenweg)
│  └─ api.ts            API contract: request schemas + response types per route
├─ server/            runs only inside Vite (dev/preview)
│  ├─ apiPlugin.ts      route table + middleware for /api/*
│  ├─ router.ts         tiny router (method, path/regex, handler)
│  ├─ store.ts          JSON files in data/, atomic write (temp + rename, retry for OneDrive EPERM/EBUSY), daily backups
│  ├─ contentCache.ts   cached loadContent(), cleared by the file watcher
│  ├─ loadContent.ts    reads AP-2/*.md, *Lernkarten*.json, *SQL_Uebungen*.json, *Rechen_Uebungen*.json → buildContent()
│  │                    (Rechenübungen are checked against their template here → ImportIssues; content.json for Pages is built the same way)
│  ├─ ai.ts             Claude: generateTasks(), gradeAnswer() with structured output
│  ├─ pagesPlugin.ts    emits content.json for the Pages build
│  ├─ report.ts         npm run import-report
│  └─ syncContent.ts    npm run sync-content (AP-2 → content/)
├─ content/           copy of sheets + JSON for Pages and tests (committed, therefore public)
├─ src/
│  ├─ pages/            one file per page, mostly rendering
│  ├─ hooks/            useExamRun, useCardSession (+ useCardFilters), useSqlSession, useRechenUebung, useConfirm, useBackupDownload
│  ├─ components/       AnswerInput, Markdown (+ MathMarkdown, markdownComponents), TheoryMarkdown, Rechenweg, TaskParts, ErrorBoundary,
│  │                    ConfirmDialog, SqlEditor, ResultTable, SchemaBrowser, SqlTabs
│  ├─ lib/              pure logic (progress, grading, stats, cards, shuffle, examTimer, sheets, sql, sqlLinks, loesungStil, mathDollar,
│  │                    rechnen (RechenState updates/selectors), wiederholung (repetition stages, SQL + Rechnen), uebungLabels)
│  │                    + store.tsx (React context), progressSaver.ts, api.ts, staticApi.ts, apiError.ts,
│  │                    backup.ts, browserBackups.ts (IndexedDB), backupReminder.ts, persistentStorage.ts
│  ├─ rechnen/          Rechenübungen (pure, no React): typen.ts, zufall.ts (seeded PRNG), hilfen.ts (statistics helpers, LoesungsBau,
│  │                    vorlage()), vorlagen/*.ts (28 templates, index.ts = registry), instanz.ts (baueInstanz), pruefen.ts (import check),
│  │                    checker.ts (input checking + Fehlerbilder)
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
  They also remain inside the section Markdown, so they show up in the Lernen view. `shared/prueferfragen.ts` reads the block
  (`readPrueferfrage`, used by the parser) and splits/strips it for the Lernen view (`splitPrueferfragen`, `stripPrueferfragen`).
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

### 4.4 Rechenübungen `AP2_Rechen_Uebungen.json`

Calculation exercises with automatic checking. Most use a **template** (`vorlage`, code in `src/rechnen/vorlagen/`) that computes
the results, the worked solution (Rechenweg) and typical wrong values (Fehlerbilder) from the exercise's `daten`, and can generate
new numbers ("🎲 Neue Zahlen"). Exercises without a template give their solutions directly.

```jsonc
{
  "meta": { "version": "1.0", "hinweise": ["…"] },
  "uebungen": [ {
    "id": "RE-ST1-001",              // stable, unique, pattern RE-<AREA>-<NNN>; progress is keyed by it – never change
    "thema": "Deep Dive 3",          // "Deep Dive N" → topicId (filter "Thema"); WiSo = "Deep Dive 14" etc.
    "titel": "Mittelwert, Median und Modus",
    "schwierigkeit": 1,              // 1 Basis · 2 Standard · 3 Transfer
    "tags": ["lagemaße", "median"],  // lower case, German; reuse existing tags (list filter)
    "vorlage": "lagemasse",          // template id (table below); omit for a fixed exercise
    "daten": { "werte": [60, 40, 220, 45, 35, 90, 55, 40, 70, 50, 65], "einheit": "min" },  // shape depends on the template
    "params": { "n": 9 },            // optional: generator parameters for "Neue Zahlen" (per template, see table)
    "neueZahlen": true,              // optional, default: true with a template, always false without
    "aufgabe": "Bearbeitungsdauer von {{n}} Reparaturaufträgen (in Minuten): {{werte}}.\n\nBerechne …",  // Markdown + {{placeholders}}
    "eingaben": ["mittel", "median", { "id": "modus", "label": "Modus (häufigster Wert)" }],
    "hinweise": ["Sortiere die Werte zuerst.", "n = {{n}} …"],   // graded hints, placeholders allowed; empty → template hints
    "erklaerung": "optional, Markdown with $…$ formulas, shown with the solution",
    "quelleAufgabe": "DD3 Übungsklausur C1"                       // "DDn Übungsklausur X1", "X1/X3" or "X1–X3"
  } ]
}
```

**Rules**
- `daten` given → these numbers are the "Originalzahlen". `daten` omitted → numbers are generated from a seed derived from the id (stable).
  With "Neue Zahlen", `erzeuge(seed, params, daten)` creates new data **in the shape of `daten`** (same number of values, same names,
  same network structure, same options like costs or church tax). So a fixed exercise from a sheet automatically gets sensible variants.
- `eingaben`: which results are asked, in this order. A string is a result id of the template; an object can override
  `label`, `einheit`, `runden` (0–6 decimals; tolerance = half a unit of the last digit) and `toleranz` (absolute). Empty/omitted →
  every non-`zusatz` result of the template (column "asked by default" below). `zusatz` results (marked *) are only asked when listed.
  Results without `runden` are compared exactly (counts, integers, money already in cents).
- Text results (`vergleich: text`) accept a distinctive part ("Süd" for "Filiale Süd", "B" for "Anbieter B", ja/nein variants);
  sets (`menge`, critical path) ignore order and separators; lists (`liste`, outliers) are entered as `19; 220` or `keine`.
- Placeholders `{{name}}` in `aufgabe` and `hinweise` are replaced with the template's values in German number format
  (column "Placeholders"). An unknown placeholder is an import error. Without a template, placeholders are not allowed.
- **Without template**: every entry in `eingaben` is an object with `loesung` (number, text or number list) and normally `einheit`/`runden`;
  `neueZahlen` is always false and `hinweise` should not be empty. Example: `RE-WI-006` (JArbSchG).
- Import check (`src/rechnen/pruefen.ts`, ImportIssue on *Daten & Import* and in `npm run import-report`, exercise skipped): unknown template,
  `daten` not matching the template's zod schema, unknown result id in `eingaben`, non-finite result, unknown placeholder – with the fixed
  data and, if "Neue Zahlen" is offered, with five seeds. `tests/rechenInhalte.smoke.test.ts` additionally tries 100 seeds per exercise and checks
  that every fixed exercise with `quelleAufgabe` reproduces the numbers of that task's model solution in `content/`.
- Units: `daten.einheit` (where the template has it) sets the unit of all results of a value list; `%`, `€`, `h`, `Tage`, `GB` are set by the template.
- Quartiles follow the **sheet convention** (DD3 4.2): position = n · p; not an integer → round up and take that value; integer → mean of
  that and the next value. Variance: `art` decides ÷ n (`grundgesamtheit`) or ÷ (n − 1) (`stichprobe`) – the exercise text must say which.

**Templates** (id → `daten` shape, results; `*` = `zusatz`, only when listed; params for "Neue Zahlen"; placeholders).
Ids with a running number (`rel1`, `FAZ_A`, `teil1_2`) follow the data order given in brackets.

| Template id | `daten` | Results (asked by default unless `*`) | `params` | Placeholders |
|---|---|---|---|---|
| **Statistik I** (DD3) | | | | |
| `lagemasse` | `{ werte: number[3–40], einheit? }` | `mittel` (r2), `median` (r2), `modus` (number, or list if several), `spannweite`, `summe*`, `minimum*`, `maximum*` | `n`, `min`, `max`, `schritt`, `ausreisser` (bool) | `werte`, `werteSortiert`, `n` |
| `gewichtetes-mittel` | `{ gruppen: [{ anzahl, wert }] (2–10), einheit? }` | `mittel` (r2), `summeGewichte*`, `summeProdukte*` | `gruppen` (count) | `gruppen`, `anzahlN`, `wertN` (N = 1…), `gesamt` |
| `quartile` | like `lagemasse` | `q1`, `q3`, `iqr`, `zaunUnten`, `zaunOben` (r2), `ausreisser` (list), `median*`, `whiskerUnten*`, `whiskerOben*` | like `lagemasse` | like `lagemasse` |
| `varianz` | `{ werte: number[2–30], art: "grundgesamtheit"\|"stichprobe", einheit? }` | `varianz`, `stdabw` (r2), `mittel*`, `saq*` (unit²) | `n`, `min`, `max`, `art` | `werte`, `werteSortiert`, `n`, `art` (σ²/s²), `artLang` |
| `variationskoeffizient` | `{ gruppen: [{ name, mittel, stdabw }] (1–6), einheit? }` | `vkN` (% r2, N = group), `gleichmaessiger` (text, only with ≥ 2 groups) | `gruppen` | `nameN`, `mittelN`, `stdabwN` |
| `haeufigkeiten` | `{ kategorien: [{ name, h (int) }] (2–12), schwelle? (default 80) }` | `relN`, `kumN` (% r1; N = rank after sorting **descending**), `anzahlSchwelle` (categories until `schwelle` %), `n*`, `modus*` (text) | `kategorien`, `n` | `n`, `kategorien`, `schwelle` |
| **Statistik II** (DD4) | | | | |
| `korrelation` | `{ x: number[3–20], y: number[3–20], xName?, yName?, einheitY? }` | `xMittel`, `yMittel`, `sxy`, `sxx`, `syy`, `r` (r2), `r2*` | `n` (only without `daten`) | `x`, `y`, `n` |
| `regression` | like `korrelation` + `prognose?: number[≤5]` (x values) | `b`, `a` (r2), `prognoseN` (r2, one per `prognose` x), `xMittel*` … `syy*`, `yDachN*`, `residuumN*` (N = data point), `r*`, `r2*` | `n` | `x`, `y`, `n`, `prognoseXN` |
| `gleitender-durchschnitt` | `{ werte: number[3–40], k: 2–12 (default 3), anzahl?, einheit? }` | `gd1` … `gdM` (r2; M = `anzahl` or n − k + 1) | `n`, `k` | `werte`, `k`, `n`, `anzahl` |
| `prozent-veraenderung` | `{ alt ≠ 0, neu, einheit? }` (`einheit: "%"` → difference in Prozentpunkte) | `differenz`, `prozent` (% r2), `faktor*` (r4) | `art: "quote"` (small values) | `alt`, `neu` |
| **Modellgüte / CRISP-DM** (DD6, DD7) | | | | |
| `konfusionsmatrix` | `{ tp, fp, fn, tn (int), kostenFN?, kostenFP?, positiv? (class name) }` | `accuracy`, `precision`, `recall`, `f1`, `spezifitaet` (% r2), `trivialAccuracy*`, `trivialRecall*`, `n*`; with both costs: `kostenModell`, `kostenTrivial` (€), `ersparnis*` | `positive`, `negative`, `kosten` (bool) | `tp`, `fp`, `fn`, `tn`, `n`, `positive`, `kostenFN`, `kostenFP`, `positiv` |
| `regressionsguete` | `{ y: number[2–30], yDach: number[same length], einheit? }` | `mae`, `rmse` (r2), `mse*`, `summeBetraege*`, `summeQuadrate*`, `r2*` | `n` | `y`, `yDach`, `n` |
| `assoziation` | `{ transaktionen: string[][] (2–40), wenn: string[], dann: string[] }` | `support`, `konfidenz` (% r2), `lift` (r2), `support_<Artikel>*` (%, non-letters → `_`), `supportWenn*`, `supportDann*`, `anzahlGemeinsam*` | `n` | `wenn`, `dann`, `n`, `regel` |
| `kmeans` | `{ punkte: [x, y][2–20], zentren: [x, y][2–5] }` | `abstandI_J` (r2, point I to centre J), `clusterI` (number of the centre), `zentrumJx`, `zentrumJy` (r2) | `n` | `punkte`, `zentren`, `k` |
| **Prozessanalyse / Wirtschaftlichkeit** (DD5, DD12) | | | | |
| `durchlaufzeit` | `{ schritte: [{ name, bearbeitung, liege }] (1–15), einheit? (default "h") }` | `bearbeitung`, `liegezeit`, `durchlaufzeit` (r2), `wertschoepfung` (% r2) | `schritte` (count) | `einheit` |
| `fehlerquote` | `{ gesamt (int), fehler (int ≤ gesamt), nacharbeitJe? (h), kostensatz? (€/h) }` | `fehlerquote`, `fpy` (% r2); with both optional fields: `nacharbeitskosten`, `zuschlag` (€ r2), `nacharbeitZeit*` | `gesamt`, `kosten` (bool) | `gesamt`, `fehler`, `nacharbeitJe`, `kostensatz` |
| `amortisation` | `{ investition, einsparung? \| (auftraege + minutenJeAuftrag + kostensatz), nutzungsdauer? }` | `amortisation` (Jahre r2), `amortisationMonate*`; from orders: `stunden`, `einsparung` (else `einsparung*`); with `nutzungsdauer`: `roi` (% r2), `gesamtersparnis*`, `gewinn*`, `roiJahr*` | `auftraege` (bool) | `investition`, `einsparung`, `auftraege`, `minutenJeAuftrag`, `kostensatz`, `nutzungsdauer` |
| `break-even` | `{ fixkosten, preis > variabel, variabel, menge? }` | `db` (€ r2), `breakEven` (Stück, rounded **up**), with `menge`: `gewinn` (€) | – | `fixkosten`, `preis`, `variabel`, `menge` |
| **Datenqualität** (DD9) | | | | |
| `qualitaetsgrad` | `{ kennzahlen: [{ id, name, gut (int), gesamt (int) }] (1–10) }` | one result per kennzahl `id` (% r2) | – | `gesamt`, `name_<id>`, `gut_<id>`, `gesamt_<id>`, `schlecht_<id>` |
| **Projektmanagement** (DD12) | | | | |
| `netzplan` | `{ vorgaenge: [{ id (1–4 chars), name?, dauer, vorgaenger: id[] }] (2–15), einheit? (default "Tage") }`, start = 0 | `FAZ_<id>`, `FEZ_<id>`, `SAZ_<id>`, `SEZ_<id>`, `GP_<id>`, `FP_<id>`, `projektdauer`, `kritischerPfad` (menge) – entered as a table | `dauerMin`, `dauerMax` | `vorgaenge`, `einheit` |
| `nutzwert` | `{ kriterien: [{ name, gewicht }] (2–10, sum 100), alternativen: [{ name, punkte: number[per criterion] }] (2–5) }` | `teilA_K` (r2, alternative A, criterion K), `nutzwertA` (r2), `beste` (text) | – | `kriterien`, `alternativen` |
| `risiko` | `{ risiken: [{ name, w, s }] (1–10) }` | `rpzN`, `hoechstes*` (text) | – | `risiken` |
| `pert` | `{ vorgaenge: [{ name, o, m, p }] (1–8, o ≤ m ≤ p), einheit? (default "Tage") }` | `teN` (r2, (o + 4m + p) / 6), with ≥ 2 packages `summe` (r2) | `vorgaenge` (count) | `nameN`, `oN`, `mN`, `pN`, `anzahl`, `einheit` |
| **WiSo** (DD14) | | | | |
| `sozialversicherung` | `{ brutto, zusatzbeitrag, kinderlos, azubi?, lohnsteuer?, kirchensteuersatz?, soli?, saetze? }` (rates of the sheet in `SAETZE`: KV 14,6 %, PV 3,6 % + 0,6 % kinderlos, RV 18,6 %, ALV 2,6 %, Geringverdiener 325 €; `saetze` overrides) | `kv`, `pv`, `rv`, `alv`, `sv` (€ r2, each rounded to cents), `svSatz*`; with `lohnsteuer`: `kirchensteuer`, `netto` | `brutto` | `brutto`, `zusatzbeitrag`, `kinderlos`, `lohnsteuer`, `kirchensteuersatz` |
| `minijob` | `{ grenze, stundenlohn }` | `stunden` (rounded down), `verdienst*` (€) | – | `grenze`, `stundenlohn` |
| `gleichgewicht` | `{ zeilen: [{ preis, nachfrage, angebot }] (2–12), one row with nachfrage = angebot }` | `preis` (€), `menge*` | `zeilen` | `tabelle` |
| **Datensicherung** (DD10) | | | | |
| `datensicherung` | `{ voll, aenderung (per day), tage (1–30), einheit? (default "GB") }` | `volumenInkrementell`, `volumenDifferenziell`, `medienInkrementell`, `medienDifferenziell` | – | `voll`, `aenderung`, `tage`, `einheit` |
| `rpo` | `{ sicherungUm (0–24, 22.5 = 22:30), ausfallUm (next day if earlier), rpo? (h) }` | `verlust` (h r2), with `rpo`: `eingehalten` (ja/nein) | – | `sicherungUm`, `ausfallUm`, `rpo` |

`(r2)` = rounded to 2 decimals by default; every result has a default label and unit, which `eingaben` can override.
The exact ids for given data are easiest to see in the solution table of the exercise page or with
`VORLAGEN[id].loese(VORLAGEN[id].schema.parse(daten)).felder` (e.g. in a Vitest test). Look at `content/AP2_Rechen_Uebungen.json`
for worked examples. **Content today: 85 exercises** – 57 fixed (53 with a template, 4 without: JArbSchG/BUrlG/Reallohn) and 28 generated
(no `daten`, one per template). Fixed exercises cover every calculation task of the sheets: the Übungsklausur tasks (`quelleAufgabe`
"DDn Übungsklausur X1") and the calculation examples in the theory parts (`quelleAufgabe` "DDn Teil 4.3" etc. – the smoke test then
looks for the numbers in the theory sections of that sheet). Per sheet: DD3 17, DD4 12, DD5 8, DD6 7, DD7 7, DD9 3, DD10 4, DD11 1, DD12 13,
DD13 3, DD14 10. IDs: `RE-ST1`/`ST2` (DD3/DD4), `MG` (DD7), `ML` (DD6), `PA` (DD5), `DQ` (DD9), `VI` (DD11), `PM` (DD12), `WI` (DD13/DD14),
`IT` (DD10); the file is sorted in this order. Not included (no arithmetic or no number to check): pure lookups in DD13 (Pausen B1/B5,
Betriebsrat D1, Günstigkeitsprinzip E3), Kündigungstermine (dates), DD11 algorithm/pseudocode tasks.

**New template**: file in `src/rechnen/vorlagen/`, defined with `vorlage({ id, titel, bereich, beschreibung, schema, erzeuge, loese, platzhalter,
tabelle?, hinweise })`; `loese` uses `LoesungsBau` (`wert`, `schritt`, `fehler`, `fertig(layout?)`). Register it in `vorlagen/index.ts`,
add it to the table above, add a sheet example to `tests/rechenVorlagen.test.ts`; the property tests (`tests/rechenEigenschaften.test.ts`)
pick it up automatically.

### 4.5 Updating content for Pages

Edit files in `AP-2/`, then `npm run sync-content` (copies to `content/`), commit, push. The Pages build reads `content/` only.
AI-generated tasks (`data/`) never go into the Pages build.

## 5. Features (pages and routes)

| Route | Page | What it does |
|---|---|---|
| `/` | Dashboard | Pages: backup reminder banner (see § 6). **First visit** (API returns no stored progress, `store.firstVisit`): welcome screen (`components/Welcome.tsx`: what the app is, progress stays in this browser → download backups, optional exam date; "Los geht's" / "Sicherung einspielen"), gone after the first change. Otherwise: countdown to the user's `settings.examDate` (without one: KPI "Prüfungstermin eintragen →"), study streak, due journal items/cards, SQL KPI, Rechenübungen KPI ("x/y gelöst", due repetitions), average exam score + IHK grade, progress and exam trend per topic, weakest topics |
| `/lernen`, `/lernen/:topicId` | Themen / Thema | theory with table of contents, Prüferfragen as a box "❓ Prüferfrage – erst selbst überlegen" with the answer behind "👁 Antwort zeigen" (`TheoryMarkdown`), ticking off learning goals |
| `/karteikarten` | Karteikarten | filters (Deep Dive, deck, kind, typ, difficulty; kept in the URL), quick switches for Prüferfragen/Fachgespräch (same settings), Leitner boxes (`CARD_INTERVALS`), max `NEW_PER_SESSION` new cards per round, "⚠️ Fallen wiederholen", keyboard: Space flip, 1/2/3 rate |
| `/klausur`, `/klausur/:topicId` | Übungsklausur | 90-min timer (`aria-live` announcements), attachments, solutions locked until submission, self-assessment with criteria checkboxes, IHK grade, auto-submit on timeout, resumable (`activeExam`) |
| `/aufgaben`, `/aufgabe/:taskId` | Einzelaufgaben | filter by topic/block/difficulty/status/search; export a selection as task sheet/solution sheet |
| `/druck` | Druck | print view (task sheet or solution sheet, same numbering) → "Als PDF speichern"; also Markdown download |
| `/sql`, `/sql/uebungen`, `/sql/uebung/:id` | SQL-Editor | free mode + exercises (see § 7) |
| `/rechnen`, `/rechnen/:id` | Rechenübungen | list with filters in the URL (Thema, Schwierigkeit, Tag, Status), progress bar, "Nächste offene"; exercise page (see below) |
| `/fehlerjournal` | Fehlerjournal | every task below full points comes back after 1, 3, 7 days (`JOURNAL_INTERVALS`) |
| `/generator` | KI-Aufgaben | Claude generates IHK-style tasks (mc, lueckentext, zuordnung, rechnen, offen) with model solution; local app only |
| `/material`, `/material/:docId` | Material | cheat sheet, topic list |
| `/einstellungen` | Einstellungen | per-user settings (`Progress.settings`, see § 6): own exam date; switches "❓ Prüferfragen einbeziehen" / "🎤 Fachgespräch-Fragen einbeziehen"; Datenschutz-Hinweis (`components/Datenschutz.tsx`: no account, no tracking, no cookies, data stays in the browser, only app + content loaded from GitHub Pages; no license claimed – the owner decides) |
| `/daten` | Daten & Import | import report, re-import (local), backup download, backup import as **🔀 Zusammenführen** (merge) or **⬆ Einspielen (ersetzen)** (replace), reset; local: newest daily backup in `data/backups/`; Pages: "Speicher dauerhaft: ja/nein" and the list of browser daily backups with "↩ Wiederherstellen" |

**Not affected by the Prüferfragen switch:** the *Prüferkommentar* in solutions (the scoring scheme; `Solution.kommentar`) is always shown
(owner decision Q1; tested in `tests/prueferfragen.test.ts`).

**Grading**
- Automatic: MC, Lückentext, Zuordnung, numeric (`rechnen`, with tolerance). These types currently only exist for AI-generated tasks.
- Sheet tasks are `offen`: self-assessment against the model solution; a points table becomes checkable criteria.
- Optional AI grading (local app): points suggestion + feedback + missing aspects; the user can adjust.
- IHK scale: 100–92 = 1 · 91–81 = 2 · 80–67 = 3 · 66–50 = 4 · 49–30 = 5 · 29–0 = 6.

**Prüferfragen / Fachgespräch switched off** (`settings.prueferfragen` / `settings.fachgespraech`): `cardPool()` (`src/lib/cards.ts`) drops that
`kind` everywhere cards are counted or learned – Karteikarten (pool, kind filter options, due/new counts, sessions, traps, deck table),
Dashboard due count, topic stats (`topicStats`), the card button on Thema. A disabled `?art=` in the URL counts as "alle". `CardState` is kept,
so turning it back on restores everything. In Lernen, `TheoryMarkdown` removes the `> ❓ **Prüferfrage:** …` blockquotes and the lead text
drops the mention.

### Markdown, formulas and solution styling (phase 4.1–4.3)

- **`<Markdown>`** (react-markdown + GFM) is used everywhere. **`<Markdown math>`** additionally renders `$…$` / `$$…$$` with KaTeX
  (remark-math + rehype-katex). That variant (`components/MathMarkdown.tsx`) is a **lazy chunk** with the KaTeX CSS and fonts
  (bundled by Vite into `assets/` with relative URLs → works offline and on Pages); until it has loaded, the plain variant is shown.
  Used in: Lernen (theory + Prüferfrage boxes), model solutions (`GradePanel`), the solution sheet on `/druck` and Material.
  **Not** in task texts, exams, attachments and flashcards. KaTeX inherits the text colour (light/dark/print); long display formulas scroll.
- **`$` safety** (`src/lib/mathDollar.ts`, `escapeStrayDollars`, tested): before the math variant parses, every `$` that can't delimit
  a formula by the **Pandoc rule** is escaped to `\$` – the opening `$` needs a non-space right after it, the closing `$` a non-space
  before it and no digit after it; the next `$` closes (like remark-math); a formula stays on one line; `$$`, fenced code and inline
  code are left alone. So prices like `5 $ und 3 $` stay text. The sheets and JSON contain no `$` today (test in `tests/math.test.ts`).
  Write formulas as `$x = 70$`, not `$ x $`.
- **Solution styling** (`src/lib/loesungStil.ts`, rehype plugins, tested in `tests/loesungStil.test.ts`), no content change:
  - `rehypeLoesung` (only `<Markdown loesung>`: model solution and solution sheet):
    `*(3 P)*` / `*(je 1 P)*` → points badge (`span.punkte`), floated right when it ends a line (then a line break follows, like in the sheet);
    longer point notes (`*(je 4 P: 1 P Formel, …)*`) → small muted `span.punkte-hinweis`.
    **Result box** `span.ergebnis` "Ergebnis" – conservative: bold text that is a number with a unit (`%`, `€`, `min`, `Tage`, `T€`, `(Tage²)`,
    up to three words, not `P`/`Punkte`) directly after `=`, `≈`, `→` or `⇒`, or a bold equation/label ending in `= number unit` or
    `: number unit` (`**IQR = 70 − 40 = 30 Minuten**`, `**Projektdauer: 25 Tage**`). Never inside tables, headings, links, formulas or the
    Prüferkommentar. Bold numbers without a unit (`**−5**`, `**Q1 = 40**`, `**0,98**`) stay plain bold. About 60 results are boxed in the current sheets.
    A paragraph starting with `*Prüferkommentar: …*` (also inside a blockquote, as on the solution sheet) → callout `aside.pk-box`
    "🧑‍🏫 Prüferkommentar"; `GradePanel` renders `Solution.kommentar` in the same box.
  - `rehypeTabellen` (every `<Markdown>`): columns whose body cells are all numbers (German format, optional `Σ`, `%`, `€`, `P`; empty/`–` ignored)
    get `class="num"` (right-aligned, tabular figures) unless the column has an explicit alignment; rows whose first cell starts with
    `Σ`, `Summe`, `Gesamt` or `Insgesamt` get `class="sum-row"` (bold, top rule).
- **Rechenweg** (`components/Rechenweg.tsx` + `shared/rechenweg.ts`): numbered steps, each `Formel` (KaTeX) → `Einsetzen` (KaTeX) →
  `Ergebnis` (`formatErgebnis`: `Intl.NumberFormat('de-DE')`, fixed decimals from `runden`, typographic minus, unit with a space) plus a
  rounding note (`rundungsHinweis`, only if the shown value is actually rounded). `latexZahl` formats numbers for LaTeX (`70{,}00`).
  Used on the Rechenübung page (loaded lazily when the solution is opened); it imports KaTeX, so only use it in lazy-loaded pages.

### Rechenübungen (phase 5)

- Nav item "📐 Rechenübungen" with a badge for due repetitions (`rechenSummary`). Routes are **lazy** (`pages/RechenUebungen.tsx`,
  `pages/RechenUebung.tsx`): templates and checker are in the `RechenUebung` chunk, KaTeX in the `Rechenweg` chunk, nothing in the main bundle.
- Exercise page (state in `hooks/useRechenUebung.ts`, the page only renders): task text with filled `{{placeholders}}`, data table of the template,
  notice "✏️ Rechne auf Papier, trage nur Ergebnisse ein.", one input per result with unit (templates with a `layout` – Netzplan, Häufigkeiten,
  Regression, k-Means, Nutzwert – show the asked results as an input table), **Enter** or "✓ Prüfen" checks (counts as an attempt as soon as one
  field is filled): ✓/✗ per field, explanation of a recognised Fehlerbild ("🔎 Du hast durch n geteilt …"), unit hints.
  "💡 Hinweis n/m" reveals hints one by one. "🎲 Neue Zahlen" (template exercises) draws a new seed, stored as `lastSeed`, so reopening shows the
  same numbers; "↩ Originalzahlen" goes back. "👁 Lösung zeigen" (after `useConfirm`) → table "Deine Eingabe | Richtig" + Rechenweg + `erklaerung`.
  The last checked answers are restored when the page is opened again (`RechenState.antworten`).
- Checking (`src/rechnen/checker.ts`, pure): German decimal comma or dot, thousands separators, spaces, typographic minus, optional unit
  (synonyms; a different unit only gives a hint). Tolerance from `runden` (half a unit of the last digit) or `toleranz`. Wrong values are compared
  with the template's Fehlerbilder (concrete wrong values, e.g. median of the unsorted list, ÷ n instead of ÷ (n − 1), Precision/Recall swapped,
  wrong base for a percentage change) and general ones (share instead of percent, sign, rounded too early). Fehlerbilder that are not
  distinguishable from the right value after rounding are dropped by `LoesungsBau.fehler`.

**Other**: theme toggle (system/dark/light, localStorage), error boundary per route, own confirm dialog (`useConfirm`),
print CSS, responsive layout below 900 px (sidebar becomes a wrapped row at the top).

## 6. Progress (persisted data)

Defined in `shared/progress.ts`, **`PROGRESS_VERSION = 6`**.

```ts
type Progress = {
  version: 6;
  revision: number;                        // bumped on every save; stale tab → 409 (v2)
  attempts: Attempt[];                     // task attempts (taskId, points, max, date, answer)
  exams: ExamRun[]; activeExam?: ExamRun;
  cards: Record<string, CardState>;        // Leitner box + due, keyed by flashcard id
  journal: Record<string, JournalEntry>;   // error journal (stage, due, resolvedAt)
  lernziele: Record<string, boolean>;
  cardReviewDays: Record<string, number>;  // YYYY-MM-DD → count, for the streak (v3)
  sql: Record<string, SqlState>;           // attempts, solvedAt, hintsUsed, solutionShown, lastQuery, stage, due (v4)
  sqlDays: Record<string, number>;         // for the streak (v4)
  rechnen: Record<string, RechenState>;    // Rechenübungen per exercise id (v6)
  rechnenDays: Record<string, number>;     // checked Rechenübungen per day, for the streak (v6)
  settings: Settings;                      // per-user settings, part of the backup (v5)
};

type RechenState = {
  attempts: number;              // counted "✓ Prüfen" clicks
  solvedAt?: string;             // first check with all inputs right, without having seen the solution
  lastCheckedAt?: string;
  hintsUsed: number;
  solutionShown?: boolean;
  stage?: number; due?: string;  // repetition like SQL (JOURNAL_INTERVALS 1/3/7 days, src/lib/wiederholung.ts)
  lastSeed?: number;             // seed of "🎲 Neue Zahlen"; missing = the exercise's fixed numbers
  antworten?: Record<string, string>; // last checked inputs (max 200 chars each), restored on reopen; cleared when the numbers change
};

type Settings = {
  examDate?: string;            // YYYY-MM-DD, own exam date for the countdown (unset = no countdown)
  prueferfragen: boolean;       // default true: Prüferfragen in flashcards and theory
  fachgespraech: boolean;       // default true: Fachgespräch questions as flashcards
  leichtModus: boolean;         // default false: remembered flashcard mode (phase 6)
  backupReminderDays: number;   // default 7: backup reminder after N days (Pages)
  lastBackupDownloadAt?: string; // YYYY-MM-DD of the last downloaded backup (optional, no version bump, see below)
};
```

**Safety rules (all implemented, keep them):**
- `checkProgressPut` validates with zod, rejects a strong drop in `attempts` unless `reset: true` (reset button, backup restore),
  and rejects a stale `revision` with 409. Same rules on the server and in `staticApi.ts`.
- `migrateProgress(raw)` runs versioned `MIGRATIONS` (1→2 revision, 2→3 cardReviewDays, 3→4 sql/sqlDays, 4→5 settings, 5→6 rechnen/rechnenDays) and fills missing fields.
  `migrateSettings` fills defaults, drops an invalid `examDate`/`lastBackupDownloadAt` and keeps unknown fields.
  `lastBackupDownloadAt` was added without a version bump: it is optional, `SettingsSchema` is a loose object with all fields optional
  and `migrateSettings` already kept unknown fields, so every v5 file (old or new) is valid and nothing needs converting.
  Adding a **required** field or changing a meaning still needs a version bump.
  Backup files are read with `parseBackup` (`src/lib/backup.ts`, used by Daten & Import and the welcome screen).
  **Every schema change:** bump `PROGRESS_VERSION`, add a migration step, extend `tests/progress.test.ts` (fixtures in `tests/fixtures/`, one per version).
- Settings are changed only through `withSettings` (`src/lib/settings.ts`). "Fortschritt zurücksetzen" keeps the settings. The theme stays in `localStorage` (per device).
- Local app: atomic writes with retry, daily backup `data/backups/fortschritt-YYYY-MM-DD.json` (last 14 kept), broken file → `*.defekt-<ts>`.
- Pages: `localStorage` key `ap2-fortschritt`; an unreadable value is moved to `ap2-fortschritt-defekt`.
- **Pages protection (phase 3):**
  - `navigator.storage.persist()` once per page load after the first successful save (`persistentStorage.ts`, via `createStaticApi`);
    *Daten & Import* shows "Speicher dauerhaft: ja/nein/unbekannt". Unsupported or throwing → ignored.
  - **Daily backups in IndexedDB** (`browserBackups.ts`, DB `ap2-lernapp`, store `sicherungen`, key = date): before the first save of a day
    the previously stored JSON (state at the start of the day) is copied, at most one per day, the last 7 kept (`planBackup`, pure).
    Runs fire-and-forget and serialized after the `localStorage` write, so a missing/blocked IndexedDB never delays or breaks saving.
    `staticApi.backups()` returns `{ newest, count, items }`, `readBackup(date)` the JSON; restore = `parseBackup` + `replaceProgress`.
    The local app is unchanged (`data/backups/`; its `readBackup` rejects with 501).
  - **Backup reminder** (`backupReminder.ts`, pure): Dashboard banner "Letzte Sicherung vor N Tagen – ⬇ jetzt herunterladen" when
    `lastBackupDownloadAt` is at least `backupReminderDays` old and there is a learning day (`activityDays`) after it; without any download
    it counts from the first learning day. "Später" hides it until reload. The number of days is adjustable on `/einstellungen` (Pages only).
  - Downloads go through `useBackupDownload` (all modes): file `ap2-lernapp-sicherung-YYYY-MM-DD.json` (`backupFileName`), then
    `settings.lastBackupDownloadAt = today`.
- **Merge on import** (`shared/mergeProgress.ts`, `mergeProgress(current, incoming)`, pure, `tests/mergeProgress.test.ts`), both sides migrated:
  - `attempts`: union, duplicate = same `taskId` + `date`, sorted by date (stable) → never fewer attempts than before.
  - `exams`: union by `id`; in both → the more advanced run (finished > submitted > started, then later time); sorted by finish time.
  - `activeExam`: this browser's running exam; the backup's only if none runs here; dropped if the merged history has it finished.
  - `cards`: `CardState` has no date → more `reviews` wins, then later `due`.
  - `sql`, `rechnen`: newer `lastCheckedAt` wins (then more attempts/hints); the earliest `solvedAt` of both sides is kept.
  - `journal`: entry of the side with the newer attempt for that task (from `attempts`); tie → higher `stage`, then later `due`.
  - `lernziele`: true on either side wins. `cardReviewDays` / `sqlDays` / `rechnenDays`: max per day (not the sum – shared history would count twice).
  - `settings`, `revision`, unknown fields: from the current state. Keeping the current revision (the saver sends its own base revision anyway)
    and never dropping attempts means the following normal PUT (no `reset`) passes `checkProgressPut`.
  - UI: merge uses `update()` (normal save), replace uses `replaceProgress()` (`reset: true`). The welcome screen only replaces (nothing stored yet).
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
npm test            # Vitest: parser (fixtures), smoke test on real content/, progress migration, stats, SQL checker/lint/errors/runner,
                    # Rechenübungen (templates, properties, checker, content, pages)
npm run typecheck   # tsc -b
npm run lint        # ESLint flat config, typescript-eslint, react-hooks, --max-warnings=0
npm run format:check
npm run build && npm run build:pages
```

- Tests don't depend on the live `AP-2/` sheets except one broad smoke test on `content/`.
- The SQL content smoke test runs every setup and solution in Node (sql.js), checks unique IDs, dataset integrity against the DD1 tables
  and that no model solution triggers its own dialect warnings.
- Rechenübungen: `rechenVorlagen.test.ts` (each template reproduces the sheet example), `rechenEigenschaften.test.ts` (every template over
  150 seeds: valid data, finite results, plausible ranges, Fehlerbilder ≠ right value after rounding, the checker accepts the shown right value
  and recognises every Fehlerbild), `rechenChecker.test.ts`, `rechenUebungen.test.ts` (parser), `rechnenProgress.test.ts`,
  `rechenInhalte.smoke.test.ts` (content/: no ImportIssues, 100 seeds per exercise, fixed exercises match the numbers of the sheet solutions)
  and `rechnenSeiten.test.ts` (server-side render of both pages for every exercise).
- One commit per logical change; formatting-only changes in their own commit.

## 10. Rules for future changes (for AI agents)

1. **Never lose progress.** Schema change ⇒ migration + test with the old fixtures. Old backups must still import.
2. **Never break Pages.** Check `npm run build:pages` + `npx vite preview --mode pages` for anything touching loading, paths, WASM or storage.
3. **Multi-user on Pages:** no personal data, dates or names in code or UI; per-user settings go into progress (so they are in the backup)
   or `localStorage`; no server, no tracking.
4. Keep content read-only in the app; content changes go through `AP-2/` + `npm run sync-content`.
5. Pure logic in `shared/` or `src/lib/` with tests; pages mostly render.
6. German UI, existing tone and style (2 spaces, single quotes, printWidth ~140, trailing commas).
