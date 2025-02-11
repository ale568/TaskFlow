/**
 * @jest-environment node
 */

const Alert = require('../../renderer/models/alert');

describe('Alert Model', () => {
    let alert;

    beforeEach(() => {
        alert = new Alert(1, 'Alert1', 'Project1', 'Expiration date', 'High', '2025-01-15 12:32');
    });

    test('It should create an alert instance with correct properties', () => {
        expect(alert.id).toBe(1);
        expect(alert.title).toBe('Alert1');
        expect(alert.project).toBe('Project1');
        expect(alert.type).toBe('Expiration date');
        expect(alert.priority).toBe('High');
        expect(alert.date).toBe('2025-01-15 12:32');
    });

    test('It should update alert details', () => {
        alert.update({ title: 'Updated Alert', priority: 'Low' });
        expect(alert.title).toBe('Updated Alert');
        expect(alert.priority).toBe('Low');
        expect(alert.project).toBe('Project1'); 
    });

    test('It should not modify other fields if not included in update', () => {
        alert.update({ title: 'New Title' });
        expect(alert.title).toBe('New Title');
        expect(alert.project).toBe('Project1');
        expect(alert.type).toBe('Expiration date'); 
    });
});