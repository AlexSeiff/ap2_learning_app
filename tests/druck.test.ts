import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { emptyProgress } from '../shared/progress';
import { CONTENT_DIR, loadContent } from '../server/loadContent';
import type { MarkdownProps } from '../src/components/markdownComponents';

// Rauchtest der Druckansicht /druck mit den echten Lernblättern (Server-Rendering ohne Browser).
// <Markdown math> lädt KaTeX sonst lazy (beim Server-Rendering bliebe der Text ohne Formelsatz) – hier direkt die Formel-Variante.

const content = loadContent(CONTENT_DIR);

vi.mock('../src/lib/store', () => ({
  useStore: () => ({ content, progress: emptyProgress(), update: () => {}, aiEnabled: false, aiModel: '' }),
}));
vi.mock('../src/components/Markdown', async () => {
  const { default: MathMarkdown } = await import('../src/components/MathMarkdown');
  return { Markdown: (props: MarkdownProps & { math?: boolean }) => createElement(MathMarkdown, props) };
});

const { Druck } = await import('../src/pages/Druck');

function render(path: string): string {
  const routes = createElement(Routes, null, createElement(Route, { path: '/druck', element: createElement(Druck) }));
  return renderToString(createElement(MemoryRouter, { initialEntries: [path] }, routes)).replace(/<!-- -->/g, '');
}

describe('Druckansicht /druck', () => {
  it('jedes Lösungsblatt rendert ohne Formelfehler', () => {
    for (const t of content.topics.filter((x) => x.exam)) {
      const html = render(`/druck?thema=${t.id}&art=loesungen`);
      expect(html, t.id).toContain('Lösungsblatt');
      expect(html, t.id).not.toContain('katex-error');
    }
  });

  it('Lösungsblatt DD3: Formeln gesetzt, Ergebnisse im Kasten', () => {
    const html = render('/druck?thema=03&art=loesungen');
    expect(html).toContain('<span class="ergebnis-label">Ergebnis</span><strong>70,00 Minuten</strong>');
    expect(html).toContain('pk-box');
    expect(html).toContain('class="katex"');
    expect(html).toContain('class="punkte rechts"');
  });

  it('Aufgabenblatt rendert', () => {
    expect(render('/druck?thema=03&art=aufgaben')).toContain('Aufgabenblatt');
  });
});
