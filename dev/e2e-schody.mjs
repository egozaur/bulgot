// Bulgot: test klatki schodowej (pasek pięter): plakietki wszystkich pięter, kurczak na właściwym piętrze, kamera go widzi,
// animacja wejścia piętro wyżej (kurczak idzie po przekątnej, na końcu obraca się), płomień rośnie z postępem.
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-schody.mjs [katalog na zrzuty]
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = process.argv[2] || '.';
const wait = ms => new Promise(r => setTimeout(r, ms));
const fail = msg => { console.error('BŁĄD:', msg); process.exitCode = 1; };
const ok = msg => console.log('OK:', msg);
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-first-run'] });
const p = await b.newPage();
const errs = [];
p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
await p.setViewport({ width: 1920, height: 925 });
await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'networkidle0' }); await wait(400);
const patch = async round => {
  await p.evaluate(rd => { const k = Object.keys(localStorage).find(x => x.endsWith(':run')); const run = JSON.parse(localStorage.getItem(k)); run.round = rd; run.phase = 'offer'; localStorage.setItem(k, JSON.stringify(run)); }, round);
  await p.reload({ waitUntil: 'networkidle0' }); await wait(500);
  await p.evaluate(() => { const c = document.querySelector('[data-act=resume]'); c && c.click(); }); await wait(500);
};
// widoczność kurczaka w oknie wieży i wysokość płomienia
const probe = () => p.evaluate(() => {
  const vp = document.querySelector('.climb-vp').getBoundingClientRect(), cab = document.querySelector('.cab').getBoundingClientRect(), fire = document.querySelector('.fire .flames').getBoundingClientRect();
  return { plates: document.querySelectorAll('.fp').length, now: document.querySelector('.fp.now .fn').textContent, inView: cab.top >= vp.top && cab.bottom <= vp.bottom && cab.left >= vp.left && cab.right <= vp.right, fireH: Math.round(fire.height), page: document.scrollingElement.scrollHeight - innerHeight };
});
for (const mode of ['quick', 'full']) {
  await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'networkidle0' }); await wait(400);
  await p.click('[data-act=new]'); await wait(200);
  await p.evaluate(m => document.querySelector(`[data-act=setmode][data-v=${m}]`).click(), mode);
  await p.click('[data-act=start]'); await wait(500); await p.click('[data-act=introgo]'); await wait(500);
  const n = mode === 'quick' ? 10 : 20; let prevFire = 0;
  for (const rd of [1, Math.ceil(n / 2), n]) {
    if (rd > 1) await patch(rd);
    const m = await probe();
    console.log(mode, 'piętro', rd, JSON.stringify(m));
    if (m.plates !== n) fail(`${mode}: ${m.plates} plakietek zamiast ${n}`);
    if (m.now !== String(rd)) fail(`${mode}: bieżące piętro ${m.now}, oczekiwano ${rd}`);
    if (!m.inView) fail(`${mode} piętro ${rd}: kurczak poza oknem wieży`);
    if (m.page > 1) fail(`${mode}: strona się przewija o ${m.page}`);
    if (m.fireH <= prevFire) fail(`${mode} piętro ${rd}: płomień nie urósł (${m.fireH} <= ${prevFire})`);
    prevFire = m.fireH;
    await (await p.$('.tower')).screenshot({ path: `${OUT}/schody-${mode}-${rd}.png` });
  }
  // animacja wejścia z piętra n-1 na n: kurczak zaczyna niżej i na boku, dochodzi do 0, na końcu zmienia kierunek
  const s = await p.evaluate(async () => {
    const G = window.__bulgot; G.cabFrom = G.run.round - 1; G.render();
    const out = [], t0 = performance.now(), m = e => new DOMMatrix(getComputedStyle(e).transform);
    while (performance.now() - t0 < 2200) { await new Promise(r => requestAnimationFrame(r)); const cab = document.querySelector('.cab'), face = document.querySelector('.cab .face'); out.push({ t: performance.now() - t0, x: m(cab).e, y: m(cab).f, face: m(face).a }); }
    return out;
  });
  const first = s[0], last = s[s.length - 1], mid = s.find(q => q.t > 700);
  if (!(first.y > 20 && Math.abs(first.x) > 20)) fail(`${mode}: animacja nie startuje z dołu (${JSON.stringify(first)})`);
  if (!(mid.y < first.y && mid.y > 0)) fail(`${mode}: kurczak nie jest w połowie drogi (${JSON.stringify(mid)})`);
  if (!(Math.abs(last.x) < 1 && Math.abs(last.y) < 1)) fail(`${mode}: kurczak nie dotarł na piętro (${JSON.stringify(last)})`);
  if (Math.sign(first.face) === Math.sign(last.face)) fail(`${mode}: kurczak nie obrócił się na końcu`);
  else ok(`${mode}: wejście piętro wyżej: start (${Math.round(first.x)}, ${Math.round(first.y)}) → 0, obrót na końcu`);
}
// wąski ekran: stara prosta lista pięter
await p.setViewport({ width: 900, height: 900 }); await wait(500);
const narrow = await p.evaluate(() => ({ old: document.querySelectorAll('.tower .floor').length, stairs: document.querySelectorAll('.tower.stairs').length }));
if (narrow.stairs !== 0 || narrow.old < 10) fail('wąski ekran powinien mieć prostą listę pięter: ' + JSON.stringify(narrow)); else ok('wąski ekran: prosta lista pięter');
await p.setViewport({ width: 1920, height: 925 }); await wait(500);
if (!(await p.$('.tower.stairs'))) fail('po powrocie na szeroki ekran brak klatki schodowej'); else ok('powrót na szeroki ekran: klatka schodowa');
if (errs.length) { fail('błędy na stronie'); console.error(errs.join('\n')); }
await b.close();
console.log(process.exitCode ? 'NIEZALICZONY' : 'OK: schody');
