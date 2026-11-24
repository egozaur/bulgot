# Do zmiany (kolejka od Wielkiego Kurczaka, 2026-11-24)

1. **Czytelniejszy typ kafelka**: kafelek ma od razu pokazywać, czym jest (umiejętność, statystyka, przedmiot), a nie „ścianę tekstu”. Do zrobienia: wyraźna plakietka/ikona typu, krótki opis jednym zdaniem, szczegóły w podpowiedzi. Uwaga: wygląd kart `.tile` jest zamrożony decyzją właściciela, więc najpierw makieta do akceptacji.
2. **Tryb dzienny (Dyżur dnia) musi się kończyć po 10 albo 20 piętrze**: bez przejścia w Dogrywkę (nieskończoność psuje run i ranking). Sprawdzić `dailyOf` / `profile.js` i fazę `victory` (wymusić `endRun`, bez wyboru „dalej”).
3. **Więcej umiejętności AOE** (obszarowych): nowe wpisy w `SKILLS` i `TILES` + ikona w `art.js` (`ICON`) + receptura w `fx.js` + obsługa w `botInputs` (`dev/sim-balance.mjs`), balans symulatorem.
4. **Slow motion ostatniego ciosu** (filmowa kamera / fatality w stylu Mortal Kombat): spowolnienie obrazu i zbliżenie przy dobiciu ostatniego wroga (boss, Prezes). Tylko obraz: `F.stopUntil`, bez zmian silnika i wejść; szanować `html.reduce` (ustawienie animacji).
