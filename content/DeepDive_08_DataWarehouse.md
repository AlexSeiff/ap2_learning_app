# Deep Dive 8: Data Warehouse & Big Data (KW 36)
## Lernzettel mit Übungsklausur im IHK-Stil – FIDPA AP2

---

## Prüfungsrelevanz

Dieser Themenblock gehört zum Prüfungsteil „Daten identifizieren, klassifizieren und bereitstellen" innerhalb von **„Sicherstellen der Datenqualität"**. Typische Aufgaben: OLTP und OLAP abgrenzen, ein **Sternschema entwerfen**, Fakten- und Dimensionstabellen benennen, den ETL-Prozess erläutern, Historisierung von Stammdaten beschreiben, Big-Data-Merkmale zuordnen.

Für dein Projekt ist der Block praktisch relevant: Fast jede betriebliche Datenanalyse zieht Daten aus operativen Systemen und bereitet sie für Auswertungen auf – genau das ist ein ETL-Prozess, auch wenn er nur aus einem Skript besteht.

Szenario: **Möbelhaus Nordholz GmbH** – die operative Datenbank kennst du aus Deep Dive 1 und 2.

---

# Teil 1 – OLTP und OLAP

Der Ausgangspunkt: Operative Systeme und Auswertungssysteme haben **gegensätzliche Anforderungen**. Deshalb trennt man sie.

| Kriterium | **OLTP** (operativ) | **OLAP** (analytisch) |
|---|---|---|
| Zweck | Tagesgeschäft abwickeln | Entscheidungen unterstützen |
| Typische Operation | einzelne Bestellung anlegen | Umsatz je Region und Quartal auswerten |
| Zugriffsart | viele kurze Lese-/Schreibvorgänge | wenige, komplexe Leseabfragen |
| Datenmodell | **normalisiert** (3. NF) | **denormalisiert** (Star/Snowflake) |
| Datenbestand | aktuell, detailliert | historisiert, oft aggregiert |
| Zeithorizont | Gegenwart | Jahre |
| Optimiert auf | Schreibgeschwindigkeit, Konsistenz | Lesegeschwindigkeit, Verständlichkeit |
| Nutzer | Sachbearbeitung, Kundschaft | Controlling, Management, Analyse |

**Warum nicht direkt im OLTP auswerten?** Drei Gründe, die in Prüfungen erwartet werden:
1. **Lastproblem:** Komplexe Auswertungen bremsen das Tagesgeschäft aus.
2. **Fehlende Historie:** Operative Systeme überschreiben Änderungen – wer im Mai die Adresse ändert, hat rückwirkend „immer" die neue Adresse gehabt. Für Zeitvergleiche ist das fatal.
3. **Verteilte Quellen:** Auswertungen brauchen Daten aus mehreren Systemen (Warenwirtschaft, CRM, Buchhaltung), die erst zusammengeführt und vereinheitlicht werden müssen.

---

# Teil 2 – Architektur eines Data Warehouse

```
Quellsysteme      Staging Area       Core-DWH          Data Marts        Auswertung
(OLTP, CSV,   →   (Rohdaten,     →   (integriert,  →   (fachbereichs- →  (BI-Tool,
 Fremdsysteme)     unverändert)       historisiert)     bezogen)          Bericht)
       └────────────── ETL ──────────────┘
```

- **Staging Area:** Zwischenspeicher für die unveränderten Rohdaten. Zweck: Quellsysteme werden schnell wieder entlastet, und bei Fehlern kann ohne erneuten Zugriff auf die Quelle nachgeladen werden.
- **Core-DWH:** integrierter, historisierter, unternehmensweiter Datenbestand – die „einzige Wahrheit".
- **Data Mart:** fachbereichsbezogener Ausschnitt (Vertrieb, Logistik), auf die Fragen dieses Bereichs zugeschnitten und dadurch schnell und verständlich.

**Die vier Merkmale eines DWH nach Inmon** (Standarddefinition, gern abgefragt):
**themenorientiert** (an fachlichen Themen ausgerichtet, nicht an Prozessen) · **integriert** (vereinheitlichte Formate, Codes und Bezeichnungen) · **zeitbezogen** (historisiert statt überschrieben) · **beständig** (nicht flüchtig – einmal geladene Daten werden nicht geändert oder gelöscht).

---

# Teil 3 – ETL und ELT

## 3.1 Die drei Phasen

**E – Extract:** Daten aus den Quellsystemen lesen. Varianten: **Vollextraktion** (alles) oder **Deltaextraktion** (nur Änderungen seit dem letzten Lauf – schneller, aber setzt Änderungskennzeichen oder Zeitstempel voraus). Meist nachts, um die Quellsysteme nicht zu belasten.

**T – Transform:** Der eigentliche Arbeitsschritt. Typische Aufgaben:
- **Bereinigen:** fehlende Werte behandeln, Dubletten entfernen, Ausreißer prüfen
- **Vereinheitlichen:** Datumsformate, Einheiten, Währungen, Groß-/Kleinschreibung
- **Harmonisieren:** Schlüssel verschiedener Systeme zusammenführen („Kunde 4711" im CRM = „K-1001" in der Warenwirtschaft)
- **Anreichern:** berechnete Merkmale bilden (Deckungsbeitrag, Lieferdauer)
- **Aggregieren:** vorverdichten, wo Detailtiefe nicht gebraucht wird
- **Prüfen:** Validierungsregeln anwenden, fehlerhafte Sätze in eine **Quarantäne** ausleiten statt sie stillschweigend zu verwerfen

**L – Load:** Laden ins Zielsystem, meist als Batch. Fehlerhafte Datensätze werden protokolliert, nicht ignoriert.

## 3.2 ETL oder ELT?

| | **ETL** | **ELT** |
|---|---|---|
| Reihenfolge | Transformation **vor** dem Laden | erst laden, dann transformieren |
| Zielsystem | klassisches DWH | Data Lake, Cloud-Plattform |
| Vorteil | nur geprüfte Daten im Ziel, kleineres Zielsystem | Rohdaten bleiben erhalten, spätere Auswertungen mit anderer Logik möglich, nutzt Rechenleistung des Zielsystems |
| Nachteil | Rohdaten gehen verloren, Änderungen erfordern erneutes Laden | Zielsystem enthält auch ungeprüfte Daten, Governance aufwendiger |

## 3.3 Datenqualität im ETL

Der ETL-Prozess ist der **wichtigste Ort für Qualitätssicherung** – hier passieren alle Daten einen definierten Kontrollpunkt. Bewährt sind: Regelwerk mit Pflichtprüfungen, Quarantänebereich für fehlerhafte Sätze, Fehlerprotokoll mit Verantwortlichem, Ladeprotokoll mit Kennzahlen (gelesene, geladene, abgewiesene Sätze) und Abstimmsummen gegen das Quellsystem.

> ❓ **Prüferfrage:** Warum ist es ein Fehler, ungültige Datensätze im ETL einfach zu verwerfen?
> *Weil die Information über das Problem verloren geht und niemand die Ursache im Quellsystem beheben kann. Zudem stimmen die Summen im DWH nicht mehr mit der Quelle überein, ohne dass die Differenz erklärbar wäre. Richtig ist eine Quarantäne mit Fehlerprotokoll und einem Verantwortlichen für die Nachbearbeitung.*

---

# Teil 4 – Multidimensionale Modellierung

## 4.1 Fakten und Dimensionen

**Faktentabelle:** enthält die **messbaren Kennzahlen** (Menge, Umsatz, Deckungsbeitrag) und die Fremdschlüssel zu den Dimensionen. Sie ist die mit Abstand größte Tabelle – oft Millionen Zeilen.

**Dimensionstabellen:** enthalten die **beschreibenden Merkmale**, entlang derer ausgewertet wird. Merkhilfe: Sie beantworten **Wer? Was? Wann? Wo?**

**Granularität** = die feinste Detailstufe der Faktentabelle (z. B. „eine Zeile je Bestellposition"). Sie muss **vor** dem Entwurf festgelegt werden: Zu grob gewählt, sind spätere Detailauswertungen unmöglich; zu fein gewählt, wächst die Tabelle unnötig.

**Kennzahlentypen** (gern abgefragt):
- **additiv:** über alle Dimensionen summierbar (Umsatz, Menge)
- **semi-additiv:** über manche Dimensionen summierbar, über die Zeit nicht (Lagerbestand – Bestände mehrerer Tage zu addieren ergibt keinen Sinn)
- **nicht-additiv:** gar nicht summierbar (Prozentsätze, Durchschnittspreise – diese müssen aus den Grundgrößen neu berechnet werden)

## 4.2 Star-Schema

Eine zentrale Faktentabelle, sternförmig umgeben von **denormalisierten** Dimensionstabellen.

```
        dim_zeit                    dim_produkt
     ┌─────────────┐              ┌──────────────┐
     │ zeit_id (PK)│              │ produkt_id PK│
     │ datum       │              │ bezeichnung  │
     │ monat       │              │ kategorie    │
     │ quartal     │              │ warengruppe  │
     │ jahr        │              │ lieferant    │
     └──────┬──────┘              └──────┬───────┘
            │                            │
            └────────┐          ┌────────┘
                 ┌───┴──────────┴───┐
                 │  fakt_verkauf    │
                 │ zeit_id      FK  │
                 │ produkt_id   FK  │
                 │ kunde_id     FK  │
                 │ filial_id    FK  │
                 │ menge            │
                 │ umsatz           │
                 └───┬──────────┬───┘
            ┌────────┘          └────────┐
     ┌──────┴──────┐              ┌──────┴───────┐
     │ dim_kunde   │              │ dim_filiale  │
     │ kunde_id PK │              │ filial_id PK │
     │ name        │              │ filialname   │
     │ ort, plz    │              │ stadt, region│
     │ segment     │              │ land         │
     └─────────────┘              └──────────────┘
```

**Eigenschaften:** wenige Joins, sehr schnelle Abfragen, für Fachanwender leicht verständlich. Preis dafür: **bewusste Redundanz** in den Dimensionen (die Warengruppe steht bei jedem Produkt erneut).

## 4.3 Snowflake-Schema

Die Dimensionen werden zusätzlich **normalisiert**: `dim_produkt` verweist auf `dim_warengruppe`, diese auf `dim_kategorie`.

| | Star | Snowflake |
|---|---|---|
| Dimensionen | denormalisiert | normalisiert |
| Joins je Abfrage | wenige | mehr |
| Abfragegeschwindigkeit | höher | geringer |
| Speicherbedarf | höher | geringer |
| Verständlichkeit | hoch | mittel |
| Pflege bei Änderungen | aufwendiger | einfacher |

**Prüfungsantwort:** In der Praxis überwiegt das **Star-Schema**, weil Speicherplatz billig, Abfragegeschwindigkeit und Verständlichkeit dagegen wertvoll sind. Das Snowflake-Schema lohnt bei sehr großen Dimensionen mit häufig geänderten Hierarchien.

## 4.4 Historisierung: Slowly Changing Dimensions

Was passiert, wenn ein Kunde umzieht? Drei Standardstrategien:

| Typ | Vorgehen | Folge |
|---|---|---|
| **SCD Typ 1** | alten Wert **überschreiben** | keine Historie; alte Auswertungen ändern sich rückwirkend |
| **SCD Typ 2** | **neue Zeile** anlegen mit Gültigkeitszeitraum | vollständige Historie; die Dimension wächst |
| **SCD Typ 3** | zusätzliche Spalte „vorheriger Wert" | nur der letzte Stand bleibt erhalten |

**SCD Typ 2 im Detail** – der Standardfall und häufigster Prüfungsstoff:

| kunde_sk | kunde_id | name | ort | gültig_von | gültig_bis | aktuell |
|---|---|---|---|---|---|---|
| 1 | K-1001 | Huber GmbH | München | 01.01.2024 | 14.05.2026 | nein |
| 2 | K-1001 | Huber GmbH | Hamburg | 15.05.2026 | 31.12.9999 | ja |

Der **Surrogatschlüssel** (kunde_sk) ist ein künstlicher, im DWH vergebener Schlüssel. Er ist nötig, weil der fachliche Schlüssel K-1001 nun mehrfach vorkommt. Fakten aus der Zeit vor dem Umzug verweisen auf kunde_sk = 1 und bleiben damit korrekt der Region München zugeordnet – genau das ist der Zweck der Historisierung.

> ❓ **Prüferfrage:** Warum verwendet man im DWH Surrogatschlüssel statt der Schlüssel aus dem Quellsystem?
> *Weil ein fachlicher Schlüssel bei Typ-2-Historisierung mehrfach auftritt und dann nicht mehr eindeutig identifiziert. Zusätzlich macht der Surrogatschlüssel das DWH unabhängig von Schlüsseländerungen oder Formatunterschieden der Quellsysteme und ermöglicht die Integration mehrerer Quellen mit unterschiedlichen Nummernkreisen.*

## 4.5 OLAP-Operationen

| Operation | Bedeutung | Beispiel |
|---|---|---|
| **Drill-down** | feinere Detailstufe | Jahr → Quartal → Monat |
| **Roll-up** | gröbere Detailstufe | Filiale → Region → Land |
| **Slice** | eine Dimension auf **einen** Wert festlegen | nur Quartal 2/2026 |
| **Dice** | mehrere Dimensionen auf **Bereiche** einschränken | Kategorie Möbel **und** Region Nord **und** 1. Halbjahr |
| **Pivot / Rotate** | Achsen vertauschen | Produkte in Zeilen statt Spalten |

---

# Teil 5 – Data Lake und Big Data

## 5.1 Data Lake vs. Data Warehouse

| | Data Warehouse | Data Lake |
|---|---|---|
| Daten | strukturiert, aufbereitet | roh, alle Formate (auch Bilder, Logs, Sensordaten) |
| Schema | **Schema-on-Write** (vor dem Laden festgelegt) | **Schema-on-Read** (erst bei der Auswertung) |
| Nutzer | Fachbereich, Controlling | Data Scientists |
| Stärke | verlässliche, geprüfte Kennzahlen | Flexibilität, auch für später unbekannte Fragen |
| Risiko | unflexibel bei neuen Anforderungen | **Data Swamp** – ohne Katalog und Governance wird der See unbrauchbar |

Der Begriff **Lakehouse** bezeichnet Ansätze, die Flexibilität des Data Lake mit den Struktur- und Qualitätsgarantien des DWH verbinden.

## 5.2 Die 5 V von Big Data

| V | Bedeutung | Beispiel Möbelhaus |
|---|---|---|
| **Volume** | Datenmenge | Millionen Kassenbons und Klickdaten |
| **Velocity** | Geschwindigkeit von Entstehung und Verarbeitung | Live-Bestandsdaten der Filialen |
| **Variety** | Vielfalt der Formate | Tabellen, Bilder, Bewertungstexte, Sensordaten |
| **Veracity** | Verlässlichkeit / Wahrhaftigkeit | Bewertungstexte unklarer Herkunft, fehlerhafte Sensorwerte |
| **Value** | Wertschöpfung aus den Daten | konkreter Nutzen – ohne ihn ist der Rest Selbstzweck |

**Batch- oder Streamverarbeitung?** Batch verarbeitet Daten gesammelt in festen Intervallen (nächtlicher DWH-Lauf) – einfach und robust. Streaming verarbeitet fortlaufend (Betrugserkennung, Bestandswarnung) – aufwendiger, aber nahezu in Echtzeit. Die Wahl richtet sich nach der Frage: **Wie aktuell muss die Information sein, damit die Entscheidung noch etwas nützt?**

---

## Die 8 häufigsten Fehler aus Prüfersicht

1. Kennzahlen in die Dimensionstabelle und beschreibende Merkmale in die Faktentabelle gelegt.
2. Faktentabelle ohne Fremdschlüssel zu allen Dimensionen modelliert.
3. Star und Snowflake verwechselt oder ohne Nennung des Unterschieds beim Normalisierungsgrad.
4. Behauptet, das DWH sei normalisiert – Denormalisierung ist dort gerade der Zweck.
5. Historisierung nicht erwähnt, obwohl die Aufgabe nach Zeitvergleichen fragt.
6. Surrogatschlüssel und fachlichen Schlüssel gleichgesetzt.
7. Bei ETL nur „Daten kopieren" beschrieben, ohne Bereinigung und Vereinheitlichung.
8. Bei den 5 V „Value" vergessen – gerade dieses V ist das prüfungsrelevante.

---

# Übungsklausur Data Warehouse & Big Data (100 Punkte, 90 Minuten)

Bearbeite die Klausur **am Ende von KW 36** am Stück, handschriftlich.

## Ausgangslage

Die Möbelhaus Nordholz GmbH betreibt acht Filialen und führt rund 500 Artikel. Die Geschäftsführung möchte Umsätze nach Zeitraum, Artikel, Kunde und Filiale auswerten und Vorjahresvergleiche über drei Jahre ziehen. Die Daten liegen in der operativen Datenbank sowie in einem separaten CRM-System.

## Block A – OLTP und OLAP (18 P)

**A1 (10 P):** *Grenzen* Sie OLTP- und OLAP-Systeme anhand von **fünf** Kriterien *ab*. *Stellen* Sie die Antwort tabellarisch dar.

**A2 (8 P):** Ein Kollege schlägt vor, die Auswertungen direkt auf der operativen Datenbank durchzuführen: „Die Daten sind doch schon da." *Beurteilen* Sie den Vorschlag und *nennen* Sie drei fachliche Gründe, die dagegen sprechen.

## Block B – Architektur und ETL (24 P)

**B1 (8 P):** *Beschreiben* Sie die drei Phasen des ETL-Prozesses und *nennen* Sie für die Transformationsphase vier typische Aufgaben.

**B2 (6 P):** *Erläutern* Sie den Zweck einer Staging Area und den Unterschied zwischen Voll- und Deltaextraktion.

**B3 (6 P):** Im Ladelauf werden 12 von 8.400 Datensätzen wegen fehlender Kundennummer abgewiesen. Ein Kollege möchte diese Sätze automatisch verwerfen. *Beurteilen* Sie das und *beschreiben* Sie ein besseres Vorgehen.

**B4 (4 P):** *Grenzen* Sie ETL und ELT *ab* und *nennen* Sie je einen typischen Einsatzfall.

## Block C – Sternschema entwerfen (30 P)

**C1 (16 P):** *Entwerfen* Sie ein Star-Schema für die beschriebene Umsatzauswertung. *Benennen* Sie die Faktentabelle mit mindestens zwei Kennzahlen sowie vier Dimensionstabellen mit je mindestens drei Attributen. *Kennzeichnen* Sie Primär- und Fremdschlüssel.

**C2 (6 P):** *Erläutern* Sie den Begriff **Granularität** und *legen* Sie für Ihr Schema eine geeignete Granularität *fest*. *Begründen* Sie Ihre Wahl.

**C3 (8 P):** *Vergleichen* Sie Star- und Snowflake-Schema anhand von vier Kriterien und *sprechen* Sie eine begründete Empfehlung für dieses Projekt *aus*.

## Block D – Historisierung (16 P)

**D1 (6 P):** Kundin „Huber GmbH" (K-1001) zieht am 15.05.2026 von München nach Hamburg. *Erläutern* Sie, welches Problem entsteht, wenn die Adresse in der Dimensionstabelle einfach überschrieben wird.

**D2 (6 P):** *Stellen* Sie dar, wie der Datensatz nach SCD Typ 2 gespeichert wird. *Verwenden* Sie eine Tabelle mit den erforderlichen Zusatzspalten.

**D3 (4 P):** *Erläutern* Sie, warum bei SCD Typ 2 ein Surrogatschlüssel erforderlich ist.

## Block E – Big Data und OLAP-Operationen (12 P)

**E1 (5 P):** *Nennen* Sie die fünf V von Big Data und *ordnen* Sie jedem ein Beispiel aus dem Möbelhaus zu.

**E2 (4 P):** *Ordnen* Sie den folgenden Auswertungswünschen die passende OLAP-Operation zu:
(a) „Zeig mir das Jahresergebnis aufgeschlüsselt nach Quartalen." (b) „Nur die Filialen der Region Nord." (c) „Kategorien in die Zeilen, Monate in die Spalten." (d) „Fasse die Filialumsätze zu Regionsumsätzen zusammen."

**E3 (3 P):** *Erläutern* Sie den Unterschied zwischen Batch- und Streamverarbeitung und *nennen* Sie je einen passenden Anwendungsfall.

---

## Fachgespräch: typische Fragen des Ausschusses

1. „Woher stammten die Daten für Ihr Projekt, und wie haben Sie sie zusammengeführt?"
2. „Welche Transformationsschritte waren nötig – und welcher hat die meiste Zeit gekostet?"
3. „Wie stellen Sie sicher, dass Ihre Auswertung morgen dieselben Zahlen liefert wie heute?"
4. „Haben Sie Ihre Daten historisiert? Was wäre passiert, wenn nicht?"
5. „Wie oft müssen Ihre Daten aktualisiert werden – und woraus haben Sie diese Frequenz abgeleitet?"

---

## Lernziel-Check (Ende KW 36 alles mit Ja beantworten)

- [ ] Ich grenze OLTP und OLAP anhand von mindestens fünf Kriterien ab.
- [ ] Ich nenne drei Gründe gegen Auswertungen direkt im operativen System.
- [ ] Ich beschreibe ETL vollständig und nenne vier Transformationsaufgaben.
- [ ] Ich kenne Zweck von Staging Area, Core-DWH und Data Mart.
- [ ] Ich entwerfe ein Star-Schema mit Fakten- und Dimensionstabellen und setze die Schlüssel richtig.
- [ ] Ich erkläre Granularität und die drei Kennzahlentypen.
- [ ] Ich stelle SCD Typ 2 mit Gültigkeitszeitraum und Surrogatschlüssel dar.
- [ ] Ich nenne die 5 V und ordne die OLAP-Operationen sicher zu.
- [ ] Übungsklausur mit ≥ 92 Punkten bestanden.
