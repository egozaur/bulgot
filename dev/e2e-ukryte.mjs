// Bulgot: szablony pięter i ukryty podgląd wrogów (od Garnka 1), plus unieważnienie starego runu.
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-ukryte.mjs [katalog na zrzuty]
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = process.argv[2] || '.';
const wait = ms => new Promise(r => setTimeout(r, ms));
let bad = 0; const check = (c, m) => { console.log((c ? 'OK: ' : 'BŁĄD: ') + m); if (!c) bad++; };
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-first-run'] });
const p = await b.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.setViewport({ width: 1440, height: 900 });
await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bulgot:intro', '1'); });
await p.reload({ waitUntil: 'networkidle0' }); await wait(300);
const K = 'bulgot:local:player:';
const patchRun = fn => p.evaluate((K, src) => { const r = JSON.parse(localStorage.getItem(K + 'run')); (new Function('r', src))(r); localStorage.setItem(K + 'run', JSON.stringify(r)); }, K, fn);
const reload = async () => { await p.reload({ waitUntil: 'load' }); await wait(700); const c = await p.$('[data-act=resume]'); if (c) { await c.click(); await wait(400); } };

// 1) Garnek 0: podgląd z nazwami wrogów i szablonem
await p.click('[data-act=new]'); await wait(200); await p.click('[data-act=setnext]'); await wait(150); await p.click('[data-act=start]'); await wait(500);
const go = await p.$('[data-act=introgo]'); if (go) { await go.click(); await wait(300); }
// piętro z szablonem: szukamy rundy 5–11 (tryb pełny), w której serwer pokazuje tpl
let found = null;
for (let round = 5; round <= 11 && !found; round++) {
  await patchRun(`r.round = ${round}; r.phase = 'offer'; r.door = null;`); await reload();
  const v = await p.evaluate(() => ({ tpl: window.__bulgot.run.tpl, enemies: window.__bulgot.run.enemies, txt: document.querySelector('.preview')?.innerText || '' }));
  if (v.tpl) found = { round, ...v };
}
check(found, 'Garnek 0: znaleziono piętro z szablonem ' + (found && found.tpl + ' (piętro ' + found.round + ')'));
if (found) check(/Czempion|Rój|Zwiad|Para/.test(found.txt) && found.enemies.length >= 1, 'Garnek 0: podgląd pokazuje wrogów i opis szablonu');
await p.screenshot({ path: `${OUT}/ukryte-g0.png` });

// 2) Garnek 1: serwer nie wysyła składu, w podglądzie jest zaparowana szyba
await patchRun(`r.garnek = 1; r.round = ${found ? found.round : 7}; r.phase = 'offer';`); await reload();
const h = await p.evaluate(() => ({ enemies: window.__bulgot.run.enemies, tpl: window.__bulgot.run.tpl, hidden: window.__bulgot.run.hidden, fog: !!document.querySelector('.preview.fog'), names: document.querySelector('.preview')?.innerText || '' }));
check(h.enemies === null && !h.tpl && h.hidden === true, 'Garnek 1: widok bez wrogów i szablonu');
check(h.fog && !/Szczur|Lis|Pies|Kaczka|Wózek|Bałwan|Mysz|Kurczak z|Jajo|Kot|Kanarek|Sęp/.test(h.names), 'Garnek 1: zaparowana szyba bez nazw');
await p.screenshot({ path: `${OUT}/ukryte-g1.png` });
// boss nadal zapowiedziany
await patchRun(`r.round = 6; r.phase = 'offer';`); await reload();
const bs = await p.evaluate(() => ({ enemies: window.__bulgot.run.enemies, fog: !!document.querySelector('.preview.fog') }));
check(bs.enemies && bs.enemies[0] === 'brojler' && !bs.fog, 'Garnek 1: boss zapowiedziany');

// 3) stary run (wersja reguł 1) jest unieważniany z komunikatem
await patchRun(`r.v = 1;`); await p.reload({ waitUntil: 'load' }); await wait(900);
const vo = await p.evaluate(() => ({ run: window.__bulgot.run, toast: document.querySelector('#toasts')?.innerText || '' }));
check(vo.run === null && /unieważniony/.test(vo.toast), 'stary run unieważniony z komunikatem');
check(!errs.length, 'bez błędów na stronie ' + errs.join(' | '));
await b.close();
console.log(bad ? 'NIEZALICZONY' : 'WSZYSTKO OK'); if (bad) process.exitCode = 1;
