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
