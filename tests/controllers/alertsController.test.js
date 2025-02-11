const AlertsController = require('../../renderer/controllers/alertsController');
const Alert = require('../../renderer/models/alert');

describe('AlertsController', () => {

    let controller;
    let mockAlerts;

    beforeEach(() => {
        controller = new AlertsController();
        mockAlerts = [
            new Alert(1, 'Alert1', 'Project1', 'Expiration date', 'High', '2025-01-15 10:30'),
            new Alert(2, 'Alert2', 'Project2', 'Reminder', 'Medium', '2025-01-10 12:30'),
        ];
    });

    test('It should add a new alert', () => {
        const newAlert = new Alert(3, 'Alert3', 'Project3', 'Reminder', 'Low', '2025-01-13 13:30');
        controller.addAlert(newAlert);

        expect(controller.getAlerts().length).toBe(1);
        expect(controller.getAlerts()[0]).toEqual(newAlert);
    });

    test('It should remove an alert by ID', () => {
        controller.setAlerts(mockAlerts);
        controller.removeAlert(1);

        expect(controller.getAlerts().length).toBe(1);
        expect(controller.getAlerts()[0].id).toBe(2);
    });

    test('It should update an existing alert', () => {
        controller.setAlerts(mockAlerts);
        controller.updateAlert(1, { title: 'Updated Alert'});

        const updatedAlert = controller.getAlertById(1);
        expect(updatedAlert.title).toBe('Updated Alert');
    });

    test('It should get all alerts', () => {
        controller.setAlerts(mockAlerts);

        expect(controller.getAlerts()).toEqual(mockAlerts);
    });

    test('It should get an alert by ID', () => {
        controller.setAlerts(mockAlerts);

        expect(controller.getAlertById(2)).toEqual(mockAlerts[1]);
    });
});