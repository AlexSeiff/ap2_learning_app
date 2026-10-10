import { lazy, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { istSchlicht } from '../lib/markdownSchlicht';
import { type MarkdownProps, stylePlugins, useMarkdownComponents } from './markdownComponents';

// Formeln ($…$, $$…$$) mit KaTeX: eigener Chunk, damit remark-math, rehype-katex und KaTeX (samt CSS und Schriften)
// nicht im Hauptbundle landen. Bis er geladen ist, erscheint derselbe Text ohne Formelsatz.
const MathMarkdown = lazy(() => import('./MathMarkdown'));

/**
 * Markdown mit GFM. `source`: Quelldatei oder Deep Dive (z. B. „DeepDive_09_Datenqualitaet.md“ oder „09“) –
 * bestimmt den Datensatz für „🧮 Im SQL-Editor öffnen“ unter ```sql-Blöcken (Standard: Möbelhaus).
 * `source={false}` blendet den Link aus (Aufgabentexte und Klausuren – sonst verrät der Editor das Ergebnis).
 * `math`: Formeln mit KaTeX setzen (Lernen, Lösungen, Material). `loesung`: Musterlösung gestalten (Punkte, Ergebnis, Prüferkommentar).
 */
export function Markdown({ math, ...props }: MarkdownProps & { math?: boolean }) {
  if (!math) return <PlainMarkdown {...props} />;
  return (
    <Suspense fallback={<PlainMarkdown {...props} />}>
      <MathMarkdown {...props} />
    </Suspense>
  );
}

function PlainMarkdown({ children, className, source, loesung, operatoren }: MarkdownProps) {
  const components = useMarkdownComponents(source);
  // Schlichter Text (kein Markdown-Zeichen): gleiche Ausgabe ohne Parser. Lösungs- und Operatoren-Stil verändern auch reinen Text.
  if (!loesung && !operatoren && istSchlicht(children)) {
    return (
      <div className={`md ${className ?? ''}`}>
        <p>{children}</p>
      </div>
    );
  }
  return (
    <div className={`md ${className ?? ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={stylePlugins(loesung, operatoren)} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
