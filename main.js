const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
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