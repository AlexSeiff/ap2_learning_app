// Importbericht: `npm run import-report`
import { loadContent, SOURCE_DIR } from './loadContent';

const c = loadContent();
console.log(`Quelle: ${SOURCE_DIR}\n`);
for (const t of c.topics) {
  const tasks = Object.values(c.tasks).filter((x) => x.topicId === t.id);
  const withSol = tasks.filter((x) => x.solution).length;
  const cards = c.flashcards.filter((f) => f.topicId === t.id);
  console.log(
    `${t.id} ${t.title.padEnd(48)} Abschnitte ${String(t.sections.length).padStart(2)} | Aufgaben ${String(tasks.length).padStart(2)} (${withSol} mit Lösung) | ` +
      `${t.exam?.totalPoints ?? 0} P | Karten ${cards.length} | Lernziele ${t.lernziele.length} | Anlagen ${t.exam?.attachments.length ?? 0}`,
  );
}
console.log(`\nLernkarten: ${c.flashcards.filter((f) => f.kind === 'lernkarte').length} in ${c.decks.length} Decks`);
for (const d of c.decks) {
  console.log(
    `  ${d.id.padEnd(5)} ${d.title.padEnd(48)} ${String(d.cardCount).padStart(3)} Karten → ${d.topicId ? `Deep Dive ${d.topicId}` : 'kein Deep Dive'}`,
  );
}
console.log(`\nMaterialien: ${c.materials.map((m) => m.title).join(', ')}`);
console.log(`Lernplan-Wochen: ${c.weeks.length}`);
console.log(`\nHinweise (${c.issues.length}):`);
for (const i of c.issues) console.log(`  - ${i.file}: ${i.message}`);
