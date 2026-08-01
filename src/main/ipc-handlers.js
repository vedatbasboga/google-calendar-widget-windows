const { ipcMain, BrowserWindow } = require('electron');
const { login, logout, isAuthenticated } = require('./auth');
const { getEvents, getTaskItems, createEvent, createTask, completeTask } = require('./calendar-api');

function registerIpcHandlers(store) {
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

  ipcMain.handle('calendar:getTasks', async () => {
    try {
      const tasks = await getTaskItems();
      return { success: true, tasks };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('calendar:createTask', async (_event, taskData) => {
    try {
      const created = await createTask(taskData);
      return { success: true, task: created };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('calendar:completeTask', async (_event, { taskListId, taskId }) => {
    try {
      await completeTask({ taskListId, taskId });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('settings:get', () => {
    return store.get('settings');
  });

  ipcMain.handle('settings:set', (_event, newSettings) => {
    const current = store.get('settings');
    const merged = { ...current, ...newSettings };
    store.set('settings', merged);
    return merged;
  });

  ipcMain.handle('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.hide();
  });
}

module.exports = { registerIpcHandlers };
