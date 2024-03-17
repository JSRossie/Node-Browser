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

// Handle URL changes
server.post('/set_url', (req, res) => {
    const url = req.body.url;
    if (mainWindow) {
        mainWindow.loadURL(url);
    }
    res.json({ success: true, url: url });
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
