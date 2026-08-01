const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const { createTray } = require('./tray');
const { registerIpcHandlers } = require('./ipc-handlers');

// Load .env file
const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) process.env[match[1]] = match[2] || '';
  }
}

const store = new Store();

let mainWindow = null;

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  const savedBounds = store.get('windowBounds', {
    x: screenWidth - 360,
    y: 80,
  });

  mainWindow = new BrowserWindow({
    width: 340,
    height: 500,
    x: savedBounds.x,
    y: savedBounds.y,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  mainWindow.on('moved', () => {
    const [x, y] = mainWindow.getPosition();
    store.set('windowBounds', { x, y });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

app.whenReady().then(() => {
  mainWindow = createWindow();
  createTray(mainWindow);
  registerIpcHandlers();
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});
