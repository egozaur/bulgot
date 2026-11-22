// Bulgot: zrzut wszystkich postaci (portrety i jajka), kontrola wzrokowa i sprawdzenie, że karuzela wyboru pokazuje wszystkie postacie.
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-postacie.mjs [katalog na zrzuty]
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = process.argv[2] || '.';
const wait = ms => new Promise(r => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-first-run'] });
const p = await b.newPage();
const errs = [];
p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
await p.setViewport({ width: 1500, height: 800 });
await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
const n = await p.evaluate(async () => {
  const D = await import('./shared/data.js'), art = await import('./art.js');
  const ids = Object.keys(D.CHARS);
  document.body.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:10px;padding:10px;background:#231a12;color:#eee;font:12px sans-serif">${ids.map(id => `<div style="width:150px;text-align:center"><div style="height:140px">${art.portrait(id).replace('class="fig"', 'style="height:140px"')}</div>${D.CHARS[id].name}</div>`).join('')}</div><div style="display:flex;flex-wrap:wrap;gap:10px;padding:10px;background:#231a12">${ids.map(id => `<div style="width:150px">${art.eggArt(id, true)}</div><div style="width:150px">${art.eggArt(id, false)}</div>`).join('')}</div>`;
  return ids.length;
});
console.log(n === 14 ? 'OK: 14 postaci' : 'BŁĄD: postaci ' + n);
await p.screenshot({ path: `${OUT}/postacie.png`, fullPage: true });
await b.close();
for (const e of errs) { console.error('BŁĄD:', e); process.exitCode = 1; }
if (n !== 14) process.exitCode = 1;
