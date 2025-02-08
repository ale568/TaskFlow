const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const main = require('../main');

jest.mock('electron', () => {
    const mockBrowserWindow = {
        loadFile: jest.fn(),
        on: jest.fn(),
    };

    let appListeners = {};
    let ipcListeners = {};

    return {
        app: {
            whenReady: jest.fn(() => Promise.resolve()),
            on: jest.fn((event, callback) => {
                appListeners[event] = callback;
            }),
            quit: jest.fn(),
        },
        BrowserWindow: jest.fn(() => mockBrowserWindow),
        ipcMain: {
            on: jest.fn((channel, callback) => {
                ipcListeners[channel] = callback;
            }),
        },
        Notification: jest.fn().mockImplementation(({ title, body }) => ({
            show: jest.fn(),
            title,
            body,
        })),
        _getListeners: () => ({ appListeners, ipcListeners }),
    };
});

describe('Main Process', () => {
    let mockQuit, mockNotificationInstance;
    let listeners;

    beforeEach(() => {
        jest.clearAllMocks();
        listeners = require('electron')._getListeners();
        mockQuit = jest.spyOn(app, 'quit').mockImplementation();
        mockNotificationInstance = new Notification({ title: 'Test', body: 'Message' });
    });

    test('It should create a main window when the app is ready', async () => {
        const mockCreateWindow = jest.spyOn(main, 'createWindow');
        await app.whenReady();
        main.createWindow();
        expect(mockCreateWindow).toHaveBeenCalledTimes(1);
    });

    test('It should load the index.html file', () => {
        main.createWindow();
        expect(BrowserWindow).toHaveBeenCalledTimes(1);

        const mockWindowInstance = new BrowserWindow();
        expect(mockWindowInstance.loadFile).toHaveBeenCalledWith('renderer/index.html');
    });

    test('It should quit the application when all windows are closed', () => {
        listeners.appListeners['window-all-closed']();
        expect(mockQuit).toHaveBeenCalledTimes(1);
    });

    test('It should handle a notification request from Renderer Process', () => {
        listeners.ipcListeners['notify']({}, 'Task Expired!');
        expect(mockNotificationInstance.show).not.toThrow();
    });

    test('It should quit the application on window-all-closed if not on macOS', () => {
        Object.defineProperty(process, 'platform', { value: 'win32' }); // Simula Windows
        listeners.appListeners['window-all-closed']();
        expect(app.quit).toHaveBeenCalledTimes(1);
    });

    test('It should not quit the application on macOS', () => {
        Object.defineProperty(process, 'platform', { value: 'darwin' }); // Simula macOS
        listeners.appListeners['window-all-closed']();
        expect(app.quit).not.toHaveBeenCalled();
    });

    test('It should not close the app if mainWindow is null', () => {
        global.mainWindow = null;
        expect(() => main.handleWindowClose()).not.toThrow();
    });

    test('It should recreate the main window when activated if no windows are open', () => {
        expect(() => listeners.appListeners['activate']()).not.toThrow();
    });    
    
});
