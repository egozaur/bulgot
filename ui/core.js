// Bulgot, interfejs: wspólne narzędzia, stan gry (G), skalowanie, okna nakładki, wywołania serwera.
// Wydzielone z app.js (2026-11-24). Wszystkie funkcje i stałe są eksportowane i dzielą stan przez G (ui/core.js).
import { call } from '../api.js?v=20261126c';
import * as D from '../shared/data.js?v=20261126c';
import * as art from '../art.js?v=20261126c';
import * as T from '../text.js?v=20261126c';
import * as snd from '../audio.js?v=20261126c';
import { cls } from './fight.js?v=20261126c';
import { render } from './home.js?v=20261126c';
import { tileCard } from './run.js?v=20261126c';

export const $ = (s, r = document) => r.querySelector(s);
export const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
};
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const TILE = D.TILE_BY_ID;
export const fmtAspd = v => (v / 100).toFixed(2).replace('.', ',');
export const fmtNum = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export const SPIN = { active: null };   // trwająca animacja automatu (tryb kasynowy)
export const G = {
  profile: null, run: null, screen: 'loading', fight: null, busy: false, unlocks: [], lastEnd: null,
  setup: { mode: store.get('bulgot:mode') === 'quick' ? 'quick' : 'full', char: 'pyrtek', garnek: 0 },
};
// Skalowanie: na dużych monitorach cały interfejs rośnie (zoom), a --vh to wysokość okna w jednostkach po przeskalowaniu.
// Na komputerze (układ 3-kolumnowy, od 1121 px) skala dopasowuje całość do okna także w dół (min. 0,62), bo ekran gry ma ok. 980 jednostek wysokości.
// Na wąskich ekranach (układ jednokolumnowy, przewijany) skala nie schodzi poniżej 1.
export const DESIGN_H = 980;
export function applyScale() {
  const w = innerWidth, h = innerHeight, root = document.documentElement;
  const sc = w >= 1121 ? Math.max(0.62, Math.min(w / 1440, h / DESIGN_H, 2.2)) : Math.max(1, Math.min(w / 1440, h / 860, 2.2));
  root.style.setProperty('--s', sc.toFixed(3)); root.style.setProperty('--vh', (h / sc).toFixed(1) + 'px');
}
// ---------- drobne narzędzia UI ----------
export function toast(msg, err = false, ms = 2800) {
  const d = document.createElement('div'); d.className = 'toast' + (err ? ' err' : ''); d.textContent = msg;
  $('#toasts').prepend(d); setTimeout(() => d.remove(), ms);
}
export function openOverlay(html, { narrow = false, force = false, cls = '' } = {}) {
  const o = $('#overlay'); o.hidden = false; o.dataset.force = force ? '1' : ''; o.classList.toggle('full', cls.includes('endfull'));   // ekran końca zajmuje cały ekran
  const F = G.fight; if (F && !F.paused && !F.finishing) { F.paused = true; F.autoPaused = true; }   // okno zatrzymuje walkę
  o.innerHTML = `<div class="modal ${narrow ? 'narrow' : ''} ${cls}" role="dialog" aria-modal="true">${force ? '' : '<button class="btn small ghost modal-x" data-act="close" aria-label="Zamknij">Zamknij ✕</button>'}${html}</div>`;
}
export function closeOverlay() {
  const o = $('#overlay'); o.hidden = true; o.innerHTML = ''; o.dataset.force = ''; o.classList.remove('full');
  const F = G.fight; if (F && F.autoPaused) { F.autoPaused = false; F.paused = false; }
}
export const overlayOpen = () => !$('#overlay').hidden;

// Wywołanie serwera z obsługą błędów i aktualizacją stanu (profil, run). Zwraca odpowiedź albo null.
export async function act(path, body) {
  if (G.busy) return null;
  G.busy = true; document.body.classList.add('busy');
  try {
    const { j } = await call(path, body || {});
    if (j && j.profile) { G.profile = j.profile; art.setOutfit(j.profile.wardrobe && j.profile.wardrobe.eq); }
    if (j && j.daily) G.daily = j.daily;
    if (j && 'duelRun' in j) { G.duelRun = j.duelRun; if (j.duelRun) G.duelOff = j.duelRun.now - Date.now(); }   // pojedynek: termin i obrażenia mojego runu
    if (j && 'duel' in j) { G.duel = j.duel; if (j.duel) G.duelOff = j.duel.now - Date.now(); }   // pojedynek: stan meczu
    if (j && 'run' in j) G.run = j.run;
    if (j && j.myGhost !== undefined) G.myGhost = j.myGhost;
    if (!j || j.err) { toast((j && j.err) || 'Coś poszło nie tak. Spróbuj jeszcze raz.', true, 3600); if (j && 'run' in j && G.screen !== 'fight') render(); return null; }
    if (j.voided) toast('Gra dostała aktualizację zasad, więc poprzedni run został unieważniony. Zacznij nowy!', false, 6000);
    if (j.hatched && j.hatched.length) setTimeout(() => showHatched(j.hatched), 80);
    if (j.dino) setTimeout(showDino, 80);
    if (j.ach && j.ach.length) { for (const a of j.ach) { (G.ach = G.ach || []).push(a); toast('Osiągnięcie: ' + a.name, false, 4600); } snd.sfx('unlock'); }
    if (j.unlocks && j.unlocks.length) { for (const u of j.unlocks) { G.unlocks.push(u); toast('Odblokowano: ' + unlockName(u), false, 4200); } snd.sfx('unlock'); }
    return j;
  } finally { G.busy = false; document.body.classList.remove('busy'); }
}
// Wylęgarnia: okno z wyklutym przedmiotem.
export function showHatched(ids) {
  const rows = ids.map(id => { const r = D.RECIPES.find(x => x.out === id); return `<div class="hatch-row">${r.of.map(c => tileCard(c, { static: true, mini: true })).join('<div class="hplus">+</div>')}<div class="hplus">=</div>${tileCard(id, { static: true, mini: true })}</div>`; }).join('');
  snd.sfx('unlock');
  openOverlay(`<h2>Wylęgarnia!</h2><p class="lead">Dwa przedmioty zlepiły się w gnieździe i wykluło się coś legendarnego. Nowy przedmiot ma efekty obu i liczy się do ich zestawów.</p>${rows}<div class="actions" style="margin-top:14px"><button class="btn primary" data-act="close" data-primary>Wspaniale</button></div>`, { narrow: false });
}
export function showDino() {
  snd.sfx('unlock');
  openOverlay(`<h2>Wykluło się!</h2><p class="lead">Jajko Dinozaura pękło po pięciu piętrach. Ptaki to przecież dinozaury, a ten jest wyjątkowo zły.</p><div class="hatch-row">${tileCard('jajko-dinozaura', { static: true, mini: true })}<div class="hplus">=</div>${tileCard('dinozaur', { static: true, mini: true })}</div><div class="actions" style="margin-top:14px"><button class="btn primary" data-act="close" data-primary>Świetnie</button></div>`);
}
// Przepis, który dany kafelek by dokończył (masz już drugi składnik).
export function recipeFor(id) {
  const r = G.run; if (!r) return null;
  return D.RECIPES.find(x => x.of.includes(id) && !r.tiles.includes(x.out) && x.of.every(c => c === id || r.tiles.includes(c))) || null;
}
export const unlockName = u => u.kind === 'char' ? D.CHARS[u.target].name : TILE[u.target].name;
// Ukryte postacie (Zjarany Kurczak) nie zdradzają nazwy, stanowiska ani warunku, dopóki gracz ich nie odblokuje.
export const charView = (c, open) => c.secret && !open ? { hidden: true, name: '???', style: '???', text: T.SECRET_CHAR_TEXT } : { hidden: false, name: c.name, style: c.style, text: c.text };

