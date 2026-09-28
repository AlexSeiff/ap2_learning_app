import { describe, expect, it } from 'vitest';
import { datasetForSource, decodeQuery, encodeQuery, sqlEditorLink } from '../src/lib/sqlLinks';

describe('SQL-Editor-Links', () => {
  it('kodiert UTF-8 verlustfrei (Umlaute, Emoji)', () => {
    const sql = "SELECT name FROM kunde WHERE ort = 'München'; -- ✓";
    expect(decodeQuery(encodeQuery(sql))).toBe(sql);
  });

  it('liefert undefined für kaputte Parameter', () => {
    expect(decodeQuery('%%%')).toBeUndefined();
    expect(decodeQuery(btoa('\xff\xfe'))).toBeUndefined();
  });

  it('ordnet Quellen den Datensätzen zu', () => {
    expect(datasetForSource('DeepDive_01_SQL.md')).toBe('moebelhaus');
    expect(datasetForSource('DeepDive_01_SQL_Loesungen.md')).toBe('moebelhaus');
    expect(datasetForSource('Deep_Dive_SQL_KW28_29.md')).toBe('datafit');
    expect(datasetForSource('DeepDive_09_Datenqualitaet.md')).toBe('kundenimport');
    expect(datasetForSource('09')).toBe('kundenimport');
    expect(datasetForSource('00')).toBe('datafit');
    expect(datasetForSource('Lernzettel_Kernthemen.md')).toBe('moebelhaus');
    expect(datasetForSource()).toBe('moebelhaus');
  });

  it('baut einen Router-Pfad mit q und ds', () => {
    const link = sqlEditorLink('SELECT 1;\n', 'datafit');
    const params = new URLSearchParams(link.split('?')[1]);
    expect(link.startsWith('/sql?')).toBe(true);
    expect(params.get('ds')).toBe('datafit');
    expect(decodeQuery(params.get('q')!)).toBe('SELECT 1;');
  });
});
