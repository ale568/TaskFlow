const Activity = require('../renderer/models/activity');

describe('Activity', () => {

    test('It should create a task with a name and a duration.', () => {
        const activity = new Activity('Write a report', 300);
        expect(activity.name).toBe('Write a report');
        expect(activity.duration).toBe(300);
    });

    test('It should have a start timestamp.', () => {
        const activity = new Activity('Client call', 600);
        expect(activity.startTime).toBeInstanceOf(Date);
    });

    test('It should allow to assign a project (optional).', () => {
        const activity = new Activity('Meeting', 1200, 'Project X');
        expect(activity.project). toBe('Project X');
    });

    test('It should have an end timestamp based on the duration.', () => {
        const activity = new Activity('Design UI', 900);
        expect(activity.endTime).toBeInstanceOf(Date);
        expect(activity.endTime.getTime()).toBeGreaterThan(activity.startTime.getTime());
    });
});