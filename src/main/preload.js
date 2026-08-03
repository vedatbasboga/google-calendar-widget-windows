const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('calendarAPI', {
  login: () => ipcRenderer.invoke('auth:login'),
  logout: () => ipcRenderer.invoke('auth:logout'),
  getAuthStatus: () => ipcRenderer.invoke('auth:status'),
  getEvents: () => ipcRenderer.invoke('calendar:getEvents'),
  getTasks: () => ipcRenderer.invoke('calendar:getTasks'),
  createEvent: (event) => ipcRenderer.invoke('calendar:createEvent', event),
  createTask: (task) => ipcRenderer.invoke('calendar:createTask', task),
  updateEvent: (data) => ipcRenderer.invoke('calendar:updateEvent', data),
  deleteEvent: (data) => ipcRenderer.invoke('calendar:deleteEvent', data),
  deleteTask: (data) => ipcRenderer.invoke('calendar:deleteTask', data),
  completeTask: (data) => ipcRenderer.invoke('calendar:completeTask', data),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings) => ipcRenderer.invoke('settings:set', settings),
  openAppFolder: () => ipcRenderer.invoke('app:openFolder'),
});

contextBridge.exposeInMainWorld('electronAPI', {
  onRefresh: (callback) => ipcRenderer.on('tray:refresh', callback),
  onSignedOut: (callback) => ipcRenderer.on('tray:signed-out', callback),
});
