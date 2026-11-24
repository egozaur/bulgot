---
name: bulgot-analizy
description: Pobieranie i streszczanie partii wysłanych przez graczy przyciskiem „Wyślij do analizy” (komentarze, znaczniki, kto i gdzie ginie). Użyj, gdy właściciel prosi o przejrzenie analiz, opinii graczy albo o wnioski z nowych partii.
---
# Analizy partii graczy

## Kiedy
„Zobacz analizy”, „co piszą gracze”, „dlaczego test1 przegrywa na piętrze X”, przygotowanie poprawek po testach.

## Procedura
1. **Pobierz nowe** (klucz leży w pliku poza repo, patrz pamięć „Klucz admina”; nie wypisuj go w odpowiedzi ani nie zapisuj w repo):
   `export PATH="/c/Users/Kurczak/tools/node:$PATH"; BG_ADMIN_KEY="$(cat /c/Users/Kurczak/.claude/secrets/bg_admin_key | tr -d '\r\n')" node dev/pobierz-analizy.mjs`
   Zapisuje do `C:\Users\Kurczak\pl3y\analizy-bulgot` tylko brakujące pliki. Bez `--usun`, chyba że właściciel każe czyścić serwer. Pomiń ten krok, jeśli prosi o przejrzenie tego, co już jest.
2. **Streść, nie czytaj surowych JSON-ów** (po 20+ KB): `node dev/podsumuj-analizy.mjs --since <data>` (opcje: `--nick`, `--char`, `--notes` tylko z komentarzem, `--id <id>` dziennik rund jednej partii).
3. **Wzorce**, które warto wyłuskać: postać × palnik z 0% wygranych; powtarzający się zabójca (boss, elita, horda); runda, na której ginie najwięcej; partie z `v` starszym od bieżącego `RUN_V` (nie dowodzą stanu obecnej gry); komentarze i znaczniki graczy.
4. **Zestaw z balansem**: porównaj z `.claude/context/balans-stan.md`. Pojedyncze partie to anegdoty; wniosek o balansie potwierdź symulatorem (skill `bulgot-balance`).
5. **Raport** (krótki): ile partii, kto i czym gra, najczęstsze przyczyny porażek, cytaty komentarzy, 3–5 propozycji z uzasadnieniem. Propozycje mogą trafić do `DO-ZMIANY.md` tylko po akceptacji właściciela.

## Unikaj
Pobierania przy każdym pytaniu; czytania wszystkich 150+ plików; wyciągania wniosków z `RUN_V` starszych niż bieżący bez zastrzeżenia; kasowania partii z serwera bez prośby; ujawniania klucza.

## Gotowe, gdy
Właściciel dostał zwięzłe streszczenie z liczbami i cytatami, a propozycje są oznaczone jako niezatwierdzone.
