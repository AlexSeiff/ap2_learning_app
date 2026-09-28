# Musterlösungen Übungsklausur Datenbereitstellung (Deep Dive 15)
## Erwartungshorizont mit Bewertungshinweisen

**Selbstbewertung:** Punkte nur für Aussagen, die wie im Erwartungshorizont begründet sind. 92+ P = sehr gut.

---

## Block A – Daten klassifizieren (12 P)

**A1 (6 P):** *(je Zeile 1,5 P)*

| Daten | Strukturierungsgrad | Konsequenz für die Auswertung |
|---|---|---|
| (a) Kundentabelle | strukturiert | direkt mit SQL auswertbar |
| (b) JSON-Export der Bestellungen | semistrukturiert | parsen; das Positionen-Array in Zeilen auflösen, bevor tabellarisch ausgewertet wird |
| (c) Fotos von Reklamationsschäden | unstrukturiert | nur über Metadaten, manuelle Kategorisierung oder Bilderkennung auswertbar |
| (d) Freitext-Bewertungen | unstrukturiert | Textanalyse nötig (z. B. Stimmungsanalyse), vorher bereinigen |

**A2 (6 P):**
(a) **öffentlich**, (b) **intern**, (c) **vertraulich**, (d) **streng vertraulich** *(je 1 P)*.

Maßnahmen für Gehaltsdaten *(je 1 P, zwei genügen)*: Zugriff strikt nach **Need-to-know** über ein Rollenkonzept · **Verschlüsselung** bei Übertragung und Speicherung · **Protokollierung** aller Zugriffe · in Analysen nur **aggregiert oder pseudonymisiert**.

---

## Block B – Formate und Kodierung (30 P)

**B1 (8 P):**

| Problem | Lösung | P |
|---|---|---|
| **Trennzeichen im Feldinhalt:** „Schmidt; Söhne AG“ enthält das Semikolon. Die Zeile ist korrekt in Anführungszeichen gesetzt – ein naiver Import, der nur am Semikolon trennt, verschiebt aber alle folgenden Spalten. | Parser mit Trennzeichen und Anführungszeichen konfigurieren (RFC-4180-konform), Spaltenzahl je Zeile prüfen | 3 |
| **Gemischte Zahlenformate:** „1.250,00“ und „890,50“ sind deutsch, „2100.00“ englisch formatiert. Je nach Einstellung wird 1.250,00 zu 1,25 oder 2100.00 zu 210000. | Format je Quelle festlegen und vor dem Import vereinheitlichen; Plausibilitätsprüfung auf Wertebereiche | 3 |
| **Zeichenkodierung:** München, Köln und Söhne enthalten Umlaute, die Kodierung ist unbekannt. | Kodierung (UTF-8) in der Liefervereinbarung festlegen und beim Import angeben | 2 |

Auch akzeptiert: Umsatz liegt als Text vor und muss in DECIMAL konvertiert werden.

**B2 (8 P):**

```json
{
  "bestell_id": 101,
  "bestelldatum": "2026-02-03",
  "kunde": {
    "kunden_id": 3,
    "name": "Fischer KG",
    "ort": "Köln"
  },
  "positionen": [
    {"produkt_id": 11, "bezeichnung": "Schreibtisch Basic", "menge": 1, "preis": 399.00},
    {"produkt_id": 14, "bezeichnung": "Schreibtischlampe", "menge": 3, "preis": 39.90}
  ],
  "bezahlt": false
}
```

Bewertung: gültige Syntax (2 P) · Kunde als verschachteltes Objekt (1 P) · Positionen als Array von Objekten (2 P) · korrekte Datentypen – Datum als ISO-String, Zahlen mit Punkt, `false` als Boolean (3 P). Die Namen der Schlüssel sind frei wählbar, müssen aber einheitlich sein.

**B3 (8 P):**

| Nr. | Fehler | Korrektur |
|---|---|---|
| 1 | `'bestell_id'` in einfachen Anführungszeichen | `"bestell_id"` |
| 2 | Datum ohne Anführungszeichen – als Zahl ungültig | `"2026-02-03"` |
| 3 | Dezimalkomma `399,00` | `399.00` |
| 4 | Komma nach dem letzten Array-Element | Komma entfernen |
| 5 | Kommentar `// Lieferung erfolgt` | entfernen – JSON kennt keine Kommentare |
| 6 | `True` großgeschrieben | `true` |

Fünf von sechs Fehlern genügen *(je 1 P)*. Korrigierte Fassung *(3 P)*:

```json
{
  "bestell_id": 101,
  "bestelldatum": "2026-02-03",
  "kunde": "Fischer KG",
  "positionen": [
    {"produkt_id": 11, "menge": 1, "preis": 399.00},
    {"produkt_id": 14, "menge": 3, "preis": 39.90}
  ],
  "bezahlt": true
}
```

*Prüferkommentar: Wer den Kommentar als Information erhalten will, legt ein eigenes Feld an ("lieferstatus": "geliefert"). Und fachlich fällt auf: Laut B2 ist die Bestellung noch nicht bezahlt, hier steht true – ein Konsistenzproblem zwischen zwei Datenquellen, das man im Fachgespräch ansprechen sollte.*

**B4 (6 P):**
a) **Latin-1: 5 Bytes** – jedes Zeichen belegt ein Byte. **UTF-8: 7 Bytes** – G, r und e belegen je ein Byte, ö und ß je zwei. *(3 P)*

b) Die Datei ist in **UTF-8 gespeichert, wird aber als Latin-1** bzw. Windows-1252 gelesen. Das ü besteht in UTF-8 aus den zwei Bytes C3 BC; beim falschen Lesen wird jedes Byte als eigenes Zeichen dargestellt – aus „ü“ wird „Ã¼“. **Lösung:** beim Import UTF-8 als Kodierung angeben und die Kodierung verbindlich in der Schnittstellenvereinbarung festlegen. Bereits fehlerhaft importierte Daten **neu importieren**, statt sie mit Suchen und Ersetzen zu flicken. *(3 P)*

---

## Block C – REST-Schnittstelle (26 P)

**C1 (10 P):** *(je Zeile 2 P)*

| Operation | Methode | URI | Erfolg |
|---|---|---|---|
| (a) alle offenen Aufträge | GET | `/reparaturauftraege?status=offen` | 200 OK |
| (b) ein Auftrag | GET | `/reparaturauftraege/{auftrag_nr}` | 200 OK (404, falls nicht vorhanden) |
| (c) neuer Auftrag | POST | `/reparaturauftraege` | 201 Created, Location-Header mit der neuen URI |
| (d) Status ändern | PATCH | `/reparaturauftraege/{auftrag_nr}` mit `{"status": "erledigt"}` | 200 OK |
| (e) Auftrag löschen | DELETE | `/reparaturauftraege/{auftrag_nr}` | 204 No Content |

Für (d) wird auch PUT akzeptiert, wenn der vollständige Auftrag übertragen wird. Kein Punkt für Verben in der URI wie `/getAuftrag` oder `/deleteAuftrag`.

**C2 (6 P):** *(je 3 P)*
1. **HTTP statt HTTPS:** API-Schlüssel und Kundendaten gehen im Klartext über das Netz und können mitgelesen werden. → Nur HTTPS zulassen, HTTP-Anfragen abweisen.
2. **API-Schlüssel in der URL:** URLs werden in Server- und Proxy-Logs sowie im Browserverlauf gespeichert. → Schlüssel im Header übertragen, z. B. `Authorization: Bearer <token>`.

*Prüferkommentar: Zusatz, den ein Prüfer gern hört – der gezeigte Schlüssel gilt als kompromittiert und muss gesperrt und ersetzt werden.*

**C3 (6 P):** *(je 2 P)*
- **401 Unauthorized:** Eine Filiale ruft ohne oder mit abgelaufenem Token ab – sie ist nicht **authentifiziert**.
- **403 Forbidden:** Eine angemeldete Partnerwerkstatt will Aufträge einer Filiale abrufen, für die sie keine Berechtigung hat – authentifiziert, aber nicht **autorisiert**.
- **429 Too Many Requests:** Ein Filialskript fragt im Sekundentakt ab und überschreitet das **Rate Limit**; es muss die im Header angegebene Wartezeit einhalten.

**C4 (4 P):** PUT überträgt den vollständigen Zustand einer bereits adressierten Ressource – wird der Aufruf wiederholt, steht danach derselbe Zustand in der Datenbank (**idempotent**). POST legt bei jedem Aufruf eine **neue** Ressource an. Wiederholt ein Client die Anfrage nach einem Timeout, entsteht ein doppelter Reparaturauftrag – eine **Dublette**, die die Eindeutigkeit verletzt und Auswertungen verfälscht. Gegenmaßnahme: **Idempotenzschlüssel** im Header oder eine fachliche Dublettenprüfung.

---

## Block D – NoSQL und Transaktionen (20 P)

**D1 (8 P):** *(je Zeile 2 P)*

| Szenario | Datenbanktyp | Begründung |
|---|---|---|
| (a) Produktkatalog mit wechselnden Attributen | dokumentenorientiert | flexibles Schema: ein Sofa hat einen Bezugsstoff, ein Monitor eine Auflösung – ohne Dutzende leerer Spalten |
| (b) Warenkörbe über Sitzungs-ID | Key-Value | einfacher, extrem schneller Zugriff über einen Schlüssel |
| (c) Empfehlungen über mehrere Stufen | Graph | Beziehungen sind das Kernobjekt; Pfadabfragen über mehrere Ebenen wären relational teure Joins |
| (d) Finanzbuchhaltung | relational | ACID-Transaktionen und strenge Konsistenz sind zwingend |

**D2 (8 P):**
- **Problem:** **Lost Update** – beide Transaktionen lesen denselben Stand, die zweite überschreibt die Änderung der ersten. *(2 P)*
- **Korrekter Endbestand:** 10 − 3 − 3 = **4** statt 7. *(2 P)*
- **Lösungen** *(je 2 P, zwei genügen)*:
  - **Atomares Update:** `UPDATE lager SET bestand = bestand - 3 WHERE artikel_id = 10;` – die Datenbank rechnet auf dem aktuellen Wert.
  - **Pessimistisches Sperren:** `SELECT … FOR UPDATE` sperrt den Datensatz bis zum Ende der Transaktion; der zweite Disponent wartet.
  - **Optimistisches Sperren:** Versionsspalte; das Update enthält `WHERE version = 7`. Hat sich die Version geändert, trifft es 0 Zeilen – Konflikt melden und neu lesen.

**D3 (4 P):** Ohne festes Schema prüft die Datenbank weder Pflichtfelder noch Datentypen. Dokumente werden **uneinheitlich** – das Feld heißt einmal `plz`, einmal `postleitzahl`, Preise stehen mal als Zahl, mal als Text. Vollständigkeit und Konsistenz leiden. *(2 P)* **Gegensteuern:** Validierung in der Anwendung oder ETL-Strecke (z. B. mit JSON Schema), verbindliche Namenskonventionen im Datenkatalog, regelmäßiges Profiling. *(2 P)*

---

## Block E – UML (12 P)

**E1 (6 P):**

```
                 Systemgrenze: Reparaturportal
         +--------------------------------------------------------------+
         |                                                              |
Kunde ---+--- (Reparatur beauftragen) ---<<include>>---> (Anmelden)     |
         |              ^                                               |
         |              | <<extend>>                                    |
         |              |                                               |
         |    (Expressservice wählen)                                   |
         |                                                              |
Service- +--- (Auftrag bearbeiten)                                      |
mitarb.  |                                                              |
         +--------------------------------------------------------------+
```

Bewertung: Systemgrenze mit Anwendungsfällen innen und Akteuren außen (1 P) · beide Akteure mit Assoziationslinien (1 P) · alle vier Anwendungsfälle (1 P) · «include» mit Pfeil vom Basisfall „Reparatur beauftragen“ zu „Anmelden“ (1,5 P) · «extend» mit Pfeil vom erweiternden Fall „Expressservice wählen“ zum Basisfall (1,5 P).

*Prüferkommentar: Häufigster Fehler ist die umgedrehte Pfeilrichtung bei «extend». Merksatz: Der Pfeil zeigt immer auf den Fall, der nicht weiß, dass es den anderen gibt – der Basisfall kennt seine optionale Erweiterung nicht.*

**E2 (6 P):**

| UML | Min-Max | Chen |
|---|---|---|
| Kunde 1 ——— 0..* Reparaturauftrag | KUNDE (0,n) — (1,1) REPARATURAUFTRAG | 1:n |
| Reparaturauftrag 0..* ——— 1..* Leistung | REPARATURAUFTRAG (1,n) — (0,n) LEISTUNG | m:n |

*(je Beziehung 2 P)*. **Zusätzliche Tabelle:** Die m:n-Beziehung wird zur Beziehungstabelle `auftragsposition(auftrag_nr, leistungs_id, …)` mit zusammengesetztem Primärschlüssel aus zwei Fremdschlüsseln – genau die Struktur aus Deep Dive 2. *(2 P)*

*Prüferkommentar: Häufigster Fehler sind Multiplizitäten, die 1:1 an dieselbe Seite übernommen werden. Die 1..* steht in UML bei der Leistung, gehört in Min-Max aber an den Reparaturauftrag – jeder Auftrag umfasst mindestens eine Leistung.*

---

## Auswertung

| Punkte | Note | Konsequenz |
|---|---|---|
| 92–100 | sehr gut | direkt in die Altklausur „Datenqualität“ |
| 81–91 | gut | Fehlerjournal; besonders Syntax- und Richtungsfehler (JSON, UML-Pfeile) gezielt üben |
| < 81 | | Teil 2 und 3 wiederholen, B3 und C1 nach drei Tagen erneut schreiben |

**Die wichtigste Lehre aus diesem Block:** Datenbereitstellung ist Datenqualität an der Grenze zwischen Systemen. Fast jeder Fehler in dieser Klausur – falsche Kodierung, gemischte Zahlenformate, doppelte POSTs, Lost Updates, schemafreie Dokumente – erzeugt am Ende genau die Mängel aus Deep Dive 9: Unvollständigkeit, Inkonsistenz, Dubletten. Wer das im Fachgespräch so verknüpft, zeigt Überblick.
