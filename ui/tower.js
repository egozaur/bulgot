// Bulgot, interfejs: klatka schodowa i wieża pięter.
// Wydzielone z app.js (2026-11-24). Wszystkie funkcje i stałe są eksportowane i dzielą stan przez G (ui/core.js).
import * as D from '../shared/data.js';
import * as art from '../art.js';
import { $, G, esc } from './core.js';
import { cls } from './fight.js';
import { zoneAt } from './run.js';
import { REDUCED } from './side.js';

// ---------- klatka schodowa (komputer): zygzakowate schody, kurczak wchodzi piętro wyżej, płomień rośnie od dołu ----------
// Kamera przesuwa się za kurczakiem, a górne piętra toną w mgle (nie wiadomo, co jest wyżej); ściana zmienia kolor ze strefą.
export const WIDE = matchMedia('(min-width: 1121px)');
export function stairsHTML() {
  const r = G.run, M = D.MODES[r.mode], n = M.rounds, g = art.stairsGeom(n), W = art.ST.W, f = Math.min(r.round, n), f0 = Math.min(G.cabFrom || 0, n);
  const over = r.phase === 'over', up = !over && f0 && f0 < f;
  let plates = '';
  for (let k = 1; k <= n; k++) {
    const nem = r.nemesis && !r.nemesis.beaten && r.nemesis.round === k;
    const cls = ['fp', k < f || (over && k <= r.done) ? 'done' : '', k === f && !over ? 'now' : '', M.bosses[k] ? 'boss' : '', nem ? 'nem' : ''].join(' ');
    const tip = 'Piętro ' + k + (M.bosses[k] ? ': boss' : '') + (nem ? ': ' + r.nemesis.name : '');
    plates += `<div class="${cls}" style="top:${g.y(k) - 21}px" data-tip="${esc(tip)}">${M.bosses[k] || nem ? art.skullIcon() : ''}${nem ? '<i class="alarm" aria-hidden="true"></i>' : ''}<span class="fn">${k}</span></div>`;
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
export function fitTower(animate = true) {
  const vp = $('.climb-vp'), cl = vp && $('.climb', vp); if (!cl || !G.run) return;
  const H = vp.clientHeight, ih = cl.offsetHeight, g = art.stairsGeom(D.MODES[G.run.mode].rounds);
  const cam = k => Math.max(0, Math.min(ih - H, g.y(k) - H * 0.62));
  const f = +cl.dataset.f, f0 = +cl.dataset.f0;
  cl.style.setProperty('--cam', cam(f).toFixed(1) + 'px'); cl.style.setProperty('--cam0', cam(f0 || f).toFixed(1) + 'px');
  if (animate && f0 && !REDUCED.matches && !vp.classList.contains('go')) { vp.classList.add('go'); setTimeout(() => vp.classList.remove('go'), 2000); }
}
export function towerHTML() {
  const r = G.run, M = D.MODES[r.mode];
  let rows = '';
  for (let n = M.rounds; n >= 1; n--) {
    const nem = r.nemesis && !r.nemesis.beaten && r.nemesis.round === n;
    const cls = ['floor', n < r.round || r.phase === 'over' && n <= r.done ? 'done' : '', n === r.round && r.phase !== 'over' ? 'now' : '', M.bosses[n] ? 'boss' : '', nem ? 'nem' : ''].join(' ');
    const tip = 'Piętro ' + n + (M.bosses[n] ? ': boss' : '') + (nem ? ': ' + r.nemesis.name : '');
    const isNow = n === r.round && r.phase !== 'over', up = isNow && G.cabFrom && G.cabFrom < n;
    rows += `<div class="${cls}" title="${esc(tip)}">${isNow ? `<span class="cab${up ? ' up' : ''}" aria-hidden="true">${art.portrait(r.char, r.form)}</span>` : ''}${M.bosses[n] || nem ? art.skullIcon() : ''}${nem ? '<i class="alarm" aria-hidden="true"></i>!' : ''}<span class="fn">${n}</span></div>`;
  }
  G.cabFrom = r.phase === 'over' ? 0 : r.round;
  return `<aside class="tower shaft" aria-label="Postęp: szyb windy"><h4>Piętra</h4>${rows}<div class="pot"></div></aside>`;
}
