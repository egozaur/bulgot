// Bulgot: test e2e w Edge (puppeteer-core z folderu tools/pt). Wymaga serwera plików na porcie 8090 (patrz CLAUDE.md). Uruchom z folderu tools/pt: node <ścieżka do tego pliku> [katalog na zrzuty]
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-first-run'] });
const wait = ms => new Promise(r => setTimeout(r, ms));
const errs = [], fails = [];
const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails.push(m); };
const p = await b.newPage();
p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
await p.setViewport({ width: 1440, height: 900 });
await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bulgot:intro', '1'); });
await p.reload({ waitUntil: 'networkidle0' }); await wait(300);
const R = () => p.evaluate(() => { const r = window.__bulgot.run; return r && { phase: r.phase, round: r.round, coins: r.coins, tiles: r.tiles, skills: r.skills, offer: r.offer, pending: r.pending, hp: r.hp, maxHp: r.maxHp, ended: r.ended }; });
const patch = fn => p.evaluate(fnSrc => { const k = 'bulgot:local:player:run'; const r = JSON.parse(localStorage.getItem(k)); (new Function('r', fnSrc))(r); localStorage.setItem(k, JSON.stringify(r)); }, fn);
const reload = async () => { await p.reload({ waitUntil: 'networkidle0' }); await wait(300); await p.click('[data-act=resume]'); await wait(300); };

await p.click('[data-act=new]'); await wait(200);
await p.evaluate(() => document.querySelector('[data-act=setmode][data-v=full]').click());
await p.click('[data-act=start]'); await wait(500);
ok((await R()).phase === 'offer', 'start runu');

// --- sklepik
await patch("r.coins = 30; r.offer = ['sklepik-babci-kwoki','ziarno-mocy','szybki-dziob','pancerz-z-pierza'];"); await reload();
await p.click('.cards [data-i="0"]'); await wait(500);
let s = await R(); ok(s.phase === 'event' && s.pending.kind === 'shop', 'sklepik otwarty');
const before = s.coins; await p.click('.cards [data-act=buy][data-i="0"]'); await wait(500);
s = await R(); ok(s.phase === 'fight' && s.coins < before && s.tiles.length === 1, 'zakup w sklepiku: ' + before + ' -> ' + s.coins + ', kafelki ' + s.tiles.join(','));

// --- wznowienie po odświeżeniu w fazie walki
await p.reload({ waitUntil: 'networkidle0' }); await wait(300);
ok(await p.evaluate(() => !!document.querySelector('[data-act=resume]')), 'po odświeżeniu jest „Kontynuuj”');
await p.click('[data-act=resume]'); await wait(300);
ok(await p.evaluate(() => !!document.querySelector('[data-act=tofight]')), 'wznowienie w fazie walki pokazuje „Do walki!”');

// --- hazard
await patch("r.phase = 'offer'; r.fight = null; r.coins = 20; r.offer = ['hazard-w-kurniku','ziarno-mocy','szybki-dziob','pancerz-z-pierza'];"); await reload();
await p.click('.cards [data-i="0"]'); await wait(500);
s = await R(); ok(s.phase === 'event' && s.pending.kind === 'gamble', 'hazard otwarty');
await p.evaluate(() => document.querySelector('[data-act=bet][data-v="5"]').click()); await wait(600);
const c2 = (await R()).coins; ok(c2 === 25 || c2 === 15, 'stawka 5 Ziaren rozstrzygnięta (' + c2 + ')');

// --- pełne sloty umiejętności → modal wyboru
await patch("r.phase = 'offer'; r.fight = null; r.skills = [{id:'grad',lvl:1},{id:'pianie',lvl:1},{id:'granat',lvl:1}]; r.offer = ['dziobniecie-szalu','ziarno-mocy','szybki-dziob','pancerz-z-pierza'];"); await reload();
await p.click('.cards [data-i="0"]'); await wait(400);
ok(await p.evaluate(() => !!document.querySelector('[data-act=slotchoose]')), 'pełne sloty: pojawia się wybór slotu');
await p.click('[data-act=slotchoose][data-v="1"]'); await wait(500);
s = await R(); ok(s.skills[1].id === 'dziobniecie' && s.phase === 'fight', 'slot 2 zastąpiony: ' + s.skills.map(x => x.id).join(','));

// --- awans umiejętności na poziom 2
await patch("r.phase = 'offer'; r.fight = null; r.offer = ['kukurydziany-grad','ziarno-mocy','szybki-dziob','pancerz-z-pierza'];"); await reload();
await p.click('.cards [data-i="0"]'); await wait(500);
s = await R(); ok(s.skills[0].lvl === 2 && s.phase === 'fight', 'ta sama umiejętność = poziom 2');

// --- nagroda po bossie (runda 6, mocny bohater), wybór kafelka bonusowego
await patch("r.phase='fight'; r.fight={}; r.round=6; r.tiles=Array(12).fill('ziarno-mocy').concat(Array(10).fill('twardy-grzebien')); r.hp=999; r.skills=[{id:'granat',lvl:2}];"); await reload();
await p.click('[data-act=tofight]'); await wait(800);
await p.evaluate(() => { const sp = document.querySelector('[data-act=speed]'); sp.click(); sp.click(); });
for (let i = 0; i < 100; i++) { await wait(400); if (await p.$('.inv, .modal')) break; }
ok(await p.evaluate(() => /NOTA OBCIĄŻENIOWA/.test(document.querySelector('.inv-title').textContent)), 'faktura po bossie (nota obciążeniowa)');
await p.evaluate(() => { document.querySelector('#invoice').innerHTML = ''; }); await wait(400);
s = await R(); ok(s.phase === 'badge' && s.pending && s.pending.offer.length === 3, 'po bossie: wybór Odznaki (3)');
await p.keyboard.press('1'); await wait(500);
s = await R(); ok(s.phase === 'bonus' && s.offer.length === 3, 'faza bonusowa z 3 kafelkami');
await p.keyboard.press('1'); await wait(500);
s = await R(); ok(s.phase === 'offer' && s.round === 7, 'po bonusie runda 7 (jest ' + s.round + ')');

// --- porzucenie runu
await p.click('[data-act=menu]'); await wait(200); await p.click('.modal [data-act=abandon]'); await wait(300);
await p.click('[data-act=abandon-yes]'); await wait(600);
s = await R(); ok(s.phase === 'over' && s.ended === 'lose', 'porzucony run kończy się porażką');
ok(await p.evaluate(() => /ROSÓŁ/.test(document.querySelector('.modal h2').textContent)), 'ekran końcowy po porzuceniu');
await p.click('[data-act=home]'); await wait(300);
ok(await p.evaluate(() => !!document.querySelector('[data-act=new]')), 'po runie można zacząć nowy');
console.log(errs.length ? 'BŁĘDY STRONY:\n' + [...new Set(errs)].join('\n') : 'brak błędów w konsoli');
console.log(fails.length ? 'NIEPOWODZENIA: ' + fails.length : 'WSZYSTKO OK');
await b.close();
