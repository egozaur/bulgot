# Bulgot: aktualny stan balansu (punkt odniesienia)

Źródło: pomiar 2026-11-25 przy `RUN_V = 22` (po scaleniu Ataku z Obrażeniami, Dziobnięcie ×2, kontry tylko od palnika 4; `DESIGN.md` sekcja 32). Bot `dev/sim-balance.mjs`, tryb pełny, 400 partii na komórkę (błąd ok. ±2 pp), te same ziarna co pomiar „przed”. Dla porównania: przed zmianą średnia 12 postaci wynosiła 24,7% (palnik 3), 19,2% (palnik 4), 5,7% (palnik 5); po zmianie 32,6% / 22,0% / 6,1%. Palniki 0–3 nie mają już kontr, więc są łatwiejsze.

## Wygrane bota, polityka bazowa (tryb pełny)

| Postać | Palnik 3 | śr. rund | Palnik 4 | śr. rund | Palnik 5 | śr. rund |
|---|---|---|---|---|---|---|
| rzeznik | 49,8% | 13,5 | 34,8% | 11,7 | 9,0% | 7,6 |
| barista | 34,3% | 11,4 | 26,0% | 10,6 | 8,0% | 7,2 |
| gigachad | 30,0% | 9,5 | 25,0% | 8,8 | 11,0% | 6,4 |
| ges | 35,8% | 10,8 | 24,3% | 9,5 | 8,8% | 7,0 |
| emeryt | 34,8% | 10,4 | 24,8% | 9,3 | 4,3% | 5,2 |
| pyrtek | 30,8% | 10,3 | 22,8% | 9,6 | 4,8% | 6,6 |
| zwiazkowiec | 35,5% | 10,8 | 22,5% | 9,0 | 6,8% | 5,9 |
| zjarany | 37,3% | 11,1 | 20,0% | 8,1 | 2,8% | 4,3 |
| sanepid | 39,5% | 12,3 | 17,8% | 8,6 | 5,3% | 6,0 |
| wanda | 25,5% | 9,3 | 16,5% | 8,2 | 3,5% | 5,6 |
| pacyfista | 21,3% | 10,2 | 16,5% | 9,0 | 3,0% | 6,0 |
| jajeczko | 16,0% | 7,2 | 12,8% | 6,5 | 5,8% | 5,5 |

Wcześniejsze punkty odniesienia (inne wersje reguł): `DESIGN.md` sekcje 9, 17 (palniki 0–5, Pyrtek 1000 runów), 27 (audyt).

## Wnioski z pomiaru (wartość decyzji, średnio po 12 postaciach, G4)

- Dokupowanie kafelków: najsilniejsza dźwignia (bez niego −12,4 pp).
- Dodatkowe rundy (Gruszka/Pipsztal): branie jest +EV; próg ok. 60% życia najlepszy.
- Drzwi ryzykowne: brać przy wysokim życiu (nigdy: −6,1 pp).
- Odpoczynek: próg 65–80% życia lepszy niż 55% (+0,5…+0,8 pp).
- Trasy strefowe bez wpływu (±0,5 pp); Ulepszanie i reroll to małe decyzje.
- Specjalizacja się nie opłaca (czyste buildy −2…−16 pp): synergie słabo nagradzają zaangażowanie.
- 6 z 8 Klątw Prezesa ma ujemne EV; pierwszy boss to ściana (25–35% partii na palnikach 4–5 kończy się na piętrze 6); palnik 5 daje botowi 1–7% wygranych.
- Rekomendacje do decyzji właściciela: sekcje 7–8 raportu (czekają na decyzję).

## Jak odświeżyć

- Jedna konfiguracja: `node -r ./dev/lib-prio.cjs dev/sim-balance.mjs --mode full --garnek 4 --char <id> --n 200 --table`.
- Cała siatka (postacie × palniki × warianty decyzji): `dev/analiza-ev.mjs` (wznawialny, niski priorytet, własny limit czasu, max 6 procesów); wynik jako `.jsonl`.
- Po odświeżeniu zaktualizuj tabelę, datę i `RUN_V` w tym pliku (jedno miejsce, bez kopii w innych dokumentach).

## Pomiar do pojedynku (2026-11-24, `RUN_V = 20`)

Tryb Szybki, palnik 5, bot `smart`, 300 partii na postać (±3 pp). Wygrane: gigachad 14,0%, jajeczko 13,7%, rzeznik 13,0%, ges 11,0%, barista 10,3%, zwiazkowiec 8,3%, pyrtek 7,0%, emeryt 6,0%, wanda 4,7%, sanepid 2,7%, pacyfista 2,7%, zjarany 1,7%. Średnio ukończonych pięter: najgorzej zjarany 3,05, emeryt 3,78, wanda 3,91. Trzy najsłabsze wg wygranych (zjarany, sanepid, pacyfista) trafiły do `DUEL.weak` w `duel.js`; po zmianie balansu odśwież listę.

## Patch 1.1 (RUN_V 23): pomiar 2026-11-25

Po usunięciu drzwi, Sile (płaski Atak) i krytyku z przepełnieniem. Bot `smart`, tryb pełny, 400 partii na komórkę (błąd ok. ±2 pp), te same ziarna. Średnia 12 postaci: palnik 3 / 4 / 5 = 34,2% / 20,0% / 6,4% (przed patchem 32,6% / 22,0% / 6,1%; bez Siły 29,0% / 16,0% / 4,5%). Tabela (p3, p4, p5 = wygrane; r = średnio ukończonych rund):

| postać | p3 | r | p4 | r | p5 | r |
|---|---|---|---|---|---|---|
| pyrtek | 36.8% | 11.2 | 23.0% | 9.6 | 5.0% | 6.8 |
| zjarany | 31.3% | 10.6 | 10.8% | 6.7 | 0.8% | 3.9 |
| barista | 45.3% | 12.9 | 31.3% | 11.5 | 10.0% | 8.1 |
| ges | 40.5% | 11.8 | 25.0% | 10.1 | 9.3% | 7.2 |
| rzeznik | 50.2% | 13.6 | 27.5% | 11.2 | 9.3% | 8.3 |
| gigachad | 32.3% | 9.8 | 22.3% | 8.8 | 12.0% | 7.0 |
| jajeczko | 13.8% | 7.1 | 8.8% | 6.4 | 5.5% | 5.6 |
| emeryt | 31.8% | 10.0 | 21.3% | 8.8 | 4.5% | 5.1 |
| sanepid | 39.5% | 12.4 | 16.5% | 8.4 | 5.3% | 6.1 |
| wanda | 24.8% | 8.7 | 18.3% | 7.8 | 5.5% | 5.8 |
| zwiazkowiec | 33.5% | 9.9 | 18.3% | 8.5 | 6.8% | 6.1 |
| pacyfista | 30.8% | 11.7 | 17.0% | 9.8 | 3.3% | 6.7 |
| **średnia** | 34.2% | 10.8 | 20.0% | 9.0 | 6.4% | 6.4 |
