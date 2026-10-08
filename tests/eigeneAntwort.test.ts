import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AntwortVergleich, EigeneAntwortFeld } from '../src/components/EigeneAntwort';

// „Deine Antwort“ auf Karteikarten (ROADMAP 8.2).

const render = (el: ReturnType<typeof createElement>) => renderToString(el).replace(/<!-- -->/g, '');

describe('Deine Antwort', () => {
  it('Feld mit Beschriftung und Hinweis auf Strg+Enter', () => {
    const html = render(createElement(EigeneAntwortFeld, { value: 'Hallo', onChange: () => {}, onFertig: () => {} }));
    expect(html).toContain('Deine Antwort (optional)');
    expect(html).toMatch(/<label for="([^"]+)">.*<textarea id="\1"/s);
    expect(html).toContain('Hallo</textarea>');
    expect(html).toContain('<kbd>Strg</kbd>+<kbd>Enter</kbd>');
  });

  it('Vergleich: eigene Antwort neben der Musterantwort, Text bleibt Text (kein HTML)', () => {
    const html = render(createElement(AntwortVergleich, { eigene: 'Primär<b>schlüssel</b>', muster: createElement('p', null, 'Muster') }));
    expect(html).toContain('Deine Antwort');
    expect(html).toContain('Musterantwort');
    expect(html).toContain('Primär&lt;b&gt;schlüssel&lt;/b&gt;');
    expect(html).toContain('<p>Muster</p>');
  });

  it('ohne eigene Antwort nur die Musterantwort', () => {
    const html = render(createElement(AntwortVergleich, { eigene: '  ', muster: createElement('p', null, 'Muster') }));
    expect(html).toBe('<p>Muster</p>');
  });
});
