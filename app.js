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

// Initial setup for the background window
let backgroundWindow;

function createBackgroundWindow() {
    backgroundWindow = new BrowserWindow({
        fullscreen: true,
        frame: false,
        movable: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        },
        backgroundColor: '#505050' // Change to desired background color
    });

    // Optionally load a local HTML file with the solid color
    // backgroundWindow.loadURL('file://path/to/your/solid-color.html');
}

// Initial setup for mainWindow
let mainWindow;
const { Menu } = require('electron');
function createWindow(url) {
    
    // Ensure the background window is created first
    if (!backgroundWindow) {
        createBackgroundWindow();
    }

    mainWindow = new BrowserWindow({
        fullscreen: true,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Hide the menu bar
    mainWindow.setMenuBarVisibility(false);
    mainWindow.setAutoHideMenuBar(true);
    mainWindow.setMenu(null);
    
    mainWindow.loadURL(url);
    mainWindow.once('ready-to-show', () => {
        mainWindow.setFullScreen(true); // Set the window to full screen once it's ready to show
        mainWindow.show();
    });
/*
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.insertCSS("body { cursor: none; }");
    });
*/
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

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

    // Close the mainWindow
    if (mainWindow) {
        mainWindow.close();
    }

    // Clear any existing timeouts and close previous windows except for the background
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    windows.forEach(win => {
        if (win !== backgroundWindow) { // Ensure not to close the background window
            win.close();
        }
    });
    windows = []; // Reset the windows array, keeping only the background window

    // Create a new BrowserWindow for each URL
    urls.forEach((url, index) => {
        let win = new BrowserWindow({
            show: false,
            autoHideMenuBar: true,
            backgroundColor: '#A9A9A9', // Set the background color to 'dark gray
            webPreferences: {
                nodeIntegration: true,
                nodeIntegrationInWorker: true
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
        //windows[currentIndex].hide();
        
        currentIndex = (currentIndex + 1) % windows.length;
        //windows[currentIndex].show();
        windows[currentIndex].moveTop();

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


/*

In Electron, when a BrowserWindow is hidden, its rendering is paused but the page stays loaded in memory. So, when you hide and then show a window, the page should appear just as it was before it was hidden.

However, if you're experiencing issues with pages not staying loaded when their window is not in the foreground, it might be due to the web pages themselves. Some web pages might unload or reset their content when they lose focus or visibility, and there's not much you can do about this in Electron.

If you're trying to keep a page active even when its window is not in the foreground, you might need to use a different approach. Instead of using multiple windows and showing/hiding them, you could use a single window and load the different URLs in an offscreen BrowserView. Then, you can switch the BrowserView instances in and out of the window as needed. This should keep the pages active even when they're not currently being displayed.

Please note that this approach is more complex and might not work for all use cases. It also has its own set of limitations and potential issues, such as increased memory usage.

*/