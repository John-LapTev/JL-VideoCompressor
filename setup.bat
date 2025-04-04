@echo off
chcp 65001 >nul
echo ===================================
echo Установка среды для JL-VideoCompressor
echo ===================================

:: Включаем режим отложенного расширения переменных
setlocal EnableDelayedExpansion

:: Проверяем, установлен ли Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ОШИБКА] Node.js не установлен! Пожалуйста, установите Node.js с сайта https://nodejs.org/
    echo Рекомендуется установить LTS-версию
    pause
    exit /b
)

:: Проверяем версию Node.js (должна быть >= 14)
for /f "tokens=1,2,3 delims=." %%a in ('node -v') do (
    set NODE_MAJOR=%%a
    set NODE_MAJOR=!NODE_MAJOR:~1!
)
if !NODE_MAJOR! LSS 14 (
    echo [ОШИБКА] Версия Node.js слишком старая. Требуется версия 14 или выше.
    echo Установленная версия: 
    node -v
    pause
    exit /b
)

echo [ИНФО] Node.js установлен, продолжаем...

:: Проверяем, установлен ли Yarn
where yarn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ИНФО] Yarn не установлен. Устанавливаем...
    npm install -g yarn
    
    :: Проверяем, успешно ли установился Yarn
    where yarn >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [ОШИБКА] Не удалось установить Yarn. Пожалуйста, установите его вручную.
        pause
        exit /b
    )
) else (
    echo [ИНФО] Yarn уже установлен, продолжаем...
)

:: Проверяем, существует ли package.json
if exist package.json (
    echo [ИНФО] package.json найден, устанавливаем зависимости...
    
    :: Устанавливаем зависимости
    call yarn install
) else (
    echo [ИНФО] package.json не найден, создаем проект с нуля...
    
    :: Инициализируем проект
    call yarn init -y
    
    :: Добавляем базовую информацию в package.json
    echo { > package.json
    echo   "name": "jl-videocompressor", >> package.json
    echo   "version": "1.0.0", >> package.json
    echo   "description": "Мощное приложение для сжатия видео с высоким качеством", >> package.json
    echo   "main": "src/main.js", >> package.json
    echo   "scripts": { >> package.json
    echo     "start": "electron .", >> package.json
    echo     "build": "electron-builder", >> package.json
    echo     "pack": "electron-builder --dir", >> package.json
    echo     "dist": "electron-builder" >> package.json
    echo   }, >> package.json
    echo   "author": "JL", >> package.json
    echo   "license": "MIT", >> package.json
    echo   "build": { >> package.json
    echo     "appId": "com.jl.videocompressor", >> package.json
    echo     "productName": "JL VideoCompressor", >> package.json
    echo     "directories": { >> package.json
    echo       "output": "dist" >> package.json
    echo     }, >> package.json
    echo     "win": { >> package.json
    echo       "target": [ >> package.json
    echo         "portable", >> package.json
    echo         "nsis" >> package.json
    echo       ], >> package.json
    echo       "icon": "resources/icons/icon.ico" >> package.json
    echo     }, >> package.json
    echo     "portable": { >> package.json
    echo       "artifactName": "JL-VideoCompressor-Portable.exe" >> package.json
    echo     }, >> package.json
    echo     "nsis": { >> package.json
    echo       "oneClick": false, >> package.json
    echo       "allowToChangeInstallationDirectory": true, >> package.json
    echo       "installerLanguages": [ >> package.json
    echo         "ru-RU" >> package.json
    echo       ], >> package.json
    echo       "language": "1049" >> package.json
    echo     }, >> package.json
    echo     "files": [ >> package.json
    echo       "**/*", >> package.json
    echo       "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}", >> package.json
    echo       "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}", >> package.json
    echo       "!**/node_modules/*.d.ts", >> package.json
    echo       "!**/node_modules/.bin", >> package.json
    echo       "!dist/**/*", >> package.json
    echo       "!build/**/*", >> package.json
    echo       "!**/.git/**/*" >> package.json
    echo     ] >> package.json
    echo   } >> package.json
    echo } >> package.json
    
    :: Устанавливаем зависимости
    echo [ИНФО] Устанавливаем необходимые зависимости...
    call yarn add electron@latest electron-builder ffmpeg-static fluent-ffmpeg
    call yarn add --dev electron-packager
)

:: Создаем необходимую структуру директорий
echo [ИНФО] Создаем структуру проекта...

:: Основные директории
if not exist src mkdir src
if not exist src\renderer mkdir src\renderer
if not exist src\renderer\assets mkdir src\renderer\assets
if not exist resources mkdir resources
if not exist resources\icons mkdir resources\icons

:: Создаем иконки и ресурсы, если их нет
if not exist src\renderer\assets\chevron-down.svg (
    echo [ИНФО] Создание иконки для селекта...
    
    :: Создаем SVG-файл для селекта
    echo ^<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9E9E9E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"^> > src\renderer\assets\chevron-down.svg
    echo   ^<polyline points="6 9 12 15 18 9"^>^</polyline^> >> src\renderer\assets\chevron-down.svg
    echo ^</svg^> >> src\renderer\assets\chevron-down.svg
)

:: Приветственное сообщение
echo.
echo ===================================
echo Установка завершена успешно!
echo ===================================
echo.
echo Для запуска в режиме разработки используйте:
echo   dev.bat или yarn start
echo.
echo Для сборки приложения используйте:
echo   build.bat или yarn dist
echo.
echo Приятной работы с JL-VideoCompressor!
echo.
pause