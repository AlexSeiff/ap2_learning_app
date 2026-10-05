# Deep Dive 5: Prozessanalyse & Prozessmodellierung
## Lernzettel mit Übungsklausur im IHK-Stil – FIDPA AP2

---

## Prüfungsrelevanz

Dies ist der **Kern des Prüfungsbereichs „Durchführen einer Prozessanalyse" (90 Minuten, 10 % der Gesamtnote)**. Der Bereich ist inhaltlich klar abgegrenzt und damit gut planbar: Prozesse darstellen, Schwachstellen analysieren, Optimierungen vorschlagen, Wirtschaftlichkeit belegen, rechtliche Auswirkungen berücksichtigen.

Typische Aufgabenformate: ein beschriebener Prozess ist als **BPMN-Diagramm** zu modellieren, eine fehlerhafte **EPK** zu korrigieren, **Kennzahlen** zu berechnen und zu bewerten, Schwachstellen mit Methode zu identifizieren, eine Automatisierung wirtschaftlich zu **beurteilen**.

Für dich als DPA-Prüfling besonders wichtig: **Process Mining** verbindet diesen Bereich mit deiner Fachrichtung – es ist Prozessanalyse **aus Daten**. Damit kannst du im Fachgespräch punkten wie kein anderer Ausbildungsberuf.

Szenario: der Reparaturprozess der **Möbelhaus Nordholz GmbH** (bekannt aus Deep Dive 2).

---

# Teil 1 – Prozessgrundlagen

## 1.1 Was ist ein Geschäftsprozess?

Eine Folge logisch zusammenhängender Aktivitäten, die aus einem definierten **Auslöser (Input)** ein **Ergebnis (Output)** mit Kundennutzen erzeugt. Merkmale: definierter Start und Ende, Verantwortlicher (Prozesseigner), messbare Ziele, wiederholbarer Ablauf.

| Prozessart | Zweck | Beispiel |
|---|---|---|
| **Kernprozess** | schafft direkten Kundennutzen, wertschöpfend | Auftragsabwicklung, Reparaturservice |
| **Unterstützungsprozess** | ermöglicht Kernprozesse | IT-Betrieb, Personalwesen, Einkauf |
| **Führungsprozess** | steuert das Unternehmen | Strategie, Controlling, Qualitätsmanagement |

## 1.2 Vorgehen der Prozessanalyse

1. **Abgrenzung:** Start, Ende, Schnittstellen, beteiligte Rollen festlegen
2. **Ist-Aufnahme:** Daten erheben
3. **Ist-Modellierung:** Ablauf visualisieren (BPMN/EPK)
4. **Schwachstellenanalyse:** Ursachen systematisch ermitteln
5. **Soll-Konzeption:** optimierten Prozess entwerfen
6. **Wirtschaftlichkeitsbetrachtung:** Aufwand gegen Nutzen rechnen
7. **Umsetzung und Kontrolle:** Soll-Ist-Vergleich anhand von Kennzahlen

**Methoden der Ist-Aufnahme** (mindestens drei nennen können): Interview mit Prozessbeteiligten · Workshop · Beobachtung/Begleitung am Arbeitsplatz · Dokumentenanalyse · Fragebogen · **Auswertung von Systemdaten/Logfiles** (die datengetriebene Variante – deine Fachrichtung).

Vor- und Nachteile kennen: Interviews liefern Kontext und Erfahrungswissen, geben aber die **subjektive** Sicht wieder und beschreiben oft den Soll- statt den tatsächlichen Ist-Zustand. Systemdaten sind objektiv und vollständig, erklären aber nicht das **Warum** hinter den Abweichungen. Deshalb kombiniert man beides.

---

# Teil 2 – BPMN 2.0

BPMN (Business Process Model and Notation) ist der internationale Standard und in Prüfungen die häufigste Notation.

## 2.1 Die Elemente

**Ereignisse (Kreise)** – etwas passiert:
- **Startereignis:** dünner Rand, ein eingehender Auslöser, kein eingehender Sequenzfluss
- **Zwischenereignis:** doppelter Rand (z. B. Timer für Wartezeiten, Nachrichtenempfang)
- **Endereignis:** dicker Rand
- Symbole im Kreis kennzeichnen den Typ: Umschlag = Nachricht, Uhr = Timer, Blitz = Fehler

**Aktivitäten (abgerundetes Rechteck)** – etwas wird getan:
- **Task:** einzelne Aufgabe („Auftrag erfassen") – immer mit **Verb + Objekt** benennen
- **Teilprozess:** mit „+"-Zeichen, kann aufgeklappt werden
- Marker: Personensymbol = manuelle/User-Task, Zahnrad = automatisierte Service-Task

**Gateways (Rauten)** – der Ablauf verzweigt oder führt zusammen:

| Gateway | Symbol | Bedeutung |
|---|---|---|
| **XOR** (exklusiv) | X | **genau einer** der Pfade wird durchlaufen – Entscheidung |
| **AND** (parallel) | + | **alle** Pfade werden gleichzeitig durchlaufen |
| **OR** (inklusiv) | O | **einer oder mehrere** Pfade |

**Regeln, die Punkte kosten, wenn sie fehlen:**
- Ein Gateway **entscheidet nichts** – es verzweigt nur. Die Entscheidungsgrundlage entsteht in der Aktivität davor („Kostenvoranschlag prüfen") und steht als Beschriftung an den ausgehenden Pfaden („angenommen" / „abgelehnt").
- Was ein Gateway aufspaltet, sollte ein **gleichartiges** Gateway wieder zusammenführen.
- Beim XOR-Gateway müssen die Bedingungen **vollständig und überschneidungsfrei** sein – jeder Fall genau einmal abgedeckt.

**Pools und Lanes:**
- **Pool** = eigenständiger Teilnehmer/Organisation (Kunde, Lieferant, Möbelhaus)
- **Lane** = Rolle oder Abteilung **innerhalb** eines Pools (Serviceannahme, Werkstatt, Buchhaltung)

**Verbindungen:**
- **Sequenzfluss** (durchgezogener Pfeil): Ablaufreihenfolge – **nur innerhalb eines Pools**
- **Nachrichtenfluss** (gestrichelter Pfeil): Kommunikation **zwischen** Pools
- **Datenobjekt** (Blattsymbol) und **Anmerkung**: Artefakte ohne Ablaufwirkung

⚠️ **Der Standardfehler:** ein durchgezogener Sequenzfluss zwischen zwei Pools. Zwischen Pools fließen **nur Nachrichten** – ein anderes Unternehmen hat keinen gemeinsamen Ablauf mit dir.

## 2.2 Beispiel – Reparaturprozess Möbelhaus Nordholz

```
Pool: MÖBELHAUS NORDHOLZ
┌──────────────────────────────────────────────────────────────────────┐
│ Lane: Serviceannahme                                                 │
│  (○)──▶[Reparaturauftrag erfassen]──▶[Kostenvoranschlag erstellen]──┐ │
│   ▲                                                              │  │
│   │ Nachricht                                        ◇ XOR ◀─────┘  │
│   │                                          abgelehnt│  │angenommen │
│   │                                     [Absage senden]  │           │
│   │                                          ((●))       │           │
├───┼──────────────────────────────────────────────────────┼───────────┤
│ Lane: Werkstatt                                          ▼           │
│   │                        ┌──▶[Ersatzteil bestellen]──┐             │
│   │                  ◇ AND─┤                           ├─◇ AND──┐    │
│   │                        └──▶[Techniker einplanen]───┘        ▼    │
│   │                                                    [Reparatur    │
│   │                                                     durchführen] │
├───┼──────────────────────────────────────────────────────────────┼───┤
│ Lane: Buchhaltung                                                ▼   │
│   └────────────────────────────────[Rechnung stellen]◀────────────   │
│                                          ((●))                       │
└──────────────────────────────────────────────────────────────────────┘
          ▲ gestrichelt (Nachrichtenfluss)
┌─────────┴────────────────────────────────────────────────────────────┐
│ Pool: KUNDE (zugeklappt / Black Box)                                 │
└──────────────────────────────────────────────────────────────────────┘
```

Zu erkennen: ein **XOR** nach der Kostenvoranschlagsprüfung (genau ein Pfad), ein **AND** für Ersatzteilbestellung und Technikereinplanung (laufen parallel), drei Lanes für die beteiligten Rollen, ein separater Pool für den Kunden mit gestricheltem Nachrichtenfluss.

## 2.3 EPK – die Alternative

Die **ereignisgesteuerte Prozesskette** stammt aus dem ARIS-Umfeld und ist in Prüfungen ebenfalls verbreitet.

- **Ereignis** (Sechseck): passiver Zustand, z. B. „Auftrag ist erfasst"
- **Funktion** (abgerundetes Rechteck): aktive Tätigkeit, z. B. „Auftrag erfassen"
- **Konnektoren:** XOR, OR, AND

**Die drei EPK-Regeln, die in Prüfungen abgefragt werden:**
1. **Ereignis und Funktion wechseln sich streng ab.** Nie zwei Funktionen oder zwei Ereignisse direkt hintereinander.
2. Eine EPK **beginnt und endet mit einem Ereignis**.
3. **Nach einem einzelnen Ereignis darf keine XOR- oder OR-Verzweigung folgen** – Ereignisse sind passive Zustände und können keine Entscheidung treffen. Entscheidungen gehen immer von einer **Funktion** aus.

| | BPMN 2.0 | EPK |
|---|---|---|
| Verbreitung | internationaler Standard | vor allem im deutschsprachigen Raum |
| Organisationen darstellen | Pools/Lanes, mehrere Beteiligte | nur über Zusatzobjekte |
| Ausführbarkeit | technisch ausführbar (Workflow-Engines) | rein beschreibend |
| Lesbarkeit für Fachbereiche | mittel (viele Symbole) | hoch (einfaches Grundprinzip) |

---

# Teil 3 – Prozesskennzahlen

Ohne Kennzahlen keine belegbare Optimierung – und ohne Soll-Ist-Vergleich kein Nachweis des Projekterfolgs.

## 3.1 Zeitkennzahlen

**Durchlaufzeit (DLZ):** $\text{DLZ} = \text{Bearbeitungszeit} + \text{Liegezeit} + \text{Transportzeit} + \text{Rüstzeit}$
Gesamtzeit vom Prozessstart bis zum Prozessende.

**Bearbeitungszeit** = Zeit echter Wertschöpfung
**Liegezeit** = Warten auf den nächsten Bearbeitungsschritt

**Die wichtigste Kennzahl der Prozessoptimierung:**

Wertschöpfungsanteil (Flussgrad) $= \frac{\text{Bearbeitungszeit}}{\text{Durchlaufzeit}} \cdot 100$

In der Praxis liegt dieser Anteil oft unter 10 %. Das bedeutet: **Der Hebel liegt fast immer bei den Liegezeiten, nicht bei der Beschleunigung der Bearbeitung.** Wer in einer Klausur vorschlägt, „die Techniker sollen schneller arbeiten", hat die Aufgabe nicht verstanden.

Beispiel Möbelhaus: Bearbeitungszeit 1,5 h, Liegezeit 28,5 h → DLZ = 30 h → Wertschöpfungsanteil $= \frac{1{,}5}{30}$ = **5 %**. In 95 % der Zeit passiert mit dem Auftrag nichts.

## 3.2 Qualitäts- und Kostenkennzahlen

| Kennzahl | Formel | Aussage |
|---|---|---|
| **Fehlerquote** | fehlerhafte Fälle / Gesamtfälle · 100 | Qualitätsniveau |
| **First Pass Yield (FPY)** | fehlerfrei im ersten Durchlauf / Gesamt · 100 | Anteil ohne Nacharbeit |
| **Termintreue** | pünktliche Fälle / Gesamtfälle · 100 | Zuverlässigkeit |
| **Prozesskosten je Fall** | Bearbeitungszeit · Kostensatz (+ Sachkosten) | Wirtschaftlichkeit |
| **Nacharbeitskosten** | Nacharbeitszeit · Kostensatz · Fehlerzahl | Kosten schlechter Qualität |
| **Auslastung** | genutzte Kapazität / verfügbare Kapazität · 100 | Ressourceneinsatz |

## 3.3 Wirtschaftlichkeit einer Optimierung

**Amortisationszeit:** $\text{Amortisationszeit} = \dfrac{\text{Investition}}{\text{jährliche Einsparung}}$

Rechenschema, das du auswendig können solltest:
1. Zeitersparnis je Fall × Fallzahl pro Jahr = eingesparte Stunden
2. Eingesparte Stunden × Kostensatz = jährliche Einsparung
3. Investition / jährliche Einsparung = Amortisationszeit
4. Beurteilung: Amortisationszeit mit der geplanten Nutzungsdauer vergleichen – **und qualitative Faktoren ergänzen** (Fehlerreduktion, Mitarbeiterzufriedenheit, Skalierbarkeit, Abhängigkeit vom Anbieter).

Punkt 4 wird am häufigsten vergessen und ist regelmäßig eigenständig bepunktet.

---

# Teil 4 – Schwachstellenanalyse und Optimierung

## 4.1 Methoden

- **Ishikawa-Diagramm (Ursache-Wirkungs-Diagramm, „Fischgräte"):** systematische Ursachensuche entlang der **6M** – Mensch, Maschine, Material, Methode, Milieu (Umgebung), Messung.
- **5-Why-Methode:** fünfmal „Warum?" fragen, um von Symptom zur Grundursache zu gelangen.
- **Pareto-Analyse:** Ursachen nach Häufigkeit sortieren; wenige Ursachen erklären den Großteil der Fälle (→ Deep Dive 3).
- **Wertstromanalyse:** Bearbeitungs- und Liegezeiten je Schritt visualisieren, um Verschwendung sichtbar zu machen.

## 4.2 Typische Schwachstellen und ihre Gegenmaßnahmen

| Schwachstelle | Maßnahme |
|---|---|
| Lange Liegezeiten zwischen Abteilungen | Schnittstellen reduzieren, Zuständigkeit bündeln, Termin-Trigger einführen |
| Medienbrüche (Papier → System → Excel) | durchgängige Digitalisierung, Systemintegration/Schnittstellen |
| Mehrfacherfassung derselben Daten | einmalige Erfassung, automatische Übernahme |
| Sequenzielle Schritte ohne Abhängigkeit | **Parallelisierung** (AND-Gateway statt Reihenfolge) |
| Unnötige Genehmigungsschleifen | Wertgrenzen einführen, Entscheidungsbefugnis delegieren |
| Rückfragen wegen unvollständiger Daten | Pflichtfelder, Validierungsregeln, Plausibilitätsprüfung bei der Eingabe |
| Hohe Nacharbeitsquote | Fehlerursache beheben statt nachbessern, Vier-Augen-Prinzip an kritischer Stelle |

**Die vier Grundstrategien (ESUA-Merkhilfe):** **E**liminieren (Schritt entfällt) → **S**tandardisieren → **U**mstellen/Parallelisieren → **A**utomatisieren. In dieser Reihenfolge prüfen: Einen überflüssigen Schritt zu automatisieren, ist die teuerste Lösung.

**KVP und PDCA:** Plan (Maßnahme planen) → Do (umsetzen, ggf. im Pilotbereich) → Check (Wirkung anhand von Kennzahlen prüfen) → Act (standardisieren oder nachsteuern). Optimierung ist ein Kreislauf, kein einmaliges Projekt.

---

# Teil 5 – Process Mining (dein Alleinstellungsmerkmal)

Process Mining rekonstruiert den **tatsächlich gelebten** Prozess aus den Spuren, die IT-Systeme hinterlassen – statt aus Interviews, in denen Beteiligte den Prozess so schildern, wie er gedacht ist.

## 5.1 Das Event Log

Mindestens drei Pflichtfelder:

| Feld | Bedeutung |
|---|---|
| **Case ID** | Vorgangsnummer – klammert alle Ereignisse eines Falls zusammen (z. B. Auftragsnummer) |
| **Activity** | Bezeichnung des Prozessschritts |
| **Timestamp** | Zeitpunkt – bestimmt die Reihenfolge |
| *(Resource)* | optional: ausführende Person/System – ermöglicht Rollenanalysen |

Aus diesen Feldern lassen sich ableiten: tatsächlicher Prozessablauf, Durchlaufzeiten je Fall und je Schritt, **Varianten** (wie viele unterschiedliche Wege gibt es wirklich?), Engpässe, Schleifen (Nacharbeit) und Abweichungen vom Sollprozess.

## 5.2 Die drei Anwendungsarten

1. **Discovery:** Prozessmodell automatisch aus den Daten erzeugen – zeigt den Ist-Prozess ohne Vorannahmen.
2. **Conformance Checking:** Ist-Ablauf gegen das Soll-Modell prüfen – deckt Regelverstöße auf (z. B. Freigabe übersprungen).
3. **Enhancement:** vorhandenes Modell um Kennzahlen anreichern (Zeiten, Kosten, Häufigkeiten).

## 5.3 Datenqualität im Event Log

Hier verbinden sich beide Prüfungsbereiche – typische Probleme, die du benennen können solltest:
- **Fehlende Zeitstempel** → Reihenfolge nicht rekonstruierbar
- **Zu grobe Zeitstempel** (nur Datum, keine Uhrzeit) → Schritte innerhalb eines Tages nicht ordenbar
- **Uneinheitliche Aktivitätsbezeichnungen** („Rechnung stellen" vs. „Rechnungsstellung") → derselbe Schritt erscheint als zwei
- **Unvollständige Fälle** (Case beginnt vor oder endet nach dem Auswertungszeitraum) → verzerrte Durchlaufzeiten
- **Fehlende Case ID** → Ereignisse nicht zuordenbar
- **Zeitzonen-/Sommerzeitprobleme** → negative Durchlaufzeiten

## 5.4 Rechtliche Rahmenbedingungen

Ein Event Log mit dem Feld *Resource* enthält **personenbezogene Daten** und ermöglicht eine Leistungsauswertung einzelner Mitarbeiter. Daraus folgt:
- **Mitbestimmung des Betriebsrats** nach § 87 Abs. 1 Nr. 6 BetrVG: Systeme, die zur Überwachung von Verhalten oder Leistung der Beschäftigten **geeignet** sind, sind mitbestimmungspflichtig – die Eignung genügt, eine Überwachungsabsicht ist nicht erforderlich.
- **DSGVO:** Rechtsgrundlage klären, **Zweckbindung** und **Datenminimierung** beachten, Betroffene informieren; bei umfangreicher systematischer Überwachung kann eine **Datenschutz-Folgenabschätzung** (Art. 35) erforderlich sein.
- **Praktische Lösung:** Auswertung auf **aggregierter Ebene** (Team/Abteilung statt Person), **Pseudonymisierung** der Resource-Spalte, Schwellenwerte für Mindestgruppengrößen, Regelung in einer Betriebsvereinbarung.

> ❓ **Prüferfrage:** Warum genügt es nicht, dem Betriebsrat zu versichern, man wolle keine Leistungskontrolle betreiben?
> *Das Mitbestimmungsrecht knüpft an die technische **Eignung** zur Verhaltens- und Leistungskontrolle an, nicht an die Absicht. Sobald individuell zurechenbare Daten erfasst werden, greift § 87 Abs. 1 Nr. 6 BetrVG unabhängig vom Verwendungszweck.*

---

# Teil 6 – Organisation und Methoden der Prozessoptimierung

## 6.1 Aufbau- und Ablauforganisation

- **Aufbauorganisation:** *Wer* ist wofür zuständig? Stellen, Abteilungen, Weisungsbeziehungen – dargestellt im **Organigramm**.
- **Ablauforganisation:** *Wie* läuft die Arbeit zeitlich und räumlich ab? Das sind die Prozesse aus Teil 1 bis 3.

| Organisationsform | Merkmal | Vorteil | Nachteil |
|---|---|---|---|
| **Einliniensystem** | jede Stelle hat genau einen Vorgesetzten | klare Zuständigkeit | lange Dienstwege |
| **Stabliniensystem** | Einlinie plus beratende Stäbe ohne Weisungsrecht (z. B. Datenschutz, Controlling) | Fachwissen ohne Bruch der Linie | Stäbe können nur empfehlen |
| **Mehrliniensystem** | mehrere fachliche Vorgesetzte | kurze Wege, Spezialisierung | Kompetenzkonflikte |
| **Matrixorganisation** | Funktion (z. B. IT) **und** Objekt bzw. Projekt kreuzen sich | flexibel, gut für Projekte | doppelte Unterstellung, Abstimmungsaufwand |

**Funktions- oder prozessorientiert?** Eine funktionsorientierte Organisation schneidet die Arbeit nach Abteilungen; ein Prozess wie der Reparaturservice läuft dann durch viele Abteilungen mit Liegezeiten an jeder Schnittstelle. Die **prozessorientierte** Organisation gibt jedem Prozess einen **Prozesseigner**, der für das Ergebnis vom Auftrag bis zur Rechnung verantwortlich ist. Eine **Prozesslandkarte** zeigt alle Führungs-, Kern- und Unterstützungsprozesse eines Unternehmens auf einen Blick.

## 6.2 Lean Management und Kaizen

**Lean Management** richtet alles am Kundennutzen aus und beseitigt **Verschwendung** (japanisch *Muda*) – alles, wofür der Kunde nicht bezahlen würde. Die **sieben Verschwendungsarten:**

| Verschwendung | Beispiel im Reparaturservice |
|---|---|
| Überproduktion | Berichte, die niemand liest |
| Wartezeit | Auftrag liegt zwei Tage im Postfach der Disposition |
| Transport | Unterlagen werden zwischen Standorten verschickt |
| Überbearbeitung | dieselben Kundendaten in drei Systemen gepflegt |
| Bestände | Ersatzteillager mit selten benötigten Teilen |
| Bewegung | Techniker sucht Werkzeug und Unterlagen |
| Fehler / Nacharbeit | zweiter Technikertermin wegen falsch bestelltem Teil |

Oft wird als achte Art **ungenutztes Wissen der Beschäftigten** ergänzt.

- **Kaizen** (japanisch „Veränderung zum Besseren“) ist die Haltung hinter dem **KVP**: viele kleine Verbesserungen durch die Beschäftigten selbst, ständig statt einmalig.
- Der **SDCA-Zyklus** (Standardize – Do – Check – Act) sichert das Erreichte: Erst wenn eine Verbesserung als Standard festgeschrieben ist, startet der nächste PDCA-Zyklus. Ohne Standard fällt der Prozess in alte Gewohnheiten zurück.
- **Business Process Reengineering (BPR)** ist das Gegenmodell: **radikale** Neugestaltung eines Prozesses „auf der grünen Wiese“ statt schrittweiser Verbesserung – große Wirkung, aber hohes Risiko und Widerstand.

## 6.3 Six Sigma und Total Quality Management

**Six Sigma** ist ein datengetriebener Ansatz, der die **Streuung** von Prozessergebnissen verringert. Ziel ist eine Fehlerquote von höchstens **3,4 Fehlern pro einer Million Möglichkeiten**. Vorgehen nach **DMAIC:**
1. Define – Problem, Ziel und Kunden festlegen
2. Measure – Ist-Zustand mit Kennzahlen messen
3. Analyze – Ursachen mit Daten nachweisen (Ishikawa, Korrelation, Regression)
4. Improve – Lösungen entwickeln und erproben
5. Control – Verbesserung dauerhaft absichern und überwachen

Als Datenanalyst bist du hier in deinem Element: Measure und Analyze sind Statistik (→ Deep Dive 3 und 4).

**Total Quality Management (TQM)** ist die umfassendste Sicht: Qualität ist Aufgabe **aller** Beschäftigten und aller Prozesse, ausgerichtet auf Kundenzufriedenheit und ständige Verbesserung. Normgrundlage für ein Qualitätsmanagementsystem ist die **ISO 9001**.

## 6.4 FMEA – Fehler vorbeugen, bevor sie passieren

Die **FMEA** (Fehlermöglichkeits- und -einflussanalyse) bewertet **mögliche** Fehler eines Prozesses oder Produkts **vorbeugend**. Jeder Fehler erhält drei Bewertungen von 1 bis 10:

| Kennzahl | Frage | 1 | 10 |
|---|---|---|---|
| **A** – Auftreten | Wie wahrscheinlich tritt der Fehler auf? | unwahrscheinlich | sehr häufig |
| **B** – Bedeutung | Wie schwer wiegen die Folgen? | kaum spürbar | gefährlich, existenzbedrohend |
| **E** – Entdeckung | Wie wahrscheinlich bleibt der Fehler **unentdeckt**? | wird sicher entdeckt | wird kaum entdeckt |

**Risikoprioritätszahl:** $RPZ = A \cdot B \cdot E$ (Wertebereich 1 bis 1.000)

⚠️ **Achtung:** Bei **E** bedeutet ein **hoher** Wert eine **schlechte** Entdeckung. Ein Fehler, der vor Auslieferung fast sicher auffällt, bekommt E = 1.

**Durchgerechnetes Beispiel** (Reparaturservice, Maßnahmen ab einer RPZ von 125):

| Möglicher Fehler | A | B | E | RPZ |
|---|---|---|---|---|
| Ersatzteil falsch bestellt | 4 | 6 | 5 | 120 |
| Kundentermin nicht bestätigt | 6 | 4 | 3 | 72 |
| Vorschaden bei Abholung nicht dokumentiert | 3 | 8 | 7 | 168 |

Vorrang hat der **nicht dokumentierte Vorschaden** (RPZ 168): Er tritt selten auf, wird aber kaum entdeckt und führt zu teuren Streitfällen um die Haftung. Maßnahme: Fotodokumentation als Pflichtschritt in der App vor der Abholung – das senkt E deutlich. Unabhängig von der RPZ werden Fehler mit sehr hoher Bedeutung (B ≥ 9) immer betrachtet.

**Abgrenzung zur Risikoanalyse im Projekt** (→ Deep Dive 12): Dort zählen nur Eintrittswahrscheinlichkeit · Schadensausmaß. Die FMEA nimmt die **Entdeckbarkeit** als dritten Faktor dazu.

## 6.5 Strategische Analysemethoden

**SWOT-Analyse:** Gegenüberstellung von **internen** Stärken (Strengths) und Schwächen (Weaknesses) mit **externen** Chancen (Opportunities) und Risiken (Threats). Aus den Kombinationen werden Strategien abgeleitet: Stärken nutzen, um Chancen zu ergreifen (SO); Schwächen abbauen, um Risiken zu begegnen (WT) usw.

| | Chancen (extern) | Risiken (extern) |
|---|---|---|
| **Stärken** (intern) | SO: Stärken einsetzen, um Chancen zu nutzen | ST: Stärken nutzen, um Risiken abzuwehren |
| **Schwächen** (intern) | WO: Schwächen abbauen, um Chancen zu nutzen | WT: Schwächen abbauen, um Risiken zu vermeiden |

**ABC-Analyse:** teilt Objekte (Artikel, Kunden, Lieferanten) nach ihrem **Wertanteil** in drei Klassen. Vorgehen: Wert je Objekt berechnen, **absteigend sortieren**, Anteil am Gesamtwert und kumulierten Anteil bilden. Übliche Grenzen: **A** bis etwa 80 % des Werts, **B** bis etwa 95 %, **C** der Rest.

| Artikel | Jahresverbrauchswert | Wertanteil | kumuliert | Klasse |
|---|---|---|---|---|
| Bürostuhl | 48.000 € | 53,3 % | 53,3 % | A |
| Schreibtisch | 21.000 € | 23,3 % | 76,7 % | A |
| Monitor | 12.000 € | 13,3 % | 90,0 % | B |
| Lampe | 6.000 € | 6,7 % | 96,7 % | C |
| Kabelkanal | 2.000 € | 2,2 % | 98,9 % | C |
| Schrauben | 1.000 € | 1,1 % | 100,0 % | C |

Zwei von sechs Artikeln (33 %) machen 76,7 % des Werts aus – auf sie konzentrieren sich Preisverhandlungen und Bestandsoptimierung. Die ABC-Analyse ist die betriebswirtschaftliche Schwester der **Pareto-Analyse** (Teil 4.1).

**Benchmarking:** systematischer Vergleich von Kennzahlen und Prozessen mit einem Vorbild – **intern** (Filiale gegen Filiale), mit **Wettbewerbern** oder **branchenübergreifend** mit dem Klassenbesten eines Prozesses (z. B. Versandabwicklung eines Onlinehändlers). Ziel ist nicht Kopieren, sondern zu verstehen, *warum* der andere besser ist.

**Wertschöpfungskette nach Porter:** gliedert ein Unternehmen in **primäre Aktivitäten**, die direkt zum Produkt beitragen (Eingangslogistik, Produktion, Ausgangslogistik, Marketing und Vertrieb, Kundendienst), und **unterstützende Aktivitäten** (Unternehmensinfrastruktur, Personalwirtschaft, Technologieentwicklung, Beschaffung). Sie zeigt, wo Wert entsteht – und wo Kosten ohne Wertbeitrag anfallen.

**Portfolioanalyse (BCG-Matrix):** ordnet Produkte nach **Marktwachstum** und **relativem Marktanteil** in vier Felder: **Stars** (hoch/hoch – investieren), **Cash Cows** (niedriges Wachstum, hoher Anteil – Gewinne abschöpfen), **Question Marks** (hohes Wachstum, niedriger Anteil – entscheiden: ausbauen oder aufgeben), **Poor Dogs** (niedrig/niedrig – abbauen).

## 6.6 Kennzahlensysteme und Reifegrad

- **KPI** (Key Performance Indicator): eine der **wenigen** Kennzahlen, an denen der Erfolg eines Prozesses gemessen wird – mit Zielwert, Messvorschrift und Verantwortlichem. Zehn KPIs für einen Prozess sind keine KPIs mehr.
- **Balanced Scorecard:** Kennzahlensystem in vier Perspektiven – **Finanzen**, **Kunden**, **interne Prozesse**, **Lernen und Entwicklung**. Sie verhindert, dass nur auf Finanzkennzahlen gesteuert wird.
- **Reifegradmodelle** (z. B. CMMI mit fünf Stufen von „initial“ bis „optimierend“) bewerten, wie gut ein Prozess beherrscht wird: von „läuft irgendwie, abhängig von Einzelpersonen“ bis „wird gemessen und ständig verbessert“.

> ❓ **Prüferfrage:** Warum reicht es nicht, bei der FMEA nur auf Auftreten und Bedeutung zu schauen?
> *Ein Fehler, der zwar selten auftritt, aber vor dem Kunden kaum entdeckt wird, richtet oft mehr Schaden an als ein häufiger Fehler, den eine Kontrolle zuverlässig abfängt. Die Entdeckungswahrscheinlichkeit zeigt, wo zusätzliche Prüfungen den größten Nutzen bringen – sie ist der Hebel, den man im Prozess am leichtesten beeinflussen kann.*

---

## Die 8 häufigsten Fehler aus Prüfersicht

1. Durchgezogener Sequenzfluss zwischen zwei Pools statt gestricheltem Nachrichtenfluss.
2. XOR und AND verwechselt – parallele Schritte als Entscheidung modelliert.
3. Ausgehende Pfade eines XOR-Gateways nicht beschriftet.
4. Gateway ohne vorherige Aktivität, die die Entscheidungsgrundlage schafft.
5. In der EPK zwei Funktionen direkt hintereinander oder Verzweigung nach einem Ereignis.
6. Bei der Optimierung nur die Bearbeitungszeit betrachtet, obwohl die Liegezeit 90 %+ ausmacht.
7. Wirtschaftlichkeitsrechnung ohne Beurteilung und ohne qualitative Faktoren.
8. Datenschutz und Betriebsrat bei Prozessdatenauswertungen nicht erwähnt.

---

# Übungsklausur Prozessanalyse (100 Punkte, 90 Minuten)

Bearbeite die Klausur **am Ende des Themas** am Stück, handschriftlich, mit Lineal für die Diagramme.

## Anlage 1 – Prozessbeschreibung Reparaturservice

Ein Kunde meldet telefonisch einen Reparaturbedarf. Die Serviceannahme erfasst den Auftrag im System und erstellt einen Kostenvoranschlag, der dem Kunden zugesendet wird. Lehnt der Kunde ab, erhält er eine Absage und der Vorgang endet. Nimmt er an, werden **gleichzeitig** das benötigte Ersatzteil bestellt und ein Techniker eingeplant. Sobald beides erledigt ist, führt die Werkstatt die Reparatur durch. Anschließend stellt die Buchhaltung die Rechnung und sendet sie an den Kunden.

## Anlage 2 – Zeitaufnahme (Mittelwerte je Auftrag)

| Schritt | Bearbeitungszeit | anschließende Liegezeit |
|---|---|---|
| Auftrag erfassen | 0,25 h | 3,5 h |
| Kostenvoranschlag/Disposition | 0,25 h | 16,0 h |
| Reparatur durchführen | 0,75 h | 9,0 h |
| Rechnung stellen | 0,25 h | – |

Weitere Daten: 200 Aufträge im Betrachtungsmonat, davon 24 mit erforderlicher Nacharbeit. Kostensatz Werkstatt: 60 €/h.

## Anlage 3 – Auszug aus dem Event Log

| Case ID | Activity | Timestamp | Resource |
|---|---|---|---|
| 5001 | Auftrag erfassen | 02.03. 08:15 | Kley |
| 5001 | Kostenvoranschlag erstellen | 02.03. 11:40 | Kley |
| 5001 | Reparatur durchführen | 03.03. 09:20 | Yilmaz |
| 5001 | Rechnung stellen | 03.03. 15:00 | Sander |
| 5002 | Auftrag erfassen | 02.03. 09:05 | Kley |
| 5002 | Kostenvoranschlag erstellen | 02.03. | Kley |
| 5002 | Reparatur durchführen | 04.03. 10:10 | Petrow |
| 5002 | Reparatur durchführen | 05.03. 08:45 | Petrow |
| 5002 | Rechnung stellen | 05.03. 16:30 | Sander |

## Block A – Grundlagen (14 P)

**A1 (6 P):** *Grenzen* Sie Kern-, Unterstützungs- und Führungsprozess *ab* und *ordnen* Sie den Reparaturservice begründet zu.

**A2 (8 P):** *Nennen* Sie vier Methoden der Ist-Aufnahme und *erläutern* Sie für zwei davon je einen Vor- und einen Nachteil.

## Block B – Modellierung (26 P)

**B1 (18 P):** *Modellieren* Sie den Prozess aus **Anlage 1** als BPMN-2.0-Diagramm. Verwenden Sie mindestens: einen Pool für das Möbelhaus mit drei Lanes, einen Pool für den Kunden, Start- und Endereignisse, ein XOR-Gateway mit beschrifteten Pfaden, ein AND-Gateway sowie mindestens einen Nachrichtenfluss.

**B2 (8 P):** In einer EPK folgt auf das Ereignis „Kostenvoranschlag ist versendet" direkt ein XOR-Konnektor mit den Ereignissen „Auftrag angenommen" und „Auftrag abgelehnt". *Benennen* Sie die beiden Modellierungsfehler, *begründen* Sie sie und *beschreiben* Sie die korrigierte Reihenfolge.

## Block C – Kennzahlen (26 P)

**C1 (8 P):** *Berechnen* Sie aus **Anlage 2** die Gesamtbearbeitungszeit, die Gesamtliegezeit und die Durchlaufzeit je Auftrag.

**C2 (6 P):** *Berechnen* Sie den Wertschöpfungsanteil (Bearbeitungszeit an der Durchlaufzeit) und *beurteilen* Sie das Ergebnis. *Leiten* Sie daraus ab, wo der wirksamste Ansatzpunkt für eine Optimierung liegt.

**C3 (6 P):** *Berechnen* Sie Fehlerquote und First Pass Yield für den Betrachtungsmonat.

**C4 (6 P):** Jede Nacharbeit kostet zusätzlich 0,75 h Werkstattzeit. *Berechnen* Sie die monatlichen Nacharbeitskosten insgesamt sowie den daraus resultierenden Zuschlag je Auftrag.

## Block D – Optimierung und Wirtschaftlichkeit (18 P)

**D1 (6 P):** *Nennen* Sie drei konkrete Maßnahmen zur Verkürzung der Durchlaufzeit im beschriebenen Prozess und *ordnen* Sie jede einer der vier Grundstrategien (Eliminieren, Standardisieren, Umstellen/Parallelisieren, Automatisieren) zu.

**D2 (8 P):** Ein digitales Auftragssystem kostet einmalig 18.000 €. Es spart je Auftrag 5 Minuten Bearbeitungszeit. Der Betrieb wickelt 2.400 Aufträge im Jahr ab, der Kostensatz beträgt 60 €/h. *Berechnen* Sie die jährliche Einsparung und die Amortisationszeit. *Beurteilen* Sie die Investition bei einer geplanten Nutzungsdauer von fünf Jahren.

**D3 (4 P):** *Nennen* Sie zwei qualitative Faktoren, die in dieser Rechnung nicht erfasst sind, aber in die Entscheidung einfließen sollten.

## Block E – Process Mining und Recht (16 P)

**E1 (6 P):** *Nennen* Sie die drei Pflichtfelder eines Event Logs und *erläutern* Sie deren jeweilige Funktion.

**E2 (6 P):** *Analysieren* Sie **Anlage 3**: *Benennen* Sie zwei Datenqualitätsprobleme und eine Prozessauffälligkeit. *Beschreiben* Sie jeweils die Konsequenz für die Auswertung.

**E3 (4 P):** Die Geschäftsführung möchte die Auswertung je Mitarbeiter aufschlüsseln. *Erläutern* Sie die rechtlichen Anforderungen und *nennen* Sie zwei Maßnahmen, mit denen die Analyse dennoch möglich wird.

---

## Fachgespräch: typische Fragen des Ausschusses

1. „*Beschreiben* Sie den Prozess, den Sie in Ihrem Projekt analysiert haben – wo lagen Start und Ende, und wie haben Sie ihn abgegrenzt?"
2. „Wie haben Sie den Ist-Zustand erhoben, und wie haben Sie sichergestellt, dass Sie den **tatsächlichen** und nicht den **behaupteten** Prozess erfasst haben?"
3. „Welche Kennzahlen haben Sie vor und nach der Optimierung gemessen? Wie belegen Sie den Erfolg?"
4. „Welche Schwachstelle war die gravierendste – und warum haben Sie sich für genau diese Maßnahme entschieden?"
5. „Wer war von Ihrer Prozessänderung betroffen, und wie haben Sie die Beteiligten eingebunden?" (Erwartet: Fachbereich, ggf. Betriebsrat, Datenschutzbeauftragter, Schulung, Change-Aspekte.)
6. „Was passiert mit Ihrer Lösung, wenn sich das Auftragsvolumen verdoppelt?"

---

## Lernziel-Check (am Ende des Themas alles mit Ja beantworten)

- [ ] Ich unterscheide Kern-, Unterstützungs- und Führungsprozesse und nenne vier Methoden der Ist-Aufnahme mit Vor- und Nachteilen.
- [ ] Ich modelliere einen beschriebenen Prozess vollständig in BPMN 2.0 – mit Pools, Lanes, XOR/AND, beschrifteten Pfaden und Nachrichtenflüssen.
- [ ] Ich kenne die drei EPK-Regeln und finde Verstöße in einem gegebenen Modell.
- [ ] Ich berechne Durchlaufzeit, Wertschöpfungsanteil, Fehlerquote, FPY und Prozesskosten sicher.
- [ ] Ich leite aus dem Wertschöpfungsanteil den richtigen Optimierungsansatz ab (Liegezeit statt Bearbeitungszeit).
- [ ] Ich rechne eine Amortisation und ergänze Beurteilung und qualitative Faktoren von selbst.
- [ ] Ich kenne Aufbau und Datenqualitätsprobleme eines Event Logs sowie die drei Process-Mining-Anwendungsarten.
- [ ] Ich benenne bei jeder Auswertung personenbezogener Prozessdaten Betriebsrat (§ 87 BetrVG) und DSGVO.
- [ ] Übungsklausur mit ≥ 92 Punkten bestanden.
- [ ] Ich unterscheide Aufbau- und Ablauforganisation und kenne Einlinien-, Stablinien- und Matrixorganisation.
- [ ] Ich erkläre Lean (sieben Verschwendungsarten), Kaizen, SDCA, BPR, Six Sigma (DMAIC) und TQM.
- [ ] Ich berechne die RPZ einer FMEA und begründe, welcher Fehler Vorrang hat.
- [ ] Ich führe eine ABC-Analyse durch und wende SWOT, Benchmarking, Wertschöpfungskette und BCG-Matrix an.

---

## Ausblick

Damit hast du die Grundlagen beider schriftlicher Prüfungsbereiche abgedeckt. **Wichtiger Hinweis zum Zeitplan:** Prüf spätestens jetzt die Frist deiner IHK für den **Projektantrag** und reich den Antrag rechtzeitig ein. Die Projektarbeit zählt 50 % – kein schriftlicher Prüfungsbereich kann das ausgleichen.
