const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// 위치 저장 파일 경로
const getPositionFilePath = () => {
  return path.join(os.homedir(), '.todo-app-position.json');
};

// 위치 저장 함수
const saveWindowPosition = (x, y) => {
  try {
    fs.writeFileSync(getPositionFilePath(), JSON.stringify({ x, y }));
  } catch (error) {
    console.log('Failed to save window position:', error);
  }
};

// 위치 불러오기 함수
const loadWindowPosition = () => {
  try {
    const filePath = getPositionFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      
      // 빈 파일이거나 유효하지 않은 JSON인 경우 처리
      if (!data || data.trim() === '') {
        console.log('Position file is empty');
        return null;
      }
      
      const parsed = JSON.parse(data);
      console.log('Loaded window position:', parsed);
      return parsed;
    }
  } catch (error) {
    console.log('Failed to load window position:', error.message);
  }
  return null;
};

function createWindow() {
  // 저장된 위치 불러오기
  const savedPosition = loadWindowPosition();
  
  // 플랫폼별 설정
  const isMac = process.platform === 'darwin';
  const isWindows = process.platform === 'win32';
  
  const windowOptions = {
    width: 200,
    height: 300,
    x: savedPosition ? savedPosition.x : undefined,
    y: savedPosition ? savedPosition.y : undefined,
    alwaysOnTop: true,        
    resizable: true,
    movable: true,            
    skipTaskbar: false,       
    frame: false,
    transparent: true,
    minWidth: 200,
    maxWidth: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  };

  // macOS 전용 설정들
  if (isMac) {
    windowOptions.titleBarStyle = 'customButtonsOnHover';
    windowOptions.vibrancy = 'ultra-dark';
    windowOptions.visualEffectState = 'active';
  }
  
  // Windows 전용 설정들
  if (isWindows) {
    windowOptions.backgroundColor = '#00000000'; // 투명 배경
  }
  
  const win = new BrowserWindow(windowOptions);

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:8080');
  } else {
    win.loadFile('dist/index.html');
  }

  // 페이지가 로드된 후 API 노출
  win.webContents.once('dom-ready', () => {
    win.webContents.executeJavaScript(`
      window.electronAPI = {
        moveWindow: (deltaX, deltaY) => {
          const { ipcRenderer } = window.require('electron');
          ipcRenderer.send('move-window', deltaX, deltaY);
        },
        updateWindowHeight: (height) => {
          const { ipcRenderer } = window.require('electron');
          ipcRenderer.send('update-window-height', height);
        },
        updateWindowWidth: (width) => {
          const { ipcRenderer } = window.require('electron');
          ipcRenderer.send('update-window-width', width);
        }
      };
      console.log('ElectronAPI loaded successfully');
    `).catch(error => {
      console.error('Failed to inject electronAPI:', error);
    });
  });

  // 창 이동 처리 - 120fps 즉시 이동
  ipcMain.on('move-window', (event, deltaX, deltaY) => {
    const [currentX, currentY] = win.getPosition();
    const newX = currentX + deltaX;
    const newY = currentY + deltaY;
    win.setPosition(newX, newY);
  });

  // 창 높이 조절 처리
  ipcMain.on('update-window-height', (event, height) => {
    const [currentWidth, currentHeight] = win.getSize();
    
    console.log('Current height:', currentHeight, 'New height:', height);
    
    // 현재 높이와 새로운 높이가 다른 경우에만 업데이트
    if (Math.abs(currentHeight - height) > 10) { // 10px 이상 차이가 있을 때만 업데이트
      win.setSize(currentWidth, Math.round(height), true); // animate: true로 변경하여 부드러운 전환
      console.log('Window resized to:', Math.round(height));
    }
  });

  // 창 너비 조절 처리 (debounced)
  let widthUpdateTimer = null;
  ipcMain.on('update-window-width', (event, width) => {
    if (widthUpdateTimer) clearTimeout(widthUpdateTimer);
    
    widthUpdateTimer = setTimeout(() => {
      // 숫자로 변환하고 유효성 검사
      const numericWidth = Math.round(Number(width));
      
      if (!numericWidth || numericWidth <= 0 || numericWidth > 2000) {
        console.log('Invalid width received:', width, 'converted:', numericWidth);
        return;
      }
      
      const [currentWidth, currentHeight] = win.getSize();
      
      console.log('Current width:', currentWidth, 'New width:', numericWidth);
      
      // 현재 너비와 새로운 너비가 다른 경우에만 업데이트
      if (Math.abs(currentWidth - numericWidth) > 1) { // 1px까지 민감하게
        win.setSize(numericWidth, currentHeight, true); // animate: true로 부드러운 전환
        console.log('Window resized to:', numericWidth);
      } else {
        console.log('Width difference too small, skipping resize');
      }
    }, 8); // 30ms에서 8ms로 단축 (120fps)
  });

  
  // macOS에서만 독에 표시
  if (process.platform === 'darwin' && app.dock) {
    app.dock.show();
  }
}

// 앱이 준비되면 창 생성
app.whenReady().then(createWindow);

// 모든 창이 닫히면 앱 종료
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 앱 종료 전에 위치 저장
app.on('before-quit', () => {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length > 0) {
    const [x, y] = windows[0].getPosition();
    saveWindowPosition(x, y);
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

