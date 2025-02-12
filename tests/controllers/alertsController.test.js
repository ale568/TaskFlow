const AlertsController = require('../../renderer/controllers/alertsController');
const db = require('../../renderer/utils/dbUtils');

describe('AlertsController (Database Integration)', () => {
    let controller;

    beforeAll(() => {
        db.connect(); // Ensures connection to the database
        db.runQuery('DELETE FROM alerts'); // Clear the alerts table before tests
        controller = new AlertsController();
    });

    afterAll(() => {
        db.close(); // Close the connection to the database
    });

    test('It should add a new alert to the database', async () => {
        const alertData = {
            title: 'Urgent Alert',
            project: 'Project A',
            type: 'Expiration',
            priority: 'High',
            date: '2025-01-15 10:30'
        };

        await controller.addAlert(alertData);

        const result = db.runQuery('SELECT * FROM alerts WHERE title = ?', ['Urgent Alert']);
        expect(result.length).toBe(1);
        expect(result[0].project).toBe('Project A');
    });

    test('It should retrieve all alerts from the database', async () => {
        const alerts = await controller.getAlerts();
        expect(alerts.length).toBeGreaterThanOrEqual(1);
    });

    test('It should retrieve a specific alert by ID', async () => {
        const inserted = db.runQuery('INSERT INTO alerts (title, project, type, priority, date) VALUES (?, ?, ?, ?, ?)', 
            ['Test Alert', 'Project B', 'Reminder', 'Medium', '2025-02-20 12:00']);

        const alertId = db.runQuery('SELECT id FROM alerts WHERE title = ?', ['Test Alert'])[0].id;
        const alert = await controller.getAlertById(alertId);

        expect(alert).not.toBeNull();
        expect(alert.title).toBe('Test Alert');
    });

    test('It should update an existing alert', async () => {
        const inserted = db.runQuery('INSERT INTO alerts (title, project, type, priority, date) VALUES (?, ?, ?, ?, ?)', 
            ['Update Me', 'Project C', 'Notification', 'Low', '2025-03-10 14:00']);

        const alertId = db.runQuery('SELECT id FROM alerts WHERE title = ?', ['Update Me'])[0].id;
        
        await controller.updateAlert(alertId, { title: 'Updated Alert', priority: 'High' });

        const updated = db.runQuery('SELECT * FROM alerts WHERE id = ?', [alertId]);

        expect(updated[0].title).toBe('Updated Alert');
        expect(updated[0].priority).toBe('High');
    });

    test('It should delete an alert from the database', async () => {
        const inserted = db.runQuery('INSERT INTO alerts (title, project, type, priority, date) VALUES (?, ?, ?, ?, ?)', 
            ['Delete Me', 'Project D', 'Reminder', 'Medium', '2025-04-01 16:30']);

        const alertId = db.runQuery('SELECT id FROM alerts WHERE title = ?', ['Delete Me'])[0].id;

        await controller.removeAlert(alertId);

        const deleted = db.runQuery('SELECT * FROM alerts WHERE id = ?', [alertId]);

        expect(deleted.length).toBe(0);
    });
});