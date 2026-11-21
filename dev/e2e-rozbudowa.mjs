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
await patchRun(`run.skills = [{ id: 'grad', lvl: 2 }, { id: 'chlust', lvl: 1 }, { id: 'lodowy', lvl: 1 }]; run.tiles = ['kukurydziany-grad', 'rosolowy-chlust', 'lodowy-dziob']; run.offer = ['kukurydziany-grad', 'zgnile-jajo', 'darcie-pierza', 'ziarno-mocy']; run.phase = 'offer'; run.round = 7; run.tiles.push('twardy-grzebien', 'twardy-grzebien', 'twardy-grzebien', 'pancerz-z-pierza'); run.hp = 130;`);
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

if (errs.length) fail('błędy strony:\n' + [...new Set(errs)].join('\n')); else ok('bez błędów w konsoli');
await b.close();
