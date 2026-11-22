// Bulgot: test wielkiej podpowiedzi (tip.js). Najechanie na kafelek, statystykę, umiejętność i zestaw pokazuje kartę,
// która zawsze mieści się w oknie (też przy małym oknie i przy elementach przy prawej krawędzi).
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-podpowiedzi.mjs [katalog]
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = process.argv[2] || '.';
const wait = ms => new Promise(r => setTimeout(r, ms));
const fail = msg => { console.error('BŁĄD:', msg); process.exitCode = 1; };
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-first-run'] });
const p = await b.newPage();
const errs = [];
p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
await p.setViewport({ width: 1440, height: 900 });
await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'networkidle0' }); await wait(400);
await p.click('[data-act=new]'); await wait(200);
await p.click('[data-act=start]'); await wait(500);
await p.click('[data-act=introgo]'); await wait(300);
// weź dwa kafelki (po jednym na rundę nie zdążymy), więc dopisz kafelki do stanu widoku: wybierz pierwszy kafelek i zamknij okna
await p.keyboard.press('1'); await wait(500);
await p.evaluate(() => { const c = document.querySelector('.modal [data-act=close]'); c && c.click(); });
await wait(300);

const check = async (sel, name, size) => {
  const el = await p.$(sel);
  if (!el) { fail(`${size}: brak elementu ${sel} (${name})`); return; }
  await el.hover(); await wait(200);
  const r = await p.evaluate(() => { const t = document.querySelector('#tip'); if (!t || t.hidden) return null; const b = t.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, txt: t.textContent.slice(0, 80), vw: innerWidth, vh: innerHeight }; });
  if (!r) { fail(`${size}: podpowiedź "${name}" nie pokazała się`); return; }
  const ok = r.l >= -1 && r.t >= -1 && r.r <= r.vw + 1 && r.b <= r.vh + 1;
  console.log(`${size} ${name}:`, ok ? 'OK' : 'POZA OKNEM', JSON.stringify({ l: Math.round(r.l), t: Math.round(r.t), r: Math.round(r.r), b: Math.round(r.b) }), '|', r.txt.replace(/\s+/g, ' '));
  if (!ok) fail(`${size}: podpowiedź "${name}" wystaje poza okno`);
  return r;
};
for (const [w, h] of [[1920, 925], [1440, 780], [1366, 650]]) {
  await p.setViewport({ width: w, height: h }); await wait(300);
  const sz = `${w}x${h}`;
  await check('.chips .chip, .slot[data-tipk]', 'kafelek/umiejętność', sz);
  await p.screenshot({ path: `${OUT}/tip-kafelek-${sz}.png` });
  await check('.stats dt', 'statystyka (Życie)', sz);
  await check('.stats dt:nth-of-type(2)', 'statystyka (Atak)', sz);
  await p.screenshot({ path: `${OUT}/tip-atak-${sz}.png` });
  await check('.stats dt:nth-of-type(5)', 'statystyka (Krytyk)', sz);
  if (await p.$('.setline[data-tipk]')) await check('.setline[data-tipk]', 'zestaw', sz);
  await p.mouse.move(5, 5); await wait(150);
  const gone = await p.evaluate(() => document.querySelector('#tip').hidden);
  if (!gone) fail(`${sz}: podpowiedź nie znika po zjechaniu myszką`);
}
if (errs.length) { fail('błędy na stronie'); console.error(errs.join('\n')); }
await b.close();
console.log(process.exitCode ? 'NIEZALICZONY' : 'OK: podpowiedzi');
