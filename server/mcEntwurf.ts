// `npm run mc-entwurf -- --deck <id> [--max 30] [--anwendung]` (ROADMAP 6.3, nur lokal):
// Claude schlägt für Karten des Decks ohne mc-Block Auswahlantworten vor → data/mc-entwurf.json zum Durchsehen.
// Kostet API-Guthaben (ANTHROPIC_API_KEY aus .env.local). Ändert AP2_FIDPA_Lernkarten.json nicht – das macht `npm run mc-uebernehmen`.

import './ladeEnv';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { aiEnabled, getClient, MODEL } from './ai';
import { ENTWURF_DATEI, LERNKARTEN_DATEI } from './mcEntwurfPfade';
import {
  entwerfeMc,
  ergaenzeEntwurf,
  leererEntwurf,
  leseEntwurf,
  mcClientAusAnthropic,
  mcKandidaten,
  type RohLernkarten,
} from './mcWerkzeug';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const data = JSON.parse(readFileSync(LERNKARTEN_DATEI, 'utf8')) as RohLernkarten;
  const deckId = arg('deck');
  const deck = data.decks.find((d) => d.id === deckId);
  if (!deck) {
    console.error(`Bitte ein Deck angeben: npm run mc-entwurf -- --deck <id>\nDecks: ${data.decks.map((d) => d.id).join(', ')}`);
    process.exit(1);
  }
  const max = Number(arg('max') ?? 30);
  if (!Number.isInteger(max) || max < 1) {
    console.error('--max muss eine positive ganze Zahl sein.');
    process.exit(1);
  }
  if (!aiEnabled()) {
    console.error('Kein ANTHROPIC_API_KEY gesetzt (lern-app/.env.local).');
    process.exit(1);
  }

  const gelesen = existsSync(ENTWURF_DATEI) ? leseEntwurf(readFileSync(ENTWURF_DATEI, 'utf8')) : { entwurf: leererEntwurf(), fehler: [] };
  if (gelesen.fehler.length) {
    console.error(`data/mc-entwurf.json hat Fehler – bitte erst korrigieren:\n  ${gelesen.fehler.join('\n  ')}`);
    process.exit(1);
  }
  const alle = mcKandidaten(data, deck.id, gelesen.entwurf, { anwendung: process.argv.includes('--anwendung') });
  const karten = alle.slice(0, max);
  if (!karten.length) {
    console.log(`Deck „${deck.id}“: keine Karten ohne mc-Block, die noch nicht im Entwurf stehen.`);
    return;
  }
  console.log(`Deck „${deck.id}“: ${karten.length} von ${alle.length} offenen Karten, Modell ${MODEL}.`);

  const r = await entwerfeMc(mcClientAusAnthropic(getClient()), MODEL, deck, karten, (m) => console.log(m));
  const entwurf = ergaenzeEntwurf(gelesen.entwurf, r.eintraege);
  mkdirSync(dirname(ENTWURF_DATEI), { recursive: true });
  writeFileSync(ENTWURF_DATEI, JSON.stringify(entwurf, null, 2) + '\n');
  console.log(`\n${r.eintraege.length} Vorschläge nach data/mc-entwurf.json geschrieben (insgesamt ${entwurf.eintraege.length} Einträge).`);
  if (r.fehler.length) console.log(`Hinweise:\n  ${r.fehler.join('\n  ')}`);
  console.log('Jetzt durchsehen, "status" auf "angenommen" oder "abgelehnt" setzen, dann: npm run mc-uebernehmen');
}

main().catch((e: Error) => {
  console.error(e.message);
  process.exit(1);
});
