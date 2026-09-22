# Deep Dive 3: Statistik I – Beschreibende Statistik (KW 31)
## Lernzettel mit Übungsklausur im IHK-Stil – FIDPA AP2

---

## Prüfungsrelevanz

Die beschreibende Statistik ist der **Rechenteil** von „Sicherstellen der Datenqualität" – und damit der Aufgabentyp, bei dem du am sichersten volle Punktzahl holen kannst, weil die Rechenwege eindeutig sind. Typische Formate: Häufigkeitstabelle vervollständigen, Lage- und Streuungsmaße berechnen, Boxplot lesen oder skizzieren, Ausreißer identifizieren und **beurteilen**, was mit ihnen geschehen soll.

Der letzte Punkt ist der DPA-Kern: Nicht das Rechnen unterscheidet dich vom Durchschnittsprüfling, sondern die **Interpretation** – „Was sagt mir diese Kennzahl über die Qualität meiner Daten?"

Szenario bleibt die **Möbelhaus Nordholz GmbH** (Reparaturservice aus Deep Dive 2).

---

# Teil 1 – Skalenniveaus

Das Skalenniveau entscheidet, **welche Rechenoperationen überhaupt zulässig sind**. Eine falsch berechnete Kennzahl auf falschem Skalenniveau ist ein klassischer Punktverlust.

| Skala | Eigenschaft | Beispiel | Zulässig |
|---|---|---|---|
| **Nominal** | nur gleich/ungleich, keine Reihenfolge | Kundennummer, Reklamationsgrund, Postleitzahl | Häufigkeiten, **Modus** |
| **Ordinal** | Rangfolge, aber ungleiche Abstände | Schulnote, Zufriedenheit (1–5), Prioritätsstufe | + **Median**, Quartile |
| **Intervall** | gleiche Abstände, **kein** absoluter Nullpunkt | Temperatur °C, Kalenderjahr | + Mittelwert, Differenzen |
| **Verhältnis (Ratio)** | gleiche Abstände **und** absoluter Nullpunkt | Umsatz, Dauer, Menge, Gewicht | + Verhältnisse („doppelt so viel") |

Intervall und Verhältnis werden zusammen als **metrisch** (kardinal) bezeichnet. Zusätzlich unterscheidet man **diskret** (abzählbar: Anzahl Reklamationen) und **stetig** (beliebig teilbar: Bearbeitungsdauer).

**Die Standardfalle:** Postleitzahlen und Kundennummern sind Zahlen, aber **nominal** – ein Mittelwert aus Postleitzahlen ist Unsinn. Ebenso: 20 °C ist **nicht** „doppelt so warm" wie 10 °C (kein absoluter Nullpunkt). Bei 20 € und 10 € ist das Verhältnis dagegen zulässig.

> ❓ **Prüferfrage:** Ein Kollege berechnet den Mittelwert der Schulnoten „gut/befriedigend/ausreichend". Beurteilen Sie das.
> *Schulnoten sind ordinal – die Abstände zwischen den Stufen sind nicht nachweislich gleich groß. Formal korrekt wäre der Median. In der Praxis wird der Notendurchschnitt trotzdem gebildet; das ist eine bewusste Vereinfachung, die man kennen und benennen sollte.*

---

# Teil 2 – Häufigkeitsverteilungen

| Begriff | Bedeutung | Formel |
|---|---|---|
| absolute Häufigkeit h | Anzahl der Nennungen | Auszählung |
| relative Häufigkeit f | Anteil an allen Fällen | f = h / n |
| kumulierte Häufigkeit | Summe bis einschließlich dieser Kategorie | fortlaufend addieren |

Beispiel (50 Reklamationen des Möbelhauses):

| Grund | h | f | f in % | kumuliert % |
|---|---|---|---|---|
| Transportschaden | 18 | 0,36 | 36,0 | 36,0 |
| Montagefehler | 15 | 0,30 | 30,0 | 66,0 |
| Falschlieferung | 9 | 0,18 | 18,0 | 84,0 |
| Materialfehler | 6 | 0,12 | 12,0 | 96,0 |
| Sonstiges | 2 | 0,04 | 4,0 | 100,0 |
| **Summe** | **50** | **1,00** | **100,0** | – |

Kontrolle: Die relativen Häufigkeiten summieren sich immer auf 1 bzw. 100 % – rechne das in der Prüfung nach, es deckt Rechenfehler sofort auf.

**Pareto-Prinzip (80/20):** Sortiert man absteigend und kumuliert, zeigt sich, welche wenigen Ursachen den Großteil der Fälle verursachen. Hier decken die zwei häufigsten Gründe bereits 66 % ab – dort setzt die Prozessoptimierung an (→ Deep Dive 5). Das **Pareto-Diagramm** kombiniert Balken (absolute Häufigkeit) mit einer Linie (kumulierter Anteil).

**Klassenbildung** bei metrischen Daten: gleich breite Klassen, überschneidungsfrei und lückenlos definieren (z. B. „30 bis unter 45 Minuten"). Die **Klassenmitte** dient als Rechenwert, wenn nur klassierte Daten vorliegen – dadurch entsteht ein Genauigkeitsverlust.

---

# Teil 3 – Lagemaße

Beispieldatensatz (Lieferzeiten in Tagen, n = 10), bereits sortiert:
**2, 3, 3, 4, 5, 5, 5, 6, 8, 19**

**Arithmetisches Mittel** = Summe / n = 60 / 10 = **6,0 Tage**
- Nutzt alle Werte, ist aber **empfindlich gegenüber Ausreißern**.

**Median** = mittlerer Wert der sortierten Reihe
- n ungerade → Wert an Position (n+1)/2
- n gerade → Mittel der beiden mittleren Werte: (5 + 5) / 2 = **5,0 Tage**
- **Robust** gegenüber Ausreißern.

**Modus (Modalwert)** = häufigster Wert = **5 Tage** (kommt dreimal vor). Einziges Lagemaß für nominale Daten; eine Verteilung kann mehrere Modi haben.

**Die entscheidende Interpretation:** Mittelwert (6,0) > Median (5,0). Diese Lücke entsteht durch den Ausreißer 19 – die Verteilung ist **rechtsschief**. Merksatz: *Liegt der Mittelwert deutlich über dem Median, ziehen große Ausreißer nach oben.* Genau diese Aussage bringt in Interpretationsaufgaben die Punkte.

**Gewichtetes arithmetisches Mittel** (wenn Werte unterschiedlich schwer wiegen):
x̄ = Σ(Wert × Gewicht) / Σ Gewichte
Beispiel: 3 Aufträge à 40 min und 7 Aufträge à 60 min → (3·40 + 7·60) / 10 = 540/10 = 54 min. Bei klassierten Daten rechnest du genauso, mit Klassenmitte × Klassenhäufigkeit.

> ❓ **Prüferfrage:** Warum berichtet man Gehälter üblicherweise als Median, nicht als Mittelwert?
> *Wenige sehr hohe Gehälter ziehen den Mittelwert nach oben und erzeugen ein verzerrtes Bild der typischen Situation. Der Median ist robust und beschreibt die Mitte der Verteilung realistischer.*

---

# Teil 4 – Streuungsmaße

Zwei Datensätze können denselben Mittelwert haben und trotzdem völlig verschieden sein. Die Streuung beschreibt, **wie stark die Werte um die Mitte schwanken** – für die Prozess- und Qualitätsbewertung oft wichtiger als der Mittelwert selbst.

### 4.1 Spannweite
R = Maximum − Minimum. Beim Beispiel: 19 − 2 = **17 Tage**. Schnell berechnet, aber nur von zwei Werten abhängig und daher extrem ausreißeranfällig.

### 4.2 Quartile und Interquartilsabstand

Quartile teilen die sortierte Reihe in vier gleich große Teile: Q1 (25 %), Q2 = Median (50 %), Q3 (75 %).

⚠️ **Wichtig:** Es existieren mehrere Berechnungskonventionen, die leicht unterschiedliche Werte liefern. In diesem Lernzettel (und üblicherweise in IHK-Aufgaben) gilt: Position = n · p; ist das Ergebnis **keine** ganze Zahl, wird **aufgerundet** und der Wert an dieser Position genommen; ist es eine ganze Zahl, wird das Mittel aus dieser und der nächsten Position gebildet. **Schreibe die verwendete Konvention in der Klausur dazu** – dann bekommst du auch bei abweichender Musterlösung deine Punkte.

Beispiel (n = 10) – sortierte Reihe mit Positionen:

| Position | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Wert | 2 | 3 | 3 | 4 | 5 | 5 | 5 | 6 | 8 | 19 |

- **Q1:** Position = 10 · 0,25 = 2,5 → aufrunden auf **Position 3**. Der 3. Wert der Reihe ist 3 → **Q1 = 3**
- **Q3:** Position = 10 · 0,75 = 7,5 → aufrunden auf **Position 8**. Der 8. Wert der Reihe ist 6 → **Q3 = 6**

⚠️ **Position ist nicht der Wert.** Hier besonders heimtückisch: Die Rechnung führt auf Position 8 – und die Zahl 8 kommt in den Daten ebenfalls vor, allerdings an Position 9. Wer beides verwechselt, notiert fälschlich Q3 = 8. Schreibe deshalb in der Klausur immer beides hin: „Position 8 → Wert 6".

**IQR = Q3 − Q1 = 6 − 3 = 3 Tage** – die mittleren 50 % der Aufträge liegen in einem Bereich von nur 3 Tagen. Der IQR ist robust, weil er die Extremwerte ausblendet.

### 4.3 Varianz und Standardabweichung

Rechenweg in vier Schritten (immer so aufschreiben – jeder Schritt gibt Teilpunkte):
1. Mittelwert berechnen
2. Abweichungen vom Mittelwert bilden
3. Abweichungen quadrieren und aufsummieren (= Summe der Abweichungsquadrate, SAQ)
4. Durch n teilen → Varianz; Wurzel ziehen → Standardabweichung

Beispiel Durchlaufzeiten (Tage): 2, 4, 5, 6, 8 → x̄ = 25/5 = 5

| x | x − x̄ | (x − x̄)² |
|---|---|---|
| 2 | −3 | 9 |
| 4 | −1 | 1 |
| 5 | 0 | 0 |
| 6 | 1 | 1 |
| 8 | 3 | 9 |
| | **Σ = 0** | **Σ = 20** |

Varianz σ² = 20 / 5 = **4** · Standardabweichung σ = √4 = **2 Tage**

**Kontrolle:** Die Summe der einfachen Abweichungen ist immer 0 – deshalb wird überhaupt quadriert. Nutze das als Rechenprobe!

⚠️ **σ² (÷ n) oder s² (÷ n−1)?** Liegen alle Daten der **Grundgesamtheit** vor, wird durch n geteilt. Ist es eine **Stichprobe**, mit der auf die Grundgesamtheit geschlossen wird, durch n − 1. Im Beispiel: s² = 20/4 = 5 → s = 2,24. Beides ist richtig – **im jeweiligen Kontext**. Schreibe hin, welche Variante du verwendest und warum; das ist prüfungssicher.

**Interpretation:** Die Standardabweichung steht in derselben Einheit wie die Daten (Tage) und ist damit direkt interpretierbar; die Varianz ist eine quadrierte Hilfsgröße. Faustregel bei annähernder Normalverteilung: ca. 68 % der Werte liegen im Bereich x̄ ± 1σ, ca. 95 % im Bereich x̄ ± 2σ.

### 4.4 Variationskoeffizient

VK = σ / x̄ (oft in %). Er macht die Streuung **vergleichbar** zwischen Datensätzen mit unterschiedlichem Niveau.

Beispiel: Team A: x̄ = 50 min, σ = 5 min → VK = 10 %. Team B: x̄ = 100 min, σ = 8 min → VK = 8 %. Team B streut **absolut** stärker (8 > 5), **relativ** aber weniger (8 % < 10 %) – arbeitet also gleichmäßiger. Genau diese Unterscheidung ist eine typische Beurteilungsfrage.

---

# Teil 5 – Boxplot und Ausreißer

### 5.1 Aufbau

```
        Q1      Median   Q3
         |         |      |
  |------[=========|======]--------|      o
 min                              max    Ausreißer
(unterer Whisker)        (oberer Whisker)
```

- **Box:** von Q1 bis Q3, enthält die mittleren 50 % der Daten; die Boxbreite ist der IQR.
- **Strich in der Box:** Median. Liegt er nicht mittig, ist die Verteilung **schief**.
- **Whisker:** reichen bis zum letzten Wert innerhalb der 1,5-fachen IQR-Grenze.
- **Punkte außerhalb:** Ausreißer, einzeln dargestellt.

### 5.2 Die 1,5-IQR-Regel

Unterer Zaun = Q1 − 1,5 · IQR · Oberer Zaun = Q3 + 1,5 · IQR
Werte außerhalb gelten als Ausreißerverdacht.

Beispiel Lieferzeiten: Q1 = 3, Q3 = 6, IQR = 3 → unterer Zaun = 3 − 4,5 = −1,5 · oberer Zaun = 6 + 4,5 = **10,5**. Der Wert **19** liegt darüber → Ausreißer. Der obere Whisker endet beim größten Wert innerhalb der Grenze, also bei 8.

### 5.3 Umgang mit Ausreißern – die DPA-Kernkompetenz

**Niemals ungeprüft löschen.** Der Prüfungserwartungshorizont sieht drei Schritte vor:

1. **Ursache klären:** Erfassungsfehler (Komma verrutscht, Einheit verwechselt), technischer Defekt – oder ein **echter, fachlich erklärbarer Extremfall** (Großauftrag, Sonderreparatur mit Ersatzteilbeschaffung).
2. **Entscheiden und dokumentieren:** korrigieren (bei belegtem Fehler), belassen (bei echtem Wert), gesondert auswerten oder ausschließen – die Entscheidung **mit Begründung dokumentieren**.
3. **Auswirkung prüfen:** Analyse mit und ohne Ausreißer rechnen und die Sensitivität berichten.

Ein gelöschter echter Extremwert verletzt die Datenqualitätsdimension **Korrektheit** und kann genau die Fälle unsichtbar machen, die man eigentlich untersuchen wollte – bei einer Prozessanalyse sind die Ausreißer oft **das eigentliche Problem**.

> ❓ **Prüferfrage:** Wozu brauchen Sie einen Boxplot, wenn Sie Mittelwert und Standardabweichung schon berechnet haben?
> *Der Boxplot zeigt zusätzlich Schiefe, konkrete Ausreißer und den robusten Kern der Verteilung. Mittelwert und Standardabweichung sind beide ausreißeranfällig und können eine Verteilung völlig falsch zusammenfassen – zwei sehr verschiedene Verteilungen können identische Kennzahlen haben.*

---

# Teil 6 – Von der Kennzahl zur Datenqualität

So verbindest du Statistik mit deinem Prüfungsbereich (und bereitest das Fachgespräch vor). **Data Profiling** heißt konkret:

| Prüfung | Kennzahl/Methode | Findet |
|---|---|---|
| Vollständigkeit | Anteil NULL/Leerwerte je Spalte | fehlende Erfassung |
| Eindeutigkeit | Anzahl DISTINCT vs. Anzahl Zeilen | Dubletten |
| Wertebereich | Minimum/Maximum, Spannweite | unmögliche Werte (negative Dauer) |
| Verteilung | Median, IQR, Boxplot | Ausreißer, Schiefe |
| Konsistenz | Kreuzvergleich zweier Felder | Widersprüche (Enddatum vor Startdatum) |
| Plausibilität | x̄ ± 3σ | technisch mögliche, fachlich unwahrscheinliche Werte |

Häufungen exakt gleicher Werte (z. B. auffällig viele Datensätze mit Geburtsdatum 01.01.1900) deuten auf **Platzhalter- oder Default-Werte** hin – ein Klassiker, den Data Profiling aufdeckt und der jede Auswertung verfälscht.

---

## Die 8 häufigsten Fehler aus Prüfersicht

1. Mittelwert auf ordinal oder nominal skalierte Daten angewendet.
2. Median bestimmt, ohne vorher zu **sortieren**.
3. Bei geradem n den Median nicht als Mittel der beiden mittleren Werte gebildet.
4. Varianz nicht durch n geteilt (Division vergessen) oder Wurzel am Ende vergessen.
5. Verwechslung von Varianz und Standardabweichung (Einheit beachten!).
6. Zäune der 1,5-IQR-Regel mit Q1/Q3 statt mit dem IQR gerechnet.
7. Whisker bis zum Ausreißer gezeichnet statt bis zum letzten Wert innerhalb der Grenze.
8. Ausreißer kommentarlos entfernt, ohne Ursachenprüfung und Dokumentation.

---

# Übungsklausur Statistik I (100 Punkte, 90 Minuten)

Bearbeite die Klausur **am Ende von KW 31** am Stück, handschriftlich, mit Taschenrechner, ohne Unterlagen. Runde auf zwei Nachkommastellen. **Schreibe alle Rechenwege auf** – Teilpunkte gibt es nur für Nachvollziehbares.

## Anlage – Bearbeitungsdauer von 11 Reparaturaufträgen (in Minuten)

`60, 40, 220, 45, 35, 90, 55, 40, 70, 50, 65`

## Block A – Skalenniveaus (12 P)

**A1 (8 P):** *Ordnen* Sie den folgenden Merkmalen je das Skalenniveau zu und *begründen* Sie zwei Ihrer Zuordnungen: (a) Kundennummer, (b) Kundenzufriedenheit (1 = sehr zufrieden bis 5 = unzufrieden), (c) Reparaturdauer in Minuten, (d) Kalenderjahr der Auftragserteilung.

**A2 (4 P):** Ein Kollege berechnet den arithmetischen Mittelwert der Postleitzahlen aller Kunden, um „den durchschnittlichen Standort" zu bestimmen. *Beurteilen* Sie das Vorgehen und *nennen* Sie eine fachlich korrekte Alternative.

## Block B – Häufigkeitsverteilung (18 P)

Von 50 Reklamationen entfallen: Transportschaden 18, Montagefehler 15, Falschlieferung 9, Materialfehler 6, Sonstiges 2.

**B1 (9 P):** *Erstellen* Sie eine vollständige Häufigkeitstabelle mit absoluter, relativer (in %) und kumulierter relativer Häufigkeit, absteigend sortiert.

**B2 (5 P):** *Ermitteln* Sie, wie viele Fehlerarten nötig sind, um mindestens 80 % aller Reklamationen abzudecken, und *benennen* Sie das zugrunde liegende Prinzip.

**B3 (4 P):** *Begründen* Sie, warum für dieses Merkmal weder Mittelwert noch Median berechnet werden können, und *geben* Sie das zulässige Lagemaß *an*.

## Block C – Lagemaße (20 P)

**C1 (10 P):** *Berechnen* Sie für die Anlage arithmetisches Mittel, Median und Modus. *Notieren* Sie die sortierte Reihe.

**C2 (6 P):** *Vergleichen* Sie Mittelwert und Median. *Erläutern* Sie, was die Differenz über die Verteilung aussagt und welches Lagemaß Sie der Geschäftsführung berichten würden.

**C3 (4 P):** Die Werkstatt meldet für den Folgemonat: 4 Aufträge à 45 Minuten, 6 Aufträge à 70 Minuten. *Berechnen* Sie die durchschnittliche Bearbeitungsdauer.

## Block D – Streuungsmaße (18 P)

**D1 (4 P):** *Berechnen* Sie die Spannweite der Anlage und *beurteilen* Sie deren Aussagekraft in diesem Fall.

**D2 (10 P):** Für fünf Aufträge einer anderen Filiale wurden folgende Durchlaufzeiten (in Tagen) erfasst: 2, 4, 5, 6, 8. *Berechnen* Sie Varianz und Standardabweichung der **Grundgesamtheit**. *Stellen* Sie den Rechenweg tabellarisch *dar*.

**D3 (4 P):** Filiale Nord: x̄ = 50 min, σ = 5 min. Filiale Süd: x̄ = 100 min, σ = 8 min. *Berechnen* Sie jeweils den Variationskoeffizienten und *beurteilen* Sie, welche Filiale gleichmäßiger arbeitet.

## Block E – Boxplot und Ausreißer (20 P)

**E1 (8 P):** *Bestimmen* Sie für die Anlage Q1, Q3 und den Interquartilsabstand. *Geben* Sie die verwendete Berechnungskonvention *an*.

**E2 (6 P):** *Prüfen* Sie mit der 1,5-IQR-Regel auf Ausreißer. *Geben* Sie beide Zäune und alle identifizierten Ausreißer *an*.

**E3 (6 P):** *Skizzieren* Sie den Boxplot maßstäblich und *beschriften* Sie Box, Median, beide Whisker und Ausreißer. Achten Sie darauf, wo der obere Whisker endet.

## Block F – Beurteilung (12 P)

**F1 (7 P):** Der Wert 220 Minuten stammt aus einem Auftrag, bei dem ein Ersatzteil erst beschafft werden musste. Ein Kollege schlägt vor, den Datensatz vor der Auswertung zu löschen, „damit die Statistik nicht verzerrt wird". *Beurteilen* Sie den Vorschlag und *entwickeln* Sie ein fachlich korrektes Vorgehen in drei Schritten.

**F2 (5 P):** In der Spalte „Reparaturdauer" fallen 14 Datensätze mit dem exakten Wert 0 auf. *Nennen* Sie zwei mögliche Ursachen und je eine Maßnahme, mit der Sie die Ursache klären bzw. künftig verhindern.

---

## Fachgespräch: typische Fragen des Ausschusses

1. „Welche statistischen Kennzahlen haben Sie zur Beschreibung Ihrer Datenbasis herangezogen – und warum genau diese?"
2. „Wie sind Sie in Ihrem Projekt mit Ausreißern umgegangen? Wie haben Sie die Entscheidung dokumentiert?"
3. „Ihre Auswertung berichtet einen Mittelwert. Warum ist das hier zulässig – und was hätte der Median zusätzlich gezeigt?"
4. „Wie haben Sie geprüft, ob Ihre Datenbasis überhaupt repräsentativ ist?" (Erwartet: Stichprobenumfang, Erhebungszeitraum, Verzerrungsquellen, Vollständigkeit.)
5. „Was sagt Ihnen eine hohe Standardabweichung bei den Durchlaufzeiten über den Prozess?" (Erwartet: unstabiler, schlecht steuerbarer Prozess – Ansatzpunkt für Standardisierung.)

---

## Lernziel-Check (Ende KW 31 alles mit Ja beantworten)

- [ ] Ich ordne jedem Merkmal sicher das Skalenniveau zu und weiß, welche Kennzahlen jeweils zulässig sind.
- [ ] Ich erstelle Häufigkeitstabellen mit relativer und kumulierter Häufigkeit fehlerfrei und kenne das Pareto-Prinzip.
- [ ] Ich berechne Mittelwert, Median (auch bei geradem n), Modus und gewichtetes Mittel ohne Nachschlagen.
- [ ] Ich beherrsche den vierschrittigen Rechenweg für Varianz und Standardabweichung und kenne den Unterschied ÷n / ÷(n−1).
- [ ] Ich bestimme Quartile und IQR, benenne meine Konvention und wende die 1,5-IQR-Regel korrekt an.
- [ ] Ich zeichne und lese Boxplots inklusive korrekter Whisker-Enden.
- [ ] Ich kann den Umgang mit Ausreißern in drei Schritten fachlich begründen.
- [ ] Ich verbinde jede Kennzahl mit einer Datenqualitätsdimension.
- [ ] Übungsklausur mit ≥ 92 Punkten bestanden.
