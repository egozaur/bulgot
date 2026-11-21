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

// Akcesoria na formy postaci innych niż Pyrtek.
const HEADS = { kwoka: [68, 40], kaczor: [66, 38], indor: [68, 40] };
const accessory = (char, form) => {
  const [hx, hy] = HEADS[char] || [66, 40];
  let a = '';
  if (form === 'bojowy' || form === 'rambo') a += `<ellipse cx="${hx - 28}" cy="${hy + 20}" rx="10" ry="7" fill="#8793a0" ${S}/><circle cx="${hx - 31}" cy="${hy + 19}" r="1.6" fill="#dfe6ee"/><circle cx="${hx - 24}" cy="${hy + 18}" r="1.6" fill="#dfe6ee"/>`;
  if (form === 'rambo') a += `<path d="M${hx - 14} ${hy - 6} q14 -9 28 -1 l0 7 q-14 -6 -28 1 z" fill="#d62828" ${S}/><path d="M${hx - 14} ${hy - 2} q-12 4 -16 14 q11 -5 19 -5 z" fill="#d62828" ${S}/>`;
  return a;
};

export function heroArt(char, form) {
  let body;
  if (char === 'pyrtek' || !char) body = ({ pyrtek: PYRTEK, kogut: KOGUT, bojowy: BOJOWY, rambo: RAMBO }[form] || PYRTEK)();
  else body = ({ kwoka: KWOKA, kaczor: KACZOR, indor: INDOR }[char] || KOGUT)() + accessory(char, form);
  return svg(body);
}
export const portrait = (char, form = 'pyrtek') => heroArt(char, form);

// ---------- Wrogowie i bossowie (patrzą w lewo, w stronę bohatera) ----------
const ENEMY = {
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

export function enemyArt(key) { return svg((ENEMY[key] || ENEMY.rat)(), '0 0 100 100', 'fig enemy-fig'); }

// ---------- Ikony kafelków (48x48) ----------
const I = (inner) => svg(inner, '0 0 48 48', 'ico');
const k = (fill, extra = '') => `fill="${fill}" ${S2} ${extra}`;
const ICON = {
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
export function tileIcon(id) { return I(ICON[id] || `<circle cx="24" cy="24" r="14" ${k('#ccc')}/>`); }

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
export function towerArt() {
  const floors = Array.from({ length: 12 }, (_, i) => {
    const y = 190 - i * 13;
    return `<rect x="70" y="${y}" width="80" height="11" fill="${i % 3 === 0 ? '#2c3150' : '#262b47'}" stroke="#12142a" stroke-width="1"/>${[0, 1, 2, 3].map(j => `<rect x="${76 + j * 19}" y="${y + 2}" width="10" height="7" fill="${(i * 7 + j * 3) % 5 === 0 ? '#ffd36a' : '#3d4770'}"/>`).join('')}`;
  }).join('');
  return `<svg class="tower-art" viewBox="0 -52 220 312" aria-hidden="true">
    <path d="M30 210 h160 v14 h-160z" fill="#12142a"/>
    ${floors}
    <path d="M62 36 h96 v156 h-96z" fill="none"/>
    <rect x="66" y="26" width="88" height="14" rx="3" fill="#455a64" stroke="#12142a" stroke-width="2"/>
    <path d="M70 26 q0 -34 40 -34 q40 0 40 34z" fill="#37474f" stroke="#12142a" stroke-width="3"/>
    <rect x="62" y="22" width="96" height="8" rx="3" fill="#607d8b" stroke="#12142a" stroke-width="2"/>
    <path d="M80 -6 q-10 -16 0 -30 M110 -10 q-10 -18 0 -34 M140 -6 q-10 -16 0 -30" class="steam" stroke="#ffe9c2" stroke-width="5" stroke-linecap="round" fill="none"/>
  </svg>`;
}

export const coinIcon = (cls = 'coin') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 C19 7 20 15 12 22 C4 15 5 7 12 2z" fill="#ffc933" stroke="#2b1a12" stroke-width="2" stroke-linejoin="round"/><path d="M12 7 C14 10 14 14 12 17" stroke="#fff3b0" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
export const skullIcon = (cls = 'skull') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 C5 2 3 8 5 12 l1 4 h12 l1 -4 C21 8 19 2 12 2z" fill="#f1e9d6" stroke="#2b1a12" stroke-width="1.8" stroke-linejoin="round"/><circle cx="9" cy="10" r="2.4" fill="#2b1a12"/><circle cx="15" cy="10" r="2.4" fill="#2b1a12"/><path d="M9 17 v4 M12 17 v4 M15 17 v4" stroke="#2b1a12" stroke-width="1.8"/></svg>`;
