const { contextBridge, ipcRenderer } = require('electron');

const electronAPI = {
    sendNotification: (message) => {
        if (!message || typeof message !== 'string' || message.trim() === '') {
            console.warn('Message is empty, undefined, or not a valid string');
            return;
        }
        ipcRenderer.send('notify', message);
    },
    onReceiveData: (callback) => {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }

        const listener = (event, data) => callback(data);

        // Ensure the listener is not registered multiple times
        ipcRenderer.removeAllListeners('receive-data');
        ipcRenderer.on('receive-data', listener);

        // Return a function to remove the listener to avoid memory leaks
        return () => ipcRenderer.removeListener('receive-data', listener);
    }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);