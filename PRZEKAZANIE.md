# Bulgot: przekazanie projektu (jak to działa, żeby móc go rozwijać)

Ten plik jest dla kogoś (np. nowego czatu z Claude), kto ma dalej rozwijać grę i nie zna historii. Szczegóły projektu gry: `DESIGN.md`. Zasady pracy w repo i protokół: `CLAUDE.md`. Stan: **na produkcji od 2026-11-21**, aktywnie testowany przez właściciela (Kurczak).

## 1. Czym jest

**Bulgot** („Awans albo rosół”): solo roguelike w przeglądarce, gra nr 7 na pl3y.pl. Kurczak (Pyrtek) ucieka przez piętra fabryki rosołu Korporacji Rosołowej S.A. i dochodzi do Prezesa Rosołu. Ton: epicka parodia (narrator Kronikarz), kreskówkowy wektor. Priorytet: przeglądarka na komputerze (telefon działa, ale jest wtórny).

Pętla: **runda = wybór 1 z 4 kafelków (+ opcjonalne dokupienie reszty za Ziarna) → walka automatyczna z 3 umiejętnościami aktywnymi klikanymi przez gracza → nagroda (Ziarna, leczenie)**. Tryb szybki: 10 rund (bossowie na 5 i 10), pełny: 20 rund (bossowie na 6, 12, 20). Poziom trudności: Temperatura Garnka 0–5, odblokowywana wygraną.

## 2. Gdzie co leży (trzy repozytoria, wszystkie pod `C:\Users\Kurczak\pl3y\`)

| Repo | Folder | Co tam jest |
|---|---|---|
| `egozaur/bulgot` | `bulgot/` | **frontend** (GitHub Pages → `https://pl3y.pl/bulgot/`), dokumentacja, narzędzia dev |
| `egozaur/pl3y-server` | `pl3y-server/src/games/bulgot/` | **backend i cała logika gry** (Cloudflare Worker + Durable Objects) |
| `egozaur/egozaur.github.io` | `egozaur.github.io/` | lobby (wpis „Bulgot” w `GAMES`, miniatura `img/bulgot.webp`) |

`pl3y/CLAUDE.md` to mapa wszystkich gier. Push do `main` = produkcja: `pl3y-server` ma CI (testy, potem deploy na Cloudflare przy `DEPLOY_ENABLED=true`), pozostałe dwa to GitHub Pages (publikacja po ok. 30–60 s). **Zawsze pytaj właściciela przed pushem**, chyba że wprost kazał wypychać.

### Backend: `pl3y-server/src/games/bulgot/`
- `rng.js`: deterministyczny generator (`mix`, `hash`, `makeRng`: mulberry32). Żadnego `Math.random`/`Date` w silniku.
- `data.js`: **wszystkie dane gry** (kafelki, umiejętności, wrogowie, bossowie, postacie, tryby, Garnek, odblokowania, stałe `RULES`). Najczęściej edytowany plik.
- `stats.js`: `heroStats(loadout)` liczy statystyki bohatera z postaci i kafelków (bez losowości).
- `sim.js`: **silnik walki** `Fight` (tick = 100 ms). Ten sam kod chodzi w przeglądarce (walka na żywo) i na serwerze (powtórka do weryfikacji).
- `rules.js`: **reguły runu** (czyste funkcje na obiekcie `run`): `newRun`, `makeOffer`, `pickTile`, `buyOffer`, `reroll`, `rest`, `shopBuy`, `bet`, `bonusPick`, `fightSetup`, `fightFinish`, `abandon`, `view`.
- `profile.js`: profil gracza (odblokowania, liczniki, najlepsze wyniki, poziom Garnka).
- `player.js`: DO `BgPlayer` (jeden na gracza): wykonuje akcje, zapisuje stan, odblokowania, ranking, historię. `ranks.js`: DO `BgRanks` (singleton, ranking quick/full).
- Routing i limity: `pl3y-server/src/index.js` (regex `/api/bg/…`, limit `bg` 90/min na IP w `core/limits.js`), migracja `v8` w `wrangler.toml`.
- Testy: `pl3y-server/test/games/bulgot/bulgot.suite.js` (181 testów razem z resztą serwera: `cd pl3y-server && node --test test/all.test.js`, ok. 40 s).

### Frontend: `bulgot/`
- `index.html` (bramka `/auth.js`, `pl3y.css`), `style.css`, `app.js` (cały interfejs, walka na żywo, okna), `art.js` (cała grafika jako SVG w kodzie), `audio.js` (dźwięk w WebAudio, bez plików), `api.js` (serwer albo tryb lokalny), `text.js` (teksty Kronikarza, pomoc).
- `shared/*.js`: **GENEROWANA kopia** `rng.js`, `data.js`, `stats.js`, `sim.js` z serwera. Nie edytuj; po zmianie któregoś z tych czterech plików na serwerze: `node dev/sync-engine.mjs`, potem commit w obu repo.
- `dev/`: `sim-balance.mjs` (symulator balansu), `sync-engine.mjs`, `smoke.mjs` i `e2e-*.mjs` (testy w Edge).

## 3. Model: kto liczy co

- **Serwer liczy wszystko, co ma znaczenie.** Ziarno runu (`run.seed`) jest tylko na serwerze; z niego wychodzą oferty, spotkania, wyniki hazardu. Widok dla klienta (`rules.view()`) **nie zawiera ziarna** (nie dodawaj do niego niczego, z czego da się wyliczyć przyszłość).
- **Walka**: klient dostaje od serwera `setup` (jawne statystyki bohatera i wrogów + ziarno walki), prowadzi walkę na żywo tym samym `Fight`, zapisuje wejścia `[tick, slot]`. Po walce wysyła je na `fightfinish`; **serwer powtarza walkę** z tych wejść i tylko jego wynik się liczy. Nie da się więc podrobić wyniku ani nagród.
- **Tryb lokalny** (`?local=1`, albo brak `/auth.js`, np. testy na localhost): `api.js` ładuje `BgPlayer`/`BgRanks` bezpośrednio z folderu serwera i trzyma stan w `localStorage` (`bulgot:local:*`). Dzięki temu cały przebieg można testować bez internetu.
- Tożsamość: token gracza `pt` (nick + PIN z `auth.js`). Bez nicka gry nie ma.

### API (POST `/api/bg/<akcja>`, ciało zawsze z `pt`)
`state`, `start {mode,char,garnek}`, `pick {i,slot?}`, `buy {i,slot?}`, `reroll`, `rest`, `shop {i}` (-1 = wyjdź), `bet {amount}`, `bonus {i,slot?}`, `fightstart`, `fightfinish {inputs}`, `abandon`, `history` (TESTOWE). `GET /api/bg/ranks?mode=quick|full`. Odpowiedź `{ok, profile, run, ...}` albo `{err, code}` (400/409/401).

### Faza runu (`run.phase`)
`offer` (wybór, dokup, reroll, odpoczynek) → `event` (sklepik/hazard) → `fight` (przygotowanie, potem walka) → `bonus` (po bossie, 3 rzadkie kafelki) → następna `offer` … → `over` (ended = win/lose).

## 4. Silnik walki (`sim.js`) w skrócie

Tick = 100 ms, max 900 ticków (90 s). Kolejność w ticku: wejścia gracza → regeneracja co 10 ticków i krwawienia → Tykające Jajo → atak bohatera (ładowanie `acc += aspd`, cios co 1000) → fazy bossów → sprawdzenie zwycięstwa → akcje wrogów. Po 45 s wrogowie wpadają w Furię (+5% obrażeń na sekundę).
- Obrażenia bohatera: `Atak × (100+dmg)/100 × krytyk × 100/(100+pancerz)`; wróg ma unik, tarczę (trafienia lub pula), pancerz (Młocarnia go kruszy).
- Umiejętności (3 sloty): Kukurydziany Grad, Pianie Grozy (ogłuszenie, przerywa szarże), Jajeczny Granat, Dziobnięcie Szału, Unik Skrzydłem (nietykalność), Zagrzebanie w Sianie (leczenie). Poziom 2 = +30% mocy i -20% cooldownu. **Start z 15% cooldownu.**
- Wrogowie specjalni: kradzież Ziaren (Lis, Księgowy), spowolnienie (Bałwan), szarża z telegrafem (Wózek), tarcza na 3 trafienia (Sortownik), unik i krytyk (Kot), rój (Mysz ×3).
- Bossowie: **Brojler Zdzisław** (wzywa stażystów, faza 2 szybsza), **Skubarka 3000** (tarcza 25%, potem fale uderzeń, na końcu Skubanie wyłącza losowy kafelek), **Prezes Rosołu** (2 Ochroniarze, nietykalny dopóki żyją; Restrukturyzacja blokuje slot; Wrzący Garnek rośnie obrażeniami). Prezes i jego świta mają `idle: 30` (3 s „Zebrania Zarządu” bez ataków).
- Wszystko jest deterministyczne (ziarno walki + wejścia = ten sam wynik).

## 5. Ekonomia i treść (stan na teraz)

- **Ziarna**: 4 za rundę, 6 za bossa (+Złote Jajo, +10% przy 2 Zbożowych). Wydatki: reroll (2, każdy kolejny w rundzie +1; Kaczor 1 darmowy; Garnek 2 droższy), **dokup kafelka** (zwykły 6, rzadki 12, epicki 20, legendarny 30; wydarzeń i ostatniego kafelka nie kupisz), **Odpoczynek** (4 Ziarna = +20% życia, raz na rundę, przed walką), sklepik i hazard (wydarzenia). Niewydane Ziarna = 50 pkt każde.
- **Leczenie** po wygranej rundzie: 35% maks. życia (Garnek 3+: 20%).
- **Kafelki: 31** (21 dostępnych od startu, 10 odblokowywanych): 9 statystyk, 6 umiejętności, 10 przedmiotów w 3 zestawach (Jajeczne, Zbożowe, Rambo; bonusy od 2 i 3 sztuk), 6 ryzyk/wydarzeń. Rzadkości: zwykły/rzadki/epicki/legendarny (wagi rosną z postępem; Szczęście je przesuwa). Oferta nigdy nie ma 4 kafelków jednego typu; **pierwsza oferta zawsze zawiera umiejętność**.
- **Postacie**: Pyrtek (start), Kwoka Babcia (czołg), Kaczor Hazardzista (ryzyko), Indor Bogdan (ciężkie ciosy), odblokowywane osiągnięciami. Formy wizualne kurczaka zależą od postępu runu: Pyrtek → Kogut → Kogut Bojowy → Rambo Chicken.
- **Odblokowania** (13) w `UNLOCKS` w `data.js`; warunki sprawdza `profile.js` (`CHECKS`).
- **Wczesne piętra** (`MODES.*.early`): wrogowie +35% życia, -20% ataku (pierwsze 4 piętra, w szybkim 3).
- **Wynik** = (1000 × piętra + 50 × Ziarna + premia za szybkość do 2000) × (1 + 0,25 × poziom Garnka).

### Balans (symulator, bot heurystyczny, 1000 runów)
Tempo wzrostu wrogów (`MODES.*.grow`): pełny 1.107 (życie) i 1.07 (atak) na rundę; szybki 1.13 i 1.092, bossowie w szybkim 80% życia i 90% ataku (`bossPct`). Wyniki bota: pełny ok. 65%, szybki ok. 65%, tylko 21 startowych kafelków ok. 46%, bez dokupowania ok. 13%, Garnek 1–5 kolejno ok. 55/58/47/39/18%. **Człowiek wygrywa rzadziej niż bot** (pierwsze 5 gier właściciela: 0 wygranych, dochodził do pięter 8–10), więc cel to bot 55–70%.
**Zasada:** każda zmiana kafelka, umiejętności, ceny, dochodu albo wrogów wymaga ponownego puszczenia `node dev/sim-balance.mjs --n 1000 --table` (opcje: `--mode quick`, `--garnek N`, `--pool starter`, `--nobuy`, `--norest`, `--grow hp,atk`, `--income a,b`, `--prices a,b,c,d`, `--hpmul/--atkmul/--bosshp/--bossatk`, `--trace`). Gdy się dodaje coś mocnego, tempo wzrostu trzeba podnieść (jedno pokrętło `grow`).

## 6. Interfejs (`app.js`)

Ekrany: start (`renderHome`), przygotowanie runu (`renderSetup`), run (`renderRun`: górny pasek, pasek pięter, scena, panel postaci), walka (`startFight`: arena SVG + jednostki DOM, pętla `requestAnimationFrame`, kolejka wejść), okna (`openOverlay`: wynik walki, koniec runu, ranking, Księga Kurnika, pomoc, ustawienia, menu, wybór slotu).
- Wszystkie kliknięcia idą przez delegację `data-act` → mapa `ACT`. Klawisze: 1–4 wybór, Shift+1–4 dokup, R reroll, O odpoczynek, w walce 1/2/3 umiejętności, P pauza, F szybkość, Enter akcja główna.
- **Skalowanie**: `applyScale()` ustawia `--s` (zoom do rozmiaru okna, 1–2,2) i `--vh`; w CSS używaj `var(--vh, 100vh)`, nie `100vh`.
- Grafika: `art.js` (postacie w 4 formach + 3 inne postacie, 10 wrogów, 3 bossy, 31 ikon, 3 areny). Dźwięk: `audio.js` (efekty domyślnie włączone, muzyka wyłączona; respektuje `pl3y_mute` lobby).
- Stan do testów: `window.__bulgot` (G).

## 7. Jak pracować

- Node: `export PATH="/c/Users/Kurczak/tools/node:$PATH"` (przenośny, nie jest w PATH).
- Serwer plików: `LOBBY='C:\Users\Kurczak\pl3y\egozaur.github.io' node C:\Users\Kurczak\tools\scripts\serve.mjs 'C:\Users\Kurczak\pl3y' 8090`, gra: `http://localhost:8090/bulgot/?local=1`.
- Testy: serwer (`node --test test/all.test.js`), przeglądarka (`cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\smoke.mjs`, `dev/e2e-sciezki.mjs`, `dev/e2e-odpoczynek.mjs`, `dev/e2e-ui.mjs` robi zrzuty w 3 rozmiarach okna).
- Pliki mają końcówki CRLF (git `autocrlf`); ostrzeżenia „LF will be replaced by CRLF” są normalne. Długich skryptów z cudzysłowami nie wpisuj w `bash -c`: zapisuj do pliku i uruchamiaj.
- Przepis na **nowy kafelek**: obiekt w `TILES` w `data.js` (+ ikona w `ICON` w `art.js`, jeśli ma `fx` to efekt liczy `stats.js`, jeśli logika specjalna to dopisz w `stats.js`/`sim.js`) → `node dev/sync-engine.mjs` → symulator → testy.
- Przepis na **nową umiejętność**: wpis w `SKILLS`, kafelek typu `skill`, `case` w `useSkill` w `sim.js`, ikona, test w `bulgot.suite.js`.
- Przepis na **nowego wroga**: wpis w `ENEMIES` (bazowe hp/atk w rundzie 1, skalowane `grow`), zachowanie w `sim.js` (pola `steal`, `slow`, `spec`, `shieldHits`), grafika w `ENEMY` w `art.js`, dopisanie do strefy (`zone`).

## 8. Rzeczy tymczasowe i znane problemy

- **Historia gier (TESTOWA, do usunięcia po testach)**: `BgPlayer.saveHistory` + trasa `history` (player.js, index.js), `showHistory` i przyciski w `app.js`, test „historia gier”. Zapisuje ostatnie 30 runów z dziennikiem rund; w grze: Menu → „Historia (test)” → „Pobierz JSON”. Służy do analizy balansu (właściciel pisze „przeanalizuj ostatnie 10 gier”).
- Fabuła i teksty są w `text.js`; zawartość jest „draftem” (mało umiejętności i przedmiotów, 9 wrogów).
- Przy wejściu po aktualizacji przeglądarka może trzymać starą wersję w pamięci (Ctrl+F5).

## 9. Wnioski z pierwszych gier właściciela (2026-11-21) i co z nich zrobiono

Obserwacje: za mało obrażeń (atak 9–19 na piętrze 8, bot ma 19–41), umiejętności prawie nigdy gotowe w krótkiej walce, Lis Windykator zjadał cały dochód, życie wyczerpywało się między walkami, Prezes zabijał w 2–3 s. Wdrożone: cooldowny -35% i start z 15%, Odpoczynek za Ziarna, Ziarno Mocy +6 i nowy kafelek Ostry Dziób (+12% obrażeń), 3 s „Zebrania Zarządu” u Prezesa, trudność przestrojona. **Nie wdrożone (właściciel nie wybrał)**: ograniczenie kradzieży Lisa, podpowiedź „twoje DPS / życie wrogów / szacowany czas” przed walką. Bałwan z Chłodni celowo NIE jest osłabiany (właściciel lubi trudność).

## 10. Pomysły na dalej (z rozmów)

Więcej umiejętności i przedmiotów (właściciel: „na tym będziemy rozwijać”), dzienny seed z rankingiem, co-op dla 2 osób i pojedynki „duchów” (odłożone), kosmetyka (czapeczki), więcej wydarzeń, podpowiedź przed walką, ograniczenie kradzieży Lisa, usunięcie historii testowej po testach.
