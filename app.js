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
    if (j.unlocks && j.unlocks.length) { for (const u of j.unlocks) { G.unlocks.push(u); toast('Odblokowano: ' + unlockName(u), false, 4200); } snd.sfx('unlock'); }
    return j;
  } finally { G.busy = false; document.body.classList.remove('busy'); }
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
    case 'run': root.innerHTML = renderRun(); break;
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
    </div></div></div>`;
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
    <div class="start-row"><button class="btn primary big" data-act="start" data-primary>Do garnka!</button></div></div>`;
}

// ---------- karty kafelków ----------
function setOwned(set) { return G.run ? G.run.tiles.filter(id => TILE[id] && TILE[id].set === set).length : 0; }
function tileCard(id, o = {}) {
  const t = TILE[id], i = o.i == null ? 0 : o.i, run = G.run;
  const own = run && t.type === 'skill' ? run.skills.find(s => s.id === t.skill) : null;
  const tags = [`<span class="tag">${D.TYPES[t.type]}</span>`, `<span class="tag rar">${D.RARITY[t.rarity]}</span>`];
  if (t.set) tags.push(`<span class="tag set">${D.SETS[t.set].name}${run && !o.static ? ' ' + (setOwned(t.set) + 1) : ''}</span>`);
  if (own) tags.push('<span class="tag up">Poziom 2</span>');
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
  const items = ids.map(id => { const d = enemyDef(id); const boss = !!D.BOSSES[id]; return `<div class="pv ${boss ? 'boss' : ''}">${art.enemyArt(d.art)}<span>${esc(id === 'kot-ochroniarz' && r.boss === 'prezes' ? 'Ochroniarz' : d.name)}</span></div>`; }).join('');
  return `<div class="preview"><div class="lab">${r.boss ? 'Boss tego piętra' : r.elite ? 'Elitarny wróg na piętrze' : 'Na tym piętrze czekają'}</div>${items}</div>`;
}
function towerHTML() {
  const r = G.run, M = D.MODES[r.mode];
  let rows = '';
  for (let n = M.rounds; n >= 1; n--) {
    const cls = ['floor', n < r.round || r.phase === 'over' && n <= r.done ? 'done' : '', n === r.round && r.phase !== 'over' ? 'now' : '', M.bosses[n] ? 'boss' : ''].join(' ');
    rows += `<div class="${cls}" title="Piętro ${n}">${M.bosses[n] ? art.skullIcon() : ''}${n}</div>`;
  }
  return `<aside class="tower" aria-label="Postęp"><h4>Piętra</h4>${rows}<div class="pot"></div></aside>`;
}
function sideHTML() {
  const r = G.run, S = r.hero, ch = D.CHARS[r.char], form = D.FORMS.find(f => f.id === r.form) || D.FORMS[0];
  const slots = Array.from({ length: D.RULES.maxSkills }, (_, i) => {
    const s = r.skills[i];
    if (!s) return '<div class="slot empty">wolny slot umiejętności</div>';
    const def = D.SKILLS[s.id], tile = D.TILES.find(t => t.skill === s.id);
    return `<div class="slot">${art.tileIcon(tile.id)}<div><div class="sn">${i + 1}. ${esc(def.name)}${s.lvl >= 2 ? '<span class="lv">POZ. 2</span>' : ''}</div><div class="sd">${esc(def.text)}${s.lvl >= 2 ? ' (+30% mocy, -20% cooldownu)' : ''}</div></div></div>`;
  }).join('');
  const rows = T.STAT_LABELS.map(([k, label, f]) => `<dt>${label}</dt><dd>${f ? f(S[k]) : S[k]}</dd>`).join('')
    + (S.dmg ? `<dt>Obrażenia</dt><dd>+${S.dmg}%</dd>` : '') + (S.critMult !== 150 ? `<dt>Siła trafienia krytycznego</dt><dd>×${(S.critMult / 100).toFixed(2).replace('.', ',')}</dd>` : '');
  const counts = {}; for (const id of r.tiles) { const t = TILE[id]; if (t && t.type !== 'skill') counts[id] = (counts[id] || 0) + 1; }
  const chips = Object.entries(counts).map(([id, n]) => { const t = TILE[id]; return `<div class="chip r${t.rarity}" tabindex="0" data-tip="${esc(t.name)}\n${esc(t.text)}">${art.tileIcon(id)}${n > 1 ? `<sup>×${n}</sup>` : ''}</div>`; }).join('');
  const sets = Object.entries(D.SETS).map(([id, st]) => { const n = setOwned(id); if (!n) return ''; const total = D.TILES.filter(t => t.set === id).length; return `<div class="setline">Zestaw ${st.name} ${n}/${total}${n >= 2 ? ': ' + st.b2 : ''}${n >= 3 ? '; ' + st.b3 : ''}</div>`; }).join('');
  const pct = Math.max(0, Math.min(100, r.hp / S.maxHp * 100));
  return `<aside class="side">
    <div class="panel hero-card">${art.heroArt(r.char, r.form)}<div><div class="nm">${esc(ch.name)}</div><div class="fm">${esc(form.name)}</div>
      <div class="hpbar" style="margin-top:6px"><i style="width:${pct}%"></i><b>${r.hp} / ${S.maxHp}</b></div></div></div>
    <div class="panel"><h4>Umiejętności aktywne</h4><div class="slots">${slots}</div></div>
    <div class="panel"><h4>Statystyki</h4><dl class="stats">${rows}</dl></div>
    <div class="panel"><h4>Kafelki (${r.tiles.length})</h4>${chips ? `<div class="chips">${chips}</div>` : '<span class="hint">Jeszcze nic. Wybierz pierwszy kafelek.</span>'}${sets}</div></aside>`;
}
function topbarHTML() {
  const r = G.run, M = D.MODES[r.mode];
  return `<div class="topbar"><span class="brand">BULGOT</span>
    <span class="pill">Piętro <b>${r.round}</b> / ${r.rounds}</span><span class="zone-name">${esc(T.ZONE_NAMES[r.zone])}</span><span class="spacer"></span>
    <span class="pill" title="Ziarna: waluta na rerolle i zakupy">${art.coinIcon()} <b>${r.coins}</b></span>
    <span class="pill">${M.name}</span>${r.garnek ? `<span class="pill g">Garnek ${r.garnek} · ${D.GARNEK[r.garnek].name}</span>` : ''}
    <span class="pill" title="Wynik na żywo">★ ${fmtNum(r.score)}</span>
    <button class="btn small" data-act="menu">Menu</button></div>`;
}
function stageHTML() {
  const r = G.run;
  if (r.phase === 'offer') return stageOffer();
  if (r.phase === 'event') return r.pending.kind === 'shop' ? stageShop() : stageGamble();
  if (r.phase === 'bonus') return stageBonus();
  if (r.phase === 'fight') return stagePrep();
  return '';
}
function floorKron() {
  const r = G.run;
  if (r.boss) return T.BOSS_INTRO[r.boss].quote;
  return T.pickLine(T.OFFER_LINES[r.zone], r.round - 1);
}
function offerCard(id, i) {
  const r = G.run, t = TILE[id], price = shopPrice(t), left = r.offer.filter(Boolean).length;
  const buy = t.event
    ? '<div class="buynote">Wydarzenie: tylko do wyboru</div>'
    : `<button class="btn small buy" data-act="buyoffer" data-i="${i}" ${r.coins < price || left < 2 ? 'disabled' : ''} title="Dokup ten kafelek za Ziarna (Shift + ${i + 1}). Darmowy wybór zostaje.">Dokup za ${price} ${art.coinIcon()}</button>`;
  return `<div class="slotcard">${tileCard(id, { i })}${buy}</div>`;
}
function stageOffer() {
  const r = G.run, cards = r.offer.map((id, i) => id ? offerCard(id, i) : '<div class="slotcard"><div class="tile gone">Dokupione</div></div>').join('');
  const cost = r.rerollCost, free = cost === 0;
  return `<div class="stage-title"><h2>Piętro ${r.round}${r.boss ? ' · BOSS' : ''}</h2><div class="sub">${esc(T.ZONE_NAMES[r.zone])}${r.elite ? ' · elitarny wróg' : ''}</div></div>
    <div class="kron">${esc(floorKron())}</div>${previewHTML()}
    <div class="cards">${cards}</div>
    <div class="actions"><button class="btn" data-act="reroll" ${r.coins < cost ? 'disabled' : ''}>Reroll ${free ? '(za darmo)' : `za ${cost} ${art.coinIcon()}`}</button></div>
    <div class="hint">Jeden kafelek bierzesz za darmo (klawisze 1–${r.offer.length}), pozostałe możesz dokupić (Shift + cyfra). R przelosowuje ofertę.</div>`;
}
function stageShop() {
  const r = G.run, cards = r.pending.offer.map((id, i) => tileCard(id, { i, act: 'buy', price: shopPrice(TILE[id]) })).join('');
  return `<div class="stage-title"><h2>Sklepik Babci Kwoki</h2><div class="sub">Masz ${r.coins} ${art.coinIcon()} Ziaren</div></div>
    <div class="kron">Babcia nie bierze kart. Babcia bierze ziarno.</div><div class="cards">${cards}</div>
    <div class="actions"><button class="btn" data-act="leave">Wychodzę bez zakupu</button></div>`;
}
const shopPrice = t => D.RULES.prices[t.rarity];
function stageGamble() {
  const r = G.run, c = r.coins, q = Math.max(1, Math.floor(c / 4)), h = Math.max(1, Math.floor(c / 2));
  const bets = c > 0 ? [...new Set([1, q, h, c])].filter(x => x <= c).map(x => `<button class="btn" data-act="bet" data-v="${x}">Stawiam ${x} ${art.coinIcon()}</button>`).join('') : '<span class="hint">Nie masz czym grać.</span>';
  return `<div class="stage-title"><h2>Hazard w Kurniku</h2><div class="sub">Rzut monetą: 50% podwajasz stawkę, 50% tracisz ją</div></div>
    <div class="kron">Zasady proste: dom zawsze wygrywa. Dom to kurnik.</div>
    <div class="gamble"><div class="bignum">${c} ${art.coinIcon('coin')}</div><div class="bets">${bets}</div><button class="btn ghost" data-act="bet" data-v="0">Nie ryzykuję</button></div>`;
}
function stageBonus() {
  const r = G.run, cards = r.offer.map((id, i) => tileCard(id, { i, act: 'bonuspick' })).join('');
  const bs = r.boss || '', name = bs ? D.BOSSES[bs].name : 'Bossa';
  return `<div class="stage-title"><h2>Nagroda za pokonanie bossa</h2><div class="sub">Wybierz jeden z trzech rzadkich lub lepszych kafelków</div></div>
    <div class="kron">${esc(T.BOSS_WIN_LINES[lastBoss()] || 'Boss padł, a łup czeka.')}</div><div class="cards">${cards}</div>`;
}
const lastBoss = () => { const b = G.run && G.run.stats.bossKills; return b && b[b.length - 1]; };
function stagePrep() {
  const r = G.run;
  return `<div class="stage-title"><h2>Piętro ${r.round}: do walki!</h2><div class="sub">${esc(T.ZONE_NAMES[r.zone])}</div></div>
    <div class="kron">${esc(floorKron())}</div>${previewHTML()}
    <div class="actions"><button class="btn primary big" data-act="tofight" data-primary>Do walki!</button></div>
    <div class="hint">W walce użyjesz umiejętności klawiszami 1, 2, 3. P robi pauzę.</div>`;
}
function renderRun() {
  return `<div class="run">${topbarHTML()}${towerHTML()}<main class="stage">${stageHTML()}</main>${sideHTML()}</div>`;
}

// ---------- akcje wyboru ----------
async function doPick(i, slot) {
  const r = G.run, id = r.offer[i], t = TILE[id];
  if (!t) return;
  if (t.type === 'skill' && slot === undefined && !r.skills.find(s => s.id === t.skill) && r.skills.length >= D.RULES.maxSkills) return askSlot(t, s => doPick(i, s));
  const j = await act('pick', { i, slot });
  if (!j) return;
  snd.sfx('pick');
  if (j.crate) return showCrate(j.crate);
  render();
}
async function doBuy(i, slot) {
  const r = G.run, id = r.offer[i], t = id && TILE[id];
  if (!t) return;
  if (t.type === 'skill' && slot === undefined && !r.skills.find(s => s.id === t.skill) && r.skills.length >= D.RULES.maxSkills) return askSlot(t, s => doBuy(i, s));
  const j = await act('buy', { i, slot });
  if (!j) return;
  snd.sfx('coin'); toast('Dokupiono: ' + t.name + ' (-' + j.price + ' Ziaren)');
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
          <div class="ctl"><button data-act="speed" id="speedbtn" title="Szybkość walki">×${F.speed}</button><button data-act="pause" id="pausebtn" title="Pauza (P)">Pauza</button></div></div>
        <div id="units"></div><div id="fxl"></div></div>
      <div class="skillbar" id="skillbar"></div>
      <div class="kron" id="kline">${esc(boss ? T.BOSS_INTRO[boss.boss].quote : floorKron())}</div>
    </main></div>`;
  F.arena = $('#arena');
  makeUnit('hero', { name: D.CHARS[run.char].name, art: art.heroArt(run.char, run.form), left: 17 });
  for (const e of f.enemies) makeUnit(e.uid, { e, name: e.name, art: art.enemyArt(e.art) });
  layoutUnits(); buildSkillbar(); updateUI(true);
  if (boss) { banner(T.BOSS_INTRO[boss.boss].title, 'BOSS', false); snd.sfx('boss'); } else banner('Walka!', '', false);
  F.last = 0; F.raf = requestAnimationFrame(frame);
}

function makeUnit(key, o) {
  const F = G.fight, e = o.e, boss = e && e.boss, small = e && e.minion;
  const el = document.createElement('div');
  el.className = `unit ${key === 'hero' ? 'hero' : 'enemy'} ${boss ? 'boss' : ''} ${small ? 'small' : ''} idle`;
  el.innerHTML = `<div class="plate"><div class="nm">${esc(o.name)}</div><div class="hpbar ${key === 'hero' ? '' : 'enemy'}"><i></i><b></b></div></div><div class="sprite">${o.art}</div><div class="fxs"></div>`;
  if (o.left != null) el.style.left = o.left + '%';
  $('#units').appendChild(el);
  F.units.set(key, { el, spr: el.querySelector('.sprite'), bar: el.querySelector('.hpbar i'), txt: el.querySelector('.hpbar b'), fx: el.querySelector('.fxs'), e, x: o.left || 0, flags: {} });
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
    return `<button class="sk" data-act="useskill" data-v="${i}" id="sk${i}"><span class="kbadge">${i + 1}</span>${art.tileIcon(tile.id)}<div class="sn">${esc(def.name)}${s.lvl >= 2 ? ' ★' : ''}</div><span class="cdv"></span><span class="cdt"></span></button>`;
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
    case 'hit': { const u = tu(e.to); if (!u) break; cls(u, 'flash', 110); pop(e.crit ? e.d + '!' : e.d, e.crit ? 'crit' : e.kind === 'bleed' ? 'bleed' : e.kind === 'egg' ? 'egg' : '', u.x); snd.sfx(e.crit ? 'crit' : 'hit'); if (e.crit) shake(); break; }
    case 'hurt': { cls(hero, 'hurtshake', 260); pop('-' + e.d, 'hurt', 17); const a = tu(e.from); if (a) cls(a, 'lunge', 240); snd.sfx('hurt'); if (e.d * 100 >= f.S.maxHp * 12 || e.crit) shake(); break; }
    case 'heal': pop('+' + e.n, 'heal', 17); snd.sfx('heal'); break;
    case 'miss': { const u = tu(e.to); if (u) pop('unik', 'txt', u.x); snd.sfx('miss'); break; }
    case 'dodge': pop('unik!', 'txt', 17); snd.sfx('miss'); break;
    case 'block': pop('blok', 'txt', 17); break;
    case 'shield': { const u = tu(e.to); if (u) pop('tarcza', 'txt', u.x); break; }
    case 'shieldhit': { const u = tu(e.to); if (u) pop(e.d, 'txt', u.x); snd.sfx('hit'); break; }
    case 'immune': { const u = tu(e.to); if (u) pop('nietykalny', 'txt', u.x); break; }
    case 'skill': { pop(D.SKILLS[e.id].name, 'txt', 17, 74); snd.sfx('skill'); break; }
    case 'stun': snd.sfx('stun'); break;
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
  for (const e of f.enemies) {
    const u = F.units.get(e.uid); if (!u) continue;
    u.bar.style.width = Math.max(0, e.hp / e.maxHp * 100) + '%'; u.txt.textContent = e.dead ? '' : Math.max(0, e.hp) + (e.shield > 0 ? ' +' + e.shield : '');
    const stunned = tick < e.stunUntil && !e.dead, fl = u.flags;
    if (stunned !== !!fl.stun) { fl.stun = stunned; u.fx.querySelectorAll('.stars').forEach(n => n.remove()); if (stunned) u.fx.insertAdjacentHTML('beforeend', '<div class="stars"><i></i><i></i><i></i></div>'); }
    const tele = !!e.windup && !e.dead; if (tele !== !!fl.tele) { fl.tele = tele; u.fx.querySelectorAll('.tele').forEach(n => n.remove()); if (tele) u.fx.insertAdjacentHTML('beforeend', '<div class="tele"></div>'); }
    const sh = (e.shieldHits > 0 || e.shield > 0) && !e.dead; if (sh !== !!fl.sh) { fl.sh = sh; u.fx.querySelectorAll('.shieldfx').forEach(n => n.remove()); if (sh) u.fx.insertAdjacentHTML('beforeend', '<div class="shieldfx"></div>'); }
    const gd = !!e.immune && !e.dead; if (gd !== !!fl.gd) { fl.gd = gd; u.fx.querySelectorAll('.guardfx').forEach(n => n.remove()); if (gd) u.fx.insertAdjacentHTML('beforeend', '<div class="guardfx"></div>'); }
  }
  f.skills.forEach((s, i) => {
    const b = $('#sk' + i); if (!b) return;
    const def = D.SKILLS[s.id], total = s.lvl >= 2 ? Math.floor(def.cd * 80 / 100) : def.cd, blocked = tick < s.blockedUntil;
    const remain = Math.max(s.cd - tick, blocked ? s.blockedUntil - tick : 0), ready = remain <= 0;
    b.classList.toggle('ready', ready && !f.over); b.classList.toggle('blocked', blocked);
    b.querySelector('.cdv').style.transform = `scaleY(${ready ? 0 : Math.min(1, remain / total)})`;
    b.querySelector('.cdt').textContent = ready ? '' : (remain / 10).toFixed(1).replace('.', ',');
  });
  const secs = Math.floor(tick / 10);
  $('#tt').textContent = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
  $('#tbi').style.width = Math.min(100, tick / MAX_TICKS * 100) + '%';
  $('#timer').classList.toggle('fury', tick >= FURY_FROM);
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
    ${r.stolen ? `<p class="hint">Złodzieje ukradli ci ${r.stolen} Ziaren.</p>` : ''}${r.usedRevive ? '<p class="hint">Gniazdo Zapasowe zostało zużyte.</p>' : ''}${unlocksHTML(un)}
    <div class="actions" style="margin-top:12px"><button class="btn primary big" data-act="close" data-primary>${j.bonus ? 'Wybierz nagrodę' : 'Dalej'}</button></div>`, { narrow: true, force: true });
}
function takeUnlocks() { const u = G.unlocks; G.unlocks = []; return u; }
function unlocksHTML(list) {
  if (!list.length) return '';
  return list.map(u => `<div class="unlock-box"><b>Odblokowano ${u.kind === 'char' ? 'postać' : 'kafelek'}: ${esc(unlockName(u))}</b><div class="hint" style="text-align:left">${esc(u.text)}</div></div>`).join('');
}

function showEnd(j) {
  const r = G.run, e = j.end || {}, win = r.ended === 'win', un = takeUnlocks();
  const mult = (100 + D.RULES.garnekScore * r.garnek) / 100;
  G.lastEnd = e;
  snd.sfx(win ? 'win' : 'lose'); if (!win) snd.sfx('bulgot');
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
    ${e.garnekUnlocked ? `<div class="unlock-box"><b>Odblokowano Temperaturę Garnka ${G.profile.garnek}: ${esc(D.GARNEK[G.profile.garnek].name)}</b></div>` : ''}${unlocksHTML(un)}
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
  const p = G.profile, tabs = [['tiles', 'Kafelki'], ['chars', 'Postacie'], ['foes', 'Wrogowie'], ['unl', 'Odblokowania']];
  let body = '';
  if (tab === 'tiles') {
    body = `<p class="lead">Poznane: ${D.TILES.filter(t => !t.lock || p.tiles.includes(t.id)).length} z ${D.TILES.length} dostępnych kafelków.</p><div class="book-grid">${D.TILES.map((t, i) => {
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
  reroll: async () => { const j = await act('reroll'); if (j) { snd.sfx('reroll'); render(); } },
  buy: async b => { const j = await act('shop', { i: +b.dataset.i }); if (j) { snd.sfx('coin'); render(); } },
  leave: async () => { const j = await act('shop', { i: -1 }); if (j) render(); },
  bet: async b => { const j = await act('bet', { amount: +b.dataset.v }); if (!j) return; if (j.bet) { snd.sfx(j.won ? 'win' : 'lose'); toast(j.won ? `Wygrana! +${j.bet} Ziaren` : `Pudło. -${j.bet} Ziaren`, !j.won); } render(); },
  bonuspick: async b => { const i = +b.dataset.i, t = TILE[G.run.offer[i]];
    if (t.type === 'skill' && !G.run.skills.find(s => s.id === t.skill) && G.run.skills.length >= 3) { G.slotCb = s => ACT.bonusgo(i, s); return askSlot(t, G.slotCb); }
    return ACT.bonusgo(i); },
  bonusgo: async (i, slot) => { const j = await act('bonus', { i, slot }); if (j) { snd.sfx('pick'); render(); } },
  slotchoose: b => { const cb = G.slotCb; closeOverlay(); G.slotCb = null; if (cb) cb(+b.dataset.v); },
  tofight: async () => {
    const j = await act('fightstart'); if (!j) return;
    snd.unlock(); startFight(j.setup);
  },
  useskill: b => useSkill(+b.dataset.v),
  speed: b => { const F = G.fight; G.speed = G.speed >= 3 ? 1 : G.speed + 1; store.set('bulgot:speed', G.speed); if (F) { F.speed = G.speed; $('#speedbtn').textContent = '×' + G.speed; } },
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
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const F = G.fight, k = e.key.toLowerCase();
  if (k === 'escape') { if (overlayOpen() && !$('#overlay').dataset.force) closeOverlay(); return; }
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
    const dg = /^Digit([1-4])$/.exec(e.code);
    if (r.phase === 'offer' && dg && e.shiftKey) { const b = $(`.cards [data-act=buyoffer][data-i="${+dg[1] - 1}"]`); if (b && !b.disabled) b.click(); }
    else if (r.phase === 'offer' && ['1', '2', '3', '4'].includes(k)) { const b = $(`.cards [data-act=pick][data-i="${+k - 1}"]`); if (b) b.click(); }
    else if (r.phase === 'offer' && k === 'r') { const b = $('[data-act="reroll"]'); if (b && !b.disabled) b.click(); }
    else if ((r.phase === 'event' || r.phase === 'bonus') && ['1', '2', '3'].includes(k)) { const b = $(`.cards [data-i="${+k - 1}"]`); if (b) b.click(); }
    else if (k === 'enter') { const p = $('[data-primary]'); if (p) p.click(); }
  } else if (k === 'enter') { const p = $('[data-primary]'); if (p) p.click(); }
});

init();
