import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type { Content, Task } from '../shared/types';
import { createContentCache, withGenerated } from '../server/contentCache';
import { isContentFile, isContentSource } from '../server/loadContent';

const task = (id: string, markdown = id) => ({ id, markdown }) as unknown as Task;

function content(): Content {
  return {
    importedAt: '2026-09-22T10:00:00.000Z',
    topics: [],
    tasks: { '01-A1': task('01-A1') },
    flashcards: [],
    decks: [],
    cardHints: [],
    materials: [],
    weeks: [],
    issues: [],
  };
}

describe('createContentCache', () => {
  it('lädt nur einmal und nach invalidate() erneut', () => {
    const load = vi.fn(content);
    const cache = createContentCache(load);
    const first = cache.get();
    expect(cache.get()).toBe(first);
    expect(load).toHaveBeenCalledTimes(1);
    cache.invalidate();
    expect(cache.get()).not.toBe(first);
    expect(load).toHaveBeenCalledTimes(2);
  });
});

describe('withGenerated', () => {
  it('mischt generierte Aufgaben ein, ohne das Original zu verändern', () => {
    const base = content();
    const merged = withGenerated(base, [task('gen-1'), task('01-A1', 'überschrieben')]);
    expect(Object.keys(merged.tasks).sort()).toEqual(['01-A1', 'gen-1']);
    expect(merged.tasks['01-A1'].markdown).toBe('überschrieben');
    expect(base.tasks).toEqual({ '01-A1': task('01-A1') });
    expect(merged.topics).toBe(base.topics);
  });

  it('gibt ohne generierte Aufgaben das Original zurück', () => {
    const base = content();
    expect(withGenerated(base, [])).toBe(base);
  });
});

describe('isContentSource', () => {
  const dir = join('C:', 'AP-2');

  it('erkennt Lernblätter und Lernkarten direkt im Quellordner', () => {
    expect(isContentSource(join(dir, '01_Thema.md'), dir)).toBe(true);
    expect(isContentSource(join(dir, 'AP2_FIDPA_Lernkarten.json'), dir)).toBe(true);
  });

  it('ignoriert Dateien der App selbst, Prompts und andere JSON-Dateien', () => {
    expect(isContentSource(join(dir, 'lern-app', 'README.md'), dir)).toBe(false);
    expect(isContentSource(join(dir, 'lern-app', 'data', 'generierte-aufgaben.json'), dir)).toBe(false);
    expect(isContentSource(join(dir, 'Prompt_Agent.md'), dir)).toBe(false);
    expect(isContentSource(join(dir, 'notizen.json'), dir)).toBe(false);
  });

  it('isContentFile entspricht dem Filter von loadContent()', () => {
    expect(isContentFile('Lernblatt.MD')).toBe(true);
    expect(isContentFile('lernkarten-extra.json')).toBe(true);
    expect(isContentFile('bild.png')).toBe(false);
  });
});
