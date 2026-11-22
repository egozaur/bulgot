// Bulgot: ciekawostki na ekranie końca. Wybierają najbardziej „szczególną” obserwację o przebiegu runu.
// Liczby o małpach są prawdziwe: pochodzą z `malpy.js` (generowanego przez dev/sim-malpa.mjs, który gra losowo na tych samych regułach co serwer).
import { MALPY } from './malpy.js';

const pct = n => String(n).replace('.', ',');
const pick = (arr, seed) => arr[Math.abs(seed | 0) % arr.length];

// c = kontekst końca runu (patrz endFacts w app.js). Zwraca listę { p, kind, text } od najważniejszej.
export function failFacts(c) {
  const out = [], add = (p, kind, text) => out.push({ p, kind, text });
  const m = MALPY[c.mode] && MALPY[c.mode][c.garnek];
  const where = `tryb ${c.modeName.toLowerCase()}, Garnek ${c.garnek}`;
  if (c.result && m) {
    const h = m.hazard[c.round - 1], reach = m.reach[c.round - 1];
    if (reach >= 3 && h != null) {
      if (h <= 20 && c.round <= 4) add(95, 'malpy', pick([
        `No no. Na tym etapie nawet małpy odpadały tylko w ${pct(h)}% przypadków (symulacja ${MALPY.n} małp, ${where}).`,
        `Statystyka nie ma litości: z małp, które dotarły na piętro ${c.round}, odpadało tylko ${pct(h)}%. Ty dołączyłeś do tej mniejszości.`,
        `W symulacji małpy radziły sobie tu lepiej: odpadało zaledwie ${pct(h)}% z nich (${where}).`,
      ], c.seed));
      else if (h >= 60) add(70, 'malpy', pick([
        `To piętro zjada ${pct(h)}% małp, które do niego dochodzą. Nie jesteś sam.`,
        `Statystycznie to rzeźnia: ${pct(h)}% małp z symulacji kończy właśnie tutaj.`,
      ], c.seed));
      else add(40, 'malpy', `Na tym piętrze odpada ${pct(h)}% małp z symulacji (${where}). Ty trafiłeś w tę statystykę.`);
      if (reach <= 30 && c.round >= 3) add(85, 'malpy2', `Do piętra ${c.round} dotarło tylko ${pct(reach)}% małp z symulacji. Dziś byłeś lepszy od małpy.`);
    }
  }
  if (c.abandoned) add(60, 'abandon', `Poddałeś się na piętrze ${c.round}. Garnek poczeka, jest cierpliwy.`);
  if (c.result) {
    if (c.round >= c.rounds) add(92, 'last', 'Padłeś na ostatnim piętrze. Prezes odetchnął z ulgą i poprawił krawat.');
    if (c.result.foeLeft > 0 && c.result.foeLeft <= 8) add(90, 'close', `Zabrakło ${c.result.foeLeft}% życia wroga. To nie porażka, to bardzo agresywna rezerwacja miejsca w garnku.`);
    if (c.hasSkills && c.result.skillsUsed === 0) add(91, 'skills', 'Nie użyłeś ani jednej umiejętności w tej walce. Kurczak zastanawia się, po co je nosił.');
    if (!c.hasSkills && c.round >= 3) add(60, 'noskills', 'Doszedłeś tak daleko bez żadnej umiejętności aktywnej. Odważne i niezalecane.');
    if (c.result.ticks <= 30) add(88, 'fast', `Walka trwała ${pct((c.result.ticks / 10).toFixed(1))} s. Rekord szybkości, tylko w złą stronę.`);
    if (c.coins >= 30) add(80, 'coins', `Zginąłeś z ${c.coins} Ziarnami w kieszeni. Rosół będzie wyjątkowo drogi.`);
    if (c.boss) add(66, 'boss', `${c.bossName} ma fazy i telegrafowane ciosy. Ogłuszenie (Pianie Grozy) i unik przerywają jego szarże.`);
    else if (c.killerName) add(50, 'killer', `Zakończył cię: ${c.killerName}. W tej fabryce nawet to jest awans.`);
    if (c.nemesis) add(78, 'nemesis', 'Pokonał cię Nemezis. Awansował na twoich piórach, a ty nawet nie dostałeś odznaki.');
  }
  if (c.setHint) add(55, 'set', `Miałeś 1 kafelek z zestawu ${c.setHint}. Drugi dałby bonus. Czasem warto było dokupić.`);
  if (c.streak >= 2) add(c.streak >= 3 ? 93 : 87, 'streak', c.streak >= 3 ? `To już ${c.streak}. raz z rzędu na piętrze ${c.round}. To nie przypadek, to tradycja.` : `Drugi raz z rzędu odpadasz na piętrze ${c.round}. Piętro zaczyna cię rozpoznawać.`);
  if (c.runs === 1) add(75, 'first', 'Pierwszy run? Spokojnie, każdy kurczak zaczyna w garnku. Dopiero potem się z niego wychodzi.');
  if (c.garnek >= 3) add(52, 'garnek', `Na Garnku ${c.garnek} (${c.garnekName}) wygrywa garstka graczy. Nie wstydź się.`);
  out.sort((a, b) => b.p - a.p);
  return out;
}

// Dwie ciekawostki: najważniejsza i (jeśli jest równie ciekawa i innego rodzaju) druga.
export function pickFacts(list) {
  if (!list.length) return [];
  const first = list[0], second = list.find(f => f.kind !== first.kind && !(first.kind.startsWith('malpy') && f.kind.startsWith('malpy')) && f.p >= 60);
  return second ? [first, second] : [first];
}

export function winFacts(c) {
  const m = MALPY[c.mode] && MALPY[c.mode][c.garnek];
  const out = [];
  if (m) out.push({ p: 80, kind: 'malpy', text: m.win === 0 ? `Żadna z ${MALPY.n} małp w symulacji nie wygrała tego trybu na Garnku ${c.garnek}. Ty wygrałeś.` : `W symulacji wygrało ${pct(m.win)}% małp (Garnek ${c.garnek}). Ty też, tylko mniej losowo.` });
  if (c.fast) out.push({ p: 60, kind: 'fast', text: `Wszystkie walki zmieściły się w ${pct(c.fast)} s. Prezes nawet nie zdążył zrobić kawy.` });
  return out;
}
