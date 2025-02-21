const Activity = require('../../renderer/models/activity');
const Project = require('../../renderer/models/project');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('Activity Model - Database Operations', () => {
    beforeAll(async () => {
        Activity.setDatabase('taskflow_test_activity.sqlite'); // Set the dedicated test database
        dbUtils.connect('taskflow_test_activity.sqlite'); // Connect to the test database
        dbUtils.resetDatabase(); // Reset the database before running tests
    });

    beforeEach(async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Prevent race conditions
    });

    test('It should create and retrieve an activity', async () => {
        // Step 1: Create a project to link the activity
        const projectId = await Project.createProject('Activity Project', 'Project for activity testing');

        // Step 2: Create an activity associated with the project
        const activityId = await Activity.createActivity('Test Activity', projectId, 60);

        expect(activityId).toBeDefined();
        const activity = await Activity.getActivityById(activityId);
        expect(activity).not.toBeNull();
        expect(activity.name).toBe('Test Activity');
        expect(activity.duration).toBe(60);
    });

    test('It should update an activity', async () => {
        const projectId = await Project.createProject('Activity Update Project', 'Project for updating activities');

        const activityId = await Activity.createActivity('Initial Activity', projectId, 30);

        const updated = await Activity.updateActivity(activityId, { duration: 45 });
        expect(updated.success).toBeTruthy();

        const updatedActivity = await Activity.getActivityById(activityId);
        expect(updatedActivity.duration).toBe(45);
    });

    test('It should delete an activity', async () => {
        const projectId = await Project.createProject('Activity Delete Project', 'Project for deleting activities');

        const activityId = await Activity.createActivity('To Delete', projectId, 120);

        const deleted = await Activity.deleteActivity(activityId);
        expect(deleted).toBeTruthy();

        const deletedActivity = await Activity.getActivityById(activityId);
        expect(deletedActivity).toBeNull();
    });

    test('It should return null for a non-existing activity', async () => {
        const activity = await Activity.getActivityById(99999);
        expect(activity).toBeNull();
    });

    test('It should return false when updating a non-existing activity', async () => {
        const result = await Activity.updateActivity(99999, { duration: 50 });
        expect(result.success).toBeFalsy();
    });

    test('It should return false when deleting a non-existing activity', async () => {
        const result = await Activity.deleteActivity(99999);
        expect(result).toBeFalsy();
    });

    test('It should retrieve all activities', async () => {
        const projectId = await Project.createProject('Activity Retrieval Project', 'Project for retrieving activities');

        await Activity.createActivity('Activity A', projectId, 20);
        await Activity.createActivity('Activity B', projectId, 40);

        const activities = await Activity.getAllActivities();
        expect(activities.length).toBeGreaterThanOrEqual(2);
    });

    afterAll(async () => {
        dbUtils.close();
    });
});