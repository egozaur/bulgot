// Pomocnicze: wysokości dzieci środkowej kolumny (.stage) w fazie oferty, żeby sprawdzić, czy całość mieści się bez przewijania.
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const wait = ms => new Promise(r => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-first-run'] });
const p = await b.newPage();
for (const [w, h] of [[1366, 768], [1920, 925], [1280, 720]]) {
  await p.setViewport({ width: w, height: h });
  await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bulgot:intro', '1'); }); await p.reload({ waitUntil: 'networkidle0' }); await wait(300);
  await p.click('[data-act=new]'); await wait(200); await p.click('[data-act=setnext]'); await wait(150); await p.click('[data-act=start]'); await wait(600);
  const r = await p.evaluate(() => { const s = document.querySelector('.stage'); const sc = getComputedStyle(s); return { sh: s.scrollHeight, ch: s.clientHeight, ov: sc.overflowY, kids: [...s.children].map(c => c.className.split(' ')[0] + ':' + Math.round(c.getBoundingClientRect().height)) }; });
  console.log(w + 'x' + h, JSON.stringify(r));
}
await b.close();
