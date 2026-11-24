---
paths:
  - "shared/**"
  - "dev/sim-balance.mjs"
  - "dev/analiza-*.mjs"
  - "dev/lib-*"
  - "dev/sync-engine.mjs"
---
# Silnik, dane i balans

- `shared/*.js` jest GENEROWANY (kopia z `../pl3y-server/src/games/bulgot/`). Nie edytuj; zmień źródło na serwerze, uruchom `node dev/sync-engine.mjs`, zacommituj w obu repo.
- Walka jest deterministyczna: w `sim.js`/`stats.js`/`rng.js` nie używaj `Math.random`, `Date`, trygonometrii ani niczego zależnego od środowiska. Serwer powtarza walkę z wejść gracza i musi dać ten sam wynik co klient.
- Zmiana spotkań lub powtórki walki = podbij `RUN_V` w `rules.js` (stare runy są unieważniane).
- `view()` w `rules.js` nie może zdradzać `seed` ani niczego, z czego da się wyliczyć przyszłe oferty i spotkania.
- Dane (kafelki, wrogowie, postacie…) to moduł JS `data.js`, nie JSON. Nowy kafelek = wpis w `TILES` + ikona w `art.js` (`ICON`). Nowa umiejętność, postać: lista kroków w skillu `bulgot-feature`.
- Statystyki wrogów i wartości kafelków stroi się symulatorem (`dev/sim-balance.mjs`), nie na oko. Zmiana cen lub dochodu Ziaren = przestrój `MODES.*.grow`.
- Ciężkie pomiary: maks. 6 wątków i niski priorytet procesu (właściciel gra w tym czasie). Zacznij od małego `--n` (np. 100–200), zwiększaj dopiero przy niejednoznacznym wyniku. Nie powtarzaj pomiaru, który już masz w `DESIGN.md` lub raporcie.
- Nie zmieniaj nazw klas DO (`BgPlayer`, `BgRanks`) ani tagu migracji `v8` w `pl3y-server/wrangler.toml` (kasuje dane graczy).
- Szczegóły i pułapki: `.claude/context/notatki-silnik.md` (szukaj przez `Grep`, nie czytaj całości).
