// Bulgot: cała grafika jako wektor w kodzie (kreskówkowe SVG): postacie, wrogowie, ikony kafelków, areny.
// Każda funkcja zwraca napis z SVG. Postacie i wrogowie mają viewBox 0 0 100 100 (stopy na y≈94), ikony 0 0 48 48.
const O = '#2b1a12';                       // kontur
const S = `stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const S2 = `stroke="${O}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
const NF = 'fill="none"';

const svg = (inner, vb = '0 0 100 100', cls = 'fig') => `<svg class="${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
const eye = (cx, cy, r = 8, look = 2) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" ${S2}/><circle cx="${cx + look}" cy="${cy + 1}" r="${r * 0.5}" fill="${O}"/><circle cx="${cx + look + r * 0.2}" cy="${cy - r * 0.25}" r="${r * 0.18}" fill="#fff"/>`;
const brow = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" ${S} ${NF}/>`;

// ---------- Bohaterowie ----------
const FEET = (c = '#e8902a') => `<path d="M41 84 v9 m-6 1 h12 M58 84 v9 m-6 1 h12" stroke="${c}" stroke-width="4.5" stroke-linecap="round" ${NF}/><path d="M41 84 v9 m-6 1 h12 M58 84 v9 m-6 1 h12" stroke="${O}" stroke-width="1.5" stroke-linecap="round" ${NF} opacity=".55"/>`;

const PYRTEK = () => `
  ${FEET('#ff8c2b')}
  <path d="M47 31 q-7 -11 -2 -16 M52 30 q1 -13 8 -15 M57 31 q9 -8 14 -5" ${S} ${NF}/>
  <ellipse cx="50" cy="58" rx="31" ry="29" fill="#ffd34e" ${S}/>
  <path d="M30 60 q-5 16 11 19 q11 -6 4 -21 z" fill="#f2b82e" ${S}/>
  ${eye(64, 50, 9, 2)}${brow(54, 41, 72, 46)}
  <path d="M76 57 l14 4 l-14 6 z" fill="#ff8c2b" ${S}/>
  <circle cx="57" cy="66" r="4.5" fill="#ff9a8a" opacity=".75"/>`;

const KOGUT = () => `
  ${FEET()}
  <path d="M26 62 q-20 -6 -15 -30 q11 7 19 19 z" fill="#2a9d8f" ${S}/>
  <path d="M27 68 q-23 2 -23 -17 q13 3 21 12 z" fill="#e4572e" ${S}/>
  <path d="M30 54 q-15 -15 -5 -37 q9 15 13 30 z" fill="#f4a261" ${S}/>
  <ellipse cx="48" cy="64" rx="24" ry="22" fill="#f7ecd3" ${S}/>
  <path d="M32 62 q-2 17 17 19 q9 -10 0 -23 z" fill="#e6d3a8" ${S}/>
  <circle cx="66" cy="40" r="15" fill="#f7ecd3" ${S}/>
  <path d="M57 29 q-3 -13 6 -11 q2 -9 9 -3 q9 -2 6 8 q-4 6 -13 7 z" fill="#e4572e" ${S}/>
  ${eye(69, 38, 6.5, 1.5)}${brow(62, 31, 76, 35)}
  <path d="M79 40 l13 4 l-13 6 z" fill="#ffb02e" ${S}/>
  <path d="M77 50 q5 10 -2 13 q-6 -6 -2 -13 z" fill="#e4572e" ${S}/>`;

const BOJOWY = () => `${KOGUT()}
  <path d="M35 58 q14 -9 30 -1 l-3 22 q-12 6 -24 0 z" fill="#aab4bf" ${S}/>
  <path d="M42 62 h16 M43 70 h14" stroke="#5f6b78" stroke-width="2" ${NF}/>
  <ellipse cx="37" cy="56" rx="11" ry="8" fill="#8793a0" ${S}/>
  <circle cx="33" cy="55" r="1.6" fill="#dfe6ee"/><circle cx="41" cy="54" r="1.6" fill="#dfe6ee"/>
  <path d="M62 30 l10 16" stroke="#c0392b" stroke-width="2.6" ${NF} stroke-linecap="round"/>
  <path d="M60 33 l-6 -9 l8 3 l2 -9 l5 8" ${S} fill="#e4572e"/>`;

const RAMBO = () => `
  ${FEET('#d98324')}
  <path d="M24 62 q-24 -8 -18 -34 q12 8 22 20 z" fill="#2a9d8f" ${S}/>
  <path d="M26 70 q-26 3 -24 -18 q14 3 24 13 z" fill="#e4572e" ${S}/>
  <ellipse cx="49" cy="64" rx="28" ry="24" fill="#f7ecd3" ${S}/>
  <path d="M26 53 l40 30" stroke="#6b4a2b" stroke-width="8" stroke-linecap="round"/>
  <path d="M26 53 l40 30" stroke="${O}" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="1 8" opacity=".5"/>
  <circle cx="35" cy="60" r="3.4" fill="#f4c542" ${S2}/><circle cx="46" cy="69" r="3.4" fill="#f4c542" ${S2}/><circle cx="57" cy="77" r="3.4" fill="#f4c542" ${S2}/>
  <circle cx="34" cy="66" r="14" fill="#efd7a2" ${S}/>
  <path d="M26 60 q4 -4 10 -2" stroke="${O}" stroke-width="2" ${NF}/>
  <circle cx="68" cy="39" r="16" fill="#f7ecd3" ${S}/>
  <path d="M57 27 l-2 -13 l8 7 l3 -12 l6 11 l8 -8 l-1 14 z" fill="#e4572e" ${S}/>
  <path d="M52 34 q16 -9 32 -1 l0 7 q-16 -6 -32 1 z" fill="#d62828" ${S}/>
  <path d="M53 37 q-12 2 -18 13 q11 -5 19 -5 z" fill="#d62828" ${S}/><path d="M53 40 q-10 8 -9 18 q8 -8 12 -12 z" fill="#b71c1c" ${S}/>
  <rect x="62" y="40" width="26" height="9" rx="3.5" fill="#111" ${S2}/><path d="M66 42 l6 0 M74 42 l4 0" stroke="#7aa2c8" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M82 52 l13 3 l-13 6 z" fill="#ffb02e" ${S}/>`;

const KWOKA = () => `
  ${FEET('#d98324')}
  <ellipse cx="48" cy="64" rx="31" ry="25" fill="#b5651d" ${S}/>
  <path d="M30 62 q-3 17 18 20 q11 -11 -1 -25 z" fill="#8c4a14" ${S}/>
  <path d="M34 70 q14 12 28 0 l-2 14 q-12 4 -24 0 z" fill="#fff8e7" ${S2}/>
  <circle cx="68" cy="40" r="15" fill="#b5651d" ${S}/>
  <path d="M60 28 q-2 -9 5 -7 q3 -7 8 -1 q7 0 3 7 z" fill="#e76f51" ${S}/>
  <circle cx="62" cy="38" r="6.5" fill="#fff" fill-opacity=".5" ${S2}/><circle cx="76" cy="38" r="6.5" fill="#fff" fill-opacity=".5" ${S2}/>
  <path d="M68.5 38 h1.5" ${S2}/>
  <circle cx="63" cy="39" r="2.2" fill="${O}"/><circle cx="77" cy="39" r="2.2" fill="${O}"/>
  <path d="M82 44 l11 4 l-11 5 z" fill="#ffb02e" ${S}/>
  <path d="M55 51 q14 10 28 -2 l-1 9 q-13 8 -26 1 z" fill="#e76f51" ${S}/>
  <circle cx="62" cy="55" r="1.8" fill="#fff"/><circle cx="70" cy="57" r="1.8" fill="#fff"/><circle cx="77" cy="54" r="1.8" fill="#fff"/>
  <circle cx="50" cy="26" r="8" fill="#cfd4da" ${S}/>`;

const KACZOR = () => `
  <path d="M40 84 v9 m-8 1 h16 M58 84 v9 m-8 1 h16" stroke="#ff8c2b" stroke-width="4.5" stroke-linecap="round" ${NF}/>
  <path d="M20 66 q-12 -2 -14 -12 q10 -2 18 6 z" fill="#ffe27a" ${S}/>
  <ellipse cx="48" cy="64" rx="25" ry="22" fill="#fff3b0" ${S}/>
  <path d="M33 62 q-2 17 16 19 q9 -10 0 -23 z" fill="#f2d86a" ${S}/>
  <circle cx="66" cy="38" r="15" fill="#fff3b0" ${S}/>
  <path d="M56 24 h20 l-2 -16 h-16 z" fill="#1f1f24" ${S}/><rect x="53" y="22" width="26" height="5" rx="2" fill="#1f1f24" ${S}/>
  <rect x="56" y="17" width="19" height="4" fill="#c0392b"/>
  ${eye(68, 38, 6.5, 1.5)}${brow(61, 31, 75, 35)}
  <path d="M76 42 q14 -2 17 4 q-3 6 -17 5 q-4 -4 0 -9 z" fill="#ff8c2b" ${S}/>
  <path d="M56 52 l-6 6 l14 0 l-6 -6 z M56 52 l6 6 l-12 0 z" fill="#c0392b" ${S2}/>
  <path d="M40 54 l4 4 l-4 4 l-4 -4 z" fill="#fff" ${S2}/>`;

const INDOR = () => `
  ${FEET('#d98324')}
  <path d="M26 56 q-18 -8 -10 -30 q8 6 16 14 z" fill="#c0392b" ${S}/><path d="M28 50 q-8 -18 6 -34 q4 14 6 26 z" fill="#e67e22" ${S}/>
  <path d="M34 46 q4 -22 24 -26 q-2 14 -10 28 z" fill="#f1c40f" ${S}/><path d="M44 48 q10 -20 32 -14 q-10 6 -22 18 z" fill="#2a9d8f" ${S}/>
  <ellipse cx="47" cy="66" rx="26" ry="23" fill="#8d5524" ${S}/>
  <path d="M31 64 q-2 16 16 19 q9 -10 1 -24 z" fill="#6f3f17" ${S}/>
  <circle cx="68" cy="40" r="13" fill="#7fb7d6" ${S}/>
  <path d="M60 28 l-2 -6 l6 3 l2 -7 l4 7 l6 -4 l-1 8 z" fill="#c0392b" ${S2}/>
  ${eye(71, 38, 5.8, 1.5)}${brow(65, 31, 78, 35)}
  <path d="M79 42 l11 3 l-11 5 z" fill="#ffb02e" ${S}/>
  <path d="M78 50 q8 8 0 17 q-8 -4 -5 -17 z" fill="#c0392b" ${S}/>`;

// Zjarany Kurczak: przypieczony na złoto, z półprzymkniętymi, zaczerwienionymi oczami, osmalonym grzebieniem i obłoczkiem dymu przy dziobie.
const ZJARANY = () => `
  ${FEET('#d98324')}
  <path d="M25 66 q-15 -3 -13 -19 q11 1 19 11 z" fill="#7a4a1f" ${S}/>
  <ellipse cx="48" cy="64" rx="27" ry="23" fill="#c98a43" ${S}/>
  <path d="M31 62 q-3 17 17 20 q10 -11 0 -24 z" fill="#a8672a" ${S}/>
  <path d="M40 54 q4 -3 8 0 M52 70 q4 -3 8 0" stroke="#5b3516" stroke-width="2.4" stroke-linecap="round" ${NF} opacity=".6"/>
  <circle cx="66" cy="40" r="15" fill="#d9a35a" ${S}/>
  <path d="M57 28 q-4 -12 5 -10 q2 -9 9 -2 q9 -1 5 8 q-5 6 -12 6 z" fill="#8f2a1a" ${S}/>
  <path d="M60 22 q2 -3 4 0 M70 20 q2 -2 4 1" stroke="${O}" stroke-width="2" stroke-linecap="round" ${NF} opacity=".5"/>
  <circle cx="69" cy="40" r="6.8" fill="#f8dcd6" ${S2}/><circle cx="70.5" cy="42" r="3" fill="#b01c1c"/><circle cx="71.4" cy="41" r="1" fill="#fff"/>
  <path d="M62.2 40 a6.8 6.8 0 0 1 13.6 0 z" fill="#d9a35a" ${S2}/>
  ${brow(60, 31, 77, 33)}
  <path d="M79 44 l13 4 l-13 6 z" fill="#ffb02e" ${S}/>
  <path d="M57 54 q5 4 11 1" stroke="${O}" stroke-width="2.2" ${NF} stroke-linecap="round"/>
  <g class="zsmoke"><circle cx="90" cy="38" r="4" fill="#e9e5dc" opacity=".9" ${S2}/><circle cx="95" cy="28" r="5.5" fill="#f1ede5" opacity=".85" ${S2}/><circle cx="88" cy="17" r="7.5" fill="#f6f2ea" opacity=".8" ${S2}/></g>`;


// ---------- Nowe postacie: jeden wspólny kształt kury (jak Kogut) z paletą i akcesoriami ----------
const HEN = (c, front = '', extra = '') => `
  ${FEET(c.feet || '#e8902a')}
  <path d="M26 62 q-20 -6 -15 -30 q11 7 19 19 z" fill="${c.t1}" ${S}/>
  <path d="M27 68 q-23 2 -23 -17 q13 3 21 12 z" fill="${c.t2}" ${S}/>
  <path d="M30 54 q-15 -15 -5 -37 q9 15 13 30 z" fill="${c.t3}" ${S}/>
  <ellipse cx="48" cy="64" rx="24" ry="22" fill="${c.body}" ${S}/>
  <path d="M32 62 q-2 17 17 19 q9 -10 0 -23 z" fill="${c.shade}" ${S}/>
  ${front}
  <circle cx="66" cy="40" r="15" fill="${c.body}" ${S}/>
  ${c.nocomb ? '' : `<path d="M57 29 q-3 -13 6 -11 q2 -9 9 -3 q9 -2 6 8 q-4 6 -13 7 z" fill="${c.comb}" ${S}/>`}
  ${eye(69, 38, 6.5, 1.5)}${brow(62, 31, 76, 35)}
  <path d="M79 40 l13 4 l-13 6 z" fill="${c.beak || '#ffb02e'}" ${S}/>
  <path d="M77 50 q5 10 -2 13 q-6 -6 -2 -13 z" fill="${c.comb}" ${S}/>
  ${extra}`;
const BARISTA = () => HEN({ t1: '#8d5524', t2: '#c68642', t3: '#e0a96d', body: '#f1d9b5', shade: '#d9b98a', comb: '#c0392b' },
  `<path d="M34 60 h26 l-3 22 q-10 5 -20 0 z" fill="#2e7d32" ${S}/><rect x="40" y="67" width="12" height="8" rx="2" fill="#a5d6a7" ${S2}/>`,
  `<rect x="78" y="55" width="11" height="10" rx="2" fill="#fff" ${S2}/><path d="M89 57 q6 0 4 5 q-1 2 -4 2" fill="none" ${S2}/><path d="M81 52 q-2 -4 1 -8 M86 52 q-2 -4 1 -8" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M52 24 l-6 -3 M54 30 l-7 0" stroke="#7fd3ff" stroke-width="2" stroke-linecap="round"/>`);
const GES = () => HEN({ t1: '#cfd8dc', t2: '#eceff1', t3: '#b0bec5', body: '#ffffff', shade: '#e3e8ee', comb: '#ffb300', nocomb: true, beak: '#ff9800' },
  `<rect x="38" y="62" width="14" height="18" rx="2" fill="#37474f" ${S2}/><rect x="40" y="64" width="10" height="4" fill="#a5d6a7"/><path d="M41 72 h2 M45 72 h2 M41 76 h2 M45 76 h2" stroke="#cfd8dc" stroke-width="2" stroke-linecap="round"/>`,
  `<path d="M54 29 q14 -11 30 0 l-2 6 q-13 -6 -26 0 z" fill="#2e7d32" ${S}/><circle cx="69" cy="38" r="9" fill="none" ${S2}/><path d="M60 38 l-6 -2" ${S2}/>`);
const LODZIARZ = () => HEN({ t1: '#7fd3ff', t2: '#bfeaff', t3: '#4fc3f7', body: '#e1f3fb', shade: '#b7dff0', comb: '#4fc3f7', nocomb: true },
  '',
  `<path d="M56 29 l4 -13 h14 l4 13 z" fill="#fff" ${S}/><path d="M60 22 h14" stroke="#cfd8dc" stroke-width="1.6"/><path d="M30 66 l10 22 l10 -22 z" fill="#e9b872" ${S}/><circle cx="40" cy="62" r="8.5" fill="#f8bbd0" ${S}/><circle cx="40" cy="54" r="5.5" fill="#fff59d" ${S2}/><path d="M36 66 l8 0 M38 72 l4 0" stroke="#c28a45" stroke-width="1.6"/>`);
const PIELEGNIARKA = () => HEN({ t1: '#cfd8dc', t2: '#eceff1', t3: '#b0bec5', body: '#ffffff', shade: '#e3e8ee', comb: '#e53950', nocomb: true },
  `<path d="M38 60 q-5 15 9 17 q9 -2 6 -13" fill="none" stroke="#455a64" stroke-width="2.6" stroke-linecap="round"/><circle cx="53" cy="66" r="3.2" fill="#90a4ae" ${S2}/>`,
  `<path d="M55 28 q10 -14 23 -2 l-1 8 q-10 -5 -21 0 z" fill="#fff" ${S}/><path d="M67 18 v9 M62.5 22.5 h9" stroke="#e53950" stroke-width="3" stroke-linecap="round"/>`);
const RZEZNIK = () => HEN({ t1: '#5d1f17', t2: '#8e2f20', t3: '#c75b3c', body: '#a0402f', shade: '#7e2f22', comb: '#3e1a12' },
  `<path d="M33 60 h27 l-3 24 q-10 5 -21 0 z" fill="#f5f5f5" ${S}/><circle cx="42" cy="70" r="2.6" fill="#b71c1c"/><circle cx="51" cy="77" r="3.2" fill="#b71c1c"/><circle cx="46" cy="64" r="1.8" fill="#b71c1c"/>`,
  `<path d="M71 66 l16 -10 l5 7 l-16 11 z" fill="#cfd8dc" ${S2}/><path d="M70 70 l-6 7" stroke="#5d4037" stroke-width="4.5" stroke-linecap="round"/>`);
const WROZKA = () => HEN({ t1: '#6a1b9a', t2: '#ab47bc', t3: '#ce93d8', body: '#c9a0e6', shade: '#a577c9', comb: '#7b1fa2', nocomb: true },
  `<circle cx="46" cy="76" r="9.5" fill="#b3e5fc" fill-opacity=".85" ${S2}/><path d="M41 72 q3 -3 7 -1" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  `<path d="M54 31 q12 -17 27 -3 l-2 9 q-12 -6 -23 0 z" fill="#4527a0" ${S}/><circle cx="67" cy="23" r="3.6" fill="#ffd23f" ${S2}/><path d="M89 22 l1.8 4.5 l4.5 1.8 l-4.5 1.8 l-1.8 4.5 l-1.8 -4.5 l-4.5 -1.8 l4.5 -1.8z" fill="#ffd23f" ${S2}/>`);
const STAZYSTA = () => HEN({ t1: '#f2c94c', t2: '#ffe27a', t3: '#ffd34e', body: '#ffe27a', shade: '#f2c94c', comb: '#ff9d2e' },
  `<path d="M55 54 l-6 26" stroke="#1e88e5" stroke-width="2.6" stroke-linecap="round"/><rect x="41" y="76" width="11" height="13" rx="1.5" fill="#fff" ${S2}/><circle cx="46.5" cy="81" r="2.2" fill="#90caf9"/>`,
  `<circle cx="69" cy="38" r="9.5" fill="none" ${S2}/><path d="M59.5 38 l-5 -2" ${S2}/><path d="M58 56 l6 3 l-2 6 l-5 -2 z" fill="#c0392b" ${S2}/>`);
const MUTANT = () => HEN({ t1: '#7b1fa2', t2: '#00e5ff', t3: '#76ff03', body: '#a5d66f', shade: '#7cb342', comb: '#ff4081' },
  `<circle cx="38" cy="62" r="3.4" fill="#7b1fa2" opacity=".7"/><circle cx="52" cy="72" r="4.2" fill="#7b1fa2" opacity=".7"/><circle cx="44" cy="78" r="2.6" fill="#7b1fa2" opacity=".7"/>`,
  `${eye(56, 44, 4.2, 1)}<circle cx="86" cy="26" r="3" fill="#76ff03" opacity=".8" ${S2}/><circle cx="92" cy="34" r="2" fill="#00e5ff" opacity=".8"/>`);
const DINOZAUR = () => HEN({ t1: '#2e7d32', t2: '#558b2f', t3: '#9ccc65', body: '#66bb6a', shade: '#43a047', comb: '#ff7043', nocomb: true, beak: '#c8e6c9' },
  '',
  `<path d="M52 27 l3 -10 l5 9 z M60 24 l4 -11 l5 10 z M68 25 l5 -9 l4 9 z" fill="#ff7043" ${S2}/><path d="M33 52 l-3 -9 l7 3 z M26 60 l-6 -6 l9 0 z" fill="#ff7043" ${S2}/><path d="M80 49 l2 4 l2 -4 l2 4 l2 -4" stroke="#fff" stroke-width="2" fill="none" stroke-linejoin="round"/>`);
const NEWBODY = { barista: BARISTA, ges: GES, lodziarz: LODZIARZ, pielegniarka: PIELEGNIARKA, rzeznik: RZEZNIK, wrozka: WROZKA, stazysta: STAZYSTA, mutant: MUTANT, dinozaur: DINOZAUR };

// Akcesoria na formy postaci innych niż Pyrtek.
const HEADS = { kwoka: [68, 40], kaczor: [66, 38], indor: [68, 40], zjarany: [66, 40] };
const accessory = (char, form) => {
  const [hx, hy] = HEADS[char] || [66, 40];
  let a = '';
  if (form === 'bojowy' || form === 'rambo') a += `<ellipse cx="${hx - 28}" cy="${hy + 20}" rx="10" ry="7" fill="#8793a0" ${S}/><circle cx="${hx - 31}" cy="${hy + 19}" r="1.6" fill="#dfe6ee"/><circle cx="${hx - 24}" cy="${hy + 18}" r="1.6" fill="#dfe6ee"/>`;
  if (form === 'rambo') a += `<path d="M${hx - 14} ${hy - 6} q14 -9 28 -1 l0 7 q-14 -6 -28 1 z" fill="#d62828" ${S}/><path d="M${hx - 14} ${hy - 2} q-12 4 -16 14 q11 -5 19 -5 z" fill="#d62828" ${S}/>`;
  return a;
};

export function heroArt(char, form, opts = {}) {
  let body;
  if (char === 'pyrtek' || !char) body = ({ pyrtek: PYRTEK, kogut: KOGUT, bojowy: BOJOWY, rambo: RAMBO }[form] || PYRTEK)();
  else body = ({ kwoka: KWOKA, kaczor: KACZOR, indor: INDOR, zjarany: ZJARANY, ...NEWBODY }[char] || KOGUT)() + accessory(char, form);
  return svg(outfitWrap(body, opts.plain ? null : (opts.wear || OUTFIT)));
}
export const portrait = (char, form = 'pyrtek') => heroArt(char, form);

// ---------- Wybór postaci: jajka ----------
// Odblokowana postać to skorupa z postrzępionym brzegiem, z której wystaje kurczak; zablokowana to jeszcze nie pęknięte, szare jajo.
const EGG = 'M100 10 C152 10 184 92 184 142 C184 188 148 208 100 208 C52 208 16 188 16 142 C16 92 48 10 100 10 Z';
const RIM = 132;   // wysokość brzegu skorupy
const ZIG = [[0, 138], [20, 124], [38, 142], [58, 124], [78, 144], [100, 126], [122, 144], [142, 124], [162, 142], [180, 124], [200, 138]];
const CHICK = {   // [rozmiar kurczaka w jednostkach jajka, przesunięcie x]; spód rysunku (y≈88) chowa się 12 jednostek pod brzegiem skorupy
  pyrtek: [150, 0], kwoka: [158, 0], kaczor: [150, 0], indor: [162, -4], zjarany: [154, -2],
};
const BODIES = { pyrtek: PYRTEK, kwoka: KWOKA, kaczor: KACZOR, indor: INDOR, zjarany: ZJARANY, ...NEWBODY };
export function eggArt(char, open) {
  const id = 'egg-' + char;
  const zigPath = ZIG.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
  const below = zigPath + ' L200 230 L0 230 Z';
  const speck = (c) => [[52, 150, 5], [78, 176, 4], [128, 164, 6], [150, 140, 4], [104, 190, 3.5], [40, 172, 3], [160, 176, 3.5], [118, 142, 3]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .75}" fill="${c}" opacity=".55"/>`).join('');
  if (!open) {
    return `<svg class="egg" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><linearGradient id="${id}-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d6d3cc"/><stop offset="1" stop-color="#8f8b82"/></linearGradient></defs>
      <ellipse cx="100" cy="212" rx="62" ry="7" fill="#000" opacity=".35"/>
      <path d="${EGG}" fill="url(#${id}-g)" ${S}/>
      ${speck('#6f6b63')}
      <path d="M58 60 q10 -26 30 -34" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none" opacity=".45"/>
      ${char === 'zjarany' ? `<g class="wisps"><circle class="w1" cx="86" cy="10" r="9" fill="#e9e5dc" opacity=".0"/><circle class="w2" cx="104" cy="6" r="11" fill="#f1ede5" opacity=".0"/><circle class="w3" cx="94" cy="2" r="8" fill="#e9e5dc" opacity=".0"/></g>` : ''}
      <g transform="translate(100 134)"><rect x="-17" y="-2" width="34" height="28" rx="6" fill="#4a463f" ${S2}/><path d="M-10 -2 v-9 a10 10 0 0 1 20 0 v9" fill="none" stroke="#4a463f" stroke-width="6" stroke-linecap="round"/><circle cx="0" cy="10" r="4" fill="#d6d3cc"/><rect x="-1.6" y="11" width="3.2" height="9" rx="1.5" fill="#d6d3cc"/></g>
    </svg>`;
  }
  const [size, dx] = CHICK[char] || CHICK.pyrtek, sc = size / 100, x0 = 100 - 50 * sc + dx, y0 = RIM + 12 - 88 * sc;
  const indor = char === 'indor';
  // Indor: czerwone, zbyt duże pióra wystające zza skorupy i czerwony pas na jajku
  const feathers = indor ? `
    <path d="M40 124 q-40 -16 -30 -66 q22 12 40 50 z" fill="#c0392b" ${S}/>
    <path d="M60 112 q-34 -40 -8 -98 q20 26 30 86 z" fill="#8e1b12" ${S}/>
    <path d="M154 124 q42 -12 32 -62 q-24 10 -42 48 z" fill="#e4572e" ${S}/>
    <path d="M132 110 q26 -42 6 -96 q-22 24 -26 82 z" fill="#c0392b" ${S}/>` : '';
  const band = indor ? `<path d="M0 162 q100 22 200 0 v14 q-100 22 -200 0 z" fill="#c0392b" opacity=".9"/><path d="M0 162 q100 22 200 0" stroke="${O}" stroke-width="2.4" fill="none"/><path d="M0 176 q100 22 200 0" stroke="${O}" stroke-width="2.4" fill="none"/>` : '';
  return `<svg class="egg open ${indor ? 'power' : ''}" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <clipPath id="${id}-below"><path d="${below}"/></clipPath>
      <clipPath id="${id}-egg"><path d="${EGG}"/></clipPath>
      <linearGradient id="${id}-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff8e4"/><stop offset="1" stop-color="#e5cf9c"/></linearGradient>
    </defs>
    <ellipse cx="100" cy="212" rx="62" ry="7" fill="#000" opacity=".35"/>
    <ellipse cx="100" cy="${RIM + 2}" rx="68" ry="15" fill="#b99c63" ${S2}/>
    ${feathers}
    <svg x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${size}" height="${size}" viewBox="0 0 100 100">${BODIES[char]()}</svg>
    <g clip-path="url(#${id}-below)">
      <path d="${EGG}" fill="url(#${id}-g)" ${S}/>
      <g clip-path="url(#${id}-egg)">${speck('#c9a96b')}${band}</g>
      <path d="M40 158 q4 24 24 32" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none" opacity=".55"/>
    </g>
    <path d="${zigPath}" fill="none" ${S}/>
    <path d="M22 126 l-14 -10 l4 16 z M178 126 l16 -12 l-6 18 z" fill="#fff8e4" ${S2}/>
  </svg>`;
}

// ---------- Klatka schodowa (pasek pięter) ----------
// Zygzakowate schody: podesty na przemian po lewej i po prawej, bieg schodów między nimi. Ściana zmienia kolor ze strefą.
// Współrzędne w jednostkach interfejsu; piętro f ma podest o górnej krawędzi y(f). Tabliczki z numerami są w HTML (app.js).
export const ST = { W: 172, FH: 76, TOP: 64, BASE: 104, LX0: 64, LX1: 94, RX0: 138, RX1: 172 };
export function stairsGeom(n) {
  const y = f => ST.TOP + 24 + (n - f) * ST.FH;
  return { innerH: y(1) + ST.BASE, y, x: f => (f % 2 ? (ST.LX0 + ST.LX1) / 2 : ST.RX1 - 24) };
}
const ZWALL = ['#2c2723', '#222a31', '#321c1c'], ZBRICK = ['#1b1814', '#161c22', '#241313'];
const hsh = (n, k) => { let h = (n * 2654435761 + k * 40503) >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; return (h >>> 8) / 16777216; };
export function stairsArt(n, zoneOf) {
  const g = stairsGeom(n), W = ST.W, H = g.innerH, y = g.y;
  const stops = [];
  for (let f = n; f >= 1; f--) { const t0 = (y(f) - ST.FH * .5) / H, c = ZWALL[zoneOf(f)]; stops.push(`<stop offset="${Math.max(0, Math.min(1, t0)).toFixed(3)}" stop-color="${c}"/>`); }
  let wall = '', stairs = '';
  for (let f = 1; f <= n; f++) {
    const yt = y(f) - ST.FH, z = zoneOf(f), r1 = hsh(f, 1), r2 = hsh(f, 2), r3 = hsh(f, 3);
    // spoiny paneli ściany i detale: okno, lampa, tablica, obraz (strefa III)
    wall += `<path d="M0 ${y(f) + 12}H${W}" stroke="${ZBRICK[z]}" stroke-width="3" opacity=".9"/>`;
    for (let k = 0; k < 3; k++) wall += `<path d="M${(66 + hsh(f, 10 + k) * 96).toFixed(0)} ${yt + 14}v${ST.FH - 28}" stroke="${ZBRICK[z]}" stroke-width="2" opacity=".55"/>`;
    const wx = r1 < .5 ? 100 + r2 * 38 : 70 + r2 * 20;
    if (r3 < .5) wall += z === 2
      ? `<rect x="${wx.toFixed(0)}" y="${yt + 18}" width="20" height="26" rx="2" fill="#7a1f1f" stroke="#ffd23f" stroke-width="3"/><path d="M${(+wx + 4).toFixed(0)} ${yt + 38}l5 -9l4 6l3 -4l3 7z" fill="#ffd23f"/>`
      : `<rect x="${wx.toFixed(0)}" y="${yt + 18}" width="22" height="26" rx="3" fill="${z === 1 ? '#a8d5e2' : '#ffd27a'}" opacity=".85" stroke="#2b1a12" stroke-width="3"/><path d="M${(+wx + 11).toFixed(0)} ${yt + 18}v26M${wx.toFixed(0)} ${yt + 31}h22" stroke="#2b1a12" stroke-width="2"/>`;
    else if (r3 < .75) wall += `<circle cx="${(wx + 10).toFixed(0)}" cy="${yt + 26}" r="5" fill="#ffd27a" stroke="#2b1a12" stroke-width="2.4"/><path d="M${(wx + 10).toFixed(0)} ${yt + 8}v13" stroke="#2b1a12" stroke-width="2.4"/>`;
    else wall += `<rect x="${wx.toFixed(0)}" y="${yt + 26}" width="24" height="12" rx="2" fill="#4a3a2a" stroke="#2b1a12" stroke-width="2.4"/><path d="M${(+wx + 4).toFixed(0)} ${yt + 30}h16M${(+wx + 4).toFixed(0)} ${yt + 34}h10" stroke="#8a7a62" stroke-width="1.6"/>`;
    // podest piętra f (lewy dla nieparzystych)
    const left = f % 2 === 1, px0 = left ? ST.LX0 : ST.RX0, px1 = left ? ST.LX1 : ST.RX1, yl = y(f);
    stairs += `<rect x="${px0 + 2}" y="${yl + 10}" width="${px1 - px0}" height="8" fill="#000" opacity=".3"/><rect x="${px0}" y="${yl}" width="${px1 - px0}" height="12" rx="2" fill="#5b636c" stroke="#12161a" stroke-width="2.6"/><path d="M${px0 + 2} ${yl + 3}H${px1 - 2}" stroke="#c3cbd2" stroke-width="2.4" stroke-linecap="round"/>${[0.18, 0.5, 0.82].map(q => `<circle cx="${(px0 + (px1 - px0) * q).toFixed(1)}" cy="${yl + 8}" r="1.4" fill="#12161a"/>`).join('')}`;
    if (f < n) {
      // bieg schodów z piętra f na f+1
      const xs = left ? ST.LX1 : ST.RX0, xe = left ? ST.RX0 : ST.LX1, y0 = yl, y1 = y(f + 1), k = 8, dx = (xe - xs) / k, dy = (y1 - y0) / k;
      let top = `M${xs} ${y0}`; for (let i = 0; i < k; i++) top += `V${(y0 + dy * (i + 1)).toFixed(1)}H${(xs + dx * (i + 1)).toFixed(1)}`;
      const t = 10;
      stairs += `<path d="${top}L${xe} ${y1 + t}L${xs} ${y0 + t}Z" fill="#3a4048" stroke="#12161a" stroke-width="2.6" stroke-linejoin="round"/><path d="M${xs} ${y0 + t}L${xe} ${y1 + t}" stroke="#0c0f12" stroke-width="4" stroke-linecap="round"/>`;
      let tread = ''; for (let i = 1; i <= k; i++) tread += `M${(xs + dx * (i - 1) + Math.sign(dx) * 1).toFixed(1)} ${(y0 + dy * i + 2).toFixed(1)}H${(xs + dx * i - Math.sign(dx) * 1).toFixed(1)}`;
      stairs += `<path d="${tread}" stroke="#b4bdc5" stroke-width="2.6" stroke-linecap="round" fill="none"/>`;
      // poręcz
      let rail = `M${xs} ${y0 - 22}L${xe} ${y1 - 22}`, posts = ''; for (let i = 0; i <= k; i += 2) posts += `M${(xs + dx * i).toFixed(1)} ${(y0 + dy * i - 22).toFixed(1)}v22`;
      stairs += `<path d="${posts}" stroke="#0c0f12" stroke-width="2.6" stroke-linecap="round"/><path d="${rail}" stroke="#0c0f12" stroke-width="5" stroke-linecap="round"/><path d="${rail}" stroke="#d3dae0" stroke-width="2" stroke-linecap="round"/>`;
    }
  }
  // dół: posadzka nad paleniskiem; góra: wyjście na dach z koroną
  const yb = y(1) + 11;
  const base = `<rect x="0" y="${yb}" width="${W}" height="${H - yb}" fill="#150d08"/><path d="M0 ${yb}H${W}" stroke="#2b1a12" stroke-width="3"/><path d="M8 ${yb + 12}h40M60 ${yb + 12}h40M112 ${yb + 12}h48" stroke="#3a2a1d" stroke-width="3" stroke-linecap="round"/>`;
  const yt = y(n) - 62, topx = n % 2 ? ST.RX0 + 4 : ST.LX0 - 2;
  const roof = `<rect x="${topx}" y="${yt}" width="34" height="62" rx="4" fill="#2b1a12" stroke="#ffd23f" stroke-width="3"/><path d="M${topx + 17} ${yt + 4}v54" stroke="#4a3a2a" stroke-width="2"/><path d="M${topx + 3} ${yt - 16}l6 -10l8 8l8 -8l6 10z" fill="#ffd23f" stroke="#2b1a12" stroke-width="2.4" stroke-linejoin="round"/>`;
  return `<svg class="stairs-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="st-wall" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${H}">${stops.join('')}</linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#st-wall)"/>${wall}${base}${roof}${stairs}</svg>`;
}
// Płomień u dołu klatki (rośnie z każdym piętrem) i języczek pod kurczakiem.
export const flamesArt = () => `<svg class="flames" viewBox="0 0 168 110" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="fl-g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e4572e"/><stop offset=".6" stop-color="#ff9a2e"/><stop offset="1" stop-color="#ffd23f"/></linearGradient></defs>
  ${[[4, 54, 62, 0], [30, 96, 46, 1], [58, 70, 70, 2], [88, 92, 52, 3], [114, 66, 64, 4], [140, 90, 48, 5]].map(([x, h, w, i]) => `<path class="ft ft${i}" d="M${x} 112 C${x - 6} ${112 - h * .5} ${x + w * .1} ${112 - h * .62} ${x + w * .22} ${112 - h} C${x + w * .34} ${112 - h * .62} ${x + w * .78} ${112 - h * .5} ${x + w} 112Z" fill="url(#fl-g)" stroke="#2b1a12" stroke-width="2.4" stroke-linejoin="round"/>`).join('')}
  <path class="ft ft6" d="M70 112 C64 80 76 74 82 52 C90 74 104 82 98 112Z" fill="#ffe27a" opacity=".85"/></svg>`;
export const emberArt = () => `<svg class="ember" viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="ft" d="M20 51 C6 48 4 36 12 26 C14 32 18 32 18 24 C20 14 28 12 28 2 C38 14 40 26 34 38 C32 46 28 50 20 51Z" fill="url(#fl-g)" stroke="#2b1a12" stroke-width="2.4" stroke-linejoin="round"/><path d="M20 49 C14 46 15 38 20 32 C25 38 26 46 20 49Z" fill="#ffe27a" opacity=".9"/></svg>`;

// ---------- Wrogowie i bossowie (patrzą w lewo, w stronę bohatera) ----------
const ENEMY = {
  duck: () => `
    <path d="M80 62 q16 -2 14 -14 q-8 6 -16 4 z" fill="#f4e3b1" ${S}/>
    <ellipse cx="58" cy="66" rx="28" ry="20" fill="#f4e3b1" ${S}/>
    <path d="M48 62 q10 10 26 4" stroke="#d8c48a" stroke-width="3" ${NF} stroke-linecap="round"/>
    <circle cx="34" cy="40" r="15" fill="#f4e3b1" ${S}/>
    <path d="M22 44 q-14 0 -16 6 q8 4 18 0 z" fill="#ff9f1c" ${S}/>
    ${eye(30, 36, 5.5, -1.5)}${brow(24, 28, 36, 31)}
    <rect x="60" y="34" width="10" height="16" rx="2" fill="#e53950" ${S2} transform="rotate(20 65 42)"/>
    <path d="M70 30 q-4 -8 2 -14 q2 6 6 6 q-2 4 -8 8z" fill="#ff7a3d" ${S2}/>
    <path d="M70 27 q-1 -4 2 -6 q0 3 2 3 q-1 2 -4 3z" fill="#ffd166"/>
    <path d="M48 86 v7 m-6 0 h12 M66 86 v7 m-6 0 h12" stroke="#ff9f1c" stroke-width="4" stroke-linecap="round"/>`,
  zombie: () => `
    <path d="M30 84 v9 m-6 1 h12 M54 84 v9 m-6 1 h12" stroke="#8fb3c9" stroke-width="4.5" stroke-linecap="round"/>
    <ellipse cx="46" cy="64" rx="27" ry="24" fill="#d7ecf7" ${S}/>
    <path d="M28 54 l6 4 l-4 4 M58 74 l6 -2 l-2 6" stroke="#7fb4d4" stroke-width="2.4" ${NF} stroke-linecap="round"/>
    <path d="M70 58 q14 -4 18 6 q-10 2 -18 2 z" fill="#c6e3f2" ${S}/>
    <circle cx="36" cy="34" r="16" fill="#d7ecf7" ${S}/>
    <path d="M28 18 q-2 -10 6 -10 q0 -8 8 -4 q8 -2 6 8 q-6 4 -20 6z" fill="#9ccfe8" ${S2}/>
    <path d="M20 36 l-12 3 l12 4 z" fill="#ffd27a" ${S2}/>
    <circle cx="30" cy="31" r="5" fill="#fff" ${S2}/><path d="M27 28 l6 6 M33 28 l-6 6" stroke="${O}" stroke-width="1.8"/>
    <circle cx="42" cy="30" r="4.5" fill="#fff" ${S2}/><circle cx="41" cy="31" r="2" fill="${O}"/>
    <path d="M14 70 l6 -4 M76 82 l6 4 M64 22 l4 -4 M70 30 l6 -2" stroke="#bfeaff" stroke-width="2.4" stroke-linecap="round"/>`,
  vulture: () => `
    <path d="M62 50 q30 -10 34 18 q-14 -4 -26 6 z" fill="#5d4037" ${S}/>
    <ellipse cx="56" cy="66" rx="24" ry="22" fill="#6d4c41" ${S}/>
    <path d="M36 50 q-6 -4 -2 -12 q8 -2 12 6 z" fill="#efe6dc" ${S2}/>
    <path d="M40 44 q-6 -14 4 -20" stroke="${O}" stroke-width="9" ${NF} stroke-linecap="round"/><path d="M40 44 q-6 -14 4 -20" stroke="#f2b8a0" stroke-width="5.5" ${NF} stroke-linecap="round"/>
    <circle cx="38" cy="22" r="11" fill="#f2b8a0" ${S}/>
    <path d="M28 22 q-12 0 -12 10 q6 -2 12 -4 z" fill="#ffd166" ${S2}/>
    ${eye(36, 19, 5, -1.5)}${brow(30, 12, 42, 14)}
    <rect x="42" y="64" width="22" height="16" rx="2" fill="#fff" ${S2}/><path d="M46 69 h14 M46 74 h10" stroke="#90a4ae" stroke-width="2"/>
    <circle cx="33" cy="20" r="6.5" fill="none" stroke="${O}" stroke-width="1.8"/>
    <path d="M48 88 v6 m-5 0 h10 M64 88 v6 m-5 0 h10" stroke="#ffd166" stroke-width="4" stroke-linecap="round"/>`,
  rat: () => `
    <path d="M86 70 q16 -6 8 -24" ${S} ${NF} stroke-width="3.5"/>
    <ellipse cx="54" cy="68" rx="30" ry="22" fill="#9aa0a8" ${S}/>
    <circle cx="32" cy="46" r="11" fill="#b9bfc7" ${S}/><circle cx="48" cy="40" r="11" fill="#b9bfc7" ${S}/>
    <circle cx="32" cy="46" r="5.5" fill="#f4a6b0"/><circle cx="48" cy="40" r="5.5" fill="#f4a6b0"/>
    <path d="M22 70 q-8 -4 -12 0 q4 8 14 6 z" fill="#f4a6b0" ${S}/>
    ${eye(28, 62, 5.5, -1.5)}<circle cx="12" cy="70" r="2.6" fill="${O}"/>
    <path d="M10 76 l-9 -3 M11 79 l-10 3" stroke="${O}" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M40 88 v6 m-5 0 h10 M66 88 v6 m-5 0 h10" stroke="#f4a6b0" stroke-width="4" stroke-linecap="round"/>`,
  mouse: () => `
    <path d="M88 76 q14 -4 8 -20" ${S} ${NF} stroke-width="3"/>
    <ellipse cx="56" cy="72" rx="26" ry="18" fill="#b6a99a" ${S}/>
    <circle cx="36" cy="54" r="9" fill="#cfc4b6" ${S}/><circle cx="50" cy="50" r="9" fill="#cfc4b6" ${S}/>
    <circle cx="36" cy="54" r="4.5" fill="#f4b6bd"/><circle cx="50" cy="50" r="4.5" fill="#f4b6bd"/>
    <path d="M28 66 q-8 -2 -12 3 q3 8 13 6 z" fill="#f4b6bd" ${S}/>${eye(32, 66, 4.5, -1)}
    <path d="M44 62 l20 4 l-2 14 l-20 -4 z" fill="#f4c542" ${S2}/><path d="M50 66 l4 8 M58 68 l-2 8" stroke="#2b1a12" stroke-width="1.6"/>
    <path d="M30 40 q14 -10 30 -4 l-2 6 q-14 -4 -26 2 z" fill="#f4c542" ${S2}/>
    <path d="M42 88 v6 m-4 0 h8 M64 88 v6 m-4 0 h8" stroke="#f4b6bd" stroke-width="3.6" stroke-linecap="round"/>`,
  fox: () => `
    <path d="M84 72 q22 -8 12 -36 q-22 6 -16 30 z" fill="#e67e22" ${S}/><path d="M92 40 q4 10 0 16 q-8 -6 0 -16 z" fill="#fff"/>
    <ellipse cx="56" cy="68" rx="28" ry="22" fill="#e67e22" ${S}/><path d="M36 70 q10 14 26 8 q-6 -14 -26 -8 z" fill="#fff3e0" ${S2}/>
    <path d="M24 40 l8 -18 l10 14 z" fill="#e67e22" ${S}/><path d="M42 36 l10 -18 l8 18 z" fill="#e67e22" ${S}/>
    <circle cx="42" cy="50" r="16" fill="#e67e22" ${S}/><path d="M30 56 q10 12 24 0 q-10 -4 -24 0 z" fill="#fff3e0" ${S2}/>
    <circle cx="22" cy="54" r="4" fill="${O}"/>${eye(38, 46, 5.5, -1.5)}${brow(30, 38, 46, 42)}
    <rect x="52" y="72" width="22" height="16" rx="3" fill="#8d6e63" ${S2}/><rect x="58" y="68" width="10" height="5" rx="2" fill="none" ${S2}/>
    <path d="M44 88 v6 m-5 0 h10 M66 88 v6 m-5 0 h10" stroke="#5d4037" stroke-width="4" stroke-linecap="round"/>`,
  dog: () => `
    <path d="M88 60 q14 -8 6 -20 q-12 4 -10 18 z" fill="#8d5524" ${S}/>
    <rect x="30" y="52" width="56" height="34" rx="14" fill="#8d5524" ${S}/>
    <path d="M18 34 q-6 14 4 22 q8 -4 6 -20 z" fill="#5d3a1a" ${S}/>
    <rect x="12" y="38" width="38" height="30" rx="12" fill="#a0652d" ${S}/>
    <ellipse cx="18" cy="54" rx="10" ry="8" fill="#e8c9a0" ${S}/><circle cx="12" cy="52" r="3.2" fill="${O}"/>
    ${eye(34, 48, 5.5, -1.5)}${brow(27, 40, 41, 43)}
    <path d="M14 60 q4 4 8 0" ${S2} ${NF}/>
    <path d="M30 70 q10 6 22 0 l0 6 q-12 6 -22 0 z" fill="#555" ${S2}/><path d="M34 70 l2 -4 l3 4 M42 72 l2 -4 l3 4" fill="#ccc" stroke="${O}" stroke-width="1.6"/>
    <path d="M52 84 q-22 8 -44 4" stroke="#777" stroke-width="3" ${NF} stroke-dasharray="4 3"/>
    <path d="M36 84 v10 m-6 0 h12 M72 84 v10 m-6 0 h12" stroke="#5d3a1a" stroke-width="5" stroke-linecap="round"/>`,
  forklift: () => `
    <rect x="50" y="34" width="8" height="54" fill="#546e7a" ${S2}/><rect x="14" y="72" width="40" height="6" rx="2" fill="#b0bec5" ${S2}/><rect x="14" y="80" width="40" height="5" rx="2" fill="#b0bec5" ${S2}/>
    <rect x="58" y="54" width="34" height="28" rx="4" fill="#f4c542" ${S}/><path d="M62 54 l10 -18 h14 l4 18 z" fill="#f4c542" ${S}/>
    <path d="M70 46 l5 -8 h8 l2 8 z" fill="#b3e5fc" ${S2}/>
    <rect x="22" y="56" width="26" height="16" rx="2" fill="#a47551" ${S2}/><path d="M22 64 h26 M35 56 v16" stroke="${O}" stroke-width="1.6"/>
    <circle cx="68" cy="86" r="9" fill="#37474f" ${S}/><circle cx="68" cy="86" r="3.5" fill="#cfd8dc"/><circle cx="88" cy="86" r="7" fill="#37474f" ${S}/><circle cx="88" cy="86" r="3" fill="#cfd8dc"/>
    <path d="M78 40 q-2 -6 2 -8" stroke="#c0392b" stroke-width="3" stroke-linecap="round" ${NF}/><circle cx="78" cy="38" r="2.6" fill="#e74c3c"/>
    <rect x="76" y="56" width="10" height="7" rx="2" fill="#37474f"/><path d="M78 60 h6" stroke="#f4c542" stroke-width="1.6"/>`,
  snowman: () => `
    <circle cx="52" cy="76" r="20" fill="#f1f8ff" ${S}/><circle cx="52" cy="48" r="15" fill="#f1f8ff" ${S}/><circle cx="52" cy="24" r="11" fill="#f1f8ff" ${S}/>
    <path d="M30 40 q22 12 44 0 l0 8 q-22 12 -44 0 z" fill="#c0392b" ${S2}/><path d="M66 46 q10 10 4 22 q-8 -6 -8 -20 z" fill="#c0392b" ${S2}/>
    <circle cx="48" cy="22" r="2.4" fill="${O}"/><circle cx="58" cy="22" r="2.4" fill="${O}"/><path d="M42 30 q10 5 20 0" ${S2} ${NF}/>
    <path d="M52 26 l-16 4 l16 3 z" fill="#ff8c2b" ${S2}/>
    <path d="M42 8 l5 -8 l5 6 l5 -6 l5 8 z" fill="#8ecae6" ${S2}/>
    <path d="M38 54 l-16 -8 M66 54 l16 -10" stroke="#6d4c41" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="52" cy="62" r="2" fill="${O}"/><circle cx="52" cy="72" r="2" fill="${O}"/><circle cx="52" cy="82" r="2" fill="${O}"/>`,
  robot: () => `
    <path d="M52 92 l-6 -8 h26 l-6 8 z" fill="#78909c" ${S2}/>
    <ellipse cx="56" cy="56" rx="30" ry="34" fill="#b0bec5" ${S}/>
    <ellipse cx="56" cy="56" rx="22" ry="26" fill="none" stroke="#78909c" stroke-width="2"/>
    <rect x="32" y="42" width="48" height="26" rx="8" fill="#263238" ${S2}/>
    <circle cx="46" cy="55" r="6" fill="#4dd0e1"/><circle cx="66" cy="55" r="6" fill="#4dd0e1"/><circle cx="47.5" cy="53" r="1.8" fill="#fff"/><circle cx="67.5" cy="53" r="1.8" fill="#fff"/>
    <path d="M44 63 h24" stroke="#4dd0e1" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M56 22 v-12 M50 10 h12" ${S2} ${NF}/><circle cx="56" cy="8" r="3.5" fill="#e74c3c" ${S2}/>
    <path d="M26 56 q-12 2 -14 12 M86 56 q12 2 14 12" stroke="#78909c" stroke-width="5" stroke-linecap="round" ${NF}/>
    <path d="M40 82 l2 8 h-8 z M72 82 l2 8 h-8 z" fill="#546e7a" ${S2}/>`,
  cat: () => `
    <path d="M84 66 q18 -4 12 -26" ${S} ${NF} stroke-width="5" stroke="#1b1b22"/><path d="M84 66 q18 -4 12 -26" ${NF} stroke="#2e2e38" stroke-width="2"/>
    <ellipse cx="56" cy="70" rx="26" ry="22" fill="#2a2a34" ${S}/><path d="M50 56 l6 14 l6 -14 z" fill="#fff" ${S2}/><path d="M56 62 l-3 10 l3 8 l3 -8 z" fill="#c0392b" ${S2}/>
    <path d="M26 38 l6 -18 l10 12 z" fill="#2a2a34" ${S}/><path d="M48 32 l10 -14 l6 18 z" fill="#2a2a34" ${S}/>
    <circle cx="44" cy="48" r="17" fill="#2a2a34" ${S}/>
    <rect x="28" y="42" width="30" height="9" rx="4" fill="#0b0b0f" ${S2}/><path d="M32 44 l8 0" stroke="#7aa2c8" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M18 52 l-6 -2 M18 56 l-7 2" stroke="#e8e8e8" stroke-width="1.8" stroke-linecap="round"/><circle cx="26" cy="55" r="2.6" fill="#f4a6b0"/>
    <path d="M60 46 q8 4 6 14" stroke="#e8e8e8" stroke-width="2" ${NF}/>
    <path d="M42 88 v6 m-5 0 h10 M68 88 v6 m-5 0 h10" stroke="#1b1b22" stroke-width="5" stroke-linecap="round"/>`,
  canary: () => `
    <path d="M70 66 q22 6 24 -8 q-14 -2 -24 2 z" fill="#f6d743" ${S}/>
    <ellipse cx="54" cy="64" rx="26" ry="24" fill="#ffe45e" ${S}/><path d="M60 54 q14 4 12 20 q-14 4 -22 -6 z" fill="#f3c935" ${S}/>
    <circle cx="40" cy="42" r="15" fill="#ffe45e" ${S}/><path d="M30 28 q4 -12 12 -8 q4 -10 10 -2" ${S} ${NF}/>
    <path d="M22 46 l-13 4 l13 5 z" fill="#ff8c2b" ${S}/>
    <circle cx="35" cy="42" r="7" fill="#fff" fill-opacity=".6" ${S2}/><circle cx="49" cy="42" r="7" fill="#fff" fill-opacity=".6" ${S2}/><path d="M42 42 h0" ${S2}/>
    <circle cx="34" cy="43" r="2.2" fill="${O}"/><circle cx="48" cy="43" r="2.2" fill="${O}"/>
    <path d="M50 56 l5 4 l-2 14 l-8 -2 z" fill="#c0392b" ${S2}/>
    <rect x="62" y="66" width="20" height="14" rx="2" fill="#37474f" ${S2}/><rect x="65" y="69" width="14" height="4" fill="#9ccc65"/><path d="M66 76 h2 M72 76 h2 M78 76 h0" stroke="#cfd8dc" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M44 86 v8 m-5 0 h10 M62 86 v8 m-5 0 h10" stroke="#ff8c2b" stroke-width="4" stroke-linecap="round"/>`,
  intern: () => `
    <path d="M44 84 v8 m-5 0 h10 M62 84 v8 m-5 0 h10" stroke="#ff8c2b" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="54" cy="62" rx="26" ry="25" fill="#ffe08a" ${S}/><path d="M60 58 q12 4 10 18 q-14 4 -20 -6 z" fill="#f3c94a" ${S}/>
    <path d="M42 36 q-4 -10 2 -14 M48 35 q0 -12 7 -13" ${S} ${NF}/>
    ${eye(40, 52, 8, -2)}<path d="M26 56 l-12 4 l12 5 z" fill="#ff8c2b" ${S}/>
    <rect x="46" y="68" width="22" height="12" rx="2" fill="#fff" ${S2}/><path d="M50 72 h14 M50 76 h9" stroke="#c0392b" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M70 70 h14 v14 q0 4 -4 4 h-6 q-4 0 -4 -4 z" fill="#fff" ${S2}/><path d="M84 74 q8 1 6 8 q-2 3 -6 2" ${S2} ${NF}/><path d="M74 66 q2 -5 0 -8 M80 66 q2 -5 0 -8" stroke="#bbb" stroke-width="2" stroke-linecap="round" ${NF}/>`,
  broiler: () => `
    <path d="M40 86 v8 m-8 0 h16 M66 86 v8 m-8 0 h16" stroke="#e8902a" stroke-width="5.5" stroke-linecap="round"/>
    <path d="M86 64 q16 -4 10 -22 q-14 4 -10 22 z" fill="#f2e8d0" ${S}/>
    <ellipse cx="52" cy="62" rx="36" ry="30" fill="#fbf5e4" ${S}/>
    <path d="M40 58 q-2 16 14 22 q18 -8 6 -26 z" fill="#efe3c2" ${S}/>
    <circle cx="34" cy="38" r="18" fill="#fbf5e4" ${S}/>
    <path d="M20 30 q14 -16 32 0 l-2 6 q-14 -8 -28 0 z" fill="#f4c542" ${S}/><rect x="16" y="32" width="40" height="6" rx="3" fill="#f4a41c" ${S}/>
    <path d="M36 14 q4 -5 8 0" ${S2} ${NF}/>
    <path d="M17 44 l-14 4 l14 6 z" fill="#ffb02e" ${S}/>
    ${eye(30, 44, 6, -1.5)}${brow(23, 38, 37, 41)}
    <rect x="52" y="50" width="26" height="30" rx="3" fill="#a47551" ${S2}/><rect x="58" y="46" width="14" height="7" rx="2" fill="#d7ccc8" ${S2}/><path d="M57 60 h16 M57 66 h16 M57 72 h10" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    <circle cx="26" cy="62" r="5" fill="#c0392b" ${S2}/><path d="M31 62 h10" stroke="#c0392b" stroke-width="2.4"/>`,
  plucker: () => `
    <rect x="6" y="80" width="88" height="10" rx="3" fill="#455a64" ${S2}/><path d="M12 85 h76" stroke="#90a4ae" stroke-width="2" stroke-dasharray="6 5"/>
    <rect x="14" y="20" width="72" height="62" rx="8" fill="#78909c" ${S}/><rect x="22" y="28" width="56" height="30" rx="5" fill="#37474f" ${S2}/>
    <circle cx="38" cy="43" r="9" fill="none" stroke="#ffb74d" stroke-width="3"/><path d="M38 34 v18 M29 43 h18 M31.5 36.5 l13 13 M44.5 36.5 l-13 13" stroke="#ffb74d" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="62" cy="43" r="9" fill="none" stroke="#ffb74d" stroke-width="3"/><path d="M62 34 v18 M53 43 h18 M55.5 36.5 l13 13 M68.5 36.5 l-13 13" stroke="#ffb74d" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="26" y="64" width="48" height="10" rx="3" fill="#263238" ${S2}/><circle cx="34" cy="69" r="2.4" fill="#e74c3c"/><circle cx="44" cy="69" r="2.4" fill="#f4c542"/><circle cx="54" cy="69" r="2.4" fill="#66bb6a"/>
    <path d="M28 14 q-4 -8 2 -12 M50 14 q-4 -8 2 -12 M70 14 q-4 -8 2 -12" stroke="#cfd8dc" stroke-width="3" stroke-linecap="round" ${NF}/>
    <path d="M22 90 l-6 -10 M78 90 l6 -10" ${S2} ${NF}/>`,
  boss: () => `
    <path d="M36 88 v6 m-8 0 h16 M66 88 v6 m-8 0 h16" stroke="#e8902a" stroke-width="5.5" stroke-linecap="round"/>
    <path d="M88 70 q14 -2 8 -20 q-16 6 -8 20 z" fill="#6b1d2a" ${S}/>
    <ellipse cx="52" cy="66" rx="34" ry="26" fill="#2c2f4a" ${S}/><path d="M46 46 l6 30 l6 -30 z" fill="#fff" ${S2}/><path d="M52 52 l-5 8 l5 24 l5 -24 z" fill="#c0392b" ${S2}/>
    <circle cx="40" cy="34" r="17" fill="#c0392b" ${S}/><path d="M30 20 q-2 -10 6 -8 q2 -8 9 -2 q8 -1 5 8 z" fill="#8e1b1b" ${S}/>
    <path d="M26 6 h30 l-3 14 h-24 z" fill="#37474f" ${S}/><rect x="22" y="18" width="38" height="6" rx="3" fill="#455a64" ${S}/><path d="M30 6 q-4 -6 0 -10 M42 6 q-4 -8 0 -12 M52 6 q-3 -6 1 -10" stroke="#e0e0e0" stroke-width="2.6" stroke-linecap="round" ${NF}/>
    <path d="M26 36 l-14 4 l14 6 z" fill="#ffb02e" ${S}/>
    <circle cx="36" cy="32" r="8" fill="#fff" ${S2}/><circle cx="34" cy="33" r="3.6" fill="${O}"/><circle cx="36" cy="32" r="9.6" fill="none" stroke="#f4c542" stroke-width="2.2"/><path d="M44 42 q6 10 4 22" stroke="#f4c542" stroke-width="1.6" ${NF}/>
    ${brow(28, 24, 44, 29)}
    <path d="M80 44 v40" stroke="#b0bec5" stroke-width="4.5" stroke-linecap="round"/><circle cx="80" cy="40" r="9" fill="#cfd8dc" ${S2}/><path d="M80 31 v18" ${S2}/>`,
};
ENEMY.intern2 = ENEMY.intern;

export function enemyArt(key, tint) { return svg((ENEMY[key] || ENEMY.rat)(), '0 0 100 100', 'fig enemy-fig' + (tint ? ' tint-' + tint : '')); }

// ---------- Towarzysze (małe figurki obok bohatera w walce, w Schronisku i w panelu) ----------
const COMP = {
  pisklak: () => `<ellipse cx="50" cy="92" rx="22" ry="4" fill="rgba(0,0,0,.3)"/><path d="M40 84 v8 m-5 0 h10 M60 84 v8 m-5 0 h10" stroke="#ff8c2b" stroke-width="4" stroke-linecap="round" ${NF}/>
    <ellipse cx="50" cy="62" rx="26" ry="24" fill="#ffd34e" ${S}/><path d="M28 62 q-4 14 10 17 q9 -5 3 -18 z" fill="#f2b82e" ${S2}/>
    ${eye(60, 54, 8, 2)}${brow(52, 46, 68, 50)}<path d="M72 60 l12 3 l-12 5 z" fill="#ff8c2b" ${S2}/><path d="M42 38 q-2 -10 4 -12 M50 37 q2 -11 9 -10" ${S2} ${NF}/>`,
  trzmiel: () => `<ellipse cx="50" cy="92" rx="20" ry="4" fill="rgba(0,0,0,.3)"/>
    <ellipse cx="38" cy="38" rx="14" ry="20" fill="#cfe9ff" opacity=".85" ${S2} transform="rotate(-25 38 38)"/><ellipse cx="62" cy="38" rx="14" ry="20" fill="#cfe9ff" opacity=".85" ${S2} transform="rotate(25 62 38)"/>
    <ellipse cx="50" cy="64" rx="30" ry="24" fill="#ffcc33" ${S}/><path d="M36 44 q-4 20 0 40 M50 41 v46 M64 44 q4 20 0 40" stroke="${O}" stroke-width="7" ${NF}/>
    <circle cx="74" cy="60" r="14" fill="#ffcc33" ${S}/>${eye(78, 57, 6, 1)}<path d="M82 46 q6 -8 12 -6 M76 46 q2 -10 8 -12" ${S2} ${NF}/><path d="M42 58 h10 M46 54 v8" stroke="#e53935" stroke-width="3.4" stroke-linecap="round"/>`,
  salamandra: () => `<ellipse cx="50" cy="92" rx="30" ry="4" fill="rgba(0,0,0,.3)"/>
    <path d="M14 78 q-12 -16 4 -30 q-2 12 8 16 z" fill="#ff7043" ${S2}/><path d="M12 56 q-6 -12 2 -20 q2 8 8 10 z" fill="#ffd54f" ${S2}/>
    <ellipse cx="50" cy="72" rx="32" ry="16" fill="#ff8a3d" ${S}/><path d="M30 78 h40" stroke="#ffd29a" stroke-width="5" stroke-linecap="round"/>
    <path d="M32 84 l-4 8 M44 86 l-2 8 M58 86 l2 8 M70 84 l4 8" stroke="${O}" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="76" cy="56" rx="18" ry="14" fill="#ff8a3d" ${S}/>${eye(82, 50, 6, 1)}<path d="M88 62 q4 2 6 -1" ${S2} ${NF}/><path d="M62 58 q4 -14 12 -16" ${S2} ${NF}/>`,
  balwanek: () => `<ellipse cx="50" cy="92" rx="26" ry="4" fill="rgba(0,0,0,.3)"/>
    <circle cx="50" cy="70" r="24" fill="#f4fbff" ${S}/><circle cx="50" cy="38" r="17" fill="#f4fbff" ${S}/>
    <path d="M36 24 h28 l-3 -12 h-22 z" fill="#37474f" ${S2}/><rect x="32" y="22" width="36" height="5" rx="2" fill="#546e7a" ${S2}/>
    <circle cx="44" cy="36" r="2.8" fill="${O}"/><circle cx="56" cy="36" r="2.8" fill="${O}"/><path d="M50 40 l14 3 l-14 3 z" fill="#ff9800" ${S2}/>
    <circle cx="50" cy="62" r="2.6" fill="${O}"/><circle cx="50" cy="74" r="2.6" fill="${O}"/><path d="M28 62 l-12 -8 M72 62 l12 -8" ${S} ${NF}/>`,
  gasior: () => `<ellipse cx="50" cy="92" rx="24" ry="4" fill="rgba(0,0,0,.3)"/><path d="M42 84 v8 m-5 0 h10 M60 84 v8 m-5 0 h10" stroke="#ff9800" stroke-width="4" stroke-linecap="round" ${NF}/>
    <path d="M30 70 q-8 -10 2 -16 q14 -6 28 4 q10 8 2 24 q-14 8 -32 -12z" fill="#fff" ${S}/><path d="M60 60 q10 -4 12 -22 q2 -14 12 -12" stroke="${O}" stroke-width="12" stroke-linecap="round" ${NF}/>
    <path d="M60 60 q10 -4 12 -22 q2 -14 12 -12" stroke="#fff" stroke-width="7" stroke-linecap="round" ${NF}/>
    <circle cx="86" cy="26" r="9" fill="#fff" ${S}/>${eye(88, 24, 4, 1)}<path d="M94 26 l9 3 l-9 4 z" fill="#ff9800" ${S2}/><path d="M32 70 q10 6 22 0" stroke="#e0e0e0" stroke-width="3" ${NF}/>`,
  kot: () => `<ellipse cx="50" cy="92" rx="24" ry="4" fill="rgba(0,0,0,.3)"/>
    <path d="M24 66 q-14 -4 -10 -22 q8 6 14 4 z" fill="#ff9d4d" ${S2}/><ellipse cx="50" cy="68" rx="26" ry="22" fill="#ffb066" ${S}/>
    <path d="M26 34 l6 -16 l12 10 z M74 34 l-6 -16 l-12 10 z" fill="#ffb066" ${S}/><circle cx="50" cy="42" r="22" fill="#ffb066" ${S}/>
    <ellipse cx="42" cy="40" rx="5" ry="6.5" fill="#fff" ${S2}/><ellipse cx="58" cy="40" rx="5" ry="6.5" fill="#fff" ${S2}/><ellipse cx="43" cy="41" rx="2" ry="4.4" fill="${O}"/><ellipse cx="59" cy="41" rx="2" ry="4.4" fill="${O}"/>
    <path d="M47 50 l3 3 l3 -3 z" fill="#ff7a7a" ${S2}/><path d="M22 46 h12 M22 52 l12 -2 M78 46 h-12 M78 52 l-12 -2" stroke="${O}" stroke-width="1.8"/>
    <circle cx="74" cy="76" r="9" fill="#ffc933" ${S2}/><path d="M74 71 v10 M70 76 h8" stroke="${O}" stroke-width="2.2" stroke-linecap="round"/>`,
};
export function companionArt(id) { return svg((COMP[id] || COMP.pisklak)(), '0 0 100 100', 'fig comp-fig'); }
// Duch innego gracza: jego postać w widmowej poświacie (zwrócona w stronę bohatera).
export function ghostArt(char, wear) { return `<span class="ghostfig">${heroArt(char, 'kogut', { wear: wear || {} })}</span>`; }
// Ikony tras, Klątw i budynków Kurnika to emoji w kółku (spójne z resztą dzięki ramce w CSS).
export const EMO = { chlodnia: '❄️', kotlownia: '🔥', magazyn: '📦', kanaly: '🌀', sortownia: '🥚',
  zakaz: '⛔', piec: '🌋', drzemka: '💤', podatek: '💸', gniazdo: '🧺', pospiech: '⏱️', mgla: '🌫️', kosci: '🦴',
  spizarnia: '🌾', gabinet: '🩺', silownia: '💪', skarbiec: '🏆', kantyna: '🍲', szkola: '📚', pisklecarnia: '🐣', pioro: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 3 C9 3 5 10 5 17 l-2 4 l3 -1.5 C7 20 8 19 9 18 C16 18 21 12 20 3z" fill="#ffd34e" stroke="#2b1a12" stroke-width="1.6" stroke-linejoin="round"/><path d="M5 20 L14 11" stroke="#2b1a12" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>', dogrywka: '♾️', duch: '👻' };
export const emo = id => `<span class="emo ${String(EMO[id] || '').startsWith('<svg') ? 'emo-svg' : ''}" aria-hidden="true">${EMO[id] || '❔'}</span>`;

// ---------- Ikony kafelków (48x48) ----------
const I = (inner) => svg(inner, '0 0 48 48', 'ico');
const k = (fill, extra = '') => `fill="${fill}" ${S2} ${extra}`;
const ICON = {
  // Etap 2: nowe umiejętności i przedmioty
  'wrzatek-z-kotla': `<path d="M8 22 h32 l-3 18 q-13 6 -26 0 z" ${k('#455a64')}/><path d="M6 22 h36" stroke="${O}" stroke-width="3" ${NF} stroke-linecap="round"/><path d="M16 16 q-4 -5 0 -9 M24 16 q-4 -5 0 -11 M32 16 q-4 -5 0 -9" stroke="#fff" stroke-width="3" ${NF} stroke-linecap="round"/><path d="M12 30 h24" stroke="#ff7a3d" stroke-width="3" ${NF} stroke-linecap="round"/>`,
  'podpalka': `<path d="M24 4 C34 14 38 22 34 32 C32 40 16 40 14 32 C10 24 16 20 18 12 C21 16 22 18 24 4z" ${k('#ff7a3d')}/><path d="M24 20 C30 26 30 34 24 38 C18 34 18 28 24 20z" ${k('#ffd23f')}/><path d="M10 44 h28" stroke="${O}" stroke-width="3" ${NF} stroke-linecap="round"/>`,
  'mrozny-powiew': `<path d="M6 18 q10 -8 20 0 t14 -2 M6 28 q10 -8 20 0 t14 -2 M6 38 q10 -8 20 0 t14 -2" stroke="#7fd3ff" stroke-width="4" ${NF} stroke-linecap="round"/><path d="M38 6 v12 M32 12 h12 M34 8 l8 8 M42 8 l-8 8" stroke="#fff" stroke-width="2.4" ${NF} stroke-linecap="round"/>`,
  'sopel-w-plecy': `<path d="M10 4 h28 l-6 6 l-4 10 l-3 24 l-3 -24 l-4 -10 z" ${k('#bfeaff')}/><path d="M22 10 l2 22" stroke="#fff" stroke-width="3" ${NF} stroke-linecap="round"/>`,
  'zakwas-babci': `<rect x="10" y="14" width="28" height="28" rx="5" ${k('#c5d86d')}/><rect x="13" y="6" width="22" height="8" rx="2" ${k('#e9dcc0')}/><circle cx="20" cy="26" r="4" fill="#7a8a2e"/><circle cx="30" cy="32" r="3" fill="#7a8a2e"/><circle cx="27" cy="22" r="2" fill="#fff"/>`,
  'wyrywanie-pazurow': `<path d="M10 6 q4 18 2 36 M22 4 q4 20 0 38 M34 6 q4 18 -2 36" stroke="#e53950" stroke-width="6" ${NF} stroke-linecap="round"/><path d="M10 6 q4 18 2 36 M22 4 q4 20 0 38 M34 6 q4 18 -2 36" stroke="#ffd0d6" stroke-width="2" ${NF} stroke-linecap="round"/>`,
  'jajeczny-wir': `<ellipse cx="16" cy="18" rx="7" ry="9" ${k('#fff3d6')}/><ellipse cx="32" cy="14" rx="6" ry="8" ${k('#fff3d6')}/><ellipse cx="28" cy="32" rx="7" ry="9" ${k('#fff3d6')}/><path d="M6 36 q8 6 14 -2 M38 26 q4 6 -2 12" stroke="${O}" stroke-width="2.4" ${NF} stroke-linecap="round"/>`,
  'garsc-ziarna': `<path d="M8 24 q16 -8 32 0 q-2 14 -16 16 q-14 -2 -16 -16z" ${k('#e9c46a')}/><path d="M18 8 q4 8 0 14 M26 6 q4 8 0 14 M34 10 q3 6 0 12" stroke="#ffc933" stroke-width="4" ${NF} stroke-linecap="round"/>`,
  'zwolnienie-dyscyplinarne': `<path d="M10 4 h22 l8 8 v32 h-30z" ${k('#fff')}/><path d="M15 16 h18 M15 22 h18" stroke="${O}" stroke-width="2.4" ${NF}/><path d="M12 36 l24 -8" stroke="#e53950" stroke-width="5" ${NF} stroke-linecap="round"/><path d="M16 38 q8 -4 16 -8" stroke="#e53950" stroke-width="1" ${NF}/>`,
  'kurze-pogotowie': `<rect x="6" y="8" width="36" height="32" rx="6" ${k('#fff')}/><path d="M24 14 v20 M14 24 h20" stroke="#e53950" stroke-width="7" ${NF} stroke-linecap="round"/>`,
  'wywar-dnia': `<path d="M10 18 h28 v18 q-14 8 -28 0z" ${k('#e4572e')}/><path d="M14 12 q-3 -5 0 -8 M24 12 q-3 -5 0 -10 M34 12 q-3 -5 0 -8" stroke="#fff" stroke-width="2.6" ${NF} stroke-linecap="round"/><circle cx="20" cy="27" r="3" fill="#ffd23f"/><circle cx="30" cy="31" r="2.4" fill="#8bc34a"/>`,
  'tlusta-pokrywka': `<ellipse cx="24" cy="26" rx="20" ry="9" ${k('#b0bec5')}/><path d="M10 26 q0 -14 14 -14 q14 0 14 14" ${k('#cfd8dc')}/><circle cx="24" cy="9" r="4" ${k('#455a64')}/><path d="M14 30 q4 6 8 0 M26 31 q4 5 8 -1" stroke="#ffc933" stroke-width="3" ${NF} stroke-linecap="round"/>`,
  'szczypta-soli': `<path d="M12 14 h24 l-3 26 h-18z" ${k('#e0f2f1')}/><rect x="10" y="8" width="28" height="8" rx="3" ${k('#90a4ae')}/><circle cx="20" cy="24" r="1.8" fill="${O}"/><circle cx="28" cy="28" r="1.8" fill="${O}"/><circle cx="22" cy="33" r="1.8" fill="${O}"/><circle cx="30" cy="20" r="1.8" fill="${O}"/>`,
  'lodowa-spodnica': `<path d="M16 6 h16 l10 34 h-36z" ${k('#bfeaff')}/><path d="M16 6 h16" stroke="${O}" stroke-width="3" ${NF}/><path d="M14 20 l-2 18 M24 14 v26 M34 20 l2 18" stroke="#fff" stroke-width="2.4" ${NF} stroke-linecap="round"/>`,
  'szron-poranny': `<circle cx="34" cy="14" r="8" ${k('#ffe08a')}/><path d="M4 36 h40" stroke="${O}" stroke-width="3" ${NF} stroke-linecap="round"/><path d="M12 36 v-12 M12 30 l-5 -4 M12 30 l5 -4 M24 36 v-16 M24 28 l-6 -5 M24 28 l6 -5" stroke="#7fd3ff" stroke-width="3" ${NF} stroke-linecap="round"/>`,
  'jajko-niespodzianka': `<ellipse cx="24" cy="26" rx="14" ry="17" ${k('#e53950')}/><circle cx="18" cy="20" r="3" fill="#fff"/><circle cx="30" cy="30" r="3" fill="#ffd23f"/><circle cx="26" cy="18" r="2" fill="#fff"/><path d="M20 36 q4 3 8 0" stroke="#fff" stroke-width="2.4" ${NF} stroke-linecap="round"/><path d="M36 6 l2 5 l5 1 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -1z" fill="#ffd23f" stroke="${O}" stroke-width="1.4"/>`,
  'kura-nioska': `<path d="M8 40 q-2 -16 12 -20 q4 -10 14 -6 q6 4 2 10 q8 4 6 16z" ${k('#fff3d6')}/><path d="M26 14 q2 -8 8 -8 q-1 6 -4 9" ${k('#e53950')}/><circle cx="30" cy="20" r="1.8" fill="${O}"/><path d="M36 22 l7 3 l-7 3z" ${k('#ffb347')}/><ellipse cx="22" cy="43" rx="6" ry="3.4" ${k('#fffaf0')}/>`,
  'kombajn-zbozowy': `<rect x="14" y="10" width="26" height="18" rx="3" ${k('#ffc933')}/><rect x="6" y="28" width="36" height="8" rx="2" ${k('#e4572e')}/><circle cx="14" cy="40" r="5" ${k('#455a64')}/><circle cx="34" cy="40" r="5" ${k('#455a64')}/><path d="M18 14 h14 v8 h-14z" ${k('#bfeaff')}/><path d="M6 24 l-2 -10 M10 24 l-1 -8" stroke="#e9c46a" stroke-width="3" ${NF} stroke-linecap="round"/>`,
  'spichlerz': `<path d="M6 24 L24 6 L42 24 v18 h-36z" ${k('#c68642')}/><rect x="17" y="26" width="14" height="16" ${k('#7a4b1d')}/><path d="M24 26 v16" stroke="${O}" stroke-width="2"/><circle cx="24" cy="17" r="3" ${k('#ffe08a')}/>`,
  'strach-na-wroble': `<path d="M24 4 v40" stroke="${O}" stroke-width="4" ${NF} stroke-linecap="round"/><path d="M4 20 h40" stroke="${O}" stroke-width="4" ${NF} stroke-linecap="round"/><circle cx="24" cy="12" r="7" ${k('#ffe08a')}/><path d="M16 8 h16 l-8 -6z" ${k('#7a4b1d')}/><path d="M20 12 h1 M27 12 h1 M21 16 q3 2 6 0" stroke="${O}" stroke-width="2" ${NF} stroke-linecap="round"/><path d="M14 22 l-6 10 M34 22 l6 10" stroke="#e9c46a" stroke-width="3" ${NF} stroke-linecap="round"/>`,
  'karabin-maszynowy': `<path d="M4 22 h30 v8 h-30z" ${k('#78909c')}/><path d="M34 24 h10 v4 h-10z" ${k('#455a64')}/><path d="M10 30 l-3 12 h8 l2 -12" ${k('#5d4037')}/><rect x="18" y="30" width="8" height="10" ${k('#455a64')}/><path d="M40 12 l3 -4 M44 18 l4 -2 M38 16 l4 4" stroke="#ffd23f" stroke-width="3" ${NF} stroke-linecap="round"/>`,
  'apteczka-polowa': `<rect x="6" y="12" width="36" height="28" rx="5" ${k('#6b8e23')}/><path d="M18 12 v-4 h12 v4" stroke="${O}" stroke-width="2.4" ${NF}/><path d="M24 18 v16 M16 26 h16" stroke="#fff" stroke-width="6" ${NF} stroke-linecap="round"/>`,
  'sluzbowy-samochod': `<path d="M4 30 q2 -12 12 -12 h14 q8 0 12 12 v6 h-38z" ${k('#1e88e5')}/><path d="M14 20 h10 v8 h-14z M26 20 h6 q4 2 6 8 h-12z" ${k('#bfeaff')}/><circle cx="14" cy="38" r="5" ${k('#455a64')}/><circle cx="34" cy="38" r="5" ${k('#455a64')}/><rect x="20" y="10" width="8" height="5" rx="1" ${k('#ffd23f')}/>`,
  'open-space': `<rect x="4" y="6" width="40" height="36" rx="3" ${k('#cfd8dc')}/><path d="M24 6 v36 M4 24 h40" stroke="${O}" stroke-width="2"/><rect x="8" y="10" width="12" height="8" ${k('#90a4ae')}/><rect x="28" y="10" width="12" height="8" ${k('#90a4ae')}/><rect x="8" y="28" width="12" height="8" ${k('#90a4ae')}/><rect x="28" y="28" width="12" height="8" ${k('#90a4ae')}/><circle cx="14" cy="14" r="2" fill="${O}"/><circle cx="34" cy="32" r="2" fill="${O}"/>`,
  // Etap 3: ryzyko i legendarne przedmioty
  'pozyczka-chwilowka': `<circle cx="24" cy="24" r="18" ${k('#ffd23f')}/><path d="M24 12 v24 M18 18 q0 -4 6 -4 q6 0 6 4 q0 4 -6 5 q-6 1 -6 5 q0 4 6 4 q6 0 6 -4" stroke="${O}" stroke-width="2.6" ${NF} stroke-linecap="round"/><path d="M36 8 l4 4 M40 8 l-4 4" stroke="#e53950" stroke-width="3" ${NF} stroke-linecap="round"/>`,
  'dopalacz-z-biedronki': `<rect x="16" y="10" width="16" height="32" rx="4" ${k('#e53950')}/><rect x="19" y="4" width="10" height="7" rx="2" ${k('#455a64')}/><path d="M16 22 h16 M16 30 h16" stroke="#fff" stroke-width="3" ${NF}/><path d="M36 12 l5 -4 M38 20 l6 -1 M36 28 l5 3" stroke="#ffd23f" stroke-width="3" ${NF} stroke-linecap="round"/>`,
  'nadgodziny-bez-doplaty': `<circle cx="24" cy="26" r="17" ${k('#fff')}/><path d="M24 14 v12 l8 5" stroke="${O}" stroke-width="3" ${NF} stroke-linecap="round"/><path d="M10 8 l-4 -3 M38 8 l4 -3" stroke="${O}" stroke-width="3" ${NF} stroke-linecap="round"/><path d="M32 36 l8 8 M40 36 l-8 8" stroke="#e53950" stroke-width="3" ${NF} stroke-linecap="round"/>`,
  'dieta-cud': `<path d="M6 20 q18 -14 36 0 q-2 8 -6 10 h-24 q-4 -2 -6 -10z" ${k('#e9c46a')}/><path d="M8 34 h32 v6 q-16 6 -32 0z" ${k('#c68642')}/><path d="M10 26 q14 6 28 0" stroke="#8bc34a" stroke-width="3" ${NF} stroke-linecap="round"/>`,
  'uklad-z-zarzadem': `<path d="M4 26 l12 -10 l8 6 l8 -6 l12 10 l-10 10 l-6 -4 l-4 4 l-4 -4 l-6 4z" ${k('#b0bec5')}/><path d="M16 16 l-4 -10 M32 16 l4 -10" stroke="${O}" stroke-width="3" ${NF} stroke-linecap="round"/><rect x="18" y="38" width="12" height="6" rx="1" ${k('#ffd23f')}/>`,
  'los-na-loterii': `<path d="M8 10 h32 v10 q-4 0 -4 4 q0 4 4 4 v10 h-32 v-10 q4 0 4 -4 q0 -4 -4 -4z" ${k('#7bd88f')}/><path d="M18 18 l3 6 l-6 -2 l8 -1 l-5 6" stroke="${O}" stroke-width="2" ${NF} stroke-linecap="round"/><path d="M30 16 v16 M27 19 h6 M27 29 h6" stroke="${O}" stroke-width="2.4" ${NF} stroke-linecap="round"/>`,
  'zloty-rosolek': `<path d="M8 20 h32 l-4 20 q-12 6 -24 0z" ${k('#ffd23f')}/><path d="M6 20 h36" stroke="${O}" stroke-width="3" ${NF} stroke-linecap="round"/><circle cx="16" cy="10" r="3" fill="#ff7a3d"/><circle cx="24" cy="8" r="3" fill="#7fd3ff"/><circle cx="32" cy="10" r="3" fill="#9ccc65"/><circle cx="24" cy="15" r="2.4" fill="#e53950"/><path d="M14 28 h20" stroke="#fff3b0" stroke-width="3" ${NF} stroke-linecap="round"/>`,
  'kogut-alfa': `<path d="M10 42 q-4 -16 6 -22 q-2 -12 8 -12 q4 -6 10 0 q8 2 6 12 q8 6 4 22z" ${k('#e4572e')}/><path d="M22 6 q-6 -4 -6 -4 q0 6 4 8 M28 6 q6 -4 6 -4 q0 6 -4 8" stroke="${O}" stroke-width="2.4" ${NF} stroke-linecap="round"/><circle cx="20" cy="20" r="2.4" fill="#fff"/><circle cx="30" cy="20" r="2.4" fill="#fff"/><path d="M22 26 l3 5 l3 -5z" ${k('#ffb347')}/><path d="M40 8 l2 5 l5 1 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -1z" fill="#ffd23f" stroke="${O}" stroke-width="1.4"/>`,
  'jajko-dinozaura': `<ellipse cx="24" cy="26" rx="15" ry="18" ${k('#c5e1a5')}/><path d="M14 22 l5 5 l-3 4 M30 18 l-3 6 l5 3 M20 38 l4 -6 l5 5" stroke="${O}" stroke-width="2.4" ${NF} stroke-linecap="round" stroke-linejoin="round"/><circle cx="18" cy="20" r="2.6" fill="#558b2f"/><circle cx="30" cy="30" r="3.2" fill="#558b2f"/><path d="M24 4 l2 5 l-4 0z" ${k('#ffd23f')}/>`,
  'plan-b': `<rect x="6" y="6" width="36" height="36" rx="7" ${k('#455a64')}/><path d="M16 14 h9 q6 0 6 5 q0 5 -6 5 h-9z M16 24 h10 q6 0 6 5 q0 5 -6 5 h-10z M16 14 v20" stroke="#ffd23f" stroke-width="3" ${NF} stroke-linejoin="round"/>`,
  'akcje-zarzadu': `<rect x="6" y="8" width="36" height="32" rx="4" ${k('#263238')}/><path d="M10 34 l10 -10 l6 6 l12 -16" stroke="#7bd88f" stroke-width="4" ${NF} stroke-linecap="round" stroke-linejoin="round"/><path d="M32 14 h8 v8" stroke="#7bd88f" stroke-width="4" ${NF} stroke-linecap="round" stroke-linejoin="round"/>`,
  'dziob-mistrza': `<path d="M5 26 L36 8 L44 22 L36 38 Z" ${k('#ffd23f')}/><path d="M10 25 L35 12" stroke="#fff" stroke-width="3" ${NF} stroke-linecap="round"/><path d="M20 6 l2 5 l5 1 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -1z" fill="#fff" stroke="${O}" stroke-width="1.4"/><path d="M26 40 q6 -6 14 0" stroke="${O}" stroke-width="2.4" ${NF} stroke-linecap="round"/>`,
  'dinozaur': `<path d="M6 36 q-2 -14 12 -16 q4 -10 14 -6 l6 -6 l2 8 q-2 4 -6 6 q6 6 4 14z" ${k('#7cb342')}/><path d="M14 14 l4 6 M22 12 l3 6 M30 12 l2 5" stroke="${O}" stroke-width="2.4" ${NF} stroke-linecap="round"/><circle cx="34" cy="14" r="2.2" fill="#fff"/><path d="M36 20 l6 2 l-5 3z" fill="#fff" stroke="${O}" stroke-width="1.4"/><path d="M6 36 q-6 2 -4 6" stroke="${O}" stroke-width="2.4" ${NF} stroke-linecap="round"/>`,
  // Kafelki rosnące
  'pierze-weterana': `<path d="M40 5 Q14 8 9 40 l5 3 Q18 18 40 5z" ${k('#e9dcc0')}/><path d="M12 41 L30 15 M16 30 l9 2 M20 24 l9 1 M24 19 l8 0" stroke="${O}" stroke-width="1.8" ${NF}/><path d="M23 10 l9 9 M27 8 l8 8" stroke="#e53950" stroke-width="3" stroke-linecap="round"/>`,
  'trofeum-z-pior': `<path d="M15 22 q-5 -13 3 -18 q3 9 -1 18z" ${k('#ffc933')}/><path d="M23 22 q-1 -15 6 -19 q2 11 -3 19z" ${k('#e53950')}/><path d="M30 22 q4 -11 11 -12 q-2 9 -8 12z" ${k('#7fd3ff')}/><rect x="9" y="21" width="30" height="22" rx="4" ${k('#8d6e63')}/><circle cx="24" cy="32" r="5" ${k('#ffc933')}/><path d="M24 29 v6 M21 32 h6" stroke="${O}" stroke-width="1.6"/>`,
  'skarbonka-piskleca': `<ellipse cx="23" cy="29" rx="16" ry="13" ${k('#ffd166')}/><rect x="18" y="14" width="10" height="3.4" rx="1.7" fill="${O}"/><circle cx="31" cy="25" r="2.2" fill="${O}"/><path d="M38 27 l7 2.5 l-7 2.5z" ${k('#ff9f1c')}/><path d="M15 41 v4 M29 41 v4" stroke="${O}" stroke-width="3" stroke-linecap="round"/><path d="M10 25 q-5 -2 -4 -7 q5 1 6 5" ${k('#ffe08a')}/>`,
  'automat-z-pasza': `<rect x="8" y="4" width="32" height="40" rx="4" ${k('#e53950')}/><rect x="13" y="9" width="22" height="18" rx="2" ${k('#bfeaff')}/><circle cx="18" cy="15" r="2.4" fill="#ffc933" stroke="${O}" stroke-width="1"/><circle cx="26" cy="20" r="2.4" fill="#ffc933" stroke="${O}" stroke-width="1"/><circle cx="30" cy="13" r="2.4" fill="#ffc933" stroke="${O}" stroke-width="1"/><rect x="13" y="32" width="14" height="6" rx="1" fill="${O}"/><circle cx="33" cy="35" r="3" ${k('#ffc933')}/>`,
  'kontrakt-hr': `<path d="M10 4 h22 l8 8 v32 h-30z" ${k('#fff')}/><path d="M32 4 v8 h8" stroke="${O}" stroke-width="2" ${NF}/><path d="M15 16 h16 M15 22 h18 M15 28 h12" stroke="#90a4ae" stroke-width="2"/><path d="M14 38 q4 -6 8 0 q4 6 8 -2 q2 -3 6 0" stroke="#1e88e5" stroke-width="2.2" ${NF} stroke-linecap="round"/>`,
  'arena-duchow': `<path d="M24 4 C13 4 8 12 8 22 v18 l5 -4 l5 4 l6 -4 l6 4 l5 -4 l5 4 V22 C40 12 35 4 24 4z" fill="#e8f4ff" stroke="${O}" stroke-width="2.6" stroke-linejoin="round"/><circle cx="18" cy="21" r="3.4" fill="${O}"/><circle cx="30" cy="21" r="3.4" fill="${O}"/><path d="M19 30 q5 4 10 0" stroke="${O}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M4 14 l8 8 M44 14 l-8 8" stroke="#9fd8ff" stroke-width="3" stroke-linecap="round"/>`,
  'schronisko': `<path d="M6 24 L24 8 L42 24 V42 H6 Z" ${k('#c58a5a')}/><path d="M4 25 L24 6 L44 25" stroke="${O}" stroke-width="2.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/><circle cx="24" cy="31" r="8" fill="#ffd34e" stroke="${O}" stroke-width="2"/><circle cx="27" cy="29" r="1.8" fill="${O}"/><path d="M30 31 l5 1.5 l-5 2z" fill="#ff8c2b" stroke="${O}" stroke-width="1.2"/><path d="M14 42 v-8 h6" stroke="${O}" stroke-width="2" fill="none"/>`,
  'kapliczka': `<path d="M8 20 L24 6 L40 20 Z" ${k('#8d6e63')}/><rect x="12" y="20" width="24" height="22" ${k('#f1e9d6')}/><path d="M20 42 v-12 q4 -4 8 0 v12" fill="#ffd166" stroke="${O}" stroke-width="2"/><path d="M24 2 v6 M21 4 h6" stroke="#ffc933" stroke-width="2.4" stroke-linecap="round"/><circle cx="24" cy="25" r="3" fill="#ff9f1c" stroke="${O}" stroke-width="1.2"/>`,
  'umowa-etat': `<path d="M10 4 h22 l8 8 v32 h-30z" ${k('#fff3d6')}/><path d="M15 16 h16 M15 22 h18 M15 28 h12" stroke="#b08968" stroke-width="2"/><circle cx="31" cy="35" r="6" ${k('#e53950')}/>`,
  'umowa-b2b': `<path d="M10 4 h22 l8 8 v32 h-30z" ${k('#e3f2fd')}/><path d="M15 16 h16 M15 22 h18 M15 28 h12" stroke="#5c8db8" stroke-width="2"/><text x="17" y="40" font-family="monospace" font-weight="700" font-size="9" fill="${O}">B2B</text>`,
  'jajko-na-twardo': `<ellipse cx="24" cy="27" rx="15" ry="18" ${k('#fff3d6')}/><ellipse cx="24" cy="31" rx="8" ry="8" fill="#ffc933" stroke="${O}" stroke-width="1.6"/><path d="M10 10 q3 -5 6 0 M20 6 q3 -5 6 0 M30 10 q3 -5 6 0" stroke="#ff7a3d" stroke-width="2.6" ${NF} stroke-linecap="round"/><path d="M6 30 l-4 2 M42 30 l4 2 M8 40 l-4 4 M40 40 l4 4" stroke="#e4572e" stroke-width="2.4" stroke-linecap="round"/>`,
  'termos': `<rect x="14" y="10" width="20" height="34" rx="6" ${k('#e53950')}/><rect x="14" y="27" width="20" height="17" rx="6" ${k('#7fd3ff')}/><rect x="17" y="4" width="14" height="7" rx="2" ${k('#90a4ae')}/><path d="M38 14 q-3 -4 0 -8 M42 18 q-3 -4 0 -8" stroke="#ff7a3d" stroke-width="2" ${NF} stroke-linecap="round"/><path d="M8 32 v8 M4 36 h8" stroke="#7fd3ff" stroke-width="2" stroke-linecap="round"/>`,
  'ostrogi-rzeznika': `<path d="M6 40 C14 28 26 18 42 6 C36 22 28 32 14 44z" ${k('#90a4ae')}/><path d="M10 36 L36 12" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M14 44 l-6 -6" stroke="${O}" stroke-width="2"/><path d="M30 30 q3 6 0 10 M36 26 q3 6 0 10 M42 22 q3 6 0 10" stroke="#e53950" stroke-width="3" ${NF} stroke-linecap="round"/>`,
  'zloty-spadochron': `<path d="M4 22 q20 -24 40 0 q-5 -5 -10 0 q-5 -5 -10 0 q-5 -5 -10 0 q-5 -5 -10 0z" ${k('#ffc933')}/><path d="M4 22 L20 38 M14 22 L21 38 M34 22 L27 38 M44 22 L28 38" stroke="${O}" stroke-width="1.6"/><rect x="18" y="36" width="12" height="9" rx="2" ${k('#8d6e63')}/>`,
  'spojrzenie-rambo': `<path d="M2 18 q22 -10 44 0 v8 q-22 -6 -44 0z" ${k('#d62828')}/><path d="M6 26 h14 q0 9 -7 9 q-7 0 -7 -9z M28 26 h14 q0 9 -7 9 q-7 0 -7 -9z" ${k('#263238')}/><path d="M20 28 h8" stroke="${O}" stroke-width="2.4"/><path d="M10 28 l4 4 M32 28 l4 4" stroke="#ffc933" stroke-width="2"/>`,
  'kurtka-puchowa': `<path d="M14 6 h20 l8 10 v26 h-36 v-26z" ${k('#7fd3ff')}/><path d="M24 6 v36" stroke="${O}" stroke-width="2"/><path d="M6 20 h36 M6 30 h36" stroke="#e3f2fd" stroke-width="3"/><path d="M6 20 h36 M6 30 h36" stroke="${O}" stroke-width="1" opacity=".5"/><path d="M18 6 q6 6 12 0" stroke="${O}" stroke-width="2" fill="#fff"/>`,
  'kompostownik': `<path d="M8 16 h32 l-4 28 h-24z" ${k('#6d4c41')}/><path d="M6 16 h36" stroke="${O}" stroke-width="3" stroke-linecap="round"/><path d="M12 22 h24 M13 30 h22 M14 38 h20" stroke="#4e342e" stroke-width="2"/><path d="M14 10 q3 -5 6 0 q3 5 6 0 q3 -5 6 0" stroke="#9ccc65" stroke-width="2.6" ${NF} stroke-linecap="round"/><circle cx="20" cy="27" r="2.4" fill="#9ccc65"/><circle cx="29" cy="34" r="2" fill="#9ccc65"/>`,
  'feniks-z-rosolu': `<path d="M24 42 C10 34 6 20 10 8 C16 18 20 20 24 20 C28 20 32 18 38 8 C42 20 38 34 24 42z" ${k('#ff7a3d')}/><path d="M24 36 C16 30 14 22 16 16 C20 22 22 24 24 24 C26 24 28 22 32 16 C34 22 32 30 24 36z" fill="#ffd166" stroke="${O}" stroke-width="1.4"/><circle cx="24" cy="14" r="4" ${k('#ffc933')}/><path d="M28 14 l4 -1" stroke="${O}" stroke-width="2"/>`,
  'zepsute-jajo': `<ellipse cx="24" cy="26" rx="14" ry="18" ${k('#fff3d6')}/><path d="M12 22 l5 4 l4 -5 l5 6 l4 -4 l5 5" stroke="${O}" stroke-width="2" ${NF} stroke-linejoin="round"/><circle cx="19" cy="33" r="3" fill="#9ccc65"/><circle cx="28" cy="35" r="2.4" fill="#9ccc65"/><path d="M14 8 q3 -4 6 0 M28 6 q3 -4 6 0" stroke="#9ccc65" stroke-width="2.2" ${NF} stroke-linecap="round"/>`,
  'mokra-pasza': `<path d="M8 18 q16 -8 32 0 v20 q-16 6 -32 0z" ${k('#b08968')}/><path d="M8 18 q16 6 32 0" stroke="${O}" stroke-width="2" ${NF}/><circle cx="16" cy="28" r="2" fill="#ffc933"/><circle cx="26" cy="30" r="2" fill="#ffc933"/><circle cx="32" cy="25" r="2" fill="#ffc933"/><path d="M14 6 q-3 4 0 6 q3 -2 0 -6z M24 3 q-3 4 0 6 q3 -2 0 -6z M34 6 q-3 4 0 6 q3 -2 0 -6z" fill="#9ccc65" stroke="${O}" stroke-width="1.2"/>`,
  'kolczatka': `<circle cx="24" cy="24" r="14" fill="none" stroke="${O}" stroke-width="7"/><circle cx="24" cy="24" r="14" fill="none" stroke="#8d6e63" stroke-width="4"/><path d="M24 4 l3 6 h-6z M24 44 l3 -6 h-6z M4 24 l6 3 v-6z M44 24 l-6 3 v-6z M10 10 l6 2 l-2 2z M38 38 l-6 -2 l2 -2z M38 10 l-2 6 l-2 -2z M10 38 l2 -6 l2 2z" fill="#cfd8dc" stroke="${O}" stroke-width="1.4" stroke-linejoin="round"/>`,
  'chochla': `<path d="M30 4 L22 28" stroke="${O}" stroke-width="6" stroke-linecap="round"/><path d="M30 4 L22 28" stroke="#b0bec5" stroke-width="3" stroke-linecap="round"/><path d="M8 28 h26 q0 14 -13 14 q-13 0 -13 -14z" ${k('#b0bec5')}/><path d="M11 30 h20 q-2 8 -10 8 q-8 0 -10 -8z" fill="#ffb347"/><path d="M38 20 q-3 -4 0 -8 M43 24 q-3 -4 0 -8" stroke="#ff7a3d" stroke-width="2.2" ${NF} stroke-linecap="round"/>`,
  'kostka-rosolowa': `<path d="M8 18 l16 -8 l16 8 v16 l-16 8 l-16 -8z" ${k('#ffc933')}/><path d="M8 18 l16 8 l16 -8 M24 26 v16" stroke="${O}" stroke-width="2" ${NF}/><path d="M14 22 l6 3 M28 25 l6 -3" stroke="#d99a00" stroke-width="2" stroke-linecap="round"/><path d="M24 8 q-3 -3 0 -6" stroke="#ff7a3d" stroke-width="2" ${NF} stroke-linecap="round"/>`,
  'lubczyk': `<path d="M24 44 V18" stroke="#558b2f" stroke-width="3"/><path d="M24 30 q-14 -2 -16 -14 q12 0 16 14z M24 24 q14 -2 16 -14 q-12 0 -16 14z M24 18 q-6 -8 0 -14 q6 6 0 14z" ${k('#7cb342')}/><path d="M24 30 l-10 -10 M24 24 l10 -10" stroke="#33691e" stroke-width="1.4"/>`,
  'garnek-cisnieniowy': `<path d="M8 18 h32 v18 q0 6 -6 6 h-20 q-6 0 -6 -6z" ${k('#90a4ae')}/><path d="M6 18 h36" stroke="${O}" stroke-width="3" stroke-linecap="round"/><rect x="20" y="10" width="8" height="8" rx="2" ${k('#e53950')}/><path d="M24 10 V4 M18 6 l-3 -3 M30 6 l3 -3" stroke="#ff7a3d" stroke-width="2.4" stroke-linecap="round"/><circle cx="24" cy="29" r="6" ${k('#fff')}/><path d="M24 29 l3 -3" stroke="${O}" stroke-width="2"/>`,
  'kostka-lodu': `<path d="M8 16 l16 -8 l16 8 v18 l-16 8 l-16 -8z" ${k('#bfeaff')}/><path d="M8 16 l16 8 l16 -8 M24 24 v18" stroke="${O}" stroke-width="2" ${NF}/><path d="M12 20 l8 4 M14 28 l4 2" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`,
  'termometr': `<rect x="19" y="4" width="10" height="30" rx="5" ${k('#fff')}/><circle cx="24" cy="37" r="8" ${k('#7fd3ff')}/><path d="M24 14 v20" stroke="#7fd3ff" stroke-width="4" stroke-linecap="round"/><path d="M31 10 h5 M31 16 h4 M31 22 h5" stroke="${O}" stroke-width="1.8"/>`,
  'zamrazarka': `<rect x="9" y="4" width="30" height="40" rx="4" ${k('#e3f2fd')}/><path d="M9 18 h30" stroke="${O}" stroke-width="2.4"/><path d="M33 9 v5 M33 23 v8" stroke="${O}" stroke-width="3" stroke-linecap="round"/><path d="M20 26 v12 M15 29 l10 6 M15 35 l10 -6" stroke="#7fd3ff" stroke-width="2" stroke-linecap="round"/>`,
  'szron': `<path d="M10 40 C10 24 22 10 38 6 C36 20 26 34 10 40z" ${k('#e3f2fd')}/><path d="M10 40 L32 12" stroke="${O}" stroke-width="2" ${NF}/><path d="M18 22 l-4 -2 M22 18 l-2 -4 M26 26 l4 2 M30 20 l4 0" stroke="#7fd3ff" stroke-width="2.4" stroke-linecap="round"/><path d="M38 30 v10 M33 35 h10" stroke="#7fd3ff" stroke-width="2" stroke-linecap="round"/>`,
  'teczka': `<rect x="5" y="14" width="38" height="26" rx="4" ${k('#8d6e63')}/><path d="M17 14 v-5 h14 v5" stroke="${O}" stroke-width="3" ${NF}/><path d="M5 24 h38" stroke="${O}" stroke-width="2"/><rect x="20" y="21" width="8" height="6" rx="1" ${k('#ffc933')}/>`,
  'krawat': `<path d="M19 4 h10 l-2 7 h-6z" ${k('#c62828')}/><path d="M21 11 h6 l6 24 l-9 9 l-9 -9z" ${k('#e53950')}/><path d="M18 20 l12 6 M17 28 l14 6" stroke="#ffcdd2" stroke-width="2"/>`,
  'polisa': `<path d="M10 4 h22 l8 8 v32 h-30z" ${k('#fff')}/><path d="M32 4 v8 h8" stroke="${O}" stroke-width="2" ${NF}/><path d="M15 18 h18 M15 24 h18 M15 30 h10" stroke="#90a4ae" stroke-width="2"/><circle cx="32" cy="35" r="6" ${k('#e53950')}/><path d="M29 35 l2 2 l4 -4" stroke="#fff" stroke-width="2" ${NF}/>`,
  'premia-kwartalna': `<rect x="4" y="12" width="34" height="22" rx="3" ${k('#8bc34a')}/><rect x="10" y="16" width="34" height="22" rx="3" ${k('#aed581')}/><circle cx="27" cy="27" r="6" ${k('#ffc933')}/><path d="M27 23 v8" stroke="${O}" stroke-width="1.8"/><path d="M40 6 l1.6 3.4 l3.4 1.6 l-3.4 1.6 l-1.6 3.4 l-1.6 -3.4 l-3.4 -1.6 l3.4 -1.6z" fill="#fff" stroke="${O}" stroke-width="1.2"/>`,
  'rosolowy-chlust': `<path d="M6 20 h36 l-4 18 q-14 6 -28 0 z" ${k('#c0c8cc')}/><path d="M4 20 h40" stroke="${O}" stroke-width="3" stroke-linecap="round"/><path d="M10 22 q14 6 28 0" fill="#ffb347" stroke="${O}" stroke-width="1.6"/><path d="M16 15 q-3 -5 0 -10 M24 14 q-3 -5 0 -11 M32 15 q-3 -5 0 -10" stroke="#ff7a3d" stroke-width="2.6" ${NF} stroke-linecap="round"/><circle cx="40" cy="30" r="3" fill="#ffb347" stroke="${O}" stroke-width="1.4"/><circle cx="44" cy="38" r="2" fill="#ffb347" stroke="${O}" stroke-width="1.2"/>`,
  'lodowy-dziob': `<path d="M5 26 L34 8 L43 22 L34 38 Z" ${k('#bfeaff')}/><path d="M10 25 L33 12" stroke="#fff" stroke-width="3" ${NF} stroke-linecap="round"/><path d="M16 30 l2 8 l3 -6 l3 9 l2 -7" stroke="${O}" stroke-width="2" fill="#7fd3ff" stroke-linejoin="round"/><path d="M40 4 v10 M35 9 h10 M37 6 l6 6 M43 6 l-6 6" stroke="#7fd3ff" stroke-width="2" stroke-linecap="round"/>`,
  'zgnile-jajo': `<ellipse cx="24" cy="27" rx="14" ry="17" ${k('#c5d86d')}/><circle cx="18" cy="24" r="3" fill="#7a8a2e"/><circle cx="29" cy="31" r="4" fill="#7a8a2e"/><circle cx="26" cy="19" r="2" fill="#7a8a2e"/><path d="M8 10 q4 -4 8 0 q4 4 8 0 M26 6 q4 -4 8 0 q4 4 8 0" stroke="#9ccc65" stroke-width="2.4" ${NF} stroke-linecap="round"/>`,
  'kogucia-kontra': `<path d="M24 4 l17 6 v15 q0 13 -17 19 q-17 -6 -17 -19 v-15 z" ${k('#e4572e')}/><path d="M14 30 l10 -16 l10 16" stroke="#fff" stroke-width="4" ${NF} stroke-linecap="round" stroke-linejoin="round"/><path d="M14 30 l10 -16 l10 16" stroke="${O}" stroke-width="1.4" ${NF} stroke-linejoin="round"/>`,
  'darcie-pierza': `<path d="M10 40 C10 24 22 10 38 6 C36 20 26 34 10 40z" ${k('#fff3d6')}/><path d="M10 40 L32 12" stroke="${O}" stroke-width="2" ${NF}/><path d="M36 26 q2 6 0 10 M42 30 q2 5 0 8" stroke="#e53950" stroke-width="3" ${NF} stroke-linecap="round"/><circle cx="34" cy="40" r="3" fill="#e53950" stroke="${O}" stroke-width="1.2"/>`,
  'piaskowa-kapiel': `<path d="M4 38 q10 -10 20 -4 q10 6 20 -4 v12 h-40z" ${k('#e9c46a')}/><circle cx="12" cy="22" r="2.4" fill="#e9c46a" stroke="${O}" stroke-width="1.2"/><circle cx="22" cy="14" r="2" fill="#e9c46a" stroke="${O}" stroke-width="1.2"/><circle cx="32" cy="20" r="2.6" fill="#e9c46a" stroke="${O}" stroke-width="1.2"/><circle cx="40" cy="10" r="1.8" fill="#e9c46a" stroke="${O}" stroke-width="1.1"/><path d="M8 30 q6 -6 12 0" stroke="#b08968" stroke-width="2" ${NF}/>`,
  'dziobanie-premii': `<rect x="6" y="14" width="30" height="22" rx="3" ${k('#8bc34a')}/><circle cx="21" cy="25" r="6" ${k('#c5e1a5')}/><path d="M21 21 v8 M19 23 h4" stroke="${O}" stroke-width="1.6"/><path d="M30 8 L44 4 L42 16 Z" ${k('#ffb02e')}/><path d="M34 10 L40 22" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/>`,
  'egzekucja-ostroga': `<path d="M8 40 C14 30 22 22 40 6 C34 22 26 32 14 42z" ${k('#cfd8dc')}/><path d="M12 38 L36 10" stroke="#fff" stroke-width="2.4" ${NF} stroke-linecap="round"/><path d="M6 44 l6 -6" stroke="${O}" stroke-width="5" stroke-linecap="round"/><path d="M38 30 q3 6 0 10" stroke="#e53950" stroke-width="3" ${NF} stroke-linecap="round"/>`,
  'ziarno-mocy': `<path d="M24 5 C35 12 37 27 24 43 C11 27 13 12 24 5z" ${k('#ffc933')}/><path d="M24 12 C28 19 28 27 24 35" stroke="#fff3b0" stroke-width="3" ${NF} stroke-linecap="round"/><path d="M38 10 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2z" fill="#fff" stroke="${O}" stroke-width="1.4"/>`,
  'ostry-dziob': `<path d="M5 26 L34 8 L43 22 L34 38 Z" ${k('#cfd8dc')}/><path d="M10 25 L33 12" stroke="#fff" stroke-width="3" ${NF} stroke-linecap="round"/><path d="M20 30 L36 22" stroke="#90a4ae" stroke-width="2.4" ${NF} stroke-linecap="round"/><path d="M40 6 l1.6 3.4 l3.4 1.6 l-3.4 1.6 l-1.6 3.4 l-1.6 -3.4 l-3.4 -1.6 l3.4 -1.6z" fill="#fff" stroke="${O}" stroke-width="1.2"/>`,
  'twardy-grzebien': `<path d="M6 36 q-4 -16 8 -19 q1 -11 10 -7 q9 -7 13 4 q11 3 7 22 z" ${k('#e4572e')}/><path d="M14 30 q2 -8 8 -9" stroke="#ff9d7a" stroke-width="3" ${NF} stroke-linecap="round"/>`,
  'szybki-dziob': `<path d="M14 11 l28 13 l-28 13 z" ${k('#ffb02e')}/><path d="M14 24 h22" stroke="${O}" stroke-width="2" ${NF}/><path d="M2 15 h9 M0 24 h11 M2 33 h9" stroke="${O}" stroke-width="2.6" stroke-linecap="round"/>`,
  'pancerz-z-pierza': `<path d="M24 4 l17 6 v15 q0 13 -17 19 q-17 -6 -17 -19 v-15 z" ${k('#8ecae6')}/><path d="M24 11 q11 11 0 26 q-11 -15 0 -26z" ${k('#fff')}/><path d="M24 13 v24" stroke="${O}" stroke-width="1.8"/>`,
  'czujne-oko': `<path d="M2 24 q22 -24 44 0 q-22 24 -44 0z" ${k('#fff')}/><circle cx="24" cy="24" r="9" ${k('#2a9d8f')}/><circle cx="24" cy="24" r="4" fill="${O}"/><circle cx="27" cy="21" r="1.8" fill="#fff"/>`,
  'zwinne-nogi': `<path d="M26 5 v23 M26 28 l-13 12 M26 28 v14 M26 28 l13 12" stroke="${O}" stroke-width="8" stroke-linecap="round" ${NF}/><path d="M26 5 v23 M26 28 l-13 12 M26 28 v14 M26 28 l13 12" stroke="#f4a261" stroke-width="4.4" stroke-linecap="round" ${NF}/><path d="M3 12 h9 M1 20 h10" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/>`,
  'cieple-gniazdko': `<ellipse cx="24" cy="19" rx="8" ry="10" ${k('#fff3d6')}/><path d="M5 28 q19 21 38 0 q-4 -8 -19 -8 q-15 0 -19 8z" ${k('#b08968')}/><path d="M10 29 q14 8 28 0 M14 33 q10 5 20 0" stroke="#7a5230" stroke-width="2" ${NF}/><path d="M38 6 q-5 5 0 9 q5 -4 0 -9z" ${k('#ff7a3d')}/>`,
  'czterolistna-koniczyna': `<path d="M24 22 q-14 -16 -14 -6 q0 12 14 6z M24 22 q14 -16 14 -6 q0 12 -14 6z M24 24 q-14 16 -14 6 q0 -12 14 -6z M24 24 q14 16 14 6 q0 -12 -14 -6z" ${k('#4caf50')}/><path d="M24 26 q2 10 8 16" stroke="${O}" stroke-width="3" ${NF} stroke-linecap="round"/>`,
  'kukurydziany-grad': `<rect x="15" y="4" width="18" height="34" rx="9" ${k('#ffc933')}/><path d="M24 6 v30 M18 12 h12 M17 19 h14 M17 26 h14 M18 33 h12" stroke="#d99a00" stroke-width="1.8" ${NF}/><path d="M12 32 q12 14 24 0 q-6 -4 -12 4 q-6 -8 -12 -4z" ${k('#7cb342')}/><circle cx="6" cy="18" r="2.4" fill="#ffc933" stroke="${O}" stroke-width="1.4"/><circle cx="42" cy="12" r="2.4" fill="#ffc933" stroke="${O}" stroke-width="1.4"/><circle cx="40" cy="28" r="2.4" fill="#ffc933" stroke="${O}" stroke-width="1.4"/>`,
  'pianie-grozy': `<path d="M6 12 l18 10 l-18 10 z" ${k('#ffb02e')}/><path d="M6 22 h14" stroke="${O}" stroke-width="2" ${NF}/><path d="M29 10 q9 12 0 24 M36 5 q14 17 0 34 M43 1 q17 22 0 44" stroke="${O}" stroke-width="2.6" ${NF} stroke-linecap="round"/>`,
  'jajeczny-granat': `<ellipse cx="24" cy="29" rx="14" ry="16" ${k('#8bc34a')}/><path d="M12 24 h24 M11 33 h26" stroke="#558b2f" stroke-width="2" ${NF}/><rect x="19" y="7" width="10" height="8" rx="2" ${k('#cfd8dc')}/><circle cx="35" cy="9" r="5" fill="none" stroke="#b0bec5" stroke-width="2.4"/><path d="M29 11 h2" stroke="#b0bec5" stroke-width="2.4"/>`,
  'dziobniecie-szalu': `<path d="M10 26 q-6 -14 4 -22 q2 8 8 10 q2 -8 8 -10 q4 14 -4 22z" ${k('#ff7a3d')}/><path d="M14 22 q0 -8 5 -10 q1 6 4 6 q1 -4 3 -5 q2 6 -2 9z" ${k('#ffd23f')}/><path d="M8 28 l30 10 l-30 8 z" ${k('#ffb02e')}/>`,
  'unik-skrzydlem': `<path d="M5 32 q4 -26 38 -26 q-6 16 -14 22 q-10 8 -24 4z" ${k('#fff')}/><path d="M15 26 q8 -6 16 -14 M12 31 q12 -2 22 -12" stroke="#9fb3c8" stroke-width="2.2" ${NF} stroke-linecap="round"/><path d="M3 40 h14 M8 45 h12" stroke="${O}" stroke-width="2.6" stroke-linecap="round"/>`,
  'zagrzebanie-w-sianie': `<path d="M3 42 q21 -38 42 0z" ${k('#e9c46a')}/><path d="M12 38 l8 -12 M22 38 l2 -18 M32 38 l-4 -14 M38 37 l-6 -8" stroke="#b8860b" stroke-width="2" ${NF} stroke-linecap="round"/><path d="M24 8 v12 M18 14 h12" stroke="${O}" stroke-width="8" stroke-linecap="round"/><path d="M24 8 v12 M18 14 h12" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>`,
  'zlote-jajo': `<ellipse cx="24" cy="26" rx="14" ry="18" ${k('#ffd23f')}/><path d="M15 20 q2 -8 9 -10" stroke="#fff8c9" stroke-width="3.4" ${NF} stroke-linecap="round"/><path d="M36 8 l1.6 3.4 l3.4 1.6 l-3.4 1.6 l-1.6 3.4 l-1.6 -3.4 l-3.4 -1.6 l3.4 -1.6z" fill="#fff" stroke="${O}" stroke-width="1.2"/>`,
  'tykajace-jajo': `<ellipse cx="24" cy="26" rx="15" ry="19" ${k('#fff3d6')}/><circle cx="24" cy="28" r="10" ${k('#fff')}/><path d="M24 28 v-7 M24 28 l6 3" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/><path d="M19 8 h10 M24 5 v3" stroke="${O}" stroke-width="2.6" stroke-linecap="round"/><path d="M8 12 l-4 -4 M40 12 l4 -4" stroke="#e4572e" stroke-width="2.6" stroke-linecap="round"/>`,
  'gniazdo-zapasowe': `<ellipse cx="24" cy="17" rx="8" ry="10" ${k('#fff3d6')}/><path d="M4 28 q20 22 40 0 q-4 -8 -20 -8 q-16 0 -20 8z" ${k('#b08968')}/><path d="M9 29 q15 9 30 0 M13 34 q11 5 22 0" stroke="#7a5230" stroke-width="2" ${NF}/><path d="M24 12 q-5 -4 -6 0 q0 4 6 8 q6 -4 6 -8 q-1 -4 -6 0z" ${k('#e4572e')}/>`,
  'worek-kukurydzy': `<path d="M15 14 q-6 22 -3 28 h24 q3 -6 -3 -28z" ${k('#d4a373')}/><path d="M14 14 q10 6 20 0 l-2 -6 h-16z" ${k('#c08d5a')}/><path d="M18 8 q6 -4 12 0" stroke="${O}" stroke-width="3" ${NF}/><path d="M20 26 h8 M19 32 h10" stroke="#a87c4e" stroke-width="2" ${NF}/><path d="M32 6 l3 -4 l3 4 l-3 6z" ${k('#ffc933')}/>`,
  'mlocarnia': `<path d="M8 42 L26 18" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="M8 42 L26 18" stroke="#a47551" stroke-width="3.4" stroke-linecap="round"/><path d="M28 16 q6 -6 8 -2" stroke="${O}" stroke-width="2.6" ${NF}/><circle cx="38" cy="12" r="8" ${k('#90a4ae')}/><path d="M38 1 v6 M38 17 v6 M27 12 h6 M43 12 h6 M30 5 l4 4 M46 19 l-4 -4" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/>`,
  'siewnik': `<path d="M24 44 v-18" stroke="${O}" stroke-width="6" stroke-linecap="round"/><path d="M24 44 v-18" stroke="#7cb342" stroke-width="3" stroke-linecap="round"/><path d="M24 28 q-16 0 -17 -14 q16 -2 17 14z" ${k('#8bc34a')}/><path d="M24 24 q16 0 17 -14 q-16 -2 -17 14z" ${k('#66bb6a')}/><path d="M12 44 h24" stroke="#8d6e63" stroke-width="4" stroke-linecap="round"/>`,
  'opaska-rambo': `<path d="M4 18 q20 -10 40 0 v10 q-20 -8 -40 0 z" ${k('#d62828')}/><path d="M36 24 q8 6 8 18 q-8 -4 -12 -14 z" ${k('#b71c1c')}/><path d="M30 26 q4 8 -2 16 q-6 -4 -4 -14 z" ${k('#d62828')}/><circle cx="24" cy="23" r="3" fill="#fff" stroke="${O}" stroke-width="1.4"/>`,
  'kamizelka-kuloodporna': `<path d="M12 6 l8 4 l4 4 l4 -4 l8 -4 l4 8 l-2 28 h-28 l-2 -28 z" ${k('#6d7f5d')}/><path d="M24 14 v28 M16 22 h6 M26 22 h6 M16 30 h6 M26 30 h6" stroke="#445239" stroke-width="2" ${NF}/>`,
  'ostrogi-bojowe': `<path d="M8 8 q26 0 28 26 q-6 -10 -16 -12 q-10 -2 -12 -14z" ${k('#b0bec5')}/><circle cx="12" cy="10" r="6" fill="none" stroke="${O}" stroke-width="6"/><circle cx="12" cy="10" r="6" fill="none" stroke="#cfd8dc" stroke-width="2.6"/><path d="M34 32 l10 12 l-14 -4 z" ${k('#e0e0e0')}/>`,
  'okulary-aviatory': `<path d="M4 16 h40 q0 -4 -2 -4 h-12 q-2 0 -2 3 q-2 -2 -4 0 q0 -3 -2 -3 h-12 q-2 0 -2 4z" fill="#c9a227" ${S2}/><path d="M6 16 q2 20 14 18 q8 -2 8 -16z" ${k('#263238')}/><path d="M42 16 q-2 20 -14 18 q-8 -2 -8 -16z" ${k('#263238')}/><path d="M10 20 q2 6 6 8" stroke="#7aa2c8" stroke-width="2.4" ${NF} stroke-linecap="round"/><path d="M34 20 q2 6 6 8" stroke="#7aa2c8" stroke-width="2.4" ${NF} stroke-linecap="round"/>`,
  'pakt-z-lisem': `<path d="M4 6 l10 10 h20 l10 -10 l-2 22 q-8 14 -18 14 q-10 0 -18 -14z" ${k('#e67e22')}/><path d="M16 30 q8 10 16 0 q-8 -4 -16 0z" ${k('#fff3e0')}/><circle cx="17" cy="23" r="2.4" fill="${O}"/><circle cx="31" cy="23" r="2.4" fill="${O}"/><path d="M22 31 h4" stroke="${O}" stroke-width="3" stroke-linecap="round"/><rect x="28" y="30" width="16" height="14" rx="2" ${k('#f5e6c8')}/><path d="M31 35 h10 M31 39 h7" stroke="#8d6e63" stroke-width="1.6" stroke-linecap="round"/>`,
  'szklane-skrzydlo': `<path d="M4 34 q2 -28 40 -28 q-8 16 -16 24 q-10 10 -24 4z" fill="#bfe9ff" fill-opacity=".85" ${S2}/><path d="M12 30 l12 -16 M18 33 l16 -14 M24 6 l-8 24" stroke="#fff" stroke-width="2" ${NF} stroke-linecap="round"/><path d="M38 4 l1.6 3.4 l3.4 1.6 l-3.4 1.6 l-1.6 3.4 l-1.6 -3.4 l-3.4 -1.6 l3.4 -1.6z" fill="#fff" stroke="${O}" stroke-width="1.2"/>`,
  'tajemnicza-skrzynka': `<path d="M5 20 q0 -12 19 -12 q19 0 19 12 z" ${k('#a1662f')}/><rect x="5" y="20" width="38" height="22" rx="3" ${k('#8a5424')}/><path d="M5 26 h38" stroke="${O}" stroke-width="2"/><rect x="19" y="22" width="10" height="12" rx="2" ${k('#ffd23f')}/><path d="M22 28 q0 -4 3 -2 q2 2 -1 4" stroke="${O}" stroke-width="1.8" ${NF} stroke-linecap="round"/><circle cx="24" cy="32" r="1" fill="${O}"/>`,
  'sklepik-babci-kwoki': `<path d="M4 14 h40 l-4 -9 h-32z" fill="#e4572e" ${S2}/><path d="M12 5 l-3 9 M20 5 l-2 9 M28 5 l2 9 M36 5 l3 9" stroke="#fff" stroke-width="3.4"/><path d="M4 14 q4 7 8 0 q4 7 8 0 q4 7 8 0 q4 7 8 0 q4 7 8 0" fill="#fff" ${S2}/><rect x="8" y="22" width="32" height="20" rx="2" ${k('#c9a37a')}/><circle cx="18" cy="30" r="4" ${k('#ffc933')}/><circle cx="30" cy="30" r="4" ${k('#ffc933')}/><path d="M8 38 h32" stroke="${O}" stroke-width="2"/>`,
  'hazard-w-kurniku': `<path d="M8 18 l16 -10 l16 10 v16 l-16 10 l-16 -10z" ${k('#fff')}/><path d="M8 18 l16 10 l16 -10 M24 28 v16" stroke="${O}" stroke-width="2.4" ${NF}/><circle cx="24" cy="17" r="2.4" fill="${O}"/><circle cx="15" cy="30" r="2.4" fill="#e4572e"/><circle cx="32" cy="30" r="2.4" fill="#e4572e"/><circle cx="32" cy="38" r="2.4" fill="#e4572e"/>`,
  'zakazana-pasza': `<path d="M15 14 q-6 22 -3 28 h24 q3 -6 -3 -28z" ${k('#6a4c93')}/><path d="M14 14 q10 6 20 0 l-2 -6 h-16z" ${k('#7e5aa8')}/><circle cx="24" cy="27" r="8" ${k('#e8f5e9')}/><circle cx="21" cy="26" r="2.2" fill="${O}"/><circle cx="27" cy="26" r="2.2" fill="${O}"/><path d="M21 32 h6 M23 30 v4 M25 30 v4" stroke="${O}" stroke-width="1.6"/><path d="M8 8 q4 -5 8 0 M32 6 q4 -5 8 0" stroke="#76ff03" stroke-width="2.6" ${NF} stroke-linecap="round"/>`,
};
// Ikonki efektów statusowych (nad paskiem życia wroga i w opisach).
const STI = {
  burn: `<path d="M12 2 C16 7 19 10 19 15 a7 7 0 0 1 -14 0 C5 11 8 9 9 5 C10 8 11 9 12 9 C12 7 11 5 12 2z" fill="#ff7a3d" stroke="${O}" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 12 C14 14 15 15 15 17 a3 3 0 0 1 -6 0 C9 15 11 14 12 12z" fill="#ffd166"/>`,
  frost: `<path d="M12 2 v20 M3 7 l18 10 M3 17 l18 -10" stroke="${O}" stroke-width="4" stroke-linecap="round"/><path d="M12 2 v20 M3 7 l18 10 M3 17 l18 -10" stroke="#bfeaff" stroke-width="2" stroke-linecap="round"/>`,
  poison: `<path d="M12 2 C8 9 5 12 5 16 a7 7 0 0 0 14 0 C19 12 16 9 12 2z" fill="#9ccc65" stroke="${O}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="9.5" cy="15" r="1.6" fill="${O}"/><circle cx="14.5" cy="15" r="1.6" fill="${O}"/><path d="M9.5 19 h5" stroke="${O}" stroke-width="1.4"/>`,
  bleed: `<path d="M12 2 C8 9 5 12 5 16 a7 7 0 0 0 14 0 C19 12 16 9 12 2z" fill="#e53950" stroke="${O}" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 14 q0 3 3 4" stroke="#ff9aa8" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
};
export const statusIcon = kind => `<svg class="sti" viewBox="0 0 24 24" aria-hidden="true">${STI[kind] || ''}</svg>`;

// Ikonki statystyk w panelu bocznym (viewBox 24, gruby kontur jak reszta grafiki).
const SW = `stroke="${O}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"`;
const STAT_ART = {
  maxHp: `<path d="M12 21 C4 15 2 11 2 8 a5 5 0 0 1 10 -1.5 A5 5 0 0 1 22 8 c0 3 -2 7 -10 13z" fill="#e53950" ${SW}/><path d="M6 8 q0 -2 2 -2.5" stroke="#ff9aa8" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
  atk: `<path d="M3 13 L19 5 L15 13 L19 21 z" fill="#ffb347" ${SW}/><path d="M3 13 h12" ${SW} fill="none"/><path d="M19 5 l2 -2 M19 21 l2 2" stroke="#fff3d6" stroke-width="1.6" stroke-linecap="round"/>`,
  aspd: `<path d="M13 2 L5 14 h6 l-2 8 l9 -13 h-6 l2 -7z" fill="#ffd23f" ${SW}/>`,
  armor: `<path d="M12 2 L20 5 v6 c0 6 -4 9 -8 11 c-4 -2 -8 -5 -8 -11 V5z" fill="#90a4ae" ${SW}/><path d="M12 5 v14" stroke="#cfd8dc" stroke-width="1.6"/>`,
  crit: `<circle cx="12" cy="12" r="9" fill="#fff3d6" ${SW}/><circle cx="12" cy="12" r="5" fill="#e4572e" ${SW}/><circle cx="12" cy="12" r="1.6" fill="${O}"/>`,
  evade: `<path d="M5 20 C5 11 10 4 20 3 C19 12 14 18 5 20z" fill="#e8f1ff" ${SW}/><path d="M5 20 L15 9" ${SW} fill="none"/>`,
  regen: `<circle cx="12" cy="12" r="9.5" fill="#6fcf6f" ${SW}/><path d="M12 7 v10 M7 12 h10" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
  luck: `<g fill="#4caf50" ${SW}><circle cx="8.5" cy="8.5" r="4"/><circle cx="15.5" cy="8.5" r="4"/><circle cx="8.5" cy="15.5" r="4"/><circle cx="15.5" cy="15.5" r="4"/></g><path d="M12 12 q3 5 7 9" ${SW} fill="none"/>`,
  dmg: `<path d="M12 2 l2.5 6 l6 -2 l-3 5.5 l5 3 l-6 1.5 l1 6 l-5.5 -3.5 l-5.5 3.5 l1 -6 l-6 -1.5 l5 -3 l-3 -5.5 l6 2z" fill="#ff7a3d" ${SW}/>`,
  critMult: `<path d="M12 2 l3 6.5 l7 1 l-5 5 l1.2 7 l-6.2 -3.3 l-6.2 3.3 l1.2 -7 l-5 -5 l7 -1z" fill="#ffd23f" ${SW}/>`,
};
export const statIcon = key => `<svg class="stico" viewBox="0 0 24 24" aria-hidden="true">${STAT_ART[key] || ''}</svg>`;

// Odznaki Pracownicze: medal z kolorem i znakiem.
const BADGE_ART = {
  'pracownik-miesiaca': ['#ffc933', '<path d="M24 14 l3 6 l6 1 l-4.5 4 l1 6 l-5.5 -3 l-5.5 3 l1 -6 l-4.5 -4 l6 -1z" fill="#fff" stroke="#2b1a12" stroke-width="1.4"/>'],
  'nadgodziny': ['#90a4ae', '<circle cx="24" cy="24" r="8" fill="#fff" stroke="#2b1a12" stroke-width="1.6"/><path d="M24 24 v-5 M24 24 l4 2" stroke="#2b1a12" stroke-width="1.8" stroke-linecap="round"/>'],
  'bhp': ['#ffb02e', '<path d="M15 27 q0 -10 9 -10 q9 0 9 10 z M13 27 h22" fill="#ffd166" stroke="#2b1a12" stroke-width="1.6"/>'],
  'delegacja': ['#4fc3f7', '<path d="M14 26 l18 -8 l-6 14 l-3 -5 z" fill="#fff" stroke="#2b1a12" stroke-width="1.6" stroke-linejoin="round"/>'],
  'team-building': ['#81c784', '<circle cx="19" cy="21" r="3.5" fill="#fff" stroke="#2b1a12" stroke-width="1.4"/><circle cx="29" cy="21" r="3.5" fill="#fff" stroke="#2b1a12" stroke-width="1.4"/><path d="M13 31 q6 -6 11 0 q5 -6 11 0" stroke="#2b1a12" stroke-width="1.8" fill="none"/>'],
  'karta-multisport': ['#ba68c8', '<rect x="15" y="18" width="18" height="12" rx="2" fill="#fff" stroke="#2b1a12" stroke-width="1.6"/><path d="M18 22 h8" stroke="#2b1a12" stroke-width="1.8"/>'],
  'awans': ['#e53950', '<path d="M24 15 l8 9 h-5 v9 h-6 v-9 h-5 z" fill="#fff" stroke="#2b1a12" stroke-width="1.6" stroke-linejoin="round"/>'],
  'kawa-z-ekspresu': ['#8d6e63', '<path d="M16 20 h13 v8 q0 5 -6.5 5 q-6.5 0 -6.5 -5z M29 22 q4 0 4 3 q0 3 -4 3" fill="#fff" stroke="#2b1a12" stroke-width="1.6"/><path d="M20 15 q-1 -2 0 -4 M25 15 q-1 -2 0 -4" stroke="#fff" stroke-width="1.6" fill="none"/>'],
  'nagana-z-wpisem': ['#ef5350', '<path d="M24 14 v12" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="32" r="2.4" fill="#fff"/>'],
  'fundusz-socjalny': ['#ffd54f', '<path d="M24 31 q-10 -6 -10 -12 q0 -5 5 -5 q3 0 5 3 q2 -3 5 -3 q5 0 5 5 q0 6 -10 12z" fill="#e53950" stroke="#2b1a12" stroke-width="1.6"/>'],
  'klucz-do-serwerowni': ['#7fd3ff', '<circle cx="19" cy="22" r="5" fill="none" stroke="#fff" stroke-width="3"/><path d="M23 25 l9 9 M28 30 l3 -3 M31 33 l2 -2" stroke="#fff" stroke-width="3" stroke-linecap="round"/>'],
  'sprawiedliwosc': ['#7e57c2', '<path d="M24 14 v18 M15 18 h18" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><path d="M15 18 l-4 8 h8z M33 18 l-4 8 h8z" fill="#fff" stroke="#2b1a12" stroke-width="1.2" stroke-linejoin="round"/><path d="M19 32 h10" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>'],
  'parasol-ochronny': ['#26a69a', '<path d="M13 25 q11 -14 22 0 z" fill="#fff" stroke="#2b1a12" stroke-width="1.6"/><path d="M24 25 v8 q0 2 -2 2" stroke="#2b1a12" stroke-width="1.8" fill="none" stroke-linecap="round"/>'],
};
export function badgeIcon(id) {
  const [c, g] = BADGE_ART[id] || ['#ccc', ''];
  return I(`<path d="M15 2 l5 12 h8 l5 -12" fill="#e53950" stroke="${O}" stroke-width="2" stroke-linejoin="round"/><circle cx="24" cy="26" r="15" fill="${c}" stroke="${O}" stroke-width="2.4"/><circle cx="24" cy="26" r="11.5" fill="none" stroke="#fff" stroke-width="1.2" opacity=".6"/><g transform="translate(0 2)">${g}</g>`);
}

// Rodziny statystyk: poziomy 1, 2 i legendarny dzielą ikonę poziomu 3 (poziom pokazuje plakietka na karcie).
const ICON_OF = {"grzebien-z-tasmy":"twardy-grzebien","grzebien-hodowlany":"twardy-grzebien","grzebien-rosolowego-krola":"twardy-grzebien","ziarenko-z-podlogi":"ziarno-mocy","ziarno-selekcjonowane":"ziarno-mocy","ziarno-pierwszego-jajka":"ziarno-mocy","nadpilowany-dziob":"ostry-dziob","dziob-szlifowany":"ostry-dziob","dziob-prezesa":"ostry-dziob","dziob-po-kawie":"szybki-dziob","dziob-po-espresso":"szybki-dziob","dziob-maszynowy":"szybki-dziob","puch-zbity-w-kule":"pancerz-z-pierza","pierze-prasowane":"pancerz-z-pierza","zbroja-wyroczni-kurnika":"pancerz-z-pierza","zezowate-oko":"czujne-oko","oko-kontrolera-jakosci":"czujne-oko","oko-cyklopa-z-chlodni":"czujne-oko","slieskie-nozki":"zwinne-nogi","nogi-akrobaty":"zwinne-nogi","cien-skrzydla":"zwinne-nogi","sloma-z-wczoraj":"cieple-gniazdko","gniazdko-z-siana":"cieple-gniazdko","wieczny-ogien-kuchenki":"cieple-gniazdko","trojlistna-koniczyna":"czterolistna-koniczyna","koniczyna-z-kapliczki":"czterolistna-koniczyna","piecio-koniczyna-zarzadu":"czterolistna-koniczyna"};
export function tileIcon(id) { return I(ICON[id] || ICON[ICON_OF[id]] || `<circle cx="24" cy="24" r="14" ${k('#ccc')}/>`); }
export function upgradeIcon() { return I(`<path d="M24 4 L40 22 H30 V40 H18 V22 H8 Z" ${k('#7bd88f')}/><path d="M24 12 l6 7 h-4 v14 h-4 v-14 h-4z" fill="#fff" opacity=".55"/>`); }

// Rozwidlenie Korytarza: zwykłe drzwi albo drzwi „Tylko dla personelu”.
export function doorIcon(risky) {
  return I(`<rect x="11" y="5" width="26" height="40" rx="2" ${k(risky ? '#7a2b1c' : '#8d6e63')}/><rect x="15" y="9" width="18" height="14" rx="1" fill="none" stroke="${O}" stroke-width="1.6"/><rect x="15" y="26" width="18" height="14" rx="1" fill="none" stroke="${O}" stroke-width="1.6"/><circle cx="31" cy="27" r="2.2" ${k('#ffc933')}/>`
    + (risky ? `<rect x="7" y="13" width="34" height="8" rx="2" ${k('#ffd166')}/><path d="M11 17 h26" stroke="${O}" stroke-width="1.4" stroke-dasharray="3 2"/><path d="M24 28 l4 8 h-8z" ${k('#e53950')}/>` : '')
    + `<path d="M5 45 h38" stroke="${O}" stroke-width="3" stroke-linecap="round"/>`);
}
// Lombard Lisa i Okólnik Zarządu (małe ikonki do przycisków i ramek).
export const pawnIcon = () => I(`<path d="M10 14 l6 -9 l4 9 h8 l4 -9 l6 9 v12 q0 14 -14 16 q-14 -2 -14 -16z" ${k('#ff8a3d')}/><path d="M17 30 q7 6 14 0" ${k('#fff3d6')}/><circle cx="19" cy="22" r="2" fill="${O}"/><circle cx="29" cy="22" r="2" fill="${O}"/><circle cx="36" cy="38" r="7" ${k('#ffc933')}/>`);
export const decreeIcon = () => I(`<path d="M9 4 h24 l6 6 v34 h-30z" ${k('#fff')}/><path d="M14 14 h18 M14 20 h20 M14 26 h14" stroke="#90a4ae" stroke-width="2"/><circle cx="31" cy="36" r="6" ${k('#e53950')}/><path d="M28 36 h6" stroke="#fff" stroke-width="1.6"/>`);

// ---------- Tła aren (viewBox 1000x460) ----------
const BG = {
  0: () => `
    <defs><linearGradient id="g0" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1d14"/><stop offset="1" stop-color="#3b2818"/></linearGradient>
    <radialGradient id="l0" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffcf70" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf70" stop-opacity="0"/></radialGradient></defs>
    <rect width="1000" height="460" fill="url(#g0)"/>
    ${Array.from({ length: 17 }, (_, i) => `<rect x="${i * 62}" y="0" width="60" height="340" fill="${i % 2 ? '#4a3220' : '#53381f'}"/><path d="M${i * 62 + 12} 30 v280 M${i * 62 + 40} 60 v230" stroke="#2f1f12" stroke-width="2" opacity=".5"/>`).join('')}
    <rect x="70" y="60" width="170" height="140" rx="8" fill="#0f1b33" stroke="#2b1a12" stroke-width="8"/><path d="M155 60 v140 M70 130 h170" stroke="#2b1a12" stroke-width="6"/>
    <circle cx="200" cy="100" r="22" fill="#fff3c4"/><circle cx="210" cy="94" r="20" fill="#0f1b33"/><circle cx="110" cy="90" r="2" fill="#fff"/><circle cx="130" cy="160" r="2" fill="#fff"/><circle cx="190" cy="170" r="2" fill="#fff"/>
    <path d="M560 0 v70" stroke="#2b1a12" stroke-width="4"/><circle cx="560" cy="86" r="150" fill="url(#l0)"/><rect x="544" y="70" width="32" height="40" rx="6" fill="#ffd36a" stroke="#2b1a12" stroke-width="4"/>
    <g transform="translate(760 150)"><rect width="190" height="170" rx="6" fill="#5b3b20" stroke="#2b1a12" stroke-width="5"/><path d="M0 56 h190 M0 112 h190" stroke="#2b1a12" stroke-width="5"/><ellipse cx="46" cy="38" rx="22" ry="16" fill="#f7ecd3" stroke="#2b1a12" stroke-width="3"/><ellipse cx="120" cy="96" rx="24" ry="16" fill="#f7ecd3" stroke="#2b1a12" stroke-width="3"/></g>
    <rect y="340" width="1000" height="120" fill="#6b4a2b"/><path d="M0 340 h1000" stroke="#2b1a12" stroke-width="5"/>
    ${Array.from({ length: 28 }, (_, i) => `<path d="M${i * 38 + 6} ${360 + (i % 5) * 18} l14 -8 l8 6 l12 -6" stroke="#d9b24a" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('')}`,
  1: () => `
    <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17252e"/><stop offset="1" stop-color="#22394a"/></linearGradient>
    <linearGradient id="fog1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe9ff" stop-opacity="0"/><stop offset="1" stop-color="#bfe9ff" stop-opacity=".35"/></linearGradient></defs>
    <rect width="1000" height="460" fill="url(#g1)"/>
    ${Array.from({ length: 5 }, (_, i) => `<path d="M${i * 250} 0 v340" stroke="#0e1a21" stroke-width="6" opacity=".6"/>`).join('')}
    ${[0, 1, 2].map(r => `<g transform="translate(40 ${60 + r * 90})"><rect width="920" height="10" fill="#607d8b" stroke="#2b1a12" stroke-width="3"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${10 + i * 100}" y="-52" width="${70 + (i * 7 + r * 11) % 20}" height="52" fill="${['#a47551', '#8d6e63', '#c9a37a'][(i + r) % 3]}" stroke="#2b1a12" stroke-width="3"/><path d="M${10 + i * 100} -26 h${70 + (i * 7 + r * 11) % 20}" stroke="#2b1a12" stroke-width="2"/>`).join('')}</g>`).join('')}
    <g stroke="#cfd8dc" stroke-width="3" fill="none"><path d="M330 0 v90 M330 90 q-14 20 0 34 q14 -14 0 -34"/><path d="M700 0 v70 M700 70 q-14 20 0 34 q14 -14 0 -34"/></g>
    
    <rect y="340" width="1000" height="120" fill="#33505f"/><path d="M0 340 h1000" stroke="#0e1a21" stroke-width="5"/>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 90} 340 l-30 120" stroke="#2a4350" stroke-width="3"/>`).join('')}
    <rect y="260" width="1000" height="200" fill="url(#fog1)"/>
    ${Array.from({ length: 16 }, (_, i) => `<circle cx="${(i * 67) % 1000}" cy="${(i * 53) % 250}" r="2.2" fill="#e1f5fe" opacity=".7"/>`).join('')}`,
  2: () => `
    <defs><linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1d33"/><stop offset="1" stop-color="#2c2f4a"/></linearGradient>
    <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1330"/><stop offset="1" stop-color="#3a2a5a"/></linearGradient></defs>
    <rect width="1000" height="460" fill="url(#g2)"/>
    <rect x="60" y="40" width="540" height="250" fill="url(#sky2)" stroke="#2b1a12" stroke-width="8"/>
    ${[[80, 140, 70], [160, 100, 80], [250, 170, 60], [320, 120, 90], [420, 150, 70], [500, 90, 80]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${290 - y}" fill="#12162b"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${x + 8 + (i % 3) * 20}" y="${y + 10 + Math.floor(i / 3) * 22}" width="9" height="12" fill="${i % 2 ? '#ffd36a' : '#3b4a78'}"/>`).join('')}`).join('')}
    <path d="M330 40 v250 M60 165 h540" stroke="#2b1a12" stroke-width="6"/><circle cx="530" cy="78" r="20" fill="#f3efe2"/><circle cx="540" cy="72" r="18" fill="#0b1330" opacity=".0"/>
    <g transform="translate(650 60)"><rect width="300" height="150" rx="6" fill="#222642" stroke="#2b1a12" stroke-width="5"/><path d="M60 118 q0 -60 40 -60 q40 0 40 60z" fill="#f4c542" stroke="#2b1a12" stroke-width="4"/><path d="M100 54 q-5 -12 0 -22 M118 54 q-5 -12 0 -22" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".8"/><rect x="54" y="118" width="92" height="12" rx="3" fill="#c0392b" stroke="#2b1a12" stroke-width="3"/><text x="160" y="84" fill="#f4c542" font-family="Impact, sans-serif" font-size="28">ROSOŁOWA</text><text x="160" y="116" fill="#e8e0c8" font-family="Impact, sans-serif" font-size="24">S.A.</text></g>
    <g transform="translate(40 300)"><rect width="920" height="40" fill="#37474f" stroke="#2b1a12" stroke-width="4"/>${Array.from({ length: 23 }, (_, i) => `<path d="M${i * 40} 0 v40" stroke="#263238" stroke-width="3"/>`).join('')}${Array.from({ length: 8 }, (_, i) => `<ellipse cx="${60 + i * 115}" cy="-8" rx="12" ry="15" fill="#fff3d6" stroke="#2b1a12" stroke-width="3"/>`).join('')}</g>
    <rect y="340" width="1000" height="120" fill="#5a2a3a"/><path d="M0 340 h1000" stroke="#2b1a12" stroke-width="5"/>
    ${Array.from({ length: 14 }, (_, i) => `<path d="M${i * 80} 346 l-40 114" stroke="#47202e" stroke-width="3"/>`).join('')}
    `,
};
export function arenaBg(zone) { return `<svg class="arena-bg" viewBox="0 0 1000 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${(BG[zone] || BG[0])()}</svg>`; }

// ---------- Logo i wieżowiec (ekran startowy) ----------
// Fabryka na ekranie startowym: migające okna, dym z komina i garnek u stóp, który bulgocze mocniej przy wyższym Garnku.
export function towerArt(heat = 0) {
  const floors = Array.from({ length: 12 }, (_, i) => {
    const y = 190 - i * 13;
    return `<rect x="70" y="${y}" width="80" height="11" fill="${i % 3 === 0 ? '#2c3150' : '#262b47'}" stroke="#12142a" stroke-width="1"/>${[0, 1, 2, 3].map(j => `<rect x="${76 + j * 19}" y="${y + 2}" width="10" height="7" fill="${(i * 7 + j * 3) % 5 === 0 ? '#ffd36a' : '#3d4770'}"${(i * 5 + j * 11) % 7 === 0 ? ` class="blink b${(i + j) % 4}"` : ''}/>`).join('')}`;
  }).join('');
  const h = Math.max(0, Math.min(5, heat | 0)), bub = Array.from({ length: 3 + h * 2 }, (_, i) => `<circle class="pb" cx="${152 + (i * 13) % 44}" cy="222" r="${2 + (i % 3)}" style="animation-delay:${(i * 0.37).toFixed(2)}s"/>`).join('');
  return `<svg class="tower-art heat${h}" viewBox="0 -52 220 312" aria-hidden="true">
    <path d="M30 210 h160 v14 h-160z" fill="#12142a"/>
    <rect x="36" y="120" width="18" height="90" fill="#3a2d22" stroke="#12142a" stroke-width="2"/><rect x="33" y="114" width="24" height="8" fill="#5d4a3a" stroke="#12142a" stroke-width="2"/>
    <g class="smoke"><circle cx="45" cy="104" r="8"/><circle cx="45" cy="104" r="8"/><circle cx="45" cy="104" r="8"/></g>
    <g class="hpot"><path d="M150 226 q0 26 24 26 q24 0 24 -26z" fill="#e4572e" stroke="#12142a" stroke-width="3"/><ellipse cx="174" cy="226" rx="27" ry="6" fill="#b4472a" stroke="#12142a" stroke-width="3"/><ellipse cx="174" cy="226" rx="21" ry="3.5" fill="#f4b860"/>${bub}<path d="M156 252 l-4 6 M192 252 l4 6" stroke="#12142a" stroke-width="3"/><path d="M160 262 q14 -10 28 0" stroke="#ff8c2b" stroke-width="4" fill="none" class="flame"/></g>
    ${floors}
    <path d="M62 36 h96 v156 h-96z" fill="none"/>
    <rect x="66" y="26" width="88" height="14" rx="3" fill="#455a64" stroke="#12142a" stroke-width="2"/>
    <path d="M70 26 q0 -34 40 -34 q40 0 40 34z" fill="#37474f" stroke="#12142a" stroke-width="3"/>
    <rect x="62" y="22" width="96" height="8" rx="3" fill="#607d8b" stroke="#12142a" stroke-width="2"/>
    <path d="M80 -6 q-10 -16 0 -30 M110 -10 q-10 -18 0 -34 M140 -6 q-10 -16 0 -30" class="steam" stroke="#ffe9c2" stroke-width="5" stroke-linecap="round" fill="none"/>
  </svg>`;
}

export const coinIcon = (cls = 'coin') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 C19 7 20 15 12 22 C4 15 5 7 12 2z" fill="#ffc933" stroke="#2b1a12" stroke-width="2" stroke-linejoin="round"/><path d="M12 7 C14 10 14 14 12 17" stroke="#fff3b0" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
// Sylwetka nieznanego wroga (ukryty podgląd od Garnka 1): ten sam kształt dla każdego, żeby nic nie zdradzał.
export const mysteryArt = () => svg(`<ellipse cx="50" cy="95" rx="26" ry="4" fill="rgba(0,0,0,.35)"/><path d="M26 92 q-4 -30 8 -46 q-8 -22 16 -28 q24 6 16 28 q12 16 8 46z" fill="#3a2d22" ${S}/><text x="50" y="70" text-anchor="middle" font-family="Baloo 2, Impact, sans-serif" font-weight="800" font-size="34" fill="#ffd166" stroke="${O}" stroke-width="2" paint-order="stroke">?</text>`, '0 0 100 100', 'fig enemy-fig mystery');
// Pęknięcie lodu (Reakcja Kruchość).
export const crackArt = () => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 50 L20 18 M50 50 L82 22 M50 50 L88 62 M50 50 L58 92 M50 50 L14 70 M34 34 L22 44 M68 36 L78 44 M66 58 L74 76 M40 62 L28 82" stroke="#e8f8ff" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M50 50 L20 18 M50 50 L82 22 M50 50 L88 62 M50 50 L58 92 M50 50 L14 70" stroke="#4aa3df" stroke-width="1.6" stroke-linecap="round" fill="none"/><circle cx="50" cy="50" r="7" fill="#fff"/></svg>`;
// Garnek z rosołem (ekran końca): przy porażce kurczak wpada do środka, przy wygranej stoi na garnku Prezesa.
export const potArt = (prezes = false) => svg(`
  <ellipse cx="100" cy="112" rx="70" ry="6" fill="rgba(0,0,0,.35)"/>
  <path d="M44 106 l-6 8 M156 106 l6 8" ${S} ${NF}/>
  <path d="M28 46 q0 62 72 62 q72 0 72 -62z" fill="${prezes ? '#ffc933' : '#e4572e'}" ${S}/>
  <path d="M40 62 q8 34 50 40" stroke="rgba(255,255,255,.35)" stroke-width="6" stroke-linecap="round" ${NF}/>
  <path d="M18 48 q-12 0 -12 10 q0 8 12 6 M182 48 q12 0 12 10 q0 8 -12 6" ${S} ${NF}/>
  <ellipse cx="100" cy="46" rx="74" ry="13" fill="${prezes ? '#e0a100' : '#b4472a'}" ${S}/>
  <ellipse cx="100" cy="46" rx="62" ry="8" fill="#f4b860" stroke="${O}" stroke-width="2"/>
  <circle cx="78" cy="45" r="3" fill="#ffe08a"/><circle cx="118" cy="47" r="2.4" fill="#ffe08a"/><circle cx="102" cy="44" r="1.8" fill="#fff3b0"/>
  ${prezes ? `<rect x="78" y="70" width="44" height="16" rx="3" fill="#fff3d6" ${S2}/><text x="100" y="82" text-anchor="middle" font-family="Baloo 2, Impact, sans-serif" font-weight="800" font-size="11" fill="${O}">PREZES</text>` : ''}`, '0 0 200 120', 'pot-art');
// Kod kreskowy legitymacji (paski wyliczone z identyfikatora postaci, zawsze takie same).
export function barcode(id) {
  let h = 7, x = 0, bars = '';
  for (let i = 0; i < 26; i++) { h = (h * 31 + id.charCodeAt(i % id.length) + i) % 9973; const w = 1 + (h % 3); if (i % 2 === 0) bars += `<rect x="${x}" y="0" width="${w}" height="20" fill="#2b1a12"/>`; x += w + (h % 2); }
  return `<svg class="barcode" viewBox="0 0 ${x} 20" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>`;
}
export const menuIcon = (cls = 'mico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6 h16 M4 12 h16 M4 18 h16" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`;
export const skullIcon =(cls = 'skull') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 C5 2 3 8 5 12 l1 4 h12 l1 -4 C21 8 19 2 12 2z" fill="#f1e9d6" stroke="#2b1a12" stroke-width="1.8" stroke-linejoin="round"/><circle cx="9" cy="10" r="2.4" fill="#2b1a12"/><circle cx="15" cy="10" r="2.4" fill="#2b1a12"/><path d="M9 17 v4 M12 17 v4 M15 17 v4" stroke="#2b1a12" stroke-width="1.8"/></svg>`;

// ---------- Tablica Zarządu: młotek i gwóźdź do przybijania faktur ----------
// Młotek rysowany pionowo (głowica u góry, rączka w dół); obraca się wokół końca rączki (60,112).
export const hammerArt = () => `<svg class="hammer-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="53" y="38" width="14" height="76" rx="6" fill="#a0692e" ${S}/>
  <path d="M55 60 h10 M55 76 h10 M55 92 h10" stroke="${O}" stroke-width="1.6" stroke-linecap="round" opacity=".45"/>
  <path d="M20 14 h62 q10 0 18 8 q-8 6 -14 6 l-4 14 h-62 q-6 0 -6 -6 v-16 q0 -6 6 -6 z" fill="#aab4bf" ${S}/>
  <path d="M20 14 h8 v28 h-8 q-6 0 -6 -6 v-16 q0 -6 6 -6 z" fill="#7d8793" ${S2}/>
  <path d="M34 20 h40" stroke="#e8edf2" stroke-width="3" stroke-linecap="round" opacity=".7"/>
</svg>`;
export const nailArt = () => `<svg class="nail-svg" viewBox="0 0 16 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M6.6 5 h2.8 v31 l-1.4 3 l-1.4 -3 z" fill="#aab4bf" ${S2}/>
  <ellipse cx="8" cy="4" rx="7" ry="3.2" fill="#d8dee4" ${S2}/>
  <path d="M4 3.4 h4" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>
</svg>`;

// ---------- Palniki (wybór poziomu trudności; poziom 0..5) ----------
// Garnek stoi na coraz groźniejszym źródle ciepła: ognisko, gazówka, kuchenka, piec, kuźnia, wulkan.
export function burnerArt(lv = 0) {
  const o = '#2b1a12', pot = (y = 52, glow = '') => `<g class="bpot"><path d="M62 ${y} h76 l-6 44 q-2 8 -10 8 h-44 q-8 0 -10 -8z" fill="#8a929b" stroke="${o}" stroke-width="4" stroke-linejoin="round"/><ellipse cx="100" cy="${y}" rx="40" ry="8" fill="#e9b25a" stroke="${o}" stroke-width="4"/><path d="M58 ${y + 4} h-12 M142 ${y + 4} h12" stroke="${o}" stroke-width="6" stroke-linecap="round"/>${glow}<path d="M78 ${y + 14} q0 22 6 30" stroke="#fff" stroke-opacity=".35" stroke-width="5" fill="none" stroke-linecap="round"/></g><g class="bsteam"><path d="M86 ${y - 8} q-8 -12 0 -22 M104 ${y - 10} q-8 -14 0 -26 M120 ${y - 8} q-8 -12 0 -22" stroke="#ffe9c2" stroke-width="4" stroke-linecap="round" fill="none"/></g>`;
  const flame = (x, y, s, c1, c2) => `<g class="bflame" style="transform-origin:${x}px ${y}px"><path d="M${x} ${y} q${-12 * s} ${-6 * s} ${-8 * s} ${-24 * s} q${3 * s} ${6 * s} ${6 * s} ${4 * s} q${-2 * s} ${-14 * s} ${6 * s} ${-26 * s} q${2 * s} ${12 * s} ${8 * s} ${20 * s} q${8 * s} ${10 * s} ${-4 * s} ${26 * s}z" fill="${c1}" stroke="${o}" stroke-width="2.5" stroke-linejoin="round"/><path d="M${x} ${y} q${-5 * s} ${-3 * s} ${-3 * s} ${-12 * s} q${3 * s} ${-6 * s} ${4 * s} ${-14 * s} q${5 * s} ${8 * s} ${3 * s} ${16 * s}z" fill="${c2}"/></g>`;
  const body = [
    // 0: ognisko z dwóch patyków
    () => `${pot(44)}<path d="M52 150 l92 -22 M148 150 l-92 -22" stroke="#6b4423" stroke-width="10" stroke-linecap="round"/><path d="M52 150 l92 -22 M148 150 l-92 -22" stroke="${o}" stroke-width="3" stroke-linecap="round" fill="none" opacity=".5"/>${flame(100, 134, 1.1, '#ff9a2e', '#ffe27a')}<ellipse cx="100" cy="156" rx="64" ry="7" fill="#000" opacity=".25"/>`,
    // 1: kuchenka gazowa z niebieskim płomieniem
    () => `<rect x="44" y="116" width="112" height="46" rx="8" fill="#cfd6dc" stroke="${o}" stroke-width="4"/><circle cx="68" cy="140" r="7" fill="#7a838c" stroke="${o}" stroke-width="3"/><circle cx="100" cy="140" r="7" fill="#7a838c" stroke="${o}" stroke-width="3"/><circle cx="132" cy="140" r="7" fill="#e4572e" stroke="${o}" stroke-width="3"/><path d="M62 116 v-8 h76 v8 M70 108 v-8 M130 108 v-8 M100 108 v-8" stroke="${o}" stroke-width="5" stroke-linecap="round"/>${pot(44)}${[78, 92, 108, 122].map(x => flame(x, 108, .5, '#4db3ff', '#d7f1ff')).join('')}`,
    // 2: zwykła kuchenka z rozgrzaną płytą
    () => `<rect x="38" y="112" width="124" height="52" rx="8" fill="#eceff1" stroke="${o}" stroke-width="4"/><rect x="48" y="104" width="104" height="12" rx="5" fill="#37474f" stroke="${o}" stroke-width="3"/><path d="M62 110 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0" stroke="#ff5a36" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="52" y="128" width="96" height="28" rx="5" fill="#90a4ae" stroke="${o}" stroke-width="3"/><circle cx="66" cy="142" r="5" fill="#e4572e" stroke="${o}" stroke-width="2"/><circle cx="100" cy="142" r="5" fill="#455a64" stroke="${o}" stroke-width="2"/><circle cx="134" cy="142" r="5" fill="#455a64" stroke="${o}" stroke-width="2"/>${pot(42, '<ellipse cx="100" cy="94" rx="30" ry="5" fill="#ff5a36" opacity=".35"/>')}`,
    // 3: piec z ogniem w środku
    () => `<rect x="36" y="100" width="128" height="64" rx="10" fill="#7e5a45" stroke="${o}" stroke-width="4"/><path d="M36 118 h128 M36 138 h128 M80 100 v18 M122 118 v20 M70 138 v26 M136 138 v26" stroke="${o}" stroke-width="2.5" opacity=".55"/><path d="M68 164 v-34 q0 -18 32 -18 q32 0 32 18 v34z" fill="#1a0c06" stroke="${o}" stroke-width="4"/>${flame(100, 160, 1.15, '#ff7a1a', '#ffd34a')}<rect x="52" y="92" width="96" height="10" rx="4" fill="#4a4f55" stroke="${o}" stroke-width="3"/>${pot(40)}`,
    // 4: kuźnia z kominem i iskrami
    () => `<rect x="30" y="98" width="140" height="68" rx="6" fill="#4b4f57" stroke="${o}" stroke-width="4"/><rect x="150" y="40" width="22" height="62" fill="#5d4a3a" stroke="${o}" stroke-width="4"/><path d="M52 166 v-40 q0 -22 48 -22 q48 0 48 22 v40z" fill="#220b05" stroke="${o}" stroke-width="4"/><path d="M58 166 q0 -30 42 -30 q42 0 42 30z" fill="#ff4a14"/>${flame(80, 160, 1.1, '#ff5a14', '#ffd34a')}${flame(120, 160, 1.1, '#ff5a14', '#ffd34a')}${flame(100, 156, 1.4, '#ff8a1a', '#fff0a0')}<g class="bspark"><circle cx="46" cy="90" r="3" fill="#ffd34a"/><circle cx="150" cy="84" r="2.5" fill="#ffd34a"/><circle cx="36" cy="70" r="2" fill="#ff7a1a"/></g>${pot(38)}`,
    // 5: wulkan z lawą
    () => `<path d="M10 168 L72 82 q28 -16 56 0 L190 168z" fill="#4a2a22" stroke="${o}" stroke-width="4" stroke-linejoin="round"/><path d="M72 84 q28 -14 56 0 l-6 10 q-22 -10 -44 0z" fill="#ff5a14"/><path d="M96 94 q-8 24 -2 40 q4 14 -6 30 M116 94 q8 24 2 44 q-3 12 6 26" stroke="#ff7a1a" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M96 94 q-8 24 -2 40 M116 94 q8 24 2 44" stroke="#ffd34a" stroke-width="3" fill="none" stroke-linecap="round"/>${flame(60, 120, .8, '#ff4a14', '#ffd34a')}${flame(144, 124, .8, '#ff4a14', '#ffd34a')}<g class="bspark"><circle cx="50" cy="70" r="3" fill="#ff7a1a"/><circle cx="154" cy="60" r="3" fill="#ffd34a"/><circle cx="100" cy="30" r="2.5" fill="#ff7a1a"/></g>${pot(52)}<path d="M82 76 l8 -6 l-2 10z M118 76 l-8 -6 l2 10z" fill="#ff2a1a" stroke="${o}" stroke-width="1.5"/><circle cx="100" cy="88" r="0" fill="none"/>`,
  ][Math.max(0, Math.min(5, lv | 0))];
  return `<svg class="burner-art b${lv}" viewBox="0 0 200 170" aria-hidden="true">${body()}</svg>`;
}
// Medal osiągnięcia: kolor wg grupy, symbol w środku; zgaszony, gdy jeszcze nie zdobyty.
const MEDAL = { win: '#f0b429', style: '#4db6ff', fight: '#ef6a4a', coll: '#7bd88f', meta: '#c792ea' };
export const medal = (g, sym, locked = false) => `<svg class="medal${locked ? ' locked' : ''}" viewBox="0 0 48 56" aria-hidden="true"><path d="M14 2 L24 22 L34 2 Z" fill="${locked ? '#555' : '#b4472a'}" stroke="#2b1a12" stroke-width="2.4" stroke-linejoin="round"/><circle cx="24" cy="32" r="17" fill="${locked ? '#3a3631' : MEDAL[g] || '#f0b429'}" stroke="#2b1a12" stroke-width="3"/><circle cx="24" cy="32" r="12" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="1.6"/><text x="24" y="38.5" text-anchor="middle" font-size="17" font-weight="700" fill="${locked ? '#7a746a' : '#2b1a12'}" font-family="Baloo 2, sans-serif">${sym}</text></svg>`;
export const bookIcon = (cls = 'mico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5 q5 -2 9 1 q4 -3 9 -1 v14 q-5 -2 -9 1 q-4 -3 -9 -1z M12 6 v14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
export const helpIcon = (cls = 'mico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M9 9.5 q0 -3 3 -3 q3 0 3 2.6 q0 1.6 -2 2.6 q-1 .6 -1 1.8 M12 17.2 v.2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`;

// ---------- Sklepik Zakładowy: stroje na kurczaku ----------
// Wszystkie postacie mają głowę w (66,40) i tułów w (48,64), więc nakładki pasują do każdej. `eq` = { slot: id } z profilu.
let OUTFIT = null;
export function setOutfit(eq) { OUTFIT = eq && Object.keys(eq).length ? { ...eq } : null; }
const WEAR_UNDER = {
  aura: () => `<g class="wear-aura"><ellipse cx="48" cy="62" rx="47" ry="43" fill="#ffb347" opacity=".16"/><ellipse cx="48" cy="62" rx="40" ry="36" fill="#ffd27a" opacity=".12"/>
    <path d="M14 70 q-9 -14 1 -27 q-5 15 5 26 z" fill="#fff3d6" opacity=".85" ${S2}/><path d="M84 78 q10 -12 2 -26 q-1 14 -8 25 z" fill="#fff3d6" opacity=".85" ${S2}/><path d="M24 30 q-6 -10 2 -18 q0 9 5 17 z" fill="#ffe9b8" opacity=".8" ${S2}/>
    <path d="M30 10 q-5 -6 0 -10 M48 8 q-5 -6 0 -12" stroke="#fff" stroke-width="3" stroke-linecap="round" ${NF} opacity=".7"/></g>`,
};
const WEAR_OVER = {
  dres: () => `<path d="M30 60 q18 -7 33 0 l-4 25 q-13 6 -26 0 z" fill="#2c3e50" ${S}/><path d="M37 62 v21 M42 61 v22" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M38 60 q10 13 22 0" stroke="#ffd23f" stroke-width="2.6" ${NF} stroke-linecap="round"/><circle cx="49" cy="72" r="3.6" fill="#ffd23f" ${S2}/><path d="M34 60 q-4 -8 4 -10 q6 4 6 10 z" fill="#34495e" ${S2}/>`,
  fartuch: () => `<path d="M34 58 h25 l-3 27 q-10 5 -19 0 z" fill="#f7f7f2" ${S}/><path d="M34 58 q-8 3 -10 9 M59 58 q6 1 8 6" stroke="#f7f7f2" stroke-width="3.4" ${NF} stroke-linecap="round"/>
    <rect x="40" y="70" width="12" height="8" rx="2" fill="#e8e6dc" ${S2}/><path d="M43 63 h6" stroke="#cfc9b8" stroke-width="2" stroke-linecap="round"/>`,
  kask: () => `<path d="M51 35 q15 -24 30 0 z" fill="#f5c518" ${S}/><rect x="49" y="33" width="34" height="5.5" rx="2.4" fill="#e0a800" ${S2}/><path d="M66 20 v13" stroke="#e0a800" stroke-width="3" stroke-linecap="round"/>
    <circle cx="77" cy="28" r="4.4" fill="#fff6a8" ${S2}/><path d="M81 27 l9 -4 M81 29 l10 2" stroke="#fff6a8" stroke-width="2" stroke-linecap="round" opacity=".7"/>`,
  okulary: () => `<path d="M57 36 h22 v6 q-1 6 -7 6 h-8 q-7 0 -7 -6 z" fill="#15151c" ${S2}/><path d="M60 38 l5 0 M70 38 l5 0" stroke="#7a8aa6" stroke-width="1.6" stroke-linecap="round"/><path d="M57 37 l-7 -3" stroke="#15151c" stroke-width="2.6" stroke-linecap="round"/>`,
};
function outfitWrap(inner, eq) {
  if (!eq) return inner;
  const under = Object.values(eq).map(id => WEAR_UNDER[id]).filter(Boolean).map(f => f()).join('');
  const over = ['body', 'eyes', 'head'].map(slot => WEAR_OVER[eq[slot]]).filter(Boolean).map(f => f()).join('');
  return under + inner + over;
}

// ---------- Księga Rosołów: miska z rosołem w kolorze przepisu ----------
export function soupArt(color = '#f2cf7a') {
  return svg(`<ellipse cx="50" cy="88" rx="36" ry="6" fill="#000" opacity=".3"/>
    <path d="M13 52 h74 q-2 31 -23 37 h-28 q-21 -6 -23 -37 z" fill="#f4efe6" ${S}/><path d="M28 80 q22 6 44 0" stroke="#d8d0c0" stroke-width="2.4" ${NF} stroke-linecap="round"/>
    <ellipse cx="50" cy="52" rx="37" ry="10" fill="#e6dfd2" ${S}/><ellipse cx="50" cy="52.5" rx="32" ry="7" fill="${color}" ${S2}/>
    <circle cx="38" cy="51" r="2.4" fill="#fff" opacity=".55"/><circle cx="58" cy="54" r="2" fill="#fff" opacity=".45"/><circle cx="66" cy="50" r="1.6" fill="#fff" opacity=".5"/>
    <path d="M36 54 q4 -3 8 0 q4 3 8 0" stroke="#fff" stroke-width="1.8" ${NF} stroke-linecap="round" opacity=".6"/>
    <g class="soup-steam"><path d="M38 40 q-5 -8 0 -15 M50 38 q-5 -9 0 -18 M62 40 q-5 -8 0 -15" stroke="#fff" stroke-width="3" stroke-linecap="round" ${NF} opacity=".7"/></g>`, '0 0 100 100', 'fig soup-fig');
}
