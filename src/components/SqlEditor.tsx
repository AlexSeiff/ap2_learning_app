// CodeMirror-6-Editor für SQL: Hervorhebung, Autovervollständigung (Tabellen/Spalten des Datensatzes),
// Tab = Vorschlag übernehmen, Strg/Cmd + Enter = Ausführen, Strg/Cmd + Umschalt + Enter = Prüfen. Wird nur auf den SQL-Seiten (lazy) geladen.

import { acceptCompletion, autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { sql, SQLite, type SQLNamespace } from '@codemirror/lang-sql';
import { bracketMatching, HighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { Compartment, EditorState, Prec } from '@codemirror/state';
import { drawSelection, EditorView, highlightActiveLine, keymap, lineNumbers, placeholder } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';
import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import type { SchemaTable } from '../sql/types';

export type SqlEditorHandle = {
  /** Text an der Cursorposition einfügen (z. B. Spaltenname aus dem Schema) und den Editor fokussieren. */
  insert: (text: string) => void;
  focus: () => void;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onCheck?: () => void;
  schema?: SchemaTable[];
  ariaLabel?: string;
  ref?: Ref<SqlEditorHandle>;
};

// Farben über die CSS-Variablen der App – folgt damit automatisch hell/dunkel.
const theme = EditorView.theme({
  '&': { backgroundColor: 'var(--surface)', color: 'var(--text)', fontSize: '0.95rem' },
  '&.cm-focused': { outline: 'none' },
  '.cm-content': { fontFamily: "'Cascadia Code', Consolas, ui-monospace, monospace", caretColor: 'var(--text)', padding: '8px 0' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--text)' },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--accent-soft) !important',
  },
  '.cm-gutters': { backgroundColor: 'var(--surface-2)', color: 'var(--muted)', border: 'none', borderRight: '1px solid var(--border)' },
  '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--accent-soft) 45%, transparent)' },
  '.cm-activeLineGutter': { backgroundColor: 'var(--accent-soft)' },
  '&.cm-focused .cm-matchingBracket': { backgroundColor: 'var(--accent-soft)', outline: '1px solid var(--accent)' },
  '.cm-placeholder': { color: 'var(--muted)' },
  '.cm-tooltip': { backgroundColor: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '6px' },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: 'var(--accent)', color: 'var(--accent-text)' },
  '.cm-completionDetail': { color: 'var(--muted)' },
});

const highlight = HighlightStyle.define([
  { tag: t.keyword, color: 'var(--accent)', fontWeight: '600' },
  { tag: [t.string, t.special(t.string)], color: 'var(--good)' },
  { tag: [t.number, t.bool, t.null], color: 'var(--mid)' },
  { tag: [t.comment, t.lineComment, t.blockComment], color: 'var(--muted)', fontStyle: 'italic' },
  { tag: [t.operator, t.punctuation, t.paren, t.bracket], color: 'var(--muted)' },
  { tag: [t.typeName, t.standard(t.name)], color: 'var(--low)' },
]);

function namespaceOf(schema?: SchemaTable[]): SQLNamespace {
  const ns: Record<string, string[]> = {};
  for (const table of schema ?? []) ns[table.name] = table.columns.map((c) => c.name);
  return ns;
}

const sqlLanguage = (schema?: SchemaTable[]) => sql({ dialect: SQLite, schema: namespaceOf(schema), upperCaseKeywords: true });

export function SqlEditor({ value, onChange, onRun, onCheck, schema, ariaLabel = 'SQL-Abfrage', ref }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const language = useRef(new Compartment());
  // Aktuelle Callbacks für die (einmal registrierten) Tastenkürzel und den Update-Listener.
  const handlers = useRef({ onChange, onRun, onCheck });
  useEffect(() => {
    handlers.current = { onChange, onRun, onCheck };
  });

  // Editor einmal anlegen; spätere value-/schema-Änderungen werden unten eingespielt.
  useEffect(() => {
    const v = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          history(),
          drawSelection(),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          autocompletion(),
          highlightActiveLine(),
          syntaxHighlighting(highlight),
          EditorView.lineWrapping,
          placeholder('SELECT … FROM …;'),
          EditorView.contentAttributes.of({ 'aria-label': ariaLabel }),
          Prec.highest(
            keymap.of([
              {
                key: 'Mod-Enter',
                run: () => {
                  handlers.current.onRun();
                  return true;
                },
              },
              {
                key: 'Mod-Shift-Enter',
                run: () => {
                  if (handlers.current.onCheck) handlers.current.onCheck();
                  else handlers.current.onRun();
                  return true;
                },
              },
            ]),
          ),
          // Tab übernimmt einen offenen Vorschlag; ohne Vorschlagsliste rückt Tab wie gewohnt ein.
          keymap.of([
            { key: 'Tab', run: acceptCompletion },
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...historyKeymap,
            ...completionKeymap,
            indentWithTab,
          ]),
          language.current.of(sqlLanguage()),
          theme,
          EditorView.updateListener.of((u) => {
            if (u.docChanged) handlers.current.onChange(u.state.doc.toString());
          }),
        ],
      }),
    });
    view.current = v;
    return () => {
      v.destroy();
      view.current = null;
    };
    // Nur beim Einhängen: value und ariaLabel gelten als Startwerte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Von außen gesetzter Text (Beispiel, Verlauf, Datensatzwechsel) – nur wenn er sich vom Editorinhalt unterscheidet.
  useEffect(() => {
    const v = view.current;
    if (!v) return;
    const current = v.state.doc.toString();
    if (current !== value) v.dispatch({ changes: { from: 0, to: current.length, insert: value } });
  }, [value]);

  useEffect(() => {
    view.current?.dispatch({ effects: language.current.reconfigure(sqlLanguage(schema)) });
  }, [schema]);

  useImperativeHandle(ref, () => ({
    insert: (text: string) => {
      const v = view.current;
      if (!v) return;
      const { from, to } = v.state.selection.main;
      v.dispatch({ changes: { from, to, insert: text }, selection: { anchor: from + text.length }, scrollIntoView: true });
      v.focus();
    },
    focus: () => view.current?.focus(),
  }));

  return <div ref={host} className="sql-editor" />;
}
