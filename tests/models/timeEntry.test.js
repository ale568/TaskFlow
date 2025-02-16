const TimeEntry = require('../../renderer/models/timeEntry');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('TimeEntry Model - Database Integration', () => {
    let projectId;

    beforeAll(async () => {
        // Verifica se il progetto esiste già, altrimenti lo crea
        const existingProject = await dbUtils.runQuery(
            "SELECT id FROM projects WHERE name = 'Test Project' LIMIT 1"
        );

        if (existingProject.length > 0) {
            projectId = existingProject[0].id;
        } else {
            const project = await dbUtils.runQuery(
                "INSERT INTO projects (name, description, created_at, updated_at) VALUES ('Test Project', 'A project for testing', '2025-02-16', '2025-02-16') RETURNING id"
            );
            projectId = project.lastInsertRowid;
        }
    });

    test('It should create a new time entry in the database', async () => {
        const entry = await TimeEntry.createTimeEntry(projectId, 'Test Task', '2025-02-16T12:00:00Z');
        expect(entry).toBeInstanceOf(TimeEntry);
        expect(entry.task).toBe('Test Task');
    });

    test('It should throw an error when creating an entry with invalid project ID', async () => {
        await expect(TimeEntry.createTimeEntry(-1, 'Invalid Task', '2025-02-16T12:00:00Z')).rejects.toThrow('Invalid project ID');
    });

    test('It should retrieve a time entry by ID', async () => {
        const entry = await TimeEntry.createTimeEntry(projectId, 'Another Task', '2025-02-16T12:30:00Z');
        const retrievedEntry = await TimeEntry.getTimeEntryById(entry.id);
        expect(retrievedEntry.id).toBe(entry.id);
    });

    test('It should return null for a non-existing entry ID', async () => {
        const entry = await TimeEntry.getTimeEntryById(99999);
        expect(entry).toBeNull();
    });

    test('It should retrieve all time entries', async () => {
        await TimeEntry.createTimeEntry(projectId, 'Task A', '2025-02-16T13:00:00Z');
        await TimeEntry.createTimeEntry(projectId, 'Task B', '2025-02-16T14:00:00Z');

        const entries = await TimeEntry.getAllTimeEntries();
        expect(entries.length).toBeGreaterThanOrEqual(2);
    });

    test('It should update a time entry successfully', async () => {
        const entry = await TimeEntry.createTimeEntry(projectId, 'Update Task', '2025-02-16T15:00:00Z');
        const updated = await TimeEntry.updateTimeEntry(entry.id, { task: 'Updated Task' });

        expect(updated).toBe(true);
        const updatedEntry = await TimeEntry.getTimeEntryById(entry.id);
        expect(updatedEntry.task).toBe('Updated Task');
    });

    test('It should delete a time entry successfully', async () => {
        const entry = await TimeEntry.createTimeEntry(projectId, 'Delete Task', '2025-02-16T16:00:00Z');
        const deleted = await TimeEntry.deleteTimeEntry(entry.id);
        expect(deleted).toBe(true);

        const deletedEntry = await TimeEntry.getTimeEntryById(entry.id);
        expect(deletedEntry).toBeNull();
    });
});
