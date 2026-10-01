// Dateien des mc-Werkzeugs (npm run mc-entwurf / mc-uebernehmen). LERN_QUELLE wird vorher von ladeEnv.ts gesetzt.

import { join } from 'node:path';
import { SOURCE_DIR } from './loadContent';

export const LERNKARTEN_DATEI = join(SOURCE_DIR, 'AP2_FIDPA_Lernkarten.json');
export const ENTWURF_DATEI = join(import.meta.dirname, '..', 'data', 'mc-entwurf.json');
