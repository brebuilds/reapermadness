const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

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
    const serverPath = isDev
      ? path.join(__dirname, '..', 'server', 'dist', 'index.js')
      : path.join(process.resourcesPath, 'server', 'index.js');

    const knowledgePath = isDev
      ? path.join(__dirname, '..', 'server', 'src', 'knowledge')
      : path.join(process.resourcesPath, 'server', 'knowledge');

    console.log('Starting server from:', serverPath);

    // Spawn server process
    serverProcess = spawn('node', [serverPath], {
      env: {
        ...process.env,
        PORT: SERVER_PORT.toString(),
        KNOWLEDGE_PATH: knowledgePath,
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
    // In production, load the built files
    const webPath = path.join(process.resourcesPath, 'web', 'index.html');
    mainWindow.loadFile(webPath);
  }

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
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
