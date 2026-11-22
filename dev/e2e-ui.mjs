// Bulgot: test e2e w Edge (puppeteer-core z folderu tools/pt). Wymaga serwera plików na porcie 8090 (patrz CLAUDE.md). Uruchom z folderu tools/pt: node <ścieżka do tego pliku> [katalog na zrzuty]
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const out = process.argv[2];
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-first-run'] });
const wait = ms => new Promise(r => setTimeout(r, ms));
const errs = [], fails = [];
const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails.push(m); };

async function open(w, h, mode, rp) {
  const p = await b.newPage();
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.setViewport({ width: w, height: h });
  await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bulgot:intro', '1'); });
  await p.reload({ waitUntil: 'networkidle0' }); await wait(300);
  await p.click('[data-act=new]'); await wait(200);
  await p.evaluate(m => document.querySelector(`[data-act=setmode][data-v=${m}]`).click(), mode);
  await p.click('[data-act=start]'); await wait(500);
  if (rp) {
    await p.evaluate(rp => { const k = 'bulgot:local:player:run'; const r = JSON.parse(localStorage.getItem(k)); Object.assign(r, rp); localStorage.setItem(k, JSON.stringify(r)); }, rp);
    await p.reload({ waitUntil: 'networkidle0' }); await wait(300); await p.click('[data-act=resume]'); await wait(400);
  }
  return p;
}
const R = p => p.evaluate(() => { const r = window.__bulgot.run; return r && { phase: r.phase, round: r.round, coins: r.coins, tiles: r.tiles, offer: r.offer }; });

// 1. oferta w trzech rozmiarach okna
for (const [w, h] of [[1440, 900], [1920, 1080], [2560, 1440]]) {
  const p = await open(w, h, 'quick', { coins: 40, round: 4, tiles: ['ziarno-mocy', 'twardy-grzebien'], offer: ['czujne-oko', 'jajeczny-granat', 'hazard-w-kurniku', 'opaska-rambo'] });
  const sc = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--s'));
  const tb = await p.evaluate(() => { const r = document.querySelector('.topbar').getBoundingClientRect(); const t = document.querySelector('.tower').getBoundingClientRect(); return { topH: Math.round(r.height), towerH: Math.round(t.height), towerBottom: Math.round(t.bottom), win: innerHeight }; });
  console.log(`${w}x${h}: skala ${sc.trim()}, pasek górny ${tb.topH}px, pasek pięter ${tb.towerH}px (dół ${tb.towerBottom} z ${tb.win})`);
  ok(tb.towerBottom >= tb.win * 0.88, `pasek pięter dochodzi prawie do dołu okna (${w}x${h})`);
  await p.screenshot({ path: `${out}/u-oferta-${w}.png` });
  await p.close();
}

// 2. dokupowanie na kartach
const p = await open(1920, 1080, 'quick', { coins: 40, round: 3, tiles: [], offer: ['czujne-oko', 'jajeczny-granat', 'hazard-w-kurniku', 'opaska-rambo'] });
let s = await R(p);
ok(await p.evaluate(() => document.querySelectorAll('.slotcard').length === 4 && document.querySelectorAll('[data-act=buyoffer]').length === 3), 'trzy przyciski Dokup (Hazard to wydarzenie)');
await p.click('[data-act=buyoffer][data-i="1"]'); await wait(500);
s = await R(p);
ok(s.coins === 40 - 12 && s.tiles.length === 1 && s.offer[1] === null, 'dokupiono Granat za 12 (Ziarna ' + s.coins + ')');
ok(await p.evaluate(() => !!document.querySelector('.tile.gone')), 'kupiony slot pokazuje „Dokupione”');
await p.keyboard.down('Shift'); await p.keyboard.press('Digit1'); await p.keyboard.up('Shift'); await wait(500);
s = await R(p); ok(s.coins === 40 - 12 - 12 && s.offer[0] === null, 'Shift+1 dokupuje Czujne Oko (Ziarna ' + s.coins + ')');
await p.screenshot({ path: `${out}/u-po-zakupie.png` });
await p.keyboard.press('4'); await wait(500);
s = await R(p); ok(s.phase === 'fight' && s.tiles.length === 3, 'darmowy wybór Opaski (kafelki: ' + s.tiles.join(',') + ')');

// 3. historia: zagraj do końca i sprawdź zapis
await p.click('[data-act=tofight]'); await wait(800);
await p.evaluate(() => { const sp = document.querySelector('[data-act=speed]'); sp.click(); sp.click(); });
for (let i = 0; i < 100; i++) { await wait(400); if (await p.$('.inv, .modal')) break; }
await p.evaluate(() => { document.querySelector('#invoice').innerHTML = ''; }); await wait(300);
await p.click('[data-act=menu]'); await wait(200); await p.click('.modal [data-act=abandon]'); await wait(300); await p.click('[data-act=abandon-yes]'); await wait(700);
await p.click('[data-act=home]'); await wait(400);
await p.click('[data-act=history]'); await wait(700);
ok(await p.evaluate(() => /Historia gier/.test(document.querySelector('.modal h2').textContent) && document.querySelectorAll('.rank-list tbody tr').length === 1), 'historia pokazuje 1 run');
await p.screenshot({ path: `${out}/u-historia.png` });
const hist = await p.evaluate(() => window.__bulgot.hist);
ok(hist && hist.length === 1 && hist[0].log.length >= 1 && hist[0].log[0].bought.includes('jajeczny-granat'), 'w historii jest dziennik z dokupionymi kafelkami: ' + JSON.stringify(hist && hist[0] && hist[0].log[0].bought));
// wywołaj pobranie bez błędów
await p.click('[data-act=histcopy]'); await wait(300);
console.log(errs.length ? 'BŁĘDY STRONY:\n' + [...new Set(errs)].join('\n') : 'brak błędów w konsoli');
console.log(fails.length ? 'NIEPOWODZENIA: ' + fails.length : 'WSZYSTKO OK');
await b.close();
