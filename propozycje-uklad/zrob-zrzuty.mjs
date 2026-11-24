// Zrzuty 10 propozycji układu (Pan Jajeczko, tryb Pełny, palnik 5, piętro 20). Użycie:
//   cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\propozycje-uklad\zrob-zrzuty.mjs [numery, np. 1,2,3] [szer wys]
import { otworz, wstrzyknij, SNAP, wait } from './baza.mjs';
const OUT = 'C:/Users/Kurczak/pl3y/bulgot/propozycje-uklad/zrzuty';
const which = (process.argv[2] || '1,2,3,4,5,6,7,8,9,10').split(',').map(Number);
const W = +(process.argv[3] || 1920), H = +(process.argv[4] || 925);
const SLUG = { 1: 'minimum', 2: 'kompakt', 3: 'zakladki', 4: 'szeroki-panel', 5: 'pasek-ekwipunku', 6: 'pasek-statystyk', 7: 'plecak', 8: 'kokpit', 9: 'hybryda', 10: 'pas-hud', 11: '9a-kokpit-ordery', 12: '9b-kokpit-pierscien-tarcze', 13: '9c-karta-pozioma', 14: '9d-kokpit-z-zestawami', 15: 'c1-klasyk', 16: 'c2-karta-kolekcjonerska', 17: 'c3-kokpit-pionowy', 18: 'd1-ikony-po-bokach', 19: 'd2-orbita', 20: 'd3-rzad-pod-imieniem', 21: 'd4-ikona-i-liczba', 22: 'd5-luki-wokol-portretu' };
const { b, p } = await otworz(W, H);
await p.addStyleTag({ url: '/bulgot/propozycje-uklad/wspolne.css' });
const snap = { ...SNAP[20], companion: { id: 'pisklak', lvl: 2 } };
for (const n of which) {
  await wstrzyknij(p, snap);
  await p.evaluate(async n => { document.querySelectorAll('.bag').forEach(e => e.remove()); const i = document.querySelector('#invoice'); if (i) i.innerHTML = ''; const m = await import('/bulgot/propozycje-uklad/wspolne.js'); await m.apply(n); window.dispatchEvent(new Event('resize')); }, n);
  await wait(700);
  const m = await p.evaluate(() => { const s = document.querySelector('.side'), g = document.querySelector('.stage'); return { side: [s.scrollHeight, s.clientHeight], stage: [g.scrollHeight, g.clientHeight] }; });
  console.log(n, SLUG[n], JSON.stringify(m), m.side[0] > m.side[1] + 2 ? 'BOK SIĘ PRZEWIJA' : 'bok ok', m.stage[0] > m.stage[1] + 2 ? 'ŚRODEK SIĘ PRZEWIJA' : 'środek ok');
  await p.screenshot({ path: `${OUT}/${String(n).padStart(2, '0')}-${SLUG[n]}-${W}x${H}.png` });
  if (n >= 18) { const bb = await (await p.$('.kk-i')).boundingBox(); await p.setViewport({ width: W, height: H, deviceScaleFactor: 2.4 }); await wait(500); await wstrzyknij(p, snap); await p.evaluate(async n => { const i = document.querySelector('#invoice'); if (i) i.innerHTML = ''; const m = await import('/bulgot/propozycje-uklad/wspolne.js'); await m.apply(n); window.dispatchEvent(new Event('resize')); }, n); await wait(800); const b2 = await (await p.$('.kk-i')).boundingBox(); await p.screenshot({ path: `${OUT}/${String(n).padStart(2, '0')}-${SLUG[n]}-karta-zblizenie.png`, captureBeyondViewport: false, clip: { x: b2.x - 6, y: b2.y - 6, width: b2.width + 12, height: b2.height + 12 } }); await p.setViewport({ width: W, height: H, deviceScaleFactor: 1 }); await wait(400); }
}
if (which.includes(3)) {
  await wstrzyknij(p, snap);
  await p.evaluate(async () => { const i = document.querySelector('#invoice'); if (i) i.innerHTML = ''; const m = await import('/bulgot/propozycje-uklad/wspolne.js'); await m.apply(3, { tab: 1 }); window.dispatchEvent(new Event('resize')); });
  await wait(700);
  await p.screenshot({ path: `${OUT}/03b-zakladki-karta-kafelki-${W}x${H}.png` });
}
await b.close();
