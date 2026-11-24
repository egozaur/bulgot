// Pomocnik makiet: prawdziwa grafika bohatera, wrogów i ikon kafelków z gry (../../art.js, ../shared/data.js).
import * as art from '../../art.js';
import * as D from '../../shared/data.js';

export const tileOf = skill => D.TILES.find(t => t.skill === skill);
export const icon = skill => art.tileIcon(tileOf(skill).id);
export const sname = skill => D.SKILLS[skill].name;
export const hero = () => art.heroArt('pyrtek', 'pyrtek');
export const foe = key => art.enemyArt(key);
export const sti = k => art.statusIcon(k);

// jednostka: x = środek w % szerokości, bottom w vh, w = szerokość w vh
export function unit({ id = '', cls = 'enemy', x, bottom, w, name, hp, max, svg, sts = '', hello = 'Cześć, mam na imię', extra = '' }) {
  const pct = Math.max(0, Math.min(100, hp / max * 100));
  const me = cls === 'hero';
  return `<div class="unit ${cls}" id="${id}" style="left:${x}%;bottom:${bottom}vh;width:${w}vh">
    <div class="tag ${me ? 'me' : ''}"><div class="hd">${me ? 'Pracownik miesiąca' : hello}</div><div class="nm">${name}</div>
      <div class="bar"><i style="width:${pct}%"></i></div><div class="num">${hp} / ${max}</div><div class="sts">${sts}</div></div>
    <div class="shadow"></div><div class="sprite">${svg}</div>${extra}</div>`;
}
export const st = (k, n) => `<span>${sti(k)}${n}</span>`;

export function topbar(zone = 'Biuro Zarządu') {
  return `<div class="top"><div class="l"><span class="chip">Piętro 14 · ${zone}</span><span class="chip">Pyrtek · Palnik 2</span></div>
    <div class="timer"><span>0:21</span><u><i></i></u></div><div class="r"><b>Księga K</b><b>Pauza P</b></div></div>`;
}

// Wspólna jedna ekipa wrogów w strefie III (Biuro Zarządu)
export const CAST = {
  sep: () => foe('vulture'), kanarek: () => foe('canary'), kot: () => foe('cat'), robot: () => foe('robot'),
};

// Do robienia zrzutów: ?t=1234 ustawia wszystkie animacje CSS w danym ms (pętle 8 s) i je zatrzymuje
export function freezeAt() {
  const q = new URLSearchParams(location.search), t = q.get('t');
  if (t == null) return;
  const apply = () => document.getAnimations().forEach(a => { a.pause(); a.currentTime = +t; });
  apply(); setTimeout(apply, 50);
}
