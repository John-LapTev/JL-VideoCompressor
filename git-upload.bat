@echo off
chcp 65001 >nul
echo ===================================
echo Загрузка JL-VideoCompressor на GitHub
echo ===================================

:: Проверка наличия Git
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ОШИБКА] Git не установлен! Пожалуйста, установите Git с сайта https://git-scm.com/
    pause
    exit /b
)

:: Проверяем, инициализирован ли Git в текущей директории
if not exist .git (
    echo [ИНФО] Инициализация Git репозитория...
    git init
    
    echo [ИНФО] Создание .gitignore файла...
    (
        echo node_modules/
        echo dist/
        echo .DS_Store
        echo Thumbs.db
        echo .env
        echo *.log
    ) > .gitignore
)

:: Добавление всех файлов в индекс Git
echo [ИНФО] Добавление файлов в Git...
git add .

:: Создание коммита
set /p commit_message=Введите сообщение коммита (или нажмите Enter для сообщения по умолчанию): 
if "%commit_message%"=="" set commit_message=Первоначальная загрузка JL-VideoCompressor

git commit -m "%commit_message%"

:: Проверка наличия удаленного репозитория origin
git remote -v | findstr "origin" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [ИНФО] Добавление удаленного репозитория...
    set /p repo_url=Введите URL вашего GitHub репозитория (https://github.com/John-LapTev/JL-VideoCompressor.git): 
    
    if "%repo_url%"=="" set repo_url=https://github.com/John-LapTev/JL-VideoCompressor.git
    
    git remote add origin %repo_url%
) else (
    echo [ИНФО] Удаленный репозиторий уже настроен.
)

:: Отправка изменений на GitHub
echo [ИНФО] Отправка изменений на GitHub...
git push -u origin master

if %ERRORLEVEL% NEQ 0 (
    echo [ИНФО] Попробуем использовать main вместо master...
    git push -u origin main
)

echo ===================================
echo Проект успешно загружен на GitHub!
echo ===================================
pause