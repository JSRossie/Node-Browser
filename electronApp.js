const { app: electronApp, BrowserWindow, BrowserView } = require('electron');
const path = require('path');

function createElectronApp(defaultUrl, onReadyCallback) {
    let mainWindow;
    let views = [];
    let timeoutId;
    let currentIndex = 0;

    // Function to create a new BrowserView
    function createView(url) {
        const view = new BrowserView({
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: false,
                contextIsolation: true,
                webgl: true,
                experimentalFeatures: true
            }
        });

        view.webContents.loadURL(url).then(() => {
            console.log(`Loaded URL: ${url}`);
            if (views.length === 0) {
                setViewVisible(view);
            }
        }).catch(error => {
            console.error(`Failed to load URL ${url}:`, error);
            view.webContents.loadURL('data:text/html,<h1>Error Loading Page</h1>');
        });

        views.push(view);
        return view;
    }

    // Function to clean up old views to avoid memory leaks
    function destroyViews() {
        views.forEach(view => {
            if (!view.isDestroyed()) {
                view.webContents.destroy();
            }
        });
        views = [];
    }

    // Asynchronous function to set a specific view visible
    async function setViewVisibleAsync(view) {
        mainWindow.setBrowserView(view);
        const bounds = mainWindow.getBounds();
        view.setBounds({ x: 0, y: 0, width: bounds.width, height: bounds.height });

        try {
            // Ensure the view has fully loaded before making it visible
            await view.webContents.executeJavaScript('document.readyState === "complete"');
        } catch (error) {
            console.error('Error ensuring view is ready:', error);
        }
    }

    // Function to switch between views based on duration
    async function switchView(urlDurations) {
        if (views.length === 0 || !urlDurations || urlDurations.length === 0) return;

        clearTimeout(timeoutId);

        currentIndex = (currentIndex + 1) % views.length;
        const currentView = views[currentIndex];

        if (!currentView.webContents.isLoading()) {
            await setViewVisibleAsync(currentView);
        } else {
            currentView.webContents.once('did-finish-load', async () => {
                await setViewVisibleAsync(currentView);
            });
        }

        const duration = (urlDurations[currentIndex]?.duration || 5) * 1000;
        timeoutId = setTimeout(() => switchView(urlDurations), duration);
    }

    electronApp.on('ready', () => {
        mainWindow = new BrowserWindow({
            fullscreen: true,
            frame: false,
            backgroundColor: '#232227',
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: false,
                contextIsolation: true,
                webgl: true,
                experimentalFeatures: true
            }
        });

        // Set a custom User-Agent for all network requests
        const { session } = mainWindow.webContents;
        session.webRequest.onBeforeSendHeaders((details, callback) => {
            details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
            callback({ cancel: false, requestHeaders: details.requestHeaders });
        });

        // Optional: Log outgoing requests for debugging
        session.webRequest.onSendHeaders((details) => {
            console.log('Request Headers:', details.requestHeaders);
        });

        mainWindow.maximize();
        mainWindow.setMenu(null);

        const initialView = createView(defaultUrl);
        initialView.webContents.once('did-finish-load', async () => {
            await setViewVisibleAsync(initialView);
        });

        onReadyCallback(views, switchView);
    });

    electronApp.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            electronApp.quit();
        }
    });

    electronApp.on('quit', () => {
        clearTimeout(timeoutId);
        destroyViews();
    });

    return { createView, switchView };
}

module.exports = { createElectronApp };