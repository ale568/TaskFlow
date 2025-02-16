const Alert = require('../../renderer/models/alert');

describe('Alert Model - Database Integration', () => {
    test('It should create a new alert in the database', async () => {
        const alert = await Alert.createAlert('Test Alert', 5, 'warning', 'high', '2025-02-20');
        expect(alert).toBeInstanceOf(Alert);
        expect(alert.project_id).toBe(5);
        expect(alert.type).toBe('warning');
        expect(alert.priority).toBe('high');
    });

    test('It should retrieve an alert by ID', async () => {
        const newAlert = await Alert.createAlert('New Alert', 5, 'error', 'medium', '2025-02-21');
        const retrievedAlert = await Alert.getAlertById(newAlert.id);
        expect(retrievedAlert).toBeInstanceOf(Alert);
        expect(retrievedAlert.id).toBe(newAlert.id);
    });

    test('It should return null for a non-existing alert ID', async () => {
        const alert = await Alert.getAlertById(99999);
        expect(alert).toBeNull();
    });

    test('It should retrieve all alerts of a project', async () => {
        const alert1 = await Alert.createAlert('Alert 1', 5, 'info', 'low', '2025-02-22');
        const alert2 = await Alert.createAlert('Alert 2', 5, 'warning', 'medium', '2025-02-23');

        const alerts = await Alert.getAlertsByProjectId(5);
        expect(alerts.length).toBeGreaterThanOrEqual(2);
        expect(alerts).toEqual(expect.arrayContaining([
            expect.objectContaining({ id: alert1.id }),
            expect.objectContaining({ id: alert2.id })
        ]));
    });

    test('It should update an alert successfully', async () => {
        const alert = await Alert.createAlert('Update Test', 5, 'warning', 'high', '2025-02-24');
        const updated = await Alert.updateAlert(alert.id, { resolved: 1 });

        expect(updated).toBe(true);
        const updatedAlert = await Alert.getAlertById(alert.id);
        expect(updatedAlert.resolved).toBe(1);
    });

    test('It should delete an alert successfully', async () => {
        const alert = await Alert.createAlert('Delete Test', 5, 'error', 'low', '2025-02-25');
        const deleted = await Alert.deleteAlert(alert.id);
        expect(deleted).toBe(true);

        const deletedAlert = await Alert.getAlertById(alert.id);
        expect(deletedAlert).toBeNull();
    });

    test('It should return false if deleting a non-existing alert', async () => {
        const deleted = await Alert.deleteAlert(99999);
        expect(deleted).toBe(false);
    });
});
