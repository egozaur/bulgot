// Bulgot, interfejs: panel boczny bohatera: ikony zestawów, umiejętności, statystyki.
// Wydzielone z app.js (2026-11-24). Wszystkie funkcje i stałe są eksportowane i dzielą stan przez G (ui/core.js).
import * as D from '../shared/data.js?v=20261126b';
import * as art from '../art.js?v=20261126b';
import * as T from '../text.js?v=20261126b';
import { setCounts, activeLinks } from '../shared/stats.js?v=20261126b';
import { $, G, TILE, esc, store } from './core.js?v=20261126b';
import { compForm, companionBlurb, decreeImpact, lvlTag, setsOf } from './run.js?v=20261126b';

// Zestawy i kamienie milowe jako duże ikony z konturem w kolorze progu (po bokach portretu); kropki = progi 2/3/4/6.
export function setIconsHTML() {
  const r = G.run, sc = setCounts(r.tiles, r.decree);
  const sets = Object.keys(D.SETS).filter(id => sc[id]).map(id => {
    const n = sc[id], step = D.SET_STEPS.filter(s => n >= s).length;
    return `<div class="six t${step}" tabindex="0" data-tipk="set:${id}"><span class="si-i">${SET_ICON[id] || '⭐'}</span><span class="si-nm">${esc(D.SETS[id].name)}</span><b class="si-n">${n}</b><u>${D.SET_STEPS.map(s => `<i class="${n >= s ? 'on' : ''}"></i>`).join('')}</u></div>`;
  });
  const ms = Object.entries(D.MILESTONES).map(([id, m]) => ({ m, n: Math.floor(r.tiles.filter(x => x === id).length / D.MILESTONE_EVERY) })).filter(x => x.n)
    .map(x => `<div class="six ms" tabindex="0" data-tip="${esc(x.m.name + '\n' + x.m.text)}"><span class="si-i">⭐</span><span class="si-nm">${esc(x.m.name)}</span><b class="si-n">${x.n}</b></div>`);
  return [...sets, ...ms];
}
// Trzy kółka umiejętności (klawisze 1–3): symbol, poziom, nazwa pod spodem; kolejność zmienia się przeciąganiem albo strzałkami ←/→ na aktywnym kółku.
export function skillRingsHTML() {
  const r = G.run, mv = r.skills.length > 1 && r.phase !== 'over';
  return `<div class="srings">${Array.from({ length: r.maxSkills || D.RULES.maxSkills }, (_, i) => {
    const s = r.skills[i];
    if (!s) return '<div class="sring empty" data-tip="Wolny slot umiejętności\nKolejna umiejętność trafi tu sama."><span>+</span></div>';
    const def = D.SKILLS[s.id], tile = D.TILES.find(t => t.skill === s.id);
    return `<div class="sring ${s.lvl >= 3 ? 'l3' : s.lvl === 2 ? 'l2' : ''} ${mv ? 'mv' : ''}" tabindex="0" data-tipk="tile:${tile.id}" ${mv ? `data-tipx="Zmiana kolejności (klawisz w walce): przeciągnij kółko albo użyj strzałek ←/→." draggable="true" data-slot="${i}"` : ''}><span class="rk">${i + 1}</span>${art.tileIcon(tile.id)}${s.lvl >= 2 ? `<b class="rl">${s.lvl >= 3 ? 'M' : s.lvl}</b>` : ''}<em>${esc(def.name.split(' ')[0])}</em></div>`;
  }).join('')}</div>`;
}
// Statystyki w jednej kolumnie: ikona, nazwa, liczba i jednostka w stałych kolumnach; mikropasek to tylko orientacyjna skala.
export const BAR_CAP = { atk: 100, aspd: 300, crit: 100, maxHp: 150, armor: 80, evade: 75, regen: 50, luck: 100 };
// Statystyki w jednej kolumnie (Patch 1.1): ikona, nazwa, liczba z jednostką i premia ponad bazę; pod spodem pasek z 10 segmentów (orientacyjna skala).
export function statListHTML() {
  const S = G.run.hero, base = (D.CHARS[G.run.char] || {}).base;
  const keys = T.STAT_GROUPS.flatMap(([, ks]) => ks);
  return `<div class="sl">${keys.map(([k, label]) => {
    const [num, unit] = T.statValue(k, S), bn = T.statBonus(k, S, base), on = Math.round(Math.max(0, Math.min(1, S[k] / BAR_CAP[k])) * 10);
    return `<div class="slr" tabindex="0" data-k="${k}" data-tipk="stat:${k}"><span class="slt">${art.statIcon(k)}<span class="sln">${label}</span><span class="slv"><b>${num}</b><i>${unit}</i><em class="${bn.neg ? 'neg' : ''}">${bn.txt}</em></span></span><span class="slb">${Array.from({ length: 10 }, (_, i) => `<i class="${i < on ? 'on' : ''}"></i>`).join('')}</span></div>`;
  }).join('')}</div>`;
}
// Przycisk Odpoczynku w rogu karty bohatera: ta sama akcja i te same warunki co przycisk „Odpoczynek” na scenie oferty.
export function healBtnHTML() {
  const r = G.run, off = r.phase !== 'offer' || r.rested || r.hp >= r.maxHp || r.coins < r.restCost || !!r.extraNow;
  const why = r.phase !== 'offer' ? 'Odpoczywać można przed wyborem kafelka' : r.extraNow ? 'Przed dodatkową rundą nie ma odpoczynku' : r.rested ? 'W tej rundzie już odpoczywałeś' : r.hp >= r.maxHp ? 'Masz pełne życie' : r.coins < r.restCost ? 'Za mało Ziaren' : `Odpoczynek (O): +${r.restPct}% życia za ${r.restCost} Ziaren`;
  return `<button class="hh-heal" data-act="rest" ${off ? 'disabled' : ''} title="${esc(why)}" aria-label="Odpoczynek">${art.statIcon('regen')}<span class="pr">${r.restCost}${art.coinIcon()}</span></button>`;
}
// Kafelki pogrupowane wg typu: Legendarne, Przedmioty, Statystyki, Ryzyko (bez umiejętności: te są w kółkach).
export function tileGroupsHTML(im) {
  const r = G.run, counts = {}; for (const id of r.tiles) { const t = TILE[id]; if (t && t.type !== 'skill') counts[id] = (counts[id] || 0) + 1; }
  const grp = t => (t.boss || t.legend) ? 'Legendarne' : t.fam ? 'Statystyki' : t.type === 'risk' ? 'Ryzyko' : 'Przedmioty';
  const GR = { Legendarne: [], Przedmioty: [], Statystyki: [], Ryzyko: [] };
  Object.entries(counts).sort((a, b) => TILE[b[0]].rarity - TILE[a[0]].rarity || b[1] - a[1]).forEach(e => GR[grp(TILE[e[0]])].push(e));
  const chip = ([id, n]) => {
    const t = TILE[id], g = t.grow ? Math.min(t.grow.max, (r.grow || {})[id] || 0) : 0, fw = (r.flawed || []).find(w => w.id === id);
    const tip = fw ? 'Wada fabryczna (+50% efektów): ' + (fw.flaw ? D.FLAWS[fw.flaw].name + '. ' + D.FLAWS[fw.flaw].text : 'ujawni się po walce') : '';
    return `<div class="chip r${t.rarity} ${fw ? 'flawed' : ''} ${im.ids.includes(id) ? 'dhit' : ''} ${id === G.upFresh ? 'fresh' : ''}" tabindex="0" data-tipk="tile:${id}" data-tipx="${esc(tip)}">${lvlTag(t)}${art.tileIcon(id)}${n > 1 ? `<sup>×${n}</sup>` : ''}${g ? `<sup class="gr">+${g}</sup>` : ''}</div>`;
  };
  const body = Object.entries(GR).filter(([, l]) => l.length).map(([g, l]) => `<div class="tgrp"><span class="tgl">${g} <b>${l.reduce((a, x) => a + x[1], 0)}</b></span><div class="chips">${l.map(chip).join('')}</div></div>`).join('');
  return { body, total: Object.values(counts).reduce((a, b) => a + b, 0) };
}
export function sideHTML() {
  const r = G.run, S = r.hero, ch = D.CHARS[r.char], cp = T.CHAR_PERKS[r.char] || { title: '', perks: [] };
  const pct = Math.max(0, Math.min(100, r.hp / S.maxHp * 100));
  const items = setIconsHTML(), im = decreeImpact(r);
  const perkTip = cp.perks.map(([, sg, tx]) => (sg === '+' ? '＋ ' : '− ') + tx).join('\n');
  const heroTip = esc(ch.name + ' · ' + (cp.role || ch.style) + '\n' + ch.text + (perkTip ? '\n' + perkTip : ''));
  const pet = r.companion ? (() => { const c = r.companion, d = D.COMPANIONS[c.id]; return `<span class="pet" tabindex="0" data-tip="${esc(compForm(c) + ' (poziom ' + c.lvl + ' z 3)\n' + companionBlurb(c.id, c.lvl) + '\nRośnie po każdym pokonanym bossie.')}">${art.companionArt(c.id)}<b>${c.lvl}</b></span>`; })() : '';
  const bd = r.badges && r.badges.length ? `<div class="bdgs">${r.badges.map(bdg => `<div class="chip badge" tabindex="0" data-tipk="badge:${bdg}">${art.badgeIcon(bdg)}</div>`).join('')}</div>` : '';
  const links = linkChipsHTML();
  const tg = tileGroupsHTML(im);
  const pawnLine = r.pawned ? `<div class="setline pawn">W lombardzie: ${esc(TILE[r.pawned.id].name)}${r.pawned.canRedeem ? ` (wykup za ${r.pawned.cost} Ziaren tylko na tym piętrze)` : ' (wykup na następnym piętrze)'}</div>` : '';
  const foxLine = r.foxDebt ? `<div class="setline pawn">Lisy Windykatory silniejsze o ${r.foxDebt * D.RULES.pawnFox}% (przepadłe zastawy)</div>` : '';
  return `<aside class="side hub">
    <div class="panel hero-card hubhead" tabindex="0" data-tip="${heroTip}">
      ${healBtnHTML()}
      <div class="hh-row"><div class="h4-fig hh-fig" style="--p:${pct}"><div class="kin">${art.heroArt(r.char, r.form)}</div>${pet}</div>
        <div class="hh-tr"><div class="hh-nm"><b>${esc(ch.name)}</b><span>${esc(cp.title ? '★ ' + cp.title : cp.role || ch.style)}</span></div>
          <div class="hh-hp" style="--p:${pct}"><i></i><b><span data-ctr="hp">${r.hp}</span> / ${S.maxHp}</b></div></div></div>
      ${skillRingsHTML()}
      ${items.length ? `<div class="hh-sets">${items.join('')}</div>` : ''}
      ${links || bd ? `<div class="h4-mix">${links}${bd}</div>` : ''}</div>
    <div class="panel"><h4>Statystyki</h4>${statListHTML()}${zoneCompareHTML()}</div>
    <div class="panel"><h4>Kafelki (${tg.total})</h4>${tg.body || '<span class="hint">Jeszcze nic. Wybierz pierwszy kafelek.</span>'}${pawnLine}${foxLine}</div></aside>`;
}
// Liczniki tablicy rozdzielczej: licznik odcinkowy wyniku i przewijanie wartości przy zmianie (zielony / czerwony błysk).
export const odoHTML = (n, len) => String(Math.max(0, n | 0)).padStart(len, '0').split('').map(d => `<i>${d}</i>`).join('');
// Animacje: domyślnie WŁ. niezależnie od ustawień systemu (Windows „pokaż animacje” / oszczędzanie energii wyłączały całą walkę);
// gracz wyłącza je sam w „Dźwięk i walka” (`bulgot:anim` = '0'), klasa `html.reduce` wyłącza je w CSS.
export const animOn = () => store.get('bulgot:anim') !== '0';
export const REDUCED = { get matches() { return !animOn(); } };
export const applyAnim = () => document.documentElement.classList.toggle('reduce', !animOn());
export function rollCounters() {
  const prev = G.ctr || (G.ctr = {}), runId = G.run && G.run.id;
  if (prev._run !== runId) { for (const k of Object.keys(prev)) delete prev[k]; prev._run = runId; }
  for (const el of document.querySelectorAll('[data-ctr]')) {
    const k = el.dataset.ctr, to = k === 'score' ? G.run.score : k === 'coins' ? G.run.coins : G.run.hp, from = prev[k];
    prev[k] = to;
    if (from === undefined || from === to) continue;
    const cell = el.closest('.disp, .hpbar, .hc-num, .hpnum') || el;
    cell.classList.remove('flash-up', 'flash-down'); void cell.offsetWidth; cell.classList.add(to > from ? 'flash-up' : 'flash-down');
    if (REDUCED.matches) continue;
    const fmt = v => el.dataset.odo ? odoHTML(v, +el.dataset.odo) : String(v), t0 = performance.now(), dur = Math.min(900, 300 + Math.abs(to - from) * 6);
    const step = now => { const q = Math.min(1, (now - t0) / dur), v = Math.round(from + (to - from) * (1 - Math.pow(1 - q, 3))); if (!el.isConnected) return; el.innerHTML = fmt(v); if (q < 1) requestAnimationFrame(step); };
    el.innerHTML = fmt(from); requestAnimationFrame(step);
  }
}
// Porównanie z typowym wrogiem bieżącej strefy (średnia z jawnych danych strefy, bez składu piętra):
// atak = jak szybko pokonasz typową grupę, obrona = jak długo wytrzymasz jej ciosy. Słabo / OK / Mocno.
export function zoneCompare() {
  const r = G.run, S = r.hero, M = D.MODES[r.mode], gm = D.garnekMods(r.garnek);
  const pool = Object.values(D.ENEMIES).filter(e => e.zone === r.zone && !e.minion);
  if (!pool.length || !S) return null;
  const avg = k => pool.reduce((a, e) => a + (e[k] || 0), 0) / pool.length;
  let h = 1, a = 1; for (let i = 1; i < r.round; i++) { h *= M.grow.hp; a *= M.grow.atk; }
  if (r.round <= M.early.rounds) { h *= M.early.hp / 100; a *= M.early.atk / 100; }
  const zm = M.zoneMul && M.zoneMul[r.zone]; if (zm) { h *= zm.hp / 100; a *= zm.atk / 100; }
  const rp = D.garnekRamp(r.mode, r.round) / 100;
  h *= (100 + Math.floor((gm.enemyHp || 0) * rp)) / 100; a *= (100 + Math.floor((gm.enemyAtk || 0) * rp)) / 100;
  const n = r.zone === 0 ? 1.5 : 2, eHp = avg('hp') * h * n, eArm = avg('armor'), eDps = avg('atk') * a * avg('aspd') / 100 * n * (100 - avg('evade')) / 100;
  const crit = 1 + (S.crit || 0) * ((S.critMult || 200) - 100) / 10000;
  const dps = Math.max(0.1, S.atk * S.aspd / 100 * crit * 100 / (100 + eArm));
  const taken = Math.max(0.05, eDps * 100 / (100 + S.armor) * (100 - Math.min(75, S.evade || 0)) / 100 - (S.regen || 0) / 10);
  return { off: 10 / (eHp / dps), def: (S.maxHp / taken) / 20 };
}
// Zestawy jako ikonki pod paskami Atak/Obrona: kropki = sztuki zestawu (wypełnione = posiadane, kwadrat = próg bonusu), żółty = brakuje jednej sztuki do progu.
export const SET_ICON = { jajeczne: '🥚', zbozowe: '🌽', rambo: '💪', rosolowe: '🔥', chlodnicze: '❄️', korpo: '💼' };
// Ile sztuk zestawu jest w puli (legendy z podwójnym wpisem liczą się za 2).
export const setTotal = id => D.TILES.filter(t => !t.hatched && !t.hidden).reduce((a, t) => a + setsOf(t).filter(x => x === id).length, 0);
export function linkChipsHTML() {
  if (!G.run) return '';
  const r = G.run, st = activeLinks(r.tiles, r.skills, setCounts(r.tiles, r.decree)).filter(l => l.met);
  const html = st.map(l => { const L = D.SET_LINKS.find(x => x.id === l.id); return `<div class="lnk ${l.kind} ${l.fixed ? 'fixed' : ''}" tabindex="0" data-tipk="link:${l.id}"><span class="lic">${l.kind === 'conflict' ? (l.fixed ? '☮' : '⚔') : '✚'}</span><span class="lnm">${esc(L.name)}</span></div>`; }).join('');
  return html ? `<div class="zlinks" aria-label="Powiązania zestawów">${html}</div>` : '';
}
export function zoneCompareHTML() {
  const c = zoneCompare(); if (!c) return '';
  const lv = v => v < 0.75 ? ['lo', 'SŁABO'] : v > 1.3 ? ['hi', 'MOCNO'] : ['ok', 'OK'];
  const [ac, aw] = lv(c.off), [dc, dw] = lv(c.def);
  return `<div class="hzc" aria-label="Porównanie z wrogami strefy"><span>Wobec strefy</span><b class="${ac}" tabindex="0" data-tip="Jak szybko pokonasz typową grupę wrogów tej strefy (Atak, Szybkość ataku i Dziobnięcie kontra ich Życie i Pancerz).">Atak ${aw}</b><b class="${dc}" tabindex="0" data-tip="Jak długo wytrzymasz ciosy typowej grupy wrogów tej strefy (Życie, Pancerz, Unik, Regeneracja kontra ich Atak).">Obrona ${dw}</b></div>`;
}


// Podgląd zmiany statystyk przed wzięciem kafelka (Patch 1.1): serwer liczy różnice (view().preview), klient pokazuje je przy najechaniu na kartę.
export function previewIds() { const r = G.run; return !r ? [] : r.phase === 'loot' ? (r.pending && r.pending.offer) || [] : r.offer || []; }
export function clearPreview() {
  document.querySelectorAll('.slr .gd').forEach(e => e.remove());
  document.querySelectorAll('.slr.pv').forEach(e => e.classList.remove('pv'));
}
export function showPreview(i) {
  clearPreview();
  const r = G.run, id = previewIds()[i], d = id && r && r.preview && r.preview[id];
  if (!d) return;
  for (const [k, v] of Object.entries(d)) {
    const row = document.querySelector(`.slr[data-k="${k}"]`); if (!row || !v) continue;
    const a = Math.abs(v), body = k === 'aspd' ? T.fmtPerSec(a) : k === 'regen' ? T.fmtRegen(a) : String(a);
    const em = document.createElement('em'); em.className = 'gd ' + (v > 0 ? 'up' : 'dn'); em.textContent = (v > 0 ? '▲ +' : '▼ −') + body + (k === 'crit' || k === 'evade' ? '%' : '');
    em.title = 'Tyle zmieni się po wzięciu tego kafelka';
    row.classList.add('pv'); row.querySelector('.slv').appendChild(em);
  }
}
export function initPreview() {
  const idx = e => { const t = e.target.closest && e.target.closest('.cards .tile[data-i]'); return t ? +t.dataset.i : -1; };
  document.addEventListener('mouseover', e => { const i = idx(e); if (i >= 0) showPreview(i); });
  document.addEventListener('mouseout', e => { if (idx(e) >= 0) clearPreview(); });
  document.addEventListener('focusin', e => { const i = idx(e); if (i >= 0) showPreview(i); });
  document.addEventListener('focusout', e => { if (idx(e) >= 0) clearPreview(); });
}
