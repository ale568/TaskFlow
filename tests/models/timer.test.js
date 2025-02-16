const Timer = require('../../renderer/models/timer');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('Timer Model - Database Integration', () => {
    beforeAll(async () => {
        await dbUtils.runQuery('DELETE FROM timers'); // Pulizia della tabella
    });

    test('It should create a new timer in the database', async () => {
        const timer = await Timer.createTimer(1, 'Develop Feature');
        expect(timer).toBeInstanceOf(Timer);
        expect(timer.project_id).toBe(1);
        expect(timer.task).toBe('Develop Feature');
        expect(timer.status).toBe('running');
    });

    test('It should retrieve a timer by ID', async () => {
        const timer = await Timer.createTimer(2, 'Testing Task');
        const fetchedTimer = await Timer.getTimerById(timer.id);
        expect(fetchedTimer).toBeInstanceOf(Timer);
        expect(fetchedTimer.task).toBe('Testing Task');
    });

    test('It should return null for a non-existing timer ID', async () => {
        const timer = await Timer.getTimerById(99999);
        expect(timer).toBeNull();
    });

    test('It should load all timers from the database', async () => {
        await Timer.createTimer(3, 'Bug Fix');
        const timers = await Timer.loadAllTimers();
        expect(Array.isArray(timers)).toBe(true);
        expect(timers.length).toBeGreaterThanOrEqual(1);
    });

    test('It should return an empty array if no timers exist', async () => {
        await dbUtils.runQuery('DELETE FROM timers');
        const timers = await Timer.loadAllTimers();
        expect(timers).toEqual([]);
    });

    test('It should update the status of a timer', async () => {
        const timer = await Timer.createTimer(4, 'UI Review');
        const updatedTimer = await Timer.updateTimer(timer.id, 'paused');
        expect(updatedTimer.status).toBe('paused');
    });

    test('It should set endTime when stopping a timer', async () => {
        const timer = await Timer.createTimer(5, 'Finalizing Task');
        const endTime = new Date().toISOString();
        const updatedTimer = await Timer.updateTimer(timer.id, 'stopped', endTime);
        expect(updatedTimer.status).toBe('stopped');
        expect(updatedTimer.endTime).toBe(endTime);
    });

    test('It should throw an error if updating a non-existing timer', async () => {
        await expect(Timer.updateTimer(99999, 'paused')).rejects.toThrow('Timer not found');
    });

    test('It should delete a timer successfully', async () => {
        const timer = await Timer.createTimer(6, 'Cleanup Task');
        const deleted = await Timer.deleteTimer(timer.id);
        expect(deleted).toBe(true);
    });

    test('It should return false if deleting a non-existing timer', async () => {
        const deleted = await Timer.deleteTimer(99999);
        expect(deleted).toBe(false);
    });

    test('It should throw an error if timer ID is invalid', async () => {
        await expect(Timer.getTimerById(null)).rejects.toThrow('Invalid timer ID');
    });

    test('It should throw an error if timer ID is negative', async () => {
        await expect(Timer.getTimerById(-5)).rejects.toThrow('Invalid timer ID');
    });

    test('It should throw an error if status is invalid', async () => {
        const timer = await Timer.createTimer(7, 'Invalid Status Test');
        await expect(Timer.updateTimer(timer.id, 'unknown')).rejects.toThrow('Invalid status value');
    });
});
