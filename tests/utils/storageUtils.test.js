const storageUtils = require('../../renderer/utils/storageUtils');
const dbUtils = require('../../renderer/utils/dbUtils');
const path = require('path');

// Use the shared test database for storageUtils
const TEST_DB_PATH = path.resolve(__dirname, '../../data/taskflow_test_utils.sqlite');

describe('StorageUtils - Database Operations', () => {

    beforeAll(async () => {
        dbUtils.connect(TEST_DB_PATH);
        dbUtils.resetDatabase(); // Reset entire database instead of clearing individual tables
        console.info('✅ Database reset before running tests.');
    });
    

    /*** ✅ Generic tests for CRUD operations in `storageUtils.js` ***/

    test('It should create and retrieve a project', async () => {
        const projectId = await storageUtils.createRecord('projects', { name: 'Test Project', description: 'A sample project' });

        expect(projectId).toBeDefined();
        const project = await storageUtils.getRecordById('projects', projectId);
        expect(project.name).toBe('Test Project');
    });

    test('It should update an existing project', async () => {
        const projectId = await storageUtils.createRecord('projects', { name: 'Old Project' });

        const updated = await storageUtils.updateRecord('projects', projectId, { name: 'Updated Project' });
        expect(updated.success).toBeTruthy();

        const project = await storageUtils.getRecordById('projects', projectId);
        expect(project.name).toBe('Updated Project');
    });

    test('It should delete a project', async () => {
        const projectId = await storageUtils.createRecord('projects', { name: 'To Delete' });

        const deleted = await storageUtils.deleteRecord('projects', projectId);
        expect(deleted).toBeTruthy();

        const project = await storageUtils.getRecordById('projects', projectId);
        expect(project).toBeNull();
    });

    test('It should retrieve all records from a table', async () => {
        await storageUtils.createRecord('projects', { name: 'Project A' });
        await storageUtils.createRecord('projects', { name: 'Project B' });

        const projects = await storageUtils.getAllRecords('projects');
        expect(projects.length).toBeGreaterThanOrEqual(2);
    });

    /*** Edge cases ***/

    test('It should fail to create a record with missing required fields', async () => {
        await expect(storageUtils.createRecord('projects', { description: 'Missing name' }))
            .rejects.toThrow('Missing required field: name');
    });

    test('It should return null for a non-existing record', async () => {
        const record = await storageUtils.getRecordById('projects', 99999);
        expect(record).toBeNull();
    });

    test('It should fail to update a record with invalid fields', async () => {
        const projectId = await storageUtils.createRecord('projects', { name: 'Valid Project' });
    
        await expect(storageUtils.updateRecord('projects', projectId, { name: 'Valid Project', non_existent_field: 'value' }))
            .rejects.toThrow(/Invalid field: non_existent_field does not exist in projects/i);
    });    

    test('It should return false when updating a non-existing record', async () => {
        const result = await storageUtils.updateRecord('projects', 99999, { name: 'New Name' });
        expect(result.success).toBeFalsy();
    });

    test('It should fail to delete a record with an invalid ID', async () => {
        await expect(storageUtils.deleteRecord('projects', 'invalid-id')).rejects.toThrow();
    });

    test('It should return false when deleting a non-existing record', async () => {
        const result = await storageUtils.deleteRecord('projects', 99999);
        expect(result).toBeFalsy();
    });

    test('It should return an error object when executing an invalid SQL query', async () => {
        const result = await dbUtils.runQuery('INVALID SQL QUERY');
        expect(result.success).toBe(false);
        expect(result).toHaveProperty('error');
    });    

    test('It should correctly handle the full CRUD cycle for a project', async () => {
        // Step 1: CREATE a new project
        const projectId = await storageUtils.createRecord('projects', { name: 'CRUD Project', description: 'A test project' });
        expect(projectId).toBeDefined();
    
        // Step 2: READ the newly created project
        let project = await storageUtils.getRecordById('projects', projectId);
        expect(project).not.toBeNull();
        expect(project.name).toBe('CRUD Project');
    
        // Step 3: UPDATE the project
        const updated = await storageUtils.updateRecord('projects', projectId, { name: 'Updated CRUD Project' });
        expect(updated.success).toBeTruthy();
    
        // Step 4: READ again to verify update
        project = await storageUtils.getRecordById('projects', projectId);
        expect(project.name).toBe('Updated CRUD Project');
    
        // Step 5: DELETE the project
        const deleted = await storageUtils.deleteRecord('projects', projectId);
        expect(deleted).toBeTruthy();
    
        // Step 6: READ again to ensure deletion
        project = await storageUtils.getRecordById('projects', projectId);
        expect(project).toBeNull();
    });

    test('It should correctly handle the full CRUD cycle for a timer', async () => {
        // Step 1: CREATE
        const timerId = await storageUtils.createRecord('timers', { project_id: 1, task: 'Test Task', startTime: '2024-02-21T10:00:00', status: 'running' });
        expect(timerId).toBeDefined();
    
        // Step 2: READ
        let timer = await storageUtils.getRecordById('timers', timerId);
        expect(timer).not.toBeNull();
        expect(timer.status).toBe('running');
    
        // Step 3: UPDATE
        const updated = await storageUtils.updateRecord('timers', timerId, { status: 'paused' });
        expect(updated.success).toBeTruthy();
    
        // Step 4: READ again
        timer = await storageUtils.getRecordById('timers', timerId);
        expect(timer.status).toBe('paused');
    
        // Step 5: DELETE
        const deleted = await storageUtils.deleteRecord('timers', timerId);
        expect(deleted).toBeTruthy();
    
        // Step 6: Ensure deletion
        timer = await storageUtils.getRecordById('timers', timerId);
        expect(timer).toBeNull();
    });
    
    test('It should correctly handle the full CRUD cycle for a tag', async () => {
        // Step 1: CREATE
        const tagId = await storageUtils.createRecord('tags', { name: 'Urgent', color: '#FF0000' });
        expect(tagId).toBeDefined();
    
        // Step 2: READ
        let tag = await storageUtils.getRecordById('tags', tagId);
        expect(tag).not.toBeNull();
        expect(tag.name).toBe('Urgent');
    
        // Step 3: UPDATE
        const updated = await storageUtils.updateRecord('tags', tagId, { name: 'Important' });
        expect(updated.success).toBeTruthy();
    
        // Step 4: READ again
        tag = await storageUtils.getRecordById('tags', tagId);
        expect(tag.name).toBe('Important');
    
        // Step 5: DELETE
        const deleted = await storageUtils.deleteRecord('tags', tagId);
        expect(deleted).toBeTruthy();
    
        // Step 6: Ensure deletion
        tag = await storageUtils.getRecordById('tags', tagId);
        expect(tag).toBeNull();
    });
    
    test('It should correctly handle the full CRUD cycle for a time entry', async () => {
        // Step 1: CREATE
        const timeEntryId = await storageUtils.createRecord('time_entries', { project_id: 1, task: 'Development', startTime: '2024-02-21T10:00:00' });
        expect(timeEntryId).toBeDefined();
    
        // Step 2: READ
        let timeEntry = await storageUtils.getRecordById('time_entries', timeEntryId);
        expect(timeEntry).not.toBeNull();
        expect(timeEntry.task).toBe('Development');
    
        // Step 3: UPDATE
        const updated = await storageUtils.updateRecord('time_entries', timeEntryId, { task: 'Testing' });
        expect(updated.success).toBeTruthy();
    
        // Step 4: READ again
        timeEntry = await storageUtils.getRecordById('time_entries', timeEntryId);
        expect(timeEntry.task).toBe('Testing');
    
        // Step 5: DELETE
        const deleted = await storageUtils.deleteRecord('time_entries', timeEntryId);
        expect(deleted).toBeTruthy();
    
        // Step 6: Ensure deletion
        timeEntry = await storageUtils.getRecordById('time_entries', timeEntryId);
        expect(timeEntry).toBeNull();
    });
    
    test('It should correctly handle the full CRUD cycle for a report', async () => {
        // Step 1: CREATE
        const reportId = await storageUtils.createRecord('reports', { project_id: 1, total_hours: 8, startDate: '2024-02-20', endDate: '2024-02-21' });
        expect(reportId).toBeDefined();
    
        // Step 2: READ
        let report = await storageUtils.getRecordById('reports', reportId);
        expect(report).not.toBeNull();
        expect(report.total_hours).toBe(8);
    
        // Step 3: UPDATE
        const updated = await storageUtils.updateRecord('reports', reportId, { total_hours: 10 });
        expect(updated.success).toBeTruthy();
    
        // Step 4: READ again
        report = await storageUtils.getRecordById('reports', reportId);
        expect(report.total_hours).toBe(10);
    
        // Step 5: DELETE
        const deleted = await storageUtils.deleteRecord('reports', reportId);
        expect(deleted).toBeTruthy();
    
        // Step 6: Ensure deletion
        report = await storageUtils.getRecordById('reports', reportId);
        expect(report).toBeNull();
    });    

    test('It should fail validation when a required field is missing', async () => {
        await expect(storageUtils.createRecord('projects', { description: 'No name' }))
            .rejects.toThrow('Missing required field: name');
    });
    
    test('It should fail validation when a field has an invalid type', async () => {
        await expect(storageUtils.createRecord('projects', { name: 123, description: 'Invalid type' }))
            .rejects.toThrow('Invalid value for field "name": must be a non-empty string');
    });

    test('It should return an error when trying to insert into an invalid table', async () => {
        await expect(storageUtils.createRecord('non_existing_table', { name: 'Test' }))
            .rejects.toThrow('Unknown table: non_existing_table');
    });

    test('It should return false when trying to update a non-existing project', async () => {
        const result = await storageUtils.updateRecord('projects', 99999, { name: 'Updated Name' });
        expect(result.success).toBeFalsy();
    });

    test('It should return false when trying to delete a non-existing project', async () => {
        const result = await storageUtils.deleteRecord('projects', 99999);
        expect(result).toBeFalsy();
    });
    
    test('It should fail validation when a required field is an empty string', async () => {
        await expect(storageUtils.createRecord('projects', { name: '', description: 'Empty name' }))
            .rejects.toThrow('Invalid value for field "name": must be a non-empty string');
    });

    test('It should fail to delete a record with a NULL ID', async () => {
        await expect(storageUtils.deleteRecord('projects', null))
            .rejects.toThrow('Invalid ID: must be a positive number');
    });

    test('It should fail to delete a record with an undefined ID', async () => {
        await expect(storageUtils.deleteRecord('projects', undefined))
            .rejects.toThrow('Invalid ID: must be a positive number');
    });
    
    test('It should handle multiple connections to the same database safely', async () => {     // Tets for increase dbUtils coverage
        dbUtils.connect(TEST_DB_PATH);
        expect(() => dbUtils.connect(TEST_DB_PATH)).not.toThrow();
    });
    
    test('It should return an error when connecting to a non-existent database', async () => {
        await expect(() => dbUtils.connect('/invalid/path/to/db.sqlite'))
            .toThrow();
    });
    
    test('It should close and reconnect the database successfully', async () => {
        dbUtils.close();
        expect(() => dbUtils.connect(TEST_DB_PATH)).not.toThrow();
    });
    
    test('It should return an error object when executing an invalid SQL query via storageUtils', async () => {
        const result = await dbUtils.runQuery('INVALID SQL QUERY');
        expect(result.success).toBe(false);
        expect(result).toHaveProperty('error');
    });

    test('It should fail validation when an invalid field is provided', async () => {
        await expect(storageUtils.createRecord('projects', { invalidField: 'Test' }))
            .rejects.toThrow('Missing required field: name');
    });
    
    test('It should return an error when trying to insert into a non-existing table', async () => {
        await expect(storageUtils.createRecord('non_existing_table', { name: 'Test' }))
            .rejects.toThrow('Unknown table: non_existing_table');
    });

    test('It should fail to update a record with missing required fields', async () => {
        const projectId = await storageUtils.createRecord('projects', { name: 'Project Test' });
    
        await expect(storageUtils.updateRecord('projects', projectId, {}))
            .rejects.toThrow('No fields provided to update in table: projects');
    });

    test('It should fail to delete a record with an undefined ID', async () => {
        await expect(storageUtils.deleteRecord('projects', undefined))
            .rejects.toThrow('Invalid ID: must be a positive number');
    });

    test('It should not throw when closing an already closed database', () => {
        dbUtils.close();
        expect(() => dbUtils.close()).not.toThrow();
    });

    test('It should fail to delete a record with a null ID', async () => {
        await expect(storageUtils.deleteRecord('projects', null))
            .rejects.toThrow('Invalid ID: must be a positive number');
    });
    
    test('It should return a database error when running an invalid query', async () => {
        const result = await dbUtils.runQuery('INVALID SQL');
        expect(result.success).toBe(false);
        expect(result).toHaveProperty('error');
    });    

    afterAll(async () => {
        dbUtils.close();
    });

});