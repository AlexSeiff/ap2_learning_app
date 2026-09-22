# Deep Dive 1: SQL (KW 28–29)
## Lernzettel mit Übungsklausur im IHK-Stil – FIDPA AP2

Testblatt im Format der echten Lernblätter – nur für die Parser-Tests.

---

## Die Übungsdatenbank „Möbelhaus Test"

**kunde**
| kunden_id (PK) | name | ort |
|---|---|---|
| 1 | Huber GmbH | München |
| 2 | Schmidt AG | Hamburg |

---

# Teil 1 – Grundlagen

## 1.1 SELECT: Projektion und Selektion

**Projektion** = Auswahl von Spalten, **Selektion** = Auswahl von Zeilen.

```sql
# kein Heading, nur ein Kommentar im Codeblock
SELECT name FROM kunde;
```

> ❓ **Prüferfrage:** Worin unterscheiden sich Projektion und Selektion?
> *Projektion wählt Spalten, Selektion filtert Zeilen.*

## 1.2 WHERE im Detail

> ❓ **Prüferfrage (Fehleranalyse):** Warum liefert `WHERE telefon = NULL` keine Zeilen,
> obwohl NULL-Werte existieren?
> *Vergleiche mit NULL ergeben UNKNOWN – richtig ist `IS NULL`.*

---

# Übungsklausur SQL (100 Punkte, 90 Minuten)

Bearbeite die Klausur am Stück. Faustregel: 1 Punkt ≈ 1 Minute.

## Anlage 1 – Auszug Tabelle bestellung

| bestell_id | kunden_id |
|---|---|
| 10 | 1 |

## Block A – Wissen und Fehleranalyse (20 P)

**A1 (6 P):** *Erläutern* Sie den Unterschied zwischen WHERE und HAVING.

**A2 (5 P):** *Geben* Sie das Ergebnis von `SELECT COUNT(*) FROM kunde` *an*.

**A3 (9 P):** Die folgende Abfrage enthält **drei Fehler**. *Benennen* und *korrigieren* Sie sie.
```sql
SELECT ort, COUNT(*) AS anzahl
FROM kunde
WHERE anzahl > 1
GROUP BY name;
```

## Block B – Abfragen entwickeln (80 P)

Szenario: Das Möbelhaus erweitert seine Auswertungen.

**B1 (18 P):** *Modellieren* Sie den Bestellprozess als BPMN-Diagramm.

**B2 (30 P):** Der Gesamtumsatz je Kunde (name, umsatz), absteigend sortiert.

**B3 (32 P):** Alle Kunden (name), die **noch nie** bestellt haben.

---

## Fachgespräch: typische SQL-Fragen des Ausschusses

1. „Begründen Sie Ihre Wahl zwischen INNER und LEFT JOIN."
2. „Wie haben Sie sichergestellt, dass Ihre Abfragen **korrekte** Ergebnisse liefern?" (Erwartet: Plausibilisierung über Zeilenzahlen, Stichproben gegen das Quellsystem.)

---

## Lernziel-Check (am Ende von KW 29 alles mit Ja beantworten)

- [ ] Ich kann WHERE und HAVING sauber abgrenzen.
- [x] Ich kenne das NULL-Verhalten aller Aggregatfunktionen.
- [ ] Übungsklausur mit ≥ 92 Punkten bestanden.
