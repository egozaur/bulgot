// Bulgot: teksty gry. Narrator to Kronikarz: epicka powaga, absurdalna treść.
export const TAGLINE = 'Awans albo rosół';

export const INTRO = [
  'Kurnik Pod Dębem żył spokojnie, aż do nocy, gdy Korporacja Rosołowa S.A. zabrała cały drób na Wielki Rosół.',
  'Pisklę Pyrtek wypadło z ciężarówki i zostało samo.',
  'Teraz musi wrócić do fabryki, przebić się przez dwadzieścia pięter i obalić Prezesa Rosołu, zanim woda w garnku zacznie bulgotać.',
];

export const ZONE_NAMES = ['Kurnik i Podwórze', 'Magazyn Pasz i Chłodnia', 'Sortownia Jaj i Biuro Zarządu'];

// Linie Kronikarza przed wyborem kafelka (po jednej na rundę, wg strefy).
export const OFFER_LINES = [
  [
    'I oto Pyrtek wzniósł dziób ku niebu, a niebo odpowiedziało mu sufitem chłodni.',
    'Ziarno do ziarna, a będzie pazur. Tak mawiały dawne kury, zanim je zabrano.',
    'Podwórze milczało. Tylko z oddali dobiegał stuk wielkiej chochli.',
    'W kurniku pachniało sianem i niepokojem. Pyrtek wybrał jedno i poszedł dalej.',
    'Szczury pasły się na resztkach pasz. Nie wiedziały jeszcze, kto nadchodzi.',
    'U wrót fabryki wisiał napis: „Pracownik miesiąca. Miejsce wolne”.',
  ],
  [
    'Wśród regałów echo niosło odgłos kroków. Ktoś tu dawno nie widział światła dziennego.',
    'W chłodni brzmiał dźwięk, który mrozi krew. Dobrze, że kurczaki mają ją ciepłą.',
    'Pyrtek podrósł. Pióra mu zmężniały, a w spojrzeniu pojawiła się stal.',
    'Skrzynie z paszą piętrzyły się jak mury twierdzy. Za nimi czekała następna próba.',
    'Mówią, że w magazynie nie ma godzin, są tylko zmiany. Pyrtek miał własny grafik.',
    'Wózki widłowe krążyły po korytarzach niczym smoki na wiecznym dyżurze.',
  ],
  [
    'Pachniało już biurem: kawą, laminatem i końcem czyjejś nadziei.',
    'Tu nikt nie pytał o samopoczucie, tylko o wyniki kwartalne.',
    'Wyższe piętra błyszczały szkłem. Pyrtek widział w nim własne odbicie i było mu z nim do twarzy.',
    'Rambo Chicken nie szukał rozgłosu. Rozgłos sam go znajdował, najczęściej głośnym pianiem.',
    'Za tymi drzwiami czekał Zarząd. Pyrtek wziął oddech, a potem kolejny kafelek.',
    'Na ścianie wisiał cennik rosołu. Pyrtek przyjrzał mu się z odrazą.',
  ],
];

export const BOSS_INTRO = {
  brojler: { title: 'Brojler Zdzisław, Szef Zmiany', quote: 'Mówią, że nigdy nie spał. To nieprawda. Po prostu nikt nie widział go na urlopie.' },
  skubarka: { title: 'Skubarka 3000', quote: 'Skubie, bo kocha. A kocha każde pióro, które znajdzie.' },
  prezes: { title: 'Prezes Rosołu', quote: 'Padnie Prezes, a z nim upadnie cały cennik. Ale najpierw będzie spotkanie.' },
};

export const WIN_LINES = [
  'Piętro zdobyte. Garnek bulgocze ciszej.',
  'Wróg padł. Pyrtek otrzepał pióra i zerknął w górę.',
  'Kolejny szczebel kariery, tym razem bez rekomendacji.',
  'Wygrana wywalczona dziobem, nie CV.',
  'Wyżej. Zawsze wyżej. Tak brzmi motto kurnika.',
];
export const BOSS_WIN_LINES = {
  brojler: 'Brojler Zdzisław padł. Stażyści rozeszli się do domów, po raz pierwszy o czasie.',
  skubarka: 'Skubarka 3000 zgasła z westchnieniem. Pióra opadały jak jesienne liście.',
  prezes: 'Padł Prezes, a z nim upadł cały cennik.',
};
export const LOSE_LINES = [
  'Wylądowałeś w garnku. Rosół wyszedł wyjątkowo aromatyczny.',
  'Kronikarz westchnął i zamknął księgę. Do następnego razu, bohaterze.',
  'Awans został odrzucony. Powód: zbyt dużo pierza w CV.',
  'Garnek zabulgotał z satysfakcją. Ale legenda o tobie jeszcze nie umarła.',
];
export const END_WIN = {
  title: 'AWANS!',
  lines: [
    'Prezes Rosołu leży u stóp Rambo Chickena. Garnek stygnie, a Kurnik znów jest wolny.',
    'Kronikarz drżącą ręką zapisał: „I był to dzień, w którym kurczak został dyrektorem”.',
  ],
};
export const END_LOSE = { title: 'ROSÓŁ' };

export const MODE_INFO = {
  quick: { name: 'Szybki', rounds: 10, text: '10 pięter, dwóch bossów, ok. 10 minut. Dobry na rozgrzewkę.' },
  full: { name: 'Pełny', rounds: 20, text: '20 pięter, trzech bossów, ok. 20 minut. Pełna saga.' },
};

export const STAT_LABELS = [
  ['maxHp', 'Życie'], ['atk', 'Atak'], ['aspd', 'Tempo ataku', v => (v / 100).toFixed(2).replace('.', ',') + ' / s'], ['armor', 'Pancerz'],
  ['crit', 'Szansa na trafienie krytyczne', v => v + '%'], ['evade', 'Unik', v => v + '%'], ['regen', 'Regeneracja', v => v + ' / s'], ['luck', 'Szczęście'],
];

export const HELP = [
  ['Cel', 'Wejdź na szczyt fabryki rosołu: pokonaj wszystkie piętra i Prezesa Rosołu. W trybie szybkim to 10 pięter, w pełnym 20.'],
  ['Jedna runda', 'Wybierasz jeden z czterech kafelków, potem następuje walka. Po wygranej dostajesz Ziarna i odzyskujesz część życia.'],
  ['Kafelki', 'Statystyki, umiejętności aktywne, przedmioty z synergią i ryzykowne wydarzenia. Trzy przedmioty z jednego zestawu (Jajeczne, Zbożowe, Rambo) dają mocne bonusy.'],
  ['Reroll', 'Nie podoba Ci się oferta? Za Ziarna możesz ją przelosować. Pierwszy kosztuje 2, każdy kolejny w tej rundzie o 1 więcej.'],
  ['Odpoczynek', 'Za 4 Ziarna leczysz 20% życia, raz na rundę, przed walką (przycisk pod ofertą i na ekranie przed walką). Dobry sposób, żeby nie wchodzić na kolejne piętro poobijanym.'],
  ['Dokupowanie', 'Jeden kafelek z oferty bierzesz za darmo, a pozostałe możesz dokupić za Ziarna: zwykły 6, rzadki 12, epicki 20, legendarny 30. Wydarzeń (Sklepik, Hazard, Skrzynka) nie da się kupić, tylko wybrać. Niewydane Ziarna dają punkty na koniec runu.'],
  ['Walka', 'Kurczak bije się sam. Ty decydujesz, kiedy użyć umiejętności: klawisze 1, 2, 3 albo kliknięcie. Dobrze wybrany moment (ogłuszenie, unik) wygrywa z bossami.'],
  ['Bossowie', 'Mają fazy i własne sztuczki. Ogłuszenie przerywa ich szarże i telegrafowane ciosy, Unik Skrzydłem pozwala je przeczekać.'],
  ['Garnek', 'Temperatura Garnka to poziom trudności. Wygrana na poziomie N odblokowuje poziom N+1 i podnosi mnożnik wyniku o 25%.'],
  ['Odblokowania', 'Nowe postacie i kafelki odblokowujesz osiągnięciami (lista w Księdze Kurnika). Nigdy nie dają stałej przewagi w sile, tylko nowe opcje.'],
  ['Zapis', 'Run zapisuje się na serwerze po każdym ruchu. Możesz zamknąć kartę i dokończyć z dowolnego komputera.'],
];

// Wybór deterministyczny (ta sama runda, ta sama linia).
export const pickLine = (arr, n) => arr[Math.abs(n | 0) % arr.length];
