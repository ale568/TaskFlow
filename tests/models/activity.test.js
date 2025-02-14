const Activity = require('../../renderer/models/activity');

describe('Activity Model', () => {

    test('It should create an avtivity with name, duration and project_id', () => {
        const activity = new Activity(1, 'Write a report', 300);
        expect(activity.id).toBe(1);
        expect(activity.name).toBe('Write a report');
        expect(activity.duration).toBe(300);
        expect(activity.project_id).toBe(null);
    });

    test('It should allow setting a project_id.', () => {
        const activity = new Activity(2, 'Meeting', 1200, 5);
        expect(activity.project_id).toBe(5);
    });

    test('It should convert an instance to a database object', () => {
        const activity = new Activity(3, 'Design UI', 600, 2);
        const dbObject = activity.toDbObject();
        expect(dbObject).toEqual({
            id: 3,
            name: 'Design UI',
            duration: 600,
            project_id: 2
        });
    });

    test('It should create an instance form a database row', () => {
        const row = {id: 4, name: 'Test', duration: 400, project_id: 3};
        const activity = Activity.createFromDbRow(row);
        expect(activity.id).toBe(4);
        expect(activity.name).toBe('Test');
        expect(activity.duration).toBe(400);
        expect(activity.project_id).toBe(3);
    });

    test('It should throw an error for invalid name', () => {
        expect(() => new Activity(5, '', 300)).toThrow('Invalid name');
    });

    test('It should throw an error for invalid duration', () => {
        expect(() => new Activity(6, 'Bug Fix', -10)).toThrow('Invalid duration');
    });
});