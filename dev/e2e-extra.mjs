// Bulgot: test e2e dodatkowych rund (Gruszka na piętrze 3, Pipsztal na piętrze 6) w trybie lokalnym.
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-extra.mjs <katalog na zrzuty>
// Wymaga serwera plików: node C:\Users\Kurczak\tools\scripts\serve.mjs C:\Users\Kurczak\pl3y 8090
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import fs from 'node:fs';
const OUT = (process.argv[2] || 'C:/Users/Kurczak/pl3y/bulgot/dev/zrzuty-extra').split(String.fromCharCode(92)).join('/') + '/';
fs.mkdirSync(OUT, { recursive: true });
const wait = ms => new Promise(r => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new' });
const p = await b.newPage(); await p.setViewport({ width: 1600, height: 900 });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
let fails = 0; const ok = (c, msg) => { if (!c) { fails++; console.log('BŁĄD:', msg); } else console.log('ok:', msg); };
async function boot(round, tiles) {
  await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
  await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'networkidle0' }); await wait(400);
  await p.click('[data-act=new]'); await wait(200);
  await p.evaluate(() => document.querySelector('[data-act=setmode][data-v=quick]').click());
  await p.click('[data-act=start]'); await wait(500); await p.evaluate(() => { const i = document.querySelector('[data-act=introgo]'); i && i.click(); }); await wait(500);
  await p.evaluate((round, tiles) => { const k = Object.keys(localStorage).find(x => x.endsWith(':run')); const run = JSON.parse(localStorage.getItem(k)); run.round = round; run.phase = 'fight'; run.fight = null; run.tiles = tiles; run.skills = []; run.hp = 60; run.pending = null; localStorage.setItem(k, JSON.stringify(run)); }, round, tiles);
  await p.reload({ waitUntil: 'networkidle0' }); await wait(500);
  await p.evaluate(() => { const c = document.querySelector('[data-act=resume]'); c && c.click(); }); await wait(700);
}
const strong = [...Array(30).fill('ziarno-mocy'), ...Array(30).fill('twardy-grzebien')];
for (const [round, id, name] of [[3, 'gruszka', 'Gruszka'], [6, 'pipsztal', 'Pipsztal']]) {
  await boot(round, strong);
  await p.click('[data-act=tofight]');
  await p.waitForSelector('.stage-title', { timeout: 90000 }).catch(() => {});
  await p.waitForFunction(() => /Dodatkowa runda/.test(document.querySelector('.stage-title')?.textContent || ''), { timeout: 90000 }).catch(() => {});
  const t = await p.evaluate(() => document.querySelector('.stage-title')?.textContent || '');
  ok(t.includes('Dodatkowa runda') && t.includes(name), `${name}: po wygranej pojawia się oferta dodatkowej rundy (${t})`);
  await p.screenshot({ path: OUT + `${id}-1-oferta.png` });
  await p.click('[data-act=choose][data-i="0"]'); await wait(500);
  const prep = await p.evaluate(() => ({ rest: document.querySelector('[data-act=rest]')?.disabled, txt: document.querySelector('.preview')?.textContent || '' }));
  ok(prep.rest === true && prep.txt.includes(name), `${name}: ekran przed walką, odpoczynek wyłączony`);
  await p.screenshot({ path: OUT + `${id}-2-przed.png` });
  await p.click('[data-act=tofight]'); await wait(id === 'gruszka' ? 3600 : 2800);
  await p.screenshot({ path: OUT + `${id}-3-walka.png` });
  if (id === 'gruszka') ok(await p.evaluate(() => !!document.querySelector('.saybub')), 'Gruszka: dymek z docinkiem');
  await p.waitForFunction(() => /legend|Łup|łup|Nagroda/i.test(document.querySelector('.stage-title')?.textContent || ''), { timeout: 120000 }).catch(() => {});
  const t2 = await p.evaluate(() => document.querySelector('.stage-title')?.textContent || '');
  ok(/łup|Łup|legend/i.test(t2), `${name}: po wygranej wybór łupu (${t2})`);
  await p.screenshot({ path: OUT + `${id}-4-lup.png` });
}
// odwrót
await boot(3, strong);
await p.click('[data-act=tofight]');
await p.waitForFunction(() => /Dodatkowa runda/.test(document.querySelector('.stage-title')?.textContent || ''), { timeout: 90000 }).catch(() => {});
await p.click('[data-act=choose][data-i="1"]'); await wait(600);
const r = await p.evaluate(() => { const g = window.__bulgot; return g && g.run ? { round: g.run.round, phase: g.run.phase } : null; });
ok(r && r.round === 4, 'odwrót: następne piętro (' + JSON.stringify(r) + ')');
console.log('błędy strony:', errs.length ? errs : 'brak'); if (errs.length) fails++;
await b.close(); process.exit(fails ? 1 : 0);
