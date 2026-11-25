// Bulgot: testy ciekawostek końca runu (fakty.js, fakty-pamiec.js, fakty-teksty.js). Czyste Node, bez przeglądarki, ok. 1 s.
// Użycie: node dev/test-fakty.mjs            testy
//         node dev/test-fakty.mjs --galeria  dodatkowo wypisuje ~60 próbek tekstów z symulowanych runów (do przeczytania przez właściciela)
// Co sprawdzamy: prawdziwość liczb w tekście, brak pustych pól, pokrycie wygrana/porażka, rotację (brak powtórek z rzędu), pamięć pięter, zakład, rekordy wstydu.
import * as D from '../shared/data.js';
import { failFacts, winFacts, pickFacts, MIN_FACT } from '../fakty.js';
import { agg, createMemory, floorEntry, floorKey } from '../fakty-pamiec.js';
import { TX } from '../fakty-teksty.js';

let fails = 0, total = 0;
const ok = (cond, msg) => { total++; if (!cond) { fails++; console.log('  BŁĄD: ' + msg); } };
const section = t => console.log('\n# ' + t);
const memStore = () => { const m = new Map(); return { get: k => (m.has(k) ? m.get(k) : null), set: (k, v) => m.set(k, String(v)), m }; };

// ---------- pomocnicze: kontekst jak z endFacts ----------
const baseCtx = (o = {}) => ({
  runId: 'r' + Math.random(), win: false, mode: 'full', modeName: 'Pełny', rounds: 20, round: 7, garnek: 1, garnekName: 'Ciepły', char: 'pyrtek', seed: 12345,
  result: { foeLeft: 50, dealt: 200, taken: 100, maxHit: 30, skillsUsed: 3, ticks: 400, critRolls: 0, critHits: 0, critPct: 0, stolen: 0, hp: 0, maxHp: 100 },
  coins: 5, score: 7000, best: 0, newBest: false, above: null, floor: null, stats: { rerolls: 0, buys: 3, rests: 2 }, rerolls: 0, buys: 3, flawless: 0, maxHit: 30,
  rested: false, restCost: 8, restPct: 30, hasSkills: true, skillName: 'Pianie Grozy', stunSkill: 'Pianie Grozy', runs: 10, maxGarnek: 5, garnekScore: 25, fullRounds: 20,
  scoreRound: 1000, scoreCoin: 50, prices: [6, 12, 20, 40], log: [], hist: [], mem: {}, shame: {}, seen: [], now: 1, bet: null,
  abandoned: false, boss: false, bossName: '', killer: null, killerId: null, killerName: '', nemesis: false, setHint: '', streak: 1, nr: 4812, ...o,
});
const best = list => pickFacts(list)[0];
const texts = list => list.map(f => f.text).join(' | ');

// ---------- 1. prawdziwość liczb ----------
section('prawdziwość liczb w tekście');
{
  // prawie wygrana: miss = round(300*4/96) = 13, najlepszy cios 52
  const c = baseCtx({ result: { ...baseCtx().result, foeLeft: 4, dealt: 300, maxHit: 52 } });
  const f = failFacts(c).find(x => x.cat === 'close');
  ok(f && /13/.test(f.text) && /52/.test(f.text), 'rachunek żalu: brakujące obrażenia (13) i najlepszy cios (52): ' + (f && f.text));
  // akta zabójcy: Wózek Widłowy, 0 umiejętności, jest umiejętność ogłuszająca
  const w = D.ENEMIES['wozek-widlowy'];
  const c2 = baseCtx({ killer: w, killerId: 'wozek-widlowy', killerName: w.name, result: { ...baseCtx().result, skillsUsed: 0, foeLeft: 60 } });
  const a = failFacts(c2).find(x => x.cat === 'akta');
  ok(a && a.text.includes('co 11 s') && a.text.includes('300%') && a.text.includes('Pianie Grozy'), 'akta zabójcy z danych wroga (szarża co 11 s za 300%, ogłuszenie): ' + (a && a.text));
  // bez umiejętności ogłuszającej nie ma wzmianki o ogłuszeniu
  const c3 = baseCtx({ stunSkill: '', killer: w, killerId: 'wozek-widlowy', killerName: w.name, result: { ...baseCtx().result, skillsUsed: 0 } });
  const a3 = failFacts(c3).find(x => x.cat === 'akta');
  ok(a3 && !/ogłusza, a w tej walce/.test(a3.text), 'akta: brak zmyślonej wzmianki o ogłuszeniu bez takiej umiejętności');
  // boss z cytatem i wściekłością
  const bj = D.BOSSES.brojler;
  const c4 = baseCtx({ boss: true, bossName: bj.name, killer: bj, killerId: 'brojler', killerName: bj.name, result: { ...baseCtx().result, foeLeft: 30 } });
  const a4 = failFacts(c4).find(x => x.cat === 'akta');
  ok(a4 && a4.text.includes('30%') && a4.text.includes('poniżej 50%') && a4.text.includes(bj.quote), 'akta bossa: wściekłość poniżej 50% i cytat: ' + (a4 && a4.text));
  // weakentry z dziennika
  const log = [{ r: 5, hpIn: 20, maxHp: 100, hpOut: 0, win: 0, ticks: 100, dealt: 10, taken: 90, used: 1, left: 80, rested: 0, coins: 14, extra: 0 }];
  const c5 = baseCtx({ round: 5, log, coins: 14 });
  const w5 = failFacts(c5).find(x => x.cat === 'weakentry');
  ok(w5 && /20%/.test(w5.text) && /14/.test(w5.text) && /8 Ziaren/.test(w5.text), 'wejście bez życia: 20%, 14 Ziaren, koszt 8: ' + (w5 && w5.text));
  // bez danych w dzienniku generatory dziennika milczą
  const c6 = baseCtx({ log: [] });
  ok(!failFacts(c6).some(x => ['bleed', 'skillsrun', 'norest', 'weakentry'].includes(x.cat)), 'pusty dziennik: brak faktów z dziennika');
}

// ---------- 2. przeciwnik nigdy nie dostaje zmyślonych cech ----------
section('akta wszystkich wrogów: tylko cechy z danych');
{
  let n = 0;
  for (const d of [...Object.values(D.ENEMIES), ...Object.values(D.BOSSES)]) {
    const c = baseCtx({ killer: d, killerId: d.id, killerName: d.name, boss: !!d.slot, result: { ...baseCtx().result, skillsUsed: 1, foeLeft: 40, stolen: 2 } });
    const a = failFacts(c).find(x => x.cat === 'akta'); n++;
    ok(a && a.text.startsWith(d.name) || (a && a.text.startsWith('Zakończył cię')), 'akta ' + d.id + ': ' + (a && a.text));
    ok(a && !/undefined|NaN|\{|\}/.test(a.text), 'akta ' + d.id + ' bez pustych pól');
  }
  console.log('  sprawdzono wrogów: ' + n);
}

// ---------- 3. szablony: brak pustych pól po wypełnieniu ----------
section('szablony: pola');
{
  const used = new Set(); const src = new Set();
  const tryAll = (list) => list.forEach(f => { used.add(f.key); ok(!/\{|\}|undefined|NaN|\[object/.test(f.text), 'puste pole w ' + f.key + ': ' + f.text); });
  const rnd = rng(7);
  for (let i = 0; i < 400; i++) { const c = randCtx(rnd, i % 4 === 0); tryAll(c.win ? winFacts(c) : failFacts(c)); }
  const missing = Object.keys(TX).filter(k => !used.has(k) && !['akta_koniec'].includes(k));
  console.log('  klucze szablonów nieużyte w symulacji: ' + (missing.join(', ') || 'brak'));
}

// ---------- 4. rotacja i pamięć (symulacja 150 runów) ----------
section('rotacja: brak powtórek z rzędu, pełne pokrycie');
{
  const st = memStore(), mem = createMemory(st), rnd = rng(99);
  const shown = []; let empty = 0, loseN = 0, winN = 0, sameCatRepeat = 0, sameTextRepeat = 0, repeatable = 0;
  for (let i = 0; i < 150; i++) {
    const c = randCtx(rnd, rnd() < 0.2); c.runId = 'sim' + i; c.hist = mem.hist(); c.mem = mem.floors(); c.shame = mem.shame(); c.seen = mem.seen(); c.now = mem.now(); c.bet = mem.bet();
    const list = c.win ? winFacts(c) : failFacts(c), f = pickFacts(list)[0];
    c.win ? winN++ : loseN++;
    if (!f) { empty++; mem.commit(c, null); continue; }
    ok(f.text.length >= 25 && f.text.length <= 330, 'długość tekstu ' + f.text.length + ': ' + f.text);
    const prev = shown[shown.length - 1];
    if (prev) { const alt = list.some(x => x.cat !== prev.cat && x.p >= MIN_FACT && !x.floor); if (alt) repeatable++; if (f.cat === prev.cat && alt) sameCatRepeat++; if (f.text === prev.text) sameTextRepeat++; }
    shown.push(f); mem.commit(c, f);
  }
  console.log(`  runów: ${loseN} porażek, ${winN} wygranych; puste okno: ${empty}; ta sama kategoria z rzędu mimo alternatywy: ${sameCatRepeat}/${repeatable}; identyczny tekst z rzędu: ${sameTextRepeat}`);
  ok(empty === 0, 'okno nigdy nie jest puste po porażce lub wygranej z wynikiem');
  ok(sameCatRepeat === 0, 'ta sama kategoria nie wraca z rzędu, gdy jest lepsza alternatywa');
  ok(sameTextRepeat === 0, 'ten sam tekst nie wraca z rzędu');
  const cats = new Map(); shown.forEach(f => cats.set(f.cat, (cats.get(f.cat) || 0) + 1));
  console.log('  rozkład kategorii: ' + [...cats].sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ':' + v).join(' '));
  ok(cats.size >= 14, 'różnorodność: ≥14 kategorii w 150 runach (jest ' + cats.size + ')');
  ok([...cats.values()].every(v => v <= 150 * 0.3), 'żadna kategoria nie przekracza 30% runów');
  ok(mem.hist().length <= 30 && mem.seen().length <= 60, 'pamięć przycięta: historia ' + mem.hist().length + ', seen ' + mem.seen().length);
}

// ---------- 5. pamięć pięter ----------
section('pamięć pięter');
{
  const st = memStore(), mem = createMemory(st);
  const key = floorKey('full', 1, 7);
  const base = i => baseCtx({ runId: 'f' + i, round: 7, killerId: 'wozek-widlowy', killer: D.ENEMIES['wozek-widlowy'], killerName: 'Wózek Widłowy', log: [{ r: 7, hpIn: 30, maxHp: 100, hpOut: 0, win: 0, ticks: 100, dealt: 10, taken: 90, used: 0, left: 70, rested: 0, coins: 2, extra: 0 }] });
  for (let i = 0; i < 2; i++) { const c = base(i); c.mem = mem.floors(); c.hist = mem.hist(); c.seen = mem.seen(); c.now = mem.now(); mem.commit(c, null); }
  const c3 = base(3); c3.mem = mem.floors(); c3.hist = mem.hist(); c3.seen = []; c3.now = mem.now();
  ok((c3.mem[key] || {}).deaths.length === 2, 'zapisano 2 śmierci na piętrze 7');
  const l = failFacts(c3), fm = l.filter(x => x.cat === 'floormem');
  ok(fm.some(x => x.key === 'floormem_killer' && /3\. śmierć/.test(x.text) && /3 z 3/.test(x.text)), 'wzorzec zabójcy: „3. śmierć … 3 z 3”: ' + texts(fm));
  ok(fm.some(x => x.key === 'floormem_weak' && /3 z 3/.test(x.text)), 'wzorzec słabego wejścia (<40% życia)');
  // piętro, które zabijało, a tym razem minięte
  const c4 = baseCtx({ runId: 'f4', round: 9 }); c4.mem = mem.floors(); c4.hist = mem.hist();
  const pb = failFacts(c4).find(x => x.cat === 'floorpb');
  ok(pb && /Piętro 7/.test(pb.text) && /2 razy/.test(pb.text), 'piętro 7 zabiło 2 razy, a minięte: ' + (pb && pb.text));
  const cw = baseCtx({ runId: 'f5', win: true, round: 20 }); cw.mem = mem.floors(); cw.hist = mem.hist();
  ok(winFacts(cw).some(x => x.cat === 'floorpb'), 'po wygranej też: piętro, które zabijało');
  // inny tryb/palnik nie miesza pamięci
  const c6 = baseCtx({ runId: 'f6', round: 7, garnek: 2 }); c6.mem = mem.floors();
  ok(!failFacts(c6).some(x => x.cat === 'floormem'), 'inny palnik: pamięć pięter nie dotyczy');
}

// ---------- 6. zakład ----------
section('zakład Prezesa');
{
  const st = memStore(), mem = createMemory(st);
  let c = baseCtx({ runId: 'b1', round: 7 }); c.hist = []; c.seen = []; c.now = mem.now(); c.bet = null;
  const prop = failFacts(c).find(x => x.key === 'bet_floor');
  ok(prop && prop.bet && prop.bet.target === 7 && /piętro 7/.test(prop.text), 'propozycja zakładu: dalej niż piętro 7: ' + (prop && prop.text));
  mem.commit(c, prop);
  ok(mem.bet() && mem.bet().kind === 'floor' && mem.bet().target === 7, 'zakład zapisany tylko, gdy został pokazany');
  // rozliczenie: wygrany (piętro 9 > 7)
  let c2 = baseCtx({ runId: 'b2', round: 9 }); c2.hist = mem.hist(); c2.seen = mem.seen(); c2.now = mem.now(); c2.bet = mem.bet();
  const res = failFacts(c2).find(x => x.cat === 'betres');
  ok(res && res.key === 'bet_win_floor' && /piętro 9/.test(res.text), 'zakład wygrany: ' + (res && res.text));
  ok(best(failFacts(c2)).cat === 'betres', 'rozliczenie zakładu to najmocniejsza ciekawostka');
  mem.commit(c2, best(failFacts(c2)));
  ok(mem.bet() === null, 'rozliczony zakład znika');
  // nowa propozycja nie powstaje, gdy zakład aktywny
  let c3 = baseCtx({ runId: 'b3', round: 8 }); c3.bet = { kind: 'floor', mode: 'full', garnek: 1, target: 7, n: 1 }; c3.now = 2;
  ok(!failFacts(c3).some(x => x.cat === 'bet'), 'przy aktywnym zakładzie nie ma nowej propozycji');
  // zakład z innego trybu nie jest rozliczany
  let c4 = baseCtx({ runId: 'b4', round: 8, mode: 'quick', rounds: 10 }); c4.bet = { kind: 'floor', mode: 'full', garnek: 1, target: 7, n: 1 }; c4.now = 2;
  ok(!failFacts(c4).some(x => x.cat === 'betres'), 'zakład z innego trybu nie jest rozliczany');
  // zakład po wygranej: punkty
  const cw = baseCtx({ runId: 'b5', win: true, score: 12345 }); cw.now = 5;
  const pw = winFacts(cw).find(x => x.key === 'bet_score');
  ok(pw && pw.bet.target === 12345 && /12 345/.test(pw.text), 'po wygranej zakład punktowy: ' + (pw && pw.text));
}

// ---------- 7. rekordy wstydu i porównanie z poprzednim runem ----------
section('rekordy wstydu i ty kontra ty');
{
  const hist = [1, 2, 3].map(i => ({ id: 'h' + i, n: i, win: 0, mode: 'full', garnek: 1, round: 7, rounds: 20, score: 5000, coins: 30, killer: null, used: 8, fights: 7, ticks: 900, hs: 1, lastTicks: 300, lastDealt: 400, lastUsed: 2 }));
  const shame = { minTicks: 24, minDealt: 300, maxCoins: 40, noSkill: 0 };
  const c = baseCtx({ runId: 'sh1', hist, shame, now: 9, coins: 55, result: { ...baseCtx().result, ticks: 20, dealt: 50 } });
  const l = failFacts(c);
  ok(l.some(x => x.key === 'shame_fast' && /2 s/.test(x.text) && /2,4 s/.test(x.text)), 'antyrekord szybkości: ' + texts(l.filter(x => x.cat === 'shame')));
  ok(l.some(x => x.key === 'shame_coins' && /55 Ziarnami/.test(x.text) && /40 Ziaren/.test(x.text)), 'antyrekord Ziaren');
  const cd = baseCtx({ runId: 'sh3', hist, shame, now: 9, coins: 5, result: { ...baseCtx().result, ticks: 90, dealt: 50 } });
  ok(failFacts(cd).some(x => x.key === 'shame_dealt' && /50 obrażeń/.test(x.text) && /300/.test(x.text)), 'antyrekord obrażeń');
  // bez historii (mniej niż 3 runy) nie ma antyrekordów
  const c2 = baseCtx({ runId: 'sh2', hist: hist.slice(0, 2), shame, now: 9, coins: 55, result: { ...baseCtx().result, ticks: 20 } });
  ok(!failFacts(c2).some(x => x.cat === 'shame'), 'bez historii porównawczej brak antyrekordów');
  // ty kontra ty: regres i brak użycia umiejętności
  const log = Array.from({ length: 6 }, (_, i) => ({ r: i + 1, hpIn: 90, maxHp: 100, hpOut: 60, win: i < 5 ? 1 : 0, ticks: 200, dealt: 100, taken: 40, used: 0, left: 0, rested: 0, coins: 5, extra: 0 }));
  const c3 = baseCtx({ runId: 'vs1', round: 6, hist, log, shame: {}, now: 9 });
  const l3 = failFacts(c3);
  ok(l3.some(x => x.key === 'vs_regres' && /piętro 7/.test(x.text) && /na 6/.test(x.text)), 'regres względem poprzedniego runu: ' + texts(l3.filter(x => x.cat === 'vs')));
  ok(l3.some(x => x.key === 'vs_skills' && /8 razy/.test(x.text)), 'umiejętności: 8 razy poprzednio, dziś 0');
}

// ---------- 8. wygrane ----------
section('wygrane');
{
  const log = Array.from({ length: 10 }, (_, i) => ({ r: i + 1, hpIn: 80, maxHp: 100, hpOut: 50, win: 1, ticks: 200, dealt: 100, taken: 40, used: 0, left: 0, low: i === 7 ? 4 : 40, rested: 0, coins: 5, extra: 0, boss: i === 9 ? 1 : 0 }));
  const c = baseCtx({ runId: 'w1', win: true, mode: 'quick', modeName: 'Szybki', rounds: 10, round: 10, score: 9000, log, stats: { rerolls: 0, buys: 3, rests: 0 }, hist: Array.from({ length: 5 }, (_, i) => ({ id: 'x' + i, win: 0, mode: 'quick', garnek: 1, round: 5 })) });
  const l = winFacts(c), by = k => l.find(x => x.cat === k);
  ok(by('lowhp') && /piętrze 8/.test(by('lowhp').text) && /4%/.test(by('lowhp').text), 'wygrana na skraju śmierci: ' + (by('lowhp') && by('lowhp').text));
  ok(by('noskill'), 'wygrana bez umiejętności');
  ok(by('norest'), 'wygrana bez odpoczynku');
  ok(by('afterloss') && /5 porażkach/.test(by('afterloss').text), 'wygrana po 5 porażkach: ' + (by('afterloss') && by('afterloss').text));
  ok(by('mode') && /20/.test(by('mode').text), 'tryb Szybki → Pełny ma 20 pięter');
  const g = by('garnekpot'); ok(g && /palniku 2/.test(g.text), 'potencjał palnika: ' + (g && g.text));
  ok(best(l), 'wygrana zawsze ma ciekawostkę');
  // wygrana bez dziennika i historii: awaryjna
  const l2 = winFacts(baseCtx({ runId: 'w2', win: true, log: [], hist: [], stats: {}, score: 0 }));
  ok(pickFacts(l2).length === 1, 'wygrana bez danych dostaje awaryjną ciekawostkę');
}

// ---------- 9. dziennik runu ----------
section('dziennik runu i pamięć');
{
  const st = memStore(), mem = createMemory(st);
  const setup = { round: 3, zone: 0, enemies: [{ name: 'Szczur Pasz' }, { name: 'Pisklak', minion: true }], hero: { hp: 40 } };
  const res = { win: 0, hp: 0, maxHp: 100, ticks: 120, dealt: 80, taken: 100, maxHit: 20, skillsUsed: 2, foeLeft: 30, lowest: 0 };
  mem.addFloor('runA', floorEntry(setup, { hp: 40, coins: 12, rested: true }, res));
  const e = mem.log('runA')[0];
  ok(e && e.r === 3 && e.hpIn === 40 && e.maxHp === 100 && e.rested === 1 && e.coins === 12 && e.foes.length === 1, 'wpis piętra: ' + JSON.stringify(e));
  ok(mem.log('runB').length === 0, 'dziennik innego runu jest pusty');
  mem.addFloor('runB', floorEntry(setup, { hp: 10, coins: 0, rested: false }, res));
  ok(mem.log('runA').length === 0 && mem.log('runB').length === 1, 'nowy run zastępuje dziennik poprzedniego');
  const A = agg([e]); ok(A.fights === 1 && A.used === 2 && A.pcts[0] === 40 && A.rests === 1, 'agregaty dziennika');
  // uszkodzone dane nie psują
  st.set('bulgot:runlog', '{złe'); st.set('bulgot:hist', 'nie json'); st.set('bulgot:seen', '5');
  ok(mem.log('x').length === 0 && mem.hist().length === 0 && mem.seen().length === 0, 'uszkodzony zapis traktowany jak pusty');
  // commit jest idempotentny na run
  const c = baseCtx({ runId: 'idem' }); c.now = mem.now(); mem.commit(c, null); const n1 = mem.hist().length; mem.commit(c, null);
  ok(mem.hist().length === n1, 'ponowny zapis tego samego runu nic nie dubluje');
  // pokazana ciekawostka wraca z historii (po przeładowaniu strony)
  const c2 = baseCtx({ runId: 'again' }); c2.now = mem.now(); const f = best(failFacts(c2)); mem.commit(c2, f);
  const stored = mem.hist().find(h => h.id === 'again');
  ok(stored && stored.fact && stored.fact.text === f.text, 'ciekawostka zapisana w historii runu');
}

console.log(`\n${total - fails}/${total} OK` + (fails ? `, BŁĘDÓW: ${fails}` : ''));

// ---------- galeria ----------
if (process.argv.includes('--galeria')) {
  console.log('\n===== GALERIA: próbki z symulowanych runów (porażki i wygrane) =====');
  const st = memStore(), mem = createMemory(st), rnd = rng(2026);
  for (let i = 0; i < 60; i++) {
    const c = randCtx(rnd, rnd() < 0.25); c.runId = 'g' + i; c.hist = mem.hist(); c.mem = mem.floors(); c.shame = mem.shame(); c.seen = mem.seen(); c.now = mem.now(); c.bet = mem.bet();
    const f = best(c.win ? winFacts(c) : failFacts(c)); mem.commit(c, f);
    console.log(`${String(i + 1).padStart(2)}. [${c.win ? 'WYGRANA' : 'porażka'} / ${f ? f.cat : '-'}] ${f ? f.text : '(brak)'}`);
  }
}
process.exit(fails ? 1 : 0);

// ---------- generator losowych kontekstów (deterministyczny) ----------
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function randCtx(r, win) {
  const modeId = r() < 0.5 ? 'quick' : 'full', M = D.MODES[modeId], garnek = Math.floor(r() * 3), round = win ? M.rounds : 1 + Math.floor(r() * M.rounds);
  const foes = Object.values(D.ENEMIES).filter(e => !e.minion), bosses = Object.values(D.BOSSES);
  const boss = !win && r() < 0.25, killer = boss ? bosses[Math.floor(r() * bosses.length)] : foes[Math.floor(r() * foes.length)];
  const coins = Math.floor(r() * 60), used = r() < 0.3 ? 0 : Math.floor(r() * 8), ticks = 20 + Math.floor(r() * 600), foeLeft = r() < 0.3 ? 1 + Math.floor(r() * 9) : 10 + Math.floor(r() * 90);
  const log = Array.from({ length: round }, (_, i) => {
    const maxHp = 100, hpIn = 15 + Math.floor(r() * 85), lastLose = !win && i === round - 1;
    return { r: i + 1, boss: 0, extra: 0, hpIn, maxHp, hpOut: lastLose ? 0 : 20 + Math.floor(r() * 80), win: lastLose ? 0 : 1, ticks: 40 + Math.floor(r() * 500), dealt: 50 + Math.floor(r() * 500), taken: 20 + Math.floor(r() * 300), maxHit: 10 + Math.floor(r() * 60),
      used: r() < 0.25 ? 0 : 1 + Math.floor(r() * 4), left: lastLose ? foeLeft : 0, low: Math.floor(r() * 60), rested: r() < 0.3 ? 1 : 0, coins: Math.floor(r() * 40), foes: [] };
  });
  return baseCtx({
    win, mode: modeId, modeName: M.name, rounds: M.rounds, round, garnek, seed: Math.floor(r() * 1e6), coins, score: 2000 + Math.floor(r() * 20000), best: r() < 0.4 ? 5000 + Math.floor(r() * 20000) : 0, newBest: r() < 0.1,
    result: { foeLeft, dealt: 100 + Math.floor(r() * 900), taken: 50 + Math.floor(r() * 900), maxHit: 10 + Math.floor(r() * 80), skillsUsed: used, ticks, critRolls: Math.floor(r() * 30), critHits: r() < 0.3 ? 0 : 3, critPct: 20 + Math.floor(r() * 30), stolen: Math.floor(r() * 4), hp: 0, maxHp: 100 },
    stats: { rerolls: Math.floor(r() * 14), buys: Math.floor(r() * 6), rests: r() < 0.3 ? 0 : 1 + Math.floor(r() * 4), maxCoins: coins + 10 }, rerolls: Math.floor(r() * 14), buys: Math.floor(r() * 6), flawless: Math.floor(r() * 5), maxHit: 40,
    restCost: 8, rested: r() < 0.3, hasSkills: r() < 0.9, runs: 1 + Math.floor(r() * 30), log, boss, bossName: boss ? killer.name : '', killer, killerId: killer.id, killerName: killer.name, nemesis: r() < 0.05, setHint: r() < 0.2 ? 'Zbożowe' : '', streak: 1 + Math.floor(r() * 3), nr: 4800 + Math.floor(r() * 100),
    floor: r() < 0.5 ? { runs: 100, wins: 20 + Math.floor(r() * 30), reach: Array.from({ length: 25 }, (_, i) => 100 - i * 3), died: Array.from({ length: 25 }, () => Math.floor(r() * 40)) } : null,
    above: r() < 0.25 ? { place: 12, nick: 'Brojlerka', gap: 120 + Math.floor(r() * 900) } : null,
  });
}
