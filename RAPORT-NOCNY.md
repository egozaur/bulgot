# Raport z nocnej rozbudowy Bulgota (2026-11-21)

Wszystkie 5 zmian z planu jest zrobionych, przetestowanych i zacommitowanych **lokalnie** na gałęzi `rozbudowa` w obu repo (`pl3y-server` i `bulgot`). **Nic nie jest wypchnięte.** Produkcja działa jak wcześniej.

## Co trzeba zrobić rano

1. Zagraj lokalnie: serwer plików (`LOBBY='C:\Users\Kurczak\pl3y\egozaur.github.io' node C:\Users\Kurczak\tools\scripts\serve.mjs 'C:\Users\Kurczak\pl3y' 8090`), potem `http://localhost:8090/bulgot/?local=1`. Gra działa wtedy na kodzie z gałęzi `rozbudowa`.
2. Jeśli jest OK, napisz „wypychaj”. Wypchnięcie to: merge `rozbudowa` → `main` w obu repo i push. `pl3y-server` najpierw, bo frontend woła nową akcję `choose`.
3. Na `main` w obu repo jest też jeden wcześniejszy, niewypchnięty commit z wieczora (Odpoczynek, krótsze cooldowny, Ostry Dziób, Zebranie Zarządu). Wejdzie razem z rozbudową.

## Co doszło

| # | Zmiana | Ile |
|---|---|---|
| 1 | **Efekty statusowe**: Oparzenie, Mróz (5 stosów = zamrożenie), Salmonella (przechodzi na kolejnego wroga), kumulujące się Krwawienie; ikonki ze stosami nad wrogami | 4 efekty, 7 żywiołów na kartach |
| 2 | **Umiejętności i Mutacje**: trzecia kopia umiejętności = wybór 1 z 2 gałęzi | 6 → 14 umiejętności, 28 Mutacji |
| 3 | **Przedmioty i zestawy**: Rosołowe, Chłodnicze, Korporacyjne (progi 2/3/4), Polisa chroni przed Lisem | 10 → 25 przedmiotów, 3 → 6 zestawów |
| 4 | **Wylęgarnia**: pary przedmiotów wykluwają legendarne; progi statystyk co 3 kopie; zakładka w Księdze z „?” dla nieodkrytych | 8 przepisów, 9 progów |
| 5 | **Odznaki i elity**: Odznaka 1 z 3 po bossie i elicie; elity z cechami od Garnka 0; nowi wrogowie i wydarzenia | 12 Odznak, 7 cech, 3 wrogów, 3 wydarzenia |

Kafelków w ofertach: 31 → 54. Do odblokowania osiągnięciami jest 19 kafelków (było 10), w tym Kogucia Kontra, Dziobanie Premii, Egzekucja Ostrogą, Garnek Ciśnieniowy, Szron, Premia Kwartalna i Kontrakt z HR.

## Trudność (bot, 1000 runów)

Cel był: rozsądny gracz zwykle nie wygrywa w pierwszych kilku grach. Ty dotąd grałeś słabiej niż bot, więc bot ustawiony jest w okolicach 60%.

| | Pełny | Szybki |
|---|---|---|
| Garnek 0 | 59,5% | 59,5% |
| Garnek 2 | ~50% | ~48% |
| Garnek 4 | ~37% | ~34% |
| Garnek 5 | 14% | 21% |
| Nowy gracz (tylko kafelki startowe) | 49% | 55% |

Najważniejsze zmiany w trudności:
- **Elity są od Garnka 0** (pełny: piętra 4, 10, 16; szybki: 4, 8) i zawsze dają Odznakę. Przychodzą najwyżej z jednym pomocnikiem.
- **Strefa III** w pełnym trybie ma groźniejszych zwykłych wrogów, bo wcześniej piętra 13–19 były prawie darmowe.
- **Prezes** jest mocniejszy (finał ma straszyć).
- **Garnek 5**: regeneracja działa o połowę słabiej (wcześniej była wyłączona) i wrogowie mają +5% ataku zamiast +15%. Po rozbudowie stary Garnek 5 był prawie niewygrywalny.
- **Porażki rozkładają się teraz na elity i bossów** (po 2–6% runów każdy), a nie na jedno piętro.

## Testy

- Serwer: **195/195** (było 181; nowe testy dla każdego systemu).
- Przeglądarka (Edge): `smoke.mjs`, `e2e-sciezki.mjs`, `e2e-odpoczynek.mjs`, `e2e-ui.mjs` przechodzą. Nowy `dev/e2e-rozbudowa.mjs` sprawdza Mutację, efekty w walce, zestawy, Wylęgarnię, Odznakę, Kontrakt, Kapliczkę, podgląd elity i Księgę.
- Poprawione stare testy:
  - `e2e-sciezki`: po bossie jest teraz Odznaka.
  - `e2e-ui`: piętro 4 to teraz elita. Do tego miał nieaktualne oczekiwanie liczby kafelków po dokupieniu umiejętności, które było błędne już przed rozbudową.

## Na co uważać przy graniu

- **Pierwsza elita na 4. piętrze** to nowy skok trudności. Jeśli będzie za ostro: `MODES.*.elite` w `data.js` (np. `[5, 10, 16]`).
- **Kaczka Podpalaczka** (strefa I) podpala bohatera. Jeśli wczesne piętra będą za ciężkie: `ignite` w `ENEMIES` (teraz 30).
- **Bot nie gra jak człowiek**: przedmioty i Odznaki ocenia przybliżonym wzorem. Daj znać, które kafelki wydają się za mocne albo bez sensu. Do analizy jest `node dev/sim-balance.mjs --tilestats` i historia gier (Menu → Historia).
- **Walka rozpoczęta przed wdrożeniem i dokończona po nim** liczy się nowym silnikiem, więc wynik serwera może się wtedy różnić od animacji. Może się to zdarzyć najwyżej raz na gracza.

## Dokumentacja

`DESIGN.md` sekcja 10 (projekt i tabela balansu), `PRZEKAZANIE.md` sekcja 11 (gdzie co jest i przepisy na nową Mutację, przepis Wylęgarni, Odznakę), `CLAUDE.md` w obu repo (protokół: `mut`, `choose`).
