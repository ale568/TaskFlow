const ActivityController = require('../../renderer/controllers/activityController');
const Activity = require('../../renderer/models/activity');
const Project = require('../../renderer/models/project');
const dbUtils = require('../../renderer/utils/dbUtils');
const loggingUtils = require('../../renderer/utils/loggingUtils');
const filterUtils = require('../../renderer/utils/filterUtils');

jest.mock('../../renderer/utils/loggingUtils');
jest.mock('../../renderer/utils/filterUtils');

describe('ActivityController - Database Operations', () => {
    beforeAll(async () => {
        Activity.setDatabase('taskflow_test_activity.sqlite'); // Set the dedicated test database
        dbUtils.connect('taskflow_test_activity.sqlite'); // Connect to the test database
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('It should create and retrieve an activity with logging', async () => {
        const uniqueProjectName = `Activity Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for activity testing');

        const spy = jest.spyOn(Activity, 'createActivity');
        const activityId = await ActivityController.createActivity('Test Activity', projectId, 120);

        expect(spy).toHaveBeenCalledWith('Test Activity', projectId, 120);
        expect(activityId).toBeDefined();
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('info', expect.stringContaining('Activity created'), 'CONTROLLERS');

        spy.mockRestore();
    });

    test('It should update an activity with logging', async () => {
        const uniqueProjectName = `Activity Update Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for updating activities');

        const activityId = await ActivityController.createActivity('Initial Activity', projectId, 60);

        const spy = jest.spyOn(Activity, 'updateActivity');
        const updated = await ActivityController.updateActivity(activityId, { duration: 90 });

        expect(spy).toHaveBeenCalledWith(activityId, { duration: 90 });
        expect(updated.success).toBeTruthy();
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('info', expect.stringContaining('Activity updated'), 'CONTROLLERS');

        spy.mockRestore();
    });

    test('It should delete an activity with logging', async () => {
        const uniqueProjectName = `Activity Delete Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueProjectName, 'Project for deleting activities');

        const activityId = await ActivityController.createActivity('To Delete', projectId, 45);

        const spy = jest.spyOn(Activity, 'deleteActivity');
        const deleted = await ActivityController.deleteActivity(activityId);

        expect(spy).toHaveBeenCalledWith(activityId);
        expect(deleted).toBeTruthy();
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('info', expect.stringContaining('Activity deleted'), 'CONTROLLERS');

        spy.mockRestore();
    });

    test('It should log a warning when retrieving a non-existing activity', async () => {
        const spy = jest.spyOn(Activity, 'getActivityById');
        const activity = await ActivityController.getActivityById(99999);

        expect(spy).toHaveBeenCalledWith(99999);
        expect(activity).toBeNull();
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('warn', expect.stringContaining('Activity not found'), 'CONTROLLERS');

        spy.mockRestore();
    });

    test('It should log an error when failing to create an activity', async () => {
        Activity.createActivity = jest.fn().mockRejectedValue(new Error('Database error'));

        await expect(ActivityController.createActivity('Invalid Activity', 99999, 60)).rejects.toThrow('Failed to create activity');
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('error', expect.stringContaining('Error creating activity'), 'CONTROLLERS');
    });

    test('It should log an error when failing to retrieve activities', async () => {
        Activity.getAllActivities = jest.fn().mockRejectedValue(new Error('Database error'));

        await expect(ActivityController.getAllActivities()).rejects.toThrow('Failed to retrieve activities');
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('error', expect.stringContaining('Error retrieving activities'), 'CONTROLLERS');
    });

    test('It should log an error when failing to update an activity', async () => {
        Activity.updateActivity = jest.fn().mockRejectedValue(new Error('Database error'));

        await expect(ActivityController.updateActivity(99999, { duration: 30 })).rejects.toThrow('Failed to update activity');
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('error', expect.stringContaining('Error updating activity'), 'CONTROLLERS');
    });

    test('It should log an error when failing to delete an activity', async () => {
        Activity.deleteActivity = jest.fn().mockRejectedValue(new Error('Database error'));

        await expect(ActivityController.deleteActivity(99999)).rejects.toThrow('Failed to delete activity');
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('error', expect.stringContaining('Error deleting activity'), 'CONTROLLERS');
    });

    test('It should retrieve all activities with filtering', async () => {
        const activities = [
            { id: 1, project_id: 101, name: 'Activity A', duration: 60 },
            { id: 2, project_id: 102, name: 'Activity B', duration: 120 }
        ];

        Activity.getAllActivities = jest.fn().mockResolvedValue(activities);
        filterUtils.applyFilters = jest.fn().mockReturnValue([activities[0]]);

        const filteredActivities = await ActivityController.getAllActivities({ project_id: 101 });

        expect(filterUtils.applyFilters).toHaveBeenCalled();
        expect(filteredActivities.length).toBe(1);
        expect(filteredActivities[0].duration).toBe(60);

        expect(loggingUtils.logMessage).toHaveBeenCalledWith('info', expect.stringContaining('Filters applied to activities'), 'CONTROLLERS');
    });

    afterAll(async () => {
        dbUtils.close();
    });
});