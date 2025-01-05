/**
 * Electron Web Viewer Application
 * 
 * This application serves as a web viewer, displaying web content in a fullscreen
 * Electron window. It dynamically loads and switches between URLs based on 
 * configurable durations. Configuration is read from 'config.json', which specifies
 * the default URL and server port.
 * 
 * Features include:
 * - Reading initial configuration for default URL and port.
 * - Fullscreen display of web content with the ability to switch URLs.
 * - An Express server endpoint (/set_urls) for dynamic URL and duration updates.
 * - Robust error handling and input validation.
 * 
 * It's designed for scenarios like kiosks and digital signage. The user is expected
 * to have familiarity with Node.js, Electron, and Express.
 */



// Import required modules and libraries
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const { app: electronApp, BrowserWindow, BrowserView } = require('electron');
const path = require('path');

// Disabled HW accelleration for Windows 11 screen orientation handeling
electronApp.disableHardwareAcceleration();

// Initialize configuration data
let configData = '{}';
try {
    // Attempt to read the configuration from 'config.json'
    configData = fs.readFileSync('config.json', 'utf8');
} catch (error) {
    // Log and exit if the configuration file cannot be read or parsed
    console.error('Error reading or parsing config.json:', error);
    process.exit(1);
}

// Parse configuration data to get the default URL and port
const { defaultURL: defaultUrl, port: defaultPort } = JSON.parse(configData);

// Set up the Express server and use JSON body parsing middleware
const server = express();
server.use(bodyParser.json());

// Electron app and views initialization
let mainWindow; // Main window for the Electron app
let views = []; // Array to hold BrowserView instances
let timeoutId; // Timeout ID for view switching
let currentIndex = 0; // Index of the currently visible view

// Function to create a new browser view for a given URL
function createView(url) {
    // Create a new BrowserView with specific web preferences
    const view = new BrowserView({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Attempt to load the URL into the BrowserView
    view.webContents.loadURL(url).then(() => {
        console.log(`Loaded URL: ${url}`);
        // Set the first view as the visible one in the main window
        if (views.length === 0) {
            setViewVisible(view);
        }
    }).catch(error => {
        // Log if the URL fails to load
        console.error(`Failed to load URL ${url}:`, error);
    });

    // Add the newly created view to the array of views
    views.push(view);
    return view;
}

// Function to make a specific view visible in the main window
function setViewVisible(view) {
    // Set the BrowserView in the main window
    mainWindow.setBrowserView(view);
    // Adjust the view bounds to fill the entire main window
    const bounds = mainWindow.getBounds();
    view.setBounds({ x: 0, y: 0, width: bounds.width, height: bounds.height });
}

// Function to switch between views based on specified durations
function switchView(urlDurations) {
    // Return immediately if there are no views or URL durations to process
    if (views.length === 0 || !urlDurations || urlDurations.length === 0) return;

    // Clear any existing timeout to reset the view switching timer
    clearTimeout(timeoutId);

    // Calculate the next index, ensuring it loops back to 0 when reaching the end of the array
    currentIndex = (currentIndex + 1) % views.length;
    const currentView = views[currentIndex];

    // Make the current view visible if it is fully loaded
    if (!currentView.webContents.isLoading()) {
        setViewVisible(currentView);
    } else {
        // Wait for the view to finish loading before making it visible
        currentView.webContents.once('did-finish-load', () => {
            setViewVisible(currentView);
        });
    }

    // Calculate the duration to show the current view, defaulting to 5 seconds
    const duration = (urlDurations[currentIndex] && urlDurations[currentIndex].duration ? urlDurations[currentIndex].duration : 5) * 1000;
    // Set a timeout to switch views after the calculated duration
    timeoutId = setTimeout(() => switchView(urlDurations), duration);
}

// Initialize the Electron application
electronApp.on('ready', () => {
    // Create the main window with specific properties
    mainWindow = new BrowserWindow({
        fullscreen: true,
        backgroundColor: '#232227',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    mainWindow.setMenu(null); // Disable the default menu

    // Create and display the initial view based on the default URL
    const initialView = createView(defaultUrl);
    // Ensure the initial view is visible once it has finished loading
    initialView.webContents.once('did-finish-load', () => {
        setViewVisible(initialView);
    });
});

// Endpoint to set URLs and durations for the views
server.post('/set_urls', (req, res) => {
    const urlDurations = req.body;

    // Validate the received data to ensure it's in the expected format
    if (!Array.isArray(urlDurations) || urlDurations.some(item => typeof item.url !== 'string' || typeof item.duration !== 'number')) {
        return res.status(400).json({ success: false, message: 'Invalid input format. Expecting an array of objects with url and duration properties.' });
    }

    // Reset view switching logic
    clearTimeout(timeoutId);
    views.forEach(view => view.webContents.destroy()); // Destroy all current views to prevent memory leaks
    views = []; // Reset the views array
    urlDurations.forEach(item => createView(item.url)); // Create new views based on the provided URLs

    currentIndex = -1; // Reset the current index to ensure the first view is shown correctly
    switchView(urlDurations); // Begin the view switching logic with the new set of URLs and durations

    res.json({ success: true, urlDurations }); // Respond with success
});

// Start the Express server on the configured port
server.listen(defaultPort, (error) => {
    if (error) {
        console.error('Failed to start server:', error); // Log if the server fails to start
        return;
    }
    console.log(`Server running on port ${defaultPort}`); // Confirm server is running
});

// Handle the 'window-all-closed' event for Electron
electronApp.on('window-all-closed', () => {
    // Quit the application if it's not running on macOS (where applications typically stay active until explicitly quit)
    if (process.platform !== 'darwin') {
        electronApp.quit();
    }
});
