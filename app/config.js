const config = require('electron-config');

module.exports = new config({
    defaults: {
        lastWindowState: {
            // Saves windows position, width and height.
            x: 0,
            y: 0,
            width: 1280,
            height: 820
        }
    }
});
