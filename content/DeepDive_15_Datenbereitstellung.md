# Deep Dive 15: Datenbereitstellung – Formate, Schnittstellen, NoSQL & UML
## Lernzettel mit Übungsklausur im IHK-Stil – FIDPA AP2

---

## Prüfungsrelevanz

Die Verordnung nennt im Prüfungsbereich **„Sicherstellen der Datenqualität“** ausdrücklich: Daten **identifizieren, klassifizieren und bereitstellen** sowie **Zugriff und Verfügbarkeit gewährleisten**. Dieser Deep Dive schließt damit die letzte inhaltliche Lücke vor der Simulationsphase – ideal direkt vor einer Altklausur zum Bereich „Datenqualität“.

Typische Aufgaben: Datenarten und Schutzklassen zuordnen, CSV-Importprobleme erkennen, **JSON erstellen oder korrigieren**, eine **REST-Schnittstelle** entwerfen und beurteilen, eine Datenbankart begründet auswählen, Transaktionsprobleme erklären, UML-Multiplizitäten lesen.

Szenario: Die **Möbelhaus Nordholz GmbH** stellt ihre Reparaturdaten künftig über eine Schnittstelle für Filialen und Partner bereit.

---

# Teil 1 – Daten identifizieren und klassifizieren

## 1.1 Strukturierungsgrad

| Art | Merkmal | Beispiel | Konsequenz für die Analyse |
|---|---|---|---|
| **strukturiert** | festes Schema, Tabellenform | Kundentabelle | direkt mit SQL auswertbar |
| **semistrukturiert** | selbstbeschreibend, flexibel verschachtelt | JSON, XML, Logdateien | vor der Analyse parsen und ggf. „flachklopfen“ |
| **unstrukturiert** | kein vorgegebenes Schema | Freitext, Bilder, Audio | Aufbereitung nötig (Textanalyse, Bilderkennung) |

**Stammdaten** sind langlebig (Kunden, Artikel), **Bewegungsdaten** entstehen laufend im Prozess (Bestellungen, Buchungen). **Metadaten** beschreiben Daten: Herkunft, Bedeutung, Format, Verantwortlicher, Aktualisierungsrhythmus.

## 1.2 Schutzklassen

| Klasse | Beispiel | Typische Maßnahmen |
|---|---|---|
| **öffentlich** | Produktkatalog mit Preisen | keine besonderen |
| **intern** | interne Telefonliste | Zugriff nur für Beschäftigte |
| **vertraulich** | Kundendaten mit Umsätzen | Rollenkonzept, Verschlüsselung bei Übertragung |
| **streng vertraulich** | Gehalts- und Gesundheitsdaten | Need-to-know, Verschlüsselung auch im Ruhezustand, Zugriffsprotokollierung |

Die Klassifizierung ist die **Voraussetzung** dafür, dass Daten richtig bereitgestellt werden: Wer nicht weiß, wie schutzbedürftig Daten sind, kann weder Berechtigungen noch Übertragungswege begründen (→ Deep Dive 10).

## 1.3 Datentypen mit Fallen

- **Geldbeträge nie als Gleitkommazahl (FLOAT)** speichern. Binäre Gleitkommazahlen können viele Dezimalbrüche nicht exakt abbilden: 0,1 + 0,2 ergibt 0,30000000000000004. Richtig ist **DECIMAL** mit fester Nachkommastellenzahl – oder Cent-Beträge als Ganzzahl.
- **Datumsangaben im Format ISO 8601** (JJJJ-MM-TT, z. B. 2026-11-25): eindeutig und korrekt sortierbar. „03/04/2026“ ist dagegen je nach Land der 3. April oder der 4. März.
- **Postleitzahlen als Text**, nicht als Zahl – sonst verschwindet die führende Null (04109 wird zu 4109).

---

# Teil 2 – Datenformate und Kodierung

## 2.1 CSV

Einfaches Textformat: eine Zeile je Datensatz, Felder durch Trennzeichen getrennt, meist mit Kopfzeile.

**Typische Importprobleme:**
- **Trennzeichen:** Komma oder Semikolon? Deutsche Excel-Exporte nutzen meist das Semikolon.
- **Trennzeichen im Feldinhalt:** Enthält ein Text das Trennzeichen, muss das Feld in Anführungszeichen stehen – sonst verrutschen alle Spalten.
- **Dezimal- und Tausendertrennzeichen:** „1.250,00“ (deutsch) gegen „1250.00“ (englisch) – gemischte Formate führen zu falschen Zahlen oder Importfehlern.
- **Zeichenkodierung:** Umlaute werden zerstört, wenn Export und Import unterschiedlich kodieren.
- **Keine Datentypen:** Alles ist Text; führende Nullen und Datumsformate gehen leicht verloren.

## 2.2 JSON

Schlüssel-Wert-Paare in geschweiften Klammern (**Objekte**), Listen in eckigen Klammern (**Arrays**), beliebig verschachtelbar.

```json
{
  "bestell_id": 100,
  "bestelldatum": "2026-01-15",
  "kunde": {
    "kunden_id": 1,
    "name": "Huber GmbH",
    "ort": "München"
  },
  "positionen": [
    {"produkt_id": 10, "bezeichnung": "Bürostuhl Comfort", "menge": 2, "preis": 249.00},
    {"produkt_id": 12, "bezeichnung": "Monitor 27 Zoll", "menge": 2, "preis": 189.00}
  ],
  "bezahlt": false,
  "bemerkung": null
}
```

**Die Syntaxregeln, an denen JSON meistens scheitert:**
- Schlüssel und Texte stehen in **doppelten Anführungszeichen** – einfache sind ungültig.
- **Datentypen:** String, Number, Boolean (`true` / `false`, kleingeschrieben), `null`, Array, Object. Ein **Datum gibt es nicht** – es wird als String (ISO 8601) übertragen.
- **Dezimaltrennzeichen ist der Punkt.**
- **Kein Komma** nach dem letzten Element eines Objekts oder Arrays.
- **Keine Kommentare.**

Ein Vorteil gegenüber CSV ist offensichtlich: Die Bestellung mit ihren Positionen steht zusammenhängend in einem Dokument, statt auf zwei Tabellen verteilt zu werden.

## 2.3 XML

Daten in selbst definierten Tags: `<kunde id="1"><name>Huber GmbH</name></kunde>`.
- **Wohlgeformt:** syntaktisch korrekt – genau ein Wurzelelement, jedes Tag geschlossen, korrekt verschachtelt.
- **Valide:** zusätzlich konform zu einem Schema (**XSD**), das Struktur und Datentypen festlegt.
- Jedes valide Dokument ist wohlgeformt, aber nicht umgekehrt.

## 2.4 Formate im Vergleich

| Kriterium | CSV | JSON | XML | Parquet |
|---|---|---|---|---|
| Struktur | flach | verschachtelt | verschachtelt | tabellarisch, spaltenorientiert |
| Datentypen | keine | einfache | über Schema | vollständig |
| Schema/Validierung | nein | optional (JSON Schema) | ja (XSD) | eingebettet |
| Lesbarkeit | hoch | hoch | mittel | nein (binär) |
| Größe | klein | mittel | groß | sehr klein (komprimiert) |
| Typischer Einsatz | Excel-Austausch | Web-APIs | Behörden, Industrie | Data Lake, große Analysen |

## 2.5 Zeichenkodierung

- **ASCII:** 128 Zeichen, keine Umlaute.
- **Latin-1 (ISO 8859-1):** ein Byte je Zeichen, enthält westeuropäische Umlaute.
- **UTF-8:** Unicode-Kodierung mit **1 bis 4 Bytes** je Zeichen, ASCII-kompatibel, Standard im Web.

**Beispiel:** „Größe“ hat 5 Zeichen. In Latin-1 sind das **5 Bytes**, in UTF-8 **7 Bytes** – ö und ß belegen je 2 Bytes.

**Woher kommt „Ã¤“?** Das ä wird in UTF-8 als zwei Bytes (C3 A4) gespeichert. Liest ein Programm die Datei als Latin-1, interpretiert es jedes Byte als eigenes Zeichen – aus einem ä werden „Ã“ und „¤“. **Lösung:** Kodierung bei Export und Import ausdrücklich festlegen, durchgängig UTF-8.

---

# Teil 3 – Schnittstellen

## 3.1 Wege der Datenbereitstellung

| Weg | Vorteil | Nachteil |
|---|---|---|
| **Dateiaustausch** (CSV über SFTP) | einfach, robust | nicht aktuell, keine Validierung beim Empfänger |
| **REST-API** | aktuell, gezielt abfragbar, zugriffsgesteuert | Entwicklungs- und Betriebsaufwand |
| **Direkter Datenbankzugriff** (ODBC/JDBC) | schnell eingerichtet | enge Kopplung, Last auf dem Quellsystem, Sicherheitsrisiko |
| **Views** in der Datenbank | Zugriff auf erlaubte Spalten und Zeilen begrenzt | nur innerhalb der Datenbankwelt |
| **Nachrichten/Events** (Message Queue) | Echtzeit, entkoppelt | komplexe Architektur |

**Polling oder Webhook?** Beim **Polling** fragt der Empfänger regelmäßig nach Änderungen – einfach, aber mit vielen leeren Anfragen. Beim **Webhook** meldet der Sender Änderungen aktiv an eine vereinbarte Adresse – effizient, aber der Empfänger muss erreichbar sein.

## 3.2 REST-Prinzipien

- **Ressourcen** werden über URIs adressiert – als **Substantive im Plural**, nicht als Verben: `/reparaturauftraege/5001` statt `/getAuftrag?id=5001`.
- Die **HTTP-Methode** bestimmt die Operation.
- **Zustandslos:** Jede Anfrage enthält alle nötigen Informationen; der Server speichert keinen Sitzungszustand.
- Datenaustausch meist als JSON; Ergebnis wird über **Statuscodes** signalisiert.

| Methode | Zweck | Idempotent | Typischer Erfolgscode |
|---|---|---|---|
| **GET** | lesen | ja | 200 OK |
| **POST** | neu anlegen | **nein** | 201 Created |
| **PUT** | vollständig ersetzen | ja | 200 OK / 204 No Content |
| **PATCH** | teilweise ändern | nicht garantiert | 200 OK |
| **DELETE** | löschen | ja | 204 No Content |

**Idempotent** heißt: Mehrfaches Ausführen führt zum selben Ergebnis wie einmaliges. Ein wiederholtes PUT setzt denselben Zustand erneut; ein wiederholtes POST legt dagegen einen zweiten Datensatz an – etwa eine doppelte Bestellung, wenn der Nutzer nach einem Timeout erneut klickt.

| Statuscode | Bedeutung |
|---|---|
| 200 / 201 / 204 | OK / angelegt / erfolgreich ohne Inhalt |
| 400 | fehlerhafte Anfrage (z. B. ungültiges JSON) |
| **401** | **nicht authentifiziert** – wer bist du? |
| **403** | **nicht berechtigt** – authentifiziert, aber kein Recht |
| 404 | Ressource nicht gefunden |
| 429 | zu viele Anfragen (Rate Limit) |
| 500 | Fehler auf dem Server |

Faustregel: **2xx Erfolg, 4xx Fehler des Clients, 5xx Fehler des Servers.**

## 3.3 Sichere und praxistaugliche APIs

- **Nur HTTPS** – über HTTP gehen Daten und Zugangsschlüssel im Klartext über das Netz.
- **Zugangsdaten in den Header** (`Authorization: Bearer …`), **nie in die URL**: URLs landen in Server- und Proxy-Logs sowie im Browserverlauf.
- **Filter und Paginierung** über Query-Parameter: `GET /reparaturauftraege?status=offen&seite=2&limit=50`. Ohne Paginierung liefert eine Liste irgendwann Hunderttausende Datensätze auf einmal.
- **Rate Limiting** schützt vor Überlastung (Statuscode 429).
- **Datenminimierung:** Die Schnittstelle liefert nur die Felder, die der Empfänger braucht (→ Deep Dive 10).
- **Versionierung** (`/v1/…`), damit Änderungen bestehende Nutzer nicht brechen.

---

# Teil 4 – NoSQL und Transaktionen

## 4.1 NoSQL-Datenbanken

| Typ | Prinzip | Beispiel | Geeignet für |
|---|---|---|---|
| **dokumentenorientiert** | JSON-ähnliche Dokumente, flexibles Schema | MongoDB | Produktkataloge mit wechselnden Attributen |
| **Key-Value** | Schlüssel → Wert, extrem schnell | Redis | Sitzungen, Warenkörbe, Caches |
| **spaltenorientiert** (Wide Column) | Spaltenfamilien, verteilt | Cassandra | riesige Schreiblasten, Sensor- und Zeitreihendaten |
| **Graph** | Knoten und Kanten | Neo4j | Beziehungsnetze, Empfehlungen über mehrere Stufen |

**Skalierung:** Relationale Datenbanken skalieren klassisch **vertikal** (stärkerer Server), viele NoSQL-Systeme **horizontal** (mehr Server).

**CAP-Theorem:** Ein verteiltes System kann **Konsistenz, Verfügbarkeit und Partitionstoleranz** nicht alle gleichzeitig garantieren. Da Netzwerkausfälle unvermeidbar sind, muss im Störfall zwischen Konsistenz und Verfügbarkeit gewählt werden.

**ACID oder BASE?** Relationale Systeme garantieren **ACID** (→ Deep Dive 1). Viele NoSQL-Systeme folgen **BASE**: Basically Available, Soft State, **Eventually Consistent** – Änderungen sind erst nach kurzer Zeit überall sichtbar.

⚠ **Datenqualitäts-Perspektive:** „Schemafrei“ heißt nicht „ohne Regeln“. Die Datenbank prüft bei **Schema-on-Read** keine Pflichtfelder oder Datentypen mehr – diese Prüfungen wandern in die Anwendung oder die ETL-Strecke. Wer das übersieht, bekommt uneinheitliche Dokumente.

## 4.2 Parallele Zugriffe

| Anomalie | Beschreibung |
|---|---|
| **Lost Update** | Zwei Transaktionen lesen denselben Wert, beide schreiben – eine Änderung geht verloren |
| **Dirty Read** | Eine Transaktion liest Daten, die eine andere noch nicht bestätigt hat |
| **Non-repeatable Read** | Dieselbe Abfrage liefert innerhalb einer Transaktion unterschiedliche Werte |
| **Phantom Read** | Zwischen zwei Abfragen tauchen neue Zeilen auf |

**Isolationsstufen (SQL-Standard):**

| Stufe | Dirty Read | Non-repeatable Read | Phantom Read |
|---|---|---|---|
| READ UNCOMMITTED | möglich | möglich | möglich |
| READ COMMITTED | verhindert | möglich | möglich |
| REPEATABLE READ | verhindert | verhindert | möglich |
| SERIALIZABLE | verhindert | verhindert | verhindert |

Je höher die Stufe, desto sicherer – und desto mehr Wartezeit durch Sperren.

**Lost Update am Beispiel:** Zwei Disponenten lesen gleichzeitig den Lagerbestand 10. Beide verkaufen 3 Stück und schreiben 7 zurück. Richtig wäre **4**. Lösungen:
- **Atomare Änderung:** `UPDATE lager SET bestand = bestand - 3 WHERE artikel_id = 10;` – die Datenbank rechnet selbst.
- **Pessimistisches Sperren:** Datensatz beim Lesen sperren (`SELECT … FOR UPDATE`).
- **Optimistisches Sperren:** Versionsspalte mitführen; das Update gelingt nur, wenn die Version unverändert ist – sonst Konflikt melden und neu lesen.

Ein **Deadlock** entsteht, wenn zwei Transaktionen gegenseitig auf Sperren warten; die Datenbank bricht dann eine davon ab.

---

# Teil 5 – UML für Datenanalysten

## 5.1 Use-Case-Diagramm

Zeigt, **wer** das System **wofür** nutzt – ohne Ablauf.
- **Akteure** (Strichmännchen) außerhalb der **Systemgrenze** (Rechteck), **Anwendungsfälle** als Ellipsen.
- **«include»:** Der Basisfall bindet einen anderen Fall **immer** ein – Pfeil **vom Basisfall zum eingebundenen Fall**. Beispiel: „Reparatur beauftragen“ «include» „Kunde anmelden“.
- **«extend»:** Ein Fall erweitert den Basisfall nur **unter einer Bedingung** – Pfeil **vom erweiternden Fall zum Basisfall**. Beispiel: „Expressservice wählen“ «extend» „Reparatur beauftragen“.

## 5.2 Aktivitätsdiagramm

Startknoten (gefüllter Kreis), Aktionen (abgerundete Rechtecke), Entscheidungen (Rauten), Gabelung und Vereinigung paralleler Abläufe (Balken), Endknoten (Kreis mit Punkt), Partitionen für Zuständigkeiten. **Abgrenzung zu BPMN:** Das Aktivitätsdiagramm eignet sich für Abläufe **innerhalb eines Systems**; BPMN für **Geschäftsprozesse mit mehreren Beteiligten** und Nachrichtenaustausch (→ Deep Dive 5).

## 5.3 Klassendiagramm und die Brücke zum ERM

- **Klasse:** Name, Attribute, Methoden; Sichtbarkeit **+** public, **−** private, **#** protected.
- **Assoziation** mit Multiplizitäten: `1`, `0..1`, `0..*`, `1..*`.
- **Aggregation** (leere Raute): Teile existieren auch ohne das Ganze. **Komposition** (gefüllte Raute): Teile existieren nicht ohne das Ganze (Bestellposition ohne Bestellung). **Vererbung:** Pfeil mit leerem Dreieck zur Oberklasse.

⚠ **Die Leserichtung – dieselbe Falle wie in Deep Dive 2:** UML-Multiplizitäten stehen wie bei Chen an der **gegenüberliegenden Seite**. `Kunde 1 ——— 0..* Reparaturauftrag` heißt: Ein Kunde hat 0 bis viele Aufträge (die `0..*` steht beim Auftrag), jeder Auftrag gehört zu genau einem Kunden. In Min-Max lautet dieselbe Beziehung **KUNDE (0,n) — (1,1) REPARATURAUFTRAG** – die Angaben wandern also auf die jeweils andere Seite.

---

## Die 8 häufigsten Fehler aus Prüfersicht

1. Geldbeträge als FLOAT gespeichert oder Postleitzahlen als Zahl.
2. JSON mit einfachen Anführungszeichen, Dezimalkomma, Kommentaren oder abschließendem Komma geschrieben.
3. „Valide“ und „wohlgeformt“ bei XML verwechselt.
4. REST-URIs als Verben formuliert (`/getKunde`) statt als Ressourcen.
5. 401 und 403 verwechselt.
6. API-Schlüssel in der URL oder Übertragung über HTTP ohne TLS nicht beanstandet.
7. NoSQL gewählt, ohne die Konsistenzanforderung zu prüfen – für Buchhaltung ist ACID Pflicht.
8. UML-Multiplizitäten beim Übertragen ins Min-Max-Modell nicht auf die andere Seite gesetzt.

---

# Übungsklausur Datenbereitstellung (100 Punkte, 90 Minuten)

Bearbeite die Klausur **vor einer Altklausur zum Bereich „Datenqualität“** am Stück, handschriftlich.

## Ausgangslage

Die Möbelhaus Nordholz GmbH stellt ihre Reparaturdaten künftig über eine Schnittstelle für Filialen und Partner bereit.

## Block A – Daten klassifizieren (12 P)

**A1 (6 P):** *Ordnen* Sie die folgenden Daten jeweils dem Strukturierungsgrad *zu* und *nennen* Sie eine Konsequenz für die Auswertung: (a) Kundentabelle der Datenbank, (b) JSON-Export der Bestellungen, (c) Fotos von Reklamationsschäden, (d) Freitext-Bewertungen aus dem Onlineshop.

**A2 (6 P):** *Ordnen* Sie jeweils eine Schutzklasse *zu* und *nennen* Sie für die höchste Klasse zwei Schutzmaßnahmen: (a) Produktkatalog mit Preisen, (b) interne Telefonliste, (c) Kundenadressen mit Jahresumsätzen, (d) Gehaltsdaten der Beschäftigten.

## Block B – Formate und Kodierung (30 P)

**B1 (8 P):** Eine Filiale liefert folgende Datei. *Nennen* Sie drei Probleme beim Import und je eine Lösung.

```
kunden_id;name;ort;umsatz
1;Huber GmbH;München;1.250,00
2;"Schmidt; Söhne AG";Hamburg;890,50
3;Fischer KG;Köln;2100.00
```

**B2 (8 P):** *Erstellen* Sie ein JSON-Dokument für Bestellung 101 vom 03.02.2026 der Fischer KG (Kunden-ID 3, Köln) mit den Positionen Schreibtisch Basic (Produkt 11, 1 Stück, 399,00 €) und Schreibtischlampe (Produkt 14, 3 Stück, 39,90 €). Die Bestellung ist noch nicht bezahlt.

**B3 (8 P):** Das folgende JSON wird von der Schnittstelle abgelehnt. *Benennen* Sie fünf Fehler und *geben* Sie die korrigierte Fassung *an*.

```
{
  'bestell_id': 101,
  "bestelldatum": 2026-02-03,
  "kunde": "Fischer KG",
  "positionen": [
    {"produkt_id": 11, "menge": 1, "preis": 399,00},
    {"produkt_id": 14, "menge": 3, "preis": 39.90},
  ],
  // Lieferung erfolgt
  "bezahlt": True
}
```

**B4 (6 P):**
a) Wie viele Bytes belegt das Wort „Größe“ in Latin-1 und in UTF-8? *Begründen* Sie. (3 P)
b) Im Import erscheint „MÃ¼nchen“ statt „München“ und „KÃ¶ln“ statt „Köln“. *Erläutern* Sie die Ursache und die Lösung. (3 P)

## Block C – REST-Schnittstelle (26 P)

**C1 (10 P):** *Entwerfen* Sie die Schnittstelle für Reparaturaufträge. *Geben* Sie für die folgenden Operationen jeweils HTTP-Methode, URI und Statuscode bei Erfolg *an*: (a) alle offenen Aufträge abrufen, (b) einen Auftrag anhand der Nummer abrufen, (c) einen neuen Auftrag anlegen, (d) den Status eines Auftrags ändern, (e) einen Auftrag löschen.

**C2 (6 P):** Eine Filiale ruft die Daten so ab: `GET http://api.nordholz.de/reparaturauftraege?apikey=8f3a91c2&status=offen` – *Benennen* Sie zwei Sicherheitsmängel und *geben* Sie jeweils die Korrektur *an*.

**C3 (6 P):** *Erläutern* Sie die Statuscodes 401, 403 und 429 an je einem Beispiel aus dem Szenario.

**C4 (4 P):** *Erläutern* Sie, warum ein wiederholter PUT-Aufruf unkritisch ist, ein wiederholter POST-Aufruf aber zu Datenqualitätsproblemen führen kann.

## Block D – NoSQL und Transaktionen (20 P)

**D1 (8 P):** *Wählen* Sie jeweils einen Datenbanktyp und *begründen* Sie: (a) Produktkatalog, bei dem jede Kategorie andere Attribute hat, (b) Warenkörbe des Onlineshops mit Zugriff über die Sitzungs-ID, (c) Empfehlungen „Kunden, die X kauften, kauften auch Y“ über mehrere Stufen, (d) Finanzbuchhaltung.

**D2 (8 P):** Zwei Disponenten lesen gleichzeitig den Lagerbestand 10 eines Artikels, verkaufen je 3 Stück und speichern jeweils 7. *Benennen* Sie das Problem, *geben* Sie den korrekten Endbestand *an* und *beschreiben* Sie zwei Lösungen.

**D3 (4 P):** *Erläutern* Sie, welche Folge der Verzicht auf ein festes Schema für die Datenqualität hat und wie Sie gegensteuern.

## Block E – UML (12 P)

**E1 (6 P):** Kunden können im Portal eine Reparatur beauftragen; dafür müssen sie immer angemeldet sein. Optional können sie beim Beauftragen einen Expressservice wählen. Servicemitarbeiter bearbeiten die Aufträge. *Erstellen* Sie das Use-Case-Diagramm mit korrekter «include»- und «extend»-Beziehung.

**E2 (6 P):** Ein Klassendiagramm zeigt: `Kunde 1 ——— 0..* Reparaturauftrag` und `Reparaturauftrag 0..* ——— 1..* Leistung`. *Übertragen* Sie beide Beziehungen in Min-Max- und Chen-Notation und *geben* Sie *an*, welche zusätzliche Tabelle im Relationenmodell entsteht.

---

## Fachgespräch: typische Fragen des Ausschusses

1. „In welchem Format haben Sie die Daten bezogen, und welche Probleme gab es beim Import?“
2. „Wie werden Ihre Ergebnisse bereitgestellt – und wer darf worauf zugreifen?“
3. „Warum haben Sie Ihre Daten per Export und nicht per Schnittstelle bezogen – oder umgekehrt?“
4. „Welche Zeichenkodierung haben Ihre Quelldaten, und woran hätten Sie einen Kodierungsfehler bemerkt?“
5. „Was passiert in Ihrem Prozess, wenn zwei Personen gleichzeitig denselben Datensatz ändern?“

---

## Lernziel-Check (am Ende des Themas alles mit Ja beantworten)

- [ ] Ich ordne Daten nach Strukturierungsgrad und Schutzklasse zu und begründe Maßnahmen.
- [ ] Ich kenne die Datentyp-Fallen bei Geldbeträgen, Datumsangaben und Postleitzahlen.
- [ ] Ich erkenne CSV-Importprobleme und schreibe gültiges JSON aus dem Kopf.
- [ ] Ich unterscheide wohlgeformtes und valides XML.
- [ ] Ich erkläre UTF-8, Latin-1 und die Ursache von „Ã¤“.
- [ ] Ich entwerfe REST-Ressourcen mit Methoden und Statuscodes und kenne die Sicherheitsregeln.
- [ ] Ich wähle NoSQL-Typen begründet aus und erkläre CAP sowie ACID gegenüber BASE.
- [ ] Ich erkläre Lost Update, Isolationsstufen und Sperrverfahren.
- [ ] Ich lese Use-Case- und Klassendiagramme und übertrage Multiplizitäten korrekt ins ERM.
- [ ] Übungsklausur mit ≥ 92 Punkten bestanden.
