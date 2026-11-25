# Bulgot: mapa architektury i zależności

Stan zweryfikowany w repozytorium 2026-11-24. Bez builda: czyste ES modules w przeglądarce, Cloudflare Worker + Durable Objects po stronie serwera.

## Trzy repozytoria (folder `C:\Users\Kurczak\pl3y\`)

| Repo / folder | Rola |
|---|---|
| `bulgot/` (egozaur/bulgot) | **frontend** (GitHub Pages → pl3y.pl/bulgot/), dokumentacja, narzędzia `dev/` |
| `pl3y-server/src/games/bulgot/` | **cała logika gry** + zapis graczy (DO `BgPlayer`, `BgRanks`); trasy `/api/bg/*` w `pl3y-server/src/index.js`; testy `pl3y-server/test/games/bulgot/bulgot.suite.js` |
| `egozaur.github.io/` | lobby (wpis `Bulgot` w `GAMES`); `auth.js` daje nick + PIN. **Nie edytuj z tego repo.** |

## Przepływ danych

```
gracz → ui/*.js (render, kliknięcia: `ACT` w ui/input.js) → api.js → POST /api/bg/<akcja> → BgPlayer.handle (player.js)
      → rules.js (newRun, pickTile, choose, fightSetup, fightFinish, view...) → zapis w DO → { ok, profile, run }
walka: ui/fight.js: Fight(setup) z shared/sim.js, tick 100 ms, zapis wejść [tick, slot]
       → /fightfinish {inputs} → serwer powtarza walkę (sim.js) i wydaje wynik (to on jest źródłem prawdy)
koniec runu: rules.endRun → profile.onRunEnd (Staż, odblokowania, osiągnięcia) → ranks.js (BgRanks: ranking, duchy, liczniki pięter, analizy)
```

- **Tryb lokalny** (`?local=1` albo brak `/auth.js`): `api.js` importuje `../pl3y-server/src/games/bulgot/player.js` i `ranks.js` i uruchamia je w przeglądarce, zapis w `localStorage` (`bulgot:local:*`). Ten sam kod co produkcja.
- **`shared/`** = GENEROWANA kopia `rng.js`, `data.js`, `stats.js`, `sim.js` z serwera (`node dev/sync-engine.mjs`). Klient importuje silnik z `shared/`, serwer z własnych plików. Muszą być identyczne, inaczej powtórka walki się rozjedzie.
- `rules.js`, `profile.js`, `player.js`, `ranks.js`, `achievements.js` istnieją **tylko na serwerze** (klient ich nie ma; dane osiągnięć w `data.js` są kopiowane).

## Moduły serwera (`pl3y-server/src/games/bulgot/`, razem ok. 4000 linii)

| Plik | Linii | Odpowiedzialność |
|---|---|---|
| `data.js` | ~990 | wszystkie dane i `RULES`: kafelki, umiejętności, postacie, wrogowie, bossowie, okólniki, Kurnik, osiągnięcia, Staż, Sklepik, rosoły (lista eksportów: `Grep "^export" data.js`) |
| `rules.js` | ~1090 | reguły runu: `newRun`, `makeOffer`, `pickTile`, `buyOffer`, `reroll`, `rest`, `upgrade`, `pawn/redeem`, `choose` (fazy), `buildSetup`/`fightSetup`/`fightFinish`, `view()`, `RUN_V` |
| `sim.js` | ~890 | deterministyczna walka `Fight`, `runFight`, `MAX_TICKS`, `FURY_FROM` |
| `stats.js` | ~175 | `heroStats(loadout)`, zestawy (`setCounts`, `activeLinks`) |
| `rng.js` | ~46 | mulberry32, `mix`, `hash` (bez `Math.random`) |
| `player.js` | ~250 | DO `BgPlayer`: `handle()` = `switch` po akcji, profil, historia, analiza |
| `profile.js` | ~270 | meta-profil: Staż, Sklepik, Dyżur dnia, Kurnik, `onRunEnd`, `publicProfile` |
| `achievements.js` | ~100 | warunki osiągnięć (`evaluateAch`), `completion(p)` |
| `ranks.js` | ~195 | DO `BgRanks`: rankingi, duchy, liczniki pięter, kopie do analizy |

## Moduły klienta (`bulgot/`, bez builda)

| Plik | Rozmiar | Odpowiedzialność |
|---|---|---|
| `app.js` | ok. 100 linii | punkt wejścia: importy modułów `ui/`, rejestracja nasłuchiwaczy, `init()` |
| `ui/*.js` | 12 modułów, 50–400 linii każdy | cały interfejs i walka na żywo (podział w tabeli klienta w `systems-index.md`; `core.js` = wspólne narzędzia i stan `G`) |
| `art.js` | 140 KB | grafika SVG w kodzie: ikony (`ICON`, `ICON_OF`), jajka postaci, schody, tablica, młotek, postacie (`NEWBODY`) |
| `style.css` | 167 KB | styl całej gry poza walką |
| `fx.js` | 40 KB | animacje umiejętności (`RECIPES[id]`, `castFx`, `markHit`, `SK_COLOR`) |
| `fight.css` | 23 KB | pełnoekranowa walka (`#fightlayer`, jednostka `--u`) |
| `text.js` | 23 KB | teksty Kronikarza, `CHAR_PERKS`, `BOSS_INTRO`, `STAT_GROUPS`, `statValue` |
| `tip.js` | 13 KB | jedna pływająca podpowiedź `#tip` |
| `scenes.js` | 12 KB | tła walki (3 strefy) |
| `fakty.js` | 20 KB | ciekawostki końca runu: generatory i wybór (DESIGN.md 35) |
| `fakty-teksty.js` | 15 KB | szablony tekstów ciekawostek |
| `fakty-pamiec.js` | 6 KB | dziennik runu, historia, pamięć pięter, rekordy wstydu, zakład (localStorage) |
| `audio.js` | 8,5 KB | dźwięk WebAudio |
| `api.js` | 4,5 KB | serwer albo tryb lokalny |
| `index.html` | 1,4 KB | punkt wejścia (`app.js` jako moduł, `style.css`, `fight.css`; adresy mają `?v=` do cache-bustingu) |

Punkt wejścia klienta: `index.html` → `app.js` → `init()` → `render()` (oba w `ui/home.js`). Obsługa kliknięć i klawiszy: sekcja „obsługa kliknięć i klawiszy” w `app.js` (tablica `ACT`, `keydown`).

## Zależności zewnętrzne

- `/auth.js`, `/pl3y.css` z lobby (nick + PIN; bez `/auth.js` gra przechodzi w tryb lokalny).
- Trasy i limity w `pl3y-server/src/index.js` (`/api/bg/ranks`, `/api/bg/daily` publiczne; `/api/bg/analysis*`, `/api/bg/admin-grant` wymagają `X-Admin-Key`).
- `pl3y-server/wrangler.toml`: klasy DO `BgPlayer`, `BgRanks`, migracja `v8` (**nie ruszać**).

## Narzędzia deweloperskie (`dev/`, ok. 2200 linii)

- Symulacja i analiza balansu: `sim-balance.mjs` (bot), `analiza-kart.mjs`, `analiza-ev.mjs`, `lib-power.mjs`, `lib-prio.cjs`.
- Testy w Edge (puppeteer): `smoke.mjs`, `e2e-*.mjs` (lista w `development-workflow.md`).
- `sync-engine.mjs` (kopiuje silnik), `pobierz-analizy.mjs` (pobiera analizy graczy).

## Foldery, których nie czytać bez wyraźnej potrzeby

`archiwum/` (stare dokumenty przekazania, makiety `propozycje-*`, zrzuty, prezentacje; `archiwum/propozycje-poker/PLAN.md` to zaparkowany motyw pokerowy), `propozycje-walka/` (odrzucone makiety walki, jeszcze poza archiwum), `logo*.png`.
