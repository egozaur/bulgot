// Wspólne: otwiera grę w trybie lokalnym i wstrzykuje migawkę runu (Pan Jajeczko, Pełny, palnik 5).
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import fs from 'node:fs';
export const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
export const wait = ms => new Promise(r => setTimeout(r, ms));
export const SNAP = JSON.parse(fs.readFileSync(new URL('./migawki.json', import.meta.url), 'utf8'));
export async function otworz(w = 1920, h = 925) {
  const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-first-run'] });
  const p = await b.newPage();
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.setViewport({ width: w, height: h });
  await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
  await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'networkidle0' }); await wait(400);
  await p.click('[data-act=new]'); await wait(200);
  await p.evaluate(() => document.querySelector('[data-act=setmode][data-v=full]') && document.querySelector('[data-act=setmode][data-v=full]').click());
  await p.click('[data-act=start]'); await wait(500); await p.click('[data-act=introgo]'); await wait(500);
  return { b, p };
}
export async function wstrzyknij(p, snap) {
  await p.evaluate(s => { const r = window.__bulgot.run; for (const k of Object.keys(r)) delete r[k]; Object.assign(r, s); window.__bulgot.render(); }, snap);
  await wait(500);
}
