const TimeEntry = require('../../renderer/models/timeEntry');

describe('TimeEntry Model', () => {
    let timeEntry;

    beforeEach(() => {
        timeEntry = new TimeEntry(1, 'Project1', 'Task1', '2025-02-11 13:15', 60);
    });

    test('It should create a time entry instance with correct properties', () => {
        expect(timeEntry.id).toBe(1);
        expect(timeEntry.project).toBe('Project1');
        expect(timeEntry.task).toBe('Task1');
        expect(timeEntry.startTime).toBe('2025-02-11 13:15');
        expect(timeEntry.duration).toBe(60);
    });

    test('It should update time entry details', () => {
        timeEntry.update({ duration: 90 });
        expect(timeEntry.duration).toBe(90);
        expect(timeEntry.project).toBe('Project1');
    });

    test('It should not modify other fields if not included in update', () => {
        timeEntry.update({ task: 'Updated Task' });
        expect(timeEntry.task).toBe('Updated Task');
        expect(timeEntry.duration).toBe(60);
    });

    test('It should validate time entry correctly', () => {
        expect(timeEntry.isValid()).toBe(true);
        timeEntry.update({ project: null });
        expect(timeEntry.isValid()).toBe(false);
    });

    test('It should return false if project is missing', () => {
        timeEntry.update({ project: null });
        expect(timeEntry.isValid()).toBe(false);
    });

    test('It should return false if task is missing', () => {
        timeEntry.update({ task: '' });
        expect(timeEntry.isValid()).toBe(false);
    });

    test('It should return false if startTime is missing', () => {
        timeEntry.update({ startTime: undefined });
        expect(timeEntry.isValid()).toBe(false);
    });

    test('It should return false if duration is negative', () => {
        timeEntry.update({ duration: -10 });
        expect(timeEntry.isValid()).toBe(false);
    });

    test('It should correctly convert to JSON format', () => {
        const json = timeEntry.toJSON();
        expect(json).toEqual({
            id: 1,
            project: 'Project1',
            task: 'Task1',
            startTime: '2025-02-11 13:15',
            duration: 60
        });
    });

    test('It should handle undefined fields in toJSON()', () => {
        timeEntry.update({ task: undefined });
        expect(timeEntry.toJSON()).toEqual({
            id: 1,
            project: 'Project1',
            task: undefined,
            startTime: '2025-02-11 13:15',
            duration: 60
        });
    });

    test('It should correctly create an instance from DB row', () => {
        const row = { id: 2, project: 'ProjectX', task: 'DB Task', startTime: '2025-02-12 09:30', duration: 45 };
        const newEntry = TimeEntry.createFromDbRow(row);

        expect(newEntry).toBeInstanceOf(TimeEntry);
        expect(newEntry.id).toBe(2);
        expect(newEntry.project).toBe('ProjectX');
        expect(newEntry.task).toBe('DB Task');
        expect(newEntry.startTime).toBe('2025-02-12 09:30');
        expect(newEntry.duration).toBe(45);
    });
});
