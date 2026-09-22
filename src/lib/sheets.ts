// Erzeugt getrennte Aufgaben- und Lösungsblätter (Markdown) aus einer Aufgabenauswahl.

import type { Content, Section, Task } from '../../shared/types';
import { formatPoints } from './grading';
import { localDate } from './progress';

export type SheetKind = 'aufgaben' | 'loesungen';

export interface SheetGroup {
  heading?: string;
  intro?: string;
  tasks: Task[];
}

export interface Sheet {
  title: string;
  subtitle: string;
  fileBase: string;
  attachments: Section[];
  groups: SheetGroup[];
  totalPoints: number;
}

function safeName(s: string): string {
  return s
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue')
    .replace(/ß/g, 'ss')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

/** Blatt für eine komplette Übungsklausur eines Themas. */
export function examSheet(content: Content, topicId: string, kind: SheetKind): Sheet | null {
  const topic = content.topics.find((t) => t.id === topicId);
  if (!topic?.exam) return null;
  const groups = topic.exam.blocks.map((b) => ({
    heading: `Block ${b.letter} – ${b.title} (${formatPoints(b.points)} P)`,
    intro: b.intro,
    tasks: b.taskIds.map((id) => content.tasks[id]).filter(Boolean),
  }));
  return {
    title: topic.exam.title,
    subtitle: `Deep Dive ${topic.number}: ${topic.title}`,
    fileBase: `${kind === 'aufgaben' ? 'Aufgabenblatt' : 'Loesungsblatt'}_${safeName(topic.title)}_${localDate()}`,
    attachments: topic.exam.attachments,
    groups,
    totalPoints: topic.exam.totalPoints,
  };
}

/** Blatt für eine freie Auswahl von Aufgaben (gruppiert nach Thema). */
export function selectionSheet(content: Content, taskIds: string[], kind: SheetKind): Sheet {
  const tasks = taskIds.map((id) => content.tasks[id]).filter(Boolean);
  const topicIds = [...new Set(tasks.map((t) => t.topicId))];
  const topics = topicIds.map((id) => content.topics.find((t) => t.id === id)!).filter(Boolean);
  const name = topics.length === 1 ? topics[0].title : 'Gemischt';
  return {
    title: 'Übungsblatt',
    subtitle: topics.map((t) => t.title).join(' · '),
    fileBase: `${kind === 'aufgaben' ? 'Aufgabenblatt' : 'Loesungsblatt'}_${safeName(name)}_${localDate()}`,
    // Anlagen nur bei einem Thema, sonst würde das Blatt unübersichtlich.
    attachments: topics.length === 1 && topics[0].exam ? topics[0].exam.attachments : [],
    groups: topics.map((t) => ({
      heading: topics.length > 1 ? t.title : undefined,
      tasks: tasks.filter((x) => x.topicId === t.id),
    })),
    totalPoints: tasks.reduce((s, t) => s + t.points, 0),
  };
}

export function taskLabel(t: Task): string {
  return `${t.code} (${formatPoints(t.points)} P)`;
}

/** Lösungstext inkl. Auswahlantworten für automatisch bewertete Aufgaben. */
export function solutionMarkdown(t: Task): string {
  const parts: string[] = [];
  const a = t.auto;
  if (a?.options && a.correct)
    parts.push(`**Richtig:** ${a.correct.map((i) => `${String.fromCharCode(65 + i)}) ${a.options![i]}`).join(' · ')}`);
  if (a?.blanks) parts.push(`**Lücken:** ${a.blanks.map((b, i) => `[${i + 1}] ${b}`).join(' · ')}`);
  if (a?.pairs) parts.push(`**Zuordnung:**\n\n${a.pairs.map((p) => `- ${p.left} → ${p.right}`).join('\n')}`);
  if (a?.numeric) parts.push(`**Ergebnis:** ${formatPoints(a.numeric.value)}${a.numeric.unit ? ` ${a.numeric.unit}` : ''}`);
  if (t.solution?.markdown) parts.push(t.solution.markdown);
  if (t.solution?.kommentar) parts.push(`> *Prüferkommentar: ${t.solution.kommentar}*`);
  return parts.join('\n\n') || '*Keine Musterlösung vorhanden.*';
}

/** Aufgabentext inkl. Auswahlmöglichkeiten (für das Aufgabenblatt). */
export function taskMarkdown(t: Task, shuffledRights?: string[]): string {
  const a = t.auto;
  let md = t.type === 'lueckentext' ? numberBlanks(t.markdown) : t.markdown;
  if (a?.options) md += '\n\n' + a.options.map((o, i) => `- ☐ ${String.fromCharCode(65 + i)}) ${o}`).join('\n');
  if (a?.pairs) {
    const rights = shuffledRights ?? a.pairs.map((p) => p.right);
    md +=
      '\n\n| Begriff | Nr. | | Erklärung |\n|---|---|---|---|\n' +
      a.pairs.map((p, i) => `| ${p.left} | ___ | ${i + 1} | ${rights[i]} |`).join('\n');
  }
  return md;
}

export function numberBlanks(md: string): string {
  let i = 0;
  return md.replace(/_{3,}/g, () => ` **[${++i}]** ______ `);
}

export function sheetToMarkdown(sheet: Sheet, kind: SheetKind): string {
  const out: string[] = [
    `# ${kind === 'aufgaben' ? 'Aufgabenblatt' : 'Lösungsblatt'}: ${sheet.title}`,
    `*${sheet.subtitle} · ${formatPoints(sheet.totalPoints)} Punkte · Stand ${localDate()}*`,
  ];
  if (kind === 'aufgaben') {
    for (const a of sheet.attachments) out.push(`## ${a.title}\n\n${a.markdown}`);
  }
  for (const g of sheet.groups) {
    out.push('---');
    if (g.heading) out.push(`## ${g.heading}`);
    if (g.intro && kind === 'aufgaben') out.push(g.intro);
    for (const t of g.tasks) {
      out.push(`**${taskLabel(t)}:** ${kind === 'aufgaben' ? taskMarkdown(t) : solutionMarkdown(t)}`);
    }
  }
  return out.join('\n\n').replace(/\n{3,}/g, '\n\n') + '\n';
}

export function downloadText(filename: string, text: string, type = 'text/markdown') {
  const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
