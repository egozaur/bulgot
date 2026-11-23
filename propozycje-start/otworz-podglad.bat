@echo off
rem Uruchamia serwer plikow i otwiera makiete ekranu startowego (modul ES nie dziala z file://).
set PATH=C:\Users\Kurczak\tools\node;%PATH%
start "serwer plikow" /min node C:\Users\Kurczak\tools\scripts\serve.mjs C:\Users\Kurczak\pl3y 8090
timeout /t 2 /nobreak >nul
start "" http://localhost:8090/bulgot/propozycje-start/19-kroki-w-ramkach.html
