// Bulgot: zrzut wszystkich ikon kafelków (kontrola wzrokowa) i sprawdzenie, że każdy kafelek ma ikonę (nie szare kółko zastępcze).
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-ikony.mjs [katalog na zrzuty]
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = process.argv[2] || '.';
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-first-run'] });
const p = await b.newPage();
await p.setViewport({ width: 1500, height: 1100 });
await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
const res = await p.evaluate(async () => {
  const D = await import('./shared/data.js'), art = await import('./art.js');
  const missing = [], cells = [];
  for (const t of D.TILES) {
    const svg = art.tileIcon(t.id);
    if (svg.includes('r="14"') && svg.includes('#ccc')) missing.push(t.id);
    cells.push(`<div style="width:92px;text-align:center;font:10px sans-serif;color:#eee">${svg.replace('class="ico"', 'style="width:64px;height:64px"')}<br>${t.name}</div>`);
  }
  document.body.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:6px;padding:10px;background:#231a12">${cells.join('')}</div>`;
  return { n: D.TILES.length, missing };
});
console.log(res.missing.length ? 'BŁĄD: brak ikon: ' + res.missing.join(', ') : `OK: wszystkie ${res.n} kafelków mają ikonę`);
if (res.missing.length) process.exitCode = 1;
await p.screenshot({ path: `${OUT}/ikony.png`, fullPage: true });
await b.close();
