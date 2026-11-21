// Bulgot: symulator balansu. Puszcza setki runów prostym botem i pokazuje, ile z nich dochodzi do której rundy.
// Użycie (Windows: export PATH="/c/Users/Kurczak/tools/node:$PATH"):
//   node dev/sim-balance.mjs [--mode full|quick] [--garnek 0..5] [--n 300] [--policy smart|random] [--pool starter|all] [--char pyrtek]
// Bot używa dokładnie tych samych funkcji co serwer (rules.js, sim.js), więc liczby są prawdziwe.
import { newRun, pickTile, reroll, buyOffer, rest, shopBuy, bet, bonusPick, fightSetup, fightFinish, statsOf, shopPrice, rerollCost } from '../../pl3y-server/src/games/bulgot/rules.js';
import { Fight } from '../../pl3y-server/src/games/bulgot/sim.js';
import { TILES, TILE_BY_ID, STARTER_TILES, MODES, CHARS, ENEMIES, BOSSES, RULES } from '../../pl3y-server/src/games/bulgot/data.js';
import { makeRng, mix } from '../../pl3y-server/src/games/bulgot/rng.js';
import { heroStats } from '../../pl3y-server/src/games/bulgot/stats.js';
import { loadoutOf } from '../../pl3y-server/src/games/bulgot/rules.js';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const MODE = arg('mode', 'full'), GARNEK = +arg('garnek', 0), N = +arg('n', 300), POLICY = arg('policy', 'smart'), POOL = arg('pool', 'all'), CHAR = arg('char', 'pyrtek');
const SEED0 = +arg('seed', 1);
const TRACE = process.argv.includes('--trace');
const NOREST = process.argv.includes('--norest'), RESTBELOW = +arg('restbelow', 55);
const NOBUY = process.argv.includes('--nobuy'), BUYMIN = +arg('buymin', 1.05);
const PER = {};
// Pokrętła do strojenia (nie zmieniają plików): mnożniki życia/ataku wrogów i bossów oraz tempo wzrostu na rundę.
const HPM = +arg('hpmul', 1), ATKM = +arg('atkmul', 1), BHPM = +arg('bosshp', 1), BATKM = +arg('bossatk', 1);
if (arg('grow')) { const [h, a] = arg('grow').split(',').map(Number); MODES[MODE].grow = { hp: h, atk: a }; }
if (arg('heal')) RULES.healPct = +arg('heal');
if (arg('income')) { const [a, b2] = arg('income').split(',').map(Number); RULES.coinsRound = a; RULES.coinsBoss = b2; }
if (arg('prices')) RULES.prices = arg('prices').split(',').map(Number);
const MAXBUY = +arg('maxbuy', 9);
if (arg('basehp')) CHARS.pyrtek.base.hp = +arg('basehp');
for (const e of Object.values(ENEMIES)) { e.hp = Math.round(e.hp * HPM); e.atk = Math.max(1, Math.round(e.atk * ATKM)); }
for (const e of Object.values(BOSSES)) { e.hp = Math.round(e.hp * BHPM); e.atk = Math.max(1, Math.round(e.atk * BATKM)); }

// ---------- ocena kafelka: siła buildu = obrażenia na sekundę × wytrzymałość ----------
function power(run) {
  const S = heroStats(loadoutOf(run));
  const crit = Math.min(1, S.crit / 100) * (S.critMult / 100 - 1);
  const dps = S.atk * (S.aspd / 100) * (1 + crit) * (1 + S.dmg / 100) + (S.egg ? 1.2 * S.atk / (S.egg / 10) : 0) + S.bleed * 0.6;
  const ehp = (S.maxHp * (1 + S.regen / 12)) * (1 + S.armor / 100) / (1 - Math.min(75, S.evade) / 100);
  const skills = run.skills.reduce((a, s) => a + (s.lvl >= 3 ? 0.22 : s.lvl >= 2 ? 0.16 : 0.1), 0);
  return dps * ehp * (1 + skills) * (S.revive ? 1.1 : 1) * (1 + S.luck * 0.004);
}
function tileValue(run, id) {
  const t = TILE_BY_ID[id];
  const base = power(run);
  const trial = JSON.parse(JSON.stringify(run));
  if (t.event) return t.event === 'skrzynka' ? base * 1.12 : t.event === 'sklepik' ? base * 1.03 : base * 0.99;
  if (t.type === 'skill') {
    const own = trial.skills.find(s => s.id === t.skill);
    if (own) { if (own.lvl >= 3) return base * 0.9; own.lvl++; }
    else if (trial.skills.length < 3) trial.skills.push({ id: t.skill, lvl: 1 });
    else return base * 0.9;
    trial.tiles.push(id);
    return power(trial);
  }
  trial.tiles.push(id);
  const v = power(trial);
  if (id === 'zakazana-pasza') return v * 0.95;
  return v;
}
function choose(run, ids, rng) {
  if (POLICY === 'random') return rng.int(ids.length);
  let best = 0, bv = -1;
  ids.forEach((id, i) => { const v = tileValue(run, id) * (1 + rng.next() * 0.03); if (v > bv) { bv = v; best = i; } });
  return best;
}

// ---------- granie walki: botowe użycie umiejętności ----------
function botInputs(setup) {
  const f = new Fight(setup), inputs = [];
  while (!f.over) {
    const now = [];
    f.skills.forEach((s, slot) => {
      if (f.tick < s.cd || f.tick < s.blockedUntil) return;
      const alive = f.alive();
      const windup = alive.some(e => e.windup);
      let use = false;
      switch (s.id) {
        case 'grad': case 'granat': case 'dziobniecie': case 'chlust': case 'lodowy': case 'zgnile': case 'darcie': case 'premia': case 'egzekucja': use = alive.length > 0; break;
        case 'kontra': case 'kapiel': use = windup || f.hp * 100 < f.S.maxHp * 70; break;
        case 'pianie': use = windup || alive.length >= 2 || alive.some(e => e.boss); break;
        case 'unik': use = windup || f.hp * 100 < f.S.maxHp * 45; break;
        case 'zagrzebanie': use = f.hp * 100 < f.S.maxHp * 55; break;
      }
      if (use) now.push(slot);
    });
    for (const slot of now) inputs.push([f.tick, slot]);
    f.step(now);
  }
  return inputs;
}

function playRun(seed) {
  const rng = makeRng(mix(seed, 777));
  const pool = POOL === 'all' ? TILES.map(t => t.id) : STARTER_TILES;
  const r = newRun({ mode: MODE, char: CHAR, garnek: GARNEK, pool, seed });
  const run = r.run;
  let guard = 0;
  while (run.phase !== 'over' && guard++ < 400) {
    if (run.phase === 'offer') {
      // reroll, gdy oferta słaba i są Ziarna na zapas
      let i = choose(run, run.offer, rng);
      const best = tileValue(run, run.offer[i]) / power(run);
      if (POLICY === 'smart' && best < 1.04 && run.coins >= rerollCost(run) + 2 && run.paid < 2) { reroll(run); continue; }
      // dokupowanie: najpierw najlepsze opłacalne kafelki z reszty oferty (wolny wybór zostaje)
      if (POLICY === 'smart' && !NOBUY) {
        const p0 = power(run);
        const opts = run.offer.map((id, k) => ({ id, k })).filter(o => o.id && o.k !== i && !TILE_BY_ID[o.id].event).map(o => ({ ...o, gain: tileValue(run, o.id) / p0 })).sort((a, b) => b.gain - a.gain);
        let nb = 0;
        for (const o of opts) {
          if (nb >= MAXBUY) break;
          const t0 = TILE_BY_ID[o.id], price = shopPrice(t0);
          if (o.gain < BUYMIN || price > run.coins || run.offer.filter(x => x).length < 2) continue;
          let sl; if (t0.type === 'skill' && run.skills.length >= 3 && !run.skills.find(s => s.id === t0.skill)) sl = run.skills.reduce((m, s, k, a) => (s.lvl < a[m].lvl ? k : m), 0);
          if (buyOffer(run, o.k, sl, 1 + rng.int(2)).ok) nb++;
        }
      }
      const t = TILE_BY_ID[run.offer[i]];
      let slot;
      if (t.type === 'skill' && run.skills.length >= 3 && !run.skills.find(s => s.id === t.skill)) slot = run.skills.reduce((m, s, k, a) => (s.lvl < a[m].lvl ? k : m), 0);
      const res = pickTile(run, i, slot, 1 + rng.int(2));
      if (res.err) { pickTile(run, run.offer.findIndex(id => TILE_BY_ID[id].type === 'stat'), 0); }
    } else if (run.phase === 'event') {
      if (run.pending.kind === 'shop') {
        let bi = -1, bv = power(run) * 1.02;
        run.pending.offer.forEach((id, k) => { const t = TILE_BY_ID[id]; if (shopPrice(t) <= run.coins) { const v = tileValue(run, id); if (v > bv) { bv = v; bi = k; } } });
        shopBuy(run, bi, 0, 1);
      } else bet(run, 0);
    } else if (run.phase === 'bonus') {
      const i = choose(run, run.offer, rng);
      const t = TILE_BY_ID[run.offer[i]];
      let slot; if (t.type === 'skill' && run.skills.length >= 3) slot = 0;
      const res = bonusPick(run, i, slot, 1 + rng.int(2));
      if (res.err) bonusPick(run, i, 0, 1);
    } else if (run.phase === 'fight') {
      // Odpoczynek: za Ziarna leczy część życia przed walką, gdy bohater jest mocno poobijany
      if (!NOREST && POLICY === 'smart' && run.hp * 100 < statsOf(run).maxHp * RESTBELOW && run.coins >= RULES.restCost && !run.rested) rest(run);
      const { setup } = fightSetup(run);
      const before = { hp: run.hp, coins: run.coins };
      const out = fightFinish(run, botInputs(setup));
      const S0 = statsOf(run);
      const row = (PER[setup.round] = PER[setup.round] || { n: 0, win: 0, loss: 0 });
      row.n++; if (out.result.win) { row.win++; row.loss += Math.max(0, before.hp - out.result.hp) / S0.maxHp; }
      if (TRACE) {
        const S = statsOf(run);
        console.log('R' + setup.round, setup.enemies.map(e => e.name + '(' + e.hp + '/' + e.atk + ')').join(', '),
          '| hero atk' + S.atk + ' asp' + S.aspd + ' hp' + before.hp + '/' + S.maxHp + ' arm' + S.armor + ' cr' + S.crit,
          '->', out.result.win ? 'WIN' : 'LOSE', 'hp' + out.result.hp, out.result.ticks + 't', 'sk' + out.result.skillsUsed, 'tiles:' + run.tiles.length);
      }
    }
  }
  return run;
}

// ---------- statystyki ----------
const rounds = MODES[MODE].rounds;
const died = Array(rounds + 2).fill(0);
let wins = 0, scoreSum = 0, roundsSum = 0, timeSum = 0;
const t0 = Date.now();
for (let s = 0; s < N; s++) {
  const run = playRun(SEED0 * 100003 + s);
  if (run.ended === 'win') wins++; else died[run.round]++;
  scoreSum += run.score; roundsSum += run.done;
}
console.log(`Tryb ${MODE}, Garnek ${GARNEK}, postać ${CHAR}, bot ${POLICY}, pula ${POOL}, ${N} runów (${Date.now() - t0} ms)`);
console.log(`Wygrane: ${(wins / N * 100).toFixed(1)}%   średnio ukończonych rund: ${(roundsSum / N).toFixed(2)}/${rounds}   średni wynik: ${Math.round(scoreSum / N)}`);
let line = 'Porażki w rundzie: ';
for (let r = 1; r <= rounds; r++) if (died[r]) line += `${r}:${(died[r] / N * 100).toFixed(0)}% `;
console.log(line);
if (process.argv.includes('--table')) {
  console.log('Runda  walk  wygr%  śr.strata życia przy wygranej');
  for (const r of Object.keys(PER).map(Number).sort((a, b) => a - b)) { const x = PER[r]; console.log(String(r).padStart(4), String(x.n).padStart(5), (x.win / x.n * 100).toFixed(0).padStart(5) + '%', x.win ? (x.loss / x.win * 100).toFixed(0).padStart(6) + '%' : '    -'); }
}
