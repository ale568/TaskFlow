const TimerController = require('../../renderer/controllers/timerController');
const Timer = require('../../renderer/models/timer');
const Project = require('../../renderer/models/project');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('TimerController - Database Operations', () => {
    beforeAll(async () => {
        Timer.setDatabase('taskflow_test_timer.sqlite'); // Set the dedicated test database
        dbUtils.connect('taskflow_test_timer.sqlite'); // Connect to the test database
    });

    test('It should create and retrieve a timer', async () => {
        const uniqueProjectName = `Timer Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for timer testing');

        const spy = jest.spyOn(Timer, 'createTimer');
        const timerId = await TimerController.createTimer(projectId, 'Test Task', '2024-02-21T10:00:00', 'running');

        expect(spy).toHaveBeenCalledWith(projectId, 'Test Task', '2024-02-21T10:00:00', 'running');
        expect(timerId).toBeDefined();

        const timer = await TimerController.getTimerById(timerId);
        expect(timer).not.toBeNull();
        expect(timer.task).toBe('Test Task');
        expect(timer.status).toBe('running');

        spy.mockRestore();
    });

    test('It should update a timer', async () => {
        const uniqueProjectName = `Timer Update Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for updating timers');

        const timerId = await TimerController.createTimer(projectId, 'Initial Task', '2024-02-21T10:00:00', 'running');

        const spy = jest.spyOn(Timer, 'updateTimer');
        const updated = await TimerController.updateTimer(timerId, { status: 'paused' });

        expect(spy).toHaveBeenCalledWith(timerId, { status: 'paused' });
        expect(updated.success).toBeTruthy();

        const updatedTimer = await TimerController.getTimerById(timerId);
        expect(updatedTimer.status).toBe('paused');

        spy.mockRestore();
    });

    test('It should delete a timer', async () => {
        const uniqueProjectName = `Timer Delete Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for deleting timers');

        const timerId = await TimerController.createTimer(projectId, 'To Delete', '2024-02-21T10:00:00', 'running');

        const spy = jest.spyOn(Timer, 'deleteTimer');
        const deleted = await TimerController.deleteTimer(timerId);

        expect(spy).toHaveBeenCalledWith(timerId);
        expect(deleted).toBeTruthy();

        const deletedTimer = await TimerController.getTimerById(timerId);
        expect(deletedTimer).toBeNull();

        spy.mockRestore();
    });

    test('It should return null for a non-existing timer', async () => {
        const spy = jest.spyOn(Timer, 'getTimerById');
        const timer = await TimerController.getTimerById(99999);

        expect(spy).toHaveBeenCalledWith(99999);
        expect(timer).toBeNull();

        spy.mockRestore();
    });

    test('It should return false when updating a non-existing timer', async () => {
        const spy = jest.spyOn(Timer, 'updateTimer');
        const result = await TimerController.updateTimer(99999, { status: 'stopped' });

        expect(spy).toHaveBeenCalledWith(99999, { status: 'stopped' });
        expect(result.success).toBeFalsy();

        spy.mockRestore();
    });

    test('It should return false when deleting a non-existing timer', async () => {
        const spy = jest.spyOn(Timer, 'deleteTimer');
        const result = await TimerController.deleteTimer(99999);

        expect(spy).toHaveBeenCalledWith(99999);
        expect(result).toBeFalsy();

        spy.mockRestore();
    });

    test('It should retrieve all timers', async () => {
        const uniqueProjectName = `Timer Retrieval Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for retrieving timers');

        await TimerController.createTimer(projectId, 'Task A', '2024-02-21T10:00:00', 'running');
        await TimerController.createTimer(projectId, 'Task B', '2024-02-21T10:05:00', 'paused');

        const spy = jest.spyOn(Timer, 'getAllTimers');
        const timers = await TimerController.getAllTimers();

        expect(spy).toHaveBeenCalled();
        expect(timers.length).toBeGreaterThanOrEqual(2);

        spy.mockRestore();
    });

    test('It should handle errors when creating a timer with an invalid project ID', async () => {
        const spy = jest.spyOn(Timer, 'createTimer').mockImplementation(() => {
            throw new Error('Invalid project ID');
        });

        await expect(TimerController.createTimer(99999, 'Invalid Timer', '2024-02-21T10:00:00', 'running'))
            .rejects.toThrow('Failed to create timer');

        spy.mockRestore();
    });

    test('It should handle database connection failure gracefully', async () => {
        dbUtils.close(); // Simulate database connection failure

        let errorCaught = false;
        try {
            await TimerController.createTimer(99999, 'Database Fail Timer', '2024-02-21T10:00:00', 'running');
        } catch (error) {
            errorCaught = true;
        }

        expect(errorCaught).toBeTruthy(); // Ensure an error was caught

        dbUtils.connect('taskflow_test_timer.sqlite'); // Restore database connection for further tests
    });

    afterAll(async () => {
        dbUtils.close();
    });
});