const { contextBridge, ipcRenderer } = require('electron');

jest.mock('electron', () => ({
    contextBridge: { exposeInMainWorld: jest.fn((key, value) => { global[key] = value; }) },
    ipcRenderer: { send: jest.fn(), on: jest.fn() },
}));

require('../preload');

describe('Preload Script', () => {

    test('It should expose the API electronAPI into Renderer Process', () => {
        expect(contextBridge.exposeInMainWorld).toHaveBeenCalledWith('electronAPI', expect.any(Object));
        expect(global.electronAPI).toBeDefined();
    });

    test('It should send a notification request to the Main Process', () => {
        global.electronAPI.sendNotification('Task Expired!');
        expect(ipcRenderer.send).toHaveBeenCalledWith('notify', 'Task Expired!');
    });

    test('It should receive a response event from the Main Process', () => {
        const mockCallback = jest.fn();
        const mockOn = jest.fn((event, callback) => callback(null, 'Data Test'));

        ipcRenderer.on = mockOn;

        global.electronAPI.onReceiveData(mockCallback);
        expect(mockCallback).toHaveBeenCalledWith('Data Test');
    });
});