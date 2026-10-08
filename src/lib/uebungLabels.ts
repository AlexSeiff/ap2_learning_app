// Gemeinsame Beschriftungen der Übungslisten (SQL- und Rechenübungen): Schwierigkeit, Status, Sterne.

import type { RechenStatus } from './rechnen';
import type { SqlStatus } from './sql';

/** SQL- und Rechenübungen haben dieselben Status. */
export type UebungStatus = SqlStatus & RechenStatus;

export const LEVEL_LABELS: Record<number, string> = { 1: 'Basis', 2: 'Standard', 3: 'Transfer' };

export const STATUS_LABELS: Record<UebungStatus, string> = {
  offen: 'offen',
  geloest: '✓ gelöst',
  faellig: '↻ Wiederholung fällig',
  'mit-loesung': 'mit Lösung',
};

export const STATUS_CLASS: Record<UebungStatus, string> = { offen: '', geloest: 'good', faellig: 'low', 'mit-loesung': 'mid' };

export const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(Math.max(0, 3 - n));
