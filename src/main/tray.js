const { Tray, Menu, nativeImage, app } = require('electron');
const path = require('path');
const { logout } = require('./auth');

let tray = null;

function createTray(mainWindow) {
  // Create a simple 16x16 tray icon
  const iconPath = path.join(__dirname, '..', '..', 'assets', 'tray-icon.png');
  let icon;
  try {
    icon = nativeImage.createFromPath(iconPath);
  } catch {
    // Fallback: create a simple colored icon
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon.isEmpty() ? createFallbackIcon() : icon);
  tray.setToolTip('Google Calendar Widget');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show / Hide',
      click: () => {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
        }
      },
    },
    {
      label: 'Refresh',
      click: () => {
        mainWindow.webContents.send('tray:refresh');
      },
    },
    { type: 'separator' },
    {
      label: 'Sign Out',
      click: () => {
        logout();
        mainWindow.webContents.send('tray:signed-out');
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
}

function createFallbackIcon() {
  // Create a 16x16 blue square as fallback
  const size = 16;
  const canvas = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    canvas[i * 4] = 66;      // R
    canvas[i * 4 + 1] = 133;  // G
    canvas[i * 4 + 2] = 244;  // B
    canvas[i * 4 + 3] = 255;  // A
  }
  return nativeImage.createFromBuffer(canvas, { width: size, height: size });
}

module.exports = { createTray };
