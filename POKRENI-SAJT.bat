@echo off
setlocal enabledelayedexpansion
title PRODERMA PLUS - lokalni server
cd /d "%~dp0"

set "PORT=8080"
set "RUN="

echo.
echo   ============================================
echo    PRODERMA PLUS - lokalni pregled sajta
echo   ============================================
echo.

where py >nul 2>&1
if !errorlevel! equ 0 set "RUN=py -m http.server !PORT!"

if not defined RUN (
  where python >nul 2>&1
  if !errorlevel! equ 0 set "RUN=python -m http.server !PORT!"
)

if not defined RUN (
  where node >nul 2>&1
  if !errorlevel! equ 0 set "RUN=npx --yes serve -l !PORT! ."
)

if not defined RUN goto NOTOOL

echo   Server: http://localhost:!PORT!
echo   Browser se otvara za 2 sekunde...
echo.
echo   [ Za gasenje servera: zatvori ovaj prozor ili pritisni Ctrl+C ]
echo.

start "" cmd /c "timeout /t 2 >nul & start http://localhost:!PORT!/index.html"
!RUN!
goto :eof

:NOTOOL
echo   Na racunaru nije pronadjen ni Python ni Node.js.
echo.
echo   Resenje - instaliraj jedno od ova dva pa pokreni ponovo:
echo     Python : https://www.python.org/downloads/
echo     Node.js: https://nodejs.org/
echo.
echo   (Sajt radi i ako samo duplo kliknes index.html, ali tada
echo    UV vidzet ne moze da povuce podatke - browser blokira
echo    mrezne pozive sa file:// adrese.)
echo.
pause
