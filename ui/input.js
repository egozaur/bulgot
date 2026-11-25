// Bulgot, interfejs: obsługa kliknięć (tablica ACT) i sterowanie klawiszami/strzałkami.
// Wydzielone z app.js (2026-11-24). Wszystkie funkcje i stałe są eksportowane i dzielą stan przez G (ui/core.js).
import { playerNow } from '../api.js';
import * as D from '../shared/data.js';
import * as snd from '../audio.js';
import { casinoAnswer, casinoOn, casinoSpin, showCasinoAsk } from './casino.js';
import { DUEL_ACT } from './duel.js';
import { $, G, TILE, act, closeOverlay, openOverlay, overlayOpen, store, toast } from './core.js';
import { backFromAnalyze, chooseEnding, sendAnalysis, showAnalyzeDialog, showEnd } from './end.js';
import { banner, startFight, stopFight, useSkill } from './fight.js';
import { carGo, charIds, garGo, init, render, setupOk } from './home.js';
import { dismissInvoice, invoiceOn, showSlip } from './invoice.js';
import { lvlPick, shopAct, showDaily, showShop, startDaily } from './meta.js';
import { compForm, doBuy, doPick, needChoice, showPawn, showUpgrade } from './run.js';
import { animOn, applyAnim } from './side.js';
import { RK, bookGo, confirmAbandon, showBook, showHelp, showHistory, showDecreeRoll, startIntro, showKurnik, showMenu, showProfile, showRanking, showSettings } from './windows.js';

// ---------- obsługa kliknięć i klawiszy ----------
export const ACT = {
  ...DUEL_ACT,
  retry: async () => { await init(); },
  changeplayer: async () => { if (window.PL3Y && window.PL3Y.player) { await window.PL3Y.player.change(); await act('state'); render(); } },
  new: () => { G.screen = 'setup'; render(); },
  home: () => { closeOverlay(); stopFight(); G.fight = null; G.screen = 'home'; render(); },
  resume: () => { G.screen = 'run'; render(); },
  setmode: b => { G.setup.mode = b.dataset.v; store.set('bulgot:mode', b.dataset.v); render(); },
  setchar: b => { if (G.profile.chars.includes(b.dataset.v)) { G.setup.char = b.dataset.v; render(); } else toast('Ta postać jest zablokowana: ' + (D.CHARS[b.dataset.v].secret ? '???' : (D.UNLOCK_BY_ID[D.CHARS[b.dataset.v].lock] || {}).text)); },
  bookprev: () => bookGo(-1), booknext: () => bookGo(1),
  carpick: b => carGo(+b.dataset.v),
  cprev: () => carGo(G.setup.cur - 1), cnext: () => carGo(G.setup.cur + 1),
  gprev: () => garGo(G.setup.garnek - 1), gnext: () => garGo(G.setup.garnek + 1),
  setgarnek: b => garGo(+b.dataset.v),
  curse: b => { const s = G.setup, sel = s.curses || (s.curses = []), id = b.dataset.v, k = sel.indexOf(id); if (k >= 0) sel.splice(k, 1); else if (sel.length >= D.CURSE_MAX) return toast('Najwyżej ' + D.CURSE_MAX + ' Klątwy naraz.', true, 2400); else sel.push(id); snd.sfx('click'); render(); },
  start: async () => {
    const s = G.setup; if (!setupOk()) return toast(G.profile.chars.includes(charIds()[s.cur]) ? 'Ten palnik jest zablokowany.' : 'Ta postać jest zablokowana.'); s.char = charIds()[s.cur];
    const j = await act('start', { mode: s.mode, char: s.char, garnek: s.garnek, curses: s.curses || [] }); if (!j) return;
    snd.sfx('bulgot'); G.screen = 'run'; render();
    startIntro(showDecreeRoll);
  },
  introgo: () => { const cb = G.introCb; G.introCb = null; closeOverlay(); if (cb) cb(); },
  pick: b => doPick(+b.dataset.i),
  buyoffer: b => doBuy(+b.dataset.i),
  pawnmenu: () => showPawn(),
  upgrademenu: () => showUpgrade(),
  upgrade: async b => { const id = b.dataset.v, hot = !!b.dataset.hot; const j = await act('upgrade', hot ? { id, hot: true } : { id }); if (!j) return; closeOverlay(); snd.sfx('unlock'); G.upFresh = j.upgraded.to; toast(`Zlano ${D.RULES.upgradeCost}× ${TILE[id].name} w ${TILE[j.upgraded.to].name}${j.upgraded.hot ? ' (przegrzany: ukryta wada ujawni się po walce)' : ''}!`, false, 3600); render(); setTimeout(() => { G.upFresh = null; document.querySelectorAll('.chip.fresh').forEach(e => e.classList.remove('fresh')); }, 1800); },
  pawn: async b => { const id = b.dataset.v; const j = await act('pawn', { id }); if (!j) return; closeOverlay(); snd.sfx('coin'); toast(`Lis wziął ${TILE[id].name} i dał ${j.price} Ziaren. Wykup na następnym piętrze.`, false, 4200); render(); },
  codeopen: () => {   // Hasło do ukrytej postaci: tylko tutaj, z ekranu wyboru postaci. Hasło sprawdza serwer.
    openOverlay(`<h2>Masz hasło?</h2><p class="lead">Ktoś szepnął Ci słówko? Wpisz je, a ukryta postać wykluje się od razu.</p>
      <input id="codein" class="codein" type="text" maxlength="40" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Hasło" aria-label="Hasło do ukrytej postaci">
      <div class="actions" style="margin-top:14px"><button class="btn primary" data-act="codesend" data-primary>Odblokuj</button><button class="btn ghost" data-act="close">Wróć</button></div>`, { narrow: true, force: true });
    const t = $('#codein'); if (t) { t.focus(); t.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ACT.codesend(); } }); }
  },
  codesend: async () => {
    const t = $('#codein'), text = ((t && t.value) || '').trim(); if (!text) return toast('Wpisz hasło.', true, 2400);
    const j = await act('code', { text }); if (!j) { if (t) { t.select(); snd.sfx('hurt'); } return; }
    closeOverlay(); const id = (j.unlocks && j.unlocks[0] && j.unlocks[0].target) || 'zjarany';
    G.setup.char = id; G.setup.cur = Math.max(0, charIds().indexOf(id)); render();
  },
  redeem: async () => { const j = await act('redeem'); if (!j) return; snd.sfx('unlock'); toast(`Wykupiono: ${TILE[j.redeemed].name} (-${j.cost} Ziaren)`); render(); },
  rest: async () => { const j = await act('rest'); if (!j) return; snd.sfx('heal'); toast('Odpoczynek: +' + j.healed + ' życia (-' + j.cost + ' Ziarna)'); render(); },
  reroll: async () => {
    const j = await act('reroll'); if (!j) return;
    const spin = casinoOn() && !j.casinoAsk;   // tryb kasynowy: automat zamiast zwykłej wymiany
    if (!spin) snd.sfx('reroll');
    render();
    if (j.casinoAsk) setTimeout(showCasinoAsk, 250); else if (spin) casinoSpin();
  },
  casinoyes: () => casinoAnswer(true), tcasino: async () => { await casinoAnswer(!(G.profile.casino && G.profile.casino.on)); showSettings(); },
  buy: b => ACT.shopgo(+b.dataset.i),
  shopgo: async (i, slot, mut) => { const t = TILE[G.run.pending.offer[i]]; if (needChoice(t, slot, mut, (s2, m2) => ACT.shopgo(i, s2, m2))) return;
    const j = await act('shop', { i, slot, mut }); if (j) { snd.sfx('coin'); render(); } },
  leave: async () => { const j = await act('shop', { i: -1 }); if (j) render(); },
  bet: async b => { const j = await act('bet', { amount: +b.dataset.v }); if (!j) return; if (j.bet) { snd.sfx(j.won ? 'win' : 'lose'); toast(j.won ? `Wygrana! +${j.bet} Ziaren` : `Pudło. -${j.bet} Ziaren`, !j.won); } render(); },
  bonuspick: b => ACT.bonusgo(+b.dataset.i),
  choose: async b => { const j = await act('choose', { i: +b.dataset.i }); if (j) { if (G.run && G.run.phase === 'over') { G.screen = 'run'; return showEnd(j); } if (j.companion) toast('Adoptowano: ' + compForm(j.companion) + '!', false, 3600); snd.sfx(j.looted ? 'unlock' : 'pick'); if (j.looted) toast(`Łup: ${TILE[j.looted].name}!`, false, 3200); render(); } },
  bonusgo: async (i, slot, mut) => { const t = TILE[G.run.offer[i]]; if (needChoice(t, slot, mut, (s2, m2) => ACT.bonusgo(i, s2, m2))) return;
    const j = await act('bonus', { i, slot, mut }); if (j) { snd.sfx('pick'); render(); } },
  mutchoose: b => { const cb = G.mutCb; closeOverlay(); G.mutCb = null; if (cb) cb(+b.dataset.v); },
  slotchoose: b => { const cb = G.slotCb; closeOverlay(); G.slotCb = null; if (cb) cb(+b.dataset.v); },
  tofight: async () => {
    const j = await act('fightstart'); if (!j) return;
    snd.unlock(); startFight(j.setup);
  },
  useskill: b => useSkill(+b.dataset.v),
  pause: () => { const F = G.fight; if (!F || F.finishing) return; F.paused = !F.paused; $('#pausebtn').classList.toggle('on', F.paused); $('#pausebtn').textContent = F.paused ? 'Wznów' : 'Pauza'; if (F.paused) banner('Pauza', 'Naciśnij P, aby wznowić', false); },
  'retry-fight': () => { closeOverlay(); const cb = G.retryCb; G.retryCb = null; if (cb) cb(); },
  close: () => { closeOverlay(); if (G.screen === 'run' && G.run && G.run.phase === 'bonus') render(); },
  ranking: () => showRanking(G.run ? G.run.mode : G.setup.mode),
  slip: b => showSlip(+b.dataset.f),
  ranktab: b => { RK.deep = false; showRanking(b.dataset.v, true); },
  rkdeep: () => { RK.deep = !RK.deep; showRanking(RK.mode, true); },
  kurnik: () => showKurnik(),
  shop: () => showShop(), shopbuy: b => shopAct('shopbuy', { id: b.dataset.id }, 'unlock'), wear: b => shopAct('wear', { id: b.dataset.id, on: b.dataset.on === '1' }, 'click'),
  daily: () => showDaily(), dailystart: () => startDaily(), lvlpick: b => lvlPick(+b.dataset.i),
  kbuy: async b => { const j = await act('kurnik', { id: b.dataset.v }); if (!j) return; snd.sfx('unlock'); toast(D.KURNIK[j.kurnikBought.id].name + ': poziom ' + j.kurnikBought.lvl, false, 2600); showKurnik(); },
  rkme: () => { const me = playerNow(); if (me) { RK.nick = me.nick; showRanking(RK.mode, true); } },
  rkclear: () => { Object.assign(RK, { char: '', garnek: '', nick: '' }); showRanking(RK.mode, true); },
  rknickset: b => { RK.nick = b.dataset.v; showRanking(RK.mode, true); },
  rkcharset: b => { RK.char = b.dataset.v; showRanking(RK.mode, true); },
  rkgset: b => { RK.garnek = b.dataset.v; showRanking(RK.mode, true); },
  profile: () => showProfile(), achbook: () => { closeOverlay(); showBook('ach'); },
  book: () => showBook(), booktab: b => showBook(b.dataset.v, true),
  history: () => showHistory(),
  analyze: b => showAnalyzeDialog(b.dataset.id, b.closest('tr') ? 'hist' : 'end'),
  atag: b => { const on = !b.classList.contains('on'); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); },
  acancel: () => backFromAnalyze(),
  asend: async () => sendAnalysis(true),
  asend0: async () => sendAnalysis(false),
  offerfree: () => chooseEnding('ucieczka'),
  offerprom: () => chooseEnding('awans'),
  histdl: () => { const blob = new Blob([JSON.stringify(G.hist || [], null, 1)], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bulgot-historia.json'; document.body.appendChild(a); a.click(); a.remove(); toast('Pobrano bulgot-historia.json'); },
  histcopy: async () => { try { await navigator.clipboard.writeText(JSON.stringify(G.hist || [], null, 1)); toast('Skopiowano historię do schowka'); } catch (e) { toast('Nie udało się skopiować. Użyj przycisku Pobierz.', true); } },
  help: () => showHelp(), settings: () => showSettings(), menu: () => showMenu(),
  tsfx: b => { snd.setSfx(!snd.settings.sfx); showSettings(); },
  tmusic: b => { snd.setMusic(!snd.settings.music); showSettings(); },
  tanim: () => { store.set('bulgot:anim', animOn() ? '0' : '1'); applyAnim(); showSettings(); },
  tinv: () => { store.set('bulgot:invoice', invoiceOn() ? '0' : '1'); dismissInvoice(true); showSettings(); },
  abandon: () => confirmAbandon(),
  'abandon-yes': async () => { closeOverlay(); stopFight(); G.fight = null; const j = await act('abandon'); if (!j) return; G.screen = 'run'; showEnd(j); },
  again: () => { closeOverlay(); G.screen = 'setup'; render(); },
};
// ---------- sterowanie strzałkami ----------
// Strzałki przesuwają zaznaczenie do najbliższego przycisku w danym kierunku (karty, Dokup, Reroll, okna), Enter zatwierdza zaznaczony.
export const ARROWS = { arrowleft: [-1, 0], arrowright: [1, 0], arrowup: [0, -1], arrowdown: [0, 1] };
export function navItems() {
  const root = overlayOpen() ? $('#overlay') : $('#screen');
  if (!root) return [];
  return [...root.querySelectorAll('button:not([disabled]), [data-act][tabindex]')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(b).visibility !== 'hidden'; });
}
export function navCurrent(items) { const a = document.activeElement; return items.includes(a) ? a : null; }
export function navMove(dx, dy) {
  const items = navItems(); if (!items.length) return;
  const cur = navCurrent(items);
  if (!cur) { const first = items.find(b => b.closest('.cards')) || items.find(b => b.hasAttribute('data-primary')) || items[0]; first.focus(); first.scrollIntoView({ block: 'nearest' }); return; }
  const c = cur.getBoundingClientRect(), cx = c.left + c.width / 2, cy = c.top + c.height / 2;
  let best = null, bs = Infinity;
  for (const b of items) {
    if (b === cur) continue;
    const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, ddx = x - cx, ddy = y - cy;
    const along = ddx * dx + ddy * dy; if (along <= 4) continue;            // tylko w wybranym kierunku
    const side = Math.abs(dx ? ddy : ddx);
    const sc = along + side * 2.5;
    if (sc < bs) { bs = sc; best = b; }
  }
  if (best) { best.focus(); best.scrollIntoView({ block: 'nearest' }); }
}

