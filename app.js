const { loadConfig } = require('./config');
const { createServer } = require('./server');
const { createElectronApp } = require('./electronApp');

// Load configuration
const { defaultURL, port } = loadConfig('config.json');

// Initialize Electron application
const electronApp = createElectronApp(defaultURL, (views, switchView) => {
    // Create the server and pass a callback to update Electron views dynamically
    createServer(port, (urlDurations) => {
        views.forEach(view => view.webContents.destroy());
        views.length = 0;
        urlDurations.forEach(item => electronApp.createView(item.url));
        switchView(urlDurations);
    });
});