const TimeEntry = require('../../renderer/models/timeEntry');
const Project = require('../../renderer/models/project');
const Tag = require('../../renderer/models/tag');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('TimeEntry Model - Database Operations', () => {
    beforeAll(async () => {
        TimeEntry.setDatabase('taskflow_test_timeEntry.sqlite'); // Set the dedicated test database
        dbUtils.connect('taskflow_test_timeEntry.sqlite'); // Connect to the test database
        dbUtils.resetDatabase(); // Reset the database before running tests
    });

    beforeEach(async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Prevent race conditions
    });

    test('It should create and retrieve a time entry', async () => {
        // Step 1: Create a project to link the time entry
        const projectId = await Project.createProject('TimeEntry Project', 'Project for time entry testing');

        // Step 2: Create a time entry associated with the project
        const timeEntryId = await TimeEntry.createTimeEntry(projectId, 'Develop feature', '2024-02-21T10:00:00');

        expect(timeEntryId).toBeDefined();
        const timeEntry = await TimeEntry.getTimeEntryById(timeEntryId);
        expect(timeEntry).not.toBeNull();
        expect(timeEntry.task).toBe('Develop feature');
        expect(timeEntry.startTime).toBe('2024-02-21T10:00:00');
    });

    test('It should update a time entry', async () => {
        const projectId = await Project.createProject('TimeEntry Update Project', 'Project for updating time entries');

        const timeEntryId = await TimeEntry.createTimeEntry(projectId, 'Initial Task', '2024-02-21T10:00:00');

        const updated = await TimeEntry.updateTimeEntry(timeEntryId, { endTime: '2024-02-21T12:00:00' });
        expect(updated.success).toBeTruthy();

        const updatedTimeEntry = await TimeEntry.getTimeEntryById(timeEntryId);
        expect(updatedTimeEntry.endTime).toBe('2024-02-21T12:00:00');
    });

    test('It should delete a time entry', async () => {
        const projectId = await Project.createProject('TimeEntry Delete Project', 'Project for deleting time entries');

        const timeEntryId = await TimeEntry.createTimeEntry(projectId, 'To Delete', '2024-02-21T10:00:00');

        const deleted = await TimeEntry.deleteTimeEntry(timeEntryId);
        expect(deleted).toBeTruthy();

        const deletedTimeEntry = await TimeEntry.getTimeEntryById(timeEntryId);
        expect(deletedTimeEntry).toBeNull();
    });

    test('It should return null for a non-existing time entry', async () => {
        const timeEntry = await TimeEntry.getTimeEntryById(99999);
        expect(timeEntry).toBeNull();
    });

    test('It should return false when updating a non-existing time entry', async () => {
        const result = await TimeEntry.updateTimeEntry(99999, { endTime: '2024-02-21T14:00:00' });
        expect(result.success).toBeFalsy();
    });

    test('It should return false when deleting a non-existing time entry', async () => {
        const result = await TimeEntry.deleteTimeEntry(99999);
        expect(result).toBeFalsy();
    });

    test('It should create a time entry with a tag', async () => {
        const projectId = await Project.createProject('TimeEntry With Tag Project', 'Project for tagged time entries');
        const tagId = await Tag.createTag('Urgent', '#FF5733');

        const timeEntryId = await TimeEntry.createTimeEntry(projectId, 'Tagged Task', '2024-02-21T11:00:00', null, tagId);

        expect(timeEntryId).toBeDefined();
        const timeEntry = await TimeEntry.getTimeEntryById(timeEntryId);
        expect(timeEntry.tag_id).toBe(tagId);
    });

    test('It should retrieve all time entries', async () => {
        const projectId = await Project.createProject('TimeEntry Retrieval Project', 'Project for retrieving time entries');

        await TimeEntry.createTimeEntry(projectId, 'Task A', '2024-02-21T10:00:00');
        await TimeEntry.createTimeEntry(projectId, 'Task B', '2024-02-21T11:00:00');

        const timeEntries = await TimeEntry.getAllTimeEntries();
        expect(timeEntries.length).toBeGreaterThanOrEqual(2);
    });

    afterAll(async () => {
        dbUtils.close();
    });
});