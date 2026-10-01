// Alle Rechenvorlagen nach ID. Neue Vorlage: Datei in diesem Ordner, hier eintragen, in DOKUMENTATION § 4.4 beschreiben.

import type { Vorlage } from '../typen';
import { assoziation, kmeans } from './crispdm';
import { qualitaetsgrad } from './datenqualitaet';
import { konfusionsmatrix, regressionsguete } from './modellguete';
import { breakEven, netzplan, nutzwert, pert, risiko } from './projekt';
import { amortisation, durchlaufzeit, fehlerquote } from './prozess';
import { datensicherung, rpo } from './sicherung';
import { gewichtetesMittel, haeufigkeiten, lagemasse, quartile, varianz, variationskoeffizient } from './statistik1';
import { gleitenderDurchschnitt, korrelation, prozentVeraenderung, regression } from './statistik2';
import { gleichgewicht, minijob, sozialversicherung } from './wiso';

const alle = [
  lagemasse,
  gewichtetesMittel,
  quartile,
  varianz,
  variationskoeffizient,
  haeufigkeiten,
  korrelation,
  regression,
  gleitenderDurchschnitt,
  prozentVeraenderung,
  konfusionsmatrix,
  regressionsguete,
  assoziation,
  kmeans,
  durchlaufzeit,
  fehlerquote,
  amortisation,
  qualitaetsgrad,
  netzplan,
  nutzwert,
  breakEven,
  risiko,
  pert,
  sozialversicherung,
  minijob,
  gleichgewicht,
  datensicherung,
  rpo,
] as unknown as Vorlage<unknown>[];

export const VORLAGEN: Record<string, Vorlage<unknown>> = Object.fromEntries(alle.map((v) => [v.id, v]));

export function findeVorlage(id: string | undefined): Vorlage<unknown> | undefined {
  return id === undefined ? undefined : Object.hasOwn(VORLAGEN, id) ? VORLAGEN[id] : undefined;
}
