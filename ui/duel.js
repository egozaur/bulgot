// Bulgot, interfejs: Pojedynek dla 2 osób (kod, głosowanie na postać i palnik, losowanie, odliczanie, termin 60 s, wynik).
// Stan meczu trzyma serwer (G.duel = widok meczu, G.duelRun = termin i obrażenia mojego runu). Klient tylko pokazuje i odpytuje co 2 s.
import { call } from '../api.js';
import * as D from '../shared/data.js';
import * as T from '../text.js';
import * as snd from '../audio.js';
import { $, G, act, charView, closeOverlay, esc, fmtNum, openOverlay, sleep, store, toast } from './core.js';
import { startFight } from './fight.js';
import { BURNERS, render } from './home.js';
import { animOn } from './side.js';

const DU = { poll: 0, tick: 0, sig: '', picked: null, spin: 0, starting: false, autoFight: false, lastForce: 0, shownResult: '' };
export const srvNow = () => Date.now() + (G.duelOff || 0);
const active = () => !!(G.duel && G.duel.state !== 'done');
const runActive = () => !!(G.run && G.run.phase !== 'over' && G.duelRun);
const mmss = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const charName = id => { const c = D.CHARS[id]; return c ? charView(c, G.profile && G.profile.chars.includes(id)).name : '?'; };
const burnerName = g => BURNERS[g] || String(g);

// ---------- przycisk na ekranie startowym ----------
export function duelBtn() {
  const d = G.duel, on = d && d.state !== 'done';
  return `<button class="btn big duelbtn ${on ? 'on' : ''}" data-act="duel"><span>Pojedynek</span><small>${on ? (d.state === 'lobby' ? 'kod ' + esc(d.code) : 'w toku') : '2 osoby, ten sam run'}</small></button>`;
}

// ---------- wejście z menu ----------
export async function openDuel() {
  const j = await act('duel', { op: 'state' }); if (!j) return;
  DU.sig = ''; paint(true);
}

// Aktualizacja po każdej odpowiedzi serwera z polem duel (wywołują ją akcje i odpytywanie).
export function duelChanged() { ensureLoops(); paint(false); }

// ---------- rysowanie okna pojedynku ----------
function sigOf(d) { return d ? [d.state, d.me.vote && d.me.vote.char, d.me.vote && d.me.vote.garnek, d.rival && d.rival.voted, d.rival && !!d.rival.nick, d.cfg && d.cfg.char, d.result ? (d.result.winner || 'x') : '', d.me.started].join('|') : 'none'; }
function paint(force) {
  const d = G.duel, sg = sigOf(d);
  if (!force && sg === DU.sig) return;
  DU.sig = sg;
  if (!d) return menuHTML();
  if (d.state === 'lobby') return lobbyHTML(d);
  if (d.state === 'vote') return voteHTML(d);
  if (d.state === 'play') { if (!d.me.started) return revealHTML(d); return; }   // trwa mój bieg: okno nie jest potrzebne
  if (d.state === 'done') return resultHTML(d);
}
function menuHTML() {
  openOverlay(`<h2>Pojedynek</h2>
    <p class="lead">Dwóch Kurczaków, ten sam run: te same piętra, bossowie i losowania. Wygrywa ten, kto zajdzie wyżej, a jeśli obaj ukończą 10 pięter, ten, kto zada więcej obrażeń. Na decyzje po każdej walce macie <b>60 sekund</b>, potem walka rusza sama.</p>
    <div class="duel-menu"><button class="btn primary big" data-act="duelcreate" data-primary>Stwórz pojedynek</button>
      <div class="duel-join"><input id="duelcode" maxlength="5" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="KOD" aria-label="Kod pojedynku"><button class="btn big" data-act="dueljoin">Dołącz</button></div></div>
    <p class="hint">Tryb Szybki (10 pięter), pula startowa, bez Kurnika i premii. Wynik nie zmienia rankingu ani rekordów.</p>`, { narrow: true });
  setTimeout(() => { const i = $('#duelcode'); if (i) i.focus(); }, 60);
}
function lobbyHTML(d) {
  openOverlay(`<h2>Pojedynek</h2><p class="lead">Podaj znajomemu ten kod. Gdy dołączy, zaczyna się głosowanie.</p>
    <div class="duel-code" id="duelcodebig" data-act="duelcopy" title="Kliknij, żeby skopiować">${esc(d.code)}</div>
    <p class="lead duel-wait">Czekam na rywala<span class="dots"></span></p>
    <div class="actions"><button class="btn" data-act="duelcopy">Kopiuj kod</button><button class="btn ghost" data-act="duelleave">Zrezygnuj</button></div>`, { narrow: true });
}
function voteHTML(d) {
  const me = d.me.vote, pk = DU.picked || (DU.picked = { char: me ? me.char : G.setup.char || 'pyrtek', garnek: me ? me.garnek : 0 });
  const chars = D.CHAR_IDS.map(id => { const c = charView(D.CHARS[id], G.profile.chars.includes(id)); return `<button class="duelopt ${pk.char === id ? 'sel' : ''}" data-act="duelchar" data-v="${id}"><b>${esc(c.name)}</b><small>${esc(c.style)}</small></button>`; }).join('');
  const burners = BURNERS.map((n, i) => `<button class="duelopt small ${pk.garnek === i ? 'sel' : ''}" data-act="duelgarnek" data-v="${i}"><b>${i}</b><small>${esc(n)}</small></button>`).join('');
  openOverlay(`<h2>Głosowanie <small class="dy-date">z ${esc(d.rival.nick)}</small></h2>
    <p class="lead">Wybierzcie postać i palnik. Jeśli się nie zgodzicie, palnik będzie <b>5</b>, a postać wylosuje się z trzech najsłabszych. Do końca głosowania: <b id="dutimer">${mmss(d.voteDl - srvNow())}</b></p>
    <div class="sec">Postać</div><div class="duel-grid">${chars}</div>
    <div class="sec">Palnik</div><div class="duel-grid burners">${burners}</div>
    <div class="actions"><button class="btn primary big" data-act="duelvote" data-primary>${me ? 'Zmień głos' : 'Zatwierdź głos'}</button>
      <span class="duel-state">${me ? `Twój głos: <b>${esc(charName(me.char))}</b>, palnik <b>${me.garnek}</b>. ` : ''}Rywal: ${d.rival.voted ? '<b>zagłosował</b>' : 'jeszcze wybiera'}</span></div>`, { force: true });
}
function revealHTML(d) {
  const c = d.cfg, pool = c.pool || [];
  openOverlay(`<h2>Pojedynek z ${esc(d.rival.nick)}</h2>
    <div class="duel-reveal"><div class="dr-row"><span>Palnik</span><b>${c.garnek} · ${esc(burnerName(c.garnek))}</b></div>${c.garnekForced ? `<p class="dr-note">${esc(T.DUEL_NO_AGREE_BURNER)}</p>` : ''}
      <div class="dr-row"><span>Postać</span><b id="duelchar" class="${c.charForced ? 'spin' : ''}">${c.charForced ? '…' : esc(charName(c.char))}</b></div>
      ${c.charForced ? `<p class="dr-note" id="duelnote" hidden>${esc(T.DUEL_NO_AGREE_CHAR)}</p>` : ''}
      <div class="duel-go" id="duelgo">Start za <b id="dutimer">${Math.max(0, Math.ceil((d.startAt - srvNow()) / 1000))}</b></div></div>`, { narrow: true, force: true });
  if (c.charForced) spinChar(pool.length ? pool : [c.char], c.char); else DU.spin = 0;
}
async function spinChar(pool, final) {
  const el = () => $('#duelchar'), mark = ++DU.spin;
  const quick = !animOn();
  if (!quick) for (let i = 0, t = 70; i < 20 && DU.spin === mark; i++, t += 14) { const e = el(); if (!e) return; e.textContent = charName(pool[i % pool.length]); snd.sfx('click'); await sleep(t); }
  if (DU.spin !== mark) return;
  const e = el(), n = $('#duelnote'); if (!e) return;
  e.textContent = charName(final); e.classList.remove('spin'); e.classList.add('landed'); if (n) n.hidden = false; snd.sfx('unlock');
}

// Wynik i okno z obietnicą (pełny ekran, dla obu graczy).
function resultHTML(d) {
  const r = d.result; if (!r) { openOverlay(`<h2>Pojedynek zakończony</h2><p class="lead">${d.state === 'done' ? 'Mecz wygasł, bo rywal nie dołączył albo wyszedł.' : ''}</p><div class="actions"><button class="btn primary" data-act="duelleave" data-primary>Wróć do menu</button></div>`, { narrow: true, force: true }); return; }
  const you = r.you || {}, rv = r.rival || {}, win = r.winner === 'me';
  const head = r.draw ? 'Remis' : win ? 'Wygrana!' : 'Porażka';
  const why = r.draw ? 'Tyle samo pięter i obrażeń.' : r.reason === 'dealt' ? (win ? 'Zadałeś więcej obrażeń.' : 'Rywal zadał więcej obrażeń.') : (win ? 'Zaszedłeś wyżej.' : 'Rywal zaszedł wyżej.');
  const row = (n, s) => `<tr><td>${esc(n)}</td><td>${s.done | 0}/${d.rounds}</td><td>${fmtNum(s.dealt | 0)}</td></tr>`;
  snd.sfx(win ? 'win' : r.draw ? 'click' : 'lose');
  openOverlay(`<div class="duel-end"><div class="de-res ${r.draw ? 'draw' : win ? 'win' : 'lose'}"><h2>${head}</h2><p class="lead">${esc(why)}</p>
      <table class="duel-tbl"><thead><tr><th></th><th>Piętra</th><th>Obrażenia</th></tr></thead><tbody>${row('Ty', you)}${row(d.rival ? d.rival.nick : 'Rywal', rv)}</tbody></table></div>
    <div class="de-promise"><p class="dp-big">${esc(T.DUEL_PROMISE_BIG)}</p><p class="dp-small">${esc(T.DUEL_PROMISE_SMALL)}</p></div>
    <div class="actions"><button class="btn primary big" data-act="duelleave" data-primary>Wróć do menu</button></div></div>`, { force: true, cls: 'endfull duelraise' });
}
// Mój bieg się skończył (z showEnd): pokazujemy wynik własny i czekamy na rywala, albo od razu wynik meczu.
export function showDuelEnd() {
  const d = G.duel, r = G.run;
  if (d && d.state === 'done') { DU.sig = ''; return paint(true); }
  const dealt = G.duelRun ? G.duelRun.dealt | 0 : 0;
  openOverlay(`<h2>Twój bieg zakończony</h2><p class="lead">Piętra: <b>${r.done}/${r.rounds}</b>, zadane obrażenia: <b>${fmtNum(dealt)}</b>${r.ended === 'win' ? ' (Prezes pokonany!)' : ''}.</p>
    <p class="lead duel-wait">Czekam, aż rywal skończy<span class="dots"></span></p><div class="duel-rivalbox" id="duelrival"></div>`, { narrow: true, force: true });
  DU.sig = 'end'; ensureLoops(); updateRival();
}
function updateRival() { const b = $('#duelrival'), d = G.duel; if (b && d && d.rival && d.rival.prog) b.innerHTML = rivalLine(d); }
function rivalLine(d) {
  const p = d.rival.prog; if (!p) return `<b>${esc(d.rival.nick)}</b>: jeszcze nie zaczął`;
  return `<b>${esc(d.rival.nick)}</b>: piętro ${p.over ? p.done : p.round}/${d.rounds}${p.over ? (p.ended === 'win' ? ', ukończył run' : p.ended === 'noshow' ? ', nie stawił się' : ', odpadł') : `, życie ${p.hp}%`}`;
}

// ---------- pętle: odpytywanie serwera i zegar ----------
function ensureLoops() {
  const on = active() || runActive();
  if (on && !DU.poll) DU.poll = setInterval(pollDuel, 2000);
  if (!on && DU.poll) { clearInterval(DU.poll); DU.poll = 0; }
  if (on && !DU.tick) DU.tick = setInterval(tickDuel, 250);
  if (!on && DU.tick) { clearInterval(DU.tick); DU.tick = 0; removeHud(); }
}
export async function pollDuel(force = false) {
  if (G.busy || G.fight) return;
  const before = G.run;
  const { j } = await call('duel', { op: 'state' });
  if (!j || j.err || G.busy || G.fight || G.run !== before) return;
  if ('duel' in j) { G.duel = j.duel; if (j.duel) G.duelOff = j.duel.now - Date.now(); }
  if ('duelRun' in j) G.duelRun = j.duelRun;
  const r = j.run, o = G.run;
  if (r && o && (r.phase !== o.phase || r.round !== o.round || r.phase === 'over' && o.phase !== 'over')) {   // serwer sam rozstrzygnął termin
    G.run = r; if (j.profile) G.profile = j.profile;
    if (r.phase === 'over') { G.screen = 'run'; return showDuelEnd(); }
    if (G.screen === 'run') render();
  }
  if (!active() && !runActive()) ensureLoops();
  paint(false); updateRival();
}
function tickDuel() {
  const d = G.duel;
  if (d && d.state === 'vote') { const t = $('#dutimer'); if (t) t.textContent = mmss(d.voteDl - srvNow()); }
  if (d && d.state === 'play' && !d.me.started) {
    const left = d.startAt - srvNow(), t = $('#dutimer'); if (t) t.textContent = Math.max(0, Math.ceil(left / 1000));
    if (left <= -400 && !DU.starting) beginRun();   // mały zapas na różnicę zegarów
  }
  hudTick();
}
async function beginRun() {
  DU.starting = true;
  try {
    for (let i = 0; i < 6; i++) {
      const j = await act('start', { duel: true });
      if (j) { closeOverlay(); snd.sfx('bulgot'); G.screen = 'run'; render(); ensureLoops(); return; }
      if (G.run && G.run.phase !== 'over') { closeOverlay(); G.screen = 'run'; render(); return; }
      await sleep(900);
    }
    toast('Nie udało się wejść do pojedynku. Spróbuj odświeżyć stronę.', true, 6000);
  } finally { DU.starting = false; }
}

// ---------- pasek terminu (HUD) ----------
function hudEl() {
  let h = $('#duelhud');
  if (!h) { h = document.createElement('div'); h.id = 'duelhud'; h.setAttribute('role', 'status'); document.body.appendChild(h); }
  return h;
}
function removeHud() { const h = $('#duelhud'); if (h) h.remove(); }
export function hudTick() {
  if (!runActive()) { removeHud(); return; }
  const r = G.run, d = G.duelRun, left = d.dl - srvNow(), fighting = !!G.fight, waiting = r.phase === 'fight' && !fighting;
  const label = fighting ? 'walka' : waiting ? 'start walki' : 'decyzje';
  const rv = G.duel && G.duel.rival && G.duel.rival.prog, rvs = !G.duel || !G.duel.rival ? '' : ` · ${esc(G.duel.rival.nick.slice(0, 9))}: ${rv ? (rv.over ? 'koniec, p.' + rv.done : 'p.' + rv.round + ', ' + rv.hp + '%') : 'czeka'}`;
  const urgent = !fighting && left < 10000, inner = fighting ? `<b>Pojedynek</b>${rvs}` : `<b>${mmss(left)}</b> <span>${label}</span>${rvs}`, top = $('#dutop');
  if (top && !fighting) { removeHud(); top.className = 'pill duelt' + (urgent ? ' urgent' : ''); top.innerHTML = inner; }   // na ekranie runu pasek jest częścią górnego paska
  else { const h = hudEl(); h.className = (urgent ? 'urgent ' : '') + (fighting ? 'fighting' : ''); h.innerHTML = inner; }
  // Walka rusza sama, gdy kończy się czas na jej start (serwer i tak rozstrzygnie ją po terminie).
  if (waiting && left < 900 && !G.busy && !DU.autoFight) { DU.autoFight = true; autoFight(); }
  if (!waiting && !fighting && left < -1800 && !G.busy && Date.now() - DU.lastForce > 2200) { DU.lastForce = Date.now(); pollDuel(true); }   // serwer sam zdecyduje po terminie
}
async function autoFight() {
  try {
    const j = await act('fightstart'); if (!j || !j.setup) return;
    closeOverlay(); snd.unlock(); startFight(j.setup);
  } finally { DU.autoFight = false; }
}

// ---------- akcje z ACT (input.js) ----------
export const DUEL_ACT = {
  duel: () => openDuel(),
  duelcreate: async () => { const j = await act('duel', { op: 'create' }); if (j) { DU.sig = ''; DU.picked = null; duelChanged(); } },
  dueljoin: async () => { const code = ($('#duelcode') || {}).value; if (!code || !code.trim()) return toast('Wpisz kod od znajomego.', true); const j = await act('duel', { op: 'join', code: code.trim() }); if (j) { DU.sig = ''; DU.picked = null; duelChanged(); } },
  duelchar: b => { (DU.picked || (DU.picked = { char: 'pyrtek', garnek: 0 })).char = b.dataset.v; snd.sfx('click'); DU.sig = ''; paint(true); },
  duelgarnek: b => { (DU.picked || (DU.picked = { char: 'pyrtek', garnek: 0 })).garnek = +b.dataset.v; snd.sfx('click'); DU.sig = ''; paint(true); },
  duelvote: async () => { const v = DU.picked; if (!v) return; const j = await act('duel', { op: 'vote', vote: v }); if (j) { snd.sfx('pick'); DU.sig = ''; duelChanged(); } },
  duelleave: async () => {
    if (G.run && G.run.phase !== 'over' && G.duelRun) await act('abandon');   // mecz rozstrzygnięty, a mój bieg jeszcze trwa: kończymy go
    const j = await act('duel', { op: 'leave' }); closeOverlay(); DU.sig = ''; DU.picked = null;
    if (j !== null) { G.duel = null; G.duelRun = null; }
    G.screen = 'home'; ensureLoops(); render();
  },
  duelcopy: async () => { const c = G.duel && G.duel.code; if (!c) return; try { await navigator.clipboard.writeText(c); toast('Kod skopiowany: ' + c); } catch (e) { toast('Kod: ' + c); } },
};
// Po odświeżeniu strony: jeśli mecz trwa, wracamy do niego.
export async function resumeDuel() {
  const { j } = await call('duel', { op: 'state' });   // bez act(): nie może zająć G.busy i połknąć kliknięcia gracza tuż po starcie
  if (!j || j.err || !j.duel) return;
  G.duel = j.duel; G.duelOff = j.duel.now - Date.now(); if ('duelRun' in j) G.duelRun = j.duelRun;
  ensureLoops();
  if (G.duel.state === 'play' && G.duel.me.started && G.run && G.run.phase !== 'over') { G.screen = 'run'; render(); }
  else if (G.duel.state === 'done' && G.run && G.run.duel !== undefined) return;
  else { DU.sig = ''; paint(true); }
}
