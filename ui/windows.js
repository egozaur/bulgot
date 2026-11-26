// Bulgot, interfejs: okna: ranking, Księga Kurnika, profil, historia, pomoc, ustawienia, menu.
// Wydzielone z app.js (2026-11-24). Wszystkie funkcje i stałe są eksportowane i dzielą stan przez G (ui/core.js).
import { ranks as apiRanks, LOCAL, playerNow, avatarUrl } from '../api.js';
import * as D from '../shared/data.js';
import * as art from '../art.js';
import * as T from '../text.js';
import * as F from '../fabula.js';
import * as snd from '../audio.js';
import { casinoOn } from './casino.js';
import { $, G, TILE, act, charView, esc, fmtNum, openOverlay, store, toast, unlockName } from './core.js';
import { cls } from './fight.js';
import { BURNERS, lockText } from './home.js';
import { invoiceOn } from './invoice.js';
import { soupsBook } from './meta.js';
import { tileCard } from './run.js';
import { animOn } from './side.js';

// ---------- okna: ranking, księga, pomoc, ustawienia, menu ----------
// Ranking: jeden ogólny (punkty) albo przefiltrowany po postaci, poziomie Garnka i graczu. Klik w nick, postać lub Garnek w tabeli ustawia filtr.
export const RK = { mode: null, char: '', garnek: '', nick: '', deep: false };
export async function showRanking(mode, keep) {
  mode = mode || G.setup.mode;
  if (!keep) Object.assign(RK, { char: '', garnek: '', nick: '', deep: false });
  RK.mode = mode;
  const chars = Object.values(D.CHARS).filter(c => !c.retired && (!c.secret || G.profile.chars.includes(c.id)));
  const maxG = Math.max(G.profile.garnek | 0, 0);
  const sel = (id, label, opts, val) => `<label class="rkf"><span>${label}</span><select id="${id}" >${opts.map(([v, n]) => `<option value="${esc(v)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>`;
  openOverlay(`<h2>Ranking</h2><div class="tabs">${['quick', 'full'].map(m => `<button class="tab ${m === mode && !RK.deep ? 'on' : ''}" data-act="ranktab" data-v="${m}">${D.MODES[m].name}</button>`).join('')}<button class="tab ${RK.deep ? 'on' : ''}" data-act="rkdeep" title="Ranking Dogrywki w trybie: ${esc(D.MODES[mode].name)}">♾ Dogrywka</button></div>
    <div class="rkbar">${sel('rk-char', 'Postać', [['', 'Wszystkie'], ...chars.map(c => [c.id, c.name])], RK.char)}${sel('rk-garnek', 'Poziom trudności', [['', 'Wszystkie'], ...D.GARNEK.map((g, i) => [i, 'Garnek ' + i + ' · ' + g.name]).slice(0, Math.max(maxG, +RK.garnek || 0) + 1)], RK.garnek)}
      <label class="rkf"><span>Gracz</span><input id="rk-nick" type="text" maxlength="16" placeholder="dowolny nick" value="${esc(RK.nick)}" autocomplete="off"></label>
      <button class="btn small" data-act="rkme" title="Pokaż tylko moje wyniki">Tylko ja</button><button class="btn small ghost" data-act="rkclear" ${RK.char || RK.garnek !== '' || RK.nick ? '' : 'disabled'}>Wyczyść filtry</button></div>
    <div id="rk" class="lead">Ładowanie…</div>`);
  if (RK.deep) { const rb = $('.rkbar'); if (rb) rb.remove(); }
  const q = new URLSearchParams(); if (RK.deep) q.set('kind', 'deep'); if (RK.char) q.set('char', RK.char); if (RK.garnek !== '') q.set('garnek', RK.garnek); if (RK.nick.trim()) q.set('nick', RK.nick.trim());
  const myMode = mode, { j } = await apiRanks(mode, q.toString());
  const box = $('#rk'); if (!box || RK.mode !== myMode) return;
  if (!j || !j.list) { box.textContent = (j && j.err) || 'Nie udało się pobrać rankingu.'; return; }
  const me = playerNow(), mynick = me ? me.nick : '', filtered = RK.char || RK.garnek !== '' || RK.nick.trim();
  if (!j.list.length) { box.textContent = filtered ? 'Brak wyników dla tych filtrów. Spróbuj szerzej.' : 'Nikt jeszcze nie wszedł na szczyt. Bądź pierwszy.'; return; }
  const myPos = j.list.findIndex(x => x.nick === mynick);
  const what = [RK.char ? (D.CHARS[RK.char] || {}).name : 'wszystkie postacie', RK.garnek !== '' ? 'Garnek ' + RK.garnek : 'wszystkie poziomy', RK.nick.trim() ? 'gracz: ' + RK.nick.trim() : 'wszyscy gracze'].join(' · ');
  const youLine = !mynick ? '' : RK.nick.trim() ? '' : myPos >= 0 ? `Twoje miejsce: <b>#${myPos + 1}</b> z ${j.total}${myPos > 0 ? `. Do #${myPos} brakuje ${fmtNum(j.list[myPos - 1].score - j.list[myPos].score)} pkt.` : '. Jesteś na szczycie tej listy!'}` : `Nie ma cię w pierwszej setce tej listy (${j.total} graczy).`;
  box.className = ''; box.innerHTML = `<div class="rkinfo"><span>${esc(what)}</span>${youLine ? `<span class="rkyou">${youLine}</span>` : ''}</div>
    <table class="rank-list"><thead><tr><th></th><th>Gracz</th><th>Postać</th><th>Garnek</th><th>Piętra</th><th style="text-align:right">Wynik</th></tr></thead><tbody>${j.list.map((x, i) => {
    const av = x.avatar && !LOCAL ? `<span class="av"><img src="${esc(avatarUrl(x.avatar))}" alt="" onerror="this.remove()"></span>` : `<span class="av">${esc((x.nick || '?')[0].toUpperCase())}</span>`;
    const cn = (D.CHARS[x.char] || {}).name || '';
    return `<tr class="${x.nick === mynick ? 'me' : ''} ${i < 3 ? 'top' + (i + 1) : ''}"><td class="pos">${i + 1}</td><td><button class="lnk" data-act="rknickset" data-v="${esc(x.nick)}" title="Pokaż wyniki tego gracza">${av}${esc(x.nick)}</button>${x.ttl && D.SHOP[x.ttl] ? ` <small class="ttl">${esc(D.SHOP[x.ttl].name)}</small>` : ''}${x.win ? ' ★' : ''}${x.deep ? ` <small class="deepn">♾ +${x.deep}</small>` : ''}</td><td><button class="lnk" data-act="rkcharset" data-v="${esc(x.char)}" title="Filtruj po tej postaci">${esc(cn)}</button></td><td><button class="lnk" data-act="rkgset" data-v="${x.garnek | 0}" title="Filtruj po tym poziomie">G${x.garnek | 0}</button></td><td>${x.rounds}</td><td class="sc">${fmtNum(x.score)}</td></tr>`;
  }).join('')}</tbody></table>`;
}
// Księga: nowe wpisy (odblokowane kafelki, przepisy, reakcje) od ostatniego otwarcia dostają naklejkę „Nowy wpis!”.
// Kurnik: meta-progres. Pióra za runy → trwałe, niewielkie ulepszenia (maks. 3 poziomy). Na dole Duch gracza z Areny.
export function ghostBlock() {
  const g = G.myGhost || {}, rows = Object.keys(D.MODES).filter(m => g[m]).map(m => { const x = g[m], ch = D.CHARS[x.char]; return `<div class="kghost">${art.ghostArt(x.char, x.wear)}<div><b>${esc(D.MODES[m].name)}: ${esc(ch ? ch.name : '')}</b>, ${x.floors} pięter${x.win ? ' ★' : ''}<br><span>Pokonał ${x.wins} graczy, przegrał z ${x.losses}.</span></div></div>`; }).join('');
  return `<div class="sec">Twój Duch na Arenie</div>${rows || '<p class="hint">Zakończ run z co najmniej 3 piętrami, a twój build zostanie na Arenie Duchów i będzie bił innych graczy.</p>'}`;
}
export function showKurnik() {
  const p = G.profile, ku = p.kurnik || {}, fe = p.feathers | 0;
  // Kurnik kupuje się od 20. poziomu Stażu; wcześniej to tylko podgląd (budynki i ceny widać, przyciski wyłączone).
  const need = p.kurnikNeed || D.KURNIK_MIN_STAZ, open = p.kurnikOpen !== false, lvl = p.staz ? p.staz.level | 0 : 0;
  const cards = Object.entries(D.KURNIK).map(([id, b]) => {
    const lv = ku[id] | 0, max = lv >= D.KURNIK_MAX, cost = max ? 0 : b.cost[lv], can = open && fe >= cost;
    const btn = !open ? `<button class="btn small" disabled title="Kurnik odblokuje się na ${need}. poziomie Stażu">🔒 ${cost} ${art.emo('pioro')}</button>` : `<button class="btn small ${can ? 'primary' : ''}" data-act="kbuy" data-v="${id}" ${can ? '' : 'disabled'}>Ulepsz za ${cost} ${art.emo('pioro')}</button>`;
    return `<div class="kb ${max ? 'max' : ''} ${open ? '' : 'locked'}">${art.emo(b.icon)}<div class="kbn"><b>${esc(b.name)}</b><span class="kbl">${[0, 1, 2].map(i => `<i class="${i < lv ? 'on' : ''}"></i>`).join('')}</span></div><p>${esc(b.text)}</p>${max ? '<div class="kbm">Maksymalny poziom</div>' : btn}</div>`;
  }).join('');
  const lockBox = open ? '' : `<div class="klock">🔒 Kurnik odblokuje się na <b>${need}. poziomie Stażu</b> (masz ${lvl}, brakuje ${Math.max(0, need - lvl)}). Do tego czasu możesz tylko oglądać budynki; Pióra z runów się zbierają.</div>`;
  openOverlay(`<h2>Kurnik</h2><p class="lead">Za każdy run dostajesz Pióra: piętra, premię za wygraną (z palnikiem) i za piętra Dogrywki. Wydaj je na trwałe, niewielkie ulepszenia dla wszystkich postaci.</p>${lockBox}
    <div class="kfeathers">${art.emo('pioro')} Pióra: <b>${fe}</b></div><div class="kgrid">${cards}</div>${ghostBlock()}<div class="actions" style="margin-top:12px"><button class="btn ghost" data-act="close">Zamknij</button></div>`, { cls: 'kurnikmodal' });
}
export function showProfile() {
  const p = G.profile, c = p.completion || { pct: 0, parts: [] }, pl = playerNow(), have = new Set(p.ach || []);
  const parts = c.parts.map(x => `<div class="prof-part"><span>${esc(x.name)}</span><b>${x.done}/${x.total}</b><i style="--w:${Math.min(100, x.done / x.total * 100).toFixed(1)}%"></i></div>`).join('');
  const recent = (p.ach || []).slice(-6).reverse().map(id => D.ACH_BY_ID[id]).filter(Boolean).map(a => `<div class="ach-row got">${art.medal(a.g, a.s)}<div><b>${esc(a.name)}</b><span>${esc(a.text)}</span></div></div>`).join('');
  const cn = p.counters || {};
  openOverlay(`<h2>Profil: ${esc(pl ? pl.nick : '')}</h2><div class="prof-top"><div class="prof-ring" style="--p:${c.pct}"><b>${c.pct}%</b><small>ukończenia gry</small></div><div class="prof-stats"><div>Runy: <b>${cn.runs || 0}</b></div><div>Wygrane: <b>${cn.wins || 0}</b></div><div>Pokonani Nemezis: <b>${cn.nemesisKills || 0}</b></div><div>Osiągnięcia: <b>${have.size}/${D.ACHIEVEMENTS.length}</b></div><div>Najwyższy palnik: <b>${BURNERS[p.garnek || 0]}</b></div></div></div><div class="prof-parts">${parts}</div>${recent ? `<div class="sec">Ostatnie osiągnięcia</div><div class="ach-list">${recent}</div>` : ''}<div class="actions"><button class="btn primary" data-act="achbook">Wszystkie osiągnięcia</button></div>`, { narrow: true });
}
export function bookSeen() { try { return new Set(JSON.parse(store.get('bulgot:bookseen') || '[]')); } catch (e) { return new Set(); } }
export function bookMark(keys) { const s = bookSeen(); for (const k of keys) s.add(k); store.set('bulgot:bookseen', JSON.stringify([...s])); }
// Księga jako rozkładówka: treść płynie w dwóch kolumnach poziomo, strony przewija się ←/→ (bez przewijania w dół).
export function bookFit() {
  const v = $('.bookview'), fl = $('.bookflow'); if (!v || !fl) return;
  const gap = parseFloat(getComputedStyle(fl).columnGap) || 28, W = v.clientWidth, pages = Math.max(1, Math.round((fl.scrollWidth + gap) / (W + gap)));
  G.bookPages = pages; G.bookPage = Math.max(0, Math.min(pages - 1, G.bookPage || 0));
  fl.style.transform = `translateX(${-(G.bookPage * (W + gap))}px)`;
  const no = $('.bookno'); if (no) no.textContent = 'Strona ' + (G.bookPage + 1) + ' z ' + pages;
  const pv = $('[data-act=bookprev]'), nx = $('[data-act=booknext]'); if (pv) pv.disabled = G.bookPage <= 0; if (nx) nx.disabled = G.bookPage >= pages - 1;
}
export const bookGo = d => { G.bookPage = (G.bookPage || 0) + d; bookFit(); };
export function showBook(tab = 'tiles', turn = false) {
  const seen = bookSeen(), fresh = k => !seen.has(k), marks = [];
  const p = G.profile, tabs = [['tiles', 'Kafelki'], ['hatch', 'Wylęgarnia'], ['react', 'Reakcje i Okólniki'], ['badges', 'Odznaki'], ['ach', 'Osiągnięcia'], ['soups', 'Rosoły'], ['chars', 'Postacie'], ['foes', 'Wrogowie'], ['unl', 'Odblokowania'], ['more', 'Klątwy, trasy, towarzysze']];
  let body = '';
  if (tab === 'react') {
    const known = p.reactions || []; for (const k of known) marks.push('x:' + k);
    body = `<p class="lead">Dwa różne efekty na jednym wrogu łączą się w reakcję. Odkryte: ${known.length} z ${Object.keys(D.REACTIONS).length}.</p><div class="ms-grid">${Object.values(D.REACTIONS).map(R => known.includes(R.id)
      ? `<div class="ms-row entry ${fresh('x:' + R.id) ? 'fresh' : ''}">${fresh('x:' + R.id) ? '<span class="newtag">Nowy wpis!</span>' : ''}${art.statusIcon(R.of[0])}${art.statusIcon(R.of[1])}<div><b>${esc(R.name)}</b><br><span>${esc(R.text)}</span></div></div>`
      : `<div class="ms-row unknown">${art.statusIcon(R.of[0])}${art.statusIcon(R.of[1])}<div><b>?</b><br><span>${esc(D.STATUS[R.of[0]].name)} + ${esc(D.STATUS[R.of[1]].name)}: jeszcze nie odkryto.</span></div></div>`).join('')}</div>
      <div class="sec">Okólniki Zarządu</div><p class="lead">Na starcie runu losuje się jeden okólnik, który zmienia zasady do końca runu.</p><div class="ms-grid">${Object.values(D.DECREES).map(d => `<div class="ms-row">${art.decreeIcon()}<div><b>${esc(d.name)}</b><br><span>${esc(d.text)}</span></div></div>`).join('')}</div>
      <div class="sec">Wady fabryczne</div><p class="lead">Kafelek z pieczątką „Wada fabryczna” jest o 50% mocniejszy, ale po następnej walce ujawnia jedną z wad:</p><div class="ms-grid">${Object.values(D.FLAWS).map(f => `<div class="ms-row"><div><b>${esc(f.name)}</b><br><span>${esc(f.text)}</span></div></div>`).join('')}</div>
      ${p.nemesis ? `<div class="sec">Twój Nemezis</div><p class="lead">${esc(p.nemesis.name)}, cecha ${esc(D.AFFIXES[p.nemesis.affix].name)}${p.nemesis.tile ? ', ukradł ' + esc(TILE[p.nemesis.tile].name) : ''}. Pokonane Nemezis: ${p.counters.nemesisKills || 0}.</p>` : ''}`;
  } else if (tab === 'more') {
    body = `<div class="sec">Klątwy Prezesa</div><p class="lead">Dobrowolne utrudnienia wybierane przed runem (do ${D.CURSE_MAX} naraz). Każda dodaje premię do końcowego wyniku.</p><div class="ms-grid">${Object.values(D.CURSES).map(c => `<div class="ms-row">${art.emo(c.icon)}<div><b>${esc(c.name)} (+${c.pct}%)</b><br><span>${esc(c.text)}</span></div></div>`).join('')}</div>
      <div class="sec">Trasy</div><p class="lead">Na początku strefy II i III wybierasz jedną z dwóch tras (losowanych z pięciu). Trasa działa do końca strefy.</p><div class="ms-grid">${Object.values(D.ROUTES).map(R => `<div class="ms-row">${art.emo(R.icon)}<div><b>${esc(R.name)}</b><br><span>${esc(R.text)}</span></div></div>`).join('')}</div>
      <div class="sec">Towarzysze</div><p class="lead">Schronisko dla Piskląt (wydarzenie) daje towarzysza. Rośnie do poziomu 3 po każdym pokonanym bossie.</p><div class="ms-grid">${Object.values(D.COMPANIONS).map(c => `<div class="ms-row">${art.companionArt(c.id)}<div><b>${esc(c.forms.join(' → '))}</b><br><span>${esc(c.text)}</span></div></div>`).join('')}</div>
      <div class="sec">Bossowie (warianty)</div><p class="lead">Każde miejsce bossa ma trzech kandydatów, losowanych z ziarna runu (oryginał trafia się najczęściej).</p><div class="ms-grid">${Object.values(D.BOSSES).filter(b => !b.super).map(b => `<div class="ms-row">${art.enemyArt(b.art, b.tint)}<div><b>${esc(b.name)}</b><br><span>${esc(b.text)}</span></div></div>`).join('')}</div>
      <div class="sec">Dogrywka i super-bossowie</div><p class="lead">Po Prezesie możesz zostać w fabryce. Wrogowie rosną szybciej, a co ${D.RULES.superEvery} pięter wpada super-boss.</p><div class="ms-grid">${Object.values(D.BOSSES).filter(b => b.super).map(b => `<div class="ms-row">${art.enemyArt(b.art, b.tint)}<div><b>${esc(b.name)}</b><br><span>${esc(b.text)}</span></div></div>`).join('')}</div>`;
  } else if (tab === 'soups') {
    body = soupsBook(p, fresh, marks);
  } else if (tab === 'ach') {
    const have = new Set(p.ach || []);
    body = `<p class="lead">Zdobyte: ${have.size} z ${D.ACHIEVEMENTS.length}.</p>` + Object.entries(D.ACH_GROUPS).map(([gid, g]) => `<div class="sec">${esc(g.name)}</div><div class="ach-list">${D.ACHIEVEMENTS.filter(a => a.g === gid).map(a => { const got = have.has(a.id), hide = a.secret && !got; return `<div class="ach-row ${got ? 'got' : 'lock'}">${art.medal(a.g, hide ? '?' : a.s, !got)}<div><b>${esc(hide ? '???' : a.name)}</b><span>${esc(hide ? 'Ukryte osiągnięcie.' : a.text)}</span></div></div>`; }).join('')}</div>`).join('');
  } else if (tab === 'badges') {
    body = `<p class="lead">Odznaki Pracownicze dostajesz za pokonanie bossa albo elitarnego wroga (wybór 1 z 3) i w Kapliczce. Działają do końca runu.</p><div class="ms-grid">${Object.entries(D.BADGES).map(([id, b]) => `<div class="ms-row">${art.badgeIcon(id)}<div><b>${esc(b.name)}</b><br><span>${esc(b.text)}</span></div></div>`).join('')}</div>
      <div class="sec">Cechy elitarnych wrogów</div><p class="lead">Elita ma jedną cechę (od Garnka 2: dwie). Na Garnku 0 podgląd piętra pokazuje je przed walką, wyżej dopiero walka.</p><div class="ms-grid">${Object.values(D.AFFIXES).map(a => `<div class="ms-row"><div><b>${esc(a.name)}</b><br><span>${esc(a.text)}</span></div></div>`).join('')}</div>`;
  } else if (tab === 'hatch') {
    const known = p.recipes || [];
    for (const k of known) marks.push('r:' + k);
    const rows = D.RECIPES.map(r => known.includes(r.out)
      ? `<div class="hatch-row entry ${fresh('r:' + r.out) ? 'fresh' : ''}">${fresh('r:' + r.out) ? '<span class="newtag">Nowy wpis!</span>' : ''}${r.of.map(c => tileCard(c, { static: true, mini: true })).join('<div class="hplus">+</div>')}<div class="hplus">=</div>${tileCard(r.out, { static: true, mini: true })}</div>`
      : '<div class="hatch-row unknown"><div class="qcard">?</div><div class="hplus">+</div><div class="qcard">?</div><div class="hplus">=</div><div class="qcard leg">?</div></div>').join('');
    const ms = Object.entries(D.MILESTONES).map(([id, m]) => `<div class="ms-row">${art.tileIcon(id)}<div><b>${D.MILESTONE_EVERY}× ${esc(TILE[id].name)} = ${esc(m.name)}</b><br><span>${esc(m.text)}</span></div></div>`).join('');
    body = `<p class="lead">Dwa pasujące przedmioty wykluwają legendarny. Odkryte przepisy: ${known.length} z ${D.RECIPES.length}. Na kartach w ofercie znacznik <b>Wylęgarnia!</b> mówi, że kafelek dokończy przepis.</p>${rows}
      <div class="sec">Progi statystyk</div><p class="lead">Każde ${D.MILESTONE_EVERY} kopie tej samej statystyki poziomu 3 (złota plakietka III) dają dodatkową premię.</p><div class="ms-grid">${ms}</div>`;
  } else if (tab === 'tiles') {
    const list = D.TILES.filter(t => !t.hatched && !t.hidden);
    body = `<p class="lead">Poznane: ${list.filter(t => t.boss ? (p.seen || []).includes(t.id) : (!t.lock || p.tiles.includes(t.id))).length} z ${list.length} kafelków. Statystyki mają cztery poziomy (plakietka I, II, III, ★): dwa takie same kafelki poziomu 1 lub 2 zlejesz za darmo w wyższy poziom, a legendarne (★) wypadają tylko z bossów.</p><div class="book-grid">${list.map((t, i) => {
      const open = t.boss ? (p.seen || []).includes(t.id) : (!t.lock || p.tiles.includes(t.id)), u = t.lock && D.UNLOCK_BY_ID[t.lock];
      const nw = open && t.lock && fresh('t:' + t.id); if (open && t.lock) marks.push('t:' + t.id);
      return `<div class="entry ${nw ? 'fresh' : ''}" style="--i:${i}">${tileCard(t.id, { static: true, mini: true, i, locked: !open, lockText: open ? '' : t.boss ? 'Łup z bossa: pokonaj bossa i wybierz go z trzech' : (u && u.text) })}${nw ? '<span class="newtag">Nowy wpis!</span>' : ''}</div>`;
    }).join('')}</div>`;
  } else if (tab === 'chars') {
    body = `<div class="opts">${Object.values(D.CHARS).filter(c => !c.retired).map(c => { const open = p.chars.includes(c.id), u = c.lock && D.UNLOCK_BY_ID[c.lock], v = charView(c, open);
      return `<div class="opt char-opt ${open ? '' : 'locked'}">${v.hidden ? art.eggArt(c.id, false) : art.portrait(c.id)}<div><h3>${esc(v.name)}</h3><p>${esc(v.style)}. ${esc(v.text)}</p>${open ? '' : `<div class="lockmsg">Zablokowana: ${esc(v.hidden ? '???' : u ? u.text : '')}</div>`}</div></div>`; }).join('')}</div>
      <div class="sec">Formy kurczaka</div><div class="opts">${D.FORMS.map(f => `<div class="opt char-opt">${art.heroArt('pyrtek', f.id, { plain: true })}<div><h3>${f.name}</h3><p>Od ${Math.round(f.from * 100)}% runu.</p></div></div>`).join('')}</div>`;
  } else if (tab === 'foes') {
    const all = [...Object.values(D.ENEMIES), ...Object.values(D.BOSSES)];
    body = `<div class="opts">${all.map(d => `<div class="opt char-opt">${art.enemyArt(d.art)}<div><h3>${esc(d.name)}</h3><p>${d.title ? esc(d.title) + '. ' : ''}${esc(d.text)}</p><p style="color:var(--faint)">${d.zone != null && !d.minion ? 'Strefa ' + D.ZONES[d.zone].tag : d.minion ? 'Przywoływany przez bossa' : 'Boss'}</p></div></div>`).join('')}</div>`;
  } else {
    body = `<div class="help-list">${D.UNLOCKS.filter(u => !(u.kind === 'char' && D.CHARS[u.target] && D.CHARS[u.target].retired)).map(u => { const done = p.unlocked.includes(u.id), sec = u.secret && !done; return `<div><b>${done ? '✓' : '○'} ${esc(sec ? '???' : unlockName(u))}</b><p>${esc(sec ? '???' : u.text)}${done ? ' (zdobyte)' : ''}</p></div>`; }).join('')}</div>`;
  }
  // księga: okładka, zakładki-przekładki, strona z wklejanymi wpisami
  openOverlay(`<div class="bookpage${turn ? ' turn' : ''}"><h2>Księga Kurnika</h2><div class="bookview"><div class="bookflow">${body}</div></div><div class="bookpager"><button class="btn small ghost" data-act="bookprev" aria-label="Poprzednia strona">‹ Wstecz</button><span class="bookno"></span><button class="btn small ghost" data-act="booknext" aria-label="Następna strona">Dalej ›</button></div></div><div class="booktabs tabs">${tabs.map(([id, n], i) => `<button class="tab ${id === tab ? 'on' : ''}" data-act="booktab" data-v="${id}" style="--t:${i}">${n}</button>`).join('')}</div>`, { cls: 'bookmodal' });
  bookMark(marks);
  G.bookPage = 0; bookFit(); requestAnimationFrame(() => bookFit()); setTimeout(() => bookFit(), 250);
}
// TESTOWA historia gier: ostatnie 10 runów z dziennikiem rund. Przycisk pobiera plik JSON do analizy.
export async function showHistory() {
  const j = await act('history'); if (!j) return;
  const all = j.history || [], last = all.slice(-10).reverse();
  G.hist = all.slice(-10);
  const when = t => new Date(t).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  const rows = last.map(h => {
    const lastLog = h.log && h.log[h.log.length - 1], killer = h.outcome === 'lose' && !h.abandoned && lastLog ? lastLog.enemies.map(e => e.n).join(', ') : '';
    const res = h.outcome === 'win' ? '<b style="color:var(--green)">WYGRANA</b>' : h.abandoned ? 'porzucony' : '<b style="color:#ff8a6a">porażka</b>';
    return `<tr><td>${when(h.ended)}</td><td>${esc(D.MODES[h.mode].name)}${h.garnek ? ' · G' + h.garnek : ''}</td><td>${esc((D.CHARS[h.char] || {}).name || h.char)}</td><td>${res}</td><td>${h.floorsDone}/${D.MODES[h.mode].rounds}</td><td class="sc">${fmtNum(h.score)}</td><td>${esc(killer)}</td><td>${h.sent ? '<span class="sent">✓ wysłano</span>' : `<button class="btn small" data-act="analyze" data-id="${esc(h.id)}">Zgłoś</button>`}</td></tr>`;
  }).join('');
  openOverlay(`<h2>Historia gier (test)</h2><p class="lead">Ostatnie ${last.length} runów zapisuje się automatycznie, z dziennikiem każdej rundy. Po testach napisz, żeby ją przeanalizować.</p>
    ${rows ? `<table class="rank-list"><thead><tr><th>Kiedy</th><th>Tryb</th><th>Postać</th><th>Wynik</th><th>Piętra</th><th style="text-align:right">Punkty</th><th>Pokonał go</th><th>Analiza</th></tr></thead><tbody>${rows}</tbody></table>` : '<p class="lead">Brak zakończonych runów. Zagraj i wróć tutaj.</p>'}
    <div class="actions" style="margin-top:14px"><button class="btn primary" data-act="histdl" ${rows ? '' : 'disabled'}>Pobierz JSON (ostatnie 10)</button><button class="btn" data-act="histcopy" ${rows ? '' : 'disabled'}>Skopiuj JSON</button></div>`);
}
export function showHelp() {
  openOverlay(`<h2>Jak grać</h2><p class="lead">${esc(T.INTRO.join(' '))}</p><div class="help-list">${T.HELP.map(([h, t]) => `<div><b>${h}</b><p>${esc(t)}</p></div>`).join('')}</div>`);
}
export function fullscreenOn() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
export async function toggleFullscreen() {
  try {
    if (fullscreenOn()) {
      await (document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen && document.webkitExitFullscreen());
    } else {
      const el = document.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (!req) return toast('Pełny ekran nie jest dostępny w tej przeglądarce.', true);
      await req.call(el);
    }
  } catch (e) { toast('Nie udało się zmienić trybu pełnego ekranu.', true); }
}
export function showSettings() {
  const fs = fullscreenOn(), fsOk = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen || document.exitFullscreen || document.webkitExitFullscreen);
  openOverlay(`<h2>Dźwięk i ekran</h2><div class="setrow"><span>Efekty dźwiękowe</span><button class="toggle ${snd.settings.sfx ? 'on' : ''}" data-act="tsfx">${snd.settings.sfx ? 'WŁ.' : 'WYŁ.'}</button></div>
    <div class="setrow"><span>Głośność</span><span class="volbox"><input type="range" id="set-vol" min="0" max="100" step="5" value="${snd.settings.vol}" aria-label="Głośność"><b id="set-vol-n">${snd.settings.vol}%</b></span></div>
    ${G.profile.casino && G.profile.casino.unlocked ? `<div class="setrow"><span>Tryb kasynowy (kręcące się walce przy przetasowaniu)</span><button class="toggle ${casinoOn() || (G.profile.casino && G.profile.casino.on) ? 'on' : ''}" data-act="tcasino">${G.profile.casino.on ? 'WŁ.' : 'WYŁ.'}</button></div>` : ''}
    <div class="setrow"><span>Muzyka (bulgocząca pętla)</span><button class="toggle ${snd.settings.music ? 'on' : ''}" data-act="tmusic">${snd.settings.music ? 'WŁ.' : 'WYŁ.'}</button></div>
    <div class="setrow"><span>Faktura po wygranej walce (zamiast okna wyniku)</span><button class="toggle ${invoiceOn() ? 'on' : ''}" data-act="tinv">${invoiceOn() ? 'WŁ.' : 'WYŁ.'}</button></div>
    <div class="setrow"><span>Animacje (wyłącz, jeśli ruch Ci przeszkadza)</span><button class="toggle ${animOn() ? 'on' : ''}" data-act="tanim">${animOn() ? 'WŁ.' : 'WYŁ.'}</button></div>
    <div class="setrow"><span>Pełny ekran</span><button class="toggle ${fs ? 'on' : ''}" data-act="tfullscreen" ${fsOk ? '' : 'disabled'}>${fs ? 'WŁ.' : 'WYŁ.'}</button></div>
    <p class="hint">Wyciszenie dźwięku w lobby wycisza także tę grę.</p>`, { narrow: true });
}
export function showMenu() {
  const r = G.run && G.run.phase !== 'over';
  openOverlay(`<h2>Menu</h2><div class="actions" style="flex-direction:column;align-items:stretch"><button class="btn" data-act="help">Jak grać</button><button class="btn" data-act="settings">Dźwięk i ekran</button><button class="btn" data-act="book">Księga Kurnika</button><button class="btn" data-act="ranking">Ranking</button><button class="btn" data-act="history">Historia gier (test)</button><button class="btn primary" data-act="home">Wróć do menu głównego${r ? ' (run zapisany)' : ''}</button>${r ? '<button class="btn danger" data-act="abandon">Porzuć run</button>' : ''}</div>`, { narrow: true });
}
// Intro: pierwszy raz scena z kamerą (Kronikarz mówi, kamera jedzie od bramy do biura Zarządu); potem tylko jedno zdanie.
// Jeden przycisk `introgo` jest od razu: „Pomiń ▸”, a po scenie „Zaczynamy”. Bez animacji (`bulgot:anim` = '0') widać całą listę zdań.
export function startIntro(then) {
  if (store.get('bulgot:intro') !== F.INTRO_VER) return showIntro(then);
  toast(F.INTRO_KROTKIE[Math.floor(Math.random() * F.INTRO_KROTKIE.length)]);
  then();
}
export function showIntro(then) {
  store.set('bulgot:intro', F.INTRO_VER);
  const r = G.run, lines = F.INTRO_PLANSZE, anim = animOn();
  openOverlay(`<div class="in-stage" id="instage"><div class="in-logo">KORPORACJA ROSOŁOWA S.A.</div><div class="in-world" id="inworld">${art.introSceneArt()}</div><div class="in-hero">${r ? art.portrait(r.char, r.form) : ''}</div>
    <div class="in-cap" id="incap">${anim ? esc(lines[0]) : ''}</div></div>
    ${anim ? '' : `<div class="in-list">${lines.map(l => `<p class="lead">${esc(l)}</p>`).join('')}</div>`}
    <div class="actions" style="margin-top:12px"><button class="btn primary big" data-act="introgo" data-primary id="ingo">${anim ? 'Pomiń ▸' : 'Zaczynamy'}</button></div>`, { force: true, cls: 'introscene' });
  G.introCb = then;
  if (!anim) { const w = $('#inworld'), s = $('#instage'); if (w && s) w.style.transform = `translateX(${-Math.max(0, w.scrollWidth - s.clientWidth)}px)`; return; }
  const w = $('#inworld'), s = $('#instage'), cap = $('#incap'); if (!w || !s) return;
  const dx = Math.max(0, w.scrollWidth - s.clientWidth), STEP = 3300;
  requestAnimationFrame(() => { w.style.transition = `transform ${STEP * lines.length / 1000}s linear .9s`; w.style.transform = `translateX(${-dx}px)`; });
  lines.forEach((l, i) => i && setTimeout(() => { const c = $('#incap'); if (!c || c !== cap) return; c.style.opacity = 0; setTimeout(() => { c.textContent = l; c.style.opacity = 1; }, 180); }, i * STEP));
  setTimeout(() => { const b = $('#ingo'); if (b && $('#incap') === cap) b.textContent = 'Zaczynamy'; }, STEP * lines.length);
}
// Losowanie okólnika na starcie runu: maszyna losująca przewija nazwy (coraz wolniej), zatrzymuje się na okólniku z serwera
// i zostaje na ekranie, dopóki gracz nie kliknie „Rozumiem” (ma czas przeczytać). Bez animacji (`bulgot:anim` = '0') od razu wynik.
export function showDecreeRoll() {
  const id = G.run && G.run.decree, d = id && D.DECREES[id]; if (!d) return;
  if (navigator.webdriver && !/[?&]decroll=1/.test(location.search)) return;   // testy e2e (puppeteer) pomijają okno; wymusza je ?decroll=1
  const ids = Object.keys(D.DECREES), anim = animOn();
  openOverlay(`<h2>Okólnik Zarządu</h2><p class="lead">Zarząd losuje zasadę, która obowiązuje do końca tego runu.</p>
    <div class="decroll ${anim ? 'spin' : 'done'}" id="decroll"><div class="dr-ico">${art.decreeIcon()}</div><div class="dr-name" id="drname">${anim ? '…' : esc(d.name)}</div><div class="dr-text" id="drtext">${anim ? '' : esc(d.text)}</div></div>
    <div class="actions" id="dractions" style="margin-top:14px;${anim ? 'visibility:hidden' : ''}"><button class="btn primary big" data-act="introgo" data-primary>Rozumiem</button></div>`, { narrow: true, force: true });
  const box = $('#decroll'), name = $('#drname'), text = $('#drtext'), acts = $('#dractions');
  const reveal = () => { if (!box || !box.isConnected) return; name.textContent = d.name; text.textContent = d.text; box.classList.remove('spin'); box.classList.add('done'); acts.style.visibility = ''; snd.sfx('unlock'); };
  if (!anim) return;
  const seq = ids.slice().sort(() => Math.random() - 0.5);   // tylko wygląd przewijania, wynik jest z serwera
  const steps = 18 + ids.length; let i = 0;
  const tick = () => {
    if (!box.isConnected) return;
    if (i >= steps) return reveal();
    name.textContent = D.DECREES[seq[i % seq.length]].name;
    snd.sfx('click'); i++;
    setTimeout(tick, 55 + Math.pow(i / steps, 3) * 420);
  };
  tick();
}
export function confirmAbandon() {
  openOverlay('<h2>Porzucić run?</h2><p class="lead">Run zostanie zakończony jako porażka, a wynik trafi do rankingu, jeśli ukończyłeś choć jedno piętro.</p><div class="actions"><button class="btn danger" data-act="abandon-yes">Tak, porzuć</button><button class="btn" data-act="close" data-primary>Wróć do gry</button></div>', { narrow: true });
}

