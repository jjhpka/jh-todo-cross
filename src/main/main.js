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
    width: 280,
    height: 600,
    x: savedPosition ? savedPosition.x : undefined,
    y: savedPosition ? savedPosition.y : undefined,
    alwaysOnTop: true,        
    resizable: false,
    movable: true,            
    skipTaskbar: false,       
    frame: false,
    transparent: true,
    minWidth: 200,
    maxWidth: 500,
    minHeight: 160,
    maxHeight: 800,
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

  // 디버깅을 위해 개발자 도구 열기
  win.webContents.openDevTools();

  console.log('Loading application...');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Loading development URL: http://localhost:8080');
    win.loadURL('http://localhost:8080');
  } else {
    console.log('Loading production file: dist/index.html');
    win.loadFile('dist/index.html');
  }
  
  // 로딩 이벤트 리스너 추가
  win.webContents.on('did-start-loading', () => {
    console.log('Started loading page...');
  });
  
  win.webContents.on('did-finish-load', () => {
    console.log('Finished loading page');
  });
  
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load page:', errorCode, errorDescription, validatedURL);
  });

  // 페이지가 로드된 후 API 노출 및 드래그 설정
  win.webContents.once('dom-ready', () => {
    console.log('DOM is ready, injecting scripts...');
    
    win.webContents.executeJavaScript(`
      console.log('Executing JavaScript injection...');
      console.log('Document body:', document.body);
      console.log('Root element:', document.getElementById('root'));
      
      // ElectronAPI 설정
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
      
      // CSS로 드래그 영역 설정
      const style = document.createElement('style');
      style.textContent = \`
        #todo-app-root {
          -webkit-app-region: drag;
        }
        
        /* 상호작용 요소들은 드래그 비활성화 */
        input, button, [type="checkbox"] {
          -webkit-app-region: no-drag;
        }
        
        .minimize-toggle {
          -webkit-app-region: no-drag;
        }
      \`;
      document.head.appendChild(style);
      
      console.log('ElectronAPI and drag styles loaded successfully');
      
      // React 앱 로딩 상태 확인
      setTimeout(() => {
        console.log('Checking React app after 2 seconds...');
        console.log('Root innerHTML:', document.getElementById('root').innerHTML);
        console.log('Todo app root:', document.getElementById('todo-app-root'));
      }, 2000);
    `).catch(error => {
      console.error('Failed to inject electronAPI:', error);
    });
  });

  // 창 높이 조절 처리
  ipcMain.on('update-window-height', (event, height) => {
    const [currentWidth, currentHeight] = win.getSize();
    const numericHeight = Math.round(Number(height));
    
    console.log('Current height:', currentHeight, 'New height:', numericHeight);
    
    // 유효성 검사
    if (!numericHeight || numericHeight < 160 || numericHeight > 800) {
      console.log('Invalid height:', height, 'converted:', numericHeight);
      return;
    }
    
    // 현재 높이와 새로운 높이가 다른 경우에만 업데이트
    if (Math.abs(currentHeight - numericHeight) > 3) {
      win.setSize(currentWidth, numericHeight, false); // animate: false로 즉시 변경
      console.log('Window height resized to:', numericHeight);
    } else {
      console.log('Height difference too small, skipping resize');
    }
  });

  // 창 너비 조절 처리 (debounced)
  let widthUpdateTimer = null;
  ipcMain.on('update-window-width', (event, width) => {
    if (widthUpdateTimer) clearTimeout(widthUpdateTimer);
    
    widthUpdateTimer = setTimeout(() => {
      // 숫자로 변환하고 유효성 검사
      const numericWidth = Math.round(Number(width));
      
      if (!numericWidth || numericWidth < 200 || numericWidth > 500) {
        console.log('Invalid width received:', width, 'converted:', numericWidth);
        return;
      }
      
      const [currentWidth, currentHeight] = win.getSize();
      
      console.log('Current width:', currentWidth, 'New width:', numericWidth);
      
      // 현재 너비와 새로운 너비가 다른 경우에만 업데이트
      if (Math.abs(currentWidth - numericWidth) > 2) {
        win.setSize(numericWidth, currentHeight, false); // animate: false로 즉시 변경
        console.log('Window width resized to:', numericWidth);
      } else {
        console.log('Width difference too small, skipping resize');
      }
    }, 16); // 16ms로 조정 (60fps)
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

