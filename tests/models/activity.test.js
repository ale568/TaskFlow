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
            project_id: 2,
            start_time: expect.any(String),
            end_time: expect.any(String)
        });
    
        expect(new Date(dbObject.start_time).toISOString()).toBe(dbObject.start_time);
        expect(new Date(dbObject.end_time).toISOString()).toBe(dbObject.end_time);
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

    test('It should create an activity with valid parameters', () => {
        const activity = new Activity(1, 'Coding Session', 120, 2);
        expect(activity.id).toBe(1);
        expect(activity.name).toBe('Coding Session');
        expect(activity.duration).toBe(120);
        expect(activity.project_id).toBe(2);
        expect(activity.startTime).toBeInstanceOf(Date);
        expect(activity.endTime).toBeInstanceOf(Date);
        expect(activity.endTime.getTime()).toBeGreaterThan(activity.startTime.getTime());
    });

    test('It should set duration to 0 if not provided', () => {
        const activity = new Activity(2, 'Meeting');
        expect(activity.duration).toBe(0);
    });

    test('It should throw an error if id is invalid', () => {
        expect(() => new Activity(null, 'Task', 60)).toThrow('Invalid id');
        expect(() => new Activity(-1, 'Task', 60)).toThrow('Invalid id');
    });

    test('It should throw an error if name is empty or not a string', () => {
        expect(() => new Activity(1, '', 60)).toThrow('Invalid name');
        expect(() => new Activity(1, null, 60)).toThrow('Invalid name');
    });

    test('It should throw an error if duration is negative', () => {
        expect(() => new Activity(1, 'Negative Duration', -10)).toThrow('Invalid duration');
    });

    test('It should throw an error if project_id is not a number', () => {
        expect(() => new Activity(1, 'Task', 60, 'NaN')).toThrow('Invalid project_id');
    });

    test('It should correctly handle endTime calculation', () => {
        const activity = new Activity(3, 'Review Code', 300);
        expect(activity.endTime.getTime()).toBe(activity.startTime.getTime() + 300 * 1000);
    });
});