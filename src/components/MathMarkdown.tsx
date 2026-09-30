import 'katex/dist/katex.min.css';
import ReactMarkdown, { type Options } from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { escapeStrayDollars } from '../lib/mathDollar';
import { type MarkdownProps, stylePlugins, useMarkdownComponents } from './markdownComponents';

// Nur über <Markdown math> (lazy) laden – dieses Modul zieht KaTeX samt CSS und Schriften nach.
// Schriften und CSS bündelt Vite in assets/ (relative Pfade, funktioniert offline und auf Pages).

const remarkPlugins: Options['remarkPlugins'] = [remarkGfm, remarkMath];
// strict 'ignore': Umlaute in Formeln (\text{Qualität}) nicht in der Konsole anmahnen; Fehler rot statt Absturz.
const katex: NonNullable<Options['rehypePlugins']>[number] = [
  rehypeKatex,
  { throwOnError: false, strict: 'ignore', errorColor: 'var(--low)' },
];
const rehypePlugins = { plain: [katex, ...stylePlugins(false)], loesung: [katex, ...stylePlugins(true)] };

export default function MathMarkdown({ children, className, source, loesung }: MarkdownProps) {
  const components = useMarkdownComponents(source);
  return (
    <div className={`md ${className ?? ''}`}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={loesung ? rehypePlugins.loesung : rehypePlugins.plain}
        components={components}
      >
        {escapeStrayDollars(children)}
      </ReactMarkdown>
    </div>
  );
}
