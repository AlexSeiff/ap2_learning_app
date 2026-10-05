# Deep Dive 6: CRISP-DM & Machine Learning
## Lernzettel mit Übungsklausur im IHK-Stil – FIDPA AP2

---

## Prüfungsrelevanz

CRISP-DM ist das **Vorgehensmodell deiner Fachrichtung** – und damit gleich doppelt wichtig: Es kommt im Prüfungsbereich „Sicherstellen der Datenqualität" vor **und** es ist die natürliche Gliederung für deine **Projektdokumentation** (50 % der Gesamtnote). Wer im Fachgespräch sein Projekt sauber entlang der sechs Phasen erzählen kann, wirkt sofort strukturiert.

Der Machine-Learning-Teil wird auf **Verständnisebene** geprüft, nicht auf Programmierebene: Verfahren zuordnen, Auswahl begründen, kleine Rechnungen von Hand durchführen (k-Means, Assoziationsanalyse, k-NN, Entropie und Informationsgewinn bei ID3), Grenzen und rechtliche Anforderungen benennen. Niemand verlangt Python-Code auf dem Papier.

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

**Euklidischer Abstand:** $d = \sqrt{(x_1 - x_2)^2 + (y_1 - y_2)^2}$

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
$Z_1 = \left(\frac{2+3+1}{3} \,\middle|\, \frac{2+1+3}{3}\right)$ = **(2 | 2)**
$Z_2 = \left(\frac{7+8+9}{3} \,\middle|\, \frac{8+7+9}{3}\right)$ = **(8 | 8)**

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
- Support: $\frac{4}{10}$ = **40 %**
- Konfidenz: $\frac{0{,}40}{0{,}50}$ = **80 %**
- Lift: $\frac{0{,}80}{0{,}60}$ = **1,33**

Deutung: In 40 % aller Warenkörbe kommen Schreibtisch und Bürostuhl gemeinsam vor. Wer einen Schreibtisch kauft, kauft in 80 % der Fälle auch einen Bürostuhl. Der Lift von 1,33 bedeutet: Diese Kombination tritt 33 % häufiger auf als bei Unabhängigkeit zu erwarten – ein empfehlenswertes Bundle.

**Gegenprobe B → S:** Support = 40 %, Konfidenz: $\frac{0{,}40}{0{,}60}$ = **66,7 %**, Lift: $\frac{0{,}667}{0{,}50}$ = **1,33**. Die Konfidenz ändert sich mit der Richtung, der Lift nicht.

**Regel L → M:** Support: $\frac{1}{10}$ = **10 %**, Konfidenz: $\frac{0{,}10}{0{,}40}$ = **25 %**, Lift: $\frac{0{,}25}{0{,}50}$ = **0,50**. Lift deutlich unter 1 → Lampe und Monitor werden **seltener** zusammen gekauft als zufällig zu erwarten. Eine gemeinsame Platzierung wäre nicht zu empfehlen.

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

# Teil 7 – Klassifikation von Hand: k-NN und ID3

Zwei Klassifikationsverfahren aus Teil 2.4, die sich mit Taschenrechner auf Papier durchrechnen lassen. Beide brauchen **gelabelte Trainingsdaten** (überwachtes Lernen) und sagen eine **Kategorie** vorher.

## 7.1 k-Nächste-Nachbarn (k-NN)

**Die Idee:** Ähnliche Fälle haben meist dieselbe Klasse. Ein neuer Fall bekommt die Klasse, die unter seinen k ähnlichsten Trainingsfällen am häufigsten vorkommt.

1. Abstand des neuen Falls zu **jedem** Trainingsfall berechnen (meist euklidisch, wie bei k-Means)
2. Sortieren und die **k nächsten Nachbarn** auswählen
3. **Mehrheitsentscheid:** Die häufigste Klasse unter den k Nachbarn ist die Vorhersage

Abstand wie bei k-Means: $d = \sqrt{(x - x_N)^2 + (y - y_N)^2}$ mit $(x_N \mid y_N)$ als neuem Fall. Auch hier gilt der Rechentrick aus Teil 3: Zum reinen Sortieren reichen die quadrierten Abstände.

**Die Wahl von k:**
- **k zu klein** (k = 1): Ein einzelner Ausreißer in den Trainingsdaten entscheidet – das Modell ist anfällig für Rauschen.
- **k zu groß:** Es zählen auch weit entfernte Fälle; im Extremfall gewinnt immer die häufigste Klasse des ganzen Datensatzes.
- Bei zwei Klassen ein **ungerades k** wählen, damit es keinen Stimmengleichstand gibt. Das passende k wird – wie bei jedem Parameter – mit Testdaten bzw. Kreuzvalidierung bestimmt (→ Deep Dive 7).

**Eigenschaften, die Prüfer hören wollen:**
- **Lazy Learner:** k-NN hat keine Trainingsphase im eigentlichen Sinn – das Modell sind die gespeicherten Trainingsdaten. Dafür ist jede Vorhersage aufwendig, weil zu allen Fällen der Abstand berechnet wird.
- Skalierung ist **Pflicht** – aus demselben Grund wie bei k-Means (Teil 3.3): Sonst entscheidet allein das Merkmal mit der größten Zahlenspanne.
- Erklärbar nur am Einzelfall („Die drei ähnlichsten Aufträge wurden nicht reklamiert") – ein allgemeines Regelwerk wie beim Entscheidungsbaum gibt es nicht.

⚠️ **Achtung:** **k-NN ≠ k-Means.** k-NN ist **überwacht** und klassifiziert (k = Anzahl Nachbarn), k-Means ist **unüberwacht** und bildet Cluster (k = Anzahl Cluster). Gemeinsam ist nur der Abstandsbegriff.

## 7.2 Durchgerechnetes Beispiel k-NN

Sechs vergangene Aufträge der Möbelhaus Nordholz GmbH mit x = Lieferdauer in Tagen, y = Anzahl Packstücke und dem Label „Reklamation". Beide Merkmale liegen im selben kleinen Wertebereich, deshalb wird hier ausnahmsweise nicht skaliert.

| Auftrag | x | y | Reklamation |
|---|---|---|---|
| P1 | 1 | 2 | nein |
| P2 | 3 | 2 | nein |
| P3 | 5 | 3 | ja |
| P4 | 6 | 5 | ja |
| P5 | 3 | 5 | nein |
| P6 | 7 | 5 | ja |

Neuer Auftrag: **N(4|3)**, k = 3. Wird er reklamiert?

**Schritt 1 – Abstände zu N(4|3):**

| Auftrag | Rechnung | d | Rang |
|---|---|---|---|
| P1(1\|2) | √((1−4)² + (2−3)²) = √10 | 3,16 | 5 |
| P2(3\|2) | √((3−4)² + (2−3)²) = √2 | 1,41 | 2 |
| P3(5\|3) | √((5−4)² + (3−3)²) = √1 | 1,00 | 1 |
| P4(6\|5) | √((6−4)² + (5−3)²) = √8 | 2,83 | 4 |
| P5(3\|5) | √((3−4)² + (5−3)²) = √5 | 2,24 | 3 |
| P6(7\|5) | √((7−4)² + (5−3)²) = √13 | 3,61 | 6 |

**Schritt 2 – die drei nächsten Nachbarn:** P3, P2, P5

**Schritt 3 – Mehrheitsentscheid:** P3 = ja, P2 = nein, P5 = nein → 2 : 1 für **nein**. Der neue Auftrag wird voraussichtlich **nicht reklamiert**.

**Der Einfluss von k:** Mit k = 1 entscheidet allein P3 → Vorhersage **ja**. Mit k = 5 kommen P4 (ja) und P1 (nein) dazu → 3 : 2 für **nein**. Dieselben Daten liefern je nach k ein anderes Ergebnis – deshalb muss die Wahl von k begründet und mit Testdaten geprüft werden.

## 7.3 Entscheidungsbäume mit ID3

**ID3** (Iterative Dichotomiser 3) baut einen Entscheidungsbaum von oben nach unten auf. An jedem Knoten wählt er das Merkmal, das die Daten **am saubersten nach der Zielklasse trennt**. Gemessen wird das mit Entropie und Informationsgewinn.

**Entropie:** Maß für die Unordnung (Unreinheit) einer Datenmenge bezogen auf die Zielklasse. 0 = alle Fälle in derselben Klasse (rein), 1 = bei zwei Klassen genau halbe-halbe (maximal gemischt). Formel: $H(S) = -\sum_i p_i \cdot \log_2 p_i$ mit $p_i$ als Anteil der Klasse i.

**Informationsgewinn:** Um wie viel die Entropie sinkt, wenn man die Daten nach Merkmal A aufteilt. Die Entropien der Teilmengen werden dabei **nach ihrem Anteil gewichtet**. Formel: $IG(S, A) = H(S) - \sum_v \frac{|S_v|}{|S|} \cdot H(S_v)$ mit $S_v$ als Teilmenge mit Ausprägung v.

**Der Algorithmus:**
1. Entropie der Gesamtmenge berechnen
2. Für **jedes** Merkmal den Informationsgewinn berechnen
3. Das Merkmal mit dem **größten Informationsgewinn** wird Knoten (an der Wurzel: Wurzel des Baums); für jede Ausprägung entsteht ein Ast
4. Für jeden Ast mit den dort verbliebenen Fällen und Merkmalen wiederholen – bis eine Teilmenge **rein** ist (Entropie 0, wird ein Blatt) oder keine Merkmale mehr übrig sind (Blatt mit Mehrheitsklasse)

**Rechentrick für die Klausur:** Viele Taschenrechner haben kein log₂. Es gilt $\log_2 x = \frac{\ln x}{\ln 2}$. Für zwei Klassen lohnt es sich, diese Werte zu kennen:

| Verteilung | 1 : 1 | 1 : 2 | 1 : 3 | 1 : 4 | 2 : 3 | rein |
|---|---|---|---|---|---|---|
| Entropie | 1,000 | 0,918 | 0,811 | 0,722 | 0,971 | 0 |

**Schwächen von ID3:**
- Der Informationsgewinn **bevorzugt Merkmale mit vielen Ausprägungen** – eine Auftragsnummer trennt perfekt (jede Teilmenge hat einen Fall), ist aber für neue Fälle wertlos. Abhilfe: Nachfolger **C4.5** mit dem Gain Ratio.
- Nur **kategoriale Merkmale**: Zahlen wie die Lieferdauer müssen vorher in Klassen eingeteilt werden (z. B. kurz/lang).
- Ohne Begrenzung wächst der Baum, bis jedes Blatt rein ist → **Overfitting**. Gegenmaßnahme: Baumtiefe begrenzen bzw. **Pruning** (Zurückschneiden, → Deep Dive 7).

## 7.4 Durchgerechnetes Beispiel ID3

Zehn Aufträge mit drei Merkmalen; Zielklasse ist „Reklamation" (4 × ja, 6 × nein):

| Nr | Spediteur | Lieferdauer | Verpackung | Reklamation |
|---|---|---|---|---|
| 1 | Nordtrans | lang | Standard | ja |
| 2 | Nordtrans | lang | Spezial | ja |
| 3 | Nordtrans | lang | Standard | ja |
| 4 | Nordtrans | kurz | Spezial | nein |
| 5 | Rheinlogistik | kurz | Spezial | ja |
| 6 | Rheinlogistik | lang | Standard | nein |
| 7 | Rheinlogistik | kurz | Standard | nein |
| 8 | Eigenlieferung | kurz | Standard | nein |
| 9 | Eigenlieferung | lang | Spezial | nein |
| 10 | Eigenlieferung | kurz | Standard | nein |

**Schritt 1 – Entropie der Gesamtmenge** (4 ja, 6 nein):
$H(S) = -\frac{4}{10} \log_2 \frac{4}{10} - \frac{6}{10} \log_2 \frac{6}{10}$ = **0,971**

**Schritt 2 – Informationsgewinn je Merkmal:**

*Spediteur:* Nordtrans 3 ja / 1 nein → H = 0,811 · Rheinlogistik 1 ja / 2 nein → H = 0,918 · Eigenlieferung 0 ja / 3 nein → H = 0 (rein)
Rest-Entropie: $\frac{4}{10} \cdot 0{,}811 + \frac{3}{10} \cdot 0{,}918 + \frac{3}{10} \cdot 0$ = **0,600**
IG(Spediteur) = 0,971 − 0,600 = **0,371**

*Lieferdauer:* lang 3 ja / 2 nein → H = 0,971 · kurz 1 ja / 4 nein → H = 0,722
Rest-Entropie: $\frac{5}{10} \cdot 0{,}971 + \frac{5}{10} \cdot 0{,}722$ = **0,846**
IG(Lieferdauer) = 0,971 − 0,846 = **0,125**

*Verpackung:* Standard 2 ja / 4 nein → H = 0,918 · Spezial 2 ja / 2 nein → H = 1
Rest-Entropie: $\frac{6}{10} \cdot 0{,}918 + \frac{4}{10} \cdot 1$ = **0,951**
IG(Verpackung) = 0,971 − 0,951 = **0,020**

**Schritt 3 – Wurzel:** Der größte Informationsgewinn gehört zu **Spediteur** (0,371) → Wurzel des Baums. Der Ast **Eigenlieferung** ist bereits rein und wird zum Blatt „nein".

**Schritt 4 – nächste Ebene:** Für den Ast **Nordtrans** (Aufträge 1–4, H = 0,811) wird mit den verbliebenen Merkmalen neu gerechnet: IG(Lieferdauer) = 0,811 (lang → 3 × ja, kurz → 1 × nein, beide rein) gegenüber IG(Verpackung) = 0,311. Gewählt wird **Lieferdauer**. Im Ast **Rheinlogistik** (Aufträge 5–7) trennt die **Verpackung** perfekt (Spezial → ja, Standard → nein).

**Der fertige Baum:**

```
Spediteur?
├─ Eigenlieferung → Reklamation: nein
├─ Nordtrans      → Lieferdauer?
│                    ├─ lang → ja
│                    └─ kurz → nein
└─ Rheinlogistik  → Verpackung?
                     ├─ Spezial  → ja
                     └─ Standard → nein
```

**Was der Baum aussagt:** Er ist direkt als Regelwerk lesbar – „Lange Lieferungen mit Nordtrans werden reklamiert" – und liefert der Logistik einen konkreten Ansatzpunkt. Genau diese Erklärbarkeit ist das Argument für Entscheidungsbäume aus Teil 2.4. Aber Vorsicht: Zehn Aufträge sind viel zu wenig für belastbare Regeln; jedes Blatt beruht hier auf ein bis drei Fällen.

## 7.5 k-NN, ID3 und k-Means im Vergleich

| | k-NN | ID3 (Entscheidungsbaum) | k-Means |
|---|---|---|---|
| Lernart | überwacht | überwacht | unüberwacht |
| Aufgabe | Klassifikation | Klassifikation | Clustering |
| Bedeutung von k | Anzahl Nachbarn | – | Anzahl Cluster |
| Merkmale | Zahlen, skaliert | kategorial | Zahlen, skaliert |
| Modell | gespeicherte Trainingsdaten | Baum aus Wenn-dann-Regeln | k Clusterzentren |
| Erklärbarkeit | am Einzelfall („ähnliche Fälle") | sehr gut (Regelwerk) | über die Zentren |
| Rechnung in der Klausur | Abstände, Mehrheit | Entropie, Informationsgewinn | Abstände, Mittelwerte |

> ❓ **Prüferfrage:** Warum würde ID3 eine Spalte „Auftragsnummer" als Wurzel wählen, und warum ist das falsch?
> *Jede Auftragsnummer kommt nur einmal vor, jede Teilmenge enthält also genau einen Fall und ist rein – die Rest-Entropie ist 0 und der Informationsgewinn maximal. Der Baum lernt damit nur die Trainingsdaten auswendig und kann für einen neuen Auftrag mit unbekannter Nummer nichts vorhersagen. Identifikationsmerkmale gehören nicht ins Modell; C4.5 bremst solche Merkmale mit dem Gain Ratio aus.*

---

# Teil 8 – KI, Deep Learning und weitere Verfahren

## 8.1 KI, Machine Learning, Deep Learning

Die drei Begriffe sind ineinander verschachtelt – jede Ebene ist ein Teil der vorherigen:

| Begriff | Bedeutung | Beispiel |
|---|---|---|
| **Künstliche Intelligenz (KI)** | Oberbegriff: Systeme, die Aufgaben lösen, für die sonst menschliche Intelligenz nötig ist – auch mit fest programmierten Regeln | Regelbasiertes Expertensystem, Schachprogramm |
| **Machine Learning (ML)** | Teilgebiet der KI: Das System **lernt Regeln aus Daten**, statt dass sie programmiert werden | Entscheidungsbaum für das Reklamationsrisiko |
| **Deep Learning (DL)** | Teilgebiet von ML: **neuronale Netze mit vielen Schichten**, die Merkmale selbst aus Rohdaten bilden | Schadenserkennung auf Fotos, Spracherkennung, Sprachmodelle |

**Data Mining** ist der Oberbegriff für das Finden von Mustern in großen Datenbeständen – mit Verfahren aus Statistik und ML: Klassifikation, Clustering, Assoziationsanalyse, Anomalieerkennung, Prognose. CRISP-DM (Teil 1) ist das Vorgehensmodell dafür.

## 8.2 Neuronale Netze

- Aufbau aus **Neuronen** in Schichten: **Eingabeschicht** (je Merkmal ein Neuron), eine oder mehrere **verdeckte Schichten**, **Ausgabeschicht** (z. B. Wahrscheinlichkeit für „Reklamation“).
- Jede Verbindung hat ein **Gewicht**. Ein Neuron bildet die gewichtete Summe seiner Eingänge und gibt das Ergebnis über eine **Aktivierungsfunktion** weiter.
- Training: Die Vorhersage wird mit dem richtigen Label verglichen; der Fehler wird rückwärts durch das Netz zurückgerechnet (**Backpropagation**) und die Gewichte werden schrittweise angepasst.
- Stärken: unstrukturierte Daten (Bilder, Text, Sprache), sehr komplexe Zusammenhänge.
- Schwächen: braucht **sehr viele Daten** und Rechenleistung, neigt ohne Gegenmaßnahmen zu Overfitting und ist eine **Black Box** – problematisch bei Art. 22 DSGVO (Teil 6.2).

## 8.3 Random Forest und Support Vector Machine

- **Random Forest:** Viele Entscheidungsbäume werden auf **zufälligen Stichproben** der Trainingsdaten und mit **zufälligen Teilmengen der Merkmale** trainiert (Bagging). Für einen neuen Fall stimmen alle Bäume ab, die Mehrheit entscheidet. Einzelne Bäume überanpassen leicht; ihre Fehler gleichen sich im Wald weitgehend aus – das Verfahren ist robust und meist genauer als ein einzelner Baum, verliert aber dessen Lesbarkeit.
- **Support Vector Machine (SVM):** sucht die Trennlinie (allgemein: Hyperebene) zwischen zwei Klassen, die den **größten Abstand** (Margin) zu den nächstgelegenen Punkten beider Klassen hat. Diese Grenzpunkte heißen **Stützvektoren**. Über den **Kernel-Trick** lassen sich auch nicht geradlinig trennbare Klassen trennen. Gut bei vielen Merkmalen und mittleren Datenmengen, schwer zu erklären.

## 8.4 Generative KI und KI-Verordnung

- **Generative KI** (z. B. große Sprachmodelle) erzeugt neue Inhalte – Texte, Code, Bilder. In der Datenanalyse hilft sie beim Schreiben von SQL oder bei Zusammenfassungen. Risiken: **Halluzinationen** (überzeugend formulierte, aber falsche Aussagen – Ergebnisse immer prüfen), **Datenschutz** (keine personenbezogenen oder vertraulichen Daten in externe Dienste eingeben) und ungeklärte Urheberrechte.
- Die **EU-KI-Verordnung (AI Act)** regelt KI-Systeme nach ihrem **Risiko**: **verboten** (z. B. Social Scoring durch Behörden), **hohes Risiko** (z. B. KI bei der Bewerberauswahl oder Kreditvergabe – strenge Pflichten zu Datenqualität, Dokumentation, menschlicher Aufsicht), **begrenztes Risiko** (Transparenzpflicht: Nutzer müssen erkennen, dass sie mit einer KI interagieren), **minimales Risiko** (z. B. Spamfilter – keine besonderen Pflichten).

> ❓ **Prüferfrage:** Ihr Fachbereich möchte für die Reklamationsvorhersage „Deep Learning, weil das die modernste KI ist“. Was entgegnen Sie?
> *Deep Learning spielt seine Stärken bei sehr großen Datenmengen und unstrukturierten Daten wie Bildern oder Texten aus. Für 18.000 tabellarische Aufträge mit wenigen Merkmalen ist ein Entscheidungsbaum oder Random Forest in der Regel ebenso gut, braucht weniger Daten und Rechenleistung und – beim Entscheidungsbaum – bleibt erklärbar. Die Verfahrenswahl richtet sich nach Daten, Ziel und Erklärbarkeit, nicht nach Modernität.*

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

Bearbeite die Klausur **am Ende des Themas** am Stück, handschriftlich, mit Taschenrechner. Runde auf zwei Nachkommastellen.

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

## Lernziel-Check (am Ende des Themas alles mit Ja beantworten)

- [ ] Ich nenne die sechs CRISP-DM-Phasen in der richtigen Reihenfolge und ordne meinem Projekt konkrete Tätigkeiten zu.
- [ ] Ich kann begründen, warum der Prozess iterativ ist, und zwei typische Rücksprünge nennen.
- [ ] Ich unterscheide überwachtes, unüberwachtes und bestärkendes Lernen anhand der Label-Frage.
- [ ] Ich trenne Klassifikation und Regression sicher über den Typ der Zielvariablen.
- [ ] Ich führe eine k-Means-Iteration von Hand durch und kenne die drei Schwächen des Verfahrens.
- [ ] Ich berechne Support, Konfidenz und Lift und interpretiere den Lift korrekt.
- [ ] Ich erkläre One-Hot-Encoding, Skalierung und Data Leakage an einem Beispiel.
- [ ] Ich benenne bei automatisierten Entscheidungen Art. 22 DSGVO und die Notwendigkeit menschlicher Kontrolle.
- [ ] Übungsklausur mit ≥ 92 Punkten bestanden.
- [ ] Ich klassifiziere einen neuen Fall mit k-NN von Hand und erkläre, wie die Wahl von k das Ergebnis beeinflusst.
- [ ] Ich berechne Entropie und Informationsgewinn und bestimme mit ID3 die Wurzel eines Entscheidungsbaums.
- [ ] Ich grenze KI, Machine Learning und Deep Learning ab und erkläre Aufbau und Grenzen neuronaler Netze, Random Forest und SVM.
