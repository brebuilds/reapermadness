const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let serverProcess;
const SERVER_PORT = 3001;
const isDev = !app.isPackaged;

// Get the correct paths for resources
function getResourcePath(relativePath) {
  if (isDev) {
    return path.join(__dirname, '..', relativePath);
  }
  return path.join(process.resourcesPath, relativePath);
}

// Wait for server to be ready
function waitForServer(port, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const req = http.request({ port, path: '/health', timeout: 1000 }, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          retry();
        }
      });

      req.on('error', retry);
      req.end();
    };

    const retry = () => {
      if (Date.now() - startTime > timeout) {
        reject(new Error('Server startup timeout'));
      } else {
        setTimeout(check, 500);
      }
    };

    check();
  });
}

// Start the server
async function startServer() {
  return new Promise((resolve, reject) => {
    // In dev mode, use the regular dist/index.js (with node_modules available)
    // In production, use the bundled single-file server
    const serverPath = isDev
      ? path.join(__dirname, '..', 'server', 'dist', 'index.js')
      : path.join(process.resourcesPath, 'server', 'server-bundle.cjs');

    const knowledgePath = isDev
      ? path.join(__dirname, '..', 'server', 'src', 'knowledge')
      : path.join(process.resourcesPath, 'server', 'knowledge');

    const webPath = isDev
      ? path.join(__dirname, '..', 'web', 'dist')
      : path.join(process.resourcesPath, 'web');

    console.log('Starting server from:', serverPath);
    console.log('Knowledge path:', knowledgePath);
    console.log('Web path:', webPath);

    // Spawn server process
    serverProcess = spawn('node', [serverPath], {
      env: {
        ...process.env,
        PORT: SERVER_PORT.toString(),
        KNOWLEDGE_PATH: knowledgePath,
        WEB_PATH: webPath,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    serverProcess.stdout.on('data', (data) => {
      console.log('Server:', data.toString());
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });

    serverProcess.on('error', (err) => {
      console.error('Failed to start server:', err);
      reject(err);
    });

    serverProcess.on('close', (code) => {
      console.log('Server exited with code:', code);
      serverProcess = null;
    });

    // Wait for server to be ready
    waitForServer(SERVER_PORT)
      .then(resolve)
      .catch(reject);
  });
}

// Create the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1a1a2e',
      symbolColor: '#ffffff',
    },
  });

  // Load the app
  if (isDev) {
    // In dev mode, load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from the HTTP server (not file://)
    // This fixes CORS issues when loading assets
    console.log('Loading web from HTTP server: http://localhost:3001');
    mainWindow.loadURL('http://localhost:3001').catch(err => {
      console.error('Failed to load web content:', err);
    });
  }
  
  // Debug: log any page errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Page failed to load:', errorCode, errorDescription);
  });
  
  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log('Web console:', message);
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Auto-updater configuration
function setupAutoUpdater() {
  // Configure auto-updater
  autoUpdater.autoDownload = false; // Don't auto-download, ask user first
  autoUpdater.autoInstallOnAppQuit = true; // Install when app quits

  // Check for updates on startup (only in production)
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  // Update available
  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);

    if (mainWindow) {
      mainWindow.webContents.send('update-available', {
        version: info.version,
        releaseNotes: info.releaseNotes,
      });
    }

    // Auto-download the update
    autoUpdater.downloadUpdate();
  });

  // Update not available
  autoUpdater.on('update-not-available', () => {
    console.log('App is up to date');
  });

  // Update downloaded
  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);

    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded', {
        version: info.version,
      });
    }
  });

  // Download progress
  autoUpdater.on('download-progress', (progressObj) => {
    console.log(`Download progress: ${progressObj.percent.toFixed(2)}%`);

    if (mainWindow) {
      mainWindow.webContents.send('download-progress', {
        percent: progressObj.percent,
        transferred: progressObj.transferred,
        total: progressObj.total,
      });
    }
  });

  // Error handling
  autoUpdater.on('error', (error) => {
    console.error('Auto-updater error:', error);
  });
}

// App lifecycle
app.whenReady().then(async () => {
  try {
    console.log('Starting Reapermadness...');
    console.log('Dev mode:', isDev);

    // Start the server first
    await startServer();
    console.log('Server started successfully');

    // Then create the window
    createWindow();

    // Setup auto-updater after window is created
    setupAutoUpdater();
  } catch (error) {
    console.error('Failed to start:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // Kill the server when app closes
  if (serverProcess) {
    serverProcess.kill();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
