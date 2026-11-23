// Bulgot: test dymny w prawdziwej przeglądarce (Edge + puppeteer-core): start runu, kilka rund, brak błędów w konsoli.
// Wymaga serwera plików: node C:\Users\Kurczak\tools\scripts\serve.mjs C:\Users\Kurczak\pl3y 8090 (LOBBY=…\egozaur.github.io)
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\smoke.mjs [tryb: quick|full] [liczba rund]
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const mode = process.argv[2] || 'quick', rounds = +(process.argv[3] || 3);
const wait = ms => new Promise(r => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-first-run'] });
const p = await b.newPage();
const errs = [];
p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
await p.setViewport({ width: 1440, height: 900 });
await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'networkidle0' }); await wait(400);
const st = () => p.evaluate(() => { const G = window.__bulgot; return { screen: G.screen, phase: G.run && G.run.phase, round: G.run && G.run.round }; });
const fail = msg => { console.error('BŁĄD:', msg); process.exitCode = 1; };

await p.click('[data-act=new]'); await wait(200);
await p.evaluate(m => document.querySelector(`[data-act=setmode][data-v=${m}]`).click(), mode);
await p.click('[data-act=setnext]'); await wait(150); await p.click('[data-act=start]'); await wait(500);
await p.click('[data-act=introgo]'); await wait(300);
if ((await st()).phase !== 'offer') fail('po starcie powinna być oferta');

for (let r = 0; r < rounds; r++) {
  let s = await st();
  if (s.screen !== 'run') break;
  if (s.phase === 'offer') { await p.keyboard.press('1'); await wait(400); s = await st(); }
  if (s.phase === 'event') { await p.evaluate(() => (document.querySelector('[data-act=leave]') || document.querySelector('[data-act=bet][data-v="0"]') || document.querySelector('[data-act=choose][data-i="2"]')).click()); await wait(300); s = await st(); }
  await p.evaluate(() => { const c = document.querySelector('.modal [data-act=close]'); c && c.click(); document.querySelector('#invoice').innerHTML = ''; });
  if (s.phase === 'fight') {
    await p.click('[data-act=tofight]'); await wait(1200);
    await p.keyboard.press('1'); await p.keyboard.press('2'); await p.keyboard.press('3');
    await p.evaluate(() => { const sp = document.querySelector('[data-act=speed]'); if (sp) { sp.click(); sp.click(); } });
    let done = false;
    for (let i = 0; i < 150 && !done; i++) { await wait(400); done = !!(await p.$('.inv, .modal')); }
    if (!done) fail('walka ' + (r + 1) + ' nie skończyła się w czasie');
    if (await p.evaluate(() => window.__bulgot.run.phase === 'over')) break;
    await p.evaluate(() => { const c = document.querySelector('.modal [data-act=close]'); c && c.click(); document.querySelector('#invoice').innerHTML = ''; }); await wait(400);
  }
  s = await st(); if (s.phase === 'bonus') { await p.keyboard.press('1'); await wait(400); }
  s = await st(); if (s.phase === 'door' || s.phase === 'badge' || s.phase === 'loot') { await p.keyboard.press('1'); await wait(400); }   // Rozwidlenie Korytarza: zwykłe drzwi
}
console.log('stan końcowy:', JSON.stringify(await st()));
if (errs.length) { fail('błędy strony:\n' + [...new Set(errs)].join('\n')); } else console.log('OK: bez błędów w konsoli');
await b.close();
