---
name: bulgot-test
description: Dobór i uruchamianie właściwych testów Bulgota (serwer, e2e w Edge, symulator) do zakresu zmiany, bez odpalania wszystkiego. Użyj przed uznaniem zadania za ukończone albo gdy trzeba sprawdzić, czy zmiana nie psuje innych systemów.
---
# Testy Bulgota

## Kiedy
Po zmianie kodu, przed commitem, na prośbę o weryfikację.

## Procedura
1. Ustal zakres zmiany (`git diff --stat`, bez czytania całych plików).
2. Wybierz testy z tabeli „Który test do jakiej zmiany” w `.claude/context/development-workflow.md`.
3. **Serwer, zawsze najpierw** (ok. 3 s, ok. 146 testów):
   `export PATH="/c/Users/Kurczak/tools/node:$PATH"; cd ../pl3y-server && node --test --test-name-pattern="bulgot" test/all.test.js`
   Pełny zestaw (ok. 40 s) tylko gdy zmieniono kod wspólny serwera (`core`, `index.js`, `wrangler.toml`).
4. **E2E w Edge**: serwer plików (`node C:\Users\Kurczak\tools\scripts\serve.mjs C:\Users\Kurczak\pl3y 8090`, w tle, tylko jeśli nie działa), potem z `C:\Users\Kurczak\tools\pt`: `node C:\Users\Kurczak\pl3y\bulgot\dev\<test>.mjs <katalog na zrzuty poza repo>`. `smoke` przyjmuje tryb zamiast katalogu.
5. Padający test: ustal, czy to regresja, czy test zakładał stary stan (np. nowe `RUN_V`, nowy układ). Napraw przyczynę; nie osłabiaj asercji bez uzasadnienia.
6. Zatrzymaj serwer plików, jeśli go uruchomiłeś.

## Unikaj
Całego zestawu e2e „dla pewności”, ponownego uruchamiania zielonych testów bez zmiany kodu, zapisywania zrzutów w repo.

## Gotowe, gdy
Testy obszaru są zielone, a w raporcie wymieniono, co uruchomiono i czego nie.
