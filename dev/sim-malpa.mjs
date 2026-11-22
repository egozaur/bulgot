// Bulgot: symulacja „małp”. Małpa gra losowo: losuje kafelki, drzwi, odznaki i zakłady oraz wciska losowe umiejętności.
// Liczy, jaki procent małp odpada na danym piętrze (z tych, które do niego dotarły), osobno dla trybu i Garnka.
// Wynik trafia do `malpy.js` (używają go ciekawostki na ekranie porażki), więc po zmianie balansu trzeba go przeliczyć:
//   node dev/sim-malpa.mjs [--n 2000] [--write]      (bez --write tylko pokazuje tabelę)   |   node dev/sim-malpa.mjs --check
// Skrypt używa dokładnie tych samych reguł co serwer (rules.js, sim.js), więc liczby są prawdziwe.
import { writeFileSync } from 'node:fs';
import { choose as chooseOpt, newRun, pickTile, buyOffer, shopBuy, bet, bonusPick, fightSetup, fightFinish, RUN_V } from '../../pl3y-server/src/games/bulgot/rules.js';
import { Fight } from '../../pl3y-server/src/games/bulgot/sim.js';
import { TILES, TILE_BY_ID, MODES, STARTER_TILES } from '../../pl3y-server/src/games/bulgot/data.js';
import { makeRng, mix } from '../../pl3y-server/src/games/bulgot/rng.js';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const N = +arg('n', 600), WRITE = process.argv.includes('--write');
const GARNEKS = [0, 1, 2, 3, 4, 5];

// --check: sprawdza tylko, czy zapisany malpy.js pasuje do bieżącej wersji reguł runu (RUN_V); kod wyjścia 1 = trzeba przeliczyć.
if (process.argv.includes('--check')) {
  const { MALPY } = await import('../malpy.js');
  if (MALPY.v !== RUN_V) { console.error('malpy.js jest z wersji reguł ' + MALPY.v + ', a bieżąca to ' + RUN_V + '. Przelicz: node dev/sim-malpa.mjs --n 2000 --write'); process.exit(1); }
  console.log('malpy.js zgodny z RUN_V ' + RUN_V + ' (' + MALPY.n + ' małp na przekrój). Po zmianie balansu przelicz go ręcznie.'); process.exit(0);
}

// Małpa wciska losowe umiejętności (ok. 7% szansy na tick, gdy umiejętność jest gotowa).
function monkeyInputs(setup, rng) {
  const f = new Fight(setup), inputs = [];
  while (!f.over) {
    const now = [];
    f.skills.forEach((s, slot) => { if (f.tick >= s.cd && f.tick >= s.blockedUntil && rng.int(100) < 7) now.push(slot); });
    for (const slot of now) inputs.push([f.tick, slot]);
    f.step(now);
  }
  return inputs;
}

function monkeyRun(mode, garnek, seed) {
  const rng = makeRng(mix(seed, 4242));
  const pool = TILES.filter(t => !t.lock || true).map(t => t.id);   // małpa ma całą pulę, jak gracz po odblokowaniach
  const run = newRun({ mode, char: 'pyrtek', garnek, pool, seed }).run;
  let guard = 0;
  while (run.phase !== 'over' && guard++ < 500) {
    if (run.phase === 'offer') {
      const i = rng.int(run.offer.length), t = TILE_BY_ID[run.offer[i]];
      const slot = t && t.type === 'skill' && run.skills.length >= 3 && !run.skills.find(s => s.id === t.skill) ? rng.int(3) : undefined;
      const res = pickTile(run, i, slot, 1 + rng.int(2));
      if (res.err) { let k = run.offer.findIndex(id => id && TILE_BY_ID[id].type === 'stat'); if (k < 0) k = run.offer.findIndex(id => id && !TILE_BY_ID[id].event); pickTile(run, Math.max(0, k), 0, 1); }
    } else if (run.phase === 'event') {
      if (run.pending.kind === 'shop') shopBuy(run, rng.int(run.pending.offer.length + 1) - 1, 0, 1);
      else if (run.pending.kind === 'contract') chooseOpt(run, rng.int(2));
      else if (run.pending.kind === 'shrine') chooseOpt(run, run.pending.badge && rng.int(2) ? 1 : 0);
      else bet(run, rng.int(run.coins + 1));
    } else if (run.phase === 'door') chooseOpt(run, rng.int(2));
    else if (run.phase === 'badge') chooseOpt(run, rng.int(run.pending.offer.length));
    else if (run.phase === 'bonus') {
      const i = rng.int(run.offer.length), t = TILE_BY_ID[run.offer[i]];
      const res = bonusPick(run, i, t && t.type === 'skill' && run.skills.length >= 3 ? rng.int(3) : undefined, 1 + rng.int(2));
      if (res.err) bonusPick(run, i, 0, 1);
    } else if (run.phase === 'fight') {
      const { setup } = fightSetup(run);
      fightFinish(run, monkeyInputs(setup, rng));
    }
  }
  return run;
}

const out = { v: RUN_V, n: N };
for (const mode of Object.keys(MODES)) {
  const rounds = MODES[mode].rounds; out[mode] = {};
  for (const g of GARNEKS) {
    const died = Array(rounds + 1).fill(0);
    let wins = 0;
    for (let s = 0; s < N; s++) {
      const run = monkeyRun(mode, g, (g + 1) * 100003 + s);
      if (run.ended === 'win') wins++; else died[Math.min(rounds, run.round)]++;
    }
    // hazard[r] = % małp, które odpadły na piętrze r, spośród tych, które do niego dotarły; reach[r] = % małp, które w ogóle dotarły do piętra r
    let reached = N; const hazard = [], reach = [];
    for (let r = 1; r <= rounds; r++) { reach[r - 1] = Math.round(reached / N * 1000) / 10; hazard[r - 1] = reached ? Math.round(died[r] / reached * 1000) / 10 : 0; reached -= died[r]; }
    out[mode][g] = { hazard, reach, win: Math.round(wins / N * 1000) / 10 };
    console.log(`${mode} G${g}: wygrane ${(wins / N * 100).toFixed(1)}%  odpadają (% z dotarłych): ${hazard.map((h, i) => (i + 1) + ':' + h).join(' ')}`);
  }
}
if (WRITE) {
  writeFileSync(new URL('../malpy.js', import.meta.url), `// GENEROWANE przez dev/sim-malpa.mjs (nie edytuj ręcznie). Wersja reguł runu: ${RUN_V}, ${N} małp na tryb i poziom Garnka.\n// hazard[r-1] = % małp, które odpadły na piętrze r, spośród tych, które do niego dotarły; reach[r-1] = % małp, które dotarły do piętra r.\nexport const MALPY = ${JSON.stringify(out)};\n`);
  console.log('Zapisano malpy.js');
}
