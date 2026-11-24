---
name: bulgot-review
description: Przegląd zmian w Bulgocie pod kątem pułapek tego projektu (determinizm, synchronizacja shared/, RUN_V, wycieki w view(), zamrożony wygląd kafelków, układ, dwa repozytoria). Uzupełnia ogólny /code-review; użyj przed commitem większej zmiany.
---
# Przegląd zmian Bulgota

## Kiedy
Przed commitem zmian w silniku, danych, kliencie albo w zmianie obejmującej oba repo.

## Zbierz
`git status --short` i `git diff --stat` w `bulgot` oraz w `../pl3y-server` (zmiana silnika dotyka obu). Czytaj tylko zmienione fragmenty (`git diff -U3 -- <plik>`).

## Lista kontrolna
1. **Zgodność kopii**: `shared/*.js` = serwer (po `node dev/sync-engine.mjs` brak nowych różnic). Zmiana silnika zacommitowana w obu repo.
2. **Determinizm**: brak `Math.random`, `Date`, trygonometrii w `sim.js`/`stats.js`/`rng.js`; klient nie dodaje ticków ani wejść dla efektów.
3. **`RUN_V`** podbity, jeśli zmieniły się spotkania lub powtórka walki.
4. **`view()`** nie ujawnia `seed`, przyszłych ofert ani spotkań.
5. **Serwer decyduje**: nic istotnego dla rankingu nie jest liczone tylko w kliencie.
6. **Kompletność treści**: nowa umiejętność ma ikonę, recepturę `fx.js`, obsługę w `botInputs`; nowa postać ma wpisy w `UNLOCKS`, `CHECKS`, `CHAR_PERKS`, `NEWBODY` i rosół.
7. **Interfejs**: brak `100vh`, `.tile` bez zmian wyglądu, tekst dynamiczny przez `esc()`, animacje szanują `html.reduce`, układ nie przekracza `DESIGN_H`.
8. **DO i migracje** w `wrangler.toml` nietknięte.
9. **Testy** dodane lub zaktualizowane i uruchomione właściwe (nie cały zestaw bez potrzeby).
10. **Dokumentacja**: zmiana odzwierciedlona w `DESIGN.md`/notatkach (krótko); `CLAUDE.md` nie urósł.
11. Nic nie wypchnięto bez zgody właściciela.

## Wynik
Lista problemów z plikiem i linią, wg wagi; osobno „do decyzji właściciela”. Bez przepisywania całego diffu.

## Gotowe, gdy
Każdy punkt jest sprawdzony (tak / nie / nie dotyczy), a problemy mają konkretne propozycje poprawek.
