// Bulgot: teksty gry. Narrator to Kronikarz: epicka powaga, absurdalna treść.
// Wymiana oferty (dawniej „Reroll”). Inne pomysły: Wezwij Brygadzistę, Nowa Partia, Złóż Reklamację, Zawołaj Dostawcę.
export const REROLL = 'Przetasuj Taśmę', REROLL_BLOCKED = 'Taśma zablokowana';
export const TAGLINE = 'Awans albo rosół';

export const INTRO = [
  'Kurnik Pod Dębem żył spokojnie, aż do nocy, gdy Korporacja Rosołowa S.A. zabrała cały drób na Wielki Rosół.',
  'Pisklę Pyrtek wypadło z ciężarówki i zostało samo.',
  'Teraz musi wrócić do fabryki, przebić się przez dwadzieścia pięter i obalić Prezesa Rosołowskiego, zanim woda w garnku zacznie bulgotać.',
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
  prezes: { title: 'Prezes Rosołowski', quote: 'Padnie Prezes, a z nim upadnie cały cennik. Ale najpierw będzie spotkanie.' },
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
    'Prezes Rosołowski leży u stóp Rambo Chickena. Garnek stygnie, a Kurnik znów jest wolny.',
    'Kronikarz drżącą ręką zapisał: „I był to dzień, w którym kurczak został dyrektorem”.',
  ],
};
export const END_LOSE = { title: 'ROSÓŁ' };

// Ukryta postać (Zjarany Kurczak): jajko nie zdradza ani nazwy, ani warunku odblokowania.
export const SECRET_CHAR_TEXT = 'Z tego jajka coś się dymi. Ponoć wystarczy zebrać w jednym biegu naprawdę wiele… czegoś.';

// Faktura po wygranej walce (spada na ekran zamiast okna wyniku).
export const INVOICE = {
  company: 'Korporacja Rosołowa S.A.', nip: 'NIP 000-PIÓ-RKO',
  title: 'FAKTURA VAT', bossTitle: 'NOTA OBCIĄŻENIOWA',
  stamp: 'ZAPŁACONO', bossStamp: 'PREZES\nPODPISAŁ',
  footers: [
    'Do zapłaty: 0 zł. Dziękujemy za współpracę.',
    'Termin płatności: wczoraj. Odsetki: rosół.',
    'Reklamacji nie uwzględniamy. Rosołu też.',
    'Wystawiono bez podpisu, bo kurczak nie miał ręki.',
    'Prosimy o wpłatę Ziaren na konto garnka.',
    'Oryginał trafia do rosołu, kopia do kurnika.',
    'Zapłata nastąpiła dziobem. Dziękujemy.',
  ],
  bossFooters: [
    'Zarząd przyjmuje wyrazy współczucia i zażalenia na piśmie.',
    'Pozycja „boss” została skreślona z cennika.',
    'Premia kwartalna ponownie nie została wypłacona.',
  ],
};

export const MODE_INFO = {
  quick: { name: 'Szybki', rounds: 10, text: '10 pięter, dwóch bossów, ok. 10 minut. Szybka, zalewana wrzątkiem.' },
  full: { name: 'Pełny', rounds: 20, text: '20 pięter, trzech bossów, ok. 20 minut. Gotuje się długo, smakuje najlepiej.' },
};

// Regeneracja jest liczona w dziesiątych częściach Życia na sekundę (10 = 1 / s).
export const fmtRegen = v => String(Math.round(v) / 10).replace('.', ',');

export const STAT_LABELS = [
  ['maxHp', 'Życie'], ['atk', 'Atak'], ['aspd', 'Szybkość ataku', v => v + '%'], ['armor', 'Pancerz'],
  ['crit', 'Dziobnięcie', v => v + '%'], ['evade', 'Unik', v => v + '%'], ['regen', 'Regeneracja', v => fmtRegen(v) + ' / s'], ['luck', 'Szczęście'],
];
// Panel statystyk: 8 statystyk, zawsze widocznych; zapis wartości: liczba + jednostka w osobnej kolumnie. Szybkość ataku w uderzeniach na sekundę, Regeneracja w Życiu na sekundę. Obrażeń i Mocy Dziobnięcia nie ma: Atak jest jednym mnożnikiem mocy, a mocne dziobnięcie zawsze zadaje podwójny cios.
// Numer wydania gry (pokazywany na ekranie startowym). Patch 1.1: „Mniej drzwi, więcej decyzji”.
export const PATCH = '1.1';
export const STAT_GROUPS = [
  ['Ofensywa', [['atk', 'Atak'], ['aspd', 'Szybkość ataku'], ['crit', 'Dziobnięcie']]],
  ['Obrona', [['maxHp', 'Życie'], ['armor', 'Pancerz'], ['evade', 'Unik'], ['regen', 'Regeneracja']]],
  ['Inne', [['luck', 'Szczęście']]],
];
// Szybkość ataku w uderzeniach na sekundę (100 = 1,0 / s).
export const fmtPerSec = v => { const x = Math.round(v) / 100; return (Math.round(x * 100) % 10 === 0 ? x.toFixed(1) : x.toFixed(2)).replace('.', ','); };
// Każdy typ statystyki ma własny znak: liczba (Atak, Życie, Pancerz, Szczęście), „/ s” (Szybkość, Regeneracja), „%” (Dziobnięcie, Unik).
export function statValue(k, S) {
  switch (k) {
    case 'aspd': return [fmtPerSec(S.aspd), '/ s'];
    case 'crit': return [String(S.critRaw != null ? S.critRaw : S.crit), '%'];   // surowa wartość: powyżej 100% nadwyżka zamienia się w siłę dziobnięcia
    case 'evade': return [String(S[k]), '%'];
    case 'regen': return [fmtRegen(S.regen), '/ s'];
    default: return [String(S[k]), ''];
  }
}
// Premia ponad bazę bohatera (kafelki, zestawy, postać, Odznaki), zapisana w jednostce statystyki; '' gdy brak.
export function statBonus(k, S, base) {
  const key = k === 'maxHp' ? 'hp' : k;
  if (!base || base[key] == null) return { txt: '', neg: false, d: 0 };
  const d = (k === 'crit' && S.critRaw != null ? S.critRaw : S[k]) - base[key];
  if (!d) return { txt: '', neg: false, d: 0 };
  const a = Math.abs(d), body = k === 'aspd' ? fmtPerSec(a) : k === 'regen' ? fmtRegen(a) : String(a);
  return { txt: (d > 0 ? '+' : '−') + body, neg: d < 0, d };
}

export const HELP = [
  ['Cel', 'Wejdź na szczyt fabryki rosołu: pokonaj wszystkie piętra i Prezesa Rosołowskiego. W trybie szybkim to 10 pięter, w pełnym 20.'],
  ['Jedna runda', 'Wybierasz jeden z czterech kafelków, potem następuje walka. Po wygranej dostajesz Ziarna i odzyskujesz część życia.'],
  ['Kafelki', 'Statystyki, umiejętności aktywne, przedmioty z synergią i ryzykowne wydarzenia. Przedmioty z jednego zestawu (Jajeczne, Zbożowe, Rambo, Rosołowe, Chłodnicze, Korporacyjne) dają bonusy od 2, 3 i 4 sztuk.'],
  ['Poziomy statystyk', 'Każda statystyka ma trzy poziomy zwykłe (plakietka I, II, III) i legendarny (★). Dwa takie same kafelki poziomu 1 lub 2 zlejesz za darmo w jeden wyższego poziomu (przycisk „Zlej kafelki”, klawisz U). Legendarne statystyki wypadają tylko z bossów: po bossie (poza Prezesem) z szansą 15% wybierasz 1 z 3.'],
  ['Efekty', 'Oparzenie i Salmonella zadają obrażenia co sekundę i kumulują się (Salmonella przechodzi na kolejnego wroga po śmierci nosiciela). Mróz spowalnia, a 5 stosów zamraża wroga. Krwawienie kumuluje się do 3 stosów. Ikonki ze stosami widać nad paskiem życia wroga.'],
  ['Mutacje', 'Druga kopia umiejętności daje poziom 2 (+30% mocy, krótszy cooldown). Trzecia kopia to Mutacja: wybierasz jedną z dwóch gałęzi, która na stałe zmienia działanie umiejętności.'],
  ['Wylęgarnia', 'Niektóre pary przedmiotów wykluwają legendarny przedmiot (znacznik „Wylęgarnia!” na karcie). Każde 3 kopie tej samej statystyki dają dodatkową premię (np. 3× Ziarno Mocy = Kolba Mocy). Odkryte przepisy są w Księdze Kurnika.'],
  ['Odznaki', 'Za pokonanie bossa albo elitarnego wroga wybierasz Odznakę Pracowniczą: stały bonus do końca runu. Elity mają cechy (np. Wampiryczny, Wybuchowy), które widać w podglądzie piętra (od Garnka 1 dopiero w walce).'],
  ['Piętra', 'Zwykłe piętra mają szablony: Czempion (jeden wróg z +80% Życia), Rój (trzech osłabionych), Zwiad (wróg z następnej strefy) i Para (dwa gatunki, które się wspierają). Na Garnku 0 podgląd pokazuje wrogów i szablon. Od Garnka 1 szyba jest zaparowana: dowiesz się dopiero w walce. Bossów zapowiada pasek pięter.'],
  ['Reakcje', 'Dwa różne efekty na jednym wrogu łączą się w reakcję. Oparzenie + Mróz = Szok Termiczny (wybuch zależny od stosów), Salmonella + Krwawienie = Gorączka (efekty bolą mocniej, a śmierć zaraża resztę), Mróz + Krwawienie = Kruchość (następne trafienie jest krytyczne). Odkryte reakcje trafiają do Księgi Kurnika.'],
  ['Seria (Okno Gdakania)', 'Umiejętność użyta do 1,5 s po poprzedniej trafia mocniej: druga w serii +20%, trzecia +50%. Trzy różne umiejętności w jednej serii to Pełna Kurza Seria: wszyscy wrogowie wpadają w Popłoch (ogłuszenie na 1 s). Czasem warto przytrzymać umiejętność i odpalić wszystko naraz.'],
  ['Lombard Lisa', 'Przed wyborem kafelka możesz zastawić u Lisa jeden kafelek z budowy (nie umiejętność) i od razu dostać jego pełną cenę w Ziarnach. Wykupisz go tylko na następnym piętrze, za 150% ceny. Jeśli nie wykupisz, Lis zatrzymuje kafelek, a wszystkie Lisy Windykatory w tym runie są o 25% silniejsze.'],
  ['Odsetki w Spiżarni', 'Po każdej wygranej walce dostajesz +1 Ziarno za każde 10 niewydanych Ziaren, najwyżej +3 (Kaczor Hazardzista +5). Oszczędzanie też jest strategią.'],
  ['Okólniki Zarządu', 'Na starcie runu Zarząd losuje jeden okólnik, który zmienia zasady (np. Audyt Wydatków: darmowe rerolle, droższe dokupowanie). Obowiązuje do końca runu. Widać go nad ofertą i na górnym pasku.'],
  ['Wadliwa Partia', 'Czasem kafelek w ofercie ma pieczątkę „Wada fabryczna”. Jego efekty są o 50% mocniejsze, ale ma ukrytą wadę, która ujawnia się i zaczyna działać po następnej walce. Wylęgarnia usuwa wadę, gdy kafelek jest składnikiem przepisu.'],
  ['Kafelki rosnące', 'Pierze Weterana, Trofeum z Piór i Skarbonka Pisklęcia zaczynają słabo i rosną z każdą walką, gdy spełnisz ich warunek. Stan licznika widać na kafelku w panelu po prawej.'],
  ['Awans Wroga (Nemezis)', 'Zwykły wróg, który zakończy twój run, awansuje: dostaje tytuł, cechę elity i kradnie jeden twój kafelek. W następnym runie czeka na piętrze w swojej strefie (znak czaszki z wykrzyknikiem). Pokonany oddaje kafelek i daje Odznakę Sprawiedliwość Kurnika. Jeśli znowu wygra, awansuje wyżej.'],
  ['Testament Pyrtka', 'Po przegranej możesz zapisać jeden kafelek (zwykły albo rzadki) następnemu kurczakowi. Pojawi się jako piąta karta pierwszej oferty w kolejnym runie. Jeśli masz więcej postaci, testament działa tylko dla innej postaci niż ta, która go spisała.'],
  ['Klawiatura','Strzałki przesuwają zaznaczenie między kartami i przyciskami (także w oknach), Enter zatwierdza. Skróty: 1–4 wybór, Shift+1–4 dokup, R reroll, O odpoczynek, w walce 1/2/3 umiejętności, P pauza, F szybkość.'],
  ['Reroll', 'Nie podoba Ci się oferta? Za Ziarna możesz ją przelosować. Pierwszy kosztuje 2, każdy kolejny w tej rundzie o 1 więcej.'],
  ['Odpoczynek', 'Za 4 Ziarna leczysz 20% życia, raz na rundę, przed walką (przycisk pod ofertą i na ekranie przed walką). Dobry sposób, żeby nie wchodzić na kolejne piętro poobijanym.'],
  ['Dokupowanie', 'Jeden kafelek z oferty bierzesz za darmo, a pozostałe możesz dokupić za Ziarna: zwykły 6, rzadki 12, epicki 20, legendarny 30. Wydarzeń (Sklepik, Hazard, Skrzynka, Automat, Kontrakt, Kapliczka) nie da się kupić, tylko wybrać. Niewydane Ziarna dają punkty na koniec runu.'],
  ['Walka', 'Kurczak bije się sam. Ty decydujesz, kiedy użyć umiejętności: klawisze 1, 2, 3 albo kliknięcie. Dobrze wybrany moment (ogłuszenie, unik) wygrywa z bossami.'],
  ['Bossowie', 'Mają fazy i własne sztuczki. Ogłuszenie przerywa ich szarże i telegrafowane ciosy, Unik Skrzydłem pozwala je przeczekać.'],
  ['Garnek', 'Poziom palnika to poziom trudności. Wygrana na poziomie N odblokowuje poziom N+1 i podnosi mnożnik wyniku o 25%.'],
  ['Odblokowania', 'Nowe postacie i kafelki odblokowujesz osiągnięciami (lista w Księdze Kurnika). Nigdy nie dają stałej przewagi w sile, tylko nowe opcje.'],
  ['Zapis', 'Run zapisuje się na serwerze po każdym ruchu. Możesz zamknąć kartę i dokończyć z dowolnego komputera.'],
  ['Klątwy Prezesa', 'Przed runem (krok z palnikiem) możesz wybrać do trzech dobrowolnych utrudnień. Każda dodaje premię do końcowego wyniku.'],
  ['Trasy', 'Na początku drugiej i trzeciej strefy wybierasz jedną z dwóch dróg. Trasa zmienia wrogów i ekonomię do końca strefy.'],
  ['Dogrywka', 'Po pokonaniu Prezesa wygrana jest już twoja, ale możesz zostać w fabryce. Wrogowie rosną szybciej, co pięć pięter czeka super-boss, a osobny ranking liczy, jak głęboko dotarłeś.'],
  ['Arena Duchów i towarzysze', 'Kafelek Arena Duchów to walka z buildem innego gracza z końca jego runu (albo z twoim Odbiciem). Schronisko dla Piskląt daje towarzysza, który walczy obok i rośnie po bossach.'],
  ['Kurnik', 'Za każdy run dostajesz Pióra, które wydajesz na trwałe, niewielkie ulepszenia w Kurniku (menu główne). Kurnik odblokowuje się na 20. poziomie Stażu; wcześniej możesz tylko oglądać budynki, a Pióra się zbierają.'],
];

// Wybór deterministyczny (ta sama runda, ta sama linia).
// Awans Wroga.
export const NEMESIS_LINES = [
  'Pamiętasz go? On ciebie pamięta. Awansował na twoich piórach.',
  'Czas wyrównać rachunki. Z odsetkami.',
];
export const pickLine =(arr, n) => arr[Math.abs(n | 0) % arr.length];

// Karta bohatera w panelu bocznym: skrót tego, co robi postać (cecha + plusy i minusy), żeby nie trzeba było pamiętać opisów.
// perks: [ikona, znak, tekst]; ikona = klucz statystyki (maxHp, atk, aspd, crit, regen, luck…) albo emoji. `role` zastępuje „Stanowisko” z danych.
export const CHAR_PERKS = {
  sanepid: { title: 'Kontrola Salmonelli', perks: [['🦠', '+', '25% Salmonelli przy ataku, rozprzestrzenia się'], ['📋', '+', '5+ stosów: wróg +25% obrażeń, −20% szybkości'], ['🥚', '+', 'Start: Zgniłe Jajo'], ['atk', '-', '−20% Ataku'], ['maxHp', '-', '−10% Życia']] },
  wanda: { title: 'Złote Jaja', perks: [['🥚', '+', 'Start: Tykające Jajo, uderza we wszystkich'], ['📈', '+', 'Jaja rosną o 4% za piętro (maks. +60%)'], ['🪺', '+', 'Zestaw Jajeczny liczy się o 1 sztukę więcej'], ['atk', '-', '−15% Ataku']] },
  zwiazkowiec: { title: 'Strajk Włoski', perks: [['⏸️', '+', 'Wrogowie zaczynają ogłuszeni (1,8 s, także fale)'], ['🎯', '+', '+25% obrażeń w ogłuszone i zamrożone cele'], ['🗣️', '+', 'Start: Pianie Grozy'], ['atk', '-', '−20% Ataku'], ['maxHp', '-', '−12% Życia']] },
  pacyfista: { title: 'Bez Ataku', perks: [['☮️', '-', 'Zero zwykłych ataków'], ['⚡', '+', 'Umiejętności +30% mocy, −40% cooldownu'], ['🧪', '+', 'Oparzenie, Salmonella, Krwawienie +60%'], ['🐣', '+', 'Towarzysz od startu, +60% mocy'], ['regen', '+', 'Regeneracja +0,8 / s']] },
  pyrtek: { title: 'Bez fanaberii', perks: [['atk', '+', '+7% Ataku'], ['maxHp', '+', '+7% Życia']] },
  kwoka: { title: 'Czołg', perks: [['maxHp', '+', '+12% Życia'], ['🌾', '+', 'Start: Zagrzebanie w Sianie'], ['aspd', '-', '−25% szybkości ataku']] },
  kaczor: { title: 'Ryzyko i Odsetki', perks: [['🪙', '+', '+10 Ziaren, Odsetki do 5'], ['🔄', '+', '1 reroll gratis na piętro'], ['🎲', '+', 'Więcej kafelków ryzyka']] },
  indor: { title: 'Ciężkie ciosy', perks: [['atk', '+', '+55% Ataku'], ['crit', '+', '+10% szansy na dziobnięcie'], ['aspd', '-', '−30% szybkości ataku']] },
  zjarany: { title: 'Podpala wrogów', perks: [['🔥', '+', '30% Oparzenia przy ataku'], ['☁️', '+', 'Chmura Dymu co 4 s'], ['aspd', '-', '−45% szybkości ataku'], ['atk', '-', '−10% Ataku']] },
  barista: { title: 'Rozgrzewka', perks: [['aspd', '+', '+5% szybkości ataku za każdy cios (maks. +60%)'], ['⚡', '+', 'Start: Szał Dziobów'], ['maxHp', '-', '−20% Życia'], ['atk', '-', '−5% Ataku'], ['🧊', '-', 'Każda walka zaczyna się „na zimno”']] },
  ges: { title: 'Kapitał pracuje', perks: [['🪙', '+', '+1% Ataku za każde 5 Ziaren (maks. +25%)'], ['💰', '+', '+15 Ziaren, +1 po wygranej, Odsetki do 6'], ['atk', '-', '−10% Ataku'], ['⚖️', '-', 'Każde wydane Ziarno to utracona moc']] },
  lodziarz: { title: 'Mróz', perks: [['❄️', '+', '15% Mrozu przy ataku'], ['🧊', '+', 'Zmrożeni zadają −10%'], ['aspd', '-', '−25% szybkości ataku']] },
  pielegniarka: { title: 'Leczenie', perks: [['regen', '+', 'Regeneracja +0,8 / s'], ['💚', '+', 'Leczenie po rundzie +5 pkt proc.'], ['atk', '-', '−25% Ataku']] },
  rzeznik: { title: 'Krwawienie', perks: [['🩸', '+', 'Każdy atak: Krwawienie'], ['💚', '+', 'Zabicie krwawiącego wroga: +5% Życia'], ['🗡️', '+', 'Start: Darcie Pierza'], ['maxHp', '-', '−10% Życia'], ['atk', '-', '−5% Ataku']] },
  wrozka: { title: 'Lepsze oferty', perks: [['luck', '+', '+30 Szczęścia'], ['🔄', '+', '1 reroll gratis na piętro'], ['atk', '+', '+8% Ataku']] },
  stazysta: { title: 'Rośnie z piętrami', perks: [['📈', '+', '+5% statystyk za piętro (maks. +40%)'], ['atk', '-', '−22% Ataku na start'], ['maxHp', '-', '−22% Życia na start']] },
  mutant: { title: 'Mistrz umiejętności', perks: [['⏱️', '+', 'Cooldowny −25%'], ['🎲', '+', 'Start: losowa umiejętność'], ['maxHp', '-', '−15% Życia']] },
  gigachad: { title: 'Jedno Koło, Jedna Sztuczka', perks: [['⚡', '+', 'Umiejętność ×2,5 mocy, −30% cooldownu'], ['atk', '+', '+15% Ataku'], ['🎪', '-', 'Tylko 1 slot umiejętności'], ['aspd', '-', '−10% szybkości ataku'], ['maxHp', '-', '−10% Życia']] },
  jajeczko: { title: 'Szklana Kula', perks: [['evade', '+', '+75% uniku'], ['atk', '+', '+150% Ataku, +5% za każdy unik w walce'], ['aspd', '+', '+30% szybkości ataku'], ['🥚', '+', 'Start: Gniazdo Zapasowe'], ['maxHp', '-', 'Tylko 3 punkty życia']] },
  krypto: { title: 'Rynek Decyduje', perks: [['📈', '+', 'Co piętro statystyki od −30% do +55%'], ['📉', '-', 'Kurs poznasz dopiero w walce']] },
  alkoholik: { title: 'Wieczny Poniedziałek', perks: [['crit', '+', '+30% szansy na dziobnięcie'], ['🍺', '+', '+120% Mocy Dziobnięcia'], ['aspd', '-', '−25% szybkości ataku'], ['maxHp', '-', '−15% Życia']] },
  wegan: { title: 'Bez Mięsa', perks: [['🥬', '-', 'Odpoczynek leczy o połowę mniej'], ['maxHp', '-', '−10% Życia']] },
  baba: { title: 'Drogi Targ', perks: [['🪙', '+', '+25 Ziaren na start'], ['🛒', '-', 'Kupuje o 30% drożej'], ['atk', '-', '−12% Ataku'], ['maxHp', '-', '−12% Życia']] },
  influencer: { title: 'Zasięgi', perks: [['crit', '+', '+35% szansy na dziobnięcie'], ['🤳', '+', '+100% Mocy Dziobnięcia'], ['maxHp', '-', '−25% Życia'], ['atk', '-', '−15% Ataku']] },
  skibidi: { title: 'Chaos', perks: [['🎲', '+', 'Start: 2 losowe umiejętności'], ['⏱️', '+', 'Cooldowny −10%'], ['maxHp', '-', '−25% Życia'], ['atk', '-', '−12% Ataku']] },
  emeryt: { title: 'Twardy Staruszek', perks: [['armor', '+', '+6 Pancerza, +3% Ataku za każde 4 Pancerza'], ['maxHp', '+', '+10% Życia, Regeneracja +1 / s'], ['aspd', '-', '−35% szybkości ataku']] },
  sigma: { title: 'Samotny Wilk', perks: [['atk', '+', '+3% Ataku'], ['maxHp', '+', '+3% Życia'], ['🐺', '-', 'Bonusy zestawów i powiązań nie działają']] },
  dinozaur: { role: 'Sekretny', title: 'Wykluwa się', perks: [['🥚', '+', 'Po 4 piętrach: Dinozaur (+30% Ataku i Życia)'], ['🛡️', '+', 'Do tego czasu bez żadnych kar']] },
};

// Gruszka (dodatkowy boss na piętrze 3): na starcie walki wyśmiewa aktualny build. Wybiera najsłabszą stronę bohatera (najwyższy „wstyd”).
export function gruszkaTaunt(r) {
  const S = r.hero || {}, f1 = n => (n / 100).toFixed(2).replace('.', ','), sk = (r.skills || []).length, tiles = (r.tiles || []).length;
  const L = [];   // [wstyd 0..100, tekst]
  L.push([sk === 0 ? 95 : 0, 'Zero umiejętności? Ja bym się też wstydziła, więc cię rozumiem.']);
  L.push([sk === 1 ? 55 : 0, 'Jedna umiejętność. Jedna! U mnie na podwórzu i kura ma więcej sztuczek.']);
  L.push([S.armor <= 1 ? 80 : S.armor <= 4 ? 45 : 0, `Pancerz ${S.armor}? Przez ten dziurawy kubraczek widać nawet pestki.`]);
  L.push([S.evade <= 0 ? 50 : 0, 'Unik 0%? Stoisz jak gruszka w sadzie. Tylko mniej smaczny.']);
  L.push([S.crit < 8 ? 65 : S.crit < 15 ? 40 : 0, `Szansa na dziobnięcie ${S.crit}%. Tyle trafień to ja mam w skórce od jednego uderzenia.`]);
  L.push([S.aspd < 85 ? 70 : S.aspd < 100 ? 35 : 0, `Szybkość ${f1(S.aspd)} na sekundę? Moje pestki szybciej spadają z drzewa.`]);
  L.push([S.maxHp < 85 ? 60 : 0, `${S.maxHp} punktów życia? Rosół z ciebie wyjdzie rzadki.`]);
  L.push([S.atk < 12 ? 55 : 0, `Atak ${S.atk}? Łaskoczesz mnie, kurczaku, i to bez przekonania.`]);
  L.push([(r.coins | 0) >= 14 ? 62 : 0, `${r.coins} Ziaren w kieszeni, a build jak z kantyny. Warto było oszczędzać?`]);
  L.push([tiles <= 5 ? 58 : 0, `Zaledwie ${tiles} kafelków. Składasz tego kurczaka na gwoździe i ślinę.`]);
  L.push([(r.hp * 100 < (S.maxHp || 1) * 55) ? 72 : 0, `Z ${r.hp} życia chcesz się ze mną bić? Odważnie. Głupio, ale odważnie.`]);
  L.push([10, 'Ten build wygląda jak pomysł stażysty po trzech kawach.']);
  L.push([8, 'Widziałam lepsze kafelki na dnie kosza z odpadami.']);
  L.sort((a, b) => b[0] - a[0] || a[1].length - b[1].length);
  return L[0][1];
}

// ---------- Pojedynek dla 2 osób ----------
export const DUEL_NO_AGREE_BURNER = 'Nie zgodziliście się co do palnika, więc będzie najgorętszy: palnik 5.';
export const DUEL_NO_AGREE_CHAR = 'Nie mogliście się zdecydować… więc została tylko padlina.';
export const DUEL_PROMISE_BIG = 'Kurczak obiecał podwyżki… po nowym roku.';
export const DUEL_PROMISE_SMALL = '(Nagrody za wygranie zostaną wypłacone w Ziarnach na podsumowaniu rocznym firmy.)';
