// Bulgot: teksty ciekawostek końca runu (szablony z polami {pole}). Ton: złośliwy narrator + czarna komedia z fabryki rosołu.
// Zasada: tekst opisuje coś, co NAPRAWDĘ wydarzyło się w runie (pola szablonu liczy fakty.js z danych). Żadnych wymyślonych liczb.
// Szablon z {nr} to „protokół powypadkowy Prezesa”: dostępny tylko po porażce (numer pracownika z bulgot:prac).
// Każda kategoria ma 2–3 warianty; system rotacji (fakty.js) pilnuje, żeby ten sam wariant nie wracał z rzędu.

export const TX = {
  // ---------- rachunek żalu: prawie wygrana walka ----------
  close_hit: [
    'Zabrakło ok. {miss} obrażeń do wygranej. Twój najlepszy cios w tej walce miał {hit}. Jedno uderzenie dzieliło cię od awansu.',
    'Protokół nr {nr}. Przyczyna zgonu: brak jednego ciosu. Wróg został z {left}% życia, a ty miałeś w tej walce cios za {hit}. Okoliczności łagodzące: brak.',
    'Do wygranej brakowało ok. {miss} obrażeń, a najmocniejsze trafienie tej walki miało {hit}. Wystarczyłoby jedno więcej. Historia nie przyjmuje reklamacji.',
  ],
  close_far: [
    'Wróg został z {left}% życia. Zadałeś {dealt} obrażeń, brakowało ok. {miss}. Rosół mógł jeszcze poczekać.',
    'Do wygranej brakło ok. {miss} obrażeń ({left}% życia wroga). Różnica między pracownikiem miesiąca a daniem dnia.',
    'Protokół nr {nr}. Wróg przeżył z {left}% życia. Pracownik zadał {dealt} obrażeń i uznał, że wystarczy.',
  ],
  // ---------- pech przy dziobnięciach ----------
  crit: [
    'W tej walce mocne dziobnięcie losowało się {rolls} razy przy szansie {pct}% i nie wypadło ani razu. Takiego pecha ma {luck} walk.',
    '{rolls} rzutów na dziobnięcie, szansa {pct}%, trafień zero. Statystyka ci współczuje: tak źle wygląda {luck} walk.',
    'Protokół nr {nr}. Przyczyna zgonu: statystyka. {rolls} losowań dziobnięcia przy szansie {pct}%, ani jednego trafienia. Wniosek: rosół nie zna litości.',
  ],
  // ---------- umiejętności ----------
  skills0: [
    'Nie użyłeś ani jednej umiejętności w tej walce. Umiejętność „{skill}” cały czas czekała na rozkaz, jak stażysta bez zadań.',
    'Walka trwała {secs} s, umiejętności użyto zero razy. Umiejętność „{skill}” nosiłeś jak odznakę, nie jak narzędzie.',
    'Protokół nr {nr}. Przyczyna zgonu: nieużyta umiejętność ({skill}). Okoliczności łagodzące: brak. Prezes dziękuje za materiał szkoleniowy.',
  ],
  skills1: [
    'Walka trwała {secs} s, a umiejętności użyłeś {used}. Cooldowny same się nie wciskają.',
    '{secs} sekund walki i umiejętność użyta {used}. To nie rotacja, to wspomnienie rotacji.',
  ],
  // ---------- odpoczynek ----------
  rest: [
    'Odpoczynek kosztuje {cost} i daje +{pct}% życia. Miałeś {coins}, nie wziąłeś, a wróg został z {left}% życia. Następnym razem zajrzyj do kasy przed walką.',
    'Protokół nr {nr}. Przyczyna zgonu: nieodebrany odpoczynek ({cost}, na koncie {coins}). Prezes odnotował oszczędność.',
  ],
  weakentry: [
    'Na piętro {round} wszedłeś z {hp}% życia i {coinsI} w kieszeni. Odpoczynek kosztował {cost}. Wybrałeś Ziarna zamiast życia. Prezes docenia pazerność.',
    'Protokół nr {nr}. Pracownik wszedł na piętro {round} z {hp}% życia, dysponując {coinsI} i odpoczynkiem za {cost}. Sprawa wyjaśniona.',
  ],
  // ---------- wymiana ciosów, czas, ostatnie piętro, nemezis ----------
  ratio: [
    'Zadałeś {dealt} obrażeń, a przyjąłeś {taken}. To nie wymiana ciosów, to darowizna.',
    'Obrażenia: {dealt} zadane, {taken} przyjęte. Wróg powinien przesłać ci kwiaty. Albo fakturę.',
  ],
  fast: [
    'Walka trwała {secs} s. Rekord szybkości, tylko w złą stronę.',
    'Protokół nr {nr}. Czas pracy pracownika w walce: {secs} s. Dział kadr uznał to za rekordowo krótką zmianę.',
  ],
  last: [
    'Padłeś na ostatnim piętrze. Prezes odetchnął z ulgą i poprawił krawat.',
    'Ostatnie piętro, ostatnia walka, ostatnie słowo należało do wroga. Prezes odwołał już konferencję prasową.',
  ],
  nemesis: [
    'Pokonał cię Nemezis. Awansował na twoich piórach, a ty nawet nie dostałeś odznaki.',
    'Nemezis wygrał i przejął twoje stanowisko. Przynajmniej ktoś w tej fabryce robi karierę.',
  ],
  // ---------- akta zabójcy (składane w fakty.js z danych wroga; tu tylko zakończenia dla zwykłych wrogów) ----------
  akta_koniec: [
    'To wszystko stoi w jego opisie.',
    'Ma to w opisie stanowiska.',
    'Prezes zna tę cechę od lat i nie widzi problemu.',
  ],
  // ---------- rekord i ranking ----------
  record: [
    'Do twojego rekordu w tym trybie brakło {gap} pkt, czyli mniej niż jedno piętro ({pts} pkt). Prezes widział, jak się starasz. Zanotował.',
    'Rekord uciekł o {gap} pkt. To mniej niż jedno piętro ({pts} pkt). Nie pech, tylko jedno piętro dzieli cię od chwały.',
  ],
  above: [
    'Ten wynik dałby miejsce #{place}. {nick} jest nad tobą o {gap} pkt.',
    'Wyprzedza cię {nick}: {gap} pkt różnicy, a to miejsce #{place1} w rankingu.',
  ],
  // ---------- Ziarna i zasoby ----------
  coins: [
    'Zginąłeś z {coinsI} w kieszeni. To {small}{rests}. Rosół będzie wyjątkowo drogi.',
    'W kieszeni zostało {coins}. W wyniku to {pts} pkt, ale w walce nie zrobiły ci nic.',
    'Protokół nr {nr}. Majątek zmarłego: {coins}. Spadkobierców brak, fabryka przejmuje.',
  ],
  reroll: [
    'Przerollowałeś oferty {n} w {round} piętrach, średnio {avg} na piętro. Wciąż szukasz tego jedynego kafelka?',
    'Rerolle: {n} w {round} piętrach. Szukałeś idealnego kafelka tak długo, że kafelki zdążyły cię rozpoznać.',
  ],
  nobuy: [
    'Przez {round} pięter nie dokupiłeś ani jednego kafelka, a zginąłeś z {coinsI}. Ziarna nie dają punktów życia.',
    'Zero dokupionych kafelków, {coins} w kieszeni, śmierć na piętrze {round}. Księgowy Kanarek nie miał tu czego zabrać.',
  ],
  noskills: [
    'Doszedłeś tak daleko bez żadnej umiejętności aktywnej. Odważne i niezalecane.',
    'Piętro {round} bez ani jednej umiejętności aktywnej. Prezes nazywa to kulturą pracy na minimum.',
  ],
  // ---------- inni gracze (liczniki serwera) ----------
  floor_hi: [
    'Na piętrze {round} odpada {pct}% graczy ({where}). Dołączyłeś do statystyki.',
    '{pct}% graczy kończy na piętrze {round} ({where}). Witamy w większości.',
  ],
  floor_lo: [
    'Na piętrze {round} odpada tylko {pct}% graczy ({where}). Ty trafiłeś w ten ułamek.',
    'Piętro {round} kończy tylko {pct}% graczy ({where}). Szczęśliwy los albo nieszczęśliwy talent.',
  ],
  reach: [
    'Na piętro {round} dociera tylko {pct}% graczy ({where}). Byłeś w elicie. Krótko.',
    'Tylko {pct}% graczy widzi piętro {round} ({where}). Zwiedziłeś je jak turysta: krótko i bez pamiątek.',
  ],
  wins_lo: [
    'Na palniku {garnek} wygrywa {pct}% graczy. Nie wstydź się, ale spróbuj jeszcze raz.',
  ],
  // ---------- stałe obserwacje ----------
  abandon: [
    'Poddałeś się na piętrze {round}. Garnek poczeka, jest cierpliwy.',
    'Rezygnacja na piętrze {round}. Prezes nie przyjmuje wypowiedzeń, przyjmuje tylko zwłoki.',
  ],
  set: [
    'Miałeś 1 kafelek z zestawu {set}. Drugi dałby bonus. Czasem warto było dokupić.',
  ],
  streak2: [
    'Drugi raz z rzędu odpadasz na piętrze {round}. Piętro zaczyna cię rozpoznawać.',
  ],
  streak3: [
    'To już {n}. raz z rzędu na piętrze {round}. To nie przypadek, to tradycja.',
    '{n} razy z rzędu piętro {round}. Dział kadr wpisał ci je do opisu stanowiska.',
  ],
  first: [
    'Pierwszy run? Spokojnie, każdy kurczak zaczyna w garnku. Dopiero potem się z niego wychodzi.',
  ],
  base: [
    'Padłeś na piętrze {round} po {secs} s walki. Fabryka odnotowała stratę i przeszła do porządku dziennego.',
    'Protokół nr {nr}. Piętro {round}, czas walki {secs} s. Wniosek o urlop pośmiertny odrzucony.',
  ],
  base_noresult: [
    'Piętro {round}. Fabryka odnotowała stratę i przeszła do porządku dziennego.',
    'Protokół nr {nr}. Pracownik zakończył zmianę na piętrze {round}. Wniosek o urlop pośmiertny odrzucony.',
  ],

  // ---------- całe wspinaczki (dziennik runu) ----------
  bleed: [
    'Na kolejne piętra wchodziłeś z coraz mniejszym życiem: {seq}. To nie wspinaczka, to zjeżdżalnia.',
    'Protokół nr {nr}. Życie pracownika przy wejściu na kolejne piętra: {seq}. Dział HR nazywa to naturalną rotacją.',
  ],
  skillsrun: [
    'W całym runie użyłeś umiejętności {used} w {fights} walkach ({secs} s walki). Nosiłeś arsenał jak wystawę.',
    'Umiejętności: {used} użyć w {fights} walkach. Prezes pyta, czy to były prezenty.',
  ],
  norest: [
    'Przez {n} pięter nie skorzystałeś z odpoczynku ani razu, a do walk wchodziłeś średnio z {avg}% życia. Prezes ceni oszczędność, ale nie aż tak.',
    'Odpoczynków: zero. Średnie życie przy wejściu: {avg}%. Fabryka rosołu jest jedyną firmą, w której to się nazywa strategią.',
  ],

  // ---------- pamięć pięter ----------
  floormem_killer: [
    'Piętro {round}, {n}. śmierć. {killer} wykończył cię {k} z {n} razy. Ma cię w grafiku.',
    '{killer} i piętro {round}: {k} z {n} podejść kończy się tak samo. To już nie walka, to cykliczne spotkanie.',
  ],
  floormem_weak: [
    'Piętro {round}, {n}. śmierć. W {k} z {n} podejść wchodziłeś tu z mniej niż 40% życia. To nie pech, to metoda.',
  ],
  floormem_noskill: [
    'Piętro {round}, {n}. śmierć. W {k} z nich nie użyłeś ani jednej umiejętności. Piętro doceniło brak konkurencji.',
  ],
  floormem_n: [
    'Piętro {round} widziało cię już {n} razy. Zaczyna znać twoje imię.',
    '{n}. śmierć na piętrze {round}. Fabryka rozważa tablicę pamiątkową.',
  ],
  floorpb_lose: [
    'Piętro {f} zabiło cię {d} razy, a dziś poszło gładko. Padłeś dopiero na piętrze {round}. Awans ma swoje ceny.',
    'Piętro {f}, które zabijało cię {d} razy, tym razem się rozstąpiło. Do piętra {round} zdążyłeś się nawet znudzić.',
  ],
  floorpb_win: [
    'Piętro {f} zabiło cię {d} razy. Dziś minąłeś je bez słowa i wygrałeś cały run. Piętro wciąż nie rozumie, co się stało.',
    '{d} śmierci na piętrze {f}, a teraz zwycięstwo. Prezes sprawdza, czy to na pewno ten sam kurczak.',
  ],

  // ---------- ty kontra ty ----------
  vs_regres: [
    'Poprzednio dotarłeś na piętro {lr}, dziś padłeś na {round}. To regres. Prezes nie lubi tego słowa.',
  ],
  vs_postep: [
    'Poprzedni run skończył się na piętrze {lr}, ten na {round}. Awans! Prezes przenosi cię na drugi koniec taśmy.',
  ],
  vs_skills: [
    'W poprzednim runie użyłeś umiejętności {last}. Dziś ani razu. Co się stało z rozwojem osobistym?',
  ],
  vs_coins: [
    'Drugi run z rzędu kończysz z pełnymi kieszeniami: {a} i {b}. Prezes dziękuje za wpłaty.',
  ],

  // ---------- rekordy wstydu ----------
  shame_fast: [
    'Nowy antyrekord: walka trwała {secs} s. Poprzedni: {prev} s. Gratulacje, pracowniku.',
  ],
  shame_coins: [
    'Zginąłeś z {coinsI}. Poprzedni rekord wstydu: {prev}. Prezes pyta, czy planowałeś odejść na emeryturę.',
  ],
  shame_dealt: [
    'Zadałeś {dealt} obrażeń: najmniej ze wszystkich twoich porażek (poprzednio {prev}). Wróg nawet się nie spocił.',
  ],
  shame_noskill: [
    'To już {k}. run, w którym nie użyłeś umiejętności w ostatniej walce. To nie oszczędność, to sabotaż.',
  ],

  // ---------- zakład ----------
  bet_floor: [
    'Zakład Prezesa: następnym razem dojdziesz dalej niż piętro {target}? Rozliczymy po następnym runie. Stawka: duma.',
  ],
  bet_coins: [
    'Zakład Prezesa: następnym razem nie zginiesz z więcej niż {target} Ziarnami w kieszeni. Prezes obstawia, że zginiesz z {coinsI}.',
  ],
  bet_skills: [
    'Zakład Prezesa: w następnym runie użyjesz umiejętności w każdej walce. Prezes stawia na kalendarz, ty na pamięć.',
  ],
  bet_score: [
    'Zakład Prezesa: następnym razem pobijesz {target} pkt. Rozliczymy po finale. Prezes w to nie wierzy.',
  ],
  bet_win_floor: [
    'Zakład wygrany: piętro {round} przy celu powyżej {target}. Prezes wypłaca 0 Piór i oficjalne uznanie.',
  ],
  bet_lose_floor: [
    'Zakład przegrany: piętro {round} przy celu powyżej {target}. Prezes twierdzi, że to już nie przypadek, tylko współpraca.',
  ],
  bet_win_coins: [
    'Zakład wygrany: z {coinsI} w kieszeni przy limicie {target}. Prezes jest zaskoczony i trochę rozczarowany.',
  ],
  bet_lose_coins: [
    'Zakład przegrany: {coins} w kieszeni przy limicie {target}. Prezes przyjmuje twoje oszczędności w formie darowizny.',
  ],
  bet_win_skills: [
    'Zakład wygrany: umiejętności użyte w każdej walce. Prezes zlecił audyt, bo coś tu nie gra.',
  ],
  bet_lose_skills: [
    'Zakład przegrany: w niektórych walkach umiejętności znów poszły w odstawkę. Prezes zapisał to w aktach jako konsekwencję.',
  ],
  bet_win_score: [
    'Zakład wygrany: {score} pkt przy celu {target}. Prezes wypłaca 0 Piór i niechętne uznanie.',
  ],
  bet_lose_score: [
    'Zakład przegrany: {score} pkt przy celu {target}. Prezes dziękuje za wkład w jego dobry humor.',
  ],

  // ---------- wygrane ----------
  w_wins: [
    'Na palniku {garnek} wygrywa {pct}% graczy. Dziś jesteś w tej grupie. Spróbuj pójść wyżej.',
  ],
  w_wins_hi: [
    'Na palniku {garnek} wygrywa {pct}% graczy. Prezes zastanawia się, czy to naprawdę jest cel.',
  ],
  w_flawless: [
    'Wygrałeś {n} bez przyjęcia ani jednego ciosu. Prezes zlecił audyt.',
    'Bezbolesne zwycięstwa: {n}. Dział BHP uznał, że nie ma się do czego przyczepić, więc się przyczepi.',
  ],
  w_reroll: [
    'Wygrałeś, choć przerollowałeś oferty {n} razy. Cierpliwość popłaca. Prezes nie rozumie tego słowa.',
  ],
  w_coins: [
    'Wygrałeś z {coinsI} w kieszeni. Zwycięzca nie musi wydawać wszystkiego, ale mógł.',
  ],
  w_hit: [
    'Twój największy cios w tym runie: {hit}. Brojler do dziś go czuje.',
  ],
  w_next: [
    'Czas na palnik {next}. Tam nikt cię nie oszczędzi.',
  ],
  w_lowhp: [
    'Wygrałeś, ale na piętrze {r} miałeś w pewnej chwili {pct}% życia. Prezes zapisał to w aktach jako sukces osiągnięty przez pomyłkę.',
    'Piętro {r}: w pewnym momencie zostało ci {pct}% życia, a mimo to wygrałeś. Dział BHP prosi o wyjaśnienia.',
  ],
  w_noskill: [
    'Ukończyłeś run bez użycia ani jednej umiejętności. Prezes jest pod wrażeniem. Dział projektowy zastanawia się, po co je dodano.',
  ],
  w_norest: [
    'Wygrałeś bez ani jednego odpoczynku. Fabryka nie przewidziała takiego pracownika, HR sprawdza, czy to nie błąd w ewidencji.',
  ],
  w_afterloss: [
    'Pierwsza wygrana po {k} porażkach z rzędu. Prezes liczył, że się zniechęcisz.',
  ],
  w_quickboss: [
    'Boss padł po {secs} s. Prezes odnotował, że to szybsze niż jego ostatnie spotkanie z zarządem.',
  ],
  w_mode: [
    'Zwycięstwo w trybie Szybkim. Tryb Pełny ma {full} pięter. Prezes nie chce psuć ci humoru szczegółami.',
  ],
  w_garnek: [
    'Na palniku {next} ten sam run dałby ok. {diff} pkt więcej. Prezes widzi potencjał i niewykorzystaną premię.',
  ],
  w_base: [
    'Wygrana w trybie {mode}, palnik {garnek}. Prezes zapisał to w aktach i poprawił krawat.',
  ],
};

// Podstawia {pole}; brakujące pole zostawia puste (generator i tak pilnuje, żeby pola były).
export const fill = (tpl, v) => tpl.replace(/\{(\w+)\}/g, (_, k) => (v[k] == null ? '' : String(v[k])));
// Szablon z {nr} wymaga numeru pracownika (tylko po porażce).
export const needsNr = tpl => tpl.includes('{nr}');
