@echo off
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
cd /d "C:\dev\atrivium-teste\BackEnd"
call npm run dev
