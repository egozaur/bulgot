# Bulgot: stan gry i etap rozbudowy (2026-11-21)

Krótkie podsumowanie całej gry w jednym miejscu. Szczegóły: `DESIGN.md` (projekt i balans), `PRZEKAZANIE.md` (jak to działa w kodzie), `RAPORT-NOCNY.md` (nocna rozbudowa).

## 1. Czym jest gra

**Bulgot, „Awans albo rosół”**: solo roguelike w przeglądarce, gra nr 7 na **pl3y.pl/bulgot/**. Kurczak Pyrtek ucieka po piętrach fabryki rosołu Korporacji Rosołowej S.A., żeby pokonać Prezesa Rosołu. Ton to epicka parodia z narratorem Kronikarzem. Grafika to kreskówkowy wektor rysowany w kodzie, dźwięk generuje WebAudio. Do gry potrzebny jest nick z PIN-em z lobby.

## 2. Jak się gra

Jedna runda (piętro):
0. **Rozwidlenie Korytarza** (na wybranych piętrach): zwykłe drzwi albo „Tylko dla personelu” (wróg z cechą elity za Ziarna albo rzadki kafelek).
1. **Oferta 4 kafelków.** Jeden bierzesz za darmo, resztę możesz dokupić za Ziarna (6/12/20/30 wg rzadkości). Możesz zrobić reroll (2, 3, 4… Ziaren), odpocząć (4 Ziarna = +20% Życia, raz na rundę) albo zastawić kafelek w Lombardzie Lisa. Czasem jeden kafelek ma Wadę fabryczną (+50%, ukryta wada).
2. **Walka automatyczna.** Kurczak bije się sam, a ty klikasz 3 umiejętności (1/2/3) w dobrym momencie; seria umiejętności w 1,5 s bije mocniej (Okno Gdakania), a pary efektów dają Reakcje. Po 45 s wrogowie wpadają w Furię, a po 90 s walka jest przegrana.
3. **Nagroda.** Ziarna (4 za rundę, 6 za bossa, plus Odsetki: +1 za każde 10 niewydanych, maks. 3) i 35% Życia. Po bossie albo elicie dostajesz Odznakę, a po bossie dodatkowo 3 rzadkie kafelki do wyboru.

| | Tryb szybki | Tryb pełny |
|---|---|---|
| Piętra | 10 | 20 |
| Bossowie | Brojler Zdzisław (5), Prezes Rosołu (10) | Brojler (6), Skubarka 3000 (12), Prezes (20) |
| Elity | piętra 4, 8 | piętra 4, 10, 16 |
| Strefy | Kurnik i Podwórze, Magazyn Pasz i Chłodnia | + Sortownia Jaj i Biuro Zarządu |
| Rozwidlenia | piętra 2, 6, 9 | piętra 2, 5, 8, 11, 14, 17 |

Każda strefa ma w runie inny **Okólnik Zarządu** (modyfikator zasad). Między runami: **Nemezis** (wróg, który cię zabił, awansuje, kradnie kafelek i czeka w następnym runie) i **Testament Pyrtka** (po przegranej zapisujesz kafelek do pierwszej oferty następnego runu).

**Wynik** = (1000 × piętra + 50 × Ziarna + premia za szybkość do 2000) × (1 + 25% × poziom Garnka). Ranking jest osobno dla trybu szybkiego i pełnego.
**Temperatura Garnka 0–5** to poziom trudności. Wygrana na poziomie N odblokowuje N+1.
**Sterowanie**: myszka albo klawiatura. Strzałki z Enterem obsługują karty, przyciski i okna. Skróty: 1–5 wybór, Shift+1–5 dokup, R reroll, O odpoczynek, L Lombard, w walce 1/2/3, P pauza, F szybkość.

## 3. Zawartość

| Element | Ile | Przykłady |
|---|---|---|
| Kafelki w ofertach | **60** (43 od startu, 17 do odblokowania) | |
| – rosnące | 3 | Pierze Weterana, Trofeum z Piór, Skarbonka Pisklęcia |
| – statystyki | 9 | Ziarno Mocy, Ostry Dziób, Twardy Grzebień, Czterolistna Koniczyna |
| – umiejętności aktywne | 14 | Kukurydziany Grad, Pianie Grozy, Jajeczny Granat, Rosołowy Chlust, Lodowy Dziób, Egzekucja Ostrogą |
| – przedmioty | 25 w 6 zestawach | Jajeczne, Zbożowe, Rambo, Rosołowe, Chłodnicze, Korporacyjne (bonusy od 2, 3, 4 sztuk) |
| – ryzyka i wydarzenia | 9 | Pakt z Lisem, Zakazana Pasza, Sklepik Babci Kwoki, Hazard, Skrzynka, Automat z Paszą, Kontrakt z HR, Kapliczka |
| Mutacje umiejętności | 28 (po 2 na umiejętność) | trzecia kopia = wybór gałęzi, np. Granat Kasetowy albo Granat Wrzący |
| Wylęgarnia | 8 przepisów | Tykające Jajo + Kostka Rosołowa = Jajko na Twardo |
| Progi statystyk | 9 | 3× Ziarno Mocy = Kolba Mocy (+15% Ataku) |
| Efekty statusowe | 4 | Oparzenie, Mróz (zamrożenie), Salmonella (przechodzi dalej), Krwawienie |
| Reakcje | 3 | Szok Termiczny, Gorączka, Kruchość |
| Okólniki Zarządu | 6 | Oszczędności Energii, Audyt Wydatków, Wyjazd Integracyjny, Premia Motywacyjna, Praca Zdalna, Tryb Pilny |
| Wady fabryczne | 6 | Samozapłon, Rozklejony, Wybuchowa Usterka, Ciężki, Kruchy, Żarłoczny |
| Odznaki Pracownicze | 12 + 1 | Awans, Parasol Ochronny, Team Building, Pracownik Miesiąca; Sprawiedliwość Kurnika tylko za Nemezis |
| Wrogowie | 12 + stażysta | Szczur Pasz, Lis Windykator, Wózek Widłowy, Bałwan z Chłodni, Kaczka Podpalaczka, Kurczak z Zamrażarki, Sęp Audytor |
| Cechy elit | 7 | Opancerzony, Wampiryczny, Wybuchowy, Ognioodporny, Mroźny, Szybki, Regenerujący |
| Bossowie | 3, każdy z fazami | Brojler (wzywa stażystów), Skubarka 3000 (tarcza, Skubanie kafelków), Prezes (Ochroniarze, Restrukturyzacja, Wrzący Garnek) |
| Postacie | 4 | Pyrtek (start), Kwoka Babcia (czołg), Kaczor Hazardzista (ryzyko), Indor Bogdan (ciężkie ciosy) |
| Formy kurczaka | 4 | Pyrtek → Kogut → Kogut Bojowy → Rambo Chicken (w trakcie runu) |
| Odblokowania | 20 (17 kafelków, 3 postacie) | lista z warunkami w Księdze Kurnika |

**Księga Kurnika** ma zakładki: Kafelki, Wylęgarnia (odkryte przepisy, reszta jako „?”), Reakcje i Okólniki (odkryte reakcje, okólniki, wady, Nemezis), Odznaki i cechy elit, Postacie, Wrogowie, Odblokowania.

## 4. Jak to działa technicznie

- **Trzy repozytoria**: `bulgot` (frontend, GitHub Pages), `pl3y-server` (cała logika w `src/games/bulgot/`, Cloudflare Worker + Durable Objects), `egozaur.github.io` (lobby).
- **Serwer liczy wszystko, co ma znaczenie.** Losuje oferty z ziarna, którego klient nie widzi, i powtarza każdą walkę z kliknięć gracza, więc wyniku nie da się podrobić. Ten sam deterministyczny silnik walki chodzi w przeglądarce (`shared/`, generowane) i na serwerze.
- **Gdzie co edytować**: treść w `data.js`, reguły runu w `rules.js`, walka w `sim.js`, statystyki w `stats.js`, interfejs w `app.js`, grafika w `art.js`, teksty w `text.js`.
- **Tryb lokalny**: `?local=1` uruchamia kod serwera w przeglądarce, więc całość testuje się bez internetu.
- **Testy**: 205 testów serwera i 7 testów w przeglądarce (Edge): smoke, ścieżki, odpoczynek, UI, rozbudowa, strzałki, jeszcze (10 mechanik retencji). Do strojenia trudności służy symulator `dev/sim-balance.mjs`.

## 5. Na jakim etapie jesteśmy

| Etap | Data | Stan |
|---|---|---|
| 1. Pierwsza wersja (31 kafelków, 9 wrogów, 3 bossów, 4 postacie, ranking, Garnek) | 2026-11-21 | na produkcji |
| 2. Poprawki po pierwszych 5 grach (dokupowanie, Odpoczynek, krótsze cooldowny, Zebranie Zarządu) | 2026-11-21 | na produkcji |
| 3. Wielka rozbudowa (efekty, Mutacje, 25 przedmiotów, Wylęgarnia, Odznaki, elity, nowi wrogowie i wydarzenia) | 2026-11-21, noc | na produkcji |
| 4. Sterowanie strzałkami i Enterem | 2026-11-21 | na produkcji |
| 5. Rozbudowa „jeszcze jedna partia” (Reakcje, Okno Gdakania, kafelki rosnące, Rozwidlenie, Lombard, Odsetki, Okólniki, Wadliwa Partia, Nemezis, Testament) + przestrojenie wzrostu wrogów | 2026-11-21 | na produkcji |
| 6. **Dostrojenie trudności po grze ludzi** | teraz | **do zrobienia** |

**Balans (bot, 600–800 runów, po rozbudowie „jeszcze jedna partia”):** Garnek 0 to 60% (pełny) i 57% (szybki), Garnek 2 ok. 52%, Garnek 5 17–19%. Szczegóły: `DESIGN.md` sekcja 11.
**Pierwszy test po rozbudowie:** właściciel wygrał tryb pełny za pierwszym razem (22 421 pkt). Cel był taki, żeby rozsądny gracz zwykle przegrywał kilka pierwszych gier, więc **Garnek 0 jest prawdopodobnie za łatwy**. Dźwignie: tempo wzrostu wrogów (`MODES.*.grow`), siła elit i bossów, mnożnik strefy (`zoneMul`).

## 6. Rzeczy tymczasowe i otwarte

- **Historia gier (test)**: Menu → Historia. Służy do analizy balansu, do usunięcia po testach.
- Odłożone pomysły: dzienny seed z rankingiem, co-op i pojedynki „duchów”, kosmetyka (czapeczki), podpowiedź przed walką (twoje obrażenia na sekundę kontra życie wrogów).
- Do obserwacji: czy pierwsza elita na 4. piętrze i Kaczka Podpalaczka nie są za ostre dla nowych graczy, i które kafelki gracze uznają za za mocne albo bezużyteczne (`sim-balance.mjs --tilestats`).
