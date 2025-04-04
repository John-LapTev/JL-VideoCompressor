@echo off
echo ===================================
echo Building JL-VideoCompressor
echo ===================================

:: Basic file checks
if not exist src\main.js (
    echo ERROR: src\main.js not found
    pause
    exit /b
)

if not exist src\preload.js (
    echo ERROR: src\preload.js not found
    pause
    exit /b
)

if not exist src\renderer\index.html (
    echo ERROR: src\renderer\index.html not found
    pause
    exit /b
)

echo Choose build type:
echo 1. Portable version
echo 2. Installer
echo 3. Both versions
echo.

set /p choice=Your choice (1-3): 

if "%choice%"=="1" (
    echo Building Portable version...
    call yarn electron-builder --win portable
) else if "%choice%"=="2" (
    echo Building Installer...
    call yarn electron-builder --win nsis
) else if "%choice%"=="3" (
    echo Building both versions...
    call yarn dist
) else (
    echo Invalid option. Building both versions by default...
    call yarn dist
)

if %ERRORLEVEL% == 0 (
    echo.
    echo Build completed successfully!
    echo Files are available in dist/ folder
) else (
    echo.
    echo Error during build process. Error code: %ERRORLEVEL%
)

pause