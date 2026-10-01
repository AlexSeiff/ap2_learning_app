import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { MobileNav } from '../src/components/MobileNav';
import { aktiveGruppe, badgeSumme, MEHR_ZIELE, passtZuZiel, UEBEN_ZIELE } from '../src/lib/navigation';

describe('Navigation für Handys (Roadmap 7.2)', () => {
  it('ordnet jeden Pfad dem richtigen Platz zu', () => {
    expect(aktiveGruppe('/')).toBe('uebersicht');
    expect(aktiveGruppe('/lernen/03')).toBe('lernen');
    expect(aktiveGruppe('/karteikarten')).toBe('karteikarten');
    for (const p of ['/klausur', '/klausur/03', '/aufgaben', '/aufgabe/03-A1', '/sql', '/sql/uebung/SQL-MH-001', '/rechnen/RE-ST1-001']) {
      expect(aktiveGruppe(p)).toBe('ueben');
    }
    for (const p of ['/fehlerjournal', '/generator', '/material/lernzettel', '/einstellungen', '/daten'])
      expect(aktiveGruppe(p)).toBe('mehr');
    expect(aktiveGruppe('/gibtsnicht')).toBeUndefined();
  });

  it('passtZuZiel: Präfix nur an Pfadgrenzen', () => {
    expect(passtZuZiel('/sql', '/sqlx')).toBe(false);
    expect(passtZuZiel('/', '/lernen')).toBe(false);
  });

  it('Üben enthält Klausur, Einzelaufgaben, SQL und Rechnen; Mehr enthält Fehlerjournal, Material, Einstellungen, Daten', () => {
    expect(UEBEN_ZIELE.map((z) => z.to)).toEqual(['/klausur', '/aufgaben', '/sql', '/rechnen']);
    expect(MEHR_ZIELE.map((z) => z.to)).toEqual(expect.arrayContaining(['/fehlerjournal', '/material', '/einstellungen', '/daten']));
  });

  it('Badge am Menüknopf = Summe der fälligen Einträge darin', () => {
    const badges = { sql: 2, rechnen: 3, journal: 4 };
    expect(badgeSumme(UEBEN_ZIELE, badges)).toBe(5);
    expect(badgeSumme(MEHR_ZIELE, badges)).toBe(4);
  });

  it('rendert fünf Plätze, Menüs geschlossen, Badges sichtbar', () => {
    const html = renderToString(
      createElement(
        MemoryRouter,
        { initialEntries: ['/sql'] },
        createElement(MobileNav, {
          badges: { sql: 2, rechnen: 0, journal: 1 },
          theme: { icon: '🖥️', label: 'Design: System', toggle: () => {} },
          saveText: '✓ gespeichert',
          saveState: 'gespeichert',
        }),
      ),
    ).replace(/<!-- -->/g, '');
    for (const l of ['Übersicht', 'Lernen', 'Karteikarten', 'Üben', 'Mehr']) expect(html).toContain(`<span class="bn-label">${l}</span>`);
    expect(html.match(/aria-expanded="false"/g)).toHaveLength(2);
    expect(html).not.toContain('bn-panel');
    expect(html).toMatch(/class="bn-menu active"[^>]*>.*?<span class="nav-badge">2<\/span>/);
    expect(html).toContain(', 1 fällig');
  });
});
