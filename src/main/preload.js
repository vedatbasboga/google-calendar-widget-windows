const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('calendarAPI', {
  login: () => ipcRenderer.invoke('auth:login'),
  logout: () => ipcRenderer.invoke('auth:logout'),
  getAuthStatus: () => ipcRenderer.invoke('auth:status'),
  getEvents: () => ipcRenderer.invoke('calendar:getEvents'),
  createEvent: (event) => ipcRenderer.invoke('calendar:createEvent', event),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
});

contextBridge.exposeInMainWorld('electronAPI', {
  onRefresh: (callback) => ipcRenderer.on('tray:refresh', callback),
  onSignedOut: (callback) => ipcRenderer.on('tray:signed-out', callback),
});
