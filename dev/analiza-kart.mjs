// Bulgot: analiza wartości kart statystyk. Dla migawek buildów z różnych etapów runu (bot wybiera najlepszy kafelek z oferty)
// liczy, o ile procent rośnie siła buildu (obrażenia na sekundę × wytrzymałość), gdy dodać dany kafelek.
// Użycie: node dev/analiza-kart.mjs [--n 150] [--char pyrtek] [--mode full] [--all] (--all: także przedmioty i umiejętności)
import { newRun, pickTile, makeOffer, statsOf } from '../../pl3y-server/src/games/bulgot/rules.js';
import { TILES, TILE_BY_ID, STAT_FAMS, MODES } from '../../pl3y-server/src/games/bulgot/data.js';
import { power } from './lib-power.mjs';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const N = +arg('n', 150), CHAR = arg('char', 'pyrtek'), MODE = arg('mode', 'full'), ALL = process.argv.includes('--all');
const rounds = MODES[MODE].rounds;
const STAGES = [['start', 1], ['wczesny', Math.ceil(rounds * 0.25)], ['środek', Math.ceil(rounds * 0.5)], ['późny', Math.ceil(rounds * 0.8)]];
const pool = TILES.map(t => t.id);

const gain = (run, id) => { const t = TILE_BY_ID[id]; if (t.type === 'skill') return null; const tr = JSON.parse(JSON.stringify(run)); tr.tiles.push(id); return power(tr) / power(run) - 1; };

// migawki: run doprowadzony do danej rundy samym wybieraniem kafelków (bez walk), zawsze najlepszy z oferty
const snaps = STAGES.map(() => []);
for (let s = 0; s < N; s++) {
  const r = newRun({ mode: MODE, char: CHAR, garnek: 0, pool, seed: 9000 + s });
  const run = r.run;
  for (let round = 1; round <= STAGES[STAGES.length - 1][1]; round++) {
    run.round = round; run.phase = 'offer'; run.offer = makeOffer(run, 0); run.flawAt = -1; run.pending = null;
    STAGES.forEach(([, at], k) => { if (round === at) snaps[k].push(JSON.parse(JSON.stringify(run))); });
    let best = -1, bi = 0;
    run.offer.forEach((id, i) => { const t = TILE_BY_ID[id]; if (t.event || t.type === 'skill') return; const g = gain(run, id); if (g !== null && g > best) { best = g; bi = i; } });
    if (best < 0) bi = run.offer.findIndex(id => !TILE_BY_ID[id].event);
    pickTile(run, bi, 0, 1);
    if (run.pending && run.pending.kind) run.pending = null;
  }
}
const avg = a => a.reduce((x, y) => x + y, 0) / (a.length || 1);
const pct = x => (x * 100).toFixed(1).padStart(5) + '%';
console.log(`Średni wzrost siły buildu (${CHAR}, tryb ${MODE}, ${N} migawek na etap). Etapy: ${STAGES.map(([n, r]) => n + '=piętro ' + r).join(', ')}`);
const bases = snaps.map(list => avg(list.map(run => 1)));
console.log('Rodzina / poziom'.padEnd(36) + 'wartość'.padStart(8) + STAGES.map(([n]) => n.padStart(9)).join('') + '   (poz.3 = 100%)');
const out = [];
for (const F of STAT_FAMS) {
  const ref = STAGES.map((_, k) => avg(snaps[k].map(run => gain(run, F.ids[2]))));
  F.ids.forEach((id, i) => {
    const t = TILE_BY_ID[id], row = STAGES.map((_, k) => avg(snaps[k].map(run => gain(run, id))));
    const rel = row.map((v, k) => (v / ref[k] * 100).toFixed(0) + '%').join('/');
    console.log((F.fam + ' L' + (i + 1) + ' ' + t.name).padEnd(36).slice(0, 36) + String(t.fx[0].v).padStart(8) + row.map(v => pct(v).padStart(9)).join('') + '   ' + rel);
  });
}
if (ALL) {
  console.log('\nPozostałe kafelki (bez umiejętności), wzrost siły na etapie „środek”:');
  const mid = snaps[2];
  const rows = TILES.filter(t => !t.fam && !t.hatched && !t.event && t.type !== 'skill').map(t => [t, avg(mid.map(run => gain(run, t.id)))]).sort((a, b) => b[1] - a[1]);
  for (const [t, g] of rows) console.log((t.name).padEnd(30) + ('r' + t.rarity).padStart(4) + pct(g).padStart(9) + '  ' + t.text.slice(0, 70));
}
void statsOf; void bases;
