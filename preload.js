const { contextBridge, ipcRenderer } = require('electron');

const electronAPI = {
    sendNotification: (message) => {
        if (!message) {
            console.warn('Message is empty or undefined');
            return;
        }
        ipcRenderer.send('notify', message);
    },
    onReceiveData: (callback) => {
        const listener = (event, data) => callback(data);
        ipcRenderer.on('receive-data', listener);
        return () => ipcRenderer.removeListener('receive-data', listener);
    }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);