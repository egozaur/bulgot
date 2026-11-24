// Makiety nowego paska pięter (schody po lewej w runie). 10 wariantów w ciepłej palecie gry.
// Każdy wariant: { id, name, desc, css, build(c) → { html, H, yc(k) } }.  mountTower() podmienia zawartość <aside class="tower">.
import * as art from '../../art.js';
import * as D from '../../shared/data.js';

export const ZC = ['#49c2b1', '#ffb347', '#e4572e'];                       // strefy I, II, III
export const zoneOf = (mode, k) => { const z = D.MODES[mode].zones; return (z.find(q => k <= q.upTo) || z[z.length - 1]).zone; };
const hsh = (a, b) => { let h = (a * 2654435761 + b * 40503) >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; return (h >>> 8) / 16777216; };
const st = (c, k) => k < c.f ? 'done' : k === c.f ? 'now' : 'todo';
const plate = (c, k, style = '', inner = '', cls = '') => `<div class="vt-pl s-${st(c, k)} z${c.zone(k)} ${c.boss(k) ? 'boss' : ''} ${cls}" style="${style}"><b>${c.boss(k) ? c.skull() : ''}<i>${k}</i>${inner}</b></div>`;

export const BASE_CSS = `
.vt{position:absolute;inset:0;overflow:hidden;background:#150d08}
.vt-in{position:absolute;left:0;top:0;width:100%;will-change:transform}
.vt-pl{position:absolute;filter:drop-shadow(0 2px 0 #1a0f08);z-index:3}
.vt-pl b{display:flex;align-items:center;justify-content:center;gap:4px;width:100%;height:100%;font:800 15px/1 var(--display);background:#2b1a12;color:#c9b89a;clip-path:polygon(7px 0,100% 0,100% calc(100% - 7px),calc(100% - 7px) 100%,0 100%,0 7px);box-shadow:inset 0 0 0 2px #4a3a2a}
.vt-pl i{font-style:normal}
.vt-pl.s-done b{background:linear-gradient(#ffc766,#d98324);color:#2b1a12;box-shadow:inset 0 0 0 2px #fff3c4}
.vt-pl.s-now{z-index:7;filter:drop-shadow(0 0 9px #ffd666)}.vt-pl.s-now b{background:#ffe9a8;color:#2b1a12;box-shadow:inset 0 0 0 2px #fff}
.vt-pl.boss.s-todo b{background:#4a1a12;color:#ffb199;box-shadow:inset 0 0 0 2px #a8321f}
.vt-pl.boss.s-done b{background:linear-gradient(#e0794a,#a8321f);color:#2b0d07;box-shadow:inset 0 0 0 2px #ffd0bf}
.vt-pl.boss.s-now b{background:#ffb199}
.vt-pl.tab b{justify-content:flex-start;padding-left:10px;font-size:18px}
.vt-sk{width:13px;height:13px;flex:none}
.vt-ch{display:block;position:absolute;z-index:6}.vt-ch svg{width:100%;height:100%;display:block;overflow:visible}
.vt-fire{position:absolute;left:0;right:0;bottom:0;pointer-events:none;z-index:9}.vt-fire .flames{width:100%;height:100%;display:block}
.vt-rf path.t{transform-box:fill-box;transform-origin:50% 100%;animation:vtf 1.3s ease-in-out infinite alternate}
@keyframes vtf{from{transform:scaleY(.88) skewX(-2deg)}to{transform:scaleY(1.08) skewX(2deg)}}
html.reduce .vt-rf path.t{animation:none}
.vt-fog{position:absolute;left:0;right:0;top:0;height:110px;background:linear-gradient(#150d08 8%,rgba(21,13,8,0));z-index:8;pointer-events:none}
`;

// ---------- 1. Ciepłe schody: ten sam zygzak, ale drewno, mosiądz i pasy ostrzegawcze ----------
function b1(c) {
  const { n, f, W } = c, P = 76, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 36, LW = 50, L0 = 8, R0 = W - 8 - LW;
  const wallC = ['#2a2019', '#33200f', '#361715'];
  let wall = '', s = '';
  for (let k = n; k >= 1; k--) {
    const z = c.zone(k), top = y(k) - P + 12;
    wall += `<rect x="0" y="${top}" width="${W}" height="${P}" fill="${wallC[z]}"/><path d="M0 ${y(k) + 12}H${W}" stroke="#120a05" stroke-width="3"/>`;
    for (let i = 0; i < 6; i++) wall += `<path d="M${14 + i * 30} ${top + 4}v${P - 8}" stroke="${ZC[z]}" stroke-width="1.5" opacity=".1"/>`;
    wall += `<rect x="${W / 2 - 10}" y="${top + 14}" width="20" height="24" rx="3" fill="${k <= f ? '#ffd27a' : '#2b1a12'}" opacity="${k <= f ? .8 : 1}" stroke="#120a05" stroke-width="3"/><path d="M${W / 2} ${top + 14}v24M${W / 2 - 10} ${top + 26}h20" stroke="#120a05" stroke-width="2"/>`;
  }
  for (let k = 1; k <= n; k++) {
    const left = k % 2 === 1, lx = left ? L0 : R0, lit = k <= f;
    s += `<rect x="${lx}" y="${y(k)}" width="${LW}" height="13" rx="3" fill="${lit ? '#c98a3e' : '#7a5230'}" stroke="#120a05" stroke-width="3"/><path d="M${lx + 3} ${y(k) + 3}H${lx + LW - 3}" stroke="${lit ? '#ffe3a0' : '#a07a50'}" stroke-width="2.4" stroke-linecap="round"/><rect x="${lx}" y="${y(k) + 14}" width="${LW}" height="5" fill="url(#hz1)" stroke="#120a05" stroke-width="2"/>`;
    if (k < n) {
      const xs = left ? L0 + LW : R0, xe = left ? R0 : L0 + LW, y0 = y(k), y1 = y(k + 1), m = 8, dx = (xe - xs) / m, dy = (y1 - y0) / m, T = 11, ru = k < f;
      let top = `M${xs} ${y0}`; for (let i = 0; i < m; i++) top += `V${(y0 + dy * (i + 1)).toFixed(1)}H${(xs + dx * (i + 1)).toFixed(1)}`;
      s += `<path d="${top}L${xe} ${y1 + T}L${xs} ${y0 + T}Z" fill="${ru ? '#8a5428' : '#5a3a20'}" stroke="#120a05" stroke-width="3" stroke-linejoin="round"/>`;
      let tr = ''; for (let i = 1; i <= m; i++) tr += `M${(xs + dx * (i - 1) + Math.sign(dx)).toFixed(1)} ${(y0 + dy * i + 2).toFixed(1)}H${(xs + dx * i - Math.sign(dx)).toFixed(1)}`;
      s += `<path d="${tr}" stroke="${ru ? '#ffc766' : '#8a6a48'}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
      let posts = ''; for (let i = 0; i <= m; i += 2) posts += `M${(xs + dx * i).toFixed(1)} ${(y0 + dy * i - 24).toFixed(1)}v24`;
      s += `<path d="${posts}" stroke="#120a05" stroke-width="3" stroke-linecap="round"/><path d="M${xs} ${y0 - 24}L${xe} ${y1 - 24}" stroke="#120a05" stroke-width="6.5" stroke-linecap="round"/><path d="M${xs} ${y0 - 24}L${xe} ${y1 - 24}" stroke="${ru ? '#ffb347' : '#a8733a'}" stroke-width="3" stroke-linecap="round"/>`;
    }
  }
  const top = y(n) - 70, tx = n % 2 ? R0 - 4 : L0 + 4;
  const roof = `<rect x="${tx}" y="${top}" width="42" height="68" rx="5" fill="#2b1a12" stroke="#ffd23f" stroke-width="3"/><path d="M${tx + 21} ${top + 5}v58" stroke="#4a3a2a" stroke-width="2"/><path d="M${tx + 4} ${top - 14}l7 -11l10 9l10 -9l7 11z" fill="#ffd23f" stroke="#120a05" stroke-width="2.6" stroke-linejoin="round"/>`;
  let plates = '';
  for (let k = 1; k <= n; k++) plates += plate(c, k, `left:${k % 2 ? W - 8 - 62 : 8}px;top:${y(k) - 16}px;width:62px;height:26px`);
  const cx = (f % 2 ? L0 : R0) + LW / 2;
  return { H, yc: k => y(k), html: `<svg width="${W}" height="${H}" style="position:absolute;inset:0"><defs><pattern id="hz1" width="10" height="5" patternUnits="userSpaceOnUse" patternTransform="skewX(-30)"><rect width="5" height="5" fill="#ffb347"/><rect x="5" width="5" height="5" fill="#2b1a12"/></pattern></defs>${wall}${roof}${s}</svg>${plates}<span class="vt-ch" style="left:${cx - 24}px;top:${y(f) - 47}px;width:48px;height:48px">${c.chickSvg}</span>` };
}

// ---------- 2. Neonowy tor: szyna z tabliczkami, jak lista poziomów w grze ----------
function b2(c) {
  const { n, f, W } = c, P = 62, TOP = 70, H = TOP + n * P + 110, y = k => TOP + (n - k) * P + 30, RX = 36;
  let h = `<div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,179,71,.07) 0 2px,transparent 2px ${P / 2}px),linear-gradient(90deg,transparent ${RX + 54}px,rgba(255,179,71,.04))"></div>`;
  h += `<div style="position:absolute;left:${RX - 3}px;width:6px;top:${y(n)}px;height:${y(1) - y(n)}px;border-radius:3px;background:repeating-linear-gradient(#4a3a2a 0 8px,transparent 8px 14px)"></div>`;
  h += `<div style="position:absolute;left:${RX - 3}px;width:6px;top:${y(f)}px;height:${y(1) - y(f) + 60}px;border-radius:3px;background:linear-gradient(#ffe9a8,#ffb347 20%,#ff8c2b);box-shadow:0 0 14px #ff8c2b,0 0 30px rgba(255,140,43,.6)"></div>`;
  for (let k = 1; k <= n; k++) {
    const z = c.zone(k), s = st(c, k);
    if (k > 1 && z !== c.zone(k - 1)) h += `<div style="position:absolute;left:8px;right:8px;top:${y(k) + P / 2 - 8}px;height:16px;display:flex;align-items:center;gap:6px;font:800 10px/1 var(--display);letter-spacing:.18em;color:${ZC[z]}"><i style="flex:1;height:2px;background:${ZC[z]};opacity:.6;box-shadow:0 0 8px ${ZC[z]}"></i>STREFA ${['I', 'II', 'III'][z]}<i style="flex:1;height:2px;background:${ZC[z]};opacity:.6;box-shadow:0 0 8px ${ZC[z]}"></i></div>`;
    h += `<div style="position:absolute;left:${RX - 6}px;top:${y(k) - 6}px;width:12px;height:12px;border-radius:50%;background:${s === 'todo' ? '#2b1a12' : '#ffe9a8'};border:3px solid ${s === 'todo' ? '#5a4a3a' : '#ff8c2b'};${s !== 'todo' ? 'box-shadow:0 0 10px #ffb347' : ''}"></div>`;
    h += `<div style="position:absolute;left:${RX + 8}px;top:${y(k)}px;width:12px;height:2px;background:${s === 'todo' ? '#4a3a2a' : '#ff8c2b'}"></div>`;
    h += plate(c, k, `left:${RX + 20}px;top:${y(k) - 15}px;width:${W - RX - 28}px;height:30px`, `<small style="margin-left:auto;margin-right:8px;font:700 9px var(--mono);letter-spacing:.1em;opacity:.8">${c.boss(k) ? 'BOSS' : s === 'done' ? 'OK' : ''}</small>`, 'tab');
  }
  h += `<div style="position:absolute;left:${RX - 28}px;top:${y(f) - 28}px;width:56px;height:56px;border-radius:50%;background:radial-gradient(#4a3a2a,#2b1a12);border:4px solid #ffb347;box-shadow:0 0 18px #ff8c2b,0 0 0 3px #2b1a12;z-index:7;overflow:hidden"><span style="position:absolute;left:6px;top:6px;width:44px;height:44px">${c.chickSvg}</span></div>`;
  return { H, yc: y, html: h };
}

// ---------- 3. Szyb windy: drzwi pięter, kabina z kurczakiem, lina ----------
function b3(c) {
  const { n, f, W } = c, P = 86, TOP = 70, H = TOP + n * P + 110, y = k => TOP + (n - k) * P + 40;
  let h = `<div style="position:absolute;left:8px;width:5px;top:0;height:${H}px;background:linear-gradient(90deg,#8a6a3a,#d9a24a,#6a4a22)"></div><div style="position:absolute;right:8px;width:5px;top:0;height:${H}px;background:linear-gradient(90deg,#8a6a3a,#d9a24a,#6a4a22)"></div>`;
  h += `<div style="position:absolute;left:${W / 2 - 1.5}px;width:3px;top:0;height:${y(f) - 44}px;background:#d9a24a;box-shadow:0 0 6px #ffb347"></div>`;
  const dw = W - 62, dx = 31;
  for (let k = 1; k <= n; k++) {
    const s = st(c, k), z = c.zone(k), boss = c.boss(k), open = s !== 'todo', tone = boss ? ['#7a2a1a', '#a8321f'] : ['#6b4a2a', '#8a6034'];
    h += `<div style="position:absolute;left:${dx}px;width:${dw}px;top:${y(k) - 34}px;height:64px;border:4px solid #2b1a12;border-radius:6px 6px 0 0;background:${open ? 'radial-gradient(#ffd98a,#c9792a 70%,#6a3a12)' : '#1a110a'};overflow:hidden;box-shadow:inset 0 0 0 2px ${ZC[z]}55">`;
    const slide = s === 'now' ? 38 : s === 'done' ? 30 : 0;
    h += `<div style="position:absolute;left:${-slide}%;top:0;bottom:0;width:50%;background:repeating-linear-gradient(0deg,${tone[0]} 0 10px,${tone[1]} 10px 12px);border-right:3px solid #2b1a12"></div><div style="position:absolute;right:${-slide}%;top:0;bottom:0;width:50%;background:repeating-linear-gradient(0deg,${tone[0]} 0 10px,${tone[1]} 10px 12px);border-left:3px solid #2b1a12"></div></div>`;
    h += plate(c, k, `left:${W / 2 - 25}px;top:${y(k) - 46}px;width:50px;height:22px`, '', 'sm');
    h += `<div style="position:absolute;left:${dx}px;width:${dw}px;top:${y(k) + 30}px;height:6px;background:#2b1a12"></div>`;
  }
  h += `<div style="position:absolute;left:${dx - 8}px;width:${dw + 16}px;top:${y(f) - 44}px;height:80px;border:5px solid #ffb347;border-radius:8px;box-shadow:0 0 18px #ff8c2b,inset 0 0 20px rgba(255,200,100,.35);z-index:5"><i style="position:absolute;left:30%;right:30%;top:-12px;height:9px;border-radius:5px 5px 0 0;background:#ffe9a8;box-shadow:0 0 12px #ffe9a8"></i></div>`;
  return { H, yc: y, html: h + `<span class="vt-ch" style="left:${W / 2 - 25}px;top:${y(f) - 28}px;width:50px;height:50px">${c.chickSvg}</span>` };
}

// ---------- 4. Wieża garnków: piętra to przedziały garnka, zalewane rosołem ----------
function b4(c) {
  const { n, f, W } = c, P = 58, TOP = 74, H = TOP + n * P + 130, y = k => TOP + (n - k) * P + 29;
  let h = '';
  for (let k = n; k >= 1; k--) {
    const s = st(c, k), z = c.zone(k), boss = c.boss(k), fill = s === 'done' ? 100 : s === 'now' ? 52 : 0;
    const bub = s === 'todo' ? '' : `radial-gradient(circle at 20% 70%,#fff7 0 2px,transparent 3px),radial-gradient(circle at 55% 40%,#fff6 0 2.5px,transparent 3.5px),radial-gradient(circle at 80% 75%,#fff7 0 2px,transparent 3px),`;
    h += `<div style="position:absolute;left:12px;width:${W - 24}px;top:${y(k) - 25}px;height:50px;border:4px solid ${boss ? '#a8321f' : '#2b1a12'};border-radius:14px;background:${bub}linear-gradient(to top,${boss ? '#e0794a,#c25a2a' : '#ffcf6b,#e39a30'} ${fill}%,#1b130d ${fill}%);box-shadow:inset 0 4px 0 rgba(255,255,255,.1),inset 0 -6px 12px rgba(0,0,0,.35),0 3px 0 #120a05;overflow:hidden">
      <i style="position:absolute;left:0;right:0;top:0;height:3px;background:${ZC[z]};opacity:.7"></i></div>`;
    h += plate(c, k, `left:20px;top:${y(k) - 14}px;width:44px;height:28px`, '', 'sm');
    if (boss) h += `<span style="position:absolute;right:20px;top:${y(k) - 9}px;font:800 10px var(--display);letter-spacing:.14em;color:#ffd0bf;z-index:4">BOSS</span>`;
  }
  const steam = [0, 1, 2].map(i => `<path d="M${W / 2 - 30 + i * 30} ${TOP - 6}c-10 -10 10 -16 0 -28c-8 -10 8 -18 0 -26" stroke="#f1e9d6" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/>`).join('');
  h = `<svg width="${W}" height="${TOP}" style="position:absolute;left:0;top:0">${steam}</svg>` + h + `<div style="position:absolute;left:4px;width:12px;height:26px;top:${y(1) - 8}px;background:#2b1a12;border-radius:6px"></div><div style="position:absolute;right:4px;width:12px;height:26px;top:${y(1) - 8}px;background:#2b1a12;border-radius:6px"></div>`;
  return { H, yc: y, html: h + `<span class="vt-ch" style="left:${W - 12 - 56}px;top:${y(f) - 44}px;width:50px;height:50px;z-index:7">${c.chickSvg}</span>` };
}

// ---------- 5. Spirala: kręcone schody wokół słupa, widok od frontu ----------
function b5(c) {
  const { n, f, W } = c, P = 78, TOP = 74, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 36, cx = W / 2, A = 60, TS = P / 3;
  let back = '', front = '', plates = '';
  const total = (n - 1) * 3 + 1;
  for (let i = 0; i < total; i++) {
    const th = (i * 60 + 90) * Math.PI / 180, x = cx + A * Math.sin(th), z = Math.cos(th), yy = y(1) - i * TS, land = i % 3 === 0, k = i / 3 + 1, lit = land ? k <= f : (Math.floor(i / 3) + 1) <= f - 0;
    const w = land ? 62 : 50, hh = land ? 14 : 12, col = lit ? (land ? '#ffc766' : '#d98a30') : '#6a4a2c', sh = Math.round(60 + z * 40);
    const el = `<div style="position:absolute;left:${x - w / 2}px;top:${yy}px;width:${w}px;height:${hh}px;border-radius:5px;border:3px solid #120a05;background:linear-gradient(${col},color-mix(in srgb,${col} 70%,#000));filter:brightness(${sh}%);${land && k === f ? 'box-shadow:0 0 12px #ffd666' : ''}"></div>`;
    (z < -.05 ? back : front) ; if (z < -.05) back += el; else front += el;
    if (land) plates += plate(c, k, `left:${cx - 26}px;top:${yy - 4}px;width:52px;height:24px;z-index:3`, '', 'sm');
  }
  const pil = `<div style="position:absolute;left:${cx - 20}px;width:40px;top:${y(n) - 70}px;height:${H - y(n) + 40}px;background:linear-gradient(90deg,#2a1c10,#5a3d22 45%,#2a1c10);border:3px solid #120a05;border-radius:8px 8px 0 0"></div>`;
  const crown = `<svg width="46" height="34" viewBox="0 0 46 34" style="position:absolute;left:${cx - 23}px;top:${y(n) - 104}px"><path d="M4 30l4 -22l10 10l5 -14l5 14l10 -10l4 22z" fill="#ffd23f" stroke="#120a05" stroke-width="3" stroke-linejoin="round"/></svg>`;
  const i = (f - 1) * 3, th = (i * 60 + 90) * Math.PI / 180, chx = cx + A * Math.sin(th);
  return { H, yc: y, html: back + pil + crown + front + plates + `<span class="vt-ch" style="left:${chx - 24}px;top:${y(1) - i * TS - 46}px;width:48px;height:48px;z-index:6">${c.chickSvg}</span>` };
}

// ---------- 6. Drabina pożarowa: pionowa drabina z platformami i tablicami ----------
function b6(c) {
  const { n, f, W } = c, P = 72, TOP = 70, H = TOP + n * P + 110, y = k => TOP + (n - k) * P + 30, cx = W / 2, hw = 28;
  let h = `<div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,#1d140d 0 ${P}px,#241911 ${P}px ${P + 3}px)"></div>`;
  h += `<div style="position:absolute;left:${cx - hw - 3}px;width:6px;top:${y(n) - 30}px;height:${H - y(n)}px;background:linear-gradient(90deg,#ff8c2b,#ffb347 50%,#c25a12);border-radius:3px;box-shadow:0 0 0 2px #120a05;z-index:2"></div><div style="position:absolute;left:${cx + hw - 3}px;width:6px;top:${y(n) - 30}px;height:${H - y(n)}px;background:linear-gradient(90deg,#ff8c2b,#ffb347 50%,#c25a12);border-radius:3px;box-shadow:0 0 0 2px #120a05;z-index:2"></div>`;
  for (let yy = y(n) - 20; yy < H - 90; yy += 15) { const lit = yy > y(f); h += `<div style="position:absolute;left:${cx - hw}px;width:${hw * 2}px;top:${yy}px;height:4px;border-radius:2px;background:${lit ? '#ffc766' : '#4a3a2a'};box-shadow:0 0 0 1.5px #120a05${lit ? ',0 0 6px #ff8c2b88' : ''}"></div>`; }
  for (let k = 1; k <= n; k++) {
    const left = k % 2 === 1, s = st(c, k), z = c.zone(k);
    h += `<div style="position:absolute;left:${cx - hw - 14}px;width:${hw * 2 + 28}px;top:${y(k)}px;height:9px;border:2.5px solid #120a05;border-radius:2px;background:repeating-linear-gradient(-45deg,#ffb347 0 6px,#2b1a12 6px 12px);z-index:3"></div>`;
    h += `<div style="position:absolute;${left ? 'left:6px' : 'right:6px'};top:${y(k) - 4}px;width:${cx - hw - 20}px;height:3px;background:#120a05"></div>`;
    h += plate(c, k, `${left ? 'left:4px' : 'right:4px'};top:${y(k) - 24}px;width:${cx - hw - 12}px;height:28px`, '', 'sm');
    h += `<div style="position:absolute;${left ? `right:${W - cx - hw - 20}px` : `left:${cx + hw + 20}px`};top:${y(k) - 12}px;width:12px;height:12px;border-radius:50%;background:${s === 'todo' ? '#2b1a12' : ZC[z]};border:3px solid #120a05;${s !== 'todo' ? `box-shadow:0 0 10px ${ZC[z]}` : ''}"></div>`;
  }
  return { H, yc: y, html: h + `<span class="vt-ch" style="left:${cx - 24}px;top:${y(f) - 43}px;width:48px;height:48px;z-index:6">${c.chickSvg}</span>` };
}

// ---------- 7. Termometr: rtęć rośnie z piętrem, kurczak jedzie na szczycie ----------
function b7(c) {
  const { n, f, W } = c, P = 60, TOP = 70, H = TOP + n * P + 130, y = k => TOP + (n - k) * P + 30, TX = 82, TW = 40;
  const top = y(n) - 24, bot = y(1) + 50, tubeH = bot - top;
  let h = `<div style="position:absolute;left:${TX}px;width:${TW}px;top:${top}px;height:${tubeH}px;border:4px solid #2b1a12;border-radius:22px 22px 0 0;background:#0e0804;box-shadow:inset 0 0 14px #000,0 0 0 2px #4a3a2a;overflow:hidden">
    <div style="position:absolute;inset:0;background:linear-gradient(to top,#6fcf6f,#ffd23f 45%,#ff8c2b 70%,#e4572e);clip-path:inset(${(y(f) - top) / tubeH * 100}% 0 0 0);box-shadow:0 0 20px #ff8c2b"></div>
    <div style="position:absolute;left:6px;top:6px;bottom:6px;width:5px;border-radius:3px;background:rgba(255,255,255,.25)"></div></div>`;
  h += `<div style="position:absolute;left:${TX - 22}px;top:${bot - 24}px;width:${TW + 44}px;height:${TW + 44}px;border-radius:50%;border:4px solid #2b1a12;background:radial-gradient(circle at 35% 30%,#ffd23f,#ff8c2b 55%,#c2361a);box-shadow:0 0 22px #ff8c2b,0 0 0 2px #4a3a2a"></div>`;
  for (let k = 1; k <= n; k++) {
    const s = st(c, k), boss = c.boss(k), z = c.zone(k), len = boss ? 30 : 14;
    h += `<div style="position:absolute;left:${TX - 6 - len}px;width:${len}px;top:${y(k) - 1.5}px;height:3px;border-radius:2px;background:${boss ? '#e4572e' : s === 'todo' ? '#5a4a3a' : '#ffb347'};${s === 'now' ? 'box-shadow:0 0 8px #ffd666' : ''}"></div>`;
    h += `<span style="position:absolute;left:6px;width:${TX - 14 - len}px;text-align:right;top:${y(k) - 8}px;font:${s === 'now' ? 800 : 600} ${s === 'now' ? 15 : 11}px/16px var(--mono);color:${s === 'now' ? '#ffe9a8' : s === 'done' ? '#c98a3e' : '#6a5a48'}">${k}</span>`;
    if (boss) h += `<span style="position:absolute;left:${TX + TW + 12}px;top:${y(k) - 10}px;display:flex;gap:4px;align-items:center;font:800 11px var(--display);letter-spacing:.14em;color:#ffb199;background:#4a1a12;border:2px solid #a8321f;border-radius:6px;padding:2px 6px">${c.skull()}BOSS</span>`;
    if (k > 1 && z !== c.zone(k - 1)) h += `<span style="position:absolute;left:${TX + TW + 12}px;top:${y(k) + P / 2 - 8}px;font:800 10px var(--display);letter-spacing:.16em;color:${ZC[z]};border-top:2px solid ${ZC[z]};padding-top:2px">STREFA ${['I', 'II', 'III'][z]}</span>`;
  }
  h += `<div style="position:absolute;left:${TX + TW / 2 - 29}px;top:${y(f) - 29}px;width:58px;height:58px;border-radius:50%;background:radial-gradient(#4a3a2a,#2b1a12);border:4px solid #ffe9a8;box-shadow:0 0 20px #ffd666,0 0 0 3px #2b1a12;z-index:7;overflow:hidden"><span style="position:absolute;left:5px;top:6px;width:46px;height:46px">${c.chickSvg}</span></div>`;
  return { H, yc: y, html: h };
}

// ---------- 8. Karty dostępu: stos przepustek, zaliczone pieczątką ----------
function b8(c) {
  const { n, f, W } = c, P = 60, TOP = 74, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 30;
  let h = `<div style="position:absolute;left:${W / 2 - 1}px;width:2px;top:0;height:${H}px;background:#2b1a12"></div>`;
  for (let k = n; k >= 1; k--) {
    const s = st(c, k), z = c.zone(k), boss = c.boss(k), rot = (k % 2 ? -1 : 1) * 1.1, band = boss ? '#a8321f' : ZC[z];
    const bg = s === 'todo' ? '#2a2018' : s === 'now' ? '#fff2cf' : '#e3cf9f', ink = s === 'todo' ? '#8a7a62' : '#2b1a12';
    h += `<div style="position:absolute;left:${s === 'now' ? 22 : 12}px;width:${W - 34}px;top:${y(k) - 29}px;height:62px;border-radius:9px;background:${bg};border:3px solid ${s === 'now' ? '#ffb347' : '#120a05'};transform:rotate(${s === 'now' ? 0 : rot}deg);box-shadow:0 3px 0 #0a0502${s === 'now' ? ',0 0 18px #ff8c2b' : ''};z-index:${s === 'now' ? 5 : 100 - k};overflow:hidden;color:${ink}">
      <i style="position:absolute;left:0;top:0;bottom:0;width:9px;background:${band};opacity:${s === 'todo' ? .45 : 1}"></i>
      <i style="position:absolute;left:50%;margin-left:-14px;top:3px;width:28px;height:6px;border-radius:3px;background:#120a05;opacity:.7"></i>
      <b style="position:absolute;left:18px;top:12px;font:800 28px/1 var(--display)">${k}</b>
      <span style="position:absolute;left:18px;bottom:5px;font:700 8px var(--mono);letter-spacing:.14em;opacity:.75">${boss ? 'ZARZĄD' : 'PIĘTRO'}</span>
      ${boss ? `<span style="position:absolute;left:58px;top:14px">${c.skull()}</span>` : ''}
      ${s === 'now' ? `<span style="position:absolute;right:6px;top:10px;width:44px;height:44px;border-radius:8px;background:#2b1a12;overflow:hidden"><span style="position:absolute;left:0;top:1px;width:44px;height:44px">${c.chickSvg}</span></span>`
        : `<span style="position:absolute;right:10px;top:16px;width:46px;height:26px;background:repeating-linear-gradient(90deg,${ink} 0 2px,transparent 2px 4px,${ink} 4px 5px,transparent 5px 8px);opacity:.55"></span>`}
      ${s === 'done' ? `<span style="position:absolute;right:6px;top:18px;transform:rotate(-12deg);font:800 10px var(--display);letter-spacing:.1em;color:#c2361a;border:2px solid #c2361a;border-radius:4px;padding:1px 4px;background:rgba(255,255,255,.35)">ZALICZONE</span>` : ''}
    </div>`;
  }
  return { H, yc: y, html: h };
}

// ---------- 9. Przekrój fabryki: pokoje pięter z rekwizytami stref ----------
function b9(c) {
  const { n, f, W } = c, P = 74, TOP = 96, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + P / 2;
  let h = '';
  const props = (k, z, lit) => {
    const o = lit ? 1 : .35;
    if (z === 0) return `<g opacity="${o}"><rect x="${W - 62}" y="${P - 32}" width="22" height="22" fill="#8a5a30" stroke="#120a05" stroke-width="3"/><rect x="${W - 44}" y="${P - 46}" width="20" height="20" fill="#a8733a" stroke="#120a05" stroke-width="3"/>${[0, 1, 2, 3].map(i => `<path d="M${20 + i * 16} 6l5 14l5 -14z" fill="#d6f0f5" stroke="#120a05" stroke-width="2"/>`).join('')}</g>`;
    if (z === 1) return `<g opacity="${o}"><path d="M6 20H${W - 20}M6 30H${W - 20}" stroke="#d98324" stroke-width="5"/><path d="M6 20H${W - 20}M6 30H${W - 20}" stroke="#120a05" stroke-width="1.5"/><circle cx="${W - 44}" cy="${P - 28}" r="12" fill="#f1e9d6" stroke="#120a05" stroke-width="3"/><path d="M${W - 44} ${P - 28}l6 -7" stroke="#e4572e" stroke-width="3"/></g>`;
    return `<g opacity="${o}"><rect x="${W - 62}" y="14" width="26" height="30" fill="#7a1f1f" stroke="#ffd23f" stroke-width="3"/><path d="M${W - 55} 38l5 -10l4 6l3 -4l4 8z" fill="#ffd23f"/><rect x="6" y="${P - 22}" width="${W - 20}" height="9" fill="#a8321f" stroke="#120a05" stroke-width="2"/></g>`;
  };
  for (let k = n; k >= 1; k--) {
    const s = st(c, k), z = c.zone(k), lit = s !== 'todo', left = k % 2 === 1, top = y(k) - P / 2, bg = ['#3a2a1e', '#43281a', '#401b1b'][z];
    h += `<div style="position:absolute;left:8px;width:${W - 16}px;top:${top}px;height:${P}px;border:3px solid #120a05;border-top-width:0;background:${lit ? `radial-gradient(120px 60px at 50% 70%,#ffcf7a55,transparent),${bg}` : '#17100b'};overflow:hidden">
      <svg width="${W - 22}" height="${P}" style="position:absolute;left:0;top:0">${props(k, z, lit)}
      <path d="${left ? `M${W - 40} ${P - 4}` : 'M26 ' + (P - 4)}${Array.from({ length: 5 }, (_, i) => `l${left ? -7 : 7} -9h${left ? -5 : 5}`).join('')}" stroke="${lit ? '#ffb347' : '#5a4a3a'}" stroke-width="3" fill="none" opacity=".0"/>
      <rect x="0" y="${P - 8}" width="${W}" height="8" fill="#120a05" opacity=".55"/></svg>
      <i style="position:absolute;left:0;right:0;top:0;height:2px;background:${ZC[z]};opacity:${lit ? .8 : .3}"></i></div>`;
    h += plate(c, k, `left:14px;top:${top + 8}px;width:46px;height:24px`, '', 'sm');
  }
  const roof = `<svg width="${W}" height="${TOP}" style="position:absolute;left:0;top:0"><path d="M8 ${TOP}V50L${W / 2} 22L${W - 8} 50V${TOP}z" fill="#3a2a1e" stroke="#120a05" stroke-width="3" stroke-linejoin="round"/><rect x="${W - 54}" y="12" width="18" height="34" fill="#5a3d22" stroke="#120a05" stroke-width="3"/><path d="M${W - 45} 8c-8 -8 8 -12 0 -20" stroke="#f1e9d6" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".6"/><path d="M${W / 2 - 12} 36l4 -9l5 6l3 -8l3 8l5 -6l4 9z" fill="#ffd23f" stroke="#120a05" stroke-width="2"/></svg>`;
  return { H, yc: y, html: roof + h + `<span class="vt-ch" style="left:${(f % 2 ? W - 100 : 70)}px;top:${y(f) + P / 2 - 8 - 46}px;width:46px;height:46px;z-index:6">${c.chickSvg}</span>` };
}

// ---------- 10. Izometryczne płyty: piętra jako klocki połączone stopniami ----------
function b10(c) {
  const { n, f, W } = c, P = 74, TOP = 80, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 20, cx = W / 2, OFF = 26, T = 14;
  const X = k => cx + (k % 2 ? -OFF : OFF);
  const slab = (x, yy, hw, hh, th, top, l, r) => `<path d="M${x} ${yy - hh}L${x + hw} ${yy}L${x} ${yy + hh}L${x - hw} ${yy}Z" fill="${top}" stroke="#120a05" stroke-width="3" stroke-linejoin="round"/><path d="M${x - hw} ${yy}L${x} ${yy + hh}V${yy + hh + th}L${x - hw} ${yy + th}Z" fill="${l}" stroke="#120a05" stroke-width="3" stroke-linejoin="round"/><path d="M${x + hw} ${yy}L${x} ${yy + hh}V${yy + hh + th}L${x + hw} ${yy + th}Z" fill="${r}" stroke="#120a05" stroke-width="3" stroke-linejoin="round"/>`;
  let s = '', plates = '';
  for (let k = 1; k <= n; k++) {
    if (k < n) for (let i = 1; i <= 3; i++) { const t = i / 4, x = X(k) + (X(k + 1) - X(k)) * t, yy = y(k) + (y(k + 1) - y(k)) * t; const lit = k < f; s += slab(x, yy, 22, 11, 6, lit ? '#d98a30' : '#6a4a2c', lit ? '#9a5a18' : '#3a2a1c', lit ? '#7a4410' : '#2a1c10'); }
    const sx = st(c, k), boss = c.boss(k);
    const top = boss ? (sx === 'todo' ? '#7a2a1a' : '#e0794a') : sx === 'done' ? '#ffb347' : sx === 'now' ? '#ffe9a8' : '#5a4a3a';
    const l = boss ? '#5a1a10' : sx === 'done' ? '#b86a1c' : sx === 'now' ? '#d9a24a' : '#33281c', r = boss ? '#3a0f08' : sx === 'done' ? '#8a4a10' : sx === 'now' ? '#a8761f' : '#241a11';
    s += `<g ${sx === 'now' ? 'style="filter:drop-shadow(0 0 10px #ffd666)"' : ''}>${slab(X(k), y(k), 50, 25, T, top, l, r)}</g>`;
    plates += `<span style="position:absolute;left:${X(k) - 22}px;top:${y(k) - 10}px;width:44px;text-align:center;font:800 19px/20px var(--display);color:${sx === 'todo' ? '#9a8a72' : '#2b1a12'};z-index:2;display:flex;justify-content:center;gap:3px;align-items:center">${boss ? c.skull() : ''}${k}</span>`;
  }
  return { H, yc: y, html: `<svg width="${W}" height="${H}" style="position:absolute;inset:0">${s}</svg>${plates}<span class="vt-ch" style="left:${X(f) - 24}px;top:${y(f) - 58}px;width:48px;height:48px;z-index:6">${c.chickSvg}</span>` };
}

// =====================================================================================
// Runda 2: hybrydy 01 (ciepłe, drewniane schody) i 08 (karty dostępu z pieczątką)
// =====================================================================================
const WALLC = ['#2a2019', '#33200f', '#361715'];
const wallBg = (c, y, P, W, op = 1) => { let s = ''; for (let k = c.n; k >= 1; k--) { const z = c.zone(k), top = y(k) - P + 12; s += `<rect x="0" y="${top}" width="${W}" height="${P}" fill="${WALLC[z]}" opacity="${op}"/><path d="M0 ${y(k) + 12}H${W}" stroke="#120a05" stroke-width="3" opacity="${op}"/>`; for (let i = 0; i < 6; i++) s += `<path d="M${14 + i * 30} ${top + 4}v${P - 8}" stroke="${ZC[z]}" stroke-width="1.5" opacity=".1"/>`; } return s; };
const HZ = '<defs><pattern id="hz1" width="10" height="5" patternUnits="userSpaceOnUse" patternTransform="skewX(-30)"><rect width="5" height="5" fill="#ffb347"/><rect x="5" width="5" height="5" fill="#2b1a12"/></pattern></defs>';
const woodRun = (xs, xe, y0, y1, m, ru) => {
  const dx = (xe - xs) / m, dy = (y1 - y0) / m, T = 11; let top = `M${xs} ${y0}`; for (let i = 0; i < m; i++) top += `V${(y0 + dy * (i + 1)).toFixed(1)}H${(xs + dx * (i + 1)).toFixed(1)}`;
  let s = `<path d="${top}L${xe} ${y1 + T}L${xs} ${y0 + T}Z" fill="${ru ? '#8a5428' : '#5a3a20'}" stroke="#120a05" stroke-width="3" stroke-linejoin="round"/>`;
  let tr = ''; for (let i = 1; i <= m; i++) tr += `M${(xs + dx * (i - 1) + Math.sign(dx)).toFixed(1)} ${(y0 + dy * i + 2).toFixed(1)}H${(xs + dx * i - Math.sign(dx)).toFixed(1)}`;
  s += `<path d="${tr}" stroke="${ru ? '#ffc766' : '#8a6a48'}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
  let posts = ''; for (let i = 0; i <= m; i += 2) posts += `M${(xs + dx * i).toFixed(1)} ${(y0 + dy * i - 24).toFixed(1)}v24`;
  return s + `<path d="${posts}" stroke="#120a05" stroke-width="3" stroke-linecap="round"/><path d="M${xs} ${y0 - 24}L${xe} ${y1 - 24}" stroke="#120a05" stroke-width="6.5" stroke-linecap="round"/><path d="M${xs} ${y0 - 24}L${xe} ${y1 - 24}" stroke="${ru ? '#ffb347' : '#a8733a'}" stroke-width="3" stroke-linecap="round"/>`;
};
const woodLand = (x, yy, w, lit) => `<rect x="${x}" y="${yy}" width="${w}" height="13" rx="3" fill="${lit ? '#c98a3e' : '#7a5230'}" stroke="#120a05" stroke-width="3"/><path d="M${x + 3} ${yy + 3}H${x + w - 3}" stroke="${lit ? '#ffe3a0' : '#a07a50'}" stroke-width="2.4" stroke-linecap="round"/><rect x="${x}" y="${yy + 14}" width="${w}" height="5" fill="url(#hz1)" stroke="#120a05" stroke-width="2"/>`;
const ch = (c, x, top, s = 48, z = 6) => `<span class="vt-ch" style="left:${x}px;top:${top}px;width:${s}px;height:${s}px;z-index:${z}">${c.chickSvg}</span>`;
// przepustka (jak w wariancie 8), parametryzowana rozmiarem; bieżąca ze zdjęciem kurczaka, zaliczone z pieczątką
function card(c, k, x, top, w, h, o = {}) {
  const s = st(c, k), z = c.zone(k), boss = c.boss(k), band = boss ? '#a8321f' : ZC[z];
  const bg = s === 'todo' ? '#2a2018' : s === 'now' ? '#fff2cf' : '#e3cf9f', ink = s === 'todo' ? '#8a7a62' : '#2b1a12';
  const fs = Math.min(34, Math.round(h * .46)), photo = s === 'now' && o.photo !== false && w >= 96, ps = h - 14;
  return `<div style="position:absolute;left:${x}px;top:${top}px;width:${w}px;height:${h}px;border-radius:8px;background:${bg};border:3px solid ${s === 'now' ? '#ffb347' : '#120a05'};transform:rotate(${o.rot || 0}deg);box-shadow:0 3px 0 #0a0502${s === 'now' ? ',0 0 16px #ff8c2b' : ''};z-index:${o.z || 5};overflow:hidden;color:${ink}">
    <i style="position:absolute;left:0;top:0;bottom:0;width:${h >= 46 ? 9 : 6}px;background:${band};opacity:${s === 'todo' ? .45 : 1}"></i>
    <i style="position:absolute;left:50%;margin-left:-14px;top:3px;width:28px;height:5px;border-radius:3px;background:#120a05;opacity:.6"></i>
    <b style="position:absolute;left:${h >= 46 ? 18 : 13}px;top:${Math.round((h - fs) / 2) - 2}px;font:800 ${fs}px/1 var(--display)">${k}</b>
    ${h >= 52 ? `<span style="position:absolute;left:18px;bottom:5px;font:700 8px var(--mono);letter-spacing:.14em;opacity:.75">${boss ? 'ZARZĄD' : 'PIĘTRO'}</span>` : ''}
    ${boss ? `<span style="position:absolute;left:${h >= 46 ? 52 : w - 26}px;top:${h >= 46 ? Math.round(h / 2) - 8 : 4}px">${c.skull()}</span>` : ''}
    ${photo ? `<span style="position:absolute;right:6px;top:${Math.round((h - ps) / 2)}px;width:${ps}px;height:${ps}px;border-radius:8px;background:#2b1a12;overflow:hidden"><span style="position:absolute;left:0;top:2px;width:${ps}px;height:${ps}px">${c.chickSvg}</span></span>`
      : w >= 100 && s !== 'now' ? `<span style="position:absolute;right:10px;top:${Math.round(h / 2) - 11}px;width:42px;height:22px;background:repeating-linear-gradient(90deg,${ink} 0 2px,transparent 2px 4px,${ink} 4px 5px,transparent 5px 8px);opacity:.5"></span>` : ''}
    ${s === 'done' ? (w >= 120 ? `<span style="position:absolute;right:6px;top:${Math.round(h / 2) - 9}px;transform:rotate(-12deg);font:800 10px var(--display);letter-spacing:.1em;color:#c2361a;border:2px solid #c2361a;border-radius:4px;padding:1px 4px;background:rgba(255,255,255,.35)">ZALICZONE</span>` : `<b style="position:absolute;right:5px;bottom:1px;font:800 14px var(--display);color:#c2361a">✓</b>`) : ''}
  </div>`;
}

// 11. Karty na ścianie klatki: drewniany zygzak, a przepustki wiszą na ścianie przy podestach
function b11(c) {
  const { n, f, W } = c, P = 76, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 36, LW = 50, L0 = 8, R0 = W - 8 - LW, left = k => k % 2 === 1;
  let s = wallBg(c, y, P, W), cards = '';
  for (let k = 1; k <= n; k++) {
    s += woodLand(left(k) ? L0 : R0, y(k), LW, k <= f);
    if (k < n) s += woodRun(left(k) ? L0 + LW : R0, left(k) ? R0 : L0 + LW, y(k), y(k + 1), 8, k < f);
    cards += card(c, k, left(k) ? W - 8 - 68 : 8, y(k) - 28, 68, 42, { rot: left(k) ? 2 : -2, z: 4, photo: false });
  }
  return { H, yc: y, html: `<svg width="${W}" height="${H}" style="position:absolute;inset:0">${HZ}${s}</svg>${cards}${ch(c, (left(f) ? L0 : R0) + LW / 2 - 24, y(f) - 47)}` };
}

// 12. Karty-podesty: podesty to same przepustki, a drewniane biegi łączą je zygzakiem
function b12(c) {
  const { n, f, W } = c, P = 76, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 36, CW = 66, left = k => k % 2 === 1, cx = k => left(k) ? 8 : W - 8 - CW;
  let s = wallBg(c, y, P, W), cards = '';
  for (let k = 1; k <= n; k++) {
    if (k < n) s += woodRun(left(k) ? 8 + CW : W - 8 - CW, left(k) ? W - 8 - CW : 8 + CW, y(k), y(k + 1), 5, k < f);
    cards += card(c, k, cx(k), y(k), CW, 44, { z: 4, rot: left(k) ? -1 : 1, photo: false });
  }
  return { H, yc: y, html: `<svg width="${W}" height="${H}" style="position:absolute;inset:0">${HZ}${s}</svg>${cards}${ch(c, cx(f) + CW / 2 - 24, y(f) - 47)}` };
}

// 13. Duża przepustka kurczaka: drewniane schody, a bieżące piętro to wielka karta zawieszona na smyczy
function b13(c) {
  const { n, f, W } = c, P = 76, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 36, LW = 50, L0 = 8, R0 = W - 8 - LW, left = k => k % 2 === 1;
  let s = wallBg(c, y, P, W), pl = '';
  for (let k = 1; k <= n; k++) {
    s += woodLand(left(k) ? L0 : R0, y(k), LW, k <= f);
    if (k < n) s += woodRun(left(k) ? L0 + LW : R0, left(k) ? R0 : L0 + LW, y(k), y(k + 1), 8, k < f);
    if (k !== f) pl += plate(c, k, `left:${left(k) ? W - 8 - 62 : 8}px;top:${y(k) - 16}px;width:62px;height:26px`);
  }
  const top = y(f) - 74;
  return { H, yc: y, html: `<svg width="${W}" height="${H}" style="position:absolute;inset:0">${HZ}${s}</svg>${pl}<div style="position:absolute;left:${W / 2 - 1.5}px;width:3px;top:0;height:${top + 4}px;background:linear-gradient(#8a6a3a,#d9a24a);z-index:7"></div>${card(c, f, W / 2 - 76, top, 152, 92, { z: 8 })}` };
}

// 14. Karty na tle schodów: przygaszone schody w tle, a przed nimi stos przepustek
function b14(c) {
  const { n, f, W } = c, P = 76, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 36, LW = 50, L0 = 8, R0 = W - 8 - LW, left = k => k % 2 === 1;
  let s = wallBg(c, y, P, W), cards = '';
  for (let k = 1; k <= n; k++) { s += woodLand(left(k) ? L0 : R0, y(k), LW, k <= f); if (k < n) s += woodRun(left(k) ? L0 + LW : R0, left(k) ? R0 : L0 + LW, y(k), y(k + 1), 8, k < f); }
  for (let k = n; k >= 1; k--) cards += card(c, k, W / 2 - 45, y(k) - 26, 90, 52, { z: 100 - k + (k === f ? 50 : 0), rot: (k % 2 ? -1 : 1) * 1.2, photo: false });
  return { H, yc: y, html: `<svg width="${W}" height="${H}" style="position:absolute;inset:0;opacity:.75">${HZ}${s}</svg>${cards}${ch(c, W / 2 + 45 - 40, y(f) - 26 - 40, 46, 120)}` };
}

// 15. Schodkowy stos: karty ułożone ukośnie w schodki, pod każdą drewniany podstopień
function b15(c) {
  const { n, f, W } = c, P = 54, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 30, CW = 118, sx = k => { const s = (k - 1) % 12, o = s <= 6 ? s : 12 - s; return 8 + o * ((W - 16 - CW) / 6); };
  let h = `<div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,#1d140d 0 ${P}px,#241911 ${P}px ${P + 2}px)"></div>`;
  for (let k = n; k >= 1; k--) {
    const lit = k <= f;
    h += `<div style="position:absolute;left:${sx(k)}px;top:${y(k) - 22 + 42}px;width:${CW}px;height:10px;background:${lit ? 'linear-gradient(#a8662d,#7a4a22)' : '#4a3220'};border:3px solid #120a05;border-top:0;border-radius:0 0 5px 5px;z-index:${100 - k}"></div>`;
    h += card(c, k, sx(k), y(k) - 22, CW, 44, { z: 100 - k, photo: false });
  }
  return { H, yc: y, html: h + ch(c, sx(f) + CW - 54, y(f) - 22 - 40, 46, 150) };
}

// 16. Tablica z kluczami: deski, mosiężne haczyki, przepustki na sznurkach (jak w recepcji)
function b16(c) {
  const { n, f, W } = c, P = 62, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 34;
  let h = `<div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,#4a2f18 0 22px,#3f260f 22px 24px),#4a2f18"></div><div style="position:absolute;left:0;top:0;bottom:0;width:7px;background:#2b1a12"></div><div style="position:absolute;right:0;top:0;bottom:0;width:7px;background:#2b1a12"></div>`;
  for (let k = 1; k <= n; k++) {
    const lit = k <= f;
    h += `<div style="position:absolute;left:${W / 2 - 7}px;top:${y(k) - 32}px;width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffe9a8,#b8863a);border:3px solid #120a05;z-index:3"></div><div style="position:absolute;left:${W / 2 - 1}px;top:${y(k) - 20}px;width:2px;height:10px;background:#d9a24a;z-index:2"></div>`;
    h += `<div style="position:absolute;left:7px;right:7px;top:${y(k) + 24}px;height:4px;background:#2b1a12;opacity:.5"></div>`;
    h += card(c, k, (W - 132) / 2, y(k) - 12, 132, 44, { z: 4, rot: (k % 2 ? -1 : 1) * 1.5 });
  }
  return { H, yc: y, html: h };
}

// 17. Gablota: przepustki w oszklonych niszach w drewnianej ramie z mosiężnymi śrubami
function b17(c) {
  const { n, f, W } = c, P = 66, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 33;
  let h = `<div style="position:absolute;left:0;top:0;bottom:0;width:11px;background:linear-gradient(90deg,#5a3a1c,#3a230f);border-right:3px solid #120a05"></div><div style="position:absolute;right:0;top:0;bottom:0;width:11px;background:linear-gradient(90deg,#3a230f,#5a3a1c);border-left:3px solid #120a05"></div>`;
  for (let k = 1; k <= n; k++) {
    const s = st(c, k);
    h += `<div style="position:absolute;left:15px;width:${W - 30}px;top:${y(k) - 30}px;height:60px;border:3px solid ${s === 'now' ? '#ffb347' : '#b8863a'};border-radius:7px;background:#120a05;box-shadow:inset 0 0 14px #000,0 0 0 2px #120a05${s === 'now' ? ',0 0 18px #ff8c2b' : ''}"></div>`;
    h += card(c, k, 21, y(k) - 25, W - 42, 50, { z: 3 });
    h += `<div style="position:absolute;left:15px;width:${W - 30}px;top:${y(k) - 30}px;height:60px;border-radius:7px;background:linear-gradient(115deg,rgba(255,255,255,.14) 0 16%,transparent 16% 30%,rgba(255,255,255,.07) 30% 36%,transparent 36%);z-index:6;pointer-events:none"></div>`;
    for (const [sx, sy] of [[18, -27], [W - 24, -27], [18, 24], [W - 24, 24]]) h += `<i style="position:absolute;left:${sx}px;top:${y(k) + sy}px;width:5px;height:5px;border-radius:50%;background:#d9a24a;z-index:7"></i>`;
  }
  return { H, yc: y, html: h };
}

// 18. Kartoteka: teczki z wystającymi zakładkami na przemian po lewej i prawej, bieżąca wysunięta
function b18(c) {
  const { n, f, W } = c, P = 50, TOP = 76, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 30;
  let h = `<div style="position:absolute;left:0;right:0;top:0;bottom:0;background:#1a110a"></div>`;
  for (let k = n; k >= 1; k--) {
    const s = st(c, k), z = c.zone(k), boss = c.boss(k), left = k % 2 === 1, TW = 66, tx = left ? 12 : W - 12 - TW;
    const body = s === 'todo' ? '#3a2a1c' : s === 'now' ? '#f0d58f' : '#c9a064', tab = boss ? '#a8321f' : s === 'todo' ? '#4a3825' : body, ink = s === 'todo' ? '#9a8a72' : '#2b1a12', lift = s === 'now' ? -8 : 0;
    h += `<div style="position:absolute;left:12px;width:${W - 24}px;top:${y(k) - 20 + lift}px;height:60px;border:3px solid ${s === 'now' ? '#ffb347' : '#120a05'};border-radius:5px 5px 7px 7px;background:${body};z-index:${100 - k + (s === 'now' ? 60 : 0)};box-shadow:0 -2px 0 rgba(0,0,0,.25)${s === 'now' ? ',0 0 16px #ff8c2b' : ''}"></div>`;
    h += `<div style="position:absolute;left:${tx}px;width:${TW}px;top:${y(k) - 34 + lift}px;height:18px;border:3px solid ${s === 'now' ? '#ffb347' : '#120a05'};border-bottom:0;border-radius:7px 7px 0 0;background:${tab};z-index:${100 - k + (s === 'now' ? 60 : 0)};display:flex;align-items:center;justify-content:center;gap:5px;font:800 13px/1 var(--display);color:${boss && s !== 'todo' ? '#ffd0bf' : ink}">${boss ? c.skull() : ''}${k}</div>`;
    h += `<i style="position:absolute;left:${left ? W - 36 : 18}px;top:${y(k) - 10 + lift}px;width:14px;height:14px;border-radius:50%;background:${boss ? '#a8321f' : ZC[z]};border:2px solid #120a05;opacity:${s === 'todo' ? .4 : 1};z-index:${100 - k + (s === 'now' ? 60 : 0)}"></i>`;
    if (s === 'done') h += `<span style="position:absolute;left:${left ? 90 : 28}px;top:${y(k) - 6 + lift}px;transform:rotate(-8deg);font:800 10px var(--display);letter-spacing:.1em;color:#c2361a;border:2px solid #c2361a;border-radius:4px;padding:1px 4px;z-index:${100 - k}">ZALICZONE</span>`;
  }
  return { H, yc: y, html: h + ch(c, f % 2 ? W - 74 : 26, y(f) - 36 - 8 - 14, 50, 170) };
}

// 19. Spirala kart: drewniane kręcone stopnie wokół słupa, na słupie przepustki zamiast tabliczek
function b19(c) {
  const { n, f, W } = c, P = 78, TOP = 74, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 36, cx = W / 2, A = 60, TS = P / 3;
  let back = '', front = '', cards = '';
  const total = (n - 1) * 3 + 1;
  for (let i = 0; i < total; i++) {
    const th = (i * 60 + 90) * Math.PI / 180, x = cx + A * Math.sin(th), z = Math.cos(th), yy = y(1) - i * TS, land = i % 3 === 0, k = i / 3 + 1, lit = (Math.floor(i / 3) + 1) <= f;
    const w = land ? 60 : 48, hh = land ? 14 : 12, col = lit ? (land ? '#c98a3e' : '#a8662d') : '#5a3a20', sh = Math.round(62 + z * 38);
    const el = `<div style="position:absolute;left:${x - w / 2}px;top:${yy}px;width:${w}px;height:${hh}px;border-radius:5px;border:3px solid #120a05;background:linear-gradient(${col},color-mix(in srgb,${col} 65%,#000));filter:brightness(${sh}%);${land && k === f ? 'box-shadow:0 0 12px #ffd666' : ''}"></div>`;
    if (z < -.05) back += el; else front += el;
    if (land) cards += card(c, k, cx - 31, yy - 8, 62, 34, { z: 3, rot: (k % 2 ? -2 : 2), photo: false });
  }
  const pil = `<div style="position:absolute;left:${cx - 24}px;width:48px;top:${y(n) - 60}px;height:${H - y(n) + 40}px;background:linear-gradient(90deg,#2a1c10,#5a3d22 45%,#2a1c10);border:3px solid #120a05;border-radius:8px 8px 0 0"></div>`;
  const i = (f - 1) * 3, th = (i * 60 + 90) * Math.PI / 180;
  return { H, yc: y, html: back + pil + front + cards + ch(c, cx + A * Math.sin(th) - 24, y(1) - i * TS - 46) };
}

// 20. Schody z paskiem kart: po lewej wąski stos przepustek, po prawej drewniany zygzak
function b20(c) {
  const { n, f, W } = c, P = 76, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 36, SW = 64, LW = 32, L0 = SW + 4, R0 = W - 6 - LW, left = k => k % 2 === 1;
  let s = wallBg(c, y, P, W), cards = '';
  s += `<rect x="0" y="0" width="${SW}" height="${H}" fill="#120a05" opacity=".55"/><path d="M${SW} 0V${H}" stroke="#120a05" stroke-width="3"/>`;
  for (let k = 1; k <= n; k++) {
    s += woodLand(left(k) ? L0 : R0, y(k), LW, k <= f);
    if (k < n) s += woodRun(left(k) ? L0 + LW : R0, left(k) ? R0 : L0 + LW, y(k), y(k + 1), 6, k < f);
    cards += card(c, k, 6, y(k) - 20, SW - 10, 42, { z: 4, photo: false });
  }
  return { H, yc: y, html: `<svg width="${W}" height="${H}" style="position:absolute;inset:0">${HZ}${s}</svg>${cards}${ch(c, (left(f) ? L0 : R0) + LW / 2 - 22, y(f) - 44, 44)}` };
}

// =====================================================================================
// Runda 3: hybrydy 11 (drewniany zygzak + karty na ścianie) i 16 (tablica z kluczami: deski, haczyki, sznurki)
// =====================================================================================
const BOARD = `<div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,#4a2f18 0 22px,#3f260f 22px 24px),#4a2f18"></div>`;
const hook = (x, yy, z = 3) => `<div style="position:absolute;left:${x - 7}px;top:${yy - 7}px;width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffe9a8,#b8863a);border:3px solid #120a05;z-index:${z}"></div>`;
const cord = (x, y0, len, z = 2) => `<div style="position:absolute;left:${x - 1}px;top:${y0}px;width:2px;height:${len}px;background:#d9a24a;z-index:${z}"></div>`;
const stairsSvg = (c, y, P, W, o) => { let s = wallBg(c, y, P, W, o.wallOp ?? 1); for (let k = 1; k <= c.n; k++) { s += woodLand(o.left(k) ? o.L0 : o.R0, y(k), o.LW, k <= c.f); if (k < c.n) s += woodRun(o.left(k) ? o.L0 + o.LW : o.R0, o.left(k) ? o.R0 : o.L0 + o.LW, y(k), y(k + 1), o.m || 8, k < c.f); } return s; };

// 21. Klatka z tablicą kluczy: po lewej wąska deska z haczykami i kartami, po prawej drewniane schody
function b21(c) {
  const { n, f, W } = c, P = 76, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 36, BW = 70, LW = 30, L0 = BW + 6, R0 = W - 6 - LW, left = k => k % 2 === 1;
  const s = stairsSvg(c, y, P, W, { left, L0, R0, LW, m: 5 });
  let b = `<div style="position:absolute;left:0;top:0;bottom:0;width:${BW}px;background:repeating-linear-gradient(90deg,#4a2f18 0 22px,#3f260f 22px 24px),#4a2f18;border-right:4px solid #120a05;z-index:1"></div>`;
  for (let k = 1; k <= n; k++) b += hook(BW / 2, y(k) - 26) + cord(BW / 2, y(k) - 19, 8) + card(c, k, 7, y(k) - 12, 56, 40, { z: 4, rot: left(k) ? -2 : 2, photo: false });
  return { H, yc: y, html: `<svg width="${W}" height="${H}" style="position:absolute;inset:0">${HZ}${s}</svg>${b}${ch(c, (left(f) ? L0 : R0) + LW / 2 - 22, y(f) - 44, 44)}` };
}

// 22. Karty na sznurkach przy schodach: przepustki wiszą na mosiężnych haczykach na ścianie klatki
function b22(c) {
  const { n, f, W } = c, P = 76, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 36, LW = 50, L0 = 8, R0 = W - 8 - LW, left = k => k % 2 === 1;
  let s = stairsSvg(c, y, P, W, { left, L0, R0, LW }), cards = '';
  for (let k = 1; k <= n; k++) { const cx = left(k) ? W - 8 - 34 : 8 + 34; cards += hook(cx, y(k) - 40) + cord(cx, y(k) - 33, 13) + card(c, k, cx - 34, y(k) - 22, 68, 44, { z: 4, rot: left(k) ? 3 : -3, photo: false }); }
  return { H, yc: y, html: `<svg width="${W}" height="${H}" style="position:absolute;inset:0">${HZ}${s}</svg>${cards}${ch(c, (left(f) ? L0 : R0) + LW / 2 - 24, y(f) - 47)}` };
}

// 23. Deska ze schodami w tle: deski jak w tablicy kluczy, przygaszone schody, na środku karty na haczykach
function b23(c) {
  const { n, f, W } = c, P = 76, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 36, LW = 50, L0 = 8, R0 = W - 8 - LW, left = k => k % 2 === 1;
  const s = stairsSvg(c, y, P, W, { left, L0, R0, LW, wallOp: 0 });
  let cards = '';
  for (let k = 1; k <= n; k++) cards += hook(W / 2, y(k) - 34) + cord(W / 2, y(k) - 27, 10) + card(c, k, W / 2 - 58, y(k) - 18, 116, 48, { z: 4, rot: (k % 2 ? -1 : 1) * 1.4 });
  return { H, yc: y, html: `${BOARD}<svg width="${W}" height="${H}" style="position:absolute;inset:0;opacity:.55">${HZ}${s}</svg><div style="position:absolute;left:0;top:0;bottom:0;width:7px;background:#2b1a12"></div><div style="position:absolute;right:0;top:0;bottom:0;width:7px;background:#2b1a12"></div>${cards}` };
}

// 24. Zygzak na tablicy: karty wiszą na przemian po lewej i prawej, łączy je mosiężny łańcuszek
function b24(c) {
  const { n, f, W } = c, P = 66, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 34, CW = 98, hx = k => k % 2 ? 10 + CW / 2 : W - 10 - CW / 2;
  let h = BOARD, chain = '';
  for (let k = 1; k < n; k++) chain += `<path d="M${hx(k)} ${y(k) - 30}L${hx(k + 1)} ${y(k + 1) - 30}" stroke="${k < f ? '#ffc766' : '#7a5a30'}" stroke-width="3" stroke-dasharray="2 5" stroke-linecap="round"/>`;
  h += `<svg width="${W}" height="${H}" style="position:absolute;inset:0;z-index:1">${chain}</svg>`;
  for (let k = 1; k <= n; k++) h += hook(hx(k), y(k) - 30) + cord(hx(k), y(k) - 23, 8) + card(c, k, hx(k) - CW / 2, y(k) - 16, CW, 46, { z: 4, rot: (k % 2 ? -1.5 : 1.5) });
  return { H, yc: y, html: h };
}

// 25. Szafka na klucze: przegródki jak w recepcji, z kartą wystającą z każdej
function b25(c) {
  const { n, f, W } = c, P = 64, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 32;
  let h = `<div style="position:absolute;inset:0;background:#3a230f"></div><div style="position:absolute;left:0;top:0;bottom:0;width:9px;background:linear-gradient(90deg,#6a4220,#4a2f18);border-right:3px solid #120a05;z-index:2"></div><div style="position:absolute;right:0;top:0;bottom:0;width:9px;background:linear-gradient(90deg,#4a2f18,#6a4220);border-left:3px solid #120a05;z-index:2"></div>`;
  for (let k = 1; k <= n; k++) {
    const s = st(c, k);
    h += `<div style="position:absolute;left:11px;width:${W - 22}px;top:${y(k) - 29}px;height:58px;background:#120a05;border:4px solid ${s === 'now' ? '#ffb347' : '#7a4a24'};border-radius:5px;box-shadow:inset 0 6px 12px #000${s === 'now' ? ',0 0 16px #ff8c2b' : ''}"></div>`;
    h += card(c, k, 19, y(k) - 29, W - 38, 44, { z: 3 });
    h += `<div style="position:absolute;left:11px;width:${W - 22}px;top:${y(k) + 10}px;height:16px;background:linear-gradient(#8a5428,#6a4220);border:4px solid ${s === 'now' ? '#ffb347' : '#120a05'};border-top-width:2px;border-radius:0 0 5px 5px;z-index:5"></div>`;
  }
  return { H, yc: y, html: h };
}

// 26. Sznur z klamerkami: wzdłuż biegów schodów biegnie sznur, a karty wiszą na klamerkach
function b26(c) {
  const { n, f, W } = c, P = 76, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 36, LW = 50, L0 = 8, R0 = W - 8 - LW, left = k => k % 2 === 1;
  const s = stairsSvg(c, y, P, W, { left, L0, R0, LW });
  let rope = '', cards = '';
  for (let k = 1; k < n; k++) {
    const xs = left(k) ? L0 + LW : R0, xe = left(k) ? R0 : L0 + LW, y0 = y(k) - 4, y1 = y(k + 1) - 4;
    rope += `<path d="M${xs} ${y0}L${xe} ${y1}" stroke="${k < f ? '#e8c27a' : '#a8885a'}" stroke-width="3" stroke-linecap="round"/>`;
    const mx = (xs + xe) / 2, my = (y0 + y1) / 2, sl = Math.atan2(y1 - y0, xe - xs) * 180 / Math.PI;
    cards += `<i style="position:absolute;left:${mx - 4}px;top:${my - 8}px;width:8px;height:14px;border-radius:2px;background:#ffb347;border:2px solid #120a05;z-index:6"></i>` + card(c, k, mx - 27, my + 2, 54, 36, { z: 5, rot: Math.max(-9, Math.min(9, sl * .2)), photo: false });
  }
  cards += card(c, n, (n % 2 ? R0 : L0) + LW / 2 - 27 + (n % 2 ? -(R0 - L0) / 2 + 0 : 0), y(n) - 52, 54, 36, { z: 5, photo: false });
  return { H, yc: y, html: `<svg width="${W}" height="${H}" style="position:absolute;inset:0">${HZ}${s}${rope}</svg>${cards}${ch(c, (left(f) ? L0 : R0) + LW / 2 - 24, y(f) - 47)}` };
}

// 27. Ramki na ścianie: przepustki w mosiężnych ramkach na sznurku, obok drewniane schody
function b27(c) {
  const { n, f, W } = c, P = 76, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 36, LW = 50, L0 = 8, R0 = W - 8 - LW, left = k => k % 2 === 1;
  let s = stairsSvg(c, y, P, W, { left, L0, R0, LW }), fr = '';
  for (let k = 1; k <= n; k++) {
    const x = left(k) ? W - 8 - 74 : 8, cx = x + 37, on = k === f;
    s += `<path d="M${x + 8} ${y(k) - 24}L${cx} ${y(k) - 44}L${x + 66} ${y(k) - 24}" stroke="#d9a24a" stroke-width="1.8" fill="none"/><circle cx="${cx}" cy="${y(k) - 44}" r="3.5" fill="#b8863a" stroke="#120a05" stroke-width="2"/>`;
    fr += `<div style="position:absolute;left:${x}px;top:${y(k) - 26}px;width:74px;height:50px;border:4px solid ${on ? '#ffe9a8' : '#b8863a'};border-radius:6px;background:#2a1a0e;box-shadow:0 0 0 2px #120a05,0 3px 0 2px #0a0502${on ? ',0 0 14px #ffb347' : ''};z-index:4"></div>` + card(c, k, x + 5, y(k) - 21, 64, 40, { z: 5, photo: false });
  }
  return { H, yc: y, html: `<svg width="${W}" height="${H}" style="position:absolute;inset:0">${HZ}${s}</svg>${fr}${ch(c, (left(f) ? L0 : R0) + LW / 2 - 24, y(f) - 47)}` };
}

// 28. Tablica i mini-schody: po lewej szerokie karty na haczykach, po prawej zygzak jak linijka postępu
function b28(c) {
  const { n, f, W } = c, P = 62, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 34, px = k => k % 2 ? 146 : 168, py = k => y(k) + 10;
  let h = BOARD + `<div style="position:absolute;left:132px;top:0;bottom:0;width:52px;background:#1a110a;border-left:4px solid #120a05;z-index:1"></div>`;
  let path = '', lit = '';
  for (let k = 1; k <= n; k++) { path += `${k === 1 ? 'M' : 'L'}${px(k)} ${py(k)}`; if (k <= f) lit += `${k === 1 ? 'M' : 'L'}${px(k)} ${py(k)}`; }
  h += `<svg width="${W}" height="${H}" style="position:absolute;inset:0;z-index:2"><path d="${path}" stroke="#120a05" stroke-width="12" stroke-linejoin="round" stroke-linecap="round" fill="none"/><path d="${path}" stroke="#6a4220" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" fill="none"/><path d="${lit}" stroke="#ffb347" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" fill="none"/>${Array.from({ length: n }, (_, i) => `<circle cx="${px(i + 1)}" cy="${py(i + 1)}" r="5" fill="${i + 1 <= f ? '#ffe9a8' : '#2b1a12'}" stroke="#120a05" stroke-width="2.5"/>`).join('')}</svg>`;
  for (let k = 1; k <= n; k++) h += hook(66, y(k) - 28) + cord(66, y(k) - 21, 9) + card(c, k, 6, y(k) - 14, 120, 44, { z: 4, rot: (k % 2 ? -1 : 1) * 1.2 });
  return { H, yc: y, html: h + ch(c, px(f) - 17, py(f) - 32, 34, 7) };
}

// 29. Drabina z kartami: drewniana drabina pośrodku, karty wiszą z jej szczebli na przemian po bokach
function b29(c) {
  const { n, f, W } = c, P = 70, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 34, cx = W / 2, hw = 21;
  let h = `<div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,#1d140d 0 ${P}px,#261a10 ${P}px ${P + 3}px)"></div>`;
  for (const sx of [-1, 1]) h += `<div style="position:absolute;left:${cx + sx * hw - 4}px;width:8px;top:${y(n) - 36}px;height:${H - y(n)}px;background:linear-gradient(90deg,#8a5428,#b8793a 50%,#6a4220);border:2px solid #120a05;border-radius:3px;z-index:2"></div>`;
  for (let yy = y(n) - 26; yy < H - 90; yy += 15) { const done = yy > y(f); h += `<div style="position:absolute;left:${cx - hw}px;width:${hw * 2}px;top:${yy}px;height:5px;border-radius:2px;background:${done ? '#ffc766' : '#6a4220'};box-shadow:0 0 0 2px #120a05;z-index:2"></div>`; }
  for (let k = 1; k <= n; k++) {
    const L = k % 2 === 1, x = L ? 4 : W - 4 - 56;
    h += `<div style="position:absolute;${L ? `left:${58}px;width:${cx - hw - 58}px` : `left:${cx + hw}px;width:${W - 60 - cx - hw}px`};top:${y(k) - 2}px;height:3px;background:#d9a24a;z-index:3"></div>` + card(c, k, x, y(k) - 18, 56, 40, { z: 4, rot: L ? -2 : 2, photo: false });
  }
  return { H, yc: y, html: h + ch(c, cx - 24, y(f) - 40, 48, 6) };
}

// 30. Regał z kartami: drewniane półki, na każdej stoi przepustka oparta o deskę
function b30(c) {
  const { n, f, W } = c, P = 64, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 32;
  let h = BOARD + `<div style="position:absolute;left:0;top:0;bottom:0;width:9px;background:linear-gradient(90deg,#6a4220,#4a2f18);border-right:3px solid #120a05;z-index:2"></div><div style="position:absolute;right:0;top:0;bottom:0;width:9px;background:linear-gradient(90deg,#4a2f18,#6a4220);border-left:3px solid #120a05;z-index:2"></div>`;
  for (let k = 1; k <= n; k++) {
    h += `<div style="position:absolute;left:9px;right:9px;top:${y(k) + 18}px;height:11px;background:linear-gradient(#b8793a,#8a5428 60%,#5a3418);border:3px solid #120a05;z-index:3"></div>`;
    for (const bx of [22, W - 32]) h += `<div style="position:absolute;left:${bx}px;top:${y(k) + 29}px;width:10px;height:9px;background:#b8863a;border:2px solid #120a05;border-top:0;z-index:3"></div>`;
    h += card(c, k, W / 2 - 52, y(k) - 28, 104, 46, { z: 4, rot: (k % 2 ? -2 : 2) });
  }
  return { H, yc: y, html: h };
}

// =====================================================================================
// Runda 4: nowe pomysły "w duchu" 11 i 16 (ciepłe materiały, fizyczne przedmioty, duże numery), bez doklejania kart do schodów
// =====================================================================================
const BRASS = 'radial-gradient(circle at 35% 30%,#ffe9a8,#b8863a 55%,#6a4a1c)';
const numTxt = (c, k, size, color) => `${c.boss(k) ? c.skull() : ''}<span style="font:800 ${size}px/1 var(--display);color:${color}">${k}</span>`;

// 31. Mosiężne tabliczki: drewniane schody z lampami na ścianie i wygrawerowanymi, przykręconymi tabliczkami pięter
function b31(c) {
  const { n, f, W } = c, P = 76, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 36, LW = 50, L0 = 8, R0 = W - 8 - LW, left = k => k % 2 === 1;
  const s = stairsSvg(c, y, P, W, { left, L0, R0, LW });
  let pl = '';
  for (let k = 1; k <= n; k++) {
    const st_ = st(c, k), boss = c.boss(k), x = left(k) ? W - 8 - 66 : 8, lit = k <= f;
    const bg = boss ? (st_ === 'todo' ? 'linear-gradient(#7a2a1a,#4a1a10)' : 'linear-gradient(#e0794a,#a8321f)') : st_ === 'todo' ? 'linear-gradient(#7a6038,#4e3b20)' : st_ === 'now' ? 'linear-gradient(#fff2c0,#ffd666)' : 'linear-gradient(#ffd98a,#c98a3e)';
    pl += `<div style="position:absolute;left:${x}px;top:${y(k) - 22}px;width:66px;height:36px;border-radius:6px;background:${bg};border:3px solid #120a05;box-shadow:inset 0 2px 0 rgba(255,255,255,.35),0 3px 0 #0a0502${st_ === 'now' ? ',0 0 16px #ffd666' : ''};display:flex;align-items:center;justify-content:center;gap:4px;z-index:4">${numTxt(c, k, 24, st_ === 'todo' ? '#2a1a0a' : '#2b1a12')}${[[4, 4], [54, 4], [4, 24], [54, 24]].map(([a, b2]) => `<i style="position:absolute;left:${a}px;top:${b2}px;width:4px;height:4px;border-radius:50%;background:#120a05;opacity:.55"></i>`).join('')}</div>`;
    const lx = left(k) ? L0 + LW / 2 : R0 + LW / 2;
    pl += `<div style="position:absolute;left:${lx - 6}px;top:${y(k) - 50}px;width:12px;height:16px;border-radius:3px 3px 6px 6px;background:${lit ? 'radial-gradient(#fff2c0,#ffb347)' : '#2b1a12'};border:2px solid #120a05;${lit ? 'box-shadow:0 0 16px 4px rgba(255,170,60,.55)' : ''};z-index:3"></div>`;
  }
  return { H, yc: y, html: `<svg width="${W}" height="${H}" style="position:absolute;inset:0">${HZ}${s}</svg>${pl}${ch(c, (left(f) ? L0 : R0) + LW / 2 - 24, y(f) - 47)}` };
}

// 32. Wskaźnik pięter starej windy: mosiężne oprawy z lampkami, zaliczone świecą, bieżąca żarzy się
function b32(c) {
  const { n, f, W } = c, P = 60, TOP = 76, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 30, cx = 70;
  let h = `<div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,#6a4a1c 0 3px,#5a3d16 3px 6px),#5a3d16"></div><div style="position:absolute;left:0;top:0;bottom:0;width:12px;background:linear-gradient(90deg,#4a2f18,#6a4220);border-right:4px solid #120a05"></div><div style="position:absolute;right:0;top:0;bottom:0;width:12px;background:linear-gradient(90deg,#6a4220,#4a2f18);border-left:4px solid #120a05"></div>`;
  h += `<div style="position:absolute;left:${cx - 5}px;width:10px;top:${y(n)}px;height:${y(1) - y(n)}px;background:#3a2410;border:2px solid #120a05;border-radius:4px"></div><div style="position:absolute;left:${cx - 5}px;width:10px;top:${y(f)}px;height:${y(1) - y(f)}px;background:linear-gradient(#ffe9a8,#ff8c2b);border:2px solid #120a05;border-radius:4px;box-shadow:0 0 12px #ff8c2b"></div>`;
  for (let k = 1; k <= n; k++) {
    const s = st(c, k), boss = c.boss(k), d = s === 'now' ? 56 : 44;
    const glass = boss ? (s === 'todo' ? 'radial-gradient(#5a1a10,#2a0a06)' : 'radial-gradient(#ffb199,#e4572e 60%,#8a2010)') : s === 'todo' ? 'radial-gradient(#2a1a0e,#120a05)' : s === 'now' ? 'radial-gradient(#fff,#fff2c0 55%,#ffb347)' : 'radial-gradient(#fff2c0,#ffb347 60%,#c2661a)';
    h += `<div style="position:absolute;left:${cx - d / 2 - 6}px;top:${y(k) - d / 2 - 6}px;width:${d + 12}px;height:${d + 12}px;border-radius:50%;background:${BRASS};border:3px solid #120a05;box-shadow:0 3px 0 #0a0502"></div>`;
    h += `<div style="position:absolute;left:${cx - d / 2}px;top:${y(k) - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;background:${glass};border:2px solid #120a05;box-shadow:${s === 'todo' ? 'inset 0 0 8px #000' : s === 'now' ? '0 0 24px 4px #ffd666' : '0 0 14px #ff8c2b'};display:flex;align-items:center;justify-content:center;gap:2px">${numTxt(c, k, s === 'now' ? 24 : 20, s === 'todo' ? '#7a6a52' : boss && s === 'done' ? '#2b0d07' : '#2b1a12')}</div>`;
  }
  return { H, yc: y, html: h + ch(c, cx + 36, y(f) - 28, 52, 6) };
}

// 33. Girlanda lampionów: sznur zygzakiem, papierowe lampiony zapalają się po kolei
function b33(c) {
  const { n, f, W } = c, P = 66, TOP = 74, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 36, px = k => k % 2 ? 46 : W - 46;
  let h = `<div style="position:absolute;inset:0;background:radial-gradient(150px 300px at 50% 60%,rgba(255,150,40,.05),transparent)"></div>`, rope = '', lamps = '';
  for (let k = 1; k <= n; k++) {
    if (k < n) rope += `<path d="M${px(k)} ${y(k) - 32}Q${(px(k) + px(k + 1)) / 2} ${(y(k) + y(k + 1)) / 2 - 22} ${px(k + 1)} ${y(k + 1) - 32}" stroke="${k < f ? '#e8c27a' : '#7a5a30'}" stroke-width="3" fill="none"/>`;
    const s = st(c, k), boss = c.boss(k), w = s === 'now' ? 60 : 46, hh = s === 'now' ? 70 : 54;
    const fill = boss ? (s === 'todo' ? 'radial-gradient(#6a2a1c,#3a1008)' : 'radial-gradient(#ffb199,#e4572e 70%,#8a2010)') : s === 'todo' ? 'radial-gradient(#5a4a38,#2e231a)' : s === 'now' ? 'radial-gradient(#fff,#ffe9a8 55%,#ffb347)' : 'radial-gradient(#fff2c0,#ff9a2e 75%,#c2661a)';
    lamps += `<div style="position:absolute;left:${px(k) - 1}px;top:${y(k) - 32}px;width:2px;height:10px;background:#a8885a"></div>
      <div style="position:absolute;left:${px(k) - w / 2}px;top:${y(k) - 22}px;width:${w}px;height:${hh}px;border-radius:50%/46%;background:${fill};border:3px solid #120a05;box-shadow:${s === 'todo' ? 'none' : `0 0 ${s === 'now' ? 28 : 16}px ${s === 'now' ? '#ffd666' : '#ff8c2b'}`};display:flex;align-items:center;justify-content:center;gap:2px;overflow:hidden;z-index:3">
        <i style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(0,0,0,.18) 0 2px,transparent 2px ${w / 5}px)"></i>${numTxt(c, k, s === 'now' ? 26 : 21, s === 'todo' ? '#8a7a62' : '#2b1a12')}</div>
      <div style="position:absolute;left:${px(k) - 9}px;top:${y(k) - 25}px;width:18px;height:6px;border-radius:3px;background:#b8863a;border:2px solid #120a05;z-index:4"></div>`;
  }
  const x = px(f), onL = x < W / 2;
  return { H, yc: y, html: h + `<svg width="${W}" height="${H}" style="position:absolute;inset:0">${rope}</svg>${lamps}${ch(c, onL ? x + 34 : x - 34 - 46, y(f) - 4, 46, 6)}` };
}

// 34. Pieczęcie woskowe: pergamin ze sznurkiem, każde piętro to odciśnięta pieczęć
function b34(c) {
  const { n, f, W } = c, P = 62, TOP = 76, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 34, px = k => k % 2 ? 56 : W - 56;
  let h = `<div style="position:absolute;left:10px;right:10px;top:0;bottom:0;background:linear-gradient(90deg,#6b5333,#8a6f46 18%,#8a6f46 82%,#6b5333);border-left:3px solid #120a05;border-right:3px solid #120a05;box-shadow:inset 0 0 40px rgba(0,0,0,.35)"></div><div style="position:absolute;left:10px;right:10px;top:0;bottom:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.05) 0 2px,transparent 2px 7px)"></div>`;
  let tw = '', seal = '';
  for (let k = 1; k < n; k++) tw += `<path d="M${px(k)} ${y(k)}L${px(k + 1)} ${y(k + 1)}" stroke="${k < f ? '#a8321f' : '#3a2814'}" stroke-width="3" stroke-dasharray="${k < f ? '0' : '3 6'}" stroke-linecap="round"/>`;
  for (let k = 1; k <= n; k++) {
    const s = st(c, k), boss = c.boss(k), d = s === 'now' ? 56 : 48;
    if (s === 'todo') seal += `<div style="position:absolute;left:${px(k) - d / 2}px;top:${y(k) - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;border:3px dashed ${boss ? '#a8321f' : '#4a3820'};display:flex;align-items:center;justify-content:center;gap:2px;z-index:3">${numTxt(c, k, 20, boss ? '#a8321f' : '#4a3820')}</div>`;
    else {
      const wax = boss ? 'radial-gradient(circle at 35% 30%,#6a6a6a,#222 60%,#0a0a0a)' : s === 'now' ? 'radial-gradient(circle at 35% 30%,#fff2c0,#ffc23a 55%,#b8761a)' : 'radial-gradient(circle at 35% 30%,#ff8a6a,#c2361a 55%,#6a1a10)';
      seal += `<div style="position:absolute;left:${px(k) - d / 2}px;top:${y(k) - d / 2}px;width:${d}px;height:${d}px;border-radius:48% 52% 50% 50%/52% 48% 52% 48%;background:${wax};border:3px solid #120a05;box-shadow:0 3px 0 #0a0502${s === 'now' ? ',0 0 22px #ffd666' : ''};display:flex;align-items:center;justify-content:center;gap:2px;z-index:3"><i style="position:absolute;inset:5px;border-radius:50%;border:2px solid rgba(0,0,0,.28)"></i>${numTxt(c, k, s === 'now' ? 24 : 20, boss ? '#f1e9d6' : s === 'now' ? '#6a3a0a' : '#ffd0bf')}</div>`;
    }
  }
  const x = px(f);
  return { H, yc: y, html: h + `<svg width="${W}" height="${H}" style="position:absolute;inset:0">${tw}</svg>${seal}${ch(c, x < W / 2 ? x + 32 : x - 32 - 46, y(f) - 24, 46, 6)}` };
}

// 35. Wąskotorówka: szyny z drewnianymi podkładami, na których wypalone są numery; wagonik z kurczakiem
function b35(c) {
  const { n, f, W } = c, P = 62, TOP = 72, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 30, cx = W / 2;
  let h = `<div style="position:absolute;inset:0;background:radial-gradient(160px 400px at 50% 50%,#2a1c10,transparent)"></div>`;
  for (const sx of [-1, 1]) h += `<div style="position:absolute;left:${cx + sx * 30 - 3}px;width:7px;top:${y(n) - 30}px;height:${H - y(n) + 10}px;background:linear-gradient(90deg,#2a1a10,#6a4a2a 50%,#2a1a10);border:2px solid #120a05;z-index:2"></div>`;
  for (let k = 1; k <= n; k++) {
    const s = st(c, k), boss = c.boss(k);
    for (const o of [P / 3, 2 * P / 3]) h += `<div style="position:absolute;left:${cx - 36}px;width:72px;top:${y(k) + o - 4}px;height:8px;background:#3a2410;border:2px solid #120a05;border-radius:2px"></div>`;
    const bg = boss ? (s === 'todo' ? '#7a2a1a' : '#e0794a') : s === 'todo' ? '#7a5230' : s === 'now' ? '#ffe9a8' : '#d99a42';
    h += `<div style="position:absolute;left:${cx - 50}px;width:100px;top:${y(k) - 11}px;height:22px;background:${bg};border:3px solid #120a05;border-radius:3px;box-shadow:0 3px 0 #0a0502${s === 'now' ? ',0 0 14px #ffd666' : ''};display:flex;align-items:center;justify-content:center;gap:4px;z-index:3">${numTxt(c, k, 17, s === 'todo' ? '#2a1a0a' : '#2b1a12')}</div>`;
  }
  const cart = `<svg width="86" height="62" viewBox="0 0 86 62" style="position:absolute;left:${cx - 43}px;top:${y(f) - 40}px;z-index:7"><path d="M6 14H80L72 46H14Z" fill="#8a5428" stroke="#120a05" stroke-width="4" stroke-linejoin="round"/><path d="M10 22H76M12 32H74" stroke="#b8863a" stroke-width="4"/><path d="M6 14H80" stroke="#ffd98a" stroke-width="4" stroke-linecap="round"/><text x="43" y="38" text-anchor="middle" font-family="Baloo 2" font-weight="800" font-size="20" fill="#fff2c0" stroke="#120a05" stroke-width="3" paint-order="stroke">${f}</text><circle cx="26" cy="50" r="8" fill="#3a2410" stroke="#120a05" stroke-width="4"/><circle cx="60" cy="50" r="8" fill="#3a2410" stroke="#120a05" stroke-width="4"/></svg>`;
  return { H, yc: y, html: h + ch(c, cx - 25, y(f) - 64, 50, 6) + cart };
}

// 36. Wieża ze skrzyń: magazynowe skrzynie z numerami malowanymi szablonem, zaliczone z lakowanym znaczkiem
function b36(c) {
  const { n, f, W } = c, P = 58, TOP = 76, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 30, CW = 118;
  let h = '';
  for (let k = n; k >= 1; k--) {
    const s = st(c, k), boss = c.boss(k), off = (hsh(k, 1) - .5) * 16, rot = (hsh(k, 2) - .5) * 2.4;
    const [w1, w2, br] = boss ? (s === 'todo' ? ['#6a2418', '#5a1c12', '#3a1008'] : ['#c2502e', '#b04426', '#7a2414']) : s === 'todo' ? ['#6a4a2a', '#5a3c20', '#3a2410'] : s === 'now' ? ['#ffd98a', '#f0c46a', '#b8863a'] : ['#c98a3e', '#b87a30', '#7a4a18'];
    h += `<div style="position:absolute;left:${(W - CW) / 2 + off}px;top:${y(k) - 28}px;width:${CW}px;height:56px;border:3px solid #120a05;border-radius:4px;background:linear-gradient(to top right,transparent calc(50% - 3px),${br} calc(50% - 3px) calc(50% + 3px),transparent calc(50% + 3px)),repeating-linear-gradient(90deg,${w1} 0 26px,${w2} 26px 28px);transform:rotate(${rot}deg);z-index:${100 - k};box-shadow:0 3px 0 #0a0502${s === 'now' ? ',0 0 20px #ffb347' : ''};overflow:hidden">
      <i style="position:absolute;left:0;right:0;top:0;height:8px;background:${br};opacity:.8"></i><i style="position:absolute;left:0;right:0;bottom:0;height:8px;background:${br};opacity:.8"></i>
      <b style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);min-width:54px;padding:2px 10px;border-radius:4px;background:rgba(255,245,220,${s === 'todo' ? .16 : .55});display:flex;align-items:center;justify-content:center;gap:5px">${numTxt(c, k, 28, s === 'todo' ? '#c9b89a' : '#1a0f08')}</b>
      ${s === 'done' ? `<i style="position:absolute;right:6px;top:11px;font:800 14px var(--display);font-style:normal;color:#c2361a;border:2px solid #c2361a;border-radius:3px;padding:0 3px;transform:rotate(-8deg);background:rgba(255,255,255,.35)">OK</i>` : ''}</div>`;
  }
  return { H, yc: y, html: h + ch(c, (W - CW) / 2 + CW - 62, y(f) - 28 - 40, 46, 150) };
}

// 37. Rurociąg z zaworami: mosiężna rura nagrzewa się od dołu, na każdym piętrze manometr z numerem
function b37(c) {
  const { n, f, W } = c, P = 62, TOP = 76, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 32, cx = W / 2;
  let h = `<div style="position:absolute;left:${cx - 13}px;width:26px;top:${y(n) - 30}px;height:${H - y(n)}px;background:linear-gradient(90deg,#4a3410,#b8863a 45%,#4a3410);border:3px solid #120a05;border-radius:6px 6px 0 0;z-index:1"></div><div style="position:absolute;left:${cx - 13}px;width:26px;top:${y(f)}px;height:${H - y(f)}px;background:linear-gradient(90deg,#9a2a10,#ff9a3a 45%,#9a2a10);border:3px solid #120a05;z-index:2;box-shadow:0 0 18px #ff8c2b"></div>`;
  for (let k = 1; k <= n; k++) {
    const s = st(c, k), boss = c.boss(k), left = k % 2 === 1, gx = left ? 40 : W - 40, ang = s === 'done' ? 50 : s === 'now' ? 105 : -62;
    h += `<div style="position:absolute;left:${cx - 22}px;width:44px;top:${y(k) - 5}px;height:10px;background:linear-gradient(#e0b25a,#8a5f22);border:3px solid #120a05;border-radius:2px;z-index:3"></div>`;
    h += `<div style="position:absolute;left:${left ? gx : cx}px;width:${left ? cx - gx : gx - cx}px;top:${y(k) - 4}px;height:8px;background:${s === 'todo' ? '#6a4a1c' : '#d9701c'};border:2px solid #120a05;z-index:2"></div>`;
    h += `<div style="position:absolute;left:${gx - 27}px;top:${y(k) - 27}px;width:54px;height:54px;border-radius:50%;background:${BRASS};border:3px solid #120a05;box-shadow:0 3px 0 #0a0502${s === 'now' ? ',0 0 20px #ffd666' : ''};z-index:4"></div>`;
    h += `<div style="position:absolute;left:${gx - 20}px;top:${y(k) - 20}px;width:40px;height:40px;border-radius:50%;background:${boss ? 'radial-gradient(#ffd0bf,#e4572e)' : 'radial-gradient(#fffaf0,#e8dcc0)'};border:2px solid #120a05;z-index:5;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:1px;padding-top:12px">${numTxt(c, k, 17, '#1a0f08')}<i style="position:absolute;left:19px;top:20px;width:2px;height:15px;background:${s === 'now' ? '#c2361a' : '#2b1a12'};transform-origin:50% 0;transform:rotate(${ang + 180}deg);border-radius:1px"></i></div>`;
    if (s === 'now') h += [0, 1, 2].map(i => `<i style="position:absolute;left:${gx - 8 + i * 8}px;top:${y(k) - 40 - i * 7}px;width:${12 + i * 3}px;height:${12 + i * 3}px;border-radius:50%;background:rgba(241,233,214,${.6 - i * .15});z-index:6"></i>`).join('');
  }
  const L = f % 2 === 1;
  return { H, yc: y, html: h + ch(c, L ? cx + 18 : cx - 18 - 46, y(f) - 40, 46, 7) };
}

// 38. Kalendarz adwentowy: drewniane drzwiczki z numerami w dwóch kolumnach, kolejność wężykiem od dołu
function b38(c) {
  const { n, f, W } = c, R = Math.ceil(n / 2), P = 74, TOP = 74, H = TOP + R * P + 120, row = k => Math.floor((k - 1) / 2), col = k => row(k) % 2 === 0 ? (k - 1) % 2 : 1 - (k - 1) % 2, y = k => TOP + (R - 1 - row(k)) * P + 38, DW = 78, x = k => col(k) ? W - 10 - DW : 10;
  let h = `<div style="position:absolute;left:0;top:0;bottom:0;width:6px;background:#2b1a12"></div><div style="position:absolute;right:0;top:0;bottom:0;width:6px;background:#2b1a12"></div>`;
  for (let k = 1; k <= n; k++) {
    const s = st(c, k), boss = c.boss(k), X = x(k), Y = y(k) - 31, wood = boss ? ['#a8321f', '#8a2818'] : ['#8a5a30', '#7a4e28'];
    h += `<div style="position:absolute;left:${X}px;top:${Y}px;width:${DW}px;height:62px;border:3px solid ${s === 'now' ? '#ffb347' : '#120a05'};border-radius:5px;background:${s === 'todo' ? '#1a0f08' : 'radial-gradient(#fff2c0,#ffb347 55%,#8a4a10)'};box-shadow:0 3px 0 #0a0502${s === 'now' ? ',0 0 18px #ff8c2b' : ''};overflow:hidden">`;
    if (s === 'todo') h += `<div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,${wood[0]} 0 12px,${wood[1]} 12px 14px);display:flex;align-items:center;justify-content:center;gap:4px">${numTxt(c, k, 30, boss ? '#ffd0bf' : '#ffe9c0')}<i style="position:absolute;right:7px;top:26px;width:9px;height:9px;border-radius:50%;background:${BRASS};border:2px solid #120a05"></i></div>`;
    else {
      h += `<div style="position:absolute;left:0;top:0;bottom:0;width:20px;background:repeating-linear-gradient(90deg,${wood[0]} 0 8px,${wood[1]} 8px 10px);clip-path:polygon(0 0,100% 6px,100% calc(100% - 6px),0 100%);border-right:3px solid #120a05"></div>`;
      h += s === 'now' ? `<span style="position:absolute;left:24px;top:4px;width:48px;height:48px">${c.chickSvg}</span>` : `<div style="position:absolute;left:24px;right:4px;top:0;bottom:0;display:flex;align-items:center;justify-content:center;gap:3px">${numTxt(c, k, 26, '#2b1a12')}</div><i style="position:absolute;right:5px;bottom:2px;font:800 14px var(--display);font-style:normal;color:#c2361a">✓</i>`;
      if (s === 'now') h += `<b style="position:absolute;right:5px;bottom:1px;font:800 17px var(--display);color:#2b1a12">${k}</b>`;
    }
    h += `</div>`;
  }
  return { H, yc: y, html: h };
}

// 39. Regał z garnkami: półki z garnkami, zaliczone pełne rosołu, w bieżącym kurczak wygląda z zupy
function b39(c) {
  const { n, f, W } = c, P = 72, TOP = 76, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 36;
  let h = BOARD, pots = '';
  const pot = (k, s, boss) => {
    const body = boss ? '#2a2420' : s === 'todo' ? '#4a4038' : '#8a6a44', rim = boss ? '#4a3a30' : s === 'todo' ? '#6a5a4a' : '#c9a066';
    return `<svg width="78" height="62" viewBox="0 0 78 62" style="position:absolute;z-index:6">
      ${s === 'todo' ? `<path d="M16 16Q39 -4 62 16Z" fill="${rim}" stroke="#120a05" stroke-width="3.5"/><circle cx="39" cy="6" r="4" fill="${rim}" stroke="#120a05" stroke-width="3"/>` : ''}
      <path d="M8 18H70V42Q70 58 54 58H24Q8 58 8 42Z" fill="${body}" stroke="#120a05" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="39" cy="18" rx="31" ry="6" fill="${s === 'todo' ? rim : s === 'now' ? '#ffe9a8' : '#ffb347'}" stroke="#120a05" stroke-width="3.5"/>
      <circle cx="6" cy="28" r="5" fill="none" stroke="#120a05" stroke-width="3.5"/><circle cx="72" cy="28" r="5" fill="none" stroke="#120a05" stroke-width="3.5"/>
      <rect x="22" y="26" width="34" height="22" rx="4" fill="#f1e9d6" stroke="#120a05" stroke-width="2.5"/>
      <text x="39" y="43" text-anchor="middle" font-family="Baloo 2" font-weight="800" font-size="20" fill="${boss ? '#a8321f' : '#1a0f08'}">${k}</text></svg>`;
  };
  for (let k = 1; k <= n; k++) {
    const s = st(c, k), boss = c.boss(k), L = k % 2 === 1, x = L ? 14 : W - 14 - 78, top = y(k) + 28 - 60;
    h += `<div style="position:absolute;left:9px;right:9px;top:${y(k) + 28}px;height:11px;background:linear-gradient(#b8793a,#8a5428 60%,#5a3418);border:3px solid #120a05;z-index:3"></div>`;
    pots += `<div style="position:absolute;left:${x}px;top:${top}px;width:78px;height:62px">${pot(k, s, boss)}</div>`;
    if (boss) pots += `<span style="position:absolute;left:${x + 29}px;top:${top - 14}px;z-index:7">${c.skull()}</span>`;
    if (s !== 'todo') pots += [0, 1].map(i => `<i style="position:absolute;left:${x + 26 + i * 18}px;top:${top - 10 - i * 4}px;width:10px;height:14px;border-radius:50%;background:rgba(241,233,214,.5);z-index:5"></i>`).join('');
  }
  const L = f % 2 === 1, px = L ? 14 : W - 14 - 78;
  return { H, yc: y, html: h + pots + (c.n ? ch(c, px + 17, y(f) + 28 - 60 - 22, 44, 5) : '') };
}

// 40. Schody z dywanem: reprezentacyjna klatka, czerwony chodnik, mosiężne pręty i złocone numery piętra na ścianie
function carpetRun(xs, xe, y0, y1, m, ru) {
  const dx = (xe - xs) / m, dy = (y1 - y0) / m, T = 11; let top = `M${xs} ${y0}`; for (let i = 0; i < m; i++) top += `V${(y0 + dy * (i + 1)).toFixed(1)}H${(xs + dx * (i + 1)).toFixed(1)}`;
  let s = `<path d="${top}L${xe} ${y1 + T}L${xs} ${y0 + T}Z" fill="${ru ? '#8a2418' : '#4a1c14'}" stroke="#120a05" stroke-width="3" stroke-linejoin="round"/>`;
  let tr = '', gold = ''; for (let i = 1; i <= m; i++) { const a = (xs + dx * (i - 1) + Math.sign(dx) * 3).toFixed(1), b = (xs + dx * i - Math.sign(dx) * 3).toFixed(1), yy = (y0 + dy * i + 2).toFixed(1); tr += `M${a} ${yy}H${b}`; gold += `M${a} ${(y0 + dy * i + 5).toFixed(1)}H${b}`; }
  s += `<path d="${tr}" stroke="${ru ? '#ee5a38' : '#7a3426'}" stroke-width="6" stroke-linecap="butt" fill="none"/><path d="${gold}" stroke="${ru ? '#ffd23f' : '#7a6030'}" stroke-width="1.6" fill="none"/>`;
  let posts = ''; for (let i = 0; i <= m; i += 2) posts += `M${(xs + dx * i).toFixed(1)} ${(y0 + dy * i - 24).toFixed(1)}v24`;
  return s + `<path d="${posts}" stroke="#120a05" stroke-width="3" stroke-linecap="round"/><path d="M${xs} ${y0 - 24}L${xe} ${y1 - 24}" stroke="#120a05" stroke-width="6.5" stroke-linecap="round"/><path d="M${xs} ${y0 - 24}L${xe} ${y1 - 24}" stroke="${ru ? '#ffd23f' : '#8a6a2a'}" stroke-width="3" stroke-linecap="round"/>`;
}
function b40(c) {
  const { n, f, W } = c, P = 76, TOP = 70, H = TOP + n * P + 120, y = k => TOP + (n - k) * P + 36, LW = 50, L0 = 8, R0 = W - 8 - LW, left = k => k % 2 === 1;
  let s = wallBg(c, y, P, W), nums = '';
  for (let k = 1; k <= n; k++) {
    const lit = k <= f;
    s += `<rect x="${left(k) ? L0 : R0}" y="${y(k)}" width="${LW}" height="13" rx="3" fill="${lit ? '#c2361a' : '#6a2a20'}" stroke="#120a05" stroke-width="3"/><path d="M${(left(k) ? L0 : R0) + 3} ${y(k) + 3}H${(left(k) ? L0 : R0) + LW - 3}" stroke="${lit ? '#ffd23f' : '#7a6030'}" stroke-width="2.2"/>`;
    if (k < n) s += carpetRun(left(k) ? L0 + LW : R0, left(k) ? R0 : L0 + LW, y(k), y(k + 1), 8, k < f);
    const st_ = st(c, k);
    nums += `<div style="position:absolute;left:${left(k) ? W - 8 - 70 : 8}px;width:70px;top:${y(k) - 30}px;height:40px;display:flex;align-items:center;justify-content:center;gap:4px;font:800 38px/1 var(--display);color:${st_ === 'now' ? '#fff2c0' : st_ === 'done' ? '#ffd23f' : '#7a6a3c'};text-shadow:0 2px 0 #120a05${st_ === 'now' ? ',0 0 18px #ffd666' : ''};z-index:3">${c.boss(k) ? c.skull() : ''}${k}</div>`;
  }
  return { H, yc: y, html: `<svg width="${W}" height="${H}" style="position:absolute;inset:0">${s}</svg>${nums}${ch(c, (left(f) ? L0 : R0) + LW / 2 - 24, y(f) - 47)}` };
}

// =====================================================================================
// Runda 5: guziki od windy. Płomień rośnie od dołu aż do bieżącego guzika (im wyższe piętro, tym wyżej sięga ogień).
// =====================================================================================
function riseFire(c, H, topY, W) {
  const PAD = 120, hgt = H - topY, base = PAD, N = Math.ceil(W / 20) + 1;
  const tg = (x0, ph, w) => `M${x0} ${base + 12} C${x0 - 4} ${base - ph * .45} ${x0 + w * .1} ${base - ph * .6} ${x0 + w * .32} ${base - ph} C${x0 + w * .46} ${base - ph * .55} ${x0 + w * .86} ${base - ph * .45} ${x0 + w} ${base + 12}Z`;
  let back = '', t = '', t2 = '', t3 = '', licks = '', em = '';
  for (let i = 0; i < N; i++) {
    const x0 = i * (W / (N - 1)) - 25, ph = 44 + hsh(i, 7) * 58 + (c.f / c.n) * 22, d = (i % 5) * -.25;
    back += `<path class="t" style="animation-delay:${d - .2}s" d="${tg(x0 - 8, ph * 1.3, 58)}" fill="#a8281a" opacity=".85"/>`;
    t += `<path class="t" style="animation-delay:${d}s" d="${tg(x0, ph, 50)}" fill="url(#rf-g)"/>`;
    t2 += `<path class="t" style="animation-delay:${d - .4}s" d="${tg(x0 + 11, ph * .62, 28)}" fill="#ffe27a" opacity=".85"/>`;
    t3 += `<path class="t" style="animation-delay:${d - .7}s" d="${tg(x0 + 18, ph * .3, 14)}" fill="#fff7c8" opacity=".9"/>`;
    if (i % 2 === 0) em += `<circle cx="${(x0 + 20 + hsh(i, 3) * 22).toFixed(0)}" cy="${(base - ph * 1.3 - 8 - hsh(i, 4) * 40).toFixed(0)}" r="${(1.6 + hsh(i, 5) * 1.8).toFixed(1)}" fill="#ffd23f" opacity=".85"/>`;
  }
  for (let j = 0; j < 9; j++) { const x = 10 + hsh(j, 11) * (W - 20), bt = base + 60 + hsh(j, 12) * 230, hh = 70 + hsh(j, 13) * 150; licks += `<path class="t" style="animation-delay:${-j * .21}s" d="M${x.toFixed(0)} ${bt.toFixed(0)} C${(x - 15).toFixed(0)} ${(bt - hh * .4).toFixed(0)} ${(x - 6).toFixed(0)} ${(bt - hh * .7).toFixed(0)} ${x.toFixed(0)} ${(bt - hh).toFixed(0)} C${(x + 6).toFixed(0)} ${(bt - hh * .7).toFixed(0)} ${(x + 15).toFixed(0)} ${(bt - hh * .4).toFixed(0)} ${x.toFixed(0)} ${bt.toFixed(0)}Z" fill="#ffd23f" opacity=".26"/>`; }
  return `<svg class="vt-rf" width="${W}" height="${hgt + PAD}" style="position:absolute;left:0;top:${topY - PAD}px;z-index:1;pointer-events:none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="rf-g" gradientUnits="userSpaceOnUse" x1="0" y1="${base + 300}" x2="0" y2="${base - 70}"><stop offset="0" stop-color="#ffcf4a"/><stop offset=".3" stop-color="#ffa22e"/><stop offset=".6" stop-color="#ff7a22"/><stop offset=".88" stop-color="#e4452a"/><stop offset="1" stop-color="#a8281a"/></linearGradient></defs>${back}<rect x="0" y="${base}" width="${W}" height="${hgt}" fill="url(#rf-g)"/>${t}${licks}${t2}${t3}${em}</svg>`;
}
const topFor = (c, TOP, rows, P, extra) => Math.max(TOP, c.vpH - (rows * P + extra));
const fireFor = (c, H, y) => riseFire(c, H, y(c.f) + 8, c.W);
const panelBg = (x, top, w, h, r = 16) => `<div style="position:absolute;left:${x}px;top:${top}px;width:${w}px;height:${h}px;border:4px solid #120a05;border-radius:${r}px;background:linear-gradient(90deg,rgba(40,24,12,.76),rgba(62,38,18,.68) 50%,rgba(40,24,12,.76));box-shadow:inset 0 0 0 2px #8a6a2a,0 4px 0 #0a0502;z-index:2"></div>`;
// okrągły guzik windy: podświetlany pierścień (zaliczone bursztyn, bieżące biało-gorący, boss czerwony) i mosiężna tarcza z numerem
function rbtn(c, k, x, yy, d, o = {}) {
  const s = st(c, k), boss = c.boss(k), rw = Math.round(d * .16), photo = s === 'now' && o.photo;
  const ring = boss ? (s === 'todo' ? '#5a1a10' : 'radial-gradient(#ffb199,#e4572e)') : s === 'todo' ? 'radial-gradient(circle at 35% 30%,#8a6a3a,#4a3418)' : s === 'now' ? 'radial-gradient(#fff,#ffe9a8)' : 'radial-gradient(#fff2c0,#ffb347)';
  const glow = s === 'todo' ? '' : s === 'now' ? '0 0 22px 5px #ffd666' : boss ? '0 0 14px #e4572e' : '0 0 14px #ff8c2b';
  const disc = photo ? '#2b1a12' : boss ? (s === 'todo' ? 'radial-gradient(#3a1a14,#1a0a06)' : 'radial-gradient(circle at 35% 30%,#ffd0bf,#c2502e 70%,#7a2014)') : s === 'todo' ? 'radial-gradient(circle at 35% 30%,#4a3a28,#1f150c)' : 'radial-gradient(circle at 35% 30%,#fff3cf,#d9a84e 60%,#8a5f22)';
  return `<div style="position:absolute;left:${x - d / 2 - rw}px;top:${yy - d / 2 - rw}px;width:${d + 2 * rw}px;height:${d + 2 * rw}px;border-radius:50%;background:${ring};border:3px solid #120a05;box-shadow:${glow};z-index:3"></div><div style="position:absolute;left:${x - d / 2}px;top:${yy - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;background:${disc};border:2px solid #120a05;display:flex;align-items:center;justify-content:center;gap:2px;overflow:hidden;z-index:4;box-shadow:inset 0 -3px 5px rgba(0,0,0,.35),inset 0 2px 2px rgba(255,255,255,.3)">${photo ? `<span style="width:${d}px;height:${d}px;display:block">${c.chickSvg}</span>` : numTxt(c, k, Math.round(d * (o.fs || .5)), s === 'todo' ? '#8a7a62' : boss ? '#2b0d07' : '#2b1a12')}</div>`;
}

// 41. Panel okrągłych guzików: jedna kolumna w mosiężnej płycie, ogień sięga od dołu do bieżącego guzika
function b41(c) {
  const { n, f, W } = c, P = 56, TOP = topFor(c, 80, n, P, 110), H = TOP + n * P + 110, y = k => TOP + (n - k) * P + 30, cx = W / 2 - 14;
  let h = fireFor(c, H, y) + panelBg(cx - 36, y(n) - 36, 72, y(1) - y(n) + 72);
  for (let k = 1; k <= n; k++) h += rbtn(c, k, cx, y(k), 38);
  return { H, yc: y, noFire: true, html: h + ch(c, cx + 40, y(f) - 30, 50, 7) };
}

// 42. Dwie kolumny jak w prawdziwej windzie: 1 i 2 na dole, wyżej kolejne pary; kurczak jest na bieżącym guziku
function b42(c) {
  const { n, f, W } = c, R = Math.ceil(n / 2), P = 56, TOP = topFor(c, 80, R, P, 110), H = TOP + R * P + 110, row = k => (k - 1) >> 1, y = k => TOP + (R - 1 - row(k)) * P + 30, cx = W / 2, x = k => (k - 1) % 2 ? cx + 32 : cx - 32;
  let h = fireFor(c, H, y) + panelBg(cx - 70, y(n) - 36, 140, y(1) - y(n) + 72);
  for (let k = 1; k <= n; k++) h += rbtn(c, k, x(k), y(k), k === f ? 44 : 36, { photo: k === f, fs: .52 });
  return { H, yc: y, noFire: true, html: h + `<b style="position:absolute;left:${x(f) + (x(f) < cx ? 28 : -28) - 12}px;top:${y(f) - 8}px;width:24px;text-align:center;font:800 15px var(--display);color:#fff2c0;text-shadow:0 2px 0 #120a05;z-index:8">${f}</b>` };
}

// 43. Prostokątne guziki z brajlem: szerokie klawisze, po prawej punkty Braille'a, bieżący ze zdjęciem kurczaka
function b43(c) {
  const { n, f, W } = c, P = 50, TOP = topFor(c, 80, n, P, 110), H = TOP + n * P + 110, y = k => TOP + (n - k) * P + 28, BW = 128, bx = (W - BW) / 2;
  let h = fireFor(c, H, y) + panelBg(bx - 10, y(n) - 32, BW + 20, y(1) - y(n) + 64, 12);
  for (let k = 1; k <= n; k++) {
    const s = st(c, k), boss = c.boss(k), bg = boss ? (s === 'todo' ? 'linear-gradient(#4a1a10,#2a0e08)' : 'linear-gradient(#ff9a7a,#c2502e)') : s === 'todo' ? 'linear-gradient(#4a3a28,#2a1d12)' : s === 'now' ? 'linear-gradient(#fff,#ffe9a8)' : 'linear-gradient(#ffe3a0,#e0a040)';
    const ink = s === 'todo' ? '#9a8a72' : '#2b1a12';
    let dots = ''; for (let i = 0; i < 6; i++) dots += `<i style="width:5px;height:5px;border-radius:50%;background:${hsh(k, i) > .45 ? ink : 'transparent'};box-shadow:${hsh(k, i) > .45 ? 'none' : `inset 0 0 0 1px ${ink}55`}"></i>`;
    h += `<div style="position:absolute;left:${bx}px;top:${y(k) - 17}px;width:${BW}px;height:34px;border-radius:8px;background:${bg};border:3px solid ${s === 'now' ? '#fff' : '#120a05'};box-shadow:${s === 'todo' ? 'inset 0 -3px 0 rgba(0,0,0,.4)' : `inset 0 -3px 0 rgba(0,0,0,.2),0 0 ${s === 'now' ? 20 : 12}px ${s === 'now' ? '#ffd666' : boss ? '#e4572e' : '#ff8c2b'}`};z-index:4;display:flex;align-items:center;padding:0 10px;gap:8px">${numTxt(c, k, 22, ink)}<span style="margin-left:auto;display:${s === 'now' ? 'block' : 'grid'};${s === 'now' ? '' : 'grid-template-columns:repeat(2,5px);gap:3px 4px;'}">${s === 'now' ? `<span style="display:block;width:40px;height:40px;margin:-10px -4px -10px 0">${c.chickSvg}</span>` : dots}</span></div>`;
  }
  return { H, yc: y, noFire: true, html: h };
}

// 44. Wciśnięte i niewciśnięte: zaliczone guziki są wdrapane w płytę i świecą, kolejne wystają, bieżący jest w połowie wciśnięty
function b44(c) {
  const { n, f, W } = c, P = 64, TOP = topFor(c, 82, n, P, 110), H = TOP + n * P + 110, y = k => TOP + (n - k) * P + 32, cx = W / 2 - 16, d = 48;
  let h = fireFor(c, H, y) + panelBg(cx - 42, y(n) - 40, 84, y(1) - y(n) + 80);
  for (let k = 1; k <= n; k++) {
    const s = st(c, k), boss = c.boss(k);
    const face = s === 'todo' ? (boss ? 'radial-gradient(circle at 35% 25%,#c2502e,#6a1c10)' : 'radial-gradient(circle at 35% 25%,#e8d4a0,#9a7a40)') : s === 'now' ? 'radial-gradient(#fff,#ffe9a8 60%,#ffb347)' : (boss ? 'radial-gradient(#ffb199,#c2361a)' : 'radial-gradient(#fff2c0,#ff9a2e 70%,#c2661a)');
    const sh = s === 'todo' ? '0 6px 0 #0a0502,0 8px 10px rgba(0,0,0,.5),inset 0 3px 3px rgba(255,255,255,.5)' : s === 'now' ? '0 3px 0 #0a0502,0 0 24px 4px #ffd666,inset 0 2px 5px rgba(0,0,0,.25)' : 'inset 0 5px 8px rgba(0,0,0,.55),0 0 14px #ff8c2b';
    h += `<div style="position:absolute;left:${cx - d / 2 - 6}px;top:${y(k) - d / 2 - 6}px;width:${d + 12}px;height:${d + 12}px;border-radius:50%;background:${BRASS};border:3px solid #120a05;box-shadow:inset 0 4px 6px rgba(0,0,0,.5);z-index:3"></div>
      <div style="position:absolute;left:${cx - d / 2}px;top:${y(k) - d / 2 + (s === 'todo' ? -2 : s === 'now' ? 1 : 3)}px;width:${d}px;height:${d}px;border-radius:50%;background:${face};border:3px solid #120a05;box-shadow:${sh};z-index:4;display:flex;align-items:center;justify-content:center;gap:3px">${numTxt(c, k, 24, s === 'todo' && boss ? '#ffd0bf' : '#2b1a12')}</div>`;
  }
  return { H, yc: y, noFire: true, html: h + ch(c, cx + 46, y(f) - 34, 50, 7) };
}

// 45. Panel z nagłówkiem i przyciskami drzwi: bossowie to czerwone przyciski alarmowe, na dole symbole otwórz/zamknij
function b45(c) {
  const { n, f, W } = c, P = 58, TOP = topFor(c, 100, n, P, 150), H = TOP + n * P + 150, y = k => TOP + (n - k) * P + 30, cx = W / 2 - 12;
  let h = fireFor(c, H, y) + panelBg(cx - 46, y(n) - 70, 92, y(1) - y(n) + 190, 14);
  h += `<div style="position:absolute;left:${cx - 40}px;width:80px;top:${y(n) - 58}px;height:22px;border-radius:5px;background:#120a05;color:#d9a24a;font:800 12px/22px var(--display);letter-spacing:.2em;text-align:center;z-index:4">PIĘTRA</div>`;
  for (let k = 1; k <= n; k++) {
    if (c.boss(k)) {
      const s = st(c, k), col = s === 'todo' ? '#5a1a10' : '#e4572e';
      h += `<div style="position:absolute;left:${cx - 25}px;top:${y(k) - 25}px;width:50px;height:50px;border-radius:12px;background:${col};border:4px solid #120a05;box-shadow:${s === 'todo' ? 'inset 0 -4px 0 rgba(0,0,0,.4)' : '0 0 18px #e4572e,inset 0 -4px 0 rgba(0,0,0,.25)'};z-index:4;display:flex;align-items:center;justify-content:center;gap:3px;outline:3px solid ${s === 'todo' ? '#7a5a2a' : '#ffd23f'};outline-offset:2px">${numTxt(c, k, 22, s === 'todo' ? '#c98a7a' : '#fff2e8')}</div>`;
    } else h += rbtn(c, k, cx, y(k), 38);
  }
  const by = y(1) + 66;
  h += [-1, 1].map(sx => `<div style="position:absolute;left:${cx + sx * 22 - 16}px;top:${by - 14}px;width:32px;height:28px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#8a6a3a,#4a3418);border:3px solid #120a05;z-index:4;display:flex;align-items:center;justify-content:center;font:800 12px var(--display);color:#ffe9a8">${sx < 0 ? '▶◀' : '◀▶'}</div>`).join('');
  return { H, yc: y, noFire: true, html: h + ch(c, cx + 50, y(f) - 30, 50, 7) };
}

// 46. Guziki wezwania ze strzałkami: po lewej numer wygrawerowany w płytce, po prawej trójkątny przycisk
function b46(c) {
  const { n, f, W } = c, P = 58, TOP = topFor(c, 80, n, P, 110), H = TOP + n * P + 110, y = k => TOP + (n - k) * P + 30, nx = 18, ax = 76;
  let h = fireFor(c, H, y) + panelBg(10, y(n) - 36, 118, y(1) - y(n) + 72, 12);
  for (let k = 1; k <= n; k++) {
    const s = st(c, k), boss = c.boss(k), col = boss ? (s === 'todo' ? '#5a1a10' : '#e4572e') : s === 'todo' ? '#4a3a28' : s === 'now' ? '#fff2c0' : '#ffb347';
    h += `<div style="position:absolute;left:${nx}px;top:${y(k) - 15}px;width:50px;height:30px;border-radius:5px;background:#120a05;display:flex;align-items:center;justify-content:center;gap:3px;z-index:4;box-shadow:inset 0 0 0 2px #6a4a1c">${numTxt(c, k, 20, s === 'todo' ? '#8a7a62' : '#ffd98a')}</div>`;
    h += `<div style="position:absolute;left:${ax - 2}px;top:${y(k) - 22}px;width:54px;height:46px;background:#120a05;clip-path:polygon(50% 0,100% 100%,0 100%);z-index:3"></div><div style="position:absolute;left:${ax + 3}px;top:${y(k) - 14}px;width:44px;height:36px;background:${col};clip-path:polygon(50% 0,100% 100%,0 100%);z-index:4;filter:${s === 'todo' ? 'none' : 'brightness(1.05)'}"></div>`;
    if (s !== 'todo') h += `<div style="position:absolute;left:${ax - 4}px;top:${y(k) - 24}px;width:58px;height:50px;background:${col};opacity:.35;filter:blur(8px);clip-path:polygon(50% 0,100% 100%,0 100%);z-index:2"></div>`;
  }
  return { H, yc: y, noFire: true, html: h + ch(c, 132, y(f) - 28, 48, 7) };
}

// 47. Wyświetlacz pięter: czerwony cyfrowy wskaźnik przypięty u góry paska, pod nim kolumna małych guzików
function b47(c) {
  const { n, f, W } = c, P = 46, TOP = topFor(c, 110, n, P, 100), H = TOP + n * P + 100, y = k => TOP + (n - k) * P + 24, cx = W / 2 - 12;
  let h = fireFor(c, H, y) + panelBg(cx - 30, y(n) - 30, 60, y(1) - y(n) + 60, 14);
  for (let k = 1; k <= n; k++) h += rbtn(c, k, cx, y(k), 30, { fs: .52 });
  const overlay = `<div style="position:absolute;left:12px;right:12px;top:10px;height:70px;border-radius:10px;background:#0a0402;border:4px solid #120a05;box-shadow:inset 0 0 0 2px #8a6a2a,0 4px 0 #0a0502,inset 0 0 20px rgba(255,60,30,.2);z-index:20;display:flex;align-items:center;justify-content:center;gap:10px"><span style="font:800 40px/1 'Special Elite',var(--mono);color:#ff4a2a;text-shadow:0 0 12px #ff3a1a,0 0 2px #ffb199;letter-spacing:.06em">${String(f).padStart(2, '0')}</span><span style="display:flex;flex-direction:column;align-items:flex-start;gap:2px"><i style="font:800 18px/1 var(--display);font-style:normal;color:#ff4a2a;text-shadow:0 0 8px #ff3a1a">▲</i><i style="font:700 10px/1 var(--mono);font-style:normal;color:#b8321c;letter-spacing:.1em">/${n}</i></span></div>`;
  return { H, yc: y, noFire: true, overlay, html: h + ch(c, cx + 34, y(f) - 28, 46, 7) };
}

// 48. Kopułkowe lampki: szklane kopułki z odblaskiem na ćwiekowanej płycie, zaliczone żarzą się bursztynem
function b48(c) {
  const { n, f, W } = c, P = 62, TOP = topFor(c, 82, n, P, 110), H = TOP + n * P + 110, y = k => TOP + (n - k) * P + 32, cx = W / 2 - 14, d = 46;
  let h = fireFor(c, H, y) + panelBg(cx - 40, y(n) - 40, 80, y(1) - y(n) + 80);
  for (let k = 1; k <= n; k++) {
    const s = st(c, k), boss = c.boss(k);
    const glass = boss ? (s === 'todo' ? 'radial-gradient(circle at 35% 30%,#8a3a2a,#2a0a06)' : 'radial-gradient(circle at 40% 35%,#ffb199,#e4572e 55%,#8a2010)') : s === 'todo' ? 'radial-gradient(circle at 35% 30%,#5a4a38,#1a1008)' : s === 'now' ? 'radial-gradient(circle at 40% 35%,#fff,#fff2c0 45%,#ffb347)' : 'radial-gradient(circle at 40% 35%,#fff2c0,#ffb347 50%,#c2661a)';
    h += `<div style="position:absolute;left:${cx - d / 2 - 6}px;top:${y(k) - d / 2 - 6}px;width:${d + 12}px;height:${d + 12}px;border-radius:50%;background:${BRASS};border:3px solid #120a05;z-index:3"></div>
      <div style="position:absolute;left:${cx - d / 2}px;top:${y(k) - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;background:${glass};border:2px solid #120a05;box-shadow:${s === 'todo' ? 'inset 0 0 10px #000' : `0 0 ${s === 'now' ? 26 : 16}px ${s === 'now' ? '#ffd666' : '#ff8c2b'},inset 0 -6px 10px rgba(180,60,0,.35)`};z-index:4;display:flex;align-items:center;justify-content:center;gap:2px;overflow:hidden">${numTxt(c, k, 22, s === 'todo' ? '#7a6a52' : '#2b1a12')}<i style="position:absolute;left:7px;top:5px;width:18px;height:10px;border-radius:50%;background:rgba(255,255,255,.45);transform:rotate(-25deg)"></i></div>`;
    for (const [rx, ry] of [[-34, -30], [34, -30], [-34, 30], [34, 30]]) h += `<i style="position:absolute;left:${cx + rx - 2}px;top:${y(k) + ry - 2}px;width:5px;height:5px;border-radius:50%;background:#d9a24a;border:1px solid #120a05;z-index:3;opacity:${ry < 0 ? 0 : .8}"></i>`;
  }
  return { H, yc: y, noFire: true, html: h + ch(c, cx + 44, y(f) - 30, 50, 7) };
}

// 49. Panel dotykowy: cienkie neonowe pierścienie bez płyty, bieżące piętro to wypełniona tarcza z kurczakiem
function b49(c) {
  const { n, f, W } = c, P = 58, TOP = topFor(c, 80, n, P, 110), H = TOP + n * P + 110, y = k => TOP + (n - k) * P + 30, cx = W / 2 - 8;
  let h = fireFor(c, H, y) + `<div style="position:absolute;left:${cx - 1}px;width:2px;top:${y(n)}px;height:${y(1) - y(n)}px;background:repeating-linear-gradient(#5a4a30 0 6px,transparent 6px 12px);z-index:2"></div>`;
  for (let k = 1; k <= n; k++) {
    const s = st(c, k), boss = c.boss(k), d = s === 'now' ? 58 : 44, col = boss ? '#e4572e' : '#ffb347';
    h += `<div style="position:absolute;left:${cx - d / 2}px;top:${y(k) - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;background:${s === 'now' ? 'radial-gradient(#4a3418,#1a0f08)' : 'rgba(15,9,5,.82)'};border:${s === 'now' ? 4 : 3}px solid ${s === 'todo' ? '#4a3a28' : s === 'now' ? '#fff2c0' : col};box-shadow:${s === 'todo' ? 'none' : `0 0 ${s === 'now' ? 24 : 14}px ${s === 'now' ? '#ffd666' : col},inset 0 0 12px ${col}66`};z-index:4;display:flex;align-items:center;justify-content:center;gap:2px;overflow:hidden">${s === 'now' ? `<span style="width:${d - 6}px;height:${d - 6}px;display:block;margin-top:3px">${c.chickSvg}</span>` : numTxt(c, k, 20, s === 'todo' ? '#7a6a52' : boss ? '#ffb199' : '#ffd98a')}</div>`;
  }
  return { H, yc: y, noFire: true, html: h + `<b style="position:absolute;left:${cx + 34}px;top:${y(f) - 14}px;font:800 30px/1 var(--display);color:#fff2c0;text-shadow:0 0 14px #ffd666,0 2px 0 #120a05;z-index:8">${f}</b>` };
}

// 50. Panel z opisami stref: guziki z grawerowanymi napisami po prawej i mosiężnymi belkami "STREFA" między grupami
function b50(c) {
  const { n, f, W } = c, P = 66, TOP = topFor(c, 90, n, P, 110), H = TOP + n * P + 110, y = k => TOP + (n - k) * P + 30, bx = 38;
  let h = fireFor(c, H, y) + panelBg(8, y(n) - 40, W - 16, y(1) - y(n) + 80, 12);
  for (let k = 1; k <= n; k++) {
    const s = st(c, k), z = c.zone(k);
    if (k > 1 && z !== c.zone(k - 1)) h += `<div style="position:absolute;left:16px;right:16px;top:${y(k) + P / 2 - 11}px;height:22px;background:linear-gradient(#d9a24a,#8a5f22);border:3px solid #120a05;border-radius:4px;color:#2b1a12;font:800 12px/16px var(--display);letter-spacing:.22em;text-align:center;z-index:4">STREFA ${['I', 'II', 'III'][z]}</div>`;
    h += rbtn(c, k, bx, y(k), 36);
    h += `<div style="position:absolute;left:${bx + 32}px;top:${y(k) - 11}px;width:${W - bx - 48}px;height:22px;border-radius:4px;background:#120a05;color:${s === 'todo' ? '#6a5a42' : '#ffd98a'};font:700 11px/22px var(--mono);letter-spacing:.14em;padding-left:8px;z-index:4;box-shadow:inset 0 0 0 2px #4a3418">${c.boss(k) ? 'BOSS' : s === 'done' ? 'ZALICZONE' : s === 'now' ? 'JESTEŚ TU' : 'PIĘTRO ' + k}</div>`;
  }
  return { H, yc: y, noFire: true, html: h + ch(c, W - 62, y(f) - 52, 46, 7) };
}

export const VARIANTS = [
  { id: 'cieple-schody', name: 'Ciepłe schody', build: b1, desc: 'Ten sam zygzak, ale drewno, mosiądz i pasy ostrzegawcze zamiast zimnej stali.' },
  { id: 'neonowy-tor', name: 'Neonowy tor', build: b2, desc: 'Świecąca szyna z tabliczkami pięter i okrągłym awatarem kurczaka, jak listy w nowym ekranie startowym.' },
  { id: 'szyb-windy', name: 'Szyb windy', build: b3, desc: 'Drzwi pięter, kabina z kurczakiem zjeżdża po linie. Zaliczone drzwi są otwarte.' },
  { id: 'wieza-garnkow', name: 'Wieża garnków', build: b4, desc: 'Piętra to przedziały garnka, które zalewa rosół. Kurczak pływa w bieżącym.' },
  { id: 'spirala', name: 'Spirala', build: b5, desc: 'Kręcone schody wokół słupa, widok od frontu. Tabliczki na słupie, korona na szczycie.' },
  { id: 'drabina-pozarowa', name: 'Drabina pożarowa', build: b6, desc: 'Pionowa drabina w kolorach bezpieczeństwa, platformy co piętro i tablice po bokach.' },
  { id: 'termometr', name: 'Termometr', build: b7, desc: 'Rtęć rośnie z piętrem, kurczak jedzie na jej szczycie. Skala z numerami i bossami.' },
  { id: 'karty-dostepu', name: 'Karty dostępu', build: b8, desc: 'Stos przepustek korporacyjnych. Zaliczone mają pieczątkę, bieżąca wysuwa się ze zdjęciem kurczaka.' },
  { id: 'przekroj-fabryki', name: 'Przekrój fabryki', build: b9, desc: 'Budynek w przekroju: pokoje z rekwizytami stref (chłodnia, kotłownia, zarząd), komin z parą.' },
  { id: 'izometria', name: 'Izometryczne płyty', build: b10, desc: 'Piętra jako klocki 3D połączone stopniami, wspinaczka po przekątnej.' },
  { id: 'karty-na-scianie', name: 'Karty na ścianie klatki', build: b11, desc: 'Drewniany zygzak z wariantu 1, a przepustki z wariantu 8 wiszą na ścianie przy podestach.' },
  { id: 'karty-podesty', name: 'Karty-podesty', build: b12, desc: 'Podesty to same przepustki, połączone krótkimi drewnianymi biegami.' },
  { id: 'duza-przepustka', name: 'Duża przepustka kurczaka', build: b13, desc: 'Drewniane schody, a bieżące piętro to wielka karta ze zdjęciem kurczaka na smyczy.' },
  { id: 'karty-na-tle-schodow', name: 'Karty na tle schodów', build: b14, desc: 'Przygaszone schody w tle, a przed nimi stos przepustek z pieczątkami.' },
  { id: 'schodkowy-stos', name: 'Schodkowy stos', build: b15, desc: 'Karty ułożone ukośnie w schodki, pod każdą drewniany podstopień.' },
  { id: 'tablica-z-kluczami', name: 'Tablica z kluczami', build: b16, desc: 'Deski, mosiężne haczyki i przepustki na sznurkach, jak w recepcji.' },
  { id: 'gablota', name: 'Gablota', build: b17, desc: 'Przepustki w oszklonych niszach w drewnianej ramie, z mosiężnymi śrubami.' },
  { id: 'kartoteka', name: 'Kartoteka', build: b18, desc: 'Teczki z zakładkami na przemian po lewej i prawej, bieżąca wysunięta.' },
  { id: 'spirala-kart', name: 'Spirala kart', build: b19, desc: 'Drewniane kręcone stopnie wokół słupa, na słupie przepustki zamiast tabliczek.' },
  { id: 'schody-i-pasek-kart', name: 'Schody i pasek kart', build: b20, desc: 'Po lewej wąski stos przepustek, po prawej drewniany zygzak.' },
  { id: 'klatka-z-tablica-kluczy', name: 'Klatka z tablicą kluczy', build: b21, desc: 'Po lewej wąska deska z haczykami i kartami, po prawej drewniane schody.' },
  { id: 'karty-na-sznurkach', name: 'Karty na sznurkach przy schodach', build: b22, desc: 'Przepustki wiszą na mosiężnych haczykach na ścianie klatki, kołyszą się lekko.' },
  { id: 'deska-ze-schodami', name: 'Deska ze schodami w tle', build: b23, desc: 'Deski jak w tablicy kluczy, przygaszone schody w tle, karty na haczykach.' },
  { id: 'zygzak-na-tablicy', name: 'Zygzak na tablicy', build: b24, desc: 'Karty wiszą na przemian po lewej i prawej, łączy je mosiężny łańcuszek.' },
  { id: 'szafka-na-klucze', name: 'Szafka na klucze', build: b25, desc: 'Przegródki jak w recepcji, z kartą wystającą z każdej.' },
  { id: 'sznur-z-klamerkami', name: 'Sznur z klamerkami', build: b26, desc: 'Wzdłuż biegów schodów biegnie sznur, a karty wiszą na klamerkach.' },
  { id: 'ramki-na-scianie', name: 'Ramki na ścianie', build: b27, desc: 'Przepustki w mosiężnych ramkach na sznurku, obok drewniane schody.' },
  { id: 'tablica-i-mini-schody', name: 'Tablica i mini-schody', build: b28, desc: 'Szerokie karty na haczykach po lewej, po prawej zygzak jak linijka postępu.' },
  { id: 'drabina-z-kartami', name: 'Drabina z kartami', build: b29, desc: 'Drewniana drabina pośrodku, karty wiszą z jej szczebli na przemian po bokach.' },
  { id: 'regal-z-kartami', name: 'Regał z kartami', build: b30, desc: 'Drewniane półki, na każdej stoi przepustka oparta o deskę.' },
  { id: 'mosiezne-tabliczki', name: 'Mosiężne tabliczki', build: b31, desc: 'Drewniane schody z lampami na ścianie i przykręconymi, wygrawerowanymi tabliczkami pięter.' },
  { id: 'wskaznik-windy', name: 'Wskaźnik pięter windy', build: b32, desc: 'Mosiężne oprawy z lampkami jak w starej windzie: zaliczone świecą, bieżąca żarzy się.' },
  { id: 'girlanda-lampionow', name: 'Girlanda lampionów', build: b33, desc: 'Sznur zygzakiem, papierowe lampiony zapalają się po kolei, boss jest czerwony.' },
  { id: 'pieczecie-woskowe', name: 'Pieczęcie woskowe', build: b34, desc: 'Pergamin ze sznurkiem, każde piętro to odciśnięta pieczęć, przyszłe to puste kółka.' },
  { id: 'waskotorowka', name: 'Wąskotorówka', build: b35, desc: 'Szyny z drewnianymi podkładami z numerami, a kurczak wyziera z wagonika.' },
  { id: 'wieza-ze-skrzyn', name: 'Wieża ze skrzyń', build: b36, desc: 'Magazynowe skrzynie z numerami malowanymi szablonem, zaliczone z odciskiem OK.' },
  { id: 'rurociag-z-zaworami', name: 'Rurociąg z zaworami', build: b37, desc: 'Mosiężna rura nagrzewa się od dołu, na każdym piętrze manometr z numerem.' },
  { id: 'kalendarz-adwentowy', name: 'Kalendarz adwentowy', build: b38, desc: 'Drewniane drzwiczki z numerami w dwóch kolumnach, wężykiem od dołu, otwarte świecą.' },
  { id: 'regal-z-garnkami', name: 'Regał z garnkami', build: b39, desc: 'Półki z garnkami: zaliczone pełne rosołu z parą, w bieżącym kurczak wygląda z zupy.' },
  { id: 'schody-z-dywanem', name: 'Schody z dywanem', build: b40, desc: 'Reprezentacyjna klatka: czerwony chodnik, mosiężne pręty i złocone numery piętra na ścianie.' },
  { id: 'guziki-panel', name: 'Panel okrągłych guzików', build: b41, desc: 'Kolumna guzików w mosiężnej płycie z podświetlanymi pierścieniami. Ogień rośnie od dołu do bieżącego guzika.' },
  { id: 'guziki-dwie-kolumny', name: 'Dwie kolumny jak w windzie', build: b42, desc: '1 i 2 na dole, wyżej kolejne pary. Kurczak jest na bieżącym guziku, ogień sięga do jego rzędu.' },
  { id: 'guziki-braille', name: 'Prostokątne guziki z brajlem', build: b43, desc: 'Szerokie klawisze z punktami Braille\'a, bieżący ze zdjęciem kurczaka, ogień pod zaliczonymi.' },
  { id: 'guziki-wcisniete', name: 'Wciśnięte i niewciśnięte', build: b44, desc: 'Zaliczone guziki są wdrapane w płytę i świecą, kolejne wystają, bieżący w połowie wciśnięty.' },
  { id: 'guziki-alarm', name: 'Panel z alarmami bossów', build: b45, desc: 'Nagłówek PIĘTRA, czerwone przyciski alarmowe dla bossów i symbole otwórz/zamknij na dole.' },
  { id: 'guziki-strzalki', name: 'Guziki wezwania ze strzałkami', build: b46, desc: 'Numer w wygrawerowanej płytce i trójkątny przycisk obok, świecący jak strzałka wezwania windy.' },
  { id: 'guziki-wyswietlacz', name: 'Wyświetlacz pięter', build: b47, desc: 'Czerwony cyfrowy wskaźnik przypięty u góry, pod nim kolumna małych guzików.' },
  { id: 'guziki-kopulki', name: 'Kopułkowe lampki', build: b48, desc: 'Szklane kopułki z odblaskiem na ćwiekowanej płycie, zaliczone żarzą się bursztynem.' },
  { id: 'guziki-neon', name: 'Panel dotykowy', build: b49, desc: 'Cienkie neonowe pierścienie bez płyty, bieżące piętro to tarcza z kurczakiem.' },
  { id: 'guziki-strefy', name: 'Panel z opisami stref', build: b50, desc: 'Guziki z grawerowanymi napisami (ZALICZONE, JESTEŚ TU, BOSS) i belkami STREFA między grupami.' },
];

let styled = false;
export function mountTower(host, v, { mode = 'full', f = 8, char = 'pyrtek', form = 'pyrtek' } = {}) {
  if (!styled) { const el = document.createElement('style'); el.textContent = BASE_CSS; document.head.appendChild(el); styled = true; }
  const M = D.MODES[mode], n = M.rounds;
  host.className = 'tower'; host.style.cssText = 'padding:0;overflow:hidden;position:relative;background:#150d08';
  const W = host.clientWidth, vpH = host.clientHeight;
  const c = { n, f: Math.min(f, n), W, vpH, mode, zone: k => zoneOf(mode, k), boss: k => !!M.bosses[k], skull: () => art.skullIcon('vt-sk'), chickSvg: art.portrait(char, form) };
  const r = v.build(c), cam = Math.max(0, Math.min(r.H - vpH, r.yc(c.f) - vpH * .62)), heat = n > 1 ? (c.f - 1) / (n - 1) : 1;
  host.innerHTML = `<div class="vt vt-${v.id}"><div class="vt-in" style="height:${r.H}px;transform:translateY(${-cam}px)">${r.html}</div><div class="vt-fog"></div>${r.noFire ? '' : `<div class="vt-fire" style="height:${34 + heat * 80}px">${art.flamesArt()}</div>`}${r.overlay || ''}</div>`;
}
