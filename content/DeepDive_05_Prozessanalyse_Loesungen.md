# Musterlösungen Übungsklausur Prozessanalyse (Deep Dive 5)
## Mit Prüferkommentaren zur Punktevergabe

**Selbstbewertung:** Bei Modellierungsaufgaben zählt jedes geforderte Element einzeln – gehe die Aufgabenstellung wie eine Checkliste durch. Bei Rechenaufgaben zählt der Weg. 92+ P = sehr gut.

---

## Block A – Grundlagen (14 P)

**A1 (6 P):**
- **Kernprozess:** unmittelbar wertschöpfend, erzeugt direkten Kundennutzen, ist auf den externen Kunden gerichtet.
- **Unterstützungsprozess:** schafft die Voraussetzungen für die Kernprozesse, ohne selbst direkten Kundennutzen zu erzeugen (IT-Betrieb, Personal, Einkauf).
- **Führungsprozess:** steuert und überwacht das Unternehmen (Strategie, Controlling, Qualitätsmanagement).

Zuordnung: Der Reparaturservice ist ein **Kernprozess** – er erbringt eine vom Kunden beauftragte und bezahlte Leistung und trägt direkt zur Wertschöpfung bei.

*Prüferkommentar: Je 1,5 P pro Definition, 1,5 P für die begründete Zuordnung. Ohne Begründung nur 0,5 P für die Zuordnung.*

**A2 (8 P):**
Vier Methoden *(je 1 P, max. 4 P)*: Interview mit Prozessbeteiligten · Workshop · Beobachtung am Arbeitsplatz · Dokumentenanalyse · Fragebogen · Auswertung von Systemdaten/Logfiles.

Vor- und Nachteile für zwei Methoden *(je 2 P)*:
- **Interview:** Vorteil – liefert Erfahrungswissen, Hintergründe und Ausnahmefälle, die in keinem System stehen; Rückfragen sind möglich. Nachteil – subjektiv; Befragte schildern häufig den Soll- statt den gelebten Ist-Prozess, und es kostet viel Zeit.
- **Auswertung von Systemdaten:** Vorteil – objektiv, vollständig, ohne Beeinflussung durch die Befragten, auch große Fallzahlen auswertbar. Nachteil – erklärt nicht das *Warum* hinter Abweichungen; Schritte außerhalb des Systems (Telefonate, Papier) bleiben unsichtbar; Datenqualität muss geprüft werden.

---

## Block B – Modellierung (26 P)

**B1 (18 P):** Erforderliche Elemente und Punktevergabe:

| Element | P |
|---|---|
| Pool „Möbelhaus Nordholz" mit **drei Lanes** (Serviceannahme, Werkstatt, Buchhaltung) | 3 |
| Separater Pool „Kunde" (Black Box zulässig) | 2 |
| Startereignis in der Serviceannahme, ausgelöst durch die Kundenmeldung | 2 |
| Aktivitäten mit Verb + Objekt: Auftrag erfassen · Kostenvoranschlag erstellen · Ersatzteil bestellen · Techniker einplanen · Reparatur durchführen · Rechnung stellen | 3 |
| **XOR-Gateway** nach dem Kostenvoranschlag mit **beschrifteten** Pfaden „angenommen" / „abgelehnt" | 3 |
| **AND-Gateway** zum Aufspalten *und* passendes AND zum Zusammenführen von Ersatzteilbestellung und Technikereinplanung | 3 |
| Mindestens ein **gestrichelter** Nachrichtenfluss zum Kundenpool (Kostenvoranschlag, Absage oder Rechnung) | 2 |
| Zwei Endereignisse (nach Absage und nach Rechnungsstellung) | 2 |

*(Summe 20 – Maximum 18 P, kleinere Darstellungsmängel werden also aufgefangen.)*

**Prüferkommentar – die drei häufigsten Punktverluste:**
1. Durchgezogener Sequenzfluss zum Kundenpool statt gestricheltem Nachrichtenfluss → **−2 P**. Zwischen Pools fließen ausschließlich Nachrichten.
2. Parallele Schritte hinter einem XOR statt einem AND modelliert → **−3 P**. „Gleichzeitig" in der Aufgabenstellung ist das Signalwort für AND.
3. Unbeschriftete XOR-Pfade → **−1,5 P**. Ohne Bedingung ist nicht erkennbar, wann welcher Weg gilt.

**B2 (8 P):**
**Fehler 1:** Auf ein Ereignis folgt direkt ein weiteres Ereignis (über den Konnektor) – Ereignisse und Funktionen müssen sich streng abwechseln. *(2 P Benennung, 1 P Begründung)*
**Fehler 2:** Nach einem einzelnen Ereignis darf keine XOR-Verzweigung stehen. Ereignisse sind passive Zustände und können keine Entscheidung herbeiführen; Entscheidungen gehen immer von einer **Funktion** aus. *(2 P Benennung, 1 P Begründung)*

**Korrigierte Reihenfolge:** *(2 P)*
Ereignis „Kostenvoranschlag ist versendet" → **Funktion „Kundenentscheidung einholen/prüfen"** → XOR-Konnektor → Ereignisse „Auftrag angenommen" bzw. „Auftrag abgelehnt" → jeweils anschließende Funktion.

---

## Block C – Kennzahlen (26 P)

**C1 (8 P):**
- Bearbeitungszeit gesamt = 0,25 + 0,25 + 0,75 + 0,25 = **1,5 h** *(3 P)*
- Liegezeit gesamt = 3,5 + 16,0 + 9,0 = **28,5 h** *(3 P)*
- **Durchlaufzeit = 1,5 + 28,5 = 30,0 h** *(2 P)*

**C2 (6 P):**
Wertschöpfungsanteil = 1,5 / 30,0 · 100 = **5,00 %** *(2 P)*

Beurteilung: Nur 5 % der Durchlaufzeit entfallen auf echte Bearbeitung; in 95 % der Zeit liegt der Auftrag ungenutzt. Das ist ein sehr niedriger, in der Praxis aber typischer Wert und zeigt einen stark durch Wartezeiten geprägten Prozess. *(2 P)*

Ansatzpunkt: Die Optimierung muss bei den **Liegezeiten** ansetzen – insbesondere bei den 16 Stunden nach der Disposition, dem mit Abstand größten Einzelblock. Eine Beschleunigung der Bearbeitung selbst hätte selbst bei einer Halbierung nur einen Effekt von 2,5 % auf die Durchlaufzeit. *(2 P)*

*Prüferkommentar: Der letzte Absatz ist die eigentliche Prüfungsleistung. Wer „Techniker sollen schneller arbeiten" vorschlägt, erhält hier 0 P – die Zahlen widerlegen den Ansatz.*

**C3 (6 P):**
- Fehlerquote = 24 / 200 · 100 = **12,00 %** *(3 P)*
- First Pass Yield = (200 − 24) / 200 · 100 = 176 / 200 · 100 = **88,00 %** *(3 P)*

**C4 (6 P):**
- Nacharbeitszeit gesamt = 24 · 0,75 h = 18 h *(2 P)*
- Nacharbeitskosten = 18 h · 60 €/h = **1.080,00 €** im Monat *(2 P)*
- Zuschlag je Auftrag = 1.080 € / 200 = **5,40 € je Auftrag** *(2 P)*

*Prüferkommentar: Der letzte Teilschritt wird häufig übersehen. Die Umlage auf alle Aufträge – nicht nur auf die fehlerhaften – ist fachlich korrekt, weil die Fehlerkosten in die Kalkulation jedes Auftrags eingehen.*

---

## Block D – Optimierung und Wirtschaftlichkeit (18 P)

**D1 (6 P):** *(je 2 P: 1 P Maßnahme, 1 P korrekte Zuordnung)* Beispiele:
- **Automatisieren:** Kostenvoranschlag automatisch aus hinterlegten Standardpositionen erzeugen und digital versenden; automatische Erinnerung an den Kunden nach 24 h ohne Rückmeldung – greift direkt die 16 h Liegezeit an.
- **Umstellen/Parallelisieren:** Technikereinplanung bereits vorläufig parallel zur Kundenentscheidung starten, statt sie erst nach der Zusage zu beginnen.
- **Eliminieren:** Bei Kleinaufträgen unterhalb einer Wertgrenze auf den Kostenvoranschlag ganz verzichten (Sofortfreigabe) – der Schritt entfällt samt zugehöriger Liegezeit.
- **Standardisieren:** Einheitliche Checkliste und Pflichtfelder bei der Auftragserfassung, um Rückfragen und Nacharbeit zu vermeiden.

*Prüferkommentar: Maßnahmen, die auf die Bearbeitungszeit statt auf die Liegezeit zielen, erhalten nur den halben Punkt – sie widersprechen dem Ergebnis aus C2.*

**D2 (8 P):**
- Zeitersparnis pro Jahr = 2.400 Aufträge · 5 min = 12.000 min = 12.000 / 60 = **200 h** *(2 P)*
- Jährliche Einsparung = 200 h · 60 €/h = **12.000,00 €** *(2 P)*
- Amortisationszeit = 18.000 € / 12.000 €/Jahr = **1,5 Jahre** (18 Monate) *(2 P)*

Beurteilung: Die Investition amortisiert sich nach 1,5 Jahren und damit deutlich innerhalb der geplanten Nutzungsdauer von fünf Jahren. In den verbleibenden 3,5 Jahren entsteht ein rechnerischer Überschuss von rund 42.000 €. Die Investition ist wirtschaftlich zu empfehlen. *(2 P)*

*Prüferkommentar: Ohne den Beurteilungssatz gibt es nur 6 von 8 P. Die Aufgabe verlangte ausdrücklich „beurteilen" – die reine Zahl reicht nicht.*

**D3 (4 P):** *(je 2 P, zwei genügen)*
- **Qualitätseffekte:** Digitale Erfassung mit Pflichtfeldern reduziert Erfassungsfehler und damit die Nacharbeitsquote von derzeit 12 % – diese Einsparung ist in der Rechnung nicht enthalten.
- **Kundenzufriedenheit und Termintreue:** Kürzere Durchlaufzeiten und transparenter Bearbeitungsstand wirken auf Folgeaufträge und Weiterempfehlung.
- **Laufende Folgekosten:** Wartung, Lizenzen, Schulung und Anbieterabhängigkeit mindern den Nutzen und fehlen in der reinen Amortisationsrechnung.
- **Mitarbeiterakzeptanz und Einführungsaufwand:** Produktivitätsverlust in der Umstellungsphase, Schulungsbedarf, mögliche Widerstände.
- **Skalierbarkeit:** Bei wachsendem Auftragsvolumen steigt der Nutzen überproportional; die Datenbasis wird zugleich für weitere Auswertungen nutzbar.

---

## Block E – Process Mining und Recht (16 P)

**E1 (6 P):** *(je 2 P)*
- **Case ID:** Eindeutige Vorgangskennung, die alle Ereignisse eines Falls zusammenfasst – ohne sie lassen sich Ereignisse keinem Prozessdurchlauf zuordnen.
- **Activity:** Bezeichnung des ausgeführten Prozessschritts – bildet die Knoten des rekonstruierten Prozessmodells.
- **Timestamp:** Zeitpunkt des Ereignisses – legt die Reihenfolge fest und ermöglicht die Berechnung von Durchlauf- und Wartezeiten.

**E2 (6 P):**
**Datenqualitätsproblem 1:** Bei Case 5002, Schritt „Kostenvoranschlag erstellen", fehlt die **Uhrzeit** im Zeitstempel (nur Datum). *(1 P)* Konsequenz: Die Reihenfolge innerhalb des 2. März ist nicht eindeutig rekonstruierbar, und die Wartezeit bis zum nächsten Schritt lässt sich nicht berechnen – die Durchlaufzeitanalyse für diesen Fall wird ungenau oder muss den Fall ausschließen. *(1 P)*

**Datenqualitätsproblem 2:** Der Prozessschritt **„Ersatzteil bestellen" und „Techniker einplanen" fehlen vollständig** im Log, obwohl sie laut Prozessbeschreibung Teil des Ablaufs sind. *(1 P)* Konsequenz: Diese Schritte werden offenbar außerhalb des Systems abgewickelt (Telefon, Papier); das aus dem Log rekonstruierte Modell wäre unvollständig und würde die Wartezeit vor der Reparatur fälschlich als eine einzige Liegezeit ausweisen. *(1 P)*

*Ebenfalls anerkannt: fehlende Endereignisse, keine Trennung von Start- und Endzeitpunkt je Aktivität.*

**Prozessauffälligkeit:** Bei Case 5002 erscheint **„Reparatur durchführen" zweimal** (04.03. und 05.03.) – eine **Nacharbeitsschleife (Rework)**. *(1 P)* Konsequenz: Der Fall benötigte einen zweiten Werkstattdurchlauf; solche Schleifen verlängern die Durchlaufzeit erheblich und verursachen die in C4 berechneten Nacharbeitskosten. Genau diese Wiederholungen macht Process Mining sichtbar, während sie in Interviews meist unerwähnt bleiben. *(1 P)*

**E3 (4 P):**
Rechtliche Anforderungen: *(2 P)*
Das Feld *Resource* macht die Auswertung **personenbezogen**. Ein System, das zur Überwachung von Verhalten oder Leistung der Beschäftigten **geeignet** ist, unterliegt der Mitbestimmung des Betriebsrats nach **§ 87 Abs. 1 Nr. 6 BetrVG** – die technische Eignung genügt, eine Überwachungsabsicht ist nicht erforderlich. Zusätzlich gelten die Vorgaben der **DSGVO**: Rechtsgrundlage, Zweckbindung, Datenminimierung, Information der Betroffenen; bei umfangreicher systematischer Auswertung ist eine Datenschutz-Folgenabschätzung nach Art. 35 zu prüfen.

Zwei Maßnahmen: *(je 1 P)*
- **Aggregation:** Auswertung nur auf Team- oder Abteilungsebene mit einer Mindestgruppengröße, sodass keine Rückschlüsse auf Einzelpersonen möglich sind.
- **Pseudonymisierung** der Resource-Spalte; der Zuordnungsschlüssel wird getrennt aufbewahrt und nur bei berechtigtem Anlass verwendet. Ebenfalls anerkannt: Abschluss einer Betriebsvereinbarung, die Zweck und Grenzen der Auswertung verbindlich regelt; frühzeitige Einbindung von Betriebsrat und Datenschutzbeauftragtem.

---

## Auswertung

| Punkte | Note | Konsequenz |
|---|---|---|
| 92–100 | sehr gut | Modellierung sitzt – alle zwei Wochen einen Prozess zeichnen |
| 81–91 | gut | Fehlerthemen ins Fehlerjournal; Modellierungsregeln als Karteikarte |
| < 81 | | Teil 2 + 3 wiederholen, drei Prozesse aus dem eigenen Betrieb modellieren |

**Ein letzter Hinweis:** In diesem Prüfungsbereich verlieren gute Kandidaten Punkte fast immer an derselben Stelle – sie **rechnen** die Kennzahl korrekt, **beurteilen** sie aber nicht. Prüfe deine Antworten deshalb gegen die Operatoren: Steht dort „beurteilen", „begründen" oder „bewerten", gehört nach der Zahl mindestens ein vollständiger Satz mit einer Schlussfolgerung. Das ist der Unterschied zwischen 85 und 95 Punkten.
