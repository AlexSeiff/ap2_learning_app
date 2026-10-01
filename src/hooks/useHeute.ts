import { useSyncExternalStore } from 'react';
import { localDate } from '../lib/progress';
import { abonniereSitzung, holeSitzung, sitzungVonHeute, type HeuteSitzung } from '../lib/heuteSitzung';

/** Laufende „Heute lernen“-Runde dieses Geräts (nur von heute; sonst undefined). */
export function useHeuteSitzung(): HeuteSitzung | undefined {
  const s = useSyncExternalStore(abonniereSitzung, holeSitzung, () => undefined);
  return sitzungVonHeute(s, localDate());
}
