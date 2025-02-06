const { contextBridge, ipcRenderer } = require('electron');

jest.mock('electron', () => ({
    contextBridge: { exposeInMainWorld: jest.fn() },
    ipcRenderer: { send: jest.fn(), on: jest.fn() },
}));

const preload = require('../preload');

describe('Preload Script', () => {

    beforeAll(() => {
        window.electronAPI = {
            sendNotification: ipcRenderer.send,
            onReceiveData: (callback) => ipcRenderer.on('receive-data', (event, data) => callback(data)),
        };
    });

    test('It should expose the API electronAPI into Renderer Process', () => {
        expect(contextBridge.exposeInMainWorld).toHaveBeenCalledWith('electronAPI', expect.any(Object));
    });

    test('It should send a notification request to the Main Process', () => {
        const mockSend = jest.fn();
        ipcRenderer.send = mockSend;

        window.electronAPI.sendNotification('Task Expired!');
        expect(mockSend).toHaveBeenCalledwith('notify', 'Task Expired!');
    });

    test('It should receive a response event from the Main Process', () => {
        const mockCallback = jest.fn();
        const mockOn = jest.fn((event, callback) => callback(null, 'Data Test'));

        ipcRenderer.on = mockOn;

        window.electronAPI.onReceiveData(mockCallback);
        expect(mockCallback).toHaveBeenCalledwith('Data Test');
    });
});