# Do zmiany (kolejka od Wielkiego Kurczaka, 2026-11-24)

Format wpisu: **cel**, **gdzie**, **gotowe, gdy**, **najpierw** (co musi się wydarzyć przed kodem: makieta, decyzja, pomiar). Wpis bez kryterium „gotowe, gdy” nie jest jeszcze zadaniem do wykonania: dopytaj przed startem. Skill: `bulgot-feature`.

## 1. Czytelniejszy typ kafelka
- **Cel:** kafelek od razu pokazuje, czym jest (umiejętność, statystyka, przedmiot), zamiast „ściany tekstu”.
- **Gdzie:** `tileCard`/`offerCard` w `ui/run.js`, `style.css` (`.tile`), `tip.js` (szczegóły w podpowiedzi).
- **Gotowe, gdy:** wyraźna plakietka/ikona typu, jednozdaniowy opis na karcie, pełny opis w podpowiedzi; testy `e2e-podpowiedzi`, `e2e-uklad`, `e2e-ikony`.
- **Najpierw:** makieta do akceptacji (wygląd `.tile` jest zamrożony decyzją właściciela).

## 2. Dyżur dnia kończy się po 10 albo 20 piętrze
- **Cel:** tryb dzienny bez przejścia w Dogrywkę (nieskończoność psuje run i ranking).
- **Gdzie:** `dailyOf` i `onDailyEnd` w `profile.js`, faza `victory` w `rules.js` (`choose`), klient: `stageVictory`, `showDaily`.
- **Gotowe, gdy:** po ostatnim piętrze Dyżur kończy się wygraną bez wyboru „dalej” (wymuszone `endRun`); test serwera w `bulgot.suite.js`; `RUN_V` podbity, jeśli zmienia się przebieg runu.
- **Najpierw:** nic, można zaczynać.

## 3. Więcej umiejętności obszarowych (AOE)
- **Cel:** nowe umiejętności bijące wielu wrogów (przydatne przy hordach).
- **Gdzie:** `SKILLS` i `TILES` w `data.js`, `ICON` w `art.js`, `RECIPES` w `fx.js`, `botInputs` w `dev/sim-balance.mjs`.
- **Gotowe, gdy:** każda nowa umiejętność ma ikonę, animację, obsługę bota, Mutacje i zmierzony balans (`bulgot-balance`); `e2e-ikony`, `e2e-efekty`; `RUN_V` podbity.
- **Najpierw:** decyzja właściciela, ile sztuk i jakie żywioły.

## 4. Slow motion ostatniego ciosu
- **Cel:** filmowe spowolnienie i zbliżenie przy dobiciu ostatniego wroga (boss, Prezes).
- **Gdzie:** `onEvent`/`frame` w `ui/fight.js`, `F.stopUntil`, `fx.js`, `fight.css`.
- **Gotowe, gdy:** efekt tylko na obrazie (silnik i wejścia bez zmian, wynik i powtórka identyczne), wyłączany przez `html.reduce`; `e2e-walka`, `e2e-efekty`.
- **Najpierw:** nic, można zaczynać (ustal czas trwania: propozycja 1,2 s, pomijalne klawiszem).
