// `npm run mc-uebernehmen [-- --probe]` (ROADMAP 6.3, nur lokal): trägt die im Entwurf (data/mc-entwurf.json) als „angenommen“
// markierten mc-Blöcke in AP2_FIDPA_Lernkarten.json ein. Reihenfolge, IDs und Formatierung der Datei bleiben erhalten.
// `--probe` zeigt nur, was passieren würde. Danach: npm run sync-content.

import './ladeEnv';
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { ENTWURF_DATEI, LERNKARTEN_DATEI } from './mcEntwurfPfade';
import { leseEntwurf, uebernehmeMc } from './mcWerkzeug';

if (!existsSync(ENTWURF_DATEI)) {
  console.error('Kein Entwurf gefunden (data/mc-entwurf.json). Erst: npm run mc-entwurf -- --deck <id>');
  process.exit(1);
}
const { entwurf, fehler } = leseEntwurf(readFileSync(ENTWURF_DATEI, 'utf8'));
if (fehler.length) {
  console.error(`data/mc-entwurf.json hat Fehler – bitte erst korrigieren:\n  ${fehler.join('\n  ')}`);
  process.exit(1);
}
try {
  const r = uebernehmeMc(readFileSync(LERNKARTEN_DATEI, 'utf8'), entwurf);
  if (r.hinweise.length) console.log(`Hinweise:\n  ${r.hinweise.join('\n  ')}`);
  if (!r.uebernommen.length) {
    console.log('Keine angenommenen Einträge zum Übernehmen.');
  } else if (process.argv.includes('--probe')) {
    console.log(`Probelauf: ${r.uebernommen.length} Karten würden einen mc-Block bekommen: ${r.uebernommen.join(', ')}`);
  } else {
    const tmp = `${LERNKARTEN_DATEI}.tmp`;
    writeFileSync(tmp, r.text);
    renameSync(tmp, LERNKARTEN_DATEI);
    console.log(`${r.uebernommen.length} mc-Blöcke eingetragen: ${r.uebernommen.join(', ')}\nJetzt: npm run sync-content`);
  }
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
