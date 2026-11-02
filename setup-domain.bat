@echo off
:: Cek apakah dijalankan sebagai Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Meminta akses Administrator...
    powershell -NoProfile -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ====================================================
echo Menambahkan yahoot.test ke Windows hosts file...
echo ====================================================

findstr /i "yahoot.test" "%windir%\System32\drivers\etc\hosts" >nul
if %errorlevel% neq 0 (
    echo.>> "%windir%\System32\drivers\etc\hosts"
    echo 127.0.0.1      yahoot.test #laragon magic!>> "%windir%\System32\drivers\etc\hosts"
    echo [OK] Berhasil menambahkan yahoot.test ke file hosts!
) else (
    echo [INFO] yahoot.test sudah ada di file hosts.
)

echo Membersihkan cache DNS...
ipconfig /flushdns >nul

echo.
echo ====================================================
echo SELESAI! Domain http://yahoot.test sudah aktif.
echo ====================================================
pause
