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
        timeEntry.update({ duration: 90});
        expect(timeEntry.duration).toBe(90);
        expect(timeEntry.project).toBe('Project1');
    }),

    test('it should not modify other fields if not included in update', () => {
        timeEntry.update({ task: 'Updated Task'});
        expect(timeEntry.task).toBe('Updated Task');
        expect(timeEntry.duration).toBe(60);
    });
});