const Timer = require('../../renderer/models/timer');

describe('Timer Model - Database Integration', () => {
    let validProjectId = 5;
    let createdTimer;

    beforeAll(async () => {
        createdTimer = await Timer.createTimer(validProjectId, 'Develop Feature');
    });

    test('It should create a new timer in the database', async () => {
        expect(createdTimer).toBeInstanceOf(Timer);
        expect(createdTimer.project_id).toBe(validProjectId);
        expect(createdTimer.status).toBe('running');
    });

    test('It should retrieve a timer by ID', async () => {
        const fetchedTimer = await Timer.getTimerById(createdTimer.id);
        expect(fetchedTimer).toBeInstanceOf(Timer);
        expect(fetchedTimer.id).toBe(createdTimer.id);
        expect(fetchedTimer.task).toBe('Develop Feature');
    });

    test('It should return null for a non-existing timer ID', async () => {
        const nonExistentTimer = await Timer.getTimerById(99999);
        expect(nonExistentTimer).toBeNull();
    });

    test('It should update the status of a timer', async () => {
        const updatedTimer = await Timer.updateTimerStatus(createdTimer.id, 'paused');
        expect(updatedTimer.status).toBe('paused');
    });

    test('It should set endTime when stopping a timer', async () => {
        const stoppedTimer = await Timer.updateTimerStatus(createdTimer.id, 'stopped');
        expect(stoppedTimer.status).toBe('stopped');
        expect(stoppedTimer.endTime).not.toBeNull();
    });

    test('It should throw an error if updating a non-existing timer', async () => {
        await expect(Timer.updateTimerStatus(99999, 'paused')).rejects.toThrow('Failed to update timer');
    });

    test('It should throw an error if status is invalid', async () => {
        await expect(Timer.updateTimerStatus(createdTimer.id, 'invalid')).rejects.toThrow('Invalid status');
    });

    test('It should delete a timer successfully', async () => {
        const deleteSuccess = await Timer.deleteTimer(createdTimer.id);
        expect(deleteSuccess).toBe(true);
    });

    test('It should return false if deleting a non-existing timer', async () => {
        const deleteFail = await Timer.deleteTimer(99999);
        expect(deleteFail).toBe(false);
    });

    test('It should throw an error if timer ID is invalid', async () => {
        await expect(Timer.getTimerById(null)).rejects.toThrow('Invalid timer ID');
        await expect(Timer.getTimerById(-1)).rejects.toThrow('Invalid timer ID');
    });
    
});
