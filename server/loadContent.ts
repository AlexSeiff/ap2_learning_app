import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { buildContent } from '../shared/parser';
import type { Content } from '../shared/types';

/** Ordner mit den Lernblättern: standardmäßig der Ordner oberhalb der App (AP-2). Der Dev-Server liest live von hier. */
export const SOURCE_DIR = resolve(process.env.LERN_QUELLE ?? join(import.meta.dirname, '..', '..'));

/**
 * Kopie der Lernblätter im Repository (`npm run sync-content`). Daraus bauen `npm run build:pages` und die Tests –
 * so sehen GitHub Actions und der lokale Build dieselben Inhalte, auch ohne den Ordner AP-2.
 */
export const CONTENT_DIR = resolve(import.meta.dirname, '..', 'content');

/** Dateiname eines Lernblatts (*.md außer Prompt_*) oder einer Lernkarten-JSON? */
export function isContentFile(name: string): boolean {
  return (name.toLowerCase().endsWith('.md') && !name.startsWith('Prompt_')) || /Lernkarten.*\.json$/i.test(name);
}

/** Liegt `file` direkt im Quellordner und wird von loadContent() gelesen? (Für den Datei-Watcher.) */
export function isContentSource(file: string, dir = SOURCE_DIR): boolean {
  // Windows: Laufwerksbuchstaben können unterschiedlich geschrieben sein.
  const same = resolve(dirname(file)).toLowerCase() === resolve(dir).toLowerCase();
  return same && isContentFile(basename(file));
}

/** Namen aller Dateien in `dir`, die loadContent() liest (sortiert). */
export function listContentFiles(dir = SOURCE_DIR): string[] {
  return readdirSync(dir).filter(isContentFile).sort();
}

export function loadContent(dir = SOURCE_DIR): Content {
  const files = listContentFiles(dir).map((name) => ({ name, text: readFileSync(join(dir, name), 'utf8') }));
  return buildContent(files);
}
