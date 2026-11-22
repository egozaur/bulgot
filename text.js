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
  quick: { name: 'Zupka Chińska', rounds: 10, text: '10 pięter, dwóch bossów, ok. 10 minut. Szybka, zalewana wrzątkiem.' },
  full: { name: 'Bulion Babci', rounds: 20, text: '20 pięter, trzech bossów, ok. 20 minut. Gotuje się długo, smakuje najlepiej.' },
};

// Regeneracja jest liczona w dziesiątych częściach Życia na sekundę (10 = 1 / s).
export const fmtRegen = v => String(Math.round(v) / 10).replace('.', ',');

export const STAT_LABELS = [
  ['maxHp', 'Życie'], ['atk', 'Atak'], ['aspd', 'Szybkość ataku', v => (v / 100).toFixed(2).replace('.', ',') + ' / s'], ['armor', 'Pancerz'],
  ['crit', 'Kurza Fortuna', v => v + '%'], ['evade', 'Unik', v => v + '%'], ['regen', 'Regeneracja', v => fmtRegen(v) + ' / s'], ['luck', 'Szczęście'],
];

export const HELP = [
  ['Cel', 'Wejdź na szczyt fabryki rosołu: pokonaj wszystkie piętra i Prezesa Rosołu. W trybie szybkim to 10 pięter, w pełnym 20.'],
  ['Jedna runda', 'Wybierasz jeden z czterech kafelków, potem następuje walka. Po wygranej dostajesz Ziarna i odzyskujesz część życia.'],
  ['Kafelki', 'Statystyki, umiejętności aktywne, przedmioty z synergią i ryzykowne wydarzenia. Przedmioty z jednego zestawu (Jajeczne, Zbożowe, Rambo, Rosołowe, Chłodnicze, Korporacyjne) dają bonusy od 2, 3 i 4 sztuk.'],
  ['Poziomy statystyk', 'Każda statystyka ma trzy poziomy zwykłe (plakietka I, II, III) i legendarny (★). Trzy takie same kafelki poziomu 1 lub 2 zlejesz za darmo w jeden wyższego poziomu (przycisk „Zlej kafelki”, klawisz U). Legendarne statystyki wypadają tylko z bossów: po każdym bossie (poza Prezesem) wybierasz 1 z 3.'],
  ['Efekty', 'Oparzenie i Salmonella zadają obrażenia co sekundę i kumulują się (Salmonella przechodzi na kolejnego wroga po śmierci nosiciela). Mróz spowalnia, a 5 stosów zamraża wroga. Krwawienie kumuluje się do 3 stosów. Ikonki ze stosami widać nad paskiem życia wroga.'],
  ['Mutacje', 'Druga kopia umiejętności daje poziom 2 (+30% mocy, krótszy cooldown). Trzecia kopia to Mutacja: wybierasz jedną z dwóch gałęzi, która na stałe zmienia działanie umiejętności.'],
  ['Wylęgarnia', 'Niektóre pary przedmiotów wykluwają legendarny przedmiot (znacznik „Wylęgarnia!” na karcie). Każde 3 kopie tej samej statystyki dają dodatkową premię (np. 3× Ziarno Mocy = Kolba Mocy). Odkryte przepisy są w Księdze Kurnika.'],
  ['Odznaki', 'Za pokonanie bossa albo elitarnego wroga wybierasz Odznakę Pracowniczą: stały bonus do końca runu. Elity mają cechy (np. Wampiryczny, Wybuchowy), które widać w podglądzie piętra (od Garnka 1 dopiero w walce).'],
  ['Piętra', 'Zwykłe piętra mają szablony: Czempion (jeden wróg z +80% Życia), Rój (trzech osłabionych), Zwiad (wróg z następnej strefy) i Para (dwa gatunki, które się wspierają). Na Garnku 0 podgląd pokazuje wrogów i szablon. Od Garnka 1 szyba jest zaparowana: dowiesz się dopiero w walce. Bossów zapowiada pasek pięter.'],
  ['Reakcje', 'Dwa różne efekty na jednym wrogu łączą się w reakcję. Oparzenie + Mróz = Szok Termiczny (wybuch zależny od stosów), Salmonella + Krwawienie = Gorączka (efekty bolą mocniej, a śmierć zaraża resztę), Mróz + Krwawienie = Kruchość (następne trafienie jest krytyczne). Odkryte reakcje trafiają do Księgi Kurnika.'],
  ['Seria (Okno Gdakania)', 'Umiejętność użyta do 1,5 s po poprzedniej trafia mocniej: druga w serii +20%, trzecia +50%. Trzy różne umiejętności w jednej serii to Pełna Kurza Seria: wszyscy wrogowie wpadają w Popłoch (ogłuszenie na 1 s). Czasem warto przytrzymać umiejętność i odpalić wszystko naraz.'],
  ['Rozwidlenie Korytarza', 'Na niektórych piętrach (znak drzwi na pasku pięter) wybierasz drzwi. Zwykłe prowadzą na spokojne piętro. Za drzwiami „Tylko dla personelu” pierwszy wróg ma cechę elity i jest dużo silniejszy, ale nagroda to dodatkowe Ziarna albo wybór 1 z 3 rzadkich kafelków.'],
  ['Lombard Lisa', 'Przed wyborem kafelka możesz zastawić u Lisa jeden kafelek z budowy (nie umiejętność) i od razu dostać jego pełną cenę w Ziarnach. Wykupisz go tylko na następnym piętrze, za 150% ceny. Jeśli nie wykupisz, Lis zatrzymuje kafelek, a wszystkie Lisy Windykatory w tym runie są o 25% silniejsze.'],
  ['Odsetki w Spiżarni', 'Po każdej wygranej walce dostajesz +1 Ziarno za każde 10 niewydanych Ziaren, najwyżej +3 (Kaczor Hazardzista +5). Oszczędzanie też jest strategią.'],
  ['Okólniki Zarządu', 'Każda strefa fabryki ma własny okólnik, który zmienia zasady (np. Audyt Wydatków: darmowe rerolle, droższe dokupowanie). Bieżący okólnik widać nad ofertą i na górnym pasku. W każdym runie okólniki są inne.'],
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
];

// Wybór deterministyczny (ta sama runda, ta sama linia).
// Rozwidlenie Korytarza i Awans Wroga.
export const DOOR_LINES = [
  'Korytarz rozwidlał się. Jedne drzwi skrzypiały zwyczajnie, drugie nosiły napis „Tylko dla personelu”.',
  'Z lewej pachniało spokojem, z prawej premią i kłopotami.',
  'Kronikarz zawahał się. Pyrtek nie.',
];
export const NEMESIS_LINES = [
  'Pamiętasz go? On ciebie pamięta. Awansował na twoich piórach.',
  'Czas wyrównać rachunki. Z odsetkami.',
];
export const pickLine =(arr, n) => arr[Math.abs(n | 0) % arr.length];
