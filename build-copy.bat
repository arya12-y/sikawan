@echo off
REM ============================================
REM  Build frontend + copy ke backend/public
REM  (Opsi 1: cukup php artisan serve)
REM ============================================
cd /d "%~dp0frontend"

echo [1/2] Building frontend...
call npm run build
if errorlevel 1 (
    echo Build GAGAL. Periksa error di atas.
    pause
    exit /b 1
)

echo [2/2] Copying dist ke backend\public...
xcopy /y /s /q "dist\*" "%~dp0backend\public\" >nul

echo.
echo Selesai! Jalankan: cd backend ^&^& php artisan serve
pause
