// Bulgot, interfejs: ekran końca runu (porażka: półka sklepowa z rosołem pracownika), osiągnięcia, ciekawostki, zgłaszanie błędów.
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
import { endExtrasHTML, endStazPill } from './meta.js';
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

// Po przegranej: kto awansował (Nemezis) jako „Pismo kadrowe” z portretem wroga, cechą i ukradzionym przedmiotem.
export function endMeta(j, nr) {
  const r = G.run, p = G.profile;
  if (r.ended !== 'lose' || !j.result || !p.nemesis) return '';
  const n = p.nemesis, t = n.tile && TILE[n.tile], aff = D.AFFIXES[n.affix], en = D.ENEMIES[n.enemy];
  return `<div class="es-pismo"><div class="ph"><span>Pismo kadrowe</span><em>Dział Kadr · Rosołownia Regionalna</em></div>
    <div class="pr"><div class="port">${art.enemyArt(en ? en.art : 'rat')}<i class="tie"></i></div><div class="px"><div class="pt">Awans Wroga${n.lvl > 1 ? ' (awans ' + n.lvl + '.)' : ''}</div><div class="pn">${esc(n.name)}</div>
      <div class="pc">${aff ? `<b>cecha: ${esc(aff.name)}</b>` : ''}${t ? `<span class="ukr">${art.tileIcon(n.tile)}ukradł ci: ${esc(t.name)}</span>` : ''}</div></div></div>
    <p class="pd">${n.lvl > 1 ? 'Znowu wygrał i awansował wyżej.' : 'Twój zabójca dostał awans' + (aff ? ' i cechę ' + esc(aff.name) : '') + '.'}${t ? ' Ukradł ci: ' + esc(t.name) + '.' : ''} Czeka na ciebie w następnym runie.</p>
    <div class="ps"><b>AWANS ZATWIERDZONY</b>${nr ? `<span>kosztem pracownika nr ${nr}</span>` : ''}</div></div>`;
}
// Wiersze rachunku (bez wiersza „Wynik”): ten sam zestaw na ekranie porażki (rozwijany) i wygranej (tabela).
function scoreRows(r) {
  const mult = (100 + D.RULES.garnekScore * r.garnek) / 100;
  return `<tr><td>Ukończone piętra (${r.done} × ${D.RULES.scoreRound})</td><td>${fmtNum(r.done * D.RULES.scoreRound)}</td></tr>
      <tr><td>Ziarna w kieszeni (${r.coins} × ${D.RULES.scoreCoin})</td><td>${fmtNum(r.coins * D.RULES.scoreCoin)}</td></tr>
      <tr><td>Premia za szybkość walk</td><td>${fmtNum(r.timeBonus)}</td></tr>
      ${r.garnek ? `<tr><td>Mnożnik Garnka ${r.garnek} (${D.GARNEK[r.garnek].name})</td><td>×${mult.toFixed(2).replace('.', ',')}</td></tr>` : ''}
      ${r.curses && r.curses.length ? `<tr><td>Klątwy Prezesa (${r.curses.map(c => esc(D.CURSES[c].name)).join(', ')})</td><td>×${(1 + D.cursePct(r.curses) / 100).toFixed(2).replace('.', ',')}</td></tr>` : ''}
      ${r.endless ? `<tr><td>Dogrywka: piętra ponad limit (${Math.max(0, r.done - (r.cleared || 0))})</td><td>♾</td></tr>` : ''}`;
}
// Regał sklepu firmowego: ten sam pracownik w słoikach, kostkach i kartonach (jego sztuki podświetlone), sąsiedzi to koledzy z poprzednich numerów.
function shelfHTML(nr, floor, total) {
  const it = (svg, n, me, kind) => `<div class="sh-it${me ? ' me' : ''}">${svg}<div class="sh-pt">${me ? 'NR ' + n + ' · NIE NA SPRZEDAŻ' : kind + ' ' + n}</div></div>`;
  const jars = [-4, -3, -2, -1, 0, 1, 2].map(d => it(art.rosolJar(nr + d, d ? 0 : floor, d ? 0 : total), nr + d, !d, 'SŁOIK'));
  const cubes = [-3, -2, 0, 1].map(d => it(art.rosolCube(nr + d), nr + d, !d, 'KOSTKA'));
  const boxes = [-1, 0, 2].map(d => it(art.rosolBox(nr + d, d ? 0 : floor), nr + d, !d, 'KARTON'));
  return `<div class="es-shelf" aria-hidden="true"><div class="es-sign">Sklep firmowy · Rosołownia Regionalna</div><div class="es-cab"><div class="es-row">${jars.join('')}</div><div class="es-plank"></div><div class="es-row">${cubes.join('')}${boxes.join('')}</div><div class="es-plank"></div></div></div>`;
}
// Wynik na ekranie końca nabija się od zera (licznik jak w automacie); bez animacji przy prefers-reduced-motion.
export function countUp(el, quiet) {
  if (!el || quiet || REDUCED.matches) return;
  const to = +el.dataset.v, t0 = performance.now(), dur = Math.min(2600, 900 + to / 20);
  const step = now => { if (!el.isConnected) return; const q = Math.min(1, (now - t0) / dur); el.textContent = fmtNum(Math.round(to * (1 - Math.pow(1 - q, 3)))); if (q < 1) requestAnimationFrame(step); else el.classList.add('done'); };
  el.textContent = '0'; setTimeout(() => requestAnimationFrame(step), 700);
}
// „Zgłoś błąd” (dawniej „Wyślij do analizy”, akcja nadal data-act="analyze"): kopia zakończonego runu (z dziennikiem rund) trafia na serwer,
// skąd ją odbiera autor gry do strojenia balansu. Na ekranie końca to mały przyciemniony link z ikoną w rogu.
export const ANALYZE_TAGS = [['za-latwo', 'Za łatwo'], ['za-trudno', 'Za trudno'], ['nudne', 'Nudne'], ['blad', 'Błąd w grze'], ['niejasne', 'Niejasne zasady'], ['super', 'Super zabawa']];
export const analyzeHTML = (id, sent) => sent
  ? '<span class="analyze-ok">✓ Zgłoszenie wysłane. Dziękuję!</span>'
  : `<button class="es-bugbtn" data-act="analyze" data-id="${esc(id)}" data-tip="Wyślemy przebieg tej gry (wybory, wrogów, statystyki), żeby zbadać błąd albo balans. Bez danych osobowych.">${art.bugIcon()}<span>Zgłoś błąd</span></button>`;
// Okno przed wysłaniem: pytanie o komentarz (co poszło za łatwo, źle itd.), który trafia do pliku partii razem z jej przebiegiem.
export function showAnalyzeDialog(id, from) {
  G.ana = { id, from };
  openOverlay(`<h2>Zgłoś błąd</h2>
    <p class="lead">Chcesz dodać komentarz? Napisz, co poszło za łatwo, za trudno albo się zepsuło. Wyślemy go razem z przebiegiem tej gry (wybory, wrogów, statystyki), bez danych osobowych.</p>
    <div class="atags">${ANALYZE_TAGS.map(([v, n]) => `<button class="atag" data-act="atag" data-v="${v}" aria-pressed="false">${n}</button>`).join('')}</div>
    <textarea id="anote" class="anote" rows="4" maxlength="300" placeholder="Twój komentarz (opcjonalnie), np. „walki kończą się w 2 sekundy, bo trzy umiejętności zabijają wszystko”" aria-label="Komentarz do analizy"></textarea>
    <div class="actions" style="margin-top:14px"><button class="btn primary" data-act="asend" data-primary>Wyślij</button><button class="btn" data-act="asend0">Wyślij bez komentarza</button><button class="btn ghost" data-act="acancel">Wróć</button></div>`, { narrow: true, force: true });
  const t = $('#anote'); if (t) t.focus();
}
export async function sendAnalysis(withNote) {
  const a = G.ana; if (!a) return;
  const note = withNote ? (($('#anote') || {}).value || '').trim() : '', tags = withNote ? [...document.querySelectorAll('.atag.on')].map(x => x.dataset.v) : [];
  const j = await act('analysis', { id: a.id, note, tags }); if (!j) return;
  (G.sentRuns || (G.sentRuns = {}))[a.id] = true; snd.sfx('unlock'); toast('Zgłoszenie wysłane. Dziękuję!');
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
  G.lastEnd = e; G.lastEndJ = j.result || !G.lastEndJ ? j : { ...j, result: G.lastEndJ.result };
  dismissInvoice(true);
  if (!quiet) { snd.sfx(win ? 'win' : 'lose'); if (!win) snd.sfx('bulgot'); }
  if (win) store.set('bulgot:lastdeath', '');
  const ending = win ? ((G.fabChoice && G.fabChoice[r.id]) || 'ucieczka') : null, tk = F.TECZKI[r.char];
  const lines = !win ? lossLines(r)
    : ending === 'awans' ? [`Prezes Rosołowski: „${F.OFERTA.awans}”`, F.AWANS_WSPOLNY + (tk ? ' ' + tk.awans : ''), T.END_WIN.lines[1]]
    : [`Prezes Rosołowski: „${F.OFERTA.ucieczka}”`, T.END_WIN.lines[0], tk ? tk.ucieczka : ''].filter(Boolean);
  const endTitle = win ? (ending === 'awans' ? T.END_WIN.title : 'WOLNOŚĆ!') : T.END_LOSE.title;
  // Ciekawostka jest wybierana raz na run (ponowne otwarcie ekranu, także po przeładowaniu strony, pokazuje tę samą); rotację pilnuje fakty-pamiec.js.
  if (!G.factsOf || G.factsOf.id !== r.id) G.factsOf = { id: r.id, facts: chooseFacts(G.lastEndJ, win) };
  const facts = G.factsOf.facts;
  const bug = `<div class="es-bug" id="analyzebox">${analyzeHTML(r.id, !!(G.sentRuns && G.sentRuns[r.id]))}</div>`;
  const feather = e.feathers ? `<span class="es-pill es-fe">${art.emo('pioro')} Pióra do Kurnika <b>+${e.feathers}</b><small>razem ${G.profile.feathers | 0}</small></span>` : '';
  const ach = takeAch();   // osiągnięcia zdobyte w tym runie (jednorazowo)
  const extras = `${endExtrasHTML(e, true)}${e.garnekUnlocked ? `<div class="unlock-box"><b>Odblokowano poziom palnika ${G.profile.garnek}: ${esc(BURNERS[G.profile.garnek])} (${esc(D.GARNEK[G.profile.garnek].name)})</b></div>` : ''}${unlocksHTML(un)}${achHTML(ach)}`;
  if (!win) {
    // PORAŻKA: sklep firmowy. Na podeście miska z pracownikiem i etykieta „ROSÓŁ nr N”, obok regał z całą partią, pod nim ciekawostka na wielkiej metce,
    // na dole pismo kadrowe (Awans Wroga), drobiazgi (wynik z rozwijanym rachunkiem, ranking, Staż) i przyciski.
    const nr = G.fabNr[r.id], M = D.MODES[r.mode], total = r.round > M.rounds ? '' : ' / ' + M.rounds, ch = D.CHARS[r.char];
    const pismo = endMeta(j, nr);
    const label = `<div class="es-label"><div class="lt">Rosołownia Regionalna · produkt końcowy</div><h2 class="end-title lose">${endTitle}</h2><div class="ln">nr ${nr}</div>
      <div class="lr"><span>Piętro ${r.round}${total}</span><span>Partia: ${esc(ch ? ch.name : 'nieznana')}</span><span>Skład: 100% pracownik</span></div></div>`;
    const fact = facts.length ? `<div class="fact es-fact" style="--i:0"><span class="fk">Informacja o produkcie · ciekawostka</span>${esc(facts[0].text)}</div>` : '';
    const rcpt = `<details class="es-rcpt"><summary><span>Wynik</span><b id="endscore" data-v="${r.score}">${fmtNum(r.score)}</b><i aria-hidden="true">▾</i></summary><table class="scoretable">${scoreRows(r)}<tr class="total"><td>Wynik</td><td>${fmtNum(r.score)}</td></tr></table></details>`;
    const pills = `${e.rank && !e.daily ? `<span class="es-pill">Ranking (${esc(M.name)}): <b>#${e.rank}</b></span>` : ''}${endStazPill(e)}${e.newBest ? '<span class="es-pill gold">Nowy rekord życiowy w tym trybie!</span>' : ''}`;
    openOverlay(`<div class="endwrap lose endshop ${pismo ? '' : 'nonem'} ${fact ? '' : 'nofact'}">${bug}
      <div class="es-podium"><div class="es-bowl">${art.rosolBowl(nr)}</div>${label}</div>
      ${shelfHTML(nr, r.round, total.replace(' / ', ''))}${fact}
      <div class="es-bottom">${pismo}
        <div class="es-mid"><div class="es-extras">${extras}</div><div class="es-pills">${pills}</div>${rcpt}</div>
        <div class="es-right"><div class="es-story">${lines.map((l, i) => `<p class="${i ? 's2' : 's1'}">${esc(l)}</p>`).join('')}</div>${feather}
          <div class="actions end-actions"><button class="btn primary big" data-act="again" data-primary>Zagraj jeszcze raz</button><div class="es-sec"><button class="btn" data-act="ranking">Ranking</button><button class="btn ghost" data-act="home">Menu</button></div></div></div>
      </div></div>`, { force: true, cls: 'endfull' });
  } else {
    // WYGRANA: „Czek Zarządu” (układ jak makieta: czek na środku, kurczak w koronie po lewej, odznaka rekordu i epilog po prawej, nagrody w jednym rzędzie pod czekiem,
    // drobne żetony w jednej linii i przyciski na dole). Wszystkie liczby i teksty pochodzą z danych runu; brakujące bloki znikają.
    const M = D.MODES[r.mode], seed = parseInt(String(r.id).slice(-6), 10) || 0, ch = D.CHARS[r.char];
    const floors = `${Math.min(r.done, M.rounds)} / ${M.rounds}${r.endless ? ' + dogrywka' : ''}`;
    const cards = [];
    un.forEach(u => cards.push(`<div class="ew-flip"><div class="in"><div class="back"><span>?</span></div><div class="front"><small>Odblokowano ${u.kind === 'char' ? 'postać' : 'kafelek'}</small>${u.kind === 'char' ? art.portrait(u.target) : art.tileIcon(u.target)}<b>${esc(unlockName(u))}</b><em>${esc(u.text)}</em></div></div></div>`));
    ach.forEach(a => cards.push(`<div class="ew-prize">${art.medal(a.g, a.s)}<div><small>Nowe osiągnięcie</small><b>${esc(a.name)}</b><em>${esc(a.text)}</em></div></div>`));
    if (e.garnekUnlocked) cards.push(`<div class="ew-prize">${art.burnerArt(G.profile.garnek)}<div><small>Nowy poziom palnika</small><b>${esc(BURNERS[G.profile.garnek])}</b><em>${esc(D.GARNEK[G.profile.garnek].name)}</em></div></div>`);
    const sp = e.soup && D.SOUP_BY_ID[e.soup.id];
    if (sp) cards.push(`<div class="ew-prize">${art.soupArt(sp.color)}<div><small>${e.soup.isNew ? 'Nowy rosół w Księdze!' : 'Ugotowałeś rosół'}</small><b>${esc(sp.name)}</b>${e.soup.isNew ? '' : `<em>×${e.soup.n}</em>`}</div></div>`);
    const ups = e.staz && e.staz.ups && e.staz.ups.length;
    if (ups) cards.push(`<div class="ew-prize">${art.medal('meta', '↑')}<div><small>Awans na Stażu</small><b>Poziom ${e.staz.level}</b><em>${D.STAZ.talons * e.staz.ups.length} Talony czeka w Sklepiku</em></div></div>`);
    const prizes = cards.length ? `<div class="ew-prizes n${Math.min(cards.length, 7)}">${cards.map((c, i) => c.replace('<div class="ew-', `<div style="--d:${(1.5 + i * .45).toFixed(2)}s" class="ew-`)).join('')}</div>` : '';
    const f0 = facts[0], fl = f0 ? f0.text.length : 0;
    const memo = f0 ? `<div class="fact ew-fact ${fl > 150 ? 'fl' : fl > 90 ? 'fm' : ''}"><span class="fk">Tytułem · ciekawostka</span>${esc(f0.text)}</div>` : '';
    const pills = `${e.rank && !e.daily ? `<span class="es-pill">Ranking (${esc(M.name)}): <b>#${e.rank}</b></span>` : ''}${endStazPill(e)}${feather}${e.daily ? `<span class="es-pill">Dyżur dnia: <b>+${e.daily.talons} Talony</b>, seria ${e.daily.streak}${e.rank ? `, miejsce dnia #${e.rank}` : ''}</span>` : ''}`;
    const rcpt = `<details class="es-rcpt ew-rcpt"><summary><span>Rachunek</span><b>${fmtNum(r.score)} pkt</b><i aria-hidden="true">▾</i></summary><table class="scoretable">${scoreRows(r)}<tr class="total"><td>Wynik</td><td>${fmtNum(r.score)}</td></tr></table></details>`;
    const epilog = `<details class="ew-epilog"><summary>${esc(lines[0])}<i aria-hidden="true">▾ Epilog</i></summary><div class="more">${lines.slice(1).map(l => `<p>${esc(l)}</p>`).join('')}<p class="ew-foot">${esc(F.STOPKA[ending])}</p></div></details>`;
    openOverlay(`<div class="endwrap win endwin ${quiet ? 'ew-quiet' : ''} ${prizes ? '' : 'noprize'}">${bug}${quiet ? '' : winFx(seed)}
      <div class="ew-head"><h2 class="end-title ew-title">${endTitle}</h2><div class="ew-sub">${ending === 'awans' ? 'Gratulujemy. Nie zostałeś rosołem.' : 'Gratulujemy ucieczki. Nie zostałeś rosołem.'} Tryb ${esc(M.name)} · ${floors} pięter</div></div>
      <div class="ew-left"><div class="ew-hero">${art.portrait(r.char, r.form)}${art.crownArt('ew-crown')}</div></div>
      <div class="ew-cheque"><div class="hd"><span>Rosołownia Regionalna · Czek Zarządu</span><span>nr ${String(seed).padStart(6, '0')} · piętro ${floors}</span></div>
        <div class="pay"><div class="to"><small>Zapłać na rzecz</small><b>${esc(ch ? ch.name : 'Pracownik')}, pracownik (były)</b></div><div class="amt"><b id="endscore" data-v="${r.score}">${fmtNum(r.score)}</b><small>pkt</small></div></div>
        <div class="words">Z tytułu: pokonania Prezesa Rosołowskiego · palnik ${r.garnek} (${esc(BURNERS[r.garnek])}) · ${floors} pięter</div>
        ${memo}<div class="sign">P. Rosołowski<small>Prezes, jeszcze</small></div><div class="stamp">WYPŁACONO</div></div>
      <div class="ew-right">${e.newBest ? '<div class="ew-record">Nowy rekord<br>życiowy!<small>w tym trybie</small></div>' : ''}${epilog}</div>
      ${prizes}
      <div class="ew-bottom"><div class="es-pills ew-chips">${rcpt}${pills}</div>
        <div class="actions end-actions"><button class="btn primary big" data-act="again" data-primary>Zagraj jeszcze raz</button><div class="es-sec"><button class="btn" data-act="ranking">Ranking</button><button class="btn ghost" data-act="home">Menu</button></div></div></div>
      </div>`, { force: true, cls: 'endfull' });
  }
  G.screen = 'home'; render();
  countUp($('#endscore'), quiet);
}
// Deszcz konfetti, piórek i złotych Ziaren: stały, mały zestaw cząstek (limit), pozycje z ziarna runu (bez Math.random), animuje tylko transform.
function winFx(seed) {
  let s = (seed % 2147483646) + 1; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cols = ['#ffd23f', '#ff8c2b', '#e4572e', '#fff3d6', '#ffb347', '#2a9d8f'];
  const piece = (kind, cls) => { const dur = 4 + rnd() * 4; return `<i class="ew-cf ${kind}" style="left:${(rnd() * 100).toFixed(1)}%;--dx:${((rnd() - .5) * 260).toFixed(0)}px;--rot:${(360 + rnd() * 720).toFixed(0)}deg;--dur:${dur.toFixed(2)}s;--dl:-${(rnd() * dur).toFixed(2)}s;--c:${cols[Math.floor(rnd() * cols.length)]};--s:${(8 + rnd() * 12).toFixed(1)}px"></i>`; };
  const coin = () => { const dur = 2.4 + rnd() * 2; return `<i class="ew-coin" style="left:${(rnd() * 100).toFixed(1)}%;--dur:${dur.toFixed(2)}s;--dl:-${(rnd() * dur).toFixed(2)}s;--s:${(26 + rnd() * 20).toFixed(0)}px;--dx:${((rnd() - .5) * 120).toFixed(0)}px"></i>`; };
  const kinds = ['c', 'c', 'f', 'p'];
  let back = '', front = '';
  for (let i = 0; i < 46; i++) back += piece(kinds[Math.floor(rnd() * kinds.length)]);
  for (let i = 0; i < 12; i++) back += coin();
  for (let i = 0; i < 14; i++) front += piece(i % 3 ? 'c' : 'f');
  return `<div class="ew-sun" aria-hidden="true"></div><div class="ew-fx" aria-hidden="true">${back}</div><div class="ew-fx front" aria-hidden="true">${front}</div>`;
}
