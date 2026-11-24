---
paths:
  - "archiwum/**"
  - "propozycje-*/**"
---
# Archiwum i makiety: tylko do odczytu

- `archiwum/` to makiety, zrzuty, plany i dokumenty przekazania z 21–24.11.2026. Nie są źródłem prawdy (kod i `DESIGN.md` są); część jest nieaktualna.
- Nie edytuj ich i nie traktuj jako specyfikacji. Wyjątek: gdy właściciel wprost o nie prosi.
- `archiwum/propozycje-poker/PLAN.md` to zaparkowany motyw pokerowy (nie implementuj bez prośby). Makiety walki w stylach innych gatunków (`propozycje-walka/`) zostały odrzucone (nie wracaj do nich).
- Skrypty makiet (`zrob-zrzuty.mjs`, `migawka.mjs`) importują `../../art.js`, `../../shared/*`; po przeniesieniu do `archiwum/` ścieżki zostały poprawione o jeden poziom.
