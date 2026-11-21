// Kopiuje wspólny silnik Bulgota z serwera (../pl3y-server/src/games/bulgot/) do bulgot/shared/.
// Frontend działa na GitHub Pages i nie widzi folderu serwera, więc dostaje kopię: ten sam silnik walki i te same dane,
// co serwer (serwer powtarza walkę z wejść gracza, więc oba muszą liczyć identycznie).
// Użycie: node dev/sync-engine.mjs   (po każdej zmianie rng.js, data.js, stats.js albo sim.js na serwerze)
// Pliki w shared/ są GENEROWANE: nie edytuj ich ręcznie.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, '../../pl3y-server/src/games/bulgot');
const dst = path.resolve(here, '../shared');
const FILES = ['rng.js', 'data.js', 'stats.js', 'sim.js'];

fs.mkdirSync(dst, { recursive: true });
for (const f of FILES) {
  const body = fs.readFileSync(path.join(src, f), 'utf8');
  fs.writeFileSync(path.join(dst, f), `// GENEROWANY plik: kopia z pl3y-server/src/games/bulgot/${f}. Nie edytuj; uruchom \`node dev/sync-engine.mjs\`.\n${body}`);
  console.log('skopiowano', f);
}
