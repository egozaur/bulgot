import fs from 'node:fs';
// Bulgot: symulator balansu. Puszcza setki runów prostym botem i pokazuje, ile z nich dochodzi do której rundy.
// Użycie (Windows: export PATH="/c/Users/Kurczak/tools/node:$PATH"):
//   node dev/sim-balance.mjs [--mode full|quick] [--garnek 0..5] [--n 300] [--policy smart|random] [--pool starter|all] [--char pyrtek]
// Bot używa dokładnie tych samych funkcji co serwer (rules.js, sim.js), więc liczby są prawdziwe.
import { choose as chooseOpt, newRun, pickTile, reroll, buyOffer, rest, shopBuy, bet, bonusPick, upgrade, upgradable, fightSetup, fightFinish, view, statsOf, shopPrice, rerollCost } from '../../../pl3y-server/src/games/bulgot/rules.js';
import { Fight } from '../../../pl3y-server/src/games/bulgot/sim.js';
import { AFFIXES, RARITY_WEIGHTS, TILES, TILE_BY_ID, STARTER_TILES, MODES, CHARS, ENEMIES, BOSSES, BOSS_POOL, ROUTES, RULES } from '../../../pl3y-server/src/games/bulgot/data.js';
import { makeRng, mix } from '../../../pl3y-server/src/games/bulgot/rng.js';
import { heroStats } from '../../../pl3y-server/src/games/bulgot/stats.js';
import { loadoutOf } from '../../../pl3y-server/src/games/bulgot/rules.js';

import { power } from '../../dev/lib-power.mjs';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const MODE = arg('mode', 'full'), GARNEK = +arg('garnek', 0), N = +arg('n', 300), POLICY = arg('policy', 'smart'), POOL = arg('pool', 'all'), CHAR = arg('char', 'pyrtek');
const SEED0 = +arg('seed', 1);
if (process.argv.includes('--noroutes')) for (const k of Object.keys(ROUTES)) ROUTES[k] = { name: k, text: '' };   // trasy bez modyfikatorów (pomiar)
if (process.argv.includes('--bossorig')) for (const k of Object.keys(BOSS_POOL)) BOSS_POOL[k] = [k];   // tylko oryginalni bossowie (pomiar wpływu wariantów)
const EXTRA = arg('extra', 'smart'), EXTRAHP = +arg('extrahp', 60), XS = { offers: 0, fights: 0, wins: 0, byId: {} };   // --extra never|always|smart (smart: walczy od --extrahp % życia)
for (const [k, id] of [['xg', 'gruszka'], ['xp', 'pipsztal']]) if (arg(k)) { const [h, a] = arg(k).split(',').map(Number); BOSSES[id].hp = h; BOSSES[id].atk = a; }   // --xg hp,atk / --xp hp,atk: nadpisanie bossów dodatkowych
const CURSES = (arg('curses', '') || '').split(',').filter(Boolean), ENDLESS = process.argv.includes('--endless'), KURNIK = arg('kurnik') ? Object.fromEntries(arg('kurnik').split(',').map(x => x.split(':')).map(([k, v]) => [k, +v])) : {};   // --curses a,b  --endless (po Prezesie gra dalej)  --kurnik silownia:2,spizarnia:3
const TRACE = process.argv.includes('--trace');
const NOREST = process.argv.includes('--norest'), RESTBELOW = +arg('restbelow', 55);
const NOBUY = process.argv.includes('--nobuy'), BUYMIN = +arg('buymin', 1.05);
const GRANT = arg('grant') ? [arg('grant').split('@')[0], +arg('grant').split('@')[1] || 1] : null;
const PER = {};
let UPG = 0, LOOT = 0;
// Pokrętła do strojenia (nie zmieniają plików): mnożniki życia/ataku wrogów i bossów oraz tempo wzrostu na rundę.
const HPM = +arg('hpmul', 1), ATKM = +arg('atkmul', 1), BHPM = +arg('bosshp', 1), BATKM = +arg('bossatk', 1);
if (arg('grow')) { const [h, a] = arg('grow').split(',').map(Number); MODES[MODE].grow = { hp: h, atk: a }; }
if (arg('heal')) RULES.healPct = +arg('heal');
if (arg('income')) { const [a, b2] = arg('income').split(',').map(Number); RULES.coinsRound = a; RULES.coinsBoss = b2; }
if (arg('prices')) RULES.prices = arg('prices').split(',').map(Number);
if (arg('rw')) arg('rw').split(';').forEach((x, i) => { RARITY_WEIGHTS[i] = x.split(',').map(Number); });   // --rw '50,35,13,2;35,38,22,5;22,38,30,10'
const MAXBUY = +arg('maxbuy', 9);
if (arg('affix')) for (const k of Object.keys(AFFIXES)) if (k !== arg('affix')) delete AFFIXES[k];   // --affix X: elity zawsze z tą cechą
if (arg('basehp')) CHARS.pyrtek.base.hp = +arg('basehp');
for (const e of Object.values(ENEMIES)) { e.hp = Math.round(e.hp * HPM); e.atk = Math.max(1, Math.round(e.atk * ATKM)); }
for (const e of Object.values(BOSSES)) { e.hp = Math.round(e.hp * BHPM); e.atk = Math.max(1, Math.round(e.atk * BATKM)); }

// ---------- ocena kafelka: siła buildu = obrażenia na sekundę × wytrzymałość ----------
// Archetypy buildów (--arch X): bot mocno woli kafelki pasujące do stylu, żeby porównać style gry między sobą na tym samym poziomie trudności.
const ARCH = { burn: t => (t.tags || []).includes('ogien') || (t.fx || []).some(f => /burn|pressure|eggBurn/.test(f.k)), frost: t => (t.tags || []).includes('lod') || (t.fx || []).some(f => /frost|freeze|shatter/.test(f.k)),
  poison: t => (t.tags || []).includes('trucizna') || (t.fx || []).some(f => /poison|spread/.test(f.k)), bleed: t => (t.tags || []).includes('krew') || (t.fx || []).some(f => /bleed/.test(f.k)),
  stats: t => t.type === 'stat', skills: t => t.type === 'skill', items: t => t.type === 'item', econ: t => (t.tags || []).includes('korpo') || (t.fx || []).some(f => /coin|interest|bossCoins|buyDisc/.test(f.k)),
  crit: t => (t.fx || []).some(f => /^crit|critMult|skillCrit/.test(f.k)), tank: t => (t.fx || []).some(f => /^(armor|hpFlat|hpPct|evade|regen|healBonus)$/.test(f.k)) };
const ARCHF = ARCH[arg('arch', '')];
const PREFER = new Set((arg('prefer', '') || '').split(',').filter(Boolean));   // --prefer id1,id2: bot bierze te kafelki w pierwszej kolejności (test siły pojedynczych kafelków)
function tileValue(run, id) {
  const v = tileValueRaw(run, id);
  return PREFER.has(id) ? v * 4 : ARCHF && ARCHF(TILE_BY_ID[id]) ? v * 1.35 : v;
}
function tileValueRaw(run, id) {
  const t = TILE_BY_ID[id];
  const base = power(run);
  const trial = JSON.parse(JSON.stringify(run));
  if (t.event === 'schronisko') return base * 1.07;
  if (t.event === 'arena') return base * 0.98;
  if (t.event) return t.event === 'skrzynka' ? base * 1.12 : t.event === 'sklepik' ? base * 1.03 : t.event === 'automat' ? (run.coins >= 5 ? base * 1.09 : 0) : t.event === 'kapliczka' ? base * 1.06 : t.event === 'kontrakt' ? base * 1.05 : base * 0.99;
  if (t.type === 'skill') {
    const own = trial.skills.find(s => s.id === t.skill);
    if (own) { if (own.lvl >= 3) return base * 0.9; own.lvl++; }
    else if (trial.skills.length < 3) trial.skills.push({ id: t.skill, lvl: 1 });
    else return base * 0.9;
    trial.tiles.push(id);
    return power(trial);
  }
  trial.tiles.push(id);
  if (id === 'jajko-dinozaura') { trial.tiles.pop(); trial.tiles.push('dinozaur'); return power(trial) * 0.8; }   // jajo wyceniane jak wyklęty Dinozaur z dyskontem
  if (t.grow) trial.grow = { ...(trial.grow || {}), [id]: Math.min(t.grow.max, Math.round(t.grow.max / 3)) };   // kafelek rosnący: wyceniany z oczekiwanym wzrostem
  const v = power(trial);
  if (id === 'zakazana-pasza') return v * 0.95;
  return v;
}
function choose(run, ids, rng) {
  if (POLICY === 'random') return rng.int(ids.length);
  let best = 0, bv = -1;
  ids.forEach((id, i) => { if (!id) return; const v = tileValue(run, id) * (1 + rng.next() * 0.03); if (v > bv) { bv = v; best = i; } });
  return best;
}

// ---------- granie walki: botowe użycie umiejętności ----------
function botInputs(setup) {
  const f = new Fight(setup), inputs = [];
  while (!f.over) {
    const now = [];
    f.skills.forEach((s, slot) => {
      if (f.tick < s.cd || f.tick < s.blockedUntil || f.tick < f.heroStunUntil) return;
      const alive = f.alive();
      const windup = alive.some(e => e.windup);
      let use = false;
      switch (s.id) {
        case 'wrzatek': case 'podpalka': case 'powiew': case 'sopel': case 'zakwas': case 'pazury': case 'wir': case 'garsc': case 'zwolnienie': use = alive.length > 0; break;
        case 'pogotowie': use = f.hp * 100 < f.S.maxHp * 65; break;
        case 'grad': case 'granat': case 'dziobniecie': case 'chlust': case 'lodowy': case 'zgnile': case 'darcie': case 'premia': case 'egzekucja': use = alive.length > 0; break;
        case 'kontra': case 'kapiel': use = windup || f.hp * 100 < f.S.maxHp * 70; break;
        case 'pianie': use = windup || alive.length >= 2 || alive.some(e => e.boss); break;
        case 'unik': use = windup || f.hp * 100 < f.S.maxHp * 45; break;
        case 'zagrzebanie': use = f.hp * 100 < f.S.maxHp * 55; break;
        // Etap 4: nowe umiejętności
        case 'fala': case 'lawina': case 'zwarcie': case 'dziobanie': case 'niespodzianka': case 'wypowiedzenie': case 'audyt': case 'bonus': case 'ostateczny': case 'zamrazarka': case 'wicher': case 'pobudka': case 'zemsta': use = alive.length > 0; break;
        case 'spotkanie': use = alive.length > 0 && (windup || alive.some(e => e.boss) || alive.length >= 2); break;
        case 'pulapka': use = alive.length > 0 && f.tick >= f.trapUntil; break;
        case 'tarcza': use = windup || f.hp * 100 < f.S.maxHp * 75; break;
        case 'kawa': use = f.hp * 100 < f.S.maxHp * 65; break;
        case 'zupa': use = f.hp * 100 < f.S.maxHp * 75; break;
        case 'echo': use = alive.length > 0 && f.skills.some((o, k) => k !== slot && f.tick >= o.cd && o.id !== 'echo'); break;
        case 'obieg': use = alive.length > 0 && f.skills.some((o, k) => k !== slot && o.cd - f.tick > 40); break;
      }
      if (use) now.push(slot);
    });
    for (const slot of now) inputs.push([f.tick, slot]);
    f.step(now);
  }
  return inputs;
}

const SNAPS = [1, 7, 20], SNAP = {};
function playRun(seed) {
  const rng = makeRng(mix(seed, 777));
  const pool = POOL === 'all' ? TILES.map(t => t.id) : STARTER_TILES;
  const r = newRun({ mode: MODE, char: CHAR, garnek: GARNEK, pool, seed, curses: CURSES, kurnik: KURNIK });
  const run = r.run;
  let guard = 0;
  while (run.phase !== 'over' && guard++ < 600) {
    if (run.phase === 'offer' && SNAPS.includes(run.round) && !SNAP[run.round]) { run.hp = statsOf(run).maxHp; SNAP[run.round] = JSON.parse(JSON.stringify(view(run))); if (run.round >= Math.max(...SNAPS)) break; }
    if (run.phase === 'offer' && GRANT && !run.granted && run.round >= GRANT[1]) {   // --grant id@runda: dostajesz kafelek za darmo (czysty pomiar siły, bez błędu przeżywalności)
      run.granted = true; const hb = statsOf(run).maxHp; for (const gid of GRANT[0].split('+')) run.tiles.push(gid); const ha = statsOf(run).maxHp; if (ha > hb) run.hp += ha - hb;
    }
    if (run.phase === 'offer') {
      // Ulepszanie: bot zlewa 3 kopie tylko wtedy, gdy siła buildu rośnie (--noupgrade wyłącza)
      if (POLICY === 'smart' && !process.argv.includes('--noupgrade')) for (const uid of upgradable(run)) { const tr = JSON.parse(JSON.stringify(run)); upgrade(tr, uid); if (power(tr) > power(run)) { upgrade(run, uid); UPG++; } }
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
          const t0 = TILE_BY_ID[o.id], price = shopPrice(t0, run);
          if (o.gain < BUYMIN || price > run.coins || run.offer.filter(x => x).length < 2) continue;
          let sl; if (t0.type === 'skill' && run.skills.length >= 3 && !run.skills.find(s => s.id === t0.skill)) sl = run.skills.reduce((m, s, k, a) => (s.lvl < a[m].lvl ? k : m), 0);
          if (buyOffer(run, o.k, sl, 1 + rng.int(2)).ok) nb++;
        }
      }
      const t = TILE_BY_ID[run.offer[i]];
      let slot;
      if (t.type === 'skill' && run.skills.length >= 3 && !run.skills.find(s => s.id === t.skill)) slot = run.skills.reduce((m, s, k, a) => (s.lvl < a[m].lvl ? k : m), 0);
      const res = pickTile(run, i, slot, 1 + rng.int(2));
      if (res.err) { let k = run.offer.findIndex(id => id && TILE_BY_ID[id].type === 'stat'); if (k < 0) k = run.offer.findIndex(id => id && !TILE_BY_ID[id].event); if (k < 0) k = run.offer.findIndex(id => id && id !== 'automat-z-pasza'); pickTile(run, k, 0, 1); }
    } else if (run.phase === 'event') {
      if (run.pending.kind === 'shop') {
        let bi = -1, bv = power(run) * 1.02;
        run.pending.offer.forEach((id, k) => { const t = TILE_BY_ID[id]; if (shopPrice(t, run) <= run.coins) { const v = tileValue(run, id); if (v > bv) { bv = v; bi = k; } } });
        shopBuy(run, bi, 0, 1);
      } else if (run.pending.kind === 'contract') chooseOpt(run, 0);
      else if (run.pending.kind === 'adopt') chooseOpt(run, 0);
      else if (run.pending.kind === 'extra') { const x = EXTRA === 'always' || (EXTRA === 'smart' && run.hp * 100 >= statsOf(run).maxHp * EXTRAHP); XS.offers++; chooseOpt(run, x ? 0 : 1); }
      else if (run.pending.kind === 'arena') chooseOpt(run, run.hp * 100 >= statsOf(run).maxHp * 70 ? 0 : 1);
      else if (run.pending.kind === 'shrine') chooseOpt(run, run.hp * 100 < statsOf(run).maxHp * 55 || !run.pending.badge ? 0 : 1);
      else bet(run, 0);
    } else if (run.phase === 'route') {
      const ri = arg('route') ? run.pending.opts.indexOf(arg('route')) : 0;   // --route id: bot wybiera tę trasę, gdy jest w ofercie
      chooseOpt(run, ri < 0 ? (arg('route') ? 1 : 0) : ri);
    } else if (run.phase === 'victory') {
      chooseOpt(run, ENDLESS ? 0 : 1);
    } else if (run.phase === 'door') {
      // Rozwidlenie: ryzykowne drzwi, gdy życie jest wysokie (--doors never|always|smart)
      const S = statsOf(run), d = arg('doors', 'smart');
      chooseOpt(run, d === 'always' ? 1 : d === 'never' ? 0 : run.hp * 100 >= S.maxHp * 80 ? 1 : 0);
    } else if (run.phase === 'badge') {
      let bi = 0, bv = -1;
      run.pending.offer.forEach((b, k) => { const tr = JSON.parse(JSON.stringify(run)); tr.badges.push(b); const v = power(tr) * (1 + rng.next() * 0.02); if (v > bv) { bv = v; bi = k; } });
      chooseOpt(run, bi);
    } else if (run.phase === 'loot') {
      let bi = 0, bv = -1; run.pending.offer.forEach((id, k) => { const v = tileValue(run, id) * (1 + rng.next() * 0.01); if (v > bv) { bv = v; bi = k; } }); chooseOpt(run, bi); LOOT++;
    } else if (run.phase === 'bonus') {
      const i = choose(run, run.offer, rng);
      const t = TILE_BY_ID[run.offer[i]];
      let slot; if (t.type === 'skill' && run.skills.length >= 3) slot = 0;
      const res = bonusPick(run, i, slot, 1 + rng.int(2));
      if (res.err) bonusPick(run, i, 0, 1);
    } else if (run.phase === 'fight') {
      // Odpoczynek: za Ziarna leczy część życia przed walką, gdy bohater jest mocno poobijany
      if (!NOREST && POLICY === 'smart' && run.hp * 100 < statsOf(run).maxHp * RESTBELOW && run.coins >= RULES.restCost && !run.rested) rest(run);
      run.hp = statsOf(run).maxHp;
      const snap0 = JSON.parse(JSON.stringify(run));
      let { setup } = fightSetup(run);
      const before = { hp: run.hp, coins: run.coins };
      let out = fightFinish(run, botInputs(setup));
      for (let tr = 0; run.phase === 'over' && tr < 12; tr++) { for (const k of Object.keys(run)) delete run[k]; Object.assign(run, JSON.parse(JSON.stringify(snap0))); const c = TILES.filter(t => !t.event && !t.hidden && !t.hatched && t.type !== 'skill').map(t => t.id); run.tiles.push(c[Math.floor(rng.next() * c.length)]); run.hp = statsOf(run).maxHp; snap0.tiles = run.tiles.slice(); snap0.hp = run.hp; ({ setup } = fightSetup(run)); out = fightFinish(run, botInputs(setup)); }
      if (setup.extra) { XS.fights++; const b = (XS.byId[setup.extra] = XS.byId[setup.extra] || { n: 0, w: 0 }); b.n++; if (out.result.win) { XS.wins++; b.w++; } }
      const S0 = statsOf(run);
      const row = (PER[setup.round] = PER[setup.round] || { n: 0, win: 0, loss: 0, ticks: 0, fast: 0 }); row.ticks += out.result.ticks; if (out.result.ticks <= 20) row.fast++;
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

const run = playRun(+arg('seed', 7));
fs.writeFileSync(new URL('./migawki.json', import.meta.url), JSON.stringify(SNAP));
console.log('rundy', Object.keys(SNAP).join(','), 'kafelki', run.tiles.length, 'umiejetnosci', run.skills.map(k=>k.id+k.lvl).join(','), 'faza', run.phase);
