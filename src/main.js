const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { spawn } = require('child_process');
const os = require('os');
const https = require('https');

// Функция для проверки наличия файла
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    console.error('Ошибка при проверке наличия файла:', error);
    return false;
  }
}

// URL для проверки обновлений
const UPDATE_CHECK_URL = 'https://jl-studio.art/my_apps/JL_Video_Compressor/update_info.json';

// Функция для получения текущей версии из package.json
function getCurrentVersion() {
  try {
    const packageJsonPath = path.join(app.getAppPath(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version;
  } catch (error) {
    console.error('Ошибка при получении текущей версии:', error);
    return '1.0.0'; // Версия по умолчанию
  }
}

// Функция для сравнения версий
function isNewer(latestVersion, currentVersion) {
  const latest = latestVersion.split('.').map(Number);
  const current = currentVersion.split('.').map(Number);

  for (let i = 0; i < Math.max(latest.length, current.length); i++) {
    const a = latest[i] || 0;
    const b = current[i] || 0;
    if (a > b) return true;
    if (a < b) return false;
  }

  return false; // Версии равны
}

// Функция для проверки обновлений
function checkForUpdates() {
  return new Promise((resolve, reject) => {
    console.log('Проверка наличия обновлений...');
    
    const req = https.get(UPDATE_CHECK_URL, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Ошибка при получении информации об обновлениях: ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const updateInfo = JSON.parse(data);
          const currentVersion = getCurrentVersion();
          
          console.log(`Текущая версия: ${currentVersion}, последняя версия: ${updateInfo.latest_version}`);
          
          if (isNewer(updateInfo.latest_version, currentVersion)) {
            console.log('Доступно обновление!');
            resolve({
              hasUpdate: true,
              currentVersion,
              ...updateInfo
            });
          } else {
            console.log('Обновлений не найдено.');
            resolve({
              hasUpdate: false,
              currentVersion,
              latest_version: updateInfo.latest_version
            });
          }
        } catch (error) {
          reject(new Error(`Ошибка при обработке информации об обновлениях: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Ошибка при проверке обновлений:', error);
      reject(new Error(`Ошибка при проверке обновлений: ${error.message}`));
    });
    
    req.end();
  });
}

// Функция для скачивания файла обновления
function downloadUpdate(downloadUrl, saveFilePath, onProgress) {
  return new Promise((resolve, reject) => {
    // Создаем папку для загрузки, если её нет
    const downloadDir = path.dirname(saveFilePath);
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }
    
    const file = fs.createWriteStream(saveFilePath);
    
    console.log(`Скачивание обновления из ${downloadUrl} в ${saveFilePath}`);
    
    https.get(downloadUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Ошибка при скачивании обновления: ${response.statusCode}`));
        return;
      }
      
      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;
      
      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        file.write(chunk);
        
        if (onProgress && totalSize) {
          const progress = Math.round((downloadedSize / totalSize) * 100);
          onProgress(progress, downloadedSize, totalSize);
        }
      });
      
      response.on('end', () => {
        file.end();
        console.log('Скачивание обновления завершено');
        resolve({ filePath: saveFilePath });
      });
      
    }).on('error', (error) => {
      fs.unlink(saveFilePath, () => {}); // Удаляем недозагруженный файл
      console.error('Ошибка при скачивании обновления:', error);
      reject(new Error(`Ошибка при скачивании обновления: ${error.message}`));
    });
  });
}

// Определение пути для загрузки обновления
function getUpdateDownloadPath(filename) {
  const downloadDir = path.join(app.getPath('downloads'), 'JL-VideoCompressor-Updates');
  return path.join(downloadDir, filename);
}

// Определение пути к FFmpeg - УЛУЧШЕННАЯ ВЕРСИЯ
let ffmpegPath;

// Попробуем несколько вариантов расположения ffmpeg.exe
const possiblePaths = [
  // Путь в ресурсах приложения (вариант 1)
  process.resourcesPath ? path.join(process.resourcesPath, 'ffmpeg.exe') : null,
  
  // Путь в распакованных файлах asar (вариант 2)
  process.resourcesPath ? path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe') : null,
  
  // Рядом с исполняемым файлом (вариант 3)
  path.join(path.dirname(process.execPath), 'ffmpeg.exe'),
  
  // В текущей директории (вариант 4)
  path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe'),
  
  // Стандартный путь из модуля ffmpeg-static (вариант 5)
  require('ffmpeg-static'),
  
  // Дополнительные пути для Windows
  path.join(app.getAppPath(), 'node_modules', 'ffmpeg-static', 'ffmpeg.exe'),
  path.join(app.getAppPath(), '..', 'ffmpeg.exe')
];

// Проверяем все возможные пути
for (const potentialPath of possiblePaths) {
  if (potentialPath && fileExists(potentialPath)) {
    ffmpegPath = potentialPath;
    console.log(`Найден FFmpeg: ${ffmpegPath}`);
    break;
  }
}

// Если ни один путь не работает, выводим предупреждение
if (!ffmpegPath) {
  console.error('ВНИМАНИЕ: Не удалось найти ffmpeg.exe! Функции сжатия видео могут не работать.');
  
  // Используем стандартный путь как запасной вариант (который может не работать, но это лучше, чем ничего)
  ffmpegPath = require('ffmpeg-static');
}

// Устанавливаем путь к FFmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Важное изменение: разрешаем доступ к Node.js API в preload
      sandbox: false, 
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../resources/icons/icon.png'),
    show: false, // Не показываем окно пока оно не будет готово
    backgroundColor: '#121212' // Цвет фона соответствует --bg-color из CSS
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

  // Показываем окно, когда контент загружен
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Открываем DevTools в режиме разработки
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// Создаем окно когда Electron готов
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Закрываем приложение, когда все окна закрыты (кроме macOS)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Обработка запроса на выбор файла
ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    title: 'Выберите видеофайл',
    filters: [
      { name: 'Видеофайлы', extensions: ['mp4', 'avi', 'mkv', 'mov', 'webm', 'flv', 'wmv'] },
      { name: 'Все файлы', extensions: ['*'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  
  return null;
});

// Обработка запроса на выбор директории для сохранения
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Выберите папку для сохранения'
  });
  
  if (!result.canceled) {
    return result.filePaths[0];
  }
  
  return null;
});

// Обработка получения метаданных видео
ipcMain.handle('get-video-metadata', async (event, filePath) => {
  return new Promise((resolve, reject) => {
    console.log(`Анализ файла: ${filePath}`);
    
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error('Ошибка получения метаданных:', err);
        reject(err);
        return;
      }
      
      console.log('Метаданные получены:', JSON.stringify(metadata.format, null, 2));
      
      // Извлекаем необходимые метаданные
      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
      const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');
      
      if (!videoStream) {
        reject(new Error('Видеопоток не найден'));
        return;
      }
      
      // Вычисляем длительность в секундах
      const duration = metadata.format.duration;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      
      // Определяем реальный формат файла на основе расширения
      const fileExtension = path.extname(filePath).toLowerCase().substring(1); // Убираем точку
      let format = fileExtension.toUpperCase();
      
      // Если расширение не соответствует стандартным форматам, используем данные FFmpeg
      if (!['MP4', 'AVI', 'MOV', 'MKV', 'WEBM', 'FLV', 'WMV'].includes(format)) {
        format = metadata.format.format_name.split(',')[0].toUpperCase();
      }
      
      // Формируем информацию о видео
      const videoInfo = {
        format: format,
        resolution: `${videoStream.width}x${videoStream.height}`,
        duration: `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`,
        size: Math.round(metadata.format.size / 1024 / 1024 * 100) / 100, // Размер в МБ
        bitrate: Math.round(metadata.format.bit_rate / 1000), // Битрейт в Kbps
        fps: Math.round(eval(videoStream.r_frame_rate)) // Частота кадров
      };
      
      console.log('Информация о видео:', videoInfo);
      resolve(videoInfo);
    });
  });
});

// Вспомогательная функция для экранирования пути к файлу
function escapePath(filePath) {
  // Если путь содержит пробелы, но не заключен в кавычки, заключаем его в кавычки
  return filePath;
}

// Функция для создания временной директории для логов двухпроходного кодирования
function createTempDirectory() {
  const tempDir = path.join(os.tmpdir(), 'jl-videocompressor-' + Date.now());
  try {
    fs.mkdirSync(tempDir, { recursive: true });
    return tempDir;
  } catch (error) {
    console.error('Ошибка создания временной директории:', error);
    return os.tmpdir();
  }
}

// Функция для удаления временных файлов
function cleanupTempFiles(tempDir, baseFilename) {
  try {
    const files = fs.readdirSync(tempDir);
    for (const file of files) {
      if (file.startsWith(baseFilename)) {
        fs.unlinkSync(path.join(tempDir, file));
      }
    }
    
    // Пытаемся удалить саму директорию, если она пуста
    try {
      fs.rmdirSync(tempDir);
    } catch (e) {
      // Игнорируем ошибку, если директория не пуста
    }
  } catch (error) {
    console.warn('Ошибка при очистке временных файлов:', error);
  }
}

// Обработка запроса на сжатие видео
ipcMain.handle('compress-video', async (event, options) => {
  // Создаем окончательный путь сохранения
  const outputPath = path.join(options.destination, options.filename + options.extension);
  
  console.log('Запуск сжатия видео:');
  console.log('Входной файл:', options.input);
  console.log('Выходной файл:', outputPath);
  console.log('Настройки:', JSON.stringify(options, null, 2));
  console.log('Путь к FFmpeg:', ffmpegPath);
  
  // Проверяем, существует ли выходной файл
  if (fileExists(outputPath)) {
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Заменить', 'Отмена'],
      title: 'Файл уже существует',
      message: 'Файл с таким именем уже существует. Заменить?'
    });
    
    if (response === 1) { // Если пользователь выбрал "Отмена"
      return { 
        success: false, 
        error: 'Файл уже существует' 
      };
    }
    
    // Если пользователь выбрал "Заменить", удаляем существующий файл
    try {
      fs.unlinkSync(outputPath);
    } catch (error) {
      console.error('Ошибка при удалении существующего файла:', error);
      return { 
        success: false, 
        error: `Не удалось удалить существующий файл: ${error.message}` 
      };
    }
  }
  
  // Проверяем, доступна ли директория для записи
  try {
    fs.accessSync(options.destination, fs.constants.W_OK);
  } catch (error) {
    console.error('Ошибка доступа к директории назначения:', error);
    return { 
      success: false, 
      error: `Нет доступа к директории назначения: ${error.message}` 
    };
  }
  
  return new Promise((resolve, reject) => {
    try {
      let codecArgs = [];
      let bitrateArgs = [];
      
      // Настройка кодека видео
      switch (options.format) {
        case 'mp4':
          codecArgs.push('-c:v', 'libx264');
          break;
        case 'mp4-hevc':
          codecArgs.push('-c:v', 'libx265');
          break;
        case 'webm':
          codecArgs.push('-c:v', 'libvpx-vp9');
          break;
        case 'avi':
          codecArgs.push('-c:v', 'libx264', '-f', 'avi');
          break;
        case 'original':
          // Вместо копирования, используем libx264 для оригинального формата
          // Это обеспечит применение CRF и других настроек
          const extension = path.extname(options.input).toLowerCase();
          if (extension === '.webm') {
            codecArgs.push('-c:v', 'libvpx-vp9');
          } else if (extension === '.avi') {
            codecArgs.push('-c:v', 'libx264', '-f', 'avi');
          } else {
            // По умолчанию для большинства форматов
            codecArgs.push('-c:v', 'libx264');
          }
          break;
      }
      
      // Настройка разрешения
      let scaleFilter = '';
      if (options.resolution !== 'original') {
        let width, height;
        switch (options.resolution) {
          case '1080p':
            width = 1920;
            height = 1080;
            break;
          case '720p':
            width = 1280;
            height = 720;
            break;
          case '480p':
            width = 854;
            height = 480;
            break;
          case '360p':
            width = 640;
            height = 360;
            break;
        }
        scaleFilter = `-vf scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`;
      }
      
      // Настройка битрейта
      if (options.bitrate !== 'vbr' && options.format !== 'original') {
        bitrateArgs.push('-b:v', `${options.bitrate}k`);
      } else if (options.format !== 'original') {
        // Если VBR, используем CRF
        bitrateArgs.push('-crf', options.crf.toString());
      }
      
      // Настройка аудио кодека
      let audioCodecArgs = [];
      
      // Особая обработка для WebM - требуется Vorbis или Opus аудио, а не AAC
      if (options.format === 'webm') {
        // Для WebM используем Opus аудио
        audioCodecArgs.push('-c:a', 'libopus');
        audioCodecArgs.push('-b:a', `${options.audioBitrate}k`);
      } else if (options.audioCodec !== 'original') {
        audioCodecArgs.push('-c:a', options.audioCodec);
        audioCodecArgs.push('-b:a', `${options.audioBitrate}k`);
      } else {
        audioCodecArgs.push('-c:a', 'copy');
      }
      
      // Настройка FPS
      let fpsArgs = [];
      if (options.fps !== 'original') {
        fpsArgs.push('-r', options.fps.toString());
      }
      
      // Настройка скорости сжатия (preset)
      let presetArgs = [];
      
      // Особая обработка preset для VP9 (WebM)
      if (options.format === 'webm') {
        // Для VP9 используем -deadline и -cpu-used вместо -preset
        switch (options.speed) {
          case 'slow':
            presetArgs.push('-deadline', 'best', '-cpu-used', '0');
            break;
          case 'medium':
            presetArgs.push('-deadline', 'good', '-cpu-used', '2');
            break;
          case 'fast':
            presetArgs.push('-deadline', 'realtime', '-cpu-used', '5');
            break;
        }
      } else if (options.format !== 'original') {
        switch (options.speed) {
          case 'slow':
            presetArgs.push('-preset', 'veryslow');
            break;
          case 'medium':
            presetArgs.push('-preset', 'medium');
            break;
          case 'fast':
            presetArgs.push('-preset', 'veryfast');
            break;
        }
      }
      
      // Формируем полный набор аргументов
      let baseArgs = [
        '-i', options.input
      ];
      
      // Добавляем codec, bitrate и preset только если не копируем
      if (options.format !== 'copy') {
        baseArgs.push(...codecArgs);
        baseArgs.push(...bitrateArgs);
        baseArgs.push(...presetArgs);
      }
      
      // Добавляем остальные параметры
      baseArgs.push(...audioCodecArgs);
      baseArgs.push(...fpsArgs);
      
      // Добавляем scale filter, если нужно
      if (scaleFilter) {
        const scaleArgs = scaleFilter.split(' ');
        baseArgs.push(...scaleArgs);
      }
      
      // Добавляем дополнительные аргументы для повышения совместимости
      if (options.format === 'mp4-hevc') {
        baseArgs.push('-tag:v', 'hvc1'); // Добавляем тег для лучшей совместимости с Apple устройствами
      }
      
      // Для WebM формата добавляем специфичные параметры
      if (options.format === 'webm') {
        // Добавляем row-mt=1 для многопоточного кодирования VP9
        baseArgs.push('-row-mt', '1');
        
        // Тайлинг для лучшей производительности
        if (options.resolution === 'original' || options.resolution === '1080p') {
          baseArgs.push('-tile-columns', '6', '-frame-parallel', '1');
        } else if (options.resolution === '720p') {
          baseArgs.push('-tile-columns', '4', '-frame-parallel', '1');
        }
        
        // Установим режим качества для VP9
        if (options.bitrate === 'vbr') {
          baseArgs.push('-b:v', '0'); // Указываем битрейт 0 для использования CRF в VP9
        }
      }
      
      // Обработка продвинутых параметров
      if (options.advancedParams && Object.keys(options.advancedParams).length > 0) {
        const advParams = options.advancedParams;
        
        // Параметры для x264/x265
        if (options.format === 'mp4' || options.format === 'mp4-hevc' || options.format === 'original') {
          const x265Params = [];
          
          // AQ Mode и AQ Strength
          if (advParams.aqMode) {
            if (options.format === 'mp4-hevc') {
              // x265 параметры
              x265Params.push(`aq-mode=${advParams.aqMode}`);
              
              if (advParams.aqStrength) {
                x265Params.push(`aq-strength=${advParams.aqStrength}`);
              }
            } else {
              // x264 параметры
              baseArgs.push('-aq-mode', advParams.aqMode);
              
              if (advParams.aqStrength) {
                baseArgs.push('-aq-strength', advParams.aqStrength);
              }
            }
          }
          
          // B-кадры
          if (advParams.bframes) {
            if (options.format === 'mp4-hevc') {
              x265Params.push(`bframes=${advParams.bframes}`);
            } else {
              baseArgs.push('-bf', advParams.bframes);
            }
          }
          
          // Референсные кадры
          if (advParams.ref) {
            if (options.format === 'mp4-hevc') {
              x265Params.push(`ref=${advParams.ref}`);
            } else {
              baseArgs.push('-refs', advParams.ref);
            }
          }
          
          // Психовизуальные оптимизации для x265
          if (options.format === 'mp4-hevc') {
            x265Params.push('psy-rd=1.0', 'psy-rdoq=2.0');
          }
          
          // Добавляем параметры x265 если они есть
          if (x265Params.length > 0 && options.format === 'mp4-hevc') {
            baseArgs.push('-x265-params', x265Params.join(':'));
          }
        }
        
        // Параметры для VP9 (WebM)
        if (options.format === 'webm') {
          // Для VP9 добавляем оптимизации
          if (advParams.aqMode && advParams.aqMode !== '0') {
            baseArgs.push('-auto-alt-ref', '1');
            baseArgs.push('-lag-in-frames', '25');
          }
          
          if (advParams.ref) {
            // Максимальное количество референсных кадров для VP9
            const vpxRef = Math.min(parseInt(advParams.ref), 3);
            baseArgs.push('-refs', vpxRef.toString());
          }
        }
      }
      
      // Функция для выполнения FFmpeg
      const runFFmpeg = (args, progressCallback) => {
        return new Promise((resolve, reject) => {
          console.log('Команда FFmpeg:', `ffmpeg ${args.join(' ')}`);
          
          // Проверяем существование ffmpeg.exe перед запуском
          if (!fileExists(ffmpegPath)) {
            console.error(`FFmpeg не найден по пути: ${ffmpegPath}`);
            reject(new Error(`FFmpeg не найден. Пожалуйста, переустановите приложение.`));
            return;
          }
          
          // Запускаем FFmpeg
          const ffmpegProcess = spawn(ffmpegPath, args);
          
          // Сохраняем полный вывод для диагностики
          let ffmpegOutput = '';
          let ffmpegErrorOutput = '';
          
          // Обработка стандартного вывода
          ffmpegProcess.stdout.on('data', (data) => {
            const output = data.toString();
            ffmpegOutput += output;
            console.log(`FFmpeg stdout: ${output}`);
          });
          
          // Обработка вывода ошибок
          ffmpegProcess.stderr.on('data', (data) => {
            const output = data.toString();
            ffmpegErrorOutput += output;
            ffmpegOutput += output;
            console.log(`FFmpeg stderr: ${output}`);
            
            // Обработка сообщений о прогрессе
            if (progressCallback) {
              const timeRegex = /time=(\d+):(\d+):(\d+.\d+)/;
              const match = output.match(timeRegex);
              if (match) {
                const hours = parseInt(match[1]);
                const minutes = parseInt(match[2]);
                const seconds = parseFloat(match[3]);
                const currentTime = hours * 3600 + minutes * 60 + seconds;
                progressCallback(currentTime);
              }
            }
          });
          
          // Обработка завершения
          ffmpegProcess.on('close', (code) => {
            if (code === 0) {
              resolve(true);
            } else {
              console.error(`FFmpeg завершился с ошибкой (код ${code}). Вывод ошибки: ${ffmpegErrorOutput.slice(-500)}`);
              
              let errorMessage = `FFmpeg завершился с ошибкой (код ${code}).`;
              
              if (ffmpegErrorOutput.includes('No such file or directory')) {
                errorMessage += ' Файл не найден или нет доступа к директории.';
              } else if (ffmpegErrorOutput.includes('Permission denied')) {
                errorMessage += ' Отказано в доступе к файлу или директории.';
              } else if (ffmpegErrorOutput.includes('already exists')) {
                errorMessage += ' Выходной файл уже существует и не может быть перезаписан.';
              } else if (ffmpegErrorOutput.includes('Invalid data found')) {
                errorMessage += ' Найдены некорректные данные при обработке входного файла.';
              } else if (ffmpegErrorOutput.includes('Error opening input file')) {
                errorMessage += ' Ошибка при открытии входного файла.';
              } else if (ffmpegErrorOutput.includes('Error while opening encoder')) {
                errorMessage += ' Ошибка при инициализации кодека. Попробуйте использовать другой формат (например, MP4 вместо MP4-HEVC).';
              } else if (ffmpegErrorOutput.includes('Only VP8 or VP9 or AV1 video and Vorbis or Opus audio')) {
                errorMessage += ' Формат WebM поддерживает только аудиокодеки Vorbis или Opus. Приложение автоматически исправит это.';
              } else {
                errorMessage += ' Детали ошибки: ' + ffmpegErrorOutput.slice(-150).replace(/\n/g, ' ');
              }
              
              reject(new Error(errorMessage));
            }
          });
          
          // Обработка ошибок
          ffmpegProcess.on('error', (err) => {
            console.error(`Ошибка запуска FFmpeg: ${err.message}`);
            reject(new Error(`Ошибка запуска FFmpeg: ${err.message}`));
          });
        });
      };
      
      // Получаем информацию о длительности для расчёта прогресса
      ffmpeg.ffprobe(options.input, async (err, metadata) => {
        if (err) {
          console.error('Ошибка получения информации о файле:', err);
          reject(new Error(`Ошибка получения информации о файле: ${err.message}`));
          return;
        }
        
        const totalDuration = metadata.format.duration; // в секундах
        
        try {
          // Проверяем, нужно ли двухпроходное кодирование
          const useTwoPass = options.advancedParams && 
                             options.advancedParams.twopass && 
                             (options.format === 'mp4' || options.format === 'mp4-hevc' || options.format === 'webm');
          
          if (useTwoPass) {
            // Создаем временную директорию для логов двухпроходного кодирования
            const tempDir = createTempDirectory();
            const tempFilename = 'ffmpeg2pass';
            const passLogFile = path.join(tempDir, tempFilename);
            
            console.log('Двухпроходное кодирование: Запуск первого прохода...');
            console.log('Временный лог-файл:', passLogFile);
            
            // Подготовка аргументов для первого и второго прохода
            const pass1Args = [...baseArgs];
            const pass2Args = [...baseArgs];
            
            // Добавляем опцию -y (перезапись) только для второго прохода
            pass2Args.push('-y');
            
            // Специфичные настройки для разных форматов
            if (options.format === 'webm') {
              // VP9 двухпроходное кодирование
              pass1Args.push('-pass', '1', '-passlogfile', passLogFile);
              // Используем только звуковую дорожку (без видео) и нулевой выход на первом проходе
              pass1Args.push('-an', '-f', 'null', 'NUL');
              
              pass2Args.push('-pass', '2', '-passlogfile', passLogFile);
              pass2Args.push(outputPath);
            } else {
              // x264/x265 двухпроходное кодирование
              pass1Args.push('-pass', '1', '-passlogfile', passLogFile);
              // Используем только звуковую дорожку (без видео) и нулевой выход на первом проходе
              pass1Args.push('-an', '-f', 'null', 'NUL');
              
              pass2Args.push('-pass', '2', '-passlogfile', passLogFile);
              pass2Args.push(outputPath);
            }
            
            // Отправка прогресса в UI
            const sendProgress = (currentTime) => {
              // В двухпроходном режиме первый проход = 0-50%, второй проход = 50-100%
              let progress;
              if (currentPassIndex === 0) {
                // Первый проход
                progress = Math.min((currentTime / totalDuration) * 50, 50).toFixed(2);
              } else {
                // Второй проход
                progress = Math.min(50 + (currentTime / totalDuration) * 50, 100).toFixed(2);
              }
              
              mainWindow.webContents.send('compression-progress', {
                progress: parseFloat(progress),
                currentTime: currentTime,
                totalTime: totalDuration,
                pass: currentPassIndex + 1,
                totalPasses: 2
              });
            };
            
            // Выполнение проходов
            let currentPassIndex = 0;
            
            // Первый проход
            await runFFmpeg(pass1Args, (currentTime) => {
              sendProgress(currentTime);
            });
            
            // Второй проход
            currentPassIndex = 1;
            await runFFmpeg(pass2Args, (currentTime) => {
              sendProgress(currentTime);
            });
            
            // Очистка временных файлов
            cleanupTempFiles(tempDir, tempFilename);
            
          } else {
            // Однопроходное кодирование
            const args = [...baseArgs];
            
            // Добавляем опцию -y для перезаписи при необходимости
            args.push('-y');
            
            // Добавляем выходной файл
            args.push(outputPath);
            
            // Выполняем FFmpeg
            await runFFmpeg(args, (currentTime) => {
              const progress = Math.min((currentTime / totalDuration) * 100, 100).toFixed(2);
              
              mainWindow.webContents.send('compression-progress', {
                progress: parseFloat(progress),
                currentTime: currentTime,
                totalTime: totalDuration
              });
            });
          }
          
          // Если дошли до этой точки, значит сжатие успешно завершено
          // Получаем информацию о сжатом файле
          if (!fs.existsSync(outputPath)) {
            console.error('Ошибка: выходной файл не был создан, хотя FFmpeg завершился успешно');
            reject(new Error('Выходной файл не был создан'));
            return;
          }
          
          const fileStats = fs.statSync(outputPath);
          if (fileStats.size === 0) {
            console.error('Ошибка: создан пустой выходной файл');
            reject(new Error('Создан пустой выходной файл'));
            return;
          }
          
          const compressedInfo = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(outputPath, (err, metadata) => {
              if (err) {
                console.error('Ошибка получения метаданных сжатого файла:', err);
                // Если не удалось получить метаданные, возвращаем базовую информацию
                resolve({
                  size: Math.round(fileStats.size / 1024 / 1024 * 100) / 100, // МБ
                  resolution: 'Неизвестно',
                  format: path.extname(outputPath).substring(1).toUpperCase(),
                  bitrate: options.bitrate === 'vbr' ? 'Переменный (VBR)' : `${options.bitrate} Kbps`,
                  path: outputPath
                });
              } else {
                const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
                if (!videoStream) {
                  console.error('Ошибка: видеопоток не найден в сжатом файле');
                  resolve({
                    size: Math.round(fileStats.size / 1024 / 1024 * 100) / 100,
                    resolution: 'Неизвестно',
                    format: metadata.format.format_name.split(',')[0].toUpperCase(),
                    bitrate: options.bitrate === 'vbr' ? 'Переменный (VBR)' : `${options.bitrate} Kbps`,
                    path: outputPath
                  });
                } else {
                  resolve({
                    size: Math.round(metadata.format.size / 1024 / 1024 * 100) / 100, // МБ
                    resolution: `${videoStream.width}x${videoStream.height}`,
                    format: metadata.format.format_name.split(',')[0].toUpperCase(),
                    bitrate: options.bitrate === 'vbr' ? 'Переменный (VBR)' : `${options.bitrate} Kbps`,
                    path: outputPath
                  });
                }
              }
            });
          });
          
          resolve({
            success: true,
            output: outputPath,
            info: compressedInfo
          });
        } catch (error) {
          console.error('Ошибка при выполнении FFmpeg:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error(`Ошибка при сжатии видео: ${error.message}`);
      reject(new Error(`Ошибка при сжатии видео: ${error.message}`));
    }
  });
});

// Обработка открытия файла или папки
ipcMain.handle('open-file', (event, path) => {
  try {
    require('child_process').exec(`start "" "${path}"`);
    return true;
  } catch (error) {
    console.error('Ошибка при открытии файла:', error);
    return false;
  }
});

// Обработка открытия папки
ipcMain.handle('open-folder', (event, folderPath) => {
  try {
    require('child_process').exec(`explorer "${folderPath}"`);
    return true;
  } catch (error) {
    console.error('Ошибка при открытии папки:', error);
    return false;
  }
});

// Обработчики IPC для обновлений
ipcMain.handle('check-for-updates', async () => {
  try {
    return await checkForUpdates();
  } catch (error) {
    console.error('Ошибка при проверке обновлений:', error);
    return {
      hasUpdate: false,
      error: error.message
    };
  }
});

ipcMain.handle('start-update-download', async (event, downloadUrl) => {
  const filename = path.basename(new URL(downloadUrl).pathname);
  const savePath = getUpdateDownloadPath(filename);
  
  try {
    // Отправляем обновления о прогрессе в renderer process
    const onProgress = (progress, downloaded, total) => {
      if (!event.sender.isDestroyed()) {
        event.sender.send('update-download-progress', { progress, downloaded, total });
      }
    };
    
    const result = await downloadUpdate(downloadUrl, savePath, onProgress);
    return { success: true, filePath: result.filePath };
  } catch (error) {
    console.error('Ошибка при скачивании обновления:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-update-file', async (event, filePath) => {
  try {
    await shell.openPath(filePath);
    return { success: true };
  } catch (error) {
    console.error('Ошибка при открытии файла обновления:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('show-update-folder', async (event, filePath) => {
  try {
    await shell.showItemInFolder(filePath);
    return { success: true };
  } catch (error) {
    console.error('Ошибка при открытии папки с обновлением:', error);
    return { success: false, error: error.message };
  }
});
