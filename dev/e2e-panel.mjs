// Bulgot: test panelu bocznego i Lombardu: zamiana kolejności umiejętności (strzałki), odznaki w karcie bohatera (bez osobnego panelu),
// krótka etykieta krytyka w jednej linii, okno Lombardu bez przewijania przy wielu kafelkach.
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-panel.mjs [katalog na zrzuty]
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
const TILES = ['ziarno-mocy', 'czujne-oko', 'ostry-dziob', 'twardy-grzebien', 'pancerz-z-pierza', 'szybki-dziob', 'opaska-rambo', 'okulary-aviatory', 'lubczyk', 'kostka-rosolowa', 'zamrazarka', 'chochla', 'teczka', 'krawat', 'polisa', 'kolczatka', 'trofeum-z-pior', 'kamizelka-kuloodporna', 'tykajace-jajo', 'garnek-cisnieniowy'];
await patchRun(`run.round = 6; run.phase = 'offer'; run.hp = 60; run.coins = 40; run.skills = [{ id: 'grad', lvl: 1 }, { id: 'pianie', lvl: 1 }, { id: 'lodowy', lvl: 1 }]; run.tiles = ${JSON.stringify(TILES)}.concat(['kukurydziany-grad', 'pianie-grozy', 'lodowy-dziob']);`);
// odznaki: weź prawdziwe id z danych gry
const bd = await p.evaluate(async () => { const D = await import('./shared/data.js'); return Object.keys(D.BADGES).slice(0, 5); });
await patchRun(`run.badges = ${JSON.stringify(bd)};`);

// 1. odznaki w karcie bohatera, bez osobnego panelu
const side = await p.evaluate(() => ({ panels: [...document.querySelectorAll('.side h4')].map(h => h.textContent.trim()), inHero: document.querySelectorAll('.hero-card .bdgs .chip.badge').length, bdgRight: (() => { const c = document.querySelector('.hero-card .bdgs'), h = document.querySelector('.hero-card'); return c && h ? c.getBoundingClientRect().right <= h.getBoundingClientRect().right + 1 : false; })() }));
if (side.panels.some(t => /Odznaki/i.test(t))) fail('osobny panel Odznaki nadal jest: ' + side.panels.join(', ')); else ok('brak osobnego panelu Odznaki: ' + side.panels.join(' | '));
if (side.inHero !== bd.length || !side.bdgRight) fail('odznaki w karcie bohatera: ' + JSON.stringify(side)); else ok(`odznaki (${side.inHero}) w karcie bohatera, mieszczą się`);
await p.hover('.hero-card .bdgs .chip.badge'); await wait(200);
if (!(await p.evaluate(() => { const t = document.querySelector('#tip'); return t && !t.hidden && t.textContent.length > 10; }))) fail('brak podpowiedzi po najechaniu na odznakę'); else ok('podpowiedź odznaki działa');
await p.mouse.move(5, 5);
await p.screenshot({ path: `${OUT}/panel-odznaki.png` });

// 2. etykieta krytyka w jednej linii
const crit = await p.evaluate(() => { const dt = [...document.querySelectorAll('.stats dt')].find(d => /Fortun/i.test(d.textContent)); const r = dt.getBoundingClientRect(); const s = dt.querySelector('span'); const lh = parseFloat(getComputedStyle(s).lineHeight) || 20; return { text: dt.textContent.trim(), h: Math.round(r.height), lines: Math.round(s.getBoundingClientRect().height / lh) }; });
if (crit.lines > 1) fail('etykieta krytyka w więcej niż jednej linii: ' + JSON.stringify(crit)); else ok('krytyk w jednej linii: ' + crit.text);

// 3. zamiana kolejności umiejętności
const order = () => p.evaluate(() => [...document.querySelectorAll('.slot .sn')].map(e => e.textContent.replace(/^\d\.\s*/, '').replace(/POZ\. 2|Mutacja.*/, '').trim()));
const o0 = await order();
await p.click('.slot[data-slot="0"] [data-act=skillmove][data-d="1"]'); await wait(500);
const o1 = await order();
if (!(o1[0] === o0[1] && o1[1] === o0[0] && o1[2] === o0[2])) fail('strzałka ▼ nie zamieniła slotów: ' + JSON.stringify([o0, o1])); else ok('strzałką zamieniono sloty: ' + o0.join(', ') + ' → ' + o1.join(', '));
const first = await p.evaluate(() => !!document.querySelector('.slot[data-slot="0"] [data-act=skillmove][data-d="-1"]:disabled'));
if (!first) fail('pierwszy slot powinien mieć wyłączoną strzałkę ▲');
// przeciągnięcie slotu 2 na slot 0 (zdarzenia drag and drop wywołane programowo)
await p.evaluate(() => { const dt = new DataTransfer(), a = document.querySelector('.slot[data-slot="2"]'), t = document.querySelector('.slot[data-slot="0"]'); a.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt })); t.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt })); t.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt })); });
await wait(500);
const o2 = await order();
if (!(o2[0] === o1[2] && o2[2] === o1[0])) fail('przeciągnięcie nie zamieniło slotów: ' + JSON.stringify([o1, o2])); else ok('przeciągnięciem zamieniono sloty: ' + o2.join(', '));
// kolejność jest na serwerze: po przeładowaniu ta sama
await p.reload({ waitUntil: 'networkidle0' }); await wait(500); await p.evaluate(() => { const c = document.querySelector('[data-act=resume]'); c && c.click(); }); await wait(500);
const o3 = await order();
if (JSON.stringify(o3) !== JSON.stringify(o2)) fail('kolejność nie przetrwała przeładowania: ' + JSON.stringify([o2, o3])); else ok('kolejność zapisana na serwerze');

// 4. Lombard bez przewijania (wiele kafelków)
for (const [w, h] of [[1920, 925], [1366, 650]]) {
  await p.setViewport({ width: w, height: h }); await wait(400);
  await p.click('[data-act=pawnmenu]'); await wait(500);
  const m = await p.evaluate(() => { const md = document.querySelector('.modal.pawnmodal'); const r = md.getBoundingClientRect(); return { sh: md.scrollHeight, ch: md.clientHeight, top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight, cards: document.querySelectorAll('.pawn-card').length, coinWrap: [...document.querySelectorAll('.pawn-card .pb')].some(e => e.getBoundingClientRect().height > 22) }; });
  console.log(`${w}x${h} Lombard:`, JSON.stringify(m));
  if (m.sh > m.ch + 1) fail(`${w}x${h}: okno Lombardu wymaga przewijania (${m.sh} > ${m.ch}), kafelków ${m.cards}`);
  if (m.top < 0 || m.bottom > m.vh + 1) fail(`${w}x${h}: okno Lombardu poza ekranem`);
  if (m.coinWrap) fail(`${w}x${h}: ikona Ziarna zawija się do nowej linii`);
  await p.screenshot({ path: `${OUT}/panel-lombard-${w}x${h}.png` });
  // podpowiedź na kafelku w Lombardzie jest ponad oknem
  await p.hover('.pawn-card'); await wait(250);
  if (!(await p.evaluate(() => { const t = document.querySelector('#tip'); return t && !t.hidden; }))) fail('brak podpowiedzi kafelka w Lombardzie'); else if (w === 1920) ok('podpowiedź kafelka w Lombardzie');
  await p.mouse.move(5, 5);
  await p.click('.modal-x'); await wait(300);
}
await p.setViewport({ width: 1920, height: 925 });
if (errs.length) { fail('błędy na stronie'); console.error(errs.join('\n')); }
await b.close();
console.log(process.exitCode ? 'NIEZALICZONY' : 'OK: panel');
