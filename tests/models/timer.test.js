const Timer = require('../../renderer/models/timer');
const Project = require('../../renderer/models/project');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('Timer Model - Database Operations', () => {
    beforeAll(async () => {
        Timer.setDatabase('taskflow_test_timer.sqlite'); // Set the dedicated test database
        dbUtils.connect('taskflow_test_timer.sqlite'); // Connect to the test database
        dbUtils.resetDatabase(); // Reset the database before running tests
    });

    test('It should create and retrieve a timer', async () => {
        // Step 1: Create a project to link the timer
        const projectId = await Project.createProject('Timer Project', 'Project for timer testing');
    
        // Step 2: Create a timer associated with the project
        const timerId = await Timer.createTimer(projectId, 'Test Task', '2024-02-21T10:00:00', 'running');
    
        expect(timerId).toBeDefined();
        const timer = await Timer.getTimerById(timerId);
        expect(timer).not.toBeNull();
        expect(timer.task).toBe('Test Task');
        expect(timer.status).toBe('running');
    });    

    test('It should update a timer', async () => {
        const projectId = await Project.createProject('Timer Update Project', 'Project for updating timers');
    
        const timerId = await Timer.createTimer(projectId, 'Initial Task', '2024-02-21T10:00:00', 'running');
    
        const updated = await Timer.updateTimer(timerId, { status: 'paused' });
        expect(updated.success).toBeTruthy();
    
        const updatedTimer = await Timer.getTimerById(timerId);
        expect(updatedTimer.status).toBe('paused');
    });

    test('It should delete a timer', async () => {
        const projectId = await Project.createProject('Timer Delete Project', 'Project for deleting timers');
    
        const timerId = await Timer.createTimer(projectId, 'To Delete', '2024-02-21T10:00:00', 'running');
    
        const deleted = await Timer.deleteTimer(timerId);
        expect(deleted).toBeTruthy();
    
        const deletedTimer = await Timer.getTimerById(timerId);
        expect(deletedTimer).toBeNull();
    });

    test('It should return null for a non-existing timer', async () => {
        const timer = await Timer.getTimerById(99999);
        expect(timer).toBeNull();
    });

    test('It should return false when updating a non-existing timer', async () => {
        const result = await Timer.updateTimer(99999, { status: 'stopped' });
        expect(result.success).toBeFalsy();
    });

    test('It should return false when deleting a non-existing timer', async () => {
        const result = await Timer.deleteTimer(99999);
        expect(result).toBeFalsy();
    });

    test('It should retrieve all timers', async () => {
        const projectId = await Project.createProject('Timer Retrieval Project', 'Project for retrieving timers');
    
        await Timer.createTimer(projectId, 'Task A', '2024-02-21T10:00:00', 'running');
        await Timer.createTimer(projectId, 'Task B', '2024-02-21T10:05:00', 'paused');
    
        const timers = await Timer.getAllTimers();
        expect(timers.length).toBeGreaterThanOrEqual(2);
    });

    afterAll(async () => {
        dbUtils.close();
    });
});