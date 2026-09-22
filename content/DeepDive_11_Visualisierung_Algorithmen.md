# Deep Dive 11: Datenvisualisierung & Algorithmen (KW 39)
## Lernzettel mit Übungsklausur im IHK-Stil – FIDPA AP2

---

## Prüfungsrelevanz

Dieser Deep Dive bündelt zwei Themen, die in beiden schriftlichen Prüfungsbereichen auftauchen und beide **zeichnerisch bzw. schreibend** geprüft werden – also Aufgabentypen, bei denen man üben muss statt nur zu lesen.

**Visualisierung:** Diagrammtyp begründet auswählen, ein gegebenes Diagramm kritisch beurteilen, Manipulationen erkennen, ein Dashboard konzipieren. Der Aufgabentyp „Beurteilen Sie die folgende Darstellung" ist ein Dauerbrenner.

**Algorithmen:** Struktogramm oder Programmablaufplan erstellen, Pseudocode ergänzen, Fehler in gegebenem Pseudocode finden. Geprüft wird **algorithmisches Denken**, nicht eine konkrete Programmiersprache – Syntaxfehler kosten keine Punkte, Logikfehler schon.

Szenario: **Möbelhaus Nordholz GmbH**.

---

# TEIL A – DATENVISUALISIERUNG

## A1 – Den richtigen Diagrammtyp wählen

Die Wahl folgt **immer der Aussageabsicht**, nie dem Geschmack. Vier Grundfragen:

| Aussageziel | Diagrammtyp | Hinweise |
|---|---|---|
| **Entwicklung über die Zeit** | Liniendiagramm | Zeit immer auf die x-Achse; bei wenigen Zeitpunkten auch Säulen |
| **Vergleich von Kategorien** | Balken- oder Säulendiagramm | Balken (waagerecht) bei langen Kategorienamen; absteigend sortieren |
| **Verteilung eines Merkmals** | Histogramm, Boxplot | Histogramm zeigt die Form, Boxplot vergleicht mehrere Gruppen |
| **Zusammenhang zweier Merkmale** | Streudiagramm | unabhängige Größe auf die x-Achse (→ Deep Dive 4) |
| **Anteile am Ganzen** | Kreisdiagramm, gestapelte Balken | nur bei wenigen Kategorien (Faustregel: maximal fünf) |
| **Muster in einer Matrix** | Heatmap | z. B. Umsatz je Filiale und Monat |
| **Rangfolge** | sortiertes Balkendiagramm | schlägt jedes Kreisdiagramm |

**Wann kein Kreisdiagramm?** Sobald mehr als etwa fünf Segmente auftreten, Anteile verglichen werden sollen oder sich die Werte ähneln – Winkelflächen kann das Auge deutlich schlechter vergleichen als Balkenlängen. Ein Kreisdiagramm eignet sich nur, wenn eine grobe Aussage wie „mehr als die Hälfte" genügt.

**Regel für Zeitreihen:** Liniendiagramme verbinden Datenpunkte und suggerieren damit einen stetigen Verlauf. Bei kategorialen Daten (Umsatz je Filiale) ist diese Verbindung sachlich falsch – dort gehören Säulen hin.

## A2 – Gestaltungsregeln

- **Achsenbeschriftung mit Einheit**, immer. Ein Diagramm ohne Einheit ist wertlos.
- **Nullpunkt bei Balken- und Säulendiagrammen zwingend** – die Länge codiert den Wert. Bei Liniendiagrammen ist ein beschnittener Ausschnitt vertretbar, muss aber gekennzeichnet sein.
- **Sparsam mit Farben:** Farbe soll Bedeutung tragen, nicht dekorieren. Eine Hervorhebungsfarbe plus Grautöne wirkt fast immer besser als eine Regenbogenpalette.
- **Sortieren** statt alphabetisch belassen – die Reihenfolge ist selbst eine Information.
- **Keine 3D-Effekte, keine Schatten, keine doppelten Y-Achsen** – alle drei verzerren die Wahrnehmung.
- **Beschriftung direkt am Element** statt in einer entfernten Legende, wo möglich.
- **Barrierefreiheit:** Rund 8 % der Männer haben eine Rot-Grün-Schwäche. Informationen nie allein über Farbe codieren – zusätzlich Form, Muster oder Beschriftung verwenden.

## A3 – Manipulation erkennen

Das ist der prüfungsrelevanteste Teil. Die häufigsten Techniken:

| Technik | Wirkung |
|---|---|
| **Abgeschnittene y-Achse** bei Balken | Kleine Unterschiede erscheinen dramatisch |
| **Gestauchte oder gedehnte Achse** | Trends wirken flach oder steil |
| **3D-Darstellung** | vordere Segmente erscheinen größer |
| **Zwei Y-Achsen mit unterschiedlicher Skalierung** | erzeugt Scheinzusammenhänge zwischen unabhängigen Größen |
| **Ungleiche Klassenbreiten** | verzerrt Häufigkeitsverteilungen |
| **Auswahl des Zeitausschnitts** | Ein günstig gewählter Startpunkt macht aus einem Rückgang einen Anstieg |
| **Prozent statt Prozentpunkte** | → Deep Dive 4 |

**Durchgerechnetes Beispiel:** Umsätze 4,80 · 4,95 · 5,10 Mio. € in drei Jahren.
Tatsächliches Wachstum: +3,13 %, dann +3,03 %, insgesamt **+6,25 %** – ein flacher, leicht steigender Verlauf.
Beginnt die y-Achse jedoch bei 4,70 Mio. €, betragen die sichtbaren Balkenhöhen 0,10 · 0,25 · 0,40. Das Verhältnis **1 : 2,5 : 4** suggeriert eine Vervierfachung. Die Zahlen stimmen, das Bild lügt.

**Prüfungsformulierung:** „Die y-Achse beginnt nicht bei null. Dadurch erscheinen die Unterschiede erheblich größer, als sie sind – der tatsächliche Zuwachs beträgt lediglich 6,25 %. Für Balkendiagramme ist ein Nullpunkt zwingend, da die Balkenlänge den Wert codiert."

## A4 – Dashboards

Ein Dashboard ist kein Diagrammfriedhof, sondern beantwortet **eine definierte Frage für eine definierte Zielgruppe**.

- **Zielgruppe zuerst:** Geschäftsführung braucht wenige verdichtete Kennzahlen mit Ampellogik; die Fachabteilung braucht Details und Filter.
- **Vergleichsmaßstab mitliefern:** Eine Zahl ohne Bezug ist keine Information. Immer Vorperiode, Plan-Wert oder Zielwert danebenstellen.
- **Wenige Kennzahlen:** Faustregel fünf bis sieben pro Sicht.
- **Wichtigstes links oben** – die übliche Leserichtung.
- **Einheitliche Skalen** bei nebeneinanderliegenden Diagrammen, sonst sind sie nicht vergleichbar.
- **Aktualitätsstempel:** Wann wurden die Daten zuletzt geladen? Ohne diese Angabe weiß niemand, worauf er schaut.

---

# TEIL B – ALGORITHMEN UND PSEUDOCODE

## B1 – Die drei Kontrollstrukturen

Jeder Algorithmus lässt sich aus drei Bausteinen aufbauen:

1. **Sequenz** – Anweisungen nacheinander
2. **Verzweigung** (Selektion) – einseitig (WENN), zweiseitig (WENN-SONST), mehrfach (FALLUNTERSCHEIDUNG)
3. **Wiederholung** (Iteration) – kopfgesteuert (SOLANGE), fußgesteuert (WIEDERHOLE-BIS), zählergesteuert (FÜR)

**Kopf- oder fußgesteuert?** Die kopfgesteuerte Schleife prüft **vor** dem ersten Durchlauf – sie kann also **nullmal** ausgeführt werden. Die fußgesteuerte prüft **danach** und läuft daher **mindestens einmal**. Diese Unterscheidung ist eine klassische Prüfungsfrage.

## B2 – Struktogramm (Nassi-Shneiderman)

```
┌──────────────────────────────────┐
│ Sequenz: Anweisung 1             │
├──────────────────────────────────┤
│ Anweisung 2                      │
├──────────────────────────────────┤
│         Bedingung?               │   Verzweigung
│   ja    ╱          ╲    nein     │
│  ┌──────────┬──────────┐         │
│  │ Zweig A  │ Zweig B  │         │
│  └──────────┴──────────┘         │
├──────────────────────────────────┤
│ SOLANGE Bedingung                │   kopfgesteuerte Schleife
│ ┌──────────────────────────────┐ │
│ │ Schleifenrumpf               │ │
│ └──────────────────────────────┘ │
├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │   fußgesteuerte Schleife
│ │ Schleifenrumpf               │ │
│ └──────────────────────────────┘ │
│ WIEDERHOLE BIS Bedingung         │
└──────────────────────────────────┘
```

**Merkmale:** Struktogramme sind blockorientiert und erzwingen strukturierte Programmierung – Sprünge sind gar nicht darstellbar. Nachteil: Änderungen sind aufwendig, und tiefe Verschachtelungen werden sehr schmal.

## B3 – Programmablaufplan (PAP) – die Symbole

| Symbol | Bedeutung |
|---|---|
| Oval / abgerundetes Rechteck | Start und Ende |
| Rechteck | Verarbeitung/Anweisung |
| **Raute** | Verzweigung (Bedingung), mit ja/nein beschriftet |
| Parallelogramm | Eingabe/Ausgabe |
| Pfeil | Ablaufrichtung |

**Unterschied zum Struktogramm:** Der PAP kann Sprünge darstellen und wird daher schnell unübersichtlich; er zeigt den Kontrollfluss aber anschaulicher.

## B4 – Pseudocode-Konventionen

Es gibt keine verbindliche Norm – wichtig ist **Eindeutigkeit und Einrückung**. Bewährte Schreibweise für die Prüfung:

```
ALGORITHMUS Ausreisser_zaehlen
EINGABE: liste[1..n], mittelwert, standardabweichung
AUSGABE: anzahl

anzahl ← 0
untere_grenze ← mittelwert - 3 * standardabweichung
obere_grenze  ← mittelwert + 3 * standardabweichung

FÜR i VON 1 BIS n
    WENN liste[i] < untere_grenze ODER liste[i] > obere_grenze DANN
        anzahl ← anzahl + 1
    ENDE WENN
ENDE FÜR

AUSGABE anzahl
```

**Vier Regeln, die Punkte sichern:**
1. **Initialisierung nicht vergessen** – Zähler und Summen vor der Schleife auf 0 setzen.
2. **Ein- und Ausgabe benennen.**
3. **Blöcke sauber schließen** (ENDE WENN, ENDE FÜR) und konsequent einrücken.
4. **Zuweisung und Vergleich unterscheiden:** `←` oder `:=` weist zu, `=` vergleicht.

## B5 – Die Standardalgorithmen

Diese Muster decken die meisten Prüfungsaufgaben ab:

| Aufgabe | Kern |
|---|---|
| **Summe bilden** | `summe ← 0` vor der Schleife, in der Schleife `summe ← summe + wert` |
| **Zählen mit Bedingung** | `anzahl ← 0`, in der Schleife `WENN Bedingung DANN anzahl ← anzahl + 1` |
| **Mittelwert** | Summe und Anzahl bilden, danach teilen – **mit Division-durch-null-Prüfung** |
| **Maximum suchen** | `max ← liste[1]`, dann `WENN liste[i] > max DANN max ← liste[i]` |
| **Prüfen und protokollieren** | je Datensatz Regeln prüfen, Fehlerzähler erhöhen, fehlerhaften Satz ausgeben |

⚠️ **Der Maximum-Klassiker:** `max ← 0` funktioniert nur, wenn alle Werte positiv sind. Bei möglichen negativen Werten ist das Ergebnis falsch. Richtig ist die Initialisierung mit dem **ersten Listenelement**.

## B6 – Typische Logikfehler (Fehlersuche-Aufgaben)

| Fehler | Symptom |
|---|---|
| Zähler/Summe nicht initialisiert | undefiniertes oder falsches Ergebnis |
| Initialisierung **innerhalb** der Schleife | Wert wird bei jedem Durchlauf zurückgesetzt |
| **Off-by-one:** `BIS n-1` statt `BIS n` | letzter Datensatz wird nicht geprüft |
| Abbruchbedingung wird nie erreicht | Endlosschleife |
| `=` statt `←` (oder umgekehrt) | Vergleich statt Zuweisung |
| UND statt ODER bei Bereichsprüfungen | Bedingung kann nie wahr werden |
| Division ohne Nullprüfung | Laufzeitfehler bei leerer Liste |
| NULL-Werte nicht behandelt | fehlende Werte gehen als 0 in die Summe ein |

Der letzte Punkt ist der fachlich wichtigste für deine Fachrichtung: **Ein fehlender Wert ist nicht null.** Wer NULL als 0 mitrechnet, verfälscht jeden Mittelwert (→ Deep Dive 9).

---

## Die 8 häufigsten Fehler aus Prüfersicht

1. Diagrammtyp gewählt, ohne die Aussageabsicht zu begründen.
2. Kreisdiagramm mit zu vielen Segmenten verwendet.
3. Beschnittene y-Achse bei einem Balkendiagramm nicht beanstandet.
4. Achsen ohne Einheit beschriftet.
5. Zähler oder Summe im Pseudocode nicht initialisiert.
6. Kopf- und fußgesteuerte Schleife verwechselt.
7. Maximum mit 0 statt mit dem ersten Element initialisiert.
8. Fehlende Werte im Algorithmus wie Nullen behandelt.

---

# Übungsklausur Visualisierung & Algorithmen (100 Punkte, 90 Minuten)

Bearbeite die Klausur **am Ende von KW 39** am Stück, handschriftlich, mit Lineal.

## Block A – Diagrammwahl (20 P)

**A1 (12 P):** *Ordnen* Sie den folgenden sechs Auswertungswünschen jeweils einen geeigneten Diagrammtyp zu und *begründen* Sie die Wahl kurz:
(a) Monatsumsatz der letzten 24 Monate · (b) Umsatzvergleich der acht Filialen · (c) Verteilung der Reparaturdauern · (d) Zusammenhang zwischen Werbebudget und Umsatz · (e) Anteil der vier Produktkategorien am Gesamtumsatz · (f) Umsatz je Filiale und Monat in einer Übersicht

**A2 (8 P):** Ein Kollege stellt den Umsatz der acht Filialen als Kreisdiagramm mit 3D-Effekt dar, alphabetisch sortiert. *Benennen* Sie drei Mängel und *schlagen* Sie eine bessere Darstellung mit Begründung *vor*.

## Block B – Diagramme beurteilen (22 P)

**B1 (12 P):** Ein Bericht zeigt ein Säulendiagramm der Jahresumsätze 4,80 / 4,95 / 5,10 Mio. €. Die y-Achse beginnt bei 4,70 Mio. €. Die Überschrift lautet „Umsatz explodiert".
a) *Berechnen* Sie das tatsächliche Gesamtwachstum in Prozent. (4 P)
b) *Erläutern* Sie, welchen Eindruck die gewählte Achse erzeugt und warum. (4 P)
c) *Beurteilen* Sie die Überschrift und *formulieren* Sie eine sachlich korrekte Alternative. (4 P)

**B2 (6 P):** *Nennen* Sie drei weitere Techniken, mit denen Diagramme irreführend gestaltet werden können, und *erläutern* Sie je die Wirkung.

**B3 (4 P):** *Erläutern* Sie, warum Informationen in Diagrammen nicht ausschließlich über Farbe codiert werden sollten, und *nennen* Sie zwei Alternativen.

## Block C – Dashboard konzipieren (14 P)

**C1 (8 P):** *Entwerfen* Sie ein Dashboard für die Geschäftsführung zur Überwachung des Reparaturservice. *Nennen* Sie vier Kennzahlen mit jeweils passender Darstellungsform und *begründen* Sie Ihre Auswahl.

**C2 (6 P):** *Nennen* Sie drei Gestaltungsgrundsätze für Dashboards und *erläutern* Sie, warum jede Kennzahl einen Vergleichsmaßstab benötigt.

## Block D – Algorithmen entwickeln (28 P)

**D1 (6 P):** *Erläutern* Sie den Unterschied zwischen kopf- und fußgesteuerter Schleife. *Geben* Sie für jede einen passenden Anwendungsfall an.

**D2 (12 P):** *Entwickeln* Sie einen Algorithmus in **Pseudocode**, der eine Liste von Reparaturdauern prüft. Der Algorithmus soll: alle Werte zählen, ungültige Werte (kleiner oder gleich 0 sowie fehlende Werte) separat zählen und nicht in die Berechnung einbeziehen, aus den gültigen Werten den Mittelwert berechnen und Anzahl gültiger Werte, Anzahl ungültiger Werte sowie den Mittelwert ausgeben. *Berücksichtigen* Sie den Fall, dass kein gültiger Wert vorhanden ist.

**D3 (10 P):** *Zeichnen* Sie ein **Struktogramm** für folgenden Ablauf: Für jeden Kundendatensatz wird geprüft, ob eine E-Mail-Adresse vorhanden ist. Fehlt sie, wird ein Fehlerzähler erhöht und der Datensatz protokolliert. Ist sie vorhanden, wird zusätzlich das Format geprüft; bei ungültigem Format wird ebenfalls der Fehlerzähler erhöht. Am Ende wird der Fehlerzähler ausgegeben.

## Block E – Fehlersuche (16 P)

Der folgende Pseudocode soll den höchsten Auftragswert einer Liste mit n Einträgen finden und die Anzahl der Aufträge über 1.000 € zählen. Er enthält **vier Fehler**.

```
ALGORITHMUS Auswertung
EINGABE: auftrag[1..n]

max ← 0

FÜR i VON 1 BIS n-1
    WENN auftrag[i] > max DANN
        max ← auftrag[i]
    ENDE WENN
    anzahl ← 0
    WENN auftrag[i] > 1000 UND auftrag[i] < 500 DANN
        anzahl ← anzahl + 1
    ENDE WENN
ENDE FÜR

AUSGABE max, anzahl
```

**E1 (12 P):** *Benennen* Sie die vier Fehler, *erläutern* Sie jeweils die Auswirkung und *geben* Sie die Korrektur an.

**E2 (4 P):** *Erläutern* Sie, warum die Initialisierung `max ← 0` auch dann problematisch bleibt, wenn alle übrigen Fehler behoben sind.

---

## Fachgespräch: typische Fragen des Ausschusses

1. „Warum haben Sie für diese Auswertung genau diesen Diagrammtyp gewählt?"
2. „An wen richtet sich Ihr Dashboard, und woher wissen Sie, dass es dort verstanden wird?"
3. „Welche Kennzahl würden Sie weglassen, wenn Sie nur drei zeigen dürften?"
4. „Wie haben Sie in Ihrer Auswertung mit fehlenden Werten gerechnet?"
5. „Beschreiben Sie den Ablauf Ihres Prüfskripts – was passiert Schritt für Schritt?"

---

## Lernziel-Check (Ende KW 39 alles mit Ja beantworten)

- [ ] Ich wähle den Diagrammtyp begründet nach der Aussageabsicht.
- [ ] Ich kenne die Grenzen des Kreisdiagramms und die Regel zum Nullpunkt bei Balken.
- [ ] Ich erkenne mindestens fünf Manipulationstechniken und beschreibe ihre Wirkung.
- [ ] Ich konzipiere ein Dashboard zielgruppengerecht mit Vergleichsmaßstäben.
- [ ] Ich unterscheide kopf- und fußgesteuerte Schleifen sicher.
- [ ] Ich schreibe Pseudocode mit Initialisierung, sauberen Blöcken und Randfallprüfung.
- [ ] Ich zeichne Struktogramme mit Sequenz, Verzweigung und Schleife.
- [ ] Ich finde Logikfehler in gegebenem Pseudocode, insbesondere Off-by-one und fehlende Initialisierung.
- [ ] Übungsklausur mit ≥ 92 Punkten bestanden.
