// Bulgot, interfejs: ekran końca runu, osiągnięcia, ciekawostki, wysyłanie do analizy.
// Wydzielone z app.js (2026-11-24). Wszystkie funkcje i stałe są eksportowane i dzielą stan przez G (ui/core.js).
import * as D from '../shared/data.js';
import * as art from '../art.js';
import * as T from '../text.js';
import * as F from '../fabula.js';
import * as snd from '../audio.js';
import { failFacts, pickFacts, winFacts } from '../fakty.js';
import { createMemory } from '../fakty-pamiec.js';
import { $, G, TILE, act, closeOverlay, esc, fmtNum, openOverlay, store, toast, unlockName } from './core.js';
import { cls, feathers } from './fight.js';
import { BURNERS, render } from './home.js';
import { showDuelEnd } from './duel.js';
import { dismissInvoice } from './invoice.js';
import { endExtrasHTML } from './meta.js';
import { setOwned, tileCard } from './run.js';
import { REDUCED } from './side.js';
import { showHistory } from './windows.js';

export function takeAch() { const a = G.ach || []; G.ach = []; return a; }
export function achHTML(list) {
  if (!list.length) return '';
  return `<div class="ach-new"><div class="sec">Nowe osiągnięcia</div>${list.map(a => `<div class="ach-row got">${art.medal(a.g, a.s)}<div><b>${esc(a.name)}</b><span>${esc(a.text)}</span></div></div>`).join('')}</div>`;
}
export function takeUnlocks() { const u = G.unlocks; G.unlocks = []; return u; }
export function unlocksHTML(list) {
  if (!list.length) return '';
  return list.map(u => `<div class="unlock-box"><b>Odblokowano ${u.kind === 'char' ? 'postać' : 'kafelek'}: ${esc(unlockName(u))}</b><div class="hint" style="text-align:left">${esc(u.text)}</div></div>`).join('');
}

// Po przegranej: kto awansował (Nemezis).
export function endMeta(j) {
  const r = G.run, p = G.profile, out = [];
  if (r.ended !== 'lose') return '';
  if (j.result && p.nemesis) { const n = p.nemesis, t = n.tile && TILE[n.tile]; out.push(`<div class="unlock-box nembox"><b>Awans Wroga: ${esc(n.name)}${n.lvl > 1 ? ' (awans ' + n.lvl + '.)' : ''}</b><div class="hint" style="text-align:left">${n.lvl > 1 ? 'Znowu wygrał i awansował wyżej.' : 'Twój zabójca dostał awans i cechę ' + esc(D.AFFIXES[n.affix].name) + '.'}${t ? ' Ukradł ci: ' + esc(t.name) + '.' : ''} Czeka na ciebie w następnym runie.</div></div>`); }
  return out.join('');
}
// Wynik na ekranie końca nabija się od zera (licznik jak w automacie); bez animacji przy prefers-reduced-motion.
export function countUp(el, quiet) {
  if (!el || quiet || REDUCED.matches) return;
  const to = +el.dataset.v, t0 = performance.now(), dur = Math.min(2600, 900 + to / 20);
  const step = now => { if (!el.isConnected) return; const q = Math.min(1, (now - t0) / dur); el.textContent = fmtNum(Math.round(to * (1 - Math.pow(1 - q, 3)))); if (q < 1) requestAnimationFrame(step); else el.classList.add('done'); };
  el.textContent = '0'; setTimeout(() => requestAnimationFrame(step), 700);
}
// „Wyślij do analizy”: kopia zakończonego runu (z dziennikiem rund) trafia na serwer, skąd ją odbiera autor gry do strojenia balansu.
export const ANALYZE_TAGS = [['za-latwo', 'Za łatwo'], ['za-trudno', 'Za trudno'], ['nudne', 'Nudne'], ['blad', 'Błąd w grze'], ['niejasne', 'Niejasne zasady'], ['super', 'Super zabawa']];
export const analyzeHTML = (id, sent) => sent
  ? '<div class="analyze-ok">✓ Wysłano do analizy. Dziękuję, to naprawdę pomaga w strojeniu gry!</div>'
  : `<div class="analyze-row"><button class="btn" data-act="analyze" data-id="${esc(id)}">Wyślij do analizy</button></div><div class="hint">Wyślemy przebieg tej gry (wybory, wrogów, statystyki), żeby zbadać balans. Bez danych osobowych.</div>`;
// Okno przed wysłaniem: pytanie o komentarz (co poszło za łatwo, źle itd.), który trafia do pliku partii razem z jej przebiegiem.
export function showAnalyzeDialog(id, from) {
  G.ana = { id, from };
  openOverlay(`<h2>Wyślij do analizy</h2>
    <p class="lead">Chcesz dodać komentarz? Napisz, co poszło za łatwo, za trudno albo źle. Trafi do pliku razem z przebiegiem tej gry.</p>
    <div class="atags">${ANALYZE_TAGS.map(([v, n]) => `<button class="atag" data-act="atag" data-v="${v}" aria-pressed="false">${n}</button>`).join('')}</div>
    <textarea id="anote" class="anote" rows="4" maxlength="300" placeholder="Twój komentarz (opcjonalnie), np. „walki kończą się w 2 sekundy, bo trzy umiejętności zabijają wszystko”" aria-label="Komentarz do analizy"></textarea>
    <div class="actions" style="margin-top:14px"><button class="btn primary" data-act="asend" data-primary>Wyślij</button><button class="btn" data-act="asend0">Wyślij bez komentarza</button><button class="btn ghost" data-act="acancel">Wróć</button></div>`, { narrow: true, force: true });
  const t = $('#anote'); if (t) t.focus();
}
export async function sendAnalysis(withNote) {
  const a = G.ana; if (!a) return;
  const note = withNote ? (($('#anote') || {}).value || '').trim() : '', tags = withNote ? [...document.querySelectorAll('.atag.on')].map(x => x.dataset.v) : [];
  const j = await act('analysis', { id: a.id, note, tags }); if (!j) return;
  (G.sentRuns || (G.sentRuns = {}))[a.id] = true; snd.sfx('unlock'); toast('Wysłano do analizy. Dziękuję!');
  backFromAnalyze();
}
export function backFromAnalyze() { const f = G.ana && G.ana.from; if (f === 'hist') showHistory(); else if (G.lastEndJ) showEnd(G.lastEndJ, true); else closeOverlay(); }
// Pamięć ciekawostek (dziennik runu, historia, pamięć pięter, rekordy wstydu, zakład): localStorage przez store, patrz fakty-pamiec.js.
// leniwie: moduły ui/* importują się cyklicznie, więc store z core.js bywa jeszcze niezainicjowany przy ładowaniu tego pliku
let fmInst = null;
export const fm = () => fmInst || (fmInst = createMemory(store));
// Kontekst ciekawostek na ekranie końca: ostatnia walka, cały run (dziennik z finishFight), historia poprzednich runów i dane serwera.
export function endFacts(j, win) {
  const r = G.run, M = D.MODES[r.mode], res = j.result || (G.lastEndJ && G.lastEndJ.result) || null, seed = parseInt(String(r.id).slice(-6), 10) || 0;
  const e = G.lastEnd || {}, st = r.stats || {};
  const skillDef = s => D.SKILLS[s.id] || {};
  const c = {
    runId: r.id, win, mode: r.mode, modeName: M.name, rounds: M.rounds, round: r.round, garnek: r.garnek, garnekName: D.GARNEK[r.garnek].name, char: r.char, seed,
    result: res, coins: r.coins, score: r.score, best: e.prevBest || 0, newBest: !!e.newBest, above: e.above || null, floor: e.floor || null,
    stats: st, rerolls: st.rerolls || 0, buys: st.buys || 0, flawless: st.flawless || 0, maxHit: st.maxHit || 0, rested: !!r.rested, restCost: r.restCost, restPct: r.restPct,
    hasSkills: r.skills.length > 0, skillName: r.skills.length ? skillDef(r.skills[0]).name || '' : '',
    stunSkill: (r.skills.map(skillDef).find(d => /^Ogłusza/.test(d.text || '')) || {}).name || '',
    runs: G.profile.counters.runs, maxGarnek: D.GARNEK.length - 1, garnekScore: D.RULES.garnekScore, fullRounds: D.MODES.full.rounds,
    scoreRound: D.RULES.scoreRound, scoreCoin: D.RULES.scoreCoin, prices: D.RULES.prices,
    log: fm().log(r.id), hist: fm().hist().filter(h => h.id !== r.id), mem: fm().floors(), shame: fm().shame(), seen: fm().seen(), now: fm().now(), bet: fm().bet(),
  };
  G.factsCtx = c;
  if (win) { store.set('bulgot:lastlose', 'null'); return winFacts(c); }
  const k = r.killer, kd = k && (D.ENEMIES[k.enemy] || D.BOSSES[k.enemy]);
  const boss = r.boss ? D.BOSSES[r.boss] : null;
  // seria porażek na tym samym piętrze (zapamiętana w przeglądarce, liczona raz na run)
  if (!G.streakOf || G.streakOf.id !== r.id) {
    let last = null; try { last = JSON.parse(store.get('bulgot:lastlose') || 'null'); } catch (e) {}
    const n = last && last.mode === r.mode && last.round === r.round && last.garnek === r.garnek ? last.count + 1 : 1;
    store.set('bulgot:lastlose', JSON.stringify({ mode: r.mode, round: r.round, garnek: r.garnek, count: n })); G.streakOf = { id: r.id, n };
  }
  const sets = Object.entries(D.SETS).map(([id, st]) => ({ id, name: st.name, n: setOwned(id) })).filter(x => x.n === 1);
  Object.assign(c, {
    abandoned: !res && r.ended === 'lose', boss: !!boss, bossName: boss ? boss.name : '', killer: kd || null, killerId: k ? k.enemy : null, killerName: kd ? kd.name : '', nemesis: !!(k && k.nemesis),
    setHint: sets.length ? sets[0].name : '', streak: G.streakOf.n, nr: (G.fabNr || {})[r.id] || null,
  });
  return failFacts(c);
}
// Wybór jednej ciekawostki i zapis do pamięci (raz na run). Po przeładowaniu strony ten sam run dostaje tę samą ciekawostkę z historii.
export function chooseFacts(j, win) {
  const r = G.run, done = fm().hist().find(h => h.id === r.id);
  if (done) return done.fact ? [done.fact] : [];
  const f = pickFacts(endFacts(j, win));
  fm().commit(G.factsCtx, f[0] || null);
  return f;
}
// Porażka: „Pracownik nr N zakończył współpracę na piętrze X” plus puenta wg strefy. Numer rośnie o 1 na run (zapis w przeglądarce),
// ostatnia śmierć trafia do radiowęzła następnego runu (floorKronHTML). Wygrana kasuje ślad.
function lossLines(r) {
  const nr = (G.fabNr || (G.fabNr = {}));
  if (!nr[r.id]) {
    let last = 4811; try { last = parseInt(store.get('bulgot:prac'), 10) || 4811; } catch (e) {}
    nr[r.id] = last + 1; store.set('bulgot:prac', String(nr[r.id]));
    const ch = D.CHARS[r.char]; store.set('bulgot:lastdeath', JSON.stringify({ n: nr[r.id], p: r.round, who: ch ? ch.name : 'bohater' }));
  }
  const seed = parseInt(String(r.id).slice(-6), 10) || r.done || 0;
  return F.porazkaTekst({ n: nr[r.id], floor: r.round, zone: r.zone, boss: !!r.boss, seed, extra: T.LOSE_LINES });
}
// Po pokonaniu Prezesa: oferta awansu. Wybór zmienia tylko epilog (czysty obraz, wynik i ranking liczy serwer).
export function showOffer(j) {
  G.offerJ = j;
  openOverlay(`<div class="offer"><div class="of-pres">${art.prezesArt()}</div><div class="of-say"><small>Prezes Rosołowski</small>
    <p>„${esc(F.OFERTA.po)}”</p><p>„${esc(F.OFERTA.oferta)}”</p></div>
    <div class="actions"><button class="btn primary big" data-act="offerfree" data-primary>Uciekam</button><button class="btn big" data-act="offerprom">Przyjmuję awans</button></div></div>`, { narrow: true, force: true });
}
export function chooseEnding(v) {
  const r = G.run, j = G.offerJ; if (!r || !j) return;
  (G.fabChoice || (G.fabChoice = {}))[r.id] = v; G.offerJ = null; closeOverlay(); showEnd(j);
}
export function showEnd(j, quiet = false) {
  if (G.duelRun) return showDuelEnd();   // pojedynek ma własny ekran końca (bez rekordów, Stażu i analizy)
  if (!quiet && G.run && G.run.ended === 'win' && !(G.fabChoice && G.fabChoice[G.run.id])) return showOffer(j);
  const r = G.run, e = j.end || (G.lastEndJ && G.lastEndJ.end) || {}, win = r.ended === 'win', un = takeUnlocks();
  const mult = (100 + D.RULES.garnekScore * r.garnek) / 100;
  G.lastEnd = e; G.lastEndJ = j.result || !G.lastEndJ ? j : { ...j, result: G.lastEndJ.result };
  dismissInvoice(true);
  if (!quiet) { snd.sfx(win ? 'win' : 'lose'); if (!win) snd.sfx('bulgot'); }
  if (win) store.set('bulgot:lastdeath', '');
  const ending = win ? ((G.fabChoice && G.fabChoice[r.id]) || 'ucieczka') : null, tk = F.TECZKI[r.char];
  const lines = !win ? lossLines(r)
    : ending === 'awans' ? [`Prezes Rosołowski: „${F.OFERTA.awans}”`, F.AWANS_WSPOLNY + (tk ? ' ' + tk.awans : ''), T.END_WIN.lines[1]]
    : [`Prezes Rosołowski: „${F.OFERTA.ucieczka}”`, T.END_WIN.lines[0], tk ? tk.ucieczka : ''].filter(Boolean);
  const endTitle = win ? (ending === 'awans' ? T.END_WIN.title : 'WOLNOŚĆ!') : T.END_LOSE.title;
  const feathers = win ? [8, 18, 27, 36, 45, 55, 63, 72, 81, 90].map((x, i) => `<i style="left:${x}%;--r:${(i * 67) % 360}deg;--dl:${(i * 0.17).toFixed(2)}s;--dx:${(i % 2 ? 1 : -1) * (10 + i * 3)}px"></i>`).join('') : '';
  const scene = `<div class="endscene ${win ? 'win' : 'lose'}" aria-hidden="true"><div class="es-steam"><i></i><i></i><i></i></div><div class="es-clip"><div class="es-hero">${art.portrait(r.char, r.form)}</div></div><div class="es-pot">${art.potArt(win)}</div>${win ? `<div class="es-confetti">${feathers}</div>` : ''}</div>`;
  // Ciekawostka jest wybierana raz na run (ponowne otwarcie ekranu, także po przeładowaniu strony, pokazuje tę samą); rotację pilnuje fakty-pamiec.js.
  if (!G.factsOf || G.factsOf.id !== r.id) G.factsOf = { id: r.id, facts: chooseFacts(G.lastEndJ, win) };
  const facts = G.factsOf.facts;
  // pełny ekran: po lewej scena, tytuł i ciekawostki; po prawej rachunek, rekordy, odblokowania i przyciski
  openOverlay(`<div class="endwrap ${win ? 'win' : 'lose'}"><div class="end-left">${scene}<h2 class="end-title ${win ? '' : 'lose'}">${endTitle}</h2>
    ${lines.map(l => `<p class="lead">${esc(l)}</p>`).join('')}${win ? `<p class="mailfoot">${esc(F.STOPKA[ending])}</p>` : ''}
    ${facts.length ? `<div class="facts">${facts.map((f, i) => `<div class="fact ${i ? 'second' : ''}" style="--i:${i}"><span class="fk">${i ? 'I jeszcze' : 'Ciekawostka'}</span>${esc(f.text)}</div>`).join('')}</div>` : ''}</div>
    <div class="end-right"><div class="end-scroll"><table class="scoretable"><tr><td>Ukończone piętra (${r.done} × ${D.RULES.scoreRound})</td><td>${fmtNum(r.done * D.RULES.scoreRound)}</td></tr>
      <tr><td>Ziarna w kieszeni (${r.coins} × ${D.RULES.scoreCoin})</td><td>${fmtNum(r.coins * D.RULES.scoreCoin)}</td></tr>
      <tr><td>Premia za szybkość walk</td><td>${fmtNum(r.timeBonus)}</td></tr>
      ${r.garnek ? `<tr><td>Mnożnik Garnka ${r.garnek} (${D.GARNEK[r.garnek].name})</td><td>×${mult.toFixed(2).replace('.', ',')}</td></tr>` : ''}
      ${r.curses && r.curses.length ? `<tr><td>Klątwy Prezesa (${r.curses.map(c => esc(D.CURSES[c].name)).join(', ')})</td><td>×${(1 + D.cursePct(r.curses) / 100).toFixed(2).replace('.', ',')}</td></tr>` : ''}
      ${r.endless ? `<tr><td>Dogrywka: piętra ponad limit (${Math.max(0, r.done - (r.cleared || 0))})</td><td>♾</td></tr>` : ''}
      <tr class="total"><td>Wynik</td><td id="endscore" data-v="${r.score}">${fmtNum(r.score)}</td></tr></table>
    ${e.newBest ? '<p class="lead" style="color:var(--gold)"><b>Nowy rekord życiowy w tym trybie!</b></p>' : ''}
    ${e.rank && !e.daily ? `<p class="lead">Miejsce w rankingu (${D.MODES[r.mode].name}): <b>#${e.rank}</b></p>` : ''}${endExtrasHTML(e)}
    ${e.feathers ? `<p class="lead">${art.emo('pioro')} Pióra do Kurnika: <b>+${e.feathers}</b> (razem ${G.profile.feathers | 0})</p>` : ''}${e.garnekUnlocked ? `<div class="unlock-box"><b>Odblokowano poziom palnika ${G.profile.garnek}: ${esc(BURNERS[G.profile.garnek])} (${esc(D.GARNEK[G.profile.garnek].name)})</b></div>` : ''}${unlocksHTML(un)}${achHTML(takeAch())}${endMeta(j)}
    <div class="analyze" id="analyzebox">${analyzeHTML(r.id, !!(G.sentRuns && G.sentRuns[r.id]))}</div></div>
    <div class="actions end-actions"><button class="btn primary big" data-act="again" data-primary>Zagraj jeszcze raz</button><button class="btn" data-act="ranking">Ranking</button><button class="btn ghost" data-act="home">Menu</button></div></div></div>`, { force: true, cls: 'endfull' });
  G.screen = 'home'; render();
  countUp($('#endscore'), quiet);
}

