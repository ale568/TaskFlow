const ActivityController = require('../../renderer/controllers/activityController');
const Activity = require('../../renderer/models/activity');
const Project = require('../../renderer/models/project');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('ActivityController - Database Operations', () => {
    beforeAll(async () => {
        Activity.setDatabase('taskflow_test_activity.sqlite'); // Set the dedicated test database
        dbUtils.connect('taskflow_test_activity.sqlite'); // Connect to the test database
    });

    test('It should create and retrieve an activity', async () => {
        const uniqueProjectName = `Activity Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for activity testing');

        const spy = jest.spyOn(Activity, 'createActivity');
        const activityId = await ActivityController.createActivity('Test Activity', projectId, 120);

        expect(spy).toHaveBeenCalledWith('Test Activity', projectId, 120);

        expect(activityId).toBeDefined();
        const activity = await ActivityController.getActivityById(activityId);
        expect(activity).not.toBeNull();
        expect(activity.name).toBe('Test Activity');
        expect(activity.duration).toBe(120);

        spy.mockRestore();
    });

    test('It should update an activity', async () => {
        const uniqueProjectName = `Activity Update Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for updating activities');

        const activityId = await ActivityController.createActivity('Initial Activity', projectId, 60);

        const spy = jest.spyOn(Activity, 'updateActivity');
        const updated = await ActivityController.updateActivity(activityId, { duration: 90 });

        expect(spy).toHaveBeenCalledWith(activityId, { duration: 90 });
        expect(updated.success).toBeTruthy();

        const updatedActivity = await ActivityController.getActivityById(activityId);
        expect(updatedActivity.duration).toBe(90);

        spy.mockRestore();
    });

    test('It should delete an activity', async () => {
        const uniqueProjectName = `Activity Delete Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for deleting activities');

        const activityId = await ActivityController.createActivity('To Delete', projectId, 45);

        const spy = jest.spyOn(Activity, 'deleteActivity');
        const deleted = await ActivityController.deleteActivity(activityId);

        expect(spy).toHaveBeenCalledWith(activityId);
        expect(deleted).toBeTruthy();

        const deletedActivity = await ActivityController.getActivityById(activityId);
        expect(deletedActivity).toBeNull();

        spy.mockRestore();
    });

    test('It should return null for a non-existing activity', async () => {
        const spy = jest.spyOn(Activity, 'getActivityById');
        const activity = await ActivityController.getActivityById(99999);

        expect(spy).toHaveBeenCalledWith(99999);
        expect(activity).toBeNull();

        spy.mockRestore();
    });

    test('It should return false when updating a non-existing activity', async () => {
        const spy = jest.spyOn(Activity, 'updateActivity');
        const result = await ActivityController.updateActivity(99999, { duration: 30 });

        expect(spy).toHaveBeenCalledWith(99999, { duration: 30 });
        expect(result.success).toBeFalsy();

        spy.mockRestore();
    });

    test('It should return false when deleting a non-existing activity', async () => {
        const spy = jest.spyOn(Activity, 'deleteActivity');
        const result = await ActivityController.deleteActivity(99999);

        expect(spy).toHaveBeenCalledWith(99999);
        expect(result).toBeFalsy();

        spy.mockRestore();
    });

    test('It should retrieve all activities', async () => {
        const uniqueProjectName = `Activity Retrieval Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for retrieving activities');

        await ActivityController.createActivity('Activity A', projectId, 60);
        await ActivityController.createActivity('Activity B', projectId, 120);

        const spy = jest.spyOn(Activity, 'getAllActivities');
        const activities = await ActivityController.getAllActivities();

        expect(spy).toHaveBeenCalled();
        expect(activities.length).toBeGreaterThanOrEqual(2);

        spy.mockRestore();
    });

    test('It should handle errors when creating an activity with an invalid project ID', async () => {
        const spy = jest.spyOn(Activity, 'createActivity').mockImplementation(() => {
            throw new Error('Invalid project ID');
        });

        await expect(ActivityController.createActivity('Invalid Activity', 99999, 60))
            .rejects.toThrow('Failed to create activity');

        spy.mockRestore();
    });

    test('It should handle database connection failure gracefully', async () => {
        dbUtils.close(); // Simulate database connection failure
    
        let errorCaught = false;
        try {
            await ActivityController.createActivity('Database Fail Activity', 99999, 60);
        } catch (error) {
            errorCaught = true;
        }

        expect(errorCaught).toBeTruthy(); // Ensure an error was caught

        dbUtils.connect('taskflow_test_activity.sqlite'); // Restore database connection for further tests
    });

    afterAll(async () => {
        dbUtils.close();
    });
});