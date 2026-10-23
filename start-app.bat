@echo off
title Pay Commission Management System
echo =======================================================
echo   Launching Pay Commission Management Software...
echo =======================================================
echo.
echo Starting Frontend (Vite + React)...
start http://localhost:5173/
cd /d "e:\new_clients\pay_commission_app\frontend"
"C:\Program Files\nodejs\npm.cmd" run dev
pause
