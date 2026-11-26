// Bulgot: ciekawostki na ekranie końca. Jedna, najtrafniejsza obserwacja o CAŁYM przebiegu runu (nie tylko o ostatniej walce): decyzje, zasoby, piętra,
// rekordy i powtarzające się nawyki z poprzednich runów. Ton: złośliwy narrator + czarna komedia z fabryki rosołu (teksty w fakty-teksty.js).
// Dane: wynik ostatniej walki, dziennik runu zbierany po stronie klienta (fakty-pamiec.js), historia 30 runów, pamięć pięter, rekordy wstydu,
// anonimowe liczniki pięter z serwera. Żadnych wymyślonych liczb: generator bez danych nic nie zwraca.
//
// Kontrakt z ekranem końca (ui/end.js): failFacts(c) / winFacts(c) zwracają kandydatów { p, cat, kind, key, v, text, bet?, floor? } od najlepszego,
// pickFacts(list) wybiera dokładnie jednego (albo żadnego). Punkty p: im wyższe, tym trafniejsza i bardziej zaskakująca obserwacja;
// od p odejmowana jest kara za świeżość (to, co gracz widział niedawno), więc słaba ciekawostka nie wygra tylko dlatego, że dawno jej nie było.

import { TX, fill, needsNr } from './fakty-teksty.js?v=20261126c';
import { agg, floorKey } from './fakty-pamiec.js?v=20261126c';

export const MIN_FACT = 40;      // poniżej tego progu (po karze za świeżość) ciekawostka się nie pokazuje, chyba że to awaryjna (floor)
const MIN_SAMPLE = 20;           // tyle runów musi być w statystykach serwera, żeby podawać procenty o innych graczach
const BET_TTL = 6;               // zakład wygasa po tylu runach

const pct = n => String(n).replace('.', ',');
const num = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const pick = (arr, seed) => arr[Math.abs(seed | 0) % arr.length];
// Polska odmiana: 1 raz, 2 razy, 5 razy (jeden / kilka / wiele).
const pl = (n, one, few, many) => { n = Math.abs(n); const a = n % 10, b = n % 100; return n === 1 ? one : (a >= 2 && a <= 4 && !(b >= 12 && b <= 14)) ? few : many; };
const coinsTxt = n => `${n} ${pl(n, 'Ziarno', 'Ziarna', 'Ziaren')}`;
const ziarnI = n => `${n} ${pl(n, 'Ziarnem', 'Ziarnami', 'Ziarnami')}`;   // narzędnik: „z 5 Ziarnami”
const usedTxt = n => `${n} ${pl(n, 'raz', 'razy', 'razy')}`;
const secs = t => { const s = t / 10; return pct(String(s >= 10 ? Math.round(s) : Math.round(s * 10) / 10)); };

// Dodawanie kandydata z szablonu (wariant tekstu omija te pokazane ostatnio dla tej kategorii; szablony z {nr} tylko po porażce).
function adder(c, out) {
  const add = (p, cat, key, vars = {}, extra = {}) => {
    const tpls = TX[key]; if (!tpls) return;
    const usable = tpls.map((t, i) => ({ t, i })).filter(x => c.nr || !needsNr(x.t));
    if (!usable.length) return;
    const seenV = new Set((c.seen || []).filter(s => s.cat === cat && c.now - s.n <= 10).map(s => s.v));
    const fresh = usable.filter(x => !seenV.has(`${key}:${x.i}`));
    const pool = fresh.length ? fresh : usable;
    const x = pool[(Math.abs(c.seed | 0) + key.length) % pool.length];
    out.push({ p, cat, kind: cat, key, v: `${key}:${x.i}`, text: fill(x.t, { nr: c.nr, ...vars }), ...extra });
  };
  add.text = (p, cat, text, extra = {}) => out.push({ p, cat, kind: cat, key: cat, v: cat + ':t', text, ...extra });
  return add;
}

// Kara za świeżość i sortowanie.
function rank(out, c) {
  const seen = c.seen || [], now = c.now;
  for (const f of out) {
    let pen = 0;
    for (const s of seen) if (s.cat === f.cat) { const age = now - s.n; pen = Math.max(pen, age <= 1 ? 45 : age <= 3 ? 30 : age <= 8 ? 15 : age <= 20 ? 6 : 0); }
    f.base = f.p; f.p -= pen;
  }
  return out.sort((a, b) => b.p - a.p);
}

// ---------- akta zabójcy: tylko cechy, które wróg naprawdę ma w danych ----------
const sec = t => pct(String(t / 10));
function aktaMech(d) {
  const m = [];
  if (d.mech && d.mech.includes('guarded')) m.push('jest nietykalny, dopóki żyją jego Ochroniarze');
  if (d.spec) m.push(`szarżuje co ${sec(d.spec.every)} s za ${d.spec.mult}% obrażeń`);
  if (d.mech && d.mech.includes('crash')) m.push('po szarży przegrzewa się i stoi bez ruchu');
  if (d.night) m.push(`co ${sec(d.night.every)} s gasi światło na ${sec(d.night.dur)} s (${d.night.pct}% twoich ciosów chybia)`);
  if (d.blizzard) m.push(`co ${sec(d.blizzard.every)} s sprowadza zamieć, która spowalnia twoje ataki na ${sec(d.blizzard.dur)} s`);
  if (d.summon) m.push(`co ${sec(d.summon.every)} s wzywa stażystów (do ${d.summon.max} naraz)`);
  if (d.steal) m.push(`każdym trafieniem kradnie Ziarno${d.steal.max < 99 ? ` (do ${d.steal.max})` : ''}`);
  if (d.ignite) m.push('każdym ciosem cię podpala');
  if (d.shieldHits) m.push(`ma tarczę, która pochłania pierwsze ${d.shieldHits} ${pl(d.shieldHits, 'cios', 'ciosy', 'ciosów')}`);
  if (d.rise) m.push('po śmierci wstaje z połową życia, chyba że płonie');
  if (d.slow && !d.blizzard) m.push(`każdym trafieniem spowalnia twoje ataki o ${d.slow.pct}%`);
  if (d.swarm) m.push(`przychodzi w roju po ${d.swarm}`);
  if (d.evade >= 20) m.push(`unika ${d.evade}% ciosów`);
  if (d.audit || d.auditEvery) m.push(`co ${sec(d.audit || d.auditEvery)} s robi Audyt: zdejmuje efekty i daje sobie tarczę`);
  if (d.mech && d.mech.includes('plucker')) m.push('zdziera tarczę z pierza, a potem skubie twoje kafelki');
  return m;
}

// ---------- porażka ----------
export function failFacts(c) {
  const out = [], add = adder(c, out), res = c.result, fl = c.floor, A = agg(c.log);
  const okLog = A.fights >= Math.max(1, Math.round((c.round || 1) * 0.8));
  const de = (c.log || []).filter(e => !e.extra && !e.win).pop();
  const deHp = de && de.maxHp ? Math.round(de.hpIn * 100 / de.maxHp) : null;
  const where = `tryb ${String(c.modeName || '').toLowerCase()}, palnik ${c.garnek}`;
  const st = c.stats || {};
  const hist = c.hist || [], same = hist.filter(h => h.mode === c.mode && h.garnek === c.garnek), last = same[same.length - 1];

  if (res) {
    // Rachunek żalu: prawie wygrana walka, liczona z tego, ile zadałeś i ile życia wroga zostało.
    if (res.foeLeft > 0 && res.foeLeft <= 10 && res.dealt > 0) {
      const miss = Math.max(1, Math.round(res.dealt * res.foeLeft / (100 - res.foeLeft)));
      if (res.maxHit > 0 && miss <= res.maxHit) add(98, 'close', 'close_hit', { miss: num(miss), hit: num(res.maxHit), left: res.foeLeft });
      else add(res.foeLeft <= 5 ? 94 : 88, 'close', 'close_far', { left: res.foeLeft, dealt: num(res.dealt), miss: num(miss) });
    }
    // Dziobnięcia: pech policzony (tylko losowane, bez wymuszonych).
    if (res.critRolls >= 12 && res.critPct > 0 && res.critPct < 100) {
      const luck = Math.pow(1 - res.critPct / 100, res.critRolls) * 100;
      if (res.critHits === 0 && luck <= 25) add(luck < 8 ? 95 : 86, 'crit', 'crit', { rolls: res.critRolls, pct: res.critPct, luck: luck < 1 ? 'mniej niż 1%' : 'ok. ' + pct(luck.toFixed(luck < 10 ? 1 : 0)) + '%' });
    }
    // Nieużyte umiejętności w ostatniej walce.
    if (c.hasSkills && res.skillsUsed === 0) add(91, 'skills', 'skills0', { skill: c.skillName || 'aktywna', secs: secs(res.ticks) });
    else if (c.hasSkills && res.ticks >= 150 && res.skillsUsed <= 1) add(82, 'skills', 'skills1', { secs: secs(res.ticks), used: usedTxt(res.skillsUsed) });
    // Zapomniany odpoczynek (ostatnia walka była blisko).
    if (!c.rested && c.restCost > 0 && c.coins >= c.restCost && res.foeLeft > 0 && res.foeLeft <= 35) add(89, 'rest', 'rest', { cost: coinsTxt(c.restCost), pct: c.restPct, coins: coinsTxt(c.coins), left: res.foeLeft });
    // Przegrana wymiana ciosów.
    if (res.dealt > 0 && res.taken >= res.dealt * 3) add(76, 'ratio', 'ratio', { dealt: num(res.dealt), taken: num(res.taken) });
    if (res.ticks > 0 && res.ticks <= 30) add(88, 'fast', 'fast', { secs: secs(res.ticks) });
    if (c.round >= c.rounds) add(92, 'last', 'last');
    if (c.nemesis) add(78, 'nemesis', 'nemesis');
    // Akta zabójcy: cechy wroga z danych + to, co zrobiłeś (lub nie) w tej walce.
    if (c.killer) {
      const d = c.killer, m = aktaMech(d);
      if (m.length) {
        let t = `${d.name} ${m.length > 1 ? m[0] + ' i ' + m[1] : m[0]}.`, p = c.boss ? 78 : 68;
        if (d.rage && res.foeLeft > 0 && res.foeLeft <= d.rage.at) { t += ` Padłeś, gdy miał ${res.foeLeft}% życia, czyli już po wybuchu wściekłości (poniżej ${d.rage.at}%).`; p += 8; }
        if (d.steal && res.stolen > 0) { t += ` Zdążył ci zabrać ${coinsTxt(res.stolen)}.`; p += 6; }
        if (c.stunSkill && res.skillsUsed === 0 && (d.spec || /ogłusz/i.test(d.text || ''))) { t += ` Miałeś „${c.stunSkill}”, które ogłusza, a w tej walce nie użyłeś żadnej umiejętności.`; p += 10; }
        const tail = c.boss && d.quote ? `„${d.quote}”` : pick(TX.akta_koniec, c.seed);
        if (t.length + tail.length < 250) t += ' ' + tail;   // krótko i celnie: zakończenie tylko, gdy nie rozciąga tekstu
        add.text(Math.min(p, 96), 'akta', t);
      } else add.text(45, 'akta', `Zakończył cię: ${d.name}. W tej fabryce nawet to jest awans.`);
    }
  }

  // Rekord i ranking: „prawie”.
  const gap = c.best > 0 ? c.best - c.score : 0;
  if (!c.newBest && gap > 0 && gap <= c.scoreRound) add(gap <= 400 ? 96 : 90, 'record', 'record', { gap: num(gap), pts: num(c.scoreRound) });
  const ab = c.above;
  if (ab && ab.gap > 0 && ab.gap <= 1200 && ab.place <= 100) add(ab.gap <= 300 ? 93 : 81, 'above', 'above', { place: ab.place, place1: ab.place - 1, nick: ab.nick, gap: num(ab.gap) });

  // Ziarna i marnotrawstwo.
  if (c.coins >= 20) {
    const small = Math.floor(c.coins / (c.prices && c.prices[0] || 6)), rests = c.restCost ? Math.floor(c.coins / c.restCost) : 0;
    add(70 + Math.min(20, Math.floor((c.coins - 20) / 3)), 'coins', 'coins', { coins: coinsTxt(c.coins), coinsI: ziarnI(c.coins), small: `${small} ${pl(small, 'kafelek', 'kafelki', 'kafelków')} Zwykłych`, rests: rests > 1 ? ` albo ${rests} ${pl(rests, 'odpoczynek', 'odpoczynki', 'odpoczynków')}` : '', pts: num(c.coins * c.scoreCoin) });
  }
  if (st.rerolls >= 6) add(72 + Math.min(10, st.rerolls - 6), 'reroll', 'reroll', { n: `${st.rerolls} ${pl(st.rerolls, 'raz', 'razy', 'razy')}`, round: c.round, avg: pct((st.rerolls / Math.max(1, c.round)).toFixed(1)) });
  if (!st.buys && c.coins >= 12 && c.round >= 4) add(78, 'nobuy', 'nobuy', { round: c.round, coins: coinsTxt(c.coins), coinsI: ziarnI(c.coins) });
  if (c.hasSkills === false && c.round >= 3) add(60, 'noskills', 'noskills', { round: c.round });

  // Wejście na ostatnie piętro bez życia i bez odpoczynku, mimo Ziaren.
  if (de && deHp != null && deHp <= 40 && !de.rested && c.restCost > 0 && de.coins >= c.restCost)
    add(deHp <= 25 ? 90 : 84, 'weakentry', 'weakentry', { round: de.r, hp: deHp, coins: coinsTxt(de.coins), coinsI: ziarnI(de.coins), cost: coinsTxt(c.restCost) });

  // Cały run z dziennika (tylko gdy dziennik jest kompletny).
  if (okLog) {
    if (A.pcts.length >= 4) {
      const seq = A.pcts.slice(-5), drops = seq.slice(1).filter((v, i) => v < seq[i]).length;
      if (seq[seq.length - 1] <= 45 && drops >= seq.length - 2 && seq[0] - seq[seq.length - 1] >= 25) add(85, 'bleed', 'bleed', { seq: seq.map(v => v + '%').join(', ') });
    }
    if (c.hasSkills && A.fights >= 4 && A.used <= A.fights / 2) add(80, 'skillsrun', 'skillsrun', { used: usedTxt(A.used), fights: A.fights, secs: secs(A.ticks) });
    if (st.rests === 0 && c.round >= 4 && A.avgIn != null && A.avgIn <= 65) add(78, 'norest', 'norest', { n: A.fights, avg: A.avgIn });
  }

  // Inni gracze (anonimowe liczniki serwera).
  if (fl && fl.reach && fl.reach[c.round - 1] >= MIN_SAMPLE) {
    const reach = fl.reach[c.round - 1], died = fl.died[c.round - 1] | 0, dieP = Math.round(died * 100 / reach), reachP = Math.round(reach * 100 / Math.max(1, fl.reach[0]));
    if (dieP >= 30) add(dieP >= 45 ? 87 : 83, 'floor', 'floor_hi', { round: c.round, pct: dieP, where });
    else if (dieP <= 12) add(90, 'floor', 'floor_lo', { round: c.round, pct: dieP, where });
    if (c.round >= 3 && reachP <= 40) add(80, 'reach', 'reach', { round: c.round, pct: reachP, where });
  }
  if (fl && fl.runs >= MIN_SAMPLE) { const w = Math.round(fl.wins * 100 / fl.runs); if (w <= 25) add(54, 'wins', 'wins_lo', { garnek: c.garnek, pct: w }); }

  // Pamięć pięter i historia (porównania tylko w obrębie tego samego trybu i palnika).
  if (c.round) {
    const deaths = ((c.mem || {})[floorKey(c.mode, c.garnek, c.round)] || {}).deaths || [];
    if (deaths.length >= 1) {
      const n = deaths.length + 1, now = { k: c.killerId || null, hp: deHp, used: res ? res.skillsUsed | 0 : null, hs: c.hasSkills ? 1 : 0 }, all = deaths.concat(now);
      const kk = now.k ? all.filter(x => x.k === now.k).length : 0, weak = all.filter(x => x.hp != null && x.hp < 40).length, ns = all.filter(x => x.hs && x.used === 0).length;
      if (kk >= 2 && c.killerName) add(kk >= 3 ? 93 : 86, 'floormem', 'floormem_killer', { round: c.round, n, k: kk, killer: c.killerName });
      if (weak >= 2 && now.hp != null && now.hp < 40) add(88, 'floormem', 'floormem_weak', { round: c.round, n, k: weak });
      if (ns >= 2 && now.hs && now.used === 0) add(86, 'floormem', 'floormem_noskill', { round: c.round, n, k: ns });
      if (n >= 3) add(74, 'floormem', 'floormem_n', { round: c.round, n });
    }
  }
  floorPb(c, out, add, false);
  if (last) {
    if (c.round < last.round) add(84, 'vs', 'vs_regres', { lr: last.round, round: c.round });
    else if (c.round >= last.round + 2 && !last.win) add(70, 'vs', 'vs_postep', { lr: last.round, round: c.round });
    if (okLog && c.hasSkills && A.used === 0 && last.hs && last.used >= 4) add(86, 'vs', 'vs_skills', { last: usedTxt(last.used) });
    if (!last.win && last.coins >= 20 && c.coins >= 20) add(85, 'vs', 'vs_coins', { a: coinsTxt(last.coins), b: coinsTxt(c.coins) });
  }

  // Rekordy wstydu (potrzebna historia porównawcza).
  const S = c.shame || {};
  if (res && hist.length >= 3) {
    if (S.minTicks != null && res.ticks > 0 && res.ticks < S.minTicks) add(91, 'shame', 'shame_fast', { secs: secs(res.ticks), prev: secs(S.minTicks) });
    if (S.maxCoins != null && c.coins > S.maxCoins && c.coins >= 25) add(90, 'shame', 'shame_coins', { coins: coinsTxt(c.coins), coinsI: ziarnI(c.coins), prev: coinsTxt(S.maxCoins) });
    if (S.minDealt != null && res.ticks >= 30 && res.dealt < S.minDealt) add(86, 'shame', 'shame_dealt', { dealt: num(res.dealt), prev: num(S.minDealt) });
    if (c.hasSkills && res.skillsUsed === 0 && (S.noSkill | 0) >= 2) add(87, 'shame', 'shame_noskill', { k: (S.noSkill | 0) + 1 });
  }

  // Stałe obserwacje o grze i graczu.
  if (c.abandoned) add(60, 'abandon', 'abandon', { round: c.round });
  if (c.setHint) add(55, 'set', 'set', { set: c.setHint });
  if (c.streak >= 3) add(93, 'streak', 'streak3', { n: c.streak, round: c.round });
  else if (c.streak === 2) add(87, 'streak', 'streak2', { round: c.round });
  if (c.runs === 1) add(75, 'first', 'first');
  bets(c, add, A, okLog, res);
  // Awaryjna: zawsze coś prawdziwego, żeby okno nie było puste.
  if (res) add(MIN_FACT, 'base', 'base', { round: c.round, secs: secs(res.ticks) }, { floor: true });
  else add(MIN_FACT, 'base', 'base_noresult', { round: c.round }, { floor: true });
  return rank(out, c);
}

// Piętro, które zabijało cię wielokrotnie, a tym razem je minąłeś (przed zapisem śmierci z tego runu).
function floorPb(c, out, add, win) {
  const upto = win ? c.rounds : c.round - 1; let best = null;
  for (let f = 1; f <= upto; f++) {
    const d = (((c.mem || {})[floorKey(c.mode, c.garnek, f)] || {}).deaths || []).length;
    if (d >= 2 && (!best || d > best.d || (d === best.d && f > best.f))) best = { f, d };
  }
  if (best) add(best.d >= 3 ? 91 : 82, 'floorpb', win ? 'floorpb_win' : 'floorpb_lose', { f: best.f, d: best.d, round: c.round });
}

// Zakład Prezesa: rozliczenie poprzedniego (bardzo mocne) albo propozycja nowego (zapisuje się tylko wtedy, gdy to ona zostanie pokazana).
function bets(c, add, A, okLog, res) {
  const b = c.bet, now = c.now;
  if (b && b.mode === c.mode && b.garnek === c.garnek && (b.n | 0) < now && now - (b.n | 0) <= BET_TTL) {
    let won = null, v = {};
    if (b.kind === 'floor') { won = !!c.win || c.round > b.target; v = { round: c.win ? c.rounds : c.round, target: b.target }; }
    else if (b.kind === 'coins') { won = c.coins <= b.target; v = { coins: coinsTxt(c.coins), coinsI: ziarnI(c.coins), target: b.target }; }
    else if (b.kind === 'score') { won = c.score > b.target; v = { score: num(c.score), target: num(b.target) }; }
    else if (b.kind === 'skills' && okLog && A.fights >= 3) won = (c.log || []).filter(e => !e.extra).every(e => e.used >= 1);
    if (won != null) add(97, 'betres', `bet_${won ? 'win' : 'lose'}_${b.kind}`, v);
  }
  if (!b) {
    const base = { mode: c.mode, garnek: c.garnek };
    if (c.win) add(62, 'bet', 'bet_score', { target: num(c.score) }, { bet: { ...base, kind: 'score', target: c.score } });
    else {
      if (c.round >= 3) add(58, 'bet', 'bet_floor', { target: c.round }, { bet: { ...base, kind: 'floor', target: c.round } });
      if (c.coins >= 20) { const t = Math.max(5, Math.floor(c.coins / 3)); add(56, 'bet', 'bet_coins', { target: t, coins: coinsTxt(c.coins), coinsI: ziarnI(c.coins) }, { bet: { ...base, kind: 'coins', target: t } }); }
      if (c.hasSkills && okLog && A.fights >= 2 && res && res.skillsUsed === 0) add(57, 'bet', 'bet_skills', {}, { bet: { ...base, kind: 'skills', target: 1 } });
    }
  }
}

// Wybór dokładnie jednej ciekawostki: pierwsza powyżej progu, a gdy brak (po karach za świeżość) awaryjna.
export function pickFacts(list) {
  const f = list.find(x => x.p >= MIN_FACT && !x.floor) || list.find(x => x.floor);
  return f ? [f] : [];
}

// ---------- wygrana ----------
export function winFacts(c) {
  const out = [], add = adder(c, out), fl = c.floor, A = agg(c.log), st = c.stats || {};
  const okLog = A.fights >= Math.max(1, Math.round((c.rounds || 1) * 0.8));
  const hist = c.hist || [];
  if (fl && fl.runs >= MIN_SAMPLE) {
    const w = Math.round(fl.wins * 100 / fl.runs);
    add(w <= 30 ? 90 : 55, 'wins', w <= 30 ? 'w_wins' : 'w_wins_hi', { garnek: c.garnek, pct: w });
  }
  const flawless = c.flawless | 0;
  if (flawless >= 3) add(80, 'flawless', 'w_flawless', { n: `${flawless} ${pl(flawless, 'walkę', 'walki', 'walk')}` });
  if (c.rerolls >= 8) add(70, 'reroll', 'w_reroll', { n: c.rerolls });
  if (c.coins >= 30) add(66, 'coins', 'w_coins', { coins: coinsTxt(c.coins), coinsI: ziarnI(c.coins) });
  if (c.maxHit > 0) add(50, 'hit', 'w_hit', { hit: num(c.maxHit) });
  if (c.garnek < c.maxGarnek) add(45, 'next', 'w_next', { next: c.garnek + 1 });

  if (okLog) {
    if (A.low && A.low.pct <= 15) add(A.low.pct <= 8 ? 92 : 82, 'lowhp', 'w_lowhp', { r: A.low.r, pct: A.low.pct });
    if (c.hasSkills && A.used === 0) add(92, 'noskill', 'w_noskill');
    if (st.rests === 0) add(80, 'norest', 'w_norest');
    const bossE = (c.log || []).filter(e => e.boss && e.win && !e.extra).pop();
    if (bossE && bossE.ticks > 0 && bossE.ticks <= 150) add(72, 'quickboss', 'w_quickboss', { secs: secs(bossE.ticks) });
  }
  let k = 0; for (let i = hist.length - 1; i >= 0 && !hist[i].win; i--) k++;
  if (k >= 3) add(k >= 8 ? 94 : k >= 5 ? 90 : 82, 'afterloss', 'w_afterloss', { k });
  if (c.mode === 'quick' && c.fullRounds) add(55, 'mode', 'w_mode', { full: c.fullRounds });
  if (c.garnek < c.maxGarnek && c.garnekScore > 0 && c.score > 0) {
    const diff = Math.round(c.score * c.garnekScore / (100 + c.garnekScore * c.garnek));
    if (diff >= 100) add(66, 'garnekpot', 'w_garnek', { next: c.garnek + 1, diff: num(diff) });
  }
  floorPb(c, out, add, true);
  bets(c, add, A, okLog, null);
  add(MIN_FACT, 'base', 'w_base', { mode: String(c.modeName || '').toLowerCase(), garnek: c.garnek }, { floor: true });
  return rank(out, c);
}
