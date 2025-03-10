const Alert = require('../../renderer/models/alert');
const Project = require('../../renderer/models/project');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('Alert Model - Database Operations', () => {
    beforeAll(async () => {
        Alert.setDatabase('taskflow_test_alerts.sqlite'); // Set the dedicated test database
        dbUtils.connect('taskflow_test_alerts.sqlite'); // Connect to the test database
    });

    test('It should create and retrieve an alert', async () => {
        const uniqueProjectName = `Alert Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for alert testing');

        const testDate = '2024-02-21';
        
        const alertId = await Alert.createAlert('Test Alert', projectId, 'Warning', 'High', testDate);

        expect(alertId).toBeDefined();
        const alert = await Alert.getAlertById(alertId);
        expect(alert).not.toBeNull();
        expect(alert.title).toBe('Test Alert');
        expect(alert.priority).toBe('High');
        expect(alert.date).toBe(testDate); // Il Model non modifica la data
    });

    test('It should update an alert', async () => {
        const uniqueProjectName = `Alert Update Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for updating alerts');

        const alertId = await Alert.createAlert('Initial Alert', projectId, 'Info', 'Medium', '2024-02-21');

        const updated = await Alert.updateAlert(alertId, { resolved: 1 });

        expect(updated).toBeTruthy();

        const updatedAlert = await Alert.getAlertById(alertId);
        expect(updatedAlert.resolved).toBe(1);
    });

    test('It should delete an alert', async () => {
        const uniqueProjectName = `Alert Delete Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for deleting alerts');

        const alertId = await Alert.createAlert('To Delete', projectId, 'Critical', 'Low', '2024-02-21');

        const deleted = await Alert.deleteAlert(alertId);
        expect(deleted).toBeTruthy();

        const deletedAlert = await Alert.getAlertById(alertId);
        expect(deletedAlert).toBeNull();
    });

    test('It should return null for a non-existing alert', async () => {
        const alert = await Alert.getAlertById(99999);
        expect(alert).toBeNull();
    });

    test('It should return false when updating a non-existing alert', async () => {
        const result = await Alert.updateAlert(99999, { resolved: 1 });
        expect(result.success).toBeFalsy();
    });

    test('It should return false when deleting a non-existing alert', async () => {
        const result = await Alert.deleteAlert(99999);
        expect(result).toBeFalsy();
    });

    test('It should retrieve all alerts', async () => {
        const uniqueProjectName = `Alert Retrieval Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for retrieving alerts');

        await Alert.createAlert('Alert A', projectId, 'Reminder', 'High', '2024-02-21');
        await Alert.createAlert('Alert B', projectId, 'Deadline', 'Medium', '2024-02-21');

        const alerts = await Alert.getAllAlerts();
        expect(alerts.length).toBeGreaterThanOrEqual(2);
    });

    afterAll(async () => {
        dbUtils.close();
    });
});