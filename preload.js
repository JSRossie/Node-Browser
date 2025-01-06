// preload.js
window.addEventListener('DOMContentLoaded', () => {
    // Configuration object for dynamic control
    const config = {
        backgroundColor: '#232227', // Background color of the application
        hideCursor: true,          // Whether to hide the cursor
    };

    // Ensure the body element is available before applying styles
    const body = document.body || document.getElementsByTagName('body')[0];

    if (body) {
        // Set the application's background color
        body.style.backgroundColor = config.backgroundColor;

        // Conditionally hide the cursor for kiosk or presentation mode
        if (config.hideCursor) {
            body.style.cursor = 'none';
        }
    } else {
        console.error('Unable to find the body element to apply styles.');
    }
});