# Agent Prompt: Improve the AP2 Lern-App

> Paste everything below the line into an AI coding agent (for example Claude Code), started from inside the `lern-app` folder.

---

## Role and goal

You are a senior TypeScript/React engineer. You are improving an existing, **working** local learning app for the IHK exam *Abschlussprüfung Teil 2 – Fachinformatiker/-in Daten- und Prozessanalyse* (exam date 25.11.2026). The app is used every day for studying until then. So the top priorities are **never losing study progress** and **never breaking the app**. Changes to structure and code quality come second.

Work in small steps you can check. After each numbered task, run `npm test` and `npm run typecheck`. Both must pass before you move on. Don't rewrite anything that already works just to make it look nicer.

## Rules you must follow

- **All UI text stays in German.** Match the existing tone: informal "du", short sentences, emoji icons in nav and buttons. Code identifiers keep the current mixed German/English style. Don't rename existing public identifiers only to change the language.
- **Keep persisted data compatible.** `data/fortschritt.json` holds real progress (attempts, exams, Leitner card states keyed by card `id`, error journal, learning goals). Any change to the schema needs a migration. Old files must still load.
- **Don't touch the learning sheets** in the parent folder `AP-2/*.md` or `AP2_FIDPA_Lernkarten.json`. The app only reads them.
- **Keep the one-command start.** `Lern-App starten.cmd` in the parent folder runs `npm install` (first time only) and then `npm run dev`. The app must keep running at http://localhost:5178 that way.
- Match the existing code style: 2-space indent, single quotes, short German comments only where the reason isn't obvious, pure functions in `lib/` and `shared/`, and tests next to the logic they cover.
- Don't add heavy dependencies (no state-management libraries, no CSS frameworks, no backend framework). `zod` is already installed. Use it.

## Current architecture (verified)

About 4,200 lines of TypeScript. React 19, Vite 8, TypeScript 7, Vitest 5, React Router 7 (HashRouter), `@anthropic-ai/sdk`.

```
lern-app/
├─ index.html, vite.config.ts   Vite config; loads .env.local into process.env; registers apiPlugin
├─ server/                      Runs only inside the Vite dev server
│  ├─ apiPlugin.ts              Hand-written middleware router for /api/* (content, progress, ai/*, generated)
│  ├─ loadContent.ts            Reads ../*.md + *Lernkarten*.json → shared/parser.buildContent()
│  ├─ store.ts                  JSON files in data/ (atomic temp-file + rename; broken file → *.defekt-<ts>)
│  ├─ ai.ts                     Claude: generateTasks() + gradeAnswer() using zod structured output
│  └─ report.ts                 CLI import report (npm run import-report)
├─ shared/                      Used by server, client and tests
│  ├─ types.ts                  Content model (Topic, Task, Flashcard, Deck, Exam, …)
│  ├─ parser.ts  (488 lines)    Markdown sheet + solution parser (regex/line based)
│  └─ lernkarten.ts             Flashcard JSON import
├─ src/
│  ├─ main.tsx, App.tsx         Router, sidebar nav, theme toggle (localStorage)
│  ├─ lib/store.tsx             React context: loads content+progress, debounced PUT /api/progress, pagehide flush
│  ├─ lib/progress.ts           Progress types + pure updates (recordAttempt, rateCard) ← persisted schema lives here
│  ├─ lib/grading.ts, sheets.ts, stats.ts, api.ts
│  ├─ components/               AnswerInput, Markdown, TaskParts
│  └─ pages/                    11 pages; Klausur.tsx (284 lines) and Karteikarten.tsx (260 lines) are the biggest
├─ tests/                       parser, lernkarten, logic tests (run against the REAL sheets in ../)
└─ data/                        fortschritt.json, generierte-aufgaben.json (gitignored)
```

Things that already work well and should stay: pure parser with no file-system access, pure progress updates with tests, atomic JSON writes, the API key stays on the server, clear German error messages for API failures, and URL-based filter state on the flashcards page.

## Tasks, in priority order

### P0 – Safety net (do this first)

1. **Put the project under version control.** The folder is not a git repository yet. Run `git init` in `lern-app/` and create a first commit of the current state. Add `tsconfig.tsbuildinfo` and `*.defekt-*` to `.gitignore`. `data/` and `.env.local` are already ignored and must stay that way.
2. **Automatic progress backups.** Before `writeProgress` overwrites `data/fortschritt.json`, keep a rolling daily backup at `data/backups/fortschritt-YYYY-MM-DD.json` (at most one per day, keep the last 14). Show the newest backup date on the *Daten & Import* page.
3. **Validate progress on the server.** `PUT /api/progress` currently writes any JSON it receives. Define a zod `ProgressSchema` and reject invalid bodies with HTTP 400 plus a German message. An accidental empty or malformed body must never overwrite real progress. Also reject a body that has far fewer `attempts` than the stored file, unless the client sends an explicit `reset: true` flag (used by the "Zurücksetzen" button and by restoring a backup).
4. **Make writes robust on OneDrive.** The app lives in a OneDrive-synced folder. On Windows, `renameSync` can fail with `EPERM`/`EBUSY` while OneDrive holds the file. Add a short retry with backoff (for example 5 tries over about 500 ms) in `writeJson`, and log clearly if it still fails.

### P1 – Correctness and data model

5. **Move the persisted schema into `shared/`.** `Progress`, `Attempt`, `ExamRun`, `CardState` and `JournalEntry` are defined in `src/lib/progress.ts`, but the server stores them too. Move the types, plus the new zod schema, to `shared/progress.ts`. Leave the pure update functions where they are or move them with the types, whichever is cleaner, and update the imports.
6. **Versioned migrations.** Replace the shallow `normalizeProgress` in `store.tsx` (`{ ...base, ...raw }`) with `migrateProgress(raw): Progress` in `shared/`. It should handle `version: 1` → current and fill missing nested fields. Add tests with an old-format fixture.
7. **Remove the side effect from the state updater.** In `store.tsx`, `update()` calls `persist()` inside the `setProgress` updater. That's impure, and React StrictMode runs it twice in dev. Compute the next state, then persist it in an effect or right after `setProgress`. Also reset `timer.current` to `undefined` once a save finishes, so the `pagehide` flush only sends when something is actually pending.
8. **Protect against two open tabs.** Right now the last writer wins, so a second open tab can wipe out the first tab's progress. Add a `revision` counter to the stored progress. The server rejects a PUT whose base revision is older (HTTP 409). The client then shows a German banner ("Die App ist in einem anderen Tab geöffnet – bitte neu laden") instead of overwriting silently.
9. **Unbiased shuffle.** `Karteikarten.tsx` shuffles with `sort(() => Math.random() - 0.5)`, which is biased. Replace it with a Fisher–Yates `shuffle()` in `lib/` and add a small test.
10. **Cache parsed content on the server.** Every `GET /api/content` and every `POST /api/ai/grade` re-reads and re-parses all Markdown files. Cache the result of `loadContent()` in `apiPlugin.ts` and clear the cache in the existing `server.watcher.on('change')` handler (also on `add`/`unlink`). Merge the generated tasks into the cached content without changing the cached object.

### P2 – Structure and maintainability

11. **One place for configuration.** `EXAM_DATE` (`lib/stats.ts`), `EXAM_MINUTES` (`pages/Klausur.tsx`), `NEW_PER_SESSION` (`pages/Karteikarten.tsx`), the journal and card intervals (`lib/progress.ts`) and the port (`vite.config.ts`) are spread across files. Collect the learning-related constants in `shared/config.ts` and import them from there. Keep the values the same.
12. **Split the big pages.** Move the logic out of `Klausur.tsx` into a `useExamRun()` hook, which starts, answers, scores, submits, finishes and auto-submits on timeout. Move `finishExam()` into `lib/` next to `recordAttempt` and add a test for it. Do the same for `Karteikarten.tsx` with a `useCardSession()` hook (queue, flip, rate, keyboard). Page components should mostly render.
13. **Structure the API router.** Replace the `if (route === …)` chain in `apiPlugin.ts` with a small route table (`{ method, path | regex, handler }`) and validate each request body with zod (`topicId`, `count` limited to 1–10, `types` as an enum array, `taskId`, `answer`). Keep the routes and response shapes exactly as they are, so `src/lib/api.ts` keeps working. Type `readBody` as `unknown` instead of `any`.
14. **Build the API client from shared types.** Put the request and response types of every route in `shared/api.ts` and use them in both `apiPlugin.ts` and `src/lib/api.ts`. `GradeResult` is currently defined twice.
15. **Error boundary.** Add a React error boundary around `<main>` in `App.tsx`. It shows a German message, a "Neu laden" button and the error text, so a crash on one page doesn't blank the whole app.
16. **Decouple tests from the real sheets.** The parser tests read the live Markdown files in `../`, so editing a sheet can break the tests. Add small fixtures in `tests/fixtures/` (one sheet, one solution file, one flashcard JSON) for the exact-format assertions. Keep one smoke test against the real folder that only checks broad things, for example "12 topics, every task has a solution, no import issues of type X".
17. **Linting and formatting.** Add ESLint (flat config, `typescript-eslint`, `eslint-plugin-react-hooks`) and Prettier with settings that match the current style (`singleQuote`, `printWidth` about 140, trailing commas). Add `npm run lint`. Fix what it finds, but put the formatting-only changes in their own commit.

### P3 – Nice to have (only once P0–P2 are done)

18. **Production or preview mode.** The API exists only in the Vite dev server (`configureServer`). Also register it via `configurePreviewServer` so `npm run build && npx vite preview` works. Optionally add a `npm start` script for that.
19. **Accessibility.** Make the flashcard `div` with `onClick` a real `button` (or give it `role="button"`, `tabIndex`, and handle Enter/Space). Give the timer `aria-live="polite"` at sensible intervals. Make sure every filter `<select>` keeps its visible `<label>`.
20. **Replace `window.confirm`.** Build one small reusable confirm dialog component in the existing CSS style and use it for the destructive actions in `Klausur.tsx`, `Daten.tsx` and `Generator.tsx`.
21. **More stats.** Add an exam-score trend per topic and a "study streak" to the Dashboard, computed as pure functions in `lib/stats.ts` with tests.

## Definition of done

- `npm test`, `npm run typecheck` (and `npm run lint` once it exists) pass.
- An existing `data/fortschritt.json` from before your changes loads without losing anything. Show this with a migration test that uses a copy of the current format.
- `Lern-App starten.cmd` still starts the app, and every page in the sidebar renders.
- `README.md` → section *Entwicklung* is updated for new scripts, folders (`shared/config.ts`, `shared/progress.ts`, `tests/fixtures/`) and the backup location.
- One commit per numbered task, with a message that says what changed and why.

## What to report at the end

A short list of every task you completed, anything you skipped or changed from this plan and why, and anything the user needs to do by hand (for example, delete old `*.defekt-*` files).
