const TimeSheetController = require('../../renderer/controllers/timeSheetController');
const TimeEntry = require('../../renderer/models/timeEntry');

describe('TimeSheetController', () => {
    let controller;

    beforeEach(async () => {
        controller = new TimeSheetController();
        await controller.setEntries([]); // Clear the database before each tests
    });

    test('It should add a time entry', async () => {
        const newEntry = new TimeEntry(null, 'Project3', 'Task4', '2025-02-13', 40);
        const addedEntry = await controller.addEntry(newEntry);

        const entries = await controller.getEntries();
        expect(entries).toContainEqual(expect.objectContaining({
            project: 'Project3',
            task: 'Task4',
            startTime: '2025-02-13',
            duration: 40
        }));
    });

    test('It should remove a time entry by ID', async () => {
        const entry1 = await controller.addEntry(new TimeEntry(null, 'Project1', 'Task1', '2025-02-10', 120));
        const entry2 = await controller.addEntry(new TimeEntry(null, 'Project2', 'Task2', '2025-02-11', 90));
        
        await controller.removeEntry(entry1.id);

        const entries = await controller.getEntries();
        expect(entries.length).toBe(1);
        expect(entries.find(entry => entry.id === entry1.id)).toBeUndefined();
    });

    test('It should return all time entries', async () => {
        const entry1 = await controller.addEntry(new TimeEntry(null, 'Project1', 'Task1', '2025-02-10', 120));
        const entry2 = await controller.addEntry(new TimeEntry(null, 'Project2', 'Task2', '2025-02-11', 90));
        
        const entries = await controller.getEntries();
        expect(entries.length).toBe(2);
        expect(entries).toEqual(expect.arrayContaining([
            expect.objectContaining({ project: 'Project1', task: 'Task1', duration: 120 }),
            expect.objectContaining({ project: 'Project2', task: 'Task2', duration: 90 })
        ]));
    });

    test('It should filter entries by project', async () => {
        await controller.addEntry(new TimeEntry(null, 'Project1', 'Task1', '2025-02-10', 120));
        await controller.addEntry(new TimeEntry(null, 'Project2', 'Task2', '2025-02-11', 90));
        await controller.addEntry(new TimeEntry(null, 'Project1', 'Task3', '2025-02-11', 50));

        const filtered = await controller.getEntriesByProject('Project1');

        expect(filtered.length).toBe(2);
        expect(filtered.every(entry => entry.project === 'Project1')).toBeTruthy();
    });

    test('It should calculate total worked hours', async () => {
        await controller.addEntry(new TimeEntry(null, 'Project1', 'Task1', '2025-02-10', 120));
        await controller.addEntry(new TimeEntry(null, 'Project2', 'Task2', '2025-02-11', 90));
        await controller.addEntry(new TimeEntry(null, 'Project1', 'Task3', '2025-02-11', 50));

        const totalHours = await controller.getTotalWorkedHours();
        expect(totalHours).toBe(260);
    });
});
