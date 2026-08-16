const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('assistant', {
  onTranscript: (cb) => ipcRenderer.on('transcript', (event, text) => cb(text))
});
