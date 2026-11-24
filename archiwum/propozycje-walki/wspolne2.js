// Runda 2: tło tarasu z D, jednostki z nową plakietką HP, kafelki skilli, Kukurydziany Grad.
import * as art from '../../art.js';
import * as D from '../../shared/data.js';

export const tileOf = skill => D.TILES.find(t => t.skill === skill);
export const icon = skill => art.tileIcon(tileOf(skill).id);
export const sname = skill => D.SKILLS[skill].name;
export const hero = () => art.heroArt('pyrtek', 'pyrtek');
export const foe = key => art.enemyArt(key);
export const sti = k => art.statusIcon(k);
export const st = (k, n) => `<span>${sti(k)}${n}</span>`;

// jednostka z nową plakietką: opts.seg = ile HP na kreskę, opts.mark = % znacznika fazy
export function unit({ id = '', cls = 'enemy', x, bottom, w, name, sub = '', hp, max, svg, sts = '', pw, nf, bh, hf, seg, mark }) {
  const p = Math.max(0, Math.min(100, hp / max * 100));
  const style = [pw ? `--pw:${pw}vh` : '', nf ? `--nf:${nf}vh` : '', bh ? `--bh:${bh}vh` : '', hf ? `--hf:${hf}vh` : ''].join(';');
  const segStyle = seg ? `--seg:${100 / (max / seg)}%` : '';
  return `<div class="unit ${cls}" id="${id}" style="left:${x}%;bottom:${bottom}vh;width:${w}vh">
    <div class="pl ${cls === 'hero' ? 'me' : ''}" style="${style}"><div class="nm">${name}</div>${sub ? `<div class="sub">${sub}</div>` : ''}
      <div class="hp ${seg ? 'seg' : ''}" style="--p:${p};${segStyle}"><i></i>${mark ? `<u class="mark" style="left:${mark}%"></u>` : ''}<b>${hp} / ${max}</b></div>
      ${sts ? `<div class="sts">${sts}</div>` : ''}</div>
    <div class="shadow"></div><div class="sprite">${svg}</div></div>`;
}

export function topbar(floor, zone, boss = false) {
  return `<div class="top"><div class="l"><span class="chip ${boss ? 'boss' : ''}">Piętro ${floor}${boss ? ' · BOSS' : ''} · ${zone}</span><span class="chip">Pyrtek · Palnik 2</span></div>
    <div class="timer"><span>0:21</span><u><i></i></u></div><div class="r"><b>Księga K</b><b>Pauza P</b></div></div>`;
}

// tło: taras na dachu (jak w D)
export function bgTaras() {
  const W = 1920, H = 1080, HOR = 520;
  let s = 5; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647 };
  let sky = ''; for (let i = 0; i < 34; i++) { const x = i * 60 - 30, h = 60 + rnd() * 200, w = 36 + rnd() * 40; sky += `<rect x="${x}" y="${HOR + 40 - h}" width="${w}" height="${h}" fill="${rnd() < .5 ? '#5a3a6e' : '#6b4580'}" opacity=".9"/>`;
    for (let j = 0; j < h / 20; j++) if (rnd() < .3) sky += `<rect x="${x + 5 + (j % 3) * 10}" y="${HOR + 40 - h + 8 + j * 16}" width="5" height="7" fill="#ffd98a" opacity=".9"/>`; }
  let deck = ''; for (let i = -14; i <= 14; i++) deck += `<line x1="960" y1="${HOR + 10}" x2="${960 + i * 280}" y2="${H}" stroke="#2b2433" stroke-opacity=".35" stroke-width="2"/>`;
  for (let i = 0; i < 12; i++) { const y = HOR + 10 + Math.pow(i / 11, 2) * (H - HOR); deck += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#2b2433" stroke-opacity=".3" stroke-width="2"/>`; }
  const mast = (x, h) => `<g><rect x="${x - 5}" y="${HOR - h}" width="10" height="${h}" fill="#2a2233"/><circle cx="${x}" cy="${HOR - h}" r="9" fill="#ff3d3d"><animate attributeName="opacity" values="1;.2;1" dur="1.4s" repeatCount="indefinite"/></circle><path d="M${x - 40} ${HOR - h * .6} L${x} ${HOR - h * .9} L${x + 40} ${HOR - h * .6}" stroke="#2a2233" stroke-width="4" fill="none"/></g>`;
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>
 <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a7a"/><stop offset=".45" stop-color="#b9548c"/><stop offset=".8" stop-color="#ff9a6a"/><stop offset="1" stop-color="#ffd08a"/></linearGradient>
 <linearGradient id="dk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4d4658"/><stop offset="1" stop-color="#2a2433"/></linearGradient>
 <radialGradient id="sun"><stop offset="0" stop-color="#fff2c0"/><stop offset=".4" stop-color="#ffc66a" stop-opacity=".8"/><stop offset="1" stop-color="#ff9a6a" stop-opacity="0"/></radialGradient></defs>
 <rect width="${W}" height="${HOR + 20}" fill="url(#sk)"/><circle cx="1180" cy="${HOR - 40}" r="340" fill="url(#sun)"/>
 ${[...Array(40)].map(() => `<circle cx="${rnd() * W}" cy="${rnd() * 260}" r="${.6 + rnd() * 1.4}" fill="#fff" opacity="${.3 + rnd() * .5}"/>`).join('')}
 ${sky}${mast(220, 330)}${mast(1700, 280)}
 <rect y="${HOR + 10}" width="${W}" height="${H - HOR - 10}" fill="url(#dk)"/>${deck}
 <ellipse cx="960" cy="820" rx="560" ry="140" fill="#3a3342" stroke="#e8e0cf" stroke-width="6"/><ellipse cx="960" cy="820" rx="480" ry="114" fill="none" stroke="#e8e0cf" stroke-width="4" stroke-dasharray="30 22" opacity=".8"/>
 <rect y="${HOR - 4}" width="${W}" height="16" fill="#1d1824"/>
 ${[...Array(33)].map((_, i) => `<rect x="${i * 60}" y="${HOR - 60}" width="4" height="64" fill="#cfe3f0" opacity=".7"/>`).join('')}
 <rect y="${HOR - 62}" width="${W}" height="6" fill="#e8f2f8" opacity=".85"/>
 <g transform="translate(960 330)"><rect x="-300" y="-60" width="600" height="110" rx="12" fill="#1d1824" opacity=".55" stroke="#e8e0cf" stroke-width="3"/>
 <text x="0" y="14" text-anchor="middle" font-family="Baloo 2,Impact" font-weight="800" font-size="74" letter-spacing="10" fill="#fff2d0" opacity=".9">ROSOŁEX</text></g></svg>`;
}
export const clouds = () => `<div class="cloud" style="left:8%;top:24%;width:34vh;height:4vh;animation-delay:-2s;opacity:.55"></div><div class="cloud" style="left:66%;top:16%;width:44vh;height:4.5vh;animation-delay:-5s;opacity:.45"></div>`;

// Kukurydziany Grad: targets = [[x%, y%, napis]]
export function gradFx(targets) {
  const ks = [0, 1, 2, 0, 1].map((_, i) => i % targets.length);
  let fx = ''; const dl = [0, .07, .14, .22, .30];
  ks.forEach((t, i) => { const [tx, ty] = targets[t]; fx += `<i class="kern" style="--sx:${tx - 26 - i * 3}%;--sy:-6%;--tx:${tx + (i % 2 ? 2 : -2)}%;--ty:${ty + (i % 3) * 2}%;--rot:${-62 + i * 3}deg;animation-delay:${dl[i]}s"></i>`; });
  const star = `<svg viewBox="0 0 100 100">${[...Array(10)].map((_, i) => { const a = i / 10 * Math.PI * 2, l = i % 2 ? 32 : 48; return `<polygon points="${50 + Math.cos(a - .2) * 8},${50 + Math.sin(a - .2) * 8} ${50 + Math.cos(a) * l},${50 + Math.sin(a) * l} ${50 + Math.cos(a + .2) * 8},${50 + Math.sin(a + .2) * 8}" fill="${i % 2 ? '#ffd23f' : '#fff8d0'}"/>` }).join('')}<circle cx="50" cy="50" r="9" fill="#fff"/></svg>`;
  targets.forEach(([x, y, txt], i) => { fx += `<div class="spark" style="left:${x}%;top:${y + 4}%;animation-delay:${i * .06}s">${star}</div><div class="dmg" style="left:${x + 4}%;top:${y + 8}%;animation-delay:${i * .06}s">${txt}</div>`; });
  return fx;
}

// kafelki skilli. variant: 'a' (szerokie, jak D), 'b' (kompaktowe pionowe), 'c' (szerokie z licznikiem sekund)
const R = 36, L = 2 * Math.PI * R;
export function kpis(variant, items) {
  return items.map((it, i) => {
    const n = i + 1, off = it.state === 'used' ? 0 : it.state === 'ready' ? 0 : L * (1 - it.fill);
    const cls = `kpi k${n} ${it.state === 'used' ? 'used' : ''} ${it.state === 'ready' ? 'ready' : ''}`;
    const gauge = (sz, ic) => `<div class="gauge" style="width:${sz}vh;height:${sz}vh"><svg class="g" viewBox="0 0 90 90"><circle class="trk" cx="45" cy="45" r="${R}"/><circle class="val" cx="45" cy="45" r="${R}" style="--len:${L};--off:${off}"/></svg><div class="ic" style="inset:${ic}vh">${icon(it.skill)}</div></div>`;
    if (variant === 'b') return `<div class="${cls}" style="width:19vh;height:18.5vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.7vh;padding-top:.4vh"><div class="ripple"></div><div class="k" style="left:1.2vh;top:1.2vh">${n}</div>${gauge(10.4, 1.4)}<div class="nm" style="--knf:1.9vh;text-align:center">${sname(it.skill)}</div><div class="st" style="margin-top:0">${it.text}</div></div>`;
    if (variant === 'c') return `<div class="${cls}" style="width:30vh;height:13.4vh;display:flex;align-items:center;gap:1.8vh;padding:0 2vh"><div class="ripple"></div><div class="k" style="right:1.4vh;top:1.2vh">${n}</div>${gauge(9.4, 1.3)}<div style="min-width:0"><div class="nm">${sname(it.skill)}</div><div class="st" style="font-size:2vh;margin-top:.5vh">${it.text}</div></div></div>`;
    return `<div class="${cls}" style="width:29vh;height:13.2vh;display:flex;align-items:center;gap:1.8vh;padding:0 2vh"><div class="ripple"></div><div class="k" style="right:1.4vh;top:1.2vh">${n}</div>${gauge(9, 1.3)}<div style="min-width:0"><div class="nm">${sname(it.skill)}</div><div class="st">${it.text}</div></div></div>`;
  }).join('');
}

export function freezeAt() {
  const t = new URLSearchParams(location.search).get('t'); if (t == null) return;
  const apply = () => document.getAnimations().forEach(a => { a.pause(); a.currentTime = +t; });
  apply(); setTimeout(apply, 50);
}
