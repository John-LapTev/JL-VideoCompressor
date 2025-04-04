@echo off
chcp 65001 >nul
echo ===================================
echo Запуск JL-VideoCompressor в режиме разработки
echo ===================================

:: Проверяем наличие основных файлов
if not exist src\main.js (
    echo [ОШИБКА] Файл src\main.js не найден!
    pause
    exit /b
)

if not exist src\preload.js (
    echo [ОШИБКА] Файл src\preload.js не найден!
    pause
    exit /b
)

if not exist src\renderer\index.html (
    echo [ОШИБКА] Файл src\renderer\index.html не найден!
    pause
    exit /b
)

:: Проверка наличия папки assets
if not exist src\renderer\assets (
    echo [ИНФО] Создание папки assets...
    mkdir src\renderer\assets
)

:: Проверка наличия иконки chevron-down.svg
if not exist src\renderer\assets\chevron-down.svg (
    echo [ИНФО] Создание иконки для селекта...
    
    :: Создаем SVG-файл для селекта
    echo ^<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9E9E9E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"^> > src\renderer\assets\chevron-down.svg
    echo   ^<polyline points="6 9 12 15 18 9"^>^</polyline^> >> src\renderer\assets\chevron-down.svg
    echo ^</svg^> >> src\renderer\assets\chevron-down.svg
)

:: Устанавливаем переменную среды для режима разработки
set NODE_ENV=development

echo [ЗАПУСК] Запускаем приложение...
call yarn start

pause