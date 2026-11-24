// Runda 2 propozycji: układ „Kompakt” (z zrzutu właściciela) z przebudowaną kartą bohatera w stylu kokpitu i nowymi medalami zestawów.
import * as D from '../../shared/data.js';
import * as art from '../../art.js';
import * as T from '../../text.js';
import { setCounts } from '../../shared/stats.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SET_ICON = { jajeczne: '🥚', zbozowe: '🌽', rambo: '💪', rosolowe: '🔥', chlodnicze: '❄️', korpo: '💼' };
const setsOf = t => t.sets || (t.set ? [t.set] : []);
const setTotal = id => D.TILES.filter(t => !t.hatched && !t.hidden).reduce((a, t) => a + setsOf(t).filter(x => x === id).length, 0);

function setData(r) {
  const sc = setCounts(r.tiles, r.decree);
  const sets = Object.entries(D.SETS).filter(([id]) => sc[id]).map(([id, st]) => ({ id, name: st.name, n: sc[id], tot: setTotal(id), step: D.SET_STEPS.filter(s => sc[id] >= s).length, icon: SET_ICON[id] || '⭐' }));
  const ms = Object.entries(D.MILESTONES).map(([id, mm]) => ({ id, mm, n: Math.floor(r.tiles.filter(x => x === id).length / D.MILESTONE_EVERY) })).filter(x => x.n);
  return { sets, ms };
}
const pips = n => `<u>${D.SET_STEPS.map(s => `<i class="${n >= s ? 'on' : ''}"></i>`).join('')}</u>`;
const msTip = x => esc(x.mm.name + '\n' + x.mm.text);

// order: okrągły medal z kokardą, plakietka z liczbą, kropki progów (2/3/4/6)
function orders(r, o = {}) {
  const { sets, ms } = setData(r);
  return `<div class="ords ${o.cls || ''}">${sets.map(x => `<div class="ord t${x.step}" tabindex="0" data-tipk="set:${x.id}"><span class="ob"><i>${x.icon}</i></span><b class="oc">${x.n}</b>${pips(x.n)}${o.names ? `<em>${esc(x.name)}</em>` : ''}</div>`).join('')}${ms.map(x => `<div class="ord t3 ms" tabindex="0" data-tip="${msTip(x)}"><span class="ob"><i>★</i></span><b class="oc">${x.n}</b>${o.names ? `<em>${esc(x.mm.name.split(' ')[0])}</em>` : ''}</div>`).join('')}</div>`;
}
// tarcza: herb zestawu z liczbą w środku
function shields(r, o = {}) {
  const { sets, ms } = setData(r);
  return `<div class="shields ${o.cls || ''}">${sets.map(x => `<div class="shd t${x.step}" tabindex="0" data-tipk="set:${x.id}"><span class="sb"><i>${x.icon}</i><b>${x.n}</b></span>${pips(x.n)}${o.names ? `<em>${esc(x.name)}</em>` : ''}</div>`).join('')}${ms.map(x => `<div class="shd t3 ms" tabindex="0" data-tip="${msTip(x)}"><span class="sb"><i>★</i><b>${x.n}</b></span>${o.names ? `<em>${esc(x.mm.name.split(' ')[0])}</em>` : ''}</div>`).join('')}</div>`;
}

export function apply(n, H) {
  const { R, impact, decree, afterKron, setSide, cols, statRows, short, xrings, tilesGrid, statsNamed, panel, pet } = H;
  const r = R(); const { ids } = impact(r);
  cols(320); afterKron(decree(r, 'pasek'));
  const rows = statRows(r), half = Math.ceil(rows.length / 2);
  const col = rs => rs.map(([k, l, v]) => `<div class="si" tabindex="0" data-tipk="stat:${k}">${art.statIcon(k)}<b>${short(k, v)}</b></div>`).join('');
  const ch = D.CHARS[r.char], cp = T.CHAR_PERKS[r.char] || {}, pct = Math.round(r.hp / r.hero.maxHp * 100);
  const portrait = ring => `<div class="kfig ${ring ? 'ring' : ''}" style="--p:${pct}"><div class="kin">${art.heroArt(r.char, r.form)}</div>${pet(r, 'big')}</div>`;
  const name = `<div class="nm">${esc(ch.name)}</div><div class="fm">${esc(cp.title ? '★ ' + cp.title : cp.role || ch.style)}</div>`;
  const hp = `<div class="hpbar"><i style="width:${pct}%"></i></div><div class="cp-hp">${r.hp}/${r.hero.maxHp} życia</div>`;
  const tiles = panel(`Kafelki (${r.tiles.length})`, tilesGrid(r, { hit: ids }));
  const heroTip = esc(ch.name + ' · ' + (cp.role || ch.style) + '\n' + ch.text);
  if (n === 11) {
    // 9A: 10 statystyk po bokach portretu, kółka pod nim w tej samej karcie, medale-ordery pod kafelkami
    setSide(`<div class="panel kk" data-tip="${heroTip}"><div class="kk-top"><div class="kk-c">${col(rows.slice(0, half))}</div><div class="kk-m">${portrait()}${name}</div><div class="kk-c">${col(rows.slice(half))}</div></div>${hp}${xrings(r, { names: true, cls: 'kk-r' })}</div>` +
      tiles + panel('Zestawy', orders(r, { names: true })), 'v11');
  } else if (n === 12) {
    // 9B: pierścień życia wokół portretu, kółka w osobnym doku, medale-tarcze w jednym rzędzie pod kafelkami
    setSide(`<div class="panel kk kk-b" data-tip="${heroTip}"><div class="kk-top"><div class="kk-c">${col(rows.slice(0, half))}</div><div class="kk-m">${portrait(true)}${name}<div class="cp-hp">${r.hp}/${r.hero.maxHp}</div></div><div class="kk-c">${col(rows.slice(half))}</div></div></div>` +
      `<div class="panel dock">${xrings(r, { names: true })}</div>` + panel(`Kafelki (${r.tiles.length})`, tilesGrid(r, { hit: ids }) + shields(r, { cls: 'big', names: true })), 'v12');
  } else if (n === 13) {
    // 9C: pozioma karta (portret z pierścieniem, imię, mini-kółka), statystyki z nazwami, szarfa tarcz w karcie
    setSide(`<div class="panel kk kk-h" data-tip="${heroTip}"><div class="kk3">${portrait(true)}<div class="kk3-r">${name}<div class="cp-hp">${r.hp}/${r.hero.maxHp} życia</div>${xrings(r, { cls: 'mini' })}</div></div>${shields(r, { cls: 'sash' })}</div>` +
      panel('Statystyki', statsNamed(r)) + tiles, 'v13');
  } else {
    // 9D: kokpit z zestawami wewnątrz karty bohatera, kółka osobno
    setSide(`<div class="panel kk" data-tip="${heroTip}"><div class="kk-top"><div class="kk-c">${col(rows.slice(0, half))}</div><div class="kk-m">${portrait()}${name}</div><div class="kk-c">${col(rows.slice(half))}</div></div>${hp}<div class="kk-sets">${orders(r, { cls: 'row' })}</div></div>` +
      panel('Umiejętności', xrings(r, { names: true })) + tiles, 'v14');
  }
}
