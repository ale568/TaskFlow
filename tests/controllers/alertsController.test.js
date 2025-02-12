const AlertsController = require('../../renderer/controllers/alertsController');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('AlertsController - Database Integration', () => {

    let controller;

    beforeAll(async () => {
        dbUtils.connect();     // Initialize DB
        dbUtils.runQuery('DELETE FROM alerts');
        controller = new AlertsController();
    });

    afterAll(() => {
        dbUtils.close();    // Close the connection to the Database
    });

    test('It should add a new alert to the Database', async () => {
        const alertData = {
            title: 'Urgent Alert',
            project: 'Project A',
            type: 'Exipiration',
            priority: 'High',
            date: '2025-01-15 10:30'
        };

        await controller.addAlert(alertData);

        const result = dbUtils.runQuery('SELECT * FROM alerts WHERE title = ?', ['Urgent Alert']);
        expect(result.length).toBe(1);
        expect(result[0].project).toBe('project A');
    });

    test('It should retrieve all alerts from the database', async () => {
        const alerts = await controller.getAlerts();
        expect(alerts.length).toBeGreaterThanOrEqual(1);
    });

    test('It should retrieve a specific alert by ID', async () => {
        const inserted = db.runQuery('INSERT INTO alerts (title, project, type, priority, date) VALUES (?, ?, ?, ?, ?)',
            ['Test Alert', 'Project B', 'Reminder', 'Medium', '2025-01-15 12:00']);
        
        const alertId = db.runQuery('SELECT id FROM alerts WHERE title = ?', ['Test Alert'])[0].id;
        const alert = await controller.getAlertById(alertId);

        expect(alert).not.toBeNull();
        expect(alert.title).toBe('Test Alert');
    });

    test('It should update an existing alert', async () => {
        const inserted = db.runQuery('INSERT INTO alerts (title, project, type, priority, date) VALUES (?, ?, ?, ?, ?)',
            ['Update Me', 'Project C', 'Notification', 'Low', '2025-01-27 16:00']);

        const alertId = db.runQuery('SELCT id FROM alerts WHERE title = ?', ['Update Me'])[0].id;
        await controller.updateAlert(alertId, { title: 'Updated Alert', priority: 'High'});
        const updated = db.runQuery('SELECT * FROM alerts WHERE id = ?', [alertId]);

        expect(updated[0].title).toBe('Updated Alert');
        expect(updated[0].priority).toBe('High');
    });

    test('It should delete an alert from the database', async () => {
        const inserted = db.runQuery('INSERT INTO alerts (title, project, type, priority, date), VALUES (?, ?, ?, ?, ?)',
            ['Delete Me', 'Project D', 'Reminder', 'Medium', '2025-01-30 09:45']);
        
        const alertId = db.runQuery('SELECT id FROM alerts WHERE title = ?', ['Delete Me'])[0].id;
        await controller.removeAlert(alertId);
        const deleted = db.runQuery('SELECT * FROM alerts WHERE id = ?', [alertId]);

        expect(deleted.length).toBe(0);
    });
});