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

// ---------- Wybór postaci: jajka ----------
// Odblokowana postać to skorupa z postrzępionym brzegiem, z której wystaje kurczak; zablokowana to jeszcze nie pęknięte, szare jajo.
const EGG = 'M100 10 C152 10 184 92 184 142 C184 188 148 208 100 208 C52 208 16 188 16 142 C16 92 48 10 100 10 Z';
const RIM = 132;   // wysokość brzegu skorupy
const ZIG = [[0, 138], [20, 124], [38, 142], [58, 124], [78, 144], [100, 126], [122, 144], [142, 124], [162, 142], [180, 124], [200, 138]];
const CHICK = {   // [rozmiar kurczaka w jednostkach jajka, przesunięcie x]; spód rysunku (y≈88) chowa się 12 jednostek pod brzegiem skorupy
  pyrtek: [150, 0], kwoka: [158, 0], kaczor: [150, 0], indor: [162, -4],
};
const BODIES = { pyrtek: PYRTEK, kwoka: KWOKA, kaczor: KACZOR, indor: INDOR };
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

export function enemyArt(key) { return svg((ENEMY[key] || ENEMY.rat)(), '0 0 100 100', 'fig enemy-fig'); }

// ---------- Ikony kafelków (48x48) ----------
const I = (inner) => svg(inner, '0 0 48 48', 'ico');
const k = (fill, extra = '') => `fill="${fill}" ${S2} ${extra}`;
const ICON = {
  // Kafelki rosnące
  'pierze-weterana': `<path d="M40 5 Q14 8 9 40 l5 3 Q18 18 40 5z" ${k('#e9dcc0')}/><path d="M12 41 L30 15 M16 30 l9 2 M20 24 l9 1 M24 19 l8 0" stroke="${O}" stroke-width="1.8" ${NF}/><path d="M23 10 l9 9 M27 8 l8 8" stroke="#e53950" stroke-width="3" stroke-linecap="round"/>`,
  'trofeum-z-pior': `<path d="M15 22 q-5 -13 3 -18 q3 9 -1 18z" ${k('#ffc933')}/><path d="M23 22 q-1 -15 6 -19 q2 11 -3 19z" ${k('#e53950')}/><path d="M30 22 q4 -11 11 -12 q-2 9 -8 12z" ${k('#7fd3ff')}/><rect x="9" y="21" width="30" height="22" rx="4" ${k('#8d6e63')}/><circle cx="24" cy="32" r="5" ${k('#ffc933')}/><path d="M24 29 v6 M21 32 h6" stroke="${O}" stroke-width="1.6"/>`,
  'skarbonka-piskleca': `<ellipse cx="23" cy="29" rx="16" ry="13" ${k('#ffd166')}/><rect x="18" y="14" width="10" height="3.4" rx="1.7" fill="${O}"/><circle cx="31" cy="25" r="2.2" fill="${O}"/><path d="M38 27 l7 2.5 l-7 2.5z" ${k('#ff9f1c')}/><path d="M15 41 v4 M29 41 v4" stroke="${O}" stroke-width="3" stroke-linecap="round"/><path d="M10 25 q-5 -2 -4 -7 q5 1 6 5" ${k('#ffe08a')}/>`,
  'automat-z-pasza': `<rect x="8" y="4" width="32" height="40" rx="4" ${k('#e53950')}/><rect x="13" y="9" width="22" height="18" rx="2" ${k('#bfeaff')}/><circle cx="18" cy="15" r="2.4" fill="#ffc933" stroke="${O}" stroke-width="1"/><circle cx="26" cy="20" r="2.4" fill="#ffc933" stroke="${O}" stroke-width="1"/><circle cx="30" cy="13" r="2.4" fill="#ffc933" stroke="${O}" stroke-width="1"/><rect x="13" y="32" width="14" height="6" rx="1" fill="${O}"/><circle cx="33" cy="35" r="3" ${k('#ffc933')}/>`,
  'kontrakt-hr': `<path d="M10 4 h22 l8 8 v32 h-30z" ${k('#fff')}/><path d="M32 4 v8 h8" stroke="${O}" stroke-width="2" ${NF}/><path d="M15 16 h16 M15 22 h18 M15 28 h12" stroke="#90a4ae" stroke-width="2"/><path d="M14 38 q4 -6 8 0 q4 6 8 -2 q2 -3 6 0" stroke="#1e88e5" stroke-width="2.2" ${NF} stroke-linecap="round"/>`,
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

export function tileIcon(id) { return I(ICON[id] || `<circle cx="24" cy="24" r="14" ${k('#ccc')}/>`); }

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
