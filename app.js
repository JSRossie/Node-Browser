const fs = require('fs');

// Read the JSON file
const data = fs.readFileSync('config.json', 'utf8');

// Parse the JSON file to get the default URL
const defaultUrl = JSON.parse(data).url;
const defaultPort = JSON.parse(data).port;

const { app, BrowserWindow } = require('electron');
const express = require('express');
const bodyParser = require('body-parser');

// Create the Express app
const server = express();
server.use(bodyParser.json());

let mainWindow;
const { Menu } = require('electron');
function createWindow(url) {
    mainWindow = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Hide the menu bar
    mainWindow.setMenuBarVisibility(false);
    mainWindow.setAutoHideMenuBar(true);
    mainWindow.setMenu(null);
    mainWindow.loadURL(url);

    mainWindow.loadURL(url);

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.insertCSS("body { cursor: none; }");
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
/*
// Create a variable to control the loop
let shouldContinueLoop = true;

// Handle URL changes
server.post('/set_url', (req, res) => {
    const url = req.body.url;
    if (mainWindow) {
        mainWindow.loadURL(url);
        shouldContinueLoop = false; // Stop the /multi_url loop
    }
    res.json({ success: true, url: url });
});

// Handle multiple URL changes
server.post('/multi_url', (req, res) => {
    const urls = req.body.urls;
    const duration = req.body.duration;

    if (mainWindow) {
        let currentIndex = 0;
        shouldContinueLoop = true; // Start the /multi_url loop

        const displayNextUrl = () => {
            if (!shouldContinueLoop) return; // Exit the loop if shouldContinueLoop is false
            const url = urls[currentIndex];
            mainWindow.loadURL(url);

            currentIndex = (currentIndex + 1) % urls.length;

            setTimeout(displayNextUrl, duration * 1000);
        };

        displayNextUrl();
    }

    res.json({ success: true, urls: urls, duration: duration });
});
*/

let windows = [];
let timeoutId;

// Handle multiple URL changes with different durations
server.post('/set_urls', (req, res) => {
    const urls = req.body.urls;
    const durations = req.body.durations;

    if (urls.length !== durations.length) {
        res.json({ success: false, message: 'The number of URLs and durations must be the same.' });
        return;
    }

    // Clear any existing timeouts
    if (timeoutId) {
        clearTimeout(timeoutId);
    }

    // Close the mainWindow
    if (mainWindow) {
        mainWindow.close();
    }

    // Close any existing windows
    windows.forEach(win => win.close());
    windows = [];

    // Create a new BrowserWindow for each URL
    urls.forEach((url, index) => {
        let win = new BrowserWindow({
            show: false,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true
            }
        });

        win.loadURL(url);

        // Wait for the window to be ready before showing it in full screen mode
        win.once('ready-to-show', () => {
            win.setFullScreen(true);
            if (index === 0) {
                win.show();
            }
        });

        windows.push(win);
    });

    // Cycle through the windows according to the specified durations
    let currentIndex = 0;
    const displayNextWindow = () => {
        windows[currentIndex].hide();
        currentIndex = (currentIndex + 1) % windows.length;
        windows[currentIndex].show();

        // If the duration is 0, display the URL indefinitely
        if (durations[currentIndex] !== 0) {
            timeoutId = setTimeout(displayNextWindow, durations[currentIndex] * 1000);
        }
    };

    // Start the cycle with the first URL
    if (durations[0] !== 0) {
        timeoutId = setTimeout(displayNextWindow, durations[0] * 1000);
    }

    res.json({ success: true, urls: urls, durations: durations });
});

server.listen(defaultPort, () => {
    console.log(`Server running on port ${defaultPort}`);
});

app.on('ready', () => createWindow(defaultUrl));

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow(defaultUrl);
    }
});
