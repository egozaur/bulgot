// Bulgot: interfejs gry. Cała logika (oferty, rerolle, walki, wyniki) liczy serwer; tu rysujemy ekrany i prowadzimy walkę na żywo
// tym samym silnikiem (shared/sim.js), a lista wejść gracza leci na serwer, który powtarza walkę i wydaje wynik.
import { call, ranks as apiRanks, dailyRanks as apiDaily, LOCAL, getPlayer, playerNow, avatarUrl } from './api.js';
import * as D from './shared/data.js';
import { Fight, MAX_TICKS, FURY_FROM } from './shared/sim.js';
import * as art from './art.js';
import * as T from './text.js';
import * as snd from './audio.js';
import { initTip } from './tip.js';
import { setCounts, activeLinks } from './shared/stats.js';
import { failFacts, pickFacts, winFacts } from './fakty.js';
import { fightScene, sceneClouds } from './scenes.js';
import { castFx, markHit, trapSnap, SK_COLOR } from './fx.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TILE = D.TILE_BY_ID;
const fmtAspd = v => (v / 100).toFixed(2).replace('.', ',');
const fmtNum = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const SPIN = { active: null };   // trwająca animacja automatu (tryb kasynowy)
const G = {
  profile: null, run: null, screen: 'loading', fight: null, busy: false, unlocks: [], lastEnd: null,
  setup: { mode: store.get('bulgot:mode') === 'quick' ? 'quick' : 'full', char: 'pyrtek', garnek: 0 },
};
window.__bulgot = G; G.render = () => render();      // podgląd stanu i odświeżanie w testach

// Skalowanie: na dużych monitorach cały interfejs rośnie (zoom), a --vh to wysokość okna w jednostkach po przeskalowaniu.
// Na komputerze (układ 3-kolumnowy, od 1121 px) skala dopasowuje całość do okna także w dół (min. 0,62), bo ekran gry ma ok. 980 jednostek wysokości.
// Na wąskich ekranach (układ jednokolumnowy, przewijany) skala nie schodzi poniżej 1.
const DESIGN_H = 980;
function applyScale() {
  const w = innerWidth, h = innerHeight, root = document.documentElement;
  const sc = w >= 1121 ? Math.max(0.62, Math.min(w / 1440, h / DESIGN_H, 2.2)) : Math.max(1, Math.min(w / 1440, h / 860, 2.2));
  root.style.setProperty('--s', sc.toFixed(3)); root.style.setProperty('--vh', (h / sc).toFixed(1) + 'px');
}
applyScale(); addEventListener('resize', applyScale);
initTip({ run: () => G.run });

// ---------- drobne narzędzia UI ----------
function toast(msg, err = false, ms = 2800) {
  const d = document.createElement('div'); d.className = 'toast' + (err ? ' err' : ''); d.textContent = msg;
  $('#toasts').prepend(d); setTimeout(() => d.remove(), ms);
}
function openOverlay(html, { narrow = false, force = false, cls = '' } = {}) {
  const o = $('#overlay'); o.hidden = false; o.dataset.force = force ? '1' : ''; o.classList.toggle('full', cls.includes('endfull'));   // ekran końca zajmuje cały ekran
  const F = G.fight; if (F && !F.paused && !F.finishing) { F.paused = true; F.autoPaused = true; }   // okno zatrzymuje walkę
  o.innerHTML = `<div class="modal ${narrow ? 'narrow' : ''} ${cls}" role="dialog" aria-modal="true">${force ? '' : '<button class="btn small ghost modal-x" data-act="close" aria-label="Zamknij">Zamknij ✕</button>'}${html}</div>`;
}
function closeOverlay() {
  const o = $('#overlay'); o.hidden = true; o.innerHTML = ''; o.dataset.force = ''; o.classList.remove('full');
  const F = G.fight; if (F && F.autoPaused) { F.autoPaused = false; F.paused = false; }
}
const overlayOpen = () => !$('#overlay').hidden;

// Wywołanie serwera z obsługą błędów i aktualizacją stanu (profil, run). Zwraca odpowiedź albo null.
async function act(path, body) {
  if (G.busy) return null;
  G.busy = true; document.body.classList.add('busy');
  try {
    const { j } = await call(path, body || {});
    if (j && j.profile) { G.profile = j.profile; art.setOutfit(j.profile.wardrobe && j.profile.wardrobe.eq); }
    if (j && j.daily) G.daily = j.daily;
    if (j && 'run' in j) G.run = j.run;
    if (j && j.myGhost !== undefined) G.myGhost = j.myGhost;
    if (!j || j.err) { toast((j && j.err) || 'Coś poszło nie tak. Spróbuj jeszcze raz.', true, 3600); if (j && 'run' in j && G.screen !== 'fight') render(); return null; }
    if (j.voided) toast('Gra dostała aktualizację zasad, więc poprzedni run został unieważniony. Zacznij nowy!', false, 6000);
    if (j.hatched && j.hatched.length) setTimeout(() => showHatched(j.hatched), 80);
    if (j.dino) setTimeout(showDino, 80);
    if (j.ach && j.ach.length) { for (const a of j.ach) { (G.ach = G.ach || []).push(a); toast('Osiągnięcie: ' + a.name, false, 4600); } snd.sfx('unlock'); }
    if (j.unlocks && j.unlocks.length) { for (const u of j.unlocks) { G.unlocks.push(u); toast('Odblokowano: ' + unlockName(u), false, 4200); } snd.sfx('unlock'); }
    return j;
  } finally { G.busy = false; document.body.classList.remove('busy'); }
}
// Wylęgarnia: okno z wyklutym przedmiotem.
function showHatched(ids) {
  const rows = ids.map(id => { const r = D.RECIPES.find(x => x.out === id); return `<div class="hatch-row">${r.of.map(c => tileCard(c, { static: true, mini: true })).join('<div class="hplus">+</div>')}<div class="hplus">=</div>${tileCard(id, { static: true, mini: true })}</div>`; }).join('');
  snd.sfx('unlock');
  openOverlay(`<h2>Wylęgarnia!</h2><p class="lead">Dwa przedmioty zlepiły się w gnieździe i wykluło się coś legendarnego. Nowy przedmiot ma efekty obu i liczy się do ich zestawów.</p>${rows}<div class="actions" style="margin-top:14px"><button class="btn primary" data-act="close" data-primary>Wspaniale</button></div>`, { narrow: false });
}
function showDino() {
  snd.sfx('unlock');
  openOverlay(`<h2>Wykluło się!</h2><p class="lead">Jajko Dinozaura pękło po pięciu piętrach. Ptaki to przecież dinozaury, a ten jest wyjątkowo zły.</p><div class="hatch-row">${tileCard('jajko-dinozaura', { static: true, mini: true })}<div class="hplus">=</div>${tileCard('dinozaur', { static: true, mini: true })}</div><div class="actions" style="margin-top:14px"><button class="btn primary" data-act="close" data-primary>Świetnie</button></div>`);
}
// Przepis, który dany kafelek by dokończył (masz już drugi składnik).
function recipeFor(id) {
  const r = G.run; if (!r) return null;
  return D.RECIPES.find(x => x.of.includes(id) && !r.tiles.includes(x.out) && x.of.every(c => c === id || r.tiles.includes(c))) || null;
}
const unlockName = u => u.kind === 'char' ? D.CHARS[u.target].name : TILE[u.target].name;
// Ukryte postacie (Zjarany Kurczak) nie zdradzają nazwy, stanowiska ani warunku, dopóki gracz ich nie odblokuje.
const charView = (c, open) => c.secret && !open ? { hidden: true, name: '???', style: '???', text: T.SECRET_CHAR_TEXT } : { hidden: false, name: c.name, style: c.style, text: c.text };

// ---------- start ----------
async function init() {
  render();
  if (!LOCAL && window.PL3Y && window.PL3Y.isLocked && window.PL3Y.isLocked()) await new Promise(res => document.addEventListener('pl3y:unlock', res, { once: true }));
  const pl = await getPlayer();
  if (!pl) { G.screen = 'noplayer'; return render(); }
  const j = await act('state');
  if (!j) { G.screen = 'noplayer'; return render(); }
  G.screen = 'home'; render();
}

function render() {
  if (SPIN.active) SPIN.active.abort();
  const root = $('#screen');
  switch (G.screen) {
    case 'loading': root.innerHTML = '<div class="loading"><span>Bulgocze</span> <i></i><i></i><i></i></div>'; break;
    case 'noplayer': root.innerHTML = `<div class="loading" style="flex-direction:column;gap:14px;text-align:center"><span>Do gry w Bulgot potrzebny jest nick.</span><button class="btn primary" data-act="retry">Wybierz nick</button><a class="btn ghost" href="/">← PL3Y</a></div>`; break;
    case 'home': root.innerHTML = renderHome(); setTimeout(maybeLevelUp, 120); setTimeout(maybeCasinoAsk, 500); break;
    case 'setup': root.innerHTML = renderSetup(); break;
    case 'run': root.innerHTML = renderRun(); rollCounters(); armLetter(); fitTower(); fitBoard(); setTimeout(maybeCasinoAsk, 300); break;
    case 'fight': return;   // arena buduje się w startFight()
  }
}

// ---------- ekran startowy ----------
function bubblesHTML() {
  return Array.from({ length: 16 }, (_, i) => { const s = 8 + (i * 7) % 26; return `<i style="left:${(i * 61) % 100}%;width:${s}px;height:${s}px;animation-duration:${7 + (i * 3) % 9}s;animation-delay:-${(i * 2.3) % 9}s;--dx:${(i % 2 ? 1 : -1) * (10 + i * 3)}px"></i>`; }).join('');
}
function avatarHTML(pl) {
  if (!pl) return '';
  return pl.avatar && !LOCAL ? `<img src="${esc(avatarUrl(pl.avatar))}" alt="" onerror="this.remove()">` : `<span class="av">${esc((pl.nick || '?')[0].toUpperCase())}</span>`;
}
function dailyBtn() {
  const d = G.daily; if (!d) return '';
  return `<button class="btn big daily ${d.used ? 'done' : ''}" data-act="daily"><span>Dyżur dnia</span><small>${d.used ? (d.active ? 'w toku' : 'wynik ' + fmtNum(d.score)) : 'nowy, jedno podejście'}</small></button>`;
}
function renderHome() {
  const pl = playerNow(), run = G.run && G.run.phase !== 'over' ? G.run : null, best = G.profile.best || {};
  const bestLine = ['quick', 'full'].filter(m => best[m]).map(m => `${D.MODES[m].name}: <b>${fmtNum(best[m].score)}</b>`).join(' · ');
  return `<a class="lobby-link" href="/">← PL3Y</a>
  <div class="home"><div class="home-bg"></div><div class="bubbles">${bubblesHTML()}</div>
  <div class="home-in">
    <div class="home-top"><div class="me-badge" ${LOCAL ? '' : 'data-act="changeplayer" style="cursor:pointer"'}>${avatarHTML(pl)} Gracz <b>${esc(pl ? pl.nick : '')}</b>${LOCAL ? ' (tryb lokalny)' : ''}</div>${stazPill()}${metaChips()}</div>
    ${art.towerArt(G.profile.garnek || 0)}
    <h1 class="logo" aria-label="Bulgot"><img src="logo.png?v=1" alt="Bulgot"></h1>
    <div class="tagline">${esc(T.TAGLINE)}</div>
    <div class="home-actions">
      ${run ? `<div class="resume">Trwa run: <b>${esc(D.MODES[run.mode].name)}</b>, piętro ${run.round}/${run.rounds}, ${run.coins} ${art.coinIcon()} Ziaren</div>
        <button class="btn primary big" data-act="resume" data-primary>Kontynuuj</button><button class="btn small ghost" data-act="abandon">Porzuć run</button>`
      : `<div class="home-main"><button class="btn primary big" data-act="new" data-primary>Graj</button>${dailyBtn()}</div>`}
      <div class="home-row"><button class="btn" data-act="ranking">Ranking</button><button class="btn" data-act="kurnik" title="Trwałe ulepszenia za Pióra">${art.emo('pisklecarnia')} Kurnik <small>${G.profile.feathers | 0}</small></button><button class="btn" data-act="shop">Sklepik <small>🎟️ ${stazOf().talons}</small></button><button class="btn" data-act="profile">Profil</button><button class="btn" data-act="book">Księga Kurnika</button></div>
      <div class="home-row small"><button class="btn small" data-act="help">Jak grać</button><button class="btn small" data-act="settings">Dźwięk</button><button class="btn small ghost" data-act="history">Historia (test)</button></div>
      ${bestLine ? `<div class="best">Najlepsze wyniki. ${bestLine}</div>` : ''}
    </div></div></div>`;
}
// ---------- przygotowanie runu ----------
function metaChips() {
  const p = G.profile, out = [];
  if (p.nemesis) { const n = p.nemesis, t = n.tile && TILE[n.tile]; out.push(`<span class="meta-chip nem" tabindex="-1" data-tip="${esc('Twój Nemezis: ' + n.name + (n.lvl > 1 ? ' (awans ' + n.lvl + '.)' : '') + '\n' + (t ? 'Ukradł ci ' + t.name + '. ' : '') + 'Czeka na ciebie w następnym runie.')}">${art.skullIcon()}</span>`); }
  if (p.will && TILE[p.will.tile]) { const ch = D.CHARS[p.will.char], multi = p.chars.length > 1; out.push(`<span class="meta-chip will" tabindex="-1" data-tip="${esc('Testament: ' + TILE[p.will.tile].name + '\nCzeka w pierwszej ofercie' + (multi ? ' następnego runu postacią inną niż ' + (ch ? ch.name : '') : ' następnego runu') + '.')}">${art.tileIcon(p.will.tile)}</span>`); }
  return out.length ? `<div class="meta-chips">${out.join('')}</div>` : '';
}
const BURNERS = ['Ognisko', 'Gazówka', 'Kuchenka', 'Piec', 'Kuźnia', 'Wulkan'];
const charIds = () => Object.keys(D.CHARS);
// Klątwy Prezesa: dobrowolne utrudnienia za premię do wyniku (do D.CURSE_MAX naraz).
// Na razie UKRYTE na ekranie startowym (decyzja właściciela, 2026-11-23). Cały mechanizm zostaje; żeby przywrócić, ustaw true.
const SHOW_CURSES = false;
function cursesHTML() {
  const s = G.setup, sel = s.curses || (s.curses = []);
  const chips = Object.entries(D.CURSES).map(([id, c]) => `<button class="curse-chip ${sel.includes(id) ? 'on' : ''}" data-act="curse" data-v="${id}" aria-pressed="${sel.includes(id)}" data-tip="${esc(c.name + '\n' + c.text + '\nPremia do wyniku: +' + c.pct + '%')}">${art.emo(c.icon)}<b>${esc(c.name)}</b><small>+${c.pct}%</small></button>`).join('');
  return `<div class="curses"><div class="sec">Klątwy Prezesa <small>dobrowolne, do ${D.CURSE_MAX}${sel.length ? ': wynik +' + D.cursePct(sel) + '%' : ': trudniej, ale wynik rośnie'}</small></div><div class="curse-row">${chips}</div></div>`;
}
// Ekran startowy w jednym kroku (makieta 11 „Arena i lista mocy”): postać (jajka), bohater ze statystykami i zdolnościami, lista mocy palnika, pasek podsumowania.
const lockText = c => c.secret ? '???' : ((D.UNLOCK_BY_ID[c.lock] || {}).text || '');
const burnMult = (g, s) => ((1 + g * .25) * (1 + D.cursePct(s.curses) / 100)).toFixed(2).replace('.', ',');
const BURN_HEAT = ['#7bd37b', '#e8d34a', '#ffb347', '#ff8c2b', '#e4572e', '#d6262d'];
const shortName = v => v.hidden ? '???' : v.name.replace(/^(Kurczak|Kura|Kogut|Indyczka) /, '').replace(/ .*/, '');
function setupOk() { const s = G.setup, p = G.profile; return p.chars.includes(charIds()[s.cur]) && s.garnek <= p.garnek; }
function renderSetup() {
  const p = G.profile, s = G.setup, ids = charIds();
  if (s.cur === undefined || s.cur < 0 || s.cur >= ids.length) s.cur = Math.max(0, ids.indexOf(s.char));
  if (s.garnek > D.GARNEK.length - 1) s.garnek = D.GARNEK.length - 1;
  const id = ids[s.cur], c = D.CHARS[id], open = p.chars.includes(id), v = charView(c, open), cp = T.CHAR_PERKS[id] || { perks: [] };
  const m = D.MODES[s.mode], g = D.GARNEK[s.garnek], heat = BURN_HEAT[s.garnek], gLocked = s.garnek > p.garnek;
  const fx = k => (c.fx.find(f => f.k === k) || { v: 0 }).v;
  const stat = (l, val) => `<div class="sbar"><span>${l}</span><div class="tr"><i class="${val < 100 ? 'd' : ''}" style="width:${Math.min(100, val / 170 * 100)}%"></i></div><b>${val}%</b></div>`;
  const roster = ids.map((cid, i) => { const cc = D.CHARS[cid], o = p.chars.includes(cid), vv = charView(cc, o);
    return `<button class="tl ${i === s.cur ? 'on' : ''} ${o ? '' : 'lk'}" data-act="carpick" data-v="${i}" data-char="${cid}" aria-label="${esc(vv.name)}"><div class="egg-art">${art.eggArt(cid, o)}</div><span>${esc(shortName(vv))}</span></button>`; }).join('');
  const modes = Object.entries(T.MODE_INFO).map(([mid, mi]) => { const dm = D.MODES[mid], bf = Object.keys(dm.bosses).map(Number);
    return `<button class="smode ${s.mode === mid ? 'on' : ''}" data-act="setmode" data-v="${mid}"><h3>${mi.name}</h3><div class="fl">${Array.from({ length: dm.rounds }, (_, i) => `<i class="${bf.includes(i + 1) ? 'b' : ''}"></i>`).join('')}</div><p>${dm.rounds} pięter${bf.length ? ' · ' + bf.length + ' bossów' : ''}</p></button>`; }).join('');
  const burners = D.GARNEK.map((gg, i) => i).reverse().map(i => { const open2 = i <= p.garnek, gg = D.GARNEK[i];
    return `<button class="br ${i === s.garnek ? 'on' : ''} ${open2 ? '' : 'lk'}" style="--c:${BURN_HEAT[i]}" data-act="setgarnek" data-v="${i}"><span class="bart">${art.burnerArt(i)}</span><div><b>${BURNERS[i]}${open2 ? '' : ' 🔒'}</b><span>${esc(gg.name)}</span><div class="meter">${Array.from({ length: 6 }, (_, k) => `<i style="${k <= i ? 'background:' + BURN_HEAT[i] : ''}"></i>`).join('')}</div></div><em>×${(1 + i * .25).toFixed(2).replace('.', ',')}</em></button>`; }).join('');
  const perks = open ? cp.perks.map(([ic, sg, tx]) => `<div class="pk ${sg === '+' ? 'plus' : 'minus'}"><b>${sg === '+' ? '+' : '−'}</b>${/^[a-zA-Z]+$/.test(ic) ? art.statIcon(ic) : `<span class="pe">${ic}</span>`}<span>${esc(tx)}</span></div>`).join('') : `<div class="pk lockrow"><span>🔒 ${esc(v.hidden ? 'Zagadka. Odkryj hasło lub osiągnięcie.' : 'Jak odblokować: ' + lockText(c))}</span></div>`;
  const note = !open ? '🔒 Ta postać jest zablokowana' : gLocked ? `🔒 Palnik zablokowany: wygraj run na poziomie ${s.garnek - 1}` : '';
  return `<div class="setup3">
    <div class="s3-head"><h2>Nowy run</h2><div class="s3-hr">${metaChips()}<button class="btn small ghost" data-act="home">← Menu</button></div></div>
    <div class="s3-body">
      <section class="s3-left"><div class="cap">1 · Postać <small>← →</small></div><div class="roster">${roster}</div>
        <div class="smodes">${modes}</div></section>
      <section class="s3-mid"><div class="hero"><div class="halo"></div>
          <button class="arr l" data-act="cprev" aria-label="Poprzednia postać">‹</button><button class="arr r" data-act="cnext" aria-label="Następna postać">›</button>
          <div class="pic ${open ? '' : 'lk'}">${art.eggArt(id, open)}</div>
          <h2 style="--hn:${v.name.length > 14 ? Math.round(52 * 14.5 / v.name.length) : 52}px">${esc(v.name)}</h2><div class="sub">${esc(v.style)}</div>
          ${(cc => cc && cc.hasCode && !open ? '<button class="btn small ghost codebtn" data-act="codeopen">🔑 Masz hasło?</button>' : '')(c)}</div>
        <div class="panel"><h4>Statystyki bazowe</h4>${open ? stat('Życie', 100 + fx('hpPct')) + stat('Atak', 100 + fx('atkPct')) + stat('Szybkość ataku', 100 + fx('aspdPct')) : '<div class="pk lockrow"><span>???</span></div>'}</div></section>
      <section class="s3-right"><div class="cap">2 · Moc palnika <small>↑ ↓</small></div><div class="blist">${burners}</div>
        <div class="panel pks"><h4>Zdolności</h4>${perks}</div></section>
    </div>
    ${SHOW_CURSES ? cursesHTML() : ''}
    <div class="s3-bar"><div class="sum"><span><i>Tryb</i> <b>${esc(m.name)}</b></span><span><i>Postać</i> <b>${esc(v.name)}</b></span><span><i>Moc palnika</i> <b style="color:${heat}">${BURNERS[s.garnek]}</b></span><span class="gm">wynik ×${burnMult(s.garnek, s)}</span>${note ? `<span class="warn">${note}</span>` : ''}</div>
      <button class="btn primary big" data-act="start" data-primary ${setupOk() ? '' : 'disabled'}>Do garnka! →</button></div>
    <div class="keyhint">← → postać · ↑ ↓ moc palnika · Q tryb · Enter start · Esc menu</div></div>`;
}

function carGo(i) { const n = charIds().length, s = G.setup; s.cur = Math.max(0, Math.min(n - 1, i)); const id = charIds()[s.cur]; if (G.profile.chars.includes(id)) s.char = id; render(); }
function garGo(v) { const s = G.setup; s.garnek = Math.max(0, Math.min(D.GARNEK.length - 1, v)); render(); }
// ---------- karty kafelków ----------
function setOwned(set) { return G.run ? G.run.tiles.filter(id => TILE[id] && setsOf(TILE[id]).includes(set)).length : 0; }
// Plakietka poziomu statystyki: 1 szary, 2 papier pakowy, 3 złoty, 4 legendarna z poświatą (wyglądu karty nie zmienia).
const lvlTag = t => t && t.lvl ? `<span class="lvl l${t.lvl}" title="Poziom ${t.lvl === 4 ? 'legendarny' : t.lvl}">${['I', 'II', 'III', '★'][t.lvl - 1]}</span>` : '';
function tileCard(id, o = {}) {
  const t = TILE[id], i = o.i == null ? 0 : o.i, run = G.run;
  const own = run && !o.static && t.type === 'skill' ? run.skills.find(s => s.id === t.skill) : null;
  const tags = [`<span class="tag">${D.TYPES[t.type]}</span>`, `<span class="tag rar">${D.RARITY[t.rarity]}</span>`];
  for (const st of setsOf(t)) tags.push(`<span class="tag set">${D.SETS[st].name}${run && !o.static ? ' ' + (setOwned(st) + 1) : ''}</span>`);
  for (const tg of (t.tags || [])) if (D.ELEMENTS[tg]) tags.push(`<span class="tag el" style="--ec:${D.ELEMENTS[tg].color}">${D.ELEMENTS[tg].name}</span>`);
  if (run && !o.static) {
    const rc = recipeFor(id), known = rc && G.profile && (G.profile.recipes || []).includes(rc.out);
    if (rc) tags.push(`<span class="tag hatch">${known ? 'Wykluje: ' + esc(TILE[rc.out].name) : 'Wylęgarnia!'}</span>`);
    else if (D.RECIPES.some(x => x.of.includes(id))) tags.push('<span class="tag">Składnik</span>');
    const ms = D.MILESTONES[id];
    if (ms) { const n = run.tiles.filter(x => x === id).length % D.MILESTONE_EVERY; tags.push(`<span class="tag ${n === D.MILESTONE_EVERY - 1 ? 'hatch' : ''}">${n === D.MILESTONE_EVERY - 1 ? esc(ms.name) + '!' : 'Próg ' + (n + 1) + '/' + D.MILESTONE_EVERY}</span>`); }
  }
  if (t.boss) tags.push('<span class="tag hatch">Łup z bossa</span>');
  else if (t.next && run && !o.static) { const c = run.tiles.filter(x => x === id).length; tags.push(`<span class="tag ${c >= D.RULES.upgradeCost - 1 ? 'hatch' : ''}">Zlew ${Math.min(c + 1, D.RULES.upgradeCost)}/${D.RULES.upgradeCost}</span>`); }
  if (own && own.lvl >= 2) tags.push('<span class="tag up mut">Mutacja</span>');
  else if (own) tags.push('<span class="tag up">Poziom 2</span>');
  else if (t.type === 'skill' && run && run.skills.length >= (G.run.maxSkills || D.RULES.maxSkills) && !o.static) tags.push('<span class="tag">Zastąp slot</span>');
  const tag = o.static ? 'div' : 'button';
  const dis = o.price != null && run && run.coins < o.price ? 'disabled' : '';
  return `<${tag} class="tile r${t.rarity} ${o.static ? 'static' : ''} ${o.locked ? 'locked' : ''} ${o.mini ? 'mini' : ''}" ${o.static ? '' : `data-act="${o.act || 'pick'}" data-i="${i}"`} ${dis} style="--i:${i}" ${o.tip ? `data-tip="${esc(o.tip)}"` : ''}>
    ${o.static || o.key === false ? '' : `<span class="key">${i + 1}</span>`}${lvlTag(t)}${art.tileIcon(id)}
    <div class="tname">${esc(t.name)}</div><div class="ttext">${esc(t.text)}</div>
    <div class="tmeta">${tags.join('')}</div>
    ${o.price != null ? `<div class="price ${dis ? 'no' : ''}">${o.price} ${art.coinIcon()}</div>` : ''}
    ${o.lockText ? `<div class="lockbox">Zablokowany: ${esc(o.lockText)}</div>` : ''}</${tag}>`;
}

// ---------- ekran runu ----------
const enemyDef = id => D.ENEMIES[id] || D.BOSSES[id];
const bossIntroOf = id => T.BOSS_INTRO[id] || (D.BOSSES[id] ? { title: D.BOSSES[id].name + ', ' + D.BOSSES[id].title, quote: D.BOSSES[id].quote || '' } : { title: String(id), quote: '' });
const enemyFig = e => e.ghost ? art.ghostArt(e.gchar, e.gwear) : art.enemyArt(e.art, e.tint);
const compForm = c => { const d = D.COMPANIONS[c.id]; return d.forms[Math.min(2, Math.max(0, (c.lvl | 0) - 1))]; };
function arenaPreview() {
  const g = G.run.arenaGhost, st = g.stats;
  return `<div class="preview doorview arenaview"><div class="lab">Arena Duchów! Nagroda: +${D.RULES.arenaCoins} Ziaren i wybór rzadkiego kafelka</div><div class="glass"><div class="pv boss">${art.ghostArt(g.char)}<span>Duch: ${esc(g.nick)}</span></div></div><div class="tplnote">Życie ${st.hp}, Atak ${st.atk}, szybkość ${(st.aspd / 100).toFixed(2).replace('.', ',')} / s, Pancerz ${st.armor}${g.mirror ? '. To twoje własne Odbicie.' : ''}</div></div>`;
}
function extraPreview(id) {
  const d = D.BOSSES[id], pv = id === 'pipsztal' ? `<div class="pv">${art.enemyArt('pipdog')}<span>${esc(D.EXTRA_DOG.name)}</span></div>` : '';
  return `<div class="preview doorview arenaview"><div class="lab">Dodatkowa runda! Nagroda: +${D.RULES.extraCoins} Ziaren i wybór legendarnej statystyki</div><div class="glass">${pv}<div class="pv boss">${art.enemyArt(d.art)}<span>${esc(d.name)}</span></div></div><div class="tplnote">${esc(d.text)} Walczysz z życiem po poprzedniej walce (odpoczynek wyłączony).</div></div>`;
}
function previewHTML() {
  const r = G.run; if (r.arenaGhost) return arenaPreview();
  if (r.extraNow) return extraPreview(r.extraNow);
  let ids = r.enemies || [];
  const bdef = r.boss && D.BOSSES[r.boss];
  if (bdef && bdef.guards) ids = [...Array(bdef.guards).fill('kot-ochroniarz'), r.boss];
  const nem = r.nemesisRound && r.nemesis, risky = r.door && r.door.risky;
  const items = ids.map((id, i) => { const d = enemyDef(id); const boss = !!D.BOSSES[id], big = i === 0 && (nem || risky);
    const name = i === 0 && nem ? r.nemesis.name : id === 'kot-ochroniarz' && bdef && bdef.guards ? 'Ochroniarz' : (i === 0 && risky ? 'Elitarny ' : '') + d.name;
    return `<div class="pv ${boss ? 'boss' : ''} ${big ? 'boss nemesis' : ''}">${art.enemyArt(d.art, d.tint)}<span>${esc(name)}</span></div>`; }).join('');
  const affs = r.elite && r.affixes ? r.affixes : nem ? [r.nemesis.affix] : risky ? [r.door.affix] : null;
  const aff = affs ? `<div class="affixes">${affs.map(a => `<span class="tag aff" title="${esc(D.AFFIXES[a].text)}">${esc(D.AFFIXES[a].name)}: ${esc(D.AFFIXES[a].text)}</span>`).join('')}</div>` : '';
  const loot = nem && r.nemesis.tile && TILE[r.nemesis.tile] ? ` · odzyskasz: ${esc(TILE[r.nemesis.tile].name)}` : '';
  const lab = r.boss ? 'Boss tego piętra' : nem ? 'Twój Nemezis! Nagroda: Odznaka Sprawiedliwość Kurnika' + loot : r.elite ? 'Elitarny wróg na piętrze (nagroda: Odznaka)'
    : risky ? 'Drzwi dla personelu. Nagroda: ' + (r.door.reward === 'rare' ? 'wybór rzadkiego kafelka' : '+' + D.RULES.doorCoins + ' Ziaren') : 'Na tym piętrze czekają';
  const tp = r.tpl && D.FLOOR_TPL[r.tpl] ? `<div class="tplnote"><b>${esc(D.FLOOR_TPL[r.tpl].name)}.</b> ${esc(D.FLOOR_TPL[r.tpl].text)}</div>` : '';
  // Od Garnka 1 serwer nie zdradza składu piętra: zaparowana szyba z jedną sylwetką (bez nazw i liczby wrogów).
  if (r.hidden && !nem) {
    const fogLab = r.elite ? 'Elitarny wróg za zaparowaną szybą (nagroda: Odznaka)' : risky ? lab : 'Szyba zaparowana: nie wiesz, kto czeka';
    return `<div class="preview doorview fog"><div class="lab">${fogLab}</div><div class="glass"><div class="pv">${art.mysteryArt()}<span>?</span></div></div>${risky ? aff : ''}<div class="tplnote">Od Garnka 1 skład pięter jest tajemnicą. Bossów zapowiada pasek pięter.</div></div>`;
  }
  return `<div class="preview doorview ${nem ? 'nem' : ''} ${r.boss ? 'bossdoor' : ''}"><div class="lab">${lab}</div><div class="glass">${items}</div>${aff}${tp}</div>`;
}
// Okólnik Zarządu bieżącej strefy: pełna ramka na pierwszym piętrze strefy (i przy drzwiach), potem tylko nazwa w podtytule i pigułka na pasku.
const zoneAt = (mode, n) => { for (const z of D.MODES[mode].zones) if (n <= z.upTo) return z.zone; return 2; };
function decreeHTML(always = false) {
  const r = G.run, d = r.decree && D.DECREES[r.decree];
  if (!d || !(always || r.round === 1 || zoneAt(r.mode, r.round - 1) !== zoneAt(r.mode, r.round))) return '';
  if ((G.tucked || {})[r.id + ':' + r.decree]) return '';
  // pismo Zarządu z pieczątką: wjeżdża przy wejściu do strefy, po chwili (albo po „Zwiń”) chowa się do pigułki Okólnik na pasku
  return `<div class="decree letter" data-k="${r.id}:${r.decree}"><div class="lhead">Korporacja Rosołowa S.A. · Zarząd · Okólnik nr ${r.zone + 1}</div><div class="lbody">${art.decreeIcon()}<div><b>Nowy Okólnik Zarządu: ${esc(d.name)}.</b> ${esc(d.text)}</div></div><span class="stamp" aria-hidden="true">ZATWIERDZONO<small>ZARZĄD</small></span><button class="ltuck" data-act="tuck" title="Schowaj pismo (zostaje w pigułce Okólnik na pasku)">Zwiń</button></div>`;
}
const decreeSub = () => { const d = G.run.decree && D.DECREES[G.run.decree]; return d ? ` · <span class="dsub" title="${esc(d.text)}">Okólnik: ${esc(d.name)}</span>` : ''; };
// ---------- klatka schodowa (komputer): zygzakowate schody, kurczak wchodzi piętro wyżej, płomień rośnie od dołu ----------
// Kamera przesuwa się za kurczakiem, a górne piętra toną w mgle (nie wiadomo, co jest wyżej); ściana zmienia kolor ze strefą.
const WIDE = matchMedia('(min-width: 1121px)');
WIDE.addEventListener('change', () => { if (G.screen === 'run' && G.run) render(); });
addEventListener('resize', () => fitTower(false));
function stairsHTML() {
  const r = G.run, M = D.MODES[r.mode], n = M.rounds, g = art.stairsGeom(n), W = art.ST.W, f = Math.min(r.round, n), f0 = Math.min(G.cabFrom || 0, n);
  const over = r.phase === 'over', up = !over && f0 && f0 < f;
  let plates = '';
  for (let k = 1; k <= n; k++) {
    const nem = r.nemesis && !r.nemesis.beaten && r.nemesis.round === k, door = (r.doors || []).includes(k);
    const cls = ['fp', k < f || (over && k <= r.done) ? 'done' : '', k === f && !over ? 'now' : '', M.bosses[k] ? 'boss' : '', nem ? 'nem' : '', door ? 'door' : ''].join(' ');
    const tip = 'Piętro ' + k + (M.bosses[k] ? ': boss' : '') + (nem ? ': ' + r.nemesis.name : door ? ': Rozwidlenie Korytarza (Tylko dla personelu)' : '');
    plates += `<div class="${cls}" style="top:${g.y(k) - 21}px" data-tip="${esc(tip)}">${M.bosses[k] || nem ? art.skullIcon() : ''}${nem ? '<i class="alarm" aria-hidden="true"></i>' : ''}<span class="fn">${k}</span>${door && !nem ? '<span class="staff" aria-hidden="true">P</span>' : ''}</div>`;
  }
  const heat = k => n > 1 ? Math.max(0, Math.min(1, (k - 1) / (n - 1))) : 1;
  const face = k => (k % 2 ? 1 : -1);          // po nieparzystym piętrze (podest lewy) następny bieg idzie w prawo
  const dx = up ? g.x(f0) - g.x(f) : 0, dy = up ? g.y(f0) - g.y(f) : 0;
  G.cabFrom = f;
  return `<aside class="tower stairs" aria-label="Postęp: klatka schodowa"><div class="climb-vp" style="--heat:${heat(f).toFixed(3)};--heat0:${heat(up ? f0 : f).toFixed(3)}">
    <div class="climb" style="width:${W}px;height:${g.innerH}px" data-f="${f}" data-f0="${up ? f0 : 0}">${art.stairsArt(n, k => zoneAt(r.mode, k))}${plates}
      <div class="cab ${up ? 'up' : ''}" style="left:${g.x(f) - 22}px;top:${g.y(f) - 43}px;--dx:${dx}px;--dy:${dy}px;--f0:${up ? -face(f) : face(f)};--f1:${face(f)}"><span class="cfire">${art.emberArt()}</span><span class="hop"><span class="face">${art.portrait(r.char, r.form)}</span></span></div>
    </div><div class="fire">${art.flamesArt()}</div></div></aside>`;
}
// Ustawia kamerę (przesunięcie klatki tak, by kurczak był w ok. 62% wysokości okna) i uruchamia animację wejścia piętro wyżej.
function fitTower(animate = true) {
  const vp = $('.climb-vp'), cl = vp && $('.climb', vp); if (!cl || !G.run) return;
  const H = vp.clientHeight, ih = cl.offsetHeight, g = art.stairsGeom(D.MODES[G.run.mode].rounds);
  const cam = k => Math.max(0, Math.min(ih - H, g.y(k) - H * 0.62));
  const f = +cl.dataset.f, f0 = +cl.dataset.f0;
  cl.style.setProperty('--cam', cam(f).toFixed(1) + 'px'); cl.style.setProperty('--cam0', cam(f0 || f).toFixed(1) + 'px');
  if (animate && f0 && !REDUCED.matches && !vp.classList.contains('go')) { vp.classList.add('go'); setTimeout(() => vp.classList.remove('go'), 2000); }
}
function towerHTML() {
  const r = G.run, M = D.MODES[r.mode];
  let rows = '';
  for (let n = M.rounds; n >= 1; n--) {
    const nem = r.nemesis && !r.nemesis.beaten && r.nemesis.round === n, door = (r.doors || []).includes(n);
    const cls = ['floor', n < r.round || r.phase === 'over' && n <= r.done ? 'done' : '', n === r.round && r.phase !== 'over' ? 'now' : '', M.bosses[n] ? 'boss' : '', nem ? 'nem' : '', door ? 'door' : ''].join(' ');
    const tip = 'Piętro ' + n + (M.bosses[n] ? ': boss' : '') + (nem ? ': ' + r.nemesis.name : door ? ': Rozwidlenie Korytarza (Tylko dla personelu)' : '');
    const isNow = n === r.round && r.phase !== 'over', up = isNow && G.cabFrom && G.cabFrom < n;
    rows += `<div class="${cls}" title="${esc(tip)}">${isNow ? `<span class="cab${up ? ' up' : ''}" aria-hidden="true">${art.portrait(r.char, r.form)}</span>` : ''}${M.bosses[n] || nem ? art.skullIcon() : ''}${nem ? '<i class="alarm" aria-hidden="true"></i>!' : ''}${door && !nem ? '<span class="staff" aria-hidden="true">P</span>' : ''}<span class="fn">${n}</span></div>`;
  }
  G.cabFrom = r.phase === 'over' ? 0 : r.round;
  return `<aside class="tower shaft" aria-label="Postęp: szyb windy"><h4>Piętra</h4>${rows}<div class="pot"></div></aside>`;
}
function companionPanel() {
  const c = G.run.companion; if (!c) return '';
  const d = D.COMPANIONS[c.id];
  return `<div class="panel comp-panel" data-tip="${esc(compForm(c) + ' (poziom ' + c.lvl + ' z 3)\n' + companionBlurb(c.id, c.lvl) + '\nRośnie po każdym pokonanym bossie.')}" tabindex="0">${art.companionArt(c.id)}<div><div class="nm">${esc(compForm(c))}</div><div class="fm">Towarzysz · poziom ${c.lvl}/3</div><div class="hint" style="text-align:left">${esc(d.text)}</div></div></div>`;
}
function sideHTML() {
  const r = G.run, S = r.hero, ch = D.CHARS[r.char], form = D.FORMS.find(f => f.id === r.form) || D.FORMS[0];
  const slots = Array.from({ length: r.maxSkills || D.RULES.maxSkills }, (_, i) => {
    const s = r.skills[i];
    if (!s) return '<div class="slot empty">wolny slot umiejętności</div>';
    const def = D.SKILLS[s.id], tile = D.TILES.find(t => t.skill === s.id);
    const mu = s.lvl >= 3 && def.muts[(s.mut || 1) - 1];
    const mv = r.skills.length > 1 && r.phase !== 'over';   // kolejność wolno zmieniać przed walką (strzałki albo przeciągnięcie)
    return `<div class="slot ${mv ? 'mv' : ''}" data-tipk="tile:${tile.id}" tabindex="0" ${mv ? `draggable="true" data-slot="${i}"` : ''}>${art.tileIcon(tile.id)}<div><div class="sn">${i + 1}. ${esc(def.name)}${mu ? `<span class="lv mut">${esc(mu.name)}</span>` : s.lvl >= 2 ? '<span class="lv">POZ. 2</span>' : ''}</div><div class="sd">${esc(def.text)}${s.lvl >= 2 ? ' (+30% mocy, -20% cooldownu)' : ''}${mu ? ' Mutacja: ' + esc(mu.text) : ''}</div></div>${mv ? `<div class="swp"><button class="swb" data-act="skillmove" data-v="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Przesuń wyżej" title="Przesuń wyżej (zmienia klawisz)">▲</button><button class="swb" data-act="skillmove" data-v="${i}" data-d="1" ${i === r.skills.length - 1 ? 'disabled' : ''} aria-label="Przesuń niżej" title="Przesuń niżej (zmienia klawisz)">▼</button></div>` : ''}</div>`;
  }).join('');
  const srow = (k, label, val) => `<dt data-tipk="stat:${k}" tabindex="0">${art.statIcon(k)}<span>${label}</span></dt><dd data-tipk="stat:${k}">${val}</dd>`;
  const rows = T.STAT_LABELS.map(([k, label, f]) => srow(k, label, f ? f(S[k]) : S[k])).join('')
    + (S.dmg ? srow('dmg', 'Obrażenia', `+${S.dmg}%`) : '') + (S.critMult !== 150 ? srow('critMult', 'Moc Fortuny', `×${(S.critMult / 100).toFixed(2).replace('.', ',')}`) : '');
  const counts = {}; for (const id of r.tiles) { const t = TILE[id]; if (t && t.type !== 'skill') counts[id] = (counts[id] || 0) + 1; }
  const chips = Object.entries(counts).map(([id, n]) => {
    const t = TILE[id], g = t.grow ? Math.min(t.grow.max, (r.grow || {})[id] || 0) : 0, fw = (r.flawed || []).find(w => w.id === id);
    const tip = fw ? 'Wada fabryczna (+50% efektów): ' + (fw.flaw ? D.FLAWS[fw.flaw].name + '. ' + D.FLAWS[fw.flaw].text : 'ujawni się po walce') : '';
    return `<div class="chip r${t.rarity} ${fw ? 'flawed' : ''} ${id === G.upFresh ? 'fresh' : ''}" tabindex="0" data-tipk="tile:${id}" data-tipx="${esc(tip)}">${lvlTag(t)}${art.tileIcon(id)}${n > 1 ? `<sup>×${n}</sup>` : t.grow && g ? `<sup class="gr">+${g}</sup>` : ''}</div>`;
  }).join('');
  const pawnLine = r.pawned ? `<div class="setline pawn">W lombardzie: ${esc(TILE[r.pawned.id].name)}${r.pawned.canRedeem ? ` (wykup za ${r.pawned.cost} Ziaren tylko na tym piętrze)` : ' (wykup na następnym piętrze)'}</div>` : '';
  const foxLine = r.foxDebt ? `<div class="setline pawn">Lisy Windykatory silniejsze o ${r.foxDebt * D.RULES.pawnFox}% (przepadłe zastawy)</div>` : '';
  const sc = setCounts(r.tiles, r.decree);
  const sets = Object.entries(D.SETS).map(([id, st]) => { const n = sc[id] || 0; if (!n) return ''; const total = setTotal(id); return `<div class="setline" data-tipk="set:${id}" tabindex="0">Zestaw ${st.name} ${n}/${total}${D.SET_STEPS.filter(s => n >= s).map(s => (s === 2 ? ': ' : '; ') + st['b' + s]).join('')}${n >= 5 && st.x ? '; Nadwyżka ' + (n - 4) + '×: ' + st.x : ''}</div>`; }).join('');
  const mss = Object.entries(D.MILESTONES).map(([id, m]) => { const n = Math.floor(r.tiles.filter(x => x === id).length / D.MILESTONE_EVERY); return n ? `<div class="setline ms">${esc(m.name)}${n > 1 ? ' ×' + n : ''}: ${esc(m.text)}</div>` : ''; }).join('');
  const pct = Math.max(0, Math.min(100, r.hp / S.maxHp * 100));
  const cp = T.CHAR_PERKS[r.char] || { title: "", perks: [] };
  const perks = cp.perks.map(([ic, sg, tx]) => `<span class="pk ${sg === "+" ? "plus" : "minus"}">${/^[a-zA-Z]+$/.test(ic) ? art.statIcon(ic) : `<span class="pe">${ic}</span>`}${esc(tx)}</span>`).join("");
  return `<aside class="side">
    <div class="panel hero-card" tabindex="0" data-tip="${esc(ch.name + " · " + (cp.role || ch.style) + '\n' + ch.text)}">
      <div class="hc-head">${art.heroArt(r.char, r.form)}<div class="hc-id"><div class="nm">${esc(ch.name)}</div><div class="fm">${esc(cp.role || ch.style)}</div></div><span class="hc-num"><span data-ctr="hp">${r.hp}</span>/${S.maxHp}</span></div>
      <div class="hpbar"><i style="width:${pct}%"></i></div>
      <div class="hc-trait"><span>${cp.title ? "★ " + esc(cp.title) : ""}</span>${r.badges && r.badges.length ? `<div class="bdgs" aria-label="Odznaki (${r.badges.length})">${r.badges.map(bd => `<div class="chip badge" tabindex="0" data-tipk="badge:${bd}">${art.badgeIcon(bd)}</div>`).join("")}</div>` : ""}</div>
      ${cp.perks.length ? `<div class="hc-perks">${perks}</div>` : ""}</div>
    ${companionPanel()}
    <div class="panel"><h4>Umiejętności aktywne</h4><div class="slots">${slots}</div></div>
    <div class="panel"><h4>Statystyki</h4>${zoneCompareHTML()}<dl class="stats">${rows}</dl></div>
    <div class="panel"><h4>Kafelki (${r.tiles.length})</h4>${chips ? `<div class="chips">${chips}</div>` : '<span class="hint">Jeszcze nic. Wybierz pierwszy kafelek.</span>'}${sets}${mss}${pawnLine}${foxLine}</div></aside>`;
}
// Liczniki tablicy rozdzielczej: licznik odcinkowy wyniku i przewijanie wartości przy zmianie (zielony / czerwony błysk).
const odoHTML = (n, len) => String(Math.max(0, n | 0)).padStart(len, '0').split('').map(d => `<i>${d}</i>`).join('');
// Animacje: domyślnie WŁ. niezależnie od ustawień systemu (Windows „pokaż animacje” / oszczędzanie energii wyłączały całą walkę);
// gracz wyłącza je sam w „Dźwięk i walka” (`bulgot:anim` = '0'), klasa `html.reduce` wyłącza je w CSS.
const animOn = () => store.get('bulgot:anim') !== '0';
const REDUCED = { get matches() { return !animOn(); } };
const applyAnim = () => document.documentElement.classList.toggle('reduce', !animOn());
applyAnim();
function rollCounters() {
  const prev = G.ctr || (G.ctr = {}), runId = G.run && G.run.id;
  if (prev._run !== runId) { for (const k of Object.keys(prev)) delete prev[k]; prev._run = runId; }
  for (const el of document.querySelectorAll('[data-ctr]')) {
    const k = el.dataset.ctr, to = k === 'score' ? G.run.score : k === 'coins' ? G.run.coins : G.run.hp, from = prev[k];
    prev[k] = to;
    if (from === undefined || from === to) continue;
    const cell = el.closest('.disp, .hpbar, .hc-num') || el;
    cell.classList.remove('flash-up', 'flash-down'); void cell.offsetWidth; cell.classList.add(to > from ? 'flash-up' : 'flash-down');
    if (REDUCED.matches) continue;
    const fmt = v => el.dataset.odo ? odoHTML(v, +el.dataset.odo) : String(v), t0 = performance.now(), dur = Math.min(900, 300 + Math.abs(to - from) * 6);
    const step = now => { const q = Math.min(1, (now - t0) / dur), v = Math.round(from + (to - from) * (1 - Math.pow(1 - q, 3))); if (!el.isConnected) return; el.innerHTML = fmt(v); if (q < 1) requestAnimationFrame(step); };
    el.innerHTML = fmt(from); requestAnimationFrame(step);
  }
}
// Porównanie z typowym wrogiem bieżącej strefy (średnia z jawnych danych strefy, bez składu piętra):
// atak = jak szybko pokonasz typową grupę, obrona = jak długo wytrzymasz jej ciosy. Słabo / OK / Mocno.
function zoneCompare() {
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
  const crit = 1 + (S.crit || 0) * ((S.critMult || 150) - 100) / 10000;
  const dps = Math.max(0.1, S.atk * (100 + (S.dmg || 0)) / 100 * S.aspd / 100 * crit * 100 / (100 + eArm));
  const taken = Math.max(0.05, eDps * 100 / (100 + S.armor) * (100 - Math.min(75, S.evade || 0)) / 100 - (S.regen || 0) / 10);
  return { off: 10 / (eHp / dps), def: (S.maxHp / taken) / 20 };
}
// Zestawy jako ikonki pod paskami Atak/Obrona: kropki = sztuki zestawu (wypełnione = posiadane, kwadrat = próg bonusu), żółty = brakuje jednej sztuki do progu.
const SET_ICON = { jajeczne: '🥚', zbozowe: '🌽', rambo: '💪', rosolowe: '🔥', chlodnicze: '❄️', korpo: '💼' };
// Ile sztuk zestawu jest w puli (legendy z podwójnym wpisem liczą się za 2).
const setTotal = id => D.TILES.filter(t => !t.hatched && !t.hidden).reduce((a, t) => a + setsOf(t).filter(x => x === id).length, 0);
function linkChipsHTML() {
  if (!G.run) return '';
  const r = G.run, st = activeLinks(r.tiles, r.skills, setCounts(r.tiles, r.decree)).filter(l => l.met);
  const html = st.map(l => { const L = D.SET_LINKS.find(x => x.id === l.id); return `<div class="lnk ${l.kind} ${l.fixed ? 'fixed' : ''}" tabindex="0" data-tipk="link:${l.id}"><span class="lic">${l.kind === 'conflict' ? (l.fixed ? '☮' : '⚔') : '✚'}</span><span class="lnm">${esc(L.name)}</span></div>`; }).join('');
  return html ? `<div class="zlinks" aria-label="Powiązania zestawów">${html}</div>` : '';
}
function setChipsHTML() {
  if (!G.run) return '';
  const sc = setCounts(G.run.tiles, G.run.decree);
  const chips = Object.entries(D.SETS).map(([id, st]) => {
    const n = sc[id] || 0; if (!n) return '';
    const total = Math.max(n, setTotal(id)), next = D.SET_STEPS.find(x => n < x);
    const dots = Array.from({ length: Math.min(total, 8) }, (_, i) => `<i class="${i < n ? 'on' : ''}${D.SET_STEPS.includes(i + 1) ? ' th' : ''}"></i>`).join('');
    return `<div class="sch ${n >= 2 ? 'act' : ''} ${next && next - n === 1 ? 'near' : ''}" tabindex="0" data-tipk="set:${id}"><span class="sic">${SET_ICON[id] || '★'}</span><span class="snm">${esc(st.name)}</span><b>${n}/${total}</b><span class="sdots">${dots}</span></div>`;
  }).join('');
  return chips ? `<div class="zsets" aria-label="Zestawy">${chips}</div>${linkChipsHTML()}` : '';
}
function zoneCompareHTML() {
  const c = zoneCompare(); if (!c) { const z = setChipsHTML(); return z ? `<div class="zcmp">${z}</div>` : ''; }
  const bar = (k, label, v, tip) => { const lv = v < 0.75 ? 'lo' : v > 1.3 ? 'hi' : 'ok', word = { lo: 'słabo', ok: 'OK', hi: 'mocno' }[lv];
    return `<div class="zc ${lv}" tabindex="0" data-tip="${esc(tip)}">${art.statIcon(k)}<span class="zl">${label}</span><span class="zb"><i style="width:${Math.round(Math.min(1, v / 2) * 100)}%"></i><u></u></span><b>${word}</b></div>`; };
  return `<div class="zcmp" aria-label="Porównanie z wrogami strefy">${bar('atk', 'Atak', c.off, 'Jak szybko pokonasz typową grupę wrogów tej strefy (Atak, Szybkość ataku, Kryt, Obrażenia kontra ich Życie i Pancerz).')}${bar('armor', 'Obrona', c.def, 'Jak długo wytrzymasz ciosy typowej grupy wrogów tej strefy (Życie, Pancerz, Unik, Regeneracja kontra ich Atak).')}${setChipsHTML()}</div>`;
}
function tuckLetter(el) {
  if (!el || el.classList.contains('tucked')) return;
  (G.tucked || (G.tucked = {}))[el.dataset.k] = true;
  const pill = $('.pill.dec'); if (pill) { pill.classList.remove('ping'); void pill.offsetWidth; pill.classList.add('ping'); }
  if (REDUCED.matches) { el.remove(); return; }
  el.classList.add('tucked'); setTimeout(() => el.remove(), 650);
}
function armLetter() {
  const el = $('.decree.letter'); if (!el) return;
  clearTimeout(G.letterT); G.letterT = setTimeout(() => tuckLetter($('.decree.letter')), 9000);
}
// Plakietki na pasku: Dogrywka, Klątwy, trasa strefy.
function topPills() {
  const r = G.run, o = [];
  if (r.endless) o.push('<span class="pill endl" title="Dogrywka: Prezes pokonany, run trwa dalej. Wrogowie rosną szybciej, co ' + D.RULES.superEvery + ' pięter wpada super-boss.">♾ Dogrywka</span>');
  if (r.curses && r.curses.length) o.push('<span class="pill curse" title="' + esc('Klątwy Prezesa (+' + r.cursePct + '% do wyniku):\n' + r.curses.map(c => D.CURSES[c].name + ': ' + D.CURSES[c].text).join('\n')) + '">☠ +' + r.cursePct + '%</span>');
  if (r.route && D.ROUTES[r.route]) { const R = D.ROUTES[r.route]; o.push('<span class="pill route" title="' + esc('Trasa: ' + R.name + '\n' + R.text) + '">' + art.emo(R.icon) + '<span class="lbl"> ' + esc(R.name) + '</span></span>'); }
  return o.join('');
}
function topbarHTML() {
  const r = G.run, M = D.MODES[r.mode];
  return `<div class="topbar dash"><span class="brand" aria-label="Bulgot"><img src="logo-napis.png?v=2" alt="Bulgot"></span>
    <span class="disp lift" title="Piętro ${r.round} z ${r.rounds}" aria-label="Piętro ${r.round} z ${r.rounds}"><i class="arr" aria-hidden="true">▲</i><b>${String(r.round).padStart(2, '0')}</b><small>/${r.endless ? '∞' : r.rounds}</small></span><span class="zone-name" title="${esc(T.ZONE_NAMES[r.zone])}">${esc(T.ZONE_NAMES[r.zone])}</span><span class="spacer"></span>
    <span class="disp coins" title="Ziarna: waluta na rerolle i zakupy. Odsetki po wygranej walce: +${Math.min(r.interestMax || 3, Math.floor(r.coins / D.RULES.interestPer))}">${art.coinIcon()}<b data-ctr="coins">${r.coins}</b></span>
    ${r.decree && D.DECREES[r.decree] ? `<span class="pill dec" tabindex="0" title="${esc(D.DECREES[r.decree].name + ': ' + D.DECREES[r.decree].text)}">${art.decreeIcon()}<span class="lbl"> Okólnik</span></span>` : ''}
    <span class="pill mode">${M.name}</span>${r.daily ? '<span class="pill dly" title="Dyżur dnia: jeden run dla wszystkich, bez Kurnika i premii.">Dyżur dnia</span>' : ''}${topPills()}${r.garnek ? `<span class="pill g" title="Palnik ${r.garnek} (${BURNERS[r.garnek]}): ${esc(D.GARNEK[r.garnek].name)}">Palnik ${r.garnek}</span>` : ''}
    <span class="disp odo" title="Wynik na żywo" aria-label="Wynik ${r.score}"><b data-ctr="score" data-odo="6">${odoHTML(r.score, 6)}</b></span>
    <button class="btn small menubtn" data-act="book" title="Księga Kurnika (K)" aria-label="Księga Kurnika">${art.bookIcon()}</button><button class="btn small menubtn" data-act="help" title="Jak grać (H)" aria-label="Jak grać">${art.helpIcon()}</button><button class="btn small menubtn" data-act="menu" title="Menu (Esc)" aria-label="Menu">${art.menuIcon()}</button></div>`;
}
function stageHTML() {
  const r = G.run;
  if (r.phase === 'offer') return stageOffer();
  if (r.phase === 'event') { const kd = r.pending.kind; return kd === 'shop' ? stageShop() : kd === 'contract' ? stageContract() : kd === 'shrine' ? stageShrine() : kd === 'adopt' ? stageAdopt() : kd === 'crate' ? stageCrate() : kd === 'arena' ? stageArena() : kd === 'extra' ? stageExtra() : stageGamble(); }
  if (r.phase === 'badge') return stageBadge();
  if (r.phase === 'loot') return stageLoot();
  if (r.phase === 'door') return stageDoor();
  if (r.phase === 'route') return stageRoute();
  if (r.phase === 'victory') return stageVictory();
  if (r.phase === 'bonus') return stageBonus();
  if (r.phase === 'fight') return stagePrep();
  return '';
}
function floorKron() {
  const r = G.run;
  if (r.extraNow) return D.BOSSES[r.extraNow].quote;
  if (r.boss) return bossIntroOf(r.boss).quote;
  return T.pickLine(T.OFFER_LINES[r.zone], r.round - 1);
}
// Odpoczynek: za Ziarna leczy część życia, raz na rundę, przed walką.
function restBtn() {
  const r = G.run, off = r.rested || r.hp >= r.maxHp || r.coins < r.restCost || !!r.extraNow;
  const why = r.extraNow ? 'Przed dodatkową rundą nie ma odpoczynku' : r.rested ? 'W tej rundzie już odpoczywałeś' : r.hp >= r.maxHp ? 'Masz pełne życie' : r.coins < r.restCost ? 'Za mało Ziaren' : 'Odpoczynek (klawisz O)';
  return `<button class="btn" data-act="rest" ${off ? 'disabled' : ''} title="${why}">Odpoczynek: +${r.restPct}% życia za ${r.restCost} ${art.coinIcon()}</button>`;
}
function offerCard(id, i) {
  const r = G.run, t = TILE[id], price = shopPrice(t), left = r.offer.filter(Boolean).length;
  const buy = t.event
    ? '<div class="buynote">Wydarzenie: tylko do wyboru</div>'
    : `<button class="btn small buy" data-act="buyoffer" data-i="${i}" ${r.coins < price || left < 2 ? 'disabled' : ''} title="Dokup ten kafelek za Ziarna (Shift + ${i + 1}). Darmowy wybór zostaje.">Dokup za ${price} ${art.coinIcon()}</button>`;
  const flaw = i === r.flawAt, will = r.will && id === r.will;
  const stamp = flaw ? '<div class="stamp flaw" title="Efekty kafelka są o 50% mocniejsze, ale ma ukrytą wadę, która ujawni się po następnej walce.">Wada fabryczna · +50%</div>'
    : will ? '<div class="stamp will" title="Kafelek zapisany w Testamencie Pyrtka po poprzednim runie.">Testament</div>' : '';
  return `<div class="slotcard ${flaw ? 'flawed' : ''} ${will ? 'willed' : ''}">${stamp}${tileCard(id, { i })}${buy}</div>`;
}
// Lombard Lisa: przycisk zastawu albo wykupu.
function pawnBtn() {
  const r = G.run, p = r.pawned;
  if (p && p.canRedeem) return `<button class="btn" data-act="redeem" ${r.coins < p.cost ? 'disabled' : ''} title="Lis odda kafelek tylko na tym piętrze">${art.pawnIcon()} Wykup: ${esc(TILE[p.id].name)} za ${p.cost} ${art.coinIcon()}</button>`;
  if (p) return '';
  return `<button class="btn" data-act="pawnmenu" ${pawnable().length ? '' : 'disabled'} title="Zastaw kafelek u Lisa za pełną cenę (klawisz L)">${art.pawnIcon()} Lombard Lisa</button>`;
}
// Ulepszanie: 3 kopie statystyki poziomu 1 lub 2 zlewają się w 1 kafelek następnego poziomu (za darmo).
function upgradeBtn() {
  const up = G.run.up || [];
  return `<button class="btn ${up.length ? 'upg' : ''}" data-act="upgrademenu" ${up.length ? '' : 'disabled'} title="${up.length ? 'Zlej ${D.RULES.upgradeCost} takie same kafelki w jeden wyższego poziomu (klawisz U)' : 'Potrzebujesz 3 takich samych statystyk poziomu 1 lub 2 (zlewają się w wyższy poziom)'}">${art.upgradeIcon()} Zlej kafelki${up.length ? ` (${up.length})` : ''}</button>`;
}
function showUpgrade() {
  const rows = (G.run.up || []).map(id => { const t = TILE[id], nx = TILE[t.next], n = G.run.tiles.filter(x => x === id).length;
    return `<button class="upg-row" data-act="upgrade" data-v="${id}"><span class="upg-from r${t.rarity}" data-tipk="tile:${id}"><span class="pi">${lvlTag(t)}${art.tileIcon(id)}</span><b>${D.RULES.upgradeCost}×</b> ${esc(t.name)}${n > D.RULES.upgradeCost ? ` <small>(masz ${n})</small>` : ''}</span><span class="upg-arrow">→</span><span class="upg-to r${nx.rarity}" data-tipk="tile:${nx.id}"><span class="pi">${lvlTag(nx)}${art.tileIcon(nx.id)}</span>${esc(nx.name)}<small>${esc(nx.text)}</small></span></button>`; }).join('');
  openOverlay(`<h2>Zlewanie kafelków</h2><p class="lead">Dwie takie same statystyki poziomu 1 lub 2 zlewasz za darmo w jedną następnego poziomu. Kosztem są dwa kafelki, nie Ziarna.</p><div class="upg-list">${rows || '<p class="hint">Nie masz trzech takich samych kafelków do zlania.</p>'}</div>`, { cls: 'upgmodal' });
}
const pawnable = () => { const r = G.run; return [...new Set(r.tiles)].filter(id => { const t = TILE[id]; return t && t.type !== 'skill' && !t.hidden && !t.noPawn && !(r.flawed || []).some(w => w.id === id); }); };
// Zamiana kolejności umiejętności (slot = klawisz w walce). Serwer zapisuje kolejność, więc powtórka walki się zgadza.
async function swapSlots(a, b) {
  const j = await act('skillorder', { a, b }); if (!j) return;
  snd.sfx('click'); render();
}
document.addEventListener('dragstart', e => { const s = e.target.closest && e.target.closest('.slot[data-slot]'); if (!s) return; G.dragSlot = +s.dataset.slot; e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(G.dragSlot)); } catch (x) {} s.classList.add('drag'); });
document.addEventListener('dragover', e => { const s = e.target.closest && e.target.closest('.slot[data-slot]'); if (s && G.dragSlot != null) { e.preventDefault(); document.querySelectorAll('.slot.over').forEach(x => x !== s && x.classList.remove('over')); s.classList.add('over'); } });
document.addEventListener('dragend', () => { G.dragSlot = null; document.querySelectorAll('.slot.drag, .slot.over').forEach(x => x.classList.remove('drag', 'over')); });
document.addEventListener('drop', e => { const s = e.target.closest && e.target.closest('.slot[data-slot]'); if (!s || G.dragSlot == null) return; e.preventDefault(); const a = G.dragSlot, b = +s.dataset.slot; G.dragSlot = null; if (a !== b) swapSlots(a, b); });
function showPawn() {
  const P = D.RULES.prices, back = D.RULES.pawnBack, fox = D.RULES.pawnFox, coin = art.coinIcon();
  // kompaktowe kafelki w jednym rzędzie (pełny opis w dużej podpowiedzi po najechaniu), żeby okno nie wymagało przewijania
  const cards = pawnable().map(id => { const t = TILE[id], pr = P[t.rarity], n = G.run.tiles.filter(x => x === id).length;
    return `<div class="pawn-card r${t.rarity}" data-tipk="tile:${id}" tabindex="0"><span class="pi">${art.tileIcon(id)}${n > 1 ? `<sup>×${n}</sup>` : ''}</span><div class="pn">${esc(t.name)}</div><div class="pb">Wykup: <b>${Math.ceil(pr * back / 100)}</b> ${coin}</div><button class="btn small buy" data-act="pawn" data-v="${id}">Zastaw za ${pr} ${coin}</button></div>`; }).join('');
  openOverlay(`<h2>Lombard Lisa</h2>
    <p class="lead">Lis pożycza Ci Ziarna pod zastaw kafelka: pieniądze dostajesz od razu, ale kafelek znika z budowy i musisz go odkupić drożej.</p>
    <div class="pawn-how">
      <div><b>Jak to działa</b><ol><li>Oddajesz jeden kafelek (nie umiejętność, nie kafelek z wadą) i dostajesz <b>pełną cenę</b> jego rzadkości.</li><li>Na <b>następnym piętrze</b> wykupisz go za <b>${back}%</b> (zwykły ${P[0]} → ${Math.ceil(P[0] * back / 100)}, rzadki ${P[1]} → ${Math.ceil(P[1] * back / 100)}).</li><li>Nie wykupisz? Przepada, a Lisy Windykatory są o <b>${fox}%</b> silniejsze (za każdy zastaw). Lis trzyma naraz jeden.</li></ol></div>
      <div><b>Kiedy warto</b><ul><li>Potrzebujesz Ziaren <b>teraz</b> (dokup, reroll), a kafelek słabo pasuje do budowy.</li><li>Wiesz, że za piętro będziesz mieć na wykup.</li></ul><b>Kiedy nie</b><ul><li>To kluczowy kafelek zestawu, a bez niego przegrasz walkę.</li><li>Nie stać Cię będzie na wykup.</li></ul></div>
    </div>
    <div class="pawn-cards">${cards}</div>`, { cls: 'pawnmodal' });
}
// Przycisk wymiany oferty: nazwa z fabuły (T.REROLL), cena w Ziarnach obok; Klątwa „Zakaz Wymian” blokuje go całkiem.
function rerollBtn(cost, free, blocked, coins) {
  if (blocked) return `<button class="btn reroll" disabled data-tip="${esc('Zakaz Wymian' + String.fromCharCode(10) + 'Klątwa Prezesa: taśma stoi, oferty nie przetasujesz.')}"><span>${esc(T.REROLL_BLOCKED)}</span></button>`;
  return `<button class="btn reroll" data-act="reroll" ${coins < cost ? 'disabled' : ''}><span>${esc(T.REROLL)}</span><span class="rcost ${free ? 'free' : ''}">${free ? 'gratis' : `${cost} ${art.coinIcon()}`}</span></button>`;
}
function stageOffer() {
  const r = G.run, cards = r.offer.map((id, i) => id ? offerCard(id, i) : '<div class="slotcard"><div class="tile gone">Dokupione</div></div>').join('');
  const cost = r.rerollCost, free = cost === 0, blocked = cost === null || cost === undefined;
  const lost = r.lostPawn && r.foxDebt ? `<div class="hint warn">Lis zatrzymał ${esc(TILE[r.lostPawn] ? TILE[r.lostPawn].name : '')}. Lisy Windykatory są silniejsze o ${r.foxDebt * D.RULES.pawnFox}%.</div>` : '';
  return `<div class="stage-title"><h2>Piętro ${r.round}${r.boss ? ' · BOSS' : ''}</h2><div class="sub">${esc(T.ZONE_NAMES[r.zone])}${r.elite ? ' · elitarny wróg' : ''}${decreeSub()}</div></div>
    <div class="kron">${esc(r.nemesisRound ? T.pickLine(T.NEMESIS_LINES, r.round) : floorKron())}</div>${decreeHTML()}${previewHTML()}
    <div class="cards">${cards}</div>
    <div class="actions">${rerollBtn(cost, free, blocked, r.coins)}${restBtn()}${pawnBtn()}${upgradeBtn()}</div>${lost}
    <div class="hint">Jeden kafelek bierzesz za darmo (klawisze 1–${r.offer.length}), pozostałe możesz dokupić (Shift + cyfra). R przelosowuje ofertę, L otwiera Lombard, U zlewa kafelki. Strzałki i Enter też działają.</div>`;
}
function stageDoor() {
  const r = G.run, P = r.pending, a = D.AFFIXES[P.affix];
  const reward = `wybór 1 z 3 rzadkich kafelków albo +${P.coins} Ziaren`;
  const cards = [
    choiceCard(0, art.doorIcon(false), 'Zwykłe drzwi', 'Spokojne piętro: zwykli wrogowie i darmowy Odpoczynek na wejściu (leczy jak zwykły).'),
    choiceCard(1, art.doorIcon(true), 'Tylko dla personelu', `Pierwszy wróg ma cechę ${a.name} (${a.text}) i jest dużo silniejszy. Przychodzi najwyżej z jednym pomocnikiem. Po tej walce nie leczysz się.`, `<div class="tmeta"><span class="tag up">Nagroda: ${esc(reward)}</span></div>`),
  ].join('');
  return `<div class="stage-title"><h2>Piętro ${r.round}: Rozwidlenie Korytarza</h2><div class="sub">Masz ${r.hp} / ${r.maxHp} Życia. Wybierz drzwi.</div></div>
    <div class="kron">${esc(T.pickLine(T.DOOR_LINES, r.round))}</div>${decreeHTML(true)}<div class="cards">${cards}</div>`;
}
function stageShop() {
  const r = G.run, cards = r.pending.offer.map((id, i) => tileCard(id, { i, act: 'buy', price: Math.max(1, Math.ceil(shopPrice(TILE[id]) * D.RULES.shopPct / 100)) })).join('');
  return `<div class="stage-title"><h2>Sklepik Babci Kwoki</h2><div class="sub">Masz ${r.coins} ${art.coinIcon()} Ziaren</div></div>
    <div class="kron">Babcia nie bierze kart. Babcia bierze ziarno.</div><div class="cards">${cards}</div>
    <div class="actions"><button class="btn" data-act="leave">Wychodzę bez zakupu</button></div>`;
}
const shopPrice = t => { const p = Math.ceil(D.RULES.prices[t.rarity] * ((G.run && G.run.priceMul) || 100) / 100), d = G.run && G.run.buyDisc; return d ? Math.max(1, Math.floor(p * (100 - d) / 100)) : p; };
const setsOf = t => t.sets || (t.set ? [t.set] : []);
function stageGamble() {
  const r = G.run, c = r.coins, q = Math.max(1, Math.floor(c / 4)), h = Math.max(1, Math.floor(c / 2));
  const bets = c > 0 ? [...new Set([1, q, h, c])].filter(x => x <= c).map(x => `<button class="btn" data-act="bet" data-v="${x}">Stawiam ${x} ${art.coinIcon()}</button>`).join('') : '<span class="hint">Nie masz czym grać.</span>';
  return `<div class="stage-title"><h2>Hazard w Kurniku</h2><div class="sub">Rzut monetą: ${D.RULES.betPct}% podwajasz stawkę, ${100 - D.RULES.betPct}% tracisz ją</div></div>
    <div class="kron">Zasady proste: dom zawsze wygrywa. Dom to kurnik.</div>
    <div class="gamble"><div class="bignum">${c} ${art.coinIcon('coin')}</div><div class="bets">${bets}</div><button class="btn ghost" data-act="bet" data-v="0">Nie ryzykuję</button></div>`;
}
// Odznaki, Kontrakt z HR, Kapliczka: karty decyzji (data-act=choose).
function choiceCard(i, icon, name, text, extra = '') {
  return `<button class="tile choice r2" data-act="choose" data-i="${i}" style="--i:${i}"><span class="key">${i + 1}</span>${icon}<div class="tname">${esc(name)}</div><div class="ttext">${esc(text)}</div>${extra}</button>`;
}
function stageBadge() {
  const r = G.run, cards = r.pending.offer.map((b, i) => choiceCard(i, art.badgeIcon(b), D.BADGES[b].name, D.BADGES[b].text, '<div class="tmeta"><span class="tag up">Odznaka</span></div>')).join('');
  return `<div class="stage-title"><h2>Odznaka Pracownicza</h2><div class="sub">Nagroda za ${r.boss ? 'pokonanie bossa' : 'elitarnego wroga'}. Działa do końca runu i nie zajmuje miejsca.</div></div>
    <div class="kron">Dział Kadr z niechęcią przyznaje wyróżnienie. Wybierz jedno.</div><div class="cards">${cards}</div>`;
}
function stageLoot() {
  const r = G.run, cards = r.pending.offer.map((id, i) => tileCard(id, { i, act: 'choose' })).join('');
  return `<div class="stage-title"><h2>Łup z bossa</h2><div class="sub">Z pokonanego bossa wypadły trzy legendarne rzeczy. Weź jedną.</div></div>
    <div class="kron">Zarząd sprząta po bossie. Resztki wciąż są warte więcej niż twoja pensja.</div><div class="cards">${cards}</div>`;
}
// Trasa na początku strefy: dwie drogi z różnymi modyfikatorami na całą strefę.
function stageRoute() {
  const r = G.run, cards = r.pending.opts.map((id, i) => { const R = D.ROUTES[id]; return choiceCard(i, art.emo(R.icon), R.name, R.text, '<div class="tmeta"><span class="tag up">Trasa na całą strefę</span></div>'); }).join('');
  return `<div class="stage-title"><h2>Piętro ${r.round}: wybierz trasę</h2><div class="sub">Wchodzisz do strefy: ${esc(T.ZONE_NAMES[r.zone])}. Trasa działa do końca strefy.</div></div>
    <div class="kron">Korytarz rozwidla się w dwie strony. Jedna pachnie rosołem, druga czymś gorszym.</div><div class="cards">${cards}</div>`;
}
// Po Prezesie: koniec runu albo Dogrywka.
function stageVictory() {
  const r = G.run;
  const cards = [
    choiceCard(0, art.emo('dogrywka'), 'Dogrywka', 'Zostajesz w fabryce. Wrogowie rosną szybciej, co ' + D.RULES.superEvery + ' pięter wpada super-boss, a każde piętro dokłada ' + D.RULES.scoreRound + ' pkt. Porażka nie odbiera wygranej.', '<div class="tmeta"><span class="tag up">Ranking Dogrywki</span></div>'),
    choiceCard(1, art.potArt(true), 'Zakończ run', 'Zgarniasz wygraną i wynik teraz: ' + fmtNum(r.score) + ' pkt.'),
  ].join('');
  return `<div class="stage-title"><h2>Prezes pokonany!</h2><div class="sub">Wygrana jest już twoja. Co dalej?</div></div>
    <div class="kron">${esc('Padł Prezes, a z nim upadł cały cennik. Ale schody prowadzą jeszcze wyżej.')}</div><div class="cards">${cards}</div>`;
}
// Schronisko dla Piskląt: adopcja towarzysza.
function companionBlurb(id, lvl = 1) { const d = D.COMPANIONS[id], L = d.lv[lvl - 1]; return d.text + (L.every ? ' Co ' + (L.every / 10).toString().replace('.', ',') + ' s: ' + ({ peck: L.v + '% Ataku', heal: L.v + '% Życia', burn: L.v + ' st. Oparzenia', frost: L.v + ' st. Mrozu', honk: 'ogłuszenie ' + (L.v / 10).toString().replace('.', ',') + ' s' }[L.act] || '') + '.' : ''); }
function stageAdopt() {
  const r = G.run, cur = r.companion, cards = r.pending.opts.map((id, i) => choiceCard(i, art.companionArt(id), D.COMPANIONS[id].name, companionBlurb(id, r.pending.start ? Math.max(1, (r.kurnik && r.kurnik.pisklecarnia >= 3) ? 2 : 1) : 1), '<div class="tmeta"><span class="tag up">Rośnie po bossach</span></div>')).join('');
  return `<div class="stage-title"><h2>${r.pending.start ? 'Pisklęcarnia' : 'Schronisko dla Piskląt'}</h2><div class="sub">${cur ? 'Masz już: ' + esc(compForm(cur)) + '. Nowy towarzysz go zastąpi.' : 'Wybierz towarzysza, który będzie walczył u twojego boku.'}</div></div>
    <div class="kron">${r.pending.start ? 'Pisklęta z Pisklęcarni czekają na ciebie przed pierwszym piętrem.' : 'Adopcja jest bezpłatna. Gryzienie w cenie.'}</div><div class="cards">${cards}</div>
    <div class="actions"><button class="btn" data-act="choose" data-i="-1">Nie adoptuję</button></div>`;
}
// Tajemnicza Skrzynka przy pełnych slotach: wybierz umiejętność do zastąpienia albo zostaw nagrodę.
function stageCrate() {
  const r = G.run, t = TILE[r.pending.tile];
  const cards = r.skills.map((s, i) => choiceCard(i, art.tileIcon(D.TILES.find(x => x.skill === s.id).id), (i + 1) + '. ' + D.SKILLS[s.id].name + (s.lvl >= 3 ? ' (zmutowana)' : s.lvl >= 2 ? ' (poz. 2)' : ''), 'Zastąp tę umiejętność: ' + t.name + '.')).join('');
  return `<div class="stage-title"><h2>Tajemnicza Skrzynka</h2><div class="sub">W środku leży ${esc(t.name)} (${D.RARITY[t.rarity]}), ale masz pełne sloty. Którą umiejętność zastąpić?</div></div>
    <div class="cards">${tileCard(t.id, { static: true, mini: true })}</div><div class="cards">${cards}</div>
    <div class="actions"><button class="btn" data-act="choose" data-i="-1">Zostaw nagrodę</button></div>`;
}
// Arena Duchów: walka z buildem innego gracza.
function stageArena() {
  const r = G.run, g = r.pending.ghost, st = g.stats, ch = D.CHARS[g.char], tiles = [...new Set(g.tiles || [])].slice(0, 16).map(id => TILE[id] ? art.tileIcon(id) : '').join('');
  const cards = [
    choiceCard(0, art.ghostArt(g.char, g.wear), 'Walcz z Duchem', 'Nagroda: +' + D.RULES.arenaCoins + ' Ziaren i wybór 1 z 3 rzadkich kafelków. Przegrana kończy run jak każda walka.', '<div class="tmeta"><span class="tag up">Ryzyko</span></div>'),
    choiceCard(1, art.doorIcon(false), 'Odwrót', 'Odchodzisz i walczysz ze zwykłymi wrogami tego piętra.'),
  ].join('');
  return `<div class="stage-title"><h2>Arena Duchów</h2><div class="sub">${g.mirror ? 'Nikt jeszcze nie zostawił tu ducha, więc czeka twoje Odbicie.' : 'Duch gracza <b>' + esc(g.nick) + '</b> (' + esc(ch ? ch.name : '') + ', ' + g.floors + ' pięter)'}</div></div>
    <div class="kron">Kto nie dotarł do Prezesa, ten krąży po arenie i bije następnych.</div>
    <div class="ghostcard"><div class="gfig">${art.ghostArt(g.char, g.wear)}</div><div class="gst"><b>Statystyki Ducha na tym piętrze</b><span>Życie ${st.hp}</span><span>Atak ${st.atk}</span><span>Szybkość ${(st.aspd / 100).toFixed(2).replace('.', ',')} / s</span><span>Pancerz ${st.armor}</span><span>Krytyk ${st.crit}%</span><span>Unik ${st.evade}%</span><div class="gtiles">${tiles}</div></div></div>
    <div class="cards">${cards}</div>`;
}
// Dodatkowa runda po wygranej na piętrze 3 (Gruszka) i 6 (Pipsztal): opcjonalna walka z życiem, które ci zostało.
const EXTRA_INFO = {
  gruszka: { title: 'Gruszka czeka w sadzie', sub: 'Wielki kurczak z głową gruszki wyszedł z cienia i wygląda na obrażonego, że jeszcze stoisz.', kron: 'Zacznie od docinków. Skończy na obieraniu.' },
  pipsztal: { title: 'Pipsztal wchodzi z psem', sub: 'Kurczak w dresie, nóż w skrzydle i pies, który nie trzyma moczu. Pytanie o pięć złotych to dopiero początek.', kron: 'Pies sika, Pipsztal tnie. Ty ogłuszony.' },
};
function stageExtra() {
  const r = G.run, id = r.pending.boss, X = EXTRA_INFO[id], d = D.BOSSES[id], hpPct = Math.round(r.hp * 100 / r.maxHp);
  const cards = [
    choiceCard(0, art.enemyArt(d.art), 'Walcz: ' + d.name, 'Walka z życiem, które ci zostało (' + r.hp + ' z ' + r.maxHp + '). Nagroda: +' + D.RULES.extraCoins + ' Ziaren i wybór 1 z 3 legendarnych statystyk. Przegrana kończy run, a leczenie po piętrze dostajesz dopiero po walce.', '<div class="tmeta"><span class="tag up">Ryzyko</span></div>'),
    choiceCard(1, art.doorIcon(false), 'Odpuszczam', 'Odchodzisz bez bicia piany, dostajesz leczenie po piętrze i idziesz dalej.'),
  ].join('');
  return `<div class="stage-title"><h2>Dodatkowa runda: ${esc(d.name)}</h2><div class="sub">${esc(X.title)}. Opcjonalna, możesz odpuścić.</div></div>
    <div class="kron">${esc(X.kron)}</div>
    <div class="ghostcard"><div class="gfig">${art.enemyArt(d.art)}</div><div class="gst"><b>${esc(d.name)}, ${esc(d.title)}</b><span>${esc(X.sub)}</span><span>${esc(d.text)}</span><span>Twoje życie: ${r.hp} / ${r.maxHp} (${hpPct}%)</span></div></div>
    <div class="cards">${cards}</div>`;
}
function stageContract() {
  const cards = [
    choiceCard(0, art.tileIcon('umowa-etat'), 'Umowa o Pracę', '+30% Ataku do końca runu, ale -2 Ziarna po każdej rundzie.'),
    choiceCard(1, art.tileIcon('umowa-b2b'), 'Umowa B2B', '+15 Ziaren od ręki, ale -15% maks. Życia do końca runu.'),
    choiceCard(2, art.tileIcon('kontrakt-hr'), 'Nie podpisuję', 'Wychodzisz z biura z godnością i niczym więcej.'),
  ].join('');
  return `<div class="stage-title"><h2>Kontrakt z Działem HR</h2><div class="sub">Podpis jest na zawsze. Jak tatuaż, tylko z pieczątką.</div></div><div class="kron">Pani z HR uśmiecha się zbyt szeroko.</div><div class="cards">${cards}</div>`;
}
function stageShrine() {
  const r = G.run, b = r.pending.badge;
  const cards = [choiceCard(0, art.tileIcon('cieple-gniazdko'), 'Modlitwa o zdrowie', 'Pełne uleczenie: wracasz do ' + r.maxHp + ' Życia.')];
  if (b) cards.push(choiceCard(1, art.badgeIcon(b), 'Odznaka: ' + D.BADGES[b].name, D.BADGES[b].text));
  cards.push(choiceCard(2, art.tileIcon('kapliczka'), 'Tylko przechodzę', 'Kłaniasz się i idziesz dalej.'));
  return `<div class="stage-title"><h2>Kapliczka Świętego Rosołu</h2><div class="sub">Masz ${r.hp} / ${r.maxHp} Życia</div></div><div class="kron">Pachnie marchewką i nadzieją.</div><div class="cards">${cards.join('')}</div>`;
}
function stageBonus() {
  const r = G.run, cards = r.offer.map((id, i) => tileCard(id, { i, act: 'bonuspick' })).join('');
  const fromDoor = !r.boss && r.door && r.door.risky;
  return `<div class="stage-title"><h2>${fromDoor ? 'Łup zza drzwi dla personelu' : 'Nagroda za pokonanie bossa'}</h2><div class="sub">Wybierz jeden z trzech rzadkich lub lepszych kafelków${fromDoor ? ` albo weź ${D.RULES.doorCoins} Ziaren` : ''}</div></div>
    <div class="kron">${esc(fromDoor ? 'Ryzyko się opłaciło. Tym razem.' : T.BOSS_WIN_LINES[lastBoss()] || 'Boss padł, a łup czeka.')}</div><div class="cards">${cards}</div>${fromDoor ? `<div class="actions"><button class="btn" data-act="bonuscoins">Wolę ${D.RULES.doorCoins} Ziaren</button></div>` : ''}`;
}
const lastBoss = () => { const b = G.run && G.run.stats.bossKills; return b && b[b.length - 1]; };
function stagePrep() {
  const r = G.run;
  return `<div class="stage-title"><h2>Piętro ${r.round}: do walki!</h2><div class="sub">${esc(T.ZONE_NAMES[r.zone])}${decreeSub()}</div></div>
    <div class="kron">${esc(r.nemesisRound ? T.pickLine(T.NEMESIS_LINES, r.round + 1) : floorKron())}</div>${decreeHTML()}${previewHTML()}
    <div class="actions">${restBtn()}<button class="btn primary big" data-act="tofight" data-primary>Do walki!</button></div>
    <div class="hint">W walce użyjesz umiejętności klawiszami 1, 2, 3. P robi pauzę. O to odpoczynek.<br><b>Okno Gdakania:</b> kolejna umiejętność w ciągu 1,5 s bije mocniej (2. +20%, 3. +50%), a trzy różne pod rząd ogłuszają wrogów na 1 s.</div>`;
}
function renderRun() {
  return `<div class="run">${topbarHTML()}${WIDE.matches ? stairsHTML() : towerHTML()}<main class="stage">${stageHTML()}${boardHTML()}</main>${sideHTML()}</div>`;
}

// ---------- akcje wyboru ----------
// Kafelek umiejętności może wymagać decyzji: który slot zastąpić (pełne sloty) albo którą gałąź Mutacji wybrać (trzecia kopia).
function needChoice(t, slot, mut, go) {
  if (!t || t.type !== 'skill') return false;
  const r = G.run, own = r.skills.find(s => s.id === t.skill);
  if (own && own.lvl >= 2 && mut === undefined) { askMut(t, m => go(slot, m)); return true; }
  if (!own && slot === undefined && r.skills.length >= (G.run.maxSkills || D.RULES.maxSkills)) { askSlot(t, s => go(s, mut)); return true; }
  return false;
}
function askMut(tile, cb) {
  const sk = D.SKILLS[tile.skill];
  G.mutCb = cb;
  const opts = sk.muts.map((m, k) => `<button class="slot mutopt" data-act="mutchoose" data-v="${k + 1}">${art.tileIcon(tile.id)}<div><div class="sn">${esc(m.name)}</div><div class="sd">${esc(m.text)}</div></div></button>`).join('');
  openOverlay(`<h2>Mutacja: ${esc(sk.name)}</h2><p class="lead">Trzecia kopia zmienia umiejętność na stałe. Zachowuje moc poziomu 2 i dostaje jedną z dwóch cech. Wybierz gałąź:</p><div class="slotpick">${opts}</div>`, { narrow: true });
}
const flawToast = (i, t) => { if (i === G.lastFlawAt) toast('Wada fabryczna: ' + t.name + ' działa o 50% mocniej, a ukryta wada ujawni się po walce.', false, 4600); };
async function doPick(i, slot, mut) {
  const r = G.run, id = r.offer[i], t = TILE[id];
  if (!t) return;
  if (needChoice(t, slot, mut, (s2, m2) => doPick(i, s2, m2))) return;
  G.lastFlawAt = r.flawAt;
  const j = await act('pick', { i, slot, mut });
  if (!j) return;
  snd.sfx('pick'); flawToast(i, t);
  if (j.crate && j.crate.pick) { snd.sfx(j.crate.trap ? 'hurt' : 'unlock'); return render(); }   // pełne sloty: wybór slotu na ekranie wydarzenia
  if (j.crate) return showCrate(j.crate);
  if (j.automat) toast('Automat wypluł: ' + j.automat.map(id => TILE[id].name).join(' i '), false, 4200);
  render();
}
async function doBuy(i, slot, mut) {
  const r = G.run, id = r.offer[i], t = id && TILE[id];
  if (!t) return;
  if (needChoice(t, slot, mut, (s2, m2) => doBuy(i, s2, m2))) return;
  G.lastFlawAt = r.flawAt;
  const j = await act('buy', { i, slot, mut });
  if (!j) return;
  snd.sfx('coin'); toast('Dokupiono: ' + t.name + ' (-' + j.price + ' Ziaren)'); flawToast(i, t);
  render();
}
function askSlot(tile, cb) {
  const r = G.run, rows = r.skills.map((s, i) => `<button class="slot" data-act="slotchoose" data-v="${i}" style="width:100%;text-align:left;cursor:pointer">${art.tileIcon(D.TILES.find(t => t.skill === s.id).id)}<div><div class="sn">${i + 1}. ${esc(D.SKILLS[s.id].name)} ${s.lvl >= 2 ? '(poz. 2)' : ''}</div><div class="sd">Zastąp tę umiejętność</div></div></button>`).join('');
  G.slotCb = cb;
  openOverlay(`<h2>Pełne sloty</h2><p class="lead">Masz już trzy umiejętności. Którą zastąpić umiejętnością <b>${esc(tile.name)}</b>?</p><div class="slotpick">${rows}</div>`, { narrow: true });
}
function showCrate(c) {
  const t = c.tile ? TILE[c.tile] : null;
  const body = (t ? `<p class="lead">W środku leżał <b>${esc(t.name)}</b> (${D.RARITY[t.rarity]}).</p><div class="cards">${tileCard(t.id, { static: true, mini: true })}</div>` : '<p class="lead">Skrzynka była pusta.</p>')
    + (c.trap ? '<p class="lead" style="color:#ff9f80"><b>Pułapka!</b> Skrzynka ugryzła cię w pióra. Tracisz 15% życia.</p>' : '<p class="lead">Szczęście dopisało: żadnej pułapki.</p>');
  snd.sfx(c.trap ? 'hurt' : 'unlock');
  openOverlay(`<h2>Tajemnicza Skrzynka</h2>${body}<div class="actions" style="margin-top:14px"><button class="btn primary" data-act="close" data-primary>Dalej</button></div>`, { narrow: true });
  render();
}

// ---------- walka na żywo ----------
// ---------- walka na pełnym ekranie (Etap 1 przebudowy, 2026-11-23) ----------
// Cały ekran gry znika, zostaje scena strefy (scenes.js), cienki pasek u góry i szerokie szklane kafelki umiejętności na dole.
// Układ liczymy w jednostkach --u (= 1% wysokości sceny, a na wąskich ekranach szerokości): postacie, plakietki i efekty skalują się razem.
const HX = 23;   // środek bohatera w % szerokości (pływające napisy bohatera)
const HERO_POS = [HX, 26, 30], COMP_POS = [9, 24, 13];
const ENEMY_LAYOUT = {
  1: [[76, 25, 28]],
  2: [[64, 30, 23], [84, 25, 26]],
  3: [[56, 32, 20], [73, 26, 26], [89, 32, 17]],
  4: [[50, 34, 16], [64, 28, 20], [77, 24, 23], [91, 31, 16]],
  5: [[46, 35, 14], [58, 30, 17], [70, 26, 20], [82, 23, 22], [93, 31, 14]],
};
const BOSS_POS = [82, 20, 39], MINION_POS = [[50, 31, 13], [62, 25, 13], [44, 24, 12], [56, 34, 12], [68, 29, 12]];
const RING = 2 * Math.PI * 36;
function startFight(setup) {
  const run = G.run, f = new Fight(setup);
  const F = G.fight = { setup, f, inputs: [], queue: [], acc: 0, last: 0, paused: false, finishing: false, units: new Map(), raf: 0, bossBanner: false, fxDelay: null, hitDelay: new Map(), trapEl: null, domeEl: null };
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
    <div class="kron" id="kline">${esc(boss ? bossIntroOf(boss.boss).quote : floorKron())}</div></div>`;
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

function placeUnit(el, pos) { const x = innerWidth <= 760 ? 11 + pos[0] * .78 : pos[0]; el.style.left = x + '%'; el.style.bottom = `calc(var(--u) * ${pos[1]} + var(--ub, 0px))`; el.style.width = `calc(var(--u) * ${pos[2]})`; return x; }
function makeUnit(key, o) {
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
function layoutUnits() {
  const F = G.fight, alive = F.f.enemies.filter(e => !e.dead), boss = alive.find(e => e.boss);
  if (boss) {
    let k = 0;
    for (const e of alive) { const u = F.units.get(e.uid); if (!u) continue; const pos = e.boss ? BOSS_POS : MINION_POS[Math.min(k++, MINION_POS.length - 1)]; u.x = placeUnit(u.el, pos); }
    return;
  }
  const L = ENEMY_LAYOUT[Math.max(1, Math.min(5, alive.length))];
  alive.forEach((e, i) => { const u = F.units.get(e.uid); if (!u) return; const pos = L[Math.min(i, L.length - 1)]; u.x = placeUnit(u.el, pos); });
}
function buildSkillbar() {
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

function banner(text, sub, bad) {
  const b = document.createElement('div'); b.className = 'banner' + (bad ? ' bad' : '');
  b.innerHTML = `<b>${esc(text)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}`;
  $('#arena').appendChild(b); setTimeout(() => b.remove(), 1850);
}
function pop(text, cls, x, bottom = 46) {
  const d = document.createElement('div'); d.className = 'dmg ' + cls; d.textContent = text;
  d.style.left = (x + (Math.random() * 6 - 3)) + '%'; d.style.bottom = (bottom + Math.random() * 6) + '%';
  $('#fxl').appendChild(d); setTimeout(() => d.remove(), 1000);
}
const cls = (u, c, ms) => { u.spr.classList.remove(c); void u.spr.offsetWidth; u.spr.classList.add(c); setTimeout(() => u.spr.classList.remove(c), ms); };
// Wejście bossa jak w kinie: czarne pasy, plansza z imieniem i tytułem, tekst Kronikarza. Walka stoi (tylko obraz, zegar nie liczy).
function bossIntro(boss) {
  const F = G.fight, I = bossIntroOf(boss.boss), [nm, ...rest] = I.title.split(', ');
  const el = document.createElement('div'); el.className = 'cine'; el.setAttribute('role', 'status');
  el.innerHTML = `<i class="bar t"></i><i class="bar b"></i><div class="plate"><small>${F.setup.extra ? 'DODATKOWY BOSS' : 'BOSS'} · PIĘTRO ${F.setup.round}</small><h3>${esc(nm)}</h3>${rest.length ? `<em>${esc(rest.join(', '))}</em>` : ''}<p>„${esc(I.quote)}”</p></div>`;
  F.arena.appendChild(el); F.stopUntil = performance.now() + 2300;
  setTimeout(() => el.classList.add('out'), 2000); setTimeout(() => el.remove(), 2500);
}
// Gruszka na starcie walki wyśmiewa build gracza (dymek nad bossem, po wstępie).
function gruszkaSay(boss) {
  const F = G.fight, fb = F.f.enemies.find(e => e.boss), u = fb && F.units.get(fb.uid); if (!u) return;
  const txt = T.gruszkaTaunt({ ...G.run, hp: F.setup.hero.hp });
  setTimeout(() => { if (G.fight !== F) return; const b = document.createElement('div'); b.className = 'saybub'; b.textContent = '„' + txt + '”'; u.el.appendChild(b); setTimeout(() => b.classList.add('out'), 3600); setTimeout(() => b.remove(), 4100); }, 2300);
}
// Zamach skrzydłem bohatera (łuk przed dziobem) i pióra wylatujące z pokonanego wroga.
function swoosh(u) {
  if (REDUCED.matches) return;
  const w = document.createElement('div'); w.className = 'swoosh'; w.setAttribute('aria-hidden', 'true'); u.el.appendChild(w); setTimeout(() => w.remove(), 300);
}
function feathers(u) {
  if (REDUCED.matches) return;
  const w = document.createElement('div'); w.className = 'feathers'; w.setAttribute('aria-hidden', 'true');
  w.innerHTML = [[-60, -70, -40], [-20, -95, 20], [30, -85, 60], [65, -55, 110], [-75, -20, -90], [10, -110, 150]].map(([x, y, r], i) => `<i style="--x:${x}px;--y:${y}px;--r:${r}deg;animation-delay:${i * 30}ms"></i>`).join('');
  u.el.appendChild(w); setTimeout(() => w.remove(), 900);
}
// Mini-wybuch Reakcji na wrogu: Szok = kłąb pary, Gorączka = zielony puls, Kruchość = pęknięcie lodu.
function burst(u, kind) {
  const b = document.createElement('div'); b.className = 'rburst rb-' + kind; b.setAttribute('aria-hidden', 'true');
  b.innerHTML = kind === 'kruchosc' ? art.crackArt() : '<i></i><i></i><i></i><i></i><i></i>';
  u.el.appendChild(b); setTimeout(() => b.remove(), 900);
}
function shake() { const a = $('#arena'); if (!a) return; a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); }
// wysokość środka sylwetki w % sceny (tam pokazujemy liczby obrażeń)
const ub = u => { const a = G.fight.arena.getBoundingClientRect(), r = u.spr.getBoundingClientRect(); return Math.max(8, Math.min(92, (a.bottom - r.top - r.height * .55) / a.height * 100)); };
// kontekst animacji umiejętności (fx.js): punkty liczone z położenia sylwetek na scenie
function fxBase(extra = {}) {
  const F = G.fight, ar = F.arena, a = ar.getBoundingClientRect(), H = ar.clientHeight, W = ar.clientWidth, U = H / 100;
  const c = { ar, L: F.L, F, W, H, U, u: n => n * U, hero: F.units.get('hero'), shake, mut: 0, ev: [], hits: [], arcs: [], dur: 3000,
    pt: (u, fx = .5, fy = .5) => { const r = u.spr.getBoundingClientRect(); return { x: r.left - a.left + r.width * fx, y: r.top - a.top + r.height * fy }; },
    targets: [...F.units.values()].filter(u => u.e && !u.el.classList.contains('dead')), byUid: k => F.units.get(k), ...extra };
  c.main = c.hits[0] || c.targets[0] || null;
  return c;
}
const durOf = (id, f) => {
  const ms = x => Math.max(700, (x - f.tick) * 100);
  switch (id) {
    case 'unik': return ms(f.invulnUntil); case 'kontra': return ms(f.kontraUntil); case 'dziobniecie': return ms(f.hasteUntil); case 'podpalka': return ms(f.igniteUntil);
    case 'garsc': return ms(f.dmgUntil); case 'tarcza': return ms(f.hshieldUntil); case 'zemsta': return ms(f.thornFireUntil); case 'pobudka': return ms(f.buffUntil); case 'zupa': return ms(f.soupUntil);
    case 'wypowiedzenie': { const t = f.enemies.find(x => x.mark); return t ? ms(t.mark.at) : 4000; }
    default: return 3000;
  }
};
function skillFx(e, ev) {
  if (REDUCED.matches) return;
  const F = G.fight, f = F.f, tu = k => F.units.get(k); ev = ev || f.ev;
  const hits = ev.filter(x => x.k === 'hit' && x.kind === e.id).map(x => tu(x.to)).filter(Boolean);
  const mt = ev.find(x => x.k === 'meeting');
  const c = fxBase({ mut: e.mut, ev, hits, arcs: ev.filter(x => x.k === 'arc').map(x => tu(x.to)).filter(Boolean), strong: mt ? tu(mt.uid) : null, dur: durOf(e.id, f) });
  const r = castFx(e.id, c);
  F.fxDelay = r ? { kind: e.id, base: r.base || 0, step: r.step || 0, byX: r.byX || 0, n: 0 } : null;
}

function onEvent(e) {
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

function updateUI(first) {
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

function frame(ts) {
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
function stepOnce() {
  const F = G.fight, ins = F.queue.splice(0);
  for (const s of ins) F.inputs.push([F.f.tick, s]);
  F.f.step(ins);
  for (const e of F.f.ev) onEvent(e);
  updateUI();
}
function useSkill(slot) {
  const F = G.fight; if (!F || F.f.over || F.paused || F.finishing || !F.f.skills[slot]) return;
  if (F.queue.length < 6) F.queue.push(slot);
}
function stopFight() { const F = G.fight; if (F) { cancelAnimationFrame(F.raf); } const l = $('#fightlayer'); if (l) l.remove(); }

async function finishFight() {
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
  if (res.win !== local.win) toast('Serwer rozliczył walkę inaczej niż Twoja przeglądarka. Obowiązuje wynik serwera.', true, 5000);
  if (G.run.phase === 'over') { G.screen = 'run'; return showEnd(j); }
  G.screen = 'run'; if (F.setup.extra) { render(); fightToasts(j); return; }
  INV.pending = invoiceOn() ? F.setup.round : 0; render(); showInvoice(j, F.setup.round); fightToasts(j);
}
// Komunikaty po walce: Arena, ewolucja towarzysza, Prezes pokonany.
function fightToasts(j) {
  if (j.extra && j.extra.won) { snd.sfx('unlock'); toast(`${D.BOSSES[j.extra.id].name} pokonany! +${D.RULES.extraCoins} Ziaren i łup.`, false, 4200); }
  if (j.extraOffer) toast('Dodatkowa runda: ' + D.BOSSES[j.extraOffer].name + '. Możesz walczyć albo odpuścić.', false, 4200);
  if (j.arena) toast(j.arena.won ? 'Duch pokonany: ' + j.arena.nick + '! Bonus czeka.' : 'Duch ' + j.arena.nick + ' okazał się silniejszy.', !j.arena.won, 4200);
  if (j.compUp && G.run.companion) toast('Towarzysz ewoluuje: ' + compForm(G.run.companion) + '!', false, 4200);
  if (j.victory) { snd.sfx('unlock'); toast('Prezes pokonany! Wygrana zaliczona: kończysz albo grasz dalej w Dogrywce.', false, 6000); }
}
function retryOverlay() {
  return new Promise(res => { G.retryCb = res; openOverlay('<h2>Brak połączenia</h2><p class="lead">Nie udało się rozliczyć walki z serwerem. Twój run jest bezpieczny, spróbuj ponownie.</p><div class="actions"><button class="btn primary" data-act="retry-fight" data-primary>Spróbuj jeszcze raz</button></div>', { narrow: true, force: true }); });
}

// ---------- faktura i Tablica Zarządu ----------
// Po wygranej walce faktura Korporacji Rosołowej spada na ekran, młotek przybija ją gwoździem, po czym leci na Tablicę Zarządu
// (korek na dole środkowej kolumny) i zostaje tam jako karteczka do końca runu. Klik w karteczkę otwiera fakturę.
// Faktura nie blokuje gry (klik i klawisze przechodzą przez nią), a pierwsza akcja gracza skraca animację. Opcja w ustawieniach.
const invoiceOn = () => store.get('bulgot:invoice') !== '0';
const INV = { el: null, ham: null, t0: 0, timers: [], floor: 0, pending: 0 };
const COIN = '¤';                                   // w zapisanych pozycjach znacznik ikony Ziarna
const coinHTML = s => String(s).replace(/¤/g, art.coinIcon());
const boardKey = id => 'bulgot:inv:' + id;
// Pełne dane faktur trzymamy w przeglądarce (klucz: id runu, ostatnie 3 runy); serwer w view().board oddaje tylko liczby, z których
// da się odtworzyć uproszczoną fakturę (po odświeżeniu strony albo na innym komputerze).
function boardCache() { try { return JSON.parse(store.get(boardKey(G.run.id)) || '{}'); } catch (e) { return {}; } }
function boardPut(f, d) {
  const c = boardCache(); c[f] = d; store.set(boardKey(G.run.id), JSON.stringify(c));
  let ids = []; try { ids = JSON.parse(store.get('bulgot:invruns') || '[]'); } catch (e) {}
  if (!ids.includes(G.run.id)) { ids.push(G.run.id); while (ids.length > 3) { try { localStorage.removeItem(boardKey(ids.shift())); } catch (e) {} } store.set('bulgot:invruns', JSON.stringify(ids)); }
}
const secStr = ticks => (ticks / 10).toFixed(1).replace('.', ',');
function slipData(f) {
  const c = boardCache()[f]; if (c) return c;
  const e = ((G.run && G.run.board) || []).find(x => x.r === f); if (!e) return null;
  const I = T.INVOICE;
  return { f, boss: e.boss, who: D.CHARS[G.run.char].name, zone: T.ZONE_NAMES[D.MODES[G.run.mode] ? Math.min(2, Math.floor((f - 1) * 3 / D.MODES[G.run.mode].rounds)) : 0], imp: false, seen: true, notes: [],
    rows: [[`${e.boss ? 'Pokonanie bossa' : 'Pokonanie piętra ' + f} (czas walki ${secStr(e.ticks)} s)`, e.boss ? 'boss' : 'zaliczone'], ['Zadane obrażenia', fmtNum(e.dealt)], ['Wypłata (razem z odsetkami)', `+${e.reward} ${COIN}`]],
    line: e.boss ? '' : T.pickLine(T.WIN_LINES, f), foot: T.pickLine(e.boss ? I.bossFooters : I.footers, f), stamp: e.boss ? I.bossStamp : I.stamp };
}
// Treść faktury (do animacji i do okna po kliknięciu karteczki).
function invoiceInner(d) {
  const I = T.INVOICE;
  return `<div class="inv-head"><b>${esc(I.company)}</b><span>${esc(I.nip)}</span></div>
    <div class="inv-title"><b>${d.boss ? I.bossTitle : I.title}</b><span>nr BG/${esc(String(G.run.id).slice(-4))}/${String(d.f).padStart(2, '0')}</span></div>
    <div class="inv-who">Nabywca: <b>${esc(d.who)}</b>, ${esc(d.zone)}</div>
    <div class="inv-rows">${d.rows.map(([a, b], i) => `<div class="inv-row" style="--d:${i}"><span>${esc(a)}</span><b>${coinHTML(esc(b))}</b></div>`).join('')}</div>
    ${d.notes.length ? `<div class="inv-notes">${d.notes.map(n => `<div class="${n.imp ? 'imp' : ''}">${esc(n.text)}</div>`).join('')}</div>` : ''}
    <div class="inv-foot">${esc(d.line)}${d.line ? '<br>' : ''}<i>${esc(d.foot)}</i></div>
    <div class="inv-stamp ${d.boss ? 'boss' : ''}" aria-hidden="true">${esc(d.stamp).replace('\n', '<br>')}</div>`;
}
// Wiersze i uwagi faktury po wygranej walce: ważne uwagi (Nemezis, wada, odblokowania) zapalają na karteczce czerwony wykrzyknik.
function invoiceData(j, floor) {
  const r = j.result || {}, run = G.run, boss = j.boss, un = takeUnlocks(), I = T.INVOICE, f = floor || run.round;
  const base = j.reward - (j.interest || 0) - (j.doorCoins || 0), rows = [];
  rows.push([`${boss ? 'Pokonanie bossa' : 'Pokonanie piętra ' + f} (czas walki ${secStr(r.ticks)} s)`, boss ? 'boss' : 'zaliczone']);
  rows.push(['Zadane obrażenia', fmtNum(r.dealt)]);
  rows.push(['Wypłata za piętro', `+${base} ${COIN}`]);
  if (j.interest) rows.push(['Odsetki w Spiżarni', `+${j.interest} ${COIN}`]);
  if (j.doorCoins) rows.push(['Premia za ryzykowne drzwi', `+${j.doorCoins} ${COIN}`]);
  rows.push(['Leczenie (życie po leczeniu)', `${run.hp}/${run.maxHp}`]);
  const notes = [];   // { text, imp }
  if (j.nemesis) notes.push({ text: `Sprawiedliwości stało się zadość! Nemezis pokonany: Odznaka Sprawiedliwość Kurnika${j.nemesis.tile ? ' i odzyskany kafelek ' + TILE[j.nemesis.tile].name : ''}.`, imp: true });
  for (const w of (j.revealed || [])) notes.push({ text: `Wada ujawniona: ${TILE[w.id].name}, ${D.FLAWS[w.flaw].name}. ${D.FLAWS[w.flaw].text}`, imp: true });
  for (const u of un) notes.push({ text: `Odblokowano ${u.kind === 'char' ? 'postać' : 'kafelek'}: ${unlockName(u)}. ${u.text}`, imp: true });
  if (r.stolen) notes.push({ text: `Złodzieje ukradli ci ${r.stolen} Ziaren.` });
  if (r.usedRevive) notes.push({ text: 'Gniazdo Zapasowe zostało zużyte.' });
  if (r.chains) notes.push({ text: `Pełne Kurze Serie: ${r.chains}` });
  if (r.reactions) notes.push({ text: `Reakcje: ${r.reactions} (${(r.reactSeen || []).map(k => D.REACTIONS[k] ? D.REACTIONS[k].name : k).join(', ')})` });
  if (j.grew && j.grew.length) notes.push({ text: 'Urosło: ' + j.grew.map(id => TILE[id].name + ' (' + Math.min(TILE[id].grow.max, (run.grow || {})[id] || 0) + '/' + TILE[id].grow.max + ')').join(', ') });
  return { f, boss: !!boss, who: D.CHARS[run.char].name, zone: T.ZONE_NAMES[run.zone], rows, notes, imp: notes.some(n => n.imp), seen: false,
    line: boss ? (T.BOSS_WIN_LINES[boss] || 'Boss padł, a wynik rośnie.') : T.pickLine(T.WIN_LINES, run.round), foot: T.pickLine(boss ? I.bossFooters : I.footers, run.round), stamp: boss ? I.bossStamp : I.stamp };
}

// ---------- Tablica Zarządu (korek z przybitymi fakturami za pokonane piętra, do końca runu) ----------
function boardHTML() {
  const r = G.run; if (!r) return '';
  const list = (r.board || []).slice().sort((a, b) => a.r - b.r);
  const slips = list.map(e => {
    const d = slipData(e.r) || {}, flag = d.imp && !d.seen, pend = INV.pending === e.r, pop = G.boardPop === e.r;
    const tip = `Piętro ${e.r}${e.boss ? ' (boss)' : ''}: faktura\nCzas walki ${secStr(e.ticks)} s, obrażenia ${fmtNum(e.dealt)}, wypłata +${e.reward} Ziaren${flag ? '\nZawiera ważną uwagę, otwórz ją!' : ''}\nKliknij, żeby otworzyć.`;
    return `<button class="slip ${e.boss ? 'boss' : ''} ${flag ? 'flag' : ''} ${pend ? 'pending' : ''} ${pop ? 'pop' : ''}" data-act="slip" data-f="${e.r}" data-tip="${esc(tip)}" style="--rot:${e.r * 37 % 9 - 4}deg;--dy:${e.r * 53 % 7 - 3}px" aria-label="Faktura za piętro ${e.r}"><i class="pin"></i><small>${e.boss ? "NOTA" : "FAKTURA"}</small><b>${e.r}</b><span class="sl"></span><span class="sl s2"></span><span class="sl"></span><u>+${e.reward}</u>${flag ? '<em>!</em>' : ''}</button>`;
  }).join('');
  G.boardPop = 0;
  return `<section class="board" aria-label="Tablica Zarządu">
    <div class="slips">${slips || '<span class="board-empty">Tu zawisną faktury za pokonane piętra</span>'}</div><div class="board-side"><span class="board-title">Tablica Zarządu</span><span class="board-count">i faktury${list.length ? `<b>${list.length}</b>` : ""}</span></div></section>`;
}
const refreshBoard = () => { const b = $('.board'); if (b) { b.outerHTML = boardHTML(); fitBoard(); } };
// Faktury na Tablicy nakładają się tak, żeby zawsze mieściły się w szerokości (bez przewijania poziomego).
function fitBoard() { const s = $('.slips'); if (!s) return; const k = s.querySelectorAll(".slip"), w = 70, W = s.getBoundingClientRect().width / uiScale() - 12; if (k.length < 2 || W <= 0) return; const step = Math.min(w - 8, Math.max(12, (W - w) / (k.length - 1))); s.style.setProperty('--ov', (w - step).toFixed(1) + 'px'); }
addEventListener('resize', () => fitBoard());
function showSlip(f) {
  const d = slipData(f); if (!d) return;
  if (d.imp && !d.seen) {
    d.seen = true; if (boardCache()[f]) boardPut(f, d);
    const s = $(`.slip[data-f="${f}"]`); if (s) { s.classList.remove('flag'); const em = $('em', s); if (em) em.remove(); }
  }
  openOverlay(`<div class="inv static ${d.boss ? 'boss' : ''}">${invoiceInner(d)}</div><div class="actions" style="margin-top:14px"><button class="btn primary" data-act="close" data-primary>Zamknij</button></div>`, { narrow: true });
}
// Karteczka ląduje na tablicy: iskra przy pinezce i lekkie drgnięcie korka.
function landSlip(floor) {
  if (INV.pending === floor) INV.pending = 0;
  const s = $(`.slip[data-f="${floor}"]`);
  if (!s) return;
  s.classList.remove('pending'); s.classList.add('land'); snd.sfx('tink');
  const b = $('.board'); if (b && !REDUCED.matches) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
}
const uiScale = () => +getComputedStyle(document.documentElement).getPropertyValue('--s') || 1;
// Faktura leci na swoje miejsce na tablicy (fast = gracz nie chciał czekać).
function flyToBoard(fast) {
  const el = INV.el, ham = INV.ham, floor = INV.floor; if (!el) return;
  INV.timers.forEach(clearTimeout); INV.timers = []; INV.el = null; INV.ham = null;
  if (ham) { ham.classList.add('away'); setTimeout(() => ham.remove(), 260); }
  const nail = $('.inv-nail', el); if (nail) { nail.classList.add('on'); nail.style.setProperty('--sink', '34px'); }
  const done = () => { el.remove(); landSlip(floor); };
  const slip = $(`.slip[data-f="${floor}"]`);
  if (!el.isConnected) return done();
  if (!slip || REDUCED.matches) { el.classList.add('quick'); setTimeout(done, 260); return; }
  const sc = uiScale(), r = el.getBoundingClientRect(), s = slip.getBoundingClientRect(), k = s.width / r.width;
  const rot = getComputedStyle(slip).getPropertyValue('--rot').trim() || '0deg';
  const dx = s.left + s.width / 2 - (r.left + r.width / 2), dy = s.top + s.height / 2 - (r.top + r.height * k / 2);   // skalowanie wokół górnej krawędzi
  el.style.animation = 'none'; el.style.transform = 'translateY(0) rotate(-1.2deg)';
  const an = el.animate([{ transform: 'translateY(0) rotate(-1.2deg)', opacity: 1 }, { transform: `translate(${dx / sc}px, ${dy / sc}px) scale(${k}) rotate(${rot})`, opacity: .96 }],
    { duration: fast ? 380 : 650, easing: 'cubic-bezier(.55, 0, .35, 1)', fill: 'forwards' });
  an.onfinish = done;
}
const dismissInvoice = fast => { if (INV.el) flyToBoard(fast); };
// Jedno uderzenie młotka: ustawia młotek nad główką gwoździa, po chwili gwóźdź zagłębia się w papier, a kartka drga.
function strike(n) {
  const el = INV.el, ham = INV.ham; if (!el || !ham) return;
  const nail = $('.inv-nail', el), nr = nail.getBoundingClientRect(), sc = uiScale();
  // punkt uderzenia młotka (po obrocie o -35°) leży 69,7 w lewo i 36,6 w górę od końca rączki
  ham.style.left = (nr.left + nr.width / 2 + 69.7 * sc - 60) + 'px'; ham.style.top = (nr.top + 3 * sc + 36.6 * sc - 112) + 'px';
  ham.classList.add('on'); ham.classList.remove('hit'); void ham.offsetWidth; ham.classList.add('hit');
  INV.timers.push(setTimeout(() => {
    if (!INV.el) return;
    nail.style.setProperty('--sink', [11, 22, 34][n - 1] + 'px'); snd.sfx(n < 3 ? 'hit' : 'crit');
    el.animate([{ translate: '-50% 0' }, { translate: '-50% 4px' }, { translate: '-50% 0' }], { duration: 130 });
  }, 170));
}
function showInvoice(j, floor) {
  const run = G.run, d = invoiceData(j, floor);
  dismissInvoice(true);
  boardPut(d.f, d);
  if (!invoiceOn()) {   // bez animacji: karteczka po prostu pojawia się na tablicy, ważne uwagi jako powiadomienia
    INV.pending = 0; G.boardPop = d.f; refreshBoard();
    toast(`${d.boss ? 'Boss pokonany' : 'Piętro ' + d.f + ' zdobyte'}: +${j.reward} Ziaren`);
    for (const n of d.notes.filter(x => x.imp)) toast(n.text, false, 6000);
    return;
  }
  refreshBoard();                                    // karteczka jest już na tablicy, ale ukryta (pending), dopóki faktura do niej nie doleci
  const el = document.createElement('div');
  el.className = 'inv' + (d.boss ? ' boss' : ''); el.setAttribute('role', 'status');
  el.innerHTML = invoiceInner(d) + `<div class="inv-nail">${art.nailArt()}</div>`;
  const ham = document.createElement('div'); ham.className = 'inv-hammer'; ham.innerHTML = art.hammerArt(); ham.setAttribute('aria-hidden', 'true');
  $('#invoice').append(el, ham);
  for (const n of d.notes.filter(x => x.imp)) toast(n.text, false, 6500);   // ważne uwagi jako powiadomienie (faktura z boku jest zwięzła)
  // położenie: nad środkową kolumną (nie zasłania schodów po lewej ani panelu po prawej)
  const st = $('.stage'), rc = st && st.getBoundingClientRect();
  if (rc && rc.width > 0) { const iw = 270; el.style.width = iw + 'px'; el.style.left = (rc.left + 8 + iw * uiScale() / 2) + 'px'; el.style.top = Math.max(10, rc.top + 2) + 'px'; el.style.maxWidth = 'none'; }
  INV.el = el; INV.ham = ham; INV.floor = d.f; INV.t0 = performance.now();
  const later = (ms, fn) => INV.timers.push(setTimeout(fn, ms)), hold = 1500;
  if (REDUCED.matches) { $('.inv-nail', el).style.setProperty('--sink', '34px'); $('.inv-nail', el).classList.add('on'); ham.remove(); INV.ham = null; later(3200, () => flyToBoard(false)); return; }
  later(760, () => $('.inv-nail', el).classList.add('on'));
  [1000, 1280, 1560].forEach((ms, i) => later(ms, () => strike(i + 1)));
  later(1900, () => ham.classList.add('away'));
  later(1950 + hold, () => flyToBoard(false));
}
// Pierwsza akcja gracza (klik, klawisz) skraca animację i wysyła fakturę na tablicę, ale dopiero po chwili, żeby nie zniknęła przypadkiem.
for (const ev of ['pointerdown', 'keydown']) document.addEventListener(ev, () => { if (INV.el && performance.now() - INV.t0 > 700) dismissInvoice(true); }, true);
function takeAch() { const a = G.ach || []; G.ach = []; return a; }
function achHTML(list) {
  if (!list.length) return '';
  return `<div class="ach-new"><div class="sec">Nowe osiągnięcia</div>${list.map(a => `<div class="ach-row got">${art.medal(a.g, a.s)}<div><b>${esc(a.name)}</b><span>${esc(a.text)}</span></div></div>`).join('')}</div>`;
}
function takeUnlocks() { const u = G.unlocks; G.unlocks = []; return u; }
function unlocksHTML(list) {
  if (!list.length) return '';
  return list.map(u => `<div class="unlock-box"><b>Odblokowano ${u.kind === 'char' ? 'postać' : 'kafelek'}: ${esc(unlockName(u))}</b><div class="hint" style="text-align:left">${esc(u.text)}</div></div>`).join('');
}

// Po przegranej: kto awansował (Nemezis) i Testament Pyrtka (wybór kafelka do następnego runu).
function endMeta(j) {
  const r = G.run, p = G.profile, out = [];
  if (r.ended !== 'lose') return '';
  if (j.result && p.nemesis) { const n = p.nemesis, t = n.tile && TILE[n.tile]; out.push(`<div class="unlock-box nembox"><b>Awans Wroga: ${esc(n.name)}${n.lvl > 1 ? ' (awans ' + n.lvl + '.)' : ''}</b><div class="hint" style="text-align:left">${n.lvl > 1 ? 'Znowu wygrał i awansował wyżej.' : 'Twój zabójca dostał awans i cechę ' + esc(D.AFFIXES[n.affix].name) + '.'}${t ? ' Ukradł ci: ' + esc(t.name) + '.' : ''} Czeka na ciebie w następnym runie.</div></div>`); }
  if (r.willOptions && r.willOptions.length) {
    out.push(`<div class="sec">Testament Pyrtka</div><p class="lead">Zapisz jeden kafelek następnemu kurczakowi. Pojawi się jako piąta karta pierwszej oferty${p.chars.length > 1 ? ' w runie inną postacią' : ''}.</p>
      <div class="cards will-grid">${r.willOptions.map((id, i) => `<div class="slotcard">${tileCard(id, { i, static: true, mini: true })}<button class="btn small buy" data-act="will" data-i="${i}">Zapisz</button></div>`).join('')}</div>
      <div class="actions"><button class="btn small ghost" data-act="will" data-i="-1">Bez testamentu</button></div>`);
  } else if (p.will && j.will) out.push(`<div class="unlock-box"><b>Testament spisany: ${esc(TILE[p.will.tile].name)}</b><div class="hint" style="text-align:left">Czeka w pierwszej ofercie następnego runu.</div></div>`);
  return out.join('');
}
// Wynik na ekranie końca nabija się od zera (licznik jak w automacie); bez animacji przy prefers-reduced-motion.
function countUp(el, quiet) {
  if (!el || quiet || REDUCED.matches) return;
  const to = +el.dataset.v, t0 = performance.now(), dur = Math.min(2600, 900 + to / 20);
  const step = now => { if (!el.isConnected) return; const q = Math.min(1, (now - t0) / dur); el.textContent = fmtNum(Math.round(to * (1 - Math.pow(1 - q, 3)))); if (q < 1) requestAnimationFrame(step); else el.classList.add('done'); };
  el.textContent = '0'; setTimeout(() => requestAnimationFrame(step), 700);
}
// „Wyślij do analizy”: kopia zakończonego runu (z dziennikiem rund) trafia na serwer, skąd ją odbiera autor gry do strojenia balansu.
const ANALYZE_TAGS = [['za-latwo', 'Za łatwo'], ['za-trudno', 'Za trudno'], ['nudne', 'Nudne'], ['blad', 'Błąd w grze'], ['niejasne', 'Niejasne zasady'], ['super', 'Super zabawa']];
const analyzeHTML = (id, sent) => sent
  ? '<div class="analyze-ok">✓ Wysłano do analizy. Dziękuję, to naprawdę pomaga w strojeniu gry!</div>'
  : `<div class="analyze-row"><button class="btn" data-act="analyze" data-id="${esc(id)}">Wyślij do analizy</button></div><div class="hint">Wyślemy przebieg tej gry (wybory, wrogów, statystyki), żeby zbadać balans. Bez danych osobowych.</div>`;
// Okno przed wysłaniem: pytanie o komentarz (co poszło za łatwo, źle itd.), który trafia do pliku partii razem z jej przebiegiem.
function showAnalyzeDialog(id, from) {
  G.ana = { id, from };
  openOverlay(`<h2>Wyślij do analizy</h2>
    <p class="lead">Chcesz dodać komentarz? Napisz, co poszło za łatwo, za trudno albo źle. Trafi do pliku razem z przebiegiem tej gry.</p>
    <div class="atags">${ANALYZE_TAGS.map(([v, n]) => `<button class="atag" data-act="atag" data-v="${v}" aria-pressed="false">${n}</button>`).join('')}</div>
    <textarea id="anote" class="anote" rows="4" maxlength="300" placeholder="Twój komentarz (opcjonalnie), np. „walki kończą się w 2 sekundy, bo trzy umiejętności zabijają wszystko”" aria-label="Komentarz do analizy"></textarea>
    <div class="actions" style="margin-top:14px"><button class="btn primary" data-act="asend" data-primary>Wyślij</button><button class="btn" data-act="asend0">Wyślij bez komentarza</button><button class="btn ghost" data-act="acancel">Wróć</button></div>`, { narrow: true, force: true });
  const t = $('#anote'); if (t) t.focus();
}
async function sendAnalysis(withNote) {
  const a = G.ana; if (!a) return;
  const note = withNote ? (($('#anote') || {}).value || '').trim() : '', tags = withNote ? [...document.querySelectorAll('.atag.on')].map(x => x.dataset.v) : [];
  const j = await act('analysis', { id: a.id, note, tags }); if (!j) return;
  (G.sentRuns || (G.sentRuns = {}))[a.id] = true; snd.sfx('unlock'); toast('Wysłano do analizy. Dziękuję!');
  backFromAnalyze();
}
function backFromAnalyze() { const f = G.ana && G.ana.from; if (f === 'hist') showHistory(); else if (G.lastEndJ) showEnd(G.lastEndJ, true); else closeOverlay(); }
// Kontekst ciekawostek na ekranie końca (przegrana: dane z ostatniej walki, wygrana: ogólne).
function endFacts(j, win) {
  const r = G.run, M = D.MODES[r.mode], res = j.result || (G.lastEndJ && G.lastEndJ.result) || null, seed = parseInt(String(r.id).slice(-6), 10) || 0;
  const e = G.lastEnd || {}, st = r.stats || {}, lastKind = store.get('bulgot:lastfact') || '';
  if (win) { store.set('bulgot:lastlose', 'null'); return winFacts({ mode: r.mode, garnek: r.garnek, seed, lastKind, floor: e.floor || null, flawless: st.flawless || 0, rerolls: st.rerolls || 0, coins: r.coins, maxHit: st.maxHit || 0 }); }
  const k = r.killer, kd = k && (D.ENEMIES[k.enemy] || D.BOSSES[k.enemy]);
  const boss = r.boss ? D.BOSSES[r.boss] : null;
  // seria porażek na tym samym piętrze (zapamiętana w przeglądarce, liczona raz na run)
  if (!G.streakOf || G.streakOf.id !== r.id) {
    let last = null; try { last = JSON.parse(store.get('bulgot:lastlose') || 'null'); } catch (e) {}
    const n = last && last.mode === r.mode && last.round === r.round && last.garnek === r.garnek ? last.count + 1 : 1;
    store.set('bulgot:lastlose', JSON.stringify({ mode: r.mode, round: r.round, garnek: r.garnek, count: n })); G.streakOf = { id: r.id, n };
  }
  const streak = G.streakOf.n;
  const sets = Object.entries(D.SETS).map(([id, st]) => ({ id, name: st.name, n: setOwned(id) })).filter(x => x.n === 1);
  return failFacts({
    mode: r.mode, modeName: M.name, rounds: M.rounds, round: r.round, garnek: r.garnek, garnekName: D.GARNEK[r.garnek].name, seed,
    result: res, abandoned: !res && r.ended === 'lose', coins: r.coins, hasSkills: r.skills.length > 0, boss: !!boss, bossName: boss ? boss.name : '',
    killerName: kd ? kd.name : '', nemesis: !!(k && k.nemesis), setHint: sets.length ? sets[0].name : '', streak, runs: G.profile.counters.runs,
    lastKind, score: r.score, best: e.prevBest || 0, newBest: !!e.newBest, above: e.above || null, floor: e.floor || null,
    rerolls: st.rerolls || 0, buys: st.buys || 0, rested: !!r.rested, restCost: r.restCost, restPct: r.restPct,
    scoreRound: D.RULES.scoreRound, scoreCoin: D.RULES.scoreCoin, prices: D.RULES.prices,
  });
}
function showEnd(j, quiet = false) {
  const r = G.run, e = j.end || (G.lastEndJ && G.lastEndJ.end) || {}, win = r.ended === 'win', un = takeUnlocks();
  const mult = (100 + D.RULES.garnekScore * r.garnek) / 100;
  G.lastEnd = e; G.lastEndJ = j.result || !G.lastEndJ ? j : { ...j, result: G.lastEndJ.result };
  dismissInvoice(true);
  if (!quiet) { snd.sfx(win ? 'win' : 'lose'); if (!win) snd.sfx('bulgot'); }
  const lines = win ? T.END_WIN.lines : [T.pickLine(T.LOSE_LINES, r.done)];
  const feathers = win ? [8, 18, 27, 36, 45, 55, 63, 72, 81, 90].map((x, i) => `<i style="left:${x}%;--r:${(i * 67) % 360}deg;--dl:${(i * 0.17).toFixed(2)}s;--dx:${(i % 2 ? 1 : -1) * (10 + i * 3)}px"></i>`).join('') : '';
  const scene = `<div class="endscene ${win ? 'win' : 'lose'}" aria-hidden="true"><div class="es-steam"><i></i><i></i><i></i></div><div class="es-clip"><div class="es-hero">${art.portrait(r.char, r.form)}</div></div><div class="es-pot">${art.potArt(win)}</div>${win ? `<div class="es-confetti">${feathers}</div>` : ''}</div>`;
  // Ciekawostka jest losowana raz na run (ponowne otwarcie ekranu, np. po analizie, pokazuje tę samą); zapamiętujemy rodzaj, żeby się nie powtarzała z rzędu.
  if (!G.factsOf || G.factsOf.id !== r.id) { const f = pickFacts(endFacts(G.lastEndJ, win)); G.factsOf = { id: r.id, facts: f }; if (f[0]) store.set('bulgot:lastfact', f[0].kind); }
  const facts = G.factsOf.facts;
  // pełny ekran: po lewej scena, tytuł i ciekawostki; po prawej rachunek, rekordy, odblokowania i przyciski
  openOverlay(`<div class="endwrap ${win ? 'win' : 'lose'}"><div class="end-left">${scene}<h2 class="end-title ${win ? '' : 'lose'}">${win ? T.END_WIN.title : T.END_LOSE.title}</h2>
    ${lines.map(l => `<p class="lead">${esc(l)}</p>`).join('')}
    ${facts.length ? `<div class="facts">${facts.map((f, i) => `<div class="fact ${i ? 'second' : ''}" style="--i:${i}"><span class="fk">${i ? 'I jeszcze' : 'Ciekawostka'}</span>${esc(f.text)}</div>`).join('')}</div>` : ''}</div>
    <div class="end-right"><div class="end-scroll"><table class="scoretable"><tr><td>Ukończone piętra (${r.done} × ${D.RULES.scoreRound})</td><td>${fmtNum(r.done * D.RULES.scoreRound)}</td></tr>
      <tr><td>Ziarna w kieszeni (${r.coins} × ${D.RULES.scoreCoin})</td><td>${fmtNum(r.coins * D.RULES.scoreCoin)}</td></tr>
      <tr><td>Premia za szybkość walk</td><td>${fmtNum(r.timeBonus)}</td></tr>
      ${r.garnek ? `<tr><td>Mnożnik Garnka ${r.garnek} (${D.GARNEK[r.garnek].name})</td><td>×${mult.toFixed(2).replace('.', ',')}</td></tr>` : ''}
      ${r.curses && r.curses.length ? `<tr><td>Klątwy Prezesa (${r.curses.map(c => esc(D.CURSES[c].name)).join(', ')})</td><td>×${(1 + D.cursePct(r.curses) / 100).toFixed(2).replace('.', ',')}</td></tr>` : ''}
      ${r.endless ? `<tr><td>Dogrywka: piętra ponad limit (${Math.max(0, r.done - (r.cleared || 0))})</td><td>♾</td></tr>` : ''}
      <tr class="total"><td>Wynik</td><td id="endscore" data-v="${r.score}">${fmtNum(r.score)}</td></tr></table>
    ${e.newBest ? '<p class="lead" style="color:var(--gold)"><b>Nowy rekord życiowy w tym trybie!</b></p>' : ''}
    ${e.rank && !e.daily ? `<p class="lead">Miejsce w rankingu (${D.MODES[r.mode].name}): <b>#${e.rank}</b></p>` : ''}${endExtrasHTML(e)}
    ${e.feathers ? `<p class="lead">${art.emo('pioro')} Pióra do Kurnika: <b>+${e.feathers}</b> (razem ${G.profile.feathers | 0})</p>` : ''}${e.garnekUnlocked ? `<div class="unlock-box"><b>Odblokowano poziom palnika ${G.profile.garnek}: ${esc(BURNERS[G.profile.garnek])} (${esc(D.GARNEK[G.profile.garnek].name)})</b></div>` : ''}${unlocksHTML(un)}${achHTML(takeAch())}${endMeta(j)}
    <div class="analyze" id="analyzebox">${analyzeHTML(r.id, !!(G.sentRuns && G.sentRuns[r.id]))}</div></div>
    <div class="actions end-actions"><button class="btn primary big" data-act="again" data-primary>Zagraj jeszcze raz</button><button class="btn" data-act="ranking">Ranking</button><button class="btn ghost" data-act="home">Menu</button></div></div></div>`, { force: true, cls: 'endfull' });
  G.screen = 'home'; render();
  countUp($('#endscore'), quiet);
}

// ---------- okna: ranking, księga, pomoc, ustawienia, menu ----------
// Ranking: jeden ogólny (punkty) albo przefiltrowany po postaci, poziomie Garnka i graczu. Klik w nick, postać lub Garnek w tabeli ustawia filtr.
const RK = { mode: null, char: '', garnek: '', nick: '', deep: false };
async function showRanking(mode, keep) {
  mode = mode || G.setup.mode;
  if (!keep) Object.assign(RK, { char: '', garnek: '', nick: '', deep: false });
  RK.mode = mode;
  const chars = Object.values(D.CHARS).filter(c => !c.secret || G.profile.chars.includes(c.id));
  const maxG = Math.max(G.profile.garnek | 0, 0);
  const sel = (id, label, opts, val) => `<label class="rkf"><span>${label}</span><select id="${id}" >${opts.map(([v, n]) => `<option value="${esc(v)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>`;
  openOverlay(`<h2>Ranking</h2><div class="tabs">${['quick', 'full'].map(m => `<button class="tab ${m === mode && !RK.deep ? 'on' : ''}" data-act="ranktab" data-v="${m}">${D.MODES[m].name}</button>`).join('')}<button class="tab ${RK.deep ? 'on' : ''}" data-act="rkdeep" title="Ranking Dogrywki w trybie: ${esc(D.MODES[mode].name)}">♾ Dogrywka</button></div>
    <div class="rkbar">${sel('rk-char', 'Postać', [['', 'Wszystkie'], ...chars.map(c => [c.id, c.name])], RK.char)}${sel('rk-garnek', 'Poziom trudności', [['', 'Wszystkie'], ...D.GARNEK.map((g, i) => [i, 'Garnek ' + i + ' · ' + g.name]).slice(0, Math.max(maxG, +RK.garnek || 0) + 1)], RK.garnek)}
      <label class="rkf"><span>Gracz</span><input id="rk-nick" type="text" maxlength="16" placeholder="dowolny nick" value="${esc(RK.nick)}" autocomplete="off"></label>
      <button class="btn small" data-act="rkme" title="Pokaż tylko moje wyniki">Tylko ja</button><button class="btn small ghost" data-act="rkclear" ${RK.char || RK.garnek !== '' || RK.nick ? '' : 'disabled'}>Wyczyść filtry</button></div>
    <div id="rk" class="lead">Ładowanie…</div>`);
  if (RK.deep) { const rb = $('.rkbar'); if (rb) rb.remove(); }
  const q = new URLSearchParams(); if (RK.deep) q.set('kind', 'deep'); if (RK.char) q.set('char', RK.char); if (RK.garnek !== '') q.set('garnek', RK.garnek); if (RK.nick.trim()) q.set('nick', RK.nick.trim());
  const myMode = mode, { j } = await apiRanks(mode, q.toString());
  const box = $('#rk'); if (!box || RK.mode !== myMode) return;
  if (!j || !j.list) { box.textContent = (j && j.err) || 'Nie udało się pobrać rankingu.'; return; }
  const me = playerNow(), mynick = me ? me.nick : '', filtered = RK.char || RK.garnek !== '' || RK.nick.trim();
  if (!j.list.length) { box.textContent = filtered ? 'Brak wyników dla tych filtrów. Spróbuj szerzej.' : 'Nikt jeszcze nie wszedł na szczyt. Bądź pierwszy.'; return; }
  const myPos = j.list.findIndex(x => x.nick === mynick);
  const what = [RK.char ? (D.CHARS[RK.char] || {}).name : 'wszystkie postacie', RK.garnek !== '' ? 'Garnek ' + RK.garnek : 'wszystkie poziomy', RK.nick.trim() ? 'gracz: ' + RK.nick.trim() : 'wszyscy gracze'].join(' · ');
  const youLine = !mynick ? '' : RK.nick.trim() ? '' : myPos >= 0 ? `Twoje miejsce: <b>#${myPos + 1}</b> z ${j.total}${myPos > 0 ? `. Do #${myPos} brakuje ${fmtNum(j.list[myPos - 1].score - j.list[myPos].score)} pkt.` : '. Jesteś na szczycie tej listy!'}` : `Nie ma cię w pierwszej setce tej listy (${j.total} graczy).`;
  box.className = ''; box.innerHTML = `<div class="rkinfo"><span>${esc(what)}</span>${youLine ? `<span class="rkyou">${youLine}</span>` : ''}</div>
    <table class="rank-list"><thead><tr><th></th><th>Gracz</th><th>Postać</th><th>Garnek</th><th>Piętra</th><th style="text-align:right">Wynik</th></tr></thead><tbody>${j.list.map((x, i) => {
    const av = x.avatar && !LOCAL ? `<span class="av"><img src="${esc(avatarUrl(x.avatar))}" alt="" onerror="this.remove()"></span>` : `<span class="av">${esc((x.nick || '?')[0].toUpperCase())}</span>`;
    const cn = (D.CHARS[x.char] || {}).name || '';
    return `<tr class="${x.nick === mynick ? 'me' : ''} ${i < 3 ? 'top' + (i + 1) : ''}"><td class="pos">${i + 1}</td><td><button class="lnk" data-act="rknickset" data-v="${esc(x.nick)}" title="Pokaż wyniki tego gracza">${av}${esc(x.nick)}</button>${x.ttl && D.SHOP[x.ttl] ? ` <small class="ttl">${esc(D.SHOP[x.ttl].name)}</small>` : ''}${x.win ? ' ★' : ''}${x.deep ? ` <small class="deepn">♾ +${x.deep}</small>` : ''}</td><td><button class="lnk" data-act="rkcharset" data-v="${esc(x.char)}" title="Filtruj po tej postaci">${esc(cn)}</button></td><td><button class="lnk" data-act="rkgset" data-v="${x.garnek | 0}" title="Filtruj po tym poziomie">G${x.garnek | 0}</button></td><td>${x.rounds}</td><td class="sc">${fmtNum(x.score)}</td></tr>`;
  }).join('')}</tbody></table>`;
}
// Księga: nowe wpisy (odblokowane kafelki, przepisy, reakcje) od ostatniego otwarcia dostają naklejkę „Nowy wpis!”.
// Kurnik: meta-progres. Pióra za runy → trwałe, niewielkie ulepszenia (maks. 3 poziomy). Na dole Duch gracza z Areny.
function ghostBlock() {
  const g = G.myGhost || {}, rows = Object.keys(D.MODES).filter(m => g[m]).map(m => { const x = g[m], ch = D.CHARS[x.char]; return `<div class="kghost">${art.ghostArt(x.char, x.wear)}<div><b>${esc(D.MODES[m].name)}: ${esc(ch ? ch.name : '')}</b>, ${x.floors} pięter${x.win ? ' ★' : ''}<br><span>Pokonał ${x.wins} graczy, przegrał z ${x.losses}.</span></div></div>`; }).join('');
  return `<div class="sec">Twój Duch na Arenie</div>${rows || '<p class="hint">Zakończ run z co najmniej 3 piętrami, a twój build zostanie na Arenie Duchów i będzie bił innych graczy.</p>'}`;
}
function showKurnik() {
  const p = G.profile, ku = p.kurnik || {}, fe = p.feathers | 0;
  const cards = Object.entries(D.KURNIK).map(([id, b]) => {
    const lv = ku[id] | 0, max = lv >= D.KURNIK_MAX, cost = max ? 0 : b.cost[lv];
    return `<div class="kb ${max ? 'max' : ''}">${art.emo(b.icon)}<div class="kbn"><b>${esc(b.name)}</b><span class="kbl">${[0, 1, 2].map(i => `<i class="${i < lv ? 'on' : ''}"></i>`).join('')}</span></div><p>${esc(b.text)}</p>${max ? '<div class="kbm">Maksymalny poziom</div>' : `<button class="btn small ${fe >= cost ? 'primary' : ''}" data-act="kbuy" data-v="${id}" ${fe < cost ? 'disabled' : ''}>Ulepsz za ${cost} ${art.emo('pioro')}</button>`}</div>`;
  }).join('');
  openOverlay(`<h2>Kurnik</h2><p class="lead">Za każdy run dostajesz Pióra: piętra, premię za wygraną (z palnikiem) i za piętra Dogrywki. Wydaj je na trwałe, niewielkie ulepszenia dla wszystkich postaci.</p>
    <div class="kfeathers">${art.emo('pioro')} Pióra: <b>${fe}</b></div><div class="kgrid">${cards}</div>${ghostBlock()}<div class="actions" style="margin-top:12px"><button class="btn ghost" data-act="close">Zamknij</button></div>`, { cls: 'kurnikmodal' });
}
function showProfile() {
  const p = G.profile, c = p.completion || { pct: 0, parts: [] }, pl = playerNow(), have = new Set(p.ach || []);
  const parts = c.parts.map(x => `<div class="prof-part"><span>${esc(x.name)}</span><b>${x.done}/${x.total}</b><i style="--w:${Math.min(100, x.done / x.total * 100).toFixed(1)}%"></i></div>`).join('');
  const recent = (p.ach || []).slice(-6).reverse().map(id => D.ACH_BY_ID[id]).filter(Boolean).map(a => `<div class="ach-row got">${art.medal(a.g, a.s)}<div><b>${esc(a.name)}</b><span>${esc(a.text)}</span></div></div>`).join('');
  const cn = p.counters || {};
  openOverlay(`<h2>Profil: ${esc(pl ? pl.nick : '')}</h2><div class="prof-top"><div class="prof-ring" style="--p:${c.pct}"><b>${c.pct}%</b><small>ukończenia gry</small></div><div class="prof-stats"><div>Runy: <b>${cn.runs || 0}</b></div><div>Wygrane: <b>${cn.wins || 0}</b></div><div>Pokonani Nemezis: <b>${cn.nemesisKills || 0}</b></div><div>Osiągnięcia: <b>${have.size}/${D.ACHIEVEMENTS.length}</b></div><div>Najwyższy palnik: <b>${BURNERS[p.garnek || 0]}</b></div></div></div><div class="prof-parts">${parts}</div>${recent ? `<div class="sec">Ostatnie osiągnięcia</div><div class="ach-list">${recent}</div>` : ''}<div class="actions"><button class="btn primary" data-act="achbook">Wszystkie osiągnięcia</button></div>`, { narrow: true });
}
function bookSeen() { try { return new Set(JSON.parse(store.get('bulgot:bookseen') || '[]')); } catch (e) { return new Set(); } }
function bookMark(keys) { const s = bookSeen(); for (const k of keys) s.add(k); store.set('bulgot:bookseen', JSON.stringify([...s])); }
// Księga jako rozkładówka: treść płynie w dwóch kolumnach poziomo, strony przewija się ←/→ (bez przewijania w dół).
function bookFit() {
  const v = $('.bookview'), fl = $('.bookflow'); if (!v || !fl) return;
  const gap = parseFloat(getComputedStyle(fl).columnGap) || 28, W = v.clientWidth, pages = Math.max(1, Math.round((fl.scrollWidth + gap) / (W + gap)));
  G.bookPages = pages; G.bookPage = Math.max(0, Math.min(pages - 1, G.bookPage || 0));
  fl.style.transform = `translateX(${-(G.bookPage * (W + gap))}px)`;
  const no = $('.bookno'); if (no) no.textContent = 'Strona ' + (G.bookPage + 1) + ' z ' + pages;
  const pv = $('[data-act=bookprev]'), nx = $('[data-act=booknext]'); if (pv) pv.disabled = G.bookPage <= 0; if (nx) nx.disabled = G.bookPage >= pages - 1;
}
const bookGo = d => { G.bookPage = (G.bookPage || 0) + d; bookFit(); };
function showBook(tab = 'tiles', turn = false) {
  const seen = bookSeen(), fresh = k => !seen.has(k), marks = [];
  const p = G.profile, tabs = [['tiles', 'Kafelki'], ['hatch', 'Wylęgarnia'], ['react', 'Reakcje i Okólniki'], ['badges', 'Odznaki'], ['ach', 'Osiągnięcia'], ['soups', 'Rosoły'], ['chars', 'Postacie'], ['foes', 'Wrogowie'], ['unl', 'Odblokowania'], ['more', 'Klątwy, trasy, towarzysze']];
  let body = '';
  if (tab === 'react') {
    const known = p.reactions || []; for (const k of known) marks.push('x:' + k);
    body = `<p class="lead">Dwa różne efekty na jednym wrogu łączą się w reakcję. Odkryte: ${known.length} z ${Object.keys(D.REACTIONS).length}.</p><div class="ms-grid">${Object.values(D.REACTIONS).map(R => known.includes(R.id)
      ? `<div class="ms-row entry ${fresh('x:' + R.id) ? 'fresh' : ''}">${fresh('x:' + R.id) ? '<span class="newtag">Nowy wpis!</span>' : ''}${art.statusIcon(R.of[0])}${art.statusIcon(R.of[1])}<div><b>${esc(R.name)}</b><br><span>${esc(R.text)}</span></div></div>`
      : `<div class="ms-row unknown">${art.statusIcon(R.of[0])}${art.statusIcon(R.of[1])}<div><b>?</b><br><span>${esc(D.STATUS[R.of[0]].name)} + ${esc(D.STATUS[R.of[1]].name)}: jeszcze nie odkryto.</span></div></div>`).join('')}</div>
      <div class="sec">Okólniki Zarządu</div><p class="lead">Każda strefa w runie ma inny okólnik, który zmienia zasady.</p><div class="ms-grid">${Object.values(D.DECREES).map(d => `<div class="ms-row">${art.decreeIcon()}<div><b>${esc(d.name)}</b><br><span>${esc(d.text)}</span></div></div>`).join('')}</div>
      <div class="sec">Wady fabryczne</div><p class="lead">Kafelek z pieczątką „Wada fabryczna” jest o 50% mocniejszy, ale po następnej walce ujawnia jedną z wad:</p><div class="ms-grid">${Object.values(D.FLAWS).map(f => `<div class="ms-row"><div><b>${esc(f.name)}</b><br><span>${esc(f.text)}</span></div></div>`).join('')}</div>
      ${p.nemesis ? `<div class="sec">Twój Nemezis</div><p class="lead">${esc(p.nemesis.name)}, cecha ${esc(D.AFFIXES[p.nemesis.affix].name)}${p.nemesis.tile ? ', ukradł ' + esc(TILE[p.nemesis.tile].name) : ''}. Pokonane Nemezis: ${p.counters.nemesisKills || 0}.</p>` : ''}`;
  } else if (tab === 'more') {
    body = `<div class="sec">Klątwy Prezesa</div><p class="lead">Dobrowolne utrudnienia wybierane przed runem (do ${D.CURSE_MAX} naraz). Każda dodaje premię do końcowego wyniku.</p><div class="ms-grid">${Object.values(D.CURSES).map(c => `<div class="ms-row">${art.emo(c.icon)}<div><b>${esc(c.name)} (+${c.pct}%)</b><br><span>${esc(c.text)}</span></div></div>`).join('')}</div>
      <div class="sec">Trasy</div><p class="lead">Na początku strefy II i III wybierasz jedną z dwóch tras (losowanych z pięciu). Trasa działa do końca strefy.</p><div class="ms-grid">${Object.values(D.ROUTES).map(R => `<div class="ms-row">${art.emo(R.icon)}<div><b>${esc(R.name)}</b><br><span>${esc(R.text)}</span></div></div>`).join('')}</div>
      <div class="sec">Towarzysze</div><p class="lead">Schronisko dla Piskląt (wydarzenie) daje towarzysza. Rośnie do poziomu 3 po każdym pokonanym bossie.</p><div class="ms-grid">${Object.values(D.COMPANIONS).map(c => `<div class="ms-row">${art.companionArt(c.id)}<div><b>${esc(c.forms.join(' → '))}</b><br><span>${esc(c.text)}</span></div></div>`).join('')}</div>
      <div class="sec">Bossowie (warianty)</div><p class="lead">Każde miejsce bossa ma trzech kandydatów, losowanych z ziarna runu (oryginał trafia się najczęściej).</p><div class="ms-grid">${Object.values(D.BOSSES).filter(b => !b.super).map(b => `<div class="ms-row">${art.enemyArt(b.art, b.tint)}<div><b>${esc(b.name)}</b><br><span>${esc(b.text)}</span></div></div>`).join('')}</div>
      <div class="sec">Dogrywka i super-bossowie</div><p class="lead">Po Prezesie możesz zostać w fabryce. Wrogowie rosną szybciej, a co ${D.RULES.superEvery} pięter wpada super-boss.</p><div class="ms-grid">${Object.values(D.BOSSES).filter(b => b.super).map(b => `<div class="ms-row">${art.enemyArt(b.art, b.tint)}<div><b>${esc(b.name)}</b><br><span>${esc(b.text)}</span></div></div>`).join('')}</div>`;
  } else if (tab === 'soups') {
    body = soupsBook(p, fresh, marks);
  } else if (tab === 'ach') {
    const have = new Set(p.ach || []);
    body = `<p class="lead">Zdobyte: ${have.size} z ${D.ACHIEVEMENTS.length}.</p>` + Object.entries(D.ACH_GROUPS).map(([gid, g]) => `<div class="sec">${esc(g.name)}</div><div class="ach-list">${D.ACHIEVEMENTS.filter(a => a.g === gid).map(a => { const got = have.has(a.id), hide = a.secret && !got; return `<div class="ach-row ${got ? 'got' : 'lock'}">${art.medal(a.g, hide ? '?' : a.s, !got)}<div><b>${esc(hide ? '???' : a.name)}</b><span>${esc(hide ? 'Ukryte osiągnięcie.' : a.text)}</span></div></div>`; }).join('')}</div>`).join('');
  } else if (tab === 'badges') {
    body = `<p class="lead">Odznaki Pracownicze dostajesz za pokonanie bossa albo elitarnego wroga (wybór 1 z 3) i w Kapliczce. Działają do końca runu.</p><div class="ms-grid">${Object.entries(D.BADGES).map(([id, b]) => `<div class="ms-row">${art.badgeIcon(id)}<div><b>${esc(b.name)}</b><br><span>${esc(b.text)}</span></div></div>`).join('')}</div>
      <div class="sec">Cechy elitarnych wrogów</div><p class="lead">Elita ma jedną cechę (od Garnka 2: dwie). Na Garnku 0 podgląd piętra pokazuje je przed walką, wyżej dopiero walka.</p><div class="ms-grid">${Object.values(D.AFFIXES).map(a => `<div class="ms-row"><div><b>${esc(a.name)}</b><br><span>${esc(a.text)}</span></div></div>`).join('')}</div>`;
  } else if (tab === 'hatch') {
    const known = p.recipes || [];
    for (const k of known) marks.push('r:' + k);
    const rows = D.RECIPES.map(r => known.includes(r.out)
      ? `<div class="hatch-row entry ${fresh('r:' + r.out) ? 'fresh' : ''}">${fresh('r:' + r.out) ? '<span class="newtag">Nowy wpis!</span>' : ''}${r.of.map(c => tileCard(c, { static: true, mini: true })).join('<div class="hplus">+</div>')}<div class="hplus">=</div>${tileCard(r.out, { static: true, mini: true })}</div>`
      : '<div class="hatch-row unknown"><div class="qcard">?</div><div class="hplus">+</div><div class="qcard">?</div><div class="hplus">=</div><div class="qcard leg">?</div></div>').join('');
    const ms = Object.entries(D.MILESTONES).map(([id, m]) => `<div class="ms-row">${art.tileIcon(id)}<div><b>${D.MILESTONE_EVERY}× ${esc(TILE[id].name)} = ${esc(m.name)}</b><br><span>${esc(m.text)}</span></div></div>`).join('');
    body = `<p class="lead">Dwa pasujące przedmioty wykluwają legendarny. Odkryte przepisy: ${known.length} z ${D.RECIPES.length}. Na kartach w ofercie znacznik <b>Wylęgarnia!</b> mówi, że kafelek dokończy przepis.</p>${rows}
      <div class="sec">Progi statystyk</div><p class="lead">Każde ${D.MILESTONE_EVERY} kopie tej samej statystyki poziomu 3 (złota plakietka III) dają dodatkową premię.</p><div class="ms-grid">${ms}</div>`;
  } else if (tab === 'tiles') {
    const list = D.TILES.filter(t => !t.hatched && !t.hidden);
    body = `<p class="lead">Poznane: ${list.filter(t => t.boss ? (p.seen || []).includes(t.id) : (!t.lock || p.tiles.includes(t.id))).length} z ${list.length} kafelków. Statystyki mają cztery poziomy (plakietka I, II, III, ★): dwa takie same kafelki poziomu 1 lub 2 zlejesz za darmo w wyższy poziom, a legendarne (★) wypadają tylko z bossów.</p><div class="book-grid">${list.map((t, i) => {
      const open = t.boss ? (p.seen || []).includes(t.id) : (!t.lock || p.tiles.includes(t.id)), u = t.lock && D.UNLOCK_BY_ID[t.lock];
      const nw = open && t.lock && fresh('t:' + t.id); if (open && t.lock) marks.push('t:' + t.id);
      return `<div class="entry ${nw ? 'fresh' : ''}" style="--i:${i}">${tileCard(t.id, { static: true, mini: true, i, locked: !open, lockText: open ? '' : t.boss ? 'Łup z bossa: pokonaj bossa i wybierz go z trzech' : (u && u.text) })}${nw ? '<span class="newtag">Nowy wpis!</span>' : ''}</div>`;
    }).join('')}</div>`;
  } else if (tab === 'chars') {
    body = `<div class="opts">${Object.values(D.CHARS).map(c => { const open = p.chars.includes(c.id), u = c.lock && D.UNLOCK_BY_ID[c.lock], v = charView(c, open);
      return `<div class="opt char-opt ${open ? '' : 'locked'}">${v.hidden ? art.eggArt(c.id, false) : art.portrait(c.id)}<div><h3>${esc(v.name)}</h3><p>${esc(v.style)}. ${esc(v.text)}</p>${open ? '' : `<div class="lockmsg">Zablokowana: ${esc(v.hidden ? '???' : u ? u.text : '')}</div>`}</div></div>`; }).join('')}</div>
      <div class="sec">Formy kurczaka</div><div class="opts">${D.FORMS.map(f => `<div class="opt char-opt">${art.heroArt('pyrtek', f.id, { plain: true })}<div><h3>${f.name}</h3><p>Od ${Math.round(f.from * 100)}% runu.</p></div></div>`).join('')}</div>`;
  } else if (tab === 'foes') {
    const all = [...Object.values(D.ENEMIES), ...Object.values(D.BOSSES)];
    body = `<div class="opts">${all.map(d => `<div class="opt char-opt">${art.enemyArt(d.art)}<div><h3>${esc(d.name)}</h3><p>${d.title ? esc(d.title) + '. ' : ''}${esc(d.text)}</p><p style="color:var(--faint)">${d.zone != null && !d.minion ? 'Strefa ' + D.ZONES[d.zone].tag : d.minion ? 'Przywoływany przez bossa' : 'Boss'}</p></div></div>`).join('')}</div>`;
  } else {
    body = `<div class="help-list">${D.UNLOCKS.map(u => { const done = p.unlocked.includes(u.id), sec = u.secret && !done; return `<div><b>${done ? '✓' : '○'} ${esc(sec ? '???' : unlockName(u))}</b><p>${esc(sec ? '???' : u.text)}${done ? ' (zdobyte)' : ''}</p></div>`; }).join('')}</div>`;
  }
  // księga: okładka, zakładki-przekładki, strona z wklejanymi wpisami
  openOverlay(`<div class="bookpage${turn ? ' turn' : ''}"><h2>Księga Kurnika</h2><div class="bookview"><div class="bookflow">${body}</div></div><div class="bookpager"><button class="btn small ghost" data-act="bookprev" aria-label="Poprzednia strona">‹ Wstecz</button><span class="bookno"></span><button class="btn small ghost" data-act="booknext" aria-label="Następna strona">Dalej ›</button></div></div><div class="booktabs tabs">${tabs.map(([id, n], i) => `<button class="tab ${id === tab ? 'on' : ''}" data-act="booktab" data-v="${id}" style="--t:${i}">${n}</button>`).join('')}</div>`, { cls: 'bookmodal' });
  bookMark(marks);
  G.bookPage = 0; bookFit(); requestAnimationFrame(() => bookFit()); setTimeout(() => bookFit(), 250);
}
// TESTOWA historia gier: ostatnie 10 runów z dziennikiem rund. Przycisk pobiera plik JSON do analizy.
async function showHistory() {
  const j = await act('history'); if (!j) return;
  const all = j.history || [], last = all.slice(-10).reverse();
  G.hist = all.slice(-10);
  const when = t => new Date(t).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  const rows = last.map(h => {
    const lastLog = h.log && h.log[h.log.length - 1], killer = h.outcome === 'lose' && !h.abandoned && lastLog ? lastLog.enemies.map(e => e.n).join(', ') : '';
    const res = h.outcome === 'win' ? '<b style="color:var(--green)">WYGRANA</b>' : h.abandoned ? 'porzucony' : '<b style="color:#ff8a6a">porażka</b>';
    return `<tr><td>${when(h.ended)}</td><td>${esc(D.MODES[h.mode].name)}${h.garnek ? ' · G' + h.garnek : ''}</td><td>${esc((D.CHARS[h.char] || {}).name || h.char)}</td><td>${res}</td><td>${h.floorsDone}/${D.MODES[h.mode].rounds}</td><td class="sc">${fmtNum(h.score)}</td><td>${esc(killer)}</td><td>${h.sent ? '<span class="sent">✓ wysłano</span>' : `<button class="btn small" data-act="analyze" data-id="${esc(h.id)}">Wyślij</button>`}</td></tr>`;
  }).join('');
  openOverlay(`<h2>Historia gier (test)</h2><p class="lead">Ostatnie ${last.length} runów zapisuje się automatycznie, z dziennikiem każdej rundy. Po testach napisz, żeby ją przeanalizować.</p>
    ${rows ? `<table class="rank-list"><thead><tr><th>Kiedy</th><th>Tryb</th><th>Postać</th><th>Wynik</th><th>Piętra</th><th style="text-align:right">Punkty</th><th>Pokonał go</th><th>Analiza</th></tr></thead><tbody>${rows}</tbody></table>` : '<p class="lead">Brak zakończonych runów. Zagraj i wróć tutaj.</p>'}
    <div class="actions" style="margin-top:14px"><button class="btn primary" data-act="histdl" ${rows ? '' : 'disabled'}>Pobierz JSON (ostatnie 10)</button><button class="btn" data-act="histcopy" ${rows ? '' : 'disabled'}>Skopiuj JSON</button></div>`);
}
function showHelp() {
  openOverlay(`<h2>Jak grać</h2><p class="lead">${esc(T.INTRO.join(' '))}</p><div class="help-list">${T.HELP.map(([h, t]) => `<div><b>${h}</b><p>${esc(t)}</p></div>`).join('')}</div>`);
}
function showSettings() {
  openOverlay(`<h2>Dźwięk i walka</h2><div class="setrow"><span>Efekty dźwiękowe</span><button class="toggle ${snd.settings.sfx ? 'on' : ''}" data-act="tsfx">${snd.settings.sfx ? 'WŁ.' : 'WYŁ.'}</button></div>
    <div class="setrow"><span>Głośność</span><span class="volbox"><input type="range" id="set-vol" min="0" max="100" step="5" value="${snd.settings.vol}" aria-label="Głośność"><b id="set-vol-n">${snd.settings.vol}%</b></span></div>
    ${G.profile.casino && G.profile.casino.unlocked ? `<div class="setrow"><span>Tryb kasynowy (kręcące się walce przy przetasowaniu)</span><button class="toggle ${casinoOn() || (G.profile.casino && G.profile.casino.on) ? 'on' : ''}" data-act="tcasino">${G.profile.casino.on ? 'WŁ.' : 'WYŁ.'}</button></div>` : ''}
    <div class="setrow"><span>Muzyka (bulgocząca pętla)</span><button class="toggle ${snd.settings.music ? 'on' : ''}" data-act="tmusic">${snd.settings.music ? 'WŁ.' : 'WYŁ.'}</button></div>
    <div class="setrow"><span>Faktura po wygranej walce (zamiast okna wyniku)</span><button class="toggle ${invoiceOn() ? 'on' : ''}" data-act="tinv">${invoiceOn() ? 'WŁ.' : 'WYŁ.'}</button></div>
    <div class="setrow"><span>Animacje (wyłącz, jeśli ruch Ci przeszkadza)</span><button class="toggle ${animOn() ? 'on' : ''}" data-act="tanim">${animOn() ? 'WŁ.' : 'WYŁ.'}</button></div>
    <p class="hint">Wyciszenie dźwięku w lobby wycisza także tę grę.</p>`, { narrow: true });
}
function showMenu() {
  const r = G.run && G.run.phase !== 'over';
  openOverlay(`<h2>Menu</h2><div class="actions" style="flex-direction:column;align-items:stretch"><button class="btn" data-act="help">Jak grać</button><button class="btn" data-act="settings">Dźwięk i walka</button><button class="btn" data-act="book">Księga Kurnika</button><button class="btn" data-act="ranking">Ranking</button><button class="btn" data-act="history">Historia gier (test)</button><button class="btn primary" data-act="home">Wróć do menu głównego${r ? ' (run zapisany)' : ''}</button>${r ? '<button class="btn danger" data-act="abandon">Porzuć run</button>' : ''}</div>`, { narrow: true });
}
function showIntro(then) {
  store.set('bulgot:intro', '1');
  openOverlay(`<h2>Bulgot</h2>${T.INTRO.map(l => `<p class="lead" style="font-size:1.05rem">${esc(l)}</p>`).join('')}<div class="actions" style="margin-top:14px"><button class="btn primary big" data-act="introgo" data-primary>Zaczynamy</button></div>`, { narrow: true, force: true });
  G.introCb = then;
}
function confirmAbandon() {
  openOverlay('<h2>Porzucić run?</h2><p class="lead">Run zostanie zakończony jako porażka, a wynik trafi do rankingu, jeśli ukończyłeś choć jedno piętro.</p><div class="actions"><button class="btn danger" data-act="abandon-yes">Tak, porzuć</button><button class="btn" data-act="close" data-primary>Wróć do gry</button></div>', { narrow: true });
}

// ---------- obsługa kliknięć i klawiszy ----------
const ACT = {
  retry: async () => { await init(); },
  changeplayer: async () => { if (window.PL3Y && window.PL3Y.player) { await window.PL3Y.player.change(); await act('state'); render(); } },
  new: () => { G.screen = 'setup'; render(); },
  home: () => { closeOverlay(); stopFight(); G.fight = null; G.screen = 'home'; render(); },
  resume: () => { G.screen = 'run'; render(); },
  setmode: b => { G.setup.mode = b.dataset.v; store.set('bulgot:mode', b.dataset.v); render(); },
  setchar: b => { if (G.profile.chars.includes(b.dataset.v)) { G.setup.char = b.dataset.v; render(); } else toast('Ta postać jest zablokowana: ' + (D.CHARS[b.dataset.v].secret ? '???' : (D.UNLOCK_BY_ID[D.CHARS[b.dataset.v].lock] || {}).text)); },
  bookprev: () => bookGo(-1), booknext: () => bookGo(1),
  carpick: b => carGo(+b.dataset.v),
  cprev: () => carGo(G.setup.cur - 1), cnext: () => carGo(G.setup.cur + 1),
  gprev: () => garGo(G.setup.garnek - 1), gnext: () => garGo(G.setup.garnek + 1),
  setgarnek: b => garGo(+b.dataset.v),
  curse: b => { const s = G.setup, sel = s.curses || (s.curses = []), id = b.dataset.v, k = sel.indexOf(id); if (k >= 0) sel.splice(k, 1); else if (sel.length >= D.CURSE_MAX) return toast('Najwyżej ' + D.CURSE_MAX + ' Klątwy naraz.', true, 2400); else sel.push(id); snd.sfx('click'); render(); },
  start: async () => {
    const s = G.setup; if (!setupOk()) return toast(G.profile.chars.includes(charIds()[s.cur]) ? 'Ten palnik jest zablokowany.' : 'Ta postać jest zablokowana.'); s.char = charIds()[s.cur];
    const j = await act('start', { mode: s.mode, char: s.char, garnek: s.garnek, curses: s.curses || [] }); if (!j) return;
    snd.sfx('bulgot'); G.screen = 'run'; render();
    if (!store.get('bulgot:intro')) showIntro();
  },
  introgo: () => { closeOverlay(); },
  pick: b => doPick(+b.dataset.i),
  buyoffer: b => doBuy(+b.dataset.i),
  pawnmenu: () => showPawn(),
  upgrademenu: () => showUpgrade(),
  upgrade: async b => { const id = b.dataset.v; const j = await act('upgrade', { id }); if (!j) return; closeOverlay(); snd.sfx('unlock'); G.upFresh = j.upgraded.to; toast(`Zlano ${D.RULES.upgradeCost}× ${TILE[id].name} w ${TILE[j.upgraded.to].name}!`, false, 3600); render(); setTimeout(() => { G.upFresh = null; document.querySelectorAll('.chip.fresh').forEach(e => e.classList.remove('fresh')); }, 1800); },
  tuck: b => tuckLetter(b.closest('.decree')),
  pawn: async b => { const id = b.dataset.v; const j = await act('pawn', { id }); if (!j) return; closeOverlay(); snd.sfx('coin'); toast(`Lis wziął ${TILE[id].name} i dał ${j.price} Ziaren. Wykup na następnym piętrze.`, false, 4200); render(); },
  codeopen: () => {   // Hasło do ukrytej postaci: tylko tutaj, z ekranu wyboru postaci. Hasło sprawdza serwer.
    openOverlay(`<h2>Masz hasło?</h2><p class="lead">Ktoś szepnął Ci słówko? Wpisz je, a ukryta postać wykluje się od razu.</p>
      <input id="codein" class="codein" type="text" maxlength="40" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Hasło" aria-label="Hasło do ukrytej postaci">
      <div class="actions" style="margin-top:14px"><button class="btn primary" data-act="codesend" data-primary>Odblokuj</button><button class="btn ghost" data-act="close">Wróć</button></div>`, { narrow: true, force: true });
    const t = $('#codein'); if (t) { t.focus(); t.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ACT.codesend(); } }); }
  },
  codesend: async () => {
    const t = $('#codein'), text = ((t && t.value) || '').trim(); if (!text) return toast('Wpisz hasło.', true, 2400);
    const j = await act('code', { text }); if (!j) { if (t) { t.select(); snd.sfx('hurt'); } return; }
    closeOverlay(); const id = (j.unlocks && j.unlocks[0] && j.unlocks[0].target) || 'zjarany';
    G.setup.char = id; G.setup.cur = Math.max(0, charIds().indexOf(id)); render();
  },
  redeem: async () => { const j = await act('redeem'); if (!j) return; snd.sfx('unlock'); toast(`Wykupiono: ${TILE[j.redeemed].name} (-${j.cost} Ziaren)`); render(); },
  will: async b => { const i = +b.dataset.i; const j = await act('will', { i }); if (!j) return; snd.sfx(i >= 0 ? 'unlock' : 'click'); showEnd({ ...G.lastEndJ, will: j.will || null }, true); },
  rest: async () => { const j = await act('rest'); if (!j) return; snd.sfx('heal'); toast('Odpoczynek: +' + j.healed + ' życia (-' + j.cost + ' Ziarna)'); render(); },
  reroll: async () => {
    const j = await act('reroll'); if (!j) return;
    const spin = casinoOn() && !j.casinoAsk;   // tryb kasynowy: automat zamiast zwykłej wymiany
    if (!spin) snd.sfx('reroll');
    render();
    if (j.casinoAsk) setTimeout(showCasinoAsk, 250); else if (spin) casinoSpin();
  },
  casinoyes: () => casinoAnswer(true), tcasino: async () => { await casinoAnswer(!(G.profile.casino && G.profile.casino.on)); showSettings(); },
  buy: b => ACT.shopgo(+b.dataset.i),
  shopgo: async (i, slot, mut) => { const t = TILE[G.run.pending.offer[i]]; if (needChoice(t, slot, mut, (s2, m2) => ACT.shopgo(i, s2, m2))) return;
    const j = await act('shop', { i, slot, mut }); if (j) { snd.sfx('coin'); render(); } },
  leave: async () => { const j = await act('shop', { i: -1 }); if (j) render(); },
  bet: async b => { const j = await act('bet', { amount: +b.dataset.v }); if (!j) return; if (j.bet) { snd.sfx(j.won ? 'win' : 'lose'); toast(j.won ? `Wygrana! +${j.bet} Ziaren` : `Pudło. -${j.bet} Ziaren`, !j.won); } render(); },
  bonuspick: b => ACT.bonusgo(+b.dataset.i),
  bonuscoins: async () => { const j = await act('bonus', { i: -1 }); if (j) { snd.sfx('coin'); render(); } },
  choose: async b => { const j = await act('choose', { i: +b.dataset.i }); if (j) { if (G.run && G.run.phase === 'over') { G.screen = 'run'; return showEnd(j); } if (j.companion) toast('Adoptowano: ' + compForm(j.companion) + '!', false, 3600); snd.sfx(j.looted ? 'unlock' : 'pick'); if (j.looted) toast(`Łup: ${TILE[j.looted].name}!`, false, 3200); render(); } },
  bonusgo: async (i, slot, mut) => { const t = TILE[G.run.offer[i]]; if (needChoice(t, slot, mut, (s2, m2) => ACT.bonusgo(i, s2, m2))) return;
    const j = await act('bonus', { i, slot, mut }); if (j) { snd.sfx('pick'); render(); } },
  mutchoose: b => { const cb = G.mutCb; closeOverlay(); G.mutCb = null; if (cb) cb(+b.dataset.v); },
  slotchoose: b => { const cb = G.slotCb; closeOverlay(); G.slotCb = null; if (cb) cb(+b.dataset.v); },
  tofight: async () => {
    const j = await act('fightstart'); if (!j) return;
    snd.unlock(); startFight(j.setup);
  },
  useskill: b => useSkill(+b.dataset.v),
  pause: () => { const F = G.fight; if (!F || F.finishing) return; F.paused = !F.paused; $('#pausebtn').classList.toggle('on', F.paused); $('#pausebtn').textContent = F.paused ? 'Wznów' : 'Pauza'; if (F.paused) banner('Pauza', 'Naciśnij P, aby wznowić', false); },
  'retry-fight': () => { closeOverlay(); const cb = G.retryCb; G.retryCb = null; if (cb) cb(); },
  close: () => { closeOverlay(); if (G.screen === 'run' && G.run && G.run.phase === 'bonus') render(); },
  ranking: () => showRanking(G.run ? G.run.mode : G.setup.mode),
  slip: b => showSlip(+b.dataset.f),
  ranktab: b => { RK.deep = false; showRanking(b.dataset.v, true); },
  rkdeep: () => { RK.deep = !RK.deep; showRanking(RK.mode, true); },
  kurnik: () => showKurnik(),
  shop: () => showShop(), shopbuy: b => shopAct('shopbuy', { id: b.dataset.id }, 'unlock'), wear: b => shopAct('wear', { id: b.dataset.id, on: b.dataset.on === '1' }, 'click'),
  daily: () => showDaily(), dailystart: () => startDaily(), lvlpick: b => lvlPick(+b.dataset.i),
  kbuy: async b => { const j = await act('kurnik', { id: b.dataset.v }); if (!j) return; snd.sfx('unlock'); toast(D.KURNIK[j.kurnikBought.id].name + ': poziom ' + j.kurnikBought.lvl, false, 2600); showKurnik(); },
  rkme: () => { const me = playerNow(); if (me) { RK.nick = me.nick; showRanking(RK.mode, true); } },
  rkclear: () => { Object.assign(RK, { char: '', garnek: '', nick: '' }); showRanking(RK.mode, true); },
  rknickset: b => { RK.nick = b.dataset.v; showRanking(RK.mode, true); },
  rkcharset: b => { RK.char = b.dataset.v; showRanking(RK.mode, true); },
  rkgset: b => { RK.garnek = b.dataset.v; showRanking(RK.mode, true); },
  profile: () => showProfile(), achbook: () => { closeOverlay(); showBook('ach'); },
  book: () => showBook(), booktab: b => showBook(b.dataset.v, true),
  history: () => showHistory(),
  skillmove: b => swapSlots(+b.dataset.v, +b.dataset.v + +b.dataset.d),
  analyze: b => showAnalyzeDialog(b.dataset.id, b.closest('tr') ? 'hist' : 'end'),
  atag: b => { const on = !b.classList.contains('on'); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); },
  acancel: () => backFromAnalyze(),
  asend: async () => sendAnalysis(true),
  asend0: async () => sendAnalysis(false),
  histdl: () => { const blob = new Blob([JSON.stringify(G.hist || [], null, 1)], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bulgot-historia.json'; document.body.appendChild(a); a.click(); a.remove(); toast('Pobrano bulgot-historia.json'); },
  histcopy: async () => { try { await navigator.clipboard.writeText(JSON.stringify(G.hist || [], null, 1)); toast('Skopiowano historię do schowka'); } catch (e) { toast('Nie udało się skopiować. Użyj przycisku Pobierz.', true); } },
  help: () => showHelp(), settings: () => showSettings(), menu: () => showMenu(),
  tsfx: b => { snd.setSfx(!snd.settings.sfx); showSettings(); },
  tmusic: b => { snd.setMusic(!snd.settings.music); showSettings(); },
  tanim: () => { store.set('bulgot:anim', animOn() ? '0' : '1'); applyAnim(); showSettings(); },
  tinv: () => { store.set('bulgot:invoice', invoiceOn() ? '0' : '1'); dismissInvoice(true); showSettings(); },
  abandon: () => confirmAbandon(),
  'abandon-yes': async () => { closeOverlay(); stopFight(); G.fight = null; const j = await act('abandon'); if (!j) return; G.screen = 'run'; showEnd(j); },
  again: () => { closeOverlay(); G.screen = 'setup'; render(); },
};
document.addEventListener('click', e => {
  const o = $('#overlay');
  if (e.target === o && !o.dataset.force) return closeOverlay();
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled || b.getAttribute('aria-disabled') === 'true' && !['setchar', 'setgarnek'].includes(b.dataset.act)) return;
  snd.unlock();
  const fn = ACT[b.dataset.act];
  if (fn) { if (!['pick', 'buy', 'reroll', 'useskill', 'bet'].includes(b.dataset.act)) snd.sfx('click'); fn(b, e); }
});
// Filtry rankingu: zmiana listy, poziomu Garnka albo nicka odświeża tabelę.
document.addEventListener('input', e => { const t = e.target; if (t && t.id === 'set-vol') { snd.setVolume(+t.value); const n = $('#set-vol-n'); if (n) n.textContent = snd.settings.vol + '%'; } });
document.addEventListener('change', e => { if (e.target && e.target.id === 'set-vol') snd.setVolume(+e.target.value, true); });
document.addEventListener('change', e => { const t = e.target; if (!t || !t.id || !t.id.startsWith('rk-')) return; if (t.id === 'rk-char') RK.char = t.value; else if (t.id === 'rk-garnek') RK.garnek = t.value; else if (t.id === 'rk-nick') RK.nick = t.value.trim(); showRanking(RK.mode, true); });
// ---------- sterowanie strzałkami ----------
// Strzałki przesuwają zaznaczenie do najbliższego przycisku w danym kierunku (karty, Dokup, Reroll, okna), Enter zatwierdza zaznaczony.
const ARROWS = { arrowleft: [-1, 0], arrowright: [1, 0], arrowup: [0, -1], arrowdown: [0, 1] };
function navItems() {
  const root = overlayOpen() ? $('#overlay') : $('#screen');
  if (!root) return [];
  return [...root.querySelectorAll('button:not([disabled]), [data-act][tabindex]')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(b).visibility !== 'hidden'; });
}
function navCurrent(items) { const a = document.activeElement; return items.includes(a) ? a : null; }
function navMove(dx, dy) {
  const items = navItems(); if (!items.length) return;
  const cur = navCurrent(items);
  if (!cur) { const first = items.find(b => b.closest('.cards')) || items.find(b => b.hasAttribute('data-primary')) || items[0]; first.focus(); first.scrollIntoView({ block: 'nearest' }); return; }
  const c = cur.getBoundingClientRect(), cx = c.left + c.width / 2, cy = c.top + c.height / 2;
  let best = null, bs = Infinity;
  for (const b of items) {
    if (b === cur) continue;
    const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, ddx = x - cx, ddy = y - cy;
    const along = ddx * dx + ddy * dy; if (along <= 4) continue;            // tylko w wybranym kierunku
    const side = Math.abs(dx ? ddy : ddx);
    const sc = along + side * 2.5;
    if (sc < bs) { bs = sc; best = b; }
  }
  if (best) { best.focus(); best.scrollIntoView({ block: 'nearest' }); }
}

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const F = G.fight, k = e.key.toLowerCase();
  if (k !== 'escape' && e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;   // pisanie nie uruchamia skrótów
  if (G.screen === 'setup' && !overlayOpen() && !e.shiftKey) {
    const s = G.setup, ids = charIds();
    if (k === 'escape' || k === 'backspace') { e.preventDefault(); ACT.home(); return; }
    if (k === 'arrowleft') { e.preventDefault(); carGo(s.cur - 1); return; }
    if (k === 'arrowright') { e.preventDefault(); carGo(s.cur + 1); return; }
    if (k === 'arrowup') { e.preventDefault(); garGo(s.garnek + 1); return; }
    if (k === 'arrowdown') { e.preventDefault(); garGo(s.garnek - 1); return; }
    if (k === 'q') { e.preventDefault(); const m = Object.keys(T.MODE_INFO); ACT.setmode({ dataset: { v: m[(m.indexOf(s.mode) + 1) % m.length] } }); return; }
    if (k === 'enter') { e.preventDefault(); ACT.start(); return; }
  }
  if (k === 'escape') { if (overlayOpen()) { if (!$('#overlay').dataset.force) closeOverlay(); } else if (G.screen === 'run' || (G.screen === 'fight' && G.fight && !G.fight.finishing)) { const m = $('[data-act="menu"]'); m && m.click(); } return; }
  if (overlayOpen() && $('#overlay .bookmodal') && !e.shiftKey) {
    if (k === 'arrowleft' || k === 'arrowright') { e.preventDefault(); bookGo(k === 'arrowright' ? 1 : -1); return; }
    if (k === 'arrowup' || k === 'arrowdown') { e.preventDefault(); const ts = [...document.querySelectorAll('#overlay .booktabs .tab')], i = ts.findIndex(t => t.classList.contains('on')), n = ts[(i + (k === 'arrowdown' ? 1 : ts.length - 1)) % ts.length]; if (n) showBook(n.dataset.v, true); return; }
  }
  if (!overlayOpen() && (G.screen === 'run' || G.screen === 'fight') && (k === 'k' || k === 'h') && !(G.screen === 'fight' && G.fight && !G.fight.finishing && false)) { e.preventDefault(); (k === 'k' ? showBook : showHelp)(); return; }
  if (ARROWS[k] && !(F && !overlayOpen())) { e.preventDefault(); navMove(...ARROWS[k]); return; }
  if (k === 'enter') { const cur = navCurrent(navItems()); if (cur) { e.preventDefault(); cur.click(); return; } }
  if (overlayOpen()) {
    if (k === 'enter') { const p = $('#overlay [data-primary]'); if (p) { e.preventDefault(); p.click(); } }
    return;
  }
  if (F) {
    if (['1', '2', '3'].includes(k)) { e.preventDefault(); useSkill(+k - 1); }
    else if (k === 'q' || k === 'w' || k === 'e') useSkill('qwe'.indexOf(k));
    else if (k === 'p' || k === ' ') { e.preventDefault(); ACT.pause(); }
    return;
  }
  const r = G.run;
  if (G.screen === 'run' && r) {
    const dg = /^Digit([1-5])$/.exec(e.code);
    if (r.phase === 'offer' && dg && e.shiftKey) { const b = $(`.cards [data-act=buyoffer][data-i="${+dg[1] - 1}"]`); if (b && !b.disabled) b.click(); }
    else if ((r.phase === 'badge' || r.phase === 'loot' || r.phase === 'door' || r.phase === 'route' || r.phase === 'victory' || (r.phase === 'event' && r.pending && ['contract', 'shrine', 'arena', 'adopt', 'crate', 'extra'].includes(r.pending.kind))) && ['1', '2', '3'].includes(k)) { const b = $(`.cards [data-act=choose][data-i="${+k - 1}"]`); if (b) b.click(); }
    else if (r.phase === 'offer' && ['1', '2', '3', '4', '5'].includes(k)) { const b = $(`.cards [data-act=pick][data-i="${+k - 1}"]`); if (b) b.click(); }
    else if (r.phase === 'offer' && k === 'u') { const b = $('[data-act="upgrademenu"]'); if (b && !b.disabled) b.click(); }
    else if (r.phase === 'offer' && k === 'l') { const b = $('[data-act="pawnmenu"], [data-act="redeem"]'); if (b && !b.disabled) b.click(); }
    else if ((r.phase === 'offer' || r.phase === 'fight') && k === 'o') { const b = $('[data-act="rest"]'); if (b && !b.disabled) b.click(); }
    else if (r.phase === 'offer' && k === 'r') { const b = $('[data-act="reroll"]'); if (b && !b.disabled) b.click(); }
    else if ((r.phase === 'event' || r.phase === 'bonus') && ['1', '2', '3'].includes(k)) { const b = $(`.cards [data-i="${+k - 1}"]`); if (b) b.click(); }
    else if (k === 'enter') { const p = $('[data-primary]'); if (p) p.click(); }
  } else if (k === 'enter') { const p = $('[data-primary]'); if (p) p.click(); }
});

init();

// ---------- Staż, Sklepik Zakładowy, Dyżur dnia ----------
// Staż to poziom konta w tle: Nadgodziny z runów → poziomy → Talony (2 za poziom) + wybór 1 z 2 nagród. Talony idą do Sklepiku (kosmetyka, nic nie zmienia siły).
const rewardText = (id, lvl) => { const r = D.REWARD_BY_ID[id]; return r.text.replace('{v}', r.v(lvl)); };
const fmtDay = d => { const [y, m, dd] = String(d).split('-'); return `${+dd}.${m}.${y}`; };
function stazOf() { return G.profile.staz || { level: 0, into: 0, need: D.stazCost(1), xp: 0, title: D.STAZ_TITLES[0], talons: 0 }; }
function stazBar(s) { return `<span class="sp-bar"><i style="width:${Math.min(100, Math.round(100 * s.into / s.need))}%"></i></span>`; }
function stazPill() {
  const s = stazOf();
  return `<button class="staz-pill" data-act="shop" data-tip="${esc('Staż ' + s.level + ': ' + s.title + '\nNadgodziny: ' + s.into + ' / ' + s.need + ' do następnego poziomu.\nTalony: ' + s.talons + '. Wydasz je w Sklepiku Zakładowym.')}"><b>Staż ${s.level}</b>${stazBar(s)}<span class="sp-t">🎟️ ${s.talons}</span></button>`;
}
// Po awansie czeka wybór nagrody; okno pokazuje się w menu, gdy nic innego nie jest otwarte.
function maybeLevelUp() { if (G.screen === 'home' && !overlayOpen() && G.profile && G.profile.lvlPending) showLevelUp(); }
function showLevelUp() {
  const q = G.profile.lvlPending; if (!q) return;
  const cards = q.opts.map((id, i) => { const r = D.REWARD_BY_ID[id]; return `<button class="opt reward-opt" data-act="lvlpick" data-i="${i}"><span class="rw-ico">${r.icon}</span><h3>${esc(r.name)}</h3><p>${esc(rewardText(id, q.lvl))}</p></button>`; }).join('');
  openOverlay(`<h2>Awans! Staż ${q.lvl}</h2><p class="lead"><b>${esc(D.stazTitle(q.lvl))}</b>. Dostajesz <b>${D.STAZ.talons} Talony</b> do Sklepiku Zakładowego i jedną nagrodę do wyboru${q.left > 1 ? ` (czeka jeszcze ${q.left - 1} awansów)` : ''}.</p><div class="opts reward-opts">${cards}</div>`, { narrow: true, force: true });
  snd.sfx('unlock');
}
async function lvlPick(i) {
  const j = await act('levelchoice', { i }); if (!j) return;
  closeOverlay(); snd.sfx('unlock');
  const t = j.rewardTaken; if (t) toast('Nagroda: ' + rewardText(t.reward, t.lvl), false, 3600);
  render(); maybeLevelUp();
}
function shopHero() { const ids = Object.keys(D.CHARS), id = G.setup && G.profile.chars.includes(G.setup.char) ? G.setup.char : 'pyrtek'; return { id, art: art.heroArt(id, id === 'pyrtek' ? 'pyrtek' : 'kogut') }; }
function showShop() {
  const p = G.profile, w = p.wardrobe || { owned: [], eq: {} }, s = stazOf(), me = playerNow(), hero = shopHero();
  const ttl = w.eq.title && D.SHOP[w.eq.title] ? D.SHOP[w.eq.title].name : '';
  const cards = Object.values(D.SHOP).map(it => {
    const owned = w.owned.includes(it.id), on = w.eq[it.slot] === it.id;
    const prev = it.slot === 'title' ? `<div class="sh-title">${esc(it.name)}</div>` : art.heroArt('pyrtek', 'pyrtek', { wear: { [it.slot]: it.id } });
    const btn = owned ? `<button class="btn small ${on ? '' : 'primary'}" data-act="wear" data-id="${it.id}" data-on="${on ? 0 : 1}">${on ? 'Zdejmij' : 'Załóż'}</button>`
      : `<button class="btn small primary" data-act="shopbuy" data-id="${it.id}" ${s.talons < it.cost ? 'disabled' : ''}>Kup · ${it.cost} 🎟️</button>`;
    return `<div class="shop-card ${on ? 'on' : ''}"><div class="sh-prev">${prev}</div><h3>${esc(it.name)}</h3><div class="sh-slot">${esc(D.SLOTS[it.slot])}</div><p>${esc(it.text)}</p>${btn}</div>`;
  }).join('');
  openOverlay(`<h2>Sklepik Zakładowy</h2>
    <div class="shop-top"><span class="staz-line"><b>Staż ${s.level}</b> ${esc(s.title)} ${stazBar(s)}<small>${s.into} / ${s.need} Nadgodzin</small></span><span class="talons">🎟️ <b>${s.talons}</b> Talonów</span></div>
    <div class="shop-body"><div class="shop-me"><div class="shop-hero">${hero.art}</div><div class="shop-nick">${esc(me ? me.nick : '')}</div>${ttl ? `<div class="shop-ttl">${esc(ttl)}</div>` : ''}</div><div class="shop-grid">${cards}</div></div>
    <p class="hint">Talony dostajesz za awanse na Stażu (2 za poziom) i za Dyżur dnia. Stroje są tylko ozdobą i widać je w walce, w ekranie końca i na Arenie Duchów.</p>`, { cls: 'shopmodal' });
}
async function shopAct(path, body, sfx) { const j = await act(path, body); if (!j) return; if (sfx) snd.sfx(sfx); showShop(); }

async function showDaily() {
  const d = G.daily; if (!d) return toast('Dyżur dnia jest chwilowo niedostępny.', true);
  const c = D.CURSES[d.curses[0]], ch = D.CHARS[d.char];
  openOverlay(`<h2>Dyżur dnia <small class="dy-date">${esc(fmtDay(d.date))}</small></h2>
    <p class="lead">Ten sam run dla wszystkich: te same oferty, jedna Klątwa Prezesa, jedno podejście na dzień.</p>
    <div class="daily-info"><div><span>Postać</span><b>${esc(ch.name)}</b></div><div><span>Tryb</span><b>${esc(D.MODES[d.mode].name)}</b></div><div><span>Klątwa dnia</span><b>${art.emo(c.icon)} ${esc(c.name)}</b></div><div><span>Seria</span><b>${d.streak} ${d.streak === 1 ? 'dzień' : 'dni'}</b></div></div>
    <p class="hint">Talony: 1 za ukończenie, +2 za wygraną, +1 od 3 dni z rzędu (+2 od 7). Bez Kurnika i premii, nie zmienia rekordów ani palnika.</p>
    <div class="actions">${d.used ? `<span class="daily-done">${d.active ? 'Dyżur w toku. Dokończ go w menu.' : `Twój wynik: <b>${fmtNum(d.score)}</b> (piętra: ${d.rounds}${d.win ? ', wygrana' : ''}). Wróć jutro.`}</span>` : '<button class="btn primary big" data-act="dailystart" data-primary>Zacznij dyżur</button>'}</div>
    <div class="sec">Ranking dnia</div><div id="dyrank" class="lead">Ładowanie…</div>`, { narrow: true });
  const { j } = await apiDaily(d.date), box = $('#dyrank'); if (!box) return;
  if (!j || !j.list) { box.textContent = (j && j.err) || 'Nie udało się pobrać rankingu.'; return; }
  if (!j.list.length) { box.textContent = 'Nikt jeszcze nie odbył dziś dyżuru. Bądź pierwszy.'; return; }
  const me = playerNow(), mynick = me ? me.nick : '';
  box.className = ''; box.innerHTML = `<table class="rank-list"><tbody>${j.list.slice(0, 10).map((x, i) => `<tr class="${x.nick === mynick ? 'me' : ''} ${i < 3 ? 'top' + (i + 1) : ''}"><td class="pos">${i + 1}</td><td>${esc(x.nick)}${x.ttl && D.SHOP[x.ttl] ? ` <small class="ttl">${esc(D.SHOP[x.ttl].name)}</small>` : ''}${x.win ? ' 🏆' : ''}</td><td>${x.rounds} p.</td><td style="text-align:right">${fmtNum(x.score)}</td></tr>`).join('')}</tbody></table>`;
}
async function startDaily() {
  closeOverlay();
  const j = await act('start', { daily: true }); if (!j) return;
  snd.sfx('bulgot'); G.screen = 'run'; render();
  if (!store.get('bulgot:intro')) showIntro();
}

// Ekran końca: Nadgodziny, rosół i wynik Dyżuru dnia.
function endExtrasHTML(e) {
  let h = '';
  if (e.staz) { const s = stazOf(); h += `<div class="endstaz"><span>Nadgodziny <b>+${e.staz.gain}</b></span><span class="es-lvl">Staż ${s.level}</span>${stazBar(s)}<small>${s.into} / ${s.need}</small></div>${e.staz.ups && e.staz.ups.length ? `<p class="lead" style="color:var(--gold)"><b>Awans na Stażu: poziom ${e.staz.level}!</b> Nagrodę odbierzesz w menu (${D.STAZ.talons * e.staz.ups.length} Talony czeka w Sklepiku).</p>` : ''}`; }
  if (e.soup) { const sp = D.SOUP_BY_ID[e.soup.id]; if (sp) h += `<div class="endsoup">${art.soupArt(sp.color)}<div><b>${e.soup.isNew ? 'Nowy rosół w Księdze!' : 'Ugotowałeś rosół'}</b><br>${esc(sp.name)}${e.soup.isNew ? '' : ` (×${e.soup.n})`}</div></div>`; }
  if (e.daily) h += `<p class="lead">Dyżur dnia: <b>+${e.daily.talons} Talony</b>, seria <b>${e.daily.streak}</b> ${e.daily.streak === 1 ? 'dzień' : 'dni'}${e.rank ? `, miejsce dnia <b>#${e.rank}</b>` : ''}.</p>`;
  return h;
}
function soupsBook(p, fresh, marks) {
  const have = p.soups || {}, n = D.SOUPS.filter(s => have[s.id]).length;
  return `<p class="lead">Każda wygrana gotuje rosół zależny od buildu: najpierw przepisy specjalne, potem dominujący żywioł (co najmniej 4 kafelki), na końcu postać. Odkryte: ${n} z ${D.SOUPS.length}.</p>
    <div class="ms-grid soups">${D.SOUPS.map(s => have[s.id]
      ? `<div class="ms-row entry soup-row">${art.soupArt(s.color)}<div><b>${esc(s.name)}</b><br><span>${esc(s.hint)}</span><br><span class="sp-n">Ugotowany ×${have[s.id].n}, najlepszy wynik ${fmtNum(have[s.id].best)}</span></div></div>`
      : `<div class="ms-row unknown soup-row soup-lock">${art.soupArt('#4a4036')}<div><b>?</b><br><span>${s.secret ? 'Sekretny przepis.' : esc(s.hint)}</span></div></div>`).join('')}</div>`;
}

// ---------- Tryb kasynowy: przetasowanie oferty jako automat ----------
// Odblokowuje się po 5 przetasowaniach na jednym piętrze (serwer: profile.casino). Domyślnie wyłączony; po odpowiedzi „Tak” włączony na stałe, wyłączany w ustawieniach.
// Czysto wizualne: oferta jest już wylosowana przez serwer, walce tylko ją odsłaniają od lewej do prawej. Klik, spacja albo R przerywa.
const casinoOn = () => !!(G.profile && G.profile.casino && G.profile.casino.on) && animOn();
document.addEventListener('click', e => { if (SPIN.active) { e.stopPropagation(); e.preventDefault(); SPIN.active.finish(); } }, true);
document.addEventListener('keydown', e => { if (SPIN.active && !['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) { e.stopPropagation(); e.preventDefault(); SPIN.active.finish(); } }, true);

function maybeCasinoAsk() {
  const c = G.profile && G.profile.casino;
  if (c && c.unlocked && !c.asked && !overlayOpen() && (G.screen === 'home' || G.screen === 'run')) showCasinoAsk();
}
function showCasinoAsk() {
  openOverlay(`<div class="casino-ask"><div class="ca-lamps" aria-hidden="true">${Array.from({ length: 14 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>
    <h2>Wykryto skłonność do kręcenia</h2>
    <p class="ca-big">Widzę, że masz skłonność do kręcenia.<br><b>Włączyć tryb kasynowy?</b></p>
    <p class="hint">Przetasowanie taśmy będzie wyglądać jak automat do gier: kręcące się walce, brzdęk i jackpot. Włączysz i wyłączysz to w ustawieniach.</p>
    <div class="actions"><button class="btn primary big" data-act="casinoyes" data-primary>Tak</button><button class="btn primary big" data-act="casinoyes">tak</button></div></div>`, { force: true, cls: 'casinoask' });
  snd.sfx('unlock');
}
async function casinoAnswer(on) {
  const j = await act('casino', { on }); if (!j) return;
  closeOverlay(); snd.sfx('win');
  toast(on ? 'Tryb kasynowy włączony. Wyłączysz go w ustawieniach.' : 'Tryb kasynowy wyłączony.', false, 3400);
}
const casinoIcons = (() => { let pool = null; return () => pool || (pool = D.TILES.filter(t => !t.hidden && !t.hatched && !t.boss).map(t => t.id)); })();
function casinoSpin() {
  const box = $('.stage .cards'); if (!box || !G.run) return;
  const kids = [...box.children]; if (kids.length < 2) return;
  if (SPIN.active) SPIN.active.abort();
  const ids = G.run.offer, rar = i => (TILE[ids[i]] ? TILE[ids[i]].rarity : 0) | 0, maxR = Math.max(...kids.map((_, i) => rar(i)));
  const lamps = () => Array.from({ length: 26 }, (_, k) => `<i style="--i:${k}"></i>`).join('');
  const slot = document.createElement('div'); slot.className = 'slotm';
  slot.innerHTML = `<div class="lamps top">${lamps()}</div><div class="reels"></div><div class="lamps bot">${lamps()}</div>`;
  const reels = slot.querySelector('.reels'), pool = casinoIcons();
  const cells = kids.map((k, i) => {
    const c = document.createElement('div'); c.className = 'cell'; c.style.height = k.offsetHeight + 'px';
    const six = Array.from({ length: 6 }, () => pool[Math.floor(Math.random() * pool.length)]);
    const sym = id => `<div class="sym">${art.tileIcon(id)}</div>`;
    const reel = document.createElement('div'); reel.className = 'reel';
    reel.innerHTML = `<div class="strip" style="animation-delay:-${(i * 0.07).toFixed(2)}s">${six.map(sym).join('')}${six.map(sym).join('')}</div><div class="gloss"></div>`;
    k.style.visibility = 'hidden'; c.append(k, reel); reels.append(c); return { c, k, reel, done: false };
  });
  box.classList.add('casino'); box.append(slot);
  const timers = []; let tick = null, ended = false;
  const stage = $('.stage');
  const clear = () => { timers.forEach(clearTimeout); clearInterval(tick); };
  const banner = (txt, cls) => { const b = document.createElement('div'); b.className = 'jpb ' + cls; b.textContent = txt; slot.append(b); timers.push(setTimeout(() => b.remove(), cls === 'gold' ? 1600 : 1000)); };
  const reveal = (i, quiet) => {
    const cell = cells[i]; if (cell.done) return; cell.done = true;
    const r = rar(i); cell.reel.remove(); cell.k.style.visibility = ''; cell.c.classList.add('stopped', 'r' + r);
    if (!quiet) {
      snd.sfx('reelstop' + r);
      if (r >= 2) { cell.c.classList.add('glow'); if (stage) { stage.classList.add('casino-shake'); timers.push(setTimeout(() => stage.classList.remove('casino-shake'), 380)); } banner(r >= 3 ? 'JACKPOT!' : 'EPICKI!', r >= 3 ? 'gold' : 'epic'); if (r >= 3) slot.classList.add('gold'); }
    }
  };
  const unwrap = () => {
    if (!slot.isConnected) return;
    for (const cell of cells) { cell.c.classList.remove('stopped', 'glow'); box.insertBefore(cell.k, slot); cell.k.style.visibility = ''; }
    slot.remove(); box.classList.remove('casino');
  };
  const finish = () => {
    if (ended) return; ended = true; clear(); SPIN.active = null;
    if (slot.isConnected) { let any = false; cells.forEach((c, i) => { if (!c.done) { any = true; reveal(i, true); } }); if (any) snd.sfx('reelstop' + maxR); }
    unwrap();
  };
  const abort = () => { if (ended) return; ended = true; clear(); SPIN.active = null; };
  SPIN.active = { finish, abort };
  // czasy zatrzymań: od lewej do prawej, walce z rzadkim kafelkiem „zawahają się” przed końcem
  let t = 650; const stops = cells.map((_, i) => { t += (i ? 230 : 0) + (rar(i) >= 2 ? 380 : 0); return t; });
  tick = setInterval(() => snd.sfx('reeltick'), 85);
  cells.forEach((cell, i) => {
    if (rar(i) >= 2) timers.push(setTimeout(() => cell.reel.classList.add('slow'), stops[i] - 420));
    timers.push(setTimeout(() => reveal(i), stops[i]));
  });
  timers.push(setTimeout(finish, stops[stops.length - 1] + (maxR >= 3 ? 1500 : maxR === 2 ? 800 : 380)));
}
