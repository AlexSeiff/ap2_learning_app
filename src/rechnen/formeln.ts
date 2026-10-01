// Formelsammlung (ROADMAP 4.5): eine Quelle für die Seite /material/formeln und die Rechenwege der Rechenvorlagen.
// Rein, ohne React. Jede Formel nennt die Vorlagen (src/rechnen/vorlagen/*), deren Übungen sie üben; die Vorlagen
// verwenden `F.<id>.latex` in ihren Rechenwegen, wo die allgemeine Formel genau so im Schritt steht.
// Neue Vorlage → hier mindestens eine Formel mit ihrer ID in `vorlagen` eintragen (Test: tests/formeln.test.ts).

const L = String.raw;

export interface Variable {
  /** Symbol in LaTeX, z. B. `\bar{x}`. */
  symbol: string;
  bedeutung: string;
}

export interface FormelDef {
  name: string;
  /** Deep-Dive-ID des Themas („03“ = Deep Dive 3), danach wird gruppiert. */
  thema: string;
  /** Allgemeine Formel in LaTeX (KaTeX), deutsches Dezimalkomma als `{,}`. */
  latex: string;
  /** Kurze Erklärung (ein, zwei Sätze, Markdown-frei). */
  erklaerung: string;
  variablen: Variable[];
  /** IDs der Rechenvorlagen, deren Übungen diese Formel üben (Link zu /rechnen?vorlage=…). */
  vorlagen: string[];
}

export interface Formel extends FormelDef {
  id: string;
}

const v = (symbol: string, bedeutung: string): Variable => ({ symbol, bedeutung });

/** Alle Formeln nach ID, in der Reihenfolge der Lernblätter. */
export const F = {
  // ---------- Statistik I (DD3) ----------
  mittel: {
    name: 'Arithmetisches Mittel',
    thema: '03',
    latex: L`\bar{x} = \frac{\sum x_i}{n}`,
    erklaerung: 'Summe aller Werte geteilt durch ihre Anzahl. Nutzt alle Werte, ist aber empfindlich gegenüber Ausreißern.',
    variablen: [v(L`x_i`, 'einzelne Werte'), v(L`n`, 'Anzahl der Werte')],
    vorlagen: ['lagemasse', 'varianz'],
  },
  medianUngerade: {
    name: 'Median (n ungerade)',
    thema: '03',
    latex: L`\tilde{x} = x_{\left(\frac{n+1}{2}\right)}`,
    erklaerung: 'Mittlerer Wert der sortierten Reihe. Robust gegenüber Ausreißern – vorher immer sortieren.',
    variablen: [v(L`x_{(k)}`, 'k-ter Wert der aufsteigend sortierten Reihe')],
    vorlagen: ['lagemasse'],
  },
  medianGerade: {
    name: 'Median (n gerade)',
    thema: '03',
    latex: L`\tilde{x} = \frac{x_{(n/2)} + x_{(n/2+1)}}{2}`,
    erklaerung: 'Bei gerader Anzahl das Mittel der beiden mittleren Werte der sortierten Reihe.',
    variablen: [v(L`x_{(k)}`, 'k-ter Wert der aufsteigend sortierten Reihe')],
    vorlagen: ['lagemasse'],
  },
  spannweite: {
    name: 'Spannweite',
    thema: '03',
    latex: L`R = x_{\max} - x_{\min}`,
    erklaerung: 'Abstand zwischen größtem und kleinstem Wert. Hängt nur von zwei Werten ab und ist daher sehr ausreißeranfällig.',
    variablen: [v(L`x_{\max},\ x_{\min}`, 'größter und kleinster Wert')],
    vorlagen: ['lagemasse'],
  },
  gewichtetesMittel: {
    name: 'Gewichtetes arithmetisches Mittel',
    thema: '03',
    latex: L`\bar{x} = \frac{\sum (n_i \cdot x_i)}{\sum n_i}`,
    erklaerung: 'Jeder Wert zählt so oft, wie er vorkommt (oder mit seinem Gewicht). Der ungewichtete Mittelwert der Gruppen ist falsch.',
    variablen: [v(L`x_i`, 'Wert der Gruppe i'), v(L`n_i`, 'Anzahl bzw. Gewicht der Gruppe i')],
    vorlagen: ['gewichtetes-mittel'],
  },
  quartilPosition: {
    name: 'Position eines Quartils',
    thema: '03',
    latex: L`\text{Position} = n \cdot p`,
    erklaerung:
      'Konvention der Lernblätter: keine ganze Zahl → aufrunden und den Wert an dieser Position nehmen; ganze Zahl → Mittel aus diesem und dem nächsten Wert. Die Konvention in der Klausur dazuschreiben.',
    variablen: [v(L`p`, '0,25 für Q₁, 0,75 für Q₃'), v(L`n`, 'Anzahl der Werte')],
    vorlagen: ['quartile'],
  },
  iqr: {
    name: 'Interquartilsabstand',
    thema: '03',
    latex: L`\text{IQR} = Q_3 - Q_1`,
    erklaerung: 'Breite der mittleren 50 % der Werte (Boxbreite im Boxplot). Robust, weil die Extremwerte nicht eingehen.',
    variablen: [v(L`Q_1,\ Q_3`, 'unteres und oberes Quartil')],
    vorlagen: ['quartile'],
  },
  zaunUnten: {
    name: 'Unterer Zaun (1,5-IQR-Regel)',
    thema: '03',
    latex: L`Z_u = Q_1 - 1{,}5 \cdot \text{IQR}`,
    erklaerung: 'Werte unterhalb gelten als Ausreißerverdacht. Ein negativer Zaun heißt nur: nach unten gibt es keine Ausreißer.',
    variablen: [v(L`Q_1`, 'unteres Quartil'), v(L`\text{IQR}`, 'Interquartilsabstand')],
    vorlagen: ['quartile'],
  },
  zaunOben: {
    name: 'Oberer Zaun (1,5-IQR-Regel)',
    thema: '03',
    latex: L`Z_o = Q_3 + 1{,}5 \cdot \text{IQR}`,
    erklaerung: 'Werte oberhalb gelten als Ausreißerverdacht. Der Whisker endet beim größten Wert innerhalb des Zauns, nicht am Zaun.',
    variablen: [v(L`Q_3`, 'oberes Quartil'), v(L`\text{IQR}`, 'Interquartilsabstand')],
    vorlagen: ['quartile'],
  },
  saq: {
    name: 'Summe der Abweichungsquadrate',
    thema: '03',
    latex: L`\text{SAQ} = \sum (x_i - \bar{x})^2`,
    erklaerung: 'Zwischenschritt für die Varianz. Probe: Die einfachen Abweichungen summieren sich immer zu 0.',
    variablen: [v(L`x_i`, 'einzelne Werte'), v(L`\bar{x}`, 'arithmetisches Mittel')],
    vorlagen: ['varianz'],
  },
  varianzGrundgesamtheit: {
    name: 'Varianz (Grundgesamtheit)',
    thema: '03',
    latex: L`\sigma^2 = \frac{\text{SAQ}}{n}`,
    erklaerung: 'Liegen alle Daten vor (Grundgesamtheit), wird durch n geteilt.',
    variablen: [v(L`\text{SAQ}`, 'Summe der Abweichungsquadrate'), v(L`n`, 'Anzahl der Werte')],
    vorlagen: ['varianz'],
  },
  varianzStichprobe: {
    name: 'Varianz (Stichprobe)',
    thema: '03',
    latex: L`s^2 = \frac{\text{SAQ}}{n - 1}`,
    erklaerung: 'Schließt eine Stichprobe auf die Grundgesamtheit, wird durch n − 1 geteilt. Immer dazuschreiben, welche Variante gilt.',
    variablen: [v(L`\text{SAQ}`, 'Summe der Abweichungsquadrate'), v(L`n`, 'Stichprobenumfang')],
    vorlagen: ['varianz'],
  },
  standardabweichung: {
    name: 'Standardabweichung',
    thema: '03',
    latex: L`\sigma = \sqrt{\sigma^2} \quad\text{bzw.}\quad s = \sqrt{s^2}`,
    erklaerung: 'Wurzel der Varianz – in derselben Einheit wie die Daten und damit direkt interpretierbar.',
    variablen: [v(L`\sigma^2,\ s^2`, 'Varianz der Grundgesamtheit bzw. der Stichprobe')],
    vorlagen: ['varianz', 'variationskoeffizient'],
  },
  variationskoeffizient: {
    name: 'Variationskoeffizient',
    thema: '03',
    latex: L`\text{VK} = \frac{\sigma}{\bar{x}} \cdot 100\,\%`,
    erklaerung: 'Streuung relativ zum Niveau. Macht Datensätze mit unterschiedlichem Mittelwert vergleichbar (kleiner = gleichmäßiger).',
    variablen: [v(L`\sigma`, 'Standardabweichung'), v(L`\bar{x}`, 'arithmetisches Mittel')],
    vorlagen: ['variationskoeffizient'],
  },
  haeufigkeiten: {
    name: 'Relative und kumulierte Häufigkeit',
    thema: '03',
    latex: L`f_i = \frac{h_i}{n} \cdot 100\,\%,\quad F_i = F_{i-1} + f_i`,
    erklaerung: 'Anteil jeder Kategorie und die laufende Summe. Für Pareto absteigend sortieren; die Anteile ergeben zusammen 100 %.',
    variablen: [v(L`h_i`, 'absolute Häufigkeit'), v(L`n`, 'Summe aller Häufigkeiten'), v(L`F_i`, 'kumulierter Anteil bis Kategorie i')],
    vorlagen: ['haeufigkeiten'],
  },

  // ---------- Statistik II (DD4) ----------
  sxy: {
    name: 'Summe der Abweichungsprodukte',
    thema: '04',
    latex: L`S_{xy} = \sum (x_i - \bar{x})(y_i - \bar{y})`,
    erklaerung: 'Zähler von Korrelation und Steigung. Das Vorzeichen zeigt die Richtung des Zusammenhangs.',
    variablen: [v(L`\bar{x},\ \bar{y}`, 'Mittelwerte von x und y')],
    vorlagen: ['korrelation', 'regression'],
  },
  sxx: {
    name: 'Abweichungsquadrate von x',
    thema: '04',
    latex: L`S_{xx} = \sum (x_i - \bar{x})^2`,
    erklaerung: 'Streuung der x-Werte; Nenner der Steigung b.',
    variablen: [v(L`\bar{x}`, 'Mittelwert von x')],
    vorlagen: ['korrelation', 'regression'],
  },
  syy: {
    name: 'Abweichungsquadrate von y',
    thema: '04',
    latex: L`S_{yy} = \sum (y_i - \bar{y})^2`,
    erklaerung: 'Streuung der y-Werte; geht in den Korrelationskoeffizienten ein.',
    variablen: [v(L`\bar{y}`, 'Mittelwert von y')],
    vorlagen: ['korrelation'],
  },
  pearson: {
    name: 'Korrelationskoeffizient nach Pearson',
    thema: '04',
    latex: L`r = \frac{S_{xy}}{\sqrt{S_{xx} \cdot S_{yy}}}`,
    erklaerung: 'Stärke und Richtung eines linearen Zusammenhangs zwischen −1 und +1. Korrelation ist keine Kausalität.',
    variablen: [v(L`S_{xy},\ S_{xx},\ S_{yy}`, 'Abweichungsprodukt- und Quadratsummen')],
    vorlagen: ['korrelation'],
  },
  bestimmtheitsmass: {
    name: 'Bestimmtheitsmaß (einfache Regression)',
    thema: '04',
    latex: L`R^2 = r^2`,
    erklaerung: 'Anteil der Streuung von y, den das lineare Modell erklärt (zwischen 0 und 1).',
    variablen: [v(L`r`, 'Korrelationskoeffizient')],
    vorlagen: ['korrelation', 'regression'],
  },
  steigung: {
    name: 'Steigung der Regressionsgeraden',
    thema: '04',
    latex: L`b = \frac{S_{xy}}{S_{xx}}`,
    erklaerung: 'Um so viel ändert sich ŷ, wenn x um eine Einheit steigt – die inhaltlich wichtigste Zahl.',
    variablen: [v(L`S_{xy},\ S_{xx}`, 'Abweichungsprodukt- und Quadratsumme')],
    vorlagen: ['regression'],
  },
  achsenabschnitt: {
    name: 'Achsenabschnitt',
    thema: '04',
    latex: L`a = \bar{y} - b \cdot \bar{x}`,
    erklaerung: 'Rechnerischer y-Wert bei x = 0; nur deuten, wenn x = 0 im beobachteten Bereich liegt. Probe: x̄ einsetzen ergibt ȳ.',
    variablen: [v(L`\bar{x},\ \bar{y}`, 'Mittelwerte'), v(L`b`, 'Steigung')],
    vorlagen: ['regression'],
  },
  regressionsgerade: {
    name: 'Regressionsgerade (Prognose)',
    thema: '04',
    latex: L`\hat{y} = a + b \cdot x`,
    erklaerung: 'Geschätzter Wert zu x. Prognosen außerhalb des beobachteten x-Bereichs sind Extrapolation – Vorbehalt dazuschreiben.',
    variablen: [v(L`\hat{y}`, 'geschätzter Wert („y Dach“)'), v(L`a,\ b`, 'Achsenabschnitt und Steigung')],
    vorlagen: ['regression'],
  },
  residuum: {
    name: 'Residuum',
    thema: '04',
    latex: L`e_i = y_i - \hat{y}_i`,
    erklaerung: 'Abweichung zwischen beobachtetem und geschätztem Wert. Gutes Modell: zufällige Streuung um null, kein Muster.',
    variablen: [v(L`y_i`, 'beobachteter Wert'), v(L`\hat{y}_i`, 'geschätzter Wert')],
    vorlagen: ['regression', 'regressionsguete'],
  },
  gleitenderDurchschnitt: {
    name: 'Gleitender Durchschnitt',
    thema: '04',
    latex: L`\bar{x}_t = \frac{x_t + x_{t+1} + \dots + x_{t+k-1}}{k}`,
    erklaerung: 'Mittel über k aufeinanderfolgende Perioden; glättet Zufallsschwankungen und macht den Trend sichtbar.',
    variablen: [v(L`k`, 'Anzahl Perioden im Fenster'), v(L`x_t`, 'Wert der Periode t')],
    vorlagen: ['gleitender-durchschnitt'],
  },
  prozentVeraenderung: {
    name: 'Prozentuale Veränderung',
    thema: '04',
    latex: L`\frac{x_{neu} - x_{alt}}{x_{alt}} \cdot 100\,\%`,
    erklaerung: 'Veränderung bezogen auf den Ausgangswert. Bei Quoten von Prozentpunkten (Differenz) unterscheiden.',
    variablen: [v(L`x_{alt},\ x_{neu}`, 'Ausgangs- und neuer Wert')],
    vorlagen: ['prozent-veraenderung'],
  },
  differenz: {
    name: 'Absolute Veränderung (Prozentpunkte)',
    thema: '04',
    latex: L`\Delta = x_{neu} - x_{alt}`,
    erklaerung: 'Differenz zweier Werte; bei Prozentwerten in Prozentpunkten („+2 Prozentpunkte“, nicht „+2 %“).',
    variablen: [v(L`x_{alt},\ x_{neu}`, 'Ausgangs- und neuer Wert')],
    vorlagen: ['prozent-veraenderung'],
  },

  // ---------- Prozessanalyse (DD5) ----------
  durchlaufzeit: {
    name: 'Durchlaufzeit',
    thema: '05',
    latex: L`\text{DLZ} = t_{\text{Bearbeitung}} + t_{\text{Liege}}`,
    erklaerung: 'Gesamtzeit vom Prozessstart bis zum Ende (ggf. plus Transport- und Rüstzeit).',
    variablen: [v(L`t_{\text{Bearbeitung}}`, 'Summe der Bearbeitungszeiten'), v(L`t_{\text{Liege}}`, 'Summe der Liegezeiten')],
    vorlagen: ['durchlaufzeit'],
  },
  wertschoepfung: {
    name: 'Wertschöpfungsanteil (Flussgrad)',
    thema: '05',
    latex: L`\text{Wertschöpfungsanteil} = \frac{t_{\text{Bearbeitung}}}{\text{DLZ}} \cdot 100\,\%`,
    erklaerung: 'Anteil echter Bearbeitung an der Durchlaufzeit – oft unter 10 %. Der Hebel liegt bei den Liegezeiten.',
    variablen: [v(L`t_{\text{Bearbeitung}}`, 'Bearbeitungszeit'), v(L`\text{DLZ}`, 'Durchlaufzeit')],
    vorlagen: ['durchlaufzeit'],
  },
  fehlerquote: {
    name: 'Fehlerquote',
    thema: '05',
    latex: L`\text{Fehlerquote} = \frac{\text{fehlerhaft}}{\text{gesamt}} \cdot 100\,\%`,
    erklaerung: 'Anteil fehlerhafter Fälle an allen Fällen.',
    variablen: [v(L`\text{fehlerhaft}`, 'Fälle mit Fehler bzw. Nacharbeit'), v(L`\text{gesamt}`, 'alle Fälle')],
    vorlagen: ['fehlerquote'],
  },
  fpy: {
    name: 'First Pass Yield',
    thema: '05',
    latex: L`\text{FPY} = \frac{\text{gesamt} - \text{fehlerhaft}}{\text{gesamt}} \cdot 100\,\%`,
    erklaerung: 'Anteil der Fälle, die im ersten Durchlauf ohne Nacharbeit fertig werden (100 % − Fehlerquote).',
    variablen: [v(L`\text{fehlerhaft}`, 'Fälle mit Nacharbeit'), v(L`\text{gesamt}`, 'alle Fälle')],
    vorlagen: ['fehlerquote'],
  },
  nacharbeitskosten: {
    name: 'Nacharbeitskosten',
    thema: '05',
    latex: L`K_{\text{Nacharbeit}} = \text{fehlerhafte Fälle} \cdot t_{\text{je Fall}} \cdot \text{Kostensatz}`,
    erklaerung: 'Kosten schlechter Qualität. Als Zuschlag je Auftrag auf alle Aufträge umlegen, nicht nur auf die fehlerhaften.',
    variablen: [v(L`t_{\text{je Fall}}`, 'Nacharbeitszeit je Fall (h)'), v(L`\text{Kostensatz}`, '€ je Stunde')],
    vorlagen: ['fehlerquote'],
  },
  amortisation: {
    name: 'Amortisationszeit',
    thema: '05',
    latex: L`\text{Amortisationszeit} = \frac{\text{Investition}}{\text{jährliche Einsparung}}`,
    erklaerung:
      'Nach so vielen Jahren hat sich die Investition bezahlt gemacht. Mit der Nutzungsdauer vergleichen und qualitativ ergänzen.',
    variablen: [v(L`\text{jährliche Einsparung}`, 'eingesparte Stunden · Kostensatz (bzw. jährlicher Rückfluss)')],
    vorlagen: ['amortisation'],
  },

  // ---------- CRISP-DM / Machine Learning (DD6) ----------
  euklid: {
    name: 'Euklidischer Abstand',
    thema: '06',
    latex: L`d = \sqrt{(x - x_Z)^2 + (y - y_Z)^2}`,
    erklaerung: 'Abstand eines Punkts zu einem Zentrum (k-Means). Zum reinen Vergleichen darf die Wurzel weggelassen werden.',
    variablen: [v(L`(x \mid y)`, 'Datenpunkt'), v(L`(x_Z \mid y_Z)`, 'Clusterzentrum')],
    vorlagen: ['kmeans'],
  },
  zentrum: {
    name: 'Neues Clusterzentrum',
    thema: '06',
    latex: L`Z_j = \left(\frac{\sum x}{n_j} \,\middle|\, \frac{\sum y}{n_j}\right)`,
    erklaerung: 'Mittelwert (nicht Median) aller Punkte, die dem Cluster j zugeordnet sind.',
    variablen: [v(L`n_j`, 'Anzahl Punkte im Cluster j')],
    vorlagen: ['kmeans'],
  },
  support: {
    name: 'Support',
    thema: '06',
    latex: L`\text{Support}(X \rightarrow Y) = \frac{\text{Anzahl mit } X \text{ und } Y}{n}`,
    erklaerung: 'Wie häufig die Regel überhaupt vorkommt (Anteil aller Transaktionen).',
    variablen: [v(L`n`, 'Anzahl aller Transaktionen')],
    vorlagen: ['assoziation'],
  },
  konfidenz: {
    name: 'Konfidenz',
    thema: '06',
    latex: L`\text{Konfidenz}(X \rightarrow Y) = \frac{\text{Support}(X \cup Y)}{\text{Support}(X)}`,
    erklaerung: 'Wie zuverlässig Y folgt, wenn X vorliegt. Richtungsabhängig – durch den Support des Wenn-Teils teilen.',
    variablen: [v(L`X \cup Y`, 'Transaktionen mit X und Y')],
    vorlagen: ['assoziation'],
  },
  lift: {
    name: 'Lift',
    thema: '06',
    latex: L`\text{Lift}(X \rightarrow Y) = \frac{\text{Konfidenz}(X \rightarrow Y)}{\text{Support}(Y)}`,
    erklaerung: 'Wie viel besser als der Zufall: > 1 positiver, < 1 negativer Zusammenhang. Symmetrisch.',
    variablen: [v(L`\text{Support}(Y)`, 'Anteil der Transaktionen mit Y')],
    vorlagen: ['assoziation'],
  },

  // ---------- Modellgüte (DD7) ----------
  accuracy: {
    name: 'Accuracy',
    thema: '07',
    latex: L`\text{Accuracy} = \frac{TP + TN}{n}`,
    erklaerung: 'Anteil aller richtig eingeordneten Fälle. Bei unausgeglichenen Klassen irreführend (Accuracy-Paradox).',
    variablen: [v(L`TP,\ TN`, 'richtig positiv, richtig negativ'), v(L`n`, 'alle Fälle')],
    vorlagen: ['konfusionsmatrix'],
  },
  precision: {
    name: 'Precision',
    thema: '07',
    latex: L`\text{Precision} = \frac{TP}{TP + FP}`,
    erklaerung: 'Wie viele der als positiv vorhergesagten Fälle wirklich positiv sind (Spalte der positiven Vorhersagen).',
    variablen: [v(L`FP`, 'falsch positiv (Fehler 1. Art)')],
    vorlagen: ['konfusionsmatrix'],
  },
  recall: {
    name: 'Recall (Sensitivität)',
    thema: '07',
    latex: L`\text{Recall} = \frac{TP}{TP + FN}`,
    erklaerung: 'Wie viele der tatsächlich positiven Fälle gefunden wurden (Zeile der tatsächlich positiven).',
    variablen: [v(L`FN`, 'falsch negativ (Fehler 2. Art)')],
    vorlagen: ['konfusionsmatrix'],
  },
  f1: {
    name: 'F1-Maß',
    thema: '07',
    latex: L`F_1 = \frac{2 \cdot P \cdot R}{P + R}`,
    erklaerung: 'Harmonisches Mittel aus Precision und Recall – liegt näher am kleineren Wert, nicht (P + R) / 2.',
    variablen: [v(L`P,\ R`, 'Precision und Recall')],
    vorlagen: ['konfusionsmatrix'],
  },
  spezifitaet: {
    name: 'Spezifität',
    thema: '07',
    latex: L`\text{Spezifität} = \frac{TN}{TN + FP}`,
    erklaerung: 'Wie viele der tatsächlich negativen Fälle richtig erkannt wurden.',
    variablen: [v(L`TN,\ FP`, 'richtig negativ, falsch positiv')],
    vorlagen: ['konfusionsmatrix'],
  },
  fehlerkosten: {
    name: 'Fehlerkosten',
    thema: '07',
    latex: L`K = FN \cdot k_{FN} + FP \cdot k_{FP}`,
    erklaerung: 'Bewertet die Fehlerarten mit ihren Kosten; oft ist ein übersehener Fall (FN) teurer als ein Fehlalarm (FP).',
    variablen: [v(L`k_{FN},\ k_{FP}`, 'Kosten je falsch negativem bzw. falsch positivem Fall')],
    vorlagen: ['konfusionsmatrix'],
  },
  mae: {
    name: 'Mittlerer absoluter Fehler (MAE)',
    thema: '07',
    latex: L`\text{MAE} = \frac{\sum |e_i|}{n}`,
    erklaerung: 'Durchschnittlicher Betrag der Fehler, in der Einheit der Zielgröße; robust gegen Ausreißer.',
    variablen: [v(L`e_i`, 'Fehler y − ŷ')],
    vorlagen: ['regressionsguete'],
  },
  mse: {
    name: 'Mittlerer quadratischer Fehler (MSE)',
    thema: '07',
    latex: L`\text{MSE} = \frac{\sum e_i^2}{n}`,
    erklaerung: 'Quadriert die Fehler – große Abweichungen zählen überproportional; Einheit quadriert.',
    variablen: [v(L`e_i`, 'Fehler y − ŷ')],
    vorlagen: ['regressionsguete'],
  },
  rmse: {
    name: 'Wurzel des MSE (RMSE)',
    thema: '07',
    latex: L`\text{RMSE} = \sqrt{\text{MSE}}`,
    erklaerung: 'Wie MSE, aber wieder in der Einheit der Zielgröße. RMSE deutlich über MAE → einzelne große Fehler.',
    variablen: [v(L`\text{MSE}`, 'mittlerer quadratischer Fehler')],
    vorlagen: ['regressionsguete'],
  },
  r2Modell: {
    name: 'Bestimmtheitsmaß (Modellgüte)',
    thema: '07',
    latex: L`R^2 = 1 - \frac{SS_{res}}{SS_{tot}}`,
    erklaerung: 'Vergleich mit dem Mittelwertmodell: 1 = perfekt, 0 = nicht besser als immer den Mittelwert vorherzusagen.',
    variablen: [v(L`SS_{res}`, 'Summe der quadrierten Fehler'), v(L`SS_{tot}`, 'Summe der quadrierten Abweichungen vom Mittelwert')],
    vorlagen: ['regressionsguete'],
  },

  // ---------- Datenqualität (DD9) ----------
  qualitaetsgrad: {
    name: 'Qualitätsgrad (Vollständigkeit, Eindeutigkeit, Gültigkeit)',
    thema: '09',
    latex: L`\text{Qualitätsgrad} = \frac{\text{erfüllt}}{\text{gesamt}} \cdot 100\,\%`,
    erklaerung: 'Anteil der Datensätze bzw. Felder, die die Regel erfüllen. Die Bezugsgröße immer angeben.',
    variablen: [
      v(L`\text{erfüllt}`, 'z. B. gefüllte Felder, eindeutige Kunden, gültige Werte'),
      v(L`\text{gesamt}`, 'geprüfte Datensätze bzw. Felder'),
    ],
    vorlagen: ['qualitaetsgrad'],
  },

  // ---------- Datensicherung (DD10) ----------
  sicherungInkrementell: {
    name: 'Sicherungsvolumen inkrementell',
    thema: '10',
    latex: L`V = V_{voll} + t \cdot \Delta`,
    erklaerung: 'Jede Sicherung enthält nur die Änderungen seit der letzten Sicherung. Wiederherstellung: Voll + alle Inkremente.',
    variablen: [v(L`V_{voll}`, 'Vollsicherung'), v(L`t`, 'Anzahl Tage danach'), v(L`\Delta`, 'Änderungen je Tag')],
    vorlagen: ['datensicherung'],
  },
  sicherungDifferenziell: {
    name: 'Sicherungsvolumen differenziell',
    thema: '10',
    latex: L`V = V_{voll} + (1 + 2 + \dots + t) \cdot \Delta`,
    erklaerung: 'Jede Sicherung enthält alle Änderungen seit der Vollsicherung. Wiederherstellung: Voll + letzte differenzielle.',
    variablen: [v(L`V_{voll}`, 'Vollsicherung'), v(L`t`, 'Anzahl Tage danach'), v(L`\Delta`, 'Änderungen je Tag')],
    vorlagen: ['datensicherung'],
  },
  datenverlust: {
    name: 'Maximaler Datenverlust',
    thema: '10',
    latex: L`\text{Verlust} = t_{\text{Ausfall}} - t_{\text{Sicherung}}`,
    erklaerung: 'Zeit seit der letzten Sicherung (über Mitternacht: 24 h − Sicherungszeit + Ausfallzeit). Muss ≤ RPO sein.',
    variablen: [v(L`t_{\text{Sicherung}}`, 'Uhrzeit der letzten Sicherung'), v(L`t_{\text{Ausfall}}`, 'Uhrzeit des Ausfalls')],
    vorlagen: ['rpo'],
  },

  // ---------- Projektmanagement (DD12) ----------
  vorwaerts: {
    name: 'Netzplan: Vorwärtsrechnung',
    thema: '12',
    latex: L`FAZ = \max(FEZ_{\text{Vorgänger}}),\ FEZ = FAZ + D`,
    erklaerung: 'Projektstart = 0. Am Zusammenlaufpunkt das größte FEZ der Vorgänger; das größte FEZ am Ende ist die Projektdauer.',
    variablen: [v(L`FAZ,\ FEZ`, 'frühester Anfang und frühestes Ende'), v(L`D`, 'Dauer des Vorgangs')],
    vorlagen: ['netzplan'],
  },
  rueckwaerts: {
    name: 'Netzplan: Rückwärtsrechnung',
    thema: '12',
    latex: L`SEZ = \min(SAZ_{\text{Nachf.}}),\ SAZ = SEZ - D`,
    erklaerung: 'Vom Projektende rückwärts; bei mehreren Nachfolgern das kleinste SAZ.',
    variablen: [v(L`SAZ,\ SEZ`, 'spätester Anfang und spätestes Ende'), v(L`D`, 'Dauer des Vorgangs')],
    vorlagen: ['netzplan'],
  },
  gesamtpuffer: {
    name: 'Gesamtpuffer',
    thema: '12',
    latex: L`GP = SAZ - FAZ`,
    erklaerung: 'So weit darf sich der Vorgang verschieben, ohne den Projekttermin zu gefährden. GP = 0 → kritischer Pfad.',
    variablen: [v(L`SAZ,\ FAZ`, 'spätester und frühester Anfang')],
    vorlagen: ['netzplan'],
  },
  freierPuffer: {
    name: 'Freier Puffer',
    thema: '12',
    latex: L`FP = \min(FAZ_{\text{Nachf.}}) - FEZ`,
    erklaerung: 'So weit darf sich der Vorgang verschieben, ohne einen Nachfolger zu verzögern.',
    variablen: [v(L`FAZ_{\text{Nachf.}}`, 'frühester Anfang der Nachfolger'), v(L`FEZ`, 'frühestes Ende')],
    vorlagen: ['netzplan'],
  },
  pert: {
    name: 'Drei-Zeiten-Schätzung (PERT)',
    thema: '12',
    latex: L`t_e = \frac{o + 4 \cdot m + p}{6}`,
    erklaerung: 'Erwartete Dauer aus optimistischer, wahrscheinlichster und pessimistischer Schätzung.',
    variablen: [v(L`o,\ m,\ p`, 'optimistisch, wahrscheinlich, pessimistisch')],
    vorlagen: ['pert'],
  },
  roi: {
    name: 'Return on Investment (ROI)',
    thema: '12',
    latex: L`ROI = \frac{G}{I} \cdot 100\,\%`,
    erklaerung: 'Gewinn über die Nutzungsdauer im Verhältnis zum eingesetzten Kapital; je Jahr: durch die Nutzungsdauer teilen.',
    variablen: [v(L`G`, 'Gewinn = Gesamtersparnis − Investition'), v(L`I`, 'Investition (eingesetztes Kapital)')],
    vorlagen: ['amortisation'],
  },
  deckungsbeitrag: {
    name: 'Deckungsbeitrag je Stück',
    thema: '12',
    latex: L`db = p - k_v`,
    erklaerung: 'Was jedes verkaufte Stück zur Deckung der Fixkosten beiträgt.',
    variablen: [v(L`p`, 'Preis je Stück'), v(L`k_v`, 'variable Kosten je Stück')],
    vorlagen: ['break-even'],
  },
  breakEven: {
    name: 'Break-even-Menge',
    thema: '12',
    latex: L`x_{BE} = \frac{K_{fix}}{db}`,
    erklaerung: 'Ab dieser Menge sind die Fixkosten gedeckt (auf ganze Stück aufrunden).',
    variablen: [v(L`K_{fix}`, 'Fixkosten'), v(L`db`, 'Deckungsbeitrag je Stück')],
    vorlagen: ['break-even'],
  },
  gewinn: {
    name: 'Gewinn',
    thema: '12',
    latex: L`G = db \cdot x - K_{fix}`,
    erklaerung: 'Gewinn bei der Absatzmenge x.',
    variablen: [v(L`x`, 'Absatzmenge'), v(L`db`, 'Deckungsbeitrag je Stück'), v(L`K_{fix}`, 'Fixkosten')],
    vorlagen: ['break-even'],
  },
  nutzwert: {
    name: 'Nutzwert',
    thema: '12',
    latex: L`N = \sum g_i \cdot p_i`,
    erklaerung: 'Gewichtete Punktsumme je Alternative. Knappe Ergebnisse sind wegen subjektiver Gewichte kritisch zu beurteilen.',
    variablen: [v(L`g_i`, 'Gewicht des Kriteriums (Anteil)'), v(L`p_i`, 'Punkte der Alternative')],
    vorlagen: ['nutzwert'],
  },
  risiko: {
    name: 'Risikowert',
    thema: '12',
    latex: L`R = W \cdot S`,
    erklaerung: 'Eintrittswahrscheinlichkeit mal Schadenshöhe (je auf einer Skala); das höchste Produkt zuerst behandeln.',
    variablen: [v(L`W`, 'Eintrittswahrscheinlichkeit'), v(L`S`, 'Schadensausmaß')],
    vorlagen: ['risiko'],
  },

  // ---------- WiSo (DD14) ----------
  svBeitrag: {
    name: 'Sozialversicherungsbeitrag (Arbeitnehmeranteil)',
    thema: '14',
    latex: L`\text{Beitrag} = \text{Brutto} \cdot \text{AN-Satz}`,
    erklaerung: 'Je Zweig (KV, PV, RV, ALV) die Hälfte des Beitragssatzes (KV mit halbem Zusatzbeitrag, PV ggf. mit Kinderlosenzuschlag).',
    variablen: [v(L`\text{AN-Satz}`, 'Arbeitnehmeranteil des Beitragssatzes')],
    vorlagen: ['sozialversicherung'],
  },
  netto: {
    name: 'Nettoentgelt',
    thema: '14',
    latex: L`\text{Netto} = \text{Brutto} - \text{LSt} - \text{Soli} - \text{KiSt} - \text{SV}`,
    erklaerung: 'Brutto minus Steuern und Sozialversicherungsbeiträge des Arbeitnehmers.',
    variablen: [v(L`\text{KiSt}`, 'Kirchensteuer = Lohnsteuer · 8 bzw. 9 %'), v(L`\text{SV}`, 'Summe der SV-Arbeitnehmeranteile')],
    vorlagen: ['sozialversicherung'],
  },
  minijob: {
    name: 'Minijob: Stunden bis zur Verdienstgrenze',
    thema: '14',
    latex: L`h = \left\lfloor \frac{\text{Grenze}}{\text{Stundenlohn}} \right\rfloor`,
    erklaerung: 'Volle Stunden, abgerundet – eine Stunde mehr würde die Grenze überschreiten.',
    variablen: [v(L`h`, 'höchstens mögliche Stunden im Monat')],
    vorlagen: ['minijob'],
  },
  gleichgewicht: {
    name: 'Gleichgewichtspreis',
    thema: '14',
    latex: L`\text{Angebot} = \text{Nachfrage}`,
    erklaerung: 'Preis, bei dem angebotene und nachgefragte Menge übereinstimmen; dort wird die größte Menge umgesetzt.',
    variablen: [],
    vorlagen: ['gleichgewicht'],
  },
  inflation: {
    name: 'Inflationsrate',
    thema: '14',
    latex: L`\frac{VPI_{neu} - VPI_{alt}}{VPI_{alt}} \cdot 100\,\%`,
    erklaerung: 'Prozentuale Veränderung des Verbraucherpreisindex – die Differenz der Indexpunkte ist nicht die Rate.',
    variablen: [v(L`VPI`, 'Verbraucherpreisindex')],
    vorlagen: ['prozent-veraenderung'],
  },
} satisfies Record<string, FormelDef>;

/** Alle Formeln als Liste (Reihenfolge wie oben). */
export const FORMELN: Formel[] = Object.entries(F).map(([id, f]) => ({ id, ...f }));

/** Formeln, deren Übungen eine Vorlage übt. */
export function formelnDerVorlage(vorlageId: string): Formel[] {
  return FORMELN.filter((f) => f.vorlagen.includes(vorlageId));
}

/** Kurzname je Deep Dive, falls das Lernblatt fehlt (Überschrift der Gruppe). */
export const THEMA_NAMEN: Record<string, string> = {
  '03': 'Statistik I',
  '04': 'Statistik II',
  '05': 'Prozessanalyse',
  '06': 'CRISP-DM und Machine Learning',
  '07': 'Modellgüte',
  '09': 'Datenqualität',
  '10': 'Datenschutz und IT-Sicherheit',
  '12': 'Projektmanagement',
  '14': 'WiSo II',
};

/** Formeln nach Thema gruppiert, Themen aufsteigend. */
export function formelnNachThema(formeln: Formel[] = FORMELN): { thema: string; formeln: Formel[] }[] {
  const themen = [...new Set(formeln.map((f) => f.thema))].sort();
  return themen.map((thema) => ({ thema, formeln: formeln.filter((f) => f.thema === thema) }));
}

/** Link zur Liste der Rechenübungen, gefiltert auf die Vorlagen der Formel. */
export function uebungenLink(formel: Pick<Formel, 'vorlagen'>): string {
  return `/rechnen?vorlage=${formel.vorlagen.join(',')}`;
}
