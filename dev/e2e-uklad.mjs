// Bulgot: test układu (bug B-Dop.png). Na typowych rozdzielczościach górny pasek mieści się w jednej linii,
// strona się nie przewija, a panel boczny przewija się sam. Zrzuty: <katalog>/uklad-<szer>x<wys>-<ekran>.png
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-uklad.mjs [katalog]
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = process.argv[2] || '.';
const SIZES = [[1366, 768], [1440, 900], [1920, 1080], [1920, 930], [1280, 720]];
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
// gruby panel boczny: dużo kafelków i Odznak, żeby sprawdzić przewijanie
await p.evaluate(() => { const r = window.__bulgot.run; r.garnek = 1; });

// Walka na pełnym ekranie (#fightlayer): jeden rząd górnego paska, kafelki umiejętności w oknie, bez przewijania strony.
const measureFight = () => p.evaluate(() => {
  const kids = [...document.querySelectorAll('.fhud .hchip, .fhud .timer, .fhud .ctl')].filter(c => c.offsetParent);
  const tops = kids.map(c => Math.round(c.getBoundingClientRect().top + c.getBoundingClientRect().height / 2));
  const bar = document.querySelector('#skillbar').getBoundingClientRect(), se = document.scrollingElement;
  return { oneLine: Math.max(...tops) - Math.min(...tops) < 14, pageScroll: se.scrollHeight - innerHeight, menuVisible: !!document.querySelector('#fightlayer [data-act=menu]'), sideScrollable: null, sideBottom: Math.round(bar.bottom), vh: innerHeight, skillsInside: bar.left >= 0 && bar.right <= innerWidth && bar.bottom <= innerHeight };
});
const measure = () => p.evaluate(() => {
  const tb = document.querySelector('.topbar'), menu = document.querySelector('[data-act=menu]'), side = document.querySelector('.side');
  const kids = [...tb.children].filter(c => c.offsetParent);
  const tops = kids.map(c => Math.round(c.getBoundingClientRect().top + c.getBoundingClientRect().height / 2));
  const oneLine = Math.max(...tops) - Math.min(...tops) < 12;
  const se = document.scrollingElement;
  return { oneLine, pageScroll: se.scrollHeight - innerHeight, menuVisible: !!menu && menu.getBoundingClientRect().right <= innerWidth,
    sideScrollable: side ? side.scrollHeight > side.clientHeight + 2 && getComputedStyle(side).overflowY === 'auto' : null,
    sideBottom: side ? Math.round(side.getBoundingClientRect().bottom) : null, vh: innerHeight };
});

for (const [w, h] of SIZES) {
  await p.setViewport({ width: w, height: h }); await wait(250);
  const m = await measure();
  console.log(`${w}x${h} oferta:`, JSON.stringify(m));
  if (!m.oneLine) fail(`${w}x${h}: górny pasek w więcej niż jednej linii`);
  if (m.pageScroll > 1) fail(`${w}x${h}: strona przewija się o ${m.pageScroll}px`);
  if (!m.menuVisible) fail(`${w}x${h}: przycisk Menu poza oknem`);
  await p.screenshot({ path: `${OUT}/uklad-${w}x${h}-oferta.png` });
}
// walka
await p.setViewport({ width: 1440, height: 900 });
await p.keyboard.press('1'); await wait(400);
await p.evaluate(() => { const c = document.querySelector('.modal [data-act=close]'); c && c.click(); document.querySelector('#invoice').innerHTML = ''; });
const tof = await p.$('[data-act=tofight]');
if (tof) {
  for (const [w, h] of SIZES) {
    await p.setViewport({ width: w, height: h }); await wait(250);
    const m = await measure();
    console.log(`${w}x${h} przed walką:`, JSON.stringify(m));
    if (!m.oneLine) fail(`${w}x${h}: pasek (przed walką) w więcej niż jednej linii`);
    if (m.pageScroll > 1) fail(`${w}x${h}: strona (przed walką) przewija się o ${m.pageScroll}px`);
    await p.screenshot({ path: `${OUT}/uklad-${w}x${h}-przed.png` });
  }
  await p.setViewport({ width: 1440, height: 900 });
  // tempo walki jest stałe (×1): brak wyboru tempa i przycisku w walce
  const sp = await p.evaluate(() => ({ pick: !!document.querySelector('[data-act=setspeed], .speedpick'), icons: document.querySelectorAll('.slr .stico').length }));
  if (sp.pick) fail('wybór tempa wciąż jest na ekranie'); else console.log('OK: brak wyboru tempa');
  if (sp.icons < 8) fail('brak ikonek statystyk: ' + sp.icons); else console.log('OK: ikonki statystyk', sp.icons);
  await p.screenshot({ path: `${OUT}/przed-walka.png` });
  await p.click('[data-act=tofight]'); await wait(1200);
  if (await p.evaluate(() => !!document.querySelector('#speedbtn'))) fail('w walce wciąż jest przycisk tempa'); else console.log('OK: w walce nie ma przycisku tempa');
  await p.keyboard.press('f'); await wait(100);
  // Esc w trakcie walki otwiera Menu (przycisk Menu w pasku walki), a zamknięcie wznawia walkę
  await p.keyboard.press('Escape'); await wait(250);
  if (!(await p.$('.modal'))) fail('Esc w walce nie otworzył Menu'); else console.log('OK: Esc otwiera Menu w walce');
  await p.keyboard.press('Escape'); await wait(250);
  for (const [w, h] of SIZES) {
    await p.setViewport({ width: w, height: h }); await wait(250);
    const m = await measureFight();
    if (!m.skillsInside) fail(`${w}x${h}: kafelki umiejętności wychodzą poza okno`);
    console.log(`${w}x${h} walka:`, JSON.stringify(m));
    if (!m.oneLine) fail(`${w}x${h}: pasek (walka) w więcej niż jednej linii`);
    if (m.pageScroll > 1) fail(`${w}x${h}: strona (walka) przewija się o ${m.pageScroll}px`);
    await p.screenshot({ path: `${OUT}/uklad-${w}x${h}-walka.png` });
  }
}
if (errs.length) { fail('błędy na stronie'); console.error(errs.join('\n')); }
await b.close();
console.log(process.exitCode ? 'NIEZALICZONY' : 'OK: układ');
