// Preload script for Electron
// This runs in a sandboxed context and can expose safe APIs to the renderer

const { contextBridge } = require('electron');

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
});
