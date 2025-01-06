const express = require('express');
const bodyParser = require('body-parser');

function createServer(port, setUrlsCallback) {
    const server = express();
    server.use(bodyParser.json());

    server.post('/set_urls', (req, res) => {
        const urlDurations = req.body;

        if (!Array.isArray(urlDurations) || urlDurations.some(item => typeof item.url !== 'string' || typeof item.duration !== 'number')) {
            return res.status(400).json({ success: false, message: 'Invalid input format. Expecting an array of objects with url and duration properties.' });
        }

        setUrlsCallback(urlDurations);
        res.json({ success: true, urlDurations });
    });

    server.listen(port, (error) => {
        if (error) {
            console.error('Failed to start server:', error);
        } else {
            console.log(`Server running on port ${port}`);
        }
    });

    return server;
}

module.exports = { createServer };