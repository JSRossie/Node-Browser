// preload.js
window.addEventListener('DOMContentLoaded', () => {
    // Set the background color to dark
    document.body.style.backgroundColor = '#232227';

    // Hide the cursor
    setInterval(() => {
        document.body.style.cursor = 'none';
    }, 1000); // Apply the style every 1000 milliseconds
});