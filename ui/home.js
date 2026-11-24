// Bulgot, interfejs: start aplikacji, render, ekran startowy, przygotowanie runu (tryb, postać, palnik).
// Wydzielone z app.js (2026-11-24). Wszystkie funkcje i stałe są eksportowane i dzielą stan przez G (ui/core.js).
import { LOCAL, getPlayer, playerNow, avatarUrl } from '../api.js';
import * as D from '../shared/data.js';
import * as art from '../art.js';
import * as T from '../text.js';
import { maybeCasinoAsk } from './casino.js';
import { $, G, SPIN, TILE, act, charView, esc, fmtNum } from './core.js';
import { startFight } from './fight.js';
import { fitBoard } from './invoice.js';
import { maybeLevelUp, stazOf, stazPill } from './meta.js';
import { renderRun } from './run.js';
import { rollCounters } from './side.js';
import { fitTower } from './tower.js';

// ---------- start ----------
export async function init() {
  render();
  if (!LOCAL && window.PL3Y && window.PL3Y.isLocked && window.PL3Y.isLocked()) await new Promise(res => document.addEventListener('pl3y:unlock', res, { once: true }));
  const pl = await getPlayer();
  if (!pl) { G.screen = 'noplayer'; return render(); }
  const j = await act('state');
  if (!j) { G.screen = 'noplayer'; return render(); }
  G.screen = 'home'; render();
}

export function render() {
  if (SPIN.active) SPIN.active.abort();
  const root = $('#screen');
  switch (G.screen) {
    case 'loading': root.innerHTML = '<div class="loading"><span>Bulgocze</span> <i></i><i></i><i></i></div>'; break;
    case 'noplayer': root.innerHTML = `<div class="loading" style="flex-direction:column;gap:14px;text-align:center"><span>Do gry w Bulgot potrzebny jest nick.</span><button class="btn primary" data-act="retry">Wybierz nick</button><a class="btn ghost" href="/">← PL3Y</a></div>`; break;
    case 'home': root.innerHTML = renderHome(); setTimeout(maybeLevelUp, 120); setTimeout(maybeCasinoAsk, 500); break;
    case 'setup': root.innerHTML = renderSetup(); break;
    case 'run': root.innerHTML = renderRun(); rollCounters(); fitTower(); fitBoard(); setTimeout(maybeCasinoAsk, 300); break;
    case 'fight': return;   // arena buduje się w startFight()
  }
}

// ---------- ekran startowy ----------
export function bubblesHTML() {
  return Array.from({ length: 16 }, (_, i) => { const s = 8 + (i * 7) % 26; return `<i style="left:${(i * 61) % 100}%;width:${s}px;height:${s}px;animation-duration:${7 + (i * 3) % 9}s;animation-delay:-${(i * 2.3) % 9}s;--dx:${(i % 2 ? 1 : -1) * (10 + i * 3)}px"></i>`; }).join('');
}
export function avatarHTML(pl) {
  if (!pl) return '';
  return pl.avatar && !LOCAL ? `<img src="${esc(avatarUrl(pl.avatar))}" alt="" onerror="this.remove()">` : `<span class="av">${esc((pl.nick || '?')[0].toUpperCase())}</span>`;
}
export function dailyBtn() {
  const d = G.daily; if (!d) return '';
  return `<button class="btn big daily ${d.used ? 'done' : ''}" data-act="daily"><span>Dyżur dnia</span><small>${d.used ? (d.active ? 'w toku' : 'wynik ' + fmtNum(d.score)) : 'nowy, jedno podejście'}</small></button>`;
}
export function renderHome() {
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
export function metaChips() {
  const p = G.profile, out = [];
  if (p.nemesis) { const n = p.nemesis, t = n.tile && TILE[n.tile]; out.push(`<span class="meta-chip nem" tabindex="-1" data-tip="${esc('Twój Nemezis: ' + n.name + (n.lvl > 1 ? ' (awans ' + n.lvl + '.)' : '') + '\n' + (t ? 'Ukradł ci ' + t.name + '. ' : '') + 'Czeka na ciebie w następnym runie.')}">${art.skullIcon()}</span>`); }
  if (p.will && TILE[p.will.tile]) { const ch = D.CHARS[p.will.char], multi = p.chars.length > 1; out.push(`<span class="meta-chip will" tabindex="-1" data-tip="${esc('Testament: ' + TILE[p.will.tile].name + '\nCzeka w pierwszej ofercie' + (multi ? ' następnego runu postacią inną niż ' + (ch ? ch.name : '') : ' następnego runu') + '.')}">${art.tileIcon(p.will.tile)}</span>`); }
  return out.length ? `<div class="meta-chips">${out.join('')}</div>` : '';
}
export const BURNERS = ['Ognisko', 'Gazówka', 'Kuchenka', 'Piec', 'Kuźnia', 'Wulkan'];
export const charIds = () => Object.keys(D.CHARS).filter(id => !D.CHARS[id].retired);
// Klątwy Prezesa: dobrowolne utrudnienia za premię do wyniku (do D.CURSE_MAX naraz).
// Na razie UKRYTE na ekranie startowym (decyzja właściciela, 2026-11-23). Cały mechanizm zostaje; żeby przywrócić, ustaw true.
export const SHOW_CURSES = false;
export function cursesHTML() {
  const s = G.setup, sel = s.curses || (s.curses = []);
  const chips = Object.entries(D.CURSES).map(([id, c]) => `<button class="curse-chip ${sel.includes(id) ? 'on' : ''}" data-act="curse" data-v="${id}" aria-pressed="${sel.includes(id)}" data-tip="${esc(c.name + '\n' + c.text + '\nPremia do wyniku: +' + c.pct + '%')}">${art.emo(c.icon)}<b>${esc(c.name)}</b><small>+${c.pct}%</small></button>`).join('');
  return `<div class="curses"><div class="sec">Klątwy Prezesa <small>dobrowolne, do ${D.CURSE_MAX}${sel.length ? ': wynik +' + D.cursePct(sel) + '%' : ': trudniej, ale wynik rośnie'}</small></div><div class="curse-row">${chips}</div></div>`;
}
// Ekran startowy w jednym kroku (makieta 11 „Arena i lista mocy”): postać (jajka), bohater ze statystykami i zdolnościami, lista mocy palnika, pasek podsumowania.
export const lockText = c => c.secret ? '???' : ((D.UNLOCK_BY_ID[c.lock] || {}).text || '');
export const burnMult = (g, s) => ((1 + g * .25) * (1 + D.cursePct(s.curses) / 100)).toFixed(2).replace('.', ',');
export const BURN_HEAT = ['#7bd37b', '#e8d34a', '#ffb347', '#ff8c2b', '#e4572e', '#d6262d'];
export const shortName = v => v.hidden ? '???' : v.name.replace(/^(Kurczak|Kura|Kogut|Indyczka) /, '').replace(/ .*/, '');
export function setupOk() { const s = G.setup, p = G.profile; return p.chars.includes(charIds()[s.cur]) && s.garnek <= p.garnek; }
export function renderSetup() {
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

export function carGo(i) { const n = charIds().length, s = G.setup; s.cur = Math.max(0, Math.min(n - 1, i)); const id = charIds()[s.cur]; if (G.profile.chars.includes(id)) s.char = id; render(); }
export function garGo(v) { const s = G.setup; s.garnek = Math.max(0, Math.min(D.GARNEK.length - 1, v)); render(); }
