// Bulgot: test e2e rozbudowy (efekty statusowe, Mutacje, nowe kafelki) w prawdziwej przeglądarce (Edge + puppeteer-core).
// Run jest przygotowany przez UI, a potem jego stan w localStorage (tryb lokalny) jest podmieniany na konkretny układ kafelków.
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-rozbudowa.mjs [katalog na zrzuty]
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = process.argv[2] || '.';
const wait = ms => new Promise(r => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-first-run'] });
const p = await b.newPage();
const errs = [];
p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
await p.setViewport({ width: 1440, height: 900 });
await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'networkidle0' }); await wait(400);
const fail = msg => { console.error('BŁĄD:', msg); process.exitCode = 1; };
const ok = msg => console.log('OK:', msg);
const st = () => p.evaluate(() => { const G = window.__bulgot; return { screen: G.screen, phase: G.run && G.run.phase, round: G.run && G.run.round, skills: G.run && G.run.skills }; });

await p.click('[data-act=new]'); await wait(200);
await p.evaluate(() => document.querySelector('[data-act=setmode][data-v=quick]').click());
await p.click('[data-act=start]'); await wait(500);
await p.click('[data-act=introgo]'); await wait(300);

// Podmienia stan runu w localStorage i przeładowuje stronę.
async function patchRun(fnSrc) {
  await p.evaluate(src => {
    const k = Object.keys(localStorage).find(x => x.endsWith(':run'));
    const run = JSON.parse(localStorage.getItem(k));
    (new Function('run', src))(run);
    localStorage.setItem(k, JSON.stringify(run));
  }, fnSrc);
  await p.reload({ waitUntil: 'networkidle0' }); await wait(500);
  await p.evaluate(() => { const c = document.querySelector('[data-act=resume]') || document.querySelector('[data-act=continue]'); c && c.click(); }); await wait(400);
}

// 1. Mutacja: grad na poziomie 2, w ofercie trzecia kopia.
await patchRun(`run.skills = [{ id: 'grad', lvl: 2 }, { id: 'chlust', lvl: 1 }, { id: 'lodowy', lvl: 1 }]; run.tiles = ['kukurydziany-grad', 'rosolowy-chlust', 'lodowy-dziob']; run.offer = ['kukurydziany-grad', 'zgnile-jajo', 'darcie-pierza', 'ziarno-mocy']; run.phase = 'offer'; run.round = 7; run.tiles.push('twardy-grzebien', 'twardy-grzebien', 'twardy-grzebien', 'pancerz-z-pierza', 'pancerz-z-pierza', 'pancerz-z-pierza', 'twardy-grzebien', 'twardy-grzebien'); run.hp = 400;`);
if ((await st()).screen !== 'run') fail('po przeładowaniu powinien być ekran runu: ' + JSON.stringify(await st()));
const mutTag = await p.$$eval('.tag.mut', n => n.length);
mutTag ? ok('karta pokazuje znacznik Mutacji') : fail('brak znacznika Mutacji');
await p.screenshot({ path: OUT + '/rozb-oferta.png' });
await p.keyboard.press('1'); await wait(400);
const mutOpts = await p.$$eval('[data-act=mutchoose]', n => n.length);
mutOpts === 2 ? ok('okno Mutacji ma 2 gałęzie') : fail('okno Mutacji: ' + mutOpts);
await p.screenshot({ path: OUT + '/rozb-mutacja.png' });
await p.click('[data-act=mutchoose][data-v="1"]'); await wait(500);
const s1 = await st();
(s1.skills[0].lvl === 3 && s1.skills[0].mut === 1 && s1.phase === 'fight') ? ok('Mutacja zapisana: ' + JSON.stringify(s1.skills[0])) : fail('Mutacja nie zapisana: ' + JSON.stringify(s1));

// 2. Walka z efektami: używamy wszystkich umiejętności, sprawdzamy ikonki efektów nad wrogami.
await p.click('[data-act=tofight]'); await wait(900);
let seen = new Set();
for (let i = 0; i < 40; i++) {
  await p.keyboard.press('1'); await p.keyboard.press('2'); await p.keyboard.press('3');
  await wait(150);
  const k = await p.$$eval('.unit .sts .st', n => n.map(x => x.className));
  k.forEach(c => seen.add(c));
  if (i === 4) await p.screenshot({ path: OUT + '/rozb-walka.png' });
  if (await p.$('.modal')) break;
}
seen.size ? ok('ikonki efektów w walce: ' + [...seen].join(', ')) : fail('nie widać ikonek efektów');
for (let i = 0; i < 120 && !(await p.$('.modal')); i++) await wait(300);
(await p.$('.modal')) ? ok('walka się skończyła') : fail('walka nie skończyła się');

// 3. Zestaw Rosołowy x4 + Garnek: walka zaczyna się od Oparzenia, wybuchy nie psują interfejsu.
await p.evaluate(() => { const c = document.querySelector('.modal [data-act=close]'); c && c.click(); }); await wait(300);
console.log('faza przed zestawami:', (await st()).phase);
if ((await st()).phase !== 'over') {
  await patchRun("run.tiles = ['chochla', 'kostka-rosolowa', 'lubczyk', 'garnek-cisnieniowy', 'teczka', 'krawat', 'polisa', 'kolczatka', 'twardy-grzebien', 'twardy-grzebien', 'twardy-grzebien', 'ziarno-mocy', 'ziarno-mocy', 'ziarno-mocy', 'pancerz-z-pierza', 'pancerz-z-pierza']; run.round = 6; run.phase = 'fight'; run.fight = null; run.hp = 400;");
  await p.screenshot({ path: OUT + '/rozb-zestawy.png' });
  await p.click('[data-act=tofight]'); await wait(1500);
  const burn0 = await p.$$eval('.unit .sts .st.burn', n => n.length);
  burn0 ? ok('Rosołowe x4: wrogowie płoną od startu') : fail('brak Oparzenia na starcie');
  await p.screenshot({ path: OUT + '/rozb-walka2.png' });
  for (let i = 0; i < 150 && !(await p.$('.modal')); i++) await wait(300);
}
// 3b. Wylęgarnia: składnik w ofercie ma znacznik, wybór wykluwa przedmiot i pokazuje okno.
await p.evaluate(() => { const c = document.querySelector('.modal [data-act=close]'); c && c.click(); }); await wait(300);
if ((await st()).phase !== 'over') {
  await patchRun("run.tiles = ['tykajace-jajo', 'ziarno-mocy', 'ziarno-mocy']; run.offer = ['kostka-rosolowa', 'ziarno-mocy', 'twardy-grzebien', 'szybki-dziob']; run.phase = 'offer'; run.hp = 100;");
  const hz = await p.$$eval('.tag.hatch', n => n.map(x => x.textContent));
  hz.length >= 2 ? ok('znaczniki Wylęgarni/progu: ' + hz.join(', ')) : fail('brak znaczników: ' + hz.join(','));
  await p.keyboard.press('1'); await wait(700);
  const hm = await p.$$eval('.modal .hatch-row', n => n.length);
  hm ? ok('okno Wylęgarni po wykluciu') : fail('brak okna Wylęgarni');
  await p.screenshot({ path: OUT + '/rozb-wylegarnia.png' });
}
// 3c. Odznaka po bossie, Kontrakt z HR, Kapliczka, podgląd elity.
await p.evaluate(() => { const c = document.querySelector('.modal [data-act=close]'); c && c.click(); }); await wait(300);
if ((await st()).phase !== 'over') {
  await patchRun("run.phase = 'badge'; run.offer = []; run.pending = { kind: 'badge', offer: ['awans', 'parasol-ochronny', 'klucz-do-serwerowni'], bonus: false }; run.hp = 100;");
  const bc = await p.$$eval('[data-act=choose]', n => n.length);
  bc === 3 ? ok('ekran Odznaki: 3 karty') : fail('ekran Odznaki: ' + bc);
  await p.screenshot({ path: OUT + '/rozb-odznaka.png' });
  await p.keyboard.press('2'); await wait(600);
  const sb = await p.evaluate(() => window.__bulgot.run.badges);
  (sb && sb[0] === 'parasol-ochronny') ? ok('Odznaka wybrana klawiszem 2') : fail('Odznaka: ' + JSON.stringify(sb));
  const chip = await p.$$eval('.chip.badge', n => n.length); chip ? ok('Odznaka w panelu bocznym') : fail('brak Odznaki w panelu');
  await patchRun("run.phase = 'event'; run.offer = []; run.pending = { kind: 'contract' };");
  (await p.$$eval('[data-act=choose]', n => n.length)) === 3 ? ok('ekran Kontraktu') : fail('ekran Kontraktu');
  await p.screenshot({ path: OUT + '/rozb-kontrakt.png' });
  await p.click('[data-act=choose][data-i="1"]'); await wait(500);
  (await p.evaluate(() => window.__bulgot.run.tiles.includes('umowa-b2b'))) ? ok('B2B podpisane') : fail('B2B');
  await patchRun("run.phase = 'event'; run.offer = []; run.pending = { kind: 'shrine', badge: 'bhp' }; run.hp = 20;");
  await p.screenshot({ path: OUT + '/rozb-kapliczka.png' });
  await p.click('[data-act=choose][data-i="0"]'); await wait(500);
  const hh = await p.evaluate(() => [window.__bulgot.run.hp, window.__bulgot.run.maxHp]);
  hh[0] === hh[1] ? ok('Kapliczka leczy') : fail('Kapliczka: ' + hh);
  // elita z cechami na piętrze 3 (szybki tryb)
  await patchRun("run.phase = 'offer'; run.round = 4; run.offer = ['ziarno-mocy', 'twardy-grzebien', 'szybki-dziob', 'ostry-dziob']; run.pending = null;");
  const aff = await p.$$eval('.preview .tag.aff', n => n.length); aff ? ok('podgląd elity z cechami') : fail('brak cech elity w podglądzie');
  await p.screenshot({ path: OUT + '/rozb-elita.png' });
}
// 4. Księga Kurnika: wszystkie kafelki z ikonami.
await p.evaluate(() => { const c = document.querySelector('.modal [data-act=close]'); c && c.click(); }); await wait(300);
await p.evaluate(() => { const m = document.querySelector('[data-act=menu]'); m && m.click(); }); await wait(300);
await p.evaluate(() => document.querySelector('[data-act=book]').click()); await wait(500);
const cards = await p.$$eval('.book-grid .tile', n => n.length);
cards >= 40 ? ok('Księga: ' + cards + ' kafelków') : fail('Księga: ' + cards);
await p.screenshot({ path: OUT + '/rozb-ksiega.png', fullPage: true });
await p.evaluate(() => document.querySelector('[data-act=booktab][data-v=hatch]').click()); await wait(400);
const known = await p.$$eval('.modal .hatch-row:not(.unknown)', n => n.length);
known >= 1 ? ok('Księga: odkryte przepisy ' + known) : fail('Księga: brak odkrytego przepisu');
await p.screenshot({ path: OUT + '/rozb-ksiega-wyl.png' });
await p.evaluate(() => document.querySelector('[data-act=booktab][data-v=badges]').click()); await wait(400);
(await p.$$eval('.modal .ms-row', n => n.length)) >= 19 ? ok('Księga: Odznaki i cechy') : fail('Księga: Odznaki');
await p.evaluate(() => document.querySelector('[data-act=booktab][data-v=foes]').click()); await wait(400);
await p.screenshot({ path: OUT + '/rozb-wrogowie.png', fullPage: true });

if (errs.length) fail('błędy strony:\n' + [...new Set(errs)].join('\n')); else ok('bez błędów w konsoli');
await b.close();
