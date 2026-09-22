import { describe, expect, it } from 'vitest';
import { buildContent, parseCriteria, parseLernplan, parseSolutions, parseTopic, toLines } from '../shared/parser';
import { loadContent } from '../server/loadContent';

// Echte Lernblätter aus dem AP-2-Ordner
const content = loadContent();
const sheets = content.topics.filter((t) => t.id !== '00');

describe('Import der echten Lernblätter', () => {
  it('findet alle 12 Deep Dives mit Lösungsdatei', () => {
    expect(sheets.map((t) => t.id)).toEqual(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']);
    for (const t of sheets) expect(t.solutionFile, t.file).toBe(t.file.replace('.md', '_Loesungen.md'));
  });

  it('jede Übungsklausur ergibt genau 100 Punkte und Blocksummen stimmen', () => {
    for (const t of content.topics) {
      expect(t.exam?.totalPoints, t.file).toBe(100);
      for (const b of t.exam!.blocks) {
        const sum = b.taskIds.reduce((s, id) => s + content.tasks[id].points, 0);
        expect(sum, `${t.file} Block ${b.letter}`).toBe(b.points);
      }
    }
  });

  it('jede Aufgabe hat eine Musterlösung und es gibt keine Importhinweise', () => {
    const missing = Object.values(content.tasks).filter((t) => !t.solution?.markdown).map((t) => t.id);
    expect(missing).toEqual([]);
    expect(content.issues).toEqual([]);
  });

  it('liest Aufgabentext inkl. Codeblock (SQL A3)', () => {
    const a3 = content.tasks['01-A3'];
    expect(a3.points).toBe(9);
    expect(a3.block).toBe('A');
    expect(a3.markdown).toContain('```sql');
    expect(a3.markdown).toContain('GROUP BY name;');
    expect(a3.solution?.kommentar).toMatch(/^Je Fehler 1 P/);
    expect(a3.solution?.markdown).not.toContain('Prüferkommentar');
  });

  it('erkennt Punktetabellen als Bewertungskriterien (BPMN B1)', () => {
    const crit = content.tasks['05-B1'].solution?.criteria;
    expect(crit?.length).toBeGreaterThanOrEqual(5);
    // Die Tabelle summiert bewusst auf 20 P (Maximum 18 P) – die App deckelt beim Abhaken auf die Aufgabenpunkte.
    expect(crit!.reduce((s, c) => s + c.points, 0)).toBe(20);
  });

  it('stellt Anlagen und die Übungsdatenbank für die Klausur bereit', () => {
    const sql = content.topics.find((t) => t.id === '01')!;
    expect(sql.exam!.attachments[0].title).toMatch(/Übungsdatenbank/);
    const dm = content.topics.find((t) => t.id === '02')!;
    expect(dm.exam!.attachments.some((a) => a.title.startsWith('Anlage 1'))).toBe(true);
    expect(dm.exam!.blocks[1].intro).toMatch(/^Szenario:/);
  });

  it('liest Prüferfragen, Fachgespräch-Fragen und Lernziele', () => {
    const pf = content.flashcards.filter((c) => c.kind === 'prueferfrage');
    expect(pf.length).toBe(22);
    expect(pf.every((c) => c.answer && !c.answer.startsWith('*'))).toBe(true);
    const fg = content.flashcards.find((c) => c.id === '01-fg2')!;
    expect(fg.answer).toMatch(/^Plausibilisierung/);
    expect(sheets.every((t) => t.lernziele.length >= 8)).toBe(true);
  });

  it('importiert das ältere SQL-Blatt mit integrierten Lösungen', () => {
    const legacy = content.topics.find((t) => t.id === '00')!;
    expect(legacy.file).toBe('Deep_Dive_SQL_KW28_29.md');
    expect(content.tasks['00-C7'].solution?.markdown).toMatch(/Aggregatbedingung/);
  });

  it('liest den Lernplan wochenweise', () => {
    expect(content.weeks.find((w) => w.kw === 39)?.text).toMatch(/Visualisierung/);
    expect(content.weeks.at(-1)?.kw).toBe(48);
  });
});

describe('Robustheit', () => {
  it('meldet Aufgaben ohne Lösung statt abzustürzen', () => {
    const sheet = `# Deep Dive 99: Test (KW 1)\n\n## Theorie\n\nText\n\n# Übungsklausur Test (100 Punkte, 90 Minuten)\n\n## Block A – Wissen (100 P)\n\n**A1 (60 P):** Frage 1\n\n**A2 (40 P):** Frage 2\n`;
    const sol = `# Lösungen\n\n## Block A\n\n**A1 (60 P):**\nAntwort 1\n\n**A9 (5 P):**\nverwaist\n`;
    const r = parseTopic('99', 'DeepDive_99_Test.md', sheet, 'DeepDive_99_Test_Loesungen.md', sol);
    expect(r.tasks).toHaveLength(2);
    expect(r.tasks[0].solution?.markdown).toBe('Antwort 1');
    expect(r.issues.map((i) => i.message)).toEqual([
      'Keine Musterlösung für Aufgabe A2 gefunden.',
      'Lösung A9 ohne passende Aufgabe im Lernblatt.',
    ]);
  });

  it('ignoriert Überschriften und Aufgabenmuster in Codeblöcken', () => {
    const md = '**A1 (2 P):**\nLösung\n```\n# kein Heading\n**B1 (3 P):** kein Start\n```\n';
    const sols = parseSolutions(toLines(md));
    expect([...sols.keys()]).toEqual(['A1']);
    expect(sols.get('A1')!.solution.markdown).toContain('# kein Heading');
  });

  it('meldet verwaiste Lösungsdateien und Blätter ohne Klausur', () => {
    const c = buildContent([
      { name: 'DeepDive_50_Nur_Theorie.md', text: '# Deep Dive 50: Nur Theorie\n\n## A\n\nText' },
      { name: 'DeepDive_51_X_Loesungen.md', text: '# L' },
    ]);
    const messages = c.issues.map((i) => `${i.file}: ${i.message}`);
    expect(messages).toContain('DeepDive_50_Nur_Theorie.md: Kein Abschnitt „Übungsklausur" gefunden.');
    expect(messages).toContain('DeepDive_51_X_Loesungen.md: Lösungsdatei ohne zugehöriges Lernblatt.');
  });

  it('parseCriteria überspringt Summenzeilen', () => {
    const md = '| Element | P |\n|---|---|\n| A | 2 |\n| B | 1,5 |\n| **Summe** | **3,5** |';
    expect(parseCriteria(md)).toEqual([{ label: 'A', points: 2 }, { label: 'B', points: 1.5 }]);
  });

  it('parseLernplan versteht Wochen mit und ohne Datum', () => {
    const weeks = parseLernplan('- **KW 30 (20.–26.7.)** – Datenmodellierung\n- **KW 48:** Prüfungstag');
    expect(weeks).toEqual([
      { kw: 30, label: 'KW 30 (20.–26.7.)', text: 'Datenmodellierung' },
      { kw: 48, label: 'KW 48', text: 'Prüfungstag' },
    ]);
  });
});
