<!-- Begriffsseiten Y · Stand 2026-10 -->
## YAML
<!-- id: yaml · quellen: Karte DD15, DD15 2.4 · stand: 2026-10 -->

Gut lesbares, textbasiertes Datenformat, das Struktur über **Einrückung** statt Klammern ausdrückt; typisch für Konfigurationsdateien und API-Beschreibungen (OpenAPI).

### Erklärung
YAML („YAML Ain’t Markup Language“) kennt Schlüssel-Wert-Paare (`schluessel: wert`), Listen (Zeilen mit `- `) und beliebige Verschachtelung über Leerzeichen-Einrückung; Tabulatoren sind nicht erlaubt. Kommentare beginnen mit `#` – anders als in JSON. Ab Version 1.2 ist YAML weitgehend eine Obermenge von JSON.

### Beispiel
```yaml
# Ladejob Reparaturdaten
quelle: werkstatt_db
ziel: dwh.fakt_reparatur
zeitplan: "0 2 * * *"
spalten:
  - auftrag_id
  - kosten
```

### Abgrenzung
| | JSON | YAML |
|---|---|---|
| Struktur | Klammern | Einrückung |
| Kommentare | nein | ja (`#`) |
| typischer Einsatz | Web-APIs, Datenaustausch | Konfiguration, OpenAPI |

### Prüfungsfalle
Einrückungsfehler übersehen – ein fehlendes Leerzeichen ändert die Struktur oder macht die Datei ungültig.

### Merksatz
YAML: Einrückung ist Struktur, # ist Kommentar.

Siehe auch: JSON · OpenAPI · XML
Mehr: Deep Dive 15, 2.4
