// Bulgot: ekran startowy w dwóch krokach (tryb + karuzela postaci, potem palnik), bez przewijania, sterowany klawiaturą.
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-start.mjs [katalog na zrzuty]
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = process.argv[2] || '.';
const wait = ms => new Promise(r => setTimeout(r, ms));
let bad = false;
const ok = (c, m) => { console.log((c ? 'OK: ' : 'BŁĄD: ') + m); if (!c) { bad = true; process.exitCode = 1; } };
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-first-run'] });
const p = await b.newPage();
const errs = [];
p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
for (const [w, h] of [[1920, 925], [1366, 650], [1280, 720], [390, 800]]) {
  await p.setViewport({ width: w, height: h });
  await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
  await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'networkidle0' }); await wait(400);
  await p.click('[data-act=new]'); await wait(300);
  const noScroll = () => p.evaluate(() => { const s = document.querySelector('.setup2'); const r = s.getBoundingClientRect(); return { fits: r.bottom <= innerHeight + 2 && s.scrollHeight <= s.clientHeight + 2, doc: document.documentElement.scrollHeight <= innerHeight + 2, sh: s.scrollHeight, ch: s.clientHeight, ih: innerHeight }; });
  let n = await noScroll(); ok(n.fits && n.doc, `${w}x${h} krok 1 mieści się bez przewijania ${JSON.stringify(n)}`);
  await p.screenshot({ path: `${OUT}/start1-${w}.png` });
  {   // żadna karta postaci (zwłaszcza zablokowana, z długim opisem i warunkiem) nie może być ucięta przez tor karuzeli
    const total = await p.evaluate(() => document.querySelectorAll('.car-card').length), cut = [];
    for (let i = 0; i < total; i++) {
      const m = await p.evaluate(() => { const t = document.querySelector('.car-track').getBoundingClientRect(), c = document.querySelector('.car-card.on'), r = c.getBoundingClientRect(); return { n: c.querySelector('h3').textContent, up: Math.round(t.top - r.top), down: Math.round(r.bottom - t.bottom) }; });
      if (m.up > 1 || m.down > 1) cut.push(`${m.n} (góra ${m.up}, dół ${m.down})`);
      await p.keyboard.press('ArrowRight'); await wait(320);
    }
    ok(cut.length === 0, `${w}x${h} żadna z ${total} kart postaci nie jest ucięta ${cut.join('; ')}`);
    for (let i = 0; i < total; i++) await p.keyboard.press('ArrowLeft'); await wait(300);
  }
  if (w === 1920) {
    // najechanie na kartę postaci nie może jej przesuwać ani wprawiać w drgania
    const cr = () => p.evaluate(() => { const r = document.querySelector('.car-card.on').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top)]; });
    const before = await cr();
    await p.mouse.move(before[0] + 60, before[1] + 80); await wait(400);
    const samples = []; for (let i = 0; i < 6; i++) { await wait(100); samples.push(await cr()); }
    ok(samples.every(s => Math.abs(s[0] - before[0]) <= 1 && Math.abs(s[1] - before[1]) <= 1), 'najechanie nie przesuwa karty postaci ' + JSON.stringify([before, samples[0], samples[5]]));
    await p.mouse.move(5, 5);
  }
  if (w === 1920) {
    await p.keyboard.press('ArrowDown'); await wait(100);
    ok(await p.evaluate(() => document.querySelector('.mode-opt.on h3').textContent) === 'Szybki', '↓ przełącza tryb');
    await p.keyboard.press('ArrowRight'); await wait(400);
    ok(await p.evaluate(() => document.querySelectorAll('.car-dots i.on').length === 1 && document.querySelector('.car-dots i:nth-child(2)').classList.contains('on')), '→ przesuwa karuzelę');
    await p.screenshot({ path: `${OUT}/start1-karuzela.png` });
    await p.keyboard.press('ArrowLeft'); await wait(300);
  }
  await p.keyboard.press('Enter'); await wait(300);
  n = await noScroll(); ok(n.fits && n.doc, `${w}x${h} krok 2 (palnik) mieści się ${JSON.stringify(n)}`);
  await p.screenshot({ path: `${OUT}/start2-${w}.png` });
  if (w === 1920) {
    await p.keyboard.press('Escape'); await wait(200);
    ok(await p.evaluate(() => !!document.querySelector('.step1')), 'Esc wraca do kroku 1');
    await p.keyboard.press('Enter'); await wait(200); await p.keyboard.press('Enter'); await wait(1200);
    ok(await p.evaluate(() => !!document.querySelector('.run, .modal')), 'Enter w kroku 2 startuje run');
  }
}
ok(!errs.length, 'bez błędów w konsoli ' + errs.join(' | '));
await b.close();
