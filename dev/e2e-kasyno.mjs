// Bulgot: tryb kasynowy (automat przy przetasowaniu). Domyślnie wyłączony i zablokowany; 5 przetasowań na jednym piętrze pyta „Tak/tak”;
// po włączeniu przetasowanie to automat (walce stają po kolei), da się go przerwać, a w ustawieniach jest przełącznik.
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-kasyno.mjs [katalog na zrzuty]   (serwer plików na :8090)
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = process.argv[2] || '.';
const wait = ms => new Promise(r => setTimeout(r, ms));
const ok = (c, m) => { console.log((c ? 'OK: ' : 'BŁĄD: ') + m); if (!c) process.exitCode = 1; };
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-first-run'] });
const p = await b.newPage();
const errs = [];
p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
await p.setViewport({ width: 1440, height: 900 });
await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'networkidle0' }); await wait(400);
await p.click('[data-act=new]'); await wait(200); await p.click('[data-act=setnext]'); await wait(150); await p.click('[data-act=start]'); await wait(500);
if (await p.$('[data-act=introgo]')) { await p.click('[data-act=introgo]'); await wait(300); }
// Ziarna na rerolle wpisujemy w zapisany run (to test, nie gra), potem wracamy do gry
await p.evaluate(() => { const k = 'bulgot:local:player:run', r = JSON.parse(localStorage.getItem(k)); r.coins = 900; r.freeLeft = 0; localStorage.setItem(k, JSON.stringify(r)); });
await p.reload({ waitUntil: 'networkidle0' }); await wait(400);
await p.click('[data-act=resume]'); await wait(500);
const rerollClick = async () => { await p.click('[data-act=reroll]'); };
const scroll = () => p.evaluate(() => document.scrollingElement.scrollHeight - innerHeight);

// 1. Domyślnie: bez trybu kasynowego, ustawienia bez przełącznika
await p.click('[data-act=menu]'); await wait(250); await p.click('[data-act=settings]'); await wait(250);
ok(!(await p.$('[data-act=tcasino]')), 'ustawienia nie mają przełącznika, dopóki tryb nie jest odblokowany');
await p.evaluate(() => document.querySelector('[data-act=close]').click()); await wait(200);

// 2. Cztery przetasowania: zwykła wymiana, bez automatu i bez pytania
for (let i = 1; i <= 4; i++) { await rerollClick(); await wait(120); ok(!(await p.$('.slotm')) && !(await p.$('.casino-ask')), `${i}. przetasowanie: zwykła wymiana`); await wait(150); }

// 3. Piąte: wielki ekran z pytaniem „Tak/tak”
await rerollClick(); await wait(700);
ok(!!(await p.$('.casino-ask')), 'piąte przetasowanie na piętrze pokazuje pytanie o tryb kasynowy');
const btns = await p.$$eval('.casino-ask .btn', els => els.map(e => e.textContent.trim()));
ok(btns.length === 2 && btns[0] === 'Tak' && btns[1] === 'tak', 'dwa przyciski: „Tak” i „tak” (' + btns.join(' / ') + ')');
await p.screenshot({ path: OUT + '/kasyno-pytanie.png' });
const before = await p.evaluate(() => window.__bulgot.profile.casino);
ok(before && before.unlocked && !before.on, 'przed odpowiedzią odblokowany, ale wyłączony');
await p.click('.casino-ask .btn:nth-child(2)'); await wait(500);
ok(await p.evaluate(() => window.__bulgot.profile.casino.on === true && window.__bulgot.profile.casino.asked === true), 'odpowiedź włącza tryb na stałe');
ok(!(await p.$('.casino-ask')), 'pytanie znika po odpowiedzi');

// 4. Kolejne przetasowanie: automat, walce stają po kolei, oferta zgodna z serwerem, bez przewijania strony
await rerollClick(); await wait(250);
ok(!!(await p.$('.slotm')), 'przetasowanie uruchamia automat');
ok((await p.$$('.slotm .cell')).length === 4, 'cztery okienka');
ok((await p.$$('.slotm .reel')).length === 4, 'wszystkie walce kręcą się na starcie');
ok((await scroll()) <= 0, 'automat nie powoduje przewijania strony (' + (await scroll()) + ')');
await p.screenshot({ path: OUT + '/kasyno-start.png' });
await wait(750);
const mid = await p.$$eval('.slotm .cell', els => els.map(e => e.classList.contains('stopped')));
ok(mid[0] && !mid[3], 'walce stają od lewej: ' + mid.join(','));
await p.screenshot({ path: OUT + '/kasyno-srodek.png' });
for (let i = 0; i < 30 && (await p.$('.slotm')); i++) await wait(150);
ok(!(await p.$('.slotm')), 'automat znika po zatrzymaniu wszystkich walców');
const cardTexts = await p.$$eval('.stage .cards .slotcard', els => els.map(e => e.textContent));
const offerNames = await p.evaluate(async () => { const D = await import('/bulgot/shared/data.js'); return window.__bulgot.run.offer.map(id => id ? (D.TILES.find(t => t.id === id) || {}).name : ''); });
ok(cardTexts.length === offerNames.length && offerNames.every((n, i) => n && cardTexts[i].includes(n)), 'karty po automacie to dokładnie oferta z serwera: ' + offerNames.join(' | '));
ok(!(await p.$('.slotcard[style*="hidden"]')), 'żadna karta nie została ukryta');

// 5. Przerwanie spacją
await rerollClick(); await wait(200);
ok(!!(await p.$('.slotm')), 'drugi automat');
await p.keyboard.press('Space'); await wait(250);
ok(!(await p.$('.slotm')), 'spacja natychmiast kończy animację');
ok((await p.$$('.stage .cards .slotcard')).length === 4, 'po przerwaniu są wszystkie 4 karty');

// 6. Przerwanie kliknięciem nie wybiera karty
await rerollClick(); await wait(200);
await p.mouse.click(700, 520); await wait(250);
ok(!(await p.$('.slotm')) && (await p.evaluate(() => window.__bulgot.run.phase)) === 'offer', 'klik przerywa animację i nie wybiera kafelka (faza oferty)');

// 7. Przełącznik w ustawieniach wyłącza tryb; wyłączony nie kręci
await p.click('[data-act=menu]'); await wait(250); await p.click('[data-act=settings]'); await wait(250);
ok(!!(await p.$('[data-act=tcasino]')), 'po odblokowaniu w ustawieniach jest przełącznik trybu kasynowego');
await p.screenshot({ path: OUT + '/kasyno-ustawienia.png' });
await p.click('[data-act=tcasino]'); await wait(500);
ok(await p.evaluate(() => window.__bulgot.profile.casino.on === false), 'przełącznik wyłącza tryb');
await p.evaluate(() => document.querySelector('[data-act=close]').click()); await wait(250);
await rerollClick(); await wait(150);
ok(!(await p.$('.slotm')), 'wyłączony tryb: zwykła wymiana bez automatu');
ok(errs.length === 0, 'bez błędów w konsoli ' + errs.join(' | '));
await b.close();
