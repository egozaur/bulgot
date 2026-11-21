// Bulgot: interfejs gry. Cała logika (oferty, rerolle, walki, wyniki) liczy serwer; tu rysujemy ekrany i prowadzimy walkę na żywo
// tym samym silnikiem (shared/sim.js), a lista wejść gracza leci na serwer, który powtarza walkę i wydaje wynik.
import { call, ranks as apiRanks, LOCAL, getPlayer, playerNow, avatarUrl } from './api.js';
import * as D from './shared/data.js';
import { Fight, MAX_TICKS, FURY_FROM } from './shared/sim.js';
import * as art from './art.js';
import * as T from './text.js';
import * as snd from './audio.js';

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
window.__bulgot = G;      // podgląd stanu w testach

// Skalowanie: na dużych monitorach cały interfejs rośnie (zoom), a --vh to wysokość okna w jednostkach po przeskalowaniu.
function applyScale() {
  const w = innerWidth, h = innerHeight, sc = Math.max(1, Math.min(w / 1440, h / 860, 2.2)), root = document.documentElement;
  root.style.setProperty('--s', sc.toFixed(3)); root.style.setProperty('--vh', (h / sc).toFixed(1) + 'px');
}
applyScale(); addEventListener('resize', applyScale);

// ---------- drobne narzędzia UI ----------
function toast(msg, err = false, ms = 2800) {
  const d = document.createElement('div'); d.className = 'toast' + (err ? ' err' : ''); d.textContent = msg;
  $('#toasts').prepend(d); setTimeout(() => d.remove(), ms);
}
function openOverlay(html, { narrow = false, force = false, cls = '' } = {}) {
  const o = $('#overlay'); o.hidden = false; o.dataset.force = force ? '1' : '';
  const F = G.fight; if (F && !F.paused && !F.finishing) { F.paused = true; F.autoPaused = true; }   // okno zatrzymuje walkę
  o.innerHTML = `<div class="modal ${narrow ? 'narrow' : ''} ${cls}" role="dialog" aria-modal="true">${force ? '' : '<button class="btn small ghost modal-x" data-act="close" aria-label="Zamknij">Zamknij ✕</button>'}${html}</div>`;
}
function closeOverlay() {
  const o = $('#overlay'); o.hidden = true; o.innerHTML = ''; o.dataset.force = '';
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
    case 'run': root.innerHTML = renderRun(); rollCounters(); break;
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
    ${art.towerArt()}
    <h1 class="logo" aria-label="Bulgot">${[...'BULGOT'].map(c => `<span>${c}</span>`).join('')}</h1>
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
    const open = p.chars.includes(c.id), u = c.lock && D.UNLOCK_BY_ID[c.lock];
    return `<button class="opt char-opt ${s.char === c.id ? 'on' : ''} ${open ? '' : 'locked'}" data-act="setchar" data-v="${c.id}" ${open ? '' : 'aria-disabled="true"'}>${art.portrait(c.id, 'pyrtek')}<div><h3>${esc(c.name)}</h3><p>${esc(c.style)}. ${esc(c.text)}</p>${open ? '' : `<div class="lockmsg">Zablokowana: ${esc(u ? u.text : '')}</div>`}</div></button>`;
  }).join('');
  const gs = D.GARNEK.map((g, i) => `<button class="gbtn ${s.garnek === i ? 'on' : ''} ${i > p.garnek ? 'locked' : ''}" data-act="setgarnek" data-v="${i}" ${i > p.garnek ? 'aria-disabled="true"' : ''}>${i} · ${g.name}</button>`).join('');
  const g = D.GARNEK[s.garnek];
  return `<div class="setup">
    <div class="screen-head"><h2>Nowy run</h2><button class="btn small ghost" data-act="home">← Menu</button></div>
    <div class="sec">Tryb</div><div class="opts">${modes}</div>
    <div class="sec">Postać <small>nowe odblokowujesz osiągnięciami</small></div><div class="opts chars">${chars}</div>
    <div class="sec">Temperatura Garnka <small>wygrana na poziomie N odblokowuje N+1 i podnosi mnożnik wyniku o 25%</small></div>
    <div class="garnek-row">${gs}</div><div class="gtext"><b>${esc(g.name)}.</b> ${esc(g.text)}</div>
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
    return `<div class="preview fog"><div class="lab">${fogLab}</div><div class="pv">${art.mysteryArt()}<span>?</span></div>${risky ? aff : ''}<div class="tplnote">Od Garnka 1 skład pięter jest tajemnicą. Bossów zapowiada pasek pięter.</div></div>`;
  }
  return `<div class="preview ${nem ? 'nem' : ''}"><div class="lab">${lab}</div>${items}${aff}${tp}</div>`;
}
// Okólnik Zarządu bieżącej strefy: pełna ramka na pierwszym piętrze strefy (i przy drzwiach), potem tylko nazwa w podtytule i pigułka na pasku.
const zoneAt = (mode, n) => { for (const z of D.MODES[mode].zones) if (n <= z.upTo) return z.zone; return 2; };
function decreeHTML(always = false) {
  const r = G.run, d = r.decree && D.DECREES[r.decree];
  if (!d || !(always || r.round === 1 || zoneAt(r.mode, r.round - 1) !== zoneAt(r.mode, r.round))) return '';
  return `<div class="decree">${art.decreeIcon()}<div><b>Nowy Okólnik Zarządu: ${esc(d.name)}.</b> ${esc(d.text)}</div></div>`;
}
const decreeSub = () => { const d = G.run.decree && D.DECREES[G.run.decree]; return d ? ` · <span class="dsub" title="${esc(d.text)}">Okólnik: ${esc(d.name)}</span>` : ''; };
function towerHTML() {
  const r = G.run, M = D.MODES[r.mode];
  let rows = '';
  for (let n = M.rounds; n >= 1; n--) {
    const nem = r.nemesis && !r.nemesis.beaten && r.nemesis.round === n, door = (r.doors || []).includes(n);
    const cls = ['floor', n < r.round || r.phase === 'over' && n <= r.done ? 'done' : '', n === r.round && r.phase !== 'over' ? 'now' : '', M.bosses[n] ? 'boss' : '', nem ? 'nem' : '', door ? 'door' : ''].join(' ');
    const tip = 'Piętro ' + n + (nem ? ': ' + r.nemesis.name : door ? ': Rozwidlenie Korytarza' : '');
    rows += `<div class="${cls}" title="${esc(tip)}">${M.bosses[n] || nem ? art.skullIcon() : ''}${nem ? '!' : ''}${door && !nem ? '<span class="dr">⌂</span>' : ''}${n}</div>`;
  }
  return `<aside class="tower" aria-label="Postęp"><h4>Piętra</h4>${rows}<div class="pot"></div></aside>`;
}
function sideHTML() {
  const r = G.run, S = r.hero, ch = D.CHARS[r.char], form = D.FORMS.find(f => f.id === r.form) || D.FORMS[0];
  const slots = Array.from({ length: D.RULES.maxSkills }, (_, i) => {
    const s = r.skills[i];
    if (!s) return '<div class="slot empty">wolny slot umiejętności</div>';
    const def = D.SKILLS[s.id], tile = D.TILES.find(t => t.skill === s.id);
    const mu = s.lvl >= 3 && def.muts[(s.mut || 1) - 1];
    return `<div class="slot">${art.tileIcon(tile.id)}<div><div class="sn">${i + 1}. ${esc(def.name)}${mu ? `<span class="lv mut">${esc(mu.name)}</span>` : s.lvl >= 2 ? '<span class="lv">POZ. 2</span>' : ''}</div><div class="sd">${esc(def.text)}${s.lvl >= 2 ? ' (+30% mocy, -20% cooldownu)' : ''}${mu ? ' Mutacja: ' + esc(mu.text) : ''}</div></div></div>`;
  }).join('');
  const srow = (k, label, val) => `<dt>${art.statIcon(k)}<span>${label}</span></dt><dd>${val}</dd>`;
  const rows = T.STAT_LABELS.map(([k, label, f]) => srow(k, label, f ? f(S[k]) : S[k])).join('')
    + (S.dmg ? srow('dmg', 'Obrażenia', `+${S.dmg}%`) : '') + (S.critMult !== 150 ? srow('critMult', 'Siła trafienia krytycznego', `×${(S.critMult / 100).toFixed(2).replace('.', ',')}`) : '');
  const counts = {}; for (const id of r.tiles) { const t = TILE[id]; if (t && t.type !== 'skill') counts[id] = (counts[id] || 0) + 1; }
  const chips = Object.entries(counts).map(([id, n]) => {
    const t = TILE[id], g = t.grow ? Math.min(t.grow.max, (r.grow || {})[id] || 0) : 0, fw = (r.flawed || []).find(w => w.id === id);
    let tip = t.name + '\n' + t.text;
    if (t.grow) tip += '\nLicznik: ' + g + ' / ' + t.grow.max;
    if (fw) tip += '\nWada fabryczna (+50% efektów): ' + (fw.flaw ? D.FLAWS[fw.flaw].name + '. ' + D.FLAWS[fw.flaw].text : 'ujawni się po walce');
    return `<div class="chip r${t.rarity} ${fw ? 'flawed' : ''}" tabindex="0" data-tip="${esc(tip)}">${art.tileIcon(id)}${n > 1 ? `<sup>×${n}</sup>` : t.grow && g ? `<sup class="gr">+${g}</sup>` : ''}</div>`;
  }).join('');
  const pawnLine = r.pawned ? `<div class="setline pawn">W lombardzie: ${esc(TILE[r.pawned.id].name)}${r.pawned.canRedeem ? ` (wykup za ${r.pawned.cost} Ziaren tylko na tym piętrze)` : ' (wykup na następnym piętrze)'}</div>` : '';
  const foxLine = r.foxDebt ? `<div class="setline pawn">Lisy Windykatory silniejsze o ${r.foxDebt * D.RULES.pawnFox}% (przepadłe zastawy)</div>` : '';
  const sets = Object.entries(D.SETS).map(([id, st]) => { const n = setOwned(id); if (!n) return ''; const total = D.TILES.filter(t => t.set === id).length; return `<div class="setline">Zestaw ${st.name} ${n}/${total}${n >= 2 ? ': ' + st.b2 : ''}${n >= 3 ? '; ' + st.b3 : ''}${n >= 4 && st.b4 ? '; ' + st.b4 : ''}</div>`; }).join('');
  const mss = Object.entries(D.MILESTONES).map(([id, m]) => { const n = Math.floor(r.tiles.filter(x => x === id).length / D.MILESTONE_EVERY); return n ? `<div class="setline ms">${esc(m.name)}${n > 1 ? ' ×' + n : ''}: ${esc(m.text)}</div>` : ''; }).join('');
  const pct = Math.max(0, Math.min(100, r.hp / S.maxHp * 100));
  return `<aside class="side">
    <div class="panel hero-card">${art.heroArt(r.char, r.form)}<div><div class="nm">${esc(ch.name)}</div><div class="fm">${esc(form.name)}</div>
      <div class="hpbar" style="margin-top:6px"><i style="width:${pct}%"></i><b><span data-ctr="hp">${r.hp}</span> / ${S.maxHp}</b></div></div></div>
    <div class="panel"><h4>Umiejętności aktywne</h4><div class="slots">${slots}</div></div>
    ${r.badges && r.badges.length ? `<div class="panel"><h4>Odznaki (${r.badges.length})</h4><div class="chips">${r.badges.map(b => `<div class="chip badge" tabindex="0" data-tip="${esc(D.BADGES[b].name)}\n${esc(D.BADGES[b].text)}">${art.badgeIcon(b)}</div>`).join('')}</div></div>` : ''}
    <div class="panel"><h4>Statystyki</h4><dl class="stats">${rows}</dl></div>
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
function showPawn() {
  const r = G.run, cards = pawnable().map((id, i) => `<div class="slotcard">${tileCard(id, { i, static: true, mini: true })}<button class="btn small buy" data-act="pawn" data-v="${id}">Zastaw za ${D.RULES.prices[TILE[id].rarity]} ${art.coinIcon()}</button></div>`).join('');
  openOverlay(`<h2>Lombard Lisa</h2><p class="lead">Lis da ci od ręki pełną cenę kafelka. Wykupisz go tylko na <b>następnym piętrze</b> za ${D.RULES.pawnBack}% ceny. Jeśli nie wykupisz, kafelek przepada, a Lisy Windykatory w tym runie są o ${D.RULES.pawnFox}% silniejsze.</p><div class="cards pawn-grid">${cards}</div>`);
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
  return `<div class="run">${topbarHTML()}${towerHTML()}<main class="stage">${stageHTML()}</main>${sideHTML()}</div>`;
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
      <div class="arena" id="arena">${art.arenaBg(setup.zone)}<div class="vign"></div>
        <div class="hud"><div class="box">Piętro ${setup.round} · ${esc(T.ZONE_NAMES[setup.zone])}</div>
          <div class="box timer" id="timer"><span id="tt">0:00</span><div class="tb"><i id="tbi" style="width:0"></i><u></u></div></div>
          <div class="ctl"><button data-act="speed" id="speedbtn" title="Tempo walki (F): ${SPEED_NOTE[F.speed]}">×${F.speed}</button><button data-act="pause" id="pausebtn" title="Pauza (P)">Pauza</button></div></div>
        <div id="units"></div><div id="fxl"></div></div>
      <div class="skillbar" id="skillbar"></div>
      <div class="kron" id="kline">${esc(boss ? T.BOSS_INTRO[boss.boss].quote : floorKron())}</div>
    </main></div>`;
  F.arena = $('#arena');
  makeUnit('hero', { name: D.CHARS[run.char].name, art: art.heroArt(run.char, run.form), left: 17 });
  for (const e of f.enemies) makeUnit(e.uid, { e, name: e.name, art: art.enemyArt(e.art) });
  layoutUnits(); buildSkillbar(); updateUI(true);
  if (boss) { banner(T.BOSS_INTRO[boss.boss].title, 'BOSS', false); snd.sfx('boss'); } else if (setup.tpl && D.FLOOR_TPL[setup.tpl]) banner(D.FLOOR_TPL[setup.tpl].name + '!', D.FLOOR_TPL[setup.tpl].text, false); else banner('Walka!', '', false);
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
function shake() { const a = $('#arena'); if (!a) return; a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); }

function onEvent(e) {
  const F = G.fight, f = F.f, hero = F.units.get('hero'), tu = k => F.units.get(k);
  switch (e.k) {
    case 'swing': cls(hero, 'lunge', 240); break;
    case 'hit': { const u = tu(e.to); if (!u) break; cls(u, 'flash', 110); pop(e.crit ? e.d + '!' : e.d, e.crit ? 'crit' : e.kind === 'bleed' || e.kind === 'burn' || e.kind === 'poison' ? e.kind : e.kind === 'egg' ? 'egg' : '', u.x); snd.sfx(e.crit ? 'crit' : 'hit'); if (e.crit) shake(); break; }
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
    case 'okrzyk': banner('Ostatni Okrzyk!', 'Chwila nietykalności', false); break;
    case 'revive': banner('Gniazdo Zapasowe!', 'Kurczak wstaje z kolan', false); snd.sfx('heal'); break;
    case 'fury': banner('FURIA!', 'Wrogowie wpadają w szał', true); snd.sfx('fury'); F.arena.classList.add('furious'); break;
    case 'summon': { const en = f.enemies.find(x => x.uid === e.uid); if (en) { makeUnit(en.uid, { e: en, name: en.name, art: art.enemyArt(en.art) }); layoutUnits(); } break; }
    case 'phase': banner('Faza ' + e.n, '', true); snd.sfx('phase'); shake(); break;
    case 'skubanie': banner('Skubanie!', 'Wyłączony kafelek: ' + TILE[e.tile].name, true); snd.sfx('phase'); break;
    case 'skubanie-end': pop('kafelek wraca', 'txt', 17, 74); break;
    case 'blockslot': banner('Restrukturyzacja', 'Slot ' + (e.slot + 1) + ' zablokowany', true); snd.sfx('phase'); break;
    case 'steal': pop('-1 Ziarno', 'txt', 17, 70); break;
    case 'kill': { const u = tu(e.uid); if (u) { u.el.classList.remove('idle'); u.el.classList.add('dead'); setTimeout(() => { u.el.remove(); F.units.delete(e.uid); }, 650); layoutUnits(); } break; }
    case 'react': { const u = tu(e.uid), R = D.REACTIONS[e.r]; if (u && R) pop(R.name + '!', 'react ' + e.r, u.x, 80); if (e.r === 'szok') shake(); snd.sfx('crit'); break; }
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
    const fr = tick < e.frozenUntil && !e.dead; if (fr !== !!fl.fr) { fl.fr = fr; u.spr.classList.toggle('frozen', fr); }
    const gd = !!e.immune && !e.dead; if (gd !== !!fl.gd) { fl.gd = gd; u.fx.querySelectorAll('.guardfx').forEach(n => n.remove()); if (gd) u.fx.insertAdjacentHTML('beforeend', '<div class="guardfx"></div>'); }
  }
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
  if (!F.paused && !F.f.over) {
    F.acc += dt * F.speed;
    while (F.acc >= 100 && !F.f.over) { F.acc -= 100; stepOnce(); }
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
  G.screen = 'run'; render(); showResult(j);
}
function retryOverlay() {
  return new Promise(res => { G.retryCb = res; openOverlay('<h2>Brak połączenia</h2><p class="lead">Nie udało się rozliczyć walki z serwerem. Twój run jest bezpieczny, spróbuj ponownie.</p><div class="actions"><button class="btn primary" data-act="retry-fight" data-primary>Spróbuj jeszcze raz</button></div>', { narrow: true, force: true }); });
}

function showResult(j) {
  const r = j.result, run = G.run, boss = j.boss;
  const line = boss ? T.BOSS_WIN_LINES[boss] : T.pickLine(T.WIN_LINES, run.round);
  const un = takeUnlocks();
  openOverlay(`<h2>${boss ? 'Boss pokonany!' : 'Piętro zdobyte!'}</h2><p class="lead">${esc(line)}</p>
    <div class="res-grid"><div class="res-cell"><b>${(r.ticks / 10).toFixed(1).replace('.', ',')} s</b><span>czas walki</span></div>
    <div class="res-cell"><b>${fmtNum(r.dealt)}</b><span>zadane obrażenia</span></div>
    <div class="res-cell"><b>+${j.reward}</b><span>Ziarna ${art.coinIcon()}</span></div>
    <div class="res-cell"><b>${run.hp}/${run.maxHp}</b><span>życie po leczeniu</span></div></div>
    ${r.stolen ? `<p class="hint">Złodzieje ukradli ci ${r.stolen} Ziaren.</p>` : ''}${r.usedRevive ? '<p class="hint">Gniazdo Zapasowe zostało zużyte.</p>' : ''}${resultExtras(j)}${unlocksHTML(un)}
    <div class="actions" style="margin-top:12px"><button class="btn primary big" data-act="close" data-primary>${j.bonus ? 'Wybierz nagrodę' : 'Dalej'}</button></div>`, { narrow: true, force: true });
}
// Dopiski do wyniku walki: Odsetki, drzwi, serie, reakcje, kafelki rosnące, ujawnione wady, Nemezis.
function resultExtras(j) {
  const r = j.result || {}, out = [];
  if (j.nemesis) out.push(`<div class="unlock-box"><b>Sprawiedliwości stało się zadość!</b><div class="hint" style="text-align:left">Nemezis pokonany. Dostajesz Odznakę Sprawiedliwość Kurnika${j.nemesis.tile ? ' i odzyskujesz: ' + esc(TILE[j.nemesis.tile].name) : ''}.</div></div>`);
  const coins = [];
  if (j.interest) coins.push(`Odsetki w Spiżarni: +${j.interest}`);
  if (j.doorCoins) coins.push(`łup zza drzwi: +${j.doorCoins}`);
  if (coins.length) out.push(`<p class="hint">${coins.join(' · ')} ${art.coinIcon()}</p>`);
  const fx = [];
  if (r.chains) fx.push(`Pełne Kurze Serie: ${r.chains}`);
  if (r.reactions) fx.push(`reakcje: ${r.reactions} (${(r.reactSeen || []).map(k => D.REACTIONS[k] ? D.REACTIONS[k].name : k).join(', ')})`);
  if (fx.length) out.push(`<p class="hint">${esc(fx.join(' · '))}</p>`);
  if (j.grew && j.grew.length) out.push(`<p class="hint">Urosło: ${j.grew.map(id => esc(TILE[id].name) + ' (' + Math.min(TILE[id].grow.max, (G.run.grow || {})[id] || 0) + '/' + TILE[id].grow.max + ')').join(', ')}</p>`);
  if (j.revealed && j.revealed.length) out.push(j.revealed.map(w => `<div class="unlock-box flawbox"><b>Wada ujawniona: ${esc(TILE[w.id].name)} · ${esc(D.FLAWS[w.flaw].name)}</b><div class="hint" style="text-align:left">${esc(D.FLAWS[w.flaw].text)} Działa od teraz. Wylęgarnia usuwa wadę razem ze składnikiem.</div></div>`).join(''));
  return out.join('');
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
function showEnd(j, quiet = false) {
  const r = G.run, e = j.end || (G.lastEndJ && G.lastEndJ.end) || {}, win = r.ended === 'win', un = takeUnlocks();
  const mult = (100 + D.RULES.garnekScore * r.garnek) / 100;
  G.lastEnd = e; G.lastEndJ = j;
  if (!quiet) { snd.sfx(win ? 'win' : 'lose'); if (!win) snd.sfx('bulgot'); }
  const lines = win ? T.END_WIN.lines : [T.pickLine(T.LOSE_LINES, r.done)];
  openOverlay(`<h2 class="end-title ${win ? '' : 'lose'}">${win ? T.END_WIN.title : T.END_LOSE.title}</h2>
    ${lines.map(l => `<p class="lead">${esc(l)}</p>`).join('')}
    <table class="scoretable"><tr><td>Ukończone piętra (${r.done} × ${D.RULES.scoreRound})</td><td>${fmtNum(r.done * D.RULES.scoreRound)}</td></tr>
      <tr><td>Ziarna w kieszeni (${r.coins} × ${D.RULES.scoreCoin})</td><td>${fmtNum(r.coins * D.RULES.scoreCoin)}</td></tr>
      <tr><td>Premia za szybkość walk</td><td>${fmtNum(r.timeBonus)}</td></tr>
      ${r.garnek ? `<tr><td>Mnożnik Garnka ${r.garnek} (${D.GARNEK[r.garnek].name})</td><td>×${mult.toFixed(2).replace('.', ',')}</td></tr>` : ''}
      <tr class="total"><td>Wynik</td><td>${fmtNum(r.score)}</td></tr></table>
    ${e.newBest ? '<p class="lead" style="color:var(--gold)"><b>Nowy rekord życiowy w tym trybie!</b></p>' : ''}
    ${e.rank ? `<p class="lead">Miejsce w rankingu (${D.MODES[r.mode].name}): <b>#${e.rank}</b></p>` : ''}
    ${e.garnekUnlocked ? `<div class="unlock-box"><b>Odblokowano Temperaturę Garnka ${G.profile.garnek}: ${esc(D.GARNEK[G.profile.garnek].name)}</b></div>` : ''}${unlocksHTML(un)}${endMeta(j)}
    <div class="actions" style="margin-top:14px"><button class="btn primary big" data-act="again" data-primary>Zagraj jeszcze raz</button><button class="btn" data-act="ranking">Ranking</button><button class="btn ghost" data-act="home">Menu</button></div>`, { force: true });
  G.screen = 'home'; render();
}

// ---------- okna: ranking, księga, pomoc, ustawienia, menu ----------
async function showRanking(mode) {
  mode = mode || G.setup.mode;
  openOverlay(`<h2>Ranking</h2><div class="tabs">${['quick', 'full'].map(m => `<button class="tab ${m === mode ? 'on' : ''}" data-act="ranktab" data-v="${m}">${D.MODES[m].name}</button>`).join('')}</div><div id="rk" class="lead">Ładowanie…</div>`);
  const { j } = await apiRanks(mode);
  const box = $('#rk'); if (!box) return;
  if (!j || !j.list) { box.textContent = (j && j.err) || 'Nie udało się pobrać rankingu.'; return; }
  if (!j.list.length) { box.textContent = 'Nikt jeszcze nie wszedł na szczyt. Bądź pierwszy.'; return; }
  const me = playerNow(), mynick = me ? me.nick : '';
  box.className = ''; box.innerHTML = `<table class="rank-list"><thead><tr><th></th><th>Gracz</th><th>Postać</th><th>Piętra</th><th style="text-align:right">Wynik</th></tr></thead><tbody>${j.list.map((x, i) => {
    const av = x.avatar && !LOCAL ? `<span class="av"><img src="${esc(avatarUrl(x.avatar))}" alt="" onerror="this.remove()"></span>` : `<span class="av">${esc((x.nick || '?')[0].toUpperCase())}</span>`;
    return `<tr class="${x.nick === mynick ? 'me' : ''}"><td class="pos">${i + 1}</td><td>${av}${esc(x.nick)}${x.win ? ' ★' : ''}</td><td>${esc((D.CHARS[x.char] || {}).name || '')}${x.garnek ? ' · G' + x.garnek : ''}</td><td>${x.rounds}</td><td class="sc">${fmtNum(x.score)}</td></tr>`;
  }).join('')}</tbody></table>`;
}
function showBook(tab = 'tiles') {
  const p = G.profile, tabs = [['tiles', 'Kafelki'], ['hatch', 'Wylęgarnia'], ['react', 'Reakcje i Okólniki'], ['badges', 'Odznaki'], ['chars', 'Postacie'], ['foes', 'Wrogowie'], ['unl', 'Odblokowania']];
  let body = '';
  if (tab === 'react') {
    const known = p.reactions || [];
    body = `<p class="lead">Dwa różne efekty na jednym wrogu łączą się w reakcję. Odkryte: ${known.length} z ${Object.keys(D.REACTIONS).length}.</p><div class="ms-grid">${Object.values(D.REACTIONS).map(R => known.includes(R.id)
      ? `<div class="ms-row">${art.statusIcon(R.of[0])}${art.statusIcon(R.of[1])}<div><b>${esc(R.name)}</b><br><span>${esc(R.text)}</span></div></div>`
      : `<div class="ms-row unknown">${art.statusIcon(R.of[0])}${art.statusIcon(R.of[1])}<div><b>?</b><br><span>${esc(D.STATUS[R.of[0]].name)} + ${esc(D.STATUS[R.of[1]].name)}: jeszcze nie odkryto.</span></div></div>`).join('')}</div>
      <div class="sec">Okólniki Zarządu</div><p class="lead">Każda strefa w runie ma inny okólnik, który zmienia zasady.</p><div class="ms-grid">${Object.values(D.DECREES).map(d => `<div class="ms-row">${art.decreeIcon()}<div><b>${esc(d.name)}</b><br><span>${esc(d.text)}</span></div></div>`).join('')}</div>
      <div class="sec">Wady fabryczne</div><p class="lead">Kafelek z pieczątką „Wada fabryczna” jest o 50% mocniejszy, ale po następnej walce ujawnia jedną z wad:</p><div class="ms-grid">${Object.values(D.FLAWS).map(f => `<div class="ms-row"><div><b>${esc(f.name)}</b><br><span>${esc(f.text)}</span></div></div>`).join('')}</div>
      ${p.nemesis ? `<div class="sec">Twój Nemezis</div><p class="lead">${esc(p.nemesis.name)}, cecha ${esc(D.AFFIXES[p.nemesis.affix].name)}${p.nemesis.tile ? ', ukradł ' + esc(TILE[p.nemesis.tile].name) : ''}. Pokonane Nemezis: ${p.counters.nemesisKills || 0}.</p>` : ''}`;
  } else if (tab === 'badges') {
    body = `<p class="lead">Odznaki Pracownicze dostajesz za pokonanie bossa albo elitarnego wroga (wybór 1 z 3) i w Kapliczce. Działają do końca runu.</p><div class="ms-grid">${Object.entries(D.BADGES).map(([id, b]) => `<div class="ms-row">${art.badgeIcon(id)}<div><b>${esc(b.name)}</b><br><span>${esc(b.text)}</span></div></div>`).join('')}</div>
      <div class="sec">Cechy elitarnych wrogów</div><p class="lead">Elita ma jedną cechę (od Garnka 2: dwie). Podgląd piętra pokazuje je przed walką.</p><div class="ms-grid">${Object.values(D.AFFIXES).map(a => `<div class="ms-row"><div><b>${esc(a.name)}</b><br><span>${esc(a.text)}</span></div></div>`).join('')}</div>`;
  } else if (tab === 'hatch') {
    const known = p.recipes || [];
    const rows = D.RECIPES.map(r => known.includes(r.out)
      ? `<div class="hatch-row">${r.of.map(c => tileCard(c, { static: true, mini: true })).join('<div class="hplus">+</div>')}<div class="hplus">=</div>${tileCard(r.out, { static: true, mini: true })}</div>`
      : '<div class="hatch-row unknown"><div class="qcard">?</div><div class="hplus">+</div><div class="qcard">?</div><div class="hplus">=</div><div class="qcard leg">?</div></div>').join('');
    const ms = Object.entries(D.MILESTONES).map(([id, m]) => `<div class="ms-row">${art.tileIcon(id)}<div><b>${D.MILESTONE_EVERY}× ${esc(TILE[id].name)} = ${esc(m.name)}</b><br><span>${esc(m.text)}</span></div></div>`).join('');
    body = `<p class="lead">Dwa pasujące przedmioty wykluwają legendarny. Odkryte przepisy: ${known.length} z ${D.RECIPES.length}. Na kartach w ofercie znacznik <b>Wylęgarnia!</b> mówi, że kafelek dokończy przepis.</p>${rows}
      <div class="sec">Progi statystyk</div><p class="lead">Każde ${D.MILESTONE_EVERY} kopie tej samej statystyki dają dodatkową premię.</p><div class="ms-grid">${ms}</div>`;
  } else if (tab === 'tiles') {
    const list = D.TILES.filter(t => !t.hatched && !t.hidden);
    body = `<p class="lead">Poznane: ${list.filter(t => !t.lock || p.tiles.includes(t.id)).length} z ${list.length} dostępnych kafelków.</p><div class="book-grid">${list.map((t, i) => {
      const open = !t.lock || p.tiles.includes(t.id), u = t.lock && D.UNLOCK_BY_ID[t.lock];
      return tileCard(t.id, { static: true, mini: true, i, locked: !open, lockText: open ? '' : (u && u.text) });
    }).join('')}</div>`;
  } else if (tab === 'chars') {
    body = `<div class="opts">${Object.values(D.CHARS).map(c => { const open = p.chars.includes(c.id), u = c.lock && D.UNLOCK_BY_ID[c.lock];
      return `<div class="opt char-opt ${open ? '' : 'locked'}">${art.portrait(c.id)}<div><h3>${esc(c.name)}</h3><p>${esc(c.style)}. ${esc(c.text)}</p>${open ? '' : `<div class="lockmsg">Zablokowana: ${esc(u ? u.text : '')}</div>`}</div></div>`; }).join('')}</div>
      <div class="sec">Formy kurczaka</div><div class="opts">${D.FORMS.map(f => `<div class="opt char-opt">${art.heroArt('pyrtek', f.id)}<div><h3>${f.name}</h3><p>Od ${Math.round(f.from * 100)}% runu.</p></div></div>`).join('')}</div>`;
  } else if (tab === 'foes') {
    const all = [...Object.values(D.ENEMIES), ...Object.values(D.BOSSES)];
    body = `<div class="opts">${all.map(d => `<div class="opt char-opt">${art.enemyArt(d.art)}<div><h3>${esc(d.name)}</h3><p>${d.title ? esc(d.title) + '. ' : ''}${esc(d.text)}</p><p style="color:var(--faint)">${d.zone != null && !d.minion ? 'Strefa ' + D.ZONES[d.zone].tag : d.minion ? 'Przywoływany przez bossa' : 'Boss'}</p></div></div>`).join('')}</div>`;
  } else {
    body = `<div class="help-list">${D.UNLOCKS.map(u => { const done = p.unlocked.includes(u.id); return `<div><b>${done ? '✓' : '○'} ${esc(unlockName(u))}</b><p>${esc(u.text)}${done ? ' (zdobyte)' : ''}</p></div>`; }).join('')}</div>`;
  }
  openOverlay(`<h2>Księga Kurnika</h2><div class="tabs">${tabs.map(([id, n]) => `<button class="tab ${id === tab ? 'on' : ''}" data-act="booktab" data-v="${id}">${n}</button>`).join('')}</div>${body}`);
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
    return `<tr><td>${when(h.ended)}</td><td>${esc(D.MODES[h.mode].name)}${h.garnek ? ' · G' + h.garnek : ''}</td><td>${esc((D.CHARS[h.char] || {}).name || h.char)}</td><td>${res}</td><td>${h.floorsDone}/${D.MODES[h.mode].rounds}</td><td class="sc">${fmtNum(h.score)}</td><td>${esc(killer)}</td></tr>`;
  }).join('');
  openOverlay(`<h2>Historia gier (test)</h2><p class="lead">Ostatnie ${last.length} runów zapisuje się automatycznie, z dziennikiem każdej rundy. Po testach napisz, żeby ją przeanalizować.</p>
    ${rows ? `<table class="rank-list"><thead><tr><th>Kiedy</th><th>Tryb</th><th>Postać</th><th>Wynik</th><th>Piętra</th><th style="text-align:right">Punkty</th><th>Pokonał go</th></tr></thead><tbody>${rows}</tbody></table>` : '<p class="lead">Brak zakończonych runów. Zagraj i wróć tutaj.</p>'}
    <div class="actions" style="margin-top:14px"><button class="btn primary" data-act="histdl" ${rows ? '' : 'disabled'}>Pobierz JSON (ostatnie 10)</button><button class="btn" data-act="histcopy" ${rows ? '' : 'disabled'}>Skopiuj JSON</button></div>`);
}
function showHelp() {
  openOverlay(`<h2>Jak grać</h2><p class="lead">${esc(T.INTRO.join(' '))}</p><div class="help-list">${T.HELP.map(([h, t]) => `<div><b>${h}</b><p>${esc(t)}</p></div>`).join('')}</div>`);
}
function showSettings() {
  openOverlay(`<h2>Dźwięk i walka</h2><div class="setrow"><span>Efekty dźwiękowe</span><button class="toggle ${snd.settings.sfx ? 'on' : ''}" data-act="tsfx">${snd.settings.sfx ? 'WŁ.' : 'WYŁ.'}</button></div>
    <div class="setrow"><span>Muzyka (bulgocząca pętla)</span><button class="toggle ${snd.settings.music ? 'on' : ''}" data-act="tmusic">${snd.settings.music ? 'WŁ.' : 'WYŁ.'}</button></div>
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
  setchar: b => { if (G.profile.chars.includes(b.dataset.v)) { G.setup.char = b.dataset.v; render(); } else toast('Ta postać jest zablokowana: ' + (D.UNLOCK_BY_ID[D.CHARS[b.dataset.v].lock] || {}).text); },
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
  ranktab: b => showRanking(b.dataset.v),
  book: () => showBook(), booktab: b => showBook(b.dataset.v),
  history: () => showHistory(),
  histdl: () => { const blob = new Blob([JSON.stringify(G.hist || [], null, 1)], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bulgot-historia.json'; document.body.appendChild(a); a.click(); a.remove(); toast('Pobrano bulgot-historia.json'); },
  histcopy: async () => { try { await navigator.clipboard.writeText(JSON.stringify(G.hist || [], null, 1)); toast('Skopiowano historię do schowka'); } catch (e) { toast('Nie udało się skopiować. Użyj przycisku Pobierz.', true); } },
  help: () => showHelp(), settings: () => showSettings(), menu: () => showMenu(),
  tsfx: b => { snd.setSfx(!snd.settings.sfx); showSettings(); },
  tmusic: b => { snd.setMusic(!snd.settings.music); showSettings(); },
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
