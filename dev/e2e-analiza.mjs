// Bulgot: test „Zgłoś błąd” (dawniej „Wyślij do analizy”) po zakończonej grze (ekran końca + historia) w tryb lokalnym.
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-analiza.mjs [katalog na zrzuty]
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
await p.setViewport({ width: 1440, height: 900 });
await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'networkidle0' }); await wait(400);
await p.click('[data-act=new]'); await wait(200);
await p.evaluate(() => document.querySelector('[data-act=setmode][data-v=quick]').click());
await p.click('[data-act=start]'); await wait(500);
await p.click('[data-act=introgo]'); await wait(300);
// run ma przegrać pierwszą walkę: 1 punkt życia, faza walki
await p.evaluate(() => {
  const k = Object.keys(localStorage).find(x => x.endsWith(':run'));
  const run = JSON.parse(localStorage.getItem(k)); run.phase = 'fight'; run.fight = null; run.hp = 1; localStorage.setItem(k, JSON.stringify(run));
});
await p.reload({ waitUntil: 'networkidle0' }); await wait(500);
await p.evaluate(() => { const c = document.querySelector('[data-act=resume]'); c && c.click(); }); await wait(400);
await p.click('[data-act=tofight]');
let end = false;
for (let i = 0; i < 80 && !end; i++) { await wait(500); end = await p.evaluate(() => !!document.querySelector('#analyzebox')); }
if (!end) { fail('ekran końca gry nie pojawił się (brak #analyzebox)'); await p.screenshot({ path: `${OUT}/analiza-brak.png` }); }
else {
  ok('ekran końca ma link „Zgłoś błąd”');
  if (await p.$('#anote')) fail('pole komentarza nie powinno być widoczne przed kliknięciem');
  await p.click('[data-act=analyze]'); await wait(300);
  if (!(await p.$('.modal #anote')) || (await p.$$('.modal .atag')).length < 4) fail('po kliknięciu brak okna z pytaniem o komentarz'); else ok('okno z pytaniem o komentarz i znacznikami');
  await p.screenshot({ path: `${OUT}/analiza-okno.png` });
  await p.click('.atag[data-v=za-latwo]'); await p.click('.atag[data-v=blad]'); await p.click('.atag[data-v=blad]');   // blad włączony i wyłączony
  await p.type('#anote', 'za łatwo, test e2e, R O L F 1 2 3');
  if (!(await p.$('.modal #anote'))) fail('okno zniknęło podczas pisania (skróty klawiszowe?)');
  await p.click('[data-act=asend]'); await wait(600);
  const sent = await p.evaluate(() => !!document.querySelector('#analyzebox .analyze-ok'));
  if (!sent) fail('po wysłaniu ekran końca bez potwierdzenia'); else ok('wysłano, wrócił ekran końca z potwierdzeniem');
  // serwer lokalny (localStorage BgRanks) ma kopię z notatką
  const saved = await p.evaluate(() => { const ks = Object.keys(localStorage).filter(k => k.includes(':ranks:an:')); return ks.map(k => JSON.parse(localStorage.getItem(k))).map(e => ({ id: e.id, note: e.note, tags: e.tags, log: Array.isArray(e.log) })); });
  if (saved.length !== 1 || saved[0].note !== 'za łatwo, test e2e, R O L F 1 2 3' || JSON.stringify(saved[0].tags) !== '["za-latwo"]' || !saved[0].log) fail('kolekcja analizy: ' + JSON.stringify(saved)); else ok('kopia partii w kolekcji: ' + JSON.stringify(saved[0]));
  // historia pokazuje „wysłano”
  await p.evaluate(() => { document.querySelector('[data-act=again]').click(); });
  await wait(300);
  await p.evaluate(() => document.querySelector('[data-act=home]') && document.querySelector('[data-act=home]').click()); await wait(300);
  await p.evaluate(() => document.querySelector('[data-act=history]').click()); await wait(600);
  const hs = await p.evaluate(() => document.querySelector('.rank-list tbody .sent') ? 'wysłano' : (document.querySelector('.rank-list [data-act=analyze]') ? 'przycisk' : 'brak tabeli'));
  if (hs !== 'wysłano') fail('historia: ' + hs); else ok('historia oznacza partię jako wysłaną');
  await p.screenshot({ path: `${OUT}/analiza-historia.png` });
}
if (errs.length) { fail('błędy na stronie'); console.error(errs.join('\n')); }
await b.close();
console.log(process.exitCode ? 'NIEZALICZONY' : 'OK: analiza');
