const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const os = require('os');

// Экспортируем API для использования в рендерере
contextBridge.exposeInMainWorld('electronAPI', {
  // Выбор видеофайла через диалог
  selectVideoFile: () => ipcRenderer.invoke('select-file'),
  
  // Диалоговые окна
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  
  // Получение метаданных видео
  getVideoMetadata: (filePath) => ipcRenderer.invoke('get-video-metadata', filePath),
  
  // Сжатие видео
  compressVideo: (options) => ipcRenderer.invoke('compress-video', options),
  
  // Обработка прогресса сжатия
  onCompressionProgress: (callback) => {
    // Добавляем проверку на параметр
    if (typeof callback === 'function') {
      ipcRenderer.on('compression-progress', (event, data) => callback(data));
    }
  },
  
  // Открытие файла и папки
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),
  
  // Получение пути к пользовательским видео
  getDefaultVideoPath: () => {
    // Упрощенная версия
    const homedir = os.homedir();
    return path.join(homedir, 'Videos');
  },
  
  // Получение имени файла из пути
  getFileName: (filePath) => {
    return path.basename(filePath);
  },

  // Получение имени файла без расширения
  getFileNameWithoutExt: (filePath) => {
    return path.basename(filePath, path.extname(filePath));
  },
  
  // Получение расширения файла
  getFileExtension: (filePath) => {
    return path.extname(filePath);
  }
});

// API для обновлений
contextBridge.exposeInMainWorld('updateAPI', {
  // Проверка наличия обновлений
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  
  // Начать скачивание обновления
  startDownload: (downloadUrl) => ipcRenderer.invoke('start-update-download', downloadUrl),
  
  // Отслеживание прогресса скачивания
  onDownloadProgress: (callback) => {
    if (typeof callback === 'function') {
      ipcRenderer.on('update-download-progress', (event, data) => callback(data));
    }
  },
  
  // Открыть скачанный файл обновления
  openUpdateFile: (filePath) => ipcRenderer.invoke('open-update-file', filePath),
  
  // Показать папку с обновлением
  showUpdateFolder: (filePath) => ipcRenderer.invoke('show-update-folder', filePath)
});

// Логируем, что скрипт преднагрузки выполнен
console.log('Preload script loaded successfully');
