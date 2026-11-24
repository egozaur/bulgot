// Bulgot, interfejs: Staż, Sklepik Zakładowy, Dyżur dnia.
// Wydzielone z app.js (2026-11-24). Wszystkie funkcje i stałe są eksportowane i dzielą stan przez G (ui/core.js).
import { dailyRanks as apiDaily, playerNow } from '../api.js';
import * as D from '../shared/data.js';
import * as art from '../art.js';
import * as snd from '../audio.js';
import { $, G, act, closeOverlay, esc, fmtNum, openOverlay, overlayOpen, store, toast } from './core.js';
import { cls } from './fight.js';
import { render } from './home.js';
import { showDecreeRoll, showIntro } from './windows.js';

// ---------- Staż, Sklepik Zakładowy, Dyżur dnia ----------
// Staż to poziom konta w tle: Nadgodziny z runów → poziomy → Talony (2 za poziom) + wybór 1 z 2 nagród. Talony idą do Sklepiku (kosmetyka, nic nie zmienia siły).
export const rewardText = (id, lvl) => { const r = D.REWARD_BY_ID[id]; return r.text.replace('{v}', r.v(lvl)); };
export const fmtDay = d => { const [y, m, dd] = String(d).split('-'); return `${+dd}.${m}.${y}`; };
export function stazOf() { return G.profile.staz || { level: 0, into: 0, need: D.stazCost(1), xp: 0, title: D.STAZ_TITLES[0], talons: 0 }; }
export function stazBar(s) { return `<span class="sp-bar"><i style="width:${Math.min(100, Math.round(100 * s.into / s.need))}%"></i></span>`; }
export function stazPill() {
  const s = stazOf();
  return `<button class="staz-pill" data-act="shop" data-tip="${esc('Staż ' + s.level + ': ' + s.title + '\nNadgodziny: ' + s.into + ' / ' + s.need + ' do następnego poziomu.\nTalony: ' + s.talons + '. Wydasz je w Sklepiku Zakładowym.')}"><b>Staż ${s.level}</b>${stazBar(s)}<span class="sp-t">🎟️ ${s.talons}</span></button>`;
}
// Po awansie czeka wybór nagrody; okno pokazuje się w menu, gdy nic innego nie jest otwarte.
export function maybeLevelUp() { if (G.screen === 'home' && !overlayOpen() && G.profile && G.profile.lvlPending) showLevelUp(); }
export function showLevelUp() {
  const q = G.profile.lvlPending; if (!q) return;
  const cards = q.opts.map((id, i) => { const r = D.REWARD_BY_ID[id]; return `<button class="opt reward-opt" data-act="lvlpick" data-i="${i}"><span class="rw-ico">${r.icon}</span><h3>${esc(r.name)}</h3><p>${esc(rewardText(id, q.lvl))}</p></button>`; }).join('');
  openOverlay(`<h2>Awans! Staż ${q.lvl}</h2><p class="lead"><b>${esc(D.stazTitle(q.lvl))}</b>. Dostajesz <b>${D.STAZ.talons} Talony</b> do Sklepiku Zakładowego i jedną nagrodę do wyboru${q.left > 1 ? ` (czeka jeszcze ${q.left - 1} awansów)` : ''}.</p><div class="opts reward-opts">${cards}</div>`, { narrow: true, force: true });
  snd.sfx('unlock');
}
export async function lvlPick(i) {
  const j = await act('levelchoice', { i }); if (!j) return;
  closeOverlay(); snd.sfx('unlock');
  const t = j.rewardTaken; if (t) toast('Nagroda: ' + rewardText(t.reward, t.lvl), false, 3600);
  render(); maybeLevelUp();
}
export function shopHero() { const ids = Object.keys(D.CHARS), id = G.setup && G.profile.chars.includes(G.setup.char) ? G.setup.char : 'pyrtek'; return { id, art: art.heroArt(id, id === 'pyrtek' ? 'pyrtek' : 'kogut') }; }
export function showShop() {
  const p = G.profile, w = p.wardrobe || { owned: [], eq: {} }, s = stazOf(), me = playerNow(), hero = shopHero();
  const ttl = w.eq.title && D.SHOP[w.eq.title] ? D.SHOP[w.eq.title].name : '';
  const cards = Object.values(D.SHOP).map(it => {
    const owned = w.owned.includes(it.id), on = w.eq[it.slot] === it.id;
    const prev = it.slot === 'title' ? `<div class="sh-title">${esc(it.name)}</div>` : art.heroArt('pyrtek', 'pyrtek', { wear: { [it.slot]: it.id } });
    const btn = owned ? `<button class="btn small ${on ? '' : 'primary'}" data-act="wear" data-id="${it.id}" data-on="${on ? 0 : 1}">${on ? 'Zdejmij' : 'Załóż'}</button>`
      : `<button class="btn small primary" data-act="shopbuy" data-id="${it.id}" ${s.talons < it.cost ? 'disabled' : ''}>Kup · ${it.cost} 🎟️</button>`;
    return `<div class="shop-card ${on ? 'on' : ''}"><div class="sh-prev">${prev}</div><h3>${esc(it.name)}</h3><div class="sh-slot">${esc(D.SLOTS[it.slot])}</div><p>${esc(it.text)}</p>${btn}</div>`;
  }).join('');
  openOverlay(`<h2>Sklepik Zakładowy</h2>
    <div class="shop-top"><span class="staz-line"><b>Staż ${s.level}</b> ${esc(s.title)} ${stazBar(s)}<small>${s.into} / ${s.need} Nadgodzin</small></span><span class="talons">🎟️ <b>${s.talons}</b> Talonów</span></div>
    <div class="shop-body"><div class="shop-me"><div class="shop-hero">${hero.art}</div><div class="shop-nick">${esc(me ? me.nick : '')}</div>${ttl ? `<div class="shop-ttl">${esc(ttl)}</div>` : ''}</div><div class="shop-grid">${cards}</div></div>
    <p class="hint">Talony dostajesz za awanse na Stażu (2 za poziom) i za Dyżur dnia. Stroje są tylko ozdobą i widać je w walce, w ekranie końca i na Arenie Duchów.</p>`, { cls: 'shopmodal' });
}
export async function shopAct(path, body, sfx) { const j = await act(path, body); if (!j) return; if (sfx) snd.sfx(sfx); showShop(); }

export async function showDaily() {
  const d = G.daily; if (!d) return toast('Dyżur dnia jest chwilowo niedostępny.', true);
  const c = D.CURSES[d.curses[0]], ch = D.CHARS[d.char];
  openOverlay(`<h2>Dyżur dnia <small class="dy-date">${esc(fmtDay(d.date))}</small></h2>
    <p class="lead">Ten sam run dla wszystkich: te same oferty, jedna Klątwa Prezesa, jedno podejście na dzień.</p>
    <div class="daily-info"><div><span>Postać</span><b>${esc(ch.name)}</b></div><div><span>Tryb</span><b>${esc(D.MODES[d.mode].name)}</b></div><div><span>Klątwa dnia</span><b>${art.emo(c.icon)} ${esc(c.name)}</b></div><div><span>Seria</span><b>${d.streak} ${d.streak === 1 ? 'dzień' : 'dni'}</b></div></div>
    <p class="hint">Talony: 1 za ukończenie, +2 za wygraną, +1 od 3 dni z rzędu (+2 od 7). Bez Kurnika i premii, nie zmienia rekordów ani palnika.</p>
    <div class="actions">${d.used ? `<span class="daily-done">${d.active ? 'Dyżur w toku. Dokończ go w menu.' : `Twój wynik: <b>${fmtNum(d.score)}</b> (piętra: ${d.rounds}${d.win ? ', wygrana' : ''}). Wróć jutro.`}</span>` : '<button class="btn primary big" data-act="dailystart" data-primary>Zacznij dyżur</button>'}</div>
    <div class="sec">Ranking dnia</div><div id="dyrank" class="lead">Ładowanie…</div>`, { narrow: true });
  const { j } = await apiDaily(d.date), box = $('#dyrank'); if (!box) return;
  if (!j || !j.list) { box.textContent = (j && j.err) || 'Nie udało się pobrać rankingu.'; return; }
  if (!j.list.length) { box.textContent = 'Nikt jeszcze nie odbył dziś dyżuru. Bądź pierwszy.'; return; }
  const me = playerNow(), mynick = me ? me.nick : '';
  box.className = ''; box.innerHTML = `<table class="rank-list"><tbody>${j.list.slice(0, 10).map((x, i) => `<tr class="${x.nick === mynick ? 'me' : ''} ${i < 3 ? 'top' + (i + 1) : ''}"><td class="pos">${i + 1}</td><td>${esc(x.nick)}${x.ttl && D.SHOP[x.ttl] ? ` <small class="ttl">${esc(D.SHOP[x.ttl].name)}</small>` : ''}${x.win ? ' 🏆' : ''}</td><td>${x.rounds} p.</td><td style="text-align:right">${fmtNum(x.score)}</td></tr>`).join('')}</tbody></table>`;
}
export async function startDaily() {
  closeOverlay();
  const j = await act('start', { daily: true }); if (!j) return;
  snd.sfx('bulgot'); G.screen = 'run'; render();
  if (!store.get('bulgot:intro')) showIntro(showDecreeRoll); else showDecreeRoll();
}

// Ekran końca: Nadgodziny, rosół i wynik Dyżuru dnia.
export function endExtrasHTML(e) {
  let h = '';
  if (e.staz) { const s = stazOf(); h += `<div class="endstaz"><span>Nadgodziny <b>+${e.staz.gain}</b></span><span class="es-lvl">Staż ${s.level}</span>${stazBar(s)}<small>${s.into} / ${s.need}</small></div>${e.staz.ups && e.staz.ups.length ? `<p class="lead" style="color:var(--gold)"><b>Awans na Stażu: poziom ${e.staz.level}!</b> Nagrodę odbierzesz w menu (${D.STAZ.talons * e.staz.ups.length} Talony czeka w Sklepiku).</p>` : ''}`; }
  if (e.soup) { const sp = D.SOUP_BY_ID[e.soup.id]; if (sp) h += `<div class="endsoup">${art.soupArt(sp.color)}<div><b>${e.soup.isNew ? 'Nowy rosół w Księdze!' : 'Ugotowałeś rosół'}</b><br>${esc(sp.name)}${e.soup.isNew ? '' : ` (×${e.soup.n})`}</div></div>`; }
  if (e.daily) h += `<p class="lead">Dyżur dnia: <b>+${e.daily.talons} Talony</b>, seria <b>${e.daily.streak}</b> ${e.daily.streak === 1 ? 'dzień' : 'dni'}${e.rank ? `, miejsce dnia <b>#${e.rank}</b>` : ''}.</p>`;
  return h;
}
export function soupsBook(p, fresh, marks) {
  const have = p.soups || {}, n = D.SOUPS.filter(s => have[s.id]).length;
  return `<p class="lead">Każda wygrana gotuje rosół zależny od buildu: najpierw przepisy specjalne, potem dominujący żywioł (co najmniej 4 kafelki), na końcu postać. Odkryte: ${n} z ${D.SOUPS.length}.</p>
    <div class="ms-grid soups">${D.SOUPS.map(s => have[s.id]
      ? `<div class="ms-row entry soup-row">${art.soupArt(s.color)}<div><b>${esc(s.name)}</b><br><span>${esc(s.hint)}</span><br><span class="sp-n">Ugotowany ×${have[s.id].n}, najlepszy wynik ${fmtNum(have[s.id].best)}</span></div></div>`
      : `<div class="ms-row unknown soup-row soup-lock">${art.soupArt('#4a4036')}<div><b>?</b><br><span>${s.secret ? 'Sekretny przepis.' : esc(s.hint)}</span></div></div>`).join('')}</div>`;
}

