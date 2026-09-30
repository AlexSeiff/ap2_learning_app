// Datenqualität (Deep Dive 9): Qualitätsgrade (Vollständigkeit, Eindeutigkeit, Gültigkeit, Plausibilität …) als Anteil in %.

import { z } from 'zod';
import { fz, L, LoesungsBau, lz, vorlage } from '../hilfen';

const kennzahlSchema = z
  .object({
    id: z.string().regex(/^[A-Za-z][\w-]*$/, 'nur Buchstaben, Ziffern, _ und -'),
    name: z.string().trim().min(1),
    gut: z.number().int().nonnegative(),
    gesamt: z.number().int().positive(),
  })
  .refine((k) => k.gut <= k.gesamt, { message: 'gut > gesamt' });

const dqSchema = z
  .object({ kennzahlen: z.array(kennzahlSchema).min(1).max(10) })
  .refine((d) => new Set(d.kennzahlen.map((k) => k.id)).size === d.kennzahlen.length, { message: 'Kennzahl-IDs doppelt' });

export const qualitaetsgrad = vorlage({
  id: 'qualitaetsgrad',
  titel: 'Datenqualitäts-Kennzahlen',
  bereich: 'Datenqualität',
  beschreibung: 'Anteil der „guten“ Werte an allen Werten je Kennzahl (z. B. Vollständigkeitsgrad = gefüllte / alle Felder · 100 %).',
  schema: dqSchema,
  hinweise: ['Grad = erfüllende Werte / alle Werte · 100 %.', 'Bezugsgröße beachten: je Feld oder über alle Zellen?'],
  erzeuge(z, _params, vorbild) {
    const basis = vorbild?.kennzahlen ?? [
      { id: 'vollstaendigkeit', name: 'Vollständigkeitsgrad', gut: 0, gesamt: 0 },
      { id: 'eindeutigkeit', name: 'Eindeutigkeitsgrad', gut: 0, gesamt: 0 },
      { id: 'gueltigkeit', name: 'Gültigkeitsgrad', gut: 0, gesamt: 0 },
    ];
    const gesamt = vorbild ? vorbild.kennzahlen[0].gesamt : z.wahl([10, 20, 40, 50, 80, 120, 200, 250, 400, 500]);
    return {
      kennzahlen: basis.map((k) => {
        const g = vorbild ? Math.max(1, Math.round(k.gesamt * (0.8 + z.zahl() * 0.4))) : gesamt;
        return { ...k, gesamt: g, gut: Math.round(g * (0.6 + z.zahl() * 0.39)) };
      }),
    };
  },
  platzhalter: (d) => {
    const p: Record<string, string> = {};
    for (const k of d.kennzahlen) {
      p[`name_${k.id}`] = k.name;
      p[`gut_${k.id}`] = fz(k.gut);
      p[`gesamt_${k.id}`] = fz(k.gesamt);
      p[`schlecht_${k.id}`] = fz(k.gesamt - k.gut);
    }
    return p;
  },
  tabelle: (d) => ({
    kopf: ['Kennzahl', 'erfüllt', 'nicht erfüllt', 'gesamt'],
    zeilen: d.kennzahlen.map((k) => [k.name, fz(k.gut), fz(k.gesamt - k.gut), fz(k.gesamt)]),
  }),
  loese(d) {
    const b = new LoesungsBau();
    for (const k of d.kennzahlen) {
      const w = b.wert(k.id, (k.gut / k.gesamt) * 100, { label: k.name, einheit: '%', runden: 2 });
      b.schritt({
        titel: k.name,
        formel: L`\frac{\text{erfüllt}}{\text{gesamt}} \cdot 100\,\%`,
        einsetzen: L`\frac{${lz(k.gut)}}{${lz(k.gesamt)}} \cdot 100\,\%`,
        ergebnis: w,
        einheit: '%',
        runden: 2,
      });
      b.fehler(
        k.id,
        ((k.gesamt - k.gut) / k.gesamt) * 100,
        'Das ist der Anteil der **nicht** erfüllenden Werte (Fehlerquote) – gefragt ist der erfüllte Anteil.',
      );
      b.fehler(k.id, k.gut, 'Das ist die Anzahl – gefragt ist der Anteil in Prozent.');
    }
    return b.fertig();
  },
});
