// Runda 3: trzy dopieszczone wersje 9C (karta pozioma): statystyki w jednej kolumnie z jednolitym zapisem wartości,
// nazwy po zmianie (Dziobnięcie, Moc Dziobnięcia), odznaki, paski Atak/Obrona, zwierzak przyczepiony do postaci.
import * as D from '../../shared/data.js';
import * as art from '../../art.js';
import * as T from '../../text.js';
import { setCounts } from '../../shared/stats.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SET_ICON = { jajeczne: '🥚', zbozowe: '🌽', rambo: '💪', rosolowe: '🔥', chlodnicze: '❄️', korpo: '💼' };
const setsOf = t => t.sets || (t.set ? [t.set] : []);
const setTotal = id => D.TILES.filter(t => !t.hatched && !t.hidden).reduce((a, t) => a + setsOf(t).filter(x => x === id).length, 0);
const compForm = c => D.COMPANIONS[c.id].forms[Math.min(2, Math.max(0, (c.lvl | 0) - 1))];

// ---- statystyki: [klucz, nazwa, liczba, jednostka, skala-do-paska] ----
function stats(r) {
  const S = r.hero, f = T.fmtRegen;
  const rows = {
    atk: ['atk', 'Atak', S.atk, '', 80], aspd: ['aspd', 'Szybkość ataku', S.aspd, '%', 300], crit: ['crit', 'Dziobnięcie', S.crit, '%', 100],
    critMult: ['critMult', 'Moc Dziobnięcia', S.critMult, '%', 400], dmg: ['dmg', 'Obrażenia', '+' + S.dmg, '%', 300],
    maxHp: ['maxHp', 'Życie', S.maxHp, '', 60], armor: ['armor', 'Pancerz', S.armor, '', 60], evade: ['evade', 'Unik', S.evade, '%', 75], regen: ['regen', 'Regeneracja', f(S.regen), ' / s', 50],
    luck: ['luck', 'Szczęście', S.luck, '', 100],
  };
  const g = [['Ofensywa', ['atk', 'aspd', 'crit', 'critMult', 'dmg']], ['Obrona', ['maxHp', 'armor', 'evade', 'regen']], ['Inne', ['luck']]];
  return g.map(([n, ks]) => [n, ks.filter(k => k !== 'dmg' || S.dmg).map(k => rows[k])]);
}
function statList(r, style) {
  const raw = { aspd: r.hero.aspd, crit: r.hero.crit, critMult: r.hero.critMult, dmg: r.hero.dmg, maxHp: r.hero.maxHp, armor: r.hero.armor, evade: r.hero.evade, regen: r.hero.regen, luck: r.hero.luck, atk: r.hero.atk };
  let z = 0;
  const groups = stats(r).map(([name, rows]) => (style === 'flat' ? '' : `<div class="slg">${name}</div>`) + rows.map(([k, label, n, u, cap]) => {
    z++;
    const bar = style === 'bars' ? `<span class="slb"><i style="width:${Math.max(4, Math.min(100, raw[k] / cap * 100))}%"></i></span>` : '';
    return `<div class="slr ${z % 2 ? 'z' : ''}" tabindex="0" data-tipk="stat:${k}">${art.statIcon(k)}<span class="sln">${label}</span>${bar}<span class="slv"><b>${n}</b><i>${u.trim()}</i></span></div>`;
  }).join('')).join('');
  return `<div class="sl ${style}">${groups}</div>`;
}

// ---- medale: tarcze ----
function shields(r, cls = '') {
  const sc = setCounts(r.tiles, r.decree);
  const sets = Object.entries(D.SETS).filter(([id]) => sc[id]).map(([id, st]) => {
    const n = sc[id], step = D.SET_STEPS.filter(s => n >= s).length;
    return `<div class="shd t${step}" tabindex="0" data-tipk="set:${id}"><span class="sb"><i>${SET_ICON[id] || '⭐'}</i><b>${n}</b></span><u>${D.SET_STEPS.map(s => `<i class="${n >= s ? 'on' : ''}"></i>`).join('')}</u></div>`;
  });
  const ms = Object.entries(D.MILESTONES).map(([id, mm]) => ({ mm, n: Math.floor(r.tiles.filter(x => x === id).length / D.MILESTONE_EVERY) })).filter(x => x.n)
    .map(x => `<div class="shd t3 ms" tabindex="0" data-tip="${esc(x.mm.name + '\n' + x.mm.text)}"><span class="sb"><i>★</i><b>${x.n}</b></span></div>`);
  return { list: [...sets, ...ms], html: `<div class="shields ${cls}">${[...sets, ...ms].join('')}</div>` };
}
const badges = r => (r.badges || []).length ? `<div class="bdrow">${r.badges.map(b => `<div class="chip badge" tabindex="0" data-tipk="badge:${b}">${art.badgeIcon(b)}</div>`).join('')}</div>` : '';
const petChip = r => { const c = r.companion; if (!c) return ''; const d = D.COMPANIONS[c.id]; return `<span class="petchip" tabindex="0" data-tip="${esc(compForm(c) + ' (poziom ' + c.lvl + ' z 3)\n' + d.text + '\nRośnie po każdym pokonanym bossie.')}">${art.companionArt(c.id)}<b>${esc(compForm(c))}</b><i>${c.lvl}/3</i></span>`; };

export function apply(n, H) {
  const { R, impact, decree, afterKron, setSide, cols, xrings, tilesGrid, panel, pet } = H;
  const r = R(); const { ids } = impact(r);
  // z istniejącej ramki bierzemy tylko paski Atak/Obrona i powiązania zestawów; chipy zestawów zastępują tarcze
  const zc = document.querySelector('.zcmp'), zrows = zc ? [...zc.querySelectorAll('.zc')].map(e => e.outerHTML).join('') : '';
  const zcmp = zrows ? `<div class="zcmp">${zrows}</div>` : '';
  const zl = zc && zc.querySelector('.zlinks') ? zc.querySelector('.zlinks').outerHTML : '';
  cols(320); afterKron(decree(r, 'pasek'));
  const ch = D.CHARS[r.char], cp = T.CHAR_PERKS[r.char] || {}, pct = Math.round(r.hp / r.hero.maxHp * 100);
  const heroTip = esc(ch.name + ' · ' + (cp.role || ch.style) + '\n' + ch.text);
  const ring = (cls = '') => `<div class="kfig ring ${cls}" style="--p:${pct}"><div class="kin">${art.heroArt(r.char, r.form)}</div>${pet(r, 'big')}</div>`;
  const nm = `<div class="nm">${esc(ch.name)}</div><div class="fm">${esc(cp.title ? '★ ' + cp.title : cp.role || ch.style)}</div>`;
  const tiles = (cls) => panel(`Kafelki (${r.tiles.length})`, tilesGrid(r, { hit: ids, cls }));
  if (n === 15) {
    // 9C-1 „Klasyk”: portret z pierścieniem, mini-kółka, szarfa tarcz, odznaki; statystyki w grupach z zebrą
    setSide(`<div class="panel kk kk-h c1" data-tip="${heroTip}"><div class="kk3">${ring()}<div class="kk3-r">${nm}<div class="cp-hp">${r.hp} / ${r.hero.maxHp} życia</div>${xrings(r, { cls: 'mini' })}</div></div>${shields(r, 'sash').html}${zl}${badges(r)}</div>` +
      panel('Statystyki', zcmp + statList(r, 'zebra')) + tiles('tiny'), 'v15');
  } else if (n === 16) {
    // 9C-2 „Karta kolekcjonerska”: ramka portretu z paskiem życia, zwierzak jako nazwany chip przy imieniu, kółka z nazwami, wartości w pastylkach
    setSide(`<div class="panel kk kk-card" data-tip="${heroTip}"><div class="kc-head"><div class="kc-pic"><div class="kc-fig">${art.heroArt(r.char, r.form)}</div><div class="kc-hp"><i style="width:${pct}%"></i><b>${r.hp} / ${r.hero.maxHp}</b></div></div><div class="kc-r">${nm}${petChip(r)}${badges(r).replace('bdrow', 'bdrow in')}</div></div>` +
      `${xrings(r, { names: true, cls: 'wide' })}${shields(r, 'sash').html}${zl}</div>` + panel('Statystyki', zcmp + statList(r, 'pills')) + tiles('tiny'), 'v16');
  } else {
    // 9C-3 „Kokpit pionowy”: portret w środku, tarcze zestawów po bokach, kółka zawieszone pod portretem; statystyki z mikropaskami
    const sh = shields(r).list, half = Math.ceil(sh.length / 2);
    setSide(`<div class="panel kk kk-v" data-tip="${heroTip}"><div class="kv-top"><div class="kv-s">${sh.slice(0, half).join('')}</div><div class="kv-m">${ring('xl')}${nm}<div class="cp-hp">${r.hp} / ${r.hero.maxHp} życia</div></div><div class="kv-s">${sh.slice(half).join('')}</div></div>` +
      `${xrings(r, { names: true, cls: 'hang' })}${zl}${badges(r)}</div>` + panel('Statystyki', zcmp + statList(r, 'bars')) + tiles('tiny'), 'v17');
  }
}

export { statList, badges };
