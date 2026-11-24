# CLAUDE.md

Zawsze odpowiadaj po polsku. Teksty UI i komentarze po polsku. Do właściciela projektu zwracaj się per „Wielki Kurczak”.

## Szybki start
- **Bulgot** („Awans albo rosół”): solo roguelike w przeglądarce (gra nr 7 na pl3y.pl). Kurczak wspina się po piętrach fabryki rosołu (tryb Szybki 10 pięter, Pełny 20), co piętro wybiera 1 z 4 kafelków i walczy (auto-walka + 3 umiejętności aktywne). Pełny projekt: `DESIGN.md` (czytaj sekcjami).
- Technologia: czysty HTML/CSS/JS (ES modules), **bez builda**; GitHub Pages `https://pl3y.pl/bulgot/`. Backend: Cloudflare Worker + Durable Objects w `../pl3y-server/src/games/bulgot/` (`BgPlayer`, `BgRanks`, trasy `/api/bg/*`).
- Pliki klienta: `index.html`, `app.js` (cały interfejs i walka na żywo), `fx.js` (animacje umiejętności), `scenes.js` (tła walki), `fight.css`, `art.js` (grafika SVG w kodzie), `audio.js`, `api.js` (serwer albo tryb lokalny), `text.js`, `tip.js`, `fakty.js`, `style.css`.
- **`shared/*.js` jest GENEROWANE** (kopia silnika z serwera): `node dev/sync-engine.mjs`. Nie edytuj ręcznie.
- Node: `export PATH="/c/Users/Kurczak/tools/node:$PATH"` (przenośny, nie jest w PATH).
- Testy Bulgota na serwerze (ok. 3 s): `cd ../pl3y-server && node --test --test-name-pattern="bulgot" test/all.test.js`. Pełny zestaw serwera (ok. 40 s) tylko przy zmianie kodu wspólnego.
- Lokalnie: `node C:\Users\Kurczak\tools\scripts\serve.mjs C:\Users\Kurczak\pl3y 8090` (z `LOBBY=…\egozaur.github.io`), otwórz `/bulgot/?local=1`. Bez `/auth.js` gra sama przechodzi w tryb lokalny (ten sam kod serwera w przeglądarce, zapis w `localStorage`).
- **Testy obszaru jednym poleceniem**: `node dev/test-area.mjs <obszar>` (sam startuje serwer plików i Edge; lista: `--list`, np. `panel`, `walka`, `serwer`, `smoke`). Spójność `shared/` z serwerem: `node dev/check-sync.mjs` (pre-commit hook robi to sam).
- Balans: `dev/sim-balance.mjs`; analizy graczy: `dev/podsumuj-analizy.mjs`. Komendy i tabela „który test do jakiej zmiany”: `.claude/context/development-workflow.md`.

## Architektura w skrócie
- **Serwer liczy wszystko, co ma znaczenie** (oferty z ziarna runu, rerolle, zakupy, nagrody, wynik walki, odblokowania, ranking). Klient tylko rysuje i prowadzi walkę na żywo tym samym silnikiem (`shared/sim.js`), a wejścia gracza `[tick, slot]` serwer powtarza i wydaje wynik.
- Walka jest **deterministyczna** (tick 100 ms, `rng.js`; bez `Math.random`, `Date`, trygonometrii).
- Dane (kafelki, wrogowie, bossowie, postacie…) to moduł `data.js` na serwerze, nie JSON. Zmiana silnika = zmiana w `pl3y-server/src/games/bulgot/` + `node dev/sync-engine.mjs` + commit w **obu** repo + (przy zmianie spotkań lub powtórki walki) podbicie `RUN_V` w `rules.js`.
- Lobby (`egozaur/egozaur.github.io`) ma wpis `Bulgot` w `GAMES`; nie edytuj go z tego repo.

## Mapa dokumentacji (czytaj na żądanie, nie z góry)
| Potrzebujesz | Czytaj |
|---|---|
| gdzie leży system, który plik, który test, którą sekcję `DESIGN.md` | `.claude/context/systems-index.md` |
| moduły, przepływ danych, zależności, punkty wejścia | `.claude/context/architecture-map.md` |
| komendy, testy do zakresu zmiany, zarządzanie kontekstem, notatka postępu, wybór modelu | `.claude/context/development-workflow.md` |
| akcje i odpowiedzi `/api/bg/*` | `.claude/context/protocol.md` |
| pułapki i historia mechanik silnika, danych, balansu, serwera | `.claude/context/notatki-silnik.md` (szukaj `Grep` po tytule) |
| pułapki i historia interfejsu, układu, walki na ekranie | `.claude/context/notatki-klient.md` (szukaj `Grep` po tytule) |
| aktualne wygrane bota na postać i palnik, wnioski z pomiarów | `.claude/context/balans-stan.md` |
| projekt, wartości, historia balansu | `DESIGN.md` (sekcjami; indeks w `systems-index.md`) |
| kolejka zadań właściciela | `DO-ZMIANY.md` |

Reguły ładują się same dla odpowiednich plików: `.claude/rules/` (`engine-and-balance`, `client-ui`, `testing-and-dev`, `archive-and-proposals`). Skille: `bulgot-feature`, `bulgot-debug`, `bulgot-balance`, `bulgot-test`, `bulgot-review`, `bulgot-analizy`. Subagenci (`.claude/agents/`): `game-architect`, `gameplay-developer`, `debugging-specialist`, `code-reviewer`; tylko gdy osobny kontekst się opłaca, nigdy dwóch na tych samych plikach.

Archiwum (`archiwum/`: dawne dokumenty przekazania, makiety `propozycje-*`, prezentacje) jest nieaktualne: nie czytaj bez prośby. Wyjątki: `archiwum/propozycje-raporty/raport-2026-11-24.md` (raport z pomiarów, czeka na decyzję) i `archiwum/propozycje-poker/PLAN.md` (zaparkowany motyw pokerowy).

## Jak pracować (oszczędność kontekstu)
1. Nazwij zadanie i obszar, znajdź wiersz w `systems-index.md`, czytaj tylko wskazane pliki.
2. **Szukaj, nie czytaj**: `app.js` (187 KB), `art.js` (140 KB), `style.css` (167 KB), `DESIGN.md` (86 KB) i notatki tylko przez `Grep` + `Read` z `offset`/`limit`. Nie skanuj całego repozytorium.
3. Nie czytaj ponownie niezmienionych plików i nie powtarzaj tych samych wyszukiwań.
4. Uruchamiaj tylko testy zakresu zmiany (skill `bulgot-test`).
5. Przy długim zadaniu zapisuj krótką notatkę postępu (format w `development-workflow.md`); `/compact` po zamkniętym podzadaniu, nowa sesja przy zmianie obszaru.
6. Na koniec sesji, która coś zmieniła lub rozstrzygnęła: zapisz do pamięci projektu 3–5 linii (zrobione, czeka na decyzję, wypchnięte czy nie), bez historii rozmowy; nowa sesja zaczyna od tego, a nie od `git log`.
7. Sonnet na co dzień; Opus tylko do nowych systemów o wielu zależnościach, analizy przyczyn balansu i trudnych rozjazdów powtórki walki.

## Autonomia (domyślna, właściciel może zmienić)
- **Bez pytania:** czytanie, testy, symulacje, zmiany w kodzie i dokumentacji zgodne z zadaniem, commit lokalny.
- **Z pytaniem:** push (wymuszone w `.claude/settings.json`), zmiana wyglądu `.tile`, zmiany migracji/klas DO, zmiana silnika bez wcześniejszej decyzji właściciela o mechanice, kasowanie danych na serwerze, nowe zależności.

## Twarde ograniczenia
- **Push do `main` = produkcja.** Zawsze pytaj przed pushem (wyjątek tylko wg decyzji właściciela zapisanej w pamięci projektu).
- Nie zmieniaj nazw klas DO (`BgPlayer`, `BgRanks`) ani tagu migracji `v8` w `pl3y-server/wrangler.toml` (kasuje dane graczy).
- Wyglądu kart kafelków (`.tile`) nie zmieniamy (decyzja właściciela); wymagana makieta do akceptacji.
- `view()` w `rules.js` nie zdradza `seed` ani przyszłych ofert i spotkań.
- Statystyki wrogów i kafelków stroi się symulatorem, nie na oko; ciężkie pomiary max 6 procesów i niski priorytet.
- Nie instaluj zależności; nie ruszaj `C:\Users\Kurczak\claude-roboczy` (archiwum).
