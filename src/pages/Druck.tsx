import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { shuffledOrder } from '../components/AnswerInput';
import { Markdown } from '../components/Markdown';
import { formatPoints } from '../lib/grading';
import {
  downloadText,
  examSheet,
  selectionSheet,
  sheetToMarkdown,
  solutionMarkdown,
  taskLabel,
  taskMarkdown,
  type SheetKind,
} from '../lib/sheets';
import { useStore } from '../lib/store';

/** Druckansicht: Aufgaben- und Lösungsblatt sind getrennte Seiten mit identischer Nummerierung. */
export function Druck() {
  const { content } = useStore();
  const [params] = useSearchParams();
  const kind: SheetKind = params.get('art') === 'loesungen' ? 'loesungen' : 'aufgaben';
  const thema = params.get('thema');
  const ids = params.get('ids')?.split(',').filter(Boolean) ?? [];
  const sheet = thema ? examSheet(content, thema, kind) : selectionSheet(content, ids, kind);

  // Der Seitentitel wird beim „Als PDF speichern" als Dateiname vorgeschlagen.
  const fileBase = sheet?.fileBase;
  useEffect(() => {
    const prev = document.title;
    if (fileBase) document.title = fileBase;
    return () => {
      document.title = prev;
    };
  }, [fileBase]);

  if (!sheet || !sheet.groups.some((g) => g.tasks.length)) {
    return (
      <div className="page">
        <h1>Keine Aufgaben ausgewählt</h1>
        <Link to="/aufgaben">Zur Aufgabenliste</Link>
      </div>
    );
  }

  const other = new URLSearchParams(params);
  other.set('art', kind === 'aufgaben' ? 'loesungen' : 'aufgaben');

  return (
    <div className="print-page">
      <div className="print-toolbar no-print">
        <button type="button" className="ghost" onClick={() => history.back()}>
          ← Zurück
        </button>
        <button type="button" onClick={() => window.print()}>
          🖨️ Drucken / Als PDF speichern
        </button>
        <button type="button" className="secondary" onClick={() => downloadText(`${sheet.fileBase}.md`, sheetToMarkdown(sheet, kind))}>
          ⬇ Markdown
        </button>
        <Link className="button secondary" to={`/druck?${other}`}>
          → {kind === 'aufgaben' ? 'Lösungsblatt' : 'Aufgabenblatt'}
        </Link>
        <span className="hint">Im Druckdialog „Als PDF speichern" wählen – Dateiname: {sheet.fileBase}.pdf</span>
      </div>

      <header className="sheet-head">
        <div>
          <h1>
            {kind === 'aufgaben' ? 'Aufgabenblatt' : 'Lösungsblatt'}: {sheet.title}
          </h1>
          <p>{sheet.subtitle}</p>
        </div>
        <div className="sheet-meta">
          <span>{formatPoints(sheet.totalPoints)} Punkte</span>
          {kind === 'aufgaben' ? <span>Name: ____________________</span> : <span>Erreicht: _____ / {formatPoints(sheet.totalPoints)}</span>}
          <span>Datum: {new Date().toLocaleDateString('de-DE')}</span>
        </div>
      </header>

      {kind === 'aufgaben' &&
        sheet.attachments.map((a) => (
          <section key={a.id} className="sheet-attachment">
            <h2>{a.title}</h2>
            <Markdown>{a.markdown}</Markdown>
          </section>
        ))}

      {sheet.groups.map((g, gi) => (
        <section key={gi} className="sheet-group">
          {g.heading && <h2>{g.heading}</h2>}
          {kind === 'aufgaben' && g.intro && <Markdown>{g.intro}</Markdown>}
          {g.tasks.map((t) => {
            const rights = t.auto?.pairs && shuffledOrder(t.auto.pairs.length, t.id).map((j) => t.auto!.pairs![j].right);
            return (
              <div key={t.id} className="sheet-task">
                <h3>{taskLabel(t)}</h3>
                <Markdown>{kind === 'aufgaben' ? taskMarkdown(t, rights) : solutionMarkdown(t)}</Markdown>
                {kind === 'aufgaben' && t.type === 'offen' && (
                  <div className="write-space" style={{ height: `${Math.min(22, 3 + t.points * 1.1)}em` }} />
                )}
                {kind === 'loesungen' && <p className="score-line">Erreicht: ______ / {formatPoints(t.points)} P</p>}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
