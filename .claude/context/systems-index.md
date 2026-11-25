# Bulgot: indeks systemów (gdzie szukać)

Zasada: znajdź wiersz → przeczytaj **tylko** wskazaną sekcję `DESIGN.md` (`Grep -n "^## 18" DESIGN.md`, potem `Read` z `offset`/`limit`) i wpis w notatkach (`Grep` po tytule). Serwer = `../pl3y-server/src/games/bulgot/` (skrót `S/`), klient = ten folder. Testy serwera: `../pl3y-server/test/games/bulgot/bulgot.suite.js` (nazwy testów zaczynają się od `bulgot:`).

## Silnik i reguły (serwer, kopia w `shared/`)

| System | Gdzie (S/) | DESIGN.md | Uwagi / testy |
|---|---|---|---|
| Walka (tick 100 ms, zdarzenia, statusy, Reakcje) | `sim.js` (`Fight`), `stats.js` (`heroStats`) | 3, 10, 11 | deterministyczna; zmiana → `sync-engine` + `RUN_V` |
| Dane, `RULES`, `MODES` | `data.js` | 4–6 | `Grep "^export" data.js` |
| Oferty kafelków, wybór, dokup, reroll, odpoczynek | `rules.js`: `makeOffer`, `pickTile`, `buyOffer`, `reroll`, `rest` | 2, 9, 13 | `RARITY_WEIGHTS`, `RULES.prices` |
| Poziomy kafelków, Ulepszanie, łup z bossa | `data.js` `STAT_FAMILIES`; `rules.js` `upgrade`, `lootRoll` | 13, 17, 19 | `dev/e2e-poziomy.mjs` |
| Umiejętności, Mutacje, Wylęgarnia | `data.js` `SKILLS`, `RECIPES`; `sim.js` | 10, 14, 22 | nowa umiejętność: skill `bulgot-feature` |
| Zestawy, synergie, progi | `data.js` `SETS`, `SET_LINKS`; `stats.js` | 14, 23 | |
| Postacie (12 aktywnych) | `data.js` `CHARS`, `CHAR_IDS`, `UNLOCKS`; `profile.js` `CHECKS` | 16, 25, 29 | `dev/e2e-postacie.mjs` |
| Wrogowie, bossowie, elity, szablony pięter | `data.js` `ENEMIES`, `BOSSES`, `FLOOR_TPL`, `AFFIXES`; `rules.js` `encounterIds`, `buildSetup` | 5, 12, 18, 26, 29 | |
| Hordy, kontry bossów (`buildProfile`, `counterPlan`; kontry tylko od palnika `RULES.counterFrom` = 4) | `rules.js`, `data.js` `COUNTERS` | 29, 32 | |
| Okólniki, Wadliwa Partia, Nemezis, Testament | `data.js` `DECREES`, `FLAWS`; `rules.js` | 11 | `dev/e2e-jeszcze.mjs` |
| Trasy, Klątwy, Dogrywka, Towarzysz, Arena Duchów | `data.js` `ROUTES`, `CURSES`, `COMPANIONS`; `rules.js` `choose` | 18 | `dev/e2e-nowosci.mjs` |
| Lombard, Odsetki (drzwi usunięte w Patchu 1.1) | `rules.js` (`pawn`, `redeem`) | 11, 34 | |
| Dodatkowe rundy (Gruszka, Pipsztal) | `data.js` `EXTRA_AT`; `rules.js` | 26 | `dev/e2e-extra.mjs` |
| Balans i audyty | `dev/sim-balance.mjs` | 9, 17, 27, 30 | skill `bulgot-balance` |
| Wersja reguł (unieważnianie runów) | `rules.js` `RUN_V` (= 23) | 12 | podbij przy zmianie spotkań/walki |

## Meta, profil, serwer

| System | Gdzie (S/) | DESIGN.md |
|---|---|---|
| Akcje i protokół | `player.js` `handle()`; opis `protocol.md` | 7 |
| Profil, Staż, Sklepik, Dyżur dnia, rosoły | `profile.js`; klient `showShop`, `showLevelUp`, `showDaily` | 20 |
| Tryb kasynowy | `profile.casino`, akcja `casino`; klient `casinoSpin` | 21 |
| Pojedynek dla 2 osób | `duel.js` (głosowanie, zwycięzca, terminy, `autoStep`), `ranks.js` `duel()` (stan meczu `du:<kod>`), `player.js` (`duel`, `start {duel}`, `duelTick`, `alarm`); opis `protocol.md` | 31 |
| Kurnik i Pióra | `data.js` `KURNIK`; `profile.js` `kurnikBuy` | 18 |
| Osiągnięcia, `completion` | `achievements.js`; `data.js` `ACHIEVEMENTS` | 18 (osiągnięcia) |
| Ranking, duchy, liczniki pięter, analizy | `ranks.js`; trasy w `pl3y-server/src/index.js` | 18 |
| Trasy HTTP i limity | `pl3y-server/src/index.js` (`/api/bg/*`), `wrangler.toml` | 7 |

## Klient (moduły w `ui/`; `app.js` to tylko punkt wejścia ~100 linii; szukaj przez `Grep "function <nazwa>"` w `ui/`)

| Obszar | Moduł (funkcje) |
|---|---|
| Wspólne narzędzia, stan `G`, skalowanie, nakładki, wywołanie serwera | `ui/core.js` (`$`, `esc`, `store`, `G`, `applyScale`, `toast`, `openOverlay`, `act`, `charView`) |
| Start, render, ekran startowy, wybór trybu/postaci/palnika | `ui/home.js` (`init`, `render`, `renderHome`, `renderSetup`, `metaChips`; `art.eggArt`, `art.burnerArt`) |
| Ekran runu: karty kafelków, okólnik, górny pasek, sceny faz, wybór i dokup | `ui/run.js` (`tileCard`, `offerCard`, `renderRun`, `topbarHTML`, `stageHTML`, `stageOffer`/`stageShop`/`stageRoute`/`stageVictory`/…, `doPick`, `doBuy`, `swapSlots`) |
| Wieża / schody | `ui/tower.js` (`stairsHTML`, `fitTower`, `towerHTML`; `art.stairs*`) |
| Panel boczny bohatera | `ui/side.js` (`sideHTML`, `setIconsHTML`, `skillRingsHTML`, `statListHTML`, `zoneCompareHTML`, `linkChipsHTML`, `animOn`, `applyAnim`) |
| Walka na żywo | `ui/fight.js` (`startFight`, `frame`, `stepOnce`, `useSkill`, `onEvent`, `finishFight`, `skillFx` → `fx.js`; tła `scenes.js`; CSS `fight.css`) |
| Faktura i Tablica Zarządu | `ui/invoice.js` (`showInvoice`, `boardHTML`, `flyToBoard`, `fitBoard`, `showSlip`) |
| Ekran końca | `ui/end.js` (`showEnd`, `endFacts`/`chooseFacts` → `fakty.js`, `showAnalyzeDialog`) |
| Ciekawostki końca runu | `fakty.js`, `fakty-teksty.js`, `fakty-pamiec.js`; dziennik z `finishFight` w `ui/fight.js`; DESIGN.md 35; test `node dev/test-area.mjs fakty` |
| Okna: ranking, Księga, profil, historia, pomoc, ustawienia, menu | `ui/windows.js` (`showRanking`, `showBook`, `showProfile`, `showKurnik`, `showHistory`, `showHelp`, `showSettings`, `showMenu`) |
| Kliknięcia i klawisze | `ui/input.js` (tablica `ACT`, nawigacja strzałkami `navItems`/`navMove`); sam `document.addEventListener('keydown'…)` jest w `app.js` |
| Staż, Sklepik, Dyżur dnia | `ui/meta.js` (`showLevelUp`, `showShop`, `showDaily`, `startDaily`) |
| Tryb kasynowy | `ui/casino.js` (`casinoSpin`, `showCasinoAsk`) |
| Pojedynek dla 2 osób | `ui/duel.js` (`openDuel`, `DUEL_ACT`, `pollDuel`, `hudTick`, `showDuelEnd`); styl `.duel*`, `#duelhud`, `.pill.duelt`; test `dev/e2e-pojedynek.mjs` |
| Podpowiedzi | `tip.js` + `statTip()`; atrybuty `data-tipk`, `data-tip` |
| Teksty | `text.js` (Kronikarz, `CHAR_PERKS`, `BOSS_INTRO`, `STAT_GROUPS`) |
| Fabuła: intro, radiowęzeł, Prezes Rosołowski, teczki, epilogi, porażka | `fabula.js` (dane i `radioLine`, `porazkaTekst`, `sladLine`); `ui/windows.js` `startIntro`/`showIntro`; `ui/end.js` `showOffer`/`chooseEnding`/`lossLines`; `ui/run.js` `floorKronHTML`; `ui/fight.js` `bossIntro`; `ui/home.js` `teczkaHTML`; `art.js` `introSceneArt`, `prezesArt`; `DESIGN.md` 33 |
| Grafika | `art.js`: `ICON`, `ICON_OF`, `NEWBODY` (postacie) |

Moduły `ui/` importują się nawzajem cyklicznie (dozwolone dla funkcji); stałe najwyższego poziomu nie mogą używać cudzych stałych w momencie ładowania modułu.

## Indeks sekcji `DESIGN.md` (86 KB; nigdy nie czytaj całości)

1 wizja · 2 pętla · 3 walka · 4 kafelki startowe · 5 bossowie i wrogowie · 6 postacie, meta, trudność · 7 architektura techniczna · 8 plan i ryzyka · 9 balans po dokupowaniu · 10 efekty/Mutacje/Odznaki · 11 „jeszcze jedna partia” · 12 szablony pięter, ukryty podgląd · 13 poziomy kafelków, Ulepszanie, łup · 14 etap 2 · 15 etap 3 · 16 nowe postacie · 17 wielki balans · 18 siedem nowości · 19 Ulepszanie z premią · 20 Staż, Sklepik, Dyżur · 21 kasyno · 22 pełnoekranowa walka · 23 Zestawy 2.0 · 24 Rozwidlenie · 25 memiczne kurczaki · 26 dodatkowe rundy · 27 audyt balansu · 28 panel boczny, Dziobnięcie · 29 hordy, kontry, 12 postaci · 30 poprawki po analizie test1 · 31 pojedynek dla 2 osób · 32 uporządkowanie statystyk (Atak = jedna statystyka, Dziobnięcie ×2), kontry od palnika 4.

Szukaj: `Grep -n "^## 2[0-9]" DESIGN.md` → numer linii → `Read` z `offset` i `limit` ≈ 60.

## Dokumenty poza tym folderem `.claude/`

| Plik | Status |
|---|---|
| `DESIGN.md` | źródło prawdy projektu i balansu (czytaj sekcjami) |
| `DO-ZMIANY.md` | kolejka zadań od właściciela (aktualna, krótka) |
| `archiwum/propozycje-raporty/raport-2026-11-24.md` | raport i rekomendacje z 2026-11-24 (czeka na decyzję) |
| `archiwum/dokumenty/` (`PRZEKAZANIE`, `STAN-GRY`, `UPDATE-2026-11-22`, `RAPORT-NOCNY`) | **archiwum z 21–22.11.2026, częściowo nieaktualne**; nie czytaj, chyba że ktoś o nie prosi |
