// Kopiert die Lernblätter aus dem Ordner AP-2 nach content/ (npm run sync-content).
// content/ wird committet und ist die Quelle für die GitHub-Pages-Version und die Tests.
// Der Ordner AP-2 wird nur gelesen; in content/ werden nur Lernblatt-Dateien angelegt, ersetzt oder gelöscht.

import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { CONTENT_DIR, listContentFiles, SOURCE_DIR } from './loadContent';

const sources = listContentFiles(SOURCE_DIR);
if (sources.length === 0) {
  console.error(`Keine Lernblätter in ${SOURCE_DIR} gefunden – content/ bleibt unverändert.`);
  process.exit(1);
}

mkdirSync(CONTENT_DIR, { recursive: true });
const same = (a: string, b: string) => existsSync(b) && readFileSync(a).equals(readFileSync(b));

let changed = 0;
for (const name of sources) {
  const from = join(SOURCE_DIR, name);
  const to = join(CONTENT_DIR, name);
  if (same(from, to)) continue;
  copyFileSync(from, to);
  console.log(`  aktualisiert: ${name}`);
  changed++;
}

// Im Quellordner gelöschte oder umbenannte Lernblätter auch aus content/ entfernen.
for (const name of listContentFiles(CONTENT_DIR)) {
  if (sources.includes(name)) continue;
  rmSync(join(CONTENT_DIR, name));
  console.log(`  entfernt: ${name}`);
  changed++;
}

console.log(`${sources.length} Dateien aus ${SOURCE_DIR} → content/ (${changed ? `${changed} geändert` : 'alles aktuell'}).`);
