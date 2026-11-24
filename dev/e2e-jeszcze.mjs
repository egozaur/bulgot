// Bulgot: test e2e rozbudowy „jeszcze jedna partia” (Rozwidlenie, Wadliwa Partia, Okólnik, Lombard, Seria i Reakcje, Nemezis, Testament, Księga)
// w prawdziwej przeglądarce (Edge + puppeteer-core). Stan runu w localStorage (tryb lokalny) jest podmieniany na konkretne układy.
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-jeszcze.mjs [katalog na zrzuty]
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
const check = (c, msg) => c ? console.log('OK:', msg) : fail(msg);
const st = () => p.evaluate(() => { const G = window.__bulgot; return { screen: G.screen, phase: G.run && G.run.phase, round: G.run && G.run.round, coins: G.run && G.run.coins, run: G.run, profile: G.profile }; });
const text = sel => p.evaluate(s => [...document.querySelectorAll(s)].map(n => n.textContent).join(' | '), sel);

await p.click('[data-act=new]'); await wait(200);
await p.evaluate(() => document.querySelector('[data-act=setmode][data-v=full]').click());
await p.click('[data-act=start]'); await wait(500);
await p.click('[data-act=introgo]'); await wait(300);

async function patch(which, fnSrc) {
  await p.evaluate((w, src) => {
    const k = Object.keys(localStorage).find(x => x.endsWith(':' + w));
    const v = JSON.parse(localStorage.getItem(k));
    (new Function('v', src))(v);
    localStorage.setItem(k, JSON.stringify(v));
  }, which, fnSrc);
  await p.reload({ waitUntil: 'networkidle0' }); await wait(500);
  await p.evaluate(() => { const c = document.querySelector('[data-act=resume]'); c && c.click(); }); await wait(400);
}

// 1. Rozwidlenie Korytarza
await patch('run', `v.round = 2; v.phase = 'door'; v.offer = []; v.pending = { kind: 'door', affix: 'szybki', reward: 'rare', coins: 8 }; v.decrees = ['audyt', 'pilny', 'premia'];`);
let s = await st();
check(s.phase === 'door' && (await p.$$('.cards [data-act=choose]')).length === 2 && /Audyt/.test(await text('.decbar')), 'ekran drzwi z dwiema kartami i okólnikiem');
check((await text('.tower .floor.door, .tower .fp.door')).length > 0, 'pasek pięter oznacza drzwi');
await p.screenshot({ path: OUT + '/j-drzwi.png' });
await p.keyboard.press('2'); await wait(500); s = await st();
check(s.phase === 'offer' && s.run.door && s.run.door.risky, 'ryzykowne drzwi wybrane klawiszem 2');
check(/personelu/.test(await text('.preview .lab')), 'podgląd: drzwi dla personelu');
// 2. Okólnik (Audyt) i ceny
check(/Audyt/.test(await text('.sub .dsub')) && (await p.$$('.pill.dec')).length === 1, 'okólnik w podtytule piętra i na pasku');
const buy = await text('.cards [data-act=buyoffer]');
check(/Dokup za (9|18|30|45)/.test(buy), 'Audyt: ceny dokupienia +50% (' + buy.slice(0, 60) + ')');
check(/za darmo|gratis/.test(await text('[data-act=reroll]')), 'Audyt: darmowy reroll');

// 3. Wadliwa Partia i Lombard
await patch('run', `v.offer = ['ziarno-mocy', 'twardy-grzebien', 'szybki-dziob', 'ostry-dziob']; v.flawAt = 0; v.tiles = ['opaska-rambo']; v.coins = 0;`);
check((await p.$$('.slotcard .stamp.flaw')).length === 1, 'pieczątka wady fabrycznej');
await p.screenshot({ path: OUT + '/j-wada.png' });
await p.click('[data-act=pawnmenu]'); await wait(300);
check((await p.$$('.modal [data-act=pawn]')).length === 1, 'Lombard pokazuje kafelek do zastawu');
await p.screenshot({ path: OUT + '/j-lombard.png' });
await p.click('.modal [data-act=pawn]'); await wait(500); s = await st();
check(s.run.pawned && s.run.pawned.id === 'opaska-rambo' && s.coins === 12 && !s.run.tiles.includes('opaska-rambo'), 'zastaw: +12 Ziaren');
check(/W lombardzie/.test(await text('.side')), 'panel pokazuje zastaw');
await p.keyboard.press('1'); await wait(500); s = await st();
check(s.run.flawed && s.run.flawed.length === 1 && s.run.flawed[0].flaw === null, 'kafelek z wadą wzięty, wada ukryta');

// 4. Walka: seria trzech umiejętności i reakcja
await patch('run', `v.skills = [{ id: 'zgnile', lvl: 1 }, { id: 'darcie', lvl: 1 }, { id: 'granat', lvl: 1 }]; v.tiles.push('zgnile-jajo', 'darcie-pierza', 'jajeczny-granat'); v.door = null; v.round = 9; for (let i = 0; i < 20; i++) v.tiles.push('twardy-grzebien', 'pancerz-z-pierza'); v.hp = 900;`);
await p.click('[data-act=tofight]'); await wait(2600);
await p.keyboard.press('1'); await p.keyboard.press('2'); await p.keyboard.press('3');
let seria = false, react = false;
for (let i = 0; i < 25 && !(seria && react); i++) {
  const t = await text('.banner, .dmg');
  if (/Pełna Kurza Seria/.test(t)) seria = true;
  if (/Szok Termiczny|Kruchość|Gorączka/.test(t)) react = true;
  if (i === 3) await p.screenshot({ path: OUT + '/j-seria.png' });
  await wait(100);
}
check(seria, 'banner Pełnej Kurzej Serii');
check(react, 'napis reakcji nad wrogiem');
for (let i = 0; i < 300 && !(await p.$('.inv, .modal')); i++) await wait(100);
await p.screenshot({ path: OUT + '/j-wynik.png' });
const res = await text('.inv, .modal');
check(/Pełne Kurze Serie|[Rr]eakcje/.test(res), 'wynik walki pokazuje serie i reakcje');
check(/Wada ujawniona/.test(res) || (await st()).phase === 'over', 'wynik walki ujawnia wadę');
await p.evaluate(() => { const c = document.querySelector('.modal [data-act=close]'); c && c.click(); document.querySelector('#invoice').innerHTML = ''; }); await wait(300);

// 5. Nemezis na bieżącym piętrze
await patch('run', `v.phase = 'offer'; v.offer = ['ziarno-mocy', 'twardy-grzebien', 'szybki-dziob', 'ostry-dziob']; v.nemesis = { enemy: 'szczur-pasz', title: 'Kierownik', given: 'Zbigniew', affix: 'szybki', tile: 'opaska-rambo', lvl: 2, round: v.round, beaten: false };`);
check(/Nemezis/.test(await text('.preview .lab')) && /Kierownik Szczur Pasz Zbigniew/.test(await text('.preview')), 'podgląd: Nemezis z imieniem');
check((await p.$$('.tower .floor.nem, .tower .fp.nem')).length === 1, 'pasek pięter oznacza Nemezis');
await p.screenshot({ path: OUT + '/j-nemezis.png' });

// 6. Testament po przegranej
await p.click('[data-act=menu]'); await wait(200); await p.click('.modal [data-act=abandon]'); await wait(200); await p.click('[data-act=abandon-yes]'); await wait(1500);
check((await p.$$('.modal [data-act=will]')).length >= 2, 'ekran końca: wybór testamentu');
await p.screenshot({ path: OUT + '/j-testament.png' });
const willTile = await p.evaluate(() => window.__bulgot.run.willOptions[0]);
await p.click('.modal .will-grid [data-act=will][data-i="0"]'); await wait(500); s = await st();
check(s.profile.will && s.profile.will.tile === willTile && /Testament spisany/.test(await text('.modal')), 'testament spisany: ' + willTile);
await p.click('.modal [data-act=again]'); await wait(300); await p.click('[data-act=start]'); await wait(600); s = await st();
// Testament czeka na INNĄ postać, gdy gracz ma odblokowaną więcej niż jedną (w walkach testu może się odblokować Związkowiec).
check((s.run.offer.includes(willTile) && (await p.$$('.slotcard .stamp.will')).length === 1) || (s.profile.chars.length > 1 && s.profile.will && s.profile.will.tile === willTile), 'kafelek z testamentu jako karta w nowej ofercie (lub czeka na inną postać)');
await p.screenshot({ path: OUT + '/j-testament-oferta.png' });

// 7. Księga: Reakcje i Okólniki
await p.click('[data-act=menu]'); await wait(200); await p.click('.modal [data-act=book]'); await wait(300);
await p.click('[data-act=booktab][data-v=react]'); await wait(300);
check(/Okólniki Zarządu/.test(await text('.modal')) && /Gorączka/.test(await text('.modal')), 'Księga: zakładka Reakcje i Okólniki (odkryta Gorączka)');
await p.screenshot({ path: OUT + '/j-ksiega.png' });

check(!errs.length, 'bez błędów w konsoli' + (errs.length ? ': ' + errs.join('; ') : ''));
await b.close();
