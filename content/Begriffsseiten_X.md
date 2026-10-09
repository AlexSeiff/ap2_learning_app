<!-- Begriffsseiten X · Stand 2026-10 -->
## XML
<!-- id: xml · quellen: Karte DD15, DD15 2.3, DD15 2.4 · stand: 2026-10 -->

Extensible Markup Language – erweiterbare, textbasierte Auszeichnungssprache, die Daten in selbst definierten, verschachtelten Tags speichert.

### Erklärung
Ein XML-Dokument hat genau ein Wurzelelement, darin Elemente mit Inhalt und Attributen. Es ist **wohlgeformt**, wenn die Syntax stimmt, und **valide**, wenn es zusätzlich einem Schema (XSD oder DTD) entspricht. Mit **XPath** werden Knoten adressiert. XML ist gut maschinell prüfbar, aber wortreich und daher größer als JSON; es ist verbreitet bei Behörden, in der Industrie, bei SOAP-Diensten und in Formaten wie der E-Rechnung.

### Beispiel
```xml
<kunde id="1">
  <name>Huber GmbH</name>
  <ort>München</ort>
</kunde>
```
`/kunde/@id` liefert den Wert 1.

### Abgrenzung
| Kriterium | CSV | JSON | XML |
|---|---|---|---|
| Struktur | flach | verschachtelt | verschachtelt |
| Datentypen | keine | einfache | über Schema (XSD) |
| Validierung | nein | optional (JSON Schema) | ja |
| Größe | klein | mittel | groß |

### Prüfungsfalle
Wohlgeformt mit valide verwechseln – ohne Schema kann ein XML-Dokument nur wohlgeformt sein.

### Merksatz
XML: eigene Tags, ein Wurzelelement, prüfbar per Schema.

Siehe auch: Wohlgeformt · Valide · XSD · XPath · JSON
Mehr: Deep Dive 15, 2.3 · Deep Dive 15, 2.4

## XOR
<!-- id: xor · quellen: Karte DD5, DD5 2.1, DD5 2.2, DD5 2.3 · stand: 2026-10 -->

Exklusives Oder: Von mehreren Möglichkeiten trifft **genau eine** zu – in Prozessmodellen wird genau ein Pfad gewählt.

### Erklärung
In der Logik ist A XOR B wahr, wenn genau eine der beiden Aussagen wahr ist. In **BPMN** ist das XOR-Gateway eine Raute mit X, in der **EPK** ein Kreis mit „XOR“ (Konnektor). Beim Aufspalten wird genau ein Pfad durchlaufen, beim Zusammenführen wird jeder ankommende Fluss sofort weitergeleitet, ohne zu warten. In der EPK darf ein XOR-Split nur nach einer **Funktion** stehen, nie nach einem einzelnen Ereignis – Ereignisse entscheiden nichts.

### Beispiel
Reparaturprozess: Nach „Kostenvoranschlag prüfen“ folgt ein XOR – „angenommen“ führt zur Reparatur, „abgelehnt“ zur Absage. Ein Kunde kann nicht beides gleichzeitig.

### Abgrenzung
| Verknüpfung | BPMN | EPK | Bedeutung |
|---|---|---|---|
| XOR | Raute mit X | Kreis „XOR“ | genau ein Pfad |
| OR | Raute mit Kreis | ∨ | ein oder mehrere Pfade |
| AND | Raute mit + | ∧ | alle Pfade parallel |

### Prüfungsfalle
XOR öffnen und mit AND schließen – das AND wartet auf einen Pfad, der nie kommt (Deadlock).

### Merksatz
XOR: entweder – oder, nie beides.

Siehe auch: XOR-Gateway · AND · OR · Konnektor · EPK
Mehr: Deep Dive 5, 2.1 · Deep Dive 5, 2.2 · Deep Dive 5, 2.3

## XOR-Gateway
<!-- id: xor-gateway · quellen: DD17 1.1, DD5 2.1 · stand: 2026-10 -->

BPMN-Gateway (Raute mit X), an dem der Ablauf in genau einen von mehreren Pfaden verzweigt; die ausgehenden Pfade werden mit ihren Bedingungen beschriftet.

### Erklärung
Das Gateway **entscheidet nichts** – die Entscheidung fällt in der Aktivität davor, das Gateway verzweigt nur. Die Bedingungen müssen **vollständig und überschneidungsfrei** sein. Ein Pfad mit Querstrich ist der **Standardfluss**, der greift, wenn keine Bedingung zutrifft. Eine leere Raute bedeutet ebenfalls XOR, das X ist aber eindeutiger. Token-Semantik: beim Split läuft das Token in genau einen Pfad, beim Join wird jedes Token sofort durchgelassen.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 130" width="360" height="130" role="img" aria-label="XOR-Gateway mit zwei beschrifteten Pfaden">
<defs><marker id="xor-gateway-pfeil" viewBox="0 0 10 10" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L10,5 L0,10 z" class="dg-voll"/></marker></defs>
<rect x="10" y="45" width="100" height="40" rx="8" class="dg-form"/>
<text x="60" y="65" text-anchor="middle" dominant-baseline="middle" class="dg-klein">KV prüfen</text>
<line x1="110" y1="65" x2="140" y2="65" class="dg-linie" marker-end="url(#xor-gateway-pfeil)"/>
<polygon points="162,43 184,65 162,87 140,65" class="dg-form"/>
<line x1="154" y1="57" x2="170" y2="73" class="dg-linie"/>
<line x1="170" y1="57" x2="154" y2="73" class="dg-linie"/>
<path d="M162,43 L162,25 L240,25" class="dg-linie" marker-end="url(#xor-gateway-pfeil)"/>
<path d="M162,87 L162,105 L240,105" class="dg-linie" marker-end="url(#xor-gateway-pfeil)"/>
<text x="200" y="17" text-anchor="middle" class="dg-klein">angenommen</text>
<text x="200" y="122" text-anchor="middle" class="dg-klein">abgelehnt</text>
<rect x="240" y="8" width="110" height="34" rx="8" class="dg-form"/>
<text x="295" y="25" text-anchor="middle" dominant-baseline="middle" class="dg-klein">Reparieren</text>
<rect x="240" y="88" width="110" height="34" rx="8" class="dg-form"/>
<text x="295" y="105" text-anchor="middle" dominant-baseline="middle" class="dg-klein">Absage senden</text>
</svg>
```

### Beispiel
Nach „Kostenvoranschlag (KV) prüfen“ folgt das XOR-Gateway mit den Pfaden „angenommen“ und „abgelehnt“. Die Bedingungen „Betrag < 500 €“ und „Betrag > 500 €“ wären dagegen unvollständig – 500 € genau fällt durch.

### Abgrenzung
AND-Gateway (+): alle Pfade parallel, der Join wartet auf alle. OR-Gateway (Kreis): ein oder mehrere Pfade. Ereignisbasiertes Gateway: das zuerst eintretende Ereignis entscheidet, nicht die Daten.

### Prüfungsfalle
Unbeschriftete Pfade oder eine Frage „Kunde einverstanden?“ als Aufgabe des Gateways – Punkteabzug, weil das Gateway nicht handelt.

### Merksatz
Raute mit X: genau ein Weg, jeder Weg beschriftet.

Siehe auch: XOR · AND-Gateway · OR-Gateway · Ereignisbasiertes Gateway · Token (BPMN)
Mehr: Deep Dive 17, 1.1 · Deep Dive 5, 2.1

## XPath
<!-- id: xpath · quellen: Karte DD15, DD15 2.3 · stand: 2026-10 -->

Pfadsprache, mit der Knoten (Elemente, Attribute, Text) in einem XML-Dokument adressiert und ausgewählt werden.

### Erklärung
Ein Ausdruck beschreibt den Weg durch den Dokumentbaum. `/` beginnt an der Wurzel bzw. trennt Kindschritte, `//` sucht in beliebiger Tiefe, `@` wählt ein Attribut, eckige Klammern filtern (Prädikate). XPath wird in XSLT, XML-Schema-Prüfungen und vielen Import-Werkzeugen genutzt, um gezielt Werte aus XML zu lesen.

### Beispiel
```xml
<kunden><kunde id="1"><name>Huber GmbH</name><ort>München</ort></kunde></kunden>
```
- `/kunden/kunde/name` → „Huber GmbH“
- `//ort` → alle ort-Elemente, egal wie tief
- `/kunden/kunde/@id` → 1
- `//kunde[ort='München']/name` → Namen aller Münchner Kunden

### Abgrenzung
XPath adressiert Knoten in XML; XSD legt die erlaubte Struktur fest; SQL fragt relationale Tabellen ab. Für JSON gibt es das ähnliche JSONPath.

### Prüfungsfalle
Attribute ohne `@` ansprechen – `/kunde/id` sucht ein Kindelement id, nicht das Attribut.

### Merksatz
Ein Schrägstrich geht eine Ebene tiefer, zwei suchen überall, @ holt das Attribut.

Siehe auch: XML · XSD · Wohlgeformt
Mehr: Deep Dive 15, 2.3

## XSD
<!-- id: xsd · quellen: Karte DD15, DD15 2.3 · stand: 2026-10 -->

XML Schema Definition – in XML geschriebene Beschreibung, die Struktur, Reihenfolge, Häufigkeit und Datentypen eines XML-Dokuments festlegt.

### Erklärung
Gegen eine XSD wird ein Dokument **validiert**: Erfüllt es alle Regeln, ist es valide. Die XSD kennt eingebaute Datentypen (`xs:string`, `xs:decimal`, `xs:date`), Häufigkeiten (`minOccurs`, `maxOccurs`) und Einschränkungen wie Wertebereiche oder Muster. Damit lassen sich Lieferungen schon beim Import automatisch prüfen – ein Gewinn für die Datenqualität.

### Beispiel
```xml
<xs:element name="preis">
  <xs:simpleType>
    <xs:restriction base="xs:decimal">
      <xs:minInclusive value="0"/>
    </xs:restriction>
  </xs:simpleType>
</xs:element>
```
Eine Lieferung mit `<preis>-5</preis>` oder `<preis>abc</preis>` ist nicht valide.

### Abgrenzung
DTD: ältere Schemasprache, keine echten Datentypen, nicht in XML-Syntax. XSD: XML-Syntax, mit Datentypen. JSON Schema: Gegenstück für JSON.

### Prüfungsfalle
Annehmen, ein wohlgeformtes Dokument sei automatisch korrekt – erst die Prüfung gegen die XSD stellt Typen und Struktur sicher.

### Merksatz
Die XSD ist der Bauplan, gegen den XML validiert wird.

Siehe auch: XML · Valide · DTD · Wohlgeformt · Schema
Mehr: Deep Dive 15, 2.3
