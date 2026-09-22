# Deep Dive 6: CRISP-DM & Machine Learning (KW 34)
## Lernzettel mit Übungsklausur im IHK-Stil – FIDPA AP2

---

## Prüfungsrelevanz

CRISP-DM ist das **Vorgehensmodell deiner Fachrichtung** – und damit gleich doppelt wichtig: Es kommt im Prüfungsbereich „Sicherstellen der Datenqualität" vor **und** es ist die natürliche Gliederung für deine **Projektdokumentation** (50 % der Gesamtnote). Wer im Fachgespräch sein Projekt sauber entlang der sechs Phasen erzählen kann, wirkt sofort strukturiert.

Der Machine-Learning-Teil wird auf **Verständnisebene** geprüft, nicht auf Programmierebene: Verfahren zuordnen, Auswahl begründen, kleine Rechnungen von Hand durchführen (k-Means, Assoziationsanalyse), Grenzen und rechtliche Anforderungen benennen. Niemand verlangt Python-Code auf dem Papier.

Szenario: **Möbelhaus Nordholz GmbH**.

---

# Teil 1 – CRISP-DM

**CR**oss-**I**ndustry **S**tandard **P**rocess for **D**ata **M**ining – der Branchenstandard für Datenanalyseprojekte.

## 1.1 Die sechs Phasen

| # | Phase | Leitfrage | Typische Ergebnisse |
|---|---|---|---|
| 1 | **Business Understanding** | Welches fachliche Problem lösen wir? | Zieldefinition, Erfolgskriterien, Projektplan |
| 2 | **Data Understanding** | Welche Daten gibt es, wie gut sind sie? | Datenquellen, Data Profiling, erste Statistiken |
| 3 | **Data Preparation** | Wie werden die Daten analysefähig? | bereinigter, transformierter Datensatz |
| 4 | **Modeling** | Welches Verfahren beantwortet die Frage? | trainiertes Modell, Parametereinstellungen |
| 5 | **Evaluation** | Erfüllt das Ergebnis das **fachliche** Ziel? | Gütebewertung, Entscheidung über Freigabe |
| 6 | **Deployment** | Wie kommt der Nutzen in den Betrieb? | Bericht/Dashboard, produktive Nutzung, Monitoring |

## 1.2 Die drei Aussagen, die in Prüfungen zählen

**1. Der Prozess ist iterativ, nicht linear.** Rücksprünge sind vorgesehen, insbesondere zwischen Data Understanding und Data Preparation (man findet beim Aufbereiten neue Qualitätsprobleme) sowie von Evaluation zurück zu Business Understanding (das Ergebnis zeigt, dass die Frage falsch gestellt war).

**2. Der Aufwand liegt in Phase 2 und 3.** Erfahrungsgemäß entfallen **60–80 % des Projektaufwands** auf Datenverständnis und Datenaufbereitung – nicht auf die Modellierung. Wer im Projektantrag den Großteil der 40 Stunden für „Modell trainieren" einplant, plant unrealistisch.

**3. Evaluation ≠ Modellgüte.** In Phase 5 wird nicht nur geprüft, ob das Modell technisch gut rechnet (das passiert schon in Phase 4), sondern ob es das **fachliche Ziel aus Phase 1** erfüllt. Ein Modell mit 95 % Trefferquote ist wertlos, wenn die Fachabteilung damit nicht arbeiten kann.

## 1.3 Für deine Projektdokumentation

| CRISP-DM-Phase | Kapitel deiner Doku |
|---|---|
| Business Understanding | Ausgangssituation, Zielsetzung (SMART), Wirtschaftlichkeit |
| Data Understanding | Ist-Analyse der Datenlage, Datenqualitätsprüfung |
| Data Preparation | Durchführung: Bereinigung, Transformation |
| Modeling | Durchführung: Verfahrenswahl mit Begründung |
| Evaluation | Soll-Ist-Vergleich, Zielerreichung |
| Deployment | Übergabe, Nutzung, Ausblick |

> ❓ **Prüferfrage:** Warum ist CRISP-DM ein Kreislauf und kein Wasserfall?
> *Erkenntnisse einer späteren Phase verändern häufig frühere Annahmen: Bei der Aufbereitung entdeckte Qualitätsprobleme können die Datenauswahl ändern, und eine Evaluation kann zeigen, dass die fachliche Fragestellung geschärft werden muss. Ein starrer Ablauf würde diese Erkenntnisse verschenken.*

---

# Teil 2 – Grundbegriffe und Lernarten

## 2.1 Vokabular, das sitzen muss

- **Merkmal / Feature / Attribut:** eine Eingangsgröße (Alter, Bestellwert, Kategorie)
- **Zielvariable / Label:** die vorherzusagende Größe
- **Datensatz / Beobachtung / Instanz:** eine Zeile
- **Trainingsdaten:** Daten, aus denen das Modell lernt
- **Testdaten:** zurückgehaltene Daten zur unabhängigen Prüfung
- **Modell:** die aus den Daten gelernte Regel

## 2.2 Die drei Lernarten

| Lernart | Voraussetzung | Zweck | Verfahren |
|---|---|---|---|
| **Überwacht** (supervised) | gelabelte Daten – die richtige Antwort ist bekannt | Vorhersage | Klassifikation, Regression |
| **Unüberwacht** (unsupervised) | keine Labels | Struktur entdecken | Clustering, Assoziationsanalyse, Dimensionsreduktion |
| **Bestärkend** (reinforcement) | Rückmeldung als Belohnung/Bestrafung | optimale Handlungsstrategie | Steuerung, Spiele, Robotik |

**Die Entscheidungsfrage lautet immer: Habe ich Labels?** Existiert eine Spalte mit der bekannten richtigen Antwort (z. B. „Kunde hat gekündigt: ja/nein"), ist es überwachtes Lernen. Fehlt sie, bleibt nur unüberwachtes Lernen.

## 2.3 Klassifikation oder Regression?

Beides ist überwachtes Lernen – der Unterschied liegt in der **Zielvariablen**:

| | Klassifikation | Regression |
|---|---|---|
| Zielvariable | Kategorie (diskret) | Zahl (stetig) |
| Beispiel | Reklamation ja/nein, Kundensegment A/B/C | Umsatz in €, Bearbeitungsdauer in Minuten |
| Verfahren | Entscheidungsbaum, k-NN, logistische Regression, Naive Bayes, Random Forest | lineare Regression (→ Deep Dive 4), Regressionsbaum |

⚠️ **Klassische Falle:** Die **logistische** Regression heißt zwar „Regression", ist aber ein **Klassifikations**verfahren – sie sagt eine Wahrscheinlichkeit für eine Klasse vorher, nicht einen stetigen Wert.

## 2.4 Die wichtigsten Verfahren in je einem Satz

- **Entscheidungsbaum:** Zerlegt die Daten durch verschachtelte Ja/Nein-Fragen. Größter Vorteil: **direkt lesbar und für Fachbereiche erklärbar** – das ist in Prüfungsantworten regelmäßig das entscheidende Auswahlkriterium.
- **k-Nächste-Nachbarn (k-NN):** Ordnet einen neuen Fall der Mehrheitsklasse seiner k ähnlichsten Nachbarn zu. Benötigt zwingend skalierte Merkmale.
- **Logistische Regression:** Schätzt die Wahrscheinlichkeit für eine Klasse; robust, gut interpretierbar.
- **Random Forest:** Viele Entscheidungsbäume stimmen ab. Meist deutlich genauer als ein Einzelbaum, dafür schlechter erklärbar.
- **Neuronale Netze:** Sehr leistungsfähig bei großen Datenmengen (Bild, Sprache), benötigen viele Daten und gelten als Black Box.
- **k-Means:** Bildet k Gruppen ähnlicher Fälle (unüberwacht) – siehe Teil 3.
- **Assoziationsanalyse:** Findet Wenn-dann-Regeln in Warenkörben – siehe Teil 4.

**Merksatz für Auswahlbegründungen:** Je erklärbarer ein Verfahren, desto eher wird es im betrieblichen Umfeld akzeptiert. Nenne bei der Verfahrenswahl immer **Erklärbarkeit, Datenmenge und Zielvariablentyp** als Kriterien – das sind die Punkte, die Prüfer hören wollen.

---

# Teil 3 – Clustering mit k-Means

**Zweck:** Ähnliche Fälle gruppieren, ohne dass Gruppen vorgegeben sind – etwa eine Kundensegmentierung nach Bestellhäufigkeit und Bestellwert.

## 3.1 Der Algorithmus in vier Schritten

1. **k festlegen** und k Startzentren wählen
2. **Zuordnen:** Jeden Punkt dem **nächstgelegenen** Zentrum zuweisen (Euklidischer Abstand)
3. **Neu berechnen:** Für jedes Cluster den Mittelwert aller zugeordneten Punkte als neues Zentrum bestimmen
4. **Wiederholen** ab Schritt 2, bis sich die Zuordnung nicht mehr ändert (Konvergenz)

**Euklidischer Abstand:** d = √((x₁ − x₂)² + (y₁ − y₂)²)

**Rechentrick für die Klausur:** Zum reinen *Vergleichen* von Abständen kannst du die Wurzel weglassen – der kleinere quadrierte Abstand gehört zum näheren Zentrum. Das spart Zeit. Wird der Abstand als Wert verlangt, musst du die Wurzel ziehen.

## 3.2 Durchgerechnetes Beispiel

Sechs Kunden, Merkmale: x = Bestellungen pro Jahr, y = durchschnittlicher Bestellwert (in 100 €).
P1(2,2) · P2(3,1) · P3(1,3) · P4(7,8) · P5(8,7) · P6(9,9)
Startzentren: Z1 = (4,4), Z2 = (6,6), k = 2

**Iteration 1 – Zuordnung:**

| Punkt | d zu Z1(4,4) | d zu Z2(6,6) | Cluster |
|---|---|---|---|
| P1(2,2) | √8 = 2,83 | √32 = 5,66 | **Z1** |
| P2(3,1) | √10 = 3,16 | √34 = 5,83 | **Z1** |
| P3(1,3) | √10 = 3,16 | √34 = 5,83 | **Z1** |
| P4(7,8) | √25 = 5,00 | √5 = 2,24 | **Z2** |
| P5(8,7) | √25 = 5,00 | √5 = 2,24 | **Z2** |
| P6(9,9) | √50 = 7,07 | √18 = 4,24 | **Z2** |

**Neue Zentren:**
Z1 = ((2+3+1)/3 , (2+1+3)/3) = **(2 | 2)**
Z2 = ((7+8+9)/3 , (8+7+9)/3) = **(8 | 8)**

**Iteration 2:** Die Zuordnung bleibt unverändert (P1–P3 zu Z1, P4–P6 zu Z2) → **Konvergenz erreicht**.

**Fachliche Deutung:** Cluster 1 sind Gelegenheitskunden mit wenigen, kleinen Bestellungen; Cluster 2 sind Stammkunden mit vielen, hochwertigen Bestellungen. Für das Marketing lassen sich daraus unterschiedliche Ansprachen ableiten.

## 3.3 Die drei Schwächen, die du kennen musst

1. **k muss vorher festgelegt werden.** Hilfsmittel: **Elbow-Methode** – man berechnet für verschiedene k die Summe der quadrierten Abstände zum jeweiligen Zentrum und wählt das k am „Knick" der Kurve, ab dem sich der Wert kaum noch verbessert.
2. **Das Ergebnis hängt von den Startzentren ab.** Ungünstige Startwerte führen zu einem schlechteren lokalen Optimum – deshalb mehrfach mit verschiedenen Startwerten rechnen.
3. **Merkmale müssen skaliert werden.** Ohne Skalierung dominiert das Merkmal mit der größeren Zahlenspanne den Abstand vollständig – ein Bestellwert in Euro (0–5.000) überstimmt die Bestellanzahl (0–20) und macht das zweite Merkmal praktisch wirkungslos.

> ❓ **Prüferfrage:** Ihre Clusteranalyse nutzt Jahresumsatz in € und Anzahl Reklamationen. Warum ist das Ergebnis ohne Vorverarbeitung wertlos?
> *Der Umsatz bewegt sich in Tausenderbereichen, die Reklamationszahl im einstelligen Bereich. Im euklidischen Abstand geht die Reklamationszahl praktisch unter – das Modell clustert faktisch nur nach Umsatz. Notwendig ist eine Normalisierung oder Standardisierung beider Merkmale auf einen vergleichbaren Wertebereich.*

---

# Teil 4 – Assoziationsanalyse (Warenkorbanalyse)

**Zweck:** Regeln der Form „Wenn A gekauft wird, dann auch B" aus Transaktionsdaten ableiten – Grundlage für Cross-Selling, Produktplatzierung und Empfehlungen.

## 4.1 Die drei Kennzahlen

Für die Regel **A → B** (Wenn A, dann auch B):

| Kennzahl | Formel | Bedeutung |
|---|---|---|
| **Support** | Anzahl Transaktionen mit A **und** B / alle Transaktionen | Wie häufig ist die Regel überhaupt? |
| **Konfidenz** | Support(A und B) / Support(A) | Wie zuverlässig ist die Regel, wenn A vorliegt? |
| **Lift** | Konfidenz(A → B) / Support(B) | Wie viel besser als der Zufall? |

**Lift interpretieren – der Kern der Aufgabe:**
- **Lift > 1:** positiver Zusammenhang – A und B werden häufiger gemeinsam gekauft als zufällig zu erwarten
- **Lift = 1:** kein Zusammenhang, die Artikel sind unabhängig
- **Lift < 1:** negativer Zusammenhang – der Kauf von A macht den Kauf von B unwahrscheinlicher (z. B. Substitutionsprodukte)

**Wichtige Eigenschaft:** Die **Konfidenz ist richtungsabhängig** (A → B ≠ B → A), der **Lift ist symmetrisch** (identisch in beide Richtungen). Eine hohe Konfidenz allein kann täuschen: Ist B ohnehin in fast jedem Warenkorb, ist auch die Konfidenz jeder Regel auf B hoch – erst der Lift zeigt, ob wirklich ein Zusammenhang besteht.

## 4.2 Durchgerechnetes Beispiel

Zehn Warenkörbe der Möbelhaus Nordholz GmbH (S = Schreibtisch, B = Bürostuhl, M = Monitor, L = Lampe):

| T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10 |
|---|---|---|---|---|---|---|---|---|---|
| S,B,M | S,B | S,B | S,B,L | S,M | B,M | M,L | B,M | L | L |

Einzelhäufigkeiten: S = 5 · B = 6 · M = 5 · L = 4 · (S und B) = 4 · (M und L) = 1

**Regel S → B:**
- Support = 4/10 = **40 %**
- Konfidenz = 0,40 / 0,50 = **80 %**
- Lift = 0,80 / 0,60 = **1,33**

Deutung: In 40 % aller Warenkörbe kommen Schreibtisch und Bürostuhl gemeinsam vor. Wer einen Schreibtisch kauft, kauft in 80 % der Fälle auch einen Bürostuhl. Der Lift von 1,33 bedeutet: Diese Kombination tritt 33 % häufiger auf als bei Unabhängigkeit zu erwarten – ein empfehlenswertes Bundle.

**Gegenprobe B → S:** Support = 40 %, Konfidenz = 0,40 / 0,60 = **66,7 %**, Lift = 0,667 / 0,50 = **1,33**. Die Konfidenz ändert sich mit der Richtung, der Lift nicht.

**Regel L → M:** Support = 1/10 = **10 %**, Konfidenz = 0,10 / 0,40 = **25 %**, Lift = 0,25 / 0,50 = **0,50**. Lift deutlich unter 1 → Lampe und Monitor werden **seltener** zusammen gekauft als zufällig zu erwarten. Eine gemeinsame Platzierung wäre nicht zu empfehlen.

---

# Teil 5 – Datenvorbereitung für Modelle

Diese Phase entscheidet über die Qualität des Ergebnisses – „Garbage in, garbage out".

| Aufgabe | Vorgehen |
|---|---|
| **Fehlende Werte** | löschen, ersetzen (Median/Modus) oder als eigene Kategorie kennzeichnen (→ Deep Dive 3) |
| **Kategorien kodieren** | One-Hot-Encoding: Aus der Spalte „Kategorie" mit den Werten Möbel/Elektronik/Zubehör werden drei 0/1-Spalten. Nötig, weil Verfahren nur mit Zahlen rechnen |
| **Skalieren** | **Normalisierung** bringt alle Werte auf 0–1; **Standardisierung** auf Mittelwert 0 und Standardabweichung 1. Pflicht bei k-Means und k-NN |
| **Ausreißer** | prüfen, nicht blind löschen (→ Deep Dive 3) |
| **Merkmale bilden** | Aus Start- und Endzeitstempel die Bearbeitungsdauer berechnen; aus dem Geburtsdatum das Alter |
| **Unausgeglichene Klassen** | Bei 2 % Reklamationsfällen erreicht ein Modell 98 % Accuracy, indem es immer „keine Reklamation" sagt. Gegenmaßnahmen: Über-/Unterabtastung, geeignetere Gütemaße (→ Deep Dive 7) |

**Data Leakage – der teuerste Anfängerfehler:** Enthalten die Trainingsdaten Informationen, die zum Vorhersagezeitpunkt real noch nicht vorliegen (z. B. das Feld „Reklamationsdatum" bei der Vorhersage von Reklamationen), erzielt das Modell im Test glänzende Werte und versagt im Betrieb vollständig. Prüffrage bei jedem Merkmal: **War diese Information zum Entscheidungszeitpunkt bereits bekannt?**

---

# Teil 6 – Deployment, Betrieb und Recht

## 6.1 Nach dem Modell ist vor dem Betrieb

- **Bereitstellung:** Bericht, Dashboard, automatisierter Prozess oder Schnittstelle
- **Monitoring:** Modellgüte laufend messen – nicht einmalig bei der Abnahme
- **Model Drift / Concept Drift:** Die Realität verändert sich (neues Sortiment, geändertes Kundenverhalten), das Modell bleibt auf dem alten Stand und wird schleichend schlechter. Gegenmaßnahme: regelmäßiges **Retraining** und definierte Schwellenwerte, ab denen nachtrainiert wird
- **Dokumentation und Übergabe:** Datenquellen, Annahmen, Grenzen des Modells – ohne sie ist die Lösung nach deinem Ausscheiden wertlos

## 6.2 Rechtliche Anforderungen

- **Art. 22 DSGVO – automatisierte Entscheidungen:** Betroffene haben grundsätzlich das Recht, nicht einer ausschließlich automatisierten Entscheidung mit rechtlicher Wirkung oder erheblicher Beeinträchtigung unterworfen zu werden (Beispiel: automatische Ablehnung eines Ratenkaufs). Praktische Folge: **menschliche Prüfinstanz** vorsehen, Entscheidung begründbar machen, Widerspruchsmöglichkeit einräumen.
- **Transparenz und Erklärbarkeit:** Betroffene und Fachbereich müssen nachvollziehen können, worauf eine Entscheidung beruht – ein wesentliches Argument für erklärbare Verfahren wie Entscheidungsbäume.
- **Zweckbindung und Datenminimierung:** Für die Analyse nur die Merkmale verwenden, die fachlich erforderlich sind.
- **Bias / Verzerrung:** Ein Modell lernt die Muster seiner Trainingsdaten – **einschließlich vorhandener Benachteiligungen**. Auch wenn geschützte Merkmale (Geschlecht, Herkunft) entfernt werden, können Stellvertretermerkmale wie die Postleitzahl sie indirekt abbilden. Gegenmaßnahmen: Datenbasis auf Repräsentativität prüfen, Ergebnisse nach Teilgruppen auswerten, menschliche Kontrolle.

> ❓ **Prüferfrage:** Ihr Modell entscheidet automatisch über Rabattgewährung. Welche zwei Anforderungen müssen Sie erfüllen?
> *Erstens ist eine menschliche Eingriffs- und Überprüfungsmöglichkeit vorzusehen, statt die Entscheidung ausschließlich automatisiert zu treffen (Art. 22 DSGVO). Zweitens muss die Entscheidungslogik nachvollziehbar und dokumentiert sein, damit Betroffene eine Begründung erhalten können – was ein erklärbares Verfahren nahelegt.*

---

## Die 8 häufigsten Fehler aus Prüfersicht

1. CRISP-DM als linearen Ablauf dargestellt, ohne Rücksprünge zu erwähnen.
2. Evaluation nur als technische Modellgüte beschrieben statt als Prüfung der fachlichen Zielerreichung.
3. Klassifikation und Regression verwechselt – Zielvariablentyp nicht geprüft.
4. Logistische Regression als Regressionsverfahren eingeordnet.
5. Bei k-Means die Skalierung der Merkmale nicht erwähnt.
6. Bei der Assoziationsanalyse nur Support und Konfidenz berechnet, den Lift aber nicht interpretiert.
7. Verfahrenswahl ohne Begründung („ich habe Random Forest genommen") – ohne Kriterien gibt es keine Punkte.
8. Datenschutz und Erklärbarkeit bei automatisierten Entscheidungen nicht angesprochen.

---

# Übungsklausur CRISP-DM & Machine Learning (100 Punkte, 90 Minuten)

Bearbeite die Klausur **am Ende von KW 34** am Stück, handschriftlich, mit Taschenrechner. Runde auf zwei Nachkommastellen.

## Ausgangslage

Die Möbelhaus Nordholz GmbH möchte Reklamationen reduzieren. Vorliegende Daten: 18.000 Aufträge der letzten drei Jahre mit Produktkategorie, Liefergebiet, Spediteur, Lieferdauer, Auftragswert sowie dem Feld „Reklamation: ja/nein".

## Block A – CRISP-DM (22 P)

**A1 (12 P):** *Nennen* Sie die sechs Phasen von CRISP-DM in der richtigen Reihenfolge und *beschreiben* Sie für jede Phase in einem Satz, was im geschilderten Reklamationsprojekt konkret zu tun wäre.

**A2 (6 P):** *Erläutern* Sie, warum CRISP-DM als iterativer Kreislauf dargestellt wird, und *nennen* Sie zwei typische Rücksprünge mit Auslöser.

**A3 (4 P):** Ein Kollege plant für das Projekt: 5 % Zieldefinition, 10 % Datenaufbereitung, 70 % Modellierung, 15 % Auswertung. *Beurteilen* Sie diese Aufwandsverteilung.

## Block B – Lernarten und Verfahrenswahl (20 P)

**B1 (8 P):** *Ordnen* Sie den folgenden vier Fragestellungen jeweils Lernart und Verfahrenstyp zu:
(a) Wird dieser Auftrag reklamiert? (b) Welche Kundengruppen lassen sich in unseren Daten unterscheiden? (c) Wie hoch wird der Umsatz im nächsten Quartal sein? (d) Welche Produkte werden häufig gemeinsam gekauft?

**B2 (6 P):** *Erläutern* Sie den Unterschied zwischen Klassifikation und Regression und *begründen* Sie, welcher Typ für die Reklamationsvorhersage geeignet ist.

**B3 (6 P):** Zur Auswahl stehen ein Entscheidungsbaum und ein neuronales Netz. *Begründen* Sie anhand von drei Kriterien, welches Verfahren Sie dem Fachbereich empfehlen.

## Block C – Clustering (22 P)

Sechs Kunden mit den Merkmalen x = Bestellungen pro Jahr, y = durchschnittlicher Bestellwert (in 100 €):
**P1(2|2) · P2(3|1) · P3(1|3) · P4(7|8) · P5(8|7) · P6(9|9)**
Startzentren: **Z1(4|4)** und **Z2(6|6)**, k = 2

**C1 (4 P):** *Beschreiben* Sie die vier Schritte des k-Means-Algorithmus.

**C2 (10 P):** *Führen* Sie die erste Iteration *durch*: *Berechnen* Sie die Abstände aller Punkte zu beiden Zentren, *ordnen* Sie die Punkte zu und *bestimmen* Sie die neuen Clusterzentren. *Stellen* Sie den Rechenweg tabellarisch *dar*.

**C3 (4 P):** *Prüfen* Sie, ob sich die Zuordnung in einer zweiten Iteration ändert, und *begründen* Sie Ihr Ergebnis.

**C4 (4 P):** Statt des Bestellwerts in Hundert Euro soll der Jahresumsatz in Euro (Wertebereich 200 bis 45.000) als zweites Merkmal verwendet werden. *Erläutern* Sie, welches Problem entsteht und wie Sie es lösen.

## Block D – Assoziationsanalyse (20 P)

Zehn Warenkörbe (S = Schreibtisch, B = Bürostuhl, M = Monitor, L = Lampe):

| T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10 |
|---|---|---|---|---|---|---|---|---|---|
| S,B,M | S,B | S,B | S,B,L | S,M | B,M | M,L | B,M | L | L |

**D1 (4 P):** *Berechnen* Sie den Support der Einzelartikel S, B, M und L.

**D2 (8 P):** *Berechnen* Sie für die Regel **S → B** Support, Konfidenz und Lift. *Geben* Sie die Formeln *an*.

**D3 (4 P):** *Interpretieren* Sie den Lift-Wert und *leiten* Sie eine Handlungsempfehlung *ab*.

**D4 (4 P):** Für die Regel **L → M** ergeben sich Support 10 %, Konfidenz 25 % und Lift 0,50. *Erläutern* Sie, was ein Lift unter 1 fachlich bedeutet und welche Konsequenz sich für die Produktplatzierung ergibt.

## Block E – Datenvorbereitung und Recht (16 P)

**E1 (6 P):** Das Merkmal „Spediteur" liegt als Text vor (Nordtrans, Rheinlogistik, Eigenlieferung). *Erläutern* Sie, warum eine Umwandlung erforderlich ist, und *beschreiben* Sie das One-Hot-Encoding an diesem Beispiel.

**E2 (5 P):** Ein Kollege nimmt das Feld „Reklamationsdatum" als Merkmal in das Modell auf. Das Modell erreicht daraufhin eine Trefferquote von 99,8 %. *Erläutern* Sie, welcher Fehler vorliegt und warum das Modell im Betrieb versagen wird.

**E3 (5 P):** Die Geschäftsführung möchte Aufträge mit hohem Reklamationsrisiko **automatisch** ablehnen. *Nennen* Sie zwei rechtliche Anforderungen und je eine Maßnahme zu deren Umsetzung.

---

## Fachgespräch: typische Fragen des Ausschusses

1. „*Ordnen* Sie Ihr Projekt in CRISP-DM ein – welche Phase hat am meisten Zeit gekostet und warum?"
2. „Welches Verfahren haben Sie gewählt und welche Alternativen haben Sie verworfen? *Begründen* Sie Ihre Entscheidung."
3. „Woher wussten Sie, dass Ihre Datenbasis für dieses Verfahren ausreicht?"
4. „Wie erklären Sie einem Fachbereich ohne Statistikkenntnisse, wie Ihr Modell zu seinem Ergebnis kommt?"
5. „Was passiert mit Ihrem Modell in zwölf Monaten?" (Erwartet: Model Drift, Monitoring, Retraining, Verantwortlichkeit.)
6. „Welche Verzerrungen könnten in Ihren Trainingsdaten stecken?"

---

## Lernziel-Check (Ende KW 34 alles mit Ja beantworten)

- [ ] Ich nenne die sechs CRISP-DM-Phasen in der richtigen Reihenfolge und ordne meinem Projekt konkrete Tätigkeiten zu.
- [ ] Ich kann begründen, warum der Prozess iterativ ist, und zwei typische Rücksprünge nennen.
- [ ] Ich unterscheide überwachtes, unüberwachtes und bestärkendes Lernen anhand der Label-Frage.
- [ ] Ich trenne Klassifikation und Regression sicher über den Typ der Zielvariablen.
- [ ] Ich führe eine k-Means-Iteration von Hand durch und kenne die drei Schwächen des Verfahrens.
- [ ] Ich berechne Support, Konfidenz und Lift und interpretiere den Lift korrekt.
- [ ] Ich erkläre One-Hot-Encoding, Skalierung und Data Leakage an einem Beispiel.
- [ ] Ich benenne bei automatisierten Entscheidungen Art. 22 DSGVO und die Notwendigkeit menschlicher Kontrolle.
- [ ] Übungsklausur mit ≥ 92 Punkten bestanden.
