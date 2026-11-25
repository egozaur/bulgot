# Plan: uporządkowanie statystyk bohatera (2026-11-25)

Status (2026-11-25): **etapy 1–3 wykonane lokalnie** (commity w `bulgot` i `pl3y-server`, `RUN_V = 22`), **niewypchnięte**; push dopiero po wyraźnym OK. Opis wyniku i pomiarów: `DESIGN.md` sekcja 32, `.claude/context/balans-stan.md`.

## Decyzje właściciela
1. **Atak + Obrażenia → jeden Atak.** Znika statystyka `dmg`; 5 kafelków „+% obrażeń” dostaje „+% Ataku” (wartości przeliczone). Warunkowe bonusy (vs Mróz, vs Oparzenie, Nadgodziny itd.) zostają mechaniką opisaną na kafelku, nie statystyką.
2. **Dziobnięcie + Moc Dziobnięcia → jedno Dziobnięcie** (tylko szansa). Siła mocnego dziobnięcia stała **×2** (dziś baza 150%). 7 kafelków z `critMult` zamieniamy na szansę (przeliczone symulatorem).
3. **Szybkość ataku** w panelu jako **uderzenia na sekundę** („1,3 / s”); kafelki dalej „+30% szybkości ataku”.
4. **Jednostki:** liczba (Atak, Życie, Pancerz, Szczęście), „/ s” (Szybkość, Regeneracja), „%” (Dziobnięcie, Unik).
5. **Wszystkie 8 statystyk zawsze widoczne** (zwykłe wiersze, bez wyróżnienia zer): Atak, Szybkość ataku, Dziobnięcie, Życie, Pancerz, Unik, Regeneracja, Szczęście.
6. **Rozbicie:** zielona liczba premii obok sumy; w podpowiedzi pełna lista źródeł.
7. **Kontry bossów tylko na palnikach 4 i 5** (niższe bez kontr). Skala siły zostaje (70% i 75%).
8. **Wdrożenie:** najpierw plan i makieta, potem etapy.

## Do rozstrzygnięcia przy kroku 7
Dziś `counterPlan` (rules.js) działa na palnikach 0–5 (COUNTER_K = 45/52/58/64/70/75). Odpowiedzi: „tylko na 4 i 5” oraz „skala zostaje 45→75%”. Przyjmuję: palniki 0–3 bez kontr, 4–5 jak dziś. To zmienia balans niskich palników (łatwiejsze); pomiar bota obowiązkowy.

## Kroki (po akceptacji makiety)
**Etap 1: panel i teksty (bez zmiany silnika, bez `RUN_V`)**
- `ui/side.js` `statListHTML`: usunąć filtr `dmg`, pokazać 8 wierszy, dodać premię (baza z `BASE` w data.js, premia = wartość − baza).
- `text.js` `STAT_GROUPS`, `statValue`, `STAT_LABELS`; `tip.js` (`statTip`): nowe nazwy, jednostki, opisy; `BAR_CAP`.
- `fakty.js`, `text.js` `HELP`: usunąć wzmianki o Obrażeniach i Mocy Dziobnięcia.
- Testy: `node dev/test-area.mjs panel`, `e2e-uklad.mjs` (wysokość panelu: +1–2 wiersze).

**Etap 2: silnik (serwer `pl3y-server/src/games/bulgot/`)**
- `data.js`: kafelki `dmg` → `atkPct`; kafelki `critMult` → `crit` (przeliczenie symulatorem); usunąć rodzinę `obrazenia` z `STAT_FAMILIES` (migracja zapisów/poziomów); `BASE.critMult` stałe 200; postacie i zestawy (Rambo `dmg` za nadwyżkę, `critMult` w Spojrzeniu Rambo) przemapować.
- `stats.js`: usunąć `dmg`/`critMult` ze zwracanego `S` (albo zostawić `critMult: 200` jako stałą); `sim.js`: wzór ciosu bez `S.dmg` w kubełku (warunkowe bonusy zostają).
- `rules.js`: `buildProfile` (styl `crit` liczy `critMult`) przeliczyć na samą szansę; `counterPlan`: kontry tylko od palnika 4; podbić `RUN_V`.
- Zmiany klientów: `ui/*.js`, `shared/` przez `node dev/sync-engine.mjs`, commit w obu repo.
- Balans: `dev/sim-balance.mjs` (małe `--n`, max 6 procesów, niski priorytet); cel: wygrane bota na palnikach 4–5 jak w `balans-stan.md` (±3 pp), plus kontrola palników 0–3 po usunięciu kontr.
- Testy: `cd ../pl3y-server && node --test --test-name-pattern="bulgot" test/all.test.js`, e2e `postacie`, `poziomy`, `smoke`; `node dev/check-sync.mjs`.

**Etap 3: dokumentacja**
- `DESIGN.md` (nowa sekcja 32), `systems-index.md`, `balans-stan.md`, `protocol.md` (jeśli zmienia się widok), notatki; pamięć projektu.

## Ryzyka
- Zmiana Mocy ×1,5 → ×2: build dziobnięć mocniejszy; przeliczyć tak, by średni DPS kafelków był równy.
- Zapisy graczy (poziomy rodziny `obrazenia`, historia, duchy w Arenie, Testament): sprawdzić zgodność lub unieważnić `RUN_V`.
- Panel ma limit wysokości `DESIGN_H = 980`.
