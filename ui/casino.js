// Bulgot, interfejs: tryb kasynowy: przetasowanie oferty jako automat.
// Wydzielone z app.js (2026-11-24). Wszystkie funkcje i stałe są eksportowane i dzielą stan przez G (ui/core.js).
import * as D from '../shared/data.js?v=20261126c';
import * as art from '../art.js?v=20261126c';
import * as snd from '../audio.js?v=20261126c';
import { $, G, SPIN, TILE, act, closeOverlay, openOverlay, overlayOpen, toast } from './core.js?v=20261126c';
import { banner, cls, shake } from './fight.js?v=20261126c';
import { animOn } from './side.js?v=20261126c';

// ---------- Tryb kasynowy: przetasowanie oferty jako automat ----------
// Odblokowuje się po 5 przetasowaniach na jednym piętrze (serwer: profile.casino). Domyślnie wyłączony; po odpowiedzi „Tak” włączony na stałe, wyłączany w ustawieniach.
// Czysto wizualne: oferta jest już wylosowana przez serwer, walce tylko ją odsłaniają od lewej do prawej. Klik, spacja albo R przerywa.
export const casinoOn = () => !!(G.profile && G.profile.casino && G.profile.casino.on) && animOn();
export function maybeCasinoAsk() {
  const c = G.profile && G.profile.casino;
  if (c && c.unlocked && !c.asked && !overlayOpen() && (G.screen === 'home' || G.screen === 'run')) showCasinoAsk();
}
export function showCasinoAsk() {
  openOverlay(`<div class="casino-ask"><div class="ca-lamps" aria-hidden="true">${Array.from({ length: 14 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>
    <h2>Wykryto skłonność do kręcenia</h2>
    <p class="ca-big">Widzę, że masz skłonność do kręcenia.<br><b>Włączyć tryb kasynowy?</b></p>
    <p class="hint">Przetasowanie taśmy będzie wyglądać jak automat do gier: kręcące się walce, brzdęk i jackpot. Włączysz i wyłączysz to w ustawieniach.</p>
    <div class="actions"><button class="btn primary big" data-act="casinoyes" data-primary>Tak</button><button class="btn primary big" data-act="casinoyes">tak</button></div></div>`, { force: true, cls: 'casinoask' });
  snd.sfx('unlock');
}
export async function casinoAnswer(on) {
  const j = await act('casino', { on }); if (!j) return;
  closeOverlay(); snd.sfx('win');
  toast(on ? 'Tryb kasynowy włączony. Wyłączysz go w ustawieniach.' : 'Tryb kasynowy wyłączony.', false, 3400);
}
export const casinoIcons = (() => { let pool = null; return () => pool || (pool = D.TILES.filter(t => !t.hidden && !t.hatched && !t.boss).map(t => t.id)); })();
export function casinoSpin() {
  const box = $('.stage .cards'); if (!box || !G.run) return;
  const kids = [...box.children]; if (kids.length < 2) return;
  if (SPIN.active) SPIN.active.abort();
  const ids = G.run.offer, rar = i => (TILE[ids[i]] ? TILE[ids[i]].rarity : 0) | 0, maxR = Math.max(...kids.map((_, i) => rar(i)));
  const lamps = () => Array.from({ length: 26 }, (_, k) => `<i style="--i:${k}"></i>`).join('');
  const slot = document.createElement('div'); slot.className = 'slotm';
  slot.innerHTML = `<div class="lamps top">${lamps()}</div><div class="reels"></div><div class="lamps bot">${lamps()}</div>`;
  const reels = slot.querySelector('.reels'), pool = casinoIcons();
  const cells = kids.map((k, i) => {
    const c = document.createElement('div'); c.className = 'cell'; c.style.height = k.offsetHeight + 'px';
    const six = Array.from({ length: 6 }, () => pool[Math.floor(Math.random() * pool.length)]);
    const sym = id => `<div class="sym">${art.tileIcon(id)}</div>`;
    const reel = document.createElement('div'); reel.className = 'reel';
    reel.innerHTML = `<div class="strip" style="animation-delay:-${(i * 0.07).toFixed(2)}s">${six.map(sym).join('')}${six.map(sym).join('')}</div><div class="gloss"></div>`;
    k.style.visibility = 'hidden'; c.append(k, reel); reels.append(c); return { c, k, reel, done: false };
  });
  box.classList.add('casino'); box.append(slot);
  const timers = []; let tick = null, ended = false;
  const stage = $('.stage');
  const clear = () => { timers.forEach(clearTimeout); clearInterval(tick); };
  const banner = (txt, cls) => { const b = document.createElement('div'); b.className = 'jpb ' + cls; b.textContent = txt; slot.append(b); timers.push(setTimeout(() => b.remove(), cls === 'gold' ? 1600 : 1000)); };
  const reveal = (i, quiet) => {
    const cell = cells[i]; if (cell.done) return; cell.done = true;
    const r = rar(i); cell.reel.remove(); cell.k.style.visibility = ''; cell.c.classList.add('stopped', 'r' + r);
    if (!quiet) {
      snd.sfx('reelstop' + r);
      if (r >= 2) { cell.c.classList.add('glow'); if (stage) { stage.classList.add('casino-shake'); timers.push(setTimeout(() => stage.classList.remove('casino-shake'), 380)); } banner(r >= 3 ? 'JACKPOT!' : 'EPICKI!', r >= 3 ? 'gold' : 'epic'); if (r >= 3) slot.classList.add('gold'); }
    }
  };
  const unwrap = () => {
    if (!slot.isConnected) return;
    for (const cell of cells) { cell.c.classList.remove('stopped', 'glow'); box.insertBefore(cell.k, slot); cell.k.style.visibility = ''; }
    slot.remove(); box.classList.remove('casino');
  };
  const finish = () => {
    if (ended) return; ended = true; clear(); SPIN.active = null;
    if (slot.isConnected) { let any = false; cells.forEach((c, i) => { if (!c.done) { any = true; reveal(i, true); } }); if (any) snd.sfx('reelstop' + maxR); }
    unwrap();
  };
  const abort = () => { if (ended) return; ended = true; clear(); SPIN.active = null; };
  SPIN.active = { finish, abort };
  // czasy zatrzymań: od lewej do prawej, walce z rzadkim kafelkiem „zawahają się” przed końcem
  let t = 650; const stops = cells.map((_, i) => { t += (i ? 230 : 0) + (rar(i) >= 2 ? 380 : 0); return t; });
  tick = setInterval(() => snd.sfx('reeltick'), 85);
  cells.forEach((cell, i) => {
    if (rar(i) >= 2) timers.push(setTimeout(() => cell.reel.classList.add('slow'), stops[i] - 420));
    timers.push(setTimeout(() => reveal(i), stops[i]));
  });
  timers.push(setTimeout(finish, stops[stops.length - 1] + (maxR >= 3 ? 1500 : maxR === 2 ? 800 : 380)));
}

