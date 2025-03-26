const { contextBridge, ipcRenderer } = require('electron');

jest.mock('electron', () => ({
    contextBridge: { exposeInMainWorld: jest.fn((key, value) => { global[key] = value; }) },
    ipcRenderer: { 
        send: jest.fn(),
        on: jest.fn(),
        removeListener: jest.fn(),
        removeAllListeners: jest.fn() 
    },
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

    test('Should invoke getAllProjects', async () => {
        await global.electronAPI.getAllProjects();
        expect(ipcRenderer.invoke).toHaveBeenCalledWith('getAllProjects');
    });

    test('Should invoke getActivitiesByProjectId', async () => {
        await global.electronAPI.getActivitiesByProjectId(5);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith('getActivitiesByProjectId', 5);
    });

    test('Should invoke createTimer with arguments', async () => {
        await global.electronAPI.createTimer(1, 'task', 'startTime', 'running');
        expect(ipcRenderer.invoke).toHaveBeenCalledWith('createTimer', 1, 'task', 'startTime', 'running');
    });

    test('Should invoke stopTimer', async () => {
        await global.electronAPI.stopTimer(99, 'manualEnd');
        expect(ipcRenderer.invoke).toHaveBeenCalledWith('stopTimer', 99, 'manualEnd');
    });

    test('Should invoke deleteTimeEntries with array of ids', async () => {
        await global.electronAPI.deleteTimeEntries([1, 2, 3]);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith('deleteTimeEntries', [1, 2, 3]);
    });

    test('Should invoke getProjectIdByName and return ID', async () => {
        await global.electronAPI.getProjectIdByName('My Project');
        expect(ipcRenderer.invoke).toHaveBeenCalledWith('getProjectIdByName', 'My Project');
    });

    test('Should invoke createProject', async () => {
        await global.electronAPI.createProject('Nuovo Progetto', 'Descrizione');
        expect(ipcRenderer.invoke).toHaveBeenCalledWith('project:create', 'Nuovo Progetto', 'Descrizione');
    });

    test('Should handle updateProject correctly', async () => {
        const updates = { name: 'Updated' };
        await global.electronAPI.updateProject(5, updates);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith('update-project', 5, updates);
    });

    test('Should handle getGlobalState', async () => {
        await global.electronAPI.getGlobalState();
        expect(ipcRenderer.invoke).toHaveBeenCalledWith('get-global-state');
    });

    test('Should handle setGlobalState', async () => {
        const newState = { status: 'running' };
        await global.electronAPI.setGlobalState(newState);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith('set-global-state', newState);
    });

    test('Should call getAllTags', async () => {
        await global.electronAPI.getAllTags();
        expect(ipcRenderer.invoke).toHaveBeenCalledWith('getAllTags');
    });

    test('Should call getAllActivities', async () => {
        await global.electronAPI.getAllActivities();
        expect(ipcRenderer.invoke).toHaveBeenCalledWith('getAllActivities');
    });

    test('Should handle createAlert', async () => {
        const alertData = { title: 'Alert', type: 'Reminder' };
        await global.electronAPI.createAlert(alertData);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith('createAlert', alertData);
    });

    test('Should call exportReportToPDF', async () => {
        const fakeData = { report: true };
        await global.electronAPI.exportReportToPDF(fakeData);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith('exportReportToPDF', fakeData);
    });

    test('Should return correctly formatted time string', () => {
        const time = global.electronAPI.formatTime('2024-03-26T13:45:00Z');
        expect(typeof time).toBe('string');
    });

    test('Should attach onAppClose listener', () => {
        const mockCallback = jest.fn();
        global.electronAPI.onAppClose(mockCallback);
        expect(ipcRenderer.on).toHaveBeenCalledWith('reset-timer-ui', mockCallback);
    });

    test('Should register a dynamic receive listener', () => {
        const mockCallback = jest.fn();
        global.electronAPI.receive('channel-test', mockCallback);

        const handler = ipcRenderer.on.mock.calls[0][1];
        handler(null, 'data1', 'data2');
        expect(mockCallback).toHaveBeenCalledWith('data1', 'data2');
    });
});