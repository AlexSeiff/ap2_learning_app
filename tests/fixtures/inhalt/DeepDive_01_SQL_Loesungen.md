# Musterlösungen SQL-Übungsklausur (Deep Dive 1)
## Mit Prüferkommentaren zur Punktevergabe

**Selbstbewertung:** Vergib Teilpunkte wie ein Prüfer. 92+ P = sehr gut.

---

## Block A

**A1 (6 P):**
WHERE filtert Zeilen **vor** der Gruppierung, HAVING filtert Gruppen **nach** der Aggregation.

*Prüferkommentar: Je 2 P für WHERE und HAVING, 2 P für die Verarbeitungsreihenfolge.*

**A2 (5 P):**
`COUNT(*)` = **2** (zählt alle Zeilen, unabhängig von NULL).

**A3 (9 P):**
1. **Fehler 1:** Aggregatbedingung in WHERE statt HAVING.
2. **Fehler 2:** Alias `anzahl` ist in WHERE/HAVING nicht bekannt.
3. **Fehler 3:** `GROUP BY name` statt `GROUP BY ort`.

```sql
SELECT ort, COUNT(*) AS anzahl
FROM kunde
GROUP BY ort
HAVING COUNT(*) > 1;
```

*Prüferkommentar: Je Fehler 1 P fürs Benennen + 1 P für die Begründung, 3 P für die korrigierte Abfrage.*

---

## Block B

**B1 (18 P):** Erforderliche Elemente und Punktevergabe:

| Element | P |
|---|---|
| Pool „Möbelhaus" mit **zwei Lanes** | 3 |
| Startereignis in der Annahme | 2 |
| **XOR-Gateway** mit beschrifteten Pfaden | 3,5 |
| Nachrichtenfluss zum Kundenpool | 2 |
| **Summe** | **10,5** |

**B2 (30 P):**
```sql
SELECT k.name, SUM(p.menge * p.preis) AS umsatz
FROM kunde k
JOIN bestellung b ON b.kunden_id = k.kunden_id
JOIN position p ON p.bestell_id = b.bestell_id
GROUP BY k.name
ORDER BY umsatz DESC;
```

**B3 (32 P):**
```sql
SELECT k.name
FROM kunde k
LEFT JOIN bestellung b ON b.kunden_id = k.kunden_id
WHERE b.bestell_id IS NULL;
```

---

## Auswertung

**A1 (6 P):** Diese Zeile steht hinter „Auswertung" und darf keine Lösung überschreiben.
