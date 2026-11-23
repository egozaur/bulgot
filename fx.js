// Bulgot: animacje umiejętności na ekranie walki. WYŁĄCZNIE obraz: nic tu nie dotyka silnika ani wejść (powtórka na serwerze jej nie widzi).
// Każda umiejętność ma własną recepturę (RECIPES[id]) złożoną z kilku prymitywów: fly (lot pocisku), burst (wybuch), rise (cząstki w górę),
// floorRing (fala po podłodze), slash (cięcia), bolt (piorun), flash (błysk ekranu), aura (klasa CSS na bohaterze na czas działania).
// Receptura dostaje kontekst c i zwraca { base, step } = po ilu ms ma się pokazać trafienie (liczba, błysk, wstrząs), żeby obraz zgrał się z lotem.
const NS = 'http://www.w3.org/2000/svg';
const R = Math.random;   // tylko obraz; silnik używa własnego, deterministycznego rng

// kolor akcentu kafelka i pierścienia cooldownu
export const SK_COLOR = {
  grad: '#ffd23f', pianie: '#ffb347', granat: '#ffe08a', dziobniecie: '#ff7a8a', unik: '#cfe3f0', zagrzebanie: '#d9b45a', chlust: '#ff9a4d', lodowy: '#7fe0ff', zgnile: '#b5e37a', kontra: '#ffd23f',
  darcie: '#ff7a8a', kapiel: '#d7b36a', premia: '#c9b6ff', egzekucja: '#ff5a5a', wrzatek: '#ffb347', podpalka: '#ff7a3d', powiew: '#bfeaff', sopel: '#7fe0ff', zakwas: '#b5e37a', pazury: '#ff7a8a',
  wir: '#ffe08a', garsc: '#ffd23f', zwolnienie: '#c9b6ff', pogotowie: '#7dff9f',
  fala: '#ff9a4d', lawina: '#c9b6ff', zwarcie: '#ffe36a', dziobanie: '#ff7a8a', niespodzianka: '#ffe08a', wypowiedzenie: '#ff7a8a', audyt: '#c9b6ff', bonus: '#ffd23f', ostateczny: '#ff7a3d', zamrazarka: '#7fe0ff',
  spotkanie: '#c9b6ff', wicher: '#cfe3f0', pulapka: '#d7b36a', tarcza: '#8fd0ff', kawa: '#d9a066', zemsta: '#ff7a3d', zupa: '#ffb347', pobudka: '#ffd23f', echo: '#9fd8ff', obieg: '#7dff9f',
};

// ---------- sprite'y (SVG w kodzie, ten sam kontur co reszta gry) ----------
const O = '#2b1a12';
const sv = (vb, inner) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
const ST = `stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
export const S = {
  shard: () => sv('0 0 90 60', `<polygon points="0,30 62,4 90,30 62,56" fill="#bfeaff" ${ST}/><polygon points="8,30 62,12 78,30" fill="#fff" opacity=".85"/><polygon points="20,30 62,48 78,30" fill="#6bc3f2" opacity=".85"/>`),
  kernel: () => sv('0 0 34 22', `<ellipse cx="17" cy="11" rx="14" ry="8.5" fill="#ffc72a" ${ST}/><ellipse cx="13" cy="8" rx="6" ry="3" fill="#fff3a0"/>`),
  egg: (f = '#fff3d6') => sv('0 0 40 50', `<path d="M20 3 C31 3 37 18 37 29 C37 40 29 47 20 47 C11 47 3 40 3 29 C3 18 9 3 20 3 Z" fill="${f}" ${ST}/><ellipse cx="14" cy="16" rx="5" ry="8" fill="#fff" opacity=".6"/>`),
  flame: () => sv('0 0 40 52', `<path d="M20 50 C6 47 4 35 12 25 C14 31 18 31 18 23 C20 13 28 11 28 1 C38 13 40 25 34 37 C32 45 28 49 20 50Z" fill="#ff9a2e" ${ST}/><path d="M20 48 C14 45 15 37 20 31 C25 37 26 45 20 48Z" fill="#ffe27a"/>`),
  drop: (c = '#ffcf5a') => sv('0 0 20 28', `<path d="M10 2 C4 12 2 16 2 19 a8 8 0 0 0 16 0 C18 16 16 12 10 2z" fill="${c}" stroke="${O}" stroke-width="2.4"/>`),
  snow: () => sv('0 0 40 40', `<path d="M20 3 v34 M5 11 l30 18 M5 29 l30 -18" stroke="${O}" stroke-width="6" stroke-linecap="round"/><path d="M20 3 v34 M5 11 l30 18 M5 29 l30 -18" stroke="#dff6ff" stroke-width="3" stroke-linecap="round"/>`),
  cross: (c = '#7dff9f') => sv('0 0 40 40', `<path d="M15 3 h10 v12 h12 v10 h-12 v12 h-10 v-12 h-12 v-10 h12 z" fill="${c}" ${ST}/>`),
  coin: () => sv('0 0 40 40', `<circle cx="20" cy="20" r="16" fill="#ffd23f" ${ST}/><circle cx="20" cy="20" r="10" fill="none" stroke="#b88a00" stroke-width="2.4"/><path d="M15 17 q5 -4 10 0 q-5 4 -10 0 M15 24 q5 4 10 0" stroke="#8a6200" stroke-width="2.2" fill="none" stroke-linecap="round"/>`),
  hay: () => sv('0 0 60 40', `<path d="M3 36 q6 -26 20 -30 M12 38 q4 -26 24 -34 M24 38 q2 -22 28 -32 M38 38 q0 -20 18 -26 M2 38 h56" stroke="#8a6a1a" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M3 36 q6 -26 20 -30 M12 38 q4 -26 24 -34 M24 38 q2 -22 28 -32 M38 38 q0 -20 18 -26" stroke="#e3b858" stroke-width="3" stroke-linecap="round" fill="none"/>`),
  feather: (c = '#fff3d6') => sv('0 0 30 60', `<path d="M15 2 C30 16 28 40 15 58 C2 40 0 16 15 2Z" fill="${c}" ${ST}/><path d="M15 6 V56" stroke="${O}" stroke-width="2"/>`),
  folder: () => sv('0 0 60 46', `<path d="M3 8 h20 l5 7 h29 v28 h-54 z" fill="#ffd23f" ${ST}/><path d="M3 16 h54 v27 h-54z" fill="#f2b81c" ${ST}/><path d="M10 26 h30" stroke="#8a6200" stroke-width="3" stroke-linecap="round"/>`),
  paper: () => sv('0 0 40 52', `<path d="M4 3 h24 l8 8 v38 h-32z" fill="#fff" ${ST}/><path d="M10 18 h20 M10 26 h20 M10 34 h14" stroke="#9aa6b2" stroke-width="2.6" stroke-linecap="round"/>`),
  star: (c = '#ffd23f') => sv('0 0 100 100', `${[...Array(10)].map((_, i) => { const a = i / 10 * Math.PI * 2, l = i % 2 ? 32 : 48; return `<polygon points="${50 + Math.cos(a - .2) * 8},${50 + Math.sin(a - .2) * 8} ${50 + Math.cos(a) * l},${50 + Math.sin(a) * l} ${50 + Math.cos(a + .2) * 8},${50 + Math.sin(a + .2) * 8}" fill="${i % 2 ? c : '#fff8d0'}"/>`; }).join('')}<circle cx="50" cy="50" r="9" fill="#fff"/>`),
  icicle: () => sv('0 0 30 100', `<polygon points="3,2 27,2 15,98" fill="#bfeaff" ${ST}/><polygon points="8,6 14,6 15,80" fill="#fff" opacity=".8"/>`),
  clock: () => sv('0 0 100 100', `<circle cx="50" cy="50" r="44" fill="#fff" ${ST}/><circle cx="50" cy="50" r="35" fill="none" stroke="#c7d0df" stroke-width="3"/><path d="M50 22 v28 l20 12" stroke="${O}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="50" r="5" fill="#d6402b"/>`),
  cup: () => sv('0 0 60 56', `<path d="M6 12 h38 v16 q0 18 -19 18 q-19 0 -19 -18 z" fill="#fff" ${ST}/><path d="M44 18 h4 q8 0 8 8 q0 8 -8 8 h-5" stroke="${O}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M10 18 h30" stroke="#8a4a1e" stroke-width="6" stroke-linecap="round"/>`),
  bowl: () => sv('0 0 70 50', `<path d="M3 16 h64 q0 28 -32 32 q-32 -4 -32 -32 z" fill="#f3ead6" ${ST}/><path d="M7 16 q28 10 56 0" fill="#ffb347" stroke="${O}" stroke-width="2.4"/><circle cx="26" cy="20" r="2.6" fill="#ff7a3d"/><circle cx="42" cy="21" r="2.2" fill="#6fcf6f"/>`),
  pot: () => sv('0 0 460 340', `<path d="M70 120 H390 V260 Q390 318 330 318 H130 Q70 318 70 260Z" fill="#aab3c4" ${ST.replace('stroke-width="3"', 'stroke-width="10"')}/><ellipse cx="230" cy="120" rx="160" ry="34" fill="#4c566b" stroke="${O}" stroke-width="10"/><ellipse cx="230" cy="122" rx="138" ry="24" fill="#e08a1c"/><ellipse cx="230" cy="120" rx="112" ry="16" fill="#ffcf5a"/><path d="M70 170 H20 Q2 170 2 188 V210 Q2 228 20 228 H70 M390 170 H440 Q458 170 458 188 V210 Q458 228 440 228 H390" fill="none" stroke="${O}" stroke-width="22" stroke-linecap="round"/><path d="M70 170 H20 Q2 170 2 188 V210 Q2 228 20 228 H70 M390 170 H440 Q458 170 458 188 V210 Q458 228 440 228 H390" fill="none" stroke="#6b3f22" stroke-width="10" stroke-linecap="round"/>`),
  trap: () => sv('0 0 80 50', `<rect x="3" y="22" width="74" height="24" rx="4" fill="#c78a4c" ${ST}/><path d="M14 30 q8 -22 28 -22" stroke="#cfd5e1" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M52 40 l8 -12 l8 12z" fill="#ffd23f" ${ST}/>`),
  magnifier: () => sv('0 0 70 70', `<circle cx="28" cy="28" r="22" fill="#bfeaff" fill-opacity=".55" ${ST}/><path d="M44 44 L64 64" stroke="${O}" stroke-width="10" stroke-linecap="round"/><path d="M44 44 L64 64" stroke="#8a5a2a" stroke-width="5" stroke-linecap="round"/>`),
  bag: () => sv('0 0 50 56', `<path d="M8 52 q-8 -26 6 -40 h22 q14 14 6 40 z" fill="#f3ead6" ${ST}/><rect x="14" y="26" width="22" height="14" rx="2" fill="#d6402b" opacity=".8"/>`),
  wave: () => sv('0 0 400 220', `<path d="M0 220 V150 q40 -90 90 -20 q40 -110 100 -10 q40 -90 90 -10 q60 -60 120 20 V220z" fill="#ffb347" ${ST.replace('stroke-width="3"', 'stroke-width="6"')}/><path d="M20 190 q60 -40 120 0 q60 -40 120 0 q60 -40 120 0" stroke="#fff3d6" stroke-width="8" fill="none" stroke-linecap="round"/>`),
  cube: () => sv('0 0 100 120', `<path d="M10 24 L60 10 L92 30 L92 100 L42 114 L10 94 Z" fill="#bfeaff" fill-opacity=".8" ${ST}/><path d="M10 24 L42 44 L92 30 M42 44 V114" stroke="${O}" stroke-width="3" fill="none"/><path d="M52 62 v34 M38 72 l28 16 M38 88 l28 -16" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`),
};

// ---------- prymitywy ----------
function mk(c, html, x, y, w, h, cls = '') {
  const d = document.createElement('div'); d.className = 'fxo ' + cls;
  d.style.cssText = `left:${x}px;top:${y}px;width:${w}px;${h ? `height:${h}px;` : ''}margin:${-(h || w) / 2}px 0 0 ${-w / 2}px`;
  d.innerHTML = html; c.L.appendChild(d); return d;
}
function anim(d, frames, o = {}, done) {
  const a = d.animate(frames, { duration: 600, fill: 'both', easing: 'ease-out', ...o });
  a.finished.then(() => { if (done) done(); d.remove(); }).catch(() => d.remove());
  return a;
}
const deg = (A, B) => Math.atan2(B.y - A.y, B.x - A.x) * 180 / Math.PI;
// lot pocisku z A do B (łuk, obrót, smuga)
function fly(c, html, A, B, o = {}) {
  const w = o.w || c.u(4), d = mk(c, (o.trail ? `<i class="tr" style="background:linear-gradient(90deg,transparent,${o.trail})"></i>` : '') + html, A.x, A.y, w, 0, 'fly');
  const dx = B.x - A.x, dy = B.y - A.y, r0 = o.spin ? 0 : (o.rot === 'aim' ? deg(A, B) : (o.rot || 0)), arc = o.arc || 0;
  const fr = [{ transform: `translate(0,0) rotate(${r0}deg) scale(.5)`, opacity: 0 }, { offset: .1, opacity: 1, transform: `translate(${dx * .08}px,${dy * .08 - arc * .5}px) rotate(${r0}deg) scale(1)` },
    { offset: .5, opacity: 1, transform: `translate(${dx * .5}px,${dy * .5 - arc}px) rotate(${o.spin ? o.spin * 180 : r0}deg) scale(1)` },
    { opacity: 1, transform: `translate(${dx}px,${dy}px) rotate(${o.spin ? o.spin * 360 : r0}deg) scale(1)` }];
  return anim(d, fr, { duration: o.ms || 400, delay: o.delay || 0, easing: o.ease || 'cubic-bezier(.3,.1,.6,1)' });
}
// wybuch w punkcie
function burst(c, html, P, o = {}) {
  const w = o.w || c.u(10), d = mk(c, html, P.x, P.y, w, 0, 'burst');
  return anim(d, [{ opacity: 0, transform: `scale(${o.s0 || .2}) rotate(${o.rot || 0}deg)` }, { offset: .25, opacity: 1, transform: `scale(1) rotate(${o.rot || 0}deg)` }, { opacity: 0, transform: `scale(${o.s1 || 1.5}) rotate(${(o.rot || 0) + (o.turn || 0)}deg)` }], { duration: o.ms || 500, delay: o.delay || 0 });
}
// pierścień na podłodze (elipsa)
function floorRing(c, P, color, o = {}) {
  const w = o.w || c.u(30), d = mk(c, '', P.x, P.y, w, w * .32, 'ring'); d.style.border = `${Math.max(2, c.u(.7))}px solid ${color}`; d.style.boxShadow = `0 0 ${c.u(3)}px ${color}, inset 0 0 ${c.u(3)}px ${color}`;
  return anim(d, [{ opacity: 0, transform: 'scale(.2)' }, { offset: .2, opacity: .95 }, { opacity: 0, transform: `scale(${o.s1 || 1.6})` }], { duration: o.ms || 700, delay: o.delay || 0 });
}
// cząstki unoszące się z punktu
function rise(c, fn, P, o = {}) {
  const n = o.n || 6;
  for (let i = 0; i < n; i++) {
    const x = P.x + (R() - .5) * (o.spread || c.u(12)), h = o.h || c.u(16), w = o.w || c.u(3.4), d = mk(c, fn(i), x, P.y + (R() - .5) * c.u(4), w, 0, 'rise');
    anim(d, [{ opacity: 0, transform: 'translateY(0) scale(.5)' }, { offset: .2, opacity: 1 }, { opacity: 0, transform: `translate(${(R() - .5) * c.u(4)}px,${-h}px) rotate(${(R() - .5) * 60}deg) scale(1)` }], { duration: (o.ms || 900) + R() * 300, delay: (o.delay || 0) + i * (o.stagger || 60) });
  }
}
// cząstki rozbryzgujące się z punktu
function spray(c, fn, P, o = {}) {
  const n = o.n || 8;
  for (let i = 0; i < n; i++) {
    const a = (o.a0 == null ? R() * Math.PI * 2 : o.a0 + (R() - .5) * (o.da || 1)), l = c.u(o.r || 10) * (.5 + R() * .8), w = o.w || c.u(2), d = mk(c, fn(i), P.x, P.y, w, 0, 'spray');
    anim(d, [{ opacity: 1, transform: 'translate(0,0) scale(.6)' }, { offset: .6, opacity: 1, transform: `translate(${Math.cos(a) * l}px,${Math.sin(a) * l - c.u(o.up || 3)}px) scale(1) rotate(${R() * 200}deg)` }, { opacity: 0, transform: `translate(${Math.cos(a) * l * 1.2}px,${Math.sin(a) * l + c.u(o.fall || 5)}px) scale(.8) rotate(${R() * 360}deg)` }], { duration: (o.ms || 700) + R() * 200, delay: o.delay || 0 });
  }
}
// cięcia (n ukośnych smug)
function slash(c, P, color, o = {}) {
  const n = o.n || 3, L = o.len || c.u(22);
  for (let i = 0; i < n; i++) {
    const d = mk(c, `<i class="sl" style="background:linear-gradient(90deg,transparent,${color} 30%,#fff 55%,${color} 75%,transparent)"></i>`, P.x + (i - (n - 1) / 2) * c.u(2.6), P.y + (i - (n - 1) / 2) * c.u(1.2), L, 0, 'slash');
    anim(d, [{ opacity: 0, transform: `rotate(${o.ang || 38}deg) scaleX(.1)` }, { offset: .3, opacity: 1, transform: `rotate(${o.ang || 38}deg) scaleX(1)` }, { opacity: 0, transform: `rotate(${o.ang || 38}deg) scaleX(1.1) translateX(${c.u(2)}px)` }], { duration: o.ms || 360, delay: (o.delay || 0) + i * 70 });
  }
}
// piorun (łamana) między punktami
function bolt(c, pts, color, o = {}) {
  const W = c.ar.clientWidth, H = c.ar.clientHeight, d = document.createElementNS(NS, 'svg'); d.setAttribute('viewBox', `0 0 ${W} ${H}`); d.setAttribute('class', 'fxo bolt'); d.style.cssText = 'left:0;top:0;width:100%;height:100%;margin:0';
  const seg = []; for (let i = 0; i < pts.length - 1; i++) { const A = pts[i], B = pts[i + 1], n = 7; seg.push(`${i ? 'L' : 'M'}${A.x} ${A.y}`); for (let k = 1; k < n; k++) { const t = k / n; seg.push(`L${A.x + (B.x - A.x) * t + (R() - .5) * c.u(5)} ${A.y + (B.y - A.y) * t + (R() - .5) * c.u(5)}`); } seg.push(`L${B.x} ${B.y}`); }
  const dd = seg.join(' ');
  d.innerHTML = `<path d="${dd}" stroke="${color}" stroke-width="${c.u(1.8)}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".5" style="filter:blur(${c.u(.5)}px)"/><path d="${dd}" stroke="#fff" stroke-width="${c.u(.7)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  c.L.appendChild(d); anim(d, [{ opacity: 0 }, { offset: .15, opacity: 1 }, { offset: .5, opacity: .3 }, { offset: .6, opacity: 1 }, { opacity: 0 }], { duration: o.ms || 380, delay: o.delay || 0 });
}
function flash(c, color, alpha = .4, ms = 450, delay = 0) {
  const d = mk(c, '', c.W / 2, c.H / 2, c.W, c.H, 'flash'); d.style.background = color;
  anim(d, [{ opacity: 0 }, { offset: .2, opacity: alpha }, { opacity: 0 }], { duration: ms, delay });
}
// klasa na jednostce na czas działania (aury, poświaty)
function aura(u, cls, ms) { if (!u) return; u.el.classList.add(cls); setTimeout(() => u.el.classList.remove(cls), ms); }
// nakładka-chmura (para, kurz, mgła)
function puff(c, P, color, o = {}) {
  const w = o.w || c.u(16), d = mk(c, '', P.x, P.y, w, w * .8, 'puff'); d.style.background = `radial-gradient(closest-side,${color},transparent)`;
  anim(d, [{ opacity: 0, transform: 'scale(.4)' }, { offset: .3, opacity: o.a || .8 }, { opacity: 0, transform: `translate(${o.dx || 0}px,${o.dy || -c.u(10)}px) scale(${o.s1 || 1.8})` }], { duration: o.ms || 900, delay: o.delay || 0 });
}
// napis-stempel
function stamp(c, text, P, color, o = {}) {
  const d = mk(c, `<span>${text}</span>`, P.x, P.y, o.w || c.u(26), 0, 'stampfx'); d.style.color = color; d.style.borderColor = color; d.style.fontSize = c.u(o.fs || 3.2) + 'px';
  return anim(d, [{ opacity: 0, transform: `rotate(${o.rot || -9}deg) scale(2.6)` }, { offset: .22, opacity: .95, transform: `rotate(${o.rot || -9}deg) scale(1)` }, { offset: .8, opacity: .95, transform: `rotate(${o.rot || -9}deg) scale(1)` }, { opacity: 0, transform: `rotate(${o.rot || -9}deg) scale(1.06)` }], { duration: o.ms || 1000, delay: o.delay || 0 });
}
function banner(c, text, P, color, o = {}) {
  const d = mk(c, `<b>${text}</b>`, P.x, P.y, c.u(40), 0, 'shout'); d.style.color = color; d.style.fontSize = c.u(o.fs || 4.4) + 'px';
  anim(d, [{ opacity: 0, transform: 'scale(.4)' }, { offset: .2, opacity: 1, transform: 'scale(1.15)' }, { offset: .7, opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: `translateY(${-c.u(5)}px) scale(1)` }], { duration: o.ms || 900, delay: o.delay || 0 });
}

// ---------- pomocnicze ----------
const all = c => c.targets;
const aimP = (c, t) => c.pt(t, .5, .5);
const head = (c, t) => c.pt(t, .5, .2);
const feet = (c, t) => c.pt(t, .5, .92);
const heroP = c => c.pt(c.hero, .7, .45);
const heroC = c => c.pt(c.hero, .5, .5);
const mainT = c => c.main || c.targets[0];

// ---------- receptury ----------
export const RECIPES = {
  // ===== Obrażenia punktowe =====
  grad(c) { const hs = c.hits.length ? c.hits : c.targets.slice(0, 1); hs.forEach((t, i) => { const T = aimP(c, t), d = i * 90; fly(c, S.kernel(), { x: T.x - c.u(26), y: -c.u(8) }, T, { w: c.u(3.4), ms: 380, delay: d, rot: 'aim', trail: '#ffe36a' }); burst(c, S.star('#ffd23f'), T, { w: c.u(11), ms: 420, delay: 380 + d }); }); return { base: 380, step: 90 }; },
  granat(c) { const t = mainT(c); if (!t) return; const T = aimP(c, t); fly(c, S.egg('#fff3d6'), heroP(c), T, { w: c.u(4.4), ms: 520, arc: c.u(18), spin: 2 }); burst(c, S.star('#ff9a2e'), T, { w: c.u(18), ms: 600, delay: 520, s1: 2 }); floorRing(c, feet(c, t), '#ffb347', { w: c.u(26), delay: 520 }); spray(c, i => S.egg('#e8d9b0'), T, { n: 7, w: c.u(2), delay: 520, r: 12 }); flash(c, '#ffd98a', .35, 380, 520); return { base: 520, step: 0 }; },
  lodowy(c) { const t = mainT(c); if (!t) return; const T = aimP(c, t); fly(c, S.shard(), heroP(c), T, { w: c.u(8), ms: 420, rot: 'aim', trail: 'rgba(160,225,255,.85)' }); burst(c, S.star('#9fe0ff'), T, { w: c.u(16), ms: 560, delay: 420, s1: 1.8 }); floorRing(c, feet(c, t), '#dff6ff', { w: c.u(18), delay: 420 }); spray(c, () => S.snow(), T, { n: 6, w: c.u(2.6), delay: 420, r: 10 }); return { base: 420, step: 0 }; },
  zgnile(c) { const t = mainT(c); if (!t) return; const T = aimP(c, t); fly(c, S.egg('#a8c957'), heroP(c), T, { w: c.u(4.4), ms: 520, arc: c.u(16), spin: 1.5 }); burst(c, `<i class="splat"></i>`, T, { w: c.u(20), ms: 800, delay: 520, s1: 1.6 }); rise(c, () => S.drop('#9ccc65'), T, { n: 8, delay: 540, h: c.u(14), w: c.u(2.4) }); puff(c, T, 'rgba(160,210,90,.85)', { w: c.u(20), delay: 540, ms: 1100 }); return { base: 520, step: 0 }; },
  premia(c) { const t = mainT(c); if (!t) return; const T = aimP(c, t); aura(c.hero, 'u-lunge', 300); spray(c, () => S.coin(), T, { n: 6, w: c.u(2.6), delay: 260, r: 9, up: 8, fall: 4 }); burst(c, S.star('#ffd23f'), T, { w: c.u(12), ms: 420, delay: 240 }); return { base: 240, step: 0 }; },
  egzekucja(c) { const t = mainT(c); if (!t) return; const T = aimP(c, t); aura(c.hero, 'u-lunge', 320); slash(c, T, '#ff5a5a', { n: 1, len: c.u(34), ang: -50, ms: 420, delay: 240 }); slash(c, T, '#ffffff', { n: 1, len: c.u(26), ang: -50, ms: 360, delay: 270 }); flash(c, '#ff3d3d', .3, 420, 260); spray(c, () => S.drop('#d6402b'), T, { n: 8, w: c.u(2), delay: 280, r: 10 }); return { base: 280, step: 0 }; },
  wrzatek(c) { const ts = c.hits.length ? [...new Set(c.hits)] : c.targets.slice(0, 1); ts.forEach(t => { const T = aimP(c, t); fly(c, S.drop('#ffcf5a'), heroP(c), T, { w: c.u(3), ms: 380, arc: c.u(10) }); burst(c, `<i class="splash"></i>`, T, { w: c.u(14), ms: 600, delay: 380 }); puff(c, T, 'rgba(255,255,255,.85)', { w: c.u(16), delay: 380 }); rise(c, () => S.drop('#ffcf5a'), T, { n: 5, delay: 400, w: c.u(1.8) }); }); return { base: 380, step: 0 }; },
  sopel(c) { const t = mainT(c); if (!t) return; const T = aimP(c, t); const A = { x: T.x, y: -c.u(14) }; fly(c, S.icicle(), A, { x: T.x, y: T.y - c.u(3) }, { w: c.u(5), ms: 380, ease: 'cubic-bezier(.5,0,1,.6)' }); burst(c, S.star('#bfeaff'), T, { w: c.u(18), ms: 600, delay: 380, s1: 1.8 }); spray(c, () => S.shard(), T, { n: 7, w: c.u(3.2), delay: 380, r: 12 }); floorRing(c, feet(c, t), '#dff6ff', { w: c.u(20), delay: 380 }); return { base: 380, step: 0 }; },
  pazury(c) { const t = mainT(c); if (!t) return; const T = aimP(c, t); aura(c.hero, 'u-lunge', 300); slash(c, T, '#ff7a8a', { n: 3, ang: 38, ms: 360, delay: 220 }); spray(c, () => S.drop('#d6402b'), T, { n: 7, w: c.u(2), delay: 260, r: 9 }); c.targets.length && fly(c, S.cross('#ff7a8a'), T, c.pt(c.hero, .5, .3), { w: c.u(2.6), ms: 520, delay: 380 }); return { base: 240, step: 0 }; },
  zwolnienie(c) { const t = mainT(c); if (!t) return; const T = aimP(c, t); fly(c, S.paper(), heroP(c), T, { w: c.u(5), ms: 380, spin: 2 }); stamp(c, 'ZWOLNIONY', head(c, t), '#d6402b', { w: c.u(26), fs: 3.4, delay: 380, ms: 1100 }); burst(c, S.star('#ffb3c1'), T, { w: c.u(10), ms: 400, delay: 380 }); return { base: 380, step: 0 }; },
  // ===== Obrażenia obszarowe i wielokrotne =====
  chlust(c) { // garnek przechyla się nad sceną i wylewa rosół na wszystkich
    const ts = c.targets; if (!ts.length) return; const mid = ts.reduce((a, t) => a + c.pt(t, .5, .5).x, 0) / ts.length, top = c.pt(ts[0], .5, .5);
    const pot = mk(c, S.pot(), mid + c.u(18), c.u(14), c.u(40), 0, 'pot'); anim(pot, [{ opacity: 0, transform: 'translateY(-30vh) rotate(0deg)' }, { offset: .2, opacity: 1, transform: 'translateY(0) rotate(0deg)' }, { offset: .45, opacity: 1, transform: 'translateY(0) rotate(-105deg)' }, { offset: .8, opacity: 1, transform: 'translateY(0) rotate(-105deg)' }, { opacity: 0, transform: 'translateY(-30vh) rotate(-10deg)' }], { duration: 1500, easing: 'ease-in-out' });
    ts.forEach((t, i) => { const T = aimP(c, t), F = feet(c, t), d = 330 + i * 120; const st = mk(c, `<i class="stream"></i>`, T.x, c.u(22) + (F.y - c.u(22)) / 2, c.u(9), F.y - c.u(22), 'streamw'); anim(st, [{ opacity: 0, transform: 'scaleY(0)' }, { offset: .15, opacity: 1, transform: 'scaleY(1)' }, { offset: .8, opacity: 1, transform: 'scaleY(1)' }, { opacity: 0, transform: 'scaleY(1) scaleX(.3)' }], { duration: 800, delay: d }); st.style.transformOrigin = '50% 0';
      floorRing(c, F, '#ffb347', { w: c.u(24), delay: d + 160, ms: 800 }); puff(c, T, 'rgba(255,255,255,.9)', { w: c.u(16), delay: d + 200, ms: 1100 }); rise(c, () => S.drop('#ffcf5a'), F, { n: 6, delay: d + 160, w: c.u(2) }); });
    flash(c, '#ffb347', .22, 700, 500); return { base: 560, step: 110 }; },
  fala(c) { const ar = c.W, w = c.u(70), y = c.H * .72, wv = mk(c, S.wave(), -w / 2, y, w, 0, 'wavefx'); anim(wv, [{ opacity: 0, transform: 'translateX(0) scale(.7)' }, { offset: .15, opacity: 1 }, { offset: .85, opacity: 1 }, { opacity: 0, transform: `translateX(${ar + w}px) scale(1.1)` }], { duration: 1100, easing: 'ease-in', delay: 80 }); c.targets.forEach(t => { const T = aimP(c, t); puff(c, T, 'rgba(255,255,255,.85)', { w: c.u(14), delay: 220 + (T.x / ar) * 800, ms: 900 }); rise(c, () => S.drop('#ffcf5a'), feet(c, t), { n: 4, delay: 200 + (T.x / ar) * 800, w: c.u(2) }); }); return { base: 200, step: 0, byX: 800 }; },
  darcie(c) { c.targets.forEach((t, i) => { const T = aimP(c, t); fly(c, S.feather('#fff3d6'), heroP(c), T, { w: c.u(3), ms: 380, delay: i * 70, rot: 'aim', trail: 'rgba(255,140,150,.7)' }); slash(c, T, '#ff7a8a', { n: 3, delay: 380 + i * 70 }); spray(c, () => S.drop('#d6402b'), T, { n: 5, w: c.u(1.8), delay: 400 + i * 70, r: 8 }); }); return { base: 400, step: 70 }; },
  wir(c) { const hs = c.hits.length ? c.hits : c.targets.slice(0, 1); hs.forEach((t, i) => { const T = aimP(c, t), H = heroC(c); const d = i * 110; fly(c, S.egg('#fff3d6'), { x: H.x + Math.cos(i * 2.1) * c.u(8), y: H.y + Math.sin(i * 2.1) * c.u(8) }, T, { w: c.u(3.6), ms: 420, delay: d, spin: 2, arc: c.u(8 + i * 3) }); burst(c, S.star('#ffe08a'), T, { w: c.u(10), ms: 420, delay: 420 + d }); }); aura(c.hero, 'u-spin', 500); return { base: 420, step: 110 }; },
  // ===== Nowe obrażenia =====
  lawina(c) { const t = mainT(c); if (!t) return; const T = aimP(c, t), n = c.hits.length || 3; for (let i = 0; i < n; i++) { const d = i * 160, x = T.x + (i - 1) * c.u(3); fly(c, S.folder(), { x, y: -c.u(10) }, { x, y: T.y }, { w: c.u(8), ms: 340, delay: d, rot: (i - 1) * 14, ease: 'cubic-bezier(.5,0,1,.7)' }); burst(c, S.star('#c9b6ff'), { x, y: T.y }, { w: c.u(10), ms: 380, delay: 340 + d }); spray(c, () => S.paper(), { x, y: T.y }, { n: 4, w: c.u(2.6), delay: 340 + d, r: 11, up: 8 }); } return { base: 340, step: 160 }; },
  zwarcie(c) { const t = mainT(c); if (!t) return; const pts = [heroP(c), aimP(c, t)]; for (const e of c.arcs) pts.push(aimP(c, e)); pts.slice(1).forEach((P, i) => { bolt(c, [pts[i], P], '#ffe36a', { delay: i * 130 }); burst(c, S.star('#ffe36a'), P, { w: c.u(11), ms: 380, delay: 60 + i * 130 }); }); flash(c, '#fff6bf', .3, 350, 40); return { base: 60, step: 130 }; },
  dziobanie(c) { const t = mainT(c); if (!t) return; const T = aimP(c, t), n = c.hits.length || 5; aura(c.hero, 'u-peck', n * 90 + 100); for (let i = 0; i < n; i++) { const P = { x: T.x + (R() - .5) * c.u(8), y: T.y + (R() - .5) * c.u(8) }; burst(c, S.star('#ff9aa8'), P, { w: c.u(7), ms: 280, delay: 80 + i * 90 }); if (i % 2 === 0) spray(c, () => S.drop('#d6402b'), P, { n: 2, w: c.u(1.6), delay: 90 + i * 90, r: 6 }); } return { base: 80, step: 90 }; },
  niespodzianka(c) { const sur = c.ev.filter(e => e.k === 'surprise'); (sur.length ? sur : [{ r: 0, to: mainT(c) && mainT(c).uid }]).forEach((e, i) => { const t = c.byUid(e.to) || mainT(c); if (!t) return; const T = aimP(c, t), d = i * 260, col = ['#ffe08a', '#ff7a3d', '#7fe0ff', '#9ccc65'][e.r]; fly(c, S.egg('#fff3d6'), heroP(c), T, { w: c.u(4.4), ms: 460, delay: d, arc: c.u(14), spin: 1.5 }); burst(c, S.star(col), T, { w: c.u(18), ms: 600, delay: 460 + d, s1: 1.9 }); spray(c, () => e.r === 1 ? S.flame() : e.r === 2 ? S.snow() : e.r === 3 ? S.drop('#9ccc65') : S.coin(), T, { n: 7, w: c.u(3), delay: 460 + d, r: 11 }); }); return { base: 460, step: 260 }; },
  audyt(c) { const t = mainT(c); if (!t) return; const T = aimP(c, t); const m = mk(c, S.magnifier(), T.x - c.u(10), T.y - c.u(8), c.u(10), 0, 'mag'); anim(m, [{ opacity: 0, transform: 'translate(0,0) scale(.6)' }, { offset: .2, opacity: 1 }, { offset: .5, opacity: 1, transform: `translate(${c.u(20)}px,${c.u(8)}px) scale(1.1)` }, { opacity: 0, transform: `translate(${c.u(20)}px,${c.u(8)}px) scale(1)` }], { duration: 760 }); const sc = mk(c, '<i class="scan"></i>', T.x, T.y, c.u(18), c.u(2.4), 'scanl'); anim(sc, [{ opacity: 0, transform: `translateY(${-c.u(10)}px)` }, { offset: .2, opacity: 1 }, { opacity: 0, transform: `translateY(${c.u(10)}px)` }], { duration: 700, delay: 150 }); spray(c, () => S.paper(), T, { n: 5, w: c.u(2.2), delay: 700, r: 8 }); burst(c, S.star('#c9b6ff'), T, { w: c.u(12), ms: 420, delay: 640 }); return { base: 640, step: 0 }; },
  bonus(c) { const t = mainT(c); if (!t) return; const T = aimP(c, t); for (let i = 0; i < 9; i++) { const x = T.x + (R() - .5) * c.u(14); fly(c, S.coin(), { x, y: -c.u(8) }, { x, y: T.y + (R() - .5) * c.u(6) }, { w: c.u(3.4), ms: 420, delay: i * 55, spin: 2 }); } burst(c, S.star('#ffd23f'), T, { w: c.u(16), ms: 520, delay: 520, s1: 1.8 }); spray(c, () => S.coin(), T, { n: 8, w: c.u(2.6), delay: 520, r: 10, up: 8 }); return { base: 520, step: 0 }; },
  ostateczny(c) { const t = mainT(c); if (!t) return; const T = aimP(c, t), F = feet(c, t); const pot = mk(c, S.pot(), T.x + c.u(14), c.u(12), c.u(36), 0, 'pot'); anim(pot, [{ opacity: 0, transform: 'translateY(-30vh) rotate(0)' }, { offset: .2, opacity: 1, transform: 'translateY(0) rotate(0)' }, { offset: .42, opacity: 1, transform: 'rotate(-110deg)' }, { offset: .82, opacity: 1, transform: 'rotate(-110deg)' }, { opacity: 0, transform: 'translateY(-30vh) rotate(-10deg)' }], { duration: 1700, easing: 'ease-in-out' }); const st = mk(c, `<i class="stream big"></i>`, T.x, c.u(20) + (F.y - c.u(20)) / 2, c.u(13), F.y - c.u(20), 'streamw'); st.style.transformOrigin = '50% 0'; anim(st, [{ opacity: 0, transform: 'scaleY(0)' }, { offset: .12, opacity: 1, transform: 'scaleY(1)' }, { offset: .85, opacity: 1 }, { opacity: 0, transform: 'scaleX(.3)' }], { duration: 1000, delay: 480 }); for (let i = 0; i < 4; i++) { const f = mk(c, S.flame(), T.x + (i - 1.5) * c.u(6), F.y, c.u(8), 0, 'flamepillar'); anim(f, [{ opacity: 0, transform: 'scaleY(.2)' }, { offset: .3, opacity: 1, transform: 'scaleY(1.2)' }, { opacity: 0, transform: 'scaleY(1.6)' }], { duration: 900, delay: 900 + i * 60 }); f.style.transformOrigin = '50% 100%'; } floorRing(c, F, '#ff7a3d', { w: c.u(34), delay: 900, ms: 900 }); flash(c, '#ff5a2a', .38, 900, 880); puff(c, T, 'rgba(255,255,255,.9)', { w: c.u(22), delay: 900, ms: 1200 }); return { base: 880, step: 0 }; },
  // ===== Kontrola =====
  pianie(c) { const H = heroP(c); for (let i = 0; i < 3; i++) { const d = mk(c, '<i class="arc"></i>', H.x, H.y, c.u(14), c.u(22), 'soundarc'); anim(d, [{ opacity: 0, transform: 'translateX(0) scale(.4)' }, { offset: .2, opacity: .95 }, { opacity: 0, transform: `translateX(${c.W * .7}px) scale(2.6)` }], { duration: 900, delay: i * 150, easing: 'ease-out' }); } banner(c, 'KIKIRIKI!', { x: c.W * .45, y: c.H * .3 }, '#ffd23f', { delay: 100 }); flash(c, '#fff3b8', .25, 400, 60); c.shake(); return { base: 100, step: 0 }; },
  kapiel(c) { const ts = c.targets; ts.forEach(t => { const T = aimP(c, t); for (let i = 0; i < 3; i++) puff(c, { x: T.x + (R() - .5) * c.u(10), y: T.y + c.u(6) }, 'rgba(214,180,110,.9)', { w: c.u(18), delay: i * 140, ms: 1400, dy: -c.u(4), dx: (R() - .5) * c.u(8), s1: 1.5 }); rise(c, () => `<i class="grain"></i>`, T, { n: 8, w: c.u(1.2), h: c.u(10), ms: 1100 }); }); return { base: 200, step: 0 }; },
  zamrazarka(c) { const ts = c.mut === 2 ? c.targets : [mainT(c)].filter(Boolean); ts.forEach((t, i) => { const T = aimP(c, t), d = i * 90, w = c.u(18); const cb = mk(c, S.cube(), T.x, T.y - c.u(1), w, 0, 'cube'); anim(cb, [{ opacity: 0, transform: 'scale(.3)' }, { offset: .25, opacity: .95, transform: 'scale(1.08)' }, { offset: .8, opacity: .95, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.12)' }], { duration: 1600, delay: 300 + d }); spray(c, () => S.snow(), T, { n: 6, w: c.u(2.6), delay: 300 + d, r: 10 }); puff(c, T, 'rgba(200,235,255,.9)', { w: c.u(22), delay: 280 + d, ms: 1100 }); floorRing(c, feet(c, t), '#dff6ff', { w: c.u(22), delay: 300 + d }); }); flash(c, '#bfeaff', .28, 500, 280); return { base: 300, step: 0 }; },
  powiew(c) { for (let i = 0; i < 5; i++) { const y = c.H * (.5 + i * .07), d = mk(c, '<i class="gust"></i>', -c.u(10), y, c.u(40), 0, 'gustfx'); anim(d, [{ opacity: 0, transform: 'translateX(0)' }, { offset: .2, opacity: .9 }, { opacity: 0, transform: `translateX(${c.W + c.u(40)}px)` }], { duration: 900, delay: i * 80, easing: 'ease-in' }); } c.targets.forEach(t => { const T = aimP(c, t); spray(c, () => S.snow(), T, { n: 4, w: c.u(2.4), delay: 500, r: 8 }); puff(c, T, 'rgba(200,235,255,.9)', { w: c.u(16), delay: 480, ms: 1000 }); }); return { base: 480, step: 0 }; },
  spotkanie(c) { const ts = c.mut === 1 ? c.targets : [c.strong || mainT(c)].filter(Boolean); ts.forEach((t, i) => { const T = aimP(c, t), d = i * 120; const ck = mk(c, S.clock(), T.x, T.y - c.u(10), c.u(11), 0, 'clockfx'); anim(ck, [{ opacity: 0, transform: 'translateY(-14vh) scale(.5)' }, { offset: .25, opacity: 1, transform: 'translateY(0) scale(1)' }, { offset: .85, opacity: 1 }, { opacity: 0 }], { duration: 1300, delay: 120 + d }); spray(c, () => `<i class="zzz">Z</i>`, head(c, t), { n: 3, w: c.u(3), delay: 500 + d, r: 7, up: 8, fall: -6 }); burst(c, S.star('#c9b6ff'), T, { w: c.u(12), ms: 420, delay: 360 + d }); }); const t = ts[0]; if (t) stamp(c, 'MOGŁO BYĆ MAILEM', head(c, t), '#7a5fe0', { w: c.u(32), fs: 2.4, delay: 500, ms: 1200, rot: -4 }); return { base: 300, step: 0 }; },
  wicher(c) { for (let i = 0; i < 6; i++) { const y = c.H * (.38 + i * .08), d = mk(c, '<i class="gust w"></i>', -c.u(10), y, c.u(46), 0, 'gustfx'); anim(d, [{ opacity: 0, transform: 'translateX(0)' }, { offset: .2, opacity: .9 }, { opacity: 0, transform: `translateX(${c.W + c.u(40)}px)` }], { duration: 800, delay: i * 60, easing: 'ease-in' }); } for (let i = 0; i < 8; i++) fly(c, i % 2 ? S.paper() : S.feather(), { x: -c.u(4), y: c.H * (.4 + R() * .35) }, { x: c.W * (.5 + R() * .45), y: c.H * (.3 + R() * .4) }, { w: c.u(3), ms: 700, delay: i * 70, spin: 2 }); c.targets.forEach(t => { aura(t, 'u-pushed', 420); }); return { base: 420, step: 0 }; },
  pulapka(c) { const t = c.targets[0]; const P = t ? feet(c, t) : { x: c.W * .6, y: c.H * .8 }; const d = mk(c, S.trap(), P.x - c.u(16), P.y + c.u(2), c.u(10), 0, 'trapfx persist'); c.F.trapEl = d; d.style.opacity = 0; d.animate([{ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 260, fill: 'forwards' }); setTimeout(() => d.remove(), 6200); return { base: 0, step: 0 }; },
  // ===== Obrona i leczenie =====
  zagrzebanie(c) { const H = heroC(c), F = feet(c, c.hero); rise(c, () => S.hay(), F, { n: 10, spread: c.u(18), h: c.u(18), w: c.u(5), ms: 1100, stagger: 50 }); rise(c, () => S.cross(), H, { n: 5, spread: c.u(10), h: c.u(18), w: c.u(3), delay: 300 }); floorRing(c, F, '#d9b45a', { w: c.u(26), ms: 900 }); aura(c.hero, 'u-sink', 900); return { base: 0, step: 0 }; },
  pogotowie(c) { const H = heroC(c), F = feet(c, c.hero); [0, 700, 1400].forEach(d => { floorRing(c, F, '#7dff9f', { w: c.u(30), delay: d, ms: 900 }); rise(c, () => S.cross(), H, { n: 3, spread: c.u(12), h: c.u(16), w: c.u(3), delay: d }); }); aura(c.hero, 'u-siren', 4000); return { base: 0, step: 0 }; },
  garsc(c) { const H = heroC(c); spray(c, () => `<i class="grain big"></i>`, { x: H.x, y: H.y - c.u(12) }, { n: 16, w: c.u(1.8), r: 13, up: 2, fall: 8, ms: 1000 }); rise(c, () => S.cross('#ffe36a'), H, { n: 4, h: c.u(14), w: c.u(3) }); aura(c.hero, 'u-gold', 5000); return { base: 0, step: 0 }; },
  tarcza(c) { const H = heroC(c); const d = mk(c, '<i class="domefx"></i>', H.x, H.y + c.u(2), c.u(26), c.u(26), 'dome persist'); d.style.opacity = 0; d.animate([{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 300, fill: 'forwards' }); c.F.domeEl = d; setTimeout(() => { if (c.F.domeEl === d) c.F.domeEl = null; d.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).finished.then(() => d.remove()).catch(() => d.remove()); }, (c.dur || 4000)); rise(c, () => S.hay(), feet(c, c.hero), { n: 6, spread: c.u(16), h: c.u(14), w: c.u(4) }); return { base: 0, step: 0 }; },
  kawa(c) { const H = heroC(c); const cup = mk(c, S.cup(), H.x, H.y - c.u(14), c.u(8), 0, 'cupfx'); anim(cup, [{ opacity: 0, transform: 'translateY(0) scale(.5)' }, { offset: .25, opacity: 1, transform: 'translateY(-1vh) scale(1)' }, { offset: .8, opacity: 1 }, { opacity: 0, transform: 'translateY(-3vh)' }], { duration: 1300 }); rise(c, () => `<i class="steam"></i>`, { x: H.x, y: H.y - c.u(18) }, { n: 6, spread: c.u(4), h: c.u(10), w: c.u(2), ms: 1100 }); rise(c, () => S.cross(), H, { n: 4, spread: c.u(10), h: c.u(14), w: c.u(3), delay: 200 }); return { base: 0, step: 0 }; },
  zupa(c) { const H = heroC(c); const b = mk(c, S.bowl(), H.x, H.y - c.u(14), c.u(11), 0, 'bowlfx'); anim(b, [{ opacity: 0, transform: 'translateY(0) scale(.5)' }, { offset: .25, opacity: 1, transform: 'translateY(-1vh) scale(1)' }, { offset: .8, opacity: 1 }, { opacity: 0, transform: 'translateY(-3vh)' }], { duration: 1300 }); rise(c, () => `<i class="steam"></i>`, { x: H.x, y: H.y - c.u(18) }, { n: 7, spread: c.u(7), h: c.u(12), w: c.u(2.4), ms: 1200 }); rise(c, () => S.cross('#ffb347'), H, { n: 4, h: c.u(14), w: c.u(3), delay: 200 }); aura(c.hero, 'u-warm', 4000); return { base: 0, step: 0 }; },
  unik(c) { const H = heroC(c); for (let i = 1; i <= 3; i++) { const g = mk(c, '', H.x - i * c.u(5), H.y, c.u(14), c.u(18), 'afterimg'); g.style.background = 'rgba(207,227,240,.35)'; g.style.borderRadius = '50%'; anim(g, [{ opacity: .7, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.8)' }], { duration: 700, delay: i * 90 }); } rise(c, () => S.feather(), H, { n: 8, spread: c.u(14), h: c.u(10), w: c.u(2.4) }); aura(c.hero, 'u-ghost', (c.dur || 1500)); return { base: 0, step: 0 }; },
  kontra(c) { const H = heroC(c); const d = mk(c, '<i class="domefx gold"></i>', H.x, H.y + c.u(2), c.u(24), c.u(24), 'dome persist'); anim(d, [{ opacity: 0, transform: 'scale(.4)' }, { offset: .15, opacity: 1, transform: 'scale(1)' }, { offset: .85, opacity: 1 }, { opacity: 0 }], { duration: c.dur || 2500 }); aura(c.hero, 'u-gold', c.dur || 2500); return { base: 0, step: 0 }; },
  dziobniecie(c) { aura(c.hero, 'u-rage', c.dur || 6000); const H = heroC(c); for (let i = 0; i < 4; i++) { const d = mk(c, '<i class="spd"></i>', H.x - c.u(10), H.y + (i - 1.5) * c.u(4), c.u(14), 0, 'spdl'); anim(d, [{ opacity: 0, transform: 'translateX(0)' }, { offset: .3, opacity: .9 }, { opacity: 0, transform: `translateX(${-c.u(10)}px)` }], { duration: 500, delay: i * 70 }); } rise(c, () => S.flame(), H, { n: 5, h: c.u(12), w: c.u(3.4) }); return { base: 0, step: 0 }; },
  podpalka(c) { aura(c.hero, 'u-torch', c.dur || 6000); const H = c.pt(c.hero, .5, .1); rise(c, () => S.flame(), H, { n: 5, h: c.u(10), w: c.u(4), spread: c.u(5) }); return { base: 0, step: 0 }; },
  zakwas(c) { const ts = c.targets; if (!ts.length) return; const mid = aimP(c, ts[Math.floor(ts.length / 2)]); fly(c, S.bag(), heroP(c), mid, { w: c.u(6), ms: 520, arc: c.u(16), spin: 1 }); ts.forEach(t => { const T = aimP(c, t); burst(c, `<i class="splat"></i>`, T, { w: c.u(16), ms: 800, delay: 520 }); rise(c, () => S.drop('#9ccc65'), T, { n: 6, delay: 540, w: c.u(2.2) }); puff(c, T, 'rgba(160,210,90,.8)', { w: c.u(16), delay: 540, ms: 1000 }); }); return { base: 520, step: 0 }; },
  // ===== Nowe wzmocnienia =====
  zemsta(c) { aura(c.hero, 'u-cauldron', c.dur || 4000); const F = feet(c, c.hero); floorRing(c, F, '#ff7a3d', { w: c.u(26) }); rise(c, () => S.flame(), c.pt(c.hero, .5, .35), { n: 6, spread: c.u(14), h: c.u(14), w: c.u(3.4) }); return { base: 0, step: 0 }; },
  pobudka(c) { const H = heroC(c); const r = mk(c, '<i class="rays"></i>', H.x, H.y, c.u(60), c.u(60), 'raysfx'); anim(r, [{ opacity: 0, transform: 'scale(.3) rotate(0)' }, { offset: .2, opacity: .95 }, { opacity: 0, transform: 'scale(1.4) rotate(40deg)' }], { duration: 1300 }); banner(c, 'KUKURYKU!', { x: H.x + c.u(8), y: H.y - c.u(26) }, '#ffd23f'); aura(c.hero, 'u-gold', c.dur || 5000); flash(c, '#ffe08a', .25, 500); return { base: 0, step: 0 }; },
  echo(c) { const H = heroC(c); for (let i = 1; i <= 3; i++) { const d = mk(c, '<i class="arc e"></i>', H.x, H.y, c.u(10 + i * 4), c.u(16 + i * 6), 'soundarc'); anim(d, [{ opacity: 0, transform: 'scale(.4)' }, { offset: .25, opacity: .9 }, { opacity: 0, transform: 'scale(1.6)' }], { duration: 800, delay: i * 120 }); } aura(c.hero, 'u-echo', 3000); return { base: 0, step: 0 }; },
  obieg(c) { const H = heroC(c); floorRing(c, feet(c, c.hero), '#7dff9f', { w: c.u(30) }); rise(c, () => S.cross('#7dff9f'), H, { n: 5, h: c.u(14), w: c.u(3) }); document.querySelectorAll('#skillbar .sk').forEach(b => { b.classList.remove('boost'); void b.offsetWidth; b.classList.add('boost'); setTimeout(() => b.classList.remove('boost'), 900); }); return { base: 0, step: 0 }; },
  wypowiedzenie(c) { const t = mainT(c); if (!t) return; const T = head(c, t); stamp(c, 'WYPOWIEDZENIE', T, '#d6402b', { w: c.u(30), fs: 2.8, ms: 1300 }); const r = mk(c, '<i class="cdring"></i>', T.x, T.y + c.u(6), c.u(9), c.u(9), 'cdr'); r.style.setProperty('--ms', (c.dur || 4000) + 'ms'); setTimeout(() => r.remove(), (c.dur || 4000)); return { base: 0, step: 0 }; },
};

// uderzenie Wypowiedzenia po upływie czasu i trafienie Pułapki
export function markHit(c, t) { const T = c.pt(t, .5, .4); stamp(c, 'ZWOLNIONY', c.pt(t, .5, .2), '#d6402b', { w: c.u(26), fs: 3, ms: 900 }); burst(c, S.star('#ff7a8a'), T, { w: c.u(16), ms: 460 }); flash(c, '#ff3d3d', .2, 300); }
export function trapSnap(c, t, trapEl) { const T = c.pt(t, .5, .85); if (trapEl) trapEl.remove(); burst(c, S.trap(), T, { w: c.u(10), ms: 600, s0: 1.4, s1: 1 }); burst(c, S.star('#ffd23f'), T, { w: c.u(12), ms: 420 }); spray(c, () => S.star('#fff3a0'), T, { n: 4, w: c.u(2.4), r: 7 }); }
export function castFx(id, c) { const f = RECIPES[id]; return f ? f(c) || { base: 0, step: 0 } : null; }
