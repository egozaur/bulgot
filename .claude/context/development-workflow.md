# Bulgot: przepływ pracy, testy, kontekst

Komendy sprawdzone 2026-11-24. Node jest przenośny: `export PATH="/c/Users/Kurczak/tools/node:$PATH"` (w każdym nowym wywołaniu Bash).

## Komendy

| Cel | Komenda |
|---|---|
| **Tylko testy Bulgota (146 testów, ok. 3 s)** | `cd ../pl3y-server && node --test --test-name-pattern="bulgot" test/all.test.js` |
| Wszystkie testy serwera (ok. 40 s; tylko gdy zmiana dotyka kodu wspólnego: `core`, `index.js`) | `cd ../pl3y-server && node --test test/all.test.js` |
| **Testy obszaru jednym poleceniem** (serwer plików i Edge startują same; zrzuty do katalogu tymczasowego) | `node dev/test-area.mjs <obszar>[,<obszar>]` (lista: `--list`; np. `serwer`, `silnik`, `panel`, `walka`, `start`, `smoke`) |
| Czy `shared/` = silnik serwera | `node dev/check-sync.mjs` (lokalny hook `pre-commit` w `.git/hooks` blokuje commit przy rozjeździe; hook nie jest wersjonowany) |
| Streszczenie analiz graczy | `node dev/podsumuj-analizy.mjs --since <data>` (pobieranie: skill `bulgot-analizy`) |
| Kopia silnika do `shared/` | `node dev/sync-engine.mjs` (po każdej zmianie `rng.js`/`data.js`/`stats.js`/`sim.js` na serwerze) |
| Serwer plików do testów lokalnych | `node C:\Users\Kurczak\tools\scripts\serve.mjs C:\Users\Kurczak\pl3y 8090` (z `LOBBY=…\egozaur.github.io`), gra: `http://localhost:8090/bulgot/?local=1` |
| Test w Edge | z `C:\Users\Kurczak\tools\pt`: `node C:\Users\Kurczak\pl3y\bulgot\dev\<test>.mjs <katalog na zrzuty>` (`smoke` bierze tryb, nie katalog); wymaga serwera plików na 8090 |
| Symulacja balansu | `node dev/sim-balance.mjs --mode full --n 1000 --table` (nagłówek pliku opisuje wszystkie flagi) |

## Który test do jakiej zmiany

| Zmiana | Uruchom |
|---|---|
| silnik/reguły/dane (serwer) | testy `bulgot` (3 s) + `sync-engine` + `sim-balance` na zmienionym obszarze |
| ekran runu, panel, schody | `e2e-uklad`, `e2e-panel`, `e2e-schody` |
| walka na ekranie, animacje | `e2e-walka`, `e2e-efekty` |
| start, postacie, jajka | `e2e-start`, `e2e-postacie`, `e2e-ukryte` |
| faktura/tablica | `e2e-faktura` |
| ekran końca, analiza | `e2e-analiza` |
| podpowiedzi | `e2e-podpowiedzi` |
| Staż, Sklepik, Dyżur | `e2e-staz` |
| kasyno | `e2e-kasyno` |
| pojedynek | `e2e-pojedynek` (+ testy serwera „Pojedynek…”) |
| Księga | `e2e-ksiega` |
| poziomy kafelków, ikony | `e2e-poziomy`, `e2e-ikony` |
| nowości (trasy, Klątwy, Dogrywka) | `e2e-nowosci`; dodatkowe rundy: `e2e-extra` |
| ogólny, szybki sprawdzian po dowolnej zmianie klienta | `smoke` |

Skrót: obszary w `dev/test-area.mjs` odpowiadają wierszom tej tabeli. Pozostałe e2e (`e2e-ui`, `-sciezki`, `-odpoczynek`, `-rozbudowa`, `-strzalki`, `-jeszcze`) uruchamiaj tylko przy zmianie ich obszaru.

## Zasady wdrażania

- Push do `main` = produkcja (GitHub Pages; `pl3y-server`: deploy Workera przy `DEPLOY_ENABLED=true`). **Zawsze pytaj przed pushem.** Wyjątek tylko wg zapisanej decyzji właściciela (pamięć: „Praca nocna i wdrożenie”).
- Zmiana silnika dotyka **dwóch repo**: `pl3y-server` (źródło) i `bulgot` (`shared/`); commit w obu, `RUN_V` podbity, jeśli zmieniają się spotkania lub powtórka walki.
- Lobby (`egozaur.github.io`) nie jest edytowane z tego repo.

## Zarządzanie kontekstem

1. **Zacznij od zadania**, nie od skanowania: nazwij obszar → wiersz w `systems-index.md` → tylko wskazane pliki.
2. **Szukaj, nie czytaj**: `Grep` po nazwie funkcji/id, potem `Read` z `offset`/`limit`. `app.js` (187 KB), `art.js` (140 KB), `style.css` (167 KB), `DESIGN.md` (86 KB), `notatki-*.md` nigdy w całości.
3. **Nie powtarzaj**: plik już przeczytany w tej sesji i nie zmieniony nie wymaga ponownego odczytu; to samo wyszukiwanie nie jest powtarzane.
4. **Zmienione pliki** odczytuj ponownie dopiero po cudzej edycji (np. subagent, `sync-engine`).
5. **Subagent** tylko gdy osobny kontekst się opłaca (szeroki przegląd, niezależna weryfikacja, długi pomiar). Dwóch agentów nigdy nie edytuje tego samego pliku.
6. **/compact**: po zamknięciu podzadania, gdy rozmowa jest długa, a bieżący cel trwa. Przed nim wypisz notatkę postępu (format niżej).
7. **Nowa sesja**: przy zmianie obszaru (np. z silnika na wygląd), po wdrożeniu/commicie, gdy kontekst jest zaśmiecony wynikami nieudanych prób. Wklej notatkę postępu jako pierwszą wiadomość.
8. **Model**: Sonnet na co dzień (zmiany w UI, dane, testy, poprawki). Opus tylko do: nowego systemu o wielu zależnościach, przestrojenia balansu z analizą przyczyn, trudnego błędu niedeterministycznego/rozjazdu powtórki walki. Nie przełączaj modelu w trakcie zadania bez powodu (zrywa cache promptu).
9. **Ciężkie symulacje**: maks. 6 wątków i niski priorytet (właściciel w tym czasie gra); patrz `.claude/rules/engine-and-balance.md` i skill `bulgot-balance`.

## Format notatki postępu

```
Cel: <jedno zdanie>
Zmienione pliki: <lista, osobno repo bulgot i pl3y-server>
Decyzje: <najważniejsze, z uzasadnieniem w kilku słowach>
Stan: <co działa, jakie testy przeszły, czego nie sprawdzono>
Nierozwiązane: <problemy, pytania do właściciela>
Następny krok: <jedna konkretna czynność>
```

Notatka żyje w czacie (do `/compact` lub nowej sesji). Do pamięci projektu (`memory/`) trafia tylko to, co przyda się za tygodnie (decyzje właściciela, zaparkowane plany), nie historia zadania. Kolejka zadań właściciela: `DO-ZMIANY.md`.
