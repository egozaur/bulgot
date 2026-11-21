# CLAUDE.md

## Szybki start
- **Bulgot** („Awans albo rosół”): solo roguelike w przeglądarce. Kurczak wspina się po piętrach fabryki rosołu (tryb szybki 10, pełny 20), co piętro wybiera 1 z 4 kafelków i walczy (auto-walka + 3 umiejętności aktywne). Pełny projekt: `DESIGN.md`.
- Pliki: `index.html`, `app.js` (cały interfejs i walka na żywo), `art.js` (grafika SVG w kodzie), `audio.js` (dźwięk WebAudio), `api.js` (serwer albo tryb lokalny), `text.js` (teksty Kronikarza), `style.css`.
- **`shared/*.js` jest GENEROWANE** (kopia silnika z serwera): `node dev/sync-engine.mjs`. Nie edytuj ręcznie.
- Serwer: `../pl3y-server/src/games/bulgot/` (DO `BgPlayer`, `BgRanks`; trasy `/api/bg/*`). Testy: `cd ../pl3y-server && node --test test/all.test.js` (`test/games/bulgot/bulgot.suite.js`).
- Lokalnie: `node C:\Users\Kurczak\tools\scripts\serve.mjs C:\Users\Kurczak\pl3y 8090` (z `LOBBY=…\egozaur.github.io`), otwórz `/bulgot/?local=1`. Bez `/auth.js` (lokalnie jest 404) gra sama przechodzi w tryb lokalny: ten sam kod serwera chodzi w przeglądarce, zapis w `localStorage`.
- Balans: `node dev/sim-balance.mjs --mode full --n 1000 --table` (bot gra setki runów, pokazuje % wygranych i straty życia na rundę). Test w Edge: `node dev/smoke.mjs`.
- Node: `export PATH="/c/Users/Kurczak/tools/node:$PATH"` (przenośny, nie jest w PATH).

Zawsze odpowiadaj po polsku. Teksty UI i komentarze po polsku.

## Projekt

Repo `egozaur/bulgot` (GitHub Pages pod `https://pl3y.pl/bulgot/`), czysty HTML/CSS/JS bez builda. Lobby (`egozaur/egozaur.github.io`) ma wpis `Bulgot` w tablicy `GAMES` (nie edytuj lobby z tego repo).

### Podział odpowiedzialności
- **Serwer liczy wszystko, co ma znaczenie**: oferty kafelków (losowane z ziarna runu, którego klient nie widzi), rerolle, zakupy, nagrody, wynik walki (powtórka z wejść gracza), odblokowania, ranking. Klient tylko rysuje i prowadzi walkę na żywo tym samym silnikiem (`shared/sim.js`).
- **Walka**: `Fight(setup).step(inputs)` w tickach po 100 ms, deterministyczna (`rng.js`: mulberry32, bez `Math.random`, `Date` i trygonometrii). Klient zapisuje wejścia `[tick, slot]`, po walce wysyła je na `/api/bg/fightfinish`, serwer powtarza walkę i wydaje wynik. Zmiana silnika = zmiana w `pl3y-server/src/games/bulgot/` + `node dev/sync-engine.mjs` + commit w obu repo.
- **Dane** (kafelki, wrogowie, bossowie, postacie, Garnek, odblokowania) są w `pl3y-server/src/games/bulgot/data.js` jako moduł JS, nie JSON (działa tak samo w Workerze, Node i przeglądarce bez asercji importu). Nowy kafelek = nowy obiekt w `TILES` + ikona w `art.js` (`ICON`). Statystyki wrogów stroi się symulatorem (`dev/sim-balance.mjs`), nie na oko.

### Protokół (POST `/api/bg/<akcja>`, ciało zawsze z `pt` = token gracza)
`state`, `start {mode,char,garnek}`, `pick {i,slot?}`, `buy {i,slot?}` (dokup kafelek z oferty za Ziarna; cena wg rzadkości w `RULES.prices`, wolny wybór zostaje), `reroll`, `shop {i}` (-1 = wyjdź), `history` (TESTOWA historia ostatnich 30 runów z dziennikiem rund; do usunięcia po testach), `bet {amount}`, `bonus {i,slot?}`, `fightstart` (zwraca `setup` z ziarnem walki), `fightfinish {inputs}`, `abandon`. Odpowiedź: `{ok, profile, run, ...}` albo `{err, code}` (400/409; 401 gdy brak sesji lub nicka). `GET /api/bg/ranks?mode=quick|full`. Opis stanu: `rules.js` → `view()`.

### Rzeczy, o które łatwo się potknąć
- **Ekonomia**: 4 Ziarna za rundę (6 za bossa), ceny dokupienia 6/12/20/30, reroll 2+1 za kolejny. Dokupowanie mocno wzmacnia gracza (bot: 6% wygranych bez niego, ok. 50% z nim), więc przy każdej zmianie cen lub dochodu przestrój tempo wzrostu wrogów (`MODES.*.grow`) symulatorem.
- **Wczesne piętra** (`MODES.*.early`): wrogowie mają +35% życia i -20% ataku, żeby pierwsze walki trwały dłużej i były spokojniejsze. Pierwsza oferta (i jej rerolle) zawsze zawiera umiejętność.
- Interfejs skaluje się z rozmiarem okna (`applyScale()` w `app.js`: CSS `zoom` + zmienna `--vh`); nie używaj `100vh` w CSS, tylko `var(--vh, 100vh)`.
- Nowa klasa DO = nowy `[[migrations]]` w `pl3y-server/wrangler.toml` (Bulgot ma `v8`). Nie zmieniaj nazw `BgPlayer`/`BgRanks` ani tagu `v8` (kasuje dane graczy).
- `view()` w `rules.js` nie zdradza `seed`; nie dodawaj do widoku niczego, z czego da się wyliczyć przyszłe oferty lub spotkania.
- Poziom 2 umiejętności: +30% mocy, -20% cooldownu; sloty: 3. Start umiejętności z 40% cooldownu (żeby nie zabijać w 1. ticku).
- Strefy: tryb szybki to strefy I i II (Prezes zawsze w strefie III, patrz `zoneOf`). Mnożniki bossów w trybie szybkim: `MODES.quick.bossPct`.
- Wyciszenie lobby (`localStorage.pl3y_mute === '1'`) wycisza też efekty Bulgota. Ustawienia gry: `bulgot:sfx`, `bulgot:music`, `bulgot:speed`, `bulgot:mode`.
- Push do `main` = produkcja (GitHub Pages). Zawsze pytaj przed pushem.
