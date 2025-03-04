const storageUtils = require('../../renderer/utils/storageUtils');
const dbUtils = require('../../renderer/utils/dbUtils');
const timerUtils = require('../../renderer/utils/timerUtils');
const dateTimeFormatUtils = require('../../renderer/utils/dateTimeFormatUtils');

const fs = require('fs');
const path = require('path');

// Use the shared test database for storageUtils
const TEST_DB_PATH = path.resolve(__dirname, '../../data/taskflow_test_utils.sqlite');
const LOG_FILE_DB = path.resolve(__dirname, '../../logs/db.log');
const LOG_FILE_ERRORS = path.resolve(__dirname, '../../logs/errors.log');

describe('StorageUtils - Database Operations', () => {

    beforeAll(async () => {
        dbUtils.connect(TEST_DB_PATH);
    });
    

    // Generic tests for CRUD operations

    test('It should update an existing project', async () => {
        const uniqueProjectName = `Test Project ${Date.now()}`;
        const projectId = await storageUtils.createRecord('projects', { name: uniqueProjectName });
    
        const updated = await storageUtils.updateRecord('projects', projectId, { name: `Updated ${uniqueProjectName}` });
    
        expect(updated).toEqual({ success: true });
    });    

    test('It should delete a project', async () => {
        const uniqueProjectName = `To Delete ${Date.now()}`;
        const projectId = await storageUtils.createRecord('projects', { name: uniqueProjectName });
    
        const deleted = await storageUtils.deleteRecord('projects', projectId);
        expect(deleted).toBe(true);
    
        const project = await storageUtils.getRecordById('projects', projectId);
        expect(project).toBeNull();
    });

    test('It should retrieve all records from a table', async () => {
        const projectA = `Project A ${Date.now()}`;
        const projectB = `Project B ${Date.now()}`;
    
        await storageUtils.createRecord('projects', { name: projectA });
        await storageUtils.createRecord('projects', { name: projectB });
    
        const projects = await storageUtils.getAllRecords('projects');
        expect(projects.length).toBeGreaterThanOrEqual(2);
    });

    /*** Edge cases ***/

    test('It should fail to create a record with missing required fields', async () => {
        await expect(storageUtils.createRecord('projects', { description: 'Missing name' }))
            .rejects.toThrow('Missing required field: name');

        await new Promise(resolve => setTimeout(resolve, 50));

        const logs = fs.readFileSync(LOG_FILE_ERRORS, 'utf8');
        expect(logs).toMatch(/Database Error: near|Database error inserting into projects/);
    });

    test('It should return null for a non-existing record', async () => {
        const record = await storageUtils.getRecordById('projects', 99999);
        expect(record).toBeNull();
    });

    test('It should fail to update a record with invalid fields', async () => {
        const uniqueProjectName = `Valid Project ${Date.now()}`;
        const projectId = await storageUtils.createRecord('projects', { name: uniqueProjectName });
    
        const result = await storageUtils.updateRecord('projects', projectId, { non_existent_field: 'value' });
    
        expect(result).toEqual({ success: false });
    }); 

    test('It should return false when updating a non-existing record', async () => {
        const result = await storageUtils.updateRecord('projects', 99999, { name: 'New Name' });
        
        expect(result).toEqual({ success: false });
    });    

    test('It should fail to delete a record with an invalid ID', async () => {
        await expect(storageUtils.deleteRecord('projects', 'invalid-id')).rejects.toThrow();
    });

    test('It should return false when deleting a non-existing record', async () => {
        const result = await storageUtils.deleteRecord('projects', 99999);
        expect(result).toBe(false);
    });

    test('It should return an error object when executing an invalid SQL query', async () => {
        const result = await dbUtils.runQuery('INVALID SQL QUERY');
        expect(result.success).toBe(false);
        expect(result).toHaveProperty('error');
    });  

    test('It should correctly handle the full CRUD cycle for a project', async () => {
        const uniqueProjectName = `CRUD Project ${Date.now()}`;
    
        // CREATE
        const projectId = await storageUtils.createRecord('projects', { name: uniqueProjectName, description: 'A test project' });
        expect(projectId).toBeDefined();
    
        // READ
        let project = await storageUtils.getRecordById('projects', projectId);
        expect(project).not.toBeNull();
        expect(project.name).toBe(uniqueProjectName);
    
        // UPDATE
        const updatedName = `Updated ${uniqueProjectName}`;
        const updated = await storageUtils.updateRecord('projects', projectId, { name: updatedName });
        expect(updated).toEqual({ success: true });
    
        // READ Again
        project = await storageUtils.getRecordById('projects', projectId);
        expect(project.name).toBe(updatedName);
    
        // DELETE
        const deleted = await storageUtils.deleteRecord('projects', projectId);
        expect(deleted).toBe(true);
    
        // Ensure deletion
        project = await storageUtils.getRecordById('projects', projectId);
        expect(project).toBeNull();
    });

    test('It should correctly handle the full CRUD cycle for a timer', async () => {
        const startTime = timerUtils.getCurrentTimestamp();
        const taskName = `Test Task ${Date.now()}`;
        const timerId = await storageUtils.createRecord('timers', { project_id: 1, task: taskName, startTime, status: 'running' });
    
        expect(timerId).toBeDefined();
    
        let timer = await storageUtils.getRecordById('timers', timerId);
        expect(timer).not.toBeNull();
        expect(timer.status).toBe('running');
    
        const updated = await storageUtils.updateRecord('timers', timerId, { status: 'paused' });
        expect(updated).toEqual({ success: true });
    
        timer = await storageUtils.getRecordById('timers', timerId);
        expect(timer.status).toBe('paused');
    
        const deleted = await storageUtils.deleteRecord('timers', timerId);
        expect(deleted).toBe(true);
    
        timer = await storageUtils.getRecordById('timers', timerId);
        expect(timer).toBeNull();
    });
    
    test('It should correctly handle the full CRUD cycle for a tag', async () => {
        const uniqueTagName = `Urgent ${Date.now()}`;
        const tagId = await storageUtils.createRecord('tags', { name: uniqueTagName, color: '#FF0000' });
    
        expect(tagId).toBeDefined();
    
        let tag = await storageUtils.getRecordById('tags', tagId);
        expect(tag).not.toBeNull();
        expect(tag.name).toBe(uniqueTagName);
    
        const updated = await storageUtils.updateRecord('tags', tagId, { name: `Important ${Date.now()}` });
        expect(updated).toEqual({ success: true });
    
        tag = await storageUtils.getRecordById('tags', tagId);
        expect(tag.name).toMatch(/^Important/);
    
        const deleted = await storageUtils.deleteRecord('tags', tagId);
        expect(deleted).toBe(true);
    
        tag = await storageUtils.getRecordById('tags', tagId);
        expect(tag).toBeNull();
    });
    
    test('It should correctly handle the full CRUD cycle for a time entry', async () => {
        const startTime = timerUtils.getCurrentTimestamp();
        const taskName = `Development ${Date.now()}`;
        const timeEntryId = await storageUtils.createRecord('time_entries', { project_id: 1, task: taskName, startTime });
    
        expect(timeEntryId).toBeDefined();
    
        let timeEntry = await storageUtils.getRecordById('time_entries', timeEntryId);
        expect(timeEntry).not.toBeNull();
        expect(timeEntry.task).toBe(taskName);
    
        const updated = await storageUtils.updateRecord('time_entries', timeEntryId, { task: `Testing ${Date.now()}` });
        expect(updated).toEqual({ success: true });
    
        timeEntry = await storageUtils.getRecordById('time_entries', timeEntryId);
        expect(timeEntry.task).toMatch(/^Testing/);
    
        const deleted = await storageUtils.deleteRecord('time_entries', timeEntryId);
        expect(deleted).toBe(true);
    
        timeEntry = await storageUtils.getRecordById('time_entries', timeEntryId);
        expect(timeEntry).toBeNull();
    });

    test('It should correctly handle the full CRUD cycle for a report', async () => {
        const startDate = dateTimeFormatUtils.getCurrentDate();
        const endDate = dateTimeFormatUtils.addTime(startDate, 7, 'days');
        const totalHours = Math.floor(Math.random() * 10) + 1;
    
        const reportId = await storageUtils.createRecord('reports', { project_id: 1, total_hours: totalHours, startDate, endDate });
        expect(reportId).toBeDefined();
    
        let report = await storageUtils.getRecordById('reports', reportId);
        expect(report).not.toBeNull();
        expect(report.total_hours).toBe(totalHours);
    
        const updatedHours = totalHours + 2;
        const updated = await storageUtils.updateRecord('reports', reportId, { total_hours: updatedHours });
        expect(updated).toEqual({ success: true });
    
        report = await storageUtils.getRecordById('reports', reportId);
        expect(report.total_hours).toBe(updatedHours);
    
        const deleted = await storageUtils.deleteRecord('reports', reportId);
        expect(deleted).toBe(true);
    
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
        const uniqueProjectName = `Project Test ${Date.now()}`;
        const projectId = await storageUtils.createRecord('projects', { name: uniqueProjectName });
    
        const result = await storageUtils.updateRecord('projects', projectId, {});
        expect(result).toEqual({ success: false });
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
    
    test('It should log database operations', async () => {
        const uniqueProjectName = `Log Test Project ${Date.now()}`;
        const projectId = await storageUtils.createRecord('projects', { name: uniqueProjectName });
    
        const logs = fs.readFileSync(LOG_FILE_DB, 'utf8');
        expect(logs).toMatch(/Record created in projects/);
    });

    test('It should log database errors', async () => {
        await expect(storageUtils.createRecord('projects', { name: 123 }))
            .rejects.toThrow('Invalid value for field "name": must be a non-empty string');

        await new Promise(resolve => setTimeout(resolve, 50));

        const logs = fs.readFileSync(LOG_FILE_ERRORS, 'utf8');
        expect(logs).toMatch(/Database Error: near|Database error:/);
    });

    afterAll(async () => {
        dbUtils.close();
    });

});