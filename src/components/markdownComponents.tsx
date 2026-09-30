import { useMemo } from 'react';
import type { Components, ExtraProps, Options } from 'react-markdown';
import { Link } from 'react-router-dom';
import { rehypeLoesung, rehypeTabellen } from '../lib/loesungStil';
import { datasetForSource, sqlEditorLink } from '../lib/sqlLinks';

// Gemeinsame Bausteine für <Markdown> und die Formel-Variante (MathMarkdown, eigener Chunk).

type HastNode = NonNullable<ExtraProps['node']>['children'][number];

/** Reiner Text eines hast-Knotens (Inhalt eines Codeblocks). */
function textOf(node: HastNode): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'element') return node.children.map(textOf).join('');
  return '';
}

/** SQL-Text, wenn der <pre>-Block ein ```sql-Codeblock ist. */
function sqlOfPre(node: ExtraProps['node']): string | undefined {
  const code = node?.children.find((c) => c.type === 'element' && c.tagName === 'code');
  if (code?.type !== 'element') return undefined;
  const cls = code.properties.className;
  const classes = Array.isArray(cls) ? cls.map(String) : String(cls ?? '').split(' ');
  return classes.includes('language-sql') ? textOf(code) : undefined;
}

function makeComponents(source?: string | false): Components {
  const dataset = datasetForSource(source || undefined);
  return {
    // Breite Tabellen horizontal scrollbar machen statt das Layout zu sprengen.
    table: ({ children }) => (
      <div className="table-wrap">
        <table>{children}</table>
      </div>
    ),
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    ),
    // ```sql-Blöcke: Link in den SQL-Editor mit vorausgefüllter Abfrage und passendem Datensatz.
    pre: ({ node, children }) => {
      const sql = source === false ? undefined : sqlOfPre(node);
      if (!sql?.trim()) return <pre>{children}</pre>;
      return (
        <div className="sql-block">
          <pre>{children}</pre>
          <Link className="sql-open no-print" to={sqlEditorLink(sql, dataset)}>
            🧮 Im SQL-Editor öffnen
          </Link>
        </div>
      );
    },
  };
}

const defaultComponents = makeComponents();

/** Komponenten-Tabelle für react-markdown, abhängig von der Quelle (Datensatz für „Im SQL-Editor öffnen"). */
export function useMarkdownComponents(source?: string | false): Components {
  return useMemo(() => (source === undefined ? defaultComponents : makeComponents(source)), [source]);
}

export interface MarkdownProps {
  children: string;
  className?: string;
  source?: string | false;
  /** Musterlösung: Punkte-Abzeichen, Ergebnis-Kasten, Prüferkommentar-Kasten (lib/loesungStil.ts). */
  loesung?: boolean;
}

const tabellen: NonNullable<Options['rehypePlugins']> = [rehypeTabellen];
const loesungPlugins: NonNullable<Options['rehypePlugins']> = [rehypeTabellen, rehypeLoesung];

/** rehype-Plugins zur Gestaltung: Tabellen immer, Lösungs-Gestaltung nur mit `loesung`. */
export function stylePlugins(loesung?: boolean): NonNullable<Options['rehypePlugins']> {
  return loesung ? loesungPlugins : tabellen;
}
