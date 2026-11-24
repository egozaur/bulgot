// Bulgot: ciekawostki na ekranie końca. Jedna, najbardziej „bolesna” obserwacja o przebiegu runu: ma wkurzyć na tyle, żeby odpalić następny run.
// Dane: wynik ostatniej walki (obrażenia, mocne dziobnięcia, umiejętności), statystyki runu (rerolle, dokupienia, Ziarna), rekord i ranking gracza,
// anonimowe liczniki pięter z serwera (ilu graczy dociera na piętro i ilu na nim odpada). Żadnych wymyślonych liczb.

const pct = n => String(n).replace('.', ',');
const num = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const pick = (arr, seed) => arr[Math.abs(seed | 0) % arr.length];
// Polska odmiana: 1 raz, 2 razy, 5 razy (jeden / kilka / wiele).
const pl = (n, one, few, many) => { n = Math.abs(n); const a = n % 10, b = n % 100; return n === 1 ? one : (a >= 2 && a <= 4 && !(b >= 12 && b <= 14)) ? few : many; };
const ziarn = n => `${n} ${pl(n, 'Ziarnem', 'Ziarnami', 'Ziarnami')}`;
const MIN_SAMPLE = 20;   // tyle runów musi być w statystykach serwera, żeby podawać procenty o innych graczach

// c = kontekst końca runu (patrz endFacts w app.js). Zwraca listę { p, kind, text } od najważniejszej.
export function failFacts(c) {
  const out = [], add = (p, kind, text) => out.push({ p: p - (c.lastKind === kind ? 25 : 0), kind, text });   // ta sama ciekawostka dwa razy z rzędu traci punkty
  const res = c.result, fl = c.floor;
  const where = `tryb ${c.modeName.toLowerCase()}, palnik ${c.garnek}`;

  if (res) {
    // 1. Prawie wygrana walka: brakujące obrażenia liczone z tego, ile zadałeś i ile życia wroga zostało.
    if (res.foeLeft > 0 && res.foeLeft <= 10 && res.dealt > 0) {
      const miss = Math.max(1, Math.round(res.dealt * res.foeLeft / (100 - res.foeLeft)));
      if (res.maxHit > 0 && miss <= res.maxHit) add(98, 'close', `Zabrakło ok. ${num(miss)} obrażeń do wygranej. Twój najlepszy cios w tej walce miał ${num(res.maxHit)}. Jedno uderzenie.`);
      else add(res.foeLeft <= 5 ? 94 : 88, 'close', pick([
        `Wróg został z ${res.foeLeft}% życia. Zadałeś ${num(res.dealt)} obrażeń, brakowało ok. ${num(miss)}.`,
        `Do wygranej brakło ok. ${num(miss)} obrażeń (${res.foeLeft}% życia wroga). Rosół mógł jeszcze poczekać.`,
      ], c.seed));
    }
    // 2. Dziobnięcia: pech policzony. Dotyczy tylko losowanych mocnych dziobnięć (bez wymuszonych).
    if (res.critRolls >= 12 && res.critPct > 0 && res.critPct < 100) {
      const luck = Math.pow(1 - res.critPct / 100, res.critRolls) * 100;
      if (res.critHits === 0 && luck <= 25) add(luck < 8 ? 95 : 86, 'crit', `W tej walce mocne dziobnięcie losowało się ${res.critRolls} ${pl(res.critRolls, 'raz', 'razy', 'razy')} przy szansie ${res.critPct}% i nie wypadło ani razu. Takiego pecha ma ok. ${pct(luck < 1 ? '<1' : luck.toFixed(luck < 10 ? 1 : 0))}% walk.`);
    }
    // 3. Nieużyte umiejętności.
    if (c.hasSkills && res.skillsUsed === 0) add(91, 'skills', 'Nie użyłeś ani jednej umiejętności w tej walce. Kurczak zastanawia się, po co je nosił.');
    else if (c.hasSkills && res.ticks >= 150 && res.skillsUsed <= 1) add(82, 'skills', `Walka trwała ${pct((res.ticks / 10).toFixed(0))} s, a umiejętności użyłeś ${res.skillsUsed} ${pl(res.skillsUsed, 'raz', 'razy', 'razy')}. Cooldowny same się nie wciskają.`);
    // 4. Zapomniany odpoczynek.
    if (!c.rested && c.restCost > 0 && c.coins >= c.restCost && res.foeLeft > 0 && res.foeLeft <= 35) add(89, 'rest', `Odpoczynek kosztuje ${c.restCost} ${pl(c.restCost, 'Ziarno', 'Ziarna', 'Ziaren')} i daje +${c.restPct}% życia. Miałeś ${c.coins}, nie wziąłeś, a wróg został z ${res.foeLeft}% życia.`);
    // 5. Przegrana wymiana ciosów.
    if (res.dealt > 0 && res.taken >= res.dealt * 3) add(76, 'ratio', `Zadałeś ${num(res.dealt)} obrażeń, a przyjąłeś ${num(res.taken)}. To nie wymiana, to darowizna.`);
    if (res.ticks <= 30) add(88, 'fast', `Walka trwała ${pct((res.ticks / 10).toFixed(1))} s. Rekord szybkości, tylko w złą stronę.`);
    if (c.round >= c.rounds) add(92, 'last', 'Padłeś na ostatnim piętrze. Prezes odetchnął z ulgą i poprawił krawat.');
    if (c.nemesis) add(78, 'nemesis', 'Pokonał cię Nemezis. Awansował na twoich piórach, a ty nawet nie dostałeś odznaki.');
    if (c.boss) add(66, 'boss', `${c.bossName} ma fazy i telegrafowane ciosy. Ogłuszenie (Pianie Grozy) i unik przerywają jego szarże.`);
    else if (c.killerName) add(50, 'killer', `Zakończył cię: ${c.killerName}. W tej fabryce nawet to jest awans.`);
  }

  // Rekord i ranking: „prawie”.
  const gap = c.best > 0 ? c.best - c.score : 0;
  if (!c.newBest && gap > 0 && gap <= c.scoreRound) add(gap <= 400 ? 96 : 90, 'record', `Do twojego rekordu w tym trybie brakło ${num(gap)} pkt, czyli mniej niż jedno piętro (${num(c.scoreRound)} pkt).`);
  const ab = c.above;
  if (ab && ab.gap > 0 && ab.gap <= 1200 && ab.place <= 100) add(ab.gap <= 300 ? 93 : 81, 'above', pick([
    `Ten wynik dałby miejsce #${ab.place}. ${ab.nick} jest nad tobą o ${num(ab.gap)} pkt.`,
    `Wyprzedza cię ${ab.nick}: ${num(ab.gap)} pkt różnicy, a to miejsce #${ab.place - 1} w rankingu.`,
  ], c.seed));

  // Ziarna i marnotrawstwo.
  if (c.coins >= 20) {
    const small = Math.floor(c.coins / (c.prices && c.prices[0] || 6)), rests = c.restCost ? Math.floor(c.coins / c.restCost) : 0;
    add(70 + Math.min(20, Math.floor((c.coins - 20) / 3)), 'coins', pick([
      `Zginąłeś z ${ziarn(c.coins)} w kieszeni. To ${small} ${pl(small, 'kafelek', 'kafelki', 'kafelków')} Zwykłych${rests > 1 ? ` albo ${rests} ${pl(rests, 'odpoczynek', 'odpoczynki', 'odpoczynków')}` : ''}. Rosół będzie wyjątkowo drogi.`,
      `W kieszeni zostało ${c.coins} ${pl(c.coins, 'Ziarno', 'Ziarna', 'Ziaren')} W wyniku to ${num(c.coins * c.scoreCoin)} pkt, ale w walce nie zrobiły ci nic.`,
    ], c.seed));
  }
  if (c.rerolls >= 6) add(72 + Math.min(10, c.rerolls - 6), 'reroll', `Przerollowałeś oferty ${c.rerolls} ${pl(c.rerolls, 'raz', 'razy', 'razy')} w ${c.round} ${pl(c.round, 'piętrze', 'piętrach', 'piętrach')}, średnio ${pct((c.rerolls / Math.max(1, c.round)).toFixed(1))} na piętro. Wciąż szukasz tego jedynego kafelka?`);
  if (!c.buys && c.coins >= 12 && c.round >= 4) add(78, 'nobuy', `Przez ${c.round} ${pl(c.round, 'piętro', 'piętra', 'pięter')} nie dokupiłeś ani jednego kafelka, a zginąłeś z ${ziarn(c.coins)}. Ziarna nie dają punktów życia.`);
  if (c.hasSkills === false && c.round >= 3) add(60, 'noskills', 'Doszedłeś tak daleko bez żadnej umiejętności aktywnej. Odważne i niezalecane.');

  // Inni gracze (anonimowe liczniki serwera).
  if (fl && fl.reach && fl.reach[c.round - 1] >= MIN_SAMPLE) {
    const reach = fl.reach[c.round - 1], died = fl.died[c.round - 1] | 0, dieP = Math.round(died * 100 / reach), reachP = Math.round(reach * 100 / Math.max(1, fl.reach[0]));
    if (dieP >= 30) add(dieP >= 45 ? 87 : 83, 'floor', `Na piętrze ${c.round} odpada ${dieP}% graczy (${where}). Dołączyłeś do statystyki.`);
    else if (dieP <= 12) add(90, 'floor', `Na piętrze ${c.round} odpada tylko ${dieP}% graczy (${where}). Ty trafiłeś w ten ułamek.`);
    if (c.round >= 3 && reachP <= 40) add(80, 'reach', `Na piętro ${c.round} dociera tylko ${reachP}% graczy (${where}). Byłeś w elicie. Krótko.`);
  }
  if (fl && fl.runs >= MIN_SAMPLE) {
    const w = Math.round(fl.wins * 100 / fl.runs);
    if (w <= 25) add(54, 'wins', `Na palniku ${c.garnek} wygrywa ${w}% graczy. Nie wstydź się, ale spróbuj jeszcze raz.`);
  }

  // Stałe obserwacje o grze i graczu.
  if (c.abandoned) add(60, 'abandon', `Poddałeś się na piętrze ${c.round}. Garnek poczeka, jest cierpliwy.`);
  if (c.setHint) add(55, 'set', `Miałeś 1 kafelek z zestawu ${c.setHint}. Drugi dałby bonus. Czasem warto było dokupić.`);
  if (c.streak >= 2) add(c.streak >= 3 ? 93 : 87, 'streak', c.streak >= 3 ? `To już ${c.streak}. raz z rzędu na piętrze ${c.round}. To nie przypadek, to tradycja.` : `Drugi raz z rzędu odpadasz na piętrze ${c.round}. Piętro zaczyna cię rozpoznawać.`);
  if (c.runs === 1) add(75, 'first', 'Pierwszy run? Spokojnie, każdy kurczak zaczyna w garnku. Dopiero potem się z niego wychodzi.');
  out.sort((a, b) => b.p - a.p);
  return out;
}

// Jedna, najbardziej bolesna ciekawostka.
export function pickFacts(list) {
  return list.length ? [list[0]] : [];
}

export function winFacts(c) {
  const out = [], add = (p, kind, text) => out.push({ p: p - (c.lastKind === kind ? 25 : 0), kind, text });
  const fl = c.floor;
  if (fl && fl.runs >= MIN_SAMPLE) {
    const w = Math.round(fl.wins * 100 / fl.runs);
    add(w <= 30 ? 90 : 55, 'wins', `Na palniku ${c.garnek} wygrywa ${w}% graczy. Dziś jesteś w tej grupie. Spróbuj pójść wyżej.`);
  }
  if (c.flawless >= 3) add(80, 'flawless', `${c.flawless} ${pl(c.flawless, 'walkę', 'walki', 'walk')} wygrałeś bez przyjęcia ani jednego ciosu. Prezes zlecił audyt.`);
  if (c.rerolls >= 8) add(70, 'reroll', `Wygrałeś, choć przerollowałeś oferty ${c.rerolls} razy. Cierpliwość popłaca.`);
  if (c.coins >= 30) add(66, 'coins', `Wygrałeś z ${ziarn(c.coins)} w kieszeni. Zwycięzca nie musi wydawać wszystkiego, ale mógł.`);
  if (c.maxHit > 0) add(50, 'hit', `Twój największy cios w tym runie: ${num(c.maxHit)}. Brojler do dziś go czuje.`);
  if (c.garnek < 5) add(45, 'next', `Czas na palnik ${c.garnek + 1}. Tam nikt cię nie oszczędzi.`);
  out.sort((a, b) => b.p - a.p);
  return out;
}
