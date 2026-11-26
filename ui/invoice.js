// Bulgot, interfejs: faktura i Tablica Zarządu.
// Wydzielone z app.js (2026-11-24). Wszystkie funkcje i stałe są eksportowane i dzielą stan przez G (ui/core.js).
import * as D from '../shared/data.js?v=20261126b';
import * as art from '../art.js?v=20261126b';
import * as T from '../text.js?v=20261126b';
import * as snd from '../audio.js?v=20261126b';
import { $, G, TILE, act, esc, fmtNum, openOverlay, store, toast, unlockName } from './core.js?v=20261126b';
import { takeUnlocks } from './end.js?v=20261126b';
import { pop } from './fight.js?v=20261126b';
import { REDUCED } from './side.js?v=20261126b';

// ---------- faktura i Tablica Zarządu ----------
// Po wygranej walce faktura Korporacji Rosołowej spada na ekran, młotek przybija ją gwoździem, po czym leci na Tablicę Zarządu
// (korek na dole środkowej kolumny) i zostaje tam jako karteczka do końca runu. Klik w karteczkę otwiera fakturę.
// Faktura nie blokuje gry (klik i klawisze przechodzą przez nią), a pierwsza akcja gracza skraca animację. Opcja w ustawieniach.
export const invoiceOn = () => !G.duelRun && store.get('bulgot:invoice') !== '0';   // w pojedynku bez faktury: liczy się czas
export const INV = { el: null, ham: null, t0: 0, timers: [], floor: 0, pending: 0 };
export const COIN = '¤';                                   // w zapisanych pozycjach znacznik ikony Ziarna
export const coinHTML = s => String(s).replace(/¤/g, art.coinIcon());
export const boardKey = id => 'bulgot:inv:' + id;
// Pełne dane faktur trzymamy w przeglądarce (klucz: id runu, ostatnie 3 runy); serwer w view().board oddaje tylko liczby, z których
// da się odtworzyć uproszczoną fakturę (po odświeżeniu strony albo na innym komputerze).
export function boardCache() { try { return JSON.parse(store.get(boardKey(G.run.id)) || '{}'); } catch (e) { return {}; } }
export function boardPut(f, d) {
  const c = boardCache(); c[f] = d; store.set(boardKey(G.run.id), JSON.stringify(c));
  let ids = []; try { ids = JSON.parse(store.get('bulgot:invruns') || '[]'); } catch (e) {}
  if (!ids.includes(G.run.id)) { ids.push(G.run.id); while (ids.length > 3) { try { localStorage.removeItem(boardKey(ids.shift())); } catch (e) {} } store.set('bulgot:invruns', JSON.stringify(ids)); }
}
export const secStr = ticks => (ticks / 10).toFixed(1).replace('.', ',');
export function slipData(f) {
  const c = boardCache()[f]; if (c) return c;
  const e = ((G.run && G.run.board) || []).find(x => x.r === f); if (!e) return null;
  const I = T.INVOICE;
  return { f, boss: e.boss, who: D.CHARS[G.run.char].name, zone: T.ZONE_NAMES[D.MODES[G.run.mode] ? Math.min(2, Math.floor((f - 1) * 3 / D.MODES[G.run.mode].rounds)) : 0], imp: false, seen: true, notes: [],
    rows: [[`${e.boss ? 'Pokonanie bossa' : 'Pokonanie piętra ' + f} (czas walki ${secStr(e.ticks)} s)`, e.boss ? 'boss' : 'zaliczone'], ['Zadane obrażenia', fmtNum(e.dealt)], ['Wypłata (razem z odsetkami)', `+${e.reward} ${COIN}`]],
    line: e.boss ? '' : T.pickLine(T.WIN_LINES, f), foot: T.pickLine(e.boss ? I.bossFooters : I.footers, f), stamp: e.boss ? I.bossStamp : I.stamp };
}
// Treść faktury (do animacji i do okna po kliknięciu karteczki).
export function invoiceInner(d) {
  const I = T.INVOICE;
  return `<div class="inv-head"><b>${esc(I.company)}</b><span>${esc(I.nip)}</span></div>
    <div class="inv-title"><b>${d.boss ? I.bossTitle : I.title}</b><span>nr BG/${esc(String(G.run.id).slice(-4))}/${String(d.f).padStart(2, '0')}</span></div>
    <div class="inv-who">Nabywca: <b>${esc(d.who)}</b>, ${esc(d.zone)}</div>
    <div class="inv-rows">${d.rows.map(([a, b], i) => `<div class="inv-row" style="--d:${i}"><span>${esc(a)}</span><b>${coinHTML(esc(b))}</b></div>`).join('')}</div>
    ${d.notes.length ? `<div class="inv-notes">${d.notes.map(n => `<div class="${n.imp ? 'imp' : ''}">${esc(n.text)}</div>`).join('')}</div>` : ''}
    <div class="inv-foot">${esc(d.line)}${d.line ? '<br>' : ''}<i>${esc(d.foot)}</i></div>
    <div class="inv-stamp ${d.boss ? 'boss' : ''}" aria-hidden="true">${esc(d.stamp).replace('\n', '<br>')}</div>`;
}
// Wiersze i uwagi faktury po wygranej walce: ważne uwagi (Nemezis, wada, odblokowania) zapalają na karteczce czerwony wykrzyknik.
export function invoiceData(j, floor) {
  const r = j.result || {}, run = G.run, boss = j.boss, un = takeUnlocks(), I = T.INVOICE, f = floor || run.round;
  const base = j.reward - (j.interest || 0), rows = [];
  rows.push([`${boss ? 'Pokonanie bossa' : 'Pokonanie piętra ' + f} (czas walki ${secStr(r.ticks)} s)`, boss ? 'boss' : 'zaliczone']);
  rows.push(['Zadane obrażenia', fmtNum(r.dealt)]);
  rows.push(['Wypłata za piętro', `+${base} ${COIN}`]);
  if (j.interest) rows.push(['Odsetki w Spiżarni', `+${j.interest} ${COIN}`]);
  if (j.upkeep) rows.push(['Koszty umów i odsetek (z oszczędności)', `-${j.upkeep} ${COIN}`]);
  rows.push(['Leczenie (życie po leczeniu)', `${run.hp}/${run.maxHp}`]);
  const notes = [];   // { text, imp }
  if (j.nemesis) notes.push({ text: `Sprawiedliwości stało się zadość! Nemezis pokonany: Odznaka Sprawiedliwość Kurnika${j.nemesis.tile ? ' i odzyskany kafelek ' + TILE[j.nemesis.tile].name : ''}.`, imp: true });
  for (const w of (j.revealed || [])) notes.push({ text: `Wada ujawniona: ${TILE[w.id].name}, ${D.FLAWS[w.flaw].name}. ${D.FLAWS[w.flaw].text}`, imp: true });
  for (const u of un) notes.push({ text: `Odblokowano ${u.kind === 'char' ? 'postać' : 'kafelek'}: ${unlockName(u)}. ${u.text}`, imp: true });
  if (r.stolen) notes.push({ text: `Złodzieje ukradli ci ${r.stolen} Ziaren.` });
  if (r.usedRevive) notes.push({ text: 'Gniazdo Zapasowe zostało zużyte.' });
  if (r.chains) notes.push({ text: `Pełne Kurze Serie: ${r.chains}` });
  if (r.reactions) notes.push({ text: `Reakcje: ${r.reactions} (${(r.reactSeen || []).map(k => D.REACTIONS[k] ? D.REACTIONS[k].name : k).join(', ')})` });
  if (j.grew && j.grew.length) notes.push({ text: 'Urosło: ' + j.grew.map(id => TILE[id].name + ' (' + Math.min(TILE[id].grow.max, (run.grow || {})[id] || 0) + '/' + TILE[id].grow.max + ')').join(', ') });
  return { f, boss: !!boss, who: D.CHARS[run.char].name, zone: T.ZONE_NAMES[run.zone], rows, notes, imp: notes.some(n => n.imp), seen: false,
    line: boss ? (T.BOSS_WIN_LINES[boss] || 'Boss padł, a wynik rośnie.') : T.pickLine(T.WIN_LINES, run.round), foot: T.pickLine(boss ? I.bossFooters : I.footers, run.round), stamp: boss ? I.bossStamp : I.stamp };
}

// ---------- Tablica Zarządu (korek z przybitymi fakturami za pokonane piętra, do końca runu) ----------
export function boardHTML() {
  const r = G.run; if (!r) return '';
  const list = (r.board || []).slice().sort((a, b) => a.r - b.r);
  const slips = list.map(e => {
    const d = slipData(e.r) || {}, flag = d.imp && !d.seen, pend = INV.pending === e.r, pop = G.boardPop === e.r;
    const tip = `Piętro ${e.r}${e.boss ? ' (boss)' : ''}: faktura\nCzas walki ${secStr(e.ticks)} s, obrażenia ${fmtNum(e.dealt)}, wypłata +${e.reward} Ziaren${flag ? '\nZawiera ważną uwagę, otwórz ją!' : ''}\nKliknij, żeby otworzyć.`;
    return `<button class="slip ${e.boss ? 'boss' : ''} ${flag ? 'flag' : ''} ${pend ? 'pending' : ''} ${pop ? 'pop' : ''}" data-act="slip" data-f="${e.r}" data-tip="${esc(tip)}" style="--rot:${e.r * 37 % 9 - 4}deg;--dy:${e.r * 53 % 7 - 3}px" aria-label="Faktura za piętro ${e.r}"><i class="pin"></i><small>${e.boss ? "NOTA" : "FAKTURA"}</small><b>${e.r}</b><span class="sl"></span><span class="sl s2"></span><span class="sl"></span><u>+${e.reward}</u>${flag ? '<em>!</em>' : ''}</button>`;
  }).join('');
  G.boardPop = 0;
  return `<section class="board" aria-label="Tablica Zarządu">
    <div class="slips">${slips || '<span class="board-empty">Tu zawisną faktury za pokonane piętra</span>'}</div><div class="board-side"><span class="board-title">Tablica Zarządu</span><span class="board-count">i faktury${list.length ? `<b>${list.length}</b>` : ""}</span></div></section>`;
}
export const refreshBoard = () => { const b = $('.board'); if (b) { b.outerHTML = boardHTML(); fitBoard(); } };
// Faktury na Tablicy nakładają się tak, żeby zawsze mieściły się w szerokości (bez przewijania poziomego).
export function fitBoard() { const s = $('.slips'); if (!s) return; const k = s.querySelectorAll(".slip"), w = 70, W = s.getBoundingClientRect().width / uiScale() - 12; if (k.length < 2 || W <= 0) return; const step = Math.min(w - 8, Math.max(12, (W - w) / (k.length - 1))); s.style.setProperty('--ov', (w - step).toFixed(1) + 'px'); }
export function showSlip(f) {
  const d = slipData(f); if (!d) return;
  if (d.imp && !d.seen) {
    d.seen = true; if (boardCache()[f]) boardPut(f, d);
    const s = $(`.slip[data-f="${f}"]`); if (s) { s.classList.remove('flag'); const em = $('em', s); if (em) em.remove(); }
  }
  openOverlay(`<div class="inv static ${d.boss ? 'boss' : ''}">${invoiceInner(d)}</div><div class="actions" style="margin-top:14px"><button class="btn primary" data-act="close" data-primary>Zamknij</button></div>`, { narrow: true });
}
// Karteczka ląduje na tablicy: iskra przy pinezce i lekkie drgnięcie korka.
export function landSlip(floor) {
  if (INV.pending === floor) INV.pending = 0;
  const s = $(`.slip[data-f="${floor}"]`);
  if (!s) return;
  s.classList.remove('pending'); s.classList.add('land'); snd.sfx('tink');
  const b = $('.board'); if (b && !REDUCED.matches) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
}
export const uiScale = () => +getComputedStyle(document.documentElement).getPropertyValue('--s') || 1;
// Faktura leci na swoje miejsce na tablicy (fast = gracz nie chciał czekać).
export function flyToBoard(fast) {
  const el = INV.el, ham = INV.ham, floor = INV.floor; if (!el) return;
  INV.timers.forEach(clearTimeout); INV.timers = []; INV.el = null; INV.ham = null;
  if (ham) { ham.classList.add('away'); setTimeout(() => ham.remove(), 260); }
  const nail = $('.inv-nail', el); if (nail) { nail.classList.add('on'); nail.style.setProperty('--sink', '34px'); }
  const done = () => { el.remove(); landSlip(floor); };
  const slip = $(`.slip[data-f="${floor}"]`);
  if (!el.isConnected) return done();
  if (!slip || REDUCED.matches) { el.classList.add('quick'); setTimeout(done, 260); return; }
  const sc = uiScale(), r = el.getBoundingClientRect(), s = slip.getBoundingClientRect(), k = s.width / r.width;
  const rot = getComputedStyle(slip).getPropertyValue('--rot').trim() || '0deg';
  const dx = s.left + s.width / 2 - (r.left + r.width / 2), dy = s.top + s.height / 2 - (r.top + r.height * k / 2);   // skalowanie wokół górnej krawędzi
  el.style.animation = 'none'; el.style.transform = 'translateY(0) rotate(-1.2deg)';
  const an = el.animate([{ transform: 'translateY(0) rotate(-1.2deg)', opacity: 1 }, { transform: `translate(${dx / sc}px, ${dy / sc}px) scale(${k}) rotate(${rot})`, opacity: .96 }],
    { duration: fast ? 380 : 650, easing: 'cubic-bezier(.55, 0, .35, 1)', fill: 'forwards' });
  an.onfinish = done;
}
export const dismissInvoice = fast => { if (INV.el) flyToBoard(fast); };
// Jedno uderzenie młotka: ustawia młotek nad główką gwoździa, po chwili gwóźdź zagłębia się w papier, a kartka drga.
export function strike(n) {
  const el = INV.el, ham = INV.ham; if (!el || !ham) return;
  const nail = $('.inv-nail', el), nr = nail.getBoundingClientRect(), sc = uiScale();
  // punkt uderzenia młotka (po obrocie o -35°) leży 69,7 w lewo i 36,6 w górę od końca rączki
  ham.style.left = (nr.left + nr.width / 2 + 69.7 * sc - 60) + 'px'; ham.style.top = (nr.top + 3 * sc + 36.6 * sc - 112) + 'px';
  ham.classList.add('on'); ham.classList.remove('hit'); void ham.offsetWidth; ham.classList.add('hit');
  INV.timers.push(setTimeout(() => {
    if (!INV.el) return;
    nail.style.setProperty('--sink', [11, 22, 34][n - 1] + 'px'); snd.sfx(n < 3 ? 'hit' : 'crit');
    el.animate([{ translate: '-50% 0' }, { translate: '-50% 4px' }, { translate: '-50% 0' }], { duration: 130 });
  }, 170));
}
export function showInvoice(j, floor) {
  const run = G.run, d = invoiceData(j, floor);
  dismissInvoice(true);
  boardPut(d.f, d);
  if (!invoiceOn()) {   // bez animacji: karteczka po prostu pojawia się na tablicy, ważne uwagi jako powiadomienia
    INV.pending = 0; G.boardPop = d.f; refreshBoard();
    toast(`${d.boss ? 'Boss pokonany' : 'Piętro ' + d.f + ' zdobyte'}: +${j.reward} Ziaren`);
    for (const n of d.notes.filter(x => x.imp)) toast(n.text, false, 6000);
    return;
  }
  refreshBoard();                                    // karteczka jest już na tablicy, ale ukryta (pending), dopóki faktura do niej nie doleci
  const el = document.createElement('div');
  el.className = 'inv' + (d.boss ? ' boss' : ''); el.setAttribute('role', 'status');
  el.innerHTML = invoiceInner(d) + `<div class="inv-nail">${art.nailArt()}</div>`;
  const ham = document.createElement('div'); ham.className = 'inv-hammer'; ham.innerHTML = art.hammerArt(); ham.setAttribute('aria-hidden', 'true');
  $('#invoice').append(el, ham);
  for (const n of d.notes.filter(x => x.imp)) toast(n.text, false, 6500);   // ważne uwagi jako powiadomienie (faktura z boku jest zwięzła)
  // położenie: nad środkową kolumną (nie zasłania schodów po lewej ani panelu po prawej)
  const st = $('.stage'), rc = st && st.getBoundingClientRect();
  if (rc && rc.width > 0) { const iw = 270; el.style.width = iw + 'px'; el.style.left = (rc.left + 8 + iw * uiScale() / 2) + 'px'; el.style.top = Math.max(10, rc.top + 2) + 'px'; el.style.maxWidth = 'none'; }
  INV.el = el; INV.ham = ham; INV.floor = d.f; INV.t0 = performance.now();
  const later = (ms, fn) => INV.timers.push(setTimeout(fn, ms)), hold = 1500;
  if (REDUCED.matches) { $('.inv-nail', el).style.setProperty('--sink', '34px'); $('.inv-nail', el).classList.add('on'); ham.remove(); INV.ham = null; later(3200, () => flyToBoard(false)); return; }
  later(760, () => $('.inv-nail', el).classList.add('on'));
  [1000, 1280, 1560].forEach((ms, i) => later(ms, () => strike(i + 1)));
  later(1900, () => ham.classList.add('away'));
  later(1950 + hold, () => flyToBoard(false));
}
// Pierwsza akcja gracza (klik, klawisz) skraca animację i wysyła fakturę na tablicę, ale dopiero po chwili, żeby nie zniknęła przypadkiem.
for (const ev of ['pointerdown', 'keydown']) document.addEventListener(ev, () => { if (INV.el && performance.now() - INV.t0 > 700) dismissInvoice(true); }, true);
