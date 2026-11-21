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
| Tempo ataku | 1,0 / s | Liczba ciosów na sekundę |
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
| Szybki Dziób | +10% tempa ataku | Zwykły |
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
| Dziobnięcie Szału | +50% tempa ataku przez 6 s | 12 s | Rzadki |
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
| Kamizelka Kuloodporna | +15 Pancerza, -10% tempa ataku | Rambo | Zwykły |
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
| Brojler Zdzisław, Szef Zmiany | 6 (szybki: 5) | Co 15 s wzywa 2 Pisklaki-stażystów | Poniżej 50% Życia: Premia Motywacyjna, +30% tempa ataku | brak |
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
| II | Bałwan z Chłodni | Każdym trafieniem spowalnia tempo ataku gracza o 20% |
| III | Jajo-Sortownik | Robot z tarczą pochłaniającą pierwsze 3 ciosy |
| III | Kot Ochroniarz | Wysoki unik i krytyk |
| III | Księgowy Kanarek | Każdy cios zabiera 1 Ziarno |

Poziomy trudności dodają wrogów elitarnych (jeden na strefę, +50% nagród), ale zasady ich zachowań są te same, więc nowe treści dokłada się danymi.

## 6. Postacie, meta-progres i trudność

Między runami odblokowujesz wyłącznie nowe opcje (postacie i kafelki), nigdy stałą przewagę w sile, więc ranking pozostaje uczciwy. Postęp zapisuje się na koncie w Księdze Kurnika.

| Postać | Styl | Bonus startowy | Odblokowanie |
|---|---|---|---|
| Pyrtek | Uniwersalny | Statystyki bazowe | Od startu |
| Kwoka Babcia | Czołg | +30% Życia, -20% tempa ataku, start z umiejętnością Zagrzebanie w Sianie | Ukończ pełny run |
| Kaczor Hazardzista | Ryzyko | +10 Ziaren, 1 darmowy reroll na rundę, więcej kafelków ryzyka w ofertach | Weź 5 kafelków ryzyka w jednym runie |
| Indor Bogdan | Ciężkie ciosy | +60% Ataku, -30% tempa ataku, 15% szansy na trafienie krytyczne | Pokonaj Prezesa Rosołu w trybie szybkim |

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
| 4 | Kipiący | Bossowie mają +20% tempa ataku |
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
