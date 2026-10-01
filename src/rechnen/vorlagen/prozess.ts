// Prozessanalyse (Deep Dive 5) und Wirtschaftlichkeit (Deep Dive 5/12): Durchlaufzeit und Wertschöpfungsanteil,
// Fehlerquote, First Pass Yield, Nacharbeitskosten, Amortisation und ROI.

import { z } from 'zod';
import { fz, intParam, L, LoesungsBau, lz, lzSumme, summe, vorlage } from '../hilfen';
import { F } from '../formeln';

const nichtNeg = z.number().finite().nonnegative();

const dlzSchema = z.object({
  schritte: z
    .array(z.object({ name: z.string().trim().min(1), bearbeitung: nichtNeg, liege: nichtNeg }))
    .min(1)
    .max(15),
  einheit: z.string().trim().min(1).optional(),
});

export const durchlaufzeit = vorlage({
  id: 'durchlaufzeit',
  titel: 'Durchlaufzeit und Wertschöpfungsanteil',
  bereich: 'Prozessanalyse',
  beschreibung: 'Summe der Bearbeitungs- und Liegezeiten, Durchlaufzeit und Anteil der Bearbeitungszeit an der Durchlaufzeit.',
  schema: dlzSchema,
  hinweise: ['Durchlaufzeit = Bearbeitungszeit + Liegezeit.', 'Wertschöpfungsanteil = Bearbeitungszeit / Durchlaufzeit · 100 %.'],
  erzeuge(z, params, vorbild) {
    const namen = vorbild?.schritte.map((s) => s.name) ?? ['Auftrag erfassen', 'Prüfen', 'Bearbeiten', 'Abschließen'];
    const k = intParam(params, 'schritte', namen.length, 1, 15);
    return {
      schritte: Array.from({ length: k }, (_, i) => ({
        name: namen[i] ?? `Schritt ${i + 1}`,
        bearbeitung: z.wahl([0.25, 0.5, 0.75, 1, 1.5]),
        liege: i === k - 1 && vorbild?.schritte[i]?.liege === 0 ? 0 : z.ganz(1, 40) / 2,
      })),
      ...(vorbild?.einheit ? { einheit: vorbild.einheit } : {}),
    };
  },
  platzhalter: (d) => ({ einheit: d.einheit ?? 'h' }),
  tabelle: (d) => ({
    kopf: ['Schritt', 'Bearbeitungszeit', 'anschließende Liegezeit'],
    zeilen: d.schritte.map((s) => [
      s.name,
      `${fz(s.bearbeitung)} ${d.einheit ?? 'h'}`,
      s.liege ? `${fz(s.liege)} ${d.einheit ?? 'h'}` : '–',
    ]),
  }),
  loese(d) {
    const b = new LoesungsBau();
    const e = d.einheit ?? 'h';
    const bz = b.wert('bearbeitung', summe(d.schritte.map((s) => s.bearbeitung)), {
      label: 'Bearbeitungszeit gesamt',
      einheit: e,
      runden: 2,
    });
    const lz_ = b.wert('liegezeit', summe(d.schritte.map((s) => s.liege)), { label: 'Liegezeit gesamt', einheit: e, runden: 2 });
    const dz = b.wert('durchlaufzeit', bz + lz_, { label: 'Durchlaufzeit', einheit: e, runden: 2 });
    const ws = b.wert('wertschoepfung', (bz / dz) * 100, { label: 'Wertschöpfungsanteil', einheit: '%', runden: 2 });
    b.schritt({
      titel: 'Bearbeitungszeit',
      formel: L`\sum t_{Bearbeitung}`,
      einsetzen: lzSumme(d.schritte.map((s) => s.bearbeitung)),
      ergebnis: bz,
      einheit: e,
      runden: 2,
    });
    b.schritt({
      titel: 'Liegezeit',
      formel: L`\sum t_{Liege}`,
      einsetzen: lzSumme(d.schritte.map((s) => s.liege).filter((x) => x > 0)),
      ergebnis: lz_,
      einheit: e,
      runden: 2,
    });
    b.schritt({
      titel: 'Durchlaufzeit',
      formel: F.durchlaufzeit.latex,
      einsetzen: L`${lz(bz)} + ${lz(lz_)}`,
      ergebnis: dz,
      einheit: e,
      runden: 2,
    });
    b.schritt({
      titel: 'Wertschöpfungsanteil',
      formel: F.wertschoepfung.latex,
      einsetzen: L`\frac{${lz(bz)}}{${lz(dz)}} \cdot 100\,\%`,
      ergebnis: ws,
      einheit: '%',
      runden: 2,
      hinweis: 'Ein kleiner Anteil heißt: Der Auftrag liegt meistens – der wirksamste Hebel sind die Liegezeiten.',
    });
    b.fehler('wertschoepfung', (bz / lz_) * 100, 'Du hast durch die Liegezeit geteilt – die Basis ist die **Durchlaufzeit**.');
    b.fehler('wertschoepfung', (lz_ / dz) * 100, 'Das ist der Liegezeit-Anteil – gefragt ist der Anteil der **Bearbeitungszeit**.');
    b.fehler('durchlaufzeit', lz_, 'Die Durchlaufzeit enthält auch die Bearbeitungszeit.');
    b.fehler('durchlaufzeit', bz, 'Die Durchlaufzeit enthält auch die Liegezeiten.');
    return b.fertig();
  },
});

const fqSchema = z
  .object({
    gesamt: z.number().int().positive(),
    fehler: z.number().int().nonnegative(),
    nacharbeitJe: nichtNeg.optional(),
    kostensatz: nichtNeg.optional(),
  })
  .refine((d) => d.fehler <= d.gesamt, { message: 'mehr Fehler als Einheiten' });

export const fehlerquote = vorlage({
  id: 'fehlerquote',
  titel: 'Fehlerquote, First Pass Yield, Nacharbeitskosten',
  bereich: 'Prozessanalyse',
  beschreibung:
    'Fehlerquote und First Pass Yield; mit Nacharbeitszeit je Fall (h) und Kostensatz (€/h) auch Nacharbeitskosten und Zuschlag je Einheit.',
  schema: fqSchema,
  hinweise: [
    'Fehlerquote = fehlerhafte / alle · 100 %.',
    'First Pass Yield = ohne Nacharbeit fertig / alle · 100 % = 100 % − Fehlerquote.',
    'Kosten = Fälle · Stunden je Fall · Kostensatz; Zuschlag = Kosten / **alle** Einheiten.',
  ],
  erzeuge(z, params, vorbild) {
    const gesamt = intParam(params, 'gesamt', z.ganz(5, 25) * 20, 10, 1000000);
    const fehler = Math.max(1, Math.round(gesamt * (0.04 + z.zahl() * 0.16)));
    const mitKosten = vorbild ? vorbild.nacharbeitJe !== undefined : params.kosten !== false;
    return { gesamt, fehler, ...(mitKosten ? { nacharbeitJe: z.wahl([0.25, 0.5, 0.75, 1, 1.5]), kostensatz: z.ganz(8, 18) * 5 } : {}) };
  },
  platzhalter: (d) => ({
    gesamt: fz(d.gesamt),
    fehler: fz(d.fehler),
    nacharbeitJe: d.nacharbeitJe === undefined ? '–' : fz(d.nacharbeitJe),
    kostensatz: d.kostensatz === undefined ? '–' : fz(d.kostensatz),
  }),
  loese(d) {
    const b = new LoesungsBau();
    const fq = b.wert('fehlerquote', (d.fehler / d.gesamt) * 100, { label: 'Fehlerquote', einheit: '%', runden: 2 });
    const fpy = b.wert('fpy', ((d.gesamt - d.fehler) / d.gesamt) * 100, { label: 'First Pass Yield', einheit: '%', runden: 2 });
    b.schritt({
      titel: 'Fehlerquote',
      formel: F.fehlerquote.latex,
      einsetzen: L`\frac{${lz(d.fehler)}}{${lz(d.gesamt)}} \cdot 100\,\%`,
      ergebnis: fq,
      einheit: '%',
      runden: 2,
    });
    b.schritt({
      titel: 'First Pass Yield',
      formel: F.fpy.latex,
      einsetzen: L`\frac{${lz(d.gesamt)} - ${lz(d.fehler)}}{${lz(d.gesamt)}} \cdot 100\,\%`,
      ergebnis: fpy,
      einheit: '%',
      runden: 2,
    });
    b.fehler('fpy', fq, 'Das ist die Fehlerquote – der First Pass Yield ist der Anteil **ohne** Nacharbeit.');
    b.fehler('fehlerquote', (d.fehler / (d.gesamt - d.fehler)) * 100, 'Die Basis sind **alle** Einheiten, nicht nur die fehlerfreien.');
    if (d.nacharbeitJe !== undefined && d.kostensatz !== undefined) {
      const std = b.wert('nacharbeitZeit', d.fehler * d.nacharbeitJe, {
        label: 'Nacharbeitszeit gesamt',
        einheit: 'h',
        runden: 2,
        zusatz: true,
      });
      const kosten = b.wert('nacharbeitskosten', std * d.kostensatz, { label: 'Nacharbeitskosten', einheit: '€', runden: 2 });
      const zuschlag = b.wert('zuschlag', kosten / d.gesamt, { label: 'Zuschlag je Einheit', einheit: '€', runden: 2 });
      b.schritt({
        titel: 'Nacharbeitszeit',
        formel: L`\text{Fälle} \cdot t_{je\ Fall}`,
        einsetzen: L`${lz(d.fehler)} \cdot ${lz(d.nacharbeitJe)}\,h`,
        ergebnis: std,
        einheit: 'h',
        runden: 2,
      });
      b.schritt({
        titel: 'Nacharbeitskosten',
        formel: L`t \cdot \text{Kostensatz}`,
        einsetzen: L`${lz(std)}\,h \cdot ${lz(d.kostensatz)}\,\text{€}/h`,
        ergebnis: kosten,
        einheit: '€',
        runden: 2,
      });
      b.schritt({
        titel: 'Zuschlag je Einheit',
        formel: L`\frac{\text{Kosten}}{\text{alle Einheiten}}`,
        einsetzen: L`\frac{${lz(kosten, 2)}}{${lz(d.gesamt)}}`,
        ergebnis: zuschlag,
        einheit: '€',
        runden: 2,
      });
      b.fehler('zuschlag', kosten / d.fehler, 'Du hast durch die fehlerhaften Einheiten geteilt – umgelegt wird auf **alle** Einheiten.');
      b.fehler(
        'nacharbeitskosten',
        d.fehler * d.kostensatz,
        'Du hast die Nacharbeitszeit je Fall vergessen: Fälle · Stunden · Kostensatz.',
      );
    }
    return b.fertig();
  },
});

const amoSchema = z
  .object({
    investition: z.number().positive(),
    einsparung: z.number().positive().optional(),
    auftraege: z.number().positive().optional(),
    minutenJeAuftrag: z.number().positive().optional(),
    kostensatz: z.number().positive().optional(),
    nutzungsdauer: z.number().positive().optional(),
  })
  .refine(
    (d) => d.einsparung !== undefined || (d.auftraege !== undefined && d.minutenJeAuftrag !== undefined && d.kostensatz !== undefined),
    {
      message: 'entweder einsparung oder auftraege + minutenJeAuftrag + kostensatz angeben',
    },
  );

export const amortisation = vorlage({
  id: 'amortisation',
  titel: 'Amortisationszeit und ROI',
  bereich: 'Wirtschaftlichkeit',
  beschreibung:
    'Jährliche Einsparung (direkt oder aus Aufträgen · Minuten · Kostensatz), Amortisationszeit, Gewinn und ROI über die Nutzungsdauer.',
  schema: amoSchema,
  hinweise: [
    'Minuten zuerst in Stunden umrechnen (÷ 60).',
    'Amortisationszeit = Investition / jährliche Einsparung.',
    'ROI = (Gesamtersparnis − Investition) / Investition · 100 %.',
  ],
  erzeuge(z, params, vorbild) {
    const jahre = z.wahl([1, 1.25, 1.5, 2, 2.5, 3, 4]);
    const nutzung = vorbild ? (vorbild.nutzungsdauer !== undefined ? z.ganz(3, 6) : undefined) : z.ja(0.6) ? z.ganz(3, 6) : undefined;
    const ausAuftraegen = vorbild ? vorbild.auftraege !== undefined : params.auftraege === true;
    if (ausAuftraegen) {
      const auftraege = z.ganz(12, 60) * 100;
      const minutenJeAuftrag = z.ganz(2, 10);
      const kostensatz = z.ganz(8, 16) * 5;
      const einsparung = ((auftraege * minutenJeAuftrag) / 60) * kostensatz;
      return {
        investition: Math.max(500, Math.round((einsparung * jahre) / 500) * 500),
        auftraege,
        minutenJeAuftrag,
        kostensatz,
        ...(nutzung ? { nutzungsdauer: nutzung } : {}),
      };
    }
    const einsparung = z.ganz(5, 40) * 1000;
    return { investition: einsparung * jahre, einsparung, ...(nutzung ? { nutzungsdauer: nutzung } : {}) };
  },
  platzhalter: (d) => ({
    investition: fz(d.investition, 2),
    einsparung: d.einsparung === undefined ? '–' : fz(d.einsparung, 2),
    auftraege: d.auftraege === undefined ? '–' : fz(d.auftraege),
    minutenJeAuftrag: d.minutenJeAuftrag === undefined ? '–' : fz(d.minutenJeAuftrag),
    kostensatz: d.kostensatz === undefined ? '–' : fz(d.kostensatz),
    nutzungsdauer: d.nutzungsdauer === undefined ? '–' : fz(d.nutzungsdauer),
  }),
  loese(d) {
    const b = new LoesungsBau();
    let ein: number;
    if (d.einsparung !== undefined)
      ein = b.wert('einsparung', d.einsparung, { label: 'Jährliche Einsparung', einheit: '€', runden: 2, zusatz: true });
    else {
      const minuten = d.auftraege! * d.minutenJeAuftrag!;
      const std = b.wert('stunden', minuten / 60, { label: 'Zeitersparnis pro Jahr', einheit: 'h', runden: 2 });
      b.schritt({
        titel: 'Zeitersparnis',
        formel: L`\frac{\text{Aufträge} \cdot \text{min je Auftrag}}{60}`,
        einsetzen: L`\frac{${lz(d.auftraege!)} \cdot ${lz(d.minutenJeAuftrag!)}}{60} = \frac{${lz(minuten)}}{60}`,
        ergebnis: std,
        einheit: 'h',
        runden: 2,
      });
      ein = b.wert('einsparung', std * d.kostensatz!, { label: 'Jährliche Einsparung', einheit: '€', runden: 2 });
      b.schritt({
        titel: 'Jährliche Einsparung',
        formel: L`t \cdot \text{Kostensatz}`,
        einsetzen: L`${lz(std, 2)}\,h \cdot ${lz(d.kostensatz!)}\,\text{€}/h`,
        ergebnis: ein,
        einheit: '€',
        runden: 2,
      });
      b.fehler('einsparung', minuten * d.kostensatz!, 'Du hast die Minuten nicht in Stunden umgerechnet (÷ 60).');
      b.fehler('stunden', minuten, 'Das sind Minuten – noch durch 60 teilen.');
    }
    const amo = b.wert('amortisation', d.investition / ein, { label: 'Amortisationszeit', einheit: 'Jahre', runden: 2 });
    b.wert('amortisationMonate', (d.investition / ein) * 12, { label: 'Amortisationszeit', einheit: 'Monate', runden: 1, zusatz: true });
    b.schritt({
      titel: 'Amortisationszeit',
      formel: F.amortisation.latex,
      einsetzen: L`\frac{${lz(d.investition, 2)}\,\text{€}}{${lz(ein, 2)}\,\text{€}/\text{Jahr}}`,
      ergebnis: amo,
      einheit: 'Jahre',
      runden: 2,
      hinweis: `= ${fz(amo * 12, 1)} Monate`,
    });
    b.fehler('amortisation', ein / d.investition, 'Bruch umgedreht – Amortisationszeit = Investition / Einsparung pro Jahr.');
    if (d.einsparung === undefined)
      b.fehler(
        'amortisation',
        d.investition / (d.auftraege! * d.minutenJeAuftrag! * d.kostensatz!),
        'Du hast die Minuten nicht in Stunden umgerechnet (÷ 60).',
      );
    if (d.nutzungsdauer !== undefined) {
      const ges = b.wert('gesamtersparnis', ein * d.nutzungsdauer, {
        label: 'Gesamtersparnis über die Nutzungsdauer',
        einheit: '€',
        runden: 2,
        zusatz: true,
      });
      const gew = b.wert('gewinn', ges - d.investition, { label: 'Gewinn (Überschuss)', einheit: '€', runden: 2, zusatz: true });
      const roi = b.wert('roi', (gew / d.investition) * 100, { label: 'ROI über die Nutzungsdauer', einheit: '%', runden: 2 });
      b.wert('roiJahr', roi / d.nutzungsdauer, { label: 'ROI pro Jahr', einheit: '%', runden: 2, zusatz: true });
      b.schritt({
        titel: 'Gesamtersparnis und Gewinn',
        formel: L`G = n \cdot E - I`,
        einsetzen: L`${lz(d.nutzungsdauer)} \cdot ${lz(ein, 2)} - ${lz(d.investition, 2)}`,
        ergebnis: gew,
        einheit: '€',
        runden: 2,
      });
      b.schritt({
        titel: 'ROI',
        formel: F.roi.latex,
        einsetzen: L`\frac{${lz(gew, 2)}}{${lz(d.investition, 2)}} \cdot 100\,\%`,
        ergebnis: roi,
        einheit: '%',
        runden: 2,
        hinweis: `Pro Jahr: ${fz(roi / d.nutzungsdauer, 2)} %.`,
      });
      b.fehler(
        'roi',
        (ges / d.investition) * 100,
        'Du hast die Investition nicht abgezogen – ROI = (Ersparnis − Investition) / Investition.',
      );
      b.fehler('roi', roi / d.nutzungsdauer, 'Das ist der ROI pro Jahr – gefragt ist der ROI über die gesamte Nutzungsdauer.');
      b.fehler('roiJahr', roi, 'Das ist der ROI über die gesamte Nutzungsdauer – noch durch die Jahre teilen.');
    }
    return b.fertig();
  },
});
