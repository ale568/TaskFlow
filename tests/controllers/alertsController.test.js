const AlertsController = require('../../renderer/controllers/alertsController');
const Alert = require('../../renderer/models/alert');
const Project = require('../../renderer/models/project');
const dbUtils = require('../../renderer/utils/dbUtils');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

const LOG_FILE_PATH = path.resolve(__dirname, '../../logs/controllers.log');

describe('AlertsController - Database Operations', () => {
    beforeAll(async () => {
        Alert.setDatabase('taskflow_test_alerts.sqlite'); 
        dbUtils.connect('taskflow_test_alerts.sqlite');
    });

    test('It should retrieve filtered alerts by priority', async () => {
        const projectId = await Project.createProject(`Project ${Date.now()}`, 'Project for filter test');
        
        await AlertsController.createAlert('Urgent Alert', projectId, 'Deadline', 'High', '2024-03-01');
        await AlertsController.createAlert('Low Priority Alert', projectId, 'Reminder', 'Low', '2024-03-02');
    
        const allAlerts = await AlertsController.getAllAlerts();
    
        const highPriorityAlerts = await AlertsController.getFilteredAlerts({ priority: 'High', project: projectId });
    
        expect(highPriorityAlerts.length).toBe(1);
        expect(highPriorityAlerts[0].priority).toBe('High');
    });     
    
    test('It should retrieve filtered alerts by project', async () => {
        const projectA = await Project.createProject(`Project A ${Date.now()}`, 'Project A for filter test');
        const projectB = await Project.createProject(`Project B ${Date.now()}`, 'Project B for filter test');
    
        await AlertsController.createAlert('Alert for Project A', projectA, 'Deadline', 'Medium', '2024-03-03');
        await AlertsController.createAlert('Alert for Project B', projectB, 'Reminder', 'High', '2024-03-04');
    
        const projectAAlerts = await AlertsController.getFilteredAlerts({ project: projectA });
    
        expect(projectAAlerts.length).toBe(1);
        expect(projectAAlerts[0].project_id).toBe(projectA);
    });    

    test('It should retrieve filtered alerts by type', async () => {
        const projectId = await Project.createProject(`Project ${Date.now()}`, 'Project for type filtering');
    
        await AlertsController.createAlert('Reminder Alert', projectId, 'Reminder', 'Medium', '2024-03-05');
        await AlertsController.createAlert('Deadline Alert', projectId, 'Deadline', 'High', '2024-03-06');
    
        const allAlerts = await AlertsController.getAllAlerts();
    
        const reminders = await AlertsController.getFilteredAlerts({ type: 'Reminder', project: projectId });
    
        expect(reminders.length).toBe(1);
        expect(reminders[0].type.toLowerCase()).toBe('reminder');
    });         

    test('It should retrieve filtered alerts by date range', async () => {
        const projectId = await Project.createProject(`Project ${Date.now()}`, 'Project for date filtering');
    
        await AlertsController.createAlert('Alert 1', projectId, 'Reminder', 'Medium', '2024-03-10');
        await AlertsController.createAlert('Alert 2', projectId, 'Deadline', 'High', '2024-03-15');
        await AlertsController.createAlert('Alert 3', projectId, 'Warning', 'Low', '2024-03-20');
    
        const allAlerts = await AlertsController.getAllAlerts();
    
        const filteredAlerts = await AlertsController.getFilteredAlerts({
            dateRange: { start: '2024-03-10', end: '2024-03-15' },
            project: projectId
        });
    
        expect(filteredAlerts.length).toBe(2);
        expect(filteredAlerts.every(alert => moment(alert.date).isBetween('2024-03-10', '2024-03-15', null, '[]'))).toBeTruthy();
    });     

    test('It should return an empty array when no alerts match the filters', async () => {
        const filteredAlerts = await AlertsController.getFilteredAlerts({ priority: 'Nonexistent' });

        expect(filteredAlerts.length).toBe(0);

        const logs = fs.readFileSync(LOG_FILE_PATH, 'utf8');
        expect(logs).toMatch(/Retrieved 0 alerts after filtering/);
    });

    test('It should fail to create an alert with missing fields', async () => {
        await expect(
            AlertsController.createAlert('', null, '', '', '2024-03-01')
        ).rejects.toThrow('Failed to create alert');

        const logs = fs.readFileSync(LOG_FILE_PATH, 'utf8');
        expect(logs).toMatch(/Error creating alert/);
    });

    test('It should fail to create an alert for a non-existent project', async () => {
        await expect(
            AlertsController.createAlert('Invalid Alert', 99999, 'Reminder', 'High', '2024-03-01')
        ).rejects.toThrow('Failed to create alert');

        const logs = fs.readFileSync(LOG_FILE_PATH, 'utf8');
        expect(logs).toMatch(/Error creating alert/);
    });

    test('It should fail to update an alert with invalid data', async () => {
        const projectId = await Project.createProject(`Update Project ${Date.now()}`, 'Testing updates');
    
        const alertId = await AlertsController.createAlert('Valid Alert', projectId, 'Reminder', 'Medium', '2024-03-02');
    
        await expect(
            AlertsController.updateAlert(alertId, { priority: null }) // Invalid update
        ).rejects.toThrow('Failed to update alert');
    
        const logs = fs.readFileSync(LOG_FILE_PATH, 'utf8');
        expect(logs).toMatch(/Error updating alert/);
    });    

    test('It should return an empty array when filtering with impossible criteria', async () => {
        const alerts = await AlertsController.getFilteredAlerts({ priority: 'Nonexistent' });
        expect(alerts).toEqual([]);

        const logs = fs.readFileSync(LOG_FILE_PATH, 'utf8');
        expect(logs).toMatch(/Retrieved 0 alerts after filtering/);
    });

    test.skip('It should handle database errors gracefully', async () => {
        dbUtils.close(); // Simulate database connection failure
    
        await expect(
            AlertsController.createAlert('Database Fail Alert', 1, 'Error', 'High', '2024-03-01')
        ).rejects.toThrow('Failed to create alert');
    
        await expect(
            AlertsController.getAllAlerts()
        ).rejects.toThrow('Failed to retrieve alerts');
    
        dbUtils.connect('taskflow_test_alerts.sqlite'); // Restore connection
    });
    
    test('It should fail to create an alert with missing title', async () => {
        const projectId = await Project.createProject(`Project ${Date.now()}`, 'Testing alerts');
        
        await expect(
            AlertsController.createAlert('', projectId, 'Deadline', 'High', '2024-03-10')
        ).rejects.toThrow('Failed to create alert');
    });

    test('It should retrieve all alerts without filters', async () => {
        const alerts = await AlertsController.getAllAlerts();
        expect(alerts.length).toBeGreaterThanOrEqual(0);
    });
    
    test('It should return an empty array when filtering with no matching results', async () => {
        const alerts = await AlertsController.getFilteredAlerts({ priority: 'Nonexistent' });
        expect(alerts).toEqual([]);
    });
    
    test('It should fail to update a non-existent alert', async () => {
        await expect(
            AlertsController.updateAlert(99999, { priority: 'Low' })
        ).rejects.toThrow('Failed to update alert');
    });
    
    test('It should fail to delete a non-existent alert', async () => {
        const result = await AlertsController.deleteAlert(99999);
        expect(result).toBe(false);
    });        

    test('It should fail to create an alert without type', async () => {
        const projectId = await Project.createProject(`Project ${Date.now()}`, 'Testing alerts');
    
        await expect(
            AlertsController.createAlert('Test Alert', projectId, '', 'High', '2024-03-10')
        ).rejects.toThrow('Failed to create alert');
    });

    test('It should fail to update an alert with missing fields', async () => {
        const projectId = await Project.createProject(`Project ${Date.now()}`, 'Testing updates');
        const alertId = await AlertsController.createAlert('Test Alert', projectId, 'Deadline', 'High', '2024-03-10');
    
        await expect(
            AlertsController.updateAlert(alertId, {})
        ).rejects.toThrow('Failed to update alert');
    });
    
    test('It should fail to delete an alert when the database is closed', async () => {
        const projectId = await Project.createProject(`Project ${Date.now()}`, 'Testing deletes');
        const alertId = await AlertsController.createAlert('Test Alert', projectId, 'Reminder', 'Medium', '2024-03-15');
    
        dbUtils.close();
    
        await expect(
            AlertsController.deleteAlert(alertId)
        ).rejects.toThrow('Failed to delete alert');
    
        dbUtils.connect('taskflow_test_alerts.sqlite');
    });    
    
    afterAll(async () => {
        dbUtils.close();
    });
});