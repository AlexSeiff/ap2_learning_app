import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildContent } from '../shared/parser';
import type { Content } from '../shared/types';

/** Ordner mit den Lernblättern: standardmäßig der Ordner oberhalb der App (AP-2). */
export const SOURCE_DIR = resolve(process.env.LERN_QUELLE ?? join(import.meta.dirname, '..', '..'));

export function loadContent(dir = SOURCE_DIR): Content {
  const files = readdirSync(dir)
    .filter((name) => (name.toLowerCase().endsWith('.md') && !name.startsWith('Prompt_')) || /Lernkarten.*\.json$/i.test(name))
    .map((name) => ({ name, text: readFileSync(join(dir, name), 'utf8') }));
  return buildContent(files);
}
