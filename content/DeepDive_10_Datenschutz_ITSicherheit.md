# Deep Dive 10: Datenschutz (DSGVO) & IT-Sicherheit
## Lernzettel mit Übungsklausur im IHK-Stil – FIDPA AP2

---

## Prüfungsrelevanz

Datenschutz und Datensicherheit sind ein eigener Abschnitt im Prüfungsbereich **„Sicherstellen der Datenqualität"** und tauchen zusätzlich in der **Prozessanalyse** auf (rechtliche Auswirkungen von Prozessänderungen) sowie **im Fachgespräch** – dort praktisch garantiert, sobald dein Projekt personenbezogene Daten berührt.

Der Stoff ist auswendig lernbar und liefert damit sichere Punkte. Entscheidend ist, die Artikel nicht nur zu nennen, sondern **auf den geschilderten Fall anzuwenden**.

Szenario: **Möbelhaus Nordholz GmbH**.

---

# Teil 1 – Grundbegriffe der DSGVO

| Begriff | Bedeutung |
|---|---|
| **Personenbezogene Daten** | Alle Informationen, die sich auf eine identifizierte oder **identifizierbare** natürliche Person beziehen (Art. 4 Nr. 1) |
| **Verarbeitung** | Jeder Vorgang mit den Daten: Erheben, Speichern, Ändern, Auslesen, Übermitteln, Löschen |
| **Verantwortlicher** | Wer über Zwecke und Mittel der Verarbeitung entscheidet – hier das Möbelhaus |
| **Auftragsverarbeiter** | Wer im Auftrag und weisungsgebunden verarbeitet – z. B. ein externes Rechenzentrum |
| **Betroffene Person** | Diejenige, deren Daten verarbeitet werden |

**Die Reichweite wird regelmäßig unterschätzt.** Personenbezug besteht schon dann, wenn eine Person **mit vertretbarem Aufwand** identifizierbar ist. Dazu zählen auch: Kundennummer, IP-Adresse, Personalnummer, Kfz-Kennzeichen, Standortdaten, Cookie-IDs. Die Bezeichnung „anonymisiert" auf einer Datei macht sie nicht anonym.

⚠️ **Wichtig:** Die DSGVO schützt **natürliche** Personen. Daten einer juristischen Person (die „Huber GmbH" als solche) fallen nicht darunter – wohl aber die Daten ihrer **Ansprechpartner**. Genau diese Unterscheidung wird gern geprüft.

---

# Teil 2 – Die zentralen Artikel

## 2.1 Art. 5 – Grundsätze der Verarbeitung

1. **Rechtmäßigkeit, Verarbeitung nach Treu und Glauben, Transparenz**
2. **Zweckbindung** – Daten dürfen nur für den bei der Erhebung festgelegten Zweck verwendet werden
3. **Datenminimierung** – nur so viele Daten wie nötig
4. **Richtigkeit** – Daten müssen sachlich richtig und aktuell sein *(die direkte Brücke zu Deep Dive 9: Datenqualität ist hier gesetzliche Pflicht)*
5. **Speicherbegrenzung** – nicht länger speichern als erforderlich
6. **Integrität und Vertraulichkeit** – Schutz durch geeignete Maßnahmen
7. **Rechenschaftspflicht** – der Verantwortliche muss die Einhaltung **nachweisen** können

**Merksatz:** Die Rechenschaftspflicht dreht die Beweislast um. Es genügt nicht, rechtmäßig zu handeln – man muss es belegen können. Daraus folgt die Pflicht zur **Dokumentation** jeder Verarbeitung.

## 2.2 Art. 6 – Rechtsgrundlagen

Eine Verarbeitung ist nur zulässig, wenn **mindestens eine** dieser Grundlagen greift:

| Grundlage | Beispiel im Möbelhaus |
|---|---|
| **Einwilligung** | Newsletter-Versand |
| **Vertragserfüllung** | Adresse für die Lieferung des gekauften Sofas |
| **Rechtliche Verpflichtung** | Aufbewahrung von Rechnungen nach HGB/AO |
| **Lebenswichtige Interessen** | Notfallsituation |
| **Öffentliche Aufgabe** | für Behörden relevant |
| **Berechtigtes Interesse** | Betrugsprävention – nach Abwägung gegen die Interessen der Betroffenen |

**Die Einwilligung** muss freiwillig, informiert, zweckbezogen und **jederzeit widerrufbar** sein; vorangekreuzte Kästchen sind unwirksam. Wichtig: Sie ist nur **eine von sechs** Grundlagen – für die Lieferadresse braucht es keine Einwilligung, sie ergibt sich aus dem Vertrag. Wer für alles eine Einwilligung einholt, macht es falsch herum.

**Art. 9 – besondere Kategorien:** Gesundheitsdaten, biometrische Daten, Religion, politische Meinung, Gewerkschaftszugehörigkeit, ethnische Herkunft, sexuelle Orientierung. Verarbeitung grundsätzlich **verboten**, nur bei engen Ausnahmen (z. B. ausdrückliche Einwilligung) zulässig.

## 2.3 Betroffenenrechte

| Recht | Artikel | Inhalt |
|---|---|---|
| Auskunft | 15 | Welche Daten werden zu welchem Zweck verarbeitet? |
| Berichtigung | 16 | Korrektur unrichtiger Daten |
| Löschung („Vergessenwerden") | 17 | Löschung, wenn der Zweck entfallen ist |
| Einschränkung | 18 | Sperren statt löschen |
| Datenübertragbarkeit | 20 | Herausgabe in maschinenlesbarem Format |
| Widerspruch | 21 | gegen Verarbeitung auf Basis berechtigten Interesses |
| Keine automatisierte Entscheidung | 22 | → Deep Dive 6 |

**Frist:** Anträge sind **unverzüglich, spätestens innerhalb eines Monats** zu beantworten (bei komplexen Fällen um zwei Monate verlängerbar).

⚠️ **Der Klassiker-Konflikt:** Ein Kunde verlangt Löschung – die Rechnung muss aber nach HGB und AO **zehn Jahre** aufbewahrt werden. Auflösung: Die gesetzliche Aufbewahrungspflicht geht vor; die Daten werden **für die weitere Nutzung gesperrt** (eingeschränkte Verarbeitung nach Art. 18) und nach Ablauf der Frist gelöscht. Werbedaten und die Newsletter-Anmeldung sind dagegen sofort zu löschen.

## 2.4 Weitere prüfungsrelevante Pflichten

| Artikel | Pflicht |
|---|---|
| **Art. 25** | **Privacy by Design** (Datenschutz von Anfang an mitentwickeln) und **Privacy by Default** (datenschutzfreundliche Voreinstellungen) |
| **Art. 28** | **Auftragsverarbeitungsvertrag (AVV)** – zwingend bei externen Dienstleistern |
| **Art. 30** | **Verzeichnis von Verarbeitungstätigkeiten** – die zentrale Dokumentation |
| **Art. 32** | **Technische und organisatorische Maßnahmen (TOM)** |
| **Art. 33/34** | **Meldepflicht bei Datenpannen: 72 Stunden** an die Aufsichtsbehörde; bei hohem Risiko zusätzlich Information der Betroffenen |
| **Art. 35** | **Datenschutz-Folgenabschätzung (DSFA)** bei voraussichtlich hohem Risiko |
| **Art. 83** | Bußgelder bis **20 Mio. € oder 4 % des weltweiten Jahresumsatzes** – der höhere Wert gilt |

**Betrieblicher Datenschutzbeauftragter:** in Deutschland verpflichtend, sobald in der Regel **mindestens 20 Personen** ständig mit automatisierter Verarbeitung personenbezogener Daten beschäftigt sind (§ 38 BDSG) – oder wenn eine DSFA erforderlich ist.

---

# Teil 3 – Anonymisierung und Pseudonymisierung

Die wichtigste Unterscheidung für Datenanalysten:

| | **Anonymisierung** | **Pseudonymisierung** |
|---|---|---|
| Personenbezug | dauerhaft entfernt | über Schlüssel wiederherstellbar |
| DSGVO anwendbar? | **nein** | **ja** – bleibt personenbezogen |
| Umkehrbar | nein | ja, mit Zusatzwissen |
| Beispiel | „Durchschnittsalter je Region" | Name ersetzt durch Kundennummer, Zuordnungstabelle separat |

**Die Falle:** Pseudonymisierung wird gern als Freibrief missverstanden. Sie ist eine **Schutzmaßnahme nach Art. 32**, keine Befreiung von der DSGVO. Erst echte Anonymisierung führt aus dem Anwendungsbereich heraus.

**Und echte Anonymisierung ist schwer:** Bei kleinen Gruppen genügen wenige Merkmale zur Re-Identifikation. „Weiblich, Filiale Köln, Abteilungsleitung" ist faktisch eine Person. Gegenmaßnahmen: Mindestgruppengrößen festlegen (kein Auswertungsfeld mit weniger als fünf Personen), Merkmale vergröbern (Altersgruppen statt Geburtsdatum), Kombinationsmöglichkeiten begrenzen.

> ❓ **Prüferfrage:** Sie pseudonymisieren die Mitarbeiternamen in Ihrem Event Log. Genügt das, um die DSGVO nicht mehr beachten zu müssen?
> *Nein. Pseudonymisierte Daten bleiben personenbezogen, solange die Zuordnung – hier über die Schlüsseltabelle – möglich ist. Die DSGVO gilt weiterhin vollständig. Zusätzlich bleibt die Mitbestimmung des Betriebsrats nach § 87 Abs. 1 Nr. 6 BetrVG bestehen, da das System weiterhin zur Leistungskontrolle geeignet ist.*

---

# Teil 4 – IT-Sicherheit

## 4.1 Schutzziele

| Ziel | Bedeutung | Typische Maßnahme |
|---|---|---|
| **Vertraulichkeit** | Nur Berechtigte können lesen | Verschlüsselung, Berechtigungskonzept |
| **Integrität** | Daten sind unverändert und vollständig | Hashwerte, Signaturen, Protokollierung |
| **Verfügbarkeit** | Systeme sind nutzbar, wenn sie gebraucht werden | Backup, Redundanz, USV |
| *(Authentizität)* | Der Absender ist der, der er vorgibt zu sein | digitale Signatur, Zertifikate |
| *(Verbindlichkeit)* | Handlungen sind nachweisbar und nicht abstreitbar | revisionssichere Protokolle |

Die ersten drei bilden die klassische **CIA-Trias** (Confidentiality, Integrity, Availability). Merke: Die Ziele stehen teilweise im **Zielkonflikt** – maximale Vertraulichkeit (alles verschlüsselt, niemand hat Rechte) senkt die Verfügbarkeit. Sicherheitskonzepte sind immer Abwägungen.

## 4.2 Verschlüsselung und Hashing

| Verfahren | Prinzip | Eigenschaft | Beispiel |
|---|---|---|---|
| **Symmetrisch** | ein gemeinsamer Schlüssel für Ver- und Entschlüsselung | schnell; Problem: sicherer Schlüsselaustausch | AES |
| **Asymmetrisch** | öffentlicher Schlüssel verschlüsselt, privater entschlüsselt | löst den Schlüsselaustausch; langsamer | RSA |
| **Hybrid** | asymmetrisch den Sitzungsschlüssel übertragen, dann symmetrisch verschlüsseln | Praxisstandard | TLS/HTTPS |
| **Hashing** | Einwegfunktion, feste Länge, nicht umkehrbar | Integritätsprüfung, Passwortspeicherung | SHA-256 |

**Hashing ist keine Verschlüsselung** – es gibt keinen Rückweg. Passwörter werden gehasht gespeichert, zusätzlich mit einem **Salt** (Zufallswert je Passwort), damit gleiche Passwörter unterschiedliche Hashes ergeben und vorberechnete Tabellen nutzlos werden.

**Digitale Signatur:** Der Absender verschlüsselt den Hash des Dokuments mit seinem **privaten** Schlüssel. Jeder kann mit dem öffentlichen Schlüssel prüfen, ob Absender und Inhalt stimmen – das sichert Authentizität und Integrität, nicht aber Vertraulichkeit.

## 4.3 Zugriffsschutz

- **Authentifizierung** – wer bist du? Faktoren: **Wissen** (Passwort), **Besitz** (Token, Smartphone), **Sein** (Fingerabdruck). **Mehr-Faktor-Authentifizierung** kombiniert mindestens zwei *verschiedene* Kategorien – Passwort plus Sicherheitsfrage ist deshalb **keine** MFA.
- **Autorisierung** – was darfst du?
- **RBAC (rollenbasierte Zugriffskontrolle):** Rechte hängen an Rollen, nicht an Personen. Vorteil: Beim Abteilungswechsel wird die Rolle getauscht, nicht jedes Einzelrecht gepflegt.
- **Least Privilege:** so wenig Rechte wie möglich. **Need-to-know:** Zugriff nur auf das fachlich Erforderliche. **Funktionstrennung:** Wer eine Zahlung anlegt, darf sie nicht freigeben.

## 4.4 Datensicherung

| Verfahren | Gesichert wird | Sicherungsdauer | Rücksicherung |
|---|---|---|---|
| **Vollsicherung** | alles | lang | 1 Medium |
| **Differenziell** | alle Änderungen **seit der letzten Vollsicherung** | wächst täglich | 2 Medien (Voll + letzte differenzielle) |
| **Inkrementell** | alle Änderungen **seit der letzten Sicherung** | kurz, konstant | viele Medien (Voll + **alle** inkrementellen) |

**Die Abwägung in einem Satz:** Inkrementell sichert am schnellsten, stellt am langsamsten wieder her – differenziell umgekehrt.

**3-2-1-Regel:** 3 Kopien der Daten, auf 2 verschiedenen Medientypen, davon 1 an einem anderen Ort (offsite). Ergänzend gilt heute: mindestens eine Kopie **offline oder unveränderbar** (Schutz vor Ransomware, die erreichbare Backups mitverschlüsselt).

**RTO und RPO** – zwei Kennzahlen, die in Prüfungen gern verwechselt werden:
- **RPO (Recovery Point Objective):** Wie viel Datenverlust ist maximal tolerierbar? → bestimmt die **Sicherungsfrequenz**
- **RTO (Recovery Time Objective):** Wie lange darf die Wiederherstellung dauern? → bestimmt das **Sicherungsverfahren und die Infrastruktur**

⚠️ **RAID ersetzt kein Backup.** RAID schützt vor Hardwareausfall, nicht vor versehentlichem Löschen, Ransomware oder fehlerhaften Änderungen – diese werden sofort auf alle Platten gespiegelt.

## 4.5 Typische Angriffsarten

| Angriff | Prinzip | Gegenmaßnahme |
|---|---|---|
| **Phishing** | gefälschte Nachrichten erschleichen Zugangsdaten | Schulung, MFA, Mailfilter |
| **Social Engineering** | Manipulation von Menschen statt Technik | Schulung, Rückrufverfahren, klare Prozesse |
| **Ransomware** | Verschlüsselung der Daten, Erpressung | Offline-Backups, Segmentierung, Patchmanagement |
| **SQL-Injection** | Schadcode über Eingabefelder in Datenbankabfragen | **parametrisierte Abfragen (Prepared Statements)**, Eingabevalidierung, minimale DB-Rechte |
| **Man-in-the-Middle** | Mitlesen/Verändern der Kommunikation | TLS, Zertifikatsprüfung |
| **Brute Force** | systematisches Durchprobieren | Sperrmechanismen, lange Passwörter, MFA |

SQL-Injection ist für deine Fachrichtung die relevanteste: Wer Daten aus Eingaben in SQL zusammenbaut, öffnet die Datenbank. Die Antwort lautet immer **parametrisierte Abfragen**, nicht „Anführungszeichen herausfiltern".

---

# Teil 5 – Sicherheitsmanagement, Prävention und Notfälle

## 5.1 IT-Grundschutz und Informationssicherheitsmanagement

Der **IT-Grundschutz** des **BSI** (Bundesamt für Sicherheit in der Informationstechnik) ist eine Methode, mit Standardmaßnahmen ein angemessenes Sicherheitsniveau zu erreichen. Das Vorgehen:
1. **Strukturanalyse:** Geschäftsprozesse, Anwendungen, IT-Systeme, Räume und Netze erfassen
2. **Schutzbedarfsfeststellung:** je Objekt und Schutzziel (Vertraulichkeit, Integrität, Verfügbarkeit) den Schutzbedarf **normal**, **hoch** oder **sehr hoch** bestimmen – anhand der möglichen Schäden (Gesetzesverstöße, finanzielle Folgen, Imageschaden, Beeinträchtigung der Aufgabe)
3. Modellierung: passende **Bausteine** aus dem IT-Grundschutz-Kompendium zuordnen
4. **IT-Grundschutz-Check:** Soll-Ist-Vergleich der Anforderungen
5. Risikoanalyse für Objekte mit hohem oder sehr hohem Schutzbedarf
6. Umsetzung und regelmäßige Überprüfung

**Maximumprinzip:** Ein Server erbt den **höchsten** Schutzbedarf der Anwendungen, die auf ihm laufen. Läuft die Gehaltsabrechnung neben dem Kantinenplan, gilt für den ganzen Server „sehr hoch“.

Ein **ISMS** (Informationssicherheits-Managementsystem) nach **ISO/IEC 27001** organisiert Sicherheit als dauerhaften Prozess mit Verantwortlichen, Richtlinien und PDCA-Kreislauf; ISO 27001 auf Basis von IT-Grundschutz ist die deutsche Zertifizierungsvariante. **Compliance** heißt, Gesetze, Verträge und interne Regeln nachweisbar einzuhalten – das ISMS liefert die Nachweise.

## 5.2 Weitere Bedrohungen

| Bedrohung | Prinzip | Gegenmaßnahme |
|---|---|---|
| **DDoS** (Distributed Denial of Service) | Tausende gekaperte Rechner (Botnetz) überfluten einen Dienst mit Anfragen – Ziel ist die **Verfügbarkeit** | DDoS-Schutzdienst des Providers, Rate Limiting, Lastverteilung, Notfallplan |
| **Schadsoftware** | Virus (hängt sich an Dateien), Wurm (verbreitet sich selbst im Netz), Trojaner (getarnt als nützliches Programm) | Virenschutz, Patchmanagement, keine Administratorrechte im Alltag |
| **Zero-Day-Exploit** | Angriff über eine Lücke, für die es noch kein Update gibt | Segmentierung, Least Privilege, Überwachung auf Auffälligkeiten |
| **Datendiebstahl durch Innentäter** | Berechtigte kopieren Daten unbefugt | Need-to-know, Protokollierung, Data Loss Prevention, Sperre für USB-Speicher |

## 5.3 Präventive Maßnahmen

- Technisch: Firewall, Netzsegmentierung (Produktions- und Büronetz trennen), **Patchmanagement**, Virenschutz, **Härtung** (unnötige Dienste und Konten abschalten), Verschlüsselung, **VPN** – ein verschlüsselter **Tunnel** durch das Internet, z. B. für mobiles Arbeiten oder die Anbindung von Filialen.
- Organisatorisch: Sicherheitsrichtlinie, Schulung und Sensibilisierung, Rechtevergabe und regelmäßige Rechteprüfung, Vier-Augen-Prinzip.
- **Security by Design:** Sicherheit von Anfang an in den Entwurf einbauen statt nachträglich ergänzen – das Gegenstück zu Privacy by Design aus Art. 25 DSGVO.
- **Penetrationstest:** ein **beauftragter**, simulierter Angriff, um Schwachstellen zu finden, bevor es Angreifer tun – als Black-Box-Test (ohne Vorwissen, wie ein externer Angreifer) oder White-Box-Test (mit Zugang zu Dokumentation und Code). Ein **Schwachstellenscan** prüft dagegen automatisiert auf bekannte Lücken. Ohne **schriftliche Beauftragung** ist ein Pentest eine Straftat (§ 202a ff. StGB).

## 5.4 Incident- und Notfallmanagement

**Sicherheitsvorfall (Incident)** – der Ablauf:
1. Erkennen und melden (Monitoring, Hinweis von Beschäftigten – eine Meldestelle muss bekannt sein)
2. Bewerten und priorisieren
3. Eindämmen (betroffene Systeme vom Netz trennen, Konten sperren)
4. Beseitigen und wiederherstellen
5. Nachbereiten: Ursache klären, Lessons Learned, Maßnahmen anpassen

Sind personenbezogene Daten betroffen, läuft parallel die **72-Stunden-Meldefrist** an die Aufsichtsbehörde (Art. 33 DSGVO).

**Notfallmanagement (Business Continuity Management)** sorgt dafür, dass kritische Geschäftsprozesse auch bei schweren Ausfällen weiterlaufen oder schnell wieder anlaufen:
- **Business-Impact-Analyse:** Welche Prozesse sind kritisch, wie lange darf ein Ausfall dauern? Daraus folgen **RTO** und **RPO** (Teil 4.4).
- **Notfallhandbuch** mit Alarmierungsketten, Zuständigkeiten, Ersatzlösungen und **Wiederanlaufplänen**
- **Disaster Recovery:** Wiederherstellung der IT nach einer Katastrophe (Brand, Hochwasser) – Ausweichrechenzentrum, Rücksicherung, Reihenfolge des Wiederanlaufs
- Notfallübungen: Ein Plan, der nie geübt wurde, funktioniert im Ernstfall selten. Auch die Rücksicherung eines Backups muss regelmäßig getestet werden.

> ❓ **Prüferfrage:** Ein Dashboard-Server enthält nur öffentliche Produktdaten, auf ihm läuft aber auch die Auswertung der Gehaltsdaten. Welchen Schutzbedarf hat der Server?
> *Nach dem Maximumprinzip übernimmt der Server den höchsten Schutzbedarf der auf ihm verarbeiteten Daten – hier also mindestens „hoch“, bei Gehaltsdaten in der Regel „sehr hoch“ für die Vertraulichkeit. Besser ist es, die Anwendungen zu trennen, damit nicht der gesamte Server mit dem höchsten Aufwand geschützt werden muss.*

---

## Die 8 häufigsten Fehler aus Prüfersicht

1. Einwilligung als einzige Rechtsgrundlage genannt – es gibt sechs.
2. Pseudonymisierung mit Anonymisierung gleichgesetzt.
3. Löschpflicht bejaht, ohne die gesetzlichen Aufbewahrungsfristen zu prüfen.
4. Meldefrist bei Datenpannen falsch angegeben (sie beträgt 72 Stunden).
5. Betriebsrat bei Auswertungen mit Personenbezug nicht erwähnt.
6. Hashing als Verschlüsselung bezeichnet.
7. Behauptet, RAID ersetze ein Backup.
8. Differenzielle und inkrementelle Sicherung vertauscht.

---

# Übungsklausur Datenschutz & IT-Sicherheit (100 Punkte, 90 Minuten)

Bearbeite die Klausur **am Ende des Themas** am Stück, handschriftlich.

## Ausgangslage

Die Möbelhaus Nordholz GmbH (140 Beschäftigte) führt ein neues Analysesystem ein. Es wertet Kundendaten, Bestellhistorien und Reklamationen aus. Die Auswertung erfolgt in der Cloud eines externen Dienstleisters. Zusätzlich sollen Bearbeitungszeiten je Mitarbeiter ausgewertet werden.

## Block A – Grundlagen und Grundsätze (24 P)

**A1 (6 P):** *Definieren* Sie „personenbezogene Daten" und *entscheiden* Sie begründet für je zwei Beispiele: Kundennummer, Firmenname „Huber GmbH", IP-Adresse, Durchschnittsumsatz aller Kunden.

**A2 (10 P):** *Nennen* Sie fünf Grundsätze nach Art. 5 DSGVO und *erläutern* Sie jeden in einem Satz.

**A3 (8 P):** *Nennen* Sie vier Rechtsgrundlagen nach Art. 6 DSGVO und *ordnen* Sie jeder eine passende Verarbeitung aus der Ausgangslage oder dem Möbelhausbetrieb zu.

## Block B – Betroffenenrechte und Pflichten (26 P)

**B1 (8 P):** *Nennen* Sie vier Betroffenenrechte mit Artikel und *erläutern* Sie deren Inhalt.

**B2 (8 P):** Ein Kunde verlangt die vollständige Löschung aller seiner Daten. Er hat vor drei Jahren eine Küche gekauft und ist für den Newsletter angemeldet. *Beurteilen* Sie den Anspruch differenziert und *beschreiben* Sie das korrekte Vorgehen.

**B3 (6 P):** Die Auswertung läuft beim externen Cloud-Anbieter. *Erläutern* Sie, welche Rolle dieser einnimmt, welche vertragliche Grundlage erforderlich ist und wer gegenüber den Betroffenen verantwortlich bleibt.

**B4 (4 P):** Durch eine Fehlkonfiguration waren 8.000 Kundendatensätze zwei Tage lang im Internet abrufbar. *Beschreiben* Sie die Pflichten des Unternehmens mit Fristen.

## Block C – Anonymisierung und Mitarbeiterauswertung (16 P)

**C1 (6 P):** *Grenzen* Sie Anonymisierung und Pseudonymisierung *ab*. *Geben* Sie an, welche Variante weiterhin der DSGVO unterliegt, und *begründen* Sie.

**C2 (10 P):** Die Bearbeitungszeiten sollen je Mitarbeiter ausgewertet werden. *Erläutern* Sie zwei rechtliche Anforderungen (mit Rechtsgrundlage) und *nennen* Sie drei Maßnahmen, mit denen die Auswertung dennoch zulässig durchgeführt werden kann.

## Block D – IT-Sicherheit (22 P)

**D1 (6 P):** *Nennen* Sie die drei klassischen Schutzziele und *ordnen* Sie jedem eine konkrete Maßnahme für das Analysesystem zu.

**D2 (6 P):** *Grenzen* Sie symmetrische und asymmetrische Verschlüsselung *ab* und *erläutern* Sie, warum in der Praxis hybride Verfahren eingesetzt werden. *Erklären* Sie zusätzlich, warum Hashing keine Verschlüsselung ist.

**D3 (6 P):** *Beschreiben* Sie ein rollenbasiertes Berechtigungskonzept für das Analysesystem mit drei Rollen und *erläutern* Sie die Prinzipien „Least Privilege" und „Need-to-know".

**D4 (4 P):** Eine Auswertung soll Kundendaten über ein Eingabefeld filtern. *Erläutern* Sie die Gefahr einer SQL-Injection und die wirksamste Gegenmaßnahme.

## Block E – Datensicherung (12 P)

Das Unternehmen sichert sonntags vollständig (800 GB) und montags bis samstags täglich. Das tägliche Änderungsvolumen beträgt 40 GB.

**E1 (6 P):** *Berechnen* Sie für beide Verfahren – inkrementell und differenziell – das gesamte Sicherungsvolumen bis einschließlich Mittwoch sowie die Anzahl der zur Wiederherstellung benötigten Medien bei einem Ausfall am Donnerstagmorgen.

**E2 (3 P):** *Beurteilen* Sie, welches Verfahren Sie empfehlen, wenn eine schnelle Wiederherstellung im Vordergrund steht.

**E3 (3 P):** Die Sicherung läuft täglich um 23:00 Uhr. Der Ausfall tritt um 14:00 Uhr ein. *Bestimmen* Sie den maximalen Datenverlust und *beurteilen* Sie, ob eine RPO-Vorgabe von vier Stunden eingehalten wird. *Nennen* Sie gegebenenfalls eine Maßnahme.

---

## Fachgespräch: typische Fragen des Ausschusses

1. „Welche personenbezogenen Daten haben Sie in Ihrem Projekt verarbeitet, und auf welcher Rechtsgrundlage?"
2. „Wie haben Sie den Grundsatz der Datenminimierung konkret umgesetzt?"
3. „Wer war in Ihr Projekt einzubinden – Datenschutzbeauftragter, Betriebsrat, Fachbereich?"
4. „Wie sind die Daten in Ihrem Projekt geschützt – im Transport und im Ruhezustand?"
5. „Was passiert mit Ihren Analysedaten, wenn das Projekt beendet ist?" (Erwartet: Löschkonzept, Speicherbegrenzung.)
6. „Angenommen, ein Kunde verlangt Auskunft über die von Ihnen verarbeiteten Daten – könnten Sie diese liefern?"

---

## Lernziel-Check (am Ende des Themas alles mit Ja beantworten)

- [ ] Ich definiere personenbezogene Daten und erkenne den Personenbezug auch bei IDs und IP-Adressen.
- [ ] Ich nenne fünf Grundsätze nach Art. 5 und vier Rechtsgrundlagen nach Art. 6 mit Beispielen.
- [ ] Ich kenne die Betroffenenrechte mit Artikeln und die Monatsfrist.
- [ ] Ich löse den Konflikt zwischen Löschanspruch und Aufbewahrungspflicht korrekt.
- [ ] Ich erkläre AVV, Verzeichnis von Verarbeitungstätigkeiten, DSFA und die 72-Stunden-Meldefrist.
- [ ] Ich grenze Anonymisierung und Pseudonymisierung sicher ab.
- [ ] Ich nenne bei Mitarbeiterauswertungen von selbst § 87 Abs. 1 Nr. 6 BetrVG.
- [ ] Ich erkläre die Schutzziele, Verschlüsselungsarten, Hashing und RBAC.
- [ ] Ich unterscheide differenzielle und inkrementelle Sicherung und kenne RTO/RPO und die 3-2-1-Regel.
- [ ] Übungsklausur mit ≥ 92 Punkten bestanden.
- [ ] Ich beschreibe das Vorgehen nach IT-Grundschutz, die Schutzbedarfskategorien und das Maximumprinzip.
- [ ] Ich nenne DDoS, Schadsoftwarearten und präventive Maßnahmen und grenze Penetrationstest und Schwachstellenscan ab.
- [ ] Ich beschreibe den Ablauf bei einem Sicherheitsvorfall und die Bausteine des Notfallmanagements.
