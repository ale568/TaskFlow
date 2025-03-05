const fs = require('fs');
const path = require('path');
const TimerController = require('../../renderer/controllers/timerController');
const Timer = require('../../renderer/models/timer');
const Project = require('../../renderer/models/project');
const dbUtils = require('../../renderer/utils/dbUtils');
const timerUtils = require('../../renderer/utils/timerUtils');

jest.mock('../../renderer/utils/timerUtils');

describe('TimerController - Database Operations', () => {
    const LOG_FILE_PATH = path.resolve(__dirname, '../../logs/controllers.log');

    beforeAll(async () => {
        Timer.setDatabase('taskflow_test_timer.sqlite'); // Set the dedicated test database
        dbUtils.connect('taskflow_test_timer.sqlite'); // Connect to the test database
    });

    beforeEach(() => {
        jest.clearAllMocks();
        timerUtils.startTimer.mockReturnValue('2024-02-21T10:00:00'); // Mock start time
    });

    function readLogs() {
        return fs.readFileSync(LOG_FILE_PATH, 'utf8');
    }

    test('It should create and retrieve a timer with logging', async () => {
        const uniqueProjectName = `Timer Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for timer testing');

        const spy = jest.spyOn(Timer, 'createTimer');
        const timerId = await TimerController.createTimer(projectId, 'Test Task', 'running');

        expect(spy).toHaveBeenCalledWith(projectId, 'Test Task', '2024-02-21T10:00:00', 'running');
        expect(timerId).toBeDefined();

        const logs = readLogs();
        expect(logs).toMatch(/Timer created: Task Test Task, Project ID/);

        spy.mockRestore();
    });

    test('It should update a timer with logging', async () => {
        const uniqueProjectName = `Timer Update Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for updating timers');

        const timerId = await TimerController.createTimer(projectId, 'Initial Task', 'running');

        const spy = jest.spyOn(Timer, 'updateTimer');
        const updated = await TimerController.updateTimer(timerId, { status: 'paused' });

        expect(spy).toHaveBeenCalledWith(timerId, { status: 'paused' });
        expect(updated.success).toBeTruthy();

        const logs = readLogs();
        expect(logs).toMatch(/Timer updated: ID/);

        spy.mockRestore();
    });

    test('It should delete a timer with logging', async () => {
        const uniqueProjectName = `Timer Delete Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for deleting timers');

        const timerId = await TimerController.createTimer(projectId, 'To Delete', 'running');

        const spy = jest.spyOn(Timer, 'deleteTimer');
        const deleted = await TimerController.deleteTimer(timerId);

        expect(spy).toHaveBeenCalledWith(timerId);
        expect(deleted).toBeTruthy();

        const logs = readLogs();
        expect(logs).toMatch(/Timer deleted: ID/);

        spy.mockRestore();
    });

    test('It should return null for a non-existing timer', async () => {
        const spy = jest.spyOn(Timer, 'getTimerById');
        const timer = await TimerController.getTimerById(99999);

        expect(spy).toHaveBeenCalledWith(99999);
        expect(timer).toBeNull();

        const logs = readLogs();
        expect(logs).toMatch(/Timer not found: ID 99999/);

        spy.mockRestore();
    });

    test('It should log an error when updating a non-existing timer', async () => {
        
        const spy = jest.spyOn(Timer, 'getTimerById').mockResolvedValue(null);
        const result = await TimerController.updateTimer(99999, { status: 'stopped' });
    
        expect(spy).toHaveBeenCalledWith(99999);
        expect(result.success).toBeFalsy();
    
        const logs = readLogs();
        expect(logs).toMatch(/Error updating timer: Timer ID 99999 not found/);
    
        spy.mockRestore();
    });    

    test('It should log an error when deleting a non-existing timer', async () => {
        const spy = jest.spyOn(Timer, 'deleteTimer');
        const result = await TimerController.deleteTimer(99999);

        expect(spy).toHaveBeenCalledWith(99999);
        expect(result).toBeFalsy();

        const logs = readLogs();
        expect(logs).toMatch(/Error deleting timer: Timer ID 99999 not found/);

        spy.mockRestore();
    });

    test('It should retrieve all timers', async () => {
        const uniqueProjectName = `Timer Retrieval Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for retrieving timers');

        await TimerController.createTimer(projectId, 'Task A', 'running');
        await TimerController.createTimer(projectId, 'Task B', 'paused');

        const spy = jest.spyOn(Timer, 'getAllTimers');
        const timers = await TimerController.getAllTimers();

        expect(spy).toHaveBeenCalled();
        expect(timers.length).toBeGreaterThanOrEqual(2);

        const logs = readLogs();
        expect(logs).toMatch(/Retrieved \d+ timers/);

        spy.mockRestore();
    });

    test('It should stop a timer and log elapsed time', async () => {
        const uniqueProjectName = `Timer Stop Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for stopping timers');

        const timerId = await TimerController.createTimer(projectId, 'Test Stop Task', 'running');

        timerUtils.stopTimer.mockReturnValue('00:15:00'); // Mocka un tempo di 15 minuti

        const elapsedTime = await TimerController.stopTimer(timerId);

        expect(elapsedTime).toBe('00:15:00');

        const logs = readLogs();
        expect(logs).toMatch(/Timer stopped: ID/);
    });

    test('It should handle errors when creating a timer with an invalid project ID', async () => {
        const spy = jest.spyOn(Timer, 'createTimer').mockImplementation(() => {
            throw new Error('Invalid project ID');
        });

        await expect(TimerController.createTimer(99999, 'Invalid Timer', 'running'))
            .rejects.toThrow('Failed to create timer');

        const logs = readLogs();
        expect(logs).toMatch(/Error creating timer: Invalid project ID/);

        spy.mockRestore();
    });

    test('It should handle database connection failure gracefully', async () => {
        dbUtils.close(); // Simulate database connection failure

        let errorCaught = false;
        try {
            await TimerController.createTimer(99999, 'Database Fail Timer', 'running');
        } catch (error) {
            errorCaught = true;
        }

        expect(errorCaught).toBeTruthy(); // Ensure an error was caught

        const logs = readLogs();
        expect(logs).toMatch(/Error creating timer/);

        dbUtils.connect('taskflow_test_timer.sqlite'); // Restore database connection for further tests
    });

    afterAll(async () => {
        dbUtils.close();
    });
});