# Lernzettel – Kernthemen AP2 Daten- und Prozessanalyse

---

## 1. SQL-Spickzettel

**Logische Abarbeitungsreihenfolge:** FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY

```sql
SELECT kunde, SUM(betrag) AS umsatz
FROM bestellung
WHERE datum >= '2026-01-01'
GROUP BY kunde
HAVING COUNT(*) > 10
ORDER BY umsatz DESC;
```

- **WHERE** filtert Zeilen *vor* der Gruppierung, **HAVING** filtert Gruppen *nach* der Aggregation.
- **JOINs:** INNER (nur Übereinstimmungen) · LEFT (alle Zeilen links, rechts ggf. NULL) · RIGHT (umgekehrt) · FULL OUTER (alles).
- **Aggregatfunktionen:** COUNT, SUM, AVG, MIN, MAX. Achtung: COUNT(spalte) zählt keine NULL-Werte, COUNT(*) alle Zeilen.
- Weitere Bausteine: `LIKE 'M%'` (Muster, _ = 1 Zeichen), `BETWEEN`, `IN`, `IS NULL`, `DISTINCT`, Unterabfragen mit `IN`/`EXISTS`.
- **Sprachgruppen:** DDL (CREATE, ALTER, DROP) · DML (INSERT, UPDATE, DELETE) · DQL (SELECT) · DCL (GRANT, REVOKE) · TCL (COMMIT, ROLLBACK).
- **Constraints:** PRIMARY KEY, FOREIGN KEY … REFERENCES, UNIQUE, NOT NULL, CHECK, DEFAULT.
- **Referenzielle Integrität:** Fremdschlüsselwerte müssen als Primärschlüssel in der Zieltabelle existieren. ON DELETE CASCADE / SET NULL / RESTRICT regelt das Löschverhalten.
- **ACID** (Transaktionen): Atomicity, Consistency, Isolation, Durability.

---

## 2. Datenmodellierung & Normalisierung

- **ERM:** Entität (Rechteck), Beziehung (Raute), Attribut; Kardinalitäten 1:1, 1:n, m:n (m:n wird über eine Zwischentabelle mit zwei Fremdschlüsseln aufgelöst).
- **1. NF:** Alle Attributwerte sind atomar (keine Listen in einer Zelle).
- **2. NF:** 1. NF + jedes Nicht-Schlüssel-Attribut hängt vom *gesamten* Primärschlüssel ab (relevant bei zusammengesetzten Schlüsseln).
- **3. NF:** 2. NF + keine transitiven Abhängigkeiten (Nicht-Schlüssel-Attribut hängt von anderem Nicht-Schlüssel-Attribut ab, z. B. PLZ → Ort).
- **Anomalien** bei fehlender Normalisierung: Einfüge-, Änderungs-, Löschanomalie. Redundanz → Inkonsistenzgefahr.
- **NoSQL-Typen (Überblick):** dokumentenorientiert (MongoDB), Key-Value (Redis), spaltenorientiert (Cassandra), Graph (Neo4j). Stärken: flexible Schemata, horizontale Skalierung.

---

## 3. Data Warehouse & Big Data

| Kriterium | OLTP | OLAP |
|---|---|---|
| Zweck | operatives Tagesgeschäft | Analyse/Entscheidung |
| Abfragen | viele kleine Transaktionen | wenige komplexe Auswertungen |
| Datenmodell | normalisiert | denormalisiert (Star/Snowflake) |
| Daten | aktuell, detailliert | historisiert, aggregiert |

- **ETL:** Extract (Quellen anzapfen) → Transform (bereinigen, harmonisieren, aggregieren) → Load (ins DWH laden). **ELT:** erst laden (Data Lake), dann transformieren.
- **Star-Schema:** zentrale **Faktentabelle** (Kennzahlen + Fremdschlüssel) umgeben von **Dimensionstabellen** (Wer? Was? Wann? Wo?). **Snowflake:** Dimensionen zusätzlich normalisiert → weniger Redundanz, mehr Joins.
- **Data Lake:** Rohdaten aller Formate, Schema-on-Read. **DWH:** strukturiert, Schema-on-Write.
- **Big Data – 5 V:** Volume (Menge), Velocity (Geschwindigkeit), Variety (Vielfalt), Veracity (Verlässlichkeit), Value (Mehrwert).

---

## 4. Statistik

**Skalenniveaus:** Nominal (Kategorien, nur gleich/ungleich → Modus) · Ordinal (Rangfolge → Median) · Metrisch: Intervall (gleiche Abstände, kein echter Nullpunkt, z. B. °C) und Verhältnis (echter Nullpunkt, z. B. Umsatz).

**Lagemaße:**
- Arithmetisches Mittel = Summe aller Werte / n → empfindlich gegenüber Ausreißern.
- Median = mittlerer Wert der sortierten Reihe (bei geradem n: Mittel der beiden mittleren) → robust.
- Modus = häufigster Wert.

**Streuungsmaße:**
- Spannweite R = Maximum − Minimum.
- Varianz s² = Summe der quadrierten Abweichungen vom Mittelwert / n (Stichprobe: / (n−1)). Standardabweichung s = Wurzel aus s².
- Interquartilsabstand IQR = Q3 − Q1 (mittlere 50 %).

**Boxplot:** Box von Q1 bis Q3, Strich = Median, Whisker meist bis 1,5 × IQR, Punkte außerhalb = Ausreißer.

**Zusammenhänge:**
- Korrelationskoeffizient r liegt zwischen −1 und +1. Faustregel: |r| < 0,5 schwach · 0,5–0,8 mittel · > 0,8 stark.
- **Korrelation ≠ Kausalität!** Mögliche Drittvariable/Scheinkorrelation (Klassiker: Eisverkauf ↔ Sonnenbrände, Ursache: Sonne).
- Lineare Regression: ŷ = a + b·x (a = Achsenabschnitt, b = Steigung = Änderung von y je Einheit x). **Bestimmtheitsmaß R²** = Anteil der durch das Modell erklärten Streuung (0–1; bei einfacher linearer Regression R² = r²).

---

## 5. CRISP-DM & Machine Learning

**CRISP-DM (iterativ!):** 1. Business Understanding → 2. Data Understanding → 3. Data Preparation → 4. Modeling → 5. Evaluation → 6. Deployment.

**Lernarten:**
- **Überwacht** (gelabelte Daten): **Klassifikation** (diskrete Klassen, z. B. Spam/kein Spam – Verfahren: Entscheidungsbaum, k-NN, logistische Regression, Random Forest) und **Regression** (stetige Zielgröße, z. B. Umsatzprognose).
- **Unüberwacht** (keine Labels): **Clustering** (k-Means: k Zentren wählen → Punkte dem nächsten Zentrum zuordnen → Zentren neu berechnen → wiederholen bis stabil), **Assoziationsanalyse** (Warenkorb: Support, Konfidenz, Lift), Dimensionsreduktion.
- **Bestärkendes Lernen:** Agent lernt über Belohnung/Bestrafung.

**Modellgüte:**
- Datenaufteilung: Trainings-/Testdaten (z. B. 80/20), besser k-fache **Kreuzvalidierung**.
- **Overfitting:** Modell lernt Trainingsdaten auswendig (inkl. Rauschen) → Training top, Test schlecht. Gegenmaßnahmen: mehr Daten, einfacheres Modell, Regularisierung, Kreuzvalidierung, Pruning. **Underfitting:** Modell zu simpel, beides schlecht.

**Konfusionsmatrix (positive Klasse):**

| | Vorhersage positiv | Vorhersage negativ |
|---|---|---|
| **Tatsächlich positiv** | TP | FN (Fehler 2. Art) |
| **Tatsächlich negativ** | FP (Fehler 1. Art) | TN |

- Accuracy = (TP + TN) / alle → täuscht bei unausgeglichenen Klassen!
- Precision = TP / (TP + FP) → „Wie viele der als positiv Vorhergesagten sind wirklich positiv?"
- Recall (Sensitivität) = TP / (TP + FN) → „Wie viele der tatsächlich Positiven wurden gefunden?"
- F1 = 2 · (Precision · Recall) / (Precision + Recall) → harmonisches Mittel.

---

## 6. Datenqualität

**Dimensionen (mind. 5 nennen können):** Vollständigkeit · Korrektheit/Genauigkeit · Konsistenz (widerspruchsfrei über Systeme) · Aktualität · Eindeutigkeit (keine Dubletten) · Relevanz · Verfügbarkeit/Zugänglichkeit.

**Maßnahmen:**
- **Data Profiling:** Datenbestand systematisch untersuchen (Wertebereiche, NULL-Quoten, Muster, Ausreißer).
- **Data Cleansing:** Fehler korrigieren, Formate standardisieren, Dubletten zusammenführen.
- Validierungsregeln bei der Eingabe (Pflichtfelder, Formatprüfung, Wertebereiche, Prüfziffern), Vier-Augen-Prinzip, Verantwortlichkeiten (Data Owner/Steward).

**Fehlende Werte:** Datensatz löschen (Informationsverlust) · Imputation mit Mittelwert/Median/Modus (verzerrt Streuung) · fachlich nachrecherchieren (aufwendig, aber korrekt). **Ausreißer:** erst prüfen, ob echter Wert oder Erfassungsfehler – nicht blind löschen!

**Dublettenerkennung ohne ID:** Ähnlichkeitsvergleich über mehrere Felder (Name normalisieren, Adresse, Geburtsdatum), phonetische Verfahren, Fuzzy Matching.

---

## 7. Prozessmodellierung

**BPMN 2.0:**
- **Ereignisse (Kreis):** Start = dünner Rand, Zwischenereignis = Doppelrand, Ende = dicker Rand.
- **Aktivitäten:** abgerundetes Rechteck; „+" = zugeklappter Teilprozess.
- **Gateways (Raute):** **XOR** (X) = genau ein Pfad (Entscheidung) · **AND** (+) = alle Pfade parallel · **OR** (O) = ein oder mehrere Pfade. Merke: Was ein Gateway aufspaltet, führt ein gleichartiges Gateway wieder zusammen.
- **Pools** = Organisationen/Teilnehmer, **Lanes** = Rollen/Abteilungen innerhalb eines Pools.
- **Sequenzfluss** = durchgezogener Pfeil (nur innerhalb eines Pools) · **Nachrichtenfluss** = gestrichelter Pfeil (zwischen Pools) · Datenobjekte/Anmerkungen als Artefakte.

**EPK:** Ereignis (Sechseck) und Funktion (abgerundetes Rechteck) wechseln sich immer ab; Konnektoren XOR/OR/AND. Regel: Nach einem einzelnen Ereignis darf keine XOR-/OR-Verzweigung folgen (Ereignisse treffen keine Entscheidungen).

**Kennzahlen:** Durchlaufzeit = Bearbeitungs- + Liege- + Transportzeit (Liegezeit ist meist der größte Hebel!) · Fehlerquote · Termintreue · First Pass Yield · Prozesskosten. **PDCA:** Plan – Do – Check – Act (kontinuierliche Verbesserung).

---

## 8. Datenschutz (DSGVO) & IT-Sicherheit

**Grundsätze Art. 5:** Rechtmäßigkeit, Verarbeitung nach Treu und Glauben, Transparenz · Zweckbindung · Datenminimierung · Richtigkeit · Speicherbegrenzung · Integrität und Vertraulichkeit · (Rechenschaftspflicht).

**Rechtsgrundlagen Art. 6 (eine genügt):** Einwilligung · Vertragserfüllung · rechtliche Verpflichtung · lebenswichtige Interessen · öffentliche Aufgabe · berechtigtes Interesse (nach Abwägung).

**Betroffenenrechte:** Auskunft (Art. 15), Berichtigung (16), Löschung (17), Einschränkung (18), Datenübertragbarkeit (20), Widerspruch (21).

**Zentrale Begriffe:**
- **Anonymisierung:** Personenbezug ist nicht mehr herstellbar → DSGVO gilt nicht mehr.
- **Pseudonymisierung:** Zuordnung über separaten Schlüssel weiterhin möglich → DSGVO gilt weiter.
- **Auftragsverarbeitung (Art. 28):** Externer verarbeitet Daten weisungsgebunden → AV-Vertrag nötig.
- **DSFA (Art. 35):** Folgenabschätzung bei voraussichtlich hohem Risiko (z. B. umfangreiches Profiling).
- **Meldepflicht (Art. 33):** Datenpanne binnen **72 h** an die Aufsichtsbehörde.
- **Privacy by Design/Default (Art. 25)**, **TOM** = technische und organisatorische Maßnahmen. Besondere Kategorien (Gesundheit, Religion …) nach Art. 9 nur mit strengeren Voraussetzungen.

**IT-Sicherheit:**
- **Schutzziele:** Vertraulichkeit (nur Berechtigte lesen – Verschlüsselung, Berechtigungen) · Integrität (keine unbemerkte Veränderung – Hashes, Signaturen) · Verfügbarkeit (Systeme nutzbar – Redundanz, Backup); ergänzend Authentizität.
- **Verschlüsselung:** symmetrisch = ein gemeinsamer Schlüssel, schnell (AES) · asymmetrisch = öffentlicher + privater Schlüssel (RSA) · Hashing = Einweg-Prüfsumme (Integrität, Passwörter).
- **Berechtigungen:** rollenbasiert (RBAC), Least Privilege, Need-to-know, 2-Faktor-Authentifizierung, Protokollierung.
- **Backup:** Vollsicherung · differenziell (alles seit letzter Vollsicherung) · inkrementell (alles seit letzter Sicherung). **3-2-1-Regel:** 3 Kopien, 2 verschiedene Medien, 1 extern/offsite. RAID 1 (Spiegelung) und RAID 5 (Parität) erhöhen Verfügbarkeit – **ersetzen aber kein Backup**.

---

## 9. Datenvisualisierung

| Ziel | Geeigneter Diagrammtyp |
|---|---|
| Entwicklung über Zeit | Liniendiagramm |
| Vergleich von Kategorien | Balken-/Säulendiagramm |
| Verteilung eines Merkmals | Histogramm, Boxplot |
| Zusammenhang zweier Merkmale | Streudiagramm |
| Anteile am Ganzen | Kreisdiagramm (nur wenige Kategorien!), gestapelte Balken |
| Werte-Matrix/Muster | Heatmap |

**Manipulations-/Gestaltungsfehler erkennen:** abgeschnittene y-Achse (übertreibt Unterschiede), 3D-Effekte, ungleiche Achsenintervalle, fehlende Beschriftung, zu viele Farben, Kreisdiagramm mit 10+ Segmenten. Gutes Dashboard: wenige relevante KPIs, klare Zielgruppe, Vergleichswerte (Vorperiode/Ziel), einheitliche Skalen.

---

## 10. Projektmanagement & Wirtschaftlichkeit

- **SMART-Ziele:** Spezifisch, Messbar, Attraktiv/Akzeptiert, Realistisch, Terminiert.
- **Magisches Dreieck:** Zeit – Kosten – Qualität/Leistungsumfang.
- **Lastenheft** = Auftraggeber beschreibt *was* und *wofür*. **Pflichtenheft** = Auftragnehmer beschreibt *wie und womit* (Umsetzungskonzept).
- **Wasserfall/V-Modell:** sequenziell, feste Phasen, gut bei stabilen Anforderungen. **Scrum:** Rollen (Product Owner, Scrum Master, Entwicklungsteam), Artefakte (Product Backlog, Sprint Backlog, Increment), Events (Sprint 2–4 Wochen, Planning, Daily, Review, Retrospektive). **Kanban:** Fluss visualisieren, WIP-Limits.
- **Netzplan:** kritischer Pfad = längster Weg ohne Puffer; Verzögerung dort verzögert das ganze Projekt.
- **Amortisationszeit** = Investitionskosten / jährlicher Rückfluss (Einsparung bzw. Gewinn). Beispiel: 24.000 € / 8.000 €/Jahr = 3 Jahre.
- **Nutzwertanalyse:** Kriterien festlegen → gewichten (Summe 100 %) → Punkte je Alternative vergeben → Punkte × Gewicht summieren → höchster Nutzwert gewinnt. Stärke: macht qualitative Kriterien vergleichbar; Schwäche: Gewichtung/Punktvergabe subjektiv.
- **Break-even-Menge** = Fixkosten / (Verkaufspreis − variable Stückkosten). **ROI** = Gewinn / eingesetztes Kapital.

---

## 11. WiSo-Basics kompakt

- **Sozialversicherung (5 Zweige + Träger):** Krankenversicherung (Krankenkassen) · Pflegeversicherung (Pflegekassen) · Rentenversicherung (Deutsche Rentenversicherung) · Arbeitslosenversicherung (Bundesagentur für Arbeit) · Unfallversicherung (Berufsgenossenschaften – zahlt der Arbeitgeber allein). Übrige Beiträge grundsätzlich je zur Hälfte AG/AN.
- **Kündigung:** Grundfrist § 622 BGB = 4 Wochen zum 15. oder zum Monatsende; in der Probezeit 2 Wochen. Kündigungsschutzgesetz greift bei mehr als 10 Arbeitnehmern und mehr als 6 Monaten Betriebszugehörigkeit (Kündigung braucht dann Grund: personen-, verhaltens- oder betriebsbedingt). Fristlose Kündigung nur aus wichtigem Grund, i. d. R. nach Abmahnung.
- **Ausbildung:** Probezeit 1–4 Monate (beidseitig fristlos ohne Grund kündbar). Danach: Betrieb nur fristlos aus wichtigem Grund; Azubi zusätzlich mit 4 Wochen Frist bei Berufsaufgabe/-wechsel (§ 22 BBiG).
- **Betriebsrat:** wählbar ab 5 ständigen wahlberechtigten Arbeitnehmern (BetrVG); Mitbestimmung u. a. bei Arbeitszeit, Verhaltens-/Leistungskontrolle durch technische Einrichtungen (§ 87). **JAV** vertritt Azubis und Beschäftigte unter 25.
- **Tarifvertrag:** regelt Löhne und Arbeitsbedingungen zwischen Gewerkschaft und Arbeitgeber(-verband); **Tarifautonomie** = Aushandlung ohne staatlichen Eingriff (Art. 9 GG). Günstigkeitsprinzip: Abweichung nur zugunsten des Arbeitnehmers.
- **Vollmachten:** Prokura (umfassend, HGB, Eintragung ins Handelsregister) vs. Handlungsvollmacht (begrenzt auf Art/Umfang der Geschäfte).
- **Kaufvertrag:** zwei übereinstimmende Willenserklärungen (Antrag + Annahme). Mängel: Sach-/Rechtsmangel; Rechte: Nacherfüllung vor Rücktritt/Minderung/Schadensersatz.
- **Wirtschaft:** Magisches Viereck = Preisniveaustabilität, hoher Beschäftigungsstand, außenwirtschaftliches Gleichgewicht, stetiges Wachstum. Marktpreis über Angebot und Nachfrage.

---

*Tipp: Aus jedem Abschnitt Karteikarten machen (Frage vorne, Antwort hinten) und täglich 10–15 min wiederholen. Sag mir einfach ein Thema, zu dem du einen ausführlichen Deep-Dive-Lernzettel mit Übungsaufgaben möchtest.*
