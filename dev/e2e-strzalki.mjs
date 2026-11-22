// Bulgot: sterowanie strzałkami i Enterem (oferta, okno Mutacji). Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-strzalki.mjs
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const wait = ms => new Promise(r => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-first-run'] });
const p = await b.newPage(); const errs = [];
p.on('pageerror', e => errs.push(e.message));
await p.setViewport({ width: 1440, height: 900 });
await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'networkidle0' }); await wait(400);
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK: ' : 'FAIL: ') + m); if (!c) fails++; };
const focused = () => p.evaluate(() => { const a = document.activeElement; return a ? (a.dataset.act || '') + ':' + (a.dataset.i || a.dataset.v || '') : ''; });
// menu główne: strzałki + Enter
await p.keyboard.press('ArrowDown'); await wait(100);
ok((await focused()) !== ':', 'menu: strzałka zaznacza przycisk (' + await focused() + ')');
await p.click('[data-act=new]'); await wait(200);
await p.evaluate(() => document.querySelector('[data-act=setmode][data-v=quick]').click());
await p.click('[data-act=setnext]'); await wait(150); await p.click('[data-act=start]'); await wait(500);
await p.keyboard.press('Enter'); await wait(400);   // intro: Enter = główny przycisk
const st = () => p.evaluate(() => ({ phase: window.__bulgot.run.phase, tiles: window.__bulgot.run.tiles, offer: window.__bulgot.run.offer }));
let s = await st(); ok(s.phase === 'offer', 'oferta po intro');
await p.keyboard.press('ArrowRight'); await wait(80);
ok((await focused()) === 'pick:0', 'pierwsza strzałka: karta 1 (' + await focused() + ')');
await p.keyboard.press('ArrowRight'); await wait(80); await p.keyboard.press('ArrowRight'); await wait(80);
ok((await focused()) === 'pick:2', 'w prawo dwa razy: karta 3');
await p.keyboard.press('ArrowLeft'); await wait(80);
ok((await focused()) === 'pick:1', 'w lewo: karta 2');
await p.keyboard.press('ArrowDown'); await wait(80);
ok((await focused()) !== 'buyoffer:1', 'w dół: wyłączony Dokup (0 Ziaren) jest pomijany (' + await focused() + ')');
await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await wait(80);
await p.evaluate(() => document.querySelector('[data-act=pick][data-i="0"]').focus());
await p.keyboard.press('ArrowRight'); await wait(80);
ok((await focused()) === 'pick:1', 'znów karta 2');
const want = s.offer[1];
await p.screenshot({ path: (process.argv[2] || '.') + '/strzalki.png' });
await p.keyboard.press('Enter'); await wait(600);
s = await st(); ok(s.phase !== 'offer' && s.tiles.includes(want), 'Enter wybiera zaznaczoną kartę 2 (' + want + ')');
ok(!errs.length, 'bez błędów: ' + errs.join('; '));
await b.close(); process.exitCode = fails ? 1 : 0;
