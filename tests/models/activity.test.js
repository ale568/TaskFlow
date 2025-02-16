const Activity = require('../../renderer/models/activity');

describe('Activity Model - Database Integration', () => {
    test('It should create a new activity in the database', async () => {
        const activity = await Activity.createActivity('Develop Feature', 5, 300);
        expect(activity).toBeInstanceOf(Activity);
        expect(activity.name).toBe('Develop Feature');
        expect(activity.project_id).toBe(5);
        expect(activity.duration).toBe(300);
    });

    test('It should retrieve an activity by ID', async () => {
        const newActivity = await Activity.createActivity('Fix Bug', 5, 200);
        const retrievedActivity = await Activity.getActivityById(newActivity.id);
        expect(retrievedActivity).toBeInstanceOf(Activity);
        expect(retrievedActivity.id).toBe(newActivity.id);
    });

    test('It should return null for a non-existing activity ID', async () => {
        const activity = await Activity.getActivityById(99999);
        expect(activity).toBeNull();
    });

    test('It should retrieve all activities of a project', async () => {
        const activity1 = await Activity.createActivity('Write Tests', 5, 250);
        const activity2 = await Activity.createActivity('Refactor Code', 5, 300);

        const activities = await Activity.getActivitiesByProjectId(5);
        expect(activities.length).toBeGreaterThanOrEqual(2);
        expect(activities).toEqual(expect.arrayContaining([
            expect.objectContaining({ id: activity1.id }),
            expect.objectContaining({ id: activity2.id })
        ]));
    });

    test('It should delete an activity successfully', async () => {
        const activity = await Activity.createActivity('Update Docs', 5, 150);
        const deleted = await Activity.deleteActivity(activity.id);
        expect(deleted).toBe(true);

        const deletedActivity = await Activity.getActivityById(activity.id);
        expect(deletedActivity).toBeNull();
    });

    test('It should return false if deleting a non-existing activity', async () => {
        const deleted = await Activity.deleteActivity(99999);
        expect(deleted).toBe(false);
    });

    test('It should throw an error if activity ID is invalid', async () => {
        await expect(Activity.getActivityById(null)).rejects.toThrow('Invalid activity ID');
        await expect(Activity.getActivityById(-1)).rejects.toThrow('Invalid activity ID');
    });

    test('It should throw an error for invalid project ID when retrieving activities', async () => {
        await expect(Activity.getActivitiesByProjectId(null)).rejects.toThrow('Invalid project ID');
        await expect(Activity.getActivitiesByProjectId(-1)).rejects.toThrow('Invalid project ID');
    });
});
