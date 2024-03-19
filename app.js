const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const { app, BrowserWindow, BrowserView } = require('electron');
const path = require('path'); 

// Read and parse the configuration file
const configData = fs.readFileSync('config.json', 'utf8');
const { url: defaultUrl, port: defaultPort } = JSON.parse(configData);

// Create the Express app
const server = express();
server.use(bodyParser.json());

let mainWindow;
let views = [];
let timeoutId;
let currentIndex = 0;

// Function to create a new BrowserView and load a URL
function createView(url) {
    const view = new BrowserView(
        {
            //backgroundColor: '#232227',
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: false,
                contextIsolation: true // Adjust according to security needs
            }
        }
    );
    view.webContents.loadURL(url).then(() => {
        console.log(`Loaded URL: ${url}`);
    }).catch(error => {
        console.error(`Failed to load URL ${url}: ${error}`);
    });
    views.push(view);
}

function switchView(durations) {
    if (views.length === 0) return; // Exit if no views to switch

    // Clear any existing timeout to prevent unexpected behavior
    clearTimeout(timeoutId);

    const currentView = views[currentIndex];
    // Immediately set the view to be displayed to ensure it's visible
    mainWindow.setBrowserView(currentView);
    const bounds = { x: 0, y: 0, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height };
    currentView.setBounds(bounds);

    // Use the did-finish-load event to wait for the content to load before setting up the next switch
    currentView.webContents.once('did-finish-load', () => {
        console.log(`View ${currentIndex} finished loading.`);
        // Set the timeout for the next view switch based on the provided duration
        const duration = durations[currentIndex] !== undefined ? durations[currentIndex] * 1000 : 0;
        if (duration > 0) {
            timeoutId = setTimeout(() => {
                // Proceed to the next index and switch view
                currentIndex = (currentIndex + 1) % views.length;
                switchView(durations);
            }, duration);
        } else {
            // If the duration is 0 or undefined, immediately switch to the next view
            currentIndex = (currentIndex + 1) % views.length;
            switchView(durations);
        }
    });

    // If the URL is already loaded (e.g., from cache), the did-finish-load event may not trigger again,
    // so you might want to manually trigger the next view switch in such cases.
    // This can be done by checking if the webContents is already in a "complete" readyState,
    // indicating the page has loaded, and then manually calling the logic to switch to the next view.
    if (currentView.webContents.getURL() && currentView.webContents.isLoading() === false) {
        console.log(`View ${currentIndex} is already loaded, manually triggering switch.`);
        // Manually trigger the switch logic if needed
        clearTimeout(timeoutId); // Ensure no double timeout
        timeoutId = setTimeout(() => {
            currentIndex = (currentIndex + 1) % views.length;
            switchView(durations);
        }, durations[currentIndex] !== undefined ? durations[currentIndex] * 1000 : 0);
    }
}


app.on('ready', () => {
    mainWindow = new BrowserWindow({
        fullscreen: true,
        backgroundColor: '#232227',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false // Adjust according to security needs
        }
    });
    mainWindow.setMenu(null);
    
    // Create a BrowserView for the initial URL
    createView(defaultUrl);

    // Switch to the first view with indefinite display
    switchView([0]);

});

// Handle POST request to change URLs with durations
server.post('/set_urls', (req, res) => {
    const { urls, durations } = req.body;

    if (urls.length !== durations.length) {
        return res.json({ success: false, message: 'URLs and durations count mismatch.' });
    }

    clearTimeout(timeoutId); // Clear any existing timeouts
    views.forEach(view => view.webContents.destroy()); // Clean up previous views
    views = [];
    urls.forEach(createView);

    currentIndex = 0; // Reset the index
    switchView(durations); // Start the cycle with the new URLs

    res.json({ success: true, urls, durations });
});

server.listen(defaultPort, () => {
    console.log(`Server running on port ${defaultPort}`);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
