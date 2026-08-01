const { ipcMain, BrowserWindow } = require('electron');
const { login, logout, isAuthenticated } = require('./auth');
const { getEvents, createEvent } = require('./calendar-api');

function registerIpcHandlers() {
  ipcMain.handle('auth:login', async () => {
    try {
      await login();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('auth:logout', () => {
    logout();
    return { success: true };
  });

  ipcMain.handle('auth:status', () => {
    return { authenticated: isAuthenticated() };
  });

  ipcMain.handle('calendar:getEvents', async () => {
    try {
      const events = await getEvents();
      return { success: true, events };
    } catch (err) {
      console.error('getEvents error:', err.message, err.code, err.status);
      if (err.code === 401 || err.status === 401 || err.message?.includes('invalid_grant')) {
        return { success: false, error: 'auth_required' };
      }
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('calendar:createEvent', async (_event, eventData) => {
    try {
      const created = await createEvent(eventData);
      return { success: true, event: created };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.hide();
  });
}

module.exports = { registerIpcHandlers };
