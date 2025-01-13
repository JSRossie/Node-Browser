window.addEventListener('DOMContentLoaded', () => {
    console.log('Script loaded.');

    const config = {
        backgroundColor: '#232227',
        hideCursor: true,
    };

    const body = document.body || document.getElementsByTagName('body')[0];
    if (body) {
        body.style.backgroundColor = config.backgroundColor;
        if (config.hideCursor) {
            body.style.cursor = 'none';
        }
    } else {
        console.error('Unable to find the body element to apply styles.');
    }

    const targetURL = "http://globe.adsbexchange.com?icao=a2dc22&airport=KAUS&hideSidebar&hideButtons&zoom=8&iconScale=2";

    function checkURL() {
        console.log('Running checkURL...');
        console.log('Current URL:', window.location.href);
        console.log('Target URL:', targetURL);

        if (window.location.href === targetURL) {
            const infoBlockContainer = document.querySelector('#infoblock-container');
            if (infoBlockContainer) {
                console.log('Hiding info block container.');
                infoBlockContainer.style.display = 'none';
            } else {
                console.warn('Element #infoblock-container not found.');
            }
        } else {
            console.log('URL does not match the target.');
        }
    }

    checkURL(); // Initial check
    window.addEventListener('popstate', checkURL);
    window.addEventListener('hashchange', checkURL);
});