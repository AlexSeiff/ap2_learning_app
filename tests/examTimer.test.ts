import { describe, expect, it } from 'vitest';
import { formatRemaining, timerAnnouncement } from '../src/lib/examTimer';

const min = 60_000;

describe('formatRemaining', () => {
  it('zeigt mm:ss und nie negative Zeit', () => {
    expect(formatRemaining(90 * min)).toBe('90:00');
    expect(formatRemaining(65_500)).toBe('01:05');
    expect(formatRemaining(-5)).toBe('00:00');
  });
});

describe('timerAnnouncement', () => {
  it('ändert sich nur an den 5-Minuten-Marken', () => {
    expect(timerAnnouncement(90 * min)).toBe('Noch 90 Minuten.');
    expect(timerAnnouncement(85 * min + 1)).toBe('Noch 90 Minuten.');
    expect(timerAnnouncement(85 * min)).toBe('Noch 85 Minuten.');
    expect(timerAnnouncement(81 * min)).toBe('Noch 85 Minuten.');
    expect(timerAnnouncement(10 * min)).toBe('Noch 10 Minuten.');
  });

  it('sagt die letzte Minute und das Ende an', () => {
    expect(timerAnnouncement(2 * min)).toBe('Noch 5 Minuten.');
    expect(timerAnnouncement(min)).toBe('Noch 1 Minute.');
    expect(timerAnnouncement(1000)).toBe('Noch 1 Minute.');
    expect(timerAnnouncement(0)).toBe('Die Zeit ist abgelaufen.');
  });

  it('bleibt innerhalb eines Intervalls sekundengenau gleich', () => {
    const texts = new Set<string>();
    for (let ms = 80 * min + 1000; ms <= 85 * min; ms += 1000) texts.add(timerAnnouncement(ms));
    expect([...texts]).toEqual(['Noch 85 Minuten.']);
  });
});
