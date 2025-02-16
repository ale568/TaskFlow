const Activity = require('../../renderer/models/activity');

describe('Activity Model - Database Integration', () => {
    test('It should create a new activity in the database', async () => {
        const activity = await Activity.createActivity('Design UI', 5, 120);
        expect(activity).toBeInstanceOf(Activity);
        expect(activity.name).toBe('Design UI');
        expect(activity.project_id).toBe(5);
        expect(activity.duration).toBe(120);
    });

    test('It should retrieve an activity by ID', async () => {
        const newActivity = await Activity.createActivity('Testing Task', 5, 90);
        const retrievedActivity = await Activity.getActivityById(newActivity.id);
        expect(retrievedActivity).toBeInstanceOf(Activity);
        expect(retrievedActivity.id).toBe(newActivity.id);
    });

    test('It should return null for a non-existing activity ID', async () => {
        const activity = await Activity.getActivityById(99999);
        expect(activity).toBeNull();
    });

    test('It should update the duration of an activity', async () => {
        const activity = await Activity.createActivity('Bug Fix', 5, 45);
        const updatedActivity = await Activity.updateActivityDuration(activity.id, 60);
        expect(updatedActivity).toBeInstanceOf(Activity);
        expect(updatedActivity.duration).toBe(60);
    });

    test('It should throw an error if updating with an invalid duration', async () => {
        const activity = await Activity.createActivity('Testing Validation', 5, 30);
        await expect(Activity.updateActivityDuration(activity.id, -10)).rejects.toThrow('Invalid duration');
    });

    test('It should delete an activity successfully', async () => {
        const activity = await Activity.createActivity('Temporary Task', 5, 10);
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
});
