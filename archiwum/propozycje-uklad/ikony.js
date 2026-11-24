// Runda 4: tylko karta bohatera z C3. Zestawy jako duże ikony z konturem (bez tarcz i ramek), kółka umiejętności niżej i większe.
import * as D from '../../shared/data.js';
import * as art from '../../art.js';
import * as T from '../../text.js';
import { setCounts } from '../../shared/stats.js';
import { statList, badges } from './dziewiec.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SET_ICON = { jajeczne: '🥚', zbozowe: '🌽', rambo: '💪', rosolowe: '🔥', chlodnicze: '❄️', korpo: '💼' };

function items(r) {
  const sc = setCounts(r.tiles, r.decree);
  const sets = Object.entries(D.SETS).filter(([id]) => sc[id]).map(([id, st]) => ({ id, name: st.name, icon: SET_ICON[id] || '⭐', n: sc[id], step: D.SET_STEPS.filter(s => sc[id] >= s).length, tip: `data-tipk="set:${id}"` }));
  const ms = Object.entries(D.MILESTONES).map(([id, mm]) => ({ mm, n: Math.floor(r.tiles.filter(x => x === id).length / D.MILESTONE_EVERY) })).filter(x => x.n)
    .map(x => ({ id: 'ms', name: x.mm.name, icon: '⭐', n: x.n, step: 3, ms: true, tip: `data-tip="${esc(x.mm.name + '\n' + x.mm.text)}"` }));
  return [...sets, ...ms];
}
const pips = n => `<u>${D.SET_STEPS.map(s => `<i class="${n >= s ? 'on' : ''}"></i>`).join('')}</u>`;
// ikona zestawu: sam symbol z konturem w kolorze progu, liczba jako mała cyfra z obrysem, kropki progów
const six = (x, cls = '', style = '') => `<div class="six t${x.step} ${x.ms ? 'ms' : ''} ${cls}" style="${style}" tabindex="0" ${x.tip}><span class="si-i">${x.icon}</span><b class="si-n">${x.n}</b>${pips(x.n)}</div>`;

export function apply(n, H) {
  const { R, impact, decree, afterKron, setSide, cols, xrings, tilesGrid, panel, pet } = H;
  const r = R(); const { ids } = impact(r);
  const zc = document.querySelector('.zcmp'), zrows = zc ? [...zc.querySelectorAll('.zc')].map(e => e.outerHTML).join('') : '';
  const zcmp = zrows ? `<div class="zcmp">${zrows}</div>` : '', zl = zc && zc.querySelector('.zlinks') ? zc.querySelector('.zlinks').outerHTML : '';
  cols(320); afterKron(decree(r, 'pasek'));
  const ch = D.CHARS[r.char], cp = T.CHAR_PERKS[r.char] || {}, pct = Math.round(r.hp / r.hero.maxHp * 100);
  const heroTip = esc(ch.name + ' · ' + (cp.role || ch.style) + '\n' + ch.text);
  const ring = (cls = '') => `<div class="kfig ring ${cls}" style="--p:${pct}"><div class="kin">${art.heroArt(r.char, r.form)}</div><span class="hpnum">${r.hp} / ${r.hero.maxHp}</span>${pet(r, 'big')}</div>`;
  const nm = `<div class="nm">${esc(ch.name)}</div><div class="fm">${esc(cp.title ? '★ ' + cp.title : cp.role || ch.style)}</div>`;
  const hp = '';
  const rings = xrings(r, { names: true, cls: 'big4' });
  const it = items(r), half = Math.ceil(it.length / 2);
  let card;
  if (n === 18) {
    // D1: duże ikony w dwóch kolumnach po bokach portretu
    card = `<div class="kv-top d1"><div class="kv-s">${it.slice(0, half).map(x => six(x)).join('')}</div><div class="kv-m">${ring('xl')}${nm}${hp}</div><div class="kv-s">${it.slice(half).map(x => six(x)).join('')}</div></div>${rings}`;
  } else if (n === 19) {
    // D2: orbita: wszystkie ikony na łuku nad portretem
    const cx = 138, cy = 112, rx = 122, ry = 82, N = it.length;
    const pos = it.map((x, i) => { const a = (200 - i * 220 / (N - 1)) * Math.PI / 180; return six(x, 'abs', `left:${cx + rx * Math.cos(a)}px;top:${cy - ry * Math.sin(a)}px`); }).join('');
    card = `<div class="orb">${pos}<div class="orb-p">${ring('xl')}</div></div><div class="kv-m">${nm}${hp}</div>${rings}`;
  } else if (n === 20) {
    // D3: jeden rząd ikon pod imieniem, portret większy
    card = `<div class="kv-m top">${ring('xxl')}${nm}${hp}</div><div class="six-row">${it.map(x => six(x)).join('')}</div>${rings}`;
  } else if (n === 21) {
    // D4: kolumny po bokach: ikona + duża liczba obok niej
    card = `<div class="kv-top d4"><div class="kv-s">${it.slice(0, half).map(x => six(x, 'inl')).join('')}</div><div class="kv-m">${ring('xl')}${nm}${hp}</div><div class="kv-s">${it.slice(half).map(x => six(x, 'inl')).join('')}</div></div>${rings}`;
  } else {
    // D5: dwa łuki po bokach portretu (ikony idą po okręgu)
    const cx = 138, cy = 96, R = 100, deg = a => a * Math.PI / 180;
    const L = [125, 152, 180, 208, 235], Rr = [55, 28, 0, -28, -55];
    const place = (x, a, side) => six(x, 'abs', `left:${cx + R * Math.cos(deg(a))}px;top:${cy - R * Math.sin(deg(a))}px`);
    const left = it.slice(0, half).map((x, i, arr) => place(x, 130 + i * 27, 'l')).join('');
    const right = it.slice(half).map((x, i, arr) => place(x, 50 - i * 27, 'r')).join('');
    card = `<div class="orb d5">${left}${right}<div class="orb-p c">${ring('xl')}</div></div><div class="kv-m">${nm}${hp}</div>${rings}`;
  }
  setSide(`<div class="panel kk kk-v kk-i i${n}" data-tip="${heroTip}">${card}<div class="mix">${zl}${badges(r)}</div></div>` + panel('Statystyki', zcmp + statList(r, 'bars')) + panel(`Kafelki (${r.tiles.length})`, tilesGrid(r, { hit: ids, cls: 'tiny' })), 'v' + n);
}
