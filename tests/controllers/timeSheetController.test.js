const TimeSheetController = require('../../renderer/controllers/timeSheetController');
const TimeEntry = require('../../renderer/models/timeEntry');

describe('TimeSheetController', () => {

    let controller;
    let mockEntries;

    beforeEach(() => {
        controller = new TimeSheetController();
        mockEntries = [
            new TimeEntry(1, 'Task1', 'Project1', '2025-02-10', 120),
            new TimeEntry(2, 'Task2', 'Project2', '2025-02-11', 90),
            new TimeEntry(3, 'Task3', 'Project1', '2025-02-11', 50)
        ];
    });

    test('It should add a time entry', () => {
        const newEntry = new TimeEntry(4, 'Task4', 'Project3', '2025-02-13', 40);
        controller.addEntry(newEntry);

        expect(controller.getEntries()).toContainEqual(newEntry);
    });

    test('It should remove a time entry by ID', () => {
        controller.setEntries(mockEntries);
        controller.removeEntry(2);

        expect(controller.getEntries().length).toBe(2);
        expect(controller.getEntries().find(entry => entry.id === 2)).toBeUndefined();
    });

    test('It should return all time entries', () => {
        controller.setEntries(mockEntries);
        expect(controller.getEntries()).toEqual(mockEntries);
    });

    test('It should filter entries by project', () => {
        controller.setEntries(mockEntries);
        const filtered = controller.getEntriesByProject('Project1');

        expect(filtered.length).toBe(2);
        expect(filtered.every(entry => entry.project === 'Project1')).toBeTruthy();
    });

    test('It should calculate total worked hours', () => {
        controller.setEntries(mockEntries);
        expect(controller.getTotalWorkedHours()).toBe(260); // 120 + 90 + 50
    });
});