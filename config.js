const fs = require('fs');

function loadConfig(configFilePath) {
    try {
        const configData = fs.readFileSync(configFilePath, 'utf8');
        return JSON.parse(configData);
    } catch (error) {
        console.error('Error reading or parsing config.json:', error);
        process.exit(1);
    }
}

module.exports = { loadConfig };