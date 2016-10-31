//Electron
const electron = require('electron');
const globalShortcut = electron.globalShortcut;
const browserWindow = electron.BrowserWindow;
const menu = electron.Menu;

//App Info
const app = electron.app;
const app_name = app.getName();
const app_title = app.getName();
const app_version = app.getVersion();
const app_description = 'The unofficial electron app for appear.in';
const app_config = require('./lib/config.js');
const app_is_dev = require('electron-is-dev');

// System paths
const path = require('path');
const fs = require('fs');

// Electron DL
require('electron-dl')();

// Right Click/Context menu contents
require('electron-context-menu')();

// Main App Window
let mainWindow;

// If the application is quitting
let isQuitting = false;

// Main Window
function createMainWindow() {
    const lastWindowState = app_config.get('lastWindowState');
    const app_view = new electron.BrowserWindow({
        title: app_title,
        x: lastWindowState.x,
        y: lastWindowState.y,
        width: lastWindowState.width,
        height: lastWindowState.height,
        titleBarStyle: 'hidden-inset',
        center: true,
        movable: true,
        resizable: true,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            plugins: true
        }
    });
    app_view.loadURL('https://appear.in');

    // When window is closed, hide window
    app_view.on('close', e => {
        if (!isQuitting) {
            e.preventDefault();
            if (process.platform === 'darwin') {
                app.hide();
            } else {
                app.quit();
            }
        }

    });
    return app_view;
}

app.on('ready', () => {
    mainWindow = createMainWindow();
    menu.setApplicationMenu(require('./lib/menu.js'))
    if (app_is_dev) {
        mainWindow.openDevTools()
    }

    const app_page = mainWindow.webContents;

    app_page.on('dom-ready', () => {

        // Global Style Additions
        app_page.insertCSS(fs.readFileSync(path.join(__dirname, 'app.css'), 'utf8'));

        // MacOS ONLY style fixes
        if (process.platform == 'darwin') {
            app_page.insertCSS('header.top-line { padding-left:82px!important; } div.content-wrapper { width:calc(100% - 65px)!important; float:right!important; } body > div.container > section.frontpage > section.frontpage-header > header { -webkit-app-region: drag!important; } body > div.wrapper.frontpage-content-wrapper > div > div > main > header > div > div.top-bar-button.contacts-button.selected { margin-left: 20px!important; }');
        }

        // Global Code Additions
        app_page.executeJavaScript(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'));

        mainWindow.show();

        //Open external links in browser
        app_page.on('new-window', (e, url) => {
            e.preventDefault();
            electron.shell.openExternal(url);
        })

        //Shortcut to reload the page.
        globalShortcut.register('CmdOrCtrl+R', () => {
            mainWindow.webContents.reload();
        })
        globalShortcut.register('CmdOrCtrl+Left', () => {
            mainWindow.webContents.goBack();
            mainWindow.webContents.reload();
        })

        mainWindow.on('app-command', (e, cmd) => {
            // Navigate the window back when the user hits their mouse back button
            if (cmd === 'browser-backward' && mainWindow.webContents.canGoBack()) {
                mainWindow.webContents.goBack()
            }
        })
    })
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
app.on('activate', () => {
    mainWindow.show()
})
app.on('before-quit', () => {
    isQuitting = true;
    if (!mainWindow.isFullScreen()) {
  		app_config.set('lastWindowState', mainWindow.getBounds());
  	}
});
