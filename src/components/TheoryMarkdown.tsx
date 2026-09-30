import { stripPrueferfragen } from '../../shared/prueferfragen';
import { Markdown } from './Markdown';

/** Theorie-Abschnitt in „Lernen“. Sind die Prüferfragen ausgeschaltet, fallen ihre Zitatblöcke (Frage und Antwort) weg. */
export function TheoryMarkdown({ markdown, source, prueferfragen }: { markdown: string; source?: string; prueferfragen: boolean }) {
  return <Markdown source={source}>{prueferfragen ? markdown : stripPrueferfragen(markdown)}</Markdown>;
}
