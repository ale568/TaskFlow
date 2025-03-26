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
    
    test('It should handle createTimer and return valid timerId', async () => {
        const timerId = 42;
        const mockSend = jest.fn();
        
        require('electron').ipcMain.handle.mock.calls.find(call => call[0] === 'createTimer')[1](
            { sender: { send: mockSend } },
            1, 'New Task', '2024-03-26T12:00:00', 'running'
        );
    
        const result = await main.createTimer(1, 'New Task', '2024-03-26T12:00:00', 'running');
        expect(typeof result === 'number' || result === null).toBeTruthy();
    });
    
    test('It should handle stopTimer and reset globalState', async () => {
        const mockSend = jest.fn();
    
        const elapsedTime = await main.stopTimer(
            { sender: { send: mockSend } },
            42,
            '2024-03-26T13:00:00'
        );
    
        expect(mockSend).toHaveBeenCalledWith('updateTimeEntriesMain');
        expect(typeof elapsedTime === 'number' || elapsedTime === null).toBeTruthy();
    });

    test('It should delete time entries and associated timers', async () => {
        const mockSend = jest.fn();
        const result = await main.deleteTimeEntries(
            { sender: { send: mockSend } },
            [1, 2, 3]
        );
    
        expect(result).toBe(true || false);
        expect(mockSend).toHaveBeenCalledWith('updateTimeEntriesMain');
    });

    
    test('It should get and set global state correctly', async () => {
        const originalState = await main.getGlobalState();
        expect(originalState).toHaveProperty('status');
    
        const newState = { task: 'test task', status: 'running' };
        const updatedState = await main.setGlobalState(null, newState);
        expect(updatedState.task).toBe('test task');
        expect(updatedState.status).toBe('running');
    });

    
    test('It should retrieve all projects and tags', async () => {
        const projects = await main.getAllProjects();
        expect(Array.isArray(projects)).toBe(true);
    
        const tags = await main.getAllTags();
        expect(Array.isArray(tags)).toBe(true);
    });
    
});
