// Bulgot, interfejs: walka na żywo na pełnym ekranie (silnik z shared/sim.js, efekty z fx.js).
// Wydzielone z app.js (2026-11-24). Wszystkie funkcje i stałe są eksportowane i dzielą stan przez G (ui/core.js).
import * as D from '../shared/data.js';
import { Fight, MAX_TICKS, FURY_FROM } from '../shared/sim.js';
import * as art from '../art.js';
import * as T from '../text.js';
import * as snd from '../audio.js';
import { fightScene, sceneClouds } from '../scenes.js';
import { castFx, markHit, trapSnap, SK_COLOR } from '../fx.js';
import { $, G, TILE, act, closeOverlay, esc, openOverlay, sleep, toast } from './core.js';
import { fm, showEnd } from './end.js';
import { floorEntry } from '../fakty-pamiec.js';
import { render } from './home.js';
import { INV, invoiceOn, showInvoice } from './invoice.js';
import { bossIntroOf, compForm, enemyFig, floorKronHTML } from './run.js';
import { PREZES_INTERKOM } from '../fabula.js';
import { REDUCED } from './side.js';

// ---------- walka na żywo ----------
// ---------- walka na pełnym ekranie (Etap 1 przebudowy, 2026-11-23) ----------
// Cały ekran gry znika, zostaje scena strefy (scenes.js), cienki pasek u góry i szerokie szklane kafelki umiejętności na dole.
// Układ liczymy w jednostkach --u (= 1% wysokości sceny, a na wąskich ekranach szerokości): postacie, plakietki i efekty skalują się razem.
export const HX = 23;   // środek bohatera w % szerokości (pływające napisy bohatera)
export const HERO_POS = [HX, 26, 30], COMP_POS = [9, 24, 13];
export const ENEMY_LAYOUT = {
  1: [[76, 25, 28]],
  2: [[64, 30, 23], [84, 25, 26]],
  3: [[56, 32, 20], [73, 26, 26], [89, 32, 17]],
  4: [[50, 34, 16], [64, 28, 20], [77, 24, 23], [91, 31, 16]],
  5: [[46, 35, 14], [58, 30, 17], [70, 26, 20], [82, 23, 22], [93, 31, 14]],
  6: [[38, 36, 12], [50, 31, 14], [61, 27, 16], [72, 24, 18], [83, 30, 14], [94, 26, 14]],
  7: [[35, 37, 11], [45, 32, 12], [55, 28, 14], [65, 25, 15], [75, 31, 13], [85, 27, 14], [95, 33, 11]],
};
export const BOSS_POS = [82, 20, 39], MINION_POS = [[50, 31, 13], [62, 25, 13], [44, 24, 12], [56, 34, 12], [68, 29, 12]];
export const RING = 2 * Math.PI * 36;
export function startFight(setup) {
  const run = G.run, f = new Fight(setup);
  const F = G.fight = { setup, f, inputs: [], queue: [], acc: 0, last: 0, paused: false, finishing: false, units: new Map(), raf: 0, bossBanner: false, fxDelay: null, hitDelay: new Map(), trapEl: null, domeEl: null };
  F.pre = { hp: setup.hero ? setup.hero.hp : run.hp, coins: run.coins, rested: !!run.rested };   // stan sprzed walki do dziennika runu (ciekawostki końca)
  G.screen = 'fight';
  const boss = setup.enemies.find(e => e.boss);
  $('#screen').innerHTML = '';
  const old = $('#fightlayer'); if (old) old.remove();
  const layer = document.createElement('div'); layer.id = 'fightlayer';
  layer.innerHTML = `<div class="arena z${setup.zone}" id="arena"><div class="pl pl-bg">${fightScene(setup.zone)}</div>${sceneClouds(setup.zone)}<div class="pl pl-haze" aria-hidden="true"></div><div class="pl pl-fore" aria-hidden="true"></div><div class="vign"></div>
    <div id="units"></div><div id="fxl"></div><div id="fxs"></div>
    <div class="fhud"><div class="fl"><span class="hchip${boss ? ' boss' : ''}">Piętro ${setup.round}${setup.extra ? ' · DODATKOWY BOSS' : boss ? ' · BOSS' : ''} · ${esc(T.ZONE_NAMES[setup.zone])}</span>${setup.tpl && D.FLOOR_TPL[setup.tpl] ? `<span class="hchip">${esc(D.FLOOR_TPL[setup.tpl].name)}</span>` : ''}</div>
      <div class="timer" id="timer"><span id="tt">0:00</span><div class="tb"><i id="tbi" style="width:0"></i><u></u></div></div>
      <div class="ctl"><button data-act="pause" id="pausebtn" title="Pauza (P)">Pauza</button><button data-act="menu" title="Menu (Esc)">Menu</button></div></div>
    <div class="fcon"><div class="gdak" id="gdak" data-tip="Okno Gdakania&#10;Użyj kolejnej umiejętności w ciągu 1,5 s po poprzedniej. 2. w serii zadaje +20% obrażeń, 3. +50%. Trzy różne umiejętności pod rząd to Pełna Kurza Seria: dodatkowo ogłuszenie wrogów na 1 s."><span class="gl">SERIA</span><span class="gseg" id="gseg"><i></i><i></i><i></i></span><b id="gdakn">–</b><span class="gbar"><i id="gdaki"></i></span></div><div class="skillbar" id="skillbar"></div></div>
    ${boss ? `<div class="kron" id="kline">${esc(bossIntroOf(boss.boss).quote)}</div>` : floorKronHTML('kline')}</div>`;
  document.body.appendChild(layer);
  F.arena = $('#arena'); F.L = $('#fxs');
  // lekka paralaksa: tło, mgiełka i pierwszy plan przesuwają się za kursorem w różnym tempie (bez wpływu na walkę)
  if (!REDUCED.matches) F.arena.addEventListener('pointermove', ev => { const r = F.arena.getBoundingClientRect(); F.arena.style.setProperty('--px', ((ev.clientX - r.left) / r.width - .5).toFixed(3)); F.arena.style.setProperty('--py', ((ev.clientY - r.top) / r.height - .5).toFixed(3)); });
  makeUnit('hero', { name: D.CHARS[run.char].name, art: art.heroArt(run.char, run.form), pos: HERO_POS });
  if (f.comp) { const cc = f.loadout.companion; makeUnit('comp', { name: compForm(cc), art: art.companionArt(cc.id), pos: COMP_POS }); }
  for (const e of f.enemies) makeUnit(e.uid, { e, name: e.name, art: enemyFig(e) });
  layoutUnits(); buildSkillbar(); updateUI(true);
  if (boss) { bossIntro(boss); snd.sfx('boss'); if (setup.extra === 'gruszka') gruszkaSay(boss); } else if (setup.tpl && D.FLOOR_TPL[setup.tpl]) banner(D.FLOOR_TPL[setup.tpl].name + '!', D.FLOOR_TPL[setup.tpl].text, false); else banner('Walka!', '', false);
  F.last = 0; F.raf = requestAnimationFrame(frame);
}

export function placeUnit(el, pos) { const x = innerWidth <= 760 ? 11 + pos[0] * .78 : pos[0]; el.style.left = x + '%'; el.style.bottom = `calc(var(--u) * ${pos[1]} + var(--ub, 0px))`; el.style.width = `calc(var(--u) * ${pos[2]})`; return x; }
export function makeUnit(key, o) {
  const F = G.fight, e = o.e, boss = e && e.boss, small = e && e.minion;
  const el = document.createElement('div');
  el.className = `unit ${key === 'hero' ? 'hero' : key === 'comp' ? 'ally' : 'enemy'} ${boss ? 'boss' : ''} ${small ? 'small' : ''} idle`;
  const sub = boss ? bossIntroOf(e.boss).title.split(', ').slice(1).join(', ') : '';
  el.innerHTML = `<div class="plate"><div class="nm">${esc(o.name)}</div>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}${e && e.affixes ? `<div class="affl">${e.affixes.map(a => esc(D.AFFIXES[a].name)).join(' · ')}</div>` : ''}<div class="hpbar ${key === 'hero' ? '' : 'enemy'}"><i></i><b></b></div><div class="sts"></div></div><div class="shadow"></div><div class="sprite">${o.art}</div><div class="fxs"></div>`;
  if (o.pos) placeUnit(el, o.pos);
  $('#units').appendChild(el);
  F.units.set(key, { el, spr: el.querySelector('.sprite'), bar: el.querySelector('.hpbar i'), txt: el.querySelector('.hpbar b'), fx: el.querySelector('.fxs'), sts: el.querySelector('.sts'), e, x: o.pos ? placeUnit(el, o.pos) : 0, flags: {} });
  return F.units.get(key);
}
export function layoutUnits() {
  const F = G.fight, alive = F.f.enemies.filter(e => !e.dead), boss = alive.find(e => e.boss);
  if (boss) {
    let k = 0;
    for (const e of alive) { const u = F.units.get(e.uid); if (!u) continue; const pos = e.boss ? BOSS_POS : MINION_POS[Math.min(k++, MINION_POS.length - 1)]; u.x = placeUnit(u.el, pos); }
    return;
  }
  const L = ENEMY_LAYOUT[Math.max(1, Math.min(7, alive.length))];
  alive.forEach((e, i) => { const u = F.units.get(e.uid); if (!u) return; const pos = L[Math.min(i, L.length - 1)]; u.x = placeUnit(u.el, pos); });
}
export function buildSkillbar() {
  const F = G.fight, sks = F.f.skills;
  const html = Array.from({ length: 3 }, (_, i) => {
    const s = sks[i];
    if (!s) return `<div class="sk none"><span class="kbadge">${i + 1}</span>wolny slot</div>`;
    const def = D.SKILLS[s.id], tile = D.TILES.find(t => t.skill === s.id);
    return `<button class="sk" data-act="useskill" data-v="${i}" id="sk${i}" style="--c:${SK_COLOR[s.id] || '#ffd23f'}"><span class="kbadge">${i + 1}</span>
      <span class="gauge"><svg class="g" viewBox="0 0 90 90" aria-hidden="true"><circle class="trk" cx="45" cy="45" r="36"/><circle class="val" cx="45" cy="45" r="36"/></svg><span class="ic">${art.tileIcon(tile.id)}</span></span>
      <span class="tx"><span class="sn">${esc(s.lvl >= 3 ? def.muts[(s.mut || 1) - 1].name : def.name)}</span><span class="sst">GOTOWE</span></span><span class="rip"></span></button>`;
  }).join('');
  $('#skillbar').innerHTML = html;
}

// ms: jak długo plansza zostaje na ekranie (domyślnie 1,85 s; kontry bossów i inne ważne komunikaty trzymamy dłużej, żeby dało się je przeczytać)
export function banner(text, sub, bad, ms = 1850) {
  const b = document.createElement('div'); b.className = 'banner' + (bad ? ' bad' : '') + (ms > 2000 ? ' long' : '');
  if (ms !== 1850) b.style.animationDuration = ms / 1000 + 's';
  b.innerHTML = `<b>${esc(text)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}`;
  $('#arena').appendChild(b); setTimeout(() => b.remove(), ms + 50);
}
export function pop(text, cls, x, bottom = 46) {
  const d = document.createElement('div'); d.className = 'dmg ' + cls; d.textContent = text;
  d.style.left = (x + (Math.random() * 6 - 3)) + '%'; d.style.bottom = (bottom + Math.random() * 6) + '%';
  $('#fxl').appendChild(d); setTimeout(() => d.remove(), 1000);
}
export const cls = (u, c, ms) => { u.spr.classList.remove(c); void u.spr.offsetWidth; u.spr.classList.add(c); setTimeout(() => u.spr.classList.remove(c), ms); };
// Wejście bossa jak w kinie: czarne pasy, plansza z imieniem i tytułem, tekst Kronikarza. Walka stoi (tylko obraz, zegar nie liczy).
export function bossIntro(boss) {
  const F = G.fight, I = bossIntroOf(boss.boss), [nm, ...rest] = I.title.split(', ');
  const ik = !F.setup.extra && PREZES_INTERKOM[boss.boss], hold = ik ? 1100 : 0; // interkom Prezesa wydłuża plansze, żeby dało się go przeczytać
  const el = document.createElement('div'); el.className = 'cine'; el.setAttribute('role', 'status');
  el.innerHTML = `<i class="bar t"></i><i class="bar b"></i><div class="plate"><small>${F.setup.extra ? 'DODATKOWY BOSS' : 'BOSS'} · PIĘTRO ${F.setup.round}</small><h3>${esc(nm)}</h3>${rest.length ? `<em>${esc(rest.join(', '))}</em>` : ''}<p>„${esc(I.quote)}”</p>${ik ? `<div class="ik" aria-hidden="true">${art.prezesArt()}<span><b>Interkom Prezesa Rosołowskiego</b>${esc(ik)}</span></div>` : ''}</div>`;
  F.arena.appendChild(el); F.stopUntil = performance.now() + 2300 + hold;
  setTimeout(() => el.classList.add('out'), 2000 + hold); setTimeout(() => el.remove(), 2500 + hold);
}
// Gruszka na starcie walki wyśmiewa build gracza (dymek nad bossem, po wstępie).
export function gruszkaSay(boss) {
  const F = G.fight, fb = F.f.enemies.find(e => e.boss), u = fb && F.units.get(fb.uid); if (!u) return;
  const txt = T.gruszkaTaunt({ ...G.run, hp: F.setup.hero.hp });
  setTimeout(() => { if (G.fight !== F) return; const b = document.createElement('div'); b.className = 'saybub'; b.textContent = '„' + txt + '”'; u.el.appendChild(b); setTimeout(() => b.classList.add('out'), 3600); setTimeout(() => b.remove(), 4100); }, 2300);
}
// Zamach skrzydłem bohatera (łuk przed dziobem) i pióra wylatujące z pokonanego wroga.
export function swoosh(u) {
  if (REDUCED.matches) return;
  const w = document.createElement('div'); w.className = 'swoosh'; w.setAttribute('aria-hidden', 'true'); u.el.appendChild(w); setTimeout(() => w.remove(), 300);
}
export function feathers(u) {
  if (REDUCED.matches) return;
  const w = document.createElement('div'); w.className = 'feathers'; w.setAttribute('aria-hidden', 'true');
  w.innerHTML = [[-60, -70, -40], [-20, -95, 20], [30, -85, 60], [65, -55, 110], [-75, -20, -90], [10, -110, 150]].map(([x, y, r], i) => `<i style="--x:${x}px;--y:${y}px;--r:${r}deg;animation-delay:${i * 30}ms"></i>`).join('');
  u.el.appendChild(w); setTimeout(() => w.remove(), 900);
}
// Mini-wybuch Reakcji na wrogu: Szok = kłąb pary, Gorączka = zielony puls, Kruchość = pęknięcie lodu.
export function burst(u, kind) {
  const b = document.createElement('div'); b.className = 'rburst rb-' + kind; b.setAttribute('aria-hidden', 'true');
  b.innerHTML = kind === 'kruchosc' ? art.crackArt() : '<i></i><i></i><i></i><i></i><i></i>';
  u.el.appendChild(b); setTimeout(() => b.remove(), 900);
}
export function shake() { const a = $('#arena'); if (!a) return; a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); }
// wysokość środka sylwetki w % sceny (tam pokazujemy liczby obrażeń)
export const ub = u => { const a = G.fight.arena.getBoundingClientRect(), r = u.spr.getBoundingClientRect(); return Math.max(8, Math.min(92, (a.bottom - r.top - r.height * .55) / a.height * 100)); };
// kontekst animacji umiejętności (fx.js): punkty liczone z położenia sylwetek na scenie
export function fxBase(extra = {}) {
  const F = G.fight, ar = F.arena, a = ar.getBoundingClientRect(), H = ar.clientHeight, W = ar.clientWidth, U = H / 100;
  const c = { ar, L: F.L, F, W, H, U, u: n => n * U, hero: F.units.get('hero'), shake, mut: 0, ev: [], hits: [], arcs: [], dur: 3000,
    pt: (u, fx = .5, fy = .5) => { const r = u.spr.getBoundingClientRect(); return { x: r.left - a.left + r.width * fx, y: r.top - a.top + r.height * fy }; },
    targets: [...F.units.values()].filter(u => u.e && !u.el.classList.contains('dead')), byUid: k => F.units.get(k), ...extra };
  c.main = c.hits[0] || c.targets[0] || null;
  return c;
}
export const durOf = (id, f) => {
  const ms = x => Math.max(700, (x - f.tick) * 100);
  switch (id) {
    case 'unik': return ms(f.invulnUntil); case 'kontra': return ms(f.kontraUntil); case 'dziobniecie': return ms(f.hasteUntil); case 'podpalka': return ms(f.igniteUntil);
    case 'garsc': return ms(f.dmgUntil); case 'tarcza': return ms(f.hshieldUntil); case 'zemsta': return ms(f.thornFireUntil); case 'pobudka': return ms(f.buffUntil); case 'zupa': return ms(f.soupUntil);
    case 'wypowiedzenie': { const t = f.enemies.find(x => x.mark); return t ? ms(t.mark.at) : 4000; }
    default: return 3000;
  }
};
export function skillFx(e, ev) {
  if (REDUCED.matches) return;
  const F = G.fight, f = F.f, tu = k => F.units.get(k); ev = ev || f.ev;
  const hits = ev.filter(x => x.k === 'hit' && x.kind === e.id).map(x => tu(x.to)).filter(Boolean);
  const mt = ev.find(x => x.k === 'meeting');
  const c = fxBase({ mut: e.mut, ev, hits, arcs: ev.filter(x => x.k === 'arc').map(x => tu(x.to)).filter(Boolean), strong: mt ? tu(mt.uid) : null, dur: durOf(e.id, f) });
  const r = castFx(e.id, c);
  F.fxDelay = r ? { kind: e.id, base: r.base || 0, step: r.step || 0, byX: r.byX || 0, n: 0 } : null;
}

export function onEvent(e) {
  const F = G.fight, f = F.f, hero = F.units.get('hero'), tu = k => F.units.get(k);
  switch (e.k) {
    case 'swing': cls(hero, 'lunge', 240); swoosh(hero); break;
    case 'hit': {
      const u = tu(e.to); if (!u) break;
      // trafienie umiejętności pokazujemy dopiero, gdy doleci jej animacja (fxDelay ustawia receptura z fx.js)
      const fx = F.fxDelay; let d = 0;
      if (fx && fx.kind === e.kind) d = fx.base + (fx.byX ? fx.byX * (u.x / 100) : fx.step * fx.n++);
      F.hitDelay.set(e.to, d);
      const show = () => { if (G.fight !== F) return; cls(u, 'flash', 110); if (!['burn', 'poison', 'bleed'].includes(e.kind)) cls(u, e.crit ? 'knockbig' : 'knock', 220); pop(e.crit ? e.d + '!' : e.d, e.crit ? 'crit' : e.kind === 'bleed' || e.kind === 'burn' || e.kind === 'poison' ? e.kind : e.kind === 'egg' ? 'egg' : '', u.x, ub(u)); snd.sfx(e.crit ? 'crit' : 'hit'); if (e.crit) shake(); };
      d > 0 ? setTimeout(show, d) : show(); break;
    }
    case 'hurt': { const dg = tu(e.from); if (dg && dg.e && dg.e.art === 'pipdog') pop('sik!', 'txt', HX, 64); cls(hero, 'hurtshake', 260); pop('-' + e.d, e.kind === 'burn' ? 'hurt burn' : 'hurt', HX); const a = tu(e.from); if (a) cls(a, 'lunge', 240); snd.sfx('hurt'); if (e.d * 100 >= f.S.maxHp * 12 || e.crit) shake(); break; }
    case 'heal': pop('+' + e.n, 'heal', HX); snd.sfx('heal'); break;
    case 'miss': { const u = tu(e.to); if (u) pop('unik', 'txt', u.x); snd.sfx('miss'); break; }
    case 'dodge': pop('unik!', 'txt', HX); snd.sfx('miss'); break;
    case 'block': pop('blok', 'txt', HX); break;
    case 'shield': { const u = tu(e.to); if (u) pop('tarcza', 'txt', u.x); break; }
    case 'shieldhit': { const u = tu(e.to); if (u) pop(e.d, 'txt', u.x); snd.sfx('hit'); break; }
    case 'immune': { const u = tu(e.to); if (u) pop('nietykalny', 'txt', u.x); break; }
    case 'skill': {
      pop(e.mut ? D.SKILLS[e.id].muts[e.mut - 1].name : D.SKILLS[e.id].name, 'txt', HX, 74); snd.sfx('skill');
      const b = $('#sk' + e.slot); if (b) { b.classList.remove('used'); void b.offsetWidth; b.classList.add('used'); setTimeout(() => b.classList.remove('used'), 700); }
      F.lastSkill = { e, ev: f.ev }; skillFx(e); break;
    }
    case 'echo': { const L = F.lastSkill; if (F.fxDelay) { F.fxDelay.base += 480; F.fxDelay.n = 0; } if (L && !REDUCED.matches) setTimeout(() => { if (G.fight === F) skillFx(L.e, L.ev); }, 480); break; }
    case 'markhit': { const u = tu(e.uid); if (u && !REDUCED.matches) markHit(fxBase(), u); pop('Wypowiedzenie!', 'txt', u ? u.x : HX, 74); break; }
    case 'trap': { const u = tu(e.uid); if (u && !REDUCED.matches) trapSnap(fxBase(), u, F.trapEl); F.trapEl = null; pop('Pułapka!', 'txt', u ? u.x : HX, 74); snd.sfx('stun'); break; }
    case 'hshield': pop('Tarcza ' + e.n, 'txt', HX, 76); break;
    case 'hshit': { if (F.domeEl) F.domeEl.animate([{ filter: 'brightness(2.2)' }, { filter: 'none' }], { duration: 240 }); pop('tarcza −' + e.d, 'txt', HX, 70); break; }
    case 'coffee2': { if (!REDUCED.matches) castFx('kawa', fxBase({ mut: 0, ev: [], hits: [], arcs: [] })); pop('Druga kawa', 'txt', HX, 74); break; }
    case 'shred': { const u = tu(e.uid); if (u) pop('Pancerz −', 'txt', u.x, ub(u) + 10); break; }
    case 'meeting': { const u = tu(e.uid); if (u) pop('Spotkanie!', 'txt', u.x, ub(u) + 10); break; }
    case 'gust': break;
    case 'coin': pop('+' + e.n + ' Ziarno', 'txt gold', HX, 70); snd.sfx('coin'); break;
    case 'stun': snd.sfx('stun'); break;
    case 'freeze': { const u = tu(e.uid); if (u) pop('zamrożony!', 'txt frost', u.x, 74); snd.sfx('stun'); break; }
    case 'boom': { const u = tu(e.uid); if (u) pop('WYBUCH!', 'crit', u.x, 72); shake(); snd.sfx('egg'); break; }
    case 'rise': { const u = tu(e.uid); if (u) { u.el.classList.remove('dead'); pop('wstaje!', 'txt frost', u.x, 74); } snd.sfx('phase'); break; }
    case 'audit': { const u = tu(e.uid); if (u) pop('Audyt!', 'txt', u.x, 74); snd.sfx('stun'); break; }
    case 'resist': { const u = tu(e.to); if (u) pop('odporny', 'txt', u.x, 70); break; }
    case 'telegraph': snd.sfx('telegraph'); break;
    case 'egg': snd.sfx('egg'); break;
    case 'smoke': { pop('Chmura Dymu', 'txt', HX, 74); snd.sfx('heal'); const ar = F.arena; if (ar && !REDUCED.matches) { ar.classList.remove('smoked'); void ar.offsetWidth; ar.classList.add('smoked'); setTimeout(() => ar.classList.remove('smoked'), 1300); } break; }
    case 'okrzyk': banner('Ostatni Okrzyk!', 'Chwila nietykalności', false); break;
    case 'revive': banner('Gniazdo Zapasowe!', 'Kurczak wstaje z kolan', false); snd.sfx('heal'); break;
    case 'fury': banner('FURIA!', 'Wrogowie wpadają w szał', true); snd.sfx('fury'); F.arena.classList.add('furious'); if (!F.arena.querySelector('.beacons')) F.arena.insertAdjacentHTML('beforeend', '<div class="beacons" aria-hidden="true"><i></i><i></i></div>'); break;
    case 'herostun': { banner('Ogłuszony!', 'Nie atakujesz i nie używasz umiejętności', true); snd.sfx('stun'); cls(hero, 'hurtshake', 500); pop('OGŁUSZONY', 'crit', HX, 76); break; }
    case 'counter': { const C = D.COUNTERS[e.id]; if (C) { banner(C.icon + ' ' + C.name, C.text, true, 6500); snd.sfx('boss'); const u = tu(e.uid); if (u && u.el) { u.el.classList.add('hit'); setTimeout(() => u.el.classList.remove('hit'), 500); } } break; }
    case 'arrive': { const en = f.enemies.find(x => x.uid === e.uid); if (en) { makeUnit(en.uid, { e: en, name: en.name, art: enemyFig(en) }); layoutUnits(); if (!F.waveBanner || F.waveBanner !== f.tick) { F.waveBanner = f.tick; banner('Nadciąga kolejna fala!', '', true); snd.sfx('boss'); } } break; }
    case 'summon': { const en = f.enemies.find(x => x.uid === e.uid); if (en) { makeUnit(en.uid, { e: en, name: en.name, art: enemyFig(en) }); layoutUnits(); } break; }
    case 'phase': banner('Faza ' + e.n, '', true); snd.sfx('phase'); shake(); break;
    case 'skubanie': banner('Skubanie!', 'Wyłączony kafelek: ' + TILE[e.tile].name, true); snd.sfx('phase'); break;
    case 'skubanie-end': pop('kafelek wraca', 'txt', HX, 74); break;
    case 'blockslot': banner('Restrukturyzacja', 'Slot ' + (e.slot + 1) + ' zablokowany', true); snd.sfx('phase'); break;
    case 'steal': pop('-1 Ziarno', 'txt', HX, 70); break;
    case 'kill': {
      const u = tu(e.uid); if (!u) break;
      const hd = F.hitDelay.get(e.uid) || 0;   // wróg znika dopiero po trafieniu animacji umiejętności
      const go = () => { if (G.fight !== F) return; u.el.classList.remove('idle'); u.el.classList.add('dead'); feathers(u); setTimeout(() => { u.el.remove(); F.units.delete(e.uid); }, 900); layoutUnits(); };
      hd > 0 ? setTimeout(go, hd + 60) : go(); break;
    }
    case 'react': { const u = tu(e.uid), R = D.REACTIONS[e.r]; if (u && R) { pop(R.name + '!', 'react ' + e.r, u.x, 80); burst(u, e.r); } if (e.r === 'szok') shake(); if (!REDUCED.matches) F.stopUntil = performance.now() + 120; snd.sfx('crit'); break; }
    case 'chain': pop('Seria ×' + e.n, 'txt gold', HX, 84); break;
    case 'seria': banner('Pełna Kurza Seria!', 'Popłoch: wrogowie ogłuszeni', false); snd.sfx('unlock'); shake(); break;
    case 'flaw': pop(e.f === 'samozaplon' ? 'Samozapłon!' : 'Usterka!', 'txt warn', HX, 80); snd.sfx('hurt'); break;
    case 'comp': { const u = tu('comp'); if (u) cls(u, 'lunge', 240); break; }
    case 'night': { banner('Ciemność!', 'Część twoich ciosów chybia', true); snd.sfx('phase'); const ar = F.arena; if (ar) { ar.classList.add('night'); setTimeout(() => ar && ar.classList.remove('night'), e.dur * 100); } break; }
    case 'blizzard': { banner('Zamieć!', 'Twoje ataki są wolniejsze', true); snd.sfx('stun'); const ar = F.arena; if (ar) { ar.classList.add('blizz'); setTimeout(() => ar && ar.classList.remove('blizz'), e.dur * 100); } break; }
    case 'crash': { const u = tu(e.uid); if (u) pop('przegrzany!', 'txt', u.x, 74); break; }
    case 'victory': snd.sfx('win'); break;
    case 'defeat': snd.sfx('lose'); break;
    case 'timeout': snd.sfx('lose'); break;
  }
}

export function updateUI(first) {
  const F = G.fight; if (!F) return; const f = F.f, tick = f.tick;
  const hu = F.units.get('hero');
  hu.bar.style.width = Math.max(0, f.hp / f.S.maxHp * 100) + '%'; hu.txt.textContent = Math.max(0, f.hp) + ' / ' + f.S.maxHp;
  hu.el.classList.toggle('dead', f.over && !f.win);
  const hst = f.hburn > 0 ? 'burn' + f.hburn : ''; if (hst !== (hu.flags.stk || '')) { hu.flags.stk = hst; hu.sts.innerHTML = hst ? `<span class="st burn">${art.statusIcon('burn')}${f.hburn}</span>` : ''; }
  for (const e of f.enemies) {
    const u = F.units.get(e.uid); if (!u) continue;
    u.bar.style.width = Math.max(0, e.hp / e.maxHp * 100) + '%'; u.txt.textContent = e.dead ? '' : Math.max(0, e.hp) + ' / ' + e.maxHp + (e.shield > 0 ? ' +' + e.shield : '');
    const stunned = tick < e.stunUntil && !e.dead, fl = u.flags;
    if (stunned !== !!fl.stun) { fl.stun = stunned; u.fx.querySelectorAll('.stars').forEach(n => n.remove()); if (stunned) u.fx.insertAdjacentHTML('beforeend', '<div class="stars"><i></i><i></i><i></i></div>'); }
    const tele = !!e.windup && !e.dead; if (tele !== !!fl.tele) { fl.tele = tele; u.fx.querySelectorAll('.tele').forEach(n => n.remove()); if (tele) u.fx.insertAdjacentHTML('beforeend', '<div class="tele"></div>'); }
    const sh = (e.shieldHits > 0 || e.shield > 0) && !e.dead; if (sh !== !!fl.sh) { fl.sh = sh; u.fx.querySelectorAll('.shieldfx').forEach(n => n.remove()); if (sh) u.fx.insertAdjacentHTML('beforeend', '<div class="shieldfx"></div>'); }
    // efekty statusowe: ikonki ze stosami, zamrożenie barwi wroga na niebiesko
    const stk = e.dead ? '' : ['burn', 'frost', 'poison', 'bleed'].filter(k => e[k] > 0).map(k => k + e[k]).join(' ');
    if (stk !== (fl.stk || '')) { fl.stk = stk; u.sts.innerHTML = stk ? stk.split(' ').map(x => { const k = x.replace(/[0-9]+/, ''), n = x.slice(k.length); return `<span class="st ${k}">${art.statusIcon(k)}${n}</span>`; }).join('') : ''; }
    // aura statusów na samym wrogu: płomyki (Oparzenie), szron (Mróz), bąbelki (Salmonella), krople (Krwawienie)
    const au = e.dead ? '' : ['burn', 'frost', 'poison', 'bleed'].filter(k => e[k] > 0).join(' ');
    if (au !== (fl.au || '')) { fl.au = au; if (!u.aura) { u.fx.insertAdjacentHTML('beforeend', '<div class="aura"><i class="a-burn"></i><i class="a-burn b2"></i><i class="a-burn b3"></i><i class="a-frost"></i><i class="a-poison"></i><i class="a-poison p2"></i><i class="a-poison p3"></i><i class="a-bleed"></i><i class="a-bleed d2"></i></div>'); u.aura = u.fx.lastElementChild; } u.aura.className = 'aura ' + au.split(' ').filter(Boolean).map(k => 'au-' + k).join(' '); }
    const fr = tick < e.frozenUntil && !e.dead; if (fr !== !!fl.fr) { fl.fr = fr; u.spr.classList.toggle('frozen', fr); }
    const gd = !!e.immune && !e.dead; if (gd !== !!fl.gd) { fl.gd = gd; u.fx.querySelectorAll('.guardfx').forEach(n => n.remove()); if (gd) u.fx.insertAdjacentHTML('beforeend', '<div class="guardfx"></div>'); }
  }
  // wskaźnik Okna Gdakania: ile czasu zostało na kolejną umiejętność w serii
  const gi = $('#gdaki'); if (gi) { const left = f.chain > 0 ? D.RULES.chainWindow - (tick - f.chainT) : -1, on = left > 0 && !f.over;
    gi.style.width = on ? (left / D.RULES.chainWindow * 100) + '%' : '0%'; $('#gdak').classList.toggle('on', on); const gn = $('#gdakn'), tx = on ? '×' + f.chain : '–'; if (gn.textContent !== tx) gn.textContent = tx;
    $('#gseg').querySelectorAll('i').forEach((s, k) => s.classList.toggle('lit', on && k < f.chain)); }
  f.skills.forEach((s, i) => {
    const b = $('#sk' + i); if (!b) return;
    const def = D.SKILLS[s.id], total = Math.floor((s.lvl >= 2 ? Math.floor(def.cd * 80 / 100) : def.cd) * (100 - (f.S.cdPct || 0)) / 100), blocked = tick < s.blockedUntil;
    const remain = Math.max(s.cd - tick, blocked ? s.blockedUntil - tick : 0), ready = remain <= 0;
    b.classList.toggle('ready', ready && !f.over); b.classList.toggle('blocked', blocked);
    b.style.setProperty('--cd', ready ? 0 : Math.min(1, remain / total).toFixed(3));
    const st = b.querySelector('.sst'), txt = blocked ? 'ZABLOKOWANA' : ready ? 'GOTOWE' + (s.lvl >= 3 ? ' · ★★' : s.lvl >= 2 ? ' · ★' : '') : 'ODNAWIA · ' + (remain / 10).toFixed(1).replace('.', ',') + ' s';
    if (st.dataset.t !== txt) { st.dataset.t = txt; st.innerHTML = blocked ? '<b>' + txt + '</b>' : ready ? '<b>GOTOWE</b>' + txt.slice(6) : 'ODNAWIA · <b>' + (remain / 10).toFixed(1).replace('.', ',') + ' s</b>'; }
  });
  const secs = Math.floor(tick / 10);
  $('#tt').textContent = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
  $('#tbi').style.width = Math.min(100, tick / MAX_TICKS * 100) + '%';
  $('#timer').classList.toggle('fury', tick >= (f.furyFrom || FURY_FROM));
}

export function frame(ts) {
  const F = G.fight; if (!F) return;
  if (!F.last) F.last = ts;
  let dt = ts - F.last; F.last = ts; if (dt > 250) dt = 250;
  // zamrożenie klatki po Reakcji: stoi tylko obraz (zegar walki nie liczy), więc powtórka na serwerze się zgadza
  if (!F.paused && !F.f.over && !(F.stopUntil > ts)) {
    F.acc += dt;
    while (F.acc >= 100 && !F.f.over && !(F.stopUntil > ts)) { F.acc -= 100; stepOnce(); }
  }
  if (F.f.over && !F.finishing) { F.finishing = true; finishFight(); }
  F.raf = requestAnimationFrame(frame);
}
export function stepOnce() {
  const F = G.fight, ins = F.queue.splice(0);
  for (const s of ins) F.inputs.push([F.f.tick, s]);
  F.f.step(ins);
  for (const e of F.f.ev) onEvent(e);
  updateUI();
}
export function useSkill(slot) {
  const F = G.fight; if (!F || F.f.over || F.paused || F.finishing || !F.f.skills[slot]) return;
  if (F.queue.length < 6) F.queue.push(slot);
}
export function stopFight() { const F = G.fight; if (F) { cancelAnimationFrame(F.raf); } const l = $('#fightlayer'); if (l) l.remove(); }

export async function finishFight() {
  const F = G.fight, local = F.f.result();
  await sleep(local.win ? 1200 : 1500);
  if (G.fight !== F) return;
  let j = null;
  for (;;) {
    j = await act('fightfinish', { inputs: F.inputs });
    if (j) break;
    if (G.fight !== F) return;
    await retryOverlay();
  }
  stopFight(); G.fight = null; closeOverlay();
  const res = j.result;
  if (!G.duelRun && res && F.pre) fm().addFloor(G.run.id, floorEntry(F.setup, F.pre, res));   // dziennik runu: wpis tej walki
  if (res.win !== local.win) toast('Serwer rozliczył walkę inaczej niż Twoja przeglądarka. Obowiązuje wynik serwera.', true, 5000);
  if (G.run.phase === 'over') { G.screen = 'run'; return showEnd(j); }
  G.screen = 'run'; if (F.setup.extra) { render(); fightToasts(j); return; }
  INV.pending = invoiceOn() ? F.setup.round : 0; render(); showInvoice(j, F.setup.round); fightToasts(j);
}
// Komunikaty po walce: Arena, ewolucja towarzysza, Prezes pokonany.
export function fightToasts(j) {
  if (j.extra && j.extra.won) { snd.sfx('unlock'); toast(`${D.BOSSES[j.extra.id].name} pokonany! +${D.RULES.extraCoins} Ziaren i łup.`, false, 4200); }
  if (j.extraOffer) toast('Dodatkowa runda: ' + D.BOSSES[j.extraOffer].name + '. Możesz walczyć albo odpuścić.', false, 4200);
  if (j.arena) toast(j.arena.won ? 'Duch pokonany: ' + j.arena.nick + '! Bonus czeka.' : 'Duch ' + j.arena.nick + ' okazał się silniejszy.', !j.arena.won, 4200);
  if (j.compUp && G.run.companion) toast('Towarzysz ewoluuje: ' + compForm(G.run.companion) + '!', false, 4200);
  if (j.victory) { snd.sfx('unlock'); toast('Prezes pokonany! Wygrana zaliczona: kończysz albo grasz dalej w Dogrywce.', false, 6000); }
}
export function retryOverlay() {
  return new Promise(res => { G.retryCb = res; openOverlay('<h2>Brak połączenia</h2><p class="lead">Nie udało się rozliczyć walki z serwerem. Twój run jest bezpieczny, spróbuj ponownie.</p><div class="actions"><button class="btn primary" data-act="retry-fight" data-primary>Spróbuj jeszcze raz</button></div>', { narrow: true, force: true }); });
}

