// Wspólne dane i pomocnicy dla makiet ekranu startowego (prawdziwa grafika i dane gry, bez serwera).
import * as art from '../../art.js';
import * as D from '../../shared/data.js';
import * as T from '../../text.js';
export { art, D, T };

const OPEN = ['pyrtek', 'kwoka', 'kaczor', 'indor', 'zjarany', 'barista', 'ges', 'lodziarz'];   // makieta: tyle postaci odblokowanych
export const MAX_BURNER = 2;                                                                       // makieta: gracz doszedł do palnika 2
export const BURNERS = ['Ognisko', 'Gazówka', 'Kuchenka', 'Piec', 'Kuźnia', 'Wulkan'];
export const HEAT = ['#7bd37b', '#e8d34a', '#ffb347', '#ff8c2b', '#e4572e', '#d6262d'];
export const MODES = { quick: { id: 'quick', name: 'Szybki', floors: 10, bosses: 2, bf: [5, 10], min: 10, text: T.MODE_INFO.quick.text }, full: { id: 'full', name: 'Pełny', floors: 20, bosses: 3, bf: [6, 12, 20], min: 20, text: T.MODE_INFO.full.text } };
export const CH = Object.keys(D.CHARS).map(id => {
  const c = D.CHARS[id], open = OPEN.includes(id), hidden = !!(c.secret || c.hidden) || id === 'dinozaur';
  const u = c.lock && D.UNLOCK_BY_ID[c.lock], pp = T.CHAR_PERKS[id] || { perks: [] };
  const fx = k => (c.fx.find(f => f.k === k) || { v: 0 }).v;
  return { id, open, hidden: hidden && !open, name: hidden && !open ? '???' : c.name, style: pp.role || c.style, title: pp.title || '', text: c.text, perks: pp.perks, unlock: u ? u.text : '',
    stats: { hp: 100 + fx('hpPct'), atk: 100 + fx('atkPct'), aspd: 100 + fx('aspdPct') } };
});
export const GARNEK = D.GARNEK.map((g, i) => ({ lvl: i, name: BURNERS[i], mod: g.name, text: g.text, mult: (1 + i * .25).toFixed(2).replace('.', ','), heat: HEAT[i], open: i <= MAX_BURNER }));

export const egg = id => { const c = CH.find(x => x.id === id); return `<div class="egg-art">${art.eggArt(id, c.open)}</div>`; };
export const bart = i => `<div class="bart">${art.burnerArt(i)}</div>`;
export const perkIcon = ic => { if (ic === '🪙') return art.coinIcon('stico'); if (/^[a-zA-Z]+$/.test(ic)) { const s = art.statIcon(ic); if (!/<svg[^>]*><\/svg>/.test(s)) return s; } return `<span class="ico">${ic}</span>`; };
export const perks = id => CH.find(x => x.id === id).perks.map(([ic, sg, tx]) => `<div class="pk ${sg === '+' ? 'plus' : 'minus'}"><b>${sg === '+' ? '+' : '−'}</b>${perkIcon(ic)}<span>${tx}</span></div>`).join('');

// stan makiety; parametry z adresu: ?mode=quick&cur=3&burner=1
const q = new URLSearchParams(location.search);
export const S = { mode: q.get('mode') || 'full', cur: +(q.get('cur') || 0), burner: +(q.get('burner') || 0) };
export function mount(render) {
  const root = document.getElementById('root');
  const fit = () => { const k = Math.min(innerWidth / 1600, innerHeight / 900); root.style.transform = `translate(${(innerWidth - 1600 * k) / 2}px,${(innerHeight - 900 * k) / 2}px) scale(${k})`; };
  const draw = () => { root.innerHTML = render(S); document.title = document.title; };
  root.addEventListener('click', e => {
    const t = e.target.closest('[data-set]'); if (!t) return;
    const [k, v] = t.dataset.set.split(':'); S[k] = k === 'mode' ? v : (+v + (k === 'cur' ? CH.length : 0)) % (k === 'cur' ? CH.length : 99); if (k === 'burner') S.burner = Math.max(0, Math.min(5, +v)); draw();
  });
  addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') S.cur = (S.cur + 1) % CH.length; else if (e.key === 'ArrowLeft') S.cur = (S.cur + CH.length - 1) % CH.length;
    else if (e.key === 'ArrowUp') S.burner = Math.min(5, S.burner + 1); else if (e.key === 'ArrowDown') S.burner = Math.max(0, S.burner - 1);
    else if (e.key === 'q') S.mode = S.mode === 'full' ? 'quick' : 'full'; else return; draw();
  });
  addEventListener('resize', fit); fit(); draw();
}
