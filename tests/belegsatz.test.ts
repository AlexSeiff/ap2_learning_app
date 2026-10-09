import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { emptyProgress } from '../shared/progress';
import { CONTENT_DIR, loadContent } from '../server/loadContent';
import { aktivesUnterziel, bereich } from '../src/lib/navigation';

// SQL-Belegsatz (Umsetzungsplan Phase 6, E3): Material aus AP2_SQL_Belegsatz.md, Seite unter Glossar, Knopf im SQL-Editor.

const content = loadContent(CONTENT_DIR);

vi.mock('../src/lib/store', () => ({
  useStore: () => ({ content, progress: emptyProgress(), update: () => {}, aiEnabled: false, aiModel: '', firstVisit: false }),
}));

const { SqlBelegsatz } = await import('../src/pages/SqlBelegsatz');
const { BelegsatzPanel, ohneTitel } = await import('../src/components/Belegsatz');

const render = (el: React.ReactElement, path = '/material/sql-belegsatz') =>
  renderToString(
    createElement(MemoryRouter, { initialEntries: [path] }, createElement(Routes, null, createElement(Route, { path, element: el }))),
  ).replace(/<!-- -->/g, '');

describe('SQL-Belegsatz', () => {
  const doc = content.materials.find((m) => m.id === 'sql-belegsatz');

  it('wird als Material geladen und deckt die Themen des Plans ab', () => {
    expect(doc?.file).toBe('AP2_SQL_Belegsatz.md');
    for (const t of [
      'SELECT',
      'JOIN',
      'Aggregatfunktionen',
      'Unterabfragen',
      'INSERT',
      'CREATE TABLE',
      'Constraint',
      'Datentypen',
      'VIEW',
      'INDEX',
      'STRFTIME',
    ]) {
      expect(doc!.markdown, t).toContain(t);
    }
  });

  it('Seite: Überschrift, Druckknopf, Inhalt ohne doppelten Titel', () => {
    const html = render(createElement(SqlBelegsatz));
    expect(html).toContain('SQL-Belegsatz</h1>');
    expect(html).toContain('Drucken');
    expect(html).toContain('<h2>1. SELECT');
    expect(ohneTitel('# SQL-Belegsatz\n\nText')).toBe('Text');
  });

  it('SQL-Editor: Knopf zum Seitenpanel (zu Beginn geschlossen)', () => {
    const html = render(createElement(BelegsatzPanel), '/sql');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('SQL-Belegsatz');
    expect(html).not.toContain('<aside');
  });

  it('Navigation: Unterziel im Bereich Glossar', () => {
    expect(aktivesUnterziel('/material/sql-belegsatz', bereich('glossar'))?.label).toBe('SQL-Belegsatz');
  });
});
