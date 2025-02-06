const { app, BrowserWindow, ipcMain, Notification } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('renderer/index.html');
}

function handleWindowClose() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', handleWindowClose);

ipcMain.on('notify', (event, message) => {
    const notification = new Notification({ title: 'Notification', body: message });
    notification.show();
});

module.exports = { createWindow, handleWindowClose };