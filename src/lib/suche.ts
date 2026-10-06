// Globale Suche (ROADMAP 8.8, Strg+K): Index über Lernblätter (Abschnitte), Material, Karteikarten, Aufgaben samt Musterlösungen, SQL- und
// Rechenübungen, Formeln, Operatoren und Glossar – und die Rangfolge der Treffer. Rein, ohne React; geladen wird das Modul
// erst mit dem Suchdialog (lazy), der Index entsteht beim ersten Öffnen.
//
// Normalisierung (deutschfreundlich): klein, Akzente weg (é → e), Umlaute und ihre Umschreibung gleich (ä/ae → a, ö/oe → o,
// ü/ue → u), ß → ss, Satzzeichen → Leerzeichen. So findet „Pruefung“, „Prüfung“ und „prufung“ dasselbe, „Groesse“ auch „Größe“.
// Rangfolge: Jedes Suchwort muss vorkommen (UND). Punkte je Wort: Titel-Wort genau 12, Titel-Wortanfang 8, im Titel 5,
// Text-Wortanfang 2, im Text 1; der ganze Suchtext im Titel +10, Titel beginnt damit +6; dazu ein kleiner Bonus je Art
// (Glossar, Formel, Operator, Abschnitt vor Karte, Aufgabe, Musterlösung, Übung). Gleichstand → kürzerer Titel, dann Index-Reihenfolge.

import { stripPrueferfragen } from '../../shared/prueferfragen';
import type { Settings } from '../../shared/progress';
import type { Content } from '../../shared/types';
import { FORMELN, THEMA_NAMEN } from '../rechnen/formeln';
import { cardPool } from './cards';
import { normalisiere } from './normalisiere';
import { OPERATOREN } from './operatoren';

export { normalisiere };

export type SuchArt = 'glossar' | 'abschnitt' | 'formel' | 'operator' | 'material' | 'karte' | 'aufgabe' | 'loesung' | 'sql' | 'rechnen';

export const SUCH_ART: Record<SuchArt, { icon: string; name: string; bonus: number }> = {
  glossar: { icon: '📚', name: 'Glossar', bonus: 3 },
  abschnitt: { icon: '📖', name: 'Lernblatt', bonus: 2 },
  formel: { icon: '📏', name: 'Formel', bonus: 2 },
  operator: { icon: '🗣️', name: 'Operator', bonus: 2 },
  material: { icon: '📄', name: 'Material', bonus: 1 },
  karte: { icon: '🃏', name: 'Karteikarte', bonus: 1 },
  aufgabe: { icon: '📝', name: 'Aufgabe', bonus: 0 },
  loesung: { icon: '✅', name: 'Musterlösung', bonus: 0 },
  sql: { icon: '🧮', name: 'SQL-Übung', bonus: 0 },
  rechnen: { icon: '📐', name: 'Rechenübung', bonus: 0 },
};

export interface SuchEintrag {
  art: SuchArt;
  titel: string;
  /** Wo: „Deep Dive 3 · Statistik I“ usw. */
  kontext: string;
  /** Klartext für Treffer und Ausschnitt. */
  text: string;
  /** Ziel in der App (HashRouter-Pfad), z. B. „/lernen/03?stelle=03-teil-3-lagemasse“. */
  link: string;
  titelN: string;
  textN: string;
}

export interface SuchTreffer {
  eintrag: SuchEintrag;
  punkte: number;
  /** Textausschnitt um den ersten Treffer (leer, wenn das Suchwort nur im Titel steht). */
  ausschnitt: string;
}

/** Markdown/LaTeX → Klartext für die Suche (grob, aber robust). */
export function klartext(md: string): string {
  return md
    .replace(/```svg[\s\S]*?```/g, ' ') // Diagramme (SVG-Markup) nicht durchsuchen
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\{\{\s*[\w.-]+\s*\}\}/g, ' … ')
    .replace(/\\(text|mathrm|mathbf)\{([^}]*)\}/g, '$2')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/^\s*[-*+]\s+\[[ xX]\]\s*/gm, '')
    .replace(/[*_`#>|$~{}\\]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Bindestrich-Wörter zusätzlich zusammengeschrieben („k-NN“ → „knn“, „E-Mail“ → „email“), damit auch „knn“ sie findet. */
const zusammen = (s: string) =>
  (s.match(/[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)+/gu) ?? []).map((w) => normalisiere(w).replace(/ /g, '')).join(' ');

const eintrag = (art: SuchArt, titel: string, kontext: string, text: string, link: string): SuchEintrag => ({
  art,
  titel,
  kontext,
  text,
  link,
  titelN: ` ${normalisiere(titel)} ${zusammen(titel)} `,
  textN: ` ${normalisiere(text)} ${zusammen(text)} `,
});

/** Kurztext für Titel aus einem längeren Text (erste Zeile, gekürzt). */
const kurz = (s: string, max = 90) => {
  const t = klartext(s.split('\n').find((l) => l.trim()) ?? s);
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()} …` : t;
};

const ddName = (content: Content, topicId: string | undefined) => {
  const t = content.topics.find((x) => x.id === topicId);
  if (!t) return '';
  return t.id === '00' ? `SQL-Zusatz · ${t.title}` : `Deep Dive ${t.number} · ${t.title}`;
};

/** Zusätzliche Einträge (z. B. das Glossar aus 8.9), die der Index übernimmt. */
export type ZusatzEintrag = { art: SuchArt; titel: string; kontext: string; text: string; link: string };

/**
 * Baut den Suchindex. `settings`: ausgeschaltete Prüferfragen/Fachgespräch-Karten fehlen (cardPool), ausgeschaltete Prüferfragen
 * auch im Text der Lernblätter (wie in „Lernen“).
 */
export function baueSuchIndex(
  content: Content,
  settings: Pick<Settings, 'prueferfragen' | 'fachgespraech'>,
  zusatz: ZusatzEintrag[] = [],
): SuchEintrag[] {
  const out: SuchEintrag[] = [];
  for (const z of zusatz) out.push(eintrag(z.art, z.titel, z.kontext, z.text, z.link));

  for (const t of content.topics) {
    const kontext = ddName(content, t.id);
    for (const s of t.sections) {
      if (s.generiert) continue; // Glossar-Liste: die Begriffe stehen schon als Glossar-Einträge im Index
      const md = settings.prueferfragen ? s.markdown : stripPrueferfragen(s.markdown);
      out.push(eintrag('abschnitt', s.title, kontext, klartext(md), `/lernen/${t.id}?stelle=${encodeURIComponent(s.id)}`));
    }
  }
  for (const m of content.materials) {
    out.push(eintrag('material', m.title, 'Material', klartext(m.markdown), `/material/${m.id}`));
  }
  for (const c of cardPool(content.flashcards, settings)) {
    const deck = c.deckId ? content.decks.find((d) => d.id === c.deckId)?.title : undefined;
    const art =
      c.kind === 'prueferfrage' ? 'Prüferfrage' : c.kind === 'fachgespraech' ? 'Fachgespräch' : `Lernkarte${deck ? ` · ${deck}` : ''}`;
    const wo = ddName(content, c.topicId);
    out.push(
      eintrag(
        'karte',
        kurz(c.question, 110),
        wo ? `${art} · ${wo}` : art,
        klartext(`${c.question}\n${c.answer ?? ''}`),
        `/karteikarten?karten=${encodeURIComponent(c.id)}&von=suche`,
      ),
    );
  }
  for (const task of Object.values(content.tasks)) {
    out.push(
      eintrag(
        'aufgabe',
        `${task.code}: ${kurz(task.markdown)}`,
        ddName(content, task.topicId) || 'KI-Aufgabe',
        klartext(task.markdown),
        `/aufgabe/${encodeURIComponent(task.id)}`,
      ),
    );
    // Musterlösung als eigener Treffer: Begriffe, die nur in der Lösung stehen (z. B. aus den *_Loesungen.md), werden gefunden,
    // ohne dass der Ausschnitt beim Treffer „Aufgabe“ die Lösung verrät.
    if (task.solution?.markdown.trim()) {
      out.push(
        eintrag(
          'loesung',
          `${task.code}: ${kurz(task.markdown, 80)}`,
          `Musterlösung · ${ddName(content, task.topicId) || 'KI-Aufgabe'}`,
          klartext(task.solution.markdown),
          `/aufgabe/${encodeURIComponent(task.id)}`,
        ),
      );
    }
  }
  for (const e of content.sqlExercises) {
    out.push(
      eintrag(
        'sql',
        e.titel,
        `${e.thema} · ${e.id}`,
        klartext(`${e.aufgabe}\n${e.tags.join(' ')}`),
        `/sql/uebung/${encodeURIComponent(e.id)}`,
      ),
    );
  }
  for (const u of content.rechenUebungen) {
    out.push(
      eintrag(
        'rechnen',
        u.titel,
        `${u.thema} · ${u.id}`,
        klartext(`${u.aufgabe}\n${u.tags.join(' ')}`),
        `/rechnen/${encodeURIComponent(u.id)}`,
      ),
    );
  }
  for (const f of FORMELN) {
    const text = `${f.erklaerung} ${f.variablen.map((v) => v.bedeutung).join(' ')}`;
    out.push(
      eintrag('formel', f.name, `Formelsammlung · ${THEMA_NAMEN[f.thema] ?? f.thema}`, text, `/material/formeln?stelle=formel-${f.id}`),
    );
  }
  for (const o of OPERATOREN) {
    out.push(eintrag('operator', o.name, 'Operatoren', `${o.verlangt} ${o.punkte} ${o.tipp}`, `/material/operatoren?stelle=op-${o.id}`));
  }
  return out;
}

const wortAnfang = (hay: string, w: string) => hay.includes(` ${w}`);
const wortGenau = (hay: string, w: string) => hay.includes(` ${w} `);

/** Punkte eines Eintrags für die Suchwörter (0 = kein Treffer: mindestens ein Wort fehlt). */
export function bewerte(e: SuchEintrag, woerter: string[], ganz: string): number {
  let punkte = 0;
  for (const w of woerter) {
    if (wortGenau(e.titelN, w)) punkte += 12;
    else if (wortAnfang(e.titelN, w)) punkte += 8;
    else if (e.titelN.includes(w)) punkte += 5;
    else if (wortAnfang(e.textN, w)) punkte += 2;
    else if (e.textN.includes(w)) punkte += 1;
    else return 0;
  }
  if (woerter.length > 1 && e.titelN.includes(ganz)) punkte += 10;
  if (e.titelN.startsWith(` ${ganz}`)) punkte += 6;
  return punkte + SUCH_ART[e.art].bonus;
}

/** Ausschnitt aus dem Klartext um das erste Wort, das ein Suchwort enthält (etwa 160 Zeichen). */
export function ausschnitt(text: string, woerter: string[], laenge = 160): string {
  const teile = text.split(/(\s+)/);
  let pos = -1;
  let zeichen = 0;
  for (const t of teile) {
    const n = normalisiere(t);
    const z = n.replace(/ /g, '');
    if (n && woerter.some((w) => n.includes(w) || z.includes(w))) {
      pos = zeichen;
      break;
    }
    zeichen += t.length;
  }
  if (pos < 0) return '';
  const start = Math.max(0, pos - 50);
  const roh = text.slice(start, start + laenge);
  const anfang = start > 0 ? roh.replace(/^\S*\s/, '') : roh;
  return `${start > 0 ? '… ' : ''}${anfang}${start + laenge < text.length ? ' …' : ''}`;
}

/** Sucht im Index; höchstens `max` Treffer, beste zuerst. Suchtext kürzer als 2 Zeichen → keine Treffer. */
export function suche(index: SuchEintrag[], anfrage: string, max = 40): SuchTreffer[] {
  const ganz = normalisiere(anfrage);
  if (ganz.length < 2) return [];
  const woerter = [...new Set(ganz.split(' ').filter(Boolean))];
  const treffer: { e: SuchEintrag; punkte: number; i: number }[] = [];
  index.forEach((e, i) => {
    const punkte = bewerte(e, woerter, ganz);
    if (punkte > 0) treffer.push({ e, punkte, i });
  });
  treffer.sort((a, b) => b.punkte - a.punkte || a.e.titel.length - b.e.titel.length || a.i - b.i);
  return treffer.slice(0, max).map(({ e, punkte }) => ({ eintrag: e, punkte, ausschnitt: ausschnitt(e.text, woerter) }));
}
