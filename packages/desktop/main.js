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
  // On Windows, resourcesPath is correct
  // On Mac, it's inside the .app bundle
  const resourcesPath = process.resourcesPath || 
    (process.platform === 'darwin' 
      ? path.join(path.dirname(app.getPath('exe')), '..', 'Resources')
      : path.join(path.dirname(app.getPath('exe')), 'resources'));
  return path.join(resourcesPath, relativePath);
}

// Get Node.js executable path
function getNodeExecutable() {
  if (isDev) {
    // In dev, use system node (usually in PATH)
    return 'node';
  }
  
  const fs = require('fs');
  const { execSync } = require('child_process');
  
  // Option 1: Check if node is in PATH
  try {
    if (process.platform === 'win32') {
      execSync('where node', { stdio: 'ignore', timeout: 2000 });
      return 'node';
    } else {
      execSync('which node', { stdio: 'ignore', timeout: 2000 });
      return 'node';
    }
  } catch {
    // Option 2: Try common installation locations
    if (process.platform === 'win32') {
      // Common Windows Node.js locations
      const possiblePaths = [
        path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'nodejs', 'node.exe'),
        path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'nodejs', 'node.exe'),
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'nodejs', 'node.exe'),
        path.join(process.env.APPDATA || '', 'npm', 'node.exe'),
      ];
      for (const nodePath of possiblePaths) {
        try {
          if (fs.existsSync(nodePath)) {
            console.log('Found Node.js at:', nodePath);
            return nodePath;
          }
        } catch {}
      }
    } else if (process.platform === 'darwin') {
      // Common Mac Node.js locations
      const possiblePaths = [
        '/usr/local/bin/node',
        '/opt/homebrew/bin/node',
        '/usr/bin/node',
        path.join(process.env.HOME || '', '.nvm', 'versions', 'node', 'v18.0.0', 'bin', 'node'),
      ];
      for (const nodePath of possiblePaths) {
        try {
          if (fs.existsSync(nodePath)) {
            console.log('Found Node.js at:', nodePath);
            return nodePath;
          }
        } catch {}
      }
    } else {
      // Linux
      const possiblePaths = [
        '/usr/bin/node',
        '/usr/local/bin/node',
        path.join(process.env.HOME || '', '.nvm', 'versions', 'node', 'v18.0.0', 'bin', 'node'),
      ];
      for (const nodePath of possiblePaths) {
        try {
          if (fs.existsSync(nodePath)) {
            console.log('Found Node.js at:', nodePath);
            return nodePath;
          }
        } catch {}
      }
    }
    
    // Fallback: try 'node' anyway (might work if PATH is set correctly)
    console.warn('Node.js not found in common locations, trying "node" from PATH');
    return 'node';
  }
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
    const fs = require('fs');
    
    // Get resources path (handles Windows/Mac differences)
    const resourcesPath = isDev 
      ? null 
      : (process.resourcesPath || 
         (process.platform === 'darwin' 
           ? path.join(path.dirname(app.getPath('exe')), '..', 'Resources')
           : path.join(path.dirname(app.getPath('exe')), 'resources')));
    
    // In dev mode, use the regular dist/index.js (with node_modules available)
    // In production, use the bundled single-file server
    const serverPath = isDev
      ? path.join(__dirname, '..', 'server', 'dist', 'index.js')
      : path.join(resourcesPath, 'server', 'server-bundle.cjs');

    const knowledgePath = isDev
      ? path.join(__dirname, '..', 'server', 'src', 'knowledge')
      : path.join(resourcesPath, 'server', 'knowledge');

    const webPath = isDev
      ? path.join(__dirname, '..', 'web', 'dist')
      : path.join(resourcesPath, 'web');

    console.log('Starting server from:', serverPath);
    console.log('Knowledge path:', knowledgePath);
    console.log('Web path:', webPath);
    console.log('Resources path:', resourcesPath || 'dev mode');

    // Validate paths exist
    if (!isDev) {
      if (!fs.existsSync(serverPath)) {
        const error = new Error(`Server bundle not found at: ${serverPath}\n\nMake sure the build process completed successfully.`);
        console.error(error.message);
        reject(error);
        return;
      }
      if (!fs.existsSync(knowledgePath)) {
        const error = new Error(`Knowledge path not found at: ${knowledgePath}\n\nMake sure the knowledge files are included in the build.`);
        console.error(error.message);
        reject(error);
        return;
      }
      const knowledgeDataFile = path.join(knowledgePath, 'data.json');
      if (!fs.existsSync(knowledgeDataFile)) {
        const error = new Error(`Knowledge data.json not found at: ${knowledgeDataFile}\n\nExpected file: ${knowledgeDataFile}`);
        console.error(error.message);
        reject(error);
        return;
      }
      if (!fs.existsSync(webPath)) {
        const error = new Error(`Web path not found at: ${webPath}\n\nMake sure the web build is included in the app bundle.`);
        console.error(error.message);
        reject(error);
        return;
      }
      const webIndexFile = path.join(webPath, 'index.html');
      if (!fs.existsSync(webIndexFile)) {
        const error = new Error(`Web index.html not found at: ${webIndexFile}\n\nExpected file: ${webIndexFile}`);
        console.error(error.message);
        reject(error);
        return;
      }
      console.log('All required files found ✓');
    }

    // Get Node.js executable
    const nodeExecutable = getNodeExecutable();
    console.log('Using Node.js executable:', nodeExecutable);

    // Spawn server process
    serverProcess = spawn(nodeExecutable, [serverPath], {
      env: {
        ...process.env,
        PORT: SERVER_PORT.toString(),
        KNOWLEDGE_PATH: knowledgePath,
        WEB_PATH: webPath,
        NODE_ENV: isDev ? 'development' : 'production',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32', // Use shell on Windows for better compatibility
    });

    let serverOutput = '';
    let serverErrors = '';
    let serverStarted = false;

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      serverOutput += output;
      console.log('Server stdout:', output);
      // Check if server is ready
      if (output.includes('running at') || output.includes('REAPER Assistant API')) {
        serverStarted = true;
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const output = data.toString();
      serverErrors += output;
      console.error('Server stderr:', output);
    });

    serverProcess.on('error', (err) => {
      console.error('Failed to start server:', err);
      let errorMessage = err.message;
      
      // Provide helpful error messages
      if (err.code === 'ENOENT' && nodeExecutable === 'node') {
        errorMessage = `Node.js not found. Please install Node.js from https://nodejs.org/\n\nOriginal error: ${err.message}`;
      } else if (err.code === 'ENOENT') {
        errorMessage = `Node.js executable not found at: ${nodeExecutable}\n\nPlease ensure Node.js is installed and accessible.\nOriginal error: ${err.message}`;
      }
      
      const enhancedError = new Error(errorMessage);
      enhancedError.stack = err.stack;
      reject(enhancedError);
    });

    serverProcess.on('close', (code) => {
      console.log('Server exited with code:', code);
      if (code !== 0 && code !== null && !serverStarted) {
        console.error('Server output:', serverOutput);
        console.error('Server errors:', serverErrors);
        if (!serverProcess.killed) {
          // Server crashed unexpectedly before starting
          const error = new Error(`Server process exited with code ${code}\n\nOutput:\n${serverOutput}\n\nErrors:\n${serverErrors}`);
          if (!serverStarted) {
            reject(error);
          }
        }
      }
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
  // Only enable auto-updater in production and if code-signed
  // Skip if app is not signed (will cause errors)
  if (isDev) {
    console.log('Auto-updater disabled in dev mode');
    return;
  }

  // Configure auto-updater
  autoUpdater.autoDownload = false; // Don't auto-download, ask user first
  autoUpdater.autoInstallOnAppQuit = true; // Install when app quits

  // Wrap in try-catch to prevent crashes if updater fails
  try {
    autoUpdater.checkForUpdatesAndNotify().catch(err => {
      console.log('Auto-updater check failed (app may not be signed):', err.message);
      // Don't crash, just log and continue
    });
  } catch (error) {
    console.log('Auto-updater unavailable:', error.message);
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
    console.log('Auto-updater error (non-critical):', error.message);
    // Don't propagate errors - auto-updater is optional
  });
}

// App lifecycle
app.whenReady().then(async () => {
  try {
    console.log('Starting Reapermadness...');
    console.log('Dev mode:', isDev);
    console.log('Platform:', process.platform);
    console.log('App path:', app.getAppPath());
    console.log('Executable path:', app.getPath('exe'));
    console.log('Resources path:', process.resourcesPath || 
      (process.platform === 'darwin' 
        ? path.join(path.dirname(app.getPath('exe')), '..', 'Resources')
        : path.join(path.dirname(app.getPath('exe')), 'resources')));

    // Start the server first
    console.log('Starting server...');
    await startServer();
    console.log('Server started successfully on port', SERVER_PORT);

    // Then create the window
    console.log('Creating window...');
    createWindow();
    console.log('Window created');

    // Setup auto-updater after window is created
    console.log('Setting up auto-updater...');
    setupAutoUpdater();
    console.log('Startup complete');
  } catch (error) {
    console.error('Failed to start application:', error);
    console.error('Error stack:', error.stack);

    // Show error dialog before quitting
    const { dialog } = require('electron');
    dialog.showErrorBox(
      'Startup Error',
      `Failed to start Reapermadness:\n\n${error.message}\n\nCheck the console for details.`
    );

    app.quit();
  }
});

// Force kill server process (Windows-compatible)
function killServerProcess() {
  if (!serverProcess) return;

  console.log('Killing server process...');

  if (process.platform === 'win32') {
    // On Windows, use taskkill to force kill the entire process tree
    try {
      const { execSync } = require('child_process');
      execSync(`taskkill /pid ${serverProcess.pid} /T /F`, { stdio: 'ignore' });
      console.log('Server process killed (Windows)');
    } catch (error) {
      console.error('Failed to kill server process:', error.message);
    }
  } else {
    // On Mac/Linux, use SIGTERM then SIGKILL
    try {
      serverProcess.kill('SIGTERM');

      // If still running after 1 second, force kill
      setTimeout(() => {
        if (serverProcess && !serverProcess.killed) {
          serverProcess.kill('SIGKILL');
          console.log('Server process force killed');
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to kill server process:', error.message);
    }
  }

  serverProcess = null;
}

app.on('window-all-closed', () => {
  // Kill the server when app closes
  killServerProcess();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', (event) => {
  // Ensure server is killed before quitting
  if (serverProcess) {
    console.log('Cleaning up before quit...');
    killServerProcess();

    // On Windows, give it a moment to actually die
    if (process.platform === 'win32') {
      event.preventDefault();
      setTimeout(() => {
        app.exit(0);
      }, 500);
    }
  }
});
