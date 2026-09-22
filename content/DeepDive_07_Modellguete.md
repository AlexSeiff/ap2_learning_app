# Deep Dive 7: Modellgüte & Modellbewertung (KW 35)
## Lernzettel mit Übungsklausur im IHK-Stil – FIDPA AP2

---

## Prüfungsrelevanz

Dies ist der **rechenintensivste Teil** des Prüfungsbereichs „Sicherstellen der Datenqualität" – und zugleich der berechenbarste: Eine Konfusionsmatrix mit Accuracy, Precision, Recall und F1 gehört zu den am häufigsten gestellten Aufgabentypen überhaupt. Die Formeln sind kurz, die Rechnung ist mechanisch, die Punkte sind sicher.

Der Unterschied zwischen 85 und 95 Punkten liegt auch hier in der **Interpretation**: Welche Kennzahl ist im geschilderten Fall die richtige – und warum ist Accuracy fast nie die Antwort?

Szenario: **Möbelhaus Nordholz GmbH**, Reklamationsvorhersage aus Deep Dive 6.

---

# Teil 1 – Warum Modelle geprüft werden müssen

## 1.1 Der Grundgedanke

Ein Modell, das nur an den Daten gemessen wird, aus denen es gelernt hat, misst sich an seiner eigenen Hausaufgabe. Deshalb werden die Daten **vor** dem Training aufgeteilt:

| Datensatz | Anteil (typisch) | Zweck |
|---|---|---|
| **Trainingsdaten** | 70–80 % | Das Modell lernt daraus |
| **Testdaten** | 20–30 % | Unabhängige Prüfung – wird **erst am Ende** verwendet |
| *(Validierungsdaten)* | optional | Parameterwahl während der Entwicklung |

**Die eiserne Regel:** Die Testdaten dürfen zu keinem Zeitpunkt in das Training einfließen – auch nicht indirekt über Skalierungswerte oder Merkmalsauswahl. Wer sein Modell wiederholt am Testergebnis nachjustiert, verbraucht die Unabhängigkeit des Tests.

Wichtig ist außerdem eine **zufällige** Aufteilung. Wird stattdessen einfach der erste Teil der Datei genommen, sind die Daten oft nach Datum oder Region sortiert – das Modell lernt dann nur einen Ausschnitt der Wirklichkeit. Bei Zeitreihen gilt jedoch das Gegenteil: Dort wird **chronologisch** getrennt (Vergangenheit trainieren, Zukunft testen), weil ein zufälliger Split Informationen aus der Zukunft ins Training holen würde.

## 1.2 Overfitting und Underfitting

| | Overfitting (Überanpassung) | Underfitting (Unteranpassung) |
|---|---|---|
| Symptom | Training sehr gut, Test deutlich schlechter | Training **und** Test schlecht |
| Ursache | Modell zu komplex, zu wenige Daten, zu lange trainiert | Modell zu einfach, wichtige Merkmale fehlen |
| Bild | Das Modell lernt die Trainingsdaten samt Rauschen auswendig | Das Modell erfasst nicht einmal das Grundmuster |
| Gegenmaßnahmen | mehr Daten, einfacheres Modell, Regularisierung, Baum beschneiden (Pruning), Kreuzvalidierung, frühzeitiger Abbruch | komplexeres Modell, bessere Merkmale bilden, länger trainieren |

**Erkennungsregel für die Klausur:** Große Lücke zwischen Trainings- und Testgüte → Overfitting. Beide Werte niedrig → Underfitting.

## 1.3 Kreuzvalidierung (k-fold Cross Validation)

Die Daten werden in k gleich große Teile zerlegt. In k Durchläufen dient jeweils ein Teil als Testmenge, die übrigen k−1 als Trainingsmenge. Die k Ergebnisse werden gemittelt. Üblich ist k = 5 oder k = 10.

**Vorteile:** Jeder Datensatz wird einmal getestet; das Ergebnis hängt nicht von einer zufällig günstigen oder ungünstigen Aufteilung ab; besonders wertvoll bei kleinen Datenmengen.
**Nachteil:** k-facher Rechenaufwand.

> ❓ **Prüferfrage:** Ihr Modell erreicht 99 % auf den Trainingsdaten und 71 % auf den Testdaten. Was liegt vor und was tun Sie?
> *Klassisches Overfitting – das Modell hat die Trainingsdaten auswendig gelernt statt verallgemeinerbare Muster. Maßnahmen: Modellkomplexität reduzieren (z. B. Baumtiefe begrenzen), mehr Trainingsdaten beschaffen, Regularisierung einsetzen und die Güte per Kreuzvalidierung stabiler schätzen.*

---

# Teil 2 – Die Konfusionsmatrix

## 2.1 Aufbau

Zunächst festlegen, was die **positive Klasse** ist – üblicherweise das seltene, interessierende Ereignis (hier: „Reklamation"). Alle Kennzahlen beziehen sich darauf.

| | **Vorhersage: positiv** | **Vorhersage: negativ** |
|---|---|---|
| **Tatsächlich positiv** | **TP** (richtig positiv) | **FN** (falsch negativ) – *Fehler 2. Art* |
| **Tatsächlich negativ** | **FP** (falsch positiv) – *Fehler 1. Art* | **TN** (richtig negativ) |

**Merkhilfe:** Der erste Buchstabe sagt, ob die Vorhersage **richtig** war (T/F), der zweite, **was vorhergesagt** wurde (P/N). „FN" heißt also: fälschlich als negativ eingestuft – der Fall war in Wahrheit positiv.

## 2.2 Die fünf Kennzahlen

| Kennzahl | Formel | Frage, die sie beantwortet |
|---|---|---|
| **Accuracy** (Korrektklassifikationsrate) | (TP + TN) / Gesamt | Wie viele Fälle insgesamt wurden richtig eingeordnet? |
| **Precision** (Genauigkeit) | TP / (TP + FP) | Wie viele der als positiv **vorhergesagten** Fälle sind wirklich positiv? |
| **Recall** (Trefferquote, Sensitivität) | TP / (TP + FN) | Wie viele der **tatsächlich** positiven Fälle wurden gefunden? |
| **F1-Maß** | 2 · (Precision · Recall) / (Precision + Recall) | Ausgewogenes Gesamtmaß (harmonisches Mittel) |
| **Spezifität** | TN / (TN + FP) | Wie viele der tatsächlich negativen Fälle wurden richtig erkannt? |

**Nenner-Merkhilfe:** Precision teilt durch die **Spalte** der positiven Vorhersagen, Recall durch die **Zeile** der tatsächlich positiven Fälle.

## 2.3 Durchgerechnetes Beispiel – und die wichtigste Lehre

1.000 Aufträge, davon 100 tatsächlich reklamiert. Das Modell sagt 150 Reklamationen voraus und liegt bei 60 davon richtig.

| | Vorhersage: Reklamation | Vorhersage: keine |
|---|---|---|
| **Tatsächlich Reklamation** | TP = 60 | FN = 40 |
| **Tatsächlich keine** | FP = 90 | TN = 810 |

- Accuracy = (60 + 810) / 1000 = **87,00 %**
- Precision = 60 / (60 + 90) = 60/150 = **40,00 %**
- Recall = 60 / (60 + 40) = 60/100 = **60,00 %**
- F1 = 2 · (0,40 · 0,60) / (0,40 + 0,60) = 0,48 / 1,00 = **48,00 %**
- Spezifität = 810 / 900 = **90,00 %**

**Das Accuracy-Paradox:** Ein triviales Modell, das **immer „keine Reklamation"** sagt, erreicht 900/1000 = **90 % Accuracy** – und ist damit scheinbar besser als unser Modell mit 87 %. Es findet allerdings **keinen einzigen** Reklamationsfall (Recall = 0 %), ist also fachlich völlig wertlos.

Daraus folgt die zentrale Aussage: **Bei unausgeglichenen Klassen ist Accuracy irreführend.** Aussagekräftig sind Precision, Recall und F1 – und der Vergleich mit einer **trivialen Baseline** gehört in jede Modellbewertung.

## 2.4 Precision oder Recall? Die Abwägung

Beide Kennzahlen lassen sich meist nur gegeneinander verbessern: Senkt man die Entscheidungsschwelle, findet das Modell mehr echte Fälle (Recall steigt), erzeugt aber mehr Fehlalarme (Precision sinkt) – und umgekehrt.

**Welche Kennzahl zählt, entscheidet der fachliche Schaden:**

| Situation | Teurer Fehler | Wichtige Kennzahl |
|---|---|---|
| Reklamationsrisiko erkennen, um vorab zu prüfen | Übersehener Problemfall (FN) | **Recall** |
| Automatischer Rabatt bei erkannter Unzufriedenheit | Zu Unrecht gewährter Rabatt (FP) | **Precision** |
| Medizinisches Screening | Übersehene Erkrankung (FN) | **Recall** |
| Spam-Filter | Echte Mail im Spam (FP) | **Precision** |

**Formulierung, die Punkte bringt:** „Da ein übersehener Fall (FN) hier den größeren Schaden verursacht als ein Fehlalarm (FP), ist der Recall die entscheidende Kennzahl; eine niedrigere Precision wird bewusst in Kauf genommen."

---

# Teil 3 – Gütemaße bei Regression

Bei stetiger Zielgröße (→ Deep Dive 4) gelten andere Maße:

| Maß | Formel | Eigenschaft |
|---|---|---|
| **MAE** (mittlerer absoluter Fehler) | Σ\|y − ŷ\| / n | leicht interpretierbar, in der Einheit der Zielgröße, robust gegen Ausreißer |
| **MSE** (mittlerer quadratischer Fehler) | Σ(y − ŷ)² / n | gewichtet große Fehler stärker, Einheit quadriert |
| **RMSE** | √MSE | wie MSE, aber in der Einheit der Zielgröße |
| **R²** | erklärter Streuungsanteil | Vergleich zum Mittelwertmodell, einheitenlos |

**Beispiel:** Prognostizierte und tatsächliche Monatsumsätze (T€)

| y | ŷ | e = y − ŷ | \|e\| | e² |
|---|---|---|---|---|
| 100 | 90 | +10 | 10 | 100 |
| 120 | 126 | −6 | 6 | 36 |
| 90 | 84 | +6 | 6 | 36 |
| 130 | 132 | −2 | 2 | 4 |
| 110 | 108 | +2 | 2 | 4 |
| | | | **Σ 26** | **Σ 180** |

MAE = 26/5 = **5,20 T€** · MSE = 180/5 = **36,00** · RMSE = √36 = **6,00 T€**

**Interpretation:** Der RMSE (6,00) liegt über dem MAE (5,20) – ein Hinweis darauf, dass einzelne größere Abweichungen (hier +10) vorliegen. Je weiter RMSE und MAE auseinanderliegen, desto ungleichmäßiger sind die Fehler verteilt.

---

# Teil 4 – Vom Messwert zur Entscheidung

## 4.1 Was in eine Modellbewertung gehört

1. **Baseline zum Vergleich:** Wie gut wäre ein trivialer Ansatz (immer die häufigste Klasse, immer der Mittelwert, die bisherige Regel des Fachbereichs)? Ohne diesen Vergleich ist keine Kennzahl einzuordnen.
2. **Die richtige Kennzahl**, begründet aus dem fachlichen Schaden.
3. **Testdatengüte**, nicht Trainingsgüte.
4. **Wirtschaftliche Bewertung:** Was kostet ein FN, was kostet ein FP? Erst daraus ergibt sich der Nutzen.
5. **Grenzen:** Datenzeitraum, Repräsentativität, bekannte Verzerrungen.

## 4.2 Kosten statt Prozente

Prüfer schätzen es, wenn Kennzahlen in Geld übersetzt werden. Beispiel: Ein übersehener Reklamationsfall kostet durchschnittlich 120 € (Nacharbeit, Kulanz), eine unnötige Vorabprüfung 15 €.

- Modell: 40 FN · 120 € + 90 FP · 15 € = 4.800 € + 1.350 € = **6.150 €**
- Triviales Modell (immer „keine Reklamation"): 100 FN · 120 € = **12.000 €**

Trotz der niedrigeren Accuracy ist das Modell wirtschaftlich klar überlegen. **Diese Rechnung ist das stärkste Argument, das du im Fachgespräch führen kannst.**

## 4.3 Betrieb und Nachhaltigkeit

Die Modellgüte ist kein einmaliger Abnahmewert. Durch **Model Drift** (→ Deep Dive 6) verschlechtert sie sich schleichend. Notwendig sind daher: laufendes Monitoring der Kennzahlen, definierte Schwellenwerte für ein Retraining und eine benannte Verantwortlichkeit.

---

## Die 8 häufigsten Fehler aus Prüfersicht

1. Accuracy als alleinige Kennzahl bei unausgeglichenen Klassen verwendet.
2. Precision und Recall verwechselt (falscher Nenner).
3. FP und FN vertauscht – Positivklasse nicht vorher definiert.
4. F1 als arithmetisches statt als harmonisches Mittel berechnet.
5. Trainingsgüte statt Testgüte berichtet.
6. Overfitting und Underfitting verwechselt.
7. Kein Vergleich mit einer trivialen Baseline.
8. Keine Begründung, warum die gewählte Kennzahl die fachlich richtige ist.

---

# Übungsklausur Modellgüte (100 Punkte, 90 Minuten)

Bearbeite die Klausur **am Ende von KW 35** am Stück, handschriftlich, mit Taschenrechner. Runde auf zwei Nachkommastellen.

## Anlage – Testergebnis des Reklamationsmodells

Getestet wurden 1.000 Aufträge, davon 100 tatsächlich reklamiert.

| | Vorhersage: Reklamation | Vorhersage: keine Reklamation |
|---|---|---|
| **Tatsächlich Reklamation** | 90 | 10 |
| **Tatsächlich keine Reklamation** | 60 | 840 |

## Block A – Aufteilung und Anpassung (24 P)

**A1 (6 P):** *Erläutern* Sie, warum Daten vor dem Training in Trainings- und Testdaten aufgeteilt werden, und *nennen* Sie eine typische Aufteilung.

**A2 (8 P):** *Erklären* Sie Overfitting und Underfitting. *Geben* Sie für jeden Fall an, woran Sie ihn an den Gütewerten erkennen, und *nennen* Sie je zwei Gegenmaßnahmen.

**A3 (6 P):** *Beschreiben* Sie die 5-fache Kreuzvalidierung und *nennen* Sie zwei Vorteile gegenüber einem einfachen Split.

**A4 (4 P):** Ein Kollege sortiert die Daten nach Auftragsdatum und nimmt die ersten 80 % als Trainingsdaten. *Beurteilen* Sie das Vorgehen für zwei Fälle: (a) Vorhersage des Reklamationsrisikos je Auftrag, (b) Prognose des Monatsumsatzes.

## Block B – Konfusionsmatrix berechnen (30 P)

**B1 (4 P):** *Benennen* Sie die vier Felder der Anlage mit den Fachbegriffen TP, FP, FN und TN. *Geben* Sie an, welche Klasse als positiv gilt.

**B2 (20 P):** *Berechnen* Sie Accuracy, Precision, Recall, F1-Maß und Spezifität. *Geben* Sie jeweils die Formel an.

**B3 (6 P):** Ein triviales Modell sagt für **jeden** Auftrag „keine Reklamation" voraus. *Berechnen* Sie dessen Accuracy und Recall und *vergleichen* Sie mit dem Modell aus der Anlage.

## Block C – Interpretation und Auswahl (22 P)

**C1 (8 P):** *Erläutern* Sie den Unterschied zwischen Precision und Recall in eigenen Worten und *geben* Sie für die Anlage an, welche der beiden Kennzahlen hier höher ist und warum.

**C2 (8 P):** Das Modell soll steuern, welche Aufträge vor der Auslieferung zusätzlich geprüft werden. *Begründen* Sie, welche Kennzahl in diesem Anwendungsfall die wichtigste ist. *Erläutern* Sie die Folgen eines FN und eines FP jeweils konkret.

**C3 (6 P):** Die Entscheidungsschwelle wird gesenkt, sodass das Modell mehr Aufträge als riskant einstuft. *Erläutern* Sie, wie sich Precision und Recall dadurch verändern und warum.

## Block D – Wirtschaftliche Bewertung (12 P)

Ein übersehener Reklamationsfall kostet durchschnittlich 120 €, eine unnötige Vorabprüfung 15 €.

**D1 (6 P):** *Berechnen* Sie die Fehlerkosten des Modells aus der Anlage sowie die des trivialen Modells aus B3.

**D2 (6 P):** *Beurteilen* Sie auf dieser Grundlage, ob der Einsatz des Modells zu empfehlen ist, und *nennen* Sie zwei Faktoren, die in dieser Rechnung nicht enthalten sind.

## Block E – Regressionsgüte (12 P)

| y (tatsächlich) | 100 | 120 | 90 | 130 | 110 |
|---|---|---|---|---|---|
| ŷ (prognostiziert) | 90 | 126 | 84 | 132 | 108 |

**E1 (8 P):** *Berechnen* Sie MAE und RMSE. *Stellen* Sie den Rechenweg tabellarisch dar.

**E2 (4 P):** *Erläutern* Sie, warum der RMSE hier größer ist als der MAE und in welcher Situation Sie welches Maß bevorzugen.

---

## Fachgespräch: typische Fragen des Ausschusses

1. „Welche Gütekennzahl haben Sie für Ihr Modell berichtet – und warum genau diese?"
2. „Womit haben Sie Ihr Ergebnis verglichen? Wie gut wäre der Fachbereich ohne Ihr Modell gewesen?"
3. „Was kostet ein Fehler Ihres Modells – und welche Fehlerart ist teurer?"
4. „Wie haben Sie ausgeschlossen, dass Ihr Modell die Trainingsdaten nur auswendig gelernt hat?"
5. „Ab welchem Wert würden Sie sagen: Das Modell muss neu trainiert werden?"

---

## Lernziel-Check (Ende KW 35 alles mit Ja beantworten)

- [ ] Ich erkläre Train/Test-Split, Kreuzvalidierung und die Regel der Testdatenunabhängigkeit.
- [ ] Ich unterscheide Overfitting und Underfitting anhand der Gütewerte und nenne Gegenmaßnahmen.
- [ ] Ich ordne TP, FP, FN und TN sicher zu, nachdem ich die positive Klasse definiert habe.
- [ ] Ich berechne Accuracy, Precision, Recall, F1 und Spezifität ohne Formelsammlung.
- [ ] Ich kann das Accuracy-Paradox an einem Zahlenbeispiel erläutern.
- [ ] Ich begründe die Wahl zwischen Precision und Recall aus dem fachlichen Schaden.
- [ ] Ich vergleiche jedes Modell mit einer trivialen Baseline und rechne Fehler in Kosten um.
- [ ] Ich berechne MAE und RMSE und erkläre deren unterschiedliches Verhalten bei Ausreißern.
- [ ] Übungsklausur mit ≥ 92 Punkten bestanden.
