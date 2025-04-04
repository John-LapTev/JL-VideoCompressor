document.addEventListener('DOMContentLoaded', function() {
    // ================ ЭЛЕМЕНТЫ ИНТЕРФЕЙСА ================
    
    // Элементы для диалога подтверждения
    const confirmDialog = document.getElementById('confirm-dialog');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmOkBtn = document.getElementById('confirm-ok-btn');
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    
    // Элементы интерфейса для работы с файлами
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const videoInfo = document.getElementById('video-info');
    const changeVideoBtn = document.getElementById('change-video-btn');
    
    // Элементы для работы с CRF слайдером
    const crfSlider = document.getElementById('quality');
    const crfValue = document.getElementById('crf-value');
    
    // Элементы для комбинированных полей ввода
    const bitrateInput = document.getElementById('bitrate-input');
    const bitrateToggle = document.getElementById('bitrate-toggle');
    const bitrateDropdown = document.getElementById('bitrate-dropdown');
    const bitrateOptions = bitrateDropdown ? bitrateDropdown.querySelectorAll('.combo-option') : [];
    
    const fpsInput = document.getElementById('fps-input');
    const fpsToggle = document.getElementById('fps-toggle');
    const fpsDropdown = document.getElementById('fps-dropdown');
    const fpsOptions = fpsDropdown ? fpsDropdown.querySelectorAll('.combo-option') : [];
    
    // Элементы для вкладок настроек
    const tabs = document.querySelectorAll('.settings-tab');
    const tabContents = document.querySelectorAll('.settings-content');
    
    // Элементы для сворачивания/разворачивания блока настроек
    const settingsSection = document.getElementById('settings-section');
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsContent = document.getElementById('settings-content');
    let chevronDown, chevronUp;
    
    if (settingsToggle) {
        chevronDown = settingsToggle.querySelector('.chevron-down');
        chevronUp = settingsToggle.querySelector('.chevron-up');
    }
    
    // Элементы для форматов и расширений
    const formatSelect = document.getElementById('format');
    const filenameExtension = document.getElementById('filename-extension');
    const filenameInput = document.getElementById('filename-input');
    
    // Элементы для экранов
    const mainView = document.querySelector('.main-view');
    const progressView = document.getElementById('progress-view');
    const resultsView = document.getElementById('results-view');
    
    // Кнопки действий
    const compressBtn = document.getElementById('compress-btn');
    const resetBtn = document.getElementById('reset-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const newVideoBtn = document.getElementById('new-video-btn');
    
    // Элементы для подсказок
    const tooltipArea = document.getElementById('tooltip-area');
    const tooltipTitle = document.getElementById('tooltip-title');
    const tooltipContent = document.getElementById('tooltip-content');
    const tooltipClose = document.getElementById('tooltip-close');
    const infoIcons = document.querySelectorAll('.info-icon');
    
    // Модальные окна подсказок
    const tooltipModals = document.querySelectorAll('.tooltip-modal');
    const tooltipModalCloses = document.querySelectorAll('.tooltip-modal-close');
    
    // Элементы для уведомлений
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const notificationClose = document.getElementById('notification-close');
    const notificationProgress = document.getElementById('notification-progress');
    
    // Элементы пути сохранения
    const destinationPath = document.getElementById('destination-path');
    const browseButton = document.querySelector('.browse-button');
    
    // Элементы для результатов сжатия
    const openFileBtn = document.querySelector('#open-file-btn');
    const openFolderBtn = document.querySelector('#open-folder-btn');
    
    // Элементы прогресса
    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = document.getElementById('progress-percentage');
    const progressTime = document.getElementById('progress-time');
    const progressStats = document.getElementById('progress-stats');
    const progressFilename = document.getElementById('progress-filename');
    
    // Элементы для открытия файлов
    const openSourceFolderBtn = document.getElementById('open-source-folder-btn');
    const playSourceVideoBtn = document.getElementById('play-source-video-btn');
    const videoPathDisplay = document.getElementById('video-path-display');
    
    // Элементы для результатов - пути файлов
    const originalPath = document.getElementById('original-path');
    const compressedPath = document.getElementById('compressed-path');
    const openOriginalFolderBtn = document.getElementById('open-original-folder-btn');
    const playOriginalVideoBtn = document.getElementById('play-original-video-btn');
    const openCompressedFolderBtn = document.getElementById('open-compressed-folder-btn');
    const playCompressedVideoBtn = document.getElementById('play-compressed-video-btn');
    
    // Элементы для отображения диапазона битрейта
    const actualBitrate = document.getElementById('actual-bitrate');
    
    // Переменные для хранения информации о файле
    let selectedFile = null;
    let selectedFilePath = null;
    let compressionProcess = null;
    let compressedVideoInfo = null;
    
    // Флаг для отслеживания, выбран ли файл
    let isFileSelected = false;
    
    // Флаг для отслеживания пользовательского изменения имени файла
    let userModifiedFilename = false;
    
    // Добавляем элементы продвинутых настроек
    const presetSelect = document.getElementById('preset-select');
    const enableAdvancedParams = document.getElementById('enable-advanced-params');
    const advancedParamsContainer = document.getElementById('advanced-params-container');
    const aqModeSelect = document.getElementById('aq-mode');
    const aqStrengthSlider = document.getElementById('aq-strength');
    const aqStrengthValue = document.getElementById('aq-strength-value');
    const bframesSelect = document.getElementById('bframes');
    const refSelect = document.getElementById('ref');
    const enableTwopass = document.getElementById('enable-twopass');
    
    // Скрываем продвинутые параметры по умолчанию
    if (advancedParamsContainer) {
        advancedParamsContainer.style.display = 'none';
    }
    
    // Отображение/скрытие продвинутых параметров
    if (enableAdvancedParams) {
        enableAdvancedParams.addEventListener('change', function() {
            if (advancedParamsContainer) {
                advancedParamsContainer.style.display = this.checked ? 'block' : 'none';
            }
        });
    }
    
    // Обновление значения ползунка силы квантизации
    if (aqStrengthSlider && aqStrengthValue) {
        aqStrengthSlider.addEventListener('input', function() {
            aqStrengthValue.textContent = this.value;
        });
    }
    
    // Добавляем элемент для индикации двухпроходного кодирования
    const progressPassInfo = document.getElementById('progress-pass-info');
    const currentPass = document.getElementById('current-pass');
    const totalPasses = document.getElementById('total-passes');
    
    // ================ ФУНКЦИИ ================
    
    // Функция для форматирования чисел (разделители тысяч)
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    
    // Функция для форматирования времени
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' + secs : secs}`;
    }
    
    // Функция для показа уведомления
    function showNotification(message, duration = 4000) {
        if (!notification || !notificationText || !notificationProgress) return;
        
        // Устанавливаем текст уведомления
        notificationText.textContent = message;
        
        // Показываем уведомление
        notification.classList.add('show');
        
        // Устанавливаем прогресс-бар
        notificationProgress.style.transition = `transform ${duration}ms linear`;
        notificationProgress.style.transform = 'scaleX(0)';
        
        // Запускаем прогресс-бар после небольшой задержки
        setTimeout(() => {
            notificationProgress.style.transform = 'scaleX(1)';
        }, 50);
        
        // Скрываем уведомление через заданное время
        const timeout = setTimeout(() => {
            hideNotification();
        }, duration);
        
        // Сохраняем timeout ID для возможности отмены
        notification.dataset.timeoutId = timeout;
    }
    
    // Функция для скрытия уведомления
    function hideNotification() {
        if (!notification) return;
        
        // Очищаем таймаут, если есть
        if (notification.dataset.timeoutId) {
            clearTimeout(parseInt(notification.dataset.timeoutId));
            notification.dataset.timeoutId = '';
        }
        
        notification.classList.remove('show');
    }
    
    // Функция для показа кастомного диалога подтверждения
    function showConfirmDialog(title, message) {
        return new Promise((resolve) => {
            if (!confirmDialog || !confirmTitle || !confirmMessage || !confirmOkBtn || !confirmCancelBtn) {
                // Если элементы не найдены, используем стандартный confirm
                const result = confirm(message);
                resolve(result);
                return;
            }
            
            // Устанавливаем заголовок и сообщение
            confirmTitle.textContent = title;
            confirmMessage.textContent = message;
            
            // Показываем диалог
            confirmDialog.classList.add('show');
            
            // Обработчики для кнопок
            const handleConfirm = () => {
                confirmDialog.classList.remove('show');
                confirmOkBtn.removeEventListener('click', handleConfirm);
                confirmCancelBtn.removeEventListener('click', handleCancel);
                resolve(true);
            };
            
            const handleCancel = () => {
                confirmDialog.classList.remove('show');
                confirmOkBtn.removeEventListener('click', handleConfirm);
                confirmCancelBtn.removeEventListener('click', handleCancel);
                resolve(false);
            };
            
            // Закрытие при клике вне диалога
            const handleClickOutside = (e) => {
                if (e.target === confirmDialog) {
                    handleCancel();
                    confirmDialog.removeEventListener('click', handleClickOutside);
                }
            };
            
            // Добавляем обработчики событий
            confirmOkBtn.addEventListener('click', handleConfirm);
            confirmCancelBtn.addEventListener('click', handleCancel);
            confirmDialog.addEventListener('click', handleClickOutside);
        });
    }
    
    // Функция для отображения подсказок через модальные окна
    function showTooltipModal(id) {
        const modalId = `tooltip-${id}`;
        const modal = document.getElementById(modalId);
        
        if (modal) {
            modal.style.display = 'block';
        } else {
            console.log(`Модальное окно для ${id} не найдено, используем запасной вариант`);
            // Используем альтернативный метод, если модальное окно не найдено
            showTooltip(id);
        }
    }
    
    // Старый метод отображения подсказок (альтернативный)
    function showTooltip(id) {
        if (!tooltipArea || !tooltipTitle || !tooltipContent) return;
        
        const tooltips = {
            'format': {
                title: 'Формат выходного файла',
                content: `
                    <p><strong>Выбор формата определяет тип и кодек сжатого видео:</strong></p>
                    <p>• <strong>Оригинал</strong> – сохраняет исходный формат файла</p>
                    <p>• <strong>MP4 (H.264)</strong> – наиболее универсальный и совместимый формат</p>
                    <p>• <strong>MP4 (H.265/HEVC)</strong> – лучшее сжатие, но требует поддержки устройствами</p>
                    <p>• <strong>WebM (VP9)</strong> – открытый формат, хорошо подходит для веб</p>
                    <p>• <strong>AVI</strong> – старый, но широко поддерживаемый формат</p>
                `
            },
            'resolution': {
                title: 'Разрешение видео',
                content: `
                    <p><strong>Разрешение влияет на качество и размер файла:</strong></p>
                    <p>• <strong>Оригинал</strong> – сохраняет исходное разрешение</p>
                    <p>• <strong>1080p</strong> – Full HD, хорошее качество для большинства экранов</p>
                    <p>• <strong>720p</strong> – HD, баланс между качеством и размером</p>
                    <p>• <strong>480p/360p</strong> – низкое разрешение, значительное уменьшение размера</p>
                    <p>Меньшее разрешение дает меньший размер файла, но ухудшает качество изображения.</p>
                `
            },
            'quality': {
                title: 'Качество сжатия (CRF)',
                content: `
                    <p><strong>CRF (Constant Rate Factor) регулирует баланс между качеством и размером:</strong></p>
                    <p>• <strong>Низкий CRF (16-20)</strong> – высокое качество, больший размер файла</p>
                    <p>• <strong>Средний CRF (21-25)</strong> – хороший баланс, рекомендуется 23</p>
                    <p>• <strong>Высокий CRF (26-37)</strong> – ниже качество, меньший размер файла</p>
                    <p>Чем ниже значение CRF, тем выше качество видео и больше размер файла.</p>
                `
            },
            'speed': {
                title: 'Скорость сжатия',
                content: `
                    <p><strong>Выбор между скоростью сжатия и оптимизацией файла:</strong></p>
                    <p>• <strong>Медленнее</strong> – программа будет тщательнее анализировать видео, что даст лучшую оптимизацию, но займёт больше времени.</p>
                    <p>• <strong>Стандартная</strong> – оптимальный баланс между скоростью сжатия и качеством.</p>
                    <p>• <strong>Быстрее</strong> – программа будет работать быстрее, но эффективность сжатия будет ниже. Размер файла может оказаться больше.</p>
                `
            },
            'bitrate': {
                title: 'Битрейт видео',
                content: `
                    <p><strong>Регулирует количество данных для хранения видео:</strong></p>
                    <p>• <strong>Переменный (VBR)</strong> – адаптивный битрейт, оптимизируется автоматически в зависимости от содержимого видео.</p>
                    <p>• <strong>Постоянный (CBR)</strong> – фиксированный битрейт, одинаковый для всего видео. Задаётся числом в Kbps.</p>
                    <p>Рекомендуемые значения: 1000-2000 Kbps для SD, 5000-8000 Kbps для HD, 10000-20000 Kbps для Full HD.</p>
                `
            },
            'fps': {
                title: 'Частота кадров (FPS)',
                content: `
                    <p><strong>Определяет количество кадров в секунду:</strong></p>
                    <p>• <strong>Оригинал</strong> – сохраняет исходную частоту кадров видео</p>
                    <p>• <strong>30 fps</strong> – стандарт для большинства видео, плавное воспроизведение</p>
                    <p>• <strong>60 fps</strong> – высокая плавность, для динамичных видео</p>
                    <p>• <strong>24 fps</strong> – "кинематографичный" стандарт</p>
                    <p>Можно ввести пользовательское значение от 1 до 120 fps.</p>
                `
            },
            'audio-codec': {
                title: 'Аудио кодек',
                content: `
                    <p><strong>Формат сжатия аудио в видеофайле:</strong></p>
                    <p>• <strong>AAC</strong> – современный универсальный кодек, хорошее качество при малом размере</p>
                    <p>• <strong>MP3</strong> – широко поддерживаемый кодек, средняя степень сжатия</p>
                    <p>• <strong>Оригинал</strong> – сохраняет исходный аудио кодек видеофайла</p>
                    <p>AAC обеспечивает лучшее качество звука при меньшем размере файла по сравнению с MP3.</p>
                `
            },
            'audio-bitrate': {
                title: 'Битрейт аудио',
                content: `
                    <p><strong>Качество звука в видеофайле:</strong></p>
                    <p>• <strong>64 kbps</strong> – низкое качество, минимальный размер (для речи)</p>
                    <p>• <strong>96 kbps</strong> – базовое качество для большинства видео</p>
                    <p>• <strong>128 kbps</strong> – стандартное качество, достаточное для большинства видео</p>
                    <p>• <strong>192-256 kbps</strong> – высокое качество для музыки и важных звуков</p>
                    <p>• <strong>320 kbps</strong> – максимальное качество, редко требуется для обычных видео</p>
                    <p>Чем выше битрейт, тем лучше качество звука, но больше размер файла.</p>
                `
            },
            'presets': {
                title: 'Пресеты оптимизации',
                content: `
                    <p><strong>Предустановленные наборы настроек для различных типов видео:</strong></p>
                    <p>• <strong>Без пресета</strong> – текущие настройки без изменений</p>
                    <p>• <strong>Игровое видео</strong> – оптимизировано для динамичных игровых записей с высоким FPS</p>
                    <p>• <strong>Фильм/Сериал</strong> – настройки для киноконтента, сохраняет кинематографичность</p>
                    <p>• <strong>Мобильное устройство</strong> – максимальная совместимость и меньший размер файла</p>
                    <p>• <strong>Максимальное качество</strong> – минимальная потеря качества при сжатии</p>
                    <p>• <strong>Максимальное сжатие</strong> – минимальный размер файла с приемлемым качеством</p>
                    <p>Каждый пресет автоматически настраивает все параметры для достижения наилучшего результата.</p>
                `
            },
            'advanced-params': {
                title: 'Продвинутые параметры кодирования',
                content: `
                    <p><strong>Параметры для тонкой настройки качества сжатия:</strong></p>
                    <p>Эти настройки влияют на алгоритмы сжатия видео и позволяют достичь лучшего качества или меньшего размера файла.</p>
                    <p>Рекомендуется использовать их, если вам нужно добиться максимального качества при минимальном размере файла или у вас есть особые требования к видео.</p>
                `
            },
            'aq-mode': {
                title: 'Режим адаптивной квантизации',
                content: `
                    <p><strong>Что это:</strong> Настройка, которая оптимизирует качество видео, регулируя детализацию разных участков кадра.</p>
                    <p><strong>Как это работает:</strong> Система анализирует каждый кадр и выделяет больше данных для важных или сложных частей изображения.</p>
                    <p>• <strong>Выключено (0)</strong> – равномерное качество по всему кадру, может создавать артефакты на сложных участках</p>
                    <p>• <strong>Режим 1 (Простой)</strong> – базовая оптимизация, хорошо подходит для простых видео</p>
                    <p>• <strong>Режим 2 (Автоматический)</strong> – улучшенный алгоритм, адаптируется к контенту видео</p>
                    <p>• <strong>Режим 3 (Усиленный)</strong> – максимальная оптимизация, рекомендуется для видео с высокой детализацией</p>
                    <p><strong>Пример:</strong> В игровом видео с динамичными сценами выбор "Режима 3" значительно улучшит качество изображения без увеличения размера файла.</p>
                `
            },
            'aq-strength': {
                title: 'Сила адаптивной квантизации',
                content: `
                    <p><strong>Что это:</strong> Определяет насколько интенсивно будет применяться адаптивная квантизация.</p>
                    <p><strong>Как это работает:</strong> Чем выше значение, тем сильнее разница в качестве между важными и второстепенными участками кадра.</p>
                    <p>• <strong>Низкие значения (0.1-0.5)</strong> – минимальное влияние, небольшая разница между участками</p>
                    <p>• <strong>Средние значения (0.6-1.0)</strong> – оптимальный баланс, рекомендуется для большинства видео</p>
                    <p>• <strong>Высокие значения (1.1-2.0)</strong> – максимальное влияние, может улучшить детали в ключевых областях, но ухудшить второстепенные</p>
                    <p><strong>Пример:</strong> Для фильмов значение 0.8-1.0 обычно дает наилучшие результаты, сохраняя детали лиц и текстур.</p>
                `
            },
            'bframes': {
                title: 'B-кадры (двунаправленные кадры)',
                content: `
                    <p><strong>Что это:</strong> Промежуточные кадры, которые ссылаются как на предыдущие, так и на последующие кадры в видеопотоке.</p>
                    <p><strong>Как это работает:</strong> B-кадры занимают меньше места, чем полные кадры, поэтому увеличение их количества может уменьшить размер файла.</p>
                    <p>• <strong>3 кадра</strong> – стандартное значение, подходит для большинства видео</p>
                    <p>• <strong>5 кадров</strong> – улучшенное сжатие для видео со средней динамикой</p>
                    <p>• <strong>8 кадров</strong> – максимальное сжатие, лучше для видео с плавными переходами</p>
                    <p><strong>Пример:</strong> Для видеолекции или фильма с плавными сценами выбор 8 кадров даст лучшее сжатие без потери качества.</p>
                `
            },
            'ref-frames': {
                title: 'Опорные кадры (Reference Frames)',
                content: `
                    <p><strong>Что это:</strong> Количество предыдущих кадров, которые кодек может использовать для предсказания текущего кадра.</p>
                    <p><strong>Как это работает:</strong> Большее количество опорных кадров обычно улучшает качество видео, но требует больше ресурсов при воспроизведении.</p>
                    <p>• <strong>3 кадра</strong> – стандартное значение, подходит для максимальной совместимости</p>
                    <p>• <strong>4 кадра</strong> – улучшенное качество, хорошо работает на большинстве устройств</p>
                    <p>• <strong>5 кадров</strong> – максимальное качество для сложных сцен</p>
                    <p><strong>Пример:</strong> Для игрового видео с быстрым движением выбор 5 опорных кадров может заметно улучшить четкость движущихся объектов.</p>
                `
            },
            'twopass': {
                title: 'Двухпроходное кодирование',
                content: `
                    <p><strong>Что это:</strong> Метод сжатия, при котором видео анализируется дважды для оптимизации качества.</p>
                    <p><strong>Как это работает:</strong></p>
                    <p>• <strong>Первый проход:</strong> Программа анализирует всё видео, собирая данные о сложности сцен, движении и деталях.</p>
                    <p>• <strong>Второй проход:</strong> Используя собранные данные, программа эффективнее распределяет битрейт между разными частями видео.</p>
                    <p><strong>Плюсы:</strong> Лучшее качество при том же размере файла, особенно для видео с разными по сложности сценами.</p>
                    <p><strong>Минусы:</strong> Время сжатия увеличивается примерно вдвое.</p>
                    <p><strong>Пример:</strong> Для фильма, где чередуются динамичные экшен-сцены и спокойные диалоги, двухпроходное кодирование обеспечит более равномерное качество.</p>
                `
            }
        };
        
        if (tooltips[id]) {
            tooltipTitle.innerHTML = tooltips[id].title;
            tooltipContent.innerHTML = tooltips[id].content;
            tooltipArea.classList.add('active');
        }
    }
    
    // Функция обновления имени файла
    function updateFilename() {
        if (!filenameInput || !crfSlider) return;
        
        // Если пользователь вручную изменил имя файла, не обновляем его
        if (userModifiedFilename) return;
        
        const crf = crfSlider.value;
        
        if (!selectedFile && !selectedFilePath) return;
        
        // Получаем имя файла без расширения
        let baseName;
        if (selectedFilePath && window.electronAPI) {
            baseName = window.electronAPI.getFileNameWithoutExt(selectedFilePath);
        } else if (selectedFile) {
            const fileName = selectedFile.name;
            const lastDotIndex = fileName.lastIndexOf('.');
            baseName = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
        } else {
            baseName = "Video";
        }
        
        // Проверяем, содержит ли текущее имя паттерн CRF-XX
        if (baseName.match(/CRF-\d+/)) {
            // Заменяем только CRF часть в имени файла
            const newName = baseName.replace(/CRF-\d+/, `CRF-${crf}`);
            filenameInput.value = newName;
        } else {
            // Если паттерн не найден, добавляем его в начало
            filenameInput.value = `CRF-${crf}_${baseName}`;
        }
    }
    
    // Функция для обрезки длинных имен файлов
    function truncateFileName(fileName, maxLength = 30) {
        if (!fileName || fileName.length <= maxLength) return fileName;
        
        const lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex === -1) {
            // Файл без расширения
            return fileName.substring(0, maxLength - 3) + '...';
        }
        
        const extension = fileName.substring(lastDotIndex);
        const name = fileName.substring(0, lastDotIndex);
        
        return name.substring(0, maxLength - extension.length - 3) + '...' + extension;
    }
    
    // Функция для обновления состояния кнопки сжатия
    function updateCompressButtonState() {
        if (!compressBtn) return;
        
        if (isFileSelected) {
            compressBtn.disabled = false;
            compressBtn.classList.remove('disabled');
        } else {
            compressBtn.disabled = true;
            compressBtn.classList.add('disabled');
        }
    }
    
    // Функция проверки размера файла
    function checkFileSize(file, maxSizeMB = 2000) { // 2GB по умолчанию
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
            showNotification(`Файл слишком большой (${fileSizeMB.toFixed(2)} MB). Максимальный размер: ${maxSizeMB} MB.`, 5000);
            return false;
        }
        return true;
    }

    // Обработка выбора файла
    if (dropzone && fileInput) {
        // Обработка выбора файла при клике на дропзону
        dropzone.addEventListener('click', async function() {
            // Если доступно API Electron, используем системный диалог
            if (window.electronAPI && window.electronAPI.selectVideoFile) {
                const filePath = await window.electronAPI.selectVideoFile();
                if (filePath) {
                    handleFileSystemPath(filePath);
                }
            } else {
                // Если API недоступно, используем стандартный input
                fileInput.click();
            }
        });
        
        // Обработка перетаскивания файла (оставляем как есть для демонстрации)
        dropzone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });
        
        dropzone.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });
        
        dropzone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            // Уведомляем пользователя, что эта функция не поддерживается
            showNotification('Пожалуйста, используйте кнопку для выбора файла', 4000);
        });
        
        // Обработчик стандартного input для случая, если API недоступно
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                // Уведомляем пользователя, что режим веб-браузера не поддерживается полностью
                showNotification('Рекомендуется использовать кнопку для выбора файла', 4000);
            }
        });
    }

    // Функция для обработки системного пути к файлу
    async function handleFileSystemPath(filePath) {
        if (!videoInfo || !dropzone) return;
        
        try {
            // Скрываем дропзону и показываем информацию о видео
            dropzone.style.display = 'none';
            videoInfo.classList.add('active');
            
            // Устанавливаем флаг выбора файла
            isFileSelected = true;
            selectedFilePath = filePath;
            
            // Отображаем имя файла
            const fileName = window.electronAPI.getFileName(filePath);
            const videoNameElement = document.getElementById('video-name');
            if (videoNameElement) {
                videoNameElement.textContent = truncateFileName(fileName, 40);
                videoNameElement.title = fileName;
            }
            
            // Отображаем путь к файлу
            if (videoPathDisplay) {
                videoPathDisplay.textContent = filePath;
                videoPathDisplay.title = filePath;
            }
            
            // Активируем кнопки для открытия папки и воспроизведения
            if (openSourceFolderBtn) {
                openSourceFolderBtn.onclick = function() {
                    const folderPath = filePath.substring(0, filePath.lastIndexOf('\\'));
                    window.electronAPI.openFolder(folderPath);
                };
            }
            
            if (playSourceVideoBtn) {
                playSourceVideoBtn.onclick = function() {
                    window.electronAPI.openFile(filePath);
                };
            }
            
            // Получаем метаданные видео
            try {
                const metadata = await window.electronAPI.getVideoMetadata(filePath);
                
                // Заполняем информацию о видео
                document.getElementById('video-size').textContent = metadata.size + " MB";
                document.getElementById('video-format').textContent = metadata.format;
                document.getElementById('video-resolution').textContent = metadata.resolution;
                document.getElementById('video-duration').textContent = metadata.duration;
                document.getElementById('video-bitrate').textContent = formatNumber(metadata.bitrate) + " Kbps";
                document.getElementById('video-fps').textContent = metadata.fps;
                
                // Обновляем опцию "Оригинал" в селекте форматов
                if (formatSelect) {
                    formatSelect.options[0].textContent = `Оригинал (${metadata.format})`;
                }
                
                // Обновляем опцию "Оригинал" в селекте разрешений
                const resolutionSelect = document.getElementById('resolution');
                if (resolutionSelect) {
                    resolutionSelect.options[0].textContent = `Оригинал (${metadata.resolution})`;
                }
                
                // Обновляем опцию "Оригинал" для FPS
                if (fpsInput) {
                    fpsInput.value = `Оригинал (${metadata.fps} fps)`;
                    fpsInput.setAttribute('data-value', 'original');
                }
                
                // Устанавливаем имя файла для экрана прогресса
                const progressFilename = document.getElementById('progress-filename');
                if (progressFilename) {
                    progressFilename.textContent = fileName;
                }
                
            } catch (error) {
                console.error('Ошибка получения метаданных:', error);
                showNotification('Не удалось получить информацию о видео: ' + error.message, 5000);
                
                // В случае ошибки предоставим минимальную информацию
                document.getElementById('video-name').textContent = fileName;
                document.getElementById('video-format').textContent = window.electronAPI.getFileExtension(filePath).substr(1).toUpperCase();
            }
            
            // Сбрасываем флаг пользовательского изменения имени файла
            userModifiedFilename = false;
            
            // Обновляем имя файла
            const baseFilename = window.electronAPI.getFileNameWithoutExt(filePath);
            if (filenameInput) {
                filenameInput.value = `CRF-${crfSlider.value}_${baseFilename}`;
            }
            
            // Обновляем расширение файла
            const extension = window.electronAPI.getFileExtension(filePath).toLowerCase();
            if (filenameExtension) {
                filenameExtension.textContent = extension;
            }
            
            // Устанавливаем путь сохранения по умолчанию в ту же папку, что и исходное видео
            if (destinationPath) {
                try {
                    // Получаем директорию исходного файла
                    const directory = filePath.substring(0, filePath.lastIndexOf('\\'));
                    destinationPath.value = directory;
                } catch (error) {
                    console.error('Ошибка при получении директории файла:', error);
                    destinationPath.value = window.electronAPI.getDefaultVideoPath();
                }
            }
            
            // Обновляем состояние кнопки сжатия
            updateCompressButtonState();
            
        } catch (error) {
            console.error('Ошибка при обработке файла:', error);
            showNotification('Ошибка при обработке файла: ' + error.message, 5000);
            
            // Возвращаем интерфейс в исходное состояние
            videoInfo.classList.remove('active');
            dropzone.style.display = 'flex';
            isFileSelected = false;
            selectedFilePath = null;
        }
    }
    
    // Функция для переключения состояния блока настроек
    function toggleSettings() {
        if (!settingsContent || !chevronDown || !chevronUp) return;
        
        const isCollapsed = settingsContent.classList.toggle('collapsed');
        
        // Сохраняем состояние в localStorage
        localStorage.setItem('settingsCollapsed', isCollapsed);
        
        // Обновляем иконку
        chevronDown.style.display = isCollapsed ? 'none' : 'block';
        chevronUp.style.display = isCollapsed ? 'block' : 'none';
    }
    
    // Проверка на высокий CRF и запрос подтверждения через кастомный диалог
    async function confirmHighCRF() {
        if (crfSlider && parseInt(crfSlider.value) > 30) {
            const result = await showConfirmDialog(
                "Предупреждение о качестве", 
                "Вы выбрали низкое качество видео (высокое значение CRF). Это может привести к значительному ухудшению качества. Продолжить?"
            );
            return result;
        }
        return true;
    }
    
    // Проверка несовместимых параметров
    function checkIncompatibleSettings() {
        const warnings = [];
        
        // Получаем текущие настройки
        const resolution = document.getElementById('resolution').value;
        const bitrateValue = bitrateInput.getAttribute('data-value');
        const crfValue = parseInt(crfSlider.value);
        const fps = fpsInput.getAttribute('data-value');
        
        // Проверка: высокий битрейт + низкое разрешение
        if ((resolution === '360p' || resolution === '480p') && 
            !isNaN(bitrateValue) && parseInt(bitrateValue) > 5000) {
            warnings.push({
                type: 'warning',
                message: 'Битрейт ' + formatNumber(bitrateValue) + ' Kbps слишком высок для разрешения ' + 
                resolution + '. Рекомендуем 1000-3000 Kbps для этого разрешения.'
            });
        }
        
        // Проверка: низкий битрейт + высокое разрешение
        if ((resolution === '1080p') && 
            !isNaN(bitrateValue) && parseInt(bitrateValue) < 5000) {
            warnings.push({
                type: 'warning',
                message: 'Битрейт ' + formatNumber(bitrateValue) + ' Kbps может быть недостаточным для разрешения ' + 
                resolution + '. Рекомендуем 8000-15000 Kbps для Full HD.'
            });
        }
        
        // Проверка: противоречие высокий CRF (низкое качество) + высокий битрейт
        if (crfValue > 28 && !isNaN(bitrateValue) && parseInt(bitrateValue) > 10000) {
            warnings.push({
                type: 'warning',
                message: 'Вы выбрали высокий CRF (низкое качество) и высокий битрейт. Это противоречивые настройки. Рекомендуем снизить битрейт или уменьшить CRF.'
            });
        }
        
        // Проверка: высокий FPS + низкий битрейт
        if (fps !== 'original' && parseInt(fps) > 30 && 
            !isNaN(bitrateValue) && parseInt(bitrateValue) < 5000) {
            warnings.push({
                type: 'warning',
                message: 'Высокая частота кадров (' + fps + ' fps) с низким битрейтом может привести к ухудшению качества. Рекомендуем увеличить битрейт.'
            });
        }
        
        return warnings;
    }
    
    // Функция для отображения предупреждений
    async function showWarnings(warnings) {
        if (warnings.length === 0) return true;
        
        // Если предупреждений много, показываем диалог
        if (warnings.length > 1) {
            let message = 'Обнаружены потенциальные проблемы с настройками:\n\n';
            warnings.forEach((warning, index) => {
                message += (index + 1) + '. ' + warning.message + '\n\n';
            });
            message += 'Хотите продолжить с текущими настройками?';
            
            return showConfirmDialog('Проверка совместимости', message);
        } 
        // Если только одно предупреждение, показываем уведомление
        else {
            showNotification(warnings[0].message, 6000);
            return true;
        }
    }
    
    // Функция для оценки диапазона переменного битрейта на основе метаданных
    function estimateBitrateRange(originalBitrate, crf, resolution) {
        // Базовый множитель для расчёта
        let factor = 1.0;
        
        // Корректируем множитель в зависимости от CRF
        if (crf <= 18) factor = 0.8;
        else if (crf <= 23) factor = 0.65;
        else if (crf <= 28) factor = 0.5;
        else factor = 0.35;
        
        // Корректируем множитель в зависимости от разрешения
        if (resolution === '720p') factor *= 0.7;
        else if (resolution === '480p') factor *= 0.5;
        else if (resolution === '360p') factor *= 0.3;
        
        // Базовый битрейт
        const baseBitrate = parseInt(originalBitrate);
        
        // Рассчитываем приблизительный диапазон
        const lowerBound = Math.round(baseBitrate * factor * 0.7);
        const upperBound = Math.round(baseBitrate * factor * 1.3);
        
        return {
            lower: lowerBound,
            upper: upperBound
        };
    }
    
    // Функция применения пресета настроек
    function applyPreset(presetName) {
        if (!formatSelect || !crfSlider || !document.getElementById('resolution')) return;
        
        // Настройки по умолчанию
        let format = 'mp4-hevc';
        let resolution = 'original';
        let crf = 23;
        let speedPreset = 'medium';
        let bitrate = 'vbr';
        let fps = 'original';
        let audioCodec = 'aac';
        let audioBitrate = '128';
        
        // Продвинутые настройки
        let aqMode = '3';
        let aqStrength = '0.8';
        let bframes = '8';
        let refs = '5';
        let twopass = true;
        
        // Применяем конкретный пресет
        switch (presetName) {
            case 'game':
                // Пресет для игрового видео
                format = 'mp4-hevc';
                resolution = '720p';
                crf = 21;
                speedPreset = 'medium'; // Баланс между скоростью и качеством
                bitrate = 'vbr';
                fps = 'original'; // Сохраняем оригинальный FPS для плавности
                audioCodec = 'aac';
                audioBitrate = '128';
                // Продвинутые параметры
                aqMode = '3'; // Усиленная адаптивная квантизация для динамичных сцен
                aqStrength = '0.8';
                bframes = '8';
                refs = '5';
                twopass = true;
                break;
                
            case 'film':
                // Пресет для фильмов
                format = 'mp4-hevc';
                resolution = 'original';
                crf = 22;
                speedPreset = 'slow'; // Медленнее для лучшего качества
                bitrate = 'vbr';
                fps = 'original';
                audioCodec = 'aac';
                audioBitrate = '160'; // Лучший звук для фильмов
                // Продвинутые параметры
                aqMode = '3';
                aqStrength = '1.0'; 
                bframes = '8';
                refs = '5';
                twopass = true;
                break;
                
            case 'mobile':
                // Пресет для мобильных устройств (меньший размер)
                format = 'mp4-hevc';
                resolution = '720p';
                crf = 26; // Более высокий CRF для меньшего размера
                speedPreset = 'medium';
                bitrate = 'vbr';
                fps = '30'; // Ограничиваем до 30 fps
                audioCodec = 'aac';
                audioBitrate = '96'; // Низкий битрейт аудио
                // Продвинутые параметры
                aqMode = '2';
                aqStrength = '1.0';
                bframes = '5';
                refs = '4';
                twopass = false; // Экономим время
                break;
                
            case 'quality':
                // Максимальное качество
                format = 'mp4-hevc';
                resolution = 'original';
                crf = 18; // Низкий CRF = высокое качество
                speedPreset = 'slow';
                bitrate = 'vbr';
                fps = 'original';
                audioCodec = 'aac';
                audioBitrate = '192'; // Высокое качество звука
                // Продвинутые параметры
                aqMode = '3';
                aqStrength = '0.6'; // Меньшая сила = выше качество
                bframes = '8';
                refs = '5';
                twopass = true;
                break;
                
            case 'compression':
                // Максимальное сжатие
                format = 'mp4-hevc';
                resolution = '720p';
                crf = 28; // Высокий CRF = меньший размер
                speedPreset = 'medium'; // Средняя скорость - баланс
                bitrate = 'vbr';
                fps = '30'; // Ограничиваем fps
                audioCodec = 'aac';
                audioBitrate = '96'; // Минимальный битрейт для хорошего качества звука
                // Продвинутые параметры
                aqMode = '3';
                aqStrength = '1.2'; // Более сильная квантизация
                bframes = '8';
                refs = '4';
                twopass = true;
                break;
                
            case 'none':
                // Не меняем настройки (только показываем уведомление)
                showNotification('Пресет не выбран. Используются текущие настройки.', 3000);
                return;
        }
        
        // Применяем настройки к UI только если выбран какой-то пресет
        if (presetName !== 'none') {
            formatSelect.value = format;
            // Триггер события change для обновления аудиокодеков при смене формата
            const changeEvent = new Event('change');
            formatSelect.dispatchEvent(changeEvent);
            
            document.getElementById('resolution').value = resolution;
            crfSlider.value = crf;
            
            // Обновляем отображаемое значение CRF
            if (crfValue) {
                crfValue.textContent = crf;
                const percent = (crf - 16) / (37 - 16);
                const position = percent * 100;
                crfValue.style.left = `${position}%`;
            }
            
            document.getElementById('speed').value = speedPreset;
            
            // Обновляем битрейт
            if (bitrateInput) {
                if (bitrate === 'vbr') {
                    bitrateInput.value = 'Переменный (VBR)';
                    bitrateInput.setAttribute('data-value', 'vbr');
                } else {
                    bitrateInput.value = `${bitrate} Kbps`;
                    bitrateInput.setAttribute('data-value', bitrate);
                }
            }
            
            // Обновляем FPS
            if (fpsInput) {
                if (fps === 'original') {
                    fpsInput.value = `Оригинал (${document.getElementById('video-fps') ? document.getElementById('video-fps').textContent : '30'} fps)`;
                    fpsInput.setAttribute('data-value', 'original');
                } else {
                    fpsInput.value = `${fps} fps`;
                    fpsInput.setAttribute('data-value', fps);
                }
            }
            
            // Обновляем аудио настройки
            const audioCodecSelect = document.getElementById('audio-codec');
            if (audioCodecSelect && (format !== 'webm' || (audioCodec === 'libopus' || audioCodec === 'libvorbis'))) {
                for (let i = 0; i < audioCodecSelect.options.length; i++) {
                    if (audioCodecSelect.options[i].value === audioCodec) {
                        audioCodecSelect.selectedIndex = i;
                        break;
                    }
                }
            }
            
            document.getElementById('audio-bitrate').value = audioBitrate;
            
            // Обновляем продвинутые настройки
            if (aqModeSelect) aqModeSelect.value = aqMode;
            if (aqStrengthSlider) {
                aqStrengthSlider.value = aqStrength;
                if (aqStrengthValue) aqStrengthValue.textContent = aqStrength;
            }
            if (bframesSelect) bframesSelect.value = bframes;
            if (refSelect) refSelect.value = refs;
            if (enableTwopass) enableTwopass.checked = twopass;
            
            // Обновляем имя файла
            updateFilename();
            
            // Обновляем расширение файла
            if (formatSelect && filenameExtension) {
                let extension = '.mp4';
                if (format === 'webm') extension = '.webm';
                else if (format === 'avi') extension = '.avi';
                else if (format === 'original' && selectedFilePath && window.electronAPI) {
                    extension = window.electronAPI.getFileExtension(selectedFilePath);
                }
                
                filenameExtension.textContent = extension;
            }
            
            // Показываем уведомление о применении пресета
            const presetNames = {
                'game': 'Игровое видео',
                'film': 'Фильм/Сериал',
                'mobile': 'Мобильное устройство',
                'quality': 'Максимальное качество',
                'compression': 'Максимальное сжатие'
            };
            
            showNotification(`Применен пресет: ${presetNames[presetName]}`, 3000);
        }
    }
    
    // Функция для получения настроек сжатия
    function getCompressionOptions() {
        // Получаем базовые значения из интерфейса
        const format = formatSelect.value;
        const resolution = document.getElementById('resolution').value;
        const crf = parseInt(crfSlider.value);
        const speed = document.getElementById('speed').value;
        const bitrateValue = bitrateInput.getAttribute('data-value');
        const fpsValue = fpsInput.getAttribute('data-value');
        const audioCodec = document.getElementById('audio-codec').value;
        const audioBitrate = document.getElementById('audio-bitrate').value;
        
        // Получаем продвинутые параметры
        const advancedParams = {};
        
        if (enableAdvancedParams && enableAdvancedParams.checked) {
            if (aqModeSelect) advancedParams.aqMode = aqModeSelect.value;
            if (aqStrengthSlider) advancedParams.aqStrength = aqStrengthSlider.value;
            if (bframesSelect) advancedParams.bframes = bframesSelect.value;
            if (refSelect) advancedParams.ref = refSelect.value;
            if (enableTwopass) advancedParams.twopass = enableTwopass.checked;
        }
        
        // Определяем расширение файла
        let extension = '.mp4';
        if (format === 'webm') extension = '.webm';
        else if (format === 'avi') extension = '.avi';
        else if (format === 'original' && selectedFilePath) {
            // Если выбран "Оригинал", используем расширение исходного файла
            if (window.electronAPI) {
                extension = window.electronAPI.getFileExtension(selectedFilePath);
            }
        }
        
        return {
            input: selectedFilePath,
            format: format,
            resolution: resolution,
            crf: crf,
            speed: speed,
            bitrate: bitrateValue === 'vbr' ? 'vbr' : parseInt(bitrateValue),
            fps: fpsValue === 'original' ? 'original' : parseInt(fpsValue),
            audioCodec: audioCodec,
            audioBitrate: parseInt(audioBitrate),
            filename: filenameInput.value,
            extension: extension,
            destination: destinationPath.value,
            advancedParams: enableAdvancedParams && enableAdvancedParams.checked ? advancedParams : {}
        };
    }
    
    
    // ================ ОБРАБОТЧИКИ СОБЫТИЙ ================
    
    // Инициализация кнопки сжатия в выключенное состояние при запуске
    if (compressBtn) {
        // По умолчанию кнопка неактивна, пока не выбран файл
        compressBtn.disabled = true;
        compressBtn.classList.add('disabled');
    }
    
    // Инициализация закрытия уведомлений
    if (notification && notificationClose) {
        notificationClose.addEventListener('click', hideNotification);
    }
    
    // Инициализация подсказок
    if (infoIcons.length > 0) {
        infoIcons.forEach(icon => {
            icon.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                const tooltipId = this.getAttribute('data-tooltip');
                showTooltipModal(tooltipId);
            });
        });
    }
    
    // Закрытие модальных окон подсказок
    if (tooltipModalCloses.length > 0) {
        tooltipModalCloses.forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                const modal = this.closest('.tooltip-modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
        // Закрытие модальных окон при клике вне содержимого
        window.addEventListener('click', function(e) {
            tooltipModals.forEach(modal => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }
    
    // Закрытие обычных подсказок
    if (tooltipClose) {
        tooltipClose.addEventListener('click', function() {
            tooltipArea.classList.remove('active');
        });
        
        // Клик вне подсказки также закрывает её
        document.addEventListener('click', function(e) {
            if (tooltipArea.classList.contains('active') && !e.target.closest('.info-icon') && !e.target.closest('.tooltip-area')) {
                tooltipArea.classList.remove('active');
            }
        });
    }
    
    // Установка начального состояния блока настроек
    if (settingsContent) {
        const isSettingsCollapsed = localStorage.getItem('settingsCollapsed') === 'true';
        
        if (isSettingsCollapsed) {
            settingsContent.classList.add('collapsed');
            if (chevronDown) chevronDown.style.display = 'none';
            if (chevronUp) chevronUp.style.display = 'block';
        }
    }
    
    // Обработчик для сворачивания/разворачивания настроек
    if (settingsToggle) {
        settingsToggle.addEventListener('click', toggleSettings);
    }
    
    const sectionTitleContainer = document.querySelector('.section-title-container');
    if (sectionTitleContainer) {
        sectionTitleContainer.addEventListener('click', toggleSettings);
    }
    
    // Обработчики для вкладок настроек
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            
            const tabContent = document.getElementById(`${tabId}-settings`);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });
    
    // Инициализация CRF слайдера
    if (crfSlider && crfValue) {
        crfSlider.addEventListener('input', function() {
            const value = this.value;
            crfValue.textContent = value;
            
            // Вычисляем положение для отображения значения
            const percent = (value - 16) / (37 - 16);
            const position = percent * 100;
            crfValue.style.left = `${position}%`;
            
            // Обновляем имя файла при изменении CRF
            updateFilename();
        });
        
        // Установка начального положения отображения CRF
        const initialPercent = (crfSlider.value - 16) / (37 - 16);
        crfValue.style.left = `${initialPercent * 100}%`;
    }
    
    // Обработчик для отслеживания изменения имени файла пользователем
    if (filenameInput) {
        filenameInput.addEventListener('input', function() {
            // Если пользователь изменил имя файла, устанавливаем флаг
            userModifiedFilename = true;
        });
    }
    
    // Обработчик изменения формата выходного файла
    if (formatSelect && filenameExtension) {
        formatSelect.addEventListener('change', function() {
            const formatValue = this.value;
            let extension = '.mp4'; // По умолчанию
            
            // Определяем расширение файла в зависимости от выбранного формата
            if (formatValue === 'webm') {
                extension = '.webm';
            } else if (formatValue === 'avi') {
                extension = '.avi';
            } else if (formatValue === 'original' && selectedFilePath) {
                // Если выбран "Оригинал", используем расширение исходного файла
                if (window.electronAPI) {
                    extension = window.electronAPI.getFileExtension(selectedFilePath);
                }
            }
            
            // Обновляем отображаемое расширение
            filenameExtension.textContent = extension;
        });
    }
    
    // Инициализация комбинированного поля для битрейта
    if (bitrateToggle && bitrateDropdown) {
        bitrateToggle.addEventListener('click', function() {
            bitrateDropdown.classList.toggle('show');
            if (fpsDropdown) fpsDropdown.classList.remove('show'); // Закрываем другой дропдаун
        });
    }
    
    if (bitrateOptions.length > 0 && bitrateInput) {
        bitrateOptions.forEach(option => {
            option.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                const text = this.textContent;
                
                bitrateInput.value = text;
                bitrateInput.setAttribute('data-value', value);
                bitrateDropdown.classList.remove('show');
            });
        });
        
        if (bitrateInput) {
            bitrateInput.addEventListener('focus', function() {
                // Если выбран "Переменный (VBR)", очищаем поле при фокусе
                if (this.getAttribute('data-value') === 'vbr') {
                    this.value = '';
                }
            });
            
            bitrateInput.addEventListener('blur', function() {
                // Валидация ввода - должно быть число или "Переменный (VBR)"
                if (this.value === '') {
                    this.value = 'Переменный (VBR)';
                    this.setAttribute('data-value', 'vbr');
                } else if (!isNaN(this.value)) {
                    // Ограничиваем значение битрейта
                    let bitrate = parseInt(this.value);
                    if (bitrate < 100) bitrate = 100; // Минимальный битрейт
                    if (bitrate > 50000) bitrate = 50000; // Максимальный битрейт
                    
                    this.setAttribute('data-value', bitrate);
                    this.value = formatNumber(bitrate) + ' Kbps';
                }
            });
        }
    }
    
    // Инициализация комбинированного поля для FPS
    if (fpsToggle && fpsDropdown) {
        fpsToggle.addEventListener('click', function() {
            fpsDropdown.classList.toggle('show');
            if (bitrateDropdown) bitrateDropdown.classList.remove('show'); // Закрываем другой дропдаун
        });
    }
    
    if (fpsOptions.length > 0 && fpsInput) {
        fpsOptions.forEach(option => {
            option.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                
                if (value === 'custom') {
                    // Если выбрано "Другое значение", очищаем поле для ввода
                    fpsInput.value = '';
                    fpsInput.focus();
                } else {
                    const text = this.textContent;
                    fpsInput.value = text;
                    fpsInput.setAttribute('data-value', value);
                }
                
                fpsDropdown.classList.remove('show');
            });
        });
        
        if (fpsInput) {
            fpsInput.addEventListener('focus', function() {
                // Если выбран предустановленный FPS, очищаем поле при фокусе
                if (['original', '60', '30', '24'].includes(this.getAttribute('data-value'))) {
                    this.value = '';
                }
            });
            
            fpsInput.addEventListener('blur', function() {
                // Валидация ввода - должно быть число или предустановленное значение
                if (this.value === '') {
                    this.value = 'Оригинал (30 fps)';
                    this.setAttribute('data-value', 'original');
                } else if (!isNaN(this.value)) {
                    // Ограничиваем значение FPS
                    let fps = parseInt(this.value);
                    if (fps < 1) fps = 1; // Минимальный FPS
                    if (fps > 120) fps = 120; // Максимальный FPS
                    
                    this.setAttribute('data-value', fps);
                    this.value = `${fps} fps`;
                }
            });
        }
    }
    
    // Закрытие выпадающих списков при клике вне них
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.combo-input-container')) {
            if (bitrateDropdown) bitrateDropdown.classList.remove('show');
            if (fpsDropdown) fpsDropdown.classList.remove('show');
        }
    });
    
    // Кнопка изменения видео
    if (changeVideoBtn && videoInfo && dropzone) {
        changeVideoBtn.addEventListener('click', function() {
            videoInfo.classList.remove('active');
            dropzone.style.display = 'flex';
            if (fileInput) fileInput.value = ''; // Сбрасываем значение input file
            
            // Сбрасываем флаг выбора файла
            isFileSelected = false;
            selectedFile = null;
            selectedFilePath = null;
            
            // Обновляем состояние кнопки сжатия
            updateCompressButtonState();
        });
    }
    
    // Обработка кнопки "Обзор" для выбора директории
    if (browseButton && destinationPath) {
        browseButton.addEventListener('click', async function() {
            if (window.electronAPI) {
                const selectedDir = await window.electronAPI.selectDirectory();
                if (selectedDir) {
                    destinationPath.value = selectedDir;
                }
            }
        });
    }
    
    // Обработка обновления прогресса сжатия
    if (window.electronAPI && typeof window.electronAPI.onCompressionProgress === 'function') {
        window.electronAPI.onCompressionProgress((data) => {
            if (!progressBar || !progressPercentage || !progressTime || !progressStats) return;
            
            // Обновляем прогресс-бар
            progressBar.style.width = `${data.progress}%`;
            progressPercentage.textContent = `${Math.floor(data.progress)}%`;
            
            // Вычисляем оставшееся время
            const remainingTime = (data.totalTime - data.currentTime);
            progressTime.textContent = `Осталось: ${formatTime(remainingTime)}`;
            
            // Обновляем статистику сжатия
            const originalSizeElement = document.getElementById('video-size');
            if (originalSizeElement) {
                const totalSize = parseFloat(originalSizeElement.textContent);
                const compressedSoFar = (data.progress / 100) * totalSize;
                progressStats.textContent = `Сжато: ${compressedSoFar.toFixed(2)} MB / ${totalSize} MB`;
            }
            
            // Отображаем информацию о двухпроходном кодировании
            if (progressPassInfo && currentPass && totalPasses && data.pass && data.totalPasses) {
                progressPassInfo.style.display = 'block';
                currentPass.textContent = data.pass;
                totalPasses.textContent = data.totalPasses;
            } else if (progressPassInfo) {
                progressPassInfo.style.display = 'none';
            }
        });
    } else {
        console.warn('ElectronAPI или метод onCompressionProgress не доступны');
    }
    
    // Кнопка сжатия видео
    if (compressBtn && mainView && progressView) {
        compressBtn.addEventListener('click', async function() {
            // Проверка, выбран ли файл
            if (!isFileSelected || !selectedFilePath) {
                showNotification('Пожалуйста, выберите видеофайл для сжатия', 4000);
                return;
            }
            
            // Проверка несовместимых настроек
            const warnings = checkIncompatibleSettings();
            if (warnings.length > 0) {
                const shouldContinue = await showWarnings(warnings);
                if (!shouldContinue) return;
            }
            
            // Подтверждение, если высокий CRF
            const shouldContinue = await confirmHighCRF();
            if (!shouldContinue) return;
            
            // Получаем настройки сжатия
            const options = getCompressionOptions();
            
            // Переходим на экран прогресса
            mainView.classList.remove('active');
            progressView.classList.add('active');
            
            try {
                // Запускаем процесс сжатия
                const result = await window.electronAPI.compressVideo(options);
                
                // Если сжатие успешно, показываем результаты
                if (result && result.success) {
                    compressedVideoInfo = result.info;
                    
                    // Переходим на экран результатов
                    progressView.classList.remove('active');
                    resultsView.classList.add('active');
                    
                    // Заполняем информацию о результатах
                    const originalSize = document.getElementById('original-size');
                    const originalResolution = document.getElementById('original-resolution');
                    const originalBitrate = document.getElementById('original-bitrate');
                    const originalDuration = document.getElementById('original-duration');
                    const originalFormat = document.getElementById('original-format');
                    const originalFps = document.getElementById('original-fps');
                    
                    const compressedSize = document.getElementById('compressed-size');
                    const compressedResolution = document.getElementById('compressed-resolution');
                    const compressedFormat = document.getElementById('compressed-format');
                    const compressedBitrate = document.getElementById('compressed-bitrate');
                    const compressedCrf = document.getElementById('compressed-crf');
                    const compressedFps = document.getElementById('compressed-fps');
                    
                    // Заполняем информацию об оригинале
                    if (originalSize) originalSize.textContent = document.getElementById('video-size').textContent;
                    if (originalResolution) originalResolution.textContent = document.getElementById('video-resolution').textContent;
                    if (originalBitrate) originalBitrate.textContent = document.getElementById('video-bitrate').textContent;
                    if (originalDuration) originalDuration.textContent = document.getElementById('video-duration').textContent;
                    if (originalFormat) originalFormat.textContent = document.getElementById('video-format').textContent;
                    if (originalFps) originalFps.textContent = document.getElementById('video-fps').textContent;
                    
                    // Заполняем информацию о сжатом файле
                    if (compressedSize) compressedSize.textContent = result.info.size + " MB";
                    if (compressedResolution) compressedResolution.textContent = result.info.resolution;
                    if (compressedFormat) compressedFormat.textContent = options.format === 'original' 
                        ? document.getElementById('video-format').textContent 
                        : (options.format === 'mp4' ? 'MP4 (H.264)' : 
                           options.format === 'mp4-hevc' ? 'MP4 (H.265/HEVC)' : 
                           options.format === 'webm' ? 'WebM (VP9)' : 'AVI');
                    if (compressedBitrate) compressedBitrate.textContent = result.info.bitrate;
                    if (compressedCrf) compressedCrf.textContent = options.crf;
                    if (compressedFps) compressedFps.textContent = options.fps === 'original' ? document.getElementById('video-fps').textContent : options.fps;
                    
                    // Отображаем пути к файлам
                    if (originalPath) {
                        originalPath.textContent = selectedFilePath;
                        originalPath.title = selectedFilePath;
                    }
                    
                    if (compressedPath && result.info.path) {
                        compressedPath.textContent = result.info.path;
                        compressedPath.title = result.info.path;
                    }
                    
                    // Настраиваем кнопки действий для файлов
                    if (openOriginalFolderBtn) {
                        openOriginalFolderBtn.onclick = function() {
                            const folderPath = selectedFilePath.substring(0, selectedFilePath.lastIndexOf('\\'));
                            window.electronAPI.openFolder(folderPath);
                        };
                    }
                    
                    if (playOriginalVideoBtn) {
                        playOriginalVideoBtn.onclick = function() {
                            window.electronAPI.openFile(selectedFilePath);
                        };
                    }
                    
                    if (openCompressedFolderBtn && result.info.path) {
                        openCompressedFolderBtn.onclick = function() {
                            const folderPath = result.info.path.substring(0, result.info.path.lastIndexOf('\\'));
                            window.electronAPI.openFolder(folderPath);
                        };
                    }
                    
                    if (playCompressedVideoBtn && result.info.path) {
                        playCompressedVideoBtn.onclick = function() {
                            window.electronAPI.openFile(result.info.path);
                        };
                    }
                    
                    // Показываем диапазон битрейта, если был выбран переменный битрейт
                    if (actualBitrate && options.bitrate === 'vbr') {
                        // Получаем исходный битрейт для оценки диапазона
                        const originalBitrateValue = parseInt(document.getElementById('video-bitrate').textContent.replace(/[^\d]/g, ''));
                        
                        // Оцениваем диапазон битрейта для VBR
                        const bitrateRange = estimateBitrateRange(originalBitrateValue, options.crf, options.resolution);
                        
                        // Отображаем диапазон
                        actualBitrate.textContent = `~${formatNumber(bitrateRange.lower)}-${formatNumber(bitrateRange.upper)} Kbps`;
                        actualBitrate.style.display = 'inline';
                    } else if (actualBitrate) {
                        actualBitrate.style.display = 'none';
                    }
                    
                    // Вычисляем и отображаем процент сжатия
                    const ratioElement = document.querySelector('.ratio-value');
                    if (ratioElement) {
                        const originalSizeMB = parseFloat(document.getElementById('video-size').textContent);
                        const compressionRatio = ((originalSizeMB - result.info.size) / originalSizeMB) * 100;
                        ratioElement.textContent = Math.round(compressionRatio) + "%";
                    }
                    
                    // Настраиваем кнопки открытия файла и папки
                    if (openFileBtn) {
                        openFileBtn.onclick = function() {
                            if (compressedVideoInfo && compressedVideoInfo.path) {
                                window.electronAPI.openFile(compressedVideoInfo.path);
                            }
                        };
                    }
                    
                    if (openFolderBtn) {
                        openFolderBtn.onclick = function() {
                            if (compressedVideoInfo && compressedVideoInfo.path) {
                                const folderPath = compressedVideoInfo.path.substring(0, compressedVideoInfo.path.lastIndexOf('\\'));
                                window.electronAPI.openFolder(folderPath);
                            }
                        };
                    }
                } else {
                    throw new Error('Не удалось получить результат сжатия');
                }
            } catch (error) {
                console.error('Ошибка при сжатии видео:', error);
                showNotification('Ошибка при сжатии видео: ' + error.message, 5000);
                
                // Возвращаемся на главный экран
                progressView.classList.remove('active');
                mainView.classList.add('active');
            }
        });
    }
    
    // Кнопка отмены сжатия
    if (cancelBtn && progressView && mainView) {
        cancelBtn.addEventListener('click', function() {
            // Показываем диалог подтверждения
            showConfirmDialog("Отмена сжатия", "Вы уверены, что хотите отменить процесс сжатия?").then(result => {
                if (result) {
                    // Сбросить прогресс при отмене
                    if (progressBar) progressBar.style.width = '0%';
                    if (progressPercentage) progressPercentage.textContent = '0%';
                    if (progressTime) progressTime.textContent = 'Осталось: 0:30';
                    
                    // Возвращаемся на главный экран
                    progressView.classList.remove('active');
                    mainView.classList.add('active');
                }
            });
        });
    }
    
    // Кнопка "Сжать новое видео" на экране результатов
    if (newVideoBtn && resultsView && mainView && videoInfo && dropzone) {
        newVideoBtn.addEventListener('click', function() {
            resultsView.classList.remove('active');
            mainView.classList.add('active');
            
            // Возвращаемся к выбору файла
            videoInfo.classList.remove('active');
            dropzone.style.display = 'flex';
            if (fileInput) fileInput.value = '';
            
            // Сбрасываем флаги
            isFileSelected = false;
            selectedFile = null;
            selectedFilePath = null;
            compressedVideoInfo = null;
            userModifiedFilename = false;
            
            // Обновляем состояние кнопки сжатия
            updateCompressButtonState();
        });
    }
    
    // Кнопка сброса настроек
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            // Сброс селектов
            if (formatSelect) formatSelect.selectedIndex = 0;
            
            const resolutionSelect = document.getElementById('resolution');
            if (resolutionSelect) resolutionSelect.selectedIndex = 0;
            
            const speedSelect = document.getElementById('speed');
            if (speedSelect) speedSelect.selectedIndex = 1; // Стандартная
            
            const audioCodecSelect = document.getElementById('audio-codec');
            if (audioCodecSelect) audioCodecSelect.selectedIndex = 0;
            
            const audioBitrateSelect = document.getElementById('audio-bitrate');
            if (audioBitrateSelect) audioBitrateSelect.selectedIndex = 2; // 128 kbps
            
            // Сброс комбинированных полей
            if (bitrateInput) {
                bitrateInput.value = 'Переменный (VBR)';
                bitrateInput.setAttribute('data-value', 'vbr');
            }
            
            if (fpsInput) {
                fpsInput.value = 'Оригинал (30 fps)';
                fpsInput.setAttribute('data-value', 'original');
            }
            
            // Сброс ползунка CRF
            if (crfSlider && crfValue) {
                crfSlider.value = 23;
                crfValue.textContent = '23';
                crfValue.style.left = `${((23 - 16) / (37 - 16)) * 100}%`;
            }
            
            // Сброс пресета
            if (presetSelect) {
                presetSelect.selectedIndex = 0;
            }
            
            // Сброс флага пользовательского изменения имени
            userModifiedFilename = false;
            
            // Обновляем имя файла
            updateFilename();
            
            // Обновляем расширение файла в соответствии с форматом
            if (formatSelect && filenameExtension) {
                const formatValue = formatSelect.value;
                let extension = '.mp4'; // По умолчанию
                
                if (formatValue === 'webm') {
                    extension = '.webm';
                } else if (formatValue === 'avi') {
                    extension = '.avi';
                } else if (formatValue === 'original' && selectedFilePath && window.electronAPI) {
                    extension = window.electronAPI.getFileExtension(selectedFilePath);
                }
                
                filenameExtension.textContent = extension;
            }
            
            // Отображаем стильное уведомление о сбросе
            showNotification('Настройки сброшены до значений по умолчанию', 4000);
        });
    }
    
    // Обработчик для формата - обновляет аудиокодеки при смене формата
    if (formatSelect) {
        formatSelect.addEventListener('change', function() {
            const formatValue = this.value;
            const audioCodecSelect = document.getElementById('audio-codec');

            if (audioCodecSelect) {
                // Сохраняем текущий выбор аудиокодека
                const currentAudioCodec = audioCodecSelect.value;
                
                // Очищаем существующие опции
                audioCodecSelect.innerHTML = '';
                
                if (formatValue === 'webm') {
                    // Для WebM поддерживаются только Opus и Vorbis
                    const opusOption = document.createElement('option');
                    opusOption.value = 'libopus';
                    opusOption.textContent = 'Opus';
                    audioCodecSelect.appendChild(opusOption);
                    
                    const vorbisOption = document.createElement('option');
                    vorbisOption.value = 'libvorbis';
                    vorbisOption.textContent = 'Vorbis';
                    audioCodecSelect.appendChild(vorbisOption);
                    
                    // Автоматически выбираем Opus как стандартный для WebM
                    audioCodecSelect.value = 'libopus';
                    
                    // Показываем уведомление пользователю
                    showNotification('Для формата WebM необходим аудиокодек Opus или Vorbis', 5000);
                } else {
                    // Для других форматов доступны стандартные опции
                    const aacOption = document.createElement('option');
                    aacOption.value = 'aac';
                    aacOption.textContent = 'AAC';
                    audioCodecSelect.appendChild(aacOption);
                    
                    const mp3Option = document.createElement('option');
                    mp3Option.value = 'mp3';
                    mp3Option.textContent = 'MP3';
                    audioCodecSelect.appendChild(mp3Option);
                    
                    const originalOption = document.createElement('option');
                    originalOption.value = 'original';
                    originalOption.textContent = 'Оригинал';
                    audioCodecSelect.appendChild(originalOption);
                    
                    // Восстанавливаем предыдущий выбор, если он допустим для нового формата
                    if (currentAudioCodec === 'aac' || currentAudioCodec === 'mp3' || currentAudioCodec === 'original') {
                        audioCodecSelect.value = currentAudioCodec;
                    } else {
                        audioCodecSelect.value = 'aac'; // По умолчанию для других форматов
                    }
                }
            }
        });
    }
    
    // Обработчик выбора пресета
    if (presetSelect) {
        presetSelect.addEventListener('change', function() {
            applyPreset(this.value);
        });
    }
});