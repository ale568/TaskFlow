const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('renderer/index.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function handleWindowClose() {
    if (global.mainWindow) {
        global.mainWindow.close();
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (!global.mainWindow) {
        createWindow();
    }
});

ipcMain.on('notify', (event, message) => {
    if (!message || typeof message !== 'string' || message.trim() === '') {
        console.warn('Notification message is empty, undefined, or not a valid string');
        return;
    }

    const notification = new Notification({
        title: 'Notification',
        body: message
    });

    notification.show();
});

module.exports = {
    createWindow,
    handleWindowClose
};