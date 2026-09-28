// Links in den SQL-Editor („🧮 Im SQL-Editor öffnen“): Abfrage als Base64 (UTF-8) in ?q=, Datensatz in ?ds=.
// Rein und klein – wird von Markdown.tsx im Hauptbundle genutzt, ohne sql.js oder CodeMirror zu laden.

/** Standard-Datensatz, wenn eine Quelle keinem Datensatz zugeordnet ist. */
export const DEFAULT_SQL_DATASET = 'moebelhaus';

/** Datensatz zu einer Quelldatei (z. B. „DeepDive_01_SQL.md“) oder einem Deep Dive („01“). */
export function datasetForSource(source?: string): string {
  if (!source) return DEFAULT_SQL_DATASET;
  if (/Deep_Dive_SQL_KW28_29/i.test(source) || source === '00') return 'datafit';
  if (/DeepDive_09/i.test(source) || source === '09') return 'kundenimport';
  return DEFAULT_SQL_DATASET;
}

/** UTF-8-Text → Base64 (btoa allein kann nur Latin-1). */
export function encodeQuery(sql: string): string {
  let binary = '';
  for (const byte of new TextEncoder().encode(sql)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/** Base64 → UTF-8-Text; undefined bei kaputtem Parameter. */
export function decodeQuery(b64: string): string | undefined {
  try {
    const binary = atob(b64.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, ''));
    return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
  } catch {
    return undefined;
  }
}

/** Router-Pfad für den freien Modus mit vorausgefüllter Abfrage. */
export function sqlEditorLink(sql: string, dataset = DEFAULT_SQL_DATASET): string {
  return `/sql?${new URLSearchParams({ q: encodeQuery(sql.trim()), ds: dataset }).toString()}`;
}
