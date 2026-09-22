# Deep Dive 1: SQL (KW 28–29)
## Lernzettel mit Übungsklausur im IHK-Stil – FIDPA AP2

---

## Prüfungsrelevanz

SQL ist eines der sichersten Punktethemen der AP2. Es taucht vor allem in **„Sicherstellen der Datenqualität"** auf (Daten bereitstellen, Qualität per Abfrage prüfen), regelmäßig aber auch in **„Durchführen einer Prozessanalyse"** (Kennzahlen aus Daten ermitteln) und im **Fachgespräch**, sobald dein Projekt Daten aus einer Datenbank bezieht. Typische Aufgabenformate: Abfrage schreiben, Abfrage-Ergebnis angeben, Fehler in einer Abfrage finden, Unterschiede erläutern.

---

## Die Übungsdatenbank „Möbelhaus Nordholz GmbH"

Alle Beispiele und die Übungsklausur beziehen sich auf dieses Szenario. **Drucke dir diese Seite aus** – in der Prüfung bekommst du genau solche Tabellenauszüge und musst Abfragen von Hand nachvollziehen.

**kunde**
| kunden_id (PK) | name | ort | registriert_am |
|---|---|---|---|
| 1 | Huber GmbH | München | 2023-04-12 |
| 2 | Schmidt AG | Hamburg | 2024-01-30 |
| 3 | Fischer KG | München | 2022-09-05 |
| 4 | Weber e.K. | Köln | 2025-06-18 |
| 5 | Braun GmbH | Hamburg | 2024-11-02 |

**produkt**
| produkt_id (PK) | bezeichnung | kategorie | preis |
|---|---|---|---|
| 10 | Bürostuhl Comfort | Möbel | 249.00 |
| 11 | Schreibtisch Basic | Möbel | 399.00 |
| 12 | Monitor 27 Zoll | Elektronik | 189.00 |
| 13 | Dockingstation | Elektronik | 129.00 |
| 14 | Schreibtischlampe | Zubehör | 39.90 |

**bestellung**
| bestell_id (PK) | kunden_id (FK) | bestelldatum |
|---|---|---|
| 100 | 1 | 2026-01-15 |
| 101 | 3 | 2026-02-03 |
| 102 | 1 | 2026-02-20 |
| 103 | 2 | 2026-03-11 |
| 104 | 3 | 2026-04-27 |
| 105 | 1 | 2026-05-30 |

**bestellposition**
| bestell_id (FK) | produkt_id (FK) | menge |
|---|---|---|
| 100 | 10 | 2 |
| 100 | 12 | 2 |
| 101 | 11 | 1 |
| 101 | 14 | 3 |
| 102 | 13 | 4 |
| 103 | 12 | 5 |
| 104 | 10 | 1 |
| 105 | 14 | 2 |

Beziehungen: kunde 1:n bestellung 1:n bestellposition n:1 produkt. Der Primärschlüssel von *bestellposition* ist zusammengesetzt (bestell_id + produkt_id) – so wird die m:n-Beziehung zwischen Bestellung und Produkt aufgelöst.

---

# Teil 1 – Grundlagen (KW 28)

## 1.1 SELECT: Projektion und Selektion

```sql
SELECT name, ort          -- Projektion: WELCHE SPALTEN
FROM kunde                -- Datenquelle
WHERE ort = 'München';    -- Selektion: WELCHE ZEILEN
```

Fachbegriffe sicher verwenden: **Projektion** = Auswahl von Spalten, **Selektion** = Auswahl von Zeilen. `SELECT *` gibt alle Spalten aus (in der Praxis vermeiden, in der Prüfung nur wenn ausdrücklich „alle Spalten" gefordert). Textwerte stehen **immer in einfachen Anführungszeichen**, Zahlen nie.

> ❓ **Prüferfrage:** Worin unterscheiden sich Projektion und Selektion?
> *Projektion reduziert die Ergebnismenge auf bestimmte Spalten, Selektion filtert über eine Bedingung bestimmte Zeilen heraus.*

## 1.2 WHERE im Detail

| Baustein | Bedeutung | Beispiel |
|---|---|---|
| `=  <>  <  >  <=  >=` | Vergleiche | `preis <> 249` |
| `AND / OR / NOT` | Verknüpfung (AND bindet stärker als OR → Klammern setzen!) | `ort = 'Köln' OR ort = 'Hamburg'` |
| `BETWEEN x AND y` | Bereich **einschließlich** der Grenzen | `preis BETWEEN 100 AND 200` |
| `IN (…)` | Werteliste, ersetzt mehrere OR | `ort IN ('Köln','Hamburg')` |
| `LIKE` | Muster: `%` = beliebig viele Zeichen, `_` = genau ein Zeichen | `bezeichnung LIKE 'Schreibtisch%'` |
| `IS NULL / IS NOT NULL` | NULL-Prüfung – **niemals** `= NULL`! | `telefon IS NULL` |

NULL bedeutet „Wert unbekannt/nicht vorhanden" – das ist **nicht** dasselbe wie 0 oder ein leerer Text. Jeder Vergleich mit `=` gegen NULL liefert kein Ergebnis; deshalb existiert `IS NULL`.

> ❓ **Prüferfrage:** Warum liefert `WHERE telefon = NULL` keine Zeilen, obwohl NULL-Werte existieren?
> *Weil NULL „unbekannt" bedeutet und ein Vergleich mit `=` daher nicht wahr werden kann – korrekt ist `IS NULL`.*

## 1.3 ORDER BY und DISTINCT

```sql
SELECT DISTINCT ort FROM kunde ORDER BY ort ASC;
```

`ORDER BY spalte ASC` (aufsteigend, Standard) bzw. `DESC` (absteigend); mehrere Sortierkriterien mit Komma: `ORDER BY ort ASC, name ASC`. `DISTINCT` entfernt Duplikate aus dem Ergebnis – auf die Übungsdatenbank angewendet liefert die Abfrage oben: Hamburg, Köln, München (statt 5 Zeilen nur 3).

## 1.4 Berechnete Spalten und Aliase

```sql
SELECT bezeichnung, preis, preis * 1.19 AS bruttopreis
FROM produkt;
```

`AS` vergibt einen Spalten-Alias (Anzeigename). Auch Tabellen bekommen Aliase (`FROM kunde k`) – bei JOINs Pflichtprogramm für lesbare Lösungen.

## 1.5 Aggregatfunktionen und ihr NULL-Verhalten

| Funktion | Liefert | NULL-Verhalten |
|---|---|---|
| `COUNT(*)` | Anzahl **aller Zeilen** | zählt auch Zeilen mit NULL |
| `COUNT(spalte)` | Anzahl der Werte in der Spalte | **ignoriert NULL** |
| `SUM / AVG` | Summe / Durchschnitt | ignorieren NULL |
| `MIN / MAX` | kleinster / größter Wert | ignorieren NULL |

Beispiel zum Merken: Hat *kunde* 5 Zeilen und bei 2 Kunden ist `telefon` NULL, dann liefert `COUNT(*)` = 5, `COUNT(telefon)` = 3. Daraus folgt direkt eine Datenqualitätskennzahl: `COUNT(*) - COUNT(telefon)` = Anzahl fehlender Werte.

---

# Teil 2 – Fortgeschritten (KW 29)

## 2.1 GROUP BY und HAVING

```sql
SELECT ort, COUNT(*) AS anzahl_kunden
FROM kunde
GROUP BY ort
HAVING COUNT(*) > 1;
```

`GROUP BY` fasst Zeilen mit gleichem Wert zu Gruppen zusammen; Aggregatfunktionen werten dann **je Gruppe** aus. Ergebnis oben: München 2, Hamburg 2 (Köln fällt durch HAVING raus).

**Die wichtigste Regel der ganzen Prüfung:**
- `WHERE` filtert **einzelne Zeilen vor** der Gruppierung → darf **keine** Aggregatfunktion enthalten.
- `HAVING` filtert **Gruppen nach** der Aggregation → hier gehören Bedingungen wie `COUNT(*) > 1` hin.

Zweite Regel: Jede Spalte im SELECT, die **nicht aggregiert** ist, muss im `GROUP BY` stehen.

> ❓ **Prüferfrage:** Warum ist `WHERE COUNT(*) > 1` syntaktisch falsch?
> *WHERE wird vor der Gruppierung ausgewertet – zu diesem Zeitpunkt existieren noch keine Gruppen, über die COUNT rechnen könnte. Aggregatbedingungen gehören in HAVING.*

## 2.2 JOINs – Tabellen verknüpfen

```sql
SELECT b.bestell_id, b.bestelldatum, k.name
FROM bestellung b
INNER JOIN kunde k ON b.kunden_id = k.kunden_id;
```

| JOIN-Typ | Ergebnis |
|---|---|
| `INNER JOIN` | nur Zeilen mit Übereinstimmung in **beiden** Tabellen |
| `LEFT JOIN` | **alle** Zeilen der linken Tabelle; ohne Treffer rechts → NULL |
| `RIGHT JOIN` | spiegelbildlich zu LEFT |
| `FULL OUTER JOIN` | alle Zeilen beider Seiten |

An der Übungsdatenbank nachvollziehen: `bestellung INNER JOIN kunde` → 6 Zeilen (jede Bestellung hat einen Kunden). `kunde LEFT JOIN bestellung` → **8 Zeilen**: Huber 3×, Fischer 2×, Schmidt 1×, Weber und Braun je 1× mit NULL in den Bestellspalten – sie haben keine Bestellungen.

**Der Prüfungsklassiker** („Welche Kunden haben noch nie bestellt?"):
```sql
SELECT k.name
FROM kunde k
LEFT JOIN bestellung b ON k.kunden_id = b.kunden_id
WHERE b.bestell_id IS NULL;
```

Merke außerdem: Vergisst man die ON-Bedingung (bzw. schreibt ein Kreuzprodukt), wird jede Zeile mit jeder kombiniert – 5 Kunden × 6 Bestellungen = 30 sinnlose Zeilen. Wenn dein Ergebnis „explodiert", fehlt fast immer eine Join-Bedingung.

> ❓ **Prüferfrage:** Ihre Umsatzauswertung nutzt einen INNER JOIN von kunde auf bestellung. Welche Kunden fehlen im Bericht – und warum kann das die Analyse verfälschen?
> *Kunden ohne Bestellung fallen stillschweigend heraus. Für eine Umsatzliste ist das korrekt, für z. B. eine Aktivitätsanalyse würden inaktive Kunden unsichtbar – dann ist LEFT JOIN nötig.*

## 2.3 Unterabfragen

```sql
SELECT bezeichnung, preis
FROM produkt
WHERE preis > (SELECT AVG(preis) FROM produkt);
```

Die innere Abfrage liefert einen Wert (hier 201,18 €), die äußere vergleicht dagegen. Varianten: skalare Unterabfrage (ein Wert), `IN (Unterabfrage)` (Werteliste), `EXISTS` (Existenzprüfung). Faustregel für die Prüfung: „…als der Durchschnitt / das Maximum / alle, die in … vorkommen" → Unterabfrage.

## 2.4 DML – Daten ändern

```sql
INSERT INTO kunde (kunden_id, name, ort, registriert_am)
VALUES (6, 'Krause OHG', 'Bremen', '2026-07-06');

UPDATE produkt SET preis = 259.00 WHERE produkt_id = 10;

DELETE FROM bestellposition WHERE bestell_id = 105;
```

⚠️ `UPDATE`/`DELETE` **ohne WHERE** trifft die gesamte Tabelle – ein beliebter Fehlersuche-Punkt in Prüfungen. Transaktionen sichern Änderungen ab: `COMMIT` bestätigt, `ROLLBACK` verwirft (Stichwort ACID).

## 2.5 DDL, Constraints und referenzielle Integrität

```sql
CREATE TABLE retoure (
  retoure_id  INTEGER PRIMARY KEY,
  bestell_id  INTEGER NOT NULL,
  grund       VARCHAR(200) NOT NULL,
  erstattung  DECIMAL(8,2) CHECK (erstattung >= 0),
  datum       DATE DEFAULT CURRENT_DATE,
  FOREIGN KEY (bestell_id) REFERENCES bestellung(bestell_id)
);
```

Constraints benennen und erklären können: **PRIMARY KEY** (eindeutig + nicht NULL), **FOREIGN KEY … REFERENCES** (Wert muss in der Zieltabelle existieren = referenzielle Integrität), **NOT NULL**, **UNIQUE**, **CHECK**, **DEFAULT**. Löschverhalten: `ON DELETE RESTRICT` (verhindern), `CASCADE` (mitlöschen), `SET NULL`. Referenzielle Integrität ist ein direktes **Datenqualitätsinstrument**: Sie verhindert verwaiste Datensätze (Bestellung ohne existierenden Kunden).

## 2.6 Logische Verarbeitungsreihenfolge (auswendig!)

**FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY**

Damit erklärst du fast jeden SQL-Fehler: Warum kein Aggregat in WHERE (Gruppen existieren noch nicht), warum Spalten-Aliase aus SELECT in WHERE nicht nutzbar sind (SELECT kommt später), warum ORDER BY Aliase kennt (kommt zuletzt).

---

## SQL für Datenqualitätsprüfungen – deine Fachrichtungs-Spezialität

Genau diese Verbindung macht DPA-Aufgaben aus. Drei Muster auswendig können:

```sql
-- 1) Vollständigkeit: fehlende Werte zählen
SELECT COUNT(*) - COUNT(telefon) AS fehlende_telefonnummern FROM kunde;

-- 2) Eindeutigkeit: Dubletten finden
SELECT email, COUNT(*) AS anzahl
FROM kunde
GROUP BY email
HAVING COUNT(*) > 1;

-- 3) Korrektheit: Wertebereichsverstöße aufspüren
SELECT * FROM produkt WHERE preis <= 0;
```

Damit kannst du im Fachgespräch souverän beantworten, **wie** du Datenqualität konkret geprüft hast – nicht nur, dass du es getan hast.

---

## Die 8 häufigsten Fehler aus Prüfersicht

1. Aggregatbedingung in WHERE statt HAVING.
2. Nicht aggregierte SELECT-Spalte fehlt im GROUP BY.
3. `= NULL` statt `IS NULL`.
4. Textwerte ohne einfache Anführungszeichen.
5. Join-Bedingung vergessen → Kreuzprodukt.
6. INNER JOIN verwendet, obwohl auch Datensätze ohne Treffer gebraucht werden (LEFT JOIN).
7. `COUNT(spalte)` und `COUNT(*)` bei NULL-Werten verwechselt.
8. BETWEEN-Grenzen falsch interpretiert (sie zählen **mit**).

---

# Übungsklausur SQL (100 Punkte, 90 Minuten)

Bearbeite die Klausur **nach KW 29** am Stück, handschriftlich, ohne Unterlagen – nur mit den Tabellen der Möbelhaus Nordholz GmbH von oben. Lösungen erst danach öffnen. Faustregel: 1 Punkt ≈ 1 Minute.

## Block A – Wissen und Fehleranalyse (19 P)

**A1 (6 P):** *Erläutern* Sie den Unterschied zwischen WHERE und HAVING. Gehen Sie dabei auf die logische Verarbeitungsreihenfolge ein.

**A2 (4 P):** Die Tabelle *kunde* enthält 5 Zeilen; bei 2 Kunden ist die Spalte `telefon` NULL. *Geben* Sie die Ergebnisse von `SELECT COUNT(*) FROM kunde` und `SELECT COUNT(telefon) FROM kunde` *an* und *begründen* Sie den Unterschied.

**A3 (9 P):** Die folgende Abfrage soll alle Orte ausgeben, in denen mehr als ein Kunde ansässig ist. Sie enthält **drei Fehler**. *Benennen* Sie jeden Fehler, *begründen* Sie ihn und *notieren* Sie die korrigierte Abfrage.
```sql
SELECT ort, COUNT(*) AS anzahl
FROM kunde
WHERE anzahl > 1
GROUP BY name;
```

## Block B – Abfragen entwickeln (66 P)

**B1 (5 P):** Alle Kunden (name, ort) aus München, alphabetisch aufsteigend nach Name sortiert.

**B2 (5 P):** Alle Produkte (bezeichnung, preis) der Kategorie Elektronik mit einem Preis unter 150 €.

**B3 (4 P):** Alle Produkte, deren Bezeichnung mit „Schreibtisch" beginnt.

**B4 (6 P):** Anzahl der Kunden je Ort (ort, anzahl).

**B5 (4 P):** Der Durchschnittspreis aller Produkte mit dem Spaltennamen `durchschnittspreis`.

**B6 (7 P):** Alle Bestellungen (bestell_id) mit der Anzahl ihrer Positionen – aber nur Bestellungen mit **mehr als einer** Position.

**B7 (7 P):** Für jede Bestellung: bestell_id, bestelldatum und der Name des Kunden.

**B8 (12 P):** Der Gesamtumsatz je Kunde (name, umsatz) über alle Bestellungen, absteigend nach Umsatz sortiert. (Hinweis: Umsatz = menge × preis; vier Tabellen erforderlich.)

**B9 (8 P):** Alle Kunden (name), die **noch nie** bestellt haben.

**B10 (8 P):** Alle Produkte (bezeichnung, preis), die teurer sind als der Durchschnittspreis aller Produkte.

## Block C – Interpretieren und Erstellen (15 P)

**C1 (7 P):** *Geben* Sie die vollständige Ergebnistabelle der folgenden Abfrage *an* (Spaltenüberschriften, Werte, Reihenfolge):
```sql
SELECT kategorie, MIN(preis) AS guenstigster
FROM produkt
GROUP BY kategorie
ORDER BY guenstigster DESC;
```

**C2 (8 P):** *Erstellen* Sie die Tabelle `retoure` per SQL mit folgenden Anforderungen: `retoure_id` als Primärschlüssel; `bestell_id` als Pflichtfeld und Fremdschlüssel auf *bestellung*; `grund` als Pflicht-Textfeld; `erstattung` als Dezimalzahl, die nicht negativ sein darf; `datum` mit dem aktuellen Datum als Standardwert.

---

## Fachgespräch: typische SQL- und Datenbankfragen des Ausschusses

1. „Sie haben die Projektdaten per SQL extrahiert. *Begründen* Sie Ihre Wahl zwischen INNER und LEFT JOIN – welches Risiko hätte die jeweils andere Variante für Ihr Analyseergebnis?"
2. „Wie haben Sie sichergestellt, dass Ihre Abfragen **korrekte** Ergebnisse liefern?" (Erwartet: Plausibilisierung über Zeilenzahlen, Stichproben gegen das Quellsystem, Kontrollsummen.)
3. „Welche Rolle spielt referenzielle Integrität für die Datenqualität in Ihrem Projekt?"
4. „Eine Ihrer Auswertungen läuft zu langsam. Welche Ansatzpunkte haben Sie?" (Erwartet: Index auf Filter-/Join-Spalten, nur benötigte Spalten laden, Voraggregation, Ausführungsplan ansehen.)
5. „Warum haben Sie die Daten bereits in SQL aggregiert, statt alle Rohdaten ins BI-Tool zu laden?"

---

## Lernziel-Check (am Ende von KW 29 alles mit Ja beantworten)

- [ ] Ich kann Projektion/Selektion, WHERE-Operatoren, LIKE, BETWEEN, IN und IS NULL sicher anwenden.
- [ ] Ich kenne das NULL-Verhalten aller Aggregatfunktionen.
- [ ] Ich kann WHERE und HAVING fachlich sauber abgrenzen und die logische Verarbeitungsreihenfolge aufsagen.
- [ ] Ich kann INNER und LEFT JOIN unterscheiden und den „Kunden ohne Bestellung"-Klassiker fehlerfrei schreiben.
- [ ] Ich kann eine Unterabfrage mit AVG formulieren.
- [ ] Ich kann CREATE TABLE mit allen gängigen Constraints schreiben und referenzielle Integrität erklären.
- [ ] Ich kann die drei Datenqualitätsmuster (Vollständigkeit, Dubletten, Wertebereiche) aus dem Kopf.
- [ ] Übungsklausur mit ≥ 92 Punkten bestanden.
