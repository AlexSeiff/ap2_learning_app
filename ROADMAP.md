# AP2 Lern-App – Roadmap (implementation plan)

> Hand this file to a coding agent (e.g. Claude Code) started in `lern-app/`. Read `DOKUMENTATION.md` first: it describes the current
> app, its data model and the rules (§ 10) that stay valid. Target: the **GitHub Pages version**, which is used by **several people**.
> Written against commit `06d77e7` (30.09.2026).
>
> Origin of each item: **[U]** = requested by the owner · **[C]** = proposed by Claude.

## Working rules

- Work phase by phase. Each phase ends with a green `npm test`, `typecheck`, `lint`, `format:check`, `build`, `build:pages`, plus a
  manual check with `npx vite preview --mode pages`. One commit per numbered item.
- **Progress safety:** every change to `Progress` bumps `PROGRESS_VERSION`, adds a migration step and extends `tests/progress.test.ts`.
  Existing browser data and old backup files must still load.
- **Multi-user:** nothing personal in code, UI or defaults (names, exam dates, study-plan weeks). Per-user preferences are stored per browser.
- UI text German (du, short, emoji). New content formats get a zod parser with `ImportIssue`s like `lernkarten.ts` / `sqlUebungen.ts`.
- Content files in `AP-2/` are only edited when the item says so, and then only after the owner has confirmed.

---

## Phase 0 – Housekeeping

0.1 **Electron work in progress.** The working tree has uncommitted desktop-app changes (`electron/`, `src/lib/desktopApi.ts`,
    `shared/desktop.ts`, changes in `staticApi.ts`, `store.tsx`, `App.tsx`, `Daten.tsx`, `package.json` …). Ask the owner, then either commit them
    on a branch `desktop` or commit them to `main` after checking that `build:pages` still works. Don't start phase 1 on a dirty tree.
0.2 Delete `IMPROVEMENTS_PROMPT.md` and `SQL_EDITOR_PLAN.md` if they still exist. They are merged into `DOKUMENTATION.md`.
    Link `DOKUMENTATION.md` and `ROADMAP.md` from `README.md`.

## Phase 1 – Make the app general-purpose [U] ✅ done

The app must work for any FIDPA trainee, not only the owner.

1.1 **Remove the study plan (Lernplan with dates).**
- Parser: drop `parseLernplan`, `WeekPlan`, `Content.weeks`, the `Lernplan` material mapping and the `Topic.week` extraction
  (`(KW 31)` in the title). Strip a trailing `(KW …)` from displayed topic titles.
- Dashboard: remove the "Lernplan diese Woche" card and the KW column. Themen/Thema: replace `t.week ?? 'Zusatz'` with the Deep Dive number or "Zusatz".
- `server/report.ts`: remove the weeks line. `syncContent`: stop copying `Lernplan_*.md`; delete `content/Lernplan_Juli_bis_November.md`.
- Tests: update parser/fixture tests.
- **Content cleanup (needs the owner's OK, edits `AP-2/`):** the sheets contain personal time references
  ("(KW 31)" in titles, "am Ende von KW 31", "Lernziel-Check (Ende KW 31 …)"). Propose a list of replacements
  (e.g. "am Ende des Themas") and apply after confirmation, then `npm run sync-content`.
1.2 **Exam date as a per-user setting.** Remove the hard-coded `EXAM_DATE` from `shared/config.ts`. New setting "Mein Prüfungstermin"
    (optional date). Countdown KPI only when set; otherwise a KPI "Prüfungstermin eintragen →" linking to the settings.
    The label reads "Tage bis zur Prüfung (25.11.2026)" with the user's date.
1.3 **Settings infrastructure.** New `Progress.settings` (migration **v4 → v5**), so settings are part of the backup:
    ```ts
    settings: {
      examDate?: string;            // YYYY-MM-DD
      prueferfragen: boolean;       // default true   (phase 2)
      fachgespraech: boolean;       // default true   (phase 2)
      leichtModus: boolean;         // default false  (phase 6, remembered last choice)
      backupReminderDays: number;   // default 7      (phase 3)
    }
    ```
    Theme stays in `localStorage` as today. New page **`/einstellungen` "⚙️ Einstellungen"** (nav item near the bottom). *Daten & Import* stays for backup/import.
1.4 **Welcome screen on first visit** (no progress stored yet): 3 short points: what the app is, "dein Fortschritt bleibt nur in diesem
    Browser – lade ab und zu eine Sicherung herunter", optional exam date. Buttons "Los geht's" and "Sicherung einspielen".
1.5 **Neutral wording.** Check the README, `package.json` (`author`), the `<title>`/meta description and the UI for personal references.
    Add a short **Datenschutz-Hinweis** (footer or settings): no account, no tracking, no cookies, all data stays in the browser;
    only the content is loaded from GitHub Pages. The content in `content/` is public; the owner decides the license (ask).

## Phase 2 – Turn off Prüferfragen [U] ✅ done

2.1 Settings `prueferfragen` and `fachgespraech` (phase 1.3), each with a switch on `/einstellungen` and a quick switch on the Karteikarten
    filter bar ("❓ Prüferfragen einbeziehen").
2.2 **When off:**
- Karteikarten: cards of that `kind` are excluded from the pool, the kind filter options, "fällig"/"neu" counts, session building and
  the Dashboard/Nav due counts. Keep their `CardState` (turning it back on restores everything).
- Lernen: `> ❓ **Prüferfrage:** …` blockquotes (question + answer line) are hidden in the theory view. Implement as a pure function
  `stripPrueferfragen(markdown)` in `shared/` (tested with the fixture sheet), applied in `Thema` before rendering. Also hide the
  "Prüferfragen" mention in the Themen lead text.
- Stats that count cards (topic progress) must use the same filtered pool, so percentages don't drop when the setting changes.
2.3 **Better when on [C]:** in Lernen, show Prüferfragen as a collapsible "❓ Prüferfrage – erst selbst überlegen" box with the answer
    hidden behind "Antwort zeigen" (active recall instead of reading the answer directly).
2.4 Not affected: *Prüferkommentar* in solutions (that is the scoring scheme). See open question Q1.

## Phase 3 – Protect progress on Pages [C] ✅ done

On Pages, progress exists only in one browser's `localStorage`. This is the biggest risk for every user.

3.1 `navigator.storage.persist()` once after the first save (ignore if unsupported). Show the result on *Daten & Import*
    ("Speicher dauerhaft: ja/nein"). Background: Safari/iOS deletes script-written storage after ~7 days without a visit.
3.2 **Automatic backups in IndexedDB**: at most one per day, keep the last 7 (like `data/backups/` locally). Implement `backups()` in
    `staticApi.ts`, list them on *Daten & Import* with "Wiederherstellen". Pure rotation logic with tests; IndexedDB wrapped in try/catch.
3.3 **Backup reminder**: store `lastBackupDownloadAt` (in settings or localStorage). Banner on the Dashboard after `backupReminderDays`
    with at least one learning day since: "Letzte Sicherung vor 9 Tagen – ⬇ jetzt herunterladen".
3.4 **Merge on import** (instead of only replace): "Zusammenführen" vs. "Ersetzen". Merge = union of attempts/exams (dedupe by id/date),
    per card/SQL/Rechnen state the one with the newer `lastReviewed`/`lastCheckedAt`, journal by newer stage, days maps summed per day with max().
    Pure `mergeProgress(a, b)` in `shared/progress.ts`, well tested. This lets users move between phone and PC without losing either side.
3.5 Backup file name with date and app name: `ap2-lernapp-sicherung-2026-09-30.json`.

Implementation notes: `lastBackupDownloadAt` is an optional field in `settings` (no version bump, see DOKUMENTATION § 6), so phase 5
still migrates **v5 → v6**. `CardState` has no `lastReviewed`, so the card merge uses the review count; the journal merge uses the newest
attempt per task. Details of all merge rules: DOKUMENTATION § 6.

## Phase 4 – Professional solutions for calculation tasks [U] ✅ done

Today the solution sheets write formulas as plain text ("770 / 11 = **70,00 Minuten** *(3 P)*"). Goal: look like a printed textbook solution.

4.1 **Math rendering**: add `remark-math` + `rehype-katex` (+ `katex` CSS/fonts bundled by Vite, so it works offline and on Pages).
    Load them only in the Markdown component variant used for Lernen/solutions/Rechnen (lazy chunk), so the main bundle doesn't grow much.
    Check print (`/druck`) and dark mode.
4.2 **Solution styling** in `Markdown.tsx`/CSS (no content change needed):
- `*(3 P)*` → small point badge on the right of the line.
- Final results (bold numbers with a unit) → highlighted result box "Ergebnis".
- `*Prüferkommentar: …*` → callout box "🧑‍🏫 Prüferkommentar".
- Tables: numeric columns right-aligned with tabular numbers, sum rows bold with a top rule.
4.3 **Rechenweg component** for structured solutions (used by phase 5, optionally in sheets): numbered steps, each step
    `Formel` (KaTeX) → `Einsetzen` (KaTeX with numbers) → `Ergebnis` (German number format `Intl.NumberFormat('de-DE')`, unit, rounding note).
4.4 **Content conversion (owner's OK, edits `AP-2/`):** convert the formulas in the calculation solutions to `$…$` LaTeX. Affected sheets
    (tasks with "Berechnen"): 03 Statistik I (7), 04 Statistik II (9), 05 Prozessanalyse (6), 06 CRISP-DM/ML (5), 07 Modellgüte (5),
    09 Datenqualität (4), 12 Projektmanagement (6), 11 Visualisierung/Algorithmen (2), 10 (1). Do it sheet by sheet; the parser smoke
    test must stay green. Example target:
    ```markdown
    - Arithmetisches Mittel: $\bar{x} = \frac{\sum x_i}{n} = \frac{770}{11} = \mathbf{70{,}00\ \text{min}}$ *(3 P)*
    ```
4.5 **Formelsammlung** page (`/material/formeln`), generated from the formula definitions of phase 5 (one source of truth), grouped by topic.

Implementation notes (4.1–4.3): `<Markdown math>` loads a lazy `MathMarkdown` chunk (Lernen, solutions, `/druck` solution sheet, Material).
Stray `$` are escaped by the Pandoc rule before parsing (`escapeStrayDollars`); the content has no `$` today. Solution styling is done by the
rehype plugins in `src/lib/loesungStil.ts` (result box only for bold number + unit after `=`/`→` or a bold equation ending in number + unit).
`Rechenweg` + `shared/rechenweg.ts` (`RechenSchritt`) are used by the Rechenübungen (phase 5). Details: DOKUMENTATION § 5.

Implementation notes (4.4–4.5):
- 4.4 (owner's OK given): 182 formulas as `$…$` – solutions DD3 15, DD4 22, DD5 12, DD6 9, DD7 10, DD9 5, DD10 2, DD11 1, DD12 11, DD13 1, DD14 6;
  theory DD3 21, DD4 25, DD5 4, DD6 11, DD7 9, DD9 1, DD12 14, DD13 1, DD14 2. **Deviation from the example:** the final result stays bold
  text after the formula (`$\bar{x} = \frac{770}{11}$ = **70,00 Minuten**`) instead of `\mathbf` inside it – the result box (4.2) works
  unchanged, the result stays readable without KaTeX and the numbers stay plain text. Not converted: tables, Prüferkommentare, Prüferfragen
  (flashcards render no math), task texts, text-only steps (Modus, B2 "zwei/drei"). PDFs in `AP-2/` not regenerated.
- 4.5: `src/rechnen/formeln.ts` (68 formulas: DD3 15, DD4 12, DD5 6, DD6 5, DD7 10, DD9 1, DD10 3, DD12 11, DD14 5), each with the template ids
  it practises; the templates use `F.<id>.latex` in their Rechenwege (except `gleitender-durchschnitt`, `minijob`, `rpo`, which show the
  concrete form). Page `/material/formeln` (lazy, printable), links via the new list filter `/rechnen?vorlage=a,b`.

## Phase 5 – Rechenübungen (calculation exercises like the SQL exercises) [U] ✅ done

5.1 **Content file `AP-2/AP2_Rechen_Uebungen.json`** (synced like the SQL file; `isContentFile()` matches `*Rechen_Uebungen*.json`),
    parser `shared/rechenUebungen.ts` (zod, ImportIssues), `Content.rechenUebungen`.
    ```jsonc
    {
      "meta": { "version": "1.0" },
      "uebungen": [ {
        "id": "RE-ST1-004",                 // stable, progress is keyed by it
        "thema": "Deep Dive 3",             // → topicId
        "titel": "Mittelwert, Median, Modus",
        "schwierigkeit": 1,                 // 1 Basis · 2 Standard · 3 Transfer
        "tags": ["lagemaße"],
        "vorlage": "lagemasse",             // generator template (5.2); omit for a fixed exercise
        "daten": { "werte": [35, 40, 40, 45, 50, 55, 60, 65, 70, 90, 220] },  // fixed data or generator parameters
        "aufgabe": "Berechne für die Reparaturdauern {{werte}} (Minuten) Mittelwert, Median und Modus.",
        "eingaben": [
          { "id": "mittel", "label": "Arithmetisches Mittel", "einheit": "min", "runden": 2 },
          { "id": "median", "label": "Median", "einheit": "min", "runden": 2 },
          { "id": "modus", "label": "Modus", "einheit": "min" }
        ],
        "hinweise": ["Zuerst sortieren.", "n ist ungerade → mittlerer Wert."],
        "quelleAufgabe": "DD3 Übungsklausur C1"
      } ]
    }
    ```
5.2 **Generator templates** (`src/rechnen/vorlagen/*.ts`, pure): each template has `erzeuge(seed, params)` → concrete data,
    `loese(data)` → expected values + `schritte` (for the Rechenweg, phase 4.3) + `fehlerbilder`. A seeded PRNG makes every "Neue Zahlen"
    click reproducible. Fixed exercises (`daten` given) use the same `loese()`. Templates to cover (from the sheets):
    - **Statistik I:** Mittelwert/Median/Modus, Spannweite, Quartile + IQR + 1,5-IQR outliers (**use the sheet's quartile convention**),
      Varianz/Standardabweichung (σ² ÷ n vs. s² ÷ (n−1), the exercise states which), Variationskoeffizient, relative/cumulative frequencies, Pareto.
    - **Statistik II:** Pearson r, R², linear regression (a, b, forecast, residuals), moving average, percentage change.
    - **Modellgüte / CRISP-DM:** confusion matrix → Accuracy, Precision, Recall, F1, Spezifität; error costs; trivial model; MAE, RMSE, R².
    - **Prozessanalyse:** Bearbeitungs-/Liege-/Durchlaufzeit, Wertschöpfungsanteil, Fehlerquote, First Pass Yield, Nacharbeitskosten, Amortisation.
    - **Datenqualität:** Vollständigkeits-, Eindeutigkeits-, Gültigkeitsgrad.
    - **Projektmanagement:** Netzplan FAZ/FEZ/SAZ/SEZ, Gesamt-/freier Puffer, kritischer Pfad (table input), Amortisation, ROI, Break-even.
    - Check WiSo I/II and DD15 for further calculations (e.g. Zinsen, Kalkulation, Speicherbedarf) and add them if present.
5.3 **Checking**: every input separately; accept German decimal comma and dot, spaces, optional unit; tolerance derived from `runden`
    (half a unit of the last digit) or explicit `toleranz`. **Fehlerbilder**: typical wrong values are recognised and explained,
    e.g. median without sorting, ÷ n instead of ÷ (n−1), Precision/Recall swapped, percentage change relative to the wrong base.
    ("Du hast durch n geteilt – bei einer Stichprobe teilt man durch n − 1.")
5.4 **UI** (lazy routes `/rechnen`, `/rechnen/:id`, nav "📐 Rechenübungen" with due badge): list with filters in the URL (topic, difficulty,
    tag, status) and progress bar, like `SqlUebungen`. Exercise page: task, data table, inputs, "✓ Prüfen", graded hints,
    "🎲 Neue Zahlen" (generated exercises), "👁 Lösung zeigen" (confirm) → Rechenweg with KaTeX, your values next to the correct ones.
    Optional calculator-free notice: "Rechne auf Papier, trage nur Ergebnisse ein."
5.5 **Progress** (migration **v5 → v6**): `rechnen: Record<id, RechenState>` (attempts, solvedAt, hintsUsed, solutionShown, stage, due,
    lastSeed) and `rechnenDays` for the streak. Repetition like SQL (`JOURNAL_INTERVALS`). Dashboard KPI "Rechenübungen x/y gelöst".
5.6 **Tests**: every template's `loese()` reproduces the numbers in the sheet solutions (smoke test against `content/`: e.g. DD3 C1 → 70,00 / 55 / 40;
    DD7 B2 values), property tests over many seeds (no NaN, no division by zero, results in range), checker/Fehlerbild tests.
5.7 **Starting content**: every "Berechnen" task of the sheets as a fixed exercise + at least one generated variant per template (~60 exercises).
    Write the JSON in `AP-2/` (owner's OK), then sync.

Implementation notes (5.1–5.7):
- 5.1: format as above plus optional `params`, `neueZahlen`, `erklaerung`; `eingaben` entries may be plain ids; exercises without a template give
  `loesung` per input. The template check runs at import (`BuildOptions.pruefeRechenUebung`) → ImportIssues. Full format: DOKUMENTATION § 4.4.
- 5.2: 27 templates (`lagemasse`, `gewichtetes-mittel`, `quartile`, `varianz`, `variationskoeffizient`, `haeufigkeiten`, `korrelation`,
  `regression`, `gleitender-durchschnitt`, `prozent-veraenderung`, `konfusionsmatrix`, `regressionsguete`, `assoziation`, `kmeans`,
  `durchlaufzeit`, `fehlerquote`, `amortisation`, `qualitaetsgrad`, `netzplan`, `nutzwert`, `break-even`, `risiko`, `sozialversicherung`,
  `minijob`, `gleichgewicht`, `datensicherung`, `rpo`). WiSo/DD10/DD13 checked: SV/Netto, Minijob, Gleichgewichtspreis, Inflation, Sicherung,
  RPO added; Zinsen (only Verzugszinsen as theory in DD14), Kalkulation and Speicherbedarf (beyond the backup volumes) have no calculation tasks in the sheets, so no templates. "Neue Zahlen" keeps the shape of the fixed data.
  No separate "Pareto" or "Spannweite" template: both are results of `haeufigkeiten` / `lagemasse`.
- 5.3: also lists (outliers), texts (names, ja/nein) and sets (critical path). Fehlerbilder within the rounding tolerance are dropped.
- 5.4: Netzplan & co. are entered in a table (`layout`); answers of the last check are restored; KaTeX only loads with the solution.
  Simplified: no "Ausprobieren" step, no per-field partial points (the exercise is solved only when every field is right).
- 5.5: `RechenState` also stores the last checked answers (`antworten`); repetition helpers shared with SQL (`src/lib/wiederholung.ts`).
- 5.6: sheet examples per template (`rechenVorlagen.test.ts`), property tests over 150 seeds per template, content smoke test (fixed exercises
  must reproduce the numbers in the model solution of their `quelleAufgabe`), page render smoke test. The property tests found one bug
  (Fehlerbild "arithmetic instead of harmonic mean" for F1 was indistinguishable from the right value when P ≈ R) – fixed.
- 5.7: **85 exercises** (57 fixed, 28 generated – one per template). Fixed: every calculation task of the Übungsklausuren plus the
  calculation examples of the theory parts (source "DDn Teil …", checked against the theory text by the smoke test). New template `pert`
  (Drei-Zeiten-Schätzung, DD12 3.1); `assoziation` now keeps every article in "Neue Zahlen". Skipped as non-calculations: DD13 lookups
  (Pausen, Betriebsratsgröße, Günstigkeitsprinzip) and Kündigungstermine. More than the planned ~60 because the theory examples were added too.

## Phase 6 – Leicht-Modus: 4 answers, 1 correct [U] ✅ done

6.1 **Where it makes sense:** flashcards of `typ` wissen, abgrenzung, falle and rechnung; Prüferfragen with a short answer;
    Rechenübungen (distractors = typical wrong results from `fehlerbilder`, very useful for learning).
    **Not** for: open exam tasks, Fachgespräch questions, `anwendung` cards with long answers, SQL writing
    (optional later: "Welche Abfrage liefert …?" with 4 queries).
6.2 **Distractors must be written, not guessed.** Long card answers make automatic distractors poor. Extend the flashcard format
    (optional, backwards compatible):
    ```json
    { "id": "SQL-001", "frage": "…", "antwort": "…",
      "mc": { "richtig": "kurze richtige Antwort", "falsch": ["…", "…", "…"], "erklaerung": "optional, warum die anderen falsch sind" } }
    ```
    Validation: exactly 3 distinct `falsch`, none equal to `richtig`. Rechenübungen use their `fehlerbilder`.
6.3 **Authoring helper** (local only, owner runs it): `npm run mc-entwurf -- --deck sql` uses the Claude API (key from `.env.local`)
    to propose `mc` blocks into `data/mc-entwurf.json` for review; a second command merges accepted entries into `AP-2/AP2_FIDPA_Lernkarten.json`.
    Nothing is generated at runtime, so Pages stays static and all users see the same reviewed questions.
6.4 **Fallback** (optional, marked "automatisch"): for cards without `mc` and with an answer ≤ 120 characters, use 3 answers of other cards
    from the same deck and typ. A setting can disable this.
6.5 **UI**: on Karteikarten a mode switch "Aufdecken | 🟢 Leicht (4 Antworten)" (remembered in settings). Filters only offer cards that support
    the chosen mode and show how many do. Options shuffled (Fisher–Yates), keys 1–4, immediate feedback with the correct answer, the full
    `antwort` and `erklaerung`. Rechenübungen get the same switch ("Ergebnis auswählen" instead of typing).
6.6 **Effect on Leitner boxes** (recognition is easier than recall): correct in Leicht-Modus moves a card up **at most to box 2**; wrong → box 1.
    A card only reaches boxes 3–5 in the normal mode. The Dashboard hint: "Leicht-Modus ist zum Einstieg – für die Prüfung frei antworten."
    Store `leicht` answers in `cardReviewDays` too (streak). No schema change needed beyond settings, unless per-card stats are added.
6.7 Tests: option building (exactly 4, correct one included, no duplicates), box cap, filter counts.

Implementation notes (6.1–6.7, details: DOKUMENTATION § 4.2 and § 5 "Leicht-Modus"):
- 6.2: zod `KartenMcSchema` / `pruefeMc` in `shared/lernkarten.ts`; an invalid block → ImportIssue, the card stays without `mc`. No card has `mc` yet.
- 6.3: `npm run mc-entwurf -- --deck <id> [--max 30] [--anwendung]` → `data/mc-entwurf.json`; `npm run mc-uebernehmen [-- --probe]` merges entries
  with `"status": "angenommen"` (pure logic `server/mcWerkzeug.ts`, tested with a mock client; the API was never called, the content file is unchanged).
- 6.4: **200 instead of 120 characters** – with 120 only 4 of 407 cards qualify. Now 193 cards support Leicht (wissen 109, falle 37, rechnung 24,
  abgrenzung 19, Prüferfragen 4), all "automatisch". Wrong answers: same deck, same typ first (other typs of the deck fill up), similar length.
  Setting `leichtAutomatisch` (optional, missing = on, no version bump – like `lastBackupDownloadAt`).
- 6.5: one setting `leichtModus` for flashcards and Rechenübungen. Rechenübungen: all 85 exercises selectable; missing Fehlerbilder are filled
  with nearby values (369 of 408 inputs need at least one), marked on the page; `nutzwert`/`risiko` got Fehlerbilder for their text result.
  Decision: a Leicht round counts as a learning day and a wrong one restarts the repetition, but it is no attempt and never "gelöst" –
  solved only by typing (no `RechenState` change, `PROGRESS_VERSION` stays 6).
- 6.6: Q5 decided by the owner: box cap 2 (`rateCardLeicht`); a card in box 3–5 is not moved down by a correct Leicht answer.

## Phase 7 – Mobile and offline [C] ✅ done (7.1–7.4; 7.5 nicht umgesetzt)

7.1 **PWA** with `vite-plugin-pwa`: manifest (name "AP2 Lern-App", icons from `build/icon.png`, `start_url: './'`, `display: standalone`),
    precache of the app shell, `content.json`, KaTeX fonts and `sql-wasm.wasm`. Update flow for all users: toast "Neue Version verfügbar – neu laden".
    Only in the `pages` mode build.
7.2 **Mobile navigation** below 600 px: bottom bar with Übersicht, Lernen, Karteikarten, Üben (menu: Klausur, Einzelaufgaben, SQL, Rechnen),
    Mehr (Fehlerjournal, Material, Einstellungen, Daten). Currently 11 links wrap into a block above every page.
7.3 Touch: swipe left/right on flashcards for rating is optional; buttons large enough (≥ 44 px).
7.4 **Hide "KI-Aufgaben" on Pages** (like the desktop branch does), unless 7.5 is done.
7.5 **nicht umgesetzt (Entscheidung Q3).** ~~**Optional: KI with your own key on Pages.** Per-user API key in the settings (stored only in that browser, clearly marked opt-in,
    with a cost/security note); calls Anthropic directly from the browser (`anthropic-dangerous-direct-browser-access` header).
    Generated tasks stored per browser. Only do this if the owner wants it (Q3).~~

Implementation notes (7.1–7.4, details: DOKUMENTATION § 5 "Mobile" and "PWA", § 8):
- 7.1: `vite-plugin-pwa` (generateSW) only in `--mode pages` (`server/pwaPlugin.ts`); registration with `workbox-window` in `src/lib/pwa.ts`
  (own code instead of `virtual:pwa-register`, so dev/preview/build need no stub). `registerType: 'prompt'`: a new version (also a changed
  `content.json`) waits until the user clicks "↻ Neu laden" in the toast; an open app checks for a new `sw.js` hourly and on returning to the tab.
  Precache: 45 entries, ~3.5 MB (app shell, all lazy chunks, `content.json`, `sql-wasm.wasm`, KaTeX woff2 only). Icons 192/512/maskable 512 +
  apple-touch-icon generated once from `desktop:build/icon.png` with Windows System.Drawing and committed (no image dependency).
  Checked in headless Edge: worker active, update toast after a rebuild, offline start incl. SQL (WASM) and KaTeX fonts.
- 7.2: bottom bar `components/MobileNav.tsx` below 600 px (Übersicht, Lernen, Karteikarten, Üben menu, Mehr menu incl. theme and save state);
  due badges summed on the menu buttons; disclosure buttons with `aria-expanded`, Escape/outside tap closes, focus handling. 600–899 px and
  desktop unchanged. Also fixed horizontal overflow on narrow screens (filters, theory grid).
- 7.3: 44 px minimum height for buttons, selects and inputs below 600 px (small helper buttons excepted). Swipe on flashcards not done (optional).
- 7.4: no AI UI on Pages: nav item (sidebar + Mehr), `/generator` → redirect to `/`, KI-Bewertung button, "Quelle" filter, KI section on Daten.

## Phase 8 – More learning effect [C] (8.1–8.4 ✅ done)

Ordered by expected benefit per effort:

8.1 **"Heute lernen" (adaptive daily session)** replaces the removed study plan: one button on the Dashboard builds a ~20-minute mixed
    round from what is due: journal items, due cards, 1–2 SQL or Rechenübungen, one task from the weakest topic. Interleaving different
    topics improves retention. Pure planner function with tests.
8.2 **Answer before revealing**: an optional text field on flashcards ("Deine Antwort"), shown next to the model answer when flipped.
    Writing things down improves recall more than thinking "I knew that".
8.3 **Confidence before checking**: in exams/tasks ask "Wie sicher bist du?" (1–3) before submitting; show calibration on the Dashboard
    ("Bei 'sicher' lagst du in 64 % richtig"). Reveals false confidence before the exam.
8.4 **Operatoren-Trainer**: the IHK operators (nennen, beschreiben, erläutern, beurteilen, berechnen …) with what each requires and how many
    points it typically gives; highlight operators in task texts with a tooltip. Many points are lost by answering the wrong operator.
Implementation notes (8.1–8.4, details: DOKUMENTATION § 5 "Heute lernen", "Deine Antwort", "Selbsteinschätzung", "Operatoren" and § 6):
- 8.1 ✅ Pure planner `planeHeute` (`src/lib/heute.ts`): Fehlerjournal up to half of the 20 minutes (at least one), one task from the weakest
  topic (never attempted first), 1–2 due SQL/Rechenübungen (else one unsolved, preferably from the weakest topic), due cards (else new ones) with
  the remaining time – Prüferfragen/Fachgespräch settings and Leicht-Modus respected –, card blocks of ≤ 8 per topic, interleaved so the topic
  changes every step. Time estimates in `shared/config.ts` (`HEUTE_*`). Flow: Dashboard button → `/heute` (lazy) → each step opens the existing
  page; a bar above every page offers "Weiter →". Session per day and device in `localStorage` (`ap2-heute`), not in `Progress`.
  Karteikarten accept `?karten=ID,…`. Mobile: first entry of the Üben menu.
- 8.2 ✅ "✍️ Deine Antwort" below the card (outside the clickable card), shown next to the model answer after flipping, Strg+Enter flips,
  shortcuts ignore typing. Not persisted (cleared per card).
- 8.3 ✅ "Wie sicher bist du?" (1–3, optional) on the task page and per exam task. **Decision: optional fields `Attempt.sicherheit` and
  `ExamRun.sicherheit`, no version bump** (the schemas are loose and the migration kept unknown fields, like `lastBackupDownloadAt`);
  invalid values are dropped on migration and rejected by `checkProgressPut`; merge fills a missing value from the backup; v6 fixture added.
  "Richtig" = at least 80 % of the points (`SICHER_RICHTIG_AB`). Dashboard card "🎯 Selbsteinschätzung" with a hint from 5 attempts per level.
- 8.4 ✅ 29 operators actually used in the sheets (data module with Anforderungsbereich, requirement, typical points, tip). Tokenizer handles
  Sie-/du-forms and separable verbs ("Geben Sie … an"); 304 of 306 italic operators in the tasks recognised. A rehype plugin marks them in task
  texts only (Markdown untouched), accessible tooltip on hover/focus. Trainer `/material/operatoren` (lazy): quiz with real tasks + table.
  Simplified: the quiz score is not stored; there is no setting to switch the marking off.

8.5 **Mixed mock exam**: a 90-minute exam assembled across topics like the real AP2 (blocks weighted by the topic list), not only per Deep Dive.
8.6 **Faded worked examples** for Rechenübungen: first time all steps shown, then one step missing, then only the result, based on the stage.
8.7 **Error categories in the Fehlerjournal**: after self-assessment choose why ("Begriff verwechselt", "Formel falsch", "Rechenfehler",
    "Operator nicht beachtet", "Zeit"). The Dashboard shows the most common category.
8.8 **Global search** (`Strg+K`): terms across sheets, cards and exercises, jump to the section.
8.9 **Glossary** built from `wissen` cards and bold terms in the sheets.

---

## Review of earlier suggestions for multi-user use

| Suggestion | Fits multi-user Pages? | Decision |
|---|---|---|
| `navigator.storage.persist()` | Yes, per browser | Phase 3.1 |
| Automatic backups in IndexedDB | Yes, per browser | Phase 3.2 |
| Backup reminder | Yes | Phase 3.3 |
| PWA / offline | Yes; needs an update toast so users get new content | Phase 7.1 |
| Mobile bottom navigation | Yes | Phase 7.2 |
| Hide KI on Pages | Yes | Phase 7.4 |
| Sync via private GitHub Gist | **No for most users**: needs a GitHub account and a personal access token, too technical | Replaced by **merge on import** (3.4); Gist only as an optional power-user feature later |
| KI with own API key | Only opt-in: each user pays with their own key, and the key sits in the browser | Not done (Q3: no AI on Pages) |
| Commit the Electron branch before pushing | Owner-only housekeeping | Phase 0.1 |
| Hard-coded exam date / Lernplan / KW | **No**, personal | Removed in phase 1 |

## Open questions for the owner

- **Q1 (decided):** ~~Should "Prüferfragen ausschalten" also cover the *Fachgespräch* questions or the *Prüferkommentar* in solutions?~~
  Separate switches for Prüferfragen and Fachgespräch; the Prüferkommentar is never hidden.
- **Q2 (decided):** editing the sheets was approved for 1.1 (KW references replaced) and 4.4 (LaTeX formulas, done). Is it OK to edit the sheets in `AP-2/` for phase 1.1 (remove KW references) and 4.4 (LaTeX formulas)? Alternative: leave the sheets
  unchanged and only improve the rendering (4.2) and the new Rechenübungen.
- **Q3 (decided):** ~~KI on Pages with each user's own key (7.5): yes or no?~~ No – Pages has no AI (7.4), 7.5 is not done.
- **Q4 (open):** No license is claimed yet (the Datenschutz-Hinweis doesn't mention one). License/visibility of the content in `content/` now that others use the app (e.g. CC BY-NC 4.0)?
- **Q5 (decided):** ~~Leicht-Modus box cap (6.6): OK, or should Leicht answers not affect the Leitner boxes at all?~~ Box cap: correct → at most box 2, wrong → box 1.

## Suggested order

Phase 0 → 1 → 2 → 3 → 4.1–4.3 → 5 → 6 → 7 → 4.4/4.5 → 8. (Done up to 7, 4.4/4.5 and 8.1–8.4; next: 8.5–8.9.)
Phases 1–3 are small (about 1 day together) and make the app safe for other users; 5 and 6 are the largest (mostly content writing).
