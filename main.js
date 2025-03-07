const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("path");

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        minWidth: 1280,  
        minHeight: 720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            sandbox: true,
            contextIsolation: true, // Evita che il renderer acceda direttamente ai moduli di Node.js
        enableRemoteModule: false, // Disabilita l'accesso al modulo "remote" (deprecated)
        nodeIntegration: false, // Evita l'accesso diretto ai moduli Node.js dal renderer
        webSecurity: true, // Protegge contro attacchi come XSS e CSP bypass
        allowRunningInsecureContent: false, // Evita il caricamento di contenuti non sicuri
        }
    });

    mainWindow.loadFile('renderer/index.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

function handleWindowClose() {
    if (mainWindow && typeof mainWindow.close === 'function') {
        mainWindow.close();
    }
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (!mainWindow || mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('notify', (event, arg) => {
    console.log(arg);
    if (event?.sender) {
        event.sender.send('notify-reply', 'pong');
    }
});

module.exports = { createWindow, handleWindowClose };