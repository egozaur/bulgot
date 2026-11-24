---
name: bulgot-feature
description: Dodawanie lub zmiana mechaniki Bulgota (nowy kafelek, umiejętność, postać, wróg/boss, akcja serwera, ekran). Użyj, gdy zadanie tworzy nową treść lub zmienia reguły gry; zawiera listy kroków, żeby niczego nie pominąć (ikona, animacja, bot, synchronizacja silnika, RUN_V).
---
# Rozwój funkcji Bulgota

## Kiedy
Nowa treść (kafelek, umiejętność, postać, wróg, boss, wydarzenie), nowa akcja protokołu, zmiana reguł runu lub nowy ekran/okno. Do samych poprawek wyglądu wystarczą reguły `client-ui`, bez tego skilla.

## Zbierz (maks. 3 odczyty, zanim zaczniesz pisać)
1. Wiersz w `.claude/context/systems-index.md` dla obszaru, potem sekcja `DESIGN.md` (`Grep -n "^## N"`, `Read` z `offset`/`limit`).
2. Wzorzec: **najbliższy istniejący wpis** tego samego typu (`Grep` po id w `data.js`); skopiuj jego kształt.
3. Wpis w `notatki-silnik.md` / `notatki-klient.md` (po tytule), jeśli dotykasz mechaniki z pułapkami (np. `RUN_V`, hordy, `view()`).

## Listy kroków (kod serwera: `../pl3y-server/src/games/bulgot/`)
- **Kafelek (statystyka/przedmiot):** obiekt w `TILES` (`data.js`), ikona w `art.js` `ICON` (rodziny statystyk: `ICON_OF`), nowy efekt w `stats.js`/`sim.js` tylko jeśli potrzebny. Kafelki `hatched` i `hidden` nie trafiają do ofert.
- **Umiejętność:** wpis w `SKILLS` **i** `TILES` (z Mutacjami), ikona `ICON`, receptura animacji `fx.js` `RECIPES[id]`, obsługa w `botInputs` w `dev/sim-balance.mjs` (inaczej bot jej nie użyje). Testy: `e2e-ikony`, `e2e-efekty`.
- **Postać:** `CHARS` + `UNLOCKS` (`data.js`), `CHECKS` (`profile.js`), `CHAR_PERKS` (`text.js`, zgodne z `CHARS`), ciało w `art.js` `NEWBODY`, rosół `c-<id>` w `SOUPS`; dodaj do `CHAR_IDS`, jeśli aktywna. Starych postaci nie usuwaj (`retired: true`).
- **Wróg/boss:** `ENEMIES` / `BOSSES` / `BOSS_POOL` (mechaniki to lista `mech`); intro `T.BOSS_INTRO` tylko dla oryginałów; strój symulatorem (skill `bulgot-balance`).
- **Akcja serwera:** funkcja w `rules.js`, `case` w `player.js`, wpis w `.claude/context/protocol.md`, wywołanie w kliencie (`act()` / `ACT`), test w `bulgot.suite.js`. Pamiętaj o `view()` (bez `seed`).
- **Ekran/okno w kliencie:** funkcja `show…`/`stage…` we właściwym module `ui/` (mapa w `systems-index.md`), wpis w `ACT` (`ui/input.js`), styl w `style.css`, test `e2e-*` z tabeli w `development-workflow.md`.

## Po zmianie silnika (kolejność)
1. Testy serwera Bulgota (ok. 3 s): `cd ../pl3y-server && node --test --test-name-pattern="bulgot" test/all.test.js`.
2. `node dev/sync-engine.mjs`.
3. `RUN_V` w `rules.js`: podbij, jeśli zmieniły się spotkania lub powtórka walki.
4. Pomiar balansu zmienionego obszaru (skill `bulgot-balance`).
5. Test e2e obszaru (tabela w `development-workflow.md`).
6. Krótki wpis do odpowiedniej sekcji `DESIGN.md` (nowa sekcja tylko dla dużej aktualizacji) i, jeśli to pułapka dla przyszłych zmian, jedna linijka w `notatki-silnik.md`/`notatki-klient.md`. Nie rozbudowuj `CLAUDE.md`.

## Unikaj
Ręcznej edycji `shared/*.js`; `Math.random`/`Date` w silniku; zmian wyglądu `.tile`; mechanik „obok” `data.js`; pushu bez pytania.

## Gotowe, gdy
Testy `bulgot` zielone, `shared/` zsynchronizowane, e2e obszaru przeszedł, balans zmierzony (dla treści wpływającej na siłę), dokumentacja uzupełniona, nic nie wypchnięte bez zgody.
