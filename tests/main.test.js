const { app, BrowserWindow, ipcMain, Notification} = require('electron');

jest.mock('electron', () => ({
    app: {
        whenReady: jest.fn(() => Promise.resolve()),
        on: jest.fn(),
        quit: jest.fn(),
    },
    BrowserWindow: jest.fn(() => ({
        loadFile: jest.fn(),
        on: jest.fn(),
    })),
    ipcMain:  {
        on: jest.fn(),
    },
    Notification: jest.fn(() => ({
        show: jest.fn(),
    })),
}));

const main = require('../main');

describe('Main Process', () => {

    test('It should create a main window when the app is ready', async () => {
        await app.whenReady();
        expect(BrowserWindow).toHaveBeenCalled();
    });

    test('It should load the index.html file', async () => {
        await app.whenReady();
        const mockWindow = new BrowserWindow();
        expect(mockWindow.loadFile).toHaveBeenCalledWith('renderer/index.html');
    });

    test('It should quit the application when all windows are closed', () => {
        const mockQuit = jest.SpyOn(app, 'quit').mockImplementation();
        app.on.mock.calls.forEach(([event, callback]) => {
            if (event === 'window-all-closed') {
                callback();
            }
        });
        expect(mockQuit).toHaveBeenCalled();
    });

    test('It should handle a notification request from Renderer Process', () => {
        const mockNotification = jest.fn();
        Notification.mockImplementation(() => ({
            show: mockNotification,
        }));

        const mockEvent = {};
        const mockMessage = 'Task Expired!';
        ipcMain.on.mock.calls.forEach(([channel, callback]) => {
            if (channel === 'notify') {
                callback(mockEvent, mockMessage);
            }
        });

        expect(mockNotification).toHaveBeenCalled();
    });
});