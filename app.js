// Bulgot: punkt wejścia interfejsu. Cała logika (oferty, rerolle, walki, wyniki) liczy serwer; tu rysujemy ekrany i prowadzimy walkę na żywo
// tym samym silnikiem (shared/sim.js), a lista wejść gracza leci na serwer, który powtarza walkę i wydaje wynik.
// Kod interfejsu jest podzielony na moduły w ui/ (mapa: .claude/context/systems-index.md); tu zostają importy i rejestracja nasłuchiwaczy.
import * as T from './text.js';
import * as snd from './audio.js';
import { initTip } from './tip.js';
import { $, G, SPIN, act, applyScale, closeOverlay, overlayOpen } from './ui/core.js';
import { useSkill } from './ui/fight.js';
import { carGo, charIds, garGo, init, render } from './ui/home.js';
import { ACT, ARROWS, navCurrent, navItems, navMove } from './ui/input.js';
import { fitBoard } from './ui/invoice.js';
import { swapSlots } from './ui/run.js';
import { applyAnim } from './ui/side.js';
import { WIDE, fitTower } from './ui/tower.js';
import { RK, bookGo, showBook, showHelp, showRanking } from './ui/windows.js';

window.__bulgot = G; G.render = () => render();      // podgląd stanu i odświeżanie w testach

applyScale(); addEventListener('resize', applyScale);
initTip({ run: () => G.run });

WIDE.addEventListener('change', () => { if (G.screen === 'run' && G.run) render(); });
addEventListener('resize', () => fitTower(false));
applyAnim();
document.addEventListener('dragstart', e => { const s = e.target.closest && e.target.closest('.sring[data-slot]'); if (!s) return; G.dragSlot = +s.dataset.slot; e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(G.dragSlot)); } catch (x) {} s.classList.add('drag'); });
document.addEventListener('dragover', e => { const s = e.target.closest && e.target.closest('.sring[data-slot]'); if (s && G.dragSlot != null) { e.preventDefault(); document.querySelectorAll('.sring.over').forEach(x => x !== s && x.classList.remove('over')); s.classList.add('over'); } });
document.addEventListener('dragend', () => { G.dragSlot = null; document.querySelectorAll('.sring.drag, .sring.over').forEach(x => x.classList.remove('drag', 'over')); });
document.addEventListener('drop', e => { const s = e.target.closest && e.target.closest('.sring[data-slot]'); if (!s || G.dragSlot == null) return; e.preventDefault(); const a = G.dragSlot, b = +s.dataset.slot; G.dragSlot = null; if (a !== b) swapSlots(a, b); });
addEventListener('resize', () => fitBoard());
document.addEventListener('click', e => {
  const o = $('#overlay');
  if (e.target === o && !o.dataset.force) return closeOverlay();
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled || b.getAttribute('aria-disabled') === 'true' && !['setchar', 'setgarnek'].includes(b.dataset.act)) return;
  snd.unlock();
  const fn = ACT[b.dataset.act];
  if (fn) { if (!['pick', 'buy', 'reroll', 'useskill', 'bet'].includes(b.dataset.act)) snd.sfx('click'); fn(b, e); }
});
// Filtry rankingu: zmiana listy, poziomu Garnka albo nicka odświeża tabelę.
document.addEventListener('input', e => { const t = e.target; if (t && t.id === 'set-vol') { snd.setVolume(+t.value); const n = $('#set-vol-n'); if (n) n.textContent = snd.settings.vol + '%'; } });
document.addEventListener('change', e => { if (e.target && e.target.id === 'set-vol') snd.setVolume(+e.target.value, true); });
document.addEventListener('change', e => { const t = e.target; if (!t || !t.id || !t.id.startsWith('rk-')) return; if (t.id === 'rk-char') RK.char = t.value; else if (t.id === 'rk-garnek') RK.garnek = t.value; else if (t.id === 'rk-nick') RK.nick = t.value.trim(); showRanking(RK.mode, true); });
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const F = G.fight, k = e.key.toLowerCase();
  if (k !== 'escape' && e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;   // pisanie nie uruchamia skrótów
  const ringEl = e.target && e.target.closest && e.target.closest('.sring[data-slot]');   // ←/→ na aktywnym kółku umiejętności zamienia je z sąsiednim (klawisz w walce)
  if (ringEl && (k === 'arrowleft' || k === 'arrowright') && G.screen === 'run' && !overlayOpen() && !e.shiftKey) {
    e.preventDefault(); const i = +ringEl.dataset.slot, j = i + (k === 'arrowright' ? 1 : -1);
    if (G.run && j >= 0 && j < G.run.skills.length) swapSlots(i, j).then(() => { const n = $('.sring[data-slot="' + j + '"]'); if (n) n.focus(); });
    return;
  }
  if (G.screen === 'setup' && !overlayOpen() && !e.shiftKey) {
    const s = G.setup, ids = charIds();
    if (k === 'escape' || k === 'backspace') { e.preventDefault(); ACT.home(); return; }
    if (k === 'arrowleft') { e.preventDefault(); carGo(s.cur - 1); return; }
    if (k === 'arrowright') { e.preventDefault(); carGo(s.cur + 1); return; }
    if (k === 'arrowup') { e.preventDefault(); garGo(s.garnek + 1); return; }
    if (k === 'arrowdown') { e.preventDefault(); garGo(s.garnek - 1); return; }
    if (k === 'q') { e.preventDefault(); const m = Object.keys(T.MODE_INFO); ACT.setmode({ dataset: { v: m[(m.indexOf(s.mode) + 1) % m.length] } }); return; }
    if (k === 'enter') { e.preventDefault(); ACT.start(); return; }
  }
  if (k === 'escape') { if (overlayOpen()) { if (!$('#overlay').dataset.force) closeOverlay(); } else if (G.screen === 'run' || (G.screen === 'fight' && G.fight && !G.fight.finishing)) { const m = $('[data-act="menu"]'); m && m.click(); } return; }
  if (overlayOpen() && $('#overlay .bookmodal') && !e.shiftKey) {
    if (k === 'arrowleft' || k === 'arrowright') { e.preventDefault(); bookGo(k === 'arrowright' ? 1 : -1); return; }
    if (k === 'arrowup' || k === 'arrowdown') { e.preventDefault(); const ts = [...document.querySelectorAll('#overlay .booktabs .tab')], i = ts.findIndex(t => t.classList.contains('on')), n = ts[(i + (k === 'arrowdown' ? 1 : ts.length - 1)) % ts.length]; if (n) showBook(n.dataset.v, true); return; }
  }
  if (!overlayOpen() && (G.screen === 'run' || G.screen === 'fight') && (k === 'k' || k === 'h') && !(G.screen === 'fight' && G.fight && !G.fight.finishing && false)) { e.preventDefault(); (k === 'k' ? showBook : showHelp)(); return; }
  if (ARROWS[k] && !(F && !overlayOpen())) { e.preventDefault(); navMove(...ARROWS[k]); return; }
  if (k === 'enter') { const cur = navCurrent(navItems()); if (cur) { e.preventDefault(); cur.click(); return; } }
  if (overlayOpen()) {
    if (k === 'enter') { const p = $('#overlay [data-primary]'); if (p) { e.preventDefault(); p.click(); } }
    return;
  }
  if (F) {
    if (['1', '2', '3'].includes(k)) { e.preventDefault(); useSkill(+k - 1); }
    else if (k === 'q' || k === 'w' || k === 'e') useSkill('qwe'.indexOf(k));
    else if (k === 'p' || k === ' ') { e.preventDefault(); ACT.pause(); }
    return;
  }
  const r = G.run;
  if (G.screen === 'run' && r) {
    const dg = /^Digit([1-5])$/.exec(e.code);
    if (r.phase === 'offer' && dg && e.shiftKey) { const b = $(`.cards [data-act=buyoffer][data-i="${+dg[1] - 1}"]`); if (b && !b.disabled) b.click(); }
    else if ((r.phase === 'badge' || r.phase === 'loot' || r.phase === 'route' || r.phase === 'victory' || (r.phase === 'event' && r.pending && ['contract', 'shrine', 'arena', 'adopt', 'crate', 'extra'].includes(r.pending.kind))) && ['1', '2', '3'].includes(k)) { const b = $(`.cards [data-act=choose][data-i="${+k - 1}"]`); if (b) b.click(); }
    else if (r.phase === 'offer' && ['1', '2', '3', '4', '5'].includes(k)) { const b = $(`.cards [data-act=pick][data-i="${+k - 1}"]`); if (b) b.click(); }
    else if (r.phase === 'offer' && k === 'u') { const b = $('[data-act="upgrademenu"]'); if (b && !b.disabled) b.click(); }
    else if (r.phase === 'offer' && k === 'l') { const b = $('[data-act="pawnmenu"], [data-act="redeem"]'); if (b && !b.disabled) b.click(); }
    else if ((r.phase === 'offer' || r.phase === 'fight') && k === 'o') { const b = $('[data-act="rest"]'); if (b && !b.disabled) b.click(); }
    else if (r.phase === 'offer' && k === 'r') { const b = $('[data-act="reroll"]'); if (b && !b.disabled) b.click(); }
    else if ((r.phase === 'event' || r.phase === 'bonus') && ['1', '2', '3'].includes(k)) { const b = $(`.cards [data-i="${+k - 1}"]`); if (b) b.click(); }
    else if (k === 'enter') { const p = $('[data-primary]'); if (p) p.click(); }
  } else if (k === 'enter') { const p = $('[data-primary]'); if (p) p.click(); }
});

init();

document.addEventListener('click', e => { if (SPIN.active) { e.stopPropagation(); e.preventDefault(); SPIN.active.finish(); } }, true);
document.addEventListener('keydown', e => { if (SPIN.active && !['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) { e.stopPropagation(); e.preventDefault(); SPIN.active.finish(); } }, true);

