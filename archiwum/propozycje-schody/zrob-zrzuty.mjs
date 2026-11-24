// Zrzuty makiet schodów w prawdziwym ekranie runu.
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\propozycje-schody\zrob-zrzuty.mjs [numery, np. 1 2 3]
// Wymaga serwera plików: node C:\Users\Kurczak\tools\scripts\serve.mjs C:\Users\Kurczak\pl3y 8090
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const OUT = 'C:/Users/Kurczak/pl3y/bulgot/propozycje-schody/zrzuty/';
const wait = ms => new Promise(r => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new' });
const p = await b.newPage(); await p.setViewport({ width: 1600, height: 900, deviceScaleFactor: 2 });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'networkidle0' }); await wait(400);
await p.click('[data-act=new]'); await wait(200);
await p.evaluate(() => document.querySelector('[data-act=setmode][data-v=full]').click());
await p.click('[data-act=setnext]'); await wait(150); await p.click('[data-act=start]'); await wait(500); await p.click('[data-act=introgo]'); await wait(500);
await p.evaluate(() => { const k = Object.keys(localStorage).find(x => x.endsWith(':run')); const run = JSON.parse(localStorage.getItem(k)); run.round = 8; run.phase = 'offer'; localStorage.setItem(k, JSON.stringify(run)); });
await p.reload({ waitUntil: 'networkidle0' }); await wait(500);
await p.evaluate(() => { const c = document.querySelector('[data-act=resume]'); c && c.click(); }); await wait(700);
const count = await p.evaluate(async () => (await import('/bulgot/propozycje-schody/schody.js')).VARIANTS.length);
const want = process.argv.slice(2).map(Number);
for (let i = 0; i < count; i++) {
  if (want.length && !want.includes(i + 1)) continue;
  const mount = async f => { for (let t = 0; t < 6; t++) { const name = await p.evaluate(async (i, f) => { const m = await import('/bulgot/propozycje-schody/schody.js'), G = window.__bulgot, v = m.VARIANTS[i]; m.mountTower(document.querySelector('.tower'), v, { mode: 'full', f, char: G.run.char, form: G.run.form }); return v.id; }, i, f); await wait(350); if (await p.evaluate(() => !!document.querySelector('.tower .vt'))) return name; } throw new Error('montaż nie utrzymał się'); };
  const name = await mount(8);
  const nn = String(i + 1).padStart(2, '0');
  await p.screenshot({ path: `${OUT}${nn}-${name}.png` });
  // szczegół: piętro 14 (strefa III), tylko pasek, w powiększeniu
  await mount(14);
  const r = await p.evaluate(() => { const r = document.querySelector('.tower').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
  await p.screenshot({ path: `${OUT}${nn}-${name}-detal.png`, clip: r, captureBeyondViewport: false });
  console.log(nn, name);
}
console.log(errs.length ? 'BŁĘDY: ' + errs.join(' | ') : 'ok');
await b.close();
