// Bulgot: warstwa fabularna klienta (radiowęzeł Korporacji i interkom Prezesa Rosołowskiego).
// Tylko obraz: nic stąd nie wpływa na silnik, ofertę ani wynik. Teksty zatwierdzone w propozycje-fabula/teksty.md.

// Radiowęzeł na przemian z Kronikarzem, po 15 komunikatów na strefę (indeks strefy jak w OFFER_LINES).
export const RADIO = [
  [
    'Dzień dobry. Przypominamy, że drób to nasz największy atut. Zwłaszcza w wywarze.',
    'Ogłoszenie: kurnik jest zamknięty z powodu opróżnienia.',
    'Nowych pracowników prosimy o nieopuszczanie taśmy. Taśma opuści ich sama.',
    'Znaleziono ziarno. Właściciel może je odebrać po złożeniu wniosku w trzech egzemplarzach.',
    'Szkolenie BHP odbędzie się w garnku. Obecność obowiązkowa, przeżycie opcjonalne.',
    'Kolejka do awansu: 4812 osób. Przewidywany czas oczekiwania: do rosołu.',
    'Przypominamy: ucieczka z miejsca pracy jest traktowana jako nieusprawiedliwiona nieobecność.',
    'Komunikat techniczny: kogut z dachu został zwolniony. Poranek odwołany.',
    'Pierze z szatni można odbierać do końca tygodnia. Pierze nie podlega zwrotowi.',
    'Pogoda na podwórzu: słonecznie. Pogoda w kotle: gorąco.',
    'Dział Kadr szuka ochotnika do testu nowej chochli. Ochotnik zostanie wyznaczony.',
    'Przypominamy o zakazie rozmów o wyjściu. Wyjście nie istnieje. Dziękujemy.',
    'Dzisiejsza zupa jest z pracownika, który wczoraj składał skargę. Smacznego.',
    'W razie pożaru ratujemy najpierw dokumentację, potem kadrę, a na końcu was.',
    'Pisklęta nie są pracownikami, tylko surowcem. Prosimy nie składać skarg w ich imieniu.',
  ],
  [
    'Chłodnia pracuje pełną parą. Prosimy o ubranie się w pióra.',
    'W magazynie pasz wykryto pasze. Prosimy zachować spokój.',
    'Wózek widłowy ma pierwszeństwo. Zawsze. Nawet na wolnym.',
    'Audyt wykazał niedobór ziarna. Winnych szukamy wśród ziarna.',
    'Awaria ogrzewania. Rosół nie jest dotknięty.',
    'Pracownik miesiąca: nikt. Pracownik poprzedniego miesiąca: również nikt.',
    'Wywieszono nowy regulamin. 400 punktów. Punkt pierwszy: nie czytać regulaminu.',
    'Dział Zakupów informuje, że kupił jeszcze więcej garnków.',
    'W ramach ćwiczeń przeciwpożarowych prosimy o spłonięcie w wyznaczonym miejscu.',
    'Konkurs na usprawnienie pracy. Nagroda: pomysł zostanie wdrożony. Bez nagrody.',
    'Jajka na taśmie nie są własnością pracownika. Pracownik także nie.',
    'W chłodni zaginął stażysta. Zgłoszenia przyjmuje chłodnia.',
    'Zdrowie psychiczne pracowników jest dla nas priorytetem. Priorytety są u nas na dole listy.',
    'W chłodni znaleziono zamarzniętego pracownika z uśmiechem. Prosimy o taki sam entuzjazm.',
    'Pracownicy narzekają na zimno. Rozważamy rozwiązanie: wyższą temperaturę w garnku.',
  ],
  [
    'Zarząd zaprasza na spotkanie. Spotkanie można było załatwić mailem. Zarząd lubi spotkania.',
    'Wyniki kwartalne są znakomite. Bulgotanie wzrosło o 14%.',
    'Winda jest tylko dla kadry. Schody również.',
    'W ramach synergii łączymy dział Jaj z działem Rosołu. Jaja prosimy o zachowanie spokoju.',
    'Szkolenie z komunikacji: słuchamy, kiwamy głową, zostajemy w garnku.',
    'Zarząd zapewnia, że nikt nie zostanie zwolniony. Zostaną przetworzeni.',
    'Znaleziono czapkę z napisem „Pracownik miesiąca”. Właściciel nie zgłasza się.',
    'Cennik rosołu został podwyższony. Pracownicy bez zmian: nadal darmowi.',
    'Na wyższych piętrach wykryto nieautoryzowanego kurczaka. Nie wpuszczać. Szybko.',
    'Prezes prosi o niezakłócanie mu ciszy i o niewchodzenie.',
    'Bar kawowy nieczynny. Kawa jest. Zarząd jest. Czynny jest tylko on.',
    'Garnek czeka. Garnek zawsze czeka. Garnek jest cierpliwy.',
    'Szkolenie z wypalenia zawodowego prowadzi kocioł nr 1, nasz najlepszy specjalista od wypalenia.',
    'Prezes ma nowy zegarek, a wy macie nowy regulamin. Różnica: zegarek ma wartość.',
    'Prezes zapewnia, że życie pracowników jest dla niego bezcenne. Cennik w recepcji.',
  ],
];

// Wtrącenia Prezesa do radiowęzła (tylko strefa 3).
export const PREZES_WTRACENIA = [
  'Tu Prezes. Słyszę kroki. Proszę wejść. Proszę nie wchodzić. Proszę wejść.',
  'Doszły mnie słuchy, że ktoś wspina się po moich schodach. Schody są moje. Rachunki też.',
  'Prezes do pracownika: spokojnie, nie ma pośpiechu. Rosół też się nie spieszy.',
  'Świetnie sobie radzisz. Z pewnością dostaniesz awans. Do garnka.',
  'Prezes pyta: co ty tu właściwie robisz? Pytanie retoryczne. Odpowiedź: rosół.',
  'Tu Prezes. Ktoś zostawił w moim gabinecie ślad dzioba. Podejrzewam, że to ktoś odważny.',
  '(trzask) …on nie jest taki jak inni. Przygotować drugi garnek. (trzask)',
  'Tu Prezes. Jeśli to słyszysz, jesteś już bardzo blisko. Zapraszam. Mam ofertę.',
];

// Interkom Prezesa przed bossem (klucz: id bossa z BOSSES).
export const PREZES_INTERKOM = {
  brojler: 'Dyrektorze Zdzisławie, mamy pewnego kurczaka. Proszę rozwiązać problem. Najlepiej z sosem.',
  skubarka: 'Skubarko, rozumiem, że jest pani zmęczona. Proszę jednak pamiętać, że premia zależy od liczby piór.',
  prezes: 'Witaj. Usiądź. Nie siadaj, i tak nie dasz rady. Zaczynamy spotkanie.',
};

const OFF = Math.floor(Math.random() * 1000); // przesunięcie puli na jedno wczytanie strony (tylko wygląd)

// Radiowęzeł co drugie zwykłe piętro. Zwraca { text, prezes } albo null (wtedy mówi Kronikarz).
export function radioLine(zone, round) {
  if (round % 2 !== 0) return null;
  const pool = RADIO[zone]; if (!pool) return null;
  const k = round / 2;
  if (zone === 2 && k % 3 === 0) return { text: PREZES_WTRACENIA[(k / 3 + OFF) % PREZES_WTRACENIA.length], prezes: true };
  return { text: pool[(k + OFF) % pool.length], prezes: false };
}

// ---------- Zakończenie: oferta Prezesa po pokonaniu, epilogi i teczki postaci ----------
export const OFERTA = {
  po: 'To… nieregulaminowe. Zapiszę w protokole, że to była moja inicjatywa.',
  oferta: 'Muszę przyznać, że jestem pod wrażeniem. Zostań moim zastępcą. Pensja: dwa ziarna miesięcznie, plus nieograniczony dostęp do garnka.',
  ucieczka: 'Rozumiem. Nikt nigdy nie ucieka z rosołu. Ale jeśli się uda, proszę zostawić wolne stanowisko.',
  awans: 'Doskonale. Tam na taśmie czeka pański pierwszy podwładny. Proszę go zagotować.',
};
export const AWANS_WSPOLNY = 'Prezes uścisnął skrzydło. Nowy prezes dostał gabinet, krawat i listę pracowników do przetworzenia.';
export const STOPKA = {
  ucieczka: 'Ta wiadomość jest poufna. Jeśli ją czytasz, uciekłeś.',
  awans: 'Ta wiadomość jest poufna. Jeśli ją czytasz, jesteś w Zarządzie. Gratulacje i kondolencje.',
};
// Teczka pracownicza (ekran wyboru postaci) i dwa epilogi; klucz: id postaci z CHARS (tylko aktywne).
export const TECZKI = {
  pyrtek: { stan: 'Pisklę (bez stanowiska)', staz: 'jedna noc', powod: 'wypadł z ciężarówki i chce odzyskać kurnik',
    ucieczka: 'Pyrtek wyprowadził cały kurnik za bramę, jedno pisklę po drugim. Kronikarz zapisał: „Od tej pory na podwórzu pachnie tylko sianem”.',
    awans: 'Pierwsze zarządzenie Pyrtka: na każdym piętrze ma być okno. Reszta spraw poczeka na ziarno.' },
  zjarany: { stan: 'Pracownik Nocny', staz: 'nikt nie liczy', powod: 'wszedł przez pomyłkę, myślał, że to ogród',
    ucieczka: 'Zjarany wyszedł na łąkę i godzinę patrzył w niebo. Chmura też patrzyła. Obaj uznali, że to było dobre piętro.',
    awans: 'Zarząd zebrał się na posiedzenie. Po godzinie zauważył, że prezes nie wrócił z balkonu.' },
  barista: { stan: 'Barista Zarządu', staz: '3 lata bez przerwy na kawę', powod: 'Prezes zamówił kawę z mlekiem. Mleko to jajka.',
    ucieczka: 'Otworzył kawiarnię na skraju łąki. Menu: kawa, ziarno i święty spokój.',
    awans: 'Wprowadził reformę: spotkania tylko po espresso. Efektywność wzrosła, serca też.' },
  ges: { stan: 'Dział Rozliczeń', staz: '11 lat', powod: 'policzyła, ile rosołu wychodzi z jednego kurczaka',
    ucieczka: 'Wyniosła księgi i zgłosiła Korporację do urzędu skarbowego. Brama otworzyła się sama, z powodu zajęcia komorniczego.',
    awans: 'Pierwszy ruch: audyt. Drugi: zwolnienie audytora. Trzeci: premia dla siebie.' },
  rzeznik: { stan: 'Dział Skubania', staz: '7 lat', powod: 'ma osobiste rachunki z Prezesem',
    ucieczka: 'Odwiesił fartuch na gwóźdź przy bramie. Pierwszy raz od lat nikt nie nazwał go rzeźnikiem. Przez chwilę czuł się kurą.',
    awans: 'Obiecał, że nikt nie trafi do garnka. Zawsze dodawał: „dopóki dobrze pracuje”.' },
  gigachad: { stan: 'Artysta cyrkowy (zatrudniony omyłkowo)', staz: 'jeden pokaz', powod: 'pomylił piętro z areną',
    ucieczka: 'Wyjechał przez bramę na jednym kole i nie zatrzymał się do samej łąki. Podobno nadal jedzie.',
    awans: 'Zarządzenie numer jeden: windy zastąpiono monocyklami. Pierwszy wypadek: godzinę później.' },
  jajeczko: { stan: 'Jajko Wzorcowe, Sortownia', staz: 'od zniesienia', powod: 'ma 3 punkty życia i dużo do udowodnienia',
    ucieczka: 'Przetoczył się przez bramę ostrożnie jak nigdy. Na łące położył się w trawie i pierwszy raz w życiu nie bał się upadku.',
    awans: 'Siedzi w gabinecie na poduszce i podpisuje dokumenty bardzo ostrożnie.' },
  emeryt: { stan: 'Starszy Specjalista ds. Wszystkiego', staz: '41 lat', powod: '„za moich czasów to się nazywało kurnik”',
    ucieczka: 'Wyszedł za bramę, rozejrzał się i stwierdził, że za jego czasów łąka była zieleńsza. Mimo to został do wieczora.',
    awans: 'Pierwsze zarządzenie: wszystko jak za moich czasów. Cofnięto fabrykę do poprzedniego roku.' },
  sanepid: { stan: 'Inspektor kontroli', staz: 'jedna kontrola (trwa już 6 lat)', powod: 'nie dostał pokwitowania',
    ucieczka: 'Opieczętował bramę od zewnątrz. Fabryka zamknięta do odwołania, a Inspektor wystawił sobie pokwitowanie.',
    awans: 'Pierwszą kontrolę przeprowadził w gabinecie prezesa. Znalazł wszystko, czego szukał, i jeszcze więcej.' },
  wanda: { stan: 'Dział Jaj', staz: '5 lat (2 złote jaja dziennie)', powod: 'zatrzymała ostatnie złote jajo',
    ucieczka: 'Zniosła ostatnie złote jajo już na łące i nikomu go nie oddała. Zarząd dostał od niej pocztówkę.',
    awans: 'Złote jajko stało się jednostką rozliczeniową. Inflacja skoczyła o dwie kury.' },
  zwiazkowiec: { stan: 'Przewodniczący Komisji Zakładowej', staz: '9 lat i 2 strajki', powod: 'pilnuje, żeby nikt nie pracował',
    ucieczka: 'Wyszedł, zwołał wiec na łące i ogłosił koniec zmiany. Tym razem zgodzili się wszyscy, nawet traktor.',
    awans: 'Pierwsze zarządzenie: strajk. Poparli go pracownicy, zarząd i prezes, który strajkował sam przeciw sobie.' },
  pacyfista: { stan: 'Specjalista ds. Pokoju', staz: 'od ogłoszenia', powod: 'nikogo nie chciał skrzywdzić, ale nie chciał też być zupą',
    ucieczka: 'Przeszedł przez fabrykę, nikogo nie uderzywszy. Na łące uścisnął dłoń pierwszemu lisowi. Lis się wahał.',
    awans: 'Zamknął garnek i otworzył świetlicę. Podobno jest zupa, ale tylko pomidorowa.' },
};

// ---------- Intro (plansze z kamerą, narrator: Kronikarz) ----------
export const INTRO_PLANSZE = [
  'Zapisano, że Korporacja Rosołowa kochała swój drób. Szczególnie w garnku.',
  'Wchodziło się tu na własnych nogach. Wychodziło się zwykle w słoiku.',
  'W kotłach nic się nie marnowało. Korporacja liczyła wszystko, nawet bulgotanie.',
  'A na szczycie, za szkłem, siedział Prezes Rosołowski i patrzył w dół. Z apetytem.',
  'Przed bohaterem schody, a na ich końcu wyjście. W dziobie ziarno, w głowie plan.',
];
// Skrócona wersja przy kolejnych runach (jedno zdanie).
export const INTRO_KROTKIE = [
  'Znów brama Korporacji. Kronikarz poprawił okulary.',
  'Znów kołowrotek. Znów ci sami strażnicy. Znów inny bohater.',
  'Garnek już bulgocze. Ale wejście jest otwarte.',
];

// ---------- Porażka: „Pracownik nr N” i ślady poprzednika ----------
export const PORAZKA_STREFA = [
  [
    'Kurnik jeszcze pachnie sianem, a kocioł już pachnie tobą.',
    'Nie dotarłeś nawet do magazynu. Kocioł jest zaskoczony szybkością dostawy.',
    'Zasada pierwsza: nie wchodzić. Zasada druga: nie zostawać. Opcja trzecia: rosół.',
  ],
  [
    'Chłodnia dobrze konserwuje. Rosół też.',
    'Zabrakło ziarna, zabrakło dziobu. Magazyn wyceni resztki.',
    'Doszedłeś dalej niż większość. Garnek uznał to za wyróżnienie.',
  ],
  [
    'Byłeś tak blisko biura, że czułeś kawę. Kocioł czuł ciebie.',
    'Prezes słyszał twoje kroki i szum wody w garnku. Zgadnij, który był głośniejszy.',
    'Ostatnie piętra nie są dla niezdecydowanych. Garnek podziwia konsekwencję.',
  ],
];
export const PORAZKA_BOSS = [
  'Boss wygrał. Rosół podano z komentarzem.',
  'Dyrektor działu dziękuje za współpracę. Pracownik już nie dziękuje.',
];
// Ostrzejsze puenty, do puli w każdej strefie.
export const PORAZKA_OSTRE = [
  'Kocioł dziękuje za dostawę. Kocioł nie ma uwag.',
  'Pracownik zakończył współpracę. Pozostałości zostaną zagospodarowane.',
  'Rodzina nie zostanie powiadomiona. Rodzina jest w sąsiednim garnku.',
];
// Linia „Pracownik nr N…” plus puenta; pula strefy + ostre (+ stare linie Kronikarza, jeśli podane), wybór po ziarnie `seed`.
export function porazkaTekst({ n, floor, zone, boss, seed = 0, extra = [] }) {
  const pool = boss ? [...PORAZKA_BOSS, ...PORAZKA_OSTRE] : [...(PORAZKA_STREFA[zone] || PORAZKA_STREFA[0]), ...PORAZKA_OSTRE, ...extra];
  return [`Pracownik nr ${n} zakończył współpracę na piętrze ${floor}.`, pool[Math.abs(seed) % pool.length]];
}
// Ślady poprzednika w radiowęźle (po śmierci w poprzednim runie): n = numer pracownika, p = piętro, who = nazwa postaci.
export const SLADY = [
  d => `Dział Kadr: pracownik nr ${d.n} nie wrócił z piętra ${d.p}. Prosimy go nie szukać.`,
  d => `Znaleziono czapkę po poprzedniku z piętra ${d.p}. Poprzednik jej już nie potrzebuje.`,
  d => `Przypominamy o pozostałościach po poprzedniku z piętra ${d.p}. Prosimy ich nie jeść.`,
  d => `Poprzednik zostawił notatkę z piętra ${d.p}: „Tam jest gorąco”. Dziękujemy za uwagę.`,
  d => `Zespół sprzątający prosi o niewchodzenie na piętro ${d.p}. Jeszcze się odparza.`,
  d => `Pracownik ${d.who} nie wrócił z piętra ${d.p}. Garnek zgłasza zadowolenie.`,
  d => `Po ${d.who} na piętrze ${d.p} zostały tylko pióra i niezapłacone faktury.`,
  d => `Wspominamy: ${d.who}, piętro ${d.p}. Wspominamy krótko, bo w garnku jest jeszcze miejsce.`,
];
export const sladLine = d => SLADY[(d.n | 0) % SLADY.length](d);
