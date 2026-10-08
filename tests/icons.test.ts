import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Icon } from '../src/components/Icon';
import { ICONS, type IconName } from '../src/lib/icons';

// Linien-Icons statt Emojis (Umsetzungsplan Phase 1).

/** Alle .ts/.tsx-Dateien unter src/ */
function quellen(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? quellen(p) : /\.tsx?$/.test(f) ? [p] : [];
  });
}

describe('Icon', () => {
  it('dekorativ: aria-hidden, Farbe vom Text, Elemente aus lib/icons.ts', () => {
    const html = renderToString(createElement(Icon, { name: 'search' }));
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('stroke="currentColor"');
    expect(html).toContain('class="icon"');
    expect(html.match(/<(path|circle|rect|line|polyline|polygon|ellipse)\b/g)).toHaveLength(ICONS.search.length);
  });

  it('mit label: role="img" und Name für Screenreader', () => {
    const html = renderToString(createElement(Icon, { name: 'dices', label: 'neue Zahlen möglich' }));
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="neue Zahlen möglich"');
    expect(html).not.toContain('aria-hidden');
  });

  it('jedes Icon hat Elemente mit Attributen', () => {
    for (const [name, teile] of Object.entries(ICONS)) {
      expect(teile.length, name).toBeGreaterThan(0);
      for (const [, attrs] of teile) expect(Object.keys(attrs).length, name).toBeGreaterThan(0);
    }
  });

  it('jedes Icon wird benutzt (keine toten Pfade im Bundle)', () => {
    const code = quellen('src')
      .filter((p) => !p.endsWith('icons.ts'))
      .map((p) => readFileSync(p, 'utf8'))
      .join('\n');
    for (const name of Object.keys(ICONS) as IconName[]) expect(code, name).toMatch(new RegExp(`['"]${name}['"]`));
  });

  it('Oberfläche ohne bunte Emojis (Lerninhalte in content/ sind davon nicht betroffen)', () => {
    // Erlaubt bleiben Textzeichen wie ★ ☆ (Schwierigkeit) und ☐ (Ankreuzfeld im Druck).
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{2604}\u{2607}-\u{260F}\u{2611}-\u{26FF}\u{2B00}-\u{2BFF}\u{23E9}-\u{23FF}]/u;
    for (const p of quellen('src')) {
      const zeilen = readFileSync(p, 'utf8')
        .split('\n')
        .filter((z) => !/^\s*(\/\/|\*|\/\*|\{\/\*)/.test(z));
      for (const z of zeilen) expect(z, p).not.toMatch(emoji);
    }
  });
});
