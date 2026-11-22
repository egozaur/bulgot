# Bulgot: dokument projektowy v1

**Awans albo rosół.** Status (2026-11-21): zbudowane i działające lokalnie, jeszcze niewypchnięte na produkcję. Wersja do czytania na luzie: https://claude.ai/artifact/82mJq2YbL4SgTLxrtQ21iR. Liczby poniżej to wartości po strojeniu symulatorem (patrz „Wyniki balansu”). Roboczy tytuł z fazy projektu: „Droga do Chickena”.

Bulgot to przeglądarkowy roguelike dla jednej osoby: kurczak ucieka przez 20 pięter fabryki rosołu i po drodze rośnie z pisklaka w Rambo Chickena. Gra nr 1 na pl3y.pl, priorytet to przeglądarka na komputerze.

## Decyzje (15 pytań, 2026-11-21)

| Obszar | Decyzja |
|---|---|
| Styl | Kreskówkowy wektor (SVG/Canvas) |
| Ton | Epicka parodia |
| Walka | Auto-walka plus 1–3 aktywne umiejętności z cooldownem |
| Widok | Scena z boku |
| Kafelki | 4 do wyboru, reroll za monety (Ziarna) |
| Typy kafelków | Statystyki, umiejętności, przedmioty z synergią, ryzyko i wydarzenia |
| Postacie | Start jako Pyrtek, kolejne odblokowywane |
| Meta-progres | Tylko odblokowania (kafelki, postacie), bez stałych bonusów mocy |
| Długość | Tryb szybki (10 rund) i pełny (20 rund) |
| Tryby v1 | Solo z rankingiem (dzienny seed, co-op i pojedynki odłożone) |
| Bossowie | Unikalne mechaniki i fazy |
| Zapis | Na serwerze, wznawianie z innego komputera |
| Konta | Tylko zalogowani (nick + PIN) |
| Dźwięk | Efekty plus muzyka włączana w menu |
| Trudność | Poziomy odblokowywane po wygranej (Temperatura Garnka) |
| Nazwa | Bulgot (odgłos wrzącej wody), hasło „Awans albo rosół” |

## 1. Wizja i lore

**Opowieść.** Kurnik Pod Dębem żył spokojnie, aż do nocy, gdy Korporacja Rosołowa S.A. zabrała cały drób na Wielki Rosół. Pisklę Pyrtek wypadło z ciężarówki i zostało samo. Teraz musi wrócić do fabryki, przebić się przez 20 pięter i obalić Prezesa Rosołu, żeby uwolnić Kurnik.

**Ton.** Epicka parodia. Narrator, zwany Kronikarzem, opowiada o kurczakach jak o bohaterach eposu: powaga w formie, absurd w treści. Przykładowe linijki:

- „I oto Pyrtek wzniósł dziób ku niebu, a niebo odpowiedziało mu sufitem chłodni.”
- „Mówią, że Brojler Zdzisław nigdy nie spał. To nieprawda. Po prostu nikt nie widział go na urlopie.”
- „Padł Prezes, a z nim upadł cały cennik.”

| Strefa | Rundy (pełny) | Miejsce | Boss |
|---|---|---|---|
| I | 1–6 | Kurnik i Podwórze | Brojler Zdzisław, Szef Zmiany (runda 6) |
| II | 7–12 | Magazyn Pasz i Chłodnia | Skubarka 3000 (runda 12) |
| III | 13–20 | Sortownia Jaj i Biuro Zarządu | Prezes Rosołu (runda 20) |

Forma kurczaka zmienia się z postępem: Pyrtek (rundy 1–6), Kogut (7–12), Kogut Bojowy (13–16), Rambo Chicken (17–20). Tryb szybki ma 10 rund, dwóch bossów (Brojler Zdzisław w rundzie 5, Prezes Rosołu w rundzie 10) i strefy I oraz II we wrogach; Prezes zawsze urzęduje w strefie III.

## 2. Pętla rozgrywki

Jedna runda to wybór kafelka, walka i nagroda; po 20 takich rundach (w trybie szybkim po 10) run kończy się zwycięstwem albo porażką.

1. **Start runu:** tryb (szybki albo pełny), postać i poziom trudności.
2. **Oferta:** 4 kafelki, jeden bierzesz za darmo, a pozostałe możesz dokupić za Ziarna (zwykły 6, rzadki 12, epicki 20, legendarny 30; wydarzeń nie kupisz). Pierwsza oferta zawsze zawiera umiejętność. Reroll kosztuje 2 Ziarna, każdy kolejny w tej samej rundzie o 1 więcej (2, 3, 4…); w nowej rundzie cena wraca do 2.
3. **Walka:** 30–60 sekund, automatyczna z aktywnymi umiejętnościami klikanymi przez gracza.
4. **Nagroda:** 4 Ziarna za rundę, 6 za bossa; po walce leczenie 35% maks. Życia. Przed walką można za 4 Ziarna odpocząć (+20% życia, raz na rundę).
5. **Boss:** po bossie 1 i 2 dodatkowa oferta 3 kafelków rzadkich lub lepszych.
6. **Koniec:** porażka kończy run (Gniazdo Zapasowe może ją raz odwrócić), wynik trafia do rankingu.

Oferta nigdy nie ma 4 kafelków tego samego typu. Rzadkość losuje się wg wag zależnych od rundy; statystyka Szczęście przesuwa wagi w stronę lepszych kafelków.

| Rzadkość | Rundy 1–6 | Rundy 7–12 | Rundy 13–20 |
|---|---|---|---|
| Zwykły | 70% | 50% | 35% |
| Rzadki | 25% | 35% | 38% |
| Epicki | 5% | 13% | 22% |
| Legendarny | 0% | 2% | 5% |

| | Szybki | Pełny |
|---|---|---|
| Rundy | 10 | 20 |
| Bossowie | runda 5 i 10 | runda 6, 12 i 20 |
| Czas runu | ok. 10 min | ok. 20 min |
| Ranking | osobny | osobny |

Wynik = (1000 × ukończone rundy + 50 × pozostałe Ziarna + premia za szybkość walk, maks. 2000) × (1 + 0,25 × poziom Garnka). Ranking trzyma najlepszy wynik gracza osobno dla każdego trybu.

## 3. Walka

Walka jest automatyczna: kurczak i wróg biją się sami, a gracz decyduje, kiedy użyć do trzech umiejętności aktywnych (klawisze 1, 2, 3 albo kliknięcie). Widok z boku: kurczak po lewej, wróg po prawej, nad głowami paski życia i wyskakujące liczby obrażeń.

| Statystyka | Start (Pyrtek) | Działanie |
|---|---|---|
| Życie | 70 | Gdy spadnie do 0, przegrywasz walkę |
| Atak | 8 | Bazowe obrażenia jednego ciosu |
| Szybkość ataku | 1,0 / s | Liczba ciosów na sekundę |
| Pancerz | 0 | Zmniejsza obrażenia (wzór niżej) |
| Szansa na trafienie krytyczne | 5% (siła ×1,5) | Szansa i siła mocniejszego ciosu |
| Unik | 0% | Szansa, że cios nie trafi |
| Regeneracja | 0 / s | Leczenie w trakcie walki |
| Szczęście | 0 | Poprawia rzadkość kafelków w ofertach |

```
obrażenia = Atak × (1 + b) × k × 100 / (100 + P)
```

b = suma premii procentowych, k = mnożnik krytyka (1, gdy cios nie jest krytyczny), P = pancerz celu. Wrogowie rosną z rundą r (tryb pełny; szybki ma 1.13 i 1.092, a bossowie w nim 80% życia i 90% ataku; na pierwszych 4 piętrach, w szybkim na 3, wrogowie mają +35% życia i -20% ataku):

```
Życie_r = Życie_0 × 1.107^(r-1)      Atak_r = Atak_0 × 1.07^(r-1)
```

Zasady silnika:

- Czas liczony w tickach po 100 ms, losowość z ziarna (seed): ta sama walka z tymi samymi wejściami daje zawsze ten sam wynik.
- Po 45 s wróg wpada w Furię (+5% obrażeń na sekundę), żeby walka nie utknęła w remisie. Limit 90 s.
- Umiejętności startują z 15% cooldownu (nie zabijają w 1. ticku, gotowe po ok. 1 s). Umiejętność wzięta drugi raz awansuje na poziom 2: +30% mocy i -20% cooldownu. Gdy wszystkie 3 sloty są zajęte, nowa umiejętność zastępuje wybraną.
- Ogłuszenie przerywa szarże i telegrafowane ataki bossów.

Przykład rundy 1: Pyrtek (70 Życia, Atak 8, 1 cios/s) kontra Szczur Pasz (19 Życia, Atak 3, 1,2 ciosu/s). Pyrtek wygrywa po ok. 3 s i traci kilka punktów Życia. Runda 1 uczy pętli; pierwsze większe wyzwanie dopiero w rundach 4–6.

## 4. Kafelki na start (31)

20 dostępnych od razu, 10 odblokowywanych osiągnięciami (sekcja 6). Wszystko w plikach danych JSON, dodanie kafelka nie wymaga zmian w kodzie.

### Statystyki

| Kafelek | Efekt | Rzadkość |
|---|---|---|
| Ziarno Mocy | +6 Atak | Zwykły |
| Ostry Dziób | +12% obrażeń | Zwykły |
| Twardy Grzebień | +20 maks. Życia | Zwykły |
| Szybki Dziób | +10% szybkości ataku | Zwykły |
| Pancerz z Pierza | +6 Pancerza | Zwykły |
| Czujne Oko | +8% szansy na trafienie krytyczne | Rzadki |
| Zwinne Nogi | +6% uniku | Rzadki |
| Ciepłe Gniazdko | +2 Regeneracji / s | Rzadki |
| Czterolistna Koniczyna | +10 Szczęścia | Epicki |

### Umiejętności aktywne

| Kafelek | Efekt | Cooldown | Rzadkość |
|---|---|---|---|
| Kukurydziany Grad | 5 pocisków po 60% Ataku | 6,5 s | Zwykły |
| Pianie Grozy | Ogłusza wroga na 2 s | 9 s | Rzadki |
| Jajeczny Granat | 250% Ataku w jednym uderzeniu | 8 s | Rzadki |
| Dziobnięcie Szału | +50% szybkości ataku przez 6 s | 12 s | Rzadki |
| Unik Skrzydłem | Nietykalność przez 1,5 s | 10 s | Epicki |
| Zagrzebanie w Sianie | Leczy 30% maks. Życia | 16 s | Epicki |

### Przedmioty z synergią

| Kafelek | Efekt | Zestaw | Rzadkość |
|---|---|---|---|
| Złote Jajo | +3 Ziarna po każdej wygranej rundzie | Jajeczne | Rzadki |
| Tykające Jajo | Co 8 s wybucha za 120% Ataku | Jajeczne | Rzadki |
| Gniazdo Zapasowe | Raz na run: wskrzeszenie z 40% Życia | Jajeczne | Epicki |
| Worek Kukurydzy | +8% Ataku za każde 10 Ziaren (maks. +40%) | Zbożowe | Zwykły |
| Młocarnia | 15% szans na rozbicie 10% Pancerza wroga przy trafieniu | Zbożowe | Rzadki |
| Siewnik | +1 Ataku na stałe po każdej wygranej rundzie | Zbożowe | Epicki |
| Opaska Rambo | +15% obrażeń, +10% szansy na trafienie krytyczne | Rambo | Rzadki |
| Kamizelka Kuloodporna | +15 Pancerza, -10% szybkości ataku | Rambo | Zwykły |
| Ostrogi Bojowe | Ataki krwawią: 4 obrażenia / s przez 3 s | Rambo | Rzadki |
| Okulary Aviatory | +30% do siły trafienia krytycznego | Rambo | Epicki |

Bonusy zestawów liczymy od dwóch posiadanych przedmiotów tego samego zestawu:

| Zestaw | 2 przedmioty | 3 lub więcej |
|---|---|---|
| Jajeczne | Tykające Jajo wybucha co 6 s | Wybuchy leczą 3% maks. Życia |
| Zbożowe | +10% Ziaren z nagród | Worek Kukurydzy bez limitu premii |
| Rambo | +20% Ataku | Ostatni Okrzyk: raz na walkę 3 s nietykalności poniżej 20% Życia |

### Ryzyko i wydarzenia

| Kafelek | Efekt | Rzadkość |
|---|---|---|
| Pakt z Lisem | +50% Ataku, -30% maks. Życia do końca runu | Rzadki |
| Szklane Skrzydło | +80% Ataku, -50% maks. Życia | Epicki |
| Tajemnicza Skrzynka | Losowy kafelek epicki, ale 25% szans na pułapkę (-15% Życia) | Rzadki |
| Sklepik Babci Kwoki | Wydarzenie: kupujesz 1 z 3 kafelków za Ziarna | Zwykły |
| Hazard w Kurniku | Stawiasz dowolnie wiele Ziaren: 50% podwajasz, 50% tracisz | Zwykły |
| Zakazana Pasza | +25% wszystkich statystyk, ale następny boss ma +30% Życia | Legendarny |

## 5. Bossowie i wrogowie

Każdy z trzech bossów ma własną mechanikę i fazy, a gracz ma na nie odpowiedź w postaci umiejętności aktywnych (ogłuszenie, unik, leczenie). Dzięki temu aktywne umiejętności ważą wtedy, gdy walka naprawdę jest trudna.

| Boss | Runda | Faza 1 | Faza 2 | Faza 3 |
|---|---|---|---|---|
| Brojler Zdzisław, Szef Zmiany | 6 (szybki: 5) | Co 15 s wzywa 2 Pisklaki-stażystów | Poniżej 50% Życia: Premia Motywacyjna, +30% szybkości ataku | brak |
| Skubarka 3000 | 12 | Tarcza z pierza (25% maks. Życia), którą trzeba zbić najpierw | Poniżej 40% Życia: co 10 s fala obrażeń z telegrafem 2 s, do uniku | Co 20 s Skubanie wyłącza losowy kafelek gracza na 10 s |
| Prezes Rosołu | 20 (szybki: 10) | Zebranie Zarządu: nietykalny, dopóki żyją dwaj Ochroniarze (Koty) | Poniżej 66%: Restrukturyzacja, blokuje jeden slot umiejętności na 8 s | Poniżej 33%: Wrzący Garnek, obrażenia rosną o 2% na sekundę, wyścig na DPS |

Zwykli wrogowie wchodzą pojedynczo lub w grupach po 1–3:

| Strefa | Wróg | Zachowanie |
|---|---|---|
| I | Szczur Pasz | Szybki i słaby, na rozgrzewkę |
| I | Lis Windykator | Przy trafieniu kradnie 1 Ziarno |
| I | Pies Łańcuchowy | Wolny, bardzo dużo życia |
| II | Mysz Magazynier | Wchodzi w roju po 3 |
| II | Wózek Widłowy | Szarżuje (można ogłuszyć albo uniknąć) |
| II | Bałwan z Chłodni | Każdym trafieniem spowalnia szybkość ataku gracza o 20% |
| III | Jajo-Sortownik | Robot z tarczą pochłaniającą pierwsze 3 ciosy |
| III | Kot Ochroniarz | Wysoki unik i krytyk |
| III | Księgowy Kanarek | Każdy cios zabiera 1 Ziarno |

Poziomy trudności dodają wrogów elitarnych (jeden na strefę, +50% nagród), ale zasady ich zachowań są te same, więc nowe treści dokłada się danymi.

## 6. Postacie, meta-progres i trudność

Między runami odblokowujesz wyłącznie nowe opcje (postacie i kafelki), nigdy stałą przewagę w sile, więc ranking pozostaje uczciwy. Postęp zapisuje się na koncie w Księdze Kurnika.

| Postać | Styl | Bonus startowy | Odblokowanie |
|---|---|---|---|
| Pyrtek | Uniwersalny | Statystyki bazowe | Od startu |
| Kwoka Babcia | Czołg | +30% Życia, -20% szybkości ataku, start z umiejętnością Zagrzebanie w Sianie | Ukończ pełny run |
| Kaczor Hazardzista | Ryzyko | +10 Ziaren, 1 darmowy reroll na rundę, więcej kafelków ryzyka w ofertach | Weź 5 kafelków ryzyka w jednym runie |
| Indor Bogdan | Ciężkie ciosy | +60% Ataku, -30% szybkości ataku, 15% szansy na trafienie krytyczne | Pokonaj Prezesa Rosołu w trybie szybkim |

Dziesięć kafelków jest zablokowanych na start:

| Kafelek | Jak odblokować |
|---|---|
| Czterolistna Koniczyna | Zbierz 100 Ziaren w jednym runie |
| Unik Skrzydłem | Pokonaj Brojlera Zdzisława |
| Zagrzebanie w Sianie | Wygraj walkę, kończąc ją z mniej niż 10% życia |
| Gniazdo Zapasowe | Dojdź do rundy 10 w trybie pełnym |
| Siewnik | Ukończ tryb szybki |
| Okulary Aviatory | Zadaj jednym trafieniem 150 obrażeń |
| Szklane Skrzydło | Weź Pakt z Lisem w 3 różnych runach |
| Tajemnicza Skrzynka | Ukończ 5 runów |
| Zakazana Pasza | Pokonaj Skubarkę 3000 |
| Hazard w Kurniku | Przegraj run z ponad 30 Ziarnami w kieszeni |

Trudność nazywa się Temperatura Garnka. Wygrana na poziomie N odblokowuje poziom N+1, a każdy poziom dodaje się do poprzednich i podnosi mnożnik wyniku o 25%.

| Poziom | Nazwa | Dodatkowy modyfikator |
|---|---|---|
| 0 | Letni | Brak |
| 1 | Ciepły | Wrogowie mają +10% Życia |
| 2 | Gorący | Reroll droższy o 1 Ziarno, pojawiają się elitarni wrogowie |
| 3 | Wrzący | Leczenie po rundzie spada z 35% do 20% |
| 4 | Kipiący | Bossowie mają +20% szybkości ataku |
| 5 | Wulkan Rosołu | Wrogowie mają +15% Ataku, a regeneracja w walce jest wyłączona |

Kosmetyka (czapeczki, kolory piór) jest poza wersją 1; miejsce w profilu gracza zostawiamy na później.

## 7. Architektura techniczna

Cała logika gry żyje na serwerze, a przeglądarka ją rysuje i podpowiada: serwer losuje oferty, trzyma stan runu i sprawdza każdą walkę tym samym kodem, który gra w przeglądarce.

```
Przeglądarka (/bulgot/)            pl3y-server                    Durable Objects
  Ekrany i walka  ──HTTPS──▶  Routing i auth (/api/bg/*, pt) ──▶  BgPlayer (1 na gracza)
  sim.js (kopia)  ◀─ sync ──  sim.js i dane (źródło prawdy)  ──▶  BgRanks (singleton)
  Dane JSON (kopia) ◀ sync ─  Symulator balansu (dev)
```

- **Serwer:** nowy folder `pl3y-server/src/games/bulgot/`, dwie nowe klasy Durable Objects i nowa migracja `v8` w `wrangler.toml` (istniejących klas i tagów nie ruszamy). `BgPlayer` (jeden na gracza, klucz z nicku: profil, odblokowania, aktywny run) i `BgRanks` (singleton: ranking). Tożsamość z tokena gracza `pt`, jak w rankingu Miliona.
- **Frontend:** repo `bulgot` na GitHub Pages pod `/bulgot/`; wpis w lobby (`GAMES` w `egozaur.github.io`, bez `JOIN`, bo gra jest solo) już dodany, czeka na push.
- **Bez WebSocketów i lobby:** gra solo to zwykłe żądania HTTP, więc nie ma reconnectów ani pokojów.
- **Weryfikacja walki (replay):** serwer wydaje seed walki, klient symuluje lokalnie dla płynności i po walce wysyła listę wejść (tick i slot umiejętności). Serwer powtarza walkę z tym samym seedem i dopiero wtedy zapisuje wynik, więc podrobiony wynik nie przejdzie. Powtórka walki to ok. 600–900 ticków, czyli mało pracy dla Workera.
- **Deterministyczność:** silnik używa wyłącznie dodawania, odejmowania, mnożenia i dzielenia oraz własnego generatora z seeda; bez `Math.random`, `Date` i funkcji trygonometrycznych.
- **Dane:** kafelki, wrogowie, bossowie, postacie i poziomy Garnka w jednym module JS po stronie serwera (`data.js`), kopiowanym do frontendu skryptem sync (jak `mafia/dev/sync-engine.mjs`). Dodanie treści nie wymaga zmian w kodzie silnika.
- **Zapis:** stan runu zapisuje się po każdym wyborze i po każdej walce. Przerwana walka startuje od nowa z tym samym seedem, więc nie da się „losować do skutku”.
- **Testy i balans:** testy w `test/games/bulgot/` (28 testów) oraz symulator `bulgot/dev/sim-balance.mjs`, który puszcza np. 1000 runów prostymi strategiami i pokazuje odsetek wygranych na rundę i na build.

| Trasa | Po co |
|---|---|
| `POST /api/bg/run/start` | Nowy run: tryb, postać, poziom Garnka |
| `GET /api/bg/run` | Wznowienie aktywnego runu |
| `POST /api/bg/run/pick` | Wybór kafelka z oferty (indeks 0–3) |
| `POST /api/bg/run/reroll` | Przelosowanie oferty za Ziarna |
| `POST /api/bg/run/fight/start` | Seed walki dla bieżącej rundy |
| `POST /api/bg/run/fight/finish` | Lista wejść, weryfikacja i wynik walki |
| `GET /api/bg/profile` | Odblokowania i osiągnięcia gracza |
| `GET /api/bg/ranks` | Ranking, osobno dla trybu szybkiego i pełnego |

## 8. Plan etapów i ryzyka

Wszystkie siedem etapów jest wykonanych (2026-11-21), a gra działa w przeglądarce w trybie lokalnym (`?local=1`) i na kodzie serwera. Do zrobienia zostaje wypchnięcie na produkcję i granie na prawdziwym serwerze.

1. ✔ **Silnik walki i symulator (M).** Czysty JS w `pl3y-server/src/games/bulgot/`, testy, bez UI. Gotowe, gdy ta sama walka z tym samym seedem daje identyczny wynik, a symulator pokazuje odsetek wygranych na rundę.
2. ✔ **Scena walki (M).** Frontend `bulgot`: Pyrtek kontra Szczur Pasz, animacje, paski życia, liczby obrażeń, klawisze 1–3. Gotowe, gdy walkę przyjemnie się ogląda i da się w niej klikać umiejętności.
3. ✔ **Pętla runu lokalnie (L).** Ekran 4 kafelków, reroll, Ziarna, 10 rund i 15 kafelków, w trybie `?local=1` jak inne gry. Gotowe, gdy tryb szybki da się przejść od początku do końca.
4. ✔ **Serwer i zapis (M).** `BgPlayer`, trasy `/api/bg/*`, weryfikacja przez replay, wznawianie runu, logowanie. Gotowe, gdy zamknięcie karty w środku runu i powrót z innego komputera działa.
5. ✔ **Pełna treść (L).** 30 kafelków, 3 strefy, 3 bossowie z fazami, 4 formy kurczaka, teksty Kronikarza i tryb pełny z 20 rundami. Największa porcja pracy.
6. ✔ **Meta i ranking (M).** `BgRanks`, odblokowania, trzy dodatkowe postacie, poziomy Garnka 0–5.
7. ✔ **Dźwięk, balans i wydanie (M).** Efekty i muzyka, strojenie symulatorem, wpis w lobby, test w przeglądarce Edge.

| Ryzyko | Skutek | Jak ograniczamy |
|---|---|---|
| Balans (20 rund, 30 kafelków, synergie) | Zepsute buildy albo nuda | Symulator od etapu 1, liczby trzymane w JSON |
| Ilość treści | Najdroższy element projektu | Start od 15 kafelków i jednego bossa, reszta dokładana danymi |
| Rozjazd silnika w przeglądarce i na serwerze | Serwer odrzuca uczciwe wyniki | Jeden plik `sim.js` kopiowany skryptem, testy porównujące oba |
| Animacje sceny | Styl wygląda tanio | Wektorowe postacie z 2–3 klatkami i tweenami, styl ustalony przed bossami |
| Fałszowanie rankingu | Bezwartościowa tabela | Replay wejść na serwerze i istniejące limity na IP |

Rozstrzygnięte przed startem: nazwa i adres to **Bulgot** pod `/bulgot/`, ikony kafelków to własne SVG, a umiejętności mają 3 sloty.

## 9. Wyniki balansu (po dodaniu dokupowania) (symulator, 1000 runów botem)

Bot wybiera kafelki heurystyką (siła buildu = obrażenia × wytrzymałość), używa umiejętności we właściwych momentach i potrafi przelosować słabą ofertę. Człowiek powinien radzić sobie podobnie albo lepiej. Cel: wczesne rundy bezpieczne, skoki trudności na bossach i w strefie III.

| Konfiguracja | Wygrane bota |
| --- | --- |
| Pełny, Garnek 0, wszystkie kafelki, bot dokupuje | ok. 65% |
| Pełny, Garnek 0, bot nie dokupuje wcale | ok. 13% |
| Pełny, Garnek 0, tylko 21 startowych kafelków | ok. 46% |
| Szybki, Garnek 0 | ok. 65% |
| Pełny, bot wybierający losowo | poniżej 1% |

Postacie (pełny, Garnek 0): Pyrtek ok. 40%, Kwoka Babcia ok. 49%, Kaczor Hazardzista ok. 33%, Indor Bogdan ok. 37%. Powtórzenie: `node dev/sim-balance.mjs --mode full --n 1000 --table`.

## 10. Rozbudowa (2026-11-21, noc): efekty, Mutacje, nowe przedmioty, Wylęgarnia, Odznaki

Pełne listy (nazwy, liczby, opisy) są w `pl3y-server/src/games/bulgot/data.js`. Tu jest tylko projekt.

### Efekty statusowe (`STATUS`)
| Efekt | Działanie | Limit |
|---|---|---|
| Oparzenie | co sekundę stosy × 10% Ataku (min. 1 na stos), ignoruje pancerz i tarcze | 10 stosów (+Kostka Rosołowa) |
| Mróz | każdy stos -8% szybkości ataku wroga; 5 stosów = zamrożenie na 1,5 s (boss: połowa), przerywa szarżę | 5 (Zamrażarka: 4) |
| Salmonella | co sekundę stosy × 6% Ataku; po śmierci nosiciela 50% stosów przechodzi na następnego wroga | 12 |
| Krwawienie | co sekundę stosy × (moc krwawienia + 8% Ataku) | 3 (+Kolczatka, Pierzasta Burza) |

Nakładanie: szansa przy zwykłym ataku (`burnHit`, `frostHit`, `poisonHit`) albo umiejętności. Wrogowie mogą mieć odporność (`resist`). Nietykalny wróg (Prezes z Ochroniarzami) nie dostaje efektów.
Żywioły (`ELEMENTS`: Ogień, Lód, Salmonella, Krew, Jajo, Ziarno, Korpo) to oznaczenia na kartach.

### Umiejętności: 14 i Mutacje
Nowe: Rosołowy Chlust (Oparzenie na wszystkich), Lodowy Dziób, Zgniłe Jajo, Kogucia Kontra (połowa obrażeń i oddawanie), Darcie Pierza, Piaskowa Kąpiel (wrogowie pudłują), Dziobanie Premii (Ziarna za zabójstwo), Egzekucja Ostrogą.
Trzecia kopia umiejętności = **Mutacja**: wybór 1 z 2 gałęzi (`SKILLS.*.muts`, w runie `{ id, lvl: 3, mut: 1|2 }`). Moc i cooldown jak na poziomie 2 plus efekt gałęzi. Protokół: `pick/buy/shop/bonus` przyjmują `mut`; bez niego serwer odpowiada kodem `mut` i klient pokazuje okno wyboru.

### Przedmioty: 25 (zestawy 6)
Nowe zestawy z progami 2/3/4: **Rosołowe** (Chochla, Kostka Rosołowa, Lubczyk, Garnek Ciśnieniowy), **Chłodnicze** (Kostka Lodu, Termometr, Zamrażarka, Szron na Piórach), **Korporacyjne** (Teczka, Krawat, Polisa Ubezpieczeniowa = kontra na Lisa, Premia Kwartalna). Stare zestawy dostały po jednym przedmiocie: Zepsute Jajo (Jajeczne), Mokra Pasza (Zbożowe), Kolczatka (Rambo).

### Wylęgarnia (`RECIPES`) i progi (`MILESTONES`)
8 przepisów: para przedmiotów automatycznie wykluwa legendarny przedmiot (składniki znikają, nowy ma efekty obu i premię, liczy się do obu zestawów). Wyklutych nie ma w ofertach, składniki już wyklutego też nie wracają. Odkryte przepisy są w profilu (`recipes`) i w Księdze (zakładka Wylęgarnia, nieodkryte jako „?”). Znacznik „Wylęgarnia!” na karcie mówi, że kafelek dokończy przepis.
Progi: co 3 kopie tej samej statystyki dają nazwaną premię (np. 3× Ziarno Mocy = Kolba Mocy +15% Ataku).

### Odznaki, elity, nowi wrogowie, wydarzenia
- **Odznaki Pracownicze** (`BADGES`, 12): po wygranej z bossem albo elitą faza `badge`: wybór 1 z 3 (`choose {i}`), potem ewentualny bonus po bossie. Także w Kapliczce. Pasywne, w `run.badges`.
- **Elity** są od Garnka 0 (pełny: piętra 4, 10, 16; szybki: 4, 8), +30% życia, +12% ataku, najwyżej z jednym pomocnikiem, z cechą (`AFFIXES`, 7). Od Garnka 2 dwie cechy, ale na wczesnych piętrach zawsze jedna. Cechy widać w podglądzie piętra.
- **Nowi wrogowie**: Kaczka Podpalaczka (strefa I, podpala bohatera), Kurczak z Zamrażarki (strefa II, odporny na Mróz, wstaje raz, chyba że płonie), Sęp Audytor (strefa III, co 6 s zdejmuje efekty z sojuszników i dostaje tarczę).
- **Wydarzenia**: Automat z Paszą (5 Ziaren = 2 losowe statystyki), Kontrakt z Działem HR (etat: +30% Ataku i -2 Ziarna na rundę / B2B: +15 Ziaren i -15% Życia; ukryte kafelki `umowa-etat`, `umowa-b2b`), Kapliczka Świętego Rosołu (pełne leczenie albo Odznaka).

### Balans po rozbudowie (bot, 1000 runów)
Wzrost wrogów: pełny 1,125 (życie) i 1,08 (atak), szybki 1,14 i 1,098. Strefa III w pełnym ma dodatkowo +30% życia i +12% ataku zwykłych wrogów (`MODES.full.zoneMul`). Prezes: 108 życia, 12 ataku. Garnek 5: +5% ataku wrogów i regeneracja o połowę słabsza (zamiast wyłączonej).
| | Pełny | Szybki |
|---|---|---|
| Garnek 0 | 59,5% | 59,5% |
| Garnek 1 / 2 / 3 / 4 | 53 / 50 / 42 / 37% | – / 48 / – / 34% |
| Garnek 5 | 14% | 21% |
| Tylko kafelki startowe (nowy gracz) | 49% | 55% |
| Bez dokupowania | 17% | – |
Porażki rozkładają się na elity i bossów (po 2–6%), strefa III straszy do końca, Prezes w szybkim zabija ok. 13% runów.

## 11. Rozbudowa „jeszcze jedna partia” (2026-11-21): 10 mechanik retencji

Cel: więcej powodów do kolejnego runu (combo, ryzyko, nieprzewidywalność, rewanż). Wszystko liczy serwer (deterministycznie z ziarna runu), klient tylko rysuje.

### W walce i na kafelkach
- **Reakcje** (`REACTIONS`, `sim.js` → `react()`): dwa różne efekty na jednym wrogu. Oparzenie + Mróz = **Szok Termiczny** (15% Ataku na stos obu efektów, maks. 300%, zdejmuje Mróz i połowę Oparzenia); Salmonella + Krwawienie = **Gorączka** (5 s: Salmonella i Krwawienie +50%, śmierć w Gorączce daje 3 stosy Salmonelli pozostałym); Mróz + Krwawienie = **Kruchość** (następne trafienie zawsze krytyczne, także umiejętnością). Przerwa 3 s na wroga i reakcję. Odkryte reakcje trafiają do profilu (`p.reactions`) i Księgi.
- **Kafelki rosnące** (`TILES[].grow`, licznik `run.grow`, logika w `stats.js` i `fightFinish`): Pierze Weterana (+3% Ataku za wygraną poniżej 40% Życia, maks. 15), Trofeum z Piór (+2 maks. Życia za wroga, do 4 na walkę, maks. 60), Skarbonka Pisklęcia (+1 Ziarno, +1 za piętro bez Odpoczynku, maks. +5).
- **Okno Gdakania** (`RULES.chainWindow/chainPct/chainStun`): umiejętność do 1,5 s po poprzedniej: 2. w serii +20% obrażeń, 3. +50%; trzy różne = Pełna Kurza Seria (Popłoch: ogłuszenie 1 s).

### Ryzyko i nagroda
- **Rozwidlenie Korytarza** (`MODES.*.doors`, faza `door`, `choose {i}`): pełny 2, 5, 8, 11, 14, 17; szybki 2, 6, 9. Drzwi „Tylko dla personelu”: pierwszy wróg ma cechę elity (losowana z ziarna), 165% Życia i 125% Ataku, najwyżej z jednym pomocnikiem; nagroda +8 Ziaren albo wybór 1 z 3 rzadkich kafelków (faza `bonus`). Bez Odznaki.
- **Lombard Lisa** (`pawn {id}`, `redeem`): zastaw kafelka (nie umiejętność, nie umowa, nie z wadą) za pełną cenę rzadkości; wykup tylko na następnym piętrze za 150%; przepadek: `run.foxDebt++`, Lisy Windykatory +25% Życia/Ataku i +1 do limitu kradzieży za każdy.
- **Odsetki w Spiżarni** (`RULES.interestPer/interestMax`, `CHARS.kaczor.interestMax`): po wygranej +1 Ziarno za każde 10 niewydanych, maks. 3 (Kaczor 5). Niezależne od Odsetek zestawu Korporacyjnego.

### Nieprzewidywalność
- **Okólniki Zarządu** (`DECREES`, `run.decrees` = 3 różne z ziarna przy starcie): Oszczędności Energii (Mróz 2x dłużej, Oparzenie o połowę), Audyt Wydatków (2 darmowe rerolle na piętro, dokupowanie +50%), Wyjazd Integracyjny (zestawy +1 sztuka), Premia Motywacyjna (wrogowie +15% Życia, +3 Ziarna za piętro), Praca Zdalna (Odpoczynek x2, leczenie po walce -10 pkt proc.), Tryb Pilny (Furia od 30 s, premia za szybkość x2). Widok zdradza tylko okólnik bieżącej strefy.
- **Wadliwa Partia** (`FLAWS`, `run.flawAt`, `run.flawed`): w głównej ofercie 25% szans, że jeden kafelek statystyki/przedmiotu ma wadę. Dodatnie efekty +50%; wada (Samozapłon, Rozklejony, Wybuchowa Usterka, Ciężki, Kruchy, Żarłoczny) jest ukryta i zaczyna działać po następnej walce. Wylęgarnia usuwa wadę razem ze składnikiem; Lis nie przyjmuje wadliwego towaru.

### Meta między runami
- **Awans Wroga (Nemezis)** (`profile.nemesis`, `run.nemesis`, `makeNemesis`): zwykły wróg, który zakończył run (nie boss), dostaje tytuł, imię, cechę elity i kradnie losowy kafelek (nie umiejętność). W następnym runie czeka na zwykłym piętrze swojej strefy (140% Życia, 115% Ataku, +10/+5 pkt proc. za każdy kolejny awans), z jednym pomocnikiem. Pokonany: kafelek wraca, Odznaka Sprawiedliwość Kurnika (`BADGES.sprawiedliwosc`, `special`, poza losowymi ofertami), Nemezis znika z profilu. Jeśli znowu wygra: `lvl++`.
- **Testament Pyrtka** (`will {i}` po przegranej, `profile.will`, `run.will`): jeden kafelek zwykły lub rzadki z przegranego runu staje się piątą kartą pierwszej oferty następnego runu (także po rerollach, dopóki go nie weźmiesz). Przy kilku postaciach działa tylko dla innej postaci niż ta, która go spisała.

### Balans po rozbudowie (bot, 600–800 runów)
Same nowe mechaniki podniosły wygrane bota z 58% do ok. 80% (G0), głównie przez ryzykowne drzwi. Po wzmocnieniu wroga za drzwiami (165/125%) i przestrojeniu wzrostu (pełny `grow` 1,14/1,093, szybki 1,16/1,11): G0 pełny 60%, szybki 57%, G2 52%, G5 17–19% (tak jak przed rozbudową). Pomiar pojedynczych mechanik: nakładka z nadpisanymi `RULES`/`MODES` (wszystko wyłączone = 59%, zgodnie z poprzednią wersją).

## 12. Szablony pięter, ukryty podgląd i remaster (2026-11-22)

### Szablony pięter (serwer: `data.js` → `FLOOR_TPL`, `rules.js` → `floorTemplate`, `encounterIds`, `buildSetup`)
Losowane z osobnej soli ziarna runu (`hash('tpl')`), więc nie zmieniają losowania zwykłych wrogów. Nie dotyczą wczesnych pięter (`MODES.*.early.rounds`), bossów, elit, Nemezis ani ryzykownych drzwi. Wagi: Zwykłe 40, Czempion 15, Rój 15, Zwiad 15, Para 15.
- **Czempion**: 1 wróg (bez rojów), +80% Życia, nazwa „Czempion …”.
- **Rój**: 3 wrogów (bez rojów), każdy 60% Życia i 70% Ataku.
- **Zwiad**: 1 wróg z następnej strefy, skalowany do bieżącego piętra (nie ma go w strefie III).
- **Para**: 2 różne gatunki; silniejszy +8 Pancerza, obaj regenerują 1% Życia na sekundę (istniejące pole `regenPct`, bez zmian w silniku walki).
Szablon trafia do `setup.tpl` (baner na starcie walki) i do dziennika rund (`log[].tpl`).

### Ukryty podgląd (`rules.js` → `hideFoes`, `view()`)
Garnek 0: widok ma `enemies` i `tpl`. Od Garnka 1: `enemies = null`, `tpl = null`, `affixes = null`, `hidden = true`; wyjątek: piętro z bossem (`enemies = [boss]`). Ukrycie jest po stronie serwera; skład poznajesz dopiero z `fightstart`. Test serwera przeszukuje cały widok pod kątem identyfikatorów i nazw wrogów.

### Wersja reguł runu (`RULES` → `RUN_V = 2`)
Run z inną wersją (`run.v`) `BgPlayer` unieważnia przy pierwszym żądaniu (`voided: true` w odpowiedzi, klient pokazuje komunikat). Decyzja właściciela: bez dokańczania starych runów. Przy każdej zmianie, która zmienia spotkania lub powtórkę walki, podbij `RUN_V`.

### Balans po zmianach (bot, 700 runów)
Same szablony prawie nie ruszyły wyniku (pełny 61%, szybki 56%). Właściciel chciał trudniejszego startu („ciężej wygrać za pierwszym razem”), więc wzrost wrogów podniesiono: pełny `grow` 1,155/1,10 (było 1,14/1,093), szybki 1,18/1,12 (było 1,16/1,11). Wynik: G0 pełny 48%, szybki 45%; G2 38%/33%; G5 8%/9% (było 17–19%).

### Interfejs (frontend)
- Tempo walki: wybór przed walką (`bulgot:speed`), w walce przycisk ×N i klawisz F. Okno Gdakania liczy się w tickach, więc przy ×3 trwa trzy razy krócej w prawdziwym czasie (podpowiedź przy wyborze).
- Zamrożenie klatki po Reakcji i wejście bossa wstrzymują tylko obraz (`F.stopUntil`): zegar walki nie liczy, więc powtórka na serwerze się zgadza.
- Paski porównania (Atak / Obrona: słabo / OK / mocno) liczą typowego wroga strefy z jawnych danych (`zoneCompare` w `app.js`), bez składu piętra.
- Wszystkie nowe animacje to CSS/SVG; `prefers-reduced-motion` wyłącza liczniki, paralaksę, pióra i światła alarmowe.


## 13. Poziomy kafelków, Ulepszanie i łup z bossów (2026-11-22, etap 1 z 3)

Cel aktualizacji: kafelki mają poziomy (rodziny po 3 poziomy + legendarny z bossów + Ulepszanie), a pula rośnie z 60 do ok. 120. **Etap 1** dotyczy statystyk (+18 kafelków: 9 rodzin × (2 nowe zwykłe + legendarny) = 27 nowych, stare 9 zostają); etapy 2 (przedmioty i umiejętności) i 3 (ryzyko i legendarne przedmioty) są jeszcze przed nami.

### Rodziny statystyk (`STAT_FAMILIES` w `data.js`, generują `STAT_TILES` i `STAT_FAMS`)
| Rodzina | Poz. 1 (Zwykły) | Poz. 2 (Rzadki) | Poz. 3 (Epicki, stare id) | Poz. 4 (Legendarny, łup z bossa) |
|---|---|---|---|---|
| Życie | Grzebień z Taśmy +2 | Grzebień Hodowlany +7 | Grzebień Barberski +20 (`twardy-grzebien`) | Grzebień Rosołowego Króla +35 |
| Atak | Ziarenko z Podłogi +1 | Ziarno Selekcjonowane +2 | Ziarno Mocy +6 | Ziarno Pierwszego Jajka +10 |
| Obrażenia | Nadpiłowany Dziób +1% | Dziób Szlifowany +4% | Ostry Dziób +12% | Dziób Prezesa +20% |
| Szybkość ataku | Dziób po Kawie +1% | Dziób po Espresso +3% | Szybki Dziób +10% | Dziób Maszynowy +18% |
| Pancerz | Puch Zbity w Kulę +1 | Pierze Prasowane +2 | Pancerz z Pierza +6 | Zbroja Wyroczni Kurnika +10 |
| Krytyk | Zezowate Oko +1% | Oko Kontrolera Jakości +3% | Czujne Oko +8% | Oko Cyklopa z Chłodni +14% |
| Unik | Śliskie Nóżki +1% | Nogi Akrobaty +2% | Zwinne Nogi +6% | Cień Skrzydła +10% |
| Regeneracja | Słoma z Wczoraj +0,2 / s | Gniazdko z Siana +0,7 / s | Ciepłe Gniazdko +2 / s | Wieczny Ogień Kuchenki +3,5 / s |
| Szczęście | Trójlistna Koniczyna +1 | Koniczyna z Kapliczki +3 | Czterolistna Koniczyna +10 | Pięciolistna Koniczyna Zarządu +16 |

- Każdy kafelek ma `fam` (rodzina) i `lvl` (1–4), rzadkość = poziom − 1 (Zwykły, Rzadki, Epicki, Legendarny), `repeat: true`. Poziomy 1 i 2 mają `next` (id następnego poziomu). Poziom 4 ma `boss: true`.
- Poziom 3 zachowuje **stare id**, więc profile, Księga i testy się nie psują. Czterolistna Koniczyna dalej wymaga odblokowania `u-koniczyna` (nowe kafelki startują odblokowane).
- Legendarne (`boss`): nigdy w ofertach, rerollach, bonusie, Sklepiku, Automacie ani w puli startowej (`tileAvailable` zwraca `false`, `STARTER_TILES` je pomija). Moc 150–180% poziomu 3.
- Progi statystyk (`MILESTONES`, 3 kopie = premia) dotyczą kafelków **poziomu 3** (stare id); Ulepszanie jest drogą do progu.
- **Regeneracja jest liczona w dziesiątych częściach Życia na sekundę** (`stats.regen`: 10 = 1 / s). Silnik (`sim.js`) kumuluje ułamki (`regAcc`), więc 0,5 / s daje 1 Życia co 2 s. Wszystkie stare wartości regeneracji w danych (Ciepłe Gniazdko, Zjarany, Karta Multisport, próg Kurza Drzemka) przeliczono ×10; klient pokazuje `T.fmtRegen`.
- Automat z Paszą wypluwa statystyki tylko poziomu 3; Tajemnicza Skrzynka losuje epickie spoza statystyk (inaczej 9 nowych epików statystyk rozwodniłoby ją).

### Ulepszanie (akcja `upgrade {id}`)
- 3 kopie tego samego kafelka poziomu 1 lub 2 zlewają się w 1 kafelek następnego poziomu rodziny, za darmo. Tylko w fazie `offer` (obok Lombardu), więc powtórka walki jest bez zmian. Poziom 3 → legendarny to **nie** ulepszanie.
- Błędy: `phase` (zła faza), `index` (nie masz kafelka), `level` (brak `next`), `copies` (mniej niż 3). Wada fabryczna zlanej kopii znika razem z nią (`flawed` nie ma więcej wpisów niż kopii). Życie rośnie o przyrost maks. Życia jak przy zwykłym zdobyciu kafelka.
- `view().up` = id kafelków, które da się teraz zlać (tylko w ofercie; nie zdradza niczego o przyszłości). Dziennik rundy ma `upgrades: [{from,to}]`, `stats.upgrades` liczy zlania.
- Klient: przycisk „Zlej kafelki” (klawisz U), okno z wierszami „3× X → Y” (`showUpgrade`), dźwięk `unlock`, toast, krótka animacja chipa (`.chip.fresh`).
- **Proporcje (decyzja po etapie 1):** poziom 1 ≈ 10–15%, poziom 2 ≈ 30–35% mocy poziomu 3, więc 3 kopie ≈ następny poziom i zlewanie nie traci mocy (zysk: próg poziomu 3, porządek w panelu). Poziomy 1 i 2 to głównie „paliwo” do zlewania; pierwotna tabela (25% / 60%) czyniła zlewanie stratnym.

### Łup z bossów (faza `loot`)
- Po pokonaniu bossa (poza ostatnim, który kończy run): Odznaka (jak dotąd) → **łup z szansą `RULES.lootChance` = 15%** (`lootRoll`, losowanie z ziarna runu; bez trafienia od razu bonus albo następne piętro): wybór 1 z 3 legendarnych statystyk (`RULES.lootSize`), losowanych z ziarna runu (`mix(seed, round, hash('loot'))`), najpierw takie, których jeszcze nie masz → oferta bonusowa (po bossach z `bonusAfter`) → następne piętro. Okazji jest 1 w trybie szybkim (boss 5) i 2 w pełnym (bossy 6 i 12), więc łup trafia się w ok. 15–28% runów.
- Wybór przez zwykłe `choose {i}` (faza `loot`, `pending.kind = 'loot'`, odpowiedź `looted`), dziennik: `log[].loot`, `stats.loot`. `view()` w fazie łupu ma pustą `offer`, a `pending.offer` to 3 id (nic o przyszłych ofertach).
- `RUN_V = 3` (stare runy unieważniane: zmienia się przebieg po bossie i regeneracja).

### Grafika
Jedna ikona na rodzinę (`ICON_OF` w `art.js`: poziomy 1, 2 i legendarny dzielą ikonę poziomu 3). Plakietka poziomu `.lvl` (`lvlTag` w `app.js`): I szary, II papier pakowy, III złoty, ★ legendarna z poświatą; na kartach (róg), w chipach panelu, w oknie zlewania. Wyglądu karty `.tile` nie zmieniono. Księga Kurnika: legendarne są zablokowane do pierwszego zdobycia („Łup z bossa”), podpowiedź (`tip.js`) pokazuje poziom i co się zleje.

### Balans (bot, quick/full, 1000–1500 runów)
Kafelki statystyk poziomu 1 i 2 osłabiły wczesną grę (przed zmianą: szybki 45%, pełny 48%; po samej zmianie danych: szybki 31%, pełny 14%). Skompensowano wagami rzadkości i tempem wzrostu wrogów:
- `RARITY_WEIGHTS`: `[[45,35,20,0],[30,36,30,2],[18,34,43,5]]` (było `[[70,25,5,0],[50,35,13,2],[35,38,22,5]]`). Waga legendarnych (rarity 3) została niska, bo w ofertach jest tylko Zakazana Pasza.
- Po zmniejszeniu poziomów 1–2 i łupu z szansą 15% ponowny retuning: `MODES.quick.grow` `{hp 1.135, atk 1.092}` (pierwotnie 1.18 / 1.12), `MODES.full.grow` `{hp 1.115, atk 1.072}` (pierwotnie 1.155 / 1.10). Wyniki bota: szybki Pyrtek ok. 46%, Zjarany ok. 55%, Indor ok. 59% (zostawiony), pełny Pyrtek ok. 46%.
- Łup z bossa to potężny zastrzyk: bez niego w trybie szybkim bot wygrywa o ok. 15 punktów proc. mniej. Wyniki: patrz podsumowanie etapu w `CLAUDE.md`.


## 14. Etap 2: nowe przedmioty i umiejętności (2026-11-22)

Pula: 121 kafelków (24 umiejętności, 50 przedmiotów, 27+9 statystyk, ryzyko bez zmian). `RUN_V = 4`.

### +14 przedmiotów (zestawy mają teraz 6–7 sztuk, próg 4 jest osiągalny)
| Zestaw | Nowe | Efekt |
|---|---|---|
| Rosołowe (7) | Wywar Dnia | gdy płonący wróg ginie, połowa jego stosów Oparzenia przechodzi na następnego (`burnSpread`) |
| | Tłusta Pokrywka | +1 Pancerza za każdy stos Oparzenia na wrogach, maks. +12 (`burnArmor`) |
| | Szczypta Soli | +20% obrażeń zadawanych wrogom z Oparzeniem (`vsBurn`) |
| Chłodnicze (6) | Lodowa Spódnica | wrogowie z Mrozem lub zamrożeni zadają o 30% mniej obrażeń (`frostWeak`) |
| | Szron Poranny | pierwszy cios walki nakłada 5 stosów Mrozu (`firstFrost`) |
| Jajeczne (6) | Jajko Niespodzianka | co 9 s wybuch 130% Ataku i losowy skutek: 3 stosy Oparzenia, Mrozu, Salmonelli, Krwawienia albo leczenie 8% (`surprise`) |
| | Kura Nioska | +1 Ziarno po wygranej za każdy przedmiot Jajeczny, maks. +4 (w `stats.js`) |
| Zbożowe (7) | Kombajn Zbożowy | 20% szans, że zwykły atak uderza też pozostałych za 40% (`cleave`) |
| | Spichlerz | +12 maks. Życia, +20% Ziaren z nagród (jedyny „liczbowy”) |
| | Strach na Wróble | wrogowie zaczynają ogłuszeni na 1,5 s, bossowie na 0,8 s (`scare`) |
| Rambo (7) | Karabin Maszynowy | 15% szans na podwójne uderzenie (`double`) |
| | Apteczka Polowa | raz na walkę, poniżej 50% Życia, leczy 25% (`medkit`) |
| Korporacyjne (6) | Służbowy Samochód | Odpoczynek za darmo (`restDisc 4`), leczenie po wygranej +10 pkt proc. |
| | Open Space | każda użyta umiejętność ma 12% szans na natychmiastowy reset cooldownu (`skillReset`, limit 60%) |

### +10 umiejętności (każda ma 2 Mutacje)
Ogień: **Wrzątek z Kotła** (podwaja Oparzenie na celu i +3; Wrzątek Hurtowy, Gotowanie na Wolnym Ogniu), **Podpałka** (6 s: każdy atak nakłada Oparzenie; Pochodnia, Długi Knot). Lód: **Mroźny Powiew** (3 stosy Mrozu na wszystkich; Zamieć, Szron na Piórach), **Sopel w Plecy** (110%, ×3 w wroga z Mrozem; Odłamki, Lodowa Seria). Trucizna: **Zakwas Babci Kwoki** (podwaja Salmonellę; Burzliwa Fermentacja, Zakwas Mamy). Krew: **Wyrywanie Pazurów** (100%, 3 Krwawienia, leczenie za stosy; Krwawy Taniec, Wampirze Pazury). Jajo: **Jajeczny Wir** (3 jaja po 70%; Jajecznica, Dziesiątka). Ziarno: **Garść Ziarna** (5 s +30% obrażeń i leczenie 10%; Wiadro Ziarna, Biesiada). Korpo: **Zwolnienie Dyscyplinarne** (130%, wróg poniżej 25% Życia, nie boss, odchodzi, +1 Ziarno; Odprawa, Restrukturyzacja). Styl obronny: **Kurze Pogotowie** (4 s leczenia 8% / s; Pełne Pogotowie, Dyżur Nocny).

Wszystkie efekty są w `sim.js` (nowe pola `igniteUntil`, `dmgUntil`, `hotUntil`, `ffDone`, `medUsed`, `nextSurprise`), statystyki w `stats.js`. Ikony: 24 nowe wpisy w `ICON` (`art.js`), kontrola wzrokowa i pełność: `dev/e2e-ikony.mjs`. Bot (`sim-balance.mjs`) zna nowe umiejętności i przybliża wartość nowych efektów w `power()`.

### Balans (bot)
Rozcieńczenie puli obniżyło wyniki (szybki 39%, pełny 38%), więc `grow` znów w dół: szybki `{1.125, 1.086}`, pełny `{1.109, 1.068}`. Wyniki: szybki Pyrtek 47%, Zjarany 53%, Indor 57%, Kwoka 65%, Kaczor 53%; pełny Pyrtek 46%. Statystyki kafelków (1500 runów pełnych): żaden nowy kafelek nie odstaje rażąco (przedmioty 58–80% wygranych wśród runów, które je miały, umiejętności 42–54%); najczęściej wybierany jest Karabin Maszynowy (70%).


## 15. Etap 3: ryzyko i legendarne przedmioty (2026-11-22)

Pula: 134 kafelki (6 nowych ryzyka, 6 legendarnych przedmiotów, wyklęty Dinozaur). `RUN_V = 5`.

### +6 kafelków ryzyka
| Kafelek | Zysk | Cena |
|---|---|---|
| Pożyczka Chwilówka | +15 Ziaren od razu (`coinsNow`) | -2 Ziarna po każdej wygranej rundzie; Lis jej nie przyjmuje (`noPawn`) |
| Dopalacz z Biedronki | +40% szybkości ataku | -25% maks. Życia |
| Nadgodziny Bez Dopłaty | +30% obrażeń | Odpoczynek leczy o połowę mniej (`restHalf`) |
| Dieta Cud z Kantyny (Zwykły) | +15 Pancerza | -30% szybkości ataku |
| Układ z Zarządem | +12 Ziaren od razu | następny boss +25% Życia (`bossBoost`, jak Zakazana Pasza) |
| Los na Loterii | +25 Szczęścia | -1 Ziarno po każdej wygranej rundzie |

### +6 legendarnych przedmiotów (rzadkość 3, flaga `legend`)
- **Droga zdobycia:** wypadają w zwykłych ofertach, rerollach, bonusach i Skrzynce, ale **dopiero od 60% runu** (`tileAvailable`: strefa III w trybie pełnym od piętra 13, w szybkim od piętra 7). Wagę rzadkości 3 (`RARITY_WEIGHTS`: 0 / 2 / 5) podbija Szczęście. Cena dokupienia 30 Ziaren.
- **Złoty Rosołek:** każde nałożenie efektu statusowego daje +1 stos (`allStatus`).
- **Kogut Alfa:** umiejętność w 1. slocie jest gotowa od początku walki i ma -50% cooldownu (`firstReady`, `alphaCd`).
- **Jajko Dinozaura:** kafelek rosnący (`grow` 5); po 5 wygranych piętrach zamienia się w **Dinozaura** (`hatched`, +60% Ataku i Życia); klient pokazuje okno „Wykluło się!” (`dino` w odpowiedzi `fightfinish`).
- **Plan B:** raz w każdej walce, po spadku do zera, wstajesz z 30% Życia i 3 s nietykalności (`planB`; działa też po Gnieździe Zapasowym).
- **Akcje Zarządu:** po wygranej +25% posiadanych Ziaren, maks. 12 (`bigInterest`).
- **Dziób Mistrza Ceremonii:** umiejętności mogą zadawać trafienia krytyczne (`skillCrit`, `inSkill` w `sim.js`), +15% krytyka.

### Balans
Szybki `grow` zmieniony na `{1.12, 1.083}` (pełny bez zmian `{1.109, 1.068}`). Bot: szybki Pyrtek 47%, Zjarany 54%, Indor 60%, Kwoka 66%, Kaczor 56%; pełny Pyrtek 47%. Legendarne mają bardzo wysoką skuteczność wśród runów, które je zdobyły (94–99%), ale to głównie efekt selekcji (dochodzą tylko runy po 60% drogi). Jeśli okażą się zbyt mocne w grze: podnieś próg 60% w `tileAvailable` albo obniż wagę rzadkości 3.


## 16. Dziewięć nowych postaci (2026-11-22)

Postaci jest 14 (`CHARS` w `data.js`), `RUN_V = 6`. Każda ma blokadę w `UNLOCKS` (kind `char`) i warunek w `profile.js` (`CHECKS`).

| Postać | Styl | Efekty | Odblokowanie |
|---|---|---|---|
| Kurczak Barista | Szybkie ciosy | +35% szybkości ataku, -30% Życia, -10% Ataku, start: Dziobnięcie Szału | Wygraj walkę w mniej niż sekundę |
| Gęś Księgowa | Ekonomia | +15 Ziaren, +1 Ziarno po rundzie, Odsetki do 6, -15% Ataku | Miej 200 Ziaren naraz |
| Kurczak Lodziarz | Mróz | 20% Mrozu przy ataku, wrogowie z Mrozem -10% obrażeń, -20% szybkości ataku, start: Lodowy Dziób | Zamroź 8 wrogów w jednym runie |
| Kura Pielęgniarka | Leczenie | +2 Regeneracji / s, leczenie po rundzie +10 pkt proc., -25% Ataku, start: Zagrzebanie | Wygraj walkę z mniej niż 10% życia |
| Kogut Rzeźnik | Krwawienie | każdy atak krwawi, limit +1, -15% Życia, -10% Ataku, start: Darcie Pierza | Pokonaj Skubarkę 3000 |
| Indyczka Wróżka | Szczęście | +20 Szczęścia, 1 darmowy reroll na rundę, -10% Życia | Zdobądź 3 Odznaki w jednym runie |
| Kurczak Stażysta | Powolny start | -25% Ataku i Życia, +6% wszystkich statystyk za każde wygrane piętro (maks. +60%; `perFloor`, `loadout.floors`) | Przegraj 5 runów |
| Kurczak Mutant | Umiejętności | -25% cooldownu, -20% Życia, losowa umiejętność na start (`randomSkill`, z ziarna runu) | Zmutuj 3 umiejętności w jednym runie |
| Dinozaur (sekretny) | Ukryty | start z Jajkiem Dinozaura (`startTiles`), -8% Ataku i Życia | Wyklu Dinozaura (`stats.dino`) |

Perliczka Strażniczka (unik z ripostą) została odłożona. Postacie rysuje wspólny szablon `HEN` w `art.js` (paleta + akcesoria); jajko Dinozaura jest sekretne jak Zjarany, ale hasło „dzioby” działa tylko dla Zjaranego (`hasCode`).

Balans bota (szybki / pełny): Barista 52 / 54%, Gęś 51 / 49%, Lodziarz 55 / 59%, Pielęgniarka 58 / 63%, Rzeźnik 59 / 54%, Wróżka 58 / 60%, Stażysta 47 / 48%, Mutant 55 / 56%, Dinozaur 52 / 56%. Pierwotnie Rzeźnik (bleed 3, +2 limitu) miał 86%, a Stażysta (+4%) 24%. Uwaga: „Cała Zagroda” (`a-zagroda`) i procent ukończenia gry liczą teraz 14 postaci. Test: `dev/e2e-postacie.mjs`.
