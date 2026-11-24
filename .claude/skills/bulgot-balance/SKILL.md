---
name: bulgot-balance
description: Pomiar i strojenie balansu Bulgota symulatorem (bot gra setki runów). Użyj przy zmianie statystyk wrogów, bossów, cen, dochodu Ziaren, wartości kafelków, postaci, palników, wzrostu trudności.
---
# Balans Bulgota

## Kiedy
Każda zmiana wpływająca na siłę gracza lub wrogów. Nie stroi się „na oko”.

## Zbierz
- Sekcje `DESIGN.md` o balansie dla obszaru (9, 17, 27, 30) i `archiwum/propozycje-raporty/raport-2026-11-24.md`: punkt odniesienia już masz, nie mierz go od nowa.
- Pyrtek jest neutralnym wzorcem; liczby wygranych bota na palnikach 0–5 są w `DESIGN.md` sekcja 17 (mogły się zmienić w późniejszych sekcjach).

## Procedura
1. Z katalogu `bulgot`, niski priorytet (Node: `export PATH="/c/Users/Kurczak/tools/node:$PATH"`):
   `node -r ./dev/lib-prio.cjs dev/sim-balance.mjs --mode full --garnek 4 --char pyrtek --n 200 --table`
   Nagłówek `dev/sim-balance.mjs` opisuje flagi (`--tpl`, `--rule 'k=v;k2=[1,2]'`, `--grant`, `--arch`, `--prefer`, `--curses`, `--endless`, `--json`).
2. Zmierz **stan przed** na tym samym `--n` i palniku, potem po zmianie.
3. Pomiar pojedynczej mechaniki: nadpisz `RULES`/`MODES` przez `--rule` zamiast edytować dane.
4. Wiele konfiguracji (postacie × palniki): `dev/analiza-ev.mjs` (wznawialny, niski priorytet, własny limit czasu). **Maks. 6 procesów równolegle**; właściciel w tym czasie gra.
5. Zacznij od `--n 100–200`; 1000 dopiero, gdy różnica mieści się w szumie (przy 200 runach błąd rzędu ±3,5 pkt proc.).
6. Po zmianie ekonomii (ceny, dochód) przestrój `MODES.*.grow`; po zmianie spotkań podbij `RUN_V`.
7. Zapisz liczby przed/po w odpowiedniej sekcji `DESIGN.md` (krótko, tabelką).

## Unikaj
Powtarzania pomiaru bez zmiany, 1000 runów „na start”, zmiany wielu parametrów naraz, edycji `shared/` (źródło na serwerze, potem `sync-engine`).

## Gotowe, gdy
Wyniki przed/po są w `DESIGN.md`, wygrane mieszczą się w zamierzonym przedziale na konfiguracjach kontrolnych, testy `bulgot` zielone.
