// Zrzuty podpowiedzi po najechaniu (kółko umiejętności, zwierzak) na wariancie 9.
import { otworz, wstrzyknij, SNAP, wait } from './baza.mjs';
const OUT = 'C:/Users/Kurczak/pl3y/bulgot/propozycje-uklad/zrzuty';
const { b, p } = await otworz(1920, 925);
await p.addStyleTag({ url: '/bulgot/propozycje-uklad/wspolne.css' });
await wstrzyknij(p, { ...SNAP[20], companion: { id: 'pisklak', lvl: 2 } });
await p.evaluate(async () => { const i = document.querySelector('#invoice'); if (i) i.innerHTML = ''; const m = await import('/bulgot/propozycje-uklad/wspolne.js'); await m.apply(9); window.dispatchEvent(new Event('resize')); });
await wait(700);
for (const [sel, nm] of [['.side .xring:nth-child(1)', '09b-hybryda-podpowiedz-umiejetnosci'], ['.side .pet', '09c-hybryda-podpowiedz-zwierzaka'], ['.side .xring:nth-child(3)', '09d-hybryda-podpowiedz-umiejetnosci-3']]) {
  await p.hover(sel); await wait(700);
  await p.screenshot({ path: `${OUT}/${nm}-1920x925.png` });
  await p.mouse.move(10, 10); await wait(300);
}
await b.close();
