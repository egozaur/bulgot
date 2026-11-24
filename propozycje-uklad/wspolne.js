// Propozycje układu ekranu runu (makiety na prawdziwym DOM gry): moduł ładowany w stronie Bulgota po wstrzyknięciu migawki runu.
// Każdy wariant `apply(n)` przebudowuje panel boczny (i ewentualnie środek) z danych `window.__bulgot.run`.
// Nic z tego nie trafia do gry; to tylko podgląd do wyboru.
import * as D from '../shared/data.js';
import * as art from '../art.js';
import * as T from '../text.js';
import { setCounts } from '../shared/stats.js';

const TILE = D.TILE_BY_ID;
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const R = () => window.__bulgot.run;
const setsOf = t => t.sets || (t.set ? [t.set] : []);
const SET_ICON = { jajeczne: '🥚', zbozowe: '🌽', rambo: '💪', rosolowe: '🔥', chlodnicze: '❄️', korpo: '💼' };
const setTotal = id => D.TILES.filter(t => !t.hatched && !t.hidden).reduce((a, t) => a + setsOf(t).filter(x => x === id).length, 0);
const lvlTag = t => t && t.lvl ? `<span class="lvl l${t.lvl}">${['I', 'II', 'III', '★'][t.lvl - 1]}</span>` : '';
const compForm = c => D.COMPANIONS[c.id].forms[Math.min(2, Math.max(0, (c.lvl | 0) - 1))];

// ---------- okólnik: wpływ na buildy gracza ----------
function impact(r) {
  const d = D.DECREES[r.decree]; const tiles = [...new Set(r.tiles)].map(i => TILE[i]).filter(Boolean);
  const has = (t, re) => (t.fx || []).some(f => re.test(f.k));
  const tag = (t, ...a) => (t.tags || []).some(x => a.includes(x));
  const hit = {
    oszczednosci: t => tag(t, 'ogien', 'lod') || has(t, /burn|frost|freeze|shatter|pressure/),
    audyt: t => false,
    integracja: t => setsOf(t).length > 0,
    premia: t => false,
    homeoffice: t => has(t, /rest|heal|regen|hpPct|hpFlat/),
    pilny: t => has(t, /aspd|crit/),
  }[r.decree] || (() => false);
  const ids = tiles.filter(hit).map(t => t.id);
  const owned = r.tiles.filter(i => ids.includes(i)).length;
  const line = {
    oszczednosci: owned ? `Dotyczy ${owned} twoich kafelków Ognia i Lodu` : 'Nic z Ognia i Lodu: okólnik cię omija',
    audyt: `Masz ${r.coins} Ziaren: dokup drożej, ale rerolluj za darmo`,
    integracja: `Zestawy liczą +1 sztukę: ${Object.keys(setCounts(r.tiles, null)).length} z nich już ruszyło`,
    premia: `+3 Ziarna za piętro, wrogowie +15% Życia`,
    homeoffice: `Odpoczynek leczy podwójnie, leczenie po walce słabsze`,
    pilny: `Furia po 30 s: ${r.hero.aspd >= 120 ? 'twoja szybkość ataku to atut' : 'liczy się tempo'}`,
  }[r.decree] || '';
  return { d, ids, owned, line };
}
export const decreeNo = r => r.zone + 1;
const dIcon = () => art.decreeIcon();

// ---------- klocki ----------
function perks(r) {
  const cp = T.CHAR_PERKS[r.char] || { perks: [] };
  return cp.perks.map(([ic, sg, tx]) => `<span class="pk ${sg === '+' ? 'plus' : 'minus'}">${/^[a-zA-Z]+$/.test(ic) ? art.statIcon(ic) : `<span class="pe">${ic}</span>`}${esc(tx)}</span>`).join('');
}
const heroTip = r => { const ch = D.CHARS[r.char], cp = T.CHAR_PERKS[r.char] || {}; return esc(ch.name + ' · ' + (cp.role || ch.style) + '\n' + ch.text); };
function pet(r, cls = '') {
  const c = r.companion; if (!c) return '';
  const d = D.COMPANIONS[c.id], L = d.lv[c.lvl - 1];
  return `<span class="pet ${cls}" tabindex="0" data-tip="${esc(compForm(c) + ' (poziom ' + c.lvl + ' z 3)\n' + d.text + '\nRośnie po każdym pokonanym bossie.')}">${art.companionArt(c.id)}<b>${c.lvl}</b></span>`;
}
function hero(r, o = {}) {
  const S = r.hero, ch = D.CHARS[r.char], cp = T.CHAR_PERKS[r.char] || {}, pct = Math.max(0, Math.min(100, r.hp / S.maxHp * 100));
  const bd = (r.badges || []).map(b => `<div class="chip badge" tabindex="0" data-tipk="badge:${b}">${art.badgeIcon(b)}</div>`).join('');
  return `<div class="panel hero-card hx ${o.cls || ''}" tabindex="0" data-tip="${heroTip(r)}">
    <div class="hc-head"><div class="hfig">${art.heroArt(r.char, r.form)}${o.pet === false ? '' : pet(r)}</div>
      <div class="hc-id"><div class="nm">${esc(ch.name)}</div><div class="fm">${esc(cp.role || ch.style)}</div></div><span class="hc-num"><span>${r.hp}</span>/${S.maxHp}</span></div>
    <div class="hpbar"><i style="width:${pct}%"></i></div>
    ${o.trait === false ? '' : `<div class="hc-trait"><span>${cp.title ? '★ ' + esc(cp.title) : ''}</span>${o.badges === false ? '' : `<div class="bdgs">${bd}</div>`}</div>`}
    ${o.perks === false ? '' : `<div class="hc-perks">${perks(r)}</div>`}</div>`;
}
const badgesHTML = r => (r.badges || []).map(b => `<div class="chip badge" tabindex="0" data-tipk="badge:${b}">${art.badgeIcon(b)}</div>`).join('');
// trzy poziome kółka umiejętności (symbol, numer klawisza, poziom); opis po najechaniu
function xrings(r, o = {}) {
  const n = r.maxSkills || 3;
  const cells = Array.from({ length: n }, (_, i) => {
    const s = r.skills[i]; if (!s) return `<div class="xring empty"><span>+</span></div>`;
    const def = D.SKILLS[s.id], tile = D.TILES.find(t => t.skill === s.id), mu = s.lvl >= 3 && def.muts[(s.mut || 1) - 1];
    return `<div class="xring ${s.lvl >= 3 ? 'l3' : s.lvl === 2 ? 'l2' : ''}" tabindex="0" data-tipk="tile:${tile.id}" draggable="true"><span class="rk">${i + 1}</span>${art.tileIcon(tile.id)}${s.lvl >= 2 ? `<b class="rl">${s.lvl >= 3 ? 'M' : s.lvl}</b>` : ''}${o.names ? `<em>${esc(def.name.split(' ')[0])}</em>` : ''}</div>`;
  }).join('');
  return `<div class="xrings ${o.cls || ''} ${o.names ? 'named' : ''}">${cells}</div>`;
}
const fmt = (k, S) => { const f = (T.STAT_LABELS.find(x => x[0] === k) || [])[2]; return f ? f(S[k]) : S[k]; };
function statRows(r) {
  const S = r.hero, rows = T.STAT_LABELS.map(([k, label]) => [k, label, fmt(k, S)]);
  if (S.dmg) rows.push(['dmg', 'Obrażenia', `+${S.dmg}%`]);
  if (S.critMult !== 150) rows.push(['critMult', 'Moc Fortuny', `×${(S.critMult / 100).toFixed(2).replace('.', ',')}`]);
  return rows;
}
const LBL = { aspd: 'Szybkość', crit: 'Kurza Fort.', regen: 'Regen.', dmg: 'Obraż.', critMult: 'Moc Fort.', armor: 'Pancerz' };
const short = (k, v) => String(v).replace(' / s', '/s');
function statsList(r) { return `<dl class="stats">${statRows(r).map(([k, l, v]) => `<dt data-tipk="stat:${k}" tabindex="0">${art.statIcon(k)}<span>${l}</span></dt><dd data-tipk="stat:${k}">${v}</dd>`).join('')}</dl>`; }
function statsIcons(r, cols = 2, only) {
  const rows = statRows(r).filter(x => !only || only.includes(x[0]));
  return `<div class="sgrid c${cols}">${rows.map(([k, l, v]) => `<div class="si" tabindex="0" data-tipk="stat:${k}">${art.statIcon(k)}<b>${short(k, v)}</b></div>`).join('')}</div>`;
}
function statsNamed(r, only) {
  const rows = statRows(r).filter(x => !only || only.includes(x[0]));
  return `<div class="sgrid c2 named">${rows.map(([k, l, v]) => `<div class="si" tabindex="0" data-tipk="stat:${k}">${art.statIcon(k)}<span>${LBL[k] || l}</span><b>${short(k, v)}</b></div>`).join('')}</div>`;
}
function counts(r) { const c = {}; for (const id of r.tiles) { const t = TILE[id]; if (t && t.type !== 'skill') c[id] = (c[id] || 0) + 1; } return c; }
function chip(r, id, n, hitIds = []) {
  const t = TILE[id], g = t.grow ? Math.min(t.grow.max, (r.grow || {})[id] || 0) : 0;
  return `<div class="chip r${t.rarity} ${hitIds.includes(id) ? 'dhit' : ''}" tabindex="0" data-tipk="tile:${id}">${lvlTag(t)}${art.tileIcon(id)}${n > 1 ? `<sup>×${n}</sup>` : t.grow && g ? `<sup class="gr">+${g}</sup>` : ''}</div>`;
}
function tilesGrid(r, o = {}) {
  const c = counts(r), hit = o.hit || [];
  const order = Object.keys(c).sort((a, b) => TILE[b].rarity - TILE[a].rarity || (c[b] - c[a]));
  if (o.group) {
    const g = { stat: [], item: [], other: [] };
    for (const id of order) (TILE[id].type === 'stat' ? g.stat : TILE[id].type === 'item' ? g.item : g.other).push(id);
    const lab = { item: 'Przedmioty', stat: 'Statystyki', other: 'Inne' };
    return ['item', 'stat', 'other'].filter(k => g[k].length).map(k => `<div class="tg"><span class="tgl">${lab[k]} · ${g[k].reduce((a, id) => a + c[id], 0)}</span><div class="chips ${o.cls || ''}">${g[k].map(id => chip(r, id, c[id], hit)).join('')}</div></div>`).join('');
  }
  return `<div class="chips ${o.cls || ''}">${order.map(id => chip(r, id, c[id], hit)).join('')}</div>`;
}
function xmedals(r, o = {}) {
  const sc = setCounts(r.tiles, r.decree);
  const m = Object.entries(D.SETS).filter(([id]) => sc[id]).map(([id, st]) => {
    const n = sc[id], tot = setTotal(id), step = D.SET_STEPS.filter(s => n >= s).length;
    return `<div class="xmedal s${step}" tabindex="0" data-tipk="set:${id}"><span class="mi">${SET_ICON[id] || '⭐'}</span><b>${n}</b>${o.names ? `<em>${esc(st.name)}</em>` : ''}<u>${D.SET_STEPS.map(s => `<i class="${n >= s ? 'on' : ''}"></i>`).join('')}</u></div>`;
  }).join('');
  const ms = Object.entries(D.MILESTONES).map(([id, mm]) => { const n = Math.floor(r.tiles.filter(x => x === id).length / D.MILESTONE_EVERY); return n ? `<div class="xmedal ms" tabindex="0" data-tip="${esc(mm.name + '\n' + mm.text)}"><span class="mi">★</span><b>${n}</b></div>` : ''; }).join('');
  return `<div class="xmedals ${o.cls || ''}">${m}${ms}</div>`;
}
const panel = (title, body, cls = '') => `<div class="panel ${cls}">${title ? `<h4>${title}</h4>` : ''}${body}</div>`;

// ---------- okólnik: warianty wyglądu ----------
function decree(r, kind) {
  const { d, ids, owned, line } = impact(r), no = decreeNo(r);
  const aff = owned ? `<span class="dh-n" title="">${owned}</span>` : '';
  switch (kind) {
    case 'wstega': return `<div class="xdec xdec-wstega" tabindex="0" data-tip="${esc(d.name + '\n' + d.text)}"><span class="di">${dIcon()}</span><span class="dk">OKÓLNIK №${no}</span><b>${esc(d.name)}</b><span class="dt">${esc(d.text)}</span><span class="dl">${esc(line)}</span></div>`;
    case 'pismo': return `<div class="xdec xdec-pismo" tabindex="0"><div class="lh">Korporacja Rosołowa S.A. · Zarząd · Okólnik nr ${no}</div><div class="lb">${dIcon()}<div><b>${esc(d.name)}.</b> ${esc(d.text)}</div></div><div class="ll">▸ ${esc(line)}</div><span class="stamp">OBOWIĄZUJE<small>DO KOŃCA STREFY</small></span><i class="pin"></i></div>`;
    case 'plakat': return `<div class="xdec xdec-plakat"><div class="pl-l">${dIcon()}<span>OKÓLNIK<br>№${no}</span></div><div class="pl-m"><b>${esc(d.name)}</b><span>${esc(d.text)}</span></div><div class="pl-r"><span>Dla ciebie</span><b>${esc(line)}</b></div></div>`;
    case 'pasek': return `<div class="xdec xdec-pasek"><span class="di">${dIcon()}</span><b>Okólnik: ${esc(d.name)}</b><span class="dt">${esc(d.text)}</span><span class="dl">${esc(line)}</span></div>`;
    case 'karta': return `<div class="panel xdec xdec-karta"><div class="dk2"><span class="di">${dIcon()}</span><span>OKÓLNIK ZARZĄDU №${no}</span></div><b>${esc(d.name)}</b><p>${esc(d.text)}</p><div class="dl">▸ ${esc(line)}</div></div>`;
    case 'neon': return `<div class="xdec xdec-neon" tabindex="0" data-tip="${esc(d.name + '\n' + d.text)}"><span class="di">${dIcon()}</span><div><span class="dk">OKÓLNIK №${no} · DO KOŃCA STREFY</span><b>${esc(d.name)}</b></div><span class="dt">${esc(d.text)}</span></div>`;
    case 'znaczek': return `<span class="xdec xdec-znaczek" tabindex="0" data-tip="${esc(d.name + '\n' + d.text + '\n' + line)}"><span class="di">${dIcon()}</span><b>${esc(d.name)}</b><em>${esc(d.text)}</em></span>`;
    default: return '';
  }
}

// ---------- montaż ----------
function stage() { return $('.stage'); }
function clearDecrees() { document.querySelectorAll('.stage .decree, .stage .xdec, .xdec-top').forEach(e => e.remove()); }
function afterKron(html) { const k = $('.stage .kron'); if (k) k.insertAdjacentHTML('afterend', html); }
function setSide(html, cls = '') { const s = $('.side'); s.className = 'side ' + cls; s.innerHTML = html; return s; }
function hideBoardHint(on) { document.documentElement.classList.toggle('compact-hint', on); }
function cols(side) { document.documentElement.style.setProperty('--sidew', side + 'px'); }

const VAR = {
  // 1. Minimum: tylko pomysły właściciela (zwierzak przy bohaterze, trzy kółka), reszta jak dziś
  1(r) {
    cols(320); const { ids } = impact(r);
    afterKron(decree(r, 'wstega'));
    const old = $('.side');
    const keep = old.querySelector('.zcmp') ? old.querySelector('.zcmp').outerHTML : '';
    const sc = setCounts(r.tiles, r.decree);
    const sets = Object.entries(D.SETS).map(([id, st]) => { const n = sc[id] || 0; if (!n) return ''; return `<div class="setline" data-tipk="set:${id}" tabindex="0">Zestaw ${st.name} ${n}/${setTotal(id)}${D.SET_STEPS.filter(s => n >= s).map(s => (s === 2 ? ': ' : '; ') + st['b' + s]).join('')}</div>`; }).join('');
    setSide(hero(r) + panel('Umiejętności (klawisze 1–3)', xrings(r)) + panel('Statystyki', keep + statsList(r)) + panel(`Kafelki (${r.tiles.length})`, tilesGrid(r, { hit: ids }) + sets), 'v1');
  },
  // 2. Kompakt: statystyki w dwóch kolumnach (ikona + liczba), zestawy jako medale
  2(r) {
    cols(320); const { ids } = impact(r);
    afterKron(decree(r, 'pasek'));
    setSide(hero(r, { perks: false }) + panel('Umiejętności', xrings(r, { names: true })) + panel('Statystyki', statsNamed(r)) + panel(`Kafelki (${r.tiles.length})`, tilesGrid(r, { hit: ids, cls: 'tiny' }) + xmedals(r, { names: true })), 'v2');
  },
  // 3. Zakładki w panelu: Statystyki | Kafelki | Zestawy (bohater i kółka zawsze na wierzchu)
  3(r, o = {}) {
    cols(320); const { ids } = impact(r); const tab = o.tab || 0;
    afterKron(decree(r, 'plakat'));
    const xtabs = ['Statystyki', 'Kafelki ' + r.tiles.length, 'Zestawy'];
    setSide(hero(r, { perks: false }) + panel('', xrings(r, { names: true })) +
      `<div class="panel tabbed"><div class="xtabs">${xtabs.map((t, i) => `<button class="${i === tab ? 'on' : ''}">${t}</button>`).join('')}</div><div class="tabbody">${[statsList(r), tilesGrid(r, { hit: ids, group: true }), xmedals(r, { names: true })][tab]}</div></div>`, 'v3');
  },
  // 4. Szeroki panel w dwóch kolumnach: po lewej bohater, kółka, statystyki; po prawej kafelki i zestawy
  4(r) {
    cols(520); const { ids } = impact(r);
    afterKron(decree(r, 'pismo'));
    setSide(`<div class="twocol"><div class="c1">${hero(r)}${panel('Umiejętności', xrings(r, { names: true }))}${panel('Statystyki', statsList(r))}</div>
      <div class="c2">${panel(`Kafelki (${r.tiles.length})`, tilesGrid(r, { hit: ids, group: true }))}${panel('Zestawy', xmedals(r, { names: true }))}</div></div>`, 'v4');
  },
  // 5. Pasek ekwipunku pod sceną (kafelki poziomo), bok tylko bohater, kółka i statystyki
  5(r) {
    cols(320); const { ids } = impact(r);
    afterKron(decree(r, 'pasek'));
    const bar = `<div class="eqbar"><span class="eql">Kafelki ${r.tiles.length}</span>${tilesGrid(r, { hit: ids, cls: 'wide' })}${xmedals(r, { cls: 'inline' })}</div>`;
    const board = $('.stage .board, .stage [class*=board]');
    (board || $('.stage').lastElementChild).insertAdjacentHTML('beforebegin', bar);
    setSide(hero(r) + panel('Umiejętności', xrings(r, { names: true })) + panel('Statystyki', statsList(r)), 'v5');
  },
  // 6. Pasek statystyk nad sceną, bok: bohater, kółka, kafelki
  6(r) {
    cols(320); const { ids } = impact(r);
    afterKron(decree(r, 'znaczek'));
    const t = $('.stage .stage-title'); t.insertAdjacentHTML('afterend', `<div class="statbar">${statsNamed(r)}</div>`);
    setSide(hero(r, { perks: false }) + panel('Umiejętności', xrings(r, { names: true })) + panel(`Kafelki (${r.tiles.length})`, tilesGrid(r, { hit: ids, group: true }) + xmedals(r, { names: true })), 'v6');
  },
  // 7. Plecak: na stałe tylko 6 statystyk, reszta w wysuwanym plecaku (klawisz B)
  7(r) {
    cols(320); const { ids } = impact(r);
    afterKron(decree(r, 'karta'));
    clearDecrees(); // karta wędruje do panelu
    setSide(decree(r, 'karta') + hero(r, { perks: false }) + panel('Umiejętności', xrings(r, { names: true })) +
      panel('Najważniejsze', statsIcons(r, 3, ['maxHp', 'atk', 'aspd', 'armor', 'crit', 'evade'])) +
      `<button class="bagbtn"><span>🎒</span> Plecak · ${r.tiles.length} kafelków · wszystkie statystyki <kbd>B</kbd></button>` + xmedals(r, { cls: 'inline' }), 'v7');
    const dr = document.createElement('div'); dr.className = 'bag';
    dr.innerHTML = `<div class="bag-h"><b>Plecak</b><span>${r.tiles.length} kafelków</span><kbd>B / Esc</kbd></div><div class="bag-b">${panel('Statystyki', statsList(r))}${panel('Kafelki', tilesGrid(r, { hit: ids, group: true }))}${panel('Zestawy', xmedals(r, { names: true }))}</div>`;
    document.body.appendChild(dr);
  },
  // 8. Kokpit: duży bohater z statystykami po bokach (jak lalka ekwipunku), kafelki pod spodem
  8(r) {
    cols(360); const { ids } = impact(r);
    afterKron(decree(r, 'znaczek'));
    const rows = statRows(r), half = Math.ceil(rows.length / 2);
    const col = rs => rs.map(([k, l, v]) => `<div class="si" tabindex="0" data-tipk="stat:${k}">${art.statIcon(k)}<b>${short(k, v)}</b></div>`).join('');
    const ch = D.CHARS[r.char], cp = T.CHAR_PERKS[r.char] || {};
    setSide(`<div class="panel cockpit"><div class="cp-l">${col(rows.slice(0, half))}</div><div class="cp-m"><div class="cp-fig">${art.heroArt(r.char, r.form)}${pet(r, 'big')}</div><div class="nm">${esc(ch.name)}</div><div class="fm">${esc(cp.role || ch.style)}</div><div class="hpbar"><i style="width:${r.hp / r.hero.maxHp * 100}%"></i></div><div class="cp-hp">${r.hp}/${r.hero.maxHp} życia</div></div><div class="cp-r">${col(rows.slice(half))}</div></div>` +
      panel('', xrings(r, { names: true })) + panel(`Kafelki (${r.tiles.length})`, tilesGrid(r, { hit: ids }) + xmedals(r, { names: true })) + panel('Odznaki', `<div class="bdgs row">${badgesHTML(r)}</div>`), 'v8');
  },
  // 9. Hybryda: 6 głównych statystyk zawsze, reszta pod „więcej”; kafelki małe, zestawy jako medale
  9(r) {
    cols(320); const { ids } = impact(r);
    afterKron(decree(r, 'plakat'));
    setSide(hero(r, { perks: false }) + panel('Umiejętności', xrings(r, { names: true })) +
      panel('Statystyki', statsNamed(r, ['maxHp', 'atk', 'aspd', 'armor', 'crit', 'evade']) + `<details class="more"><summary>Więcej: regeneracja, szczęście i reszta</summary>${statsNamed(r, ['regen', 'luck', 'dmg', 'critMult'])}</details>`) +
      panel(`Kafelki (${r.tiles.length})`, tilesGrid(r, { hit: ids, cls: 'tiny' }) + xmedals(r, { names: true })), 'v9');
  },
  // 10. Pas HUD pod paskiem: bohater, zwierzak, kółka i statystyki w poziomie; bok to tylko kafelki i zestawy
  10(r) {
    cols(320); const { ids } = impact(r);
    afterKron(decree(r, 'pasek'));
    const ch = D.CHARS[r.char], cp = T.CHAR_PERKS[r.char] || {};
    const xhud = `<div class="xhud"><div class="xhud-h" tabindex="0" data-tip="${heroTip(r)}"><div class="hfig">${art.heroArt(r.char, r.form)}${pet(r)}</div><div><div class="nm">${esc(ch.name)}</div><div class="fm">${esc(cp.title ? '★ ' + cp.title : cp.role || ch.style)}</div><div class="hpbar"><i style="width:${r.hp / r.hero.maxHp * 100}%"></i></div></div><span class="hc-num">${r.hp}/${r.hero.maxHp}</span></div>
      ${xrings(r, { cls: 'xhud-r' })}<div class="xhud-s">${statsIcons(r, 10)}</div></div>`;
    stage().insertAdjacentHTML('afterbegin', xhud);
    setSide(panel(`Kafelki (${r.tiles.length})`, tilesGrid(r, { hit: ids, group: true })) + panel('Zestawy', xmedals(r, { names: true })) + panel('Cechy bohatera', `<div class="hc-perks">${perks(r)}</div><div class="bdgs row">${badgesHTML(r)}</div>`), 'v10');
  },
};
export const NAMES = {
  1: 'Minimum: zwierzak przy bohaterze, trzy kółka, reszta jak dziś', 2: 'Kompakt: statystyki w dwóch kolumnach, zestawy jako medale', 3: 'Zakładki w panelu: Statystyki / Kafelki / Zestawy',
  4: 'Szeroki panel w dwóch kolumnach', 5: 'Pasek ekwipunku pod sceną', 6: 'Pasek statystyk nad sceną', 7: 'Plecak wysuwany klawiszem B', 8: 'Kokpit: bohater w środku, statystyki po bokach',
  9: 'Hybryda: 6 głównych statystyk, reszta pod „więcej”', 10: 'Pas HUD pod paskiem, bok tylko na kafelki',
};
export const H = { R, impact, decree, afterKron, setSide, cols, statRows, short, xrings, tilesGrid, statsNamed, panel, pet };
export async function apply(n, o) {
  const r = R(); clearDecrees();
  document.documentElement.dataset.v = String(n);
  if (n >= 18) { const k = await import('./ikony.js'); return k.apply(n, H); }
  if (n >= 15) { const k = await import('./dziewiec.js'); return k.apply(n, H); }
  if (n >= 11) { const k = await import('./kokpit.js'); return k.apply(n, H); }
  VAR[n](r, o);
}
