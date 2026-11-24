---
paths:
  - "app.js"
  - "ui/**"
  - "style.css"
  - "fight.css"
  - "art.js"
  - "fx.js"
  - "scenes.js"
  - "tip.js"
  - "text.js"
  - "fakty.js"
  - "audio.js"
  - "api.js"
  - "index.html"
---
# Klient (interfejs, walka na ekranie, grafika)

- Czysty HTML/CSS/JS (ES modules), bez builda i bez nowych zależności. Teksty UI i komentarze po polsku; do właściciela „Wielki Kurczak”.
- Klient tylko rysuje; wynik, oferty i nagrody liczy serwer. Nie dodawaj logiki, której wynik miałby znaczenie dla rankingu.
- **Efekty wizualne tylko na obrazie**: nie zmieniaj silnika ani listy wejść (`F.stopUntil` wstrzymuje ticki). Animacje szanują ustawienie `bulgot:anim` / klasę `html.reduce` (nie `prefers-reduced-motion`).
- Skalowanie: `applyScale()` (CSS `zoom` + `--vh`). Nie używaj `100vh`, tylko `var(--vh, 100vh)`. W `.modal` z `zoom` procenty liczą się już po zoomie. Układ na komputerze (od 1121 px) nie może przekroczyć wysokości projektowej `DESIGN_H = 980`; po zmianie sprawdź `dev/e2e-uklad.mjs`.
- Wyglądu kart kafelków (`.tile`) nie zmieniamy (decyzja właściciela); zmiany wymagają makiety do akceptacji.
- Elementy z opisem w podpowiedzi: `data-tipk="tile:<id>|set:<id>|stat:<klucz>|badge:<id>"` albo `data-tip`.
- Nowa ikona, umiejętność lub postać wymaga wpisu w `art.js` (`ICON` / `NEWBODY`), a umiejętność także w `fx.js` (`RECIPES`); lista kroków w skillu `bulgot-feature`.
- Wstawiaj tekst dynamiczny przez `esc()`; `localStorage` tylko przez `store.get/set` (może rzucać).
- Pisanie w `input`/`textarea` nie uruchamia skrótów klawiszowych (guard w `keydown`).
- Interfejs jest podzielony na moduły `ui/*.js` (kilkadziesiąt do ok. 400 linii; mapa w `systems-index.md`), więc czytaj konkretny moduł. `art.js` i `style.css` nie czytaj w całości: `Grep` po nazwie funkcji lub klasy, potem `Read` z `offset`/`limit`. Indeks: `.claude/context/systems-index.md`; szczegóły historyczne: `.claude/context/notatki-klient.md` (`Grep` po tytule).
- Po zmianie `app.js`, `ui/*.js` lub `style.css` rozważ podbicie `?v=` w `index.html` (cache przeglądarki); sprawdź, czy poprzednie commity tak robiły (`git log -p -3 -- index.html`).
