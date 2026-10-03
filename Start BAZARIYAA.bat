@echo off
rem Double-click this file to open the BAZARIYAA site on this computer.
rem It starts a small local server and opens your browser.
rem Keep this black window open while you use the site. Close it to stop.

cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Download it from https://nodejs.org and try again.
  pause
  exit /b
)
rem Open the browser 2 seconds later, once the server is running.
start "" /min cmd /c "timeout /t 2 >nul & start http://localhost:8000"
node tools\serve.js 8000
pause
