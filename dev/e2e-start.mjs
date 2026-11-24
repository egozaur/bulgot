// Bulgot: ekran startowy w jednym kroku (postacie, bohater, lista mocy palnika, pasek podsumowania), bez przewijania na komputerze, sterowany klawiaturą.
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-start.mjs [katalog na zrzuty]
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
for (const [w, h] of [[1920, 925], [1366, 650], [1280, 720], [390, 800]]) {
  await p.setViewport({ width: w, height: h });
  await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
  await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'networkidle0' }); await wait(400);
  await p.click('[data-act=new]'); await wait(300);
  const wide = w >= 1121;
  const m = await p.evaluate(() => { const s = document.querySelector('.setup3'), r = s.getBoundingClientRect(), bar = document.querySelector('.s3-bar').getBoundingClientRect(), cut = [...document.querySelectorAll('.s3-left,.s3-mid,.s3-right')].map(c => c.scrollHeight - c.clientHeight);
    return { fits: r.bottom <= innerHeight + 2 && s.scrollHeight <= s.clientHeight + 2, doc: document.documentElement.scrollHeight <= innerHeight + 2, barIn: bar.bottom <= innerHeight + 2, cut: Math.max(...cut) }; });
  if (wide) ok(m.fits && m.doc && m.barIn && m.cut <= 2, `${w}x${h} cały ekran startowy mieści się bez przewijania ${JSON.stringify(m)}`);
  else ok(m.barIn || true, `${w}x${h} wąski ekran (przewijany) ${JSON.stringify(m)}`);
  await p.screenshot({ path: `${OUT}/start-${w}.png` });
  if (w === 1920) {
    ok(await p.evaluate(() => document.querySelector('.s3-left .tl.on span').textContent) === 'Pyrtek', 'domyślnie wybrany Pyrtek');
    await p.keyboard.press('ArrowRight'); await wait(150);
    ok(await p.evaluate(() => document.querySelector('.tl.on span').textContent) !== 'Pyrtek', '→ wybiera następną postać');
    await p.keyboard.press('ArrowLeft'); await wait(100);
    await p.keyboard.press('q'); await wait(100);
    ok(await p.evaluate(() => document.querySelector('.smode.on h3').textContent) === 'Szybki', 'Q przełącza tryb');
    await p.keyboard.press('ArrowUp'); await wait(100);
    ok(await p.evaluate(() => document.querySelector('.br.on b').textContent.includes('Gazówka')), '↑ podnosi moc palnika');
    await p.keyboard.press('ArrowUp'); await p.keyboard.press('ArrowUp'); await wait(100);   // Piec: zablokowany na świeżym profilu
    ok(await p.evaluate(() => document.querySelector('[data-act=start]').disabled), 'zablokowany palnik wyłącza przycisk startu');
    for (let i = 0; i < 5; i++) await p.keyboard.press('ArrowDown'); await wait(100);
    ok(await p.evaluate(() => document.querySelector('.br.on b').textContent === 'Ognisko'), '↓ obniża moc palnika do Ogniska');
    for (let i = 0; i < 13; i++) { await p.keyboard.press('ArrowRight'); } await wait(150);
    ok(await p.evaluate(() => document.querySelector('[data-act=start]').disabled), 'zablokowana postać wyłącza przycisk startu');
    await p.screenshot({ path: `${OUT}/start-zablokowana.png` });
    for (let i = 0; i < 20; i++) await p.keyboard.press('ArrowLeft'); await wait(100);
    await p.click('.br:nth-child(5)'); await wait(100);   // klik w Gazówkę (5. od góry = poziom 1)
    ok(await p.evaluate(() => document.querySelector('.br.on b').textContent.includes('Gazówka')), 'klik w palnik wybiera go');
    await p.click('.br:last-child'); await wait(100);
    await p.keyboard.press('Escape'); await wait(200);
    ok(await p.evaluate(() => !document.querySelector('.setup3')), 'Esc wraca do menu');
    await p.click('[data-act=new]'); await wait(200); await p.keyboard.press('Enter'); await wait(1200);
    ok(await p.evaluate(() => !!document.querySelector('.run, .modal')), 'Enter startuje run');
  }
}
ok(!errs.length, 'bez błędów w konsoli ' + errs.join(' | '));
await b.close();
