import { useMemo } from 'react';
import ReactMarkdown, { type Components, type ExtraProps } from 'react-markdown';
import { Link } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import { datasetForSource, sqlEditorLink } from '../lib/sqlLinks';

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

/**
 * Markdown mit GFM. `source`: Quelldatei oder Deep Dive (z. B. „DeepDive_09_Datenqualitaet.md“ oder „09“) –
 * bestimmt den Datensatz für „🧮 Im SQL-Editor öffnen“ unter ```sql-Blöcken (Standard: Möbelhaus).
 * `source={false}` blendet den Link aus (Aufgabentexte und Klausuren – sonst verrät der Editor das Ergebnis).
 */
export function Markdown({ children, className, source }: { children: string; className?: string; source?: string | false }) {
  const components = useMemo(() => (source === undefined ? defaultComponents : makeComponents(source)), [source]);
  return (
    <div className={`md ${className ?? ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
