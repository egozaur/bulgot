// Bulgot: interfejs gry. Cała logika (oferty, rerolle, walki, wyniki) liczy serwer; tu rysujemy ekrany i prowadzimy walkę na żywo
// tym samym silnikiem (shared/sim.js), a lista wejść gracza leci na serwer, który powtarza walkę i wydaje wynik.
import { call, ranks as apiRanks, LOCAL, getPlayer, playerNow, avatarUrl } from './api.js';
import * as D from './shared/data.js';
import { Fight, MAX_TICKS, FURY_FROM } from './shared/sim.js';
import * as art from './art.js';
import * as T from './text.js';
import * as snd from './audio.js';
import { initTip } from './tip.js';
import { failFacts, pickFacts, winFacts } from './fakty.js';

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

const G = {
  profile: null, run: null, screen: 'loading', fight: null, busy: false, unlocks: [], lastEnd: null,
  setup: { mode: store.get('bulgot:mode') === 'quick' ? 'quick' : 'full', char: 'pyrtek', garnek: 0 },
  speed: [1, 2, 3].includes(+store.get('bulgot:speed')) ? +store.get('bulgot:speed') : 1,
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
    if (j && j.profile) G.profile = j.profile;
    if (j && 'run' in j) G.run = j.run;
    if (!j || j.err) { toast((j && j.err) || 'Coś poszło nie tak. Spróbuj jeszcze raz.', true, 3600); if (j && 'run' in j && G.screen !== 'fight') render(); return null; }
    if (j.voided) toast('Gra dostała aktualizację zasad, więc poprzedni run został unieważniony. Zacznij nowy!', false, 6000);
    if (j.hatched && j.hatched.length) setTimeout(() => showHatched(j.hatched), 80);
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
  const root = $('#screen');
  switch (G.screen) {
    case 'loading': root.innerHTML = '<div class="loading"><span>Bulgocze</span> <i></i><i></i><i></i></div>'; break;
    case 'noplayer': root.innerHTML = `<div class="loading" style="flex-direction:column;gap:14px;text-align:center"><span>Do gry w Bulgot potrzebny jest nick.</span><button class="btn primary" data-act="retry">Wybierz nick</button><a class="btn ghost" href="/">← PL3Y</a></div>`; break;
    case 'home': root.innerHTML = renderHome(); break;
    case 'setup': root.innerHTML = renderSetup(); break;
    case 'run': root.innerHTML = renderRun(); rollCounters(); armLetter(); fitTower(); break;
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
function renderHome() {
  const pl = playerNow(), run = G.run && G.run.phase !== 'over' ? G.run : null, best = G.profile.best || {};
  const bestLine = ['quick', 'full'].filter(m => best[m]).map(m => `${D.MODES[m].name}: <b>${fmtNum(best[m].score)}</b>`).join(' · ');
  return `<a class="lobby-link" href="/">← PL3Y</a>
  <div class="home"><div class="home-bg"></div><div class="bubbles">${bubblesHTML()}</div>
  <div class="home-in">
    <div class="me-badge" ${LOCAL ? '' : 'data-act="changeplayer" style="cursor:pointer"'}>${avatarHTML(pl)} Gracz <b>${esc(pl ? pl.nick : '')}</b>${LOCAL ? ' (tryb lokalny)' : ''}</div>
    ${art.towerArt(G.profile.garnek || 0)}
    <h1 class="logo" aria-label="Bulgot">${[...'BULGOT'].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('')}</h1>
    <div class="tagline">${esc(T.TAGLINE)}</div>
    <div class="home-actions">
      ${run ? `<div class="resume">Trwa run: <b>${esc(D.MODES[run.mode].name)}</b>, piętro ${run.round}/${run.rounds}, ${run.coins} ${art.coinIcon()} Ziaren</div>
        <button class="btn primary big" data-act="resume" data-primary>Kontynuuj</button><button class="btn small ghost" data-act="abandon">Porzuć run</button>`
      : `<button class="btn primary big" data-act="new" data-primary>Graj</button>`}
      <div class="home-row"><button class="btn" data-act="ranking">Ranking</button><button class="btn" data-act="book">Księga Kurnika</button><button class="btn" data-act="help">Jak grać</button><button class="btn" data-act="settings">Dźwięk</button><button class="btn ghost" data-act="history">Historia (test)</button></div>
      ${bestLine ? `<div class="best">Najlepsze wyniki. ${bestLine}</div>` : ''}
      ${metaNotes()}
    </div></div></div>`;
}
// Awans Wroga i Testament Pyrtka: to, co czeka w następnym runie.
function metaNotes() {
  const p = G.profile, out = [];
  if (p.nemesis) { const n = p.nemesis, t = n.tile && TILE[n.tile]; out.push(`<div class="meta-note nem">${art.skullIcon()} <span>Twój Nemezis: <b>${esc(n.name)}</b>${n.lvl > 1 ? ' (awans ' + n.lvl + '.)' : ''}${t ? `, ukradł ci <b>${esc(t.name)}</b>` : ''}. Czeka w następnym runie.</span></div>`); }
  if (p.will && TILE[p.will.tile]) { const ch = D.CHARS[p.will.char], multi = p.chars.length > 1; out.push(`<div class="meta-note will">${art.tileIcon(p.will.tile)} <span>Testament: <b>${esc(TILE[p.will.tile].name)}</b> czeka w pierwszej ofercie${multi ? ` następnego runu postacią inną niż ${esc(ch ? ch.name : '')}` : ' następnego runu'}.</span></div>`); }
  return out.join('');
}

// ---------- przygotowanie runu ----------
function renderSetup() {
  const p = G.profile, s = G.setup;
  const modes = Object.entries(T.MODE_INFO).map(([id, m]) => `<button class="opt ${s.mode === id ? 'on' : ''}" data-act="setmode" data-v="${id}"><h3>${m.name}</h3><p>${m.text}</p></button>`).join('');
  const chars = Object.values(D.CHARS).map(c => {
    const open = p.chars.includes(c.id), u = c.lock && D.UNLOCK_BY_ID[c.lock], v = charView(c, open);
    // jajko: odblokowana postać wystaje ze skorupy, zablokowana to jeszcze nie pęknięte jajo
    return `<button class="opt char-opt egg-opt ${s.char === c.id ? 'on' : ''} ${open ? 'hatched' : 'locked'} ${v.hidden ? 'secret' : ''}" data-act="setchar" data-v="${c.id}" ${open ? '' : 'aria-disabled="true"'}><div class="egg-art">${art.eggArt(c.id, open)}</div><h3>${esc(v.name)}</h3><div class="post">Stanowisko: <b>${esc(v.style)}</b></div><p>${esc(v.text)}</p>${open ? '' : `<div class="lockmsg">🔒 Jak odblokować: ${esc(v.hidden ? '???' : u ? u.text : '')}</div>`}</button>`;
  }).join('');
  // termometr: od „Letni” do „Wulkan Rosołu”; rtęć dochodzi do wybranego poziomu
  const gs = D.GARNEK.map((g, i) => `<button class="gbtn ${s.garnek === i ? 'on' : ''} ${i > p.garnek ? 'locked' : ''}" data-act="setgarnek" data-v="${i}" style="--gi:${i}" ${i > p.garnek ? 'aria-disabled="true"' : ''}><i class="tick"></i><span class="gn">${i}</span><span class="gl">${g.name}</span>${i > p.garnek ? '<span class="glock" aria-label="zablokowany">🔒</span>' : ''}</button>`).join('');
  const g = D.GARNEK[s.garnek];
  return `<div class="setup">
    <div class="screen-head"><h2>Nowy run</h2><button class="btn small ghost" data-act="home">← Menu</button></div>
    <div class="sec">Tryb</div><div class="opts">${modes}</div>
    <div class="sec">Postać <small>nowe odblokowujesz osiągnięciami</small></div><div class="opts chars">${chars}</div>
    <div class="sec">Temperatura Garnka <small>wygrana na poziomie N odblokowuje N+1 i podnosi mnożnik wyniku o 25%</small></div>
    <div class="thermo" style="--lv:${s.garnek}"><div class="bulb"></div><div class="tube"><i class="merc"></i></div><div class="garnek-row">${gs}</div></div><div class="gtext"><b>${esc(g.name)}.</b> ${esc(g.text)}</div>
    ${metaNotes()}
    <div class="start-row"><button class="btn primary big" data-act="start" data-primary>Do garnka!</button></div></div>`;
}

// ---------- karty kafelków ----------
function setOwned(set) { return G.run ? G.run.tiles.filter(id => TILE[id] && setsOf(TILE[id]).includes(set)).length : 0; }
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
  if (own && own.lvl >= 2) tags.push('<span class="tag up mut">Mutacja</span>');
  else if (own) tags.push('<span class="tag up">Poziom 2</span>');
  else if (t.type === 'skill' && run && run.skills.length >= D.RULES.maxSkills && !o.static) tags.push('<span class="tag">Zastąp slot</span>');
  const tag = o.static ? 'div' : 'button';
  const dis = o.price != null && run && run.coins < o.price ? 'disabled' : '';
  return `<${tag} class="tile r${t.rarity} ${o.static ? 'static' : ''} ${o.locked ? 'locked' : ''} ${o.mini ? 'mini' : ''}" ${o.static ? '' : `data-act="${o.act || 'pick'}" data-i="${i}"`} ${dis} style="--i:${i}" ${o.tip ? `data-tip="${esc(o.tip)}"` : ''}>
    ${o.static || o.key === false ? '' : `<span class="key">${i + 1}</span>`}${art.tileIcon(id)}
    <div class="tname">${esc(t.name)}</div><div class="ttext">${esc(t.text)}</div>
    <div class="tmeta">${tags.join('')}</div>
    ${o.price != null ? `<div class="price ${dis ? 'no' : ''}">${o.price} ${art.coinIcon()}</div>` : ''}
    ${o.lockText ? `<div class="lockbox">Zablokowany: ${esc(o.lockText)}</div>` : ''}</${tag}>`;
}

// ---------- ekran runu ----------
const enemyDef = id => D.ENEMIES[id] || D.BOSSES[id];
function previewHTML() {
  const r = G.run; let ids = r.enemies || [];
  if (r.boss === 'prezes') ids = ['kot-ochroniarz', 'kot-ochroniarz', 'prezes'];
  const nem = r.nemesisRound && r.nemesis, risky = r.door && r.door.risky;
  const items = ids.map((id, i) => { const d = enemyDef(id); const boss = !!D.BOSSES[id], big = i === 0 && (nem || risky);
    const name = i === 0 && nem ? r.nemesis.name : id === 'kot-ochroniarz' && r.boss === 'prezes' ? 'Ochroniarz' : (i === 0 && risky ? 'Elitarny ' : '') + d.name;
    return `<div class="pv ${boss ? 'boss' : ''} ${big ? 'boss nemesis' : ''}">${art.enemyArt(d.art)}<span>${esc(name)}</span></div>`; }).join('');
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
  const r = G.run, M = D.MODES[r.mode], n = M.rounds, g = art.stairsGeom(n), W = art.ST.W, f = r.round, f0 = G.cabFrom || 0;
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
function sideHTML() {
  const r = G.run, S = r.hero, ch = D.CHARS[r.char], form = D.FORMS.find(f => f.id === r.form) || D.FORMS[0];
  const slots = Array.from({ length: D.RULES.maxSkills }, (_, i) => {
    const s = r.skills[i];
    if (!s) return '<div class="slot empty">wolny slot umiejętności</div>';
    const def = D.SKILLS[s.id], tile = D.TILES.find(t => t.skill === s.id);
    const mu = s.lvl >= 3 && def.muts[(s.mut || 1) - 1];
    const mv = r.skills.length > 1 && r.phase !== 'over';   // kolejność wolno zmieniać przed walką (strzałki albo przeciągnięcie)
    return `<div class="slot ${mv ? 'mv' : ''}" data-tipk="tile:${tile.id}" tabindex="0" ${mv ? `draggable="true" data-slot="${i}"` : ''}>${art.tileIcon(tile.id)}<div><div class="sn">${i + 1}. ${esc(def.name)}${mu ? `<span class="lv mut">${esc(mu.name)}</span>` : s.lvl >= 2 ? '<span class="lv">POZ. 2</span>' : ''}</div><div class="sd">${esc(def.text)}${s.lvl >= 2 ? ' (+30% mocy, -20% cooldownu)' : ''}${mu ? ' Mutacja: ' + esc(mu.text) : ''}</div></div>${mv ? `<div class="swp"><button class="swb" data-act="skillmove" data-v="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Przesuń wyżej" title="Przesuń wyżej (zmienia klawisz)">▲</button><button class="swb" data-act="skillmove" data-v="${i}" data-d="1" ${i === r.skills.length - 1 ? 'disabled' : ''} aria-label="Przesuń niżej" title="Przesuń niżej (zmienia klawisz)">▼</button></div>` : ''}</div>`;
  }).join('');
  const srow = (k, label, val) => `<dt data-tipk="stat:${k}" tabindex="0">${art.statIcon(k)}<span>${label}</span></dt><dd data-tipk="stat:${k}">${val}</dd>`;
  const rows = T.STAT_LABELS.map(([k, label, f]) => srow(k, label, f ? f(S[k]) : S[k])).join('')
    + (S.dmg ? srow('dmg', 'Obrażenia', `+${S.dmg}%`) : '') + (S.critMult !== 150 ? srow('critMult', 'Siła krytyka', `×${(S.critMult / 100).toFixed(2).replace('.', ',')}`) : '');
  const counts = {}; for (const id of r.tiles) { const t = TILE[id]; if (t && t.type !== 'skill') counts[id] = (counts[id] || 0) + 1; }
  const chips = Object.entries(counts).map(([id, n]) => {
    const t = TILE[id], g = t.grow ? Math.min(t.grow.max, (r.grow || {})[id] || 0) : 0, fw = (r.flawed || []).find(w => w.id === id);
    const tip = fw ? 'Wada fabryczna (+50% efektów): ' + (fw.flaw ? D.FLAWS[fw.flaw].name + '. ' + D.FLAWS[fw.flaw].text : 'ujawni się po walce') : '';
    return `<div class="chip r${t.rarity} ${fw ? 'flawed' : ''}" tabindex="0" data-tipk="tile:${id}" data-tipx="${esc(tip)}">${art.tileIcon(id)}${n > 1 ? `<sup>×${n}</sup>` : t.grow && g ? `<sup class="gr">+${g}</sup>` : ''}</div>`;
  }).join('');
  const pawnLine = r.pawned ? `<div class="setline pawn">W lombardzie: ${esc(TILE[r.pawned.id].name)}${r.pawned.canRedeem ? ` (wykup za ${r.pawned.cost} Ziaren tylko na tym piętrze)` : ' (wykup na następnym piętrze)'}</div>` : '';
  const foxLine = r.foxDebt ? `<div class="setline pawn">Lisy Windykatory silniejsze o ${r.foxDebt * D.RULES.pawnFox}% (przepadłe zastawy)</div>` : '';
  const sets = Object.entries(D.SETS).map(([id, st]) => { const n = setOwned(id); if (!n) return ''; const total = D.TILES.filter(t => t.set === id).length; return `<div class="setline" data-tipk="set:${id}" tabindex="0">Zestaw ${st.name} ${n}/${total}${n >= 2 ? ': ' + st.b2 : ''}${n >= 3 ? '; ' + st.b3 : ''}${n >= 4 && st.b4 ? '; ' + st.b4 : ''}</div>`; }).join('');
  const mss = Object.entries(D.MILESTONES).map(([id, m]) => { const n = Math.floor(r.tiles.filter(x => x === id).length / D.MILESTONE_EVERY); return n ? `<div class="setline ms">${esc(m.name)}${n > 1 ? ' ×' + n : ''}: ${esc(m.text)}</div>` : ''; }).join('');
  const pct = Math.max(0, Math.min(100, r.hp / S.maxHp * 100));
  return `<aside class="side">
    <div class="panel hero-card">${art.heroArt(r.char, r.form)}<div><div class="hero-top"><div><div class="nm">${esc(ch.name)}</div><div class="fm">${esc(form.name)}</div></div>${r.badges && r.badges.length ? `<div class="bdgs" aria-label="Odznaki (${r.badges.length})">${r.badges.map(b => `<div class="chip badge" tabindex="0" data-tipk="badge:${b}">${art.badgeIcon(b)}</div>`).join('')}</div>` : ''}</div>
      <div class="hpbar" style="margin-top:6px"><i style="width:${pct}%"></i><b><span data-ctr="hp">${r.hp}</span> / ${S.maxHp}</b></div></div></div>
    <div class="panel"><h4>Umiejętności aktywne</h4><div class="slots">${slots}</div></div>
    <div class="panel"><h4>Statystyki</h4>${zoneCompareHTML()}<dl class="stats">${rows}</dl></div>
    <div class="panel"><h4>Kafelki (${r.tiles.length})</h4>${chips ? `<div class="chips">${chips}</div>` : '<span class="hint">Jeszcze nic. Wybierz pierwszy kafelek.</span>'}${sets}${mss}${pawnLine}${foxLine}</div></aside>`;
}
// Liczniki tablicy rozdzielczej: licznik odcinkowy wyniku i przewijanie wartości przy zmianie (zielony / czerwony błysk).
const odoHTML = (n, len) => String(Math.max(0, n | 0)).padStart(len, '0').split('').map(d => `<i>${d}</i>`).join('');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)');
function rollCounters() {
  const prev = G.ctr || (G.ctr = {}), runId = G.run && G.run.id;
  if (prev._run !== runId) { for (const k of Object.keys(prev)) delete prev[k]; prev._run = runId; }
  for (const el of document.querySelectorAll('[data-ctr]')) {
    const k = el.dataset.ctr, to = k === 'score' ? G.run.score : k === 'coins' ? G.run.coins : G.run.hp, from = prev[k];
    prev[k] = to;
    if (from === undefined || from === to) continue;
    const cell = el.closest('.disp, .hpbar') || el;
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
  h *= (100 + (gm.enemyHp || 0)) / 100; a *= (100 + (gm.enemyAtk || 0)) / 100;
  const n = r.zone === 0 ? 1.5 : 2, eHp = avg('hp') * h * n, eArm = avg('armor'), eDps = avg('atk') * a * avg('aspd') / 100 * n * (100 - avg('evade')) / 100;
  const crit = 1 + (S.crit || 0) * ((S.critMult || 150) - 100) / 10000;
  const dps = Math.max(0.1, S.atk * (100 + (S.dmg || 0)) / 100 * S.aspd / 100 * crit * 100 / (100 + eArm));
  const taken = Math.max(0.05, eDps * 100 / (100 + S.armor) * (100 - Math.min(75, S.evade || 0)) / 100 - (S.regen || 0));
  return { off: 10 / (eHp / dps), def: (S.maxHp / taken) / 20 };
}
function zoneCompareHTML() {
  const c = zoneCompare(); if (!c) return '';
  const bar = (k, label, v, tip) => { const lv = v < 0.75 ? 'lo' : v > 1.3 ? 'hi' : 'ok', word = { lo: 'słabo', ok: 'OK', hi: 'mocno' }[lv];
    return `<div class="zc ${lv}" tabindex="0" data-tip="${esc(tip)}">${art.statIcon(k)}<span class="zl">${label}</span><span class="zb"><i style="width:${Math.round(Math.min(1, v / 2) * 100)}%"></i><u></u></span><b>${word}</b></div>`; };
  return `<div class="zcmp" aria-label="Porównanie z wrogami strefy">${bar('atk', 'Atak', c.off, 'Jak szybko pokonasz typową grupę wrogów tej strefy (Atak, Tempo, Kryt, Obrażenia kontra ich Życie i Pancerz).')}${bar('armor', 'Obrona', c.def, 'Jak długo wytrzymasz ciosy typowej grupy wrogów tej strefy (Życie, Pancerz, Unik, Regeneracja kontra ich Atak).')}</div>`;
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
function topbarHTML() {
  const r = G.run, M = D.MODES[r.mode];
  return `<div class="topbar dash"><span class="brand">BULGOT</span>
    <span class="disp lift" title="Piętro ${r.round} z ${r.rounds}" aria-label="Piętro ${r.round} z ${r.rounds}"><i class="arr" aria-hidden="true">▲</i><b>${String(r.round).padStart(2, '0')}</b><small>/${r.rounds}</small></span><span class="zone-name" title="${esc(T.ZONE_NAMES[r.zone])}">${esc(T.ZONE_NAMES[r.zone])}</span><span class="spacer"></span>
    <span class="disp coins" title="Ziarna: waluta na rerolle i zakupy. Odsetki po wygranej walce: +${Math.min(r.interestMax || 3, Math.floor(r.coins / D.RULES.interestPer))}">${art.coinIcon()}<b data-ctr="coins">${r.coins}</b></span>
    ${r.decree && D.DECREES[r.decree] ? `<span class="pill dec" tabindex="0" title="${esc(D.DECREES[r.decree].name + ': ' + D.DECREES[r.decree].text)}">${art.decreeIcon()} Okólnik</span>` : ''}
    <span class="pill mode">${M.name}</span>${r.garnek ? `<span class="pill g" title="Temperatura Garnka ${r.garnek}: ${esc(D.GARNEK[r.garnek].name)}">Garnek ${r.garnek}<span class="gname"> · ${D.GARNEK[r.garnek].name}</span></span>` : ''}
    <span class="disp odo" title="Wynik na żywo" aria-label="Wynik ${r.score}"><b data-ctr="score" data-odo="6">${odoHTML(r.score, 6)}</b></span>
    <button class="btn small menubtn" data-act="menu" title="Menu (Esc)" aria-label="Menu">${art.menuIcon()}</button></div>`;
}
function stageHTML() {
  const r = G.run;
  if (r.phase === 'offer') return stageOffer();
  if (r.phase === 'event') { const kd = r.pending.kind; return kd === 'shop' ? stageShop() : kd === 'contract' ? stageContract() : kd === 'shrine' ? stageShrine() : stageGamble(); }
  if (r.phase === 'badge') return stageBadge();
  if (r.phase === 'door') return stageDoor();
  if (r.phase === 'bonus') return stageBonus();
  if (r.phase === 'fight') return stagePrep();
  return '';
}
function floorKron() {
  const r = G.run;
  if (r.boss) return T.BOSS_INTRO[r.boss].quote;
  return T.pickLine(T.OFFER_LINES[r.zone], r.round - 1);
}
// Odpoczynek: za Ziarna leczy część życia, raz na rundę, przed walką.
function restBtn() {
  const r = G.run, off = r.rested || r.hp >= r.maxHp || r.coins < r.restCost;
  const why = r.rested ? 'W tej rundzie już odpoczywałeś' : r.hp >= r.maxHp ? 'Masz pełne życie' : r.coins < r.restCost ? 'Za mało Ziaren' : 'Odpoczynek (klawisz O)';
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
const pawnable = () => { const r = G.run; return [...new Set(r.tiles)].filter(id => { const t = TILE[id]; return t && t.type !== 'skill' && !t.hidden && !(r.flawed || []).some(w => w.id === id); }); };
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
function stageOffer() {
  const r = G.run, cards = r.offer.map((id, i) => id ? offerCard(id, i) : '<div class="slotcard"><div class="tile gone">Dokupione</div></div>').join('');
  const cost = r.rerollCost, free = cost === 0;
  const lost = r.lostPawn && r.foxDebt ? `<div class="hint warn">Lis zatrzymał ${esc(TILE[r.lostPawn] ? TILE[r.lostPawn].name : '')}. Lisy Windykatory są silniejsze o ${r.foxDebt * D.RULES.pawnFox}%.</div>` : '';
  return `<div class="stage-title"><h2>Piętro ${r.round}${r.boss ? ' · BOSS' : ''}</h2><div class="sub">${esc(T.ZONE_NAMES[r.zone])}${r.elite ? ' · elitarny wróg' : ''}${decreeSub()}</div></div>
    <div class="kron">${esc(r.nemesisRound ? T.pickLine(T.NEMESIS_LINES, r.round) : floorKron())}</div>${decreeHTML()}${previewHTML()}
    <div class="cards">${cards}</div>
    <div class="actions"><button class="btn" data-act="reroll" ${r.coins < cost ? 'disabled' : ''}>Reroll ${free ? '(za darmo)' : `za ${cost} ${art.coinIcon()}`}</button>${restBtn()}${pawnBtn()}</div>${lost}
    <div class="hint">Jeden kafelek bierzesz za darmo (klawisze 1–${r.offer.length}), pozostałe możesz dokupić (Shift + cyfra). R przelosowuje ofertę, L otwiera Lombard. Strzałki i Enter też działają.</div>`;
}
function stageDoor() {
  const r = G.run, P = r.pending, a = D.AFFIXES[P.affix];
  const reward = P.reward === 'rare' ? 'wybór 1 z 3 rzadkich kafelków' : `+${P.coins} Ziaren`;
  const cards = [
    choiceCard(0, art.doorIcon(false), 'Zwykłe drzwi', 'Spokojne piętro: zwykli wrogowie i zwykła nagroda.'),
    choiceCard(1, art.doorIcon(true), 'Tylko dla personelu', `Pierwszy wróg ma cechę ${a.name} (${a.text}) i jest dużo silniejszy. Przychodzi najwyżej z jednym pomocnikiem.`, `<div class="tmeta"><span class="tag up">Nagroda: ${esc(reward)}</span></div>`),
  ].join('');
  return `<div class="stage-title"><h2>Piętro ${r.round}: Rozwidlenie Korytarza</h2><div class="sub">Masz ${r.hp} / ${r.maxHp} Życia. Wybierz drzwi.</div></div>
    <div class="kron">${esc(T.pickLine(T.DOOR_LINES, r.round))}</div>${decreeHTML(true)}<div class="cards">${cards}</div>`;
}
function stageShop() {
  const r = G.run, cards = r.pending.offer.map((id, i) => tileCard(id, { i, act: 'buy', price: shopPrice(TILE[id]) })).join('');
  return `<div class="stage-title"><h2>Sklepik Babci Kwoki</h2><div class="sub">Masz ${r.coins} ${art.coinIcon()} Ziaren</div></div>
    <div class="kron">Babcia nie bierze kart. Babcia bierze ziarno.</div><div class="cards">${cards}</div>
    <div class="actions"><button class="btn" data-act="leave">Wychodzę bez zakupu</button></div>`;
}
const shopPrice = t => { const p = Math.ceil(D.RULES.prices[t.rarity] * ((G.run && G.run.priceMul) || 100) / 100), d = G.run && G.run.buyDisc; return d ? Math.max(1, Math.floor(p * (100 - d) / 100)) : p; };
const setsOf = t => t.sets || (t.set ? [t.set] : []);
function stageGamble() {
  const r = G.run, c = r.coins, q = Math.max(1, Math.floor(c / 4)), h = Math.max(1, Math.floor(c / 2));
  const bets = c > 0 ? [...new Set([1, q, h, c])].filter(x => x <= c).map(x => `<button class="btn" data-act="bet" data-v="${x}">Stawiam ${x} ${art.coinIcon()}</button>`).join('') : '<span class="hint">Nie masz czym grać.</span>';
  return `<div class="stage-title"><h2>Hazard w Kurniku</h2><div class="sub">Rzut monetą: 50% podwajasz stawkę, 50% tracisz ją</div></div>
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
  return `<div class="stage-title"><h2>${fromDoor ? 'Łup zza drzwi dla personelu' : 'Nagroda za pokonanie bossa'}</h2><div class="sub">Wybierz jeden z trzech rzadkich lub lepszych kafelków</div></div>
    <div class="kron">${esc(fromDoor ? 'Ryzyko się opłaciło. Tym razem.' : T.BOSS_WIN_LINES[lastBoss()] || 'Boss padł, a łup czeka.')}</div><div class="cards">${cards}</div>`;
}
const lastBoss = () => { const b = G.run && G.run.stats.bossKills; return b && b[b.length - 1]; };
function setSpeed(v) {
  const F = G.fight; G.speed = v; store.set('bulgot:speed', v);
  if (F) { F.speed = v; const sb = $('#speedbtn'); if (sb) { sb.textContent = '×' + v; sb.title = 'Tempo walki (F): ' + SPEED_NOTE[v]; } }
  for (const b of document.querySelectorAll('[data-act=setspeed]')) { const on = +b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); }
  const n = $('#spdnote'); if (n) n.textContent = SPEED_NOTE[v];
}
function stagePrep() {
  const r = G.run;
  return `<div class="stage-title"><h2>Piętro ${r.round}: do walki!</h2><div class="sub">${esc(T.ZONE_NAMES[r.zone])}${decreeSub()}</div></div>
    <div class="kron">${esc(r.nemesisRound ? T.pickLine(T.NEMESIS_LINES, r.round + 1) : floorKron())}</div>${decreeHTML()}${previewHTML()}
    <div class="actions">${restBtn()}<button class="btn primary big" data-act="tofight" data-primary>Do walki!</button></div>
    ${speedPick()}
    <div class="hint">W walce użyjesz umiejętności klawiszami 1, 2, 3. P robi pauzę, F zmienia tempo. O to odpoczynek.</div>`;
}
// Tempo walki: wybór przed walką (zapamiętywany), w walce mały przycisk ×N i klawisz F.
const SPEED_NOTE = { 1: 'Spokojnie: pełny czas na serie umiejętności.', 2: 'Szybciej: walka i Okno Gdakania trwają o połowę krócej.', 3: 'Najszybciej: walka leci trzy razy szybciej, Okno Gdakania też. Trudniej o serie.' };
function speedPick() {
  return `<div class="speedpick" role="radiogroup" aria-label="Tempo walki"><span class="lab">Tempo walki</span>${[1, 2, 3].map(v => `<button class="spd${G.speed === v ? ' on' : ''}" data-act="setspeed" data-v="${v}" role="radio" aria-checked="${G.speed === v}">×${v}</button>`).join('')}<span class="note" id="spdnote">${SPEED_NOTE[G.speed]}</span></div>`;
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
  if (!own && slot === undefined && r.skills.length >= D.RULES.maxSkills) { askSlot(t, s => go(s, mut)); return true; }
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
function startFight(setup) {
  const run = G.run, f = new Fight(setup);
  const F = G.fight = { setup, f, inputs: [], queue: [], acc: 0, last: 0, speed: G.speed, paused: false, finishing: false, units: new Map(), raf: 0, bossBanner: false };
  G.screen = 'fight';
  const boss = setup.enemies.find(e => e.boss);
  $('#screen').innerHTML = `<div class="run" style="grid-template-columns:minmax(0,1fr);max-width:1240px">${topbarHTML()}
    <main class="stage fightwrap">
      <div class="arena z${setup.zone}" id="arena"><div class="pl pl-bg">${art.arenaBg(setup.zone)}</div><div class="pl pl-haze" aria-hidden="true"></div><div class="pl pl-fore" aria-hidden="true"></div><div class="vign"></div>
        <div class="hud"><div class="box">Piętro ${setup.round} · ${esc(T.ZONE_NAMES[setup.zone])}</div>
          <div class="box timer" id="timer"><span id="tt">0:00</span><div class="tb"><i id="tbi" style="width:0"></i><u></u></div></div>
          <div class="ctl"><button data-act="speed" id="speedbtn" title="Tempo walki (F): ${SPEED_NOTE[F.speed]}">×${F.speed}</button><button data-act="pause" id="pausebtn" title="Pauza (P)">Pauza</button></div></div>
        <div id="units"></div><div id="fxl"></div></div>
      <div class="console"><div class="gdak" id="gdak" title="Okno Gdakania: użyj kolejnej umiejętności, zanim pasek się wyczerpie (2. w serii +20%, 3. +50%, trzy różne = Popłoch)"><span class="gl">OKNO GDAKANIA</span><div class="gbar"><i id="gdaki"></i></div><b id="gdakn">–</b></div><div class="skillbar" id="skillbar"></div></div>
      <div class="kron" id="kline">${esc(boss ? T.BOSS_INTRO[boss.boss].quote : floorKron())}</div>
    </main></div>`;
  F.arena = $('#arena');
  // lekka paralaksa: tło, mgiełka i pierwszy plan przesuwają się za kursorem w różnym tempie (bez wpływu na walkę)
  if (!REDUCED.matches) F.arena.addEventListener('pointermove', ev => { const r = F.arena.getBoundingClientRect(); F.arena.style.setProperty('--px', ((ev.clientX - r.left) / r.width - .5).toFixed(3)); F.arena.style.setProperty('--py', ((ev.clientY - r.top) / r.height - .5).toFixed(3)); });
  makeUnit('hero', { name: D.CHARS[run.char].name, art: art.heroArt(run.char, run.form), left: 17 });
  for (const e of f.enemies) makeUnit(e.uid, { e, name: e.name, art: art.enemyArt(e.art) });
  layoutUnits(); buildSkillbar(); updateUI(true);
  if (boss) { bossIntro(boss); snd.sfx('boss'); } else if (setup.tpl && D.FLOOR_TPL[setup.tpl]) banner(D.FLOOR_TPL[setup.tpl].name + '!', D.FLOOR_TPL[setup.tpl].text, false); else banner('Walka!', '', false);
  F.last = 0; F.raf = requestAnimationFrame(frame);
}

function makeUnit(key, o) {
  const F = G.fight, e = o.e, boss = e && e.boss, small = e && e.minion;
  const el = document.createElement('div');
  el.className = `unit ${key === 'hero' ? 'hero' : 'enemy'} ${boss ? 'boss' : ''} ${small ? 'small' : ''} idle`;
  el.innerHTML = `<div class="plate"><div class="nm">${esc(o.name)}</div>${e && e.affixes ? `<div class="affl">${e.affixes.map(a => esc(D.AFFIXES[a].name)).join(' · ')}</div>` : ''}<div class="hpbar ${key === 'hero' ? '' : 'enemy'}"><i></i><b></b></div><div class="sts"></div></div><div class="sprite">${o.art}</div><div class="fxs"></div>`;
  if (o.left != null) el.style.left = o.left + '%';
  $('#units').appendChild(el);
  F.units.set(key, { el, spr: el.querySelector('.sprite'), bar: el.querySelector('.hpbar i'), txt: el.querySelector('.hpbar b'), fx: el.querySelector('.fxs'), sts: el.querySelector('.sts'), e, x: o.left || 0, flags: {} });
  return F.units.get(key);
}
function layoutUnits() {
  const F = G.fight, alive = F.f.enemies.filter(e => !e.dead), hasBoss = alive.some(e => e.boss);
  let k = 0, idx = 0;
  for (const e of alive) {
    const u = F.units.get(e.uid); if (!u) continue;
    let x;
    if (hasBoss) x = e.boss ? 84 : 38 + (k++) * 10;
    else { const n = alive.length; x = ({ 1: [72], 2: [60, 80], 3: [48, 66, 84] }[n] || [48, 66, 84])[idx]; }
    idx++; u.x = x; u.el.style.left = x + '%';
  }
}
function buildSkillbar() {
  const F = G.fight, sks = F.f.skills;
  const html = Array.from({ length: 3 }, (_, i) => {
    const s = sks[i];
    if (!s) return `<div class="sk none">slot ${i + 1} wolny</div>`;
    const def = D.SKILLS[s.id], tile = D.TILES.find(t => t.skill === s.id);
    return `<button class="sk" data-act="useskill" data-v="${i}" id="sk${i}"><span class="kbadge">${i + 1}</span>${art.tileIcon(tile.id)}<div class="sn">${esc(s.lvl >= 3 ? def.muts[(s.mut || 1) - 1].name : def.name)}${s.lvl >= 3 ? ' ★★' : s.lvl >= 2 ? ' ★' : ''}</div><span class="cdv"></span><span class="cdt"></span></button>`;
  }).join('');
  $('#skillbar').innerHTML = html;
}
function banner(text, sub, bad) {
  const b = document.createElement('div'); b.className = 'banner' + (bad ? ' bad' : '');
  b.innerHTML = `<b>${esc(text)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}`;
  $('#arena').appendChild(b); setTimeout(() => b.remove(), 1850);
}
function pop(text, cls, x, bottom = 60) {
  const d = document.createElement('div'); d.className = 'dmg ' + cls; d.textContent = text;
  d.style.left = (x + (Math.random() * 6 - 3)) + '%'; d.style.bottom = (bottom + Math.random() * 6) + '%';
  $('#fxl').appendChild(d); setTimeout(() => d.remove(), 1000);
}
const cls = (u, c, ms) => { u.spr.classList.remove(c); void u.spr.offsetWidth; u.spr.classList.add(c); setTimeout(() => u.spr.classList.remove(c), ms); };
// Wejście bossa jak w kinie: czarne pasy, plansza z imieniem i tytułem, tekst Kronikarza. Walka stoi (tylko obraz, zegar nie liczy).
function bossIntro(boss) {
  const F = G.fight, I = T.BOSS_INTRO[boss.boss] || { title: boss.name, quote: '' }, [nm, ...rest] = I.title.split(', ');
  const el = document.createElement('div'); el.className = 'cine'; el.setAttribute('role', 'status');
  el.innerHTML = `<i class="bar t"></i><i class="bar b"></i><div class="plate"><small>BOSS · PIĘTRO ${F.setup.round}</small><h3>${esc(nm)}</h3>${rest.length ? `<em>${esc(rest.join(', '))}</em>` : ''}<p>„${esc(I.quote)}”</p></div>`;
  F.arena.appendChild(el); F.stopUntil = performance.now() + 2300;
  setTimeout(() => el.classList.add('out'), 2000); setTimeout(() => el.remove(), 2500);
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

function onEvent(e) {
  const F = G.fight, f = F.f, hero = F.units.get('hero'), tu = k => F.units.get(k);
  switch (e.k) {
    case 'swing': cls(hero, 'lunge', 240); swoosh(hero); break;
    case 'hit': { const u = tu(e.to); if (!u) break; cls(u, 'flash', 110); if (!['burn', 'poison', 'bleed'].includes(e.kind)) cls(u, e.crit ? 'knockbig' : 'knock', 220); pop(e.crit ? e.d + '!' : e.d, e.crit ? 'crit' : e.kind === 'bleed' || e.kind === 'burn' || e.kind === 'poison' ? e.kind : e.kind === 'egg' ? 'egg' : '', u.x); snd.sfx(e.crit ? 'crit' : 'hit'); if (e.crit) shake(); break; }
    case 'hurt': { cls(hero, 'hurtshake', 260); pop('-' + e.d, e.kind === 'burn' ? 'hurt burn' : 'hurt', 17); const a = tu(e.from); if (a) cls(a, 'lunge', 240); snd.sfx('hurt'); if (e.d * 100 >= f.S.maxHp * 12 || e.crit) shake(); break; }
    case 'heal': pop('+' + e.n, 'heal', 17); snd.sfx('heal'); break;
    case 'miss': { const u = tu(e.to); if (u) pop('unik', 'txt', u.x); snd.sfx('miss'); break; }
    case 'dodge': pop('unik!', 'txt', 17); snd.sfx('miss'); break;
    case 'block': pop('blok', 'txt', 17); break;
    case 'shield': { const u = tu(e.to); if (u) pop('tarcza', 'txt', u.x); break; }
    case 'shieldhit': { const u = tu(e.to); if (u) pop(e.d, 'txt', u.x); snd.sfx('hit'); break; }
    case 'immune': { const u = tu(e.to); if (u) pop('nietykalny', 'txt', u.x); break; }
    case 'skill': { pop(e.mut ? D.SKILLS[e.id].muts[e.mut - 1].name : D.SKILLS[e.id].name, 'txt', 17, 74); snd.sfx('skill'); break; }
    case 'coin': pop('+' + e.n + ' Ziarno', 'txt gold', 17, 70); snd.sfx('coin'); break;
    case 'stun': snd.sfx('stun'); break;
    case 'freeze': { const u = tu(e.uid); if (u) pop('zamrożony!', 'txt frost', u.x, 74); snd.sfx('stun'); break; }
    case 'boom': { const u = tu(e.uid); if (u) pop('WYBUCH!', 'crit', u.x, 72); shake(); snd.sfx('egg'); break; }
    case 'rise': { const u = tu(e.uid); if (u) { u.el.classList.remove('dead'); pop('wstaje!', 'txt frost', u.x, 74); } snd.sfx('phase'); break; }
    case 'audit': { const u = tu(e.uid); if (u) pop('Audyt!', 'txt', u.x, 74); snd.sfx('stun'); break; }
    case 'resist': { const u = tu(e.to); if (u) pop('odporny', 'txt', u.x, 70); break; }
    case 'telegraph': snd.sfx('telegraph'); break;
    case 'egg': snd.sfx('egg'); break;
    case 'smoke': { pop('Chmura Dymu', 'txt', 17, 74); snd.sfx('heal'); const ar = F.arena; if (ar && !REDUCED.matches) { ar.classList.remove('smoked'); void ar.offsetWidth; ar.classList.add('smoked'); setTimeout(() => ar.classList.remove('smoked'), 1300); } break; }
    case 'okrzyk': banner('Ostatni Okrzyk!', 'Chwila nietykalności', false); break;
    case 'revive': banner('Gniazdo Zapasowe!', 'Kurczak wstaje z kolan', false); snd.sfx('heal'); break;
    case 'fury': banner('FURIA!', 'Wrogowie wpadają w szał', true); snd.sfx('fury'); F.arena.classList.add('furious'); if (!F.arena.querySelector('.beacons')) F.arena.insertAdjacentHTML('beforeend', '<div class="beacons" aria-hidden="true"><i></i><i></i></div>'); break;
    case 'summon': { const en = f.enemies.find(x => x.uid === e.uid); if (en) { makeUnit(en.uid, { e: en, name: en.name, art: art.enemyArt(en.art) }); layoutUnits(); } break; }
    case 'phase': banner('Faza ' + e.n, '', true); snd.sfx('phase'); shake(); break;
    case 'skubanie': banner('Skubanie!', 'Wyłączony kafelek: ' + TILE[e.tile].name, true); snd.sfx('phase'); break;
    case 'skubanie-end': pop('kafelek wraca', 'txt', 17, 74); break;
    case 'blockslot': banner('Restrukturyzacja', 'Slot ' + (e.slot + 1) + ' zablokowany', true); snd.sfx('phase'); break;
    case 'steal': pop('-1 Ziarno', 'txt', 17, 70); break;
    case 'kill': { const u = tu(e.uid); if (u) { u.el.classList.remove('idle'); u.el.classList.add('dead'); feathers(u); setTimeout(() => { u.el.remove(); F.units.delete(e.uid); }, 900); layoutUnits(); } break; }
    case 'react': { const u = tu(e.uid), R = D.REACTIONS[e.r]; if (u && R) { pop(R.name + '!', 'react ' + e.r, u.x, 80); burst(u, e.r); } if (e.r === 'szok') shake(); if (!REDUCED.matches) F.stopUntil = performance.now() + 120; snd.sfx('crit'); break; }
    case 'chain': pop('Seria ×' + e.n, 'txt gold', 17, 84); break;
    case 'seria': banner('Pełna Kurza Seria!', 'Popłoch: wrogowie ogłuszeni', false); snd.sfx('unlock'); shake(); break;
    case 'flaw': pop(e.f === 'samozaplon' ? 'Samozapłon!' : 'Usterka!', 'txt warn', 17, 80); snd.sfx('hurt'); break;
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
    u.bar.style.width = Math.max(0, e.hp / e.maxHp * 100) + '%'; u.txt.textContent = e.dead ? '' : Math.max(0, e.hp) + (e.shield > 0 ? ' +' + e.shield : '');
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
    gi.style.width = on ? (left / D.RULES.chainWindow * 100) + '%' : '0%'; $('#gdak').classList.toggle('on', on); const gn = $('#gdakn'), tx = on ? '×' + f.chain : '–'; if (gn.textContent !== tx) gn.textContent = tx; }
  f.skills.forEach((s, i) => {
    const b = $('#sk' + i); if (!b) return;
    const def = D.SKILLS[s.id], total = Math.floor((s.lvl >= 2 ? Math.floor(def.cd * 80 / 100) : def.cd) * (100 - (f.S.cdPct || 0)) / 100), blocked = tick < s.blockedUntil;
    const remain = Math.max(s.cd - tick, blocked ? s.blockedUntil - tick : 0), ready = remain <= 0;
    b.classList.toggle('ready', ready && !f.over); b.classList.toggle('blocked', blocked);
    b.querySelector('.cdv').style.transform = `scaleY(${ready ? 0 : Math.min(1, remain / total)})`;
    b.querySelector('.cdt').textContent = ready ? '' : (remain / 10).toFixed(1).replace('.', ',');
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
    F.acc += dt * F.speed;
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
function stopFight() { const F = G.fight; if (F) { cancelAnimationFrame(F.raf); } }

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
  G.screen = 'run'; INV.pending = invoiceOn() ? F.setup.round : 0; render(); showInvoice(j, F.setup.round);
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
    line: boss ? T.BOSS_WIN_LINES[boss] : T.pickLine(T.WIN_LINES, run.round), foot: T.pickLine(boss ? I.bossFooters : I.footers, run.round), stamp: boss ? I.bossStamp : I.stamp };
}

// ---------- Tablica Zarządu (korek z przybitymi fakturami za pokonane piętra, do końca runu) ----------
function boardHTML() {
  const r = G.run; if (!r) return '';
  const list = (r.board || []).slice().sort((a, b) => a.r - b.r);
  const slips = list.map(e => {
    const d = slipData(e.r) || {}, flag = d.imp && !d.seen, pend = INV.pending === e.r, pop = G.boardPop === e.r;
    const tip = `Piętro ${e.r}${e.boss ? ' (boss)' : ''}: faktura\nCzas walki ${secStr(e.ticks)} s, obrażenia ${fmtNum(e.dealt)}, wypłata +${e.reward} Ziaren${flag ? '\nZawiera ważną uwagę, otwórz ją!' : ''}\nKliknij, żeby otworzyć.`;
    return `<button class="slip ${e.boss ? 'boss' : ''} ${flag ? 'flag' : ''} ${pend ? 'pending' : ''} ${pop ? 'pop' : ''}" data-act="slip" data-f="${e.r}" data-tip="${esc(tip)}" style="--rot:${e.r * 37 % 9 - 4}deg;--dy:${e.r * 53 % 7 - 3}px" aria-label="Faktura za piętro ${e.r}"><i class="pin"></i><b>${e.r}</b><span class="sl"></span><span class="sl s2"></span>${flag ? '<em>!</em>' : ''}</button>`;
  }).join('');
  G.boardPop = 0;
  return `<section class="board" aria-label="Tablica Zarządu"><div class="board-head"><span class="board-title">Tablica Zarządu</span><span class="board-count">${list.length ? 'faktury: ' + list.length : ''}</span></div>
    <div class="slips">${slips || '<span class="board-empty">Tu zawisną faktury za pokonane piętra</span>'}</div></section>`;
}
const refreshBoard = () => { const b = $('.board'); if (b) b.outerHTML = boardHTML(); };
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
  // położenie: nad środkową kolumną (nie zasłania schodów po lewej ani panelu po prawej)
  const st = $('.stage'), rc = st && st.getBoundingClientRect();
  if (rc && rc.width > 0) { el.style.left = (rc.left + rc.width / 2) + 'px'; el.style.top = Math.max(10, rc.top + 2) + 'px'; el.style.maxWidth = Math.max(260, rc.width - 20) + 'px'; }
  INV.el = el; INV.ham = ham; INV.floor = d.f; INV.t0 = performance.now();
  const later = (ms, fn) => INV.timers.push(setTimeout(fn, ms)), hold = d.imp ? 3400 : 500;
  if (REDUCED.matches) { $('.inv-nail', el).style.setProperty('--sink', '34px'); $('.inv-nail', el).classList.add('on'); ham.remove(); INV.ham = null; later(2200 + (d.imp ? 3000 : 0), () => flyToBoard(false)); return; }
  later(760, () => $('.inv-nail', el).classList.add('on'));
  [1000, 1280, 1560].forEach((ms, i) => later(ms, () => strike(i + 1)));
  later(1900, () => ham.classList.add('away'));
  later(1950 + hold, () => flyToBoard(false));
}
// Pierwsza akcja gracza (klik, klawisz) skraca animację i wysyła fakturę na tablicę, ale dopiero po chwili, żeby nie zniknęła przypadkiem.
for (const ev of ['pointerdown', 'keydown']) document.addEventListener(ev, () => { if (INV.el && performance.now() - INV.t0 > 700) dismissInvoice(true); }, true);
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
  if (win) { store.set('bulgot:lastlose', 'null'); return winFacts({ mode: r.mode, garnek: r.garnek, seed }); }
  const k = r.killer, kd = k && (D.ENEMIES[k.enemy] || D.BOSSES[k.enemy]);
  const boss = M.bosses[r.round] ? D.BOSSES[M.bosses[r.round]] : null;
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
  const facts = pickFacts(endFacts(G.lastEndJ, win));
  // pełny ekran: po lewej scena, tytuł i ciekawostki; po prawej rachunek, rekordy, odblokowania i przyciski
  openOverlay(`<div class="endwrap ${win ? 'win' : 'lose'}"><div class="end-left">${scene}<h2 class="end-title ${win ? '' : 'lose'}">${win ? T.END_WIN.title : T.END_LOSE.title}</h2>
    ${lines.map(l => `<p class="lead">${esc(l)}</p>`).join('')}
    ${facts.length ? `<div class="facts">${facts.map((f, i) => `<div class="fact ${i ? 'second' : ''}" style="--i:${i}"><span class="fk">${i ? 'I jeszcze' : 'Ciekawostka'}</span>${esc(f.text)}</div>`).join('')}</div>` : ''}</div>
    <div class="end-right"><div class="end-scroll"><table class="scoretable"><tr><td>Ukończone piętra (${r.done} × ${D.RULES.scoreRound})</td><td>${fmtNum(r.done * D.RULES.scoreRound)}</td></tr>
      <tr><td>Ziarna w kieszeni (${r.coins} × ${D.RULES.scoreCoin})</td><td>${fmtNum(r.coins * D.RULES.scoreCoin)}</td></tr>
      <tr><td>Premia za szybkość walk</td><td>${fmtNum(r.timeBonus)}</td></tr>
      ${r.garnek ? `<tr><td>Mnożnik Garnka ${r.garnek} (${D.GARNEK[r.garnek].name})</td><td>×${mult.toFixed(2).replace('.', ',')}</td></tr>` : ''}
      <tr class="total"><td>Wynik</td><td id="endscore" data-v="${r.score}">${fmtNum(r.score)}</td></tr></table>
    ${e.newBest ? '<p class="lead" style="color:var(--gold)"><b>Nowy rekord życiowy w tym trybie!</b></p>' : ''}
    ${e.rank ? `<p class="lead">Miejsce w rankingu (${D.MODES[r.mode].name}): <b>#${e.rank}</b></p>` : ''}
    ${e.garnekUnlocked ? `<div class="unlock-box"><b>Odblokowano Temperaturę Garnka ${G.profile.garnek}: ${esc(D.GARNEK[G.profile.garnek].name)}</b></div>` : ''}${unlocksHTML(un)}${endMeta(j)}
    <div class="analyze" id="analyzebox">${analyzeHTML(r.id, !!(G.sentRuns && G.sentRuns[r.id]))}</div></div>
    <div class="actions end-actions"><button class="btn primary big" data-act="again" data-primary>Zagraj jeszcze raz</button><button class="btn" data-act="ranking">Ranking</button><button class="btn ghost" data-act="home">Menu</button></div></div></div>`, { force: true, cls: 'endfull' });
  G.screen = 'home'; render();
  countUp($('#endscore'), quiet);
}

// ---------- okna: ranking, księga, pomoc, ustawienia, menu ----------
// Ranking: jeden ogólny (punkty) albo przefiltrowany po postaci, poziomie Garnka i graczu. Klik w nick, postać lub Garnek w tabeli ustawia filtr.
const RK = { mode: null, char: '', garnek: '', nick: '' };
async function showRanking(mode, keep) {
  mode = mode || G.setup.mode;
  if (!keep) Object.assign(RK, { char: '', garnek: '', nick: '' });
  RK.mode = mode;
  const chars = Object.values(D.CHARS).filter(c => !c.secret || G.profile.chars.includes(c.id));
  const maxG = Math.max(G.profile.garnek | 0, 0);
  const sel = (id, label, opts, val) => `<label class="rkf"><span>${label}</span><select id="${id}" >${opts.map(([v, n]) => `<option value="${esc(v)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>`;
  openOverlay(`<h2>Ranking</h2><div class="tabs">${['quick', 'full'].map(m => `<button class="tab ${m === mode ? 'on' : ''}" data-act="ranktab" data-v="${m}">${D.MODES[m].name}</button>`).join('')}</div>
    <div class="rkbar">${sel('rk-char', 'Postać', [['', 'Wszystkie'], ...chars.map(c => [c.id, c.name])], RK.char)}${sel('rk-garnek', 'Poziom trudności', [['', 'Wszystkie'], ...D.GARNEK.map((g, i) => [i, 'Garnek ' + i + ' · ' + g.name]).slice(0, Math.max(maxG, +RK.garnek || 0) + 1)], RK.garnek)}
      <label class="rkf"><span>Gracz</span><input id="rk-nick" type="text" maxlength="16" placeholder="dowolny nick" value="${esc(RK.nick)}" autocomplete="off"></label>
      <button class="btn small" data-act="rkme" title="Pokaż tylko moje wyniki">Tylko ja</button><button class="btn small ghost" data-act="rkclear" ${RK.char || RK.garnek !== '' || RK.nick ? '' : 'disabled'}>Wyczyść filtry</button></div>
    <div id="rk" class="lead">Ładowanie…</div>`);
  const q = new URLSearchParams(); if (RK.char) q.set('char', RK.char); if (RK.garnek !== '') q.set('garnek', RK.garnek); if (RK.nick.trim()) q.set('nick', RK.nick.trim());
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
    return `<tr class="${x.nick === mynick ? 'me' : ''} ${i < 3 ? 'top' + (i + 1) : ''}"><td class="pos">${i + 1}</td><td><button class="lnk" data-act="rknickset" data-v="${esc(x.nick)}" title="Pokaż wyniki tego gracza">${av}${esc(x.nick)}</button>${x.win ? ' ★' : ''}</td><td><button class="lnk" data-act="rkcharset" data-v="${esc(x.char)}" title="Filtruj po tej postaci">${esc(cn)}</button></td><td><button class="lnk" data-act="rkgset" data-v="${x.garnek | 0}" title="Filtruj po tym poziomie">G${x.garnek | 0}</button></td><td>${x.rounds}</td><td class="sc">${fmtNum(x.score)}</td></tr>`;
  }).join('')}</tbody></table>`;
}
// Księga: nowe wpisy (odblokowane kafelki, przepisy, reakcje) od ostatniego otwarcia dostają naklejkę „Nowy wpis!”.
function bookSeen() { try { return new Set(JSON.parse(store.get('bulgot:bookseen') || '[]')); } catch (e) { return new Set(); } }
function bookMark(keys) { const s = bookSeen(); for (const k of keys) s.add(k); store.set('bulgot:bookseen', JSON.stringify([...s])); }
function showBook(tab = 'tiles') {
  const seen = bookSeen(), fresh = k => !seen.has(k), marks = [];
  const p = G.profile, tabs = [['tiles', 'Kafelki'], ['hatch', 'Wylęgarnia'], ['react', 'Reakcje i Okólniki'], ['badges', 'Odznaki'], ['chars', 'Postacie'], ['foes', 'Wrogowie'], ['unl', 'Odblokowania']];
  let body = '';
  if (tab === 'react') {
    const known = p.reactions || []; for (const k of known) marks.push('x:' + k);
    body = `<p class="lead">Dwa różne efekty na jednym wrogu łączą się w reakcję. Odkryte: ${known.length} z ${Object.keys(D.REACTIONS).length}.</p><div class="ms-grid">${Object.values(D.REACTIONS).map(R => known.includes(R.id)
      ? `<div class="ms-row entry ${fresh('x:' + R.id) ? 'fresh' : ''}">${fresh('x:' + R.id) ? '<span class="newtag">Nowy wpis!</span>' : ''}${art.statusIcon(R.of[0])}${art.statusIcon(R.of[1])}<div><b>${esc(R.name)}</b><br><span>${esc(R.text)}</span></div></div>`
      : `<div class="ms-row unknown">${art.statusIcon(R.of[0])}${art.statusIcon(R.of[1])}<div><b>?</b><br><span>${esc(D.STATUS[R.of[0]].name)} + ${esc(D.STATUS[R.of[1]].name)}: jeszcze nie odkryto.</span></div></div>`).join('')}</div>
      <div class="sec">Okólniki Zarządu</div><p class="lead">Każda strefa w runie ma inny okólnik, który zmienia zasady.</p><div class="ms-grid">${Object.values(D.DECREES).map(d => `<div class="ms-row">${art.decreeIcon()}<div><b>${esc(d.name)}</b><br><span>${esc(d.text)}</span></div></div>`).join('')}</div>
      <div class="sec">Wady fabryczne</div><p class="lead">Kafelek z pieczątką „Wada fabryczna” jest o 50% mocniejszy, ale po następnej walce ujawnia jedną z wad:</p><div class="ms-grid">${Object.values(D.FLAWS).map(f => `<div class="ms-row"><div><b>${esc(f.name)}</b><br><span>${esc(f.text)}</span></div></div>`).join('')}</div>
      ${p.nemesis ? `<div class="sec">Twój Nemezis</div><p class="lead">${esc(p.nemesis.name)}, cecha ${esc(D.AFFIXES[p.nemesis.affix].name)}${p.nemesis.tile ? ', ukradł ' + esc(TILE[p.nemesis.tile].name) : ''}. Pokonane Nemezis: ${p.counters.nemesisKills || 0}.</p>` : ''}`;
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
      <div class="sec">Progi statystyk</div><p class="lead">Każde ${D.MILESTONE_EVERY} kopie tej samej statystyki dają dodatkową premię.</p><div class="ms-grid">${ms}</div>`;
  } else if (tab === 'tiles') {
    const list = D.TILES.filter(t => !t.hatched && !t.hidden);
    body = `<p class="lead">Poznane: ${list.filter(t => !t.lock || p.tiles.includes(t.id)).length} z ${list.length} dostępnych kafelków.</p><div class="book-grid">${list.map((t, i) => {
      const open = !t.lock || p.tiles.includes(t.id), u = t.lock && D.UNLOCK_BY_ID[t.lock];
      const nw = open && t.lock && fresh('t:' + t.id); if (open && t.lock) marks.push('t:' + t.id);
      return `<div class="entry ${nw ? 'fresh' : ''}" style="--i:${i}">${tileCard(t.id, { static: true, mini: true, i, locked: !open, lockText: open ? '' : (u && u.text) })}${nw ? '<span class="newtag">Nowy wpis!</span>' : ''}</div>`;
    }).join('')}</div>`;
  } else if (tab === 'chars') {
    body = `<div class="opts">${Object.values(D.CHARS).map(c => { const open = p.chars.includes(c.id), u = c.lock && D.UNLOCK_BY_ID[c.lock], v = charView(c, open);
      return `<div class="opt char-opt ${open ? '' : 'locked'}">${v.hidden ? art.eggArt(c.id, false) : art.portrait(c.id)}<div><h3>${esc(v.name)}</h3><p>${esc(v.style)}. ${esc(v.text)}</p>${open ? '' : `<div class="lockmsg">Zablokowana: ${esc(v.hidden ? '???' : u ? u.text : '')}</div>`}</div></div>`; }).join('')}</div>
      <div class="sec">Formy kurczaka</div><div class="opts">${D.FORMS.map(f => `<div class="opt char-opt">${art.heroArt('pyrtek', f.id)}<div><h3>${f.name}</h3><p>Od ${Math.round(f.from * 100)}% runu.</p></div></div>`).join('')}</div>`;
  } else if (tab === 'foes') {
    const all = [...Object.values(D.ENEMIES), ...Object.values(D.BOSSES)];
    body = `<div class="opts">${all.map(d => `<div class="opt char-opt">${art.enemyArt(d.art)}<div><h3>${esc(d.name)}</h3><p>${d.title ? esc(d.title) + '. ' : ''}${esc(d.text)}</p><p style="color:var(--faint)">${d.zone != null && !d.minion ? 'Strefa ' + D.ZONES[d.zone].tag : d.minion ? 'Przywoływany przez bossa' : 'Boss'}</p></div></div>`).join('')}</div>`;
  } else {
    body = `<div class="help-list">${D.UNLOCKS.map(u => { const done = p.unlocked.includes(u.id), sec = u.secret && !done; return `<div><b>${done ? '✓' : '○'} ${esc(sec ? '???' : unlockName(u))}</b><p>${esc(sec ? '???' : u.text)}${done ? ' (zdobyte)' : ''}</p></div>`; }).join('')}</div>`;
  }
  // księga: okładka, zakładki-przekładki, strona z wklejanymi wpisami
  openOverlay(`<div class="booktabs tabs">${tabs.map(([id, n], i) => `<button class="tab ${id === tab ? 'on' : ''}" data-act="booktab" data-v="${id}" style="--t:${i}">${n}</button>`).join('')}</div><div class="bookpage"><h2>Księga Kurnika</h2>${body}</div>`, { cls: 'bookmodal' });
  bookMark(marks);
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
    <div class="setrow"><span>Muzyka (bulgocząca pętla)</span><button class="toggle ${snd.settings.music ? 'on' : ''}" data-act="tmusic">${snd.settings.music ? 'WŁ.' : 'WYŁ.'}</button></div>
    <div class="setrow"><span>Faktura po wygranej walce (zamiast okna wyniku)</span><button class="toggle ${invoiceOn() ? 'on' : ''}" data-act="tinv">${invoiceOn() ? 'WŁ.' : 'WYŁ.'}</button></div>
    <div class="setrow"><span>Domyślna szybkość walki</span><button class="toggle on" data-act="speed2">×${G.speed}</button></div>
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
  setgarnek: b => { const v = +b.dataset.v; if (v <= G.profile.garnek) { G.setup.garnek = v; render(); } else toast('Wygraj run na poziomie ' + (v - 1) + ', żeby odblokować ten Garnek.'); },
  start: async () => {
    const s = G.setup; if (!G.profile.chars.includes(s.char)) s.char = 'pyrtek'; if (s.garnek > G.profile.garnek) s.garnek = 0;
    const j = await act('start', { mode: s.mode, char: s.char, garnek: s.garnek }); if (!j) return;
    snd.sfx('bulgot'); G.screen = 'run'; render();
    if (!store.get('bulgot:intro')) showIntro();
  },
  introgo: () => { closeOverlay(); },
  pick: b => doPick(+b.dataset.i),
  buyoffer: b => doBuy(+b.dataset.i),
  pawnmenu: () => showPawn(),
  tuck: b => tuckLetter(b.closest('.decree')),
  pawn: async b => { const id = b.dataset.v; const j = await act('pawn', { id }); if (!j) return; closeOverlay(); snd.sfx('coin'); toast(`Lis wziął ${TILE[id].name} i dał ${j.price} Ziaren. Wykup na następnym piętrze.`, false, 4200); render(); },
  redeem: async () => { const j = await act('redeem'); if (!j) return; snd.sfx('unlock'); toast(`Wykupiono: ${TILE[j.redeemed].name} (-${j.cost} Ziaren)`); render(); },
  will: async b => { const i = +b.dataset.i; const j = await act('will', { i }); if (!j) return; snd.sfx(i >= 0 ? 'unlock' : 'click'); showEnd({ ...G.lastEndJ, will: j.will || null }, true); },
  rest: async () => { const j = await act('rest'); if (!j) return; snd.sfx('heal'); toast('Odpoczynek: +' + j.healed + ' życia (-' + j.cost + ' Ziarna)'); render(); },
  reroll: async () => { const j = await act('reroll'); if (j) { snd.sfx('reroll'); render(); } },
  buy: b => ACT.shopgo(+b.dataset.i),
  shopgo: async (i, slot, mut) => { const t = TILE[G.run.pending.offer[i]]; if (needChoice(t, slot, mut, (s2, m2) => ACT.shopgo(i, s2, m2))) return;
    const j = await act('shop', { i, slot, mut }); if (j) { snd.sfx('coin'); render(); } },
  leave: async () => { const j = await act('shop', { i: -1 }); if (j) render(); },
  bet: async b => { const j = await act('bet', { amount: +b.dataset.v }); if (!j) return; if (j.bet) { snd.sfx(j.won ? 'win' : 'lose'); toast(j.won ? `Wygrana! +${j.bet} Ziaren` : `Pudło. -${j.bet} Ziaren`, !j.won); } render(); },
  bonuspick: b => ACT.bonusgo(+b.dataset.i),
  choose: async b => { const j = await act('choose', { i: +b.dataset.i }); if (j) { snd.sfx('pick'); render(); } },
  bonusgo: async (i, slot, mut) => { const t = TILE[G.run.offer[i]]; if (needChoice(t, slot, mut, (s2, m2) => ACT.bonusgo(i, s2, m2))) return;
    const j = await act('bonus', { i, slot, mut }); if (j) { snd.sfx('pick'); render(); } },
  mutchoose: b => { const cb = G.mutCb; closeOverlay(); G.mutCb = null; if (cb) cb(+b.dataset.v); },
  slotchoose: b => { const cb = G.slotCb; closeOverlay(); G.slotCb = null; if (cb) cb(+b.dataset.v); },
  tofight: async () => {
    const j = await act('fightstart'); if (!j) return;
    snd.unlock(); startFight(j.setup);
  },
  useskill: b => useSkill(+b.dataset.v),
  speed: b => { setSpeed(G.speed >= 3 ? 1 : G.speed + 1); },
  setspeed: b => { setSpeed(+b.dataset.v); },
  speed2: b => { G.speed = G.speed >= 3 ? 1 : G.speed + 1; store.set('bulgot:speed', G.speed); b.textContent = '×' + G.speed; },
  pause: () => { const F = G.fight; if (!F || F.finishing) return; F.paused = !F.paused; $('#pausebtn').classList.toggle('on', F.paused); $('#pausebtn').textContent = F.paused ? 'Wznów' : 'Pauza'; if (F.paused) banner('Pauza', 'Naciśnij P, aby wznowić', false); },
  'retry-fight': () => { closeOverlay(); const cb = G.retryCb; G.retryCb = null; if (cb) cb(); },
  close: () => { closeOverlay(); if (G.screen === 'run' && G.run && G.run.phase === 'bonus') render(); },
  ranking: () => showRanking(G.run ? G.run.mode : G.setup.mode),
  slip: b => showSlip(+b.dataset.f),
  ranktab: b => showRanking(b.dataset.v, true),
  rkme: () => { const me = playerNow(); if (me) { RK.nick = me.nick; showRanking(RK.mode, true); } },
  rkclear: () => { Object.assign(RK, { char: '', garnek: '', nick: '' }); showRanking(RK.mode, true); },
  rknickset: b => { RK.nick = b.dataset.v; showRanking(RK.mode, true); },
  rkcharset: b => { RK.char = b.dataset.v; showRanking(RK.mode, true); },
  rkgset: b => { RK.garnek = b.dataset.v; showRanking(RK.mode, true); },
  book: () => showBook(), booktab: b => showBook(b.dataset.v),
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
  if (k === 'escape') { if (overlayOpen()) { if (!$('#overlay').dataset.force) closeOverlay(); } else if (G.screen === 'run' || (G.screen === 'fight' && G.fight && !G.fight.finishing)) { const m = $('[data-act="menu"]'); m && m.click(); } return; }
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
    else if (k === 'f') ACT.speed();
    return;
  }
  const r = G.run;
  if (G.screen === 'run' && r) {
    const dg = /^Digit([1-5])$/.exec(e.code);
    if (r.phase === 'offer' && dg && e.shiftKey) { const b = $(`.cards [data-act=buyoffer][data-i="${+dg[1] - 1}"]`); if (b && !b.disabled) b.click(); }
    else if ((r.phase === 'badge' || r.phase === 'door' || (r.phase === 'event' && r.pending && (r.pending.kind === 'contract' || r.pending.kind === 'shrine'))) && ['1', '2', '3'].includes(k)) { const b = $(`.cards [data-act=choose][data-i="${+k - 1}"]`); if (b) b.click(); }
    else if (r.phase === 'offer' && ['1', '2', '3', '4', '5'].includes(k)) { const b = $(`.cards [data-act=pick][data-i="${+k - 1}"]`); if (b) b.click(); }
    else if (r.phase === 'offer' && k === 'l') { const b = $('[data-act="pawnmenu"], [data-act="redeem"]'); if (b && !b.disabled) b.click(); }
    else if (r.phase === 'fight' && k === 'f') ACT.speed();
    else if ((r.phase === 'offer' || r.phase === 'fight') && k === 'o') { const b = $('[data-act="rest"]'); if (b && !b.disabled) b.click(); }
    else if (r.phase === 'offer' && k === 'r') { const b = $('[data-act="reroll"]'); if (b && !b.disabled) b.click(); }
    else if ((r.phase === 'event' || r.phase === 'bonus') && ['1', '2', '3'].includes(k)) { const b = $(`.cards [data-i="${+k - 1}"]`); if (b) b.click(); }
    else if (k === 'enter') { const p = $('[data-primary]'); if (p) p.click(); }
  } else if (k === 'enter') { const p = $('[data-primary]'); if (p) p.click(); }
});

init();
