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
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bulgot:intro', '1'); localStorage.setItem('bulgot:speed', '1'); });
await p.reload({ waitUntil: 'load' }); await wait(500);
await p.click('[data-act=new]'); await wait(200); await p.click('[data-act=start]'); await wait(500);
const go = await p.$('[data-act=introgo]'); if (go) { await go.click(); await wait(300); }
// piętro z trzema wrogami (Rój albo zwykłe)
const K = 'bulgot:local:player:run';
await p.evaluate(K => { const r = JSON.parse(localStorage.getItem(K)); r.round = 9; r.phase = 'offer'; r.hp = 400; r.tiles = Array(20).fill('twardy-grzebien'); r.skills = [{ id: 'grad', lvl: 1 }, { id: 'pianie', lvl: 2 }]; localStorage.setItem(K, JSON.stringify(r)); }, K);
await p.reload({ waitUntil: 'load' }); await wait(600);
const rs = await p.$('[data-act=resume]'); if (rs) { await rs.click(); await wait(400); }
await p.keyboard.press('1'); await wait(500);
await p.evaluate(() => { const c = document.querySelector('.modal [data-act=close]'); c && c.click(); });
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
check(!errs.length, 'bez błędów ' + errs.join(' | '));
await b.close();
console.log(bad ? 'NIEZALICZONY' : 'WSZYSTKO OK'); if (bad) process.exitCode = 1;
