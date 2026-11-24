# Bulgot: aktualny stan balansu (punkt odniesienia)

Źródło: pomiar 2026-11-24 przy `RUN_V = 19` (`archiwum/propozycje-raporty/raport-2026-11-24.md`, surowe dane `wyniki-ev-2026-11-24.jsonl`). Bot `dev/sim-balance.mjs`, tryb pełny, 300 partii na komórkę (błąd ok. ±2,2 pp przy 15% wygranych). **Od tego czasu `RUN_V = 20`** (pomocnicy bossa nie giną z bossem, `gigachad` = Kurczak Monocykl, upkeep, `copyDecay`, `endlessJump`, `coinsLate`), więc liczby są orientacyjne, a wiersz `gigachad` jest nieaktualny. Przed strojeniem zmierz stan „przed” na `--n 200`, zamiast ufać tej tabeli.

## Wygrane bota, polityka bazowa (tryb pełny)

| Postać | Palnik 4 | śr. rund | Palnik 5 | śr. rund |
|---|---|---|---|---|
| rzeznik | 28,0% | 10,8 | 7,3% | 7,0 |
| barista | 22,7% | 9,8 | 6,3% | 6,8 |
| emeryt | 22,3% | 8,9 | 3,7% | 5,1 |
| ges | 19,3% | 8,5 | 5,0% | 6,0 |
| pyrtek | 18,0% | 8,5 | 5,0% | 6,2 |
| zwiazkowiec | 18,0% | 8,1 | 5,3% | 5,5 |
| wanda | 17,0% | 8,1 | 3,7% | 5,5 |
| sanepid | 16,3% | 8,1 | 3,7% | 5,8 |
| zjarany | 16,0% | 7,2 | 1,0% | 3,9 |
| jajeczko | 14,0% | 7,0 | 7,0% | 5,5 |
| pacyfista | 13,0% | 8,5 | 1,7% | 5,6 |
| gigachad (przed RUN_V 20) | 10,3% | 7,3 | 4,7% | 5,9 |

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
