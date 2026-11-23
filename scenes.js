// Bulgot: tła pełnoekranowej walki. Trzy strefy = trzy sceny (Kurnik i Podwórze, Magazyn Pasz i Chłodnia, Sortownia Jaj i Biuro Zarządu).
// Każda to jeden SVG 1920×1080 (preserveAspectRatio slice): horyzont ok. y=520, podłoga pod nim, tam stoją postacie.
const W = 1920, H = 1080, HOR = 520;
const seeded = seed => { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; };
const wrap = inner => `<svg class="scene-bg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${inner}</svg>`;
const lines = (vx, vy, n, step, stroke, op) => { let o = ''; for (let i = -n; i <= n; i++) o += `<line x1="${vx}" y1="${vy}" x2="${vx + i * step}" y2="${H}" stroke="${stroke}" stroke-opacity="${op}" stroke-width="2"/>`; return o; };
const rows = (y0, n, stroke, op) => { let o = ''; for (let i = 0; i < n; i++) { const y = y0 + Math.pow(i / (n - 1), 2) * (H - y0); o += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${stroke}" stroke-opacity="${op}" stroke-width="2"/>`; } return o; };

// ---------- Strefa I: Kurnik i Podwórze (wieczór, wieżowiec Rosołexu w oddali) ----------
function kurnik() {
  const rnd = seeded(31);
  let tower = ''; for (let r = 0; r < 18; r++) for (let c = 0; c < 6; c++) if (rnd() < .45) tower += `<rect x="${1350 + c * 30 + 14}" y="${150 + r * 18}" width="12" height="8" fill="#ffd98a" opacity=".85"/>`;
  let straw = ''; for (let i = 0; i < 90; i++) { const x = rnd() * W, y = HOR + 30 + rnd() * (H - HOR - 40), l = 14 + rnd() * 26; straw += `<path d="M${x} ${y} l${l} ${-3 + rnd() * 6}" stroke="${rnd() < .5 ? '#d9b45a' : '#b88a3a'}" stroke-width="3" stroke-linecap="round" opacity=".55"/>`; }
  const slat = x => `<rect x="${x}" y="${HOR - 70}" width="34" height="86" rx="4" fill="#9a6a3a" stroke="#4a2c14" stroke-width="3"/>`;
  return wrap(`<defs>
    <linearGradient id="k-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5a9a"/><stop offset=".55" stop-color="#e08a8a"/><stop offset="1" stop-color="#ffd7a0"/></linearGradient>
    <linearGradient id="k-gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6a3a"/><stop offset="1" stop-color="#4a3420"/></linearGradient>
    <linearGradient id="k-tw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a3a5a"/><stop offset="1" stop-color="#2a2a46"/></linearGradient></defs>
    <rect width="${W}" height="${HOR + 20}" fill="url(#k-sky)"/>
    ${[...Array(30)].map(() => `<circle cx="${rnd() * W}" cy="${rnd() * 220}" r="${.6 + rnd() * 1.3}" fill="#fff" opacity="${.25 + rnd() * .5}"/>`).join('')}
    <circle cx="360" cy="150" r="46" fill="#fff6d8" opacity=".92"/><circle cx="378" cy="140" r="40" fill="#e9a0a0" opacity=".0"/>
    <path d="M0 ${HOR - 30} q220 -90 460 -30 t520 -10 t520 -40 t420 40 V${HOR + 20} H0 z" fill="#5a4a7a" opacity=".7"/>
    <rect x="1350" y="130" width="200" height="${HOR - 110}" fill="url(#k-tw)"/>${tower}<rect x="1434" y="70" width="32" height="64" fill="#2a2a46"/><rect x="1448" y="30" width="4" height="44" fill="#2a2a46"/><circle cx="1450" cy="28" r="7" fill="#ff3d3d"><animate attributeName="opacity" values="1;.2;1" dur="1.6s" repeatCount="indefinite"/></circle>
    <text x="1450" y="124" text-anchor="middle" font-family="Baloo 2,Impact" font-weight="800" font-size="30" letter-spacing="4" fill="#ffe3a8">ROSOŁEX</text>
    <rect y="${HOR + 6}" width="${W}" height="${H - HOR}" fill="url(#k-gr)"/>${straw}
    <ellipse cx="1100" cy="${HOR + 150}" rx="190" ry="26" fill="#5a7aa8" opacity=".45"/><ellipse cx="1090" cy="${HOR + 146}" rx="120" ry="14" fill="#9fc3ea" opacity=".35"/>
    <path d="M0 ${HOR + 4} H${W}" stroke="#3a2412" stroke-width="6"/>${[...Array(28)].map((_, i) => slat(i * 70 + 8)).join('')}
    <rect y="${HOR - 40}" width="${W}" height="12" fill="#7a4e28" stroke="#4a2c14" stroke-width="3"/><rect y="${HOR - 6}" width="${W}" height="12" fill="#7a4e28" stroke="#4a2c14" stroke-width="3"/>
    <g transform="translate(110 ${HOR - 20})"><path d="M0 0 L190 -150 L380 0 Z" fill="#b8402a" stroke="#4a2414" stroke-width="6" stroke-linejoin="round"/><rect x="26" y="0" width="328" height="190" fill="#c98a52" stroke="#4a2414" stroke-width="6"/>
      <rect x="150" y="70" width="80" height="120" rx="40" fill="#3a2414" stroke="#4a2414" stroke-width="5"/><circle cx="190" cy="-60" r="34" fill="#3a2414" stroke="#4a2414" stroke-width="5"/><circle cx="190" cy="-60" r="22" fill="#ffd98a"/>
      <path d="M150 190 l-50 60 h210 l-50 -60" fill="#8a5a2a" stroke="#4a2414" stroke-width="5"/><path d="M120 250 h140 M135 230 h110 M150 210 h80" stroke="#4a2414" stroke-width="4"/></g>
    <g transform="translate(1600 ${HOR + 40})"><ellipse cx="60" cy="40" rx="86" ry="42" fill="#e3b858" stroke="#4a2c14" stroke-width="5"/><path d="M-10 36 q70 -26 140 0 M-4 52 q64 -20 128 0" stroke="#a87a28" stroke-width="4" fill="none"/></g>
    <g transform="translate(1740 ${HOR - 80})"><rect x="-6" y="0" width="12" height="140" fill="#3a2a1a"/><rect x="-26" y="-12" width="52" height="22" rx="8" fill="#3a2a1a"/><ellipse cx="0" cy="22" rx="60" ry="30" fill="#ffd98a" opacity=".35"/></g>`);
}

// ---------- Strefa II: Magazyn Pasz i Chłodnia (hala, pasza po lewej, mroźna komora po prawej) ----------
function magazyn() {
  const rnd = seeded(77);
  const sack = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 q-6 -34 8 -52 h56 q14 18 8 52 z" fill="${c}" stroke="#3a2a14" stroke-width="4" stroke-linejoin="round"/><rect x="14" y="-34" width="44" height="20" rx="3" fill="#fff6dc" opacity=".85"/><text x="36" y="-18" text-anchor="middle" font-family="Baloo 2,Impact" font-weight="800" font-size="15" fill="#7a3a14">PASZA</text></g>`;
  let crystals = ''; for (let i = 0; i < 16; i++) { const x = 1480 + rnd() * 380, y = 200 + rnd() * 270, h = 18 + rnd() * 40; crystals += `<polygon points="${x},${y} ${x + 9},${y + h} ${x - 9},${y + h}" fill="#dff6ff" stroke="#6bb8e6" stroke-width="2" opacity=".85"/>`; }
  return wrap(`<defs>
    <linearGradient id="m-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4a52"/><stop offset="1" stop-color="#5a6a6c"/></linearGradient>
    <linearGradient id="m-fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a7476"/><stop offset="1" stop-color="#3a4244"/></linearGradient>
    <radialGradient id="m-cone" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#fff3b8" stop-opacity=".55"/><stop offset="1" stop-color="#fff3b8" stop-opacity="0"/></radialGradient>
    <linearGradient id="m-cold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfeaff"/><stop offset="1" stop-color="#7ac0ee"/></linearGradient></defs>
    <rect width="${W}" height="${HOR + 10}" fill="url(#m-wall)"/>
    ${[...Array(32)].map((_, i) => `<rect x="${i * 62}" y="0" width="6" height="${HOR}" fill="#2a363c" opacity=".7"/>`).join('')}
    <rect width="${W}" height="70" fill="#242e34"/>${[...Array(14)].map((_, i) => `<rect x="${i * 140 + 20}" y="14" width="100" height="14" fill="#8a989c" opacity=".7"/>`).join('')}
    ${[300, 780, 1260].map(x => `<line x1="${x}" y1="70" x2="${x}" y2="140" stroke="#1a2024" stroke-width="4"/><path d="M${x - 46} 140 h92 l-12 -24 h-68 z" fill="#d6c24a" stroke="#1a2024" stroke-width="4"/><path d="M${x - 40} 144 L${x - 190} ${HOR + 130} H${x + 190} L${x + 40} 144 z" fill="url(#m-cone)"/>`).join('')}
    <rect y="${HOR + 6}" width="${W}" height="${H - HOR}" fill="url(#m-fl)"/>${lines(960, HOR + 6, 14, 280, '#1a2024', .35)}${rows(HOR + 6, 12, '#1a2024', .3)}
    <rect x="1430" y="150" width="440" height="${HOR - 130}" rx="8" fill="#2a363c" stroke="#161c20" stroke-width="6"/>
    <rect x="1456" y="176" width="388" height="${HOR - 182}" fill="url(#m-cold)" opacity=".92"/>${crystals}
    <path d="M1456 ${HOR - 6} q60 -50 120 -12 t120 -4 t120 -22 t28 20 v18 h-388 z" fill="#fff" opacity=".7"/>
    <text x="1650" y="128" text-anchor="middle" font-family="Baloo 2,Impact" font-weight="800" font-size="34" letter-spacing="6" fill="#bfeaff">CHŁODNIA −18°C</text>
    <g>${[0, 1, 2].map(r => [0, 1, 2, 3].map(c => sack(80 + c * 82 + (r % 2) * 30, HOR - 8 - r * 54, 1, ['#d7b36a', '#e0c07a', '#c9a458'][(r + c) % 3])).join('')).join('')}</g>
    <g>${[0, 1].map(r => [0, 1, 2].map(c => sack(520 + c * 82 + r * 20, HOR - 8 - r * 54, 1, ['#e0c07a', '#d7b36a'][(r + c) % 2])).join('')).join('')}</g>
    <rect x="50" y="${HOR - 4}" width="440" height="22" fill="#8a5a2a" stroke="#3a2412" stroke-width="5"/><rect x="500" y="${HOR - 4}" width="320" height="22" fill="#8a5a2a" stroke="#3a2412" stroke-width="5"/>
    <g transform="translate(1100 ${HOR + 40})"><rect x="0" y="0" width="150" height="16" fill="#8a5a2a" stroke="#3a2412" stroke-width="4"/><rect x="10" y="16" width="26" height="22" fill="#6a4220" stroke="#3a2412" stroke-width="4"/><rect x="114" y="16" width="26" height="22" fill="#6a4220" stroke="#3a2412" stroke-width="4"/>${sack(20, -2, .9, '#d7b36a')}${sack(80, -2, .9, '#e0c07a')}</g>
    <rect width="${W}" height="${H}" fill="#7ac0ee" opacity=".07"/>`);
}

// ---------- Strefa III: Sortownia Jaj i Biuro Zarządu: dach wieżowca o zachodzie słońca ----------
function taras() {
  const rnd = seeded(5);
  let sky = ''; for (let i = 0; i < 34; i++) { const x = i * 60 - 30, h = 60 + rnd() * 200, w = 36 + rnd() * 40; sky += `<rect x="${x}" y="${HOR + 40 - h}" width="${w}" height="${h}" fill="${rnd() < .5 ? '#5a3a6e' : '#6b4580'}" opacity=".9"/>`;
    for (let j = 0; j < h / 20; j++) if (rnd() < .3) sky += `<rect x="${x + 5 + (j % 3) * 10}" y="${HOR + 40 - h + 8 + j * 16}" width="5" height="7" fill="#ffd98a" opacity=".9"/>`; }
  const mast = (x, h) => `<g><rect x="${x - 5}" y="${HOR - h}" width="10" height="${h}" fill="#2a2233"/><circle cx="${x}" cy="${HOR - h}" r="9" fill="#ff3d3d"><animate attributeName="opacity" values="1;.2;1" dur="1.4s" repeatCount="indefinite"/></circle><path d="M${x - 40} ${HOR - h * .6} L${x} ${HOR - h * .9} L${x + 40} ${HOR - h * .6}" stroke="#2a2233" stroke-width="4" fill="none"/></g>`;
  return wrap(`<defs>
    <linearGradient id="t-sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a7a"/><stop offset=".45" stop-color="#b9548c"/><stop offset=".8" stop-color="#ff9a6a"/><stop offset="1" stop-color="#ffd08a"/></linearGradient>
    <linearGradient id="t-dk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4d4658"/><stop offset="1" stop-color="#2a2433"/></linearGradient>
    <radialGradient id="t-sun"><stop offset="0" stop-color="#fff2c0"/><stop offset=".4" stop-color="#ffc66a" stop-opacity=".8"/><stop offset="1" stop-color="#ff9a6a" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="${HOR + 20}" fill="url(#t-sk)"/><circle cx="1180" cy="${HOR - 40}" r="340" fill="url(#t-sun)"/>
    ${[...Array(40)].map(() => `<circle cx="${rnd() * W}" cy="${rnd() * 260}" r="${.6 + rnd() * 1.4}" fill="#fff" opacity="${.3 + rnd() * .5}"/>`).join('')}
    ${sky}${mast(220, 330)}${mast(1700, 280)}
    <rect y="${HOR + 10}" width="${W}" height="${H - HOR - 10}" fill="url(#t-dk)"/>${lines(960, HOR + 10, 14, 280, '#2b2433', .35)}${rows(HOR + 10, 12, '#2b2433', .3)}
    <ellipse cx="960" cy="820" rx="560" ry="140" fill="#3a3342" stroke="#e8e0cf" stroke-width="6"/><ellipse cx="960" cy="820" rx="480" ry="114" fill="none" stroke="#e8e0cf" stroke-width="4" stroke-dasharray="30 22" opacity=".8"/>
    <rect y="${HOR - 4}" width="${W}" height="16" fill="#1d1824"/>${[...Array(33)].map((_, i) => `<rect x="${i * 60}" y="${HOR - 60}" width="4" height="64" fill="#cfe3f0" opacity=".7"/>`).join('')}<rect y="${HOR - 62}" width="${W}" height="6" fill="#e8f2f8" opacity=".85"/>
    <g transform="translate(960 330)"><rect x="-300" y="-60" width="600" height="110" rx="12" fill="#1d1824" opacity=".55" stroke="#e8e0cf" stroke-width="3"/><text x="0" y="14" text-anchor="middle" font-family="Baloo 2,Impact" font-weight="800" font-size="74" letter-spacing="10" fill="#fff2d0" opacity=".9">ROSOŁEX</text></g>`);
}

export const fightScene = zone => (zone === 0 ? kurnik : zone === 1 ? magazyn : taras)();
// Chmury dryfujące nad sceną (HTML, żeby się poruszały niezależnie od SVG)
export const sceneClouds = zone => zone === 1 ? '' : `<i class="cloud" style="left:8%;top:22%;width:34vh;height:4vh;animation-delay:-2s"></i><i class="cloud" style="left:66%;top:14%;width:44vh;height:4.5vh;animation-delay:-5s"></i>`;
