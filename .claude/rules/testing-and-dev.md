---
paths:
  - "dev/e2e-*.mjs"
  - "dev/smoke.mjs"
  - "dev/probe-stage.mjs"
---
# Testy w przeglądarce (dev/)

- Uruchamiaj tylko testy z obszaru zmiany (tabela w `.claude/context/development-workflow.md`); cały zestaw e2e tylko na wyraźną prośbę lub przed wdrożeniem większej zmiany.
- Testy chodzą z `C:\Users\Kurczak\tools\pt` (puppeteer-core + Edge), wymagają serwera plików na porcie 8090 i trybu `?local=1`. Nie instaluj nowych pakietów.
- Po walce czekaj na `.inv, .modal` i czyść `#invoice` (faktura zasłania ekran).
- W testach serwera (`bulgot.suite.js`) `fresh()` wyłącza okólniki i wady, `EXTRA_AT` jest puste, `BOSS_POOL` = oryginały, `lootChance = 100`, a Pyrtek jest neutralnym wzorcem. Nowy test dopasuj do tych założeń, nie zmieniaj ich bez potrzeby.
- Zrzuty ekranu zapisuj poza repo (katalog podany w argumencie), nie commituj ich.
