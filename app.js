const { app, BrowserWindow } = require('electron');
const express = require('express');
const bodyParser = require('body-parser');

// Create the Express app
const server = express();
server.use(bodyParser.json());

// Port for the Express app
const PORT = 5001;

let mainWindow;

app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('disable-gpu');
app.disableHardwareAcceleration();

function createWindow(url) {
    mainWindow = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadURL(url);
}
function createWindow(url) {
    mainWindow = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadURL(url);

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

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.on('ready', () => createWindow('https://google.com'));

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow('http://google.com');
    }
});
