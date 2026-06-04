@echo off
title EXOT Downloader
cd /d "%~dp0"

echo ============================================
echo            EXOT Downloader
echo ============================================
echo.

REM Comprobar que Node esta instalado
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js no esta instalado.
    echo Descargalo gratis en: https://nodejs.org  ^(boton verde "LTS"^)
    echo.
    pause
    exit /b
)

REM Instalar dependencias la primera vez
if not exist "node_modules" (
    echo Primera vez: instalando lo necesario, espera un momento...
    echo.
    set YOUTUBE_DL_SKIP_PYTHON_CHECK=1
    call npm install
    echo.
)

echo Iniciando servidor...
echo Abriendo http://localhost:3000 en el navegador...
echo.
echo  ^>^> Para CERRAR la herramienta, cierra esta ventana.
echo.

REM Abrir el navegador y arrancar el servidor
start "" http://localhost:3000
node server.js

pause
