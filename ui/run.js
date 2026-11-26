// Bulgot, interfejs: karty kafelków, ekran runu: podglądy, okólnik, górny pasek, sceny faz, wybór kafelków.
// Wydzielone z app.js (2026-11-24). Wszystkie funkcje i stałe są eksportowane i dzielą stan przez G (ui/core.js).
import * as D from '../shared/data.js';
import * as art from '../art.js';
import * as T from '../text.js';
import { radioLine, sladLine } from '../fabula.js';
import * as snd from '../audio.js';
import { setCounts } from '../shared/stats.js';
import { $, G, TILE, act, esc, fmtNum, openOverlay, recipeFor, store, toast } from './core.js';
import { cls } from './fight.js';
import { BURNERS, render } from './home.js';
import { boardHTML } from './invoice.js';
import { odoHTML, sideHTML } from './side.js';
import { WIDE, stairsHTML, towerHTML } from './tower.js';

// ---------- karty kafelków ----------
export function setOwned(set) { return G.run ? G.run.tiles.filter(id => TILE[id] && setsOf(TILE[id]).includes(set)).length : 0; }
// Plakietka poziomu statystyki: 1 szary, 2 papier pakowy, 3 złoty, 4 legendarna z poświatą (wyglądu karty nie zmienia).
export const lvlTag = t => t && t.lvl ? `<span class="lvl l${t.lvl}" title="Poziom ${t.lvl === 4 ? 'legendarny' : t.lvl}">${['I', 'II', 'III', '★'][t.lvl - 1]}</span>` : '';
export function tileCard(id, o = {}) {
  const t = TILE[id], i = o.i == null ? 0 : o.i, run = G.run;
  const own = run && !o.static && t.type === 'skill' ? run.skills.find(s => s.id === t.skill) : null;
  const tags = [`<span class="tag">${D.TYPES[t.type]}</span>`, `<span class="tag rar">${D.RARITY[t.rarity]}</span>`];
  for (const st of setsOf(t)) tags.push(`<span class="tag set">${D.SETS[st].name}${run && !o.static ? ' ' + (setOwned(st) + 1) : ''}</span>`);
  for (const tg of (t.tags || [])) if (D.ELEMENTS[tg]) tags.push(`<span class="tag el" style="--ec:${D.ELEMENTS[tg].color}">${D.ELEMENTS[tg].name}</span>`);
  if (run && !o.static) {
    const rc = recipeFor(id), known = rc && G.profile && (G.profile.recipes || []).includes(rc.out);
    if (rc) tags.push(`<span class="tag hatch">${known ? 'Wykluje: ' + esc(TILE[rc.out].name) : 'Wylęgarnia!'}</span>`);
    else if (D.RECIPES.some(x => x.of.includes(id))) tags.push('<span class="tag">Składnik</span>');
    const ms = D.MILESTONES[id];
    if (ms) { const n = run.tiles.filter(x => x === id).length % D.MILESTONE_EVERY; tags.push(`<span class="tag ${n === D.MILESTONE_EVERY - 1 ? 'hatch' : ''}">${n === D.MILESTONE_EVERY - 1 ? esc(ms.name) + '!' : 'Próg ' + (n + 1) + '/' + D.MILESTONE_EVERY}</span>`); }
  }
  if (t.boss) tags.push('<span class="tag hatch">Łup z bossa</span>');
  else if (t.next && run && !o.static) { const c = run.tiles.filter(x => x === id).length; tags.push(`<span class="tag ${c >= D.RULES.upgradeCost - 1 ? 'hatch' : ''}">Zlew ${Math.min(c + 1, D.RULES.upgradeCost)}/${D.RULES.upgradeCost}</span>`); }
  if (own && own.lvl >= 2) tags.push('<span class="tag up mut">Mutacja</span>');
  else if (own) tags.push('<span class="tag up">Poziom 2</span>');
  else if (t.type === 'skill' && run && run.skills.length >= (G.run.maxSkills || D.RULES.maxSkills) && !o.static) tags.push('<span class="tag">Zastąp slot</span>');
  const tag = o.static ? 'div' : 'button';
  const dis = o.price != null && run && run.coins < o.price ? 'disabled' : '';
  return `<${tag} class="tile r${t.rarity} ${o.static ? 'static' : ''} ${o.locked ? 'locked' : ''} ${o.mini ? 'mini' : ''}" ${o.static ? '' : `data-act="${o.act || 'pick'}" data-i="${i}"`} ${dis} style="--i:${i}" ${o.tip ? `data-tip="${esc(o.tip)}"` : ''}>
    ${o.static || o.key === false ? '' : `<span class="key">${i + 1}</span>`}${lvlTag(t)}${art.tileIcon(id)}
    <div class="tname">${esc(t.name)}</div><div class="ttext">${esc(t.text)}</div>
    <div class="tmeta">${tags.join('')}</div>
    ${o.price != null ? `<div class="price ${dis ? 'no' : ''}">${o.price} ${art.coinIcon()}</div>` : ''}
    ${o.lockText ? `<div class="lockbox">Zablokowany: ${esc(o.lockText)}</div>` : ''}</${tag}>`;
}

// ---------- ekran runu ----------
export const enemyDef = id => D.ENEMIES[id] || D.BOSSES[id];
export const bossIntroOf = id => T.BOSS_INTRO[id] || (D.BOSSES[id] ? { title: D.BOSSES[id].name + ', ' + D.BOSSES[id].title, quote: D.BOSSES[id].quote || '' } : { title: String(id), quote: '' });
export const enemyFig = e => e.ghost ? art.ghostArt(e.gchar, e.gwear) : art.enemyArt(e.art, e.tint);
export const compForm = c => { const d = D.COMPANIONS[c.id]; return d.forms[Math.min(2, Math.max(0, (c.lvl | 0) - 1))]; };
export function arenaPreview() {
  const g = G.run.arenaGhost, st = g.stats;
  return `<div class="preview doorview arenaview"><div class="lab">Arena Duchów! Nagroda: +${D.RULES.arenaCoins} Ziaren i wybór rzadkiego kafelka</div><div class="glass"><div class="pv boss">${art.ghostArt(g.char)}<span>Duch: ${esc(g.nick)}</span></div></div><div class="tplnote">Życie ${st.hp}, Atak ${st.atk}, szybkość ${(st.aspd / 100).toFixed(2).replace('.', ',')} / s, Pancerz ${st.armor}${g.mirror ? '. To twoje własne Odbicie.' : ''}</div></div>`;
}
export function extraPreview(id) {
  const d = D.BOSSES[id], pv = id === 'pipsztal' ? `<div class="pv">${art.enemyArt('pipdog')}<span>${esc(D.EXTRA_DOG.name)}</span></div>` : '';
  return `<div class="preview doorview arenaview"><div class="lab">Dodatkowa runda! Nagroda: +${D.RULES.extraCoins} Ziaren i wybór legendarnej statystyki</div><div class="glass">${pv}<div class="pv boss">${art.enemyArt(d.art)}<span>${esc(d.name)}</span></div></div><div class="tplnote">${esc(d.text)} Walczysz z życiem po poprzedniej walce (odpoczynek wyłączony).</div></div>`;
}
export function previewHTML() {
  const r = G.run; if (r.arenaGhost) return arenaPreview();
  if (r.extraNow) return extraPreview(r.extraNow);
  let ids = r.enemies || [];
  const bdef = r.boss && D.BOSSES[r.boss];
  if (bdef && bdef.guards) ids = [...Array(bdef.guards).fill('kot-ochroniarz'), r.boss];
  const nem = r.nemesisRound && r.nemesis;
  const items = ids.map((id, i) => { const d = enemyDef(id); const boss = !!D.BOSSES[id], big = i === 0 && nem;
    const name = i === 0 && nem ? r.nemesis.name : id === 'kot-ochroniarz' && bdef && bdef.guards ? 'Ochroniarz' : d.name;
    return `<div class="pv ${boss ? 'boss' : ''} ${big ? 'boss nemesis' : ''}">${art.enemyArt(d.art, d.tint)}<span>${esc(name)}</span></div>`; }).join('');
  const affs = r.elite && r.affixes ? r.affixes : nem ? [r.nemesis.affix] : null;
  const aff = affs ? `<div class="affixes">${affs.map(a => `<span class="tag aff" title="${esc(D.AFFIXES[a].text)}">${esc(D.AFFIXES[a].name)}: ${esc(D.AFFIXES[a].text)}</span>`).join('')}</div>` : '';
  const loot = nem && r.nemesis.tile && TILE[r.nemesis.tile] ? ` · odzyskasz: ${esc(TILE[r.nemesis.tile].name)}` : '';
  const lab = r.boss ? 'Boss tego piętra' : nem ? 'Twój Nemezis! Nagroda: Odznaka Sprawiedliwość Kurnika' + loot : r.elite ? 'Elitarny wróg na piętrze (nagroda: Odznaka)' : 'Na tym piętrze czekają';
  const tp = r.tpl && D.FLOOR_TPL[r.tpl] ? `<div class="tplnote"><b>${esc(D.FLOOR_TPL[r.tpl].name)}.</b> ${esc(D.FLOOR_TPL[r.tpl].text)}</div>` : '';
  const intel = r.intel ? `<div class="tplnote intel"><b>Zarząd cię obserwuje.</b> Widzą, że grasz na: ${esc(r.intel)}. Przygotowali na to odpowiedź.</div>` : '';
  // Od Garnka 1 serwer nie zdradza składu piętra: zaparowana szyba z jedną sylwetką (bez nazw i liczby wrogów).
  if (r.hidden && !nem) {
    const fogLab = r.elite ? 'Elitarny wróg za zaparowaną szybą (nagroda: Odznaka)' : 'Szyba zaparowana: nie wiesz, kto czeka';
    return `<div class="preview doorview fog"><div class="lab">${fogLab}</div><div class="glass"><div class="pv">${art.mysteryArt()}<span>?</span></div></div><div class="tplnote">Od Garnka 1 skład pięter jest tajemnicą. Bossów zapowiada pasek pięter.</div>${intel}</div>`;
  }
  return `<div class="preview doorview ${nem ? 'nem' : ''} ${r.boss ? 'bossdoor' : ''}"><div class="lab">${lab}</div><div class="glass">${items}</div>${aff}${tp}${intel}</div>`;
}
export const zoneAt = (mode, n) => { for (const z of D.MODES[mode].zones) if (n <= z.upTo) return z.zone; return 2; };
// Wpływ bieżącego okólnika na build gracza (tylko podpowiedź na ekranie, nie zmienia reguł).
export function decreeImpact(r) {
  const tiles = [...new Set(r.tiles)].map(id => TILE[id]).filter(Boolean);
  const has = (t, re) => (t.fx || []).some(f => re.test(f.k)), tag = (t, ...a) => (t.tags || []).some(x => a.includes(x));
  const own = pred => r.tiles.filter(id => TILE[id] && pred(TILE[id])).length;
  if (r.decree === 'oszczednosci') { const p = t => tag(t, 'ogien', 'lod') || has(t, /burn|frost|freeze|shatter|pressure/); return { ids: tiles.filter(p).map(t => t.id), line: `Twoje kafelki Ognia i Lodu: ${own(p)}` }; }
  if (r.decree === 'homeoffice') { const p = t => has(t, /rest|heal|regen|hpPct|hpFlat/); return { ids: tiles.filter(p).map(t => t.id), line: `Twoje kafelki leczące: ${own(p)}` }; }
  if (r.decree === 'integracja') { const sc = setCounts(r.tiles, r.decree); return { ids: [], line: `Aktywne zestawy: ${Object.values(sc).filter(n => n >= 2).length}` }; }
  return { ids: [], line: '' };
}
// Okólnik Zarządu: stały pasek pod tytułem piętra (nazwa, skutek i, gdy ma sens, ile twoich kafelków dotyczy).
export function decreeHTML() {
  const r = G.run, d = r.decree && D.DECREES[r.decree];
  if (!d) return '';
  const im = decreeImpact(r);
  return `<div class="decbar" tabindex="0" data-tip="${esc(d.name + '\n' + d.text)}"><span class="di">${art.decreeIcon()}</span><b>Okólnik: ${esc(d.name)}</b><span class="dt">${esc(d.text)}</span>${im.line ? `<span class="dl">${esc(im.line)}</span>` : ''}</div>`;
}
export const decreeSub = () => { const d = G.run.decree && D.DECREES[G.run.decree]; return d ? ` · <span class="dsub" title="${esc(d.text)}">Okólnik: ${esc(d.name)}</span>` : ''; };
// Plakietki na pasku: Dogrywka, Klątwy, trasa strefy.
export function topPills() {
  const r = G.run, o = [];
  if (r.endless) o.push('<span class="pill endl" title="Dogrywka: Prezes pokonany, run trwa dalej. Wrogowie rosną szybciej, co ' + D.RULES.superEvery + ' pięter wpada super-boss.">♾ Dogrywka</span>');
  if (r.curses && r.curses.length) o.push('<span class="pill curse" title="' + esc('Klątwy Prezesa (+' + r.cursePct + '% do wyniku):\n' + r.curses.map(c => D.CURSES[c].name + ': ' + D.CURSES[c].text).join('\n')) + '">☠ +' + r.cursePct + '%</span>');
  if (r.route && D.ROUTES[r.route]) { const R = D.ROUTES[r.route]; o.push('<span class="pill route" title="' + esc('Trasa: ' + R.name + '\n' + R.text) + '">' + art.emo(R.icon) + '<span class="lbl"> ' + esc(R.name) + '</span></span>'); }
  return o.join('');
}
export function topbarHTML() {
  const r = G.run;
  return `<div class="topbar dash"><span class="brand" aria-label="Bulgot"><img src="logo-napis.png?v=2" alt="Bulgot"></span>
    <span class="disp lift" title="Piętro ${r.round} z ${r.rounds}" aria-label="Piętro ${r.round} z ${r.rounds}"><i class="arr" aria-hidden="true">▲</i><b>${String(r.round).padStart(2, '0')}</b><small>/${r.endless ? '∞' : r.rounds}</small></span><span class="zone-name" title="${esc(T.ZONE_NAMES[r.zone])}">${esc(T.ZONE_NAMES[r.zone])}</span><span class="spacer"></span>
    <span class="disp coins" title="Ziarna: waluta na rerolle i zakupy. Odsetki po wygranej walce: +${Math.min(r.interestMax || 3, Math.floor(r.coins / D.RULES.interestPer))}">${art.coinIcon()}<b data-ctr="coins">${r.coins}</b></span>
    ${r.daily ?'<span class="pill dly" title="Dyżur dnia: jeden run dla wszystkich, bez Kurnika i premii.">Dyżur dnia</span>' : ''}${G.duelRun ? '<span class="pill duelt" id="dutop"></span>' : ''}${topPills()}${r.garnek ? `<span class="pill g" title="Palnik ${r.garnek} (${BURNERS[r.garnek]}): ${esc(D.GARNEK[r.garnek].name)}">Palnik ${r.garnek}</span>` : ''}
    <span class="disp odo" title="Wynik na żywo" aria-label="Wynik ${r.score}"><b data-ctr="score" data-odo="6">${odoHTML(r.score, 6)}</b></span>
    <button class="btn small menubtn" data-act="book" title="Księga Kurnika (K)" aria-label="Księga Kurnika">${art.bookIcon()}</button><button class="btn small menubtn" data-act="help" title="Jak grać (H)" aria-label="Jak grać">${art.helpIcon()}</button><button class="btn small menubtn" data-act="menu" title="Menu (Esc)" aria-label="Menu">${art.menuIcon()}</button></div>`;
}
export function stageHTML() {
  const r = G.run;
  if (r.phase === 'offer') return stageOffer();
  if (r.phase === 'event') { const kd = r.pending.kind; return kd === 'shop' ? stageShop() : kd === 'contract' ? stageContract() : kd === 'shrine' ? stageShrine() : kd === 'adopt' ? stageAdopt() : kd === 'crate' ? stageCrate() : kd === 'arena' ? stageArena() : kd === 'extra' ? stageExtra() : stageGamble(); }
  if (r.phase === 'badge') return stageBadge();
  if (r.phase === 'loot') return stageLoot();
  if (r.phase === 'route') return stageRoute();
  if (r.phase === 'victory') return stageVictory();
  if (r.phase === 'bonus') return stageBonus();
  if (r.phase === 'fight') return stagePrep();
  return '';
}
export function floorKron() {
  const r = G.run;
  if (r.extraNow) return D.BOSSES[r.extraNow].quote;
  if (r.boss) return bossIntroOf(r.boss).quote;
  return T.pickLine(T.OFFER_LINES[r.zone], r.round - 1);
}
// Linia pod tytułem piętra: Kronikarz albo (co drugie zwykłe piętro) radiowęzeł Korporacji i wtrącenia Prezesa (fabula.js).
export function floorKronHTML(id = '') {
  const r = G.run, plain = !r.boss && !r.extraNow && !r.nemesisRound;
  let rad = plain ? radioLine(r.zone, r.round) : null;
  if (plain && r.round === 2) {   // ślad poprzednika: po śmierci w poprzednim runie pierwszy radiowęzeł o nim wspomina
    let d = null; try { d = JSON.parse(store.get('bulgot:lastdeath') || 'null'); } catch (e) {}
    if (d && d.n) rad = { text: sladLine(d), prezes: false };
  }
  const text = rad ? rad.text : floorKron();
  return `<div class="kron${rad ? ' radio' + (rad.prezes ? ' prezes' : '') : ''}"${id ? ` id="${id}"` : ''}>${esc(text)}</div>`;
}
// Odpoczynek: za Ziarna leczy część życia, raz na rundę, przed walką.
export function restBtn() {
  const r = G.run, off = r.rested || r.hp >= r.maxHp || r.coins < r.restCost || !!r.extraNow;
  const why = r.extraNow ? 'Przed dodatkową rundą nie ma odpoczynku' : r.rested ? 'W tej rundzie już odpoczywałeś' : r.hp >= r.maxHp ? 'Masz pełne życie' : r.coins < r.restCost ? 'Za mało Ziaren' : 'Odpoczynek (klawisz O)';
  return `<button class="btn" data-act="rest" ${off ? 'disabled' : ''} title="${why}">Odpoczynek: +${r.restPct}% życia za ${r.restCost} ${art.coinIcon()}</button>`;
}
export function offerCard(id, i) {
  const r = G.run, t = TILE[id], price = shopPrice(t), left = r.offer.filter(Boolean).length;
  const buy = t.event
    ? '<div class="buynote">Wydarzenie: tylko do wyboru</div>'
    : `<button class="btn small buy" data-act="buyoffer" data-i="${i}" ${r.coins < price || left < 2 ? 'disabled' : ''} title="Dokup ten kafelek za Ziarna (Shift + ${i + 1}). Darmowy wybór zostaje.">Dokup za ${price} ${art.coinIcon()}</button>`;
  const flaw = i === r.flawAt;
  const stamp = flaw ? '<div class="stamp flaw" title="Efekty kafelka są o 50% mocniejsze, ale ma ukrytą wadę, która ujawni się po następnej walce.">Wada fabryczna · +50%</div>' : '';
  return `<div class="slotcard ${flaw ? 'flawed' : ''}">${stamp}${tileCard(id, { i })}${buy}</div>`;
}
// Lombard Lisa: przycisk zastawu albo wykupu.
export function pawnBtn() {
  const r = G.run, p = r.pawned;
  if (p && p.canRedeem) return `<button class="btn" data-act="redeem" ${r.coins < p.cost ? 'disabled' : ''} title="Lis odda kafelek tylko na tym piętrze">${art.pawnIcon()} Wykup: ${esc(TILE[p.id].name)} za ${p.cost} ${art.coinIcon()}</button>`;
  if (p) return '';
  return `<button class="btn" data-act="pawnmenu" ${pawnable().length ? '' : 'disabled'} title="Zastaw kafelek u Lisa za pełną cenę (klawisz L)">${art.pawnIcon()} Lombard Lisa</button>`;
}
// Ulepszanie: 3 kopie statystyki poziomu 1 lub 2 zlewają się w 1 kafelek następnego poziomu (za darmo).
export function upgradeBtn() {
  const up = G.run.up || [];
  return `<button class="btn ${up.length ? 'upg' : ''}" data-act="upgrademenu" ${up.length ? '' : 'disabled'} title="${up.length ? 'Zlej ${D.RULES.upgradeCost} takie same kafelki w jeden wyższego poziomu (klawisz U)' : 'Potrzebujesz 3 takich samych statystyk poziomu 1 lub 2 (zlewają się w wyższy poziom)'}">${art.upgradeIcon()} Zlej kafelki${up.length ? ` (${up.length})` : ''}</button>`;
}
export function showUpgrade() {
  // Patch 1.1: zlew poziomu 2 → 3 ma wybór: „czysty” albo „przegrzany” (+flawBoost% efektu, ale ukryta wada fabryczna ujawniana po walce).
  const rows = (G.run.up || []).map(id => { const t = TILE[id], nx = TILE[t.next], n = G.run.tiles.filter(x => x === id).length;
    const pair = `<span class="upg-from r${t.rarity}" data-tipk="tile:${id}"><span class="pi">${lvlTag(t)}${art.tileIcon(id)}</span><b>${D.RULES.upgradeCost}×</b> ${esc(t.name)}${n > D.RULES.upgradeCost ? ` <small>(masz ${n})</small>` : ''}</span><span class="upg-arrow">→</span><span class="upg-to r${nx.rarity}" data-tipk="tile:${nx.id}"><span class="pi">${lvlTag(nx)}${art.tileIcon(nx.id)}</span>${esc(nx.name)}<small>${esc(nx.text)}</small></span>`;
    if (t.lvl !== 2) return `<button class="upg-row" data-act="upgrade" data-v="${id}">${pair}</button>`;
    return `<div class="upg-row two"><div class="upg-pair">${pair}</div><div class="upg-choice">
      <button class="btn" data-act="upgrade" data-v="${id}">Czysty<small>bez ryzyka, tak jak zwykle</small></button>
      <button class="btn hot" data-act="upgrade" data-v="${id}" data-hot="1">Przegrzany<small>+${D.RULES.flawBoost}% efektu, ale ukryta wada ujawni się po walce</small></button></div></div>`; }).join('');
  openOverlay(`<h2>Zlewanie kafelków</h2><p class="lead">Dwie takie same statystyki poziomu 1 lub 2 zlewasz za darmo w jedną następnego poziomu. Kosztem są dwa kafelki, nie Ziarna. Przy zlewie 2 → 3 wybierasz: czysty albo przegrzany (mocniejszy, z wadą fabryczną).</p><div class="upg-list">${rows || '<p class="hint">Nie masz trzech takich samych kafelków do zlania.</p>'}</div>`, { cls: 'upgmodal' });
}
export const pawnable = () => { const r = G.run; return [...new Set(r.tiles)].filter(id => { const t = TILE[id]; return t && t.type !== 'skill' && !t.hidden && !t.noPawn && !(r.flawed || []).some(w => w.id === id); }); };
// Zamiana kolejności umiejętności (slot = klawisz w walce). Serwer zapisuje kolejność, więc powtórka walki się zgadza.
export async function swapSlots(a, b) {
  const j = await act('skillorder', { a, b }); if (!j) return;
  snd.sfx('click'); render();
}
export function showPawn() {
  const P = D.RULES.prices, back = D.RULES.pawnBack, fox = D.RULES.pawnFox, coin = art.coinIcon();
  // kompaktowe kafelki w jednym rzędzie (pełny opis w dużej podpowiedzi po najechaniu), żeby okno nie wymagało przewijania
  const cards = pawnable().map(id => { const t = TILE[id], pr = P[t.rarity], n = G.run.tiles.filter(x => x === id).length;
    return `<div class="pawn-card r${t.rarity}" data-tipk="tile:${id}" tabindex="0"><span class="pi">${art.tileIcon(id)}${n > 1 ? `<sup>×${n}</sup>` : ''}</span><div class="pn">${esc(t.name)}</div><div class="pb">Wykup: <b>${Math.ceil(pr * back / 100)}</b> ${coin}</div><button class="btn small buy" data-act="pawn" data-v="${id}">Zastaw za ${pr} ${coin}</button></div>`; }).join('');
  openOverlay(`<h2>Lombard Lisa</h2>
    <p class="lead">Lis pożycza Ci Ziarna pod zastaw kafelka: pieniądze dostajesz od razu, ale kafelek znika z budowy i musisz go odkupić drożej.</p>
    <div class="pawn-how">
      <div><b>Jak to działa</b><ol><li>Oddajesz jeden kafelek (nie umiejętność, nie kafelek z wadą) i dostajesz <b>pełną cenę</b> jego rzadkości.</li><li>Na <b>następnym piętrze</b> wykupisz go za <b>${back}%</b> (zwykły ${P[0]} → ${Math.ceil(P[0] * back / 100)}, rzadki ${P[1]} → ${Math.ceil(P[1] * back / 100)}).</li><li>Nie wykupisz? Przepada, a Lisy Windykatory są o <b>${fox}%</b> silniejsze (za każdy zastaw). Lis trzyma naraz jeden.</li></ol></div>
      <div><b>Kiedy warto</b><ul><li>Potrzebujesz Ziaren <b>teraz</b> (dokup, reroll), a kafelek słabo pasuje do budowy.</li><li>Wiesz, że za piętro będziesz mieć na wykup.</li></ul><b>Kiedy nie</b><ul><li>To kluczowy kafelek zestawu, a bez niego przegrasz walkę.</li><li>Nie stać Cię będzie na wykup.</li></ul></div>
    </div>
    <div class="pawn-cards">${cards}</div>`, { cls: 'pawnmodal' });
}
// Przycisk wymiany oferty: nazwa z fabuły (T.REROLL), cena w Ziarnach obok; Klątwa „Zakaz Wymian” blokuje go całkiem.
export function rerollBtn(cost, free, blocked, coins) {
  if (blocked) return `<button class="btn reroll" disabled data-tip="${esc('Zakaz Wymian' + String.fromCharCode(10) + 'Klątwa Prezesa: taśma stoi, oferty nie przetasujesz.')}"><span>${esc(T.REROLL_BLOCKED)}</span></button>`;
  return `<button class="btn reroll" data-act="reroll" ${coins < cost ? 'disabled' : ''}><span>${esc(T.REROLL)}</span><span class="rcost ${free ? 'free' : ''}">${free ? 'gratis' : `${cost} ${art.coinIcon()}`}</span></button>`;
}
export function stageOffer() {
  const r = G.run, cards = r.offer.map((id, i) => id ? offerCard(id, i) : '<div class="slotcard"><div class="tile gone">Dokupione</div></div>').join('');
  const cost = r.rerollCost, free = cost === 0, blocked = cost === null || cost === undefined;
  const lost = r.lostPawn && r.foxDebt ? `<div class="hint warn">Lis zatrzymał ${esc(TILE[r.lostPawn] ? TILE[r.lostPawn].name : '')}. Lisy Windykatory są silniejsze o ${r.foxDebt * D.RULES.pawnFox}%.</div>` : '';
  return `<div class="stage-title"><h2>Piętro ${r.round}${r.boss ? ' · BOSS' : ''}</h2><div class="sub">${esc(T.ZONE_NAMES[r.zone])}${r.elite ? ' · elitarny wróg' : ''}${decreeSub()}</div></div>
    ${r.nemesisRound ? `<div class="kron">${esc(T.pickLine(T.NEMESIS_LINES, r.round))}</div>` : floorKronHTML()}${decreeHTML()}${previewHTML()}
    <div class="cards">${cards}</div>
    <div class="actions">${rerollBtn(cost, free, blocked, r.coins)}${restBtn()}${pawnBtn()}${upgradeBtn()}</div>${lost}`;
}
export function stageShop() {
  const r = G.run, cards = r.pending.offer.map((id, i) => tileCard(id, { i, act: 'buy', price: Math.max(1, Math.ceil(shopPrice(TILE[id]) * D.RULES.shopPct / 100)) })).join('');
  return `<div class="stage-title"><h2>Sklepik Babci Kwoki</h2><div class="sub">Masz ${r.coins} ${art.coinIcon()} Ziaren</div></div>
    <div class="kron">Babcia nie bierze kart. Babcia bierze ziarno.</div><div class="cards">${cards}</div>
    <div class="actions"><button class="btn" data-act="leave">Wychodzę bez zakupu</button></div>`;
}
export const shopPrice = t => { const p = Math.ceil(D.RULES.prices[t.rarity] * ((G.run && G.run.priceMul) || 100) / 100), d = G.run && G.run.buyDisc; return d ? Math.max(1, Math.floor(p * (100 - d) / 100)) : p; };
export const setsOf = t => t.sets || (t.set ? [t.set] : []);
export function stageGamble() {
  const r = G.run, c = r.coins, q = Math.max(1, Math.floor(c / 4)), h = Math.max(1, Math.floor(c / 2));
  const bets = c > 0 ? [...new Set([1, q, h, c])].filter(x => x <= c).map(x => `<button class="btn" data-act="bet" data-v="${x}">Stawiam ${x} ${art.coinIcon()}</button>`).join('') : '<span class="hint">Nie masz czym grać.</span>';
  return `<div class="stage-title"><h2>Hazard w Kurniku</h2><div class="sub">Rzut monetą: ${D.RULES.betPct}% podwajasz stawkę, ${100 - D.RULES.betPct}% tracisz ją</div></div>
    <div class="kron">Zasady proste: dom zawsze wygrywa. Dom to kurnik.</div>
    <div class="gamble"><div class="bignum">${c} ${art.coinIcon('coin')}</div><div class="bets">${bets}</div><button class="btn ghost" data-act="bet" data-v="0">Nie ryzykuję</button></div>`;
}
// Odznaki, Kontrakt z HR, Kapliczka: karty decyzji (data-act=choose).
export function choiceCard(i, icon, name, text, extra = '') {
  return `<button class="tile choice r2" data-act="choose" data-i="${i}" style="--i:${i}"><span class="key">${i + 1}</span>${icon}<div class="tname">${esc(name)}</div><div class="ttext">${esc(text)}</div>${extra}</button>`;
}
export function stageBadge() {
  const r = G.run, cards = r.pending.offer.map((b, i) => choiceCard(i, art.badgeIcon(b), D.BADGES[b].name, D.BADGES[b].text, '<div class="tmeta"><span class="tag up">Odznaka</span></div>')).join('');
  return `<div class="stage-title"><h2>Odznaka Pracownicza</h2><div class="sub">Nagroda za ${r.boss ? 'pokonanie bossa' : 'elitarnego wroga'}. Działa do końca runu i nie zajmuje miejsca.</div></div>
    <div class="kron">Dział Kadr z niechęcią przyznaje wyróżnienie. Wybierz jedno.</div><div class="cards">${cards}</div>`;
}
export function stageLoot() {
  const r = G.run, cards = r.pending.offer.map((id, i) => tileCard(id, { i, act: 'choose' })).join('');
  return `<div class="stage-title"><h2>Łup z bossa</h2><div class="sub">Z pokonanego bossa wypadły trzy legendarne rzeczy. Weź jedną.</div></div>
    <div class="kron">Zarząd sprząta po bossie. Resztki wciąż są warte więcej niż twoja pensja.</div><div class="cards">${cards}</div>`;
}
// Trasa na początku strefy: dwie drogi z różnymi modyfikatorami na całą strefę.
export function stageRoute() {
  const r = G.run, cards = r.pending.opts.map((id, i) => { const R = D.ROUTES[id]; return choiceCard(i, art.emo(R.icon), R.name, R.text, '<div class="tmeta"><span class="tag up">Trasa na całą strefę</span></div>'); }).join('');
  return `<div class="stage-title"><h2>Piętro ${r.round}: wybierz trasę</h2><div class="sub">Wchodzisz do strefy: ${esc(T.ZONE_NAMES[r.zone])}. Trasa działa do końca strefy.</div></div>
    <div class="kron">Korytarz rozwidla się w dwie strony. Jedna pachnie rosołem, druga czymś gorszym.</div><div class="cards">${cards}</div>`;
}
// Po Prezesie: koniec runu albo Dogrywka.
export function stageVictory() {
  const r = G.run;
  const cards = [
    choiceCard(0, art.emo('dogrywka'), 'Dogrywka', 'Zostajesz w fabryce. Wrogowie rosną szybciej, co ' + D.RULES.superEvery + ' pięter wpada super-boss, a każde piętro dokłada ' + D.RULES.scoreRound + ' pkt. Porażka nie odbiera wygranej.', '<div class="tmeta"><span class="tag up">Ranking Dogrywki</span></div>'),
    choiceCard(1, art.potArt(true), 'Zakończ run', 'Zgarniasz wygraną i wynik teraz: ' + fmtNum(r.score) + ' pkt.'),
  ].join('');
  return `<div class="stage-title"><h2>Prezes pokonany!</h2><div class="sub">Wygrana jest już twoja. Co dalej?</div></div>
    <div class="kron">${esc('Padł Prezes, a z nim upadł cały cennik. Ale schody prowadzą jeszcze wyżej.')}</div><div class="cards">${cards}</div>`;
}
// Schronisko dla Piskląt: adopcja towarzysza.
export function companionBlurb(id, lvl = 1) { const d = D.COMPANIONS[id], L = d.lv[lvl - 1]; return d.text + (L.every ? ' Co ' + (L.every / 10).toString().replace('.', ',') + ' s: ' + ({ peck: L.v + '% Ataku', heal: L.v + '% Życia', burn: L.v + ' st. Oparzenia', frost: L.v + ' st. Mrozu', honk: 'ogłuszenie ' + (L.v / 10).toString().replace('.', ',') + ' s' }[L.act] || '') + '.' : ''); }
export function stageAdopt() {
  const r = G.run, cur = r.companion, cards = r.pending.opts.map((id, i) => choiceCard(i, art.companionArt(id), D.COMPANIONS[id].name, companionBlurb(id, r.pending.start ? Math.max(1, (r.kurnik && r.kurnik.pisklecarnia >= 3) ? 2 : 1) : 1), '<div class="tmeta"><span class="tag up">Rośnie po bossach</span></div>')).join('');
  return `<div class="stage-title"><h2>${r.pending.start ? 'Pisklęcarnia' : 'Schronisko dla Piskląt'}</h2><div class="sub">${cur ? 'Masz już: ' + esc(compForm(cur)) + '. Nowy towarzysz go zastąpi.' : 'Wybierz towarzysza, który będzie walczył u twojego boku.'}</div></div>
    <div class="kron">${r.pending.start ? 'Pisklęta z Pisklęcarni czekają na ciebie przed pierwszym piętrem.' : 'Adopcja jest bezpłatna. Gryzienie w cenie.'}</div><div class="cards">${cards}</div>
    <div class="actions"><button class="btn" data-act="choose" data-i="-1">Nie adoptuję</button></div>`;
}
// Tajemnicza Skrzynka przy pełnych slotach: wybierz umiejętność do zastąpienia albo zostaw nagrodę.
export function stageCrate() {
  const r = G.run, t = TILE[r.pending.tile];
  const cards = r.skills.map((s, i) => choiceCard(i, art.tileIcon(D.TILES.find(x => x.skill === s.id).id), (i + 1) + '. ' + D.SKILLS[s.id].name + (s.lvl >= 3 ? ' (zmutowana)' : s.lvl >= 2 ? ' (poz. 2)' : ''), 'Zastąp tę umiejętność: ' + t.name + '.')).join('');
  return `<div class="stage-title"><h2>Tajemnicza Skrzynka</h2><div class="sub">W środku leży ${esc(t.name)} (${D.RARITY[t.rarity]}), ale masz pełne sloty. Którą umiejętność zastąpić?</div></div>
    <div class="cards">${tileCard(t.id, { static: true, mini: true })}</div><div class="cards">${cards}</div>
    <div class="actions"><button class="btn" data-act="choose" data-i="-1">Zostaw nagrodę</button></div>`;
}
// Arena Duchów: walka z buildem innego gracza.
export function stageArena() {
  const r = G.run, g = r.pending.ghost, st = g.stats, ch = D.CHARS[g.char], tiles = [...new Set(g.tiles || [])].slice(0, 16).map(id => TILE[id] ? art.tileIcon(id) : '').join('');
  const cards = [
    choiceCard(0, art.ghostArt(g.char, g.wear), 'Walcz z Duchem', 'Nagroda: +' + D.RULES.arenaCoins + ' Ziaren i wybór 1 z 3 rzadkich kafelków. Przegrana kończy run jak każda walka.', '<div class="tmeta"><span class="tag up">Ryzyko</span></div>'),
    choiceCard(1, art.doorIcon(false), 'Odwrót', 'Odchodzisz i walczysz ze zwykłymi wrogami tego piętra.'),
  ].join('');
  return `<div class="stage-title"><h2>Arena Duchów</h2><div class="sub">${g.mirror ? 'Nikt jeszcze nie zostawił tu ducha, więc czeka twoje Odbicie.' : 'Duch gracza <b>' + esc(g.nick) + '</b> (' + esc(ch ? ch.name : '') + ', ' + g.floors + ' pięter)'}</div></div>
    <div class="kron">Kto nie dotarł do Prezesa, ten krąży po arenie i bije następnych.</div>
    <div class="ghostcard"><div class="gfig">${art.ghostArt(g.char, g.wear)}</div><div class="gst"><b>Statystyki Ducha na tym piętrze</b><span>Życie ${st.hp}</span><span>Atak ${st.atk}</span><span>Szybkość ${(st.aspd / 100).toFixed(2).replace('.', ',')} / s</span><span>Pancerz ${st.armor}</span><span>Dziobnięcie ${st.crit}%</span><span>Unik ${st.evade}%</span><div class="gtiles">${tiles}</div></div></div>
    <div class="cards">${cards}</div>`;
}
// Dodatkowa runda po wygranej na piętrze 3 (Gruszka) i 6 (Pipsztal): opcjonalna walka z życiem, które ci zostało.
export const EXTRA_INFO = {
  gruszka: { title: 'Gruszka kręci staffem', sub: 'Facet-gruszka z dragon staffem. Zerknął na twój build, przeczytał jeden artykuł i już jest oburzony.', kron: 'Zacznie od wykładu. Skończy na obrotach.' },
  pipsztal: { title: 'Pipsztal wchodzi z Lakusiem', sub: 'Kurczak w dresie, nóż w skrzydle i pies Lakuś, który nie trzyma moczu. Pytanie o pięć złotych to dopiero początek.', kron: 'Lakuś sika, Pipsztal tnie. Ty ogłuszony.' },
};
export function stageExtra() {
  const r = G.run, id = r.pending.boss, X = EXTRA_INFO[id], d = D.BOSSES[id];
  const cards = [
    choiceCard(0, art.enemyArt(d.art), 'Walcz: ' + d.name, 'Walka z życiem, które ci zostało (' + r.hp + ' z ' + r.maxHp + '). Nagroda: +' + D.RULES.extraCoins + ' Ziaren i wybór 1 z 3 legendarnych statystyk. Przegrana kończy run, a leczenie po piętrze dostajesz dopiero po walce.', '<div class="tmeta"><span class="tag up">Ryzyko</span></div>'),
    choiceCard(1, art.doorIcon(false), 'Odpuszczam', 'Odchodzisz bez bicia piany, dostajesz leczenie po piętrze i idziesz dalej.'),
  ].join('');
  return `<div class="stage-title"><h2>Dodatkowa runda: ${esc(d.name)}</h2><div class="sub">${esc(X.title)}. Opcjonalna, możesz odpuścić.</div></div>
    <div class="kron">${esc(X.kron)}</div>
    <div class="cards">${cards}</div>`;
}
export function stageContract() {
  const cards = [
    choiceCard(0, art.tileIcon('umowa-etat'), 'Umowa o Pracę', '+30% Ataku do końca runu, ale -2 Ziarna po każdej rundzie.'),
    choiceCard(1, art.tileIcon('umowa-b2b'), 'Umowa B2B', '+15 Ziaren od ręki, ale -15% maks. Życia do końca runu.'),
    choiceCard(2, art.tileIcon('kontrakt-hr'), 'Nie podpisuję', 'Wychodzisz z biura z godnością i niczym więcej.'),
  ].join('');
  return `<div class="stage-title"><h2>Kontrakt z Działem HR</h2><div class="sub">Podpis jest na zawsze. Jak tatuaż, tylko z pieczątką.</div></div><div class="kron">Pani z HR uśmiecha się zbyt szeroko.</div><div class="cards">${cards}</div>`;
}
export function stageShrine() {
  const r = G.run, b = r.pending.badge;
  const cards = [choiceCard(0, art.tileIcon('cieple-gniazdko'), 'Modlitwa o zdrowie', 'Pełne uleczenie: wracasz do ' + r.maxHp + ' Życia.')];
  if (b) cards.push(choiceCard(1, art.badgeIcon(b), 'Odznaka: ' + D.BADGES[b].name, D.BADGES[b].text));
  cards.push(choiceCard(2, art.tileIcon('kapliczka'), 'Tylko przechodzę', 'Kłaniasz się i idziesz dalej.'));
  return `<div class="stage-title"><h2>Kapliczka Świętego Rosołu</h2><div class="sub">Masz ${r.hp} / ${r.maxHp} Życia</div></div><div class="kron">Pachnie marchewką i nadzieją.</div><div class="cards">${cards.join('')}</div>`;
}
export function stageBonus() {
  const r = G.run, cards = r.offer.map((id, i) => tileCard(id, { i, act: 'bonuspick' })).join('');
  return `<div class="stage-title"><h2>Nagroda za pokonanie bossa</h2><div class="sub">Wybierz jeden z trzech rzadkich lub lepszych kafelków</div></div>
    <div class="kron">${esc(T.BOSS_WIN_LINES[lastBoss()] || 'Boss padł, a łup czeka.')}</div><div class="cards">${cards}</div>`;
}
export const lastBoss = () => { const b = G.run && G.run.stats.bossKills; return b && b[b.length - 1]; };
export function stagePrep() {
  const r = G.run;
  return `<div class="stage-title"><h2>Piętro ${r.round}: do walki!</h2><div class="sub">${esc(T.ZONE_NAMES[r.zone])}${decreeSub()}</div></div>
    ${r.nemesisRound ? `<div class="kron">${esc(T.pickLine(T.NEMESIS_LINES, r.round + 1))}</div>` : floorKronHTML()}${decreeHTML()}${previewHTML()}
    <div class="actions">${restBtn()}<button class="btn primary big" data-act="tofight" data-primary>Do walki!</button></div>
    <div class="hint">W walce użyjesz umiejętności klawiszami 1, 2, 3. P robi pauzę. O to odpoczynek.<br><b>Okno Gdakania:</b> kolejna umiejętność w ciągu 1,5 s bije mocniej (2. +20%, 3. +50%), a trzy różne pod rząd ogłuszają wrogów na 1 s.</div>`;
}
export function renderRun() {
  return `<div class="run">${topbarHTML()}${WIDE.matches ? stairsHTML() : towerHTML()}<main class="stage">${stageHTML()}${boardHTML()}</main>${sideHTML()}</div>`;
}

// ---------- akcje wyboru ----------
// Kafelek umiejętności może wymagać decyzji: który slot zastąpić (pełne sloty) albo którą gałąź Mutacji wybrać (trzecia kopia).
export function needChoice(t, slot, mut, go) {
  if (!t || t.type !== 'skill') return false;
  const r = G.run, own = r.skills.find(s => s.id === t.skill);
  if (own && own.lvl >= 2 && mut === undefined) { askMut(t, m => go(slot, m)); return true; }
  if (!own && slot === undefined && r.skills.length >= (G.run.maxSkills || D.RULES.maxSkills)) { askSlot(t, s => go(s, mut)); return true; }
  return false;
}
export function askMut(tile, cb) {
  const sk = D.SKILLS[tile.skill];
  G.mutCb = cb;
  const opts = sk.muts.map((m, k) => `<button class="slot mutopt" data-act="mutchoose" data-v="${k + 1}">${art.tileIcon(tile.id)}<div><div class="sn">${esc(m.name)}</div><div class="sd">${esc(m.text)}</div></div></button>`).join('');
  openOverlay(`<h2>Mutacja: ${esc(sk.name)}</h2><p class="lead">Trzecia kopia zmienia umiejętność na stałe. Zachowuje moc poziomu 2 i dostaje jedną z dwóch cech. Wybierz gałąź:</p><div class="slotpick">${opts}</div>`, { narrow: true });
}
export const flawToast = (i, t) => { if (i === G.lastFlawAt) toast('Wada fabryczna: ' + t.name + ' działa o 50% mocniej, a ukryta wada ujawni się po walce.', false, 4600); };
export async function doPick(i, slot, mut) {
  const r = G.run, id = r.offer[i], t = TILE[id];
  if (!t) return;
  if (needChoice(t, slot, mut, (s2, m2) => doPick(i, s2, m2))) return;
  G.lastFlawAt = r.flawAt;
  const j = await act('pick', { i, slot, mut });
  if (!j) return;
  snd.sfx('pick'); flawToast(i, t);
  if (j.crate && j.crate.pick) { snd.sfx(j.crate.trap ? 'hurt' : 'unlock'); return render(); }   // pełne sloty: wybór slotu na ekranie wydarzenia
  if (j.crate) return showCrate(j.crate);
  if (j.automat) toast('Automat wypluł: ' + j.automat.map(id => TILE[id].name).join(' i '), false, 4200);
  render();
}
export async function doBuy(i, slot, mut) {
  const r = G.run, id = r.offer[i], t = id && TILE[id];
  if (!t) return;
  if (needChoice(t, slot, mut, (s2, m2) => doBuy(i, s2, m2))) return;
  G.lastFlawAt = r.flawAt;
  const j = await act('buy', { i, slot, mut });
  if (!j) return;
  snd.sfx('coin'); toast('Dokupiono: ' + t.name + ' (-' + j.price + ' Ziaren)'); flawToast(i, t);
  render();
}
export function askSlot(tile, cb) {
  const r = G.run, rows = r.skills.map((s, i) => `<button class="slot" data-act="slotchoose" data-v="${i}" style="width:100%;text-align:left;cursor:pointer">${art.tileIcon(D.TILES.find(t => t.skill === s.id).id)}<div><div class="sn">${i + 1}. ${esc(D.SKILLS[s.id].name)} ${s.lvl >= 2 ? '(poz. 2)' : ''}</div><div class="sd">Zastąp tę umiejętność</div></div></button>`).join('');
  G.slotCb = cb;
  openOverlay(`<h2>Pełne sloty</h2><p class="lead">Masz już trzy umiejętności. Którą zastąpić umiejętnością <b>${esc(tile.name)}</b>?</p><div class="slotpick">${rows}</div>`, { narrow: true });
}
export function showCrate(c) {
  const t = c.tile ? TILE[c.tile] : null;
  const body = (t ? `<p class="lead">W środku leżał <b>${esc(t.name)}</b> (${D.RARITY[t.rarity]}).</p><div class="cards">${tileCard(t.id, { static: true, mini: true })}</div>` : '<p class="lead">Skrzynka była pusta.</p>')
    + (c.trap ? '<p class="lead" style="color:#ff9f80"><b>Pułapka!</b> Skrzynka ugryzła cię w pióra. Tracisz 15% życia.</p>' : '<p class="lead">Szczęście dopisało: żadnej pułapki.</p>');
  snd.sfx(c.trap ? 'hurt' : 'unlock');
  openOverlay(`<h2>Tajemnicza Skrzynka</h2>${body}<div class="actions" style="margin-top:14px"><button class="btn primary" data-act="close" data-primary>Dalej</button></div>`, { narrow: true });
  render();
}

