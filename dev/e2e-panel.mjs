// Bulgot: test panelu bocznego i Lombardu: kółka umiejętności (przeciąganie i strzałki ←/→), odznaki w karcie bohatera (bez osobnego panelu),
// statystyki w jednej kolumnie z wyrównanymi jednostkami, okno Lombardu bez przewijania przy wielu kafelkach.
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
await p.click('[data-act=start]'); await wait(500); await p.click('[data-act=introgo]'); await wait(500);
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

// 2. statystyki w jednej kolumnie: nazwy po zmianie, jednostki w jednej linii, procenty dla szybkości ataku i Mocy Dziobnięcia
const st = await p.evaluate(() => {
  const rows = [...document.querySelectorAll('.slr')];
  const xs = rows.map(r => Math.round(r.querySelector('.slv b').getBoundingClientRect().right)), ux = rows.map(r => Math.round(r.querySelector('.slv i').getBoundingClientRect().left));
  return { names: rows.map(r => r.querySelector('.sln').textContent.trim()), vals: rows.map(r => r.querySelector('.slv').textContent.replace(/\s+/g, '')), aligned: new Set(xs).size === 1 && new Set(ux).size === 1, oneLine: rows.every(r => r.getBoundingClientRect().height <= 26), groups: document.querySelectorAll('.slg').length };
});
if (!st.names.includes('Dziobnięcie') || !st.names.includes('Moc Dziobnięcia') || st.names.some(n => /Fortun|Krytyk/i.test(n))) fail('nazwy statystyk: ' + st.names.join(', ')); else ok('nazwy statystyk: ' + st.names.join(', '));
if (!st.aligned || !st.oneLine) fail('liczby i jednostki nie stoją w jednej linii: ' + JSON.stringify(st)); else ok('liczby i jednostki wyrównane, każdy wiersz w jednej linii');
const asp = st.vals[st.names.indexOf('Szybkość ataku')], mult = st.vals[st.names.indexOf('Moc Dziobnięcia')];
if (!/^\d+%$/.test(asp) || !/^\d+%$/.test(mult)) fail('szybkość ataku i Moc Dziobnięcia powinny być w %: ' + asp + ', ' + mult); else ok(`szybkość ${asp}, Moc Dziobnięcia ${mult}`);
if (!/\/s$/.test(st.vals[st.names.indexOf('Regeneracja')])) fail('regeneracja bez „/ s”'); else ok('regeneracja zostaje w Życiu na sekundę');
await p.screenshot({ path: `${OUT}/panel-statystyki.png` });

// 3. zamiana kolejności umiejętności: strzałki ←/→ na aktywnym kółku i przeciąganie
const order = () => p.evaluate(() => [...document.querySelectorAll('.sring[data-slot] em')].map(e => e.textContent.trim()));
const o0 = await order();
if (await p.$('[data-act=skillmove]')) fail('strzałki ▲▼ nie powinny już istnieć');
await p.focus('.sring[data-slot="0"]'); await p.keyboard.press('ArrowRight'); await wait(500);
const o1 = await order();
if (!(o1[0] === o0[1] && o1[1] === o0[0] && o1[2] === o0[2])) fail('strzałka → nie zamieniła kółek: ' + JSON.stringify([o0, o1])); else ok('strzałką zamieniono kółka: ' + o0.join(', ') + ' → ' + o1.join(', '));
const foc = await p.evaluate(() => document.activeElement && document.activeElement.dataset && document.activeElement.dataset.slot);
if (foc !== '1') fail('po zamianie fokus powinien zostać na przesuniętym kółku, jest: ' + foc); else ok('fokus idzie za przesuniętym kółkiem');
await p.focus('.sring[data-slot="0"]'); await p.keyboard.press('ArrowLeft'); await wait(300);
if (JSON.stringify(await order()) !== JSON.stringify(o1)) fail('← na pierwszym kółku nie powinno nic zmieniać'); else ok('← na pierwszym kółku nic nie zmienia');
// przeciągnięcie kółka 2 na kółko 0 (zdarzenia drag and drop wywołane programowo)
const o1b = o1;
await p.evaluate(() => { const dt = new DataTransfer(), a = document.querySelector('.sring[data-slot="2"]'), t = document.querySelector('.sring[data-slot="0"]'); a.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt })); t.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt })); t.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt })); });
await wait(500);
const o2 = await order();
if (!(o2[0] === o1b[2] && o2[2] === o1b[0])) fail('przeciągnięcie nie zamieniło kółek: ' + JSON.stringify([o1b, o2])); else ok('przeciągnięciem zamieniono kółka: ' + o2.join(', '));
// kolejność jest na serwerze: po przeładowaniu ta sama
await p.reload({ waitUntil: 'networkidle0' }); await wait(500); await p.evaluate(() => { const c = document.querySelector('[data-act=resume]'); c && c.click(); }); await wait(500);
const o3 = await order();
if (JSON.stringify(o3) !== JSON.stringify(o2)) fail('kolejność nie przetrwała przeładowania: ' + JSON.stringify([o2, o3])); else ok('kolejność zapisana na serwerze');
// kółka nie nachodzą na siebie ani na ikony zestawów
const ov = await p.evaluate(() => { const r = [...document.querySelectorAll('.sring')].map(e => e.getBoundingClientRect()), s = [...document.querySelectorAll('.six')].map(e => e.getBoundingClientRect()); const hit = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom; let bad = 0; for (let i = 0; i < r.length; i++) { for (let j = i + 1; j < r.length; j++) if (hit(r[i], r[j])) bad++; for (const q of s) if (hit(r[i], q)) bad++; } return bad; });
if (ov) fail('kółka umiejętności na coś nachodzą: ' + ov); else ok('kółka umiejętności nie nachodzą na siebie ani na ikony zestawów');

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
