const AlertsController = require('../../renderer/controllers/alertsController');
const Alert = require('../../renderer/models/alert');
const Project = require('../../renderer/models/project');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('AlertsController - Database Operations', () => {
    beforeAll(async () => {
        Alert.setDatabase('taskflow_test_alerts.sqlite'); // Set the dedicated test database
        dbUtils.connect('taskflow_test_alerts.sqlite'); // Connect to the test database
    });

    test('It should create and retrieve an alert', async () => {
        const uniqueProjectName = `Alert Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for alert testing');
    
        const spy = jest.spyOn(Alert, 'createAlert');
        const alertId = await AlertsController.createAlert('Test Alert', projectId, 'Deadline', 'High', '2024-02-21');
    
        expect(spy).toHaveBeenCalledWith('Test Alert', projectId, 'Deadline', 'High', '2024-02-21'); // Rimosso il parametro `0`
        expect(alertId).toBeDefined();
    
        const alert = await AlertsController.getAlertById(alertId);
        expect(alert).not.toBeNull();
        expect(alert.title).toBe('Test Alert');
        expect(alert.priority).toBe('High');
    
        spy.mockRestore();
    });    

    test('It should update an alert', async () => {
        const uniqueProjectName = `Alert Update Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for updating alerts');

        const alertId = await AlertsController.createAlert('Initial Alert', projectId, 'Reminder', 'Medium', '2024-02-21');

        const spy = jest.spyOn(Alert, 'updateAlert');
        const updated = await AlertsController.updateAlert(alertId, { resolved: 1 });

        expect(spy).toHaveBeenCalledWith(alertId, { resolved: 1 });
        expect(updated.success).toBeTruthy();

        const updatedAlert = await AlertsController.getAlertById(alertId);
        expect(updatedAlert.resolved).toBe(1);

        spy.mockRestore();
    });

    test('It should delete an alert', async () => {
        const uniqueProjectName = `Alert Delete Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for deleting alerts');

        const alertId = await AlertsController.createAlert('To Delete', projectId, 'Warning', 'Low', '2024-02-21');

        const spy = jest.spyOn(Alert, 'deleteAlert');
        const deleted = await AlertsController.deleteAlert(alertId);

        expect(spy).toHaveBeenCalledWith(alertId);
        expect(deleted).toBeTruthy();

        const deletedAlert = await AlertsController.getAlertById(alertId);
        expect(deletedAlert).toBeNull();

        spy.mockRestore();
    });

    test('It should return null for a non-existing alert', async () => {
        const spy = jest.spyOn(Alert, 'getAlertById');
        const alert = await AlertsController.getAlertById(99999);

        expect(spy).toHaveBeenCalledWith(99999);
        expect(alert).toBeNull();

        spy.mockRestore();
    });

    test('It should return false when updating a non-existing alert', async () => {
        const spy = jest.spyOn(Alert, 'updateAlert');
        const result = await AlertsController.updateAlert(99999, { resolved: 1 });

        expect(spy).toHaveBeenCalledWith(99999, { resolved: 1 });
        expect(result.success).toBeFalsy();

        spy.mockRestore();
    });

    test('It should return false when deleting a non-existing alert', async () => {
        const spy = jest.spyOn(Alert, 'deleteAlert');
        const result = await AlertsController.deleteAlert(99999);

        expect(spy).toHaveBeenCalledWith(99999);
        expect(result).toBeFalsy();

        spy.mockRestore();
    });

    test('It should retrieve all alerts', async () => {
        const uniqueProjectName = `Alert Retrieval Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for retrieving alerts');

        await AlertsController.createAlert('Alert A', projectId, 'Deadline', 'High', '2024-02-21');
        await AlertsController.createAlert('Alert B', projectId, 'Reminder', 'Medium', '2024-02-22');

        const spy = jest.spyOn(Alert, 'getAllAlerts');
        const alerts = await AlertsController.getAllAlerts();

        expect(spy).toHaveBeenCalled();
        expect(alerts.length).toBeGreaterThanOrEqual(2);

        spy.mockRestore();
    });

    test('It should handle errors when creating an alert with an invalid project ID', async () => {
        const spy = jest.spyOn(Alert, 'createAlert').mockImplementation(() => {
            throw new Error('Invalid project ID');
        });

        await expect(AlertsController.createAlert('Invalid Alert', 99999, 'Error', 'High', '2024-02-21'))
            .rejects.toThrow('Failed to create alert');

        spy.mockRestore();
    });

    test('It should handle database connection failure gracefully', async () => {
        dbUtils.close(); // Simulate database connection failure
    
        let errorCaught = false;
        try {
            await AlertsController.createAlert('Database Fail Alert', 99999, 'Error', 'High', '2024-02-21');
        } catch (error) {
            errorCaught = true;
        }

        expect(errorCaught).toBeTruthy(); // Ensure an error was caught

        dbUtils.connect('taskflow_test_alerts.sqlite'); // Restore database connection for further tests
    });

    afterAll(async () => {
        dbUtils.close();
    });
});