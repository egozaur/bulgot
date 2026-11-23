// Bulgot: Księga Kurnika jako rozkładówka (strony ←/→, zakładki na dole, bez przewijania) i ikonki Księgi/Zasad na górnym pasku.
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-ksiega.mjs [katalog na zrzuty]
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = process.argv[2] || '.';
const wait = ms => new Promise(r => setTimeout(r, ms));
const ok = (c, m) => { console.log((c ? 'OK: ' : 'BŁĄD: ') + m); if (!c) process.exitCode = 1; };
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-first-run'] });
const p = await b.newPage();
const errs = [];
p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
for (const [w, h] of [[1920, 925], [1366, 650]]) {
  await p.setViewport({ width: w, height: h });
  await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bulgot:intro', '1'); }); await p.reload({ waitUntil: 'networkidle0' }); await wait(300);
  await p.click('[data-act=new]'); await wait(200); await p.click('[data-act=start]'); await wait(600);
  ok(!!(await p.$('.topbar [data-act=book]')) && !!(await p.$('.topbar [data-act=help]')), `${w}x${h} ikonki Księgi i zasad na górnym pasku`);
  await p.keyboard.press('k'); await wait(700);
  ok(!!(await p.$('.bookmodal')), 'klawisz K otwiera Księgę');
  const tabs = await p.$$eval('.booktabs .tab', t => t.map(x => x.dataset.v));
  for (const t of tabs) {
    await p.evaluate(v => document.querySelector(`.booktabs .tab[data-v=${v}]`).click(), t); await wait(700);
    const m = await p.evaluate(() => { const v = document.querySelector('.bookview'), m = document.querySelector('.bookmodal'); const r = m.getBoundingClientRect(); return { pages: G_pages(), vh: innerHeight, bottom: Math.round(r.bottom), msc: m.scrollHeight <= m.clientHeight + 2, txt: document.querySelector('.bookno').textContent }; function G_pages() { return +document.querySelector('.bookno').textContent.split(' z ')[1]; } });
    ok(m.bottom <= m.vh + 1 && m.msc, `${w}x${h} zakładka ${t}: ${m.txt}, okno mieści się (dół ${m.bottom}/${m.vh})`);
    if (t === 'tiles' && w === 1920) {
      await p.screenshot({ path: `${OUT}/ksiega-kafelki-1.png` });
      await p.keyboard.press('ArrowRight'); await wait(500);
      ok((await p.$eval('.bookno', e => e.textContent)).startsWith('Strona 2'), '→ przewraca stronę');
      await p.screenshot({ path: `${OUT}/ksiega-kafelki-2.png` });
    }
    if (t === 'hatch' && w === 1366) await p.screenshot({ path: `${OUT}/ksiega-wylegarnia-1366.png` });
  }
  await p.keyboard.press('Escape'); await wait(200);
}
ok(!errs.length, 'bez błędów w konsoli ' + errs.join(' | '));
await b.close();
