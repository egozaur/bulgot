// Bulgot: siedem nowości w przeglądarce (Klątwy Prezesa, trasy, Dogrywka, Arena Duchów, Towarzysz, Kurnik, ranking Dogrywki, Księga).
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-nowosci.mjs [katalog na zrzuty]
// Wymaga serwera plików: node C:\Users\Kurczak\tools\scripts\serve.mjs C:\Users\Kurczak\pl3y 8090
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = process.argv[2] || '.';
const wait = ms => new Promise(r => setTimeout(r, ms));
let bad = false;
const ok = (c, m) => { console.log((c ? 'OK: ' : 'BŁĄD: ') + m); if (!c) { bad = true; process.exitCode = 1; } };
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-first-run'] });
const p = await b.newPage();
const errs = [];
p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
await p.setViewport({ width: 1600, height: 900 });
const url = 'http://localhost:8090/bulgot/?local=1';
await p.goto(url, { waitUntil: 'networkidle0' });
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bulgot:invoice', '0'); localStorage.setItem('bulgot:intro', '1'); });
await p.reload({ waitUntil: 'networkidle0' }); await wait(400);
const K = n => 'bulgot:local:player:' + n;
const getRun = () => p.evaluate(k => JSON.parse(localStorage.getItem(k)), K('run'));
const setRun = async fn => { const r = await getRun(); fn(r); await p.evaluate((k, v) => localStorage.setItem(k, JSON.stringify(v)), K('run'), r); await p.reload({ waitUntil: 'networkidle0' }); await wait(500); if (await count('[data-act=resume]')) { await p.click('[data-act=resume]'); await wait(500); } };
const text = sel => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent : ''; }, sel);
const count0 = 0;
const count = sel => p.evaluate(s => document.querySelectorAll(s).length, sel);
const click = async sel => { await p.click(sel); await wait(450); };

// ---------- Klątwy w ekranie startowym ----------
await click('[data-act=new]'); await p.keyboard.press('Enter'); await wait(400);
ok(await count('.curse-chip') === 0, 'klątwy ukryte na ekranie startowym (SHOW_CURSES = false)');
if (await p.$('[data-act=start]')) await click('[data-act=start]'); await wait(800);
ok(await count('.pill.curse') === 0, 'bez klątw nie ma plakietki Klątw na pasku');
ok(await p.evaluate(() => !!document.querySelector('.preview.fog, .preview .tplnote')), 'Mgła Zarządu: skład piętra ukryty (zaparowana szyba)');

// ---------- Trasa ----------
await setRun(r => { r.round = 7; r.phase = 'route'; r.offer = []; r.pending = { kind: 'route', opts: ['chlodnia', 'kotlownia'] }; });
ok(await count('.tile.choice') === 2 && /Chłodnia/.test(await text('.cards')), 'wybór trasy: dwie karty (Chłodnia, Kotłownia)');
await p.screenshot({ path: `${OUT}/nowosci-trasa.png` });
await click('.tile.choice[data-i="0"]');
ok(await count('.pill.route') === 1 && /Chłodnia/.test(await text('.pill.route')), 'plakietka trasy po wyborze');
ok(await count('.cards .slotcard') >= 3, 'po trasie zwykła oferta kafelków');

// ---------- Schronisko i Towarzysz ----------
await setRun(r => { r.phase = 'event'; r.offer = []; r.pending = { kind: 'adopt', opts: ['pisklak', 'kot', 'gasior'] }; });
ok(await count('.tile.choice') === 3 && await count('.tile.choice .comp-fig') === 3, 'Schronisko: trzy karty z figurkami');
await p.screenshot({ path: `${OUT}/nowosci-schronisko.png` });
await click('.tile.choice[data-i="0"]');
ok(await count('.hero-card .pet') === 1 && /Pisklę Bojowe/.test(await p.evaluate(() => document.querySelector('.hero-card .pet').dataset.tip)), 'towarzysz przyczepiony do portretu bohatera');

// ---------- Arena Duchów i walka z Duchem ----------
await setRun(r => { r.round = 4; r.phase = 'offer'; r.pending = null; r.offer = ['arena-duchow', 'ziarno-mocy', 'twardy-grzebien', 'czujne-oko']; r.flawAt = -1; r.tiles = [...Array(40).fill('ziarno-mocy'), ...Array(40).fill('twardy-grzebien')]; r.hp = 99999; r.curses = []; });
await click('.cards .slotcard:first-child .tile');
ok(await count('.ghostcard') === 1 && /Arena Duchów/.test(await text('.stage-title')), 'Arena: karta Ducha ze statystykami');
await p.screenshot({ path: `${OUT}/nowosci-arena.png` });
await click('.tile.choice[data-i="0"]');
ok(await count('.preview.arenaview') === 1, 'przed walką podgląd Ducha');
await click('[data-act=tofight]'); await wait(900);
ok(await count('.unit.enemy .ghostfig') === 1 && await count('.unit.ally') === 1, 'w walce Duch po prawej i towarzysz po lewej');
await p.screenshot({ path: `${OUT}/nowosci-walka-duch.png` });
await p.waitForSelector('.cards .slotcard, .modal, .stage .cards', { timeout: 90000 }).catch(() => {}); await wait(2500);
const afterFight = await getRun();
ok(afterFight.phase === 'bonus' || afterFight.phase === 'over', 'walka z Duchem rozliczona (faza: ' + afterFight.phase + ')');

// ---------- Prezes pokonany: Dogrywka ----------
await setRun(r => { r.phase = 'victory'; r.round = 20; r.cleared = 20; r.done = 20; r.offer = []; r.pending = { kind: 'victory' }; r.arena = null; r.mode = 'full'; r.ended = null; });
ok(await count('.tile.choice') === 2 && /Dogrywka/.test(await text('.cards')), 'po Prezesie: Dogrywka albo koniec');
await p.screenshot({ path: `${OUT}/nowosci-prezes.png` });
await click('.tile.choice[data-i="0"]');
ok(await count('.pill.endl') === 1 && /∞/.test(await text('.disp.lift')), 'Dogrywka: plakietka i ∞ na liczniku pięter');
// super-boss na piętrze 25 (pełny: 20 + 5): zapowiedź w podglądzie
await setRun(r => { r.round = 25; r.phase = 'offer'; r.pending = null; r.offer = ['ziarno-mocy', 'twardy-grzebien', 'czujne-oko', 'siewnik']; r.flawAt = -1; r.endless = true; });
await wait(300);
ok(await count('.preview .pv.boss') >= 1 && /Skubarka 9000/.test(await text('.preview')), 'piętro 25: super-boss Skubarka 9000 w podglądzie: ' + (await text('.preview')).slice(0, 80));
await p.screenshot({ path: `${OUT}/nowosci-superboss.png` });

// ---------- Kurnik, Księga, ranking Dogrywki ----------
await p.evaluate(k => { const pr = JSON.parse(localStorage.getItem(k)); pr.feathers = 100; localStorage.setItem(k, JSON.stringify(pr)); }, K('profile'));
await p.evaluate(() => document.querySelector('[data-act=home]') && document.querySelector('[data-act=home]').click()); await wait(300);
await p.reload({ waitUntil: 'networkidle0' }); await wait(500);
if (await count('[data-act=home]')) { await click('[data-act=home]'); }
await click('[data-act=kurnik]');
ok(await count('.kb') === 7, '7 budynków Kurnika');
ok(await count('.klock') === 1 && await count('.kb.locked') === 7 && await count('.kb [data-act=kbuy]') === 0, 'poniżej 20. poziomu Stażu Kurnik jest tylko podglądem (baner, brak przycisków kupna)');
await click('[data-act=close]');
await p.evaluate(k => { const pr = JSON.parse(localStorage.getItem(k)); pr.xp = 6145; localStorage.setItem(k, JSON.stringify(pr)); }, K('profile'));   // dokładnie 20. poziom Stażu
await p.reload({ waitUntil: 'networkidle0' }); await wait(500);
if (await count('[data-act=home]')) { await click('[data-act=home]'); }
await click('[data-act=kurnik]');
ok(await count('.klock') === 0 && await count('.kb.locked') === 0, 'od 20. poziomu Stażu Kurnik jest otwarty');
ok(/Pióra: 100/.test(await text('.kfeathers')), 'Pióra w nagłówku');
await click('.kb [data-act=kbuy][data-v=spizarnia]');
ok(/Pióra: 88/.test(await text('.kfeathers')) && await count('.kb .kbl i.on') === 1, 'zakup poziomu Spiżarni (-12 Piór)');
await p.screenshot({ path: `${OUT}/nowosci-kurnik.png` });
await click('[data-act=close]');
await click('[data-act=book]'); await p.evaluate(() => { const t = [...document.querySelectorAll('[data-act=booktab],[data-tab]')].find(x => /Klątwy, trasy/.test(x.textContent)); if (t) t.click(); }); await wait(500);
ok(/Klątwy Prezesa/.test(await text('.bookflow, .bookview, .modal')), 'Księga: zakładka z klątwami, trasami i towarzyszami');
await p.screenshot({ path: `${OUT}/nowosci-ksiega.png` });
await p.keyboard.press('Escape'); await wait(300);
await click('[data-act=ranking]'); await click('[data-act=rkdeep]'); await wait(500);
ok(await count('.tab.on[data-act=rkdeep]') === 1 && !/Błąd|błąd/.test(await text('#rk')), 'zakładka rankingu Dogrywki: ' + (await text('#rk')).slice(0, 60));
await p.screenshot({ path: `${OUT}/nowosci-ranking.png` });

ok(!errs.length, 'bez błędów w konsoli ' + errs.join(' | '));
await b.close();
