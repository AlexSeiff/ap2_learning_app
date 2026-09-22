# Deep Dive 12: Projektmanagement & Wirtschaftlichkeit (KW 40)
## Lernzettel mit Übungsklausur im IHK-Stil – FIDPA AP2

---

## Prüfungsrelevanz

Dieser Deep Dive eröffnet die **Anwendungsphase** deines Lernplans und ist doppelt wertvoll: Er deckt einen großen Teil des Prüfungsbereichs **„Durchführen einer Prozessanalyse"** ab (Wirtschaftlichkeitskontrolle, Projektplanung) – und er ist zugleich das **Handwerkszeug für deine eigene Projektarbeit**, die 50 % der Gesamtnote ausmacht.

Typische Aufgaben: Lasten- und Pflichtenheft abgrenzen, Vorgehensmodelle vergleichen, **Netzplan berechnen** (kritischer Pfad, Puffer), **Nutzwertanalyse** durchführen, **Amortisation und Break-even** berechnen, Risiken bewerten.

Die Rechenaufgaben sind mechanisch und damit sichere Punkte – Netzplan und Nutzwertanalyse gehören zu den zuverlässigsten Aufgabentypen der ganzen Prüfung.

Szenario: **Möbelhaus Nordholz GmbH**.

---

# Teil 1 – Projektgrundlagen

## 1.1 Was ein Projekt ausmacht

Merkmale nach DIN 69901: **einmalig**, **zeitlich befristet** (definierter Anfang und Ende), **zielorientiert**, **neuartig/komplex**, mit **begrenzten Ressourcen** und meist **interdisziplinär**. Wiederkehrende Routineaufgaben sind kein Projekt – das ist die klassische Abgrenzungsfrage.

**Magisches Dreieck:** **Zeit – Kosten – Leistung/Qualität**. Die drei Größen stehen in Konkurrenz: Wer den Termin vorzieht, muss Kosten erhöhen oder Umfang reduzieren. „Alles gleichzeitig optimieren" gibt es nicht – genau diese Abwägung erwarten Prüfer als Antwort.

## 1.2 Ziele und Anforderungen

**SMART-Ziele:** **S**pezifisch · **M**essbar · **A**ttraktiv/Akzeptiert · **R**ealistisch · **T**erminiert.
Schlecht: „Die Prozesse sollen verbessert werden." Gut: „Die durchschnittliche Durchlaufzeit im Reparaturprozess wird bis zum 31.03.2027 von 30 auf 20 Stunden gesenkt."

| | **Funktionale Anforderung** | **Nicht-funktionale Anforderung** |
|---|---|---|
| Frage | *Was* soll das System können? | *Wie gut* soll es das können? |
| Beispiel | „Das System erstellt einen Kostenvoranschlag." | „Der Seitenaufbau dauert höchstens zwei Sekunden." |
| Weitere | Auswertung exportieren, Rechte verwalten | Verfügbarkeit, Sicherheit, Bedienbarkeit, Skalierbarkeit, Wartbarkeit |

**Nicht-funktionale Anforderungen werden am häufigsten vergessen** – in Prüfungsaufgaben wie in echten Projekten.

## 1.3 Lastenheft und Pflichtenheft

| | **Lastenheft** | **Pflichtenheft** |
|---|---|---|
| Erstellt von | **Auftraggeber** | **Auftragnehmer** |
| Inhalt | *Was* wird gefordert und *wofür* | *Wie und womit* wird es umgesetzt |
| Zeitpunkt | vor der Beauftragung, Grundlage der Ausschreibung | nach Beauftragung, vor der Umsetzung |
| Charakter | Anforderungen aus Anwendersicht | Umsetzungskonzept, technische Lösung |

Das Pflichtenheft wird vom Auftraggeber **abgenommen** und ist damit die verbindliche Grundlage für die spätere Abnahme des Ergebnisses.

## 1.4 Stakeholder und Risiken

**Stakeholderanalyse:** Betroffene und Beteiligte identifizieren, nach **Einfluss** und **Interesse** bewerten und daraus die Einbindungsstrategie ableiten. Hoher Einfluss plus hohes Interesse bedeutet enge Einbindung; niedrig/niedrig bedeutet lediglich informieren. Typische Stakeholder eines Datenprojekts: Fachbereich, IT, Geschäftsführung, **Betriebsrat**, Datenschutzbeauftragter, externe Dienstleister.

**Risikomanagement:** Risiken identifizieren → bewerten → Maßnahmen festlegen → überwachen.
**Risikoprioritätszahl = Eintrittswahrscheinlichkeit × Schadenshöhe** (jeweils auf einer Skala, z. B. 1–5).
Vier Strategien: **vermeiden** (Ursache ausschalten), **vermindern** (Wahrscheinlichkeit oder Schaden senken), **übertragen** (Versicherung, Vertrag), **akzeptieren** (bewusst tragen, mit Rückfallplan).

---

# Teil 2 – Vorgehensmodelle

| Modell | Prinzip | Stärke | Schwäche |
|---|---|---|---|
| **Wasserfall** | streng sequenzielle Phasen | klare Planung, feste Termine und Kosten | starr; Änderungen sind teuer; Ergebnis erst am Ende sichtbar |
| **V-Modell** | Wasserfall mit zugeordneten Teststufen je Phase | hohe Qualitätssicherung, Nachweisbarkeit | ebenso starr, hoher Dokumentationsaufwand |
| **Scrum** | iterativ-inkrementell in Sprints | schnelle Rückmeldung, flexibel bei unklaren Anforderungen | Aufwand und Endtermin schwerer festzulegen |
| **Kanban** | Fluss visualisieren, WIP begrenzen | einfach einführbar, für laufenden Betrieb geeignet | keine feste Planungsstruktur |

**Scrum im Detail** (wird regelmäßig abgefragt):
- **Rollen:** **Product Owner** (verantwortet das Produkt und die Priorisierung des Backlogs), **Scrum Master** (sorgt für die Einhaltung des Rahmenwerks, beseitigt Hindernisse – keine Führungskraft), **Entwicklungsteam** (selbstorganisiert, liefert das Inkrement)
- **Artefakte:** Product Backlog, Sprint Backlog, Inkrement
- **Events:** Sprint (2–4 Wochen), Sprint Planning, Daily Scrum (15 Minuten), Sprint Review (Ergebnis zeigen), Retrospektive (Zusammenarbeit verbessern)

**Auswahlbegründung in Prüfungen:** Sind die Anforderungen **klar und stabil**, passt ein klassisches Modell. Sind sie **unklar oder veränderlich** und ist der Fachbereich laufend verfügbar, passt ein agiles Modell. Bei Ausbildungsprojekten mit fester IHK-Frist ist oft ein **hybrides** Vorgehen sinnvoll: klassischer Rahmen mit festen Meilensteinen, iterative Umsetzung im Inneren.

---

# Teil 3 – Planung und Netzplantechnik

## 3.1 Projektstrukturplan und Aufwandsschätzung

Der **Projektstrukturplan (PSP)** zerlegt das Projekt hierarchisch in Teilaufgaben bis hinunter zu **Arbeitspaketen** – der kleinsten planbaren Einheit mit eigenem Verantwortlichen, Aufwand und Ergebnis. Er ist die Grundlage für alles Weitere: Terminplanung, Kostenplanung, Zuständigkeiten.

**Schätzverfahren:** Analogieschätzung (Vergleich mit ähnlichen Projekten) · Expertenschätzung · **Drei-Zeiten-Methode (PERT)**:

**t_e = (optimistisch + 4 · wahrscheinlich + pessimistisch) / 6**

Beispiel: o = 4, m = 7, p = 16 Tage → t_e = (4 + 28 + 16) / 6 = **8 Tage**. Der pessimistische Wert zieht den Erwartungswert nach oben – genau das ist gewollt, denn Aufwände werden systematisch unterschätzt.

## 3.2 Netzplantechnik – der Rechenteil

Vier Zeitwerte je Vorgang:
- **FAZ** (frühester Anfangszeitpunkt) · **FEZ** (frühestes Ende) = FAZ + Dauer
- **SAZ** (spätester Anfang) = SEZ − Dauer · **SEZ** (spätestes Ende)

**Vorwärtsrechnung** (Projektstart = 0): FAZ eines Vorgangs = **größtes** FEZ aller Vorgänger. Das größte FEZ am Ende ist die **Projektdauer**.
**Rückwärtsrechnung** (vom Projektende): SEZ eines Vorgangs = **kleinstes** SAZ aller Nachfolger.

**Puffer:**
- **Gesamtpuffer GP = SAZ − FAZ** (auch SEZ − FEZ) – um wie viel darf sich der Vorgang verschieben, **ohne den Projekttermin** zu gefährden?
- **Freier Puffer FP = kleinstes FAZ der Nachfolger − FEZ** – um wie viel darf er sich verschieben, **ohne einen Nachfolger** zu verzögern?

**Kritischer Pfad:** die Kette der Vorgänge mit **Gesamtpuffer 0**. Jede Verzögerung dort verschiebt das Projektende unmittelbar. Merke: Der kritische Pfad ist der **längste** Weg durch den Netzplan – nicht der kürzeste.

**Merkregeln für die Klausur:** Vorwärts das **Maximum**, rückwärts das **Minimum**. Wer das vertauscht, rechnet den gesamten Plan falsch. Und: Der freie Puffer ist nie größer als der Gesamtpuffer.

## 3.3 Gantt-Diagramm

Balkendiagramm über der Zeitachse; zeigt Dauer, Überlappungen, Meilensteine und Abhängigkeiten anschaulich. Es ist das Kommunikationswerkzeug – der Netzplan ist das Rechenwerkzeug. In der Projektdokumentation gehört ein Gantt-Diagramm in die Zeitplanung.

---

# Teil 4 – Wirtschaftlichkeit

## 4.1 Kostenarten

| Gliederung | Beispiele |
|---|---|
| **Einmalig** | Anschaffung, Einführung, Schulung, Migration |
| **Laufend** | Lizenzen, Wartung, Betrieb, Support, Personal |
| **Fix / variabel** | Serverkosten (fix) vs. transaktionsabhängige Gebühren (variabel) |
| **Direkt / indirekt** | Projektpersonal vs. anteilige Gemeinkosten |

**Total Cost of Ownership (TCO):** alle Kosten über den gesamten Lebenszyklus – Anschaffung, Betrieb, Schulung, Wartung, Migration und **Außerbetriebnahme**. Der häufigste Fehler in Wirtschaftlichkeitsrechnungen ist die Beschränkung auf den Anschaffungspreis.

## 4.2 Die vier Rechnungen

**Amortisationszeit = Investition / jährlicher Rückfluss**
Beispiel: 45.000 € / 18.000 € pro Jahr = **2,5 Jahre**

**Return on Investment (ROI) = Gewinn / eingesetztes Kapital · 100**
Bei fünf Jahren Nutzungsdauer: Gesamtersparnis 5 · 18.000 = 90.000 €, abzüglich Investition 45.000 € → Gewinn 45.000 €.
ROI über die Laufzeit = 45.000 / 45.000 = **100 %**, entspricht **20 % pro Jahr**.

**Break-even-Menge = Fixkosten / (Preis − variable Stückkosten)**
Beispiel: 24.000 € / (80 € − 50 €) = 24.000 / 30 = **800 Stück**. Der Nenner ist der **Deckungsbeitrag je Stück**.

**Nutzwertanalyse** – für Entscheidungen mit nicht-monetären Kriterien:
1. Kriterien festlegen · 2. Gewichten (Summe 100 %) · 3. Punkte je Alternative vergeben (z. B. 1–10) · 4. Punkte × Gewicht = Teilnutzen · 5. Teilnutzen summieren → höchster Nutzwert gewinnt.

| Kriterium | Gewicht | Anbieter A | Teilnutzen A | Anbieter B | Teilnutzen B |
|---|---|---|---|---|---|
| Funktionsumfang | 40 % | 8 | 3,20 | 6 | 2,40 |
| Kosten | 30 % | 5 | 1,50 | 9 | 2,70 |
| Integration | 20 % | 9 | 1,80 | 7 | 1,40 |
| Support | 10 % | 7 | 0,70 | 8 | 0,80 |
| **Nutzwert** | **100 %** | | **7,20** | | **7,30** |

Anbieter B gewinnt – aber nur um 0,10 Punkte. **Genau das gehört in die Beurteilung:** Bei so knappem Abstand entscheidet die subjektive Gewichtung das Ergebnis. Eine **Sensitivitätsprüfung** (was passiert, wenn Kosten nur 20 % statt 30 % wiegen?) ist dann Pflicht.

**Grenzen der Nutzwertanalyse:** Kriterienauswahl, Gewichtung und Punktvergabe sind subjektiv; die Scheingenauigkeit der Zahlen verdeckt das. Vorteil bleibt: Sie macht qualitative Kriterien vergleichbar und die Entscheidung **nachvollziehbar dokumentiert**.

## 4.3 Make or Buy

| | Eigenentwicklung | Fremdbezug |
|---|---|---|
| Pro | passgenau, Know-how bleibt im Haus, keine Lizenzkosten, unabhängig | schnell verfügbar, kalkulierbare Kosten, Support, erprobt |
| Contra | Personalbindung, Wartung dauerhaft selbst, Risiko | Anbieterabhängigkeit, laufende Lizenzkosten, eingeschränkte Anpassbarkeit |

---

# Teil 5 – Steuerung und Abschluss

- **Meilensteine:** Zeitpunkte mit überprüfbarem Ergebnis, keine Aktivitäten. Sie haben die Dauer null.
- **Soll-Ist-Vergleich:** regelmäßiger Abgleich von Terminen, Kosten und Leistung – die Grundlage jeder Steuerung und der **Kern deines Abschlusskapitels** in der Projektdokumentation.
- **Änderungsmanagement:** Änderungswünsche bewerten (Auswirkung auf Zeit, Kosten, Qualität), entscheiden, dokumentieren – nicht stillschweigend einbauen. Unkontrolliertes Anwachsen des Umfangs heißt **Scope Creep** und ist die häufigste Ursache für gerissene Termine.
- **Abnahme:** formale Prüfung gegen das Pflichtenheft bzw. die vereinbarten Abnahmekriterien.
- **Projektabschluss:** Ergebnisübergabe, Dokumentation, **Lessons Learned**, Entlastung des Teams.

> ❓ **Prüferfrage:** Warum gehört in jede Wirtschaftlichkeitsbetrachtung auch eine qualitative Bewertung?
> *Weil sich wesentliche Effekte nicht sinnvoll in Euro ausdrücken lassen – Fehlerreduktion, Mitarbeiterakzeptanz, Kundenzufriedenheit, Skalierbarkeit, Abhängigkeit vom Anbieter. Eine rein monetäre Rechnung wirkt präzise, blendet aber genau die Faktoren aus, an denen Projekte in der Praxis scheitern.*

---

## Die 8 häufigsten Fehler aus Prüfersicht

1. Lasten- und Pflichtenheft verwechselt (wer erstellt was).
2. Nicht-funktionale Anforderungen vergessen.
3. Im Netzplan vorwärts das Minimum statt des Maximums gebildet.
4. Kritischen Pfad als kürzesten statt als längsten Weg bezeichnet.
5. Gesamtpuffer und freien Puffer gleichgesetzt.
6. Nutzwertanalyse ohne Beurteilung des Ergebnisses abgegeben.
7. Wirtschaftlichkeit nur über den Anschaffungspreis gerechnet (TCO ignoriert).
8. Amortisationszeit berechnet, aber nicht mit der Nutzungsdauer verglichen.

---

# Übungsklausur Projektmanagement & Wirtschaftlichkeit (100 Punkte, 90 Minuten)

Bearbeite die Klausur **am Ende von KW 40** am Stück, handschriftlich, mit Taschenrechner und Lineal.

## Ausgangslage

Die Möbelhaus Nordholz GmbH plant ein Projekt zur Einführung eines Reporting-Systems.

## Block A – Grundlagen (20 P)

**A1 (6 P):** *Nennen* Sie vier Merkmale eines Projekts und *begründen* Sie, warum die monatliche Umsatzauswertung kein Projekt ist.

**A2 (6 P):** *Grenzen* Sie Lastenheft und Pflichtenheft *ab*: Wer erstellt jeweils was, wann und mit welchem Inhalt?

**A3 (4 P):** *Erläutern* Sie den Unterschied zwischen funktionalen und nicht-funktionalen Anforderungen und *geben* Sie für das Reporting-System je zwei Beispiele.

**A4 (4 P):** *Formulieren* Sie ein SMART-Ziel für das Projekt und *weisen* Sie alle fünf Kriterien in Ihrer Formulierung *nach*.

## Block B – Vorgehensmodelle (14 P)

**B1 (8 P):** *Vergleichen* Sie Wasserfallmodell und Scrum anhand von vier Kriterien.

**B2 (6 P):** *Nennen* Sie die drei Scrum-Rollen mit je einer Hauptaufgabe. *Begründen* Sie anschließend, welches Vorgehensmodell Sie für dieses Projekt empfehlen, wenn die Anforderungen des Fachbereichs noch unklar sind, der Endtermin aber feststeht.

## Block C – Netzplan (28 P)

| Vorgang | Beschreibung | Dauer (Tage) | Vorgänger |
|---|---|---|---|
| A | Anforderungsanalyse | 5 | – |
| B | Datenmodell entwerfen | 4 | A |
| C | Datenquellen anbinden | 6 | A |
| D | ETL-Strecke entwickeln | 8 | B, C |
| E | Dashboard entwerfen | 3 | B |
| F | Test | 4 | D, E |
| G | Dokumentation | 2 | F |

**C1 (16 P):** *Berechnen* Sie für alle Vorgänge FAZ, FEZ, SAZ und SEZ. *Stellen* Sie das Ergebnis tabellarisch dar. Projektstart ist Tag 0.

**C2 (4 P):** *Bestimmen* Sie die Projektdauer und den kritischen Pfad.

**C3 (6 P):** *Berechnen* Sie für die Vorgänge B und E jeweils Gesamtpuffer und freien Puffer. *Erläutern* Sie den Unterschied beider Puffergrößen am Vorgang B.

**C4 (2 P):** Vorgang C verzögert sich um zwei Tage. *Beurteilen* Sie die Auswirkung auf den Projekttermin.

## Block D – Wirtschaftlichkeit (26 P)

**D1 (8 P):** Das Reporting-System kostet einmalig 45.000 €. Es spart jährlich 18.000 € an manuellem Auswertungsaufwand. Die geplante Nutzungsdauer beträgt fünf Jahre.
a) *Berechnen* Sie die Amortisationszeit. (3 P)
b) *Berechnen* Sie den ROI über die gesamte Nutzungsdauer. (3 P)
c) *Beurteilen* Sie die Investition. (2 P)

**D2 (10 P):** Zwei Anbieter stehen zur Auswahl. Gewichtung: Funktionsumfang 40 %, Kosten 30 %, Integrationsfähigkeit 20 %, Support 10 %. Punktvergabe (1–10): Anbieter A = 8 / 5 / 9 / 7; Anbieter B = 6 / 9 / 7 / 8.
a) *Führen* Sie die Nutzwertanalyse *durch* und *stellen* Sie die Teilnutzen tabellarisch dar. (6 P)
b) *Beurteilen* Sie das Ergebnis kritisch. (4 P)

**D3 (4 P):** *Berechnen* Sie die Break-even-Menge bei Fixkosten von 24.000 € pro Jahr, einem Verkaufspreis von 80 € und variablen Stückkosten von 50 €.

**D4 (4 P):** *Erläutern* Sie den Begriff **TCO** und *nennen* Sie drei Kostenpositionen, die in D1 nicht berücksichtigt wurden.

## Block E – Risiken und Steuerung (12 P)

**E1 (6 P):** *Bewerten* Sie die folgenden Risiken mit einer Risikoprioritätszahl (Skala 1–5) und *ordnen* Sie jedem eine der vier Risikostrategien zu:
(a) Der externe Dienstleister fällt aus (W = 2, S = 5) · (b) Die Datenqualität der Quellsysteme ist schlechter als erwartet (W = 4, S = 4) · (c) Der Fachbereich hat keine Zeit für Abstimmungen (W = 3, S = 3)

**E2 (3 P):** *Erläutern* Sie den Begriff **Scope Creep** und *nennen* Sie zwei Maßnahmen dagegen.

**E3 (3 P):** *Erläutern* Sie, was ein Soll-Ist-Vergleich am Projektende umfassen muss und warum er für Ihre Projektdokumentation unverzichtbar ist.

---

## Fachgespräch: typische Fragen des Ausschusses

1. „Nach welchem Vorgehensmodell haben Sie Ihr Projekt durchgeführt – und warum genau dieses?"
2. „Wie haben Sie den Aufwand geschätzt, und wie genau war Ihre Schätzung am Ende?"
3. „Was war der kritische Pfad in Ihrem Projekt, und wo hatten Sie Puffer?"
4. „Wie haben Sie die Wirtschaftlichkeit Ihrer Lösung belegt? Ab wann rechnet sie sich?"
5. „Welche Risiken hatten Sie identifiziert, und welches ist tatsächlich eingetreten?"
6. „Was würden Sie im Nachhinein anders planen?"

---

## Lernziel-Check (Ende KW 40 alles mit Ja beantworten)

- [ ] Ich nenne die Projektmerkmale und grenze Projekt von Routineaufgabe ab.
- [ ] Ich unterscheide Lasten- und Pflichtenheft sowie funktionale und nicht-funktionale Anforderungen.
- [ ] Ich formuliere SMART-Ziele und weise alle fünf Kriterien nach.
- [ ] Ich vergleiche klassische und agile Vorgehensmodelle und begründe eine Auswahl.
- [ ] Ich kenne Scrum-Rollen, -Artefakte und -Events.
- [ ] Ich rechne einen Netzplan vollständig durch: vorwärts Maximum, rückwärts Minimum.
- [ ] Ich unterscheide Gesamtpuffer und freien Puffer und bestimme den kritischen Pfad.
- [ ] Ich berechne Amortisation, ROI, Break-even und Nutzwertanalyse – und beurteile das Ergebnis.
- [ ] Ich erkläre TCO, Risikoprioritätszahl, die vier Risikostrategien und Scope Creep.
- [ ] Übungsklausur mit ≥ 92 Punkten bestanden.
