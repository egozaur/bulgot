// Bulgot: efekty wizualne walki (aury statusów, mini-wybuchy Reakcji, zamrożenie klatki). Robi zrzuty do oceny wyglądu.
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-efekty.mjs [katalog na zrzuty]
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
await p.reload({ waitUntil: 'load' }); await wait(500);
await p.click('[data-act=new]'); await wait(200); await p.click('[data-act=start]'); await wait(500);
const go = await p.$('[data-act=introgo]'); if (go) { await go.click(); await wait(300); }
// piętro z trzema wrogami (Rój albo zwykłe)
const K = 'bulgot:local:player:run';
await p.evaluate(K => { const r = JSON.parse(localStorage.getItem(K)); r.round = 9; r.phase = 'offer'; r.offer = ['ziarno-mocy', 'zezowate-oko', 'szybki-dziob', 'czujne-oko']; r.flawAt = -1; r.hp = 400; r.tiles = Array(20).fill('twardy-grzebien'); r.skills = [{ id: 'grad', lvl: 1 }, { id: 'pianie', lvl: 2 }]; localStorage.setItem(K, JSON.stringify(r)); }, K);
await p.reload({ waitUntil: 'load' }); await wait(600);
const rs = await p.$('[data-act=resume]'); if (rs) { await rs.click(); await wait(400); }
await p.keyboard.press('1'); await wait(500);
await p.evaluate(() => { const c = document.querySelector('.modal [data-act=close]'); c && c.click(); document.querySelector('#invoice').innerHTML = ''; });
await p.click('[data-act=tofight]'); await wait(1500);
// statusy na wrogach
await p.evaluate(() => { const F = window.__bulgot.fight, t = F.f.tick + 300, E = F.f.enemies; const set = (e, k, n) => { if (e) { e[k] = n; e[k + 'T'] = t; } }; set(E[0], 'burn', 3); set(E[0], 'bleed', 2); set(E[1] || E[0], 'frost', 2); set(E[2] || E[0], 'poison', 3); });
await wait(400); await p.keyboard.press('p'); await wait(200);
const au = await p.evaluate(() => [...document.querySelectorAll('.aura')].map(a => a.className));
check(au.length >= 1 && au.some(c => /au-burn/.test(c)), 'aury statusów na wrogach: ' + JSON.stringify(au));
await p.screenshot({ path: `${OUT}/efekty-statusy.png` });
await p.keyboard.press('p'); await wait(100);
// Reakcje: wstrzykujemy zdarzenia po następnym kroku silnika
for (const kind of ['szok', 'goraczka', 'kruchosc']) {
  await p.evaluate(kind => { const F = window.__bulgot.fight, f = F.f, orig = f.step.bind(f), e = f.enemies.find(x => !x.dead);
    f.step = ins => { orig(ins); f.ev.push({ k: 'react', r: kind, uid: e.uid }); f.step = orig; }; }, kind);
  await wait(260);
  const n = await p.evaluate(kind => document.querySelectorAll('.rburst.rb-' + kind).length, kind);
  check(n >= 1, 'mini-wybuch ' + kind);
  await p.screenshot({ path: `${OUT}/efekty-${kind}.png` });
  await wait(700);
}
// zamrożenie klatki nie zmienia ticku walki w trakcie
const t1 = await p.evaluate(() => { const F = window.__bulgot.fight; F.stopUntil = performance.now() + 400; return F.f.tick; });
await wait(250);
const t2 = await p.evaluate(() => window.__bulgot.fight.f.tick);
check(t2 === t1, 'zamrożenie klatki wstrzymuje zegar walki (tick ' + t1 + ' → ' + t2 + ')');
await wait(300);
// Furia: alarm fabryczny
await p.evaluate(() => { const f = window.__bulgot.fight.f, orig = f.step.bind(f); f.step = ins => { orig(ins); f.ev.push({ k: 'fury' }); f.step = orig; }; });
await wait(500);
check(await p.evaluate(() => !!document.querySelector('.arena.furious .beacons')), 'Furia: światła alarmowe');
await p.screenshot({ path: `${OUT}/efekty-furia.png` });
// wejście bossa: piętro 6 (Brojler)
await p.evaluate(() => { const F = window.__bulgot.fight; F.f.over = true; });
await wait(1500);
await p.evaluate(K => { const r = JSON.parse(localStorage.getItem(K)); r.round = 6; r.seed = 1001; r.phase = 'fight'; r.fight = null; r.hp = 400; localStorage.setItem(K, JSON.stringify(r)); }, K);
await p.reload({ waitUntil: 'load' }); await wait(600);
const rs2 = await p.$('[data-act=resume]'); if (rs2) { await rs2.click(); await wait(400); }
await p.evaluate(() => { const c = document.querySelector('.modal [data-act=close]'); c && c.click(); document.querySelector('#invoice').innerHTML = ''; });
const tf = await p.$('[data-act=tofight]'); if (tf) { await tf.click(); await wait(900); }
const cine = await p.evaluate(() => ({ on: !!document.querySelector('.cine'), txt: document.querySelector('.cine')?.innerText || '', tick: window.__bulgot.fight && window.__bulgot.fight.f.tick }));
check(cine.on && /Brojler/.test(cine.txt), 'wejście bossa: plansza z imieniem');
check(cine.tick === 0, 'w trakcie wejścia bossa zegar walki stoi (tick ' + cine.tick + ')');
await p.screenshot({ path: `${OUT}/efekty-boss.png` });
check(!errs.length, 'bez błędów ' + errs.join(' | '));
await b.close();
console.log(bad ? 'NIEZALICZONY' : 'WSZYSTKO OK'); if (bad) process.exitCode = 1;
