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

    test('It should throw an error if title is null or undefined', () => {
        expect(() => new Alert(8, null, 3, 'Warning', 'High', '2025-10-01 12:00:00', 0)).toThrow('Invalid title');
        expect(() => new Alert(9, undefined, 3, 'Warning', 'High', '2025-10-01 12:00:00', 0)).toThrow('Invalid title');
    });

    test('It should throw an error if project_id is not a number', () => {
        expect(() => new Alert(10, 'Test Alert', 'NaN', 'Feature', 'Low', '2025-01-21 11:00:30', 0)).toThrow('Invalid project_id');
    });

    test('It should throw an error if resolved is not 0 or 1', () => {
        expect(() => new Alert(11, 'Security Issue', 4, 'Security', 'Critical', '2025-12-05 18:15:00', 2)).toThrow('Invalid resolved value');
        expect(() => new Alert(12, 'Security Issue', 4, 'Security', 'Critical', '2025-12-05 18:15:00', 'string')).toThrow('Invalid resolved value');
    });

    test('It should correctly handle toDbObject when resolved is undefined', () => {
        const alert = new Alert(13, 'New Alert', 5, 'Reminder', 'Normal', '2026-01-10 09:45:00');
        const dbObject = alert.toDbObject();
        expect(dbObject.resolved).toBe(0);
    });

    test('It should update the alert with valid values', () => {
        const alert = new Alert(1, 'Original Alert', 3, 'Warning', 'High', '2025-10-01 12:00:00', 0);
        
        alert.update({ title: 'Updated Alert', resolved: 1 });
        
        expect(alert.title).toBe('Updated Alert');
        expect(alert.resolved).toBe(1);
    });
    
    test('It should retain existing values when updating with undefined fields', () => {
        const alert = new Alert(2, 'Initial Alert', 2, 'Info', 'Low', '2025-10-01 12:00:00', 0);
    
        alert.update({ title: undefined, resolved: undefined });
    
        expect(alert.title).toBe('Initial Alert'); 
        expect(alert.resolved).toBe(0); 
    });
    
    test('It should throw an error if updated title is empty', () => {
        const alert = new Alert(3, 'Valid Alert', 5, 'Feature', 'Medium', '2025-12-02 14:30:00', 0);
    
        expect(() => alert.update({ title: '' })).toThrow('Invalid title');
    });
    
    test('It should correctly handle toDbObject when resolved is undefined', () => {
        const alert = new Alert(4, 'Database Alert', 1, 'Reminder', 'Normal', '2026-01-10 09:45:00');
        const dbObject = alert.toDbObject();
    
        expect(dbObject.resolved).toBe(0); 
    });
    
    test('It should create an alert from a database row, even if resolved is missing', () => {
        const dbRow = {
            id: 1,
            title: "Test Alert",
            project_id: 2,
            type: "Deadline",
            priority: "High",
            date: "2025-02-20"
            // resolved è assente
        };
    
        const alert = Alert.createFromDbRow(dbRow);
        expect(alert.resolved).toBeNull();
    });
    
    
});