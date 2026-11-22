// Bulgot: test poziomów statystyk: plakietki na kartach i w panelu, okno „Zlej kafelki” (Ulepszanie 3 → 1), łup z bossa (3 legendarne do wyboru),
// regeneracja w dziesiątych częściach, wpisy w Księdze.
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-poziomy.mjs [katalog na zrzuty]
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
await p.click('[data-act=new]'); await wait(200);
await p.evaluate(() => document.querySelector('[data-act=setmode][data-v=quick]').click());
await p.click('[data-act=setnext]'); await wait(150); await p.click('[data-act=start]'); await wait(500); await p.click('[data-act=introgo]'); await wait(500);
async function patchRun(src) {
  await p.evaluate(s => { const k = Object.keys(localStorage).find(x => x.endsWith(':run')); const run = JSON.parse(localStorage.getItem(k)); (new Function('run', s))(run); localStorage.setItem(k, JSON.stringify(run)); }, src);
  await p.reload({ waitUntil: 'networkidle0' }); await wait(500);
  await p.evaluate(() => { const c = document.querySelector('[data-act=resume]'); c && c.click(); }); await wait(500);
}
const click = async sel => { await p.evaluate(s => { const e = document.querySelector(s); if (e) e.click(); }, sel); await wait(450); };

// 1. plakietki poziomów na kartach oferty
await patchRun(`run.round = 3; run.phase = 'offer'; run.coins = 20; run.hp = 50; run.offer = ['ziarenko-z-podlogi', 'ziarno-selekcjonowane', 'ziarno-mocy', 'czujne-oko']; run.tiles = ['grzebien-z-tasmy', 'grzebien-z-tasmy', 'slieskie-nozki']; run.flawAt = -1;`);
const lv = await p.evaluate(() => [...document.querySelectorAll('.cards .tile')].map(t => (t.querySelector('.lvl') || {}).textContent || ''));
if (lv.join() !== 'I,II,III,III') fail('plakietki poziomów w ofercie: ' + lv.join()); else ok('plakietki poziomów na kartach: ' + lv.join(' '));
const regen = await p.evaluate(() => [...document.querySelectorAll('.cards .tile .ttext')].map(t => t.textContent).join(' | '));
ok('opisy: ' + regen);
await p.screenshot({ path: `${OUT}/poziomy-oferta.png` });

// 2. przycisk Ulepszanie: wyłączony przy 2 kopiach, włączony przy 3
const dis0 = await p.evaluate(() => { const b = document.querySelector('[data-act=upgrademenu]'); return b ? b.disabled : null; });
if (dis0 !== true) fail('przycisk „Zlej kafelki” powinien być wyłączony (są 2 kopie): ' + dis0); else ok('przycisk Zlej kafelki wyłączony przy 2 kopiach');
await patchRun(`run.tiles = ['grzebien-z-tasmy', 'grzebien-z-tasmy', 'grzebien-z-tasmy', 'slieskie-nozki', 'slieskie-nozki', 'slieskie-nozki', 'slieskie-nozki'];`);
const dis1 = await p.evaluate(() => { const b = document.querySelector('[data-act=upgrademenu]'); return b ? b.disabled : null; });
if (dis1 !== false) fail('przycisk „Zlej kafelki” powinien być włączony: ' + dis1); else ok('przycisk Zlej kafelki włączony przy 3 kopiach');
await p.keyboard.press('u'); await wait(400);
const rows = await p.evaluate(() => [...document.querySelectorAll('.upg-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim()));
if (rows.length !== 2 || !/3× Grzebień z Taśmy.*Grzebień Hodowlany/.test(rows[0])) fail('okno zlewania: ' + JSON.stringify(rows)); else ok('okno zlewania (klawisz U): ' + rows.join(' // '));
const fit = await p.evaluate(() => { const m = document.querySelector('.modal'); const r = m.getBoundingClientRect(); return { ok: m.scrollHeight <= m.clientHeight + 2, h: Math.round(r.height), top: Math.round(r.top) }; });
if (!fit.ok) fail('okno zlewania wymaga przewijania: ' + JSON.stringify(fit)); else ok('okno zlewania mieści się: ' + JSON.stringify(fit));
await p.screenshot({ path: `${OUT}/poziomy-zlewanie.png` });
await click('.upg-row[data-v="grzebien-z-tasmy"]'); await wait(500);
const st = await p.evaluate(() => { const k = Object.keys(localStorage).find(x => x.endsWith(':run')); const r = JSON.parse(localStorage.getItem(k)); return r.tiles.join(); });
if (st !== 'slieskie-nozki,slieskie-nozki,slieskie-nozki,slieskie-nozki,grzebien-hodowlany') fail('stan po zlaniu: ' + st); else ok('po zlaniu: ' + st);
const toast = await p.evaluate(() => (document.querySelector('.toast') || {}).textContent || '');
if (!/Zlano 3× Grzebień z Taśmy w Grzebień Hodowlany/.test(toast)) fail('toast: ' + toast); else ok('toast: ' + toast);
const chip = await p.evaluate(() => [...document.querySelectorAll('.chips .chip')].map(c => (c.querySelector('.lvl') || {}).textContent + (c.querySelector('sup') ? c.querySelector('sup').textContent : '')).join(' '));
ok('chipy w panelu (poziom, liczba): ' + chip);
await p.screenshot({ path: `${OUT}/poziomy-po-zlaniu.png` });
// zlewanie nie psuje walki: ruszamy do walki i kończymy
await p.mouse.move(5, 5);

// 3. łup z bossa: boss w rundzie 5 (tryb szybki)
await patchRun(`run.round = 5; run.phase = 'fight'; run.fight = {}; run.hp = 9999; run.tiles = Array(8).fill('twardy-grzebien').concat(['ziarno-mocy','ziarno-mocy','ziarno-mocy']); run.skills = []; run.flawed = []; run.offer = [];`);
const waitFor = async (sel, n = 200) => { for (let i = 0; i < n; i++) { if (await p.$(sel)) return true; await wait(150); } return false; };
const R = () => p.evaluate(() => window.__bulgot.run);
await p.click('[data-act=tofight]'); await wait(700); await p.evaluate(() => { const F = window.__bulgot.fight; if (F) F.speed = 3; });
if (!(await waitFor('#invoice .inv, .modal'))) fail('brak wyniku walki z bossem'); 
await wait(1500); await p.evaluate(() => { const c = document.querySelector('.modal [data-act=close]'); c && c.click(); document.querySelector('#invoice').innerHTML = ''; }); await wait(400);
let ph = (await R()).phase;
if (ph !== 'badge') fail('po bossie najpierw Odznaka, jest ' + ph); else ok('po bossie: Odznaka');
await p.keyboard.press('1'); await wait(700);
ph = (await R()).phase;
if (ph !== 'loot') fail('po Odznace łup z bossa, jest ' + ph); else ok('faza łupu z bossa');
const loot = await p.evaluate(() => [...document.querySelectorAll('.cards .tile')].map(t => ({ n: t.querySelector('.tname').textContent, l: (t.querySelector('.lvl') || {}).textContent, cls: t.className.includes('r3'), glow: (t.querySelector('.lvl') || {}).className })));
if (loot.length !== 3 || !loot.every(x => x.l === '★' && x.cls)) fail('karty łupu: ' + JSON.stringify(loot)); else ok('3 legendarne karty łupu: ' + loot.map(x => x.n).join(', '));
await p.screenshot({ path: OUT + '/poziomy-lup.png' });
await p.keyboard.press('2'); await wait(700);
const after = await R(); ph = after.phase;
if (ph !== 'bonus') fail('po łupie bonus, jest ' + ph); else ok('po wyborze łupu: faza bonusowa; łup w kafelkach: ' + after.tiles.filter(id => /rosolowego|pierwszego|prezesa|maszynowy|wyroczni|cyklopa|cien-skrzydla|wieczny|piecio/.test(id)).join());
const chipsL = await p.evaluate(() => [...document.querySelectorAll('.chips .chip .lvl.l4')].length);
if (chipsL !== 1) fail('plakietka ★ w panelu: ' + chipsL); else ok('plakietka ★ w panelu kafelków');
await p.screenshot({ path: OUT + '/poziomy-po-lupie.png' });
await p.keyboard.press('1'); await wait(600);
// Księga: legendarne zablokowane lub poznane
await p.evaluate(() => document.querySelector('[data-act=bookopen], [data-act=book]') && document.querySelector('[data-act=bookopen], [data-act=book]').click()); await wait(500);
const book = await p.evaluate(() => ({ cards: document.querySelectorAll('.book-grid .tile').length, lvls: document.querySelectorAll('.book-grid .tile .lvl').length, locked: document.querySelectorAll('.book-grid .tile.locked').length, boss: [...document.querySelectorAll('.book-grid .lockbox')].filter(e => /Łup z bossa/.test(e.textContent)).length }));
if (book.lvls !== 36 || book.boss !== 8) fail('Księga: ' + JSON.stringify(book)); else ok('Księga: ' + JSON.stringify(book));
await p.screenshot({ path: OUT + '/poziomy-ksiega.png' });
await b.close();
if (errs.length) { for (const e of errs) fail(e); }
