# Teksty fabuły Bulgota do akceptacji (etap 0)

Wielki Kurczak ocenia ton i poprawia. Dopiero po akceptacji zaczyna się kod.
Wszystko jest spójne z tym, co już jest w grze (`text.js`): **Korporacja Rosołowa S.A.**, **Prezes Rosołu**, narrator **Kronikarz** (epicka powaga, absurdalna treść), Kurnik Pod Dębem.

## 0. Co już jest w grze, a co dokładamy
| Element | Teraz | Po zmianie |
|---|---|---|
| Intro | okno z 3 zdaniami „Zaczynamy” (`INTRO`) | animowana scena z kamerą, te same fakty (sekcja 1) |
| Linie przed wyborem kafelka | Kronikarz, 6 na strefę (`OFFER_LINES`) | zostają, dochodzi radiowęzeł (sekcja 2); pytanie A poniżej |
| Bossowie | cytat Kronikarza (`BOSS_INTRO`) | dochodzi 1 zdanie Prezesa przez interkom (sekcja 3) |
| Wygrana | `END_WIN`, 2 zdania Kronikarza | oferta awansu + epilog postaci (sekcje 3, 4) |
| Porażka | `LOSE_LINES`, 1 zdanie | scena „Pracownik nr N” + puenta wg strefy (sekcja 5) |

**Rozstrzygnięte:** radiowęzeł zmienia się z liniami Kronikarza; Prezes ma nazwisko Rosołowski (szczegóły na dole).

---

## 1. Intro (5 plansz, mówi Kronikarz)
Kamera jedzie od bramy do biura. `{bohater}` to imię wybranej postaci (Pyrtek, Wanda itd.).

1. *(brama, napis „Korporacja Rosołowa S.A. Każdy pracownik jest ważny”)* „Zapisano, że Korporacja Rosołowa kochała swój drób. Szczególnie w garnku.”
2. *(kołowrotek, taśma z jajkami)* „Wchodziło się tu na własnych nogach. Wychodziło się zwykle w słoiku.”
3. *(kotły z parą)* „W kotłach nic się nie marnowało. Korporacja liczyła wszystko, nawet bulgotanie.”
4. *(przeszklone biuro, sylwetka Prezesa)* „A na szczycie, za szkłem, siedział Prezes Rosołowski i patrzył w dół. Z apetytem.”
5. *(drzwi „Wyjście tylko dla Zarządu”)* „Przed bohaterem schody, a na ich końcu wyjście. W dziobie ziarno, w głowie plan.” *(wdrożone bez imienia, bo czasowniki są rodzajowe i nie pasują do każdej postaci)*

**Skrócona wersja przy kolejnych runach** (jedno zdanie, losowe):
- „Znów brama Korporacji. Kronikarz poprawił okulary.”
- „Znów kołowrotek. Znów ci sami strażnicy. Znów inny bohater.”
- „Garnek już bulgocze. Ale wejście jest otwarte.”

---

## 2. Radiowęzeł („Głos Korporacji”)
Komunikat jest o piętro, losowany z puli strefy. Prefiks: „📢”.

### Strefa 1 (Kurnik i Podwórze)
1. „Dzień dobry. Przypominamy, że drób to nasz największy atut. Zwłaszcza w wywarze.”
2. „Ogłoszenie: kurnik jest zamknięty z powodu opróżnienia.”
3. „Nowych pracowników prosimy o nieopuszczanie taśmy. Taśma opuści ich sama.”
4. „Znaleziono ziarno. Właściciel może je odebrać po złożeniu wniosku w trzech egzemplarzach.”
5. „Szkolenie BHP odbędzie się w garnku. Obecność obowiązkowa, przeżycie opcjonalne.”
6. „Kolejka do awansu: 4812 osób. Przewidywany czas oczekiwania: do rosołu.”
7. „Przypominamy: ucieczka z miejsca pracy jest traktowana jako nieusprawiedliwiona nieobecność.”
8. „Komunikat techniczny: kogut z dachu został zwolniony. Poranek odwołany.”
9. „Pierze z szatni można odbierać do końca tygodnia. Pierze nie podlega zwrotowi.”
10. „Pogoda na podwórzu: słonecznie. Pogoda w kotle: gorąco.”
11. „Dział Kadr szuka ochotnika do testu nowej chochli. Ochotnik zostanie wyznaczony.”
12. „Przypominamy o zakazie rozmów o wyjściu. Wyjście nie istnieje. Dziękujemy.”
13. 🔥 „Dzisiejsza zupa jest z pracownika, który wczoraj składał skargę. Smacznego.”
14. 🔥 „W razie pożaru ratujemy najpierw dokumentację, potem kadrę, a na końcu was.”
15. 🔥 *(moja propozycja uzupełniająca)* „Przypominamy, że pisklęta nie są pracownikami, tylko surowcem. Prosimy nie składać skarg w ich imieniu.”

### Strefa 2 (Magazyn Pasz i Chłodnia)
1. „Chłodnia pracuje pełną parą. Prosimy o ubranie się w pióra.”
2. „W magazynie pasz wykryto pasze. Prosimy zachować spokój.”
3. „Wózek widłowy ma pierwszeństwo. Zawsze. Nawet na wolnym.”
4. „Audyt wykazał niedobór ziarna. Winnych szukamy wśród ziarna.”
5. „Awaria ogrzewania. Rosół nie jest dotknięty.”
6. „Pracownik miesiąca: nikt. Pracownik poprzedniego miesiąca: również nikt.”
7. „Wywieszono nowy regulamin. 400 punktów. Punkt pierwszy: nie czytać regulaminu.”
8. „Dział Zakupów informuje, że kupił jeszcze więcej garnków.”
9. „W ramach ćwiczeń przeciwpożarowych prosimy o spłonięcie w wyznaczonym miejscu.”
10. „Konkurs na usprawnienie pracy. Nagroda: pomysł zostanie wdrożony. Bez nagrody.”
11. „Jajka na taśmie nie są własnością pracownika. Pracownik także nie.”
12. „W chłodni zaginął stażysta. Zgłoszenia przyjmuje chłodnia.”
13. 🔥 „Zdrowie psychiczne pracowników jest dla nas priorytetem. Priorytety są u nas na dole listy.”
14. 🔥 „W chłodni znaleziono zamarzniętego pracownika z uśmiechem. Prosimy o taki sam entuzjazm w pracy.”
15. 🔥 „Pracownicy narzekają na zimno. Rozważamy rozwiązanie: wyższą temperaturę w garnku.”

### Strefa 3 (Sortownia Jaj i Biuro Zarządu)
1. „Zarząd zaprasza na spotkanie. Spotkanie można było załatwić mailem. Zarząd lubi spotkania.”
2. „Wyniki kwartalne są znakomite. Bulgotanie wzrosło o 14%.”
3. „Winda jest tylko dla kadry. Schody również.”
4. „W ramach synergii łączymy dział Jaj z działem Rosołu. Jaja prosimy o zachowanie spokoju.”
5. „Szkolenie z komunikacji: słuchamy, kiwamy głową, zostajemy w garnku.”
6. „Zarząd zapewnia, że nikt nie zostanie zwolniony. Zostaną przetworzeni.”
7. „Znaleziono czapkę z napisem «Pracownik miesiąca». Właściciel nie zgłasza się.”
8. „Cennik rosołu został podwyższony. Pracownicy bez zmian: nadal darmowi.”
9. „Uwaga: na wyższych piętrach wykryto nieautoryzowanego kurczaka. Prosimy go nie wpuszczać. Szybko.”
10. „Prezes prosi o niezakłócanie mu ciszy i o niewchodzenie.”
11. „Bar kawowy nieczynny. Kawa jest. Zarząd jest. Czynny jest tylko on.”
12. „Garnek czeka. Garnek zawsze czeka. Garnek jest cierpliwy.”
13. 🔥 „Szkolenie z wypalenia zawodowego prowadzi kocioł nr 1, nasz najlepszy specjalista od wypalenia.”
14. 🔥 „Prezes ma nowy zegarek, a wy macie nowy regulamin. Różnica: zegarek ma wartość.”
15. 🔥 *(moja propozycja uzupełniająca)* „Prezes zapewnia, że życie pracowników jest dla niego bezcenne. Cennik w recepcji.”

### Wtrącenia Prezesa (w strefie 3, ok. co piąty komunikat; prefiks „📢 Z gabinetu:”)
1. „Tu Prezes. Słyszę kroki. Proszę wejść. Proszę nie wchodzić. Proszę wejść.”
2. „Tu Prezes. Doszły mnie słuchy, że ktoś wspina się po moich schodach. Schody są moje. Rachunki też.”
3. „Prezes do pracownika: spokojnie, nie ma pośpiechu. Rosół też się nie spieszy.”
4. „Świetnie sobie radzisz. Z pewnością dostaniesz awans. Do garnka.”
5. „Prezes pyta: co ty tu właściwie robisz? Pytanie retoryczne. Odpowiedź: rosół.”
6. „Tu Prezes. Ktoś zostawił w moim gabinecie ślad dzioba. Podejrzewam, że to ktoś odważny.”
7. „(trzask) …on nie jest taki jak inni. Przygotować drugi garnek. (trzask)”
8. „Tu Prezes. Jeśli to słyszysz, jesteś już bardzo blisko. Zapraszam. Mam ofertę.” *(zapowiedź awansu)*

### Ślady poprzednika (po śmierci w poprzednim runie; `{n}` numer pracownika, `{p}` piętro)
1. „Dział Kadr: pracownik nr {n} nie wrócił z piętra {p}. Prosimy go nie szukać.”
2. „Znaleziono czapkę po poprzedniku z piętra {p}. Poprzednik jej już nie potrzebuje.”
3. „Przypominamy o pozostałościach po poprzedniku z piętra {p}. Prosimy ich nie jeść.”
4. „Poprzednik zostawił notatkę z piętra {p}: «Tam jest gorąco». Dziękujemy za uwagę.”
5. „Zespół sprzątający prosi o niewchodzenie na piętro {p}. Jeszcze się odparza.”
6. Wariant z postacią (`{postać}` to nazwa poprzedniej postaci): „Pracownik {postać} nie wrócił z piętra {p}. Garnek zgłasza zadowolenie.”
7. Wariant z postacią: „Po {postać} na piętrze {p} zostały tylko pióra i niezapłacone faktury.”
8. Wariant z postacią: „Wspominamy {postać}, który dotarł na piętro {p}. Wspominamy krótko, bo w garnku jest jeszcze miejsce.”

---

## 3. Prezes Rosołowski (interkom i finał)
Interkom przed bossem to jedno zdanie, w nakładce nad zwykłym cytatem Kronikarza.

- **Przed Brojlerem Zdzisławem:** „Dyrektorze Zdzisławie, mamy pewnego kurczaka. Proszę rozwiązać problem. Najlepiej z sosem.”
- **Przed Skubarką 3000:** „Skubarko, rozumiem, że jest pani zmęczona. Proszę jednak pamiętać, że premia zależy od liczby piór.”
- **Połowa trasy** (po pierwszym bossie): „Gratuluję przejścia pierwszego etapu. Pański awans został rozpatrzony negatywnie. Proszę kontynuować.”
- **Przed walką z Prezesem:** „Witaj. Usiądź. Nie siadaj, i tak nie dasz rady. Zaczynamy spotkanie.”
- **Po pokonaniu:** „To… nieregulaminowe. Zapiszę w protokole, że to była moja inicjatywa.”
- **Oferta awansu** (po walce): „Muszę przyznać, że jestem pod wrażeniem. Zostań moim zastępcą. Pensja: dwa ziarna miesięcznie, plus nieograniczony dostęp do garnka.”
  - Przycisk 1: **Uciekam**. Prezes: „Rozumiem. Nikt nigdy nie ucieka z rosołu. Ale jeśli się uda, proszę zostawić wolne stanowisko.”
  - Przycisk 2: **Przyjmuję awans**. Prezes: „Doskonale. Tam na taśmie czeka pański pierwszy podwładny. Proszę go zagotować.”

---

## 4. Teczki pracownicze i epilogi (12 aktywnych postaci)
Teczka na ekranie wyboru: **Stanowisko / Staż / Powód**. Epilog: jedno z dwóch zakończeń po ofercie (sekcja 3).
**Ucieczka** to epilog postaci (2 zdania). **Awans** to wspólny tekst „Witamy w Zarządzie” plus jedno zdanie postaci.
Wspólny tekst awansu: „Prezes uścisnął skrzydło. Nowy prezes dostał gabinet, krawat i listę pracowników do przetworzenia.”

| Postać | Stanowisko | Staż | Powód | Epilog: ucieczka | Epilog: awans (dopisek) |
|---|---|---|---|---|---|
| Pyrtek | Pisklę (bez stanowiska) | jedna noc | wypadł z ciężarówki i chce odzyskać kurnik | „Pyrtek wyprowadził cały kurnik za bramę, jedno pisklę po drugim. Kronikarz zapisał: «Od tej pory na podwórzu pachnie tylko sianem».” | „Pierwsze zarządzenie Pyrtka: na każdym piętrze ma być okno. Reszta spraw poczeka na ziarno.” |
| Zjarany Kurczak | Pracownik Nocny | nikt nie liczy | wszedł przez pomyłkę, myślał, że to ogród | „Zjarany wyszedł na łąkę i godzinę patrzył w niebo. Chmura też patrzyła. Obaj uznali, że to było dobre piętro.” | „Zarząd zebrał się na posiedzenie. Po godzinie zauważył, że prezes nie wrócił z balkonu.” |
| Kurczak Barista | Barista Zarządu | 3 lata bez przerwy na kawę | Prezes zamówił kawę z mlekiem. Mleko to jajka. | „Otworzył kawiarnię na skraju łąki. Menu: kawa, ziarno i święty spokój.” | „Wprowadził reformę: spotkania tylko po espresso. Efektywność wzrosła, serca też.” |
| Gęś Księgowa | Dział Rozliczeń | 11 lat | policzyła, ile rosołu wychodzi z jednego kurczaka | „Wyniosła księgi i zgłosiła Korporację do urzędu skarbowego. Brama otworzyła się sama, z powodu zajęcia komorniczego.” | „Pierwszy ruch: audyt. Drugi: zwolnienie audytora. Trzeci: premia dla siebie.” |
| Kogut Rzeźnik | Dział Skubania | 7 lat | ma osobiste rachunki z Prezesem | „Odwiesił fartuch na gwóźdź przy bramie. Pierwszy raz od lat nikt nie nazwał go rzeźnikiem. Przez chwilę czuł się kurą.” | „Obiecał, że nikt nie trafi do garnka. Zawsze dodawał: «dopóki dobrze pracuje».” |
| Kurczak Monocykl | Artysta cyrkowy (zatrudniony omyłkowo) | jeden pokaz | pomylił piętro z areną | „Wyjechał przez bramę na jednym kole i nie zatrzymał się do samej łąki. Podobno nadal jedzie.” | „Zarządzenie numer jeden: windy zastąpiono monocyklami. Pierwszy wypadek: godzinę później.” |
| Pan Jajeczko | Jajko Wzorcowe, Sortownia | od zniesienia | ma 3 punkty życia i dużo do udowodnienia | „Przetoczył się przez bramę ostrożnie jak nigdy. Na łące położył się w trawie i pierwszy raz w życiu nie bał się upadku.” | „Siedzi w gabinecie na poduszce i podpisuje dokumenty bardzo ostrożnie.” |
| Emeryt Janusz | Starszy Specjalista ds. Wszystkiego | 41 lat | „za moich czasów to się nazywało kurnik” | „Wyszedł za bramę, rozejrzał się i stwierdził, że za jego czasów łąka była zieleńsza. Mimo to został do wieczora.” | „Pierwsze zarządzenie: wszystko jak za moich czasów. Cofnięto fabrykę do poprzedniego roku.” |
| Inspektor Sanepid | Inspektor kontroli | jedna kontrola (trwa już 6 lat) | nie dostał pokwitowania | „Opieczętował bramę od zewnątrz. Fabryka zamknięta do odwołania, a Inspektor wystawił sobie pokwitowanie.” | „Pierwszą kontrolę przeprowadził w gabinecie prezesa. Znalazł wszystko, czego szukał, i jeszcze więcej.” |
| Nioska Wanda | Dział Jaj | 5 lat (2 złote jaja dziennie) | zatrzymała ostatnie złote jajo | „Zniosła ostatnie złote jajo już na łące i nikomu go nie oddała. Zarząd dostał od niej pocztówkę.” | „Złote jajko stało się jednostką rozliczeniową. Inflacja skoczyła o dwie kury.” |
| Kogut Związkowiec | Przewodniczący Komisji Zakładowej | 9 lat i 2 strajki | pilnuje, żeby nikt nie pracował | „Wyszedł, zwołał wiec na łące i ogłosił koniec zmiany. Tym razem zgodzili się wszyscy, nawet traktor.” | „Pierwsze zarządzenie: strajk. Poparli go pracownicy, zarząd i prezes, który strajkował sam przeciw sobie.” |
| Kurczak Pacyfista | Specjalista ds. Pokoju | od ogłoszenia | nikogo nie chciał skrzywdzić, ale nie chciał też być zupą | „Przeszedł przez fabrykę, nikogo nie uderzywszy. Na łące uścisnął dłoń pierwszemu lisowi. Lis się wahał.” | „Zamknął garnek i otworzył świetlicę. Podobno jest zupa, ale tylko pomidorowa.” |

---

## 5. Porażka: „Pracownik nr N”
Format ekranu: „Rosół gotowy. Pracownik nr **{n}** zakończył współpracę na piętrze **{p}**.” plus jedna puenta wg miejsca śmierci. Istniejące `LOSE_LINES` zostają jako dodatkowa pula.

**Strefa 1:**
- „Kurnik jeszcze pachnie sianem, a kocioł już pachnie tobą.”
- „Nie dotarłeś nawet do magazynu. Kocioł jest zaskoczony szybkością dostawy.”
- „Zasada pierwsza: nie wchodzić. Zasada druga: nie zostawać. Opcja trzecia: rosół.”

**Strefa 2:**
- „Chłodnia dobrze konserwuje. Rosół też.”
- „Zabrakło ziarna, zabrakło dziobu. Magazyn wyceni resztki.”
- „Doszedłeś dalej niż większość. Garnek uznał to za wyróżnienie.”

**Strefa 3:**
- „Byłeś tak blisko biura, że czułeś kawę. Kocioł czuł ciebie.”
- „Prezes słyszał twoje kroki i szum wody w garnku. Zgadnij, który był głośniejszy.”
- „Ostatnie piętra nie są dla niezdecydowanych. Garnek podziwia konsekwencję.”

**Przegrana z bossem:**
- „Boss wygrał. Rosół podano z komentarzem.”

**Ostrzejsze (do puli, każda strefa):**
- 🔥 „Kocioł dziękuje za dostawę. Kocioł nie ma uwag.”
- 🔥 *(moja propozycja uzupełniająca)* „Pracownik zakończył współpracę. Pozostałości zostaną zagospodarowane.”
- 🔥 *(moja propozycja uzupełniająca)* „Rodzina nie zostanie powiadomiona. Rodzina jest w sąsiednim garnku.”
- „Dyrektor działu dziękuje za współpracę. Pracownik już nie dziękuje.”

---

## Decyzje Wielkiego Kurczaka (2026-11-25)
- Radiowęzeł zmienia się z liniami Kronikarza (nie osobny pasek).
- Prezes ma nazwisko: **Prezes Rosołowski** (w grze dziś „Prezes Rosołu” w `BOSS_INTRO` i `END_WIN`; zmieniamy przy wdrożeniu).
- Ślady poprzednika mogą wymieniać nazwę postaci (warianty 6–8).
- Ostrzejsze teksty (🔥) na pograniczu dobrego smaku dodane do każdego segmentu. Wybrane przez Wielkiego Kurczaka: strefa 1 (2 z 4), strefa 2 (3 z 4), strefa 3 (2 z 4), porażka (1 z 4). Brakujące miejsca do trójki uzupełniłem własnymi propozycjami, oznaczonymi „moja propozycja uzupełniająca”, do skreślenia.
