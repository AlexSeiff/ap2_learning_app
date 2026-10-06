# AP2 Lern-App

Lern-App für die **IHK-Abschlussprüfung Teil 2 – Fachinformatiker/-in Daten- und Prozessanalyse**.
Die App liest die Markdown-Lernblätter (lokal aus dem Ordner `AP-2`, online aus `content/`) und macht daraus Übungen mit **getrennten Lösungsblättern**.
Sie läuft lokal (mit Server) oder als [Online-Version](#online-version-github-pages) für alle, die sich auf die Prüfung vorbereiten.

## Starten

Für die meisten reicht die [Online-Version](#online-version-github-pages) – ohne Installation.

**Lokal (mit Server und optionaler KI):**

```bash
npm install      # nur beim ersten Mal
npm run dev      # öffnet http://localhost:5178
```

Die Lernblätter liest die lokale App standardmäßig aus dem Ordner **oberhalb** des Repositorys (früher `AP-2/lern-app`).
Liegt das Repository woanders (z. B. `C:\dev\ap2-lern-app` außerhalb von OneDrive – empfohlen, OneDrive verträgt sich schlecht
mit `.git`), den Ordner in `.env.local` angeben: `LERN_QUELLE=C:\Users\…\AP-2`.

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
| Fortschritt | `lern-app/data/fortschritt.json` + Tagessicherung | im Browser (localStorage) + Tagessicherung im Browser (IndexedDB), nur auf diesem Gerät |
| Lernen, Karteikarten, Klausur, Einzelaufgaben, Fehlerjournal, Material | ✓ | ✓ |
| Sicherung herunterladen / zusammenführen / einspielen | ✓ | ✓ (plus Erinnerung auf der Übersicht) |
| KI-Aufgaben, KI-Bewertung | ✓ (mit API-Schlüssel) | – (gibt es dort nicht, Menüpunkt und Knöpfe fehlen) |
| Installieren, offline lernen | – | ✓ (App installierbar, läuft nach dem ersten Besuch auch ohne Internet) |

Der API-Schlüssel und die KI-Aufgaben aus `data/` kommen nie in die Online-Version.
Die Lernblätter (die Dateien in `content/`) sind damit öffentlich. Eine Lizenz für die Inhalte ist noch nicht festgelegt.

**Datenschutz** (steht auch in der App unter *⚙️ Einstellungen*): kein Konto, kein Tracking, keine Cookies. Fortschritt und
Einstellungen bleiben im Browser; von GitHub Pages werden nur die App und die Lerninhalte geladen, nichts von anderen Anbietern.

**Auf dem Handy:** Unter 600 px Breite gibt es unten eine Leiste (Übersicht, Lernen, Karteikarten, Üben, Mehr). Im Browsermenü
„Zum Startbildschirm hinzufügen“ bzw. „App installieren“ wählen – dann startet die App wie eine normale App und funktioniert auch
offline (Lernblätter, SQL-Editor, Formeln). Nach einem neuen Push erscheint unten der Hinweis **„🔄 Neue Version verfügbar – neu laden?“**;
erst nach „↻ Neu laden“ siehst du neue Inhalte. Wer „Später“ wählt, bekommt die neue Version, sobald alle Tabs der App geschlossen waren.

**Fortschritt umziehen:** In der lokalen App *Daten & Import → ⬇ Sicherung herunterladen* (Datei `ap2-lernapp-sicherung-JJJJ-MM-TT.json`),
dann in der Online-Version *Daten & Import → 🔀 Sicherung zusammenführen* (beide Stände bleiben erhalten, z. B. Handy und PC) oder
*⬆ Sicherung einspielen (ersetzen)* (ersetzt den dortigen Stand komplett). Andersherum genauso.
Löschst du die Browserdaten, ist der Online-Fortschritt weg – auch die automatischen Tagessicherungen im Browser. Also ab und zu eine
Sicherung herunterladen; die Übersicht erinnert dich daran.

**Lernblätter aktualisieren:** Nach dem Bearbeiten der `.md`-Dateien oder der Lernkarten im Ordner `AP-2`:

```bash
npm run sync-content   # kopiert die Lernblätter aus AP-2 nach lern-app/content/ (AP-2 wird nur gelesen)
git add content && git commit -m "Lernblätter aktualisiert" && git push
```

Jeder Push auf `main` baut und veröffentlicht die Seite automatisch (`.github/workflows/pages.yml`: Tests, `npm run build:pages`, Deployment).
Selbst bauen: `npm run build:pages` erzeugt `dist/` mit `content.json`, `sw.js` (Service Worker) und `manifest.webmanifest`; ansehen mit
`npx vite preview --mode pages`. Achtung: Der Service Worker speichert die Seite im Browser – nach einem neuen Build einmal neu laden und im
Hinweis „↻ Neu laden“ klicken (oder in den Entwicklertools *Application → Service Workers → Unregister*).

**Einmalig einrichten:** Auf GitHub im Repository *Settings → Pages → Build and deployment → Source: „GitHub Actions“* wählen.

## Funktionen

| Bereich | Was es tut |
|---|---|
| **Übersicht** | Beim ersten Besuch eine kurze Willkommensseite; danach Countdown zu deinem Prüfungstermin (unter *Einstellungen* eintragen), Lernserie (Tage in Folge), fällige Wiederholungen, Fortschritt je Thema, Klausur-Trend je Thema, schwächste Themen |
| **Lernen** | Theorie aller 15 Deep Dives mit Inhaltsverzeichnis und abhakbarem Lernziel-Check |
| **Karteikarten** | 456 Lernkarten aus `AP2_FIDPA_Lernkarten.json` (25 Decks) und 648 **Begriffskarten** aus `AP2_Fachbegriffe_Lernkarten.json` (16 Decks, je Deep Dive; Vorderseite Fachbegriff, Rückseite kurze Erklärung; Filter Typ „Fachbegriff“) plus Prüfer- und Fachgespräch-Fragen aus den Lernblättern; Filter nach Deep Dive, Deck, Typ, Schwierigkeit; „Fallen wiederholen"; Leitner-System (Tastatur: `Leertaste` umdrehen, `1`/`2`/`3` bewerten); **🟢 Leicht-Modus** mit 4 Antworten zum Einstieg (Tasten `1`–`4`, richtig bringt eine Karte höchstens in Fach 2) |
| **Übungsklausur** | 90-Minuten-Timer, 100 Punkte, Anlagen einblendbar; Lösungen erst nach Abgabe; Ergebnis mit IHK-Note |
| **Einzelaufgaben** | Filter nach Thema, Block, Schwierigkeit, Status, Suche; Auswahl als Aufgaben-/Lösungsblatt exportieren |
| **Fehlerjournal** | Jede Aufgabe unter voller Punktzahl kommt nach 1, 3 und 7 Tagen wieder |
| **KI-Aufgaben** | Neue IHK-Aufgaben (MC, Lückentext, Zuordnung, Rechnen, offen) mit Musterlösung – nur mit API-Schlüssel |
| **Material** | Lernzettel Kernthemen, Themenliste |
| **Rechenübungen** | 85 Rechenaufgaben aus den Lernblättern mit automatischer Prüfung, typischen Fehlern, Hinweisen, Rechenweg und „🎲 Neue Zahlen“; im Leicht-Modus „🟢 Ergebnis auswählen“ (gelöst zählt nur Eintippen) |
| **Einstellungen** | Eigener Prüfungstermin; Leicht-Modus mit oder ohne automatische Antworten; persönliche Einstellungen – sie stehen im Fortschritt und ziehen mit jeder Sicherung um |
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

Ohne Schlüssel funktioniert alles außer „KI-Aufgaben", „KI-Bewertung" und dem Werkzeug `npm run mc-entwurf` (siehe [Lernkarten-Datei](#lernkarten-datei)).

1. API-Schlüssel unter https://console.anthropic.com/settings/keys erstellen.
2. Im Ordner `lern-app` eine Datei `.env.local` anlegen (Vorlage: `.env.local.example`):
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Server neu starten.

Standardmodell ist `claude-sonnet-5`; mit `ANTHROPIC_MODEL=claude-opus-5` in `.env.local` lässt es sich ändern.
Der Schlüssel bleibt auf dem Server (Node) und wird nie an den Browser übertragen.

## Lernkarten-Datei

Jede Datei `*Lernkarten*.json` im Ordner `AP-2` wird importiert (aktuell `AP2_FIDPA_Lernkarten.json` und `AP2_Fachbegriffe_Lernkarten.json`). Format:

```json
{ "meta": { "hinweise": ["…"] },
  "decks": [ { "id": "sql", "titel": "SQL", "pruefungsbereich": "…", "quelle": "Deep Dive 1", "status": "behandelt",
               "karten": [ { "id": "SQL-001", "frage": "…", "antwort": "…", "typ": "wissen", "schwierigkeit": 1, "tags": ["join"] } ] } ] }
```

- `quelle` mit „Deep Dive N" ordnet das Deck dem Thema zu (bei „Deep Dive 5 und 12" gewinnt der Deep Dive, dessen Titel zum Decktitel passt). Decks ohne Deep Dive (WiSo, Projektarbeit …) sind über den Deck-Filter erreichbar.
- `typ`: wissen · abgrenzung · rechnung · anwendung · falle · begriff – „begriff" heißt: `frage` ist nur der Fachbegriff, `antwort` seine Erklärung (Begriffskarten; sie liefern auch die Erklärungen im Glossar). „falle"-Karten gibt es gesammelt über **⚠️ Fallen wiederholen** und vor jeder Übungsklausur.
- Zeilenumbrüche (`\n`) in Antworten bleiben erhalten; SQL-Zeilen werden als Codeblock angezeigt.
- Der Lernstand hängt an der Karten-`id` – IDs beim Bearbeiten der Datei also nicht ändern.
- Optional `mc` für den **Leicht-Modus** (4 Antworten, 1 richtig): `"mc": { "richtig": "…", "falsch": ["…", "…", "…"], "erklaerung": "…" }`
  – genau 3 verschiedene falsche Antworten, keine gleich der richtigen, `erklaerung` optional. Ein fehlerhafter Block steht im
  Importbericht, die Karte bleibt ohne ihn nutzbar.

### Auswahlantworten mit KI vorschlagen lassen (nur lokal)

Gute falsche Antworten müssen geschrieben werden. Dabei hilft Claude – die Vorschläge prüfst du selbst, bevor sie in die Datei kommen.
Braucht `ANTHROPIC_API_KEY` in `.env.local` (siehe oben) und kostet API-Guthaben (pro Deck meist nur Cent-Beträge).

```bash
npm run mc-entwurf -- --deck sql          # Vorschläge für Karten des Decks „sql“ ohne mc → data/mc-entwurf.json
npm run mc-entwurf -- --deck sql --max 10 # höchstens 10 Karten (Standard 30); --anwendung nimmt auch Anwendungskarten dazu
npm run mc-uebernehmen -- --probe         # zeigt nur, welche Karten einen mc-Block bekämen
npm run mc-uebernehmen                    # trägt die angenommenen Einträge in AP-2/AP2_FIDPA_Lernkarten.json ein
npm run sync-content                      # danach: für die Online-Version nach content/ kopieren
```

1. `mc-entwurf` fragt Karten der Typen wissen, abgrenzung, falle und rechnung an, die noch keinen `mc`-Block haben und noch nicht
   im Entwurf stehen. Neue Vorschläge werden an `data/mc-entwurf.json` angehängt (Status `"offen"`), schon durchgesehene bleiben.
2. Öffne `data/mc-entwurf.json`, korrigiere die Texte nach Bedarf und setze `"status"` auf `"angenommen"` oder `"abgelehnt"`.
3. `mc-uebernehmen` schreibt nur die angenommenen Einträge als Feld `mc` ans Ende der jeweiligen Karte. Reihenfolge, IDs und
   Formatierung der Datei bleiben gleich; Karten, die schon `mc` haben, werden nicht überschrieben.

In der App wird nichts generiert – alle sehen dieselben, geprüften Antworten.

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
Ein persönlicher Lernplan (`Lernplan_*.md`) wird nicht importiert; eine Kalenderwoche wie „(KW 31)“ am Ende eines Titels blendet die App aus.

Importbericht im Terminal: `npm run import-report`

## Daten

Alles bleibt lokal:

- `lern-app/data/fortschritt.json` – Versuche, Klausuren, Karteikarten, Fehlerjournal, Lernziele, Karteikarten-Lerntage (für die Lernserie), SQL-Übungen und deine Einstellungen
- `lern-app/data/generierte-aufgaben.json` – KI-Aufgaben

Sicherung: *Daten & Import → Sicherung herunterladen*. Zusätzlich legt die App beim ersten Speichern eines Tages automatisch `lern-app/data/backups/fortschritt-JJJJ-MM-TT.json` an (die letzten 14 Tage bleiben erhalten; die Seite *Daten & Import* zeigt die neueste).

**Lernserie:** Ein Lerntag ist ein Tag (nach lokaler Uhrzeit) mit mindestens einem Aufgabenversuch, einer gestarteten, abgegebenen oder abgeschlossenen Klausur oder einer bewerteten Karteikarte. Die Serie zählt die Tage in Folge bis heute; hast du heute noch nichts gelernt, zählt sie bis gestern weiter und reißt erst morgen. Karteikarten zählen erst ab diesem Update mit (vorher speicherte die App dafür kein Datum).

Mehrere Tabs: Jeder gespeicherte Stand trägt einen Revisionszähler. Hat ein anderer Tab inzwischen gespeichert, lehnt der Server das Speichern ab (HTTP 409) und die App zeigt „Die App ist in einem anderen Tab geöffnet – bitte neu laden“. Dieser Tab speichert dann nichts mehr, bis du ihn neu lädst – so überschreibt er nie den Fortschritt aus dem anderen Tab.

## Entwicklung

Technische Dokumentation (Aufbau, Datenmodell, Regeln für Änderungen): [`DOKUMENTATION.md`](DOKUMENTATION.md).
Der Umsetzungsplan (`ROADMAP.md`, Phasen 0–8) ist erledigt und wurde gelöscht; Kommentare wie „ROADMAP 8.3“ beziehen sich darauf
(nachlesen: `git show d21984e:ROADMAP.md`). Offen ist nur die Lizenz der Inhalte (siehe [Online-Version](#online-version-github-pages)).

```bash
npm run dev           # Dev-Server mit lokaler API auf http://localhost:5178
npm start             # bauen (tsc + vite build) und die gebaute App mit lokaler API per vite preview auf Port 5178 starten
npm test              # Vitest: Parser, Logik, Migration, Statistik (Formattests mit Fixtures, ein Rauchtest mit den echten Lernblättern aus content/)
npm run typecheck     # tsc -b
npm run lint          # ESLint (typescript-eslint, React-Hooks-Regeln), Warnungen zählen als Fehler
npm run format        # Prettier formatiert den Code (format:check prüft nur)
npm run build         # Typecheck + Build der lokalen App nach dist/
npm run build:pages   # statische Version für GitHub Pages nach dist/ (mit content.json)
npm run import-report # Importbericht der Lernblätter im Terminal
npm run sync-content  # Lernblätter aus AP-2 nach content/ kopieren (für Pages und Tests)
npm run mc-entwurf -- --deck <id>  # KI-Vorschläge für Auswahlantworten (Leicht-Modus) → data/mc-entwurf.json
npm run mc-uebernehmen             # angenommene Vorschläge in AP2_FIDPA_Lernkarten.json eintragen
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
Rückgang der Versuche ohne `reset: true` und veraltete Tabs per Revisionszähler ab) und `migrateProgress`. Aktuell ist Version 5
(1 → 2: `revision`, 2 → 3: `cardReviewDays`, 3 → 4: SQL-Übungen, 4 → 5: `settings`). Bei jeder Formatänderung `PROGRESS_VERSION` erhöhen, einen Schritt in `MIGRATIONS`
ergänzen und die Migrationstests in `tests/progress.test.ts` anpassen – sie laden unter anderem eine Kopie der echten Datei aus
`tests/fixtures/`. Geschrieben wird atomar (Temp-Datei + Umbenennen, mit Wiederholung, falls OneDrive die Datei sperrt), vorher entsteht
die Tagessicherung in `data/backups/`.

Aufbau:

```
lern-app/
├─ shared/        Code für Client, Server und Tests
│  ├─ config.ts     feste Werte: Klausurdauer, neue Karten je Runde, Intervalle, Speicherverzögerung, Port
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
