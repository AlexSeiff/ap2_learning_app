import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { buildContent } from '../shared/parser';
import type { Content } from '../shared/types';

/** Ordner mit den Lernblättern: standardmäßig der Ordner oberhalb der App (AP-2). */
export const SOURCE_DIR = resolve(process.env.LERN_QUELLE ?? join(import.meta.dirname, '..', '..'));

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

export function loadContent(dir = SOURCE_DIR): Content {
  const files = readdirSync(dir)
    .filter(isContentFile)
    .map((name) => ({ name, text: readFileSync(join(dir, name), 'utf8') }));
  return buildContent(files);
}
