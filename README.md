# AP2 Lern-App

Lokale Lern-App für die **IHK-Abschlussprüfung Teil 2 – Fachinformatiker/-in Daten- und Prozessanalyse** (25.11.2026).
Die App liest die Markdown-Lernblätter aus dem Ordner `AP-2` und macht daraus Übungen mit **getrennten Lösungsblättern**.

## Starten

**Einfach:** Doppelklick auf `Lern-App starten.cmd` im Ordner `AP-2`.
Beim ersten Start werden die Abhängigkeiten installiert, danach öffnet sich der Browser unter http://localhost:5178.

**Per Terminal:**

```bash
cd lern-app
npm install      # nur beim ersten Mal
npm run dev
```

Beenden: im Terminalfenster `Strg + C`.

**Gebaute Version:** `npm start` baut die App (`dist/`) und startet sie mit `vite preview` – ebenfalls unter http://localhost:5178,
mit derselben lokalen API, denselben Daten in `data/` und den Lernblättern aus `AP-2`. Unterschied zu `npm run dev`: Nach dem
Ändern eines Lernblatts lädt die Seite nicht von selbst neu (einfach F5 drücken), und Codeänderungen brauchen ein neues `npm start`.
Nicht gleichzeitig mit `npm run dev` starten – beide nutzen Port 5178.

## Online-Version (GitHub Pages)

Unterwegs lernen ohne eigenen Rechner: **https://alexseiff.github.io/ap2_learning_app/**

Das ist dieselbe App als statische Seite – ohne Server:

| | Lokale App (`npm run dev`) | Online-Version |
|---|---|---|
| Lernblätter | live aus dem Ordner `AP-2` | aus `lern-app/content/`, Stand des letzten Pushs |
| Fortschritt | `lern-app/data/fortschritt.json` + Tagessicherung | im Browser (localStorage), nur auf diesem Gerät |
| Lernen, Karteikarten, Klausur, Einzelaufgaben, Fehlerjournal, Material | ✓ | ✓ |
| Sicherung herunterladen / einspielen | ✓ | ✓ |
| KI-Aufgaben, KI-Bewertung | ✓ (mit API-Schlüssel) | – „Nur in der lokalen App verfügbar“ |

Der API-Schlüssel und die KI-Aufgaben aus `data/` kommen nie in die Online-Version.
Die Lernblätter (die Dateien in `content/`) sind damit öffentlich.

**Fortschritt umziehen:** In der lokalen App *Daten & Import → ⬇ Sicherung herunterladen*, dann in der Online-Version
*Daten & Import → ⬆ Sicherung einspielen* (andersherum genauso). Der eingespielte Stand ersetzt den dortigen komplett.
Löschst du die Browserdaten, ist der Online-Fortschritt weg – also ab und zu eine Sicherung herunterladen.

**Lernblätter aktualisieren:** Nach dem Bearbeiten der `.md`-Dateien oder der Lernkarten im Ordner `AP-2`:

```bash
npm run sync-content   # kopiert die Lernblätter aus AP-2 nach lern-app/content/ (AP-2 wird nur gelesen)
git add content && git commit -m "Lernblätter aktualisiert" && git push
```

Jeder Push auf `main` baut und veröffentlicht die Seite automatisch (`.github/workflows/pages.yml`: Tests, `npm run build:pages`, Deployment).
Selbst bauen: `npm run build:pages` erzeugt `dist/` mit `content.json`; ansehen mit `npx vite preview --mode pages`.

**Einmalig einrichten:** Auf GitHub im Repository *Settings → Pages → Build and deployment → Source: „GitHub Actions“* wählen.

## Funktionen

| Bereich | Was es tut |
|---|---|
| **Übersicht** | Countdown zur Prüfung, Lernserie (Tage in Folge), aktuelle Lernplan-Woche, fällige Wiederholungen, Fortschritt je Thema, Klausur-Trend je Thema, schwächste Themen |
| **Lernen** | Theorie aller 12 Deep Dives mit Inhaltsverzeichnis und abhakbarem Lernziel-Check |
| **Karteikarten** | 407 Lernkarten aus `AP2_FIDPA_Lernkarten.json` (24 Decks) plus Prüfer- und Fachgespräch-Fragen aus den Lernblättern; Filter nach Deep Dive, Deck, Typ, Schwierigkeit; „Fallen wiederholen"; Leitner-System (Tastatur: `Leertaste` umdrehen, `1`/`2`/`3` bewerten) |
| **Übungsklausur** | 90-Minuten-Timer, 100 Punkte, Anlagen einblendbar; Lösungen erst nach Abgabe; Ergebnis mit IHK-Note |
| **Einzelaufgaben** | Filter nach Thema, Block, Schwierigkeit, Status, Suche; Auswahl als Aufgaben-/Lösungsblatt exportieren |
| **Fehlerjournal** | Jede Aufgabe unter voller Punktzahl kommt nach 1, 3 und 7 Tagen wieder |
| **KI-Aufgaben** | Neue IHK-Aufgaben (MC, Lückentext, Zuordnung, Rechnen, offen) mit Musterlösung – nur mit API-Schlüssel |
| **Material** | Lernzettel Kernthemen, Themenliste, Lernplan |
| **Daten & Import** | Importbericht, Neu-Import, Fortschritt sichern/wiederherstellen/zurücksetzen |

### Getrennte Aufgaben- und Lösungsblätter (PDF)

Bei jeder Klausur (oder einer Auswahl unter *Einzelaufgaben*) gibt es **„Aufgabenblatt"** und **„Lösungsblatt"** als eigene Seiten
mit identischer Nummerierung. Über *Drucken / Als PDF speichern* entstehen z. B.

- `Aufgabenblatt_SQL_2026-09-21.pdf` – nur Aufgaben, Punkte und Schreibplatz
- `Loesungsblatt_SQL_2026-09-21.pdf` – Musterlösungen, Prüferkommentar, Punkteschema

Beide gibt es zusätzlich als Markdown-Download.

### Bewertung

- **Automatisch** bei Multiple Choice, Lückentext, Zuordnung und Rechenaufgaben (KI-generierte Aufgaben).
- **Selbstbewertung** bei offenen Aufgaben: Musterlösung + Prüferkommentar; enthält die Lösung eine Punktetabelle, werden daraus abhakbare Kriterien.
- **KI-Bewertung** (optional): Claude vergibt Punkte nach Musterlösung und gibt kurzes Feedback – die Punkte sind ein Vorschlag, den du anpassen kannst.
- Noten nach IHK-Schlüssel: 100–92 = 1 · 91–81 = 2 · 80–67 = 3 · 66–50 = 4 · 49–30 = 5 · 29–0 = 6.

## KI-Funktionen einschalten (optional)

Ohne Schlüssel funktioniert alles außer „KI-Aufgaben" und „KI-Bewertung".

1. API-Schlüssel unter https://console.anthropic.com/settings/keys erstellen.
2. Im Ordner `lern-app` eine Datei `.env.local` anlegen (Vorlage: `.env.local.example`):
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Server neu starten.

Standardmodell ist `claude-sonnet-5`; mit `ANTHROPIC_MODEL=claude-opus-5` in `.env.local` lässt es sich ändern.
Der Schlüssel bleibt auf dem Server (Node) und wird nie an den Browser übertragen.

## Lernkarten-Datei

Jede Datei `*Lernkarten*.json` im Ordner `AP-2` wird importiert (aktuell `AP2_FIDPA_Lernkarten.json`). Format:

```json
{ "meta": { "hinweise": ["…"] },
  "decks": [ { "id": "sql", "titel": "SQL", "pruefungsbereich": "…", "quelle": "Deep Dive 1", "status": "behandelt",
               "karten": [ { "id": "SQL-001", "frage": "…", "antwort": "…", "typ": "wissen", "schwierigkeit": 1, "tags": ["join"] } ] } ] }
```

- `quelle` mit „Deep Dive N" ordnet das Deck dem Thema zu (bei „Deep Dive 5 und 12" gewinnt der Deep Dive, dessen Titel zum Decktitel passt). Decks ohne Deep Dive (WiSo, Projektarbeit …) sind über den Deck-Filter erreichbar.
- `typ`: wissen · abgrenzung · rechnung · anwendung · falle – „falle"-Karten gibt es gesammelt über **⚠️ Fallen wiederholen** und vor jeder Übungsklausur.
- Zeilenumbrüche (`\n`) in Antworten bleiben erhalten; SQL-Zeilen werden als Codeblock angezeigt.
- Der Lernstand hängt an der Karten-`id` – IDs beim Bearbeiten der Datei also nicht ändern.

## Lernblätter ändern / neu importieren

Die App liest die `.md`-Dateien bei jedem Laden direkt aus dem Ordner `AP-2`. Änderst du eine Datei, lädt die Seite automatisch neu.
Für die Online-Version danach `npm run sync-content` ausführen und committen (siehe [Online-Version](#online-version-github-pages)).
Unter **Daten & Import** siehst du den Importbericht (z. B. Aufgaben ohne Musterlösung).

Erwartetes Format:

- Lernblatt `DeepDive_NN_Thema.md` mit Abschnitt `# Übungsklausur …`, Blöcken `## Block A – Titel (19 P)` und Aufgaben `**A1 (6 P):** …`
- Lösungsdatei `DeepDive_NN_Thema_Loesungen.md` mit `**A1 (6 P):**` + Lösung, optional `*Prüferkommentar: …*`
- Prüferfragen als `> ❓ **Prüferfrage:** Frage` mit kursiver Antwort in der nächsten Zitatzeile
- Fachgespräch-Fragen als nummerierte Liste unter `## Fachgespräch…`, Lernziele als `- [ ]` unter `## Lernziel-Check…`

Das ältere Blatt `Deep_Dive_SQL_KW28_29.md` (Lösungen im Blatt selbst) wird als Zusatzthema importiert.

Importbericht im Terminal: `npm run import-report`

## Daten

Alles bleibt lokal:

- `lern-app/data/fortschritt.json` – Versuche, Klausuren, Karteikarten, Fehlerjournal, Lernziele, Karteikarten-Lerntage (für die Lernserie)
- `lern-app/data/generierte-aufgaben.json` – KI-Aufgaben

Sicherung: *Daten & Import → Sicherung herunterladen*. Zusätzlich legt die App beim ersten Speichern eines Tages automatisch `lern-app/data/backups/fortschritt-JJJJ-MM-TT.json` an (die letzten 14 Tage bleiben erhalten; die Seite *Daten & Import* zeigt die neueste).

**Lernserie:** Ein Lerntag ist ein Tag (nach lokaler Uhrzeit) mit mindestens einem Aufgabenversuch, einer gestarteten, abgegebenen oder abgeschlossenen Klausur oder einer bewerteten Karteikarte. Die Serie zählt die Tage in Folge bis heute; hast du heute noch nichts gelernt, zählt sie bis gestern weiter und reißt erst morgen. Karteikarten zählen erst ab diesem Update mit (vorher speicherte die App dafür kein Datum).

Mehrere Tabs: Jeder gespeicherte Stand trägt einen Revisionszähler. Hat ein anderer Tab inzwischen gespeichert, lehnt der Server das Speichern ab (HTTP 409) und die App zeigt „Die App ist in einem anderen Tab geöffnet – bitte neu laden“. Dieser Tab speichert dann nichts mehr, bis du ihn neu lädst – so überschreibt er nie den Fortschritt aus dem anderen Tab.

## Entwicklung

```bash
npm run dev           # Dev-Server mit lokaler API auf http://localhost:5178 (das startet auch Lern-App starten.cmd)
npm start             # bauen (tsc + vite build) und die gebaute App mit lokaler API per vite preview auf Port 5178 starten
npm test              # Vitest: Parser, Logik, Migration, Statistik (Formattests mit Fixtures, ein Rauchtest mit den echten Lernblättern aus content/)
npm run typecheck     # tsc -b
npm run lint          # ESLint (typescript-eslint, React-Hooks-Regeln), Warnungen zählen als Fehler
npm run format        # Prettier formatiert den Code (format:check prüft nur)
npm run build         # Typecheck + Build der lokalen App nach dist/
npm run build:pages   # statische Version für GitHub Pages nach dist/ (mit content.json)
npm run import-report # Importbericht der Lernblätter im Terminal
npm run sync-content  # Lernblätter aus AP-2 nach content/ kopieren (für Pages und Tests)
```

Vor jedem Commit sollten `npm test`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build` und
`npm run build:pages` durchlaufen – GitHub Actions (`.github/workflows/pages.yml`) prüft Tests, Lint und den Pages-Build bei jedem Push.

TypeScript liegt doppelt vor: `tsc` (Typecheck, Build) ist TypeScript 7 aus dem Paket `@typescript/native`. Unter dem Paketnamen
`typescript` steckt TypeScript 6 (`@typescript/typescript6`), weil typescript-eslint die Programmierschnittstelle von TypeScript 7 noch
nicht unterstützt – so empfiehlt es auch Microsoft für den Übergang.

**Drei Betriebsarten, eine Oberfläche:**

| | `npm run dev` | `npm start` (vite preview) | `npm run build:pages` (GitHub Pages) |
|---|---|---|---|
| API `/api/…` | `server/apiPlugin.ts` über `configureServer` | dieselbe Middleware über `configurePreviewServer` | keine – `src/lib/staticApi.ts` |
| Lernblätter | live aus `AP-2`, Seite lädt bei Änderungen neu | aus `AP-2`, Cache wird bei Änderungen geleert (F5) | `content/` als `content.json` im Build |
| Fortschritt | `data/fortschritt.json` + `data/backups/` | wie dev | localStorage im Browser |
| `.env.local` (KI) | ja | ja | wird nicht gelesen |

`src/lib/api.ts` wählt über `import.meta.env.MODE === 'pages'` (gesetzt von `vite build --mode pages`) zwischen der lokalen API und
`staticApi.ts`. `vite.config.ts` lädt `.env.local`, bevor es das API-Plugin importiert – `server/ai.ts` und `server/loadContent.ts`
lesen `ANTHROPIC_MODEL` und `LERN_QUELLE` beim Import. Der Pages-Build liest die Lernblätter bewusst aus `content/` und nicht aus
`AP-2` – so bauen GitHub Actions und dein Rechner dasselbe.

**Gespeicherter Fortschritt** (`shared/progress.ts`): Typen, zod-Schema, `checkProgressPut` (Server lehnt ungültige Daten, einen starken
Rückgang der Versuche ohne `reset: true` und veraltete Tabs per Revisionszähler ab) und `migrateProgress`. Aktuell ist Version 3
(1 → 2: `revision`, 2 → 3: `cardReviewDays`). Bei jeder Formatänderung `PROGRESS_VERSION` erhöhen, einen Schritt in `MIGRATIONS`
ergänzen und die Migrationstests in `tests/progress.test.ts` anpassen – sie laden unter anderem eine Kopie der echten Datei aus
`tests/fixtures/`. Geschrieben wird atomar (Temp-Datei + Umbenennen, mit Wiederholung, falls OneDrive die Datei sperrt), vorher entsteht
die Tagessicherung in `data/backups/`.

Aufbau:

```
lern-app/
├─ shared/        Code für Client, Server und Tests
│  ├─ config.ts     Einstellungen: Prüfungsdatum, Klausurdauer, neue Karten je Runde, Intervalle, Speicherverzögerung, Port
│  ├─ progress.ts   gespeicherter Fortschritt: Typen, zod-Schema, Prüfung von PUT /api/progress, Migration
│  ├─ api.ts        API-Vertrag: Request-Schemas und Antworttypen je Route (für apiPlugin.ts und src/lib/api.ts)
│  ├─ types.ts      Inhaltsmodell (Thema, Aufgabe, Karteikarte, Klausur …)
│  └─ parser.ts, lernkarten.ts   Markdown-Parser und Lernkarten-Import (rein, ohne Dateizugriff)
├─ server/        läuft nur in Vite (dev und preview): apiPlugin.ts (Routentabelle, Middleware), router.ts, store.ts (JSON-Dateien,
│                 Sicherungen), contentCache.ts, loadContent.ts, ai.ts (Claude), pagesPlugin.ts (content.json), report.ts, syncContent.ts
├─ content/       Kopie der Lernblätter und Lernkarten aus AP-2 für GitHub Pages und Tests (npm run sync-content)
├─ src/           React-Oberfläche
│  ├─ pages/        eine Datei je Seite, möglichst nur Darstellung
│  ├─ hooks/        useExamRun (Klausurablauf mit Timer), useCardSession (Karteikarten-Runde, Tastatur), useConfirm (Bestätigungsdialog)
│  ├─ components/   AnswerInput, Markdown, TaskParts, ErrorBoundary, ConfirmDialog
│  └─ lib/          reine Funktionen (progress, grading, stats, cards, shuffle, examTimer, sheets) plus store.tsx, api.ts, staticApi.ts
├─ tests/         Vitest-Tests; tests/fixtures/ enthält alte Fortschrittsformate für die Migrationstests und inhalt/ mit Mini-Lernblatt,
│                 Lösungen und Lernkarten für die Parser-Tests
└─ data/          fortschritt.json, generierte-aufgaben.json, backups/ (nicht im Repository)
```
