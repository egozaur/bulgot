import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new' });
const p = await b.newPage(); await p.setViewport({ width: 1500, height: 900 });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file:///C:/Users/Kurczak/pl3y/bulgot/propozycje-bossy/podglad.html', { waitUntil: 'networkidle0' });
for (const id of ['g1', 'g2']) { const el = await p.$('#' + id); await el.screenshot({ path: `C:/Users/Kurczak/pl3y/bulgot/propozycje-bossy/${id}.png` }); }
console.log('błędy:', errs); await b.close();
