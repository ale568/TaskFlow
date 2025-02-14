/**
 * @jest-environment node
 */

const Alert = require('../../renderer/models/alert');

describe('Alert Model', () => {

    test('It should create an alert with title, project_id, type, priority and date', () => {
        const alert = new Alert(1, 'Alert1', 2, 'Reminder', 'High', '2025-02-01 12:00:00', 0);
        expect(alert.id).toBe(1);
        expect(alert.title).toBe('Alert1');
        expect(alert.project_id).toBe(2);
        expect(alert.type).toBe('Reminder');
        expect(alert.priority).toBe('High');
        expect(alert.date).toBe('2025-02-01 12:00:00');
        expect(alert.resolved).toBe(0);
    });

    test('It should update alert details', () => {
        const alert = new Alert(2, 'Alert2', 3, 'Meeting', 'Medium', '2025-02-02 12:00:30', 0);
        alert.update({ priority: 'Low', resolved: 1});
        expect(alert.priority).toBe('Low');
        expect(alert.resolved).toBe(1); 
    });

    test('It should convert an instance to a databse object', () => {
        const alert = new Alert(3, 'DB integration', 4, 'Integration', 'Critical', '2025-02-10 10:00:00', 0);
        const dbObject = alert.toDbObject();
        expect(dbObject).toEqual({
            id: 3,
            title: 'DB integration',
            project_id: 4,
            type: 'Integration',
            priority: 'Critical',
            date: '2025-02-10 10:00:00',
            resolved: 0
        });
    });

    test('It should create an instance from a database row', () => {
        const row = { id: 4, title: 'New Feature', project_id: 5, type: 'Feature', priority: 'Normal', date: '2025-01-20 08:40:00', resolved: 0 };
        const alert = Alert.createFromDbRow(row);
        expect(alert.id).toBe(4);
        expect(alert.title).toBe('New Feature');
        expect(alert.project_id).toBe(5);
        expect(alert.type).toBe('Feature');
        expect(alert.priority).toBe('Normal');
        expect(alert.date).toBe('2025-01-20 08:40:00');
        expect(alert.resolved).toBe(0);
    });

    test('It should throw an error for missing title', () => {
        expect(() => new Alert(5, '', 6, 'Warning', 'Low', '2025-02-04 12:15:00', 0)).toThrow('Invalid title');
    });

    test('It should throw an error for missing project_id', () => {
        expect(() => new Alert(6, 'Security Alert', null, 'Security', 'High', '2025-01-24 12:17:00', 0)).toThrow('Invalid project_id');
    });

    test('It should throw an error for invalid resolved value', () => {
        expect(() => new Alert(7, 'Deprecated API', 7, 'Deprecation', 'Medium', '2025-02-05 17:15:00', 2)).toThrow('Invalid resolved value');
    });
});