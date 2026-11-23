// Bulgot: test e2e pełnoekranowej walki (2026-11-23): scena strefy, plakietki HP, kafelki umiejętności, animacje umiejętności bez błędów.
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-walka.mjs <katalog na zrzuty> [id,id,id ...]  (bez listy: scenariusze podstawowe)
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const out = process.argv[2] || '.';
const only = process.argv[3] ? process.argv[3].split(',') : null;
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-first-run'] });
const wait = ms => new Promise(r => setTimeout(r, ms));
const errs = [], fails = [];
const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails.push(m); };

// Otwiera run w trybie lokalnym z zadanymi umiejętnościami i wchodzi do walki na wskazanym piętrze.
async function toFight(w, h, { mode = 'quick', round = 3, skills, tiles = ['ziarno-mocy', 'twardy-grzebien', 'czujne-oko'], coins = 17 }) {
  const p = await b.newPage();
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.setViewport({ width: w, height: h });
  await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bulgot:intro', '1'); });
  await p.reload({ waitUntil: 'networkidle0' }); await wait(300);
  await p.click('[data-act=new]'); await wait(200);
  await p.evaluate(m => document.querySelector(`[data-act=setmode][data-v=${m}]`).click(), mode);
  await p.click('[data-act=setnext]'); await wait(150); await p.click('[data-act=start]'); await wait(500);
  await p.evaluate(rp => { const k = 'bulgot:local:player:run'; const r = JSON.parse(localStorage.getItem(k)); Object.assign(r, rp); localStorage.setItem(k, JSON.stringify(r)); },
    { round, coins, tiles, skills: skills.map(id => ({ id, lvl: 1 })), offer: ['czujne-oko', 'jajeczny-granat', 'hazard-w-kurniku', 'opaska-rambo'], phase: 'offer' });
  await p.reload({ waitUntil: 'networkidle0' }); await wait(300); await p.click('[data-act=resume]'); await wait(400);
  await p.keyboard.press('4'); await wait(500);
  await p.click('[data-act=tofight]'); await wait(900);
  return p;
}
const snap = (p, n) => p.screenshot({ path: `${out}/${n}.png` });
const state = p => p.evaluate(() => { const F = window.__bulgot.fight; return F && { over: F.f.over, tick: F.f.tick, hp: F.f.hp, n: F.units.size }; });

if (!only) {
  // 1. układ: trzy strefy i boss, w typowych rozmiarach okna
  for (const [name, o, w, h] of [['z0-kurnik', { round: 3, skills: ['grad', 'lodowy', 'chlust'] }, 1920, 1080], ['z1-magazyn', { mode: 'full', round: 8, skills: ['zgnile', 'darcie', 'pogotowie'] }, 1920, 1080],
    ['z2-boss-prezes', { mode: 'full', round: 20, skills: ['fala', 'zamrazarka', 'zupa'] }, 1920, 1080], ['boss-brojler', { mode: 'full', round: 6, skills: ['grad', 'lodowy', 'pogotowie'] }, 1920, 1080],
    ['maly-1366', { round: 3, skills: ['grad', 'lodowy', 'chlust'] }, 1366, 650], ['telefon', { round: 3, skills: ['grad', 'lodowy', 'chlust'] }, 390, 800]]) {
    const p = await toFight(w, h, o);
    ok(await p.evaluate(() => !!document.querySelector('#fightlayer #arena') && document.querySelectorAll('#fightlayer .sk[data-act=useskill]').length === 3), `${name}: pełny ekran, 3 kafelki umiejętności`);
    ok(await p.evaluate(() => { const a = document.querySelector('#arena').getBoundingClientRect(); return Math.abs(a.width - innerWidth) < 2 && Math.abs(a.height - innerHeight) < 2; }), `${name}: scena wypełnia całe okno`);
    ok(await p.evaluate(() => [...document.querySelectorAll('#fightlayer .unit .plate .hpbar b')].every(x => /\d+ \/ \d+/.test(x.textContent))), `${name}: paski HP mają liczbę w środku`);
    ok(await p.evaluate(() => { const r = document.querySelector('#skillbar').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; }), `${name}: kafelki mieszczą się w oknie`);
    await wait(700); await snap(p, name);
    await p.close();
  }
  // 2. skille: odpal wszystkie trzy, zrób zrzuty w trakcie animacji
  const p = await toFight(1920, 1080, { mode: 'full', round: 8, skills: ['lodowy', 'chlust', 'grad'] });
  await wait(900); await p.keyboard.press('1'); await wait(330); await snap(p, 'fx-lodowy-w-locie'); await wait(300); await snap(p, 'fx-lodowy-trafienie');
  await p.keyboard.press('2'); await wait(900); await snap(p, 'fx-chlust');
  await p.keyboard.press('3'); await wait(420); await snap(p, 'fx-grad');
  ok(await p.evaluate(() => { const b = document.querySelector('#sk0 .sst'); return !!b && /ODNAWIA/.test(b.textContent); }), 'kafelek po użyciu pokazuje ODNAWIA + sekundy');
  ok(await p.evaluate(() => { const v = document.querySelector('#sk0 .gauge .val'); return !!v && getComputedStyle(v).strokeDashoffset !== '0px'; }), 'pierścień cooldownu się opróżnia');
  await p.close();
} else {
  // 3. wskazane umiejętności po trzy: sprawdza, że animacje nie sypią błędami
  for (let i = 0; i < only.length; i += 3) {
    const set = only.slice(i, i + 3); if (set.length < 1) break;
    const p = await toFight(1600, 900, { round: 3, skills: set });
    for (let k = 0; k < 4; k++) { for (let s = 0; s < set.length; s++) { await p.keyboard.press(String(s + 1)); await wait(260); } await wait(500); if (k === 1) await snap(p, 'skile-' + set.join('-')); const st = await state(p); if (!st || st.over) break; }
    console.log('skille ' + set.join(', ') + ': ok (błędów dotąd ' + errs.length + ')');
    await p.close();
  }
}
console.log(errs.length ? 'BŁĘDY STRONY:\n' + [...new Set(errs)].join('\n') : 'brak błędów w konsoli');
console.log(fails.length ? 'NIEPOWODZENIA: ' + fails.length : 'WSZYSTKO OK');
await b.close();
if (fails.length || errs.length) process.exitCode = 1;
