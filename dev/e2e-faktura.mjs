// Bulgot: test faktury po walce (zamiast okna wyniku), pełnoekranowego ekranu końca z ciekawostkami, rankingu z filtrami
// i ukrytej postaci Zjarany Kurczak (jajko „???”, odblokowanie po zdobyciu łącznie 425 Ziaren w jednym runie).
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-faktura.mjs [katalog na zrzuty]
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = process.argv[2] || '.';
const wait = ms => new Promise(r => setTimeout(r, ms));
const fail = msg => { console.error('BŁĄD:', msg); process.exitCode = 1; };
const ok = (c, msg) => c ? console.log('OK:', msg) : fail(msg);
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-first-run'] });
const p = await b.newPage();
const errs = [];
p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
await p.setViewport({ width: 1920, height: 925 });
const URL0 = 'http://localhost:8090/bulgot/?local=1';
await p.goto(URL0, { waitUntil: 'networkidle0' });
await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'networkidle0' }); await wait(400);
const R = () => p.evaluate(() => { const r = window.__bulgot.run; return r && { phase: r.phase, round: r.round, coins: r.coins, hp: r.hp, ended: r.ended, char: r.char, stats: r.stats }; });
const patch = fn => p.evaluate(src => { const k = 'bulgot:local:player:run'; const r = JSON.parse(localStorage.getItem(k)); (new Function('r', src))(r); localStorage.setItem(k, JSON.stringify(r)); }, fn);
const patchProfile = fn => p.evaluate(src => { const k = 'bulgot:local:player:profile'; const r = JSON.parse(localStorage.getItem(k)); (new Function('r', src))(r); localStorage.setItem(k, JSON.stringify(r)); }, fn);
const reload = async () => { await p.reload({ waitUntil: 'networkidle0' }); await wait(300); const c = await p.$('[data-act=resume]'); if (c) { await c.click(); await wait(300); } };
const fastFight = async () => { await p.click('[data-act=tofight]'); await wait(700); await p.evaluate(() => { const F = window.__bulgot.fight; if (F) F.speed = 3; }); };
const waitFor = async (sel, n = 200) => { for (let i = 0; i < n; i++) { if (await p.$(sel)) return true; await wait(150); } return false; };
const STRONG = "r.tiles = Array(14).fill('ziarno-mocy').concat(Array(10).fill('twardy-grzebien')); r.hp = 999; r.skills = [{id:'granat',lvl:2}];";

// ---- start runu (tryb szybki)
await p.click('[data-act=new]'); await wait(200);
await p.evaluate(() => document.querySelector('[data-act=setmode][data-v=quick]').click());
await p.click('[data-act=start]'); await wait(500); await p.click('[data-act=introgo]'); await wait(400);
await p.keyboard.press('1'); await wait(500);

// ---- 1. faktura po wygranej walce
await patch(STRONG + " r.round = 2; r.phase = 'fight'; r.fight = {};"); await reload();
await fastFight();
ok(await waitFor('#invoice .inv'), 'po wygranej walce pojawia się faktura');
await wait(1800);
const inv = await p.evaluate(() => {
  const el = document.querySelector('#invoice .inv'), r = el.getBoundingClientRect(), t = document.querySelector('.tower').getBoundingClientRect(), s = document.querySelector('.side').getBoundingClientRect();
  return { title: document.querySelector('.inv-title b').textContent, rows: document.querySelectorAll('.inv-row').length, overlayHidden: document.querySelector('#overlay').hidden, top: Math.round(r.top), left: Math.round(r.left), right: Math.round(r.right), bottom: Math.round(r.bottom), towerRight: Math.round(t.right), sideLeft: Math.round(s.left), vw: innerWidth,
    stamp: !!document.querySelector('.inv-stamp'), text: el.textContent.slice(0, 200), pe: getComputedStyle(el).pointerEvents };
});
console.log('faktura:', JSON.stringify(inv));
ok(inv.title === 'FAKTURA VAT' && inv.rows >= 4 && inv.stamp, 'faktura ma tytuł, pozycje i pieczątkę');
ok(inv.overlayHidden, 'nie ma okna wyniku (overlay ukryty)');
ok(inv.left >= inv.towerRight - 4 && inv.right <= inv.sideLeft + 4, `faktura leży nad środkową kolumną, nie zasłania schodów (${inv.left}..${inv.right} przy wieży do ${inv.towerRight}, panelu od ${inv.sideLeft})`);
ok((await R()).phase === 'offer' || (await R()).phase === 'badge' || (await R()).phase === 'bonus', 'gra idzie dalej od razu (faza: ' + (await R()).phase + ')');
await p.screenshot({ path: OUT + '/faktura-spada.png' });
// młotek przybija fakturę gwoździem, potem faktura ląduje jako karteczka na Tablicy Zarządu
ok(await p.evaluate(() => !!document.querySelector('#invoice .inv-hammer') && !!document.querySelector('#invoice .inv-nail')), 'jest młotek i gwóźdź');
let gone = false; for (let i = 0; i < 80 && !gone; i++) { await wait(150); gone = await p.evaluate(() => !document.querySelector('#invoice .inv')); }
ok(gone, 'faktura po animacji znika z ekranu (leci na tablicę)');
const bd = await p.evaluate(() => { const s = document.querySelector('.board .slip[data-f="2"]'); const b = document.querySelector('.board').getBoundingClientRect(), r = s && s.getBoundingClientRect(); return { slips: document.querySelectorAll('.board .slip').length, pending: !!(s && s.classList.contains('pending')), vis: !!(s && getComputedStyle(s).visibility !== 'hidden'), inBoard: !!(r && r.top >= b.top - 14 && r.bottom <= b.bottom + 14 && r.left >= b.left && r.right <= b.right), boardBottom: Math.round(b.bottom), vh: innerHeight }; });
console.log('tablica:', JSON.stringify(bd));
ok(bd.slips === 1 && !bd.pending && bd.vis && bd.inBoard && bd.boardBottom <= bd.vh, 'karteczka wisi na Tablicy Zarządu i jest widoczna');
await p.screenshot({ path: OUT + '/tablica.png' });
await p.click('.board .slip[data-f="2"]'); await wait(400);
ok(await p.evaluate(() => !!document.querySelector('.modal .inv.static') && /FAKTURA VAT/.test(document.querySelector('.modal .inv-title').textContent)), 'klik w karteczkę otwiera fakturę');
await p.screenshot({ path: OUT + '/faktura-z-tablicy.png' });
await p.click('.modal [data-act=close]'); await wait(300);
await reload();
ok(await p.evaluate(() => document.querySelectorAll('.board .slip').length === 1), 'po odświeżeniu strony karteczka nadal wisi na tablicy');
// klik w kafelek przechodzi przez fakturę i chowa ją
const ph = (await R()).phase;
if (ph === 'offer') { await p.click('.cards [data-i="0"]'); await wait(900); ok(!(await p.$('#invoice .inv:not(.quick):not(.out)')), 'pierwsza akcja gracza chowa fakturę'); }
// ---- kurczak widoczny na schodach (nic go nie zasłania) w trakcie animacji
const cab = await p.evaluate(() => { const c = document.querySelector('.cab').getBoundingClientRect(); const e = document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2); return { onTop: !!(e && (e.closest('.cab') || e.closest('.climb'))) }; });
ok(cab.onTop, 'nad kurczakiem nie ma okna ani faktury');

// ---- 2. faktura wyłączona w ustawieniach
await p.evaluate(() => localStorage.setItem('bulgot:invoice', '0'));
await patch(STRONG + " r.phase = 'fight'; r.fight = {}; r.round = 3;"); await reload();
await fastFight(); await wait(2500);
let none = await waitFor('.toast', 120);
ok(none && !(await p.$('#invoice .inv')), 'z wyłączoną fakturą jest tylko krótki toast');
await p.evaluate(() => localStorage.removeItem('bulgot:invoice'));

// ---- 3. porażka: pełny ekran, ciekawostki
await patch("r.phase = 'fight'; r.fight = {}; r.round = 2; r.hp = 1; r.tiles = ['ziarno-mocy','twardy-grzebien','szybki-dziob','ostry-dziob']; r.skills = [];"); await reload();
await fastFight();
ok(await waitFor('.modal.endfull', 300), 'ekran końca działa na pełnym ekranie');
await wait(1800);
const end = await p.evaluate(() => { const m = document.querySelector('.modal.endfull').getBoundingClientRect(); return { w: Math.round(m.width), h: Math.round(m.height), vw: innerWidth, vh: innerHeight, full: document.querySelector('#overlay').classList.contains('full'), facts: [...document.querySelectorAll('.fact')].map(f => f.textContent), title: document.querySelector('.end-title').textContent }; });
console.log('koniec:', JSON.stringify(end));
ok(Math.abs(end.w - end.vw) <= 2 && Math.abs(end.h - end.vh) <= 2 && end.full, `ekran końca wypełnia okno (${end.w}×${end.h} z ${end.vw}×${end.vh})`);
ok(end.facts.length >= 1 && /małp|piętr|walk|Zabrakło|umiejętn/i.test(end.facts.join(' ')), 'ciekawostki przy odpadaniu: ' + end.facts.map(f => f.replace(/^Ciekawostka|^I jeszcze/, '')).join(' | '));
await p.screenshot({ path: OUT + '/koniec-pelny.png' });
for (const [w, h] of [[1920, 1080], [1366, 650], [1280, 720]]) {
  await p.setViewport({ width: w, height: h }); await wait(400);
  const fit = await p.evaluate(() => { const q = s => { const e = document.querySelector(s); return e && e.getBoundingClientRect(); }; const a = q('.end-actions'), f = q('.fact'), t = q('.end-title'); return { actionsBottom: a && Math.round(a.bottom), factBottom: f && Math.round(f.bottom), titleBottom: t && Math.round(t.bottom), vh: innerHeight, scrollY: document.querySelector('.modal.endfull').scrollTop, will: document.querySelectorAll('.will-grid .tile').length }; });
  console.log('koniec ' + w + 'x' + h + ':', JSON.stringify(fit));
  ok(fit.actionsBottom <= fit.vh && fit.factBottom <= fit.vh && fit.titleBottom <= fit.vh, 'ekran końca mieści się w oknie ' + w + 'x' + h + ' (przyciski, ciekawostki i tytuł widoczne, Testament: ' + fit.will + ' kafelki)');
  await p.screenshot({ path: OUT + '/koniec-' + w + 'x' + h + '.png' });
}
await p.setViewport({ width: 1920, height: 925 }); await wait(300);

// ---- 4. ranking z filtrami
await p.click('.modal [data-act=ranking]'); await wait(700);
ok(await p.evaluate(() => !!document.querySelector('#rk-char') && !!document.querySelector('#rk-garnek') && !!document.querySelector('#rk-nick')), 'ranking ma filtry: postać, Garnek, gracz');
const rk0 = await p.evaluate(() => document.querySelectorAll('.rank-list tbody tr').length);
console.log('wpisy w rankingu ogólnym:', rk0);
await p.select('#rk-char', 'kwoka'); await wait(600);
ok(await p.evaluate(() => /Brak wyników/.test(document.querySelector('#rk').textContent)), 'filtr po postaci bez wyników pokazuje komunikat');
await p.select('#rk-char', 'pyrtek'); await wait(600);
const rk1 = await p.evaluate(() => ({ rows: document.querySelectorAll('.rank-list tbody tr').length, info: document.querySelector('.rkinfo') && document.querySelector('.rkinfo').textContent }));
ok(rk1.rows === rk0 && /Pyrtek/.test(rk1.info), 'filtr po postaci Pyrtek: ' + rk1.info);
await p.click('[data-act=rkme]'); await wait(600);
ok(await p.evaluate(() => document.querySelector('#rk-nick').value === 'Lokalny' && document.querySelectorAll('.rank-list tbody tr').length >= 1), 'przycisk „Tylko ja” filtruje po graczu');
await p.click('[data-act=rkclear]'); await wait(500);
await p.screenshot({ path: OUT + '/ranking-filtry.png' });
await p.click('.modal-x'); await wait(300);

// ---- 5. ukryta postać: jajko „???” bez nazwy i warunku
await p.evaluate(() => { const c = document.querySelector('[data-act=again]'); c && c.click(); }); await wait(300);
if (!(await p.$('[data-act=setchar]'))) { await p.evaluate(() => { const c = document.querySelector('[data-act=home]'); c && c.click(); }); await wait(300); await p.click('[data-act=new]'); await wait(300); }
const sec = await p.evaluate(() => { const o = document.querySelector('[data-v=zjarany]'); return o ? { text: o.textContent, locked: o.classList.contains('locked') } : null; });
ok(sec && sec.locked && /\?\?\?/.test(sec.text) && !/Zjarany|425|Ziaren/.test(sec.text), 'zablokowana postać to jajko „???”, bez nazwy i warunku: ' + (sec && sec.text.slice(0, 90)));
ok(!(await p.evaluate(() => document.documentElement.innerHTML.includes('Zjarany'))), 'w kodzie strony nie ma nazwy ukrytej postaci');
await p.screenshot({ path: OUT + '/jajko-sekret.png' });

// ---- 6. odblokowanie po zdobyciu łącznie 425 Ziaren w jednym runie
await p.click('[data-act=start]'); await wait(600); const intro = await p.$('[data-act=introgo]'); if (intro) { await intro.click(); await wait(300); }
await p.keyboard.press('1'); await wait(500);
await patch(STRONG + " r.round = 2; r.phase = 'fight'; r.fight = {}; r.stats.earned = 424;"); await reload();
await fastFight();
ok(await waitFor('#invoice .inv'), 'faktura po walce z 424 zdobytymi Ziarnami');
const un = await p.evaluate(() => document.querySelector('#invoice .inv').textContent);
ok(/Odblokowano postać: Zjarany Kurczak/.test(un), 'faktura ogłasza odblokowanie postaci: ' + (un.match(/Odblokowano[^.]*\./) || [''])[0]);
await p.screenshot({ path: OUT + '/faktura-odblokowanie.png' });
const prof = await p.evaluate(() => window.__bulgot.profile.chars);
ok(prof.includes('zjarany'), 'postać dodana do profilu');

// ---- 7. Zjarany Kurczak w walce: Chmura Dymu
await p.evaluate(() => { document.querySelector('#invoice').innerHTML = ''; });
await patch("r.phase = 'abandon'"); // tylko żeby wymusić odświeżenie; run zostanie porzucony poniżej
await p.evaluate(async () => { const m = await import('/bulgot/api.js'); await m.call('abandon', {}); });
await p.reload({ waitUntil: 'networkidle0' }); await wait(400);
await p.click('[data-act=new]'); await wait(300);
await p.evaluate(() => document.querySelector('[data-act=setchar][data-v=zjarany]').click()); await wait(200);
await p.screenshot({ path: OUT + '/jajko-odblokowane.png' });
await p.click('[data-act=start]'); await wait(600); const intro2 = await p.$('[data-act=introgo]'); if (intro2) { await intro2.click(); await wait(300); }
await p.keyboard.press('1'); await wait(500);
await p.click('[data-act=tofight]'); await wait(300);
let smoke = false;
for (let i = 0; i < 60 && !smoke; i++) { await wait(150); smoke = await p.evaluate(() => [...document.querySelectorAll('.dmg')].some(x => /Chmura Dymu/.test(x.textContent))); }
ok(smoke, 'w walce pojawia się napis „Chmura Dymu” (co 4,2 s)');
await p.screenshot({ path: OUT + '/walka-zjarany.png' });

if (errs.length) { errs.forEach(e => console.error(e)); process.exitCode = 1; } else console.log('OK: bez błędów w konsoli');
await b.close();
