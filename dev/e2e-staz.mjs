// Bulgot: Staż (poziom konta), Sklepik Zakładowy (stroje), Dyżur dnia, Księga Rosołów i przycisk wymiany oferty („Przetasuj Taśmę”).
// Sprawdza też, że menu główne mieści się w oknie (bez przewijania) z pigułką Stażu i przyciskiem Dyżuru.
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-staz.mjs [katalog na zrzuty]   (serwer plików na :8090)
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = process.argv[2] || '.';
const wait = ms => new Promise(r => setTimeout(r, ms));
const ok = (c, m) => { console.log((c ? 'OK: ' : 'BŁĄD: ') + m); if (!c) process.exitCode = 1; };
const URL0 = 'http://localhost:8090/bulgot/?local=1';
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-first-run'] });
const p = await b.newPage();
const errs = [];
p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
await p.setViewport({ width: 1440, height: 900 });
const PK = 'bulgot:local:player:profile';
const patchProfile = fn => p.evaluate((k, src) => { const pr = JSON.parse(localStorage.getItem(k)); (new Function('pr', src))(pr); localStorage.setItem(k, JSON.stringify(pr)); }, PK, fn);
const reload = async () => { await p.reload({ waitUntil: 'networkidle0' }); await wait(500); };
const over = () => p.evaluate(() => document.scrollingElement.scrollHeight - innerHeight);

await p.goto(URL0, { waitUntil: 'networkidle0' });
await p.evaluate(() => localStorage.clear()); await reload();

// 1. Menu: pigułka Stażu, przycisk Dyżuru, Sklepik; bez przewijania w typowych oknach (także z Nemezis i Testamentem)
ok(!!(await p.$('.staz-pill')) && !!(await p.$('[data-act=daily]')) && !!(await p.$('[data-act=shop]')), 'menu ma pigułkę Stażu, Dyżur dnia i Sklepik');
await patchProfile("pr.nemesis = { enemy: 'szczur-pasz', title: 'Brygadzista', given: 'Grażyna', lvl: 1, affix: 'zly', tile: 'ziarno-mocy' }; pr.will = { tile: 'ziarno-mocy', char: 'pyrtek' };");
await reload();
for (const [w, h] of [[1920, 925], [1920, 1080], [1366, 650], [1366, 768], [1280, 720], [1440, 900]]) {
  await p.setViewport({ width: w, height: h }); await wait(200);
  const o = await over(); ok(o <= 0, `menu ${w}x${h} bez przewijania (nadmiar ${o})`);
}
await p.setViewport({ width: 1440, height: 900 });
await p.screenshot({ path: OUT + '/staz-menu.png' });
await patchProfile('delete pr.nemesis; delete pr.will;');

// 2. Awans: okno z wyborem nagrody (1 z 2), Talony, kolejka
await patchProfile("pr.xp = 20; pr.talons = 6; pr.lvlPending = [{ lvl: 1, opts: ['piora', 'talon'] }];");
await reload(); await wait(400);
ok(!!(await p.$('.reward-opts')), 'po awansie pokazuje się wybór nagrody');
ok((await p.$$('.reward-opt')).length === 2, 'dwie nagrody do wyboru');
await p.screenshot({ path: OUT + '/staz-awans.png' });
await p.click('.reward-opt'); await wait(500);
const st = await p.evaluate(() => ({ pending: window.__bulgot.profile.lvlPending, feathers: window.__bulgot.profile.feathers, open: !document.getElementById('overlay').hidden }));
ok(!st.pending && st.feathers === 11 && !st.open, 'nagroda odebrana (Premia kwartalna: 10 + poziom Piór), okno zamknięte');

// 3. Sklepik: kupno, zakładanie, strój widoczny w menu postaci, w grze i w podglądzie
await p.click('[data-act=shop]'); await wait(300);
ok((await p.$$('.shop-card')).length === 6, 'Sklepik ma 6 towarów');
await p.screenshot({ path: OUT + '/staz-sklepik.png' });
await p.click('[data-act=shopbuy][data-id=okulary]'); await wait(500);
const w1 = await p.evaluate(() => window.__bulgot.profile.wardrobe);
ok(w1.owned.includes('okulary') && w1.eq.eyes === 'okulary', 'okulary kupione i założone');
ok(await p.evaluate(() => document.querySelector('.shop-hero svg').innerHTML.includes('#15151c')), 'podgląd kurczaka ma okulary');
const tal = await p.evaluate(() => window.__bulgot.profile.staz.talons); ok(tal === 4, 'Talony pobrane (6 - 2)');
await p.click('[data-act=wear][data-id=okulary]'); await wait(400);
ok(await p.evaluate(() => !window.__bulgot.profile.wardrobe.eq.eyes), 'zdjęcie okularów');
await p.click('[data-act=wear][data-id=okulary]'); await wait(300);
await p.evaluate(() => document.querySelector('[data-act=close]').click()); await wait(200);

// 4. Przycisk wymiany oferty w grze + strój w walce; strój na karcie bohatera
await p.click('[data-act=new]'); await wait(200); await p.click('[data-act=start]'); await wait(500);
if (await p.$('[data-act=introgo]')) { await p.click('[data-act=introgo]'); await wait(300); }
const rr = await p.evaluate(() => { const b = document.querySelector('[data-act=reroll]'); return b ? { t: b.textContent.split(/[ \n\t]+/).join(' ').trim(), cost: b.querySelector('.rcost') && b.querySelector('.rcost').textContent.trim() } : null; });
ok(rr && /Przetasuj Taśmę/.test(rr.t) && !/null/.test(rr.t), 'przycisk wymiany ma nazwę z fabuły i cenę: ' + (rr && rr.t));
ok(await p.evaluate(() => document.querySelector('.h4-fig svg').innerHTML.includes('#15151c')), 'karta bohatera pokazuje strój');
await p.screenshot({ path: OUT + '/staz-oferta.png' });
// Klątwa Zakaz Wymian: przycisk zablokowany, bez „null”
await p.evaluate(async () => { const m = await import('/bulgot/api.js'); await m.call('abandon'); });
await p.evaluate(() => { window.__bulgot.run = null; });
await reload();
// klątwy są ukryte w ekranie startowym (SHOW_CURSES = false), więc run z Klątwą startujemy przez API
await p.evaluate(async () => { const m = await import('/bulgot/api.js'); await m.call('start', { mode: 'quick', char: 'pyrtek', garnek: 0, curses: ['zakaz-wymian'] }); });
await reload(); await wait(500);
if (await p.$('[data-act=introgo]')) { await p.click('[data-act=introgo]'); await wait(300); }
const rb = await p.evaluate(() => { const b = document.querySelector('.btn.reroll'); return b ? { t: b.textContent.split(/[ \n\t]+/).join(' ').trim(), dis: b.disabled } : null; });
ok(rb && rb.dis && !/null/.test(rb.t), 'Zakaz Wymian: przycisk zablokowany, bez napisu null: ' + (rb && rb.t));
await p.screenshot({ path: OUT + '/staz-zakaz.png' });
await p.evaluate(async () => { const m = await import('/bulgot/api.js'); await m.call('abandon'); });
await reload();

// 5. Dyżur dnia: okno, start, pigułka w runie, drugie podejście zablokowane
await p.click('[data-act=daily]'); await wait(400);
ok(!!(await p.$('[data-act=dailystart]')), 'okno Dyżuru z przyciskiem startu');
await p.screenshot({ path: OUT + '/staz-dyzur.png' });
await p.click('[data-act=dailystart]'); await wait(700);
if (await p.$('[data-act=introgo]')) { await p.click('[data-act=introgo]'); await wait(300); }
ok(!!(await p.$('.pill.dly')), 'w runie widać pigułkę Dyżuru dnia');
const d1 = await p.evaluate(() => ({ daily: window.__bulgot.run.daily, curses: window.__bulgot.run.curses, mode: window.__bulgot.run.mode }));
ok(d1.daily && d1.curses.length === 1 && d1.mode === 'quick', 'dyżur: tryb szybki i jedna Klątwa');
await p.evaluate(async () => { const m = await import('/bulgot/api.js'); await m.call('abandon'); });
await reload();
const dd = await p.evaluate(() => window.__bulgot.daily);
ok(dd && dd.used, 'po dyżurze stan „odbyty”');
await p.click('[data-act=daily]'); await wait(400);
ok(!(await p.$('[data-act=dailystart]')), 'drugi raz tego samego dnia nie ma przycisku startu');
await p.evaluate(() => document.querySelector('[data-act=close]').click()); await wait(200);

// 6. Księga Rosołów
await p.click('[data-act=book]'); await wait(400);
await p.click('[data-act=booktab][data-v=soups]'); await wait(500);
ok((await p.$$('.soup-row')).length === 30, 'Księga Rosołów: 30 przepisów');
await p.screenshot({ path: OUT + '/staz-rosoly.png' });
ok(errs.length === 0, 'bez błędów w konsoli ' + errs.join(' | '));
await b.close();
