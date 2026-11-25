// Bulgot: pamięć ciekawostek końca runu (czysty JS, bez DOM; magazyn wstrzykiwany: { get(k), set(k, v) } = `store` z ui/core.js).
// Wszystko w localStorage przeglądarki (kosmetyka, bez wpływu na ranking). Brak danych nie psuje niczego: generatory po prostu milczą.
//   bulgot:runlog   dziennik bieżącego runu (wpis na walkę), tylko jeden run naraz
//   bulgot:hist     podsumowania ostatnich 30 runów
//   bulgot:floormem pamięć pięter: `tryb|palnik|piętro` -> ostatnie śmierci na tym piętrze
//   bulgot:shame    rekordy wstydu (antyrekordy)
//   bulgot:seen     co pokazano w ostatnich ~30 runach (kategoria, wariant, numer runu)
//   bulgot:factn    licznik runów z ciekawostką
//   bulgot:bet      aktywny zakład Prezesa

const K = { log: 'bulgot:runlog', hist: 'bulgot:hist', floors: 'bulgot:floormem', shame: 'bulgot:shame', seen: 'bulgot:seen', n: 'bulgot:factn', bet: 'bulgot:bet' };
export const HIST_MAX = 30, SEEN_RUNS = 30, DEATHS_MAX = 8, BET_TTL = 6;

// Wpis jednej walki (z wyniku walki j.result, ustawienia setup i stanu sprzed walki pre).
export function floorEntry(setup, pre, res) {
  const foes = (setup.enemies || []).filter(e => !e.minion);
  const maxHp = res.maxHp || (setup.hero && setup.hero.maxHp) || 0;
  return {
    r: setup.round | 0, boss: foes.some(e => e.boss) ? 1 : 0, extra: setup.extra ? 1 : 0, zone: setup.zone | 0,
    hpIn: pre.hp | 0, maxHp, hpOut: res.hp | 0, win: res.win ? 1 : 0, ticks: res.ticks | 0, dealt: res.dealt | 0, taken: res.taken | 0, maxHit: res.maxHit | 0,
    used: res.skillsUsed | 0, left: res.foeLeft | 0, low: res.lowest == null ? null : res.lowest | 0, rested: pre.rested ? 1 : 0, coins: pre.coins | 0,
    foes: foes.map(e => e.name).filter(Boolean).slice(0, 4),
  };
}

// Zbiorcze liczby z dziennika (dodatkowe rundy liczą się tylko do czasu i umiejętności).
export function agg(log) {
  const f = (log || []).filter(e => !e.extra);
  const pcts = f.map(e => e.maxHp ? Math.round(e.hpIn * 100 / e.maxHp) : null).filter(x => x != null);
  let low = null;
  for (const e of f) if (e.win && e.low != null && e.maxHp) { const p = Math.max(1, Math.round(e.low * 100 / e.maxHp)); if (!low || p < low.pct) low = { pct: p, r: e.r }; }
  return {
    fights: f.length, used: (log || []).reduce((a, e) => a + (e.used | 0), 0), ticks: (log || []).reduce((a, e) => a + (e.ticks | 0), 0),
    rests: f.filter(e => e.rested).length, pcts, avgIn: pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null, low,
  };
}

export const floorKey = (mode, garnek, round) => `${mode}|${garnek}|${round}`;

export function createMemory(store) {
  const rd = (k, d) => { try { const s = store.get(k); return s ? JSON.parse(s) : d; } catch (e) { return d; } };
  const wr = (k, v) => { try { store.set(k, JSON.stringify(v)); } catch (e) {} };
  const num = k => { const n = parseInt(store.get(k), 10); return Number.isFinite(n) ? n : 0; };
  const mem = {
    // dziennik bieżącego runu
    log(id) { const l = rd(K.log, null); return l && l.id === id && Array.isArray(l.floors) ? l.floors : []; },
    addFloor(id, e) {
      let l = rd(K.log, null);
      if (!l || l.id !== id || !Array.isArray(l.floors)) l = { id, floors: [] };
      l.floors.push(e); if (l.floors.length > 80) l.floors.shift();
      wr(K.log, l);
    },
    hist() { const h = rd(K.hist, []); return Array.isArray(h) ? h : []; },
    floors() { const f = rd(K.floors, {}); return f && typeof f === 'object' ? f : {}; },
    shame() { return rd(K.shame, {}) || {}; },
    seen() { const s = rd(K.seen, []); return Array.isArray(s) ? s : []; },
    now() { return num(K.n) + 1; },   // numer bieżącego runu (następny po ostatnio zapisanym)
    bet() { const b = rd(K.bet, null); return b && b.kind ? b : null; },
    // Zapis po wyborze ciekawostki. Wołać RAZ na run, po policzeniu ciekawostek (porównania dotyczą stanu sprzed tego runu).
    commit(c, picked) {
      const now = mem.now();
      if ((mem.hist().some(h => h.id === c.runId))) return;   // ten run już zapisany
      // pokazane ciekawostki
      let seen = mem.seen();
      if (picked) seen.push({ cat: picked.cat, v: picked.v, n: now });
      seen = seen.filter(s => now - s.n < SEEN_RUNS).slice(-60);
      wr(K.seen, seen);
      // zakład: rozliczony lub przeterminowany znika, nowy zapisuje się tylko wtedy, gdy to on został pokazany
      const b = c.bet;
      if (picked && picked.bet) wr(K.bet, { ...picked.bet, n: now });
      else if (b && ((picked && picked.cat === 'betres') || now - (b.n || 0) > BET_TTL || b.mode !== c.mode || b.garnek !== c.garnek)) store.set(K.bet, '');
      // pamięć pięter (tylko porażka: miejsce śmierci)
      const fl = mem.floors();
      if (!c.win && c.round) {
        const key = floorKey(c.mode, c.garnek, c.round), rec = fl[key] || { deaths: [] };
        const de = lastDeath(c.log);
        rec.deaths.push({ k: c.killerId || null, hp: de && de.maxHp ? Math.round(de.hpIn * 100 / de.maxHp) : null, used: c.result ? c.result.skillsUsed | 0 : null, hs: c.hasSkills ? 1 : 0, rested: de ? de.rested : 0, n: now });
        if (rec.deaths.length > DEATHS_MAX) rec.deaths.shift();
        fl[key] = rec;
        const keys = Object.keys(fl); if (keys.length > 120) for (const k of keys.slice(0, keys.length - 120)) delete fl[k];
        wr(K.floors, fl);
      }
      // rekordy wstydu
      if (!c.win && c.result) {
        const S = mem.shame(), r = c.result;
        if (r.ticks > 0) S.minTicks = S.minTicks == null ? r.ticks : Math.min(S.minTicks, r.ticks);
        if (r.ticks >= 30) S.minDealt = S.minDealt == null ? r.dealt : Math.min(S.minDealt, r.dealt);
        S.maxCoins = Math.max(S.maxCoins || 0, c.coins | 0);
        if (c.hasSkills && r.skillsUsed === 0) S.noSkill = (S.noSkill || 0) + 1;
        wr(K.shame, S);
      }
      // historia runów
      const h = mem.hist(), sm = summarize(c, now); if (picked) sm.fact = { cat: picked.cat, kind: picked.cat, v: picked.v, text: picked.text }; h.push(sm); while (h.length > HIST_MAX) h.shift(); wr(K.hist, h);
      store.set(K.n, String(now));
    },
  };
  return mem;
}

const lastDeath = log => { const l = (log || []).filter(e => !e.extra); const e = l[l.length - 1]; return e && !e.win ? e : null; };

// Krótkie podsumowanie runu do historii.
export function summarize(c, n) {
  const A = agg(c.log), r = c.result || {};
  return {
    id: c.runId, n, win: c.win ? 1 : 0, mode: c.mode, garnek: c.garnek, char: c.char || null, round: c.round | 0, rounds: c.rounds | 0, score: c.score | 0, coins: c.coins | 0,
    killer: c.killerId || null, used: A.used, fights: A.fights, ticks: A.ticks, rests: c.stats ? c.stats.rests | 0 : A.rests, rerolls: c.stats ? c.stats.rerolls | 0 : 0,
    lastTicks: r.ticks | 0, lastDealt: r.dealt | 0, lastUsed: r.skillsUsed | 0, hs: c.hasSkills ? 1 : 0,
  };
}
