// Bulgot: sprawdza, czy shared/*.js jest aktualną kopią silnika z ../pl3y-server/src/games/bulgot/ (rng, data, stats, sim).
// Rozjazd = klient liczy walkę inaczej niż serwer (powtórka walki da inny wynik). Nic nie zmienia, tylko porównuje.
// Użycie: node dev/check-sync.mjs        (kod wyjścia 1 przy rozjeździe; naprawa: node dev/sync-engine.mjs)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, '../../pl3y-server/src/games/bulgot');
const dst = path.resolve(here, '../shared');
const FILES = ['rng.js', 'data.js', 'stats.js', 'sim.js'];   // jak w sync-engine.mjs

const bad = [];
for (const f of FILES) {
  const a = path.join(src, f), b = path.join(dst, f);
  if (!fs.existsSync(a)) { bad.push(`${f}: brak źródła ${a}`); continue; }
  if (!fs.existsSync(b)) { bad.push(`${f}: brak kopii w shared/`); continue; }
  const want = `// GENEROWANY plik: kopia z pl3y-server/src/games/bulgot/${f}. Nie edytuj; uruchom \`node dev/sync-engine.mjs\`.\n${fs.readFileSync(a, 'utf8')}`;
  const lf = s => s.replace(/\r\n/g, '\n');   // git z autocrlf potrafi zamienić końce linii; treść ma być ta sama
  if (lf(fs.readFileSync(b, 'utf8')) !== lf(want)) bad.push(`${f}: shared/ różni się od serwera`);
}
if (bad.length) {
  console.error('ROZJAZD silnika:\n  ' + bad.join('\n  ') + '\nNaprawa: node dev/sync-engine.mjs (potem commit w obu repo).');
  process.exit(1);
}
console.log('shared/ zgodny z serwerem (' + FILES.join(', ') + ')');
