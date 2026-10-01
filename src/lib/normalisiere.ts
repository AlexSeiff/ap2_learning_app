// Deutschfreundliche Normalisierung für Suche (ROADMAP 8.8) und Glossar (8.9): klein, Akzente weg (é → e), Umlaute und ihre
// Umschreibung gleich (ä/ae → a, ö/oe → o, ü/ue → u), ß → ss, alles außer Buchstaben und Ziffern → ein Leerzeichen.

/** Kombinierende Akzente nach der NFD-Zerlegung (U+0300 bis U+036F). */
const AKZENTE = new RegExp('[\\u0300-\\u036f]', 'g');

export function normalisiere(text: string): string {
  return text
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(AKZENTE, '')
    .replace(/ae/g, 'a')
    .replace(/oe/g, 'o')
    .replace(/ue/g, 'u')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
