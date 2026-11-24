---
name: bulgot-debug
description: Diagnoza błędów w Bulgocie (zły wynik walki, rozjazd klient/serwer, unieważniony run, błąd ekranu, 400/409 z serwera, problem z układem). Użyj, gdy coś nie działa lub zgłoszono bug (w tym screen z folderu bugi albo analiza gracza).
---
# Debugowanie Bulgota

## Kiedy
Zgłoszenie błędu, nieoczekiwany wynik, wyjątek w konsoli, błąd serwera, rozjazd powtórki walki.

## Zbierz najpierw
- Dokładny objaw i faza runu (`run.phase`), tryb (szybki/pełny), postać, palnik, `RUN_V`.
- Warstwa: **serwer** (kod `err`/`code` w odpowiedzi), **silnik** (wynik walki) czy **klient** (konsola, układ)?
- Błędy graczy: analizy w `../analizy-bulgot/*.json` (pobieranie: `dev/pobierz-analizy.mjs`, wymaga klucza admina, patrz pamięć „Klucz admina”) i akcja `history` (dziennik rund). Nie pobieraj ponownie, jeśli plik już jest.
- Screeny: `C:\Users\Kurczak\pl3y\bugi`.

## Procedura
1. **Odtwórz lokalnie**: `?local=1` (ten sam kod serwera w przeglądarce) albo test. Dla serwera najpierw napisz test, który pada (`bulgot.suite.js`, helper `fresh()`).
2. **Zawęź warstwę**:
   - Odpowiedź serwera: `player.js` `handle()` → funkcja w `rules.js`; kody błędów to krótkie ciągi (`phase`, `index`, `copies`, `mut`…).
   - Wynik walki różni się od widzianego przez gracza: najpierw sprawdź, czy `shared/` jest zsynchronizowane (`node dev/sync-engine.mjs`, `git diff --stat shared/`), potem czy `setup` i wejścia `[tick, slot]` są te same. Efekty tylko wizualne nie mogą zmieniać silnika.
   - Run „voided”: różnica `RUN_V` (celowa po aktualizacji).
   - Układ/wygląd: klasy CSS, `applyScale()`/`--vh`, rozdzielczości z `dev/e2e-uklad.mjs`.
3. **Przyczyna, nie objaw**: znajdź pierwszy moment, w którym stan odbiega od oczekiwanego (`Grep` po nazwie funkcji, `Read` z `offset`/`limit`).
4. **Minimalna poprawka** w jednym miejscu, bez refaktoryzacji.
5. Uruchom test, który padał, i testy obszaru (`development-workflow.md`).

## Unikaj
Skanowania wszystkich modułów `ui/`; poprawek w `shared/` (źródło na serwerze); poprawek „na wszelki wypadek” w niezwiązanym kodzie; powtarzania tych samych wyszukiwań.

## Gotowe, gdy
Jest test lub e2e odtwarzający błąd (zielony po poprawce), przyczyna opisana jednym zdaniem, brak regresji w testach obszaru.
