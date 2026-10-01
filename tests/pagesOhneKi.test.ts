import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { emptyProgress } from '../shared/progress';
import { CONTENT_DIR, loadContent } from '../server/loadContent';
import { ConfirmContext } from '../src/hooks/useConfirm';

// Roadmap 7.4 (Entscheidung Q3): in der Pages-Version gibt es keine KI – weder Menüpunkt noch Bewertungsknopf noch Filter.
// IS_STATIC hängt an import.meta.env.MODE; hier wird der Pages-Build nachgestellt.
vi.stubEnv('MODE', 'pages');

const content = loadContent(CONTENT_DIR);
vi.mock('../src/lib/store', () => ({
  useStore: () => ({ content, progress: emptyProgress(), update: () => {}, aiEnabled: false, aiModel: '', reload: async () => {} }),
}));

const { IS_STATIC } = await import('../src/lib/api');
const { GradePanel } = await import('../src/components/TaskParts');
const { Aufgaben } = await import('../src/pages/Aufgaben');
const { Daten } = await import('../src/pages/Daten');

function render(el: ReturnType<typeof createElement>, path = '/'): string {
  const app = createElement(MemoryRouter, { initialEntries: [path] }, el);
  return renderToString(createElement(ConfirmContext.Provider, { value: async () => true }, app)).replace(/<!-- -->/g, '');
}

describe('Pages ohne KI (Roadmap 7.4)', () => {
  it('läuft als Pages-Build', () => {
    expect(IS_STATIC).toBe(true);
  });

  it('Musterlösung ohne KI-Bewertung', () => {
    const task = Object.values(content.tasks).find((t) => t.solution)!;
    const html = render(createElement(GradePanel, { task, answer: 'x', points: undefined, onPoints: () => {} }));
    expect(html).toContain('Selbstbewertung');
    expect(html).not.toContain('KI-Bewertung');
  });

  it('Einzelaufgaben ohne Filter „KI-generiert“, auch nicht über die URL', () => {
    const html = render(createElement(Aufgaben), '/aufgaben?quelle=ki');
    expect(html).not.toContain('KI-generiert');
    expect(html).toMatch(/aufgabe\//);
  });

  it('Daten & Import ohne KI-Abschnitt', () => {
    const html = render(createElement(Daten));
    expect(html).not.toContain('<h2>KI</h2>');
    expect(html).not.toContain('KI-Aufgaben');
  });
});
