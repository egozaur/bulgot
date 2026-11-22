// Bulgot: wielka podpowiedź po najechaniu (kafelki, przedmioty, zestawy, odznaki, statystyki, zwykłe teksty).
// Jedno pływające okienko #tip, zawsze w całości w oknie przeglądarki (z uwzględnieniem skali interfejsu).
// Elementy opisuje się atrybutami: data-tipk="tile:<id>" | "set:<id>" | "stat:<klucz>" | "badge:<id>" (+ data-tipx = dopisek),
// albo zwykłym data-tip="Tytuł\nopis" (pierwsza linia pogrubiona).
import * as D from './shared/data.js';
import * as art from './art.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TILE = D.TILE_BY_ID;
const setsOf = t => t.sets || (t.set ? [t.set] : []);
const pl = v => String(v).replace('.', ',');
const fl = Math.floor;
const nl = s => esc(s).replace(/\n/g, '<br>');

let ctx = { run: () => null };
let tipEl = null, anchor = null;

// ---------- treść ----------
function owned(setId) { const r = ctx.run(); return r ? r.tiles.filter(id => TILE[id] && setsOf(TILE[id]).includes(setId)).length : 0; }

function setBonuses(setId, have) {
  const st = D.SETS[setId]; if (!st) return '';
  const rows = [[2, st.b2], [3, st.b3], [4, st.b4]].filter(x => x[1]);
  return `<div class="tp-set"><div class="tp-sh">Zestaw ${esc(st.name)}${have != null ? ` <b>${have}</b>` : ''}</div>${rows.map(([n, tx]) => `<div class="tp-b ${have != null && have >= n ? 'on' : ''}"><i>${n}</i><span>${esc(tx)}</span></div>`).join('')}</div>`;
}

function tileTip(id, extra) {
  const t = TILE[id]; if (!t) return '';
  const r = ctx.run();
  const tags = [`<span class="tag">${D.TYPES[t.type]}</span>`, `<span class="tag rar r${t.rarity}">${D.RARITY[t.rarity]}</span>`];
  for (const tg of (t.tags || [])) if (D.ELEMENTS[tg]) tags.push(`<span class="tag el" style="--ec:${D.ELEMENTS[tg].color}">${esc(D.ELEMENTS[tg].name)}</span>`);
  let info = '';
  if (t.type === 'skill' && D.SKILLS[t.skill]) {
    const s = D.SKILLS[t.skill];
    info += `<div class="tp-line">Cooldown: <b>${pl((s.cd / 10).toFixed(1))} s</b> · druga kopia: poziom 2 (+30% mocy, −20% cooldownu), trzecia: Mutacja</div>`;
  }
  const n = r ? r.tiles.filter(x => x === id).length : 0;
  if (n) info += `<div class="tp-line">Masz: <b>×${n}</b>${t.repeat === false ? '' : ''}</div>`;
  if (t.type === 'stat' && t.lvl) {
    const nx = t.next && TILE[t.next];
    info += t.boss ? '<div class="tp-line hatch">Legendarny łup z bossa: wybierasz 1 z 3 po pokonaniu bossa. Nie wypada w ofertach.</div>'
      : `<div class="tp-line">Poziom <b>${t.lvl} / 3</b>${nx ? ` · <b>${D.RULES.upgradeCost}× ${esc(t.name)}</b> zlewa się w <b>${esc(nx.name)}</b> (przycisk „Zlej kafelki”, za darmo)` : ' · najwyższy poziom zwykły'}</div>`;
  }
  if (t.grow && r) info += `<div class="tp-line">Licznik: <b>${Math.min(t.grow.max, (r.grow || {})[id] || 0)} / ${t.grow.max}</b></div>`;
  const sets = setsOf(t).map(sid => setBonuses(sid, owned(sid))).join('');
  const rc = D.RECIPES && D.RECIPES.find(x => x.of.includes(id));
  if (rc && TILE[rc.out]) info += `<div class="tp-line hatch">Wylęgarnia: z ${esc(rc.of.map(x => TILE[x].name).join(' + '))} wykluwa się <b>${esc(TILE[rc.out].name)}</b></div>`;
  return `<div class="tp-head r${t.rarity}"><span class="tp-ico">${art.tileIcon(id)}</span><div><div class="tp-name">${esc(t.name)}</div><div class="tp-tags">${tags.join('')}</div></div></div>
    <div class="tp-text">${esc(t.text)}</div>${info}${sets}${t.flavor ? `<div class="tp-flavor">„${esc(t.flavor)}”</div>` : ''}${extra ? `<div class="tp-extra">${nl(extra)}</div>` : ''}`;
}

function setTip(setId) {
  const st = D.SETS[setId]; if (!st) return '';
  const r = ctx.run(), have = owned(setId);
  const members = D.TILES.filter(t => setsOf(t).includes(setId));
  const icons = members.map(t => `<span class="tp-mem ${r && r.tiles.includes(t.id) ? 'has' : ''}" title="${esc(t.name)}">${art.tileIcon(t.id)}</span>`).join('');
  return `<div class="tp-head r1"><div><div class="tp-name">Zestaw ${esc(st.name)}</div><div class="tp-tags"><span class="tag set">${have} / ${members.length} sztuk</span></div></div></div>
    <div class="tp-text">Im więcej przedmiotów z tego zestawu, tym większe bonusy. Rozświetlone są te, które masz.</div>
    <div class="tp-mems">${icons}</div>${setBonuses(setId, have)}`;
}

function badgeTip(id) {
  const b = D.BADGES[id]; if (!b) return '';
  return `<div class="tp-head r2"><span class="tp-ico">${art.badgeIcon(id)}</span><div><div class="tp-name">${esc(b.name)}</div><div class="tp-tags"><span class="tag">Odznaka</span></div></div></div><div class="tp-text">${esc(b.text)}</div>`;
}

// Opisy statystyk: wyjaśnienie + przeliczenie na liczbach bohatera.
function statTip(k) {
  const r = ctx.run(), S = r && r.hero; if (!S) return '';
  const dmg = S.dmg || 0, base = fl(S.atk * (100 + dmg) / 100), cm = S.critMult || 150, critHit = fl(base * cm / 100);
  const dps = S.atk * (100 + dmg) / 100 * S.aspd / 100;
  const each = (a, b) => `<div class="tp-ex">${a}<b>${b}</b></div>`;
  let title = '', body = '', ex = '';
  switch (k) {
    case 'maxHp': title = 'Życie'; body = 'Tyle obrażeń możesz przyjąć w walce. Gdy spadnie do zera, run się kończy. Po wygranej walce odzyskujesz część Życia, a Odpoczynek leczy za Ziarna.'; ex = each('Maksymalne Życie: ', S.maxHp) + each('Teraz: ', `${r.hp} / ${S.maxHp}`); break;
    case 'atk': title = 'Atak'; body = `To bazowe obrażenia jednego uderzenia, zanim zadziałają bonusy i pancerz wroga. Tyle zadaje zwykły atak bez krytyka i bez premii.\nUmiejętności liczą się jako procent Ataku (np. 250% to 2,5 × Atak).\nCios = Atak × (1 + premia do obrażeń) × (krytyk) × 100 / (100 + pancerz wroga).`;
      ex = each('Zwykły cios w wroga bez pancerza: ', base) + each('Krytyczny cios: ', critHit) + each('Wróg z 10 pancerza przyjmie: ', `${fl(base * 100 / 110)} / krytyk ${fl(critHit * 100 / 110)}`) + (dmg ? each('Premia do obrażeń: ', `+${dmg}%`) : ''); break;
    case 'aspd': title = 'Szybkość ataku'; body = '„1,00 / s” oznacza jedno uderzenie na sekundę. Im wyższe, tym częściej bijesz zwykłym atakiem (nie przyspiesza umiejętności, tylko zwykłe ataki).';
      ex = each('Uderzenie co: ', pl((100 / S.aspd).toFixed(2)) + ' s') + each('Zwykłe ataki: ', '≈ ' + pl((dps).toFixed(1)) + ' obrażeń / s (bez krytyków i pancerza)'); break;
    case 'armor': title = 'Pancerz'; body = 'Zmniejsza obrażenia każdego ciosu, który dostajesz: cios × 100 / (100 + Pancerz). Działa na każdy cios z osobna, więc najlepiej chroni przed wieloma słabymi uderzeniami.';
      ex = each('Przy Twoim pancerzu ciosy są słabsze o: ', Math.round(S.armor / (100 + S.armor) * 100) + '%'); break;
    case 'crit': title = 'Kurza Fortuna'; body = `Kurza Fortuna to szansa, że zwykły atak jest krytyczny (trafienie krytyczne) i zadaje ×${pl((cm / 100).toFixed(2))} obrażeń (Moc Fortuny). Krytyki dotyczą zwykłych ataków; umiejętności same z siebie nie trafiają krytycznie.`;
      ex = each('Szansa: ', S.crit + '%') + each('Krytyczny cios zadaje: ', critHit) + each('Średnio dzięki krytykom: ', '+' + Math.round(S.crit * (cm - 100) / 100) + '% obrażeń zwykłych ataków'); break;
    case 'critMult': title = 'Moc Fortuny'; body = 'O ile mocniejszy jest cios krytyczny. Bazowo ×1,50, czyli 150% zwykłego ciosu.'; ex = each('Twój krytyk: ', '×' + pl((cm / 100).toFixed(2))) + each('Zwykły cios / krytyczny: ', `${base} / ${critHit}`); break;
    case 'evade': title = 'Unik'; body = 'Szansa, że cios wroga w ogóle Cię nie trafi (zero obrażeń). Maksymalnie 75%.'; ex = each('Szansa uniku: ', S.evade + '%'); break;
    case 'regen': title = 'Regeneracja'; body = 'Tyle Życia odzyskujesz co sekundę w czasie walki.'; ex = each('Teraz: ', pl(String(Math.round(S.regen) / 10)) + ' / s'); break;
    case 'luck': title = 'Szczęście'; body = 'Wpływa na to, jakie kafelki trafiają do ofert: im więcej Szczęścia, tym częściej pojawiają się rzadsze (rzadkie, epickie, legendarne).'; ex = each('Szczęście: ', S.luck); break;
    case 'dmg': title = 'Obrażenia'; body = 'Procentowa premia do wszystkich obrażeń, które zadajesz: zwykłych ataków i umiejętności. Dodaje się do Ataku jako mnożnik.'; ex = each('Premia: ', '+' + dmg + '%'); break;
    default: return '';
  }
  return `<div class="tp-head r0"><span class="tp-ico">${art.statIcon(k)}</span><div><div class="tp-name">${esc(title)}</div><div class="tp-tags"><span class="tag">Statystyka</span></div></div></div><div class="tp-text">${nl(body)}</div>${ex ? `<div class="tp-exs">${ex}</div>` : ''}`;
}

function build(el) {
  const k = el.dataset.tipk;
  if (k) {
    const [kind, id] = k.split(':');
    const x = el.dataset.tipx;
    if (kind === 'tile') return tileTip(id, x);
    if (kind === 'set') return setTip(id);
    if (kind === 'stat') return statTip(id);
    if (kind === 'badge') return badgeTip(id);
  }
  const t = el.dataset.tip; if (!t) return '';
  const [first, ...rest] = String(t).split('\n');
  return `<div class="tp-plain"><b>${esc(first)}</b>${rest.length ? `<div>${nl(rest.join('\n'))}</div>` : ''}</div>`;
}

// ---------- pozycjonowanie ----------
function place() {
  if (!tipEl || !anchor || !anchor.isConnected) return hide();
  const s = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--s')) || 1;
  tipEl.style.transform = `scale(${s})`;
  const a = anchor.getBoundingClientRect(), w = tipEl.offsetWidth * s, h = tipEl.offsetHeight * s, vw = innerWidth, vh = innerHeight, g = 10;
  // preferuj bok z większą ilością miejsca (panel boczny jest po prawej, więc zwykle wychodzi na lewo), potem nad / pod
  let x, y;
  const room = { l: a.left, r: vw - a.right };
  if (Math.max(room.l, room.r) >= w + g) { x = room.r >= room.l && room.r >= w + g ? a.right + g : a.left - w - g; y = a.top + a.height / 2 - h / 2; }
  else { x = a.left + a.width / 2 - w / 2; y = a.top - h - g; if (y < g) y = a.bottom + g; }
  x = Math.max(g, Math.min(x, vw - w - g)); y = Math.max(g, Math.min(y, vh - h - g));
  tipEl.style.left = Math.round(x) + 'px'; tipEl.style.top = Math.round(y) + 'px';
}
function show(el) {
  const html = build(el); if (!html) return hide();
  anchor = el; tipEl.innerHTML = html; tipEl.hidden = false; place();
  tipEl.classList.add('on');
}
function hide() { anchor = null; if (tipEl) { tipEl.hidden = true; tipEl.classList.remove('on'); } }

const target = n => n && n.closest ? n.closest('[data-tipk],[data-tip]') : null;

export function initTip(c) {
  ctx = c;
  tipEl = document.createElement('div'); tipEl.id = 'tip'; tipEl.hidden = true; tipEl.setAttribute('role', 'tooltip');
  document.body.appendChild(tipEl);
  document.addEventListener('mouseover', e => { const t = target(e.target); if (t === anchor) return; if (t) show(t); else hide(); });
  document.documentElement.addEventListener('mouseleave', hide);
  document.addEventListener('focusin', e => { const t = target(e.target); if (t) show(t); });
  document.addEventListener('focusout', hide);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
  addEventListener('scroll', hide, true);
  addEventListener('resize', hide);
  document.addEventListener('click', e => { if (!(e.target.closest && e.target.closest('.chip,.zc,.stats'))) hide(); });
  // po przerysowaniu ekranu element-kotwica znika: sprzątaj
  new MutationObserver(() => { if (anchor && !anchor.isConnected) hide(); }).observe(document.body, { childList: true, subtree: true });
}
