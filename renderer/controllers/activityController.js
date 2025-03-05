const Activity = require('../models/activity');
const loggingUtils = require('../utils/loggingUtils'); 
const filterUtils = require('../utils/filterUtils');

class ActivityController {
    /**
     * Creates a new activity.
     * @param {string} name - The name of the activity.
     * @param {number} projectId - The project ID the activity belongs to.
     * @param {number} duration - The duration of the activity in minutes.
     * @returns {Promise<number>} The ID of the newly created activity.
     */
    static async createActivity(name, projectId, duration) {
        try {
            const activityId = await Activity.createActivity(name, projectId, duration);
            loggingUtils.logMessage('info', `Activity created: ${name} (ID: ${activityId})`, 'CONTROLLERS');
            return activityId;
        } catch (error) {
            loggingUtils.logMessage('error', `Error creating activity: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to create activity');
        }
    }

    /**
     * Retrieves an activity by ID.
     * @param {number} activityId - The ID of the activity.
     * @returns {Promise<Object|null>} The activity object or null if not found.
     */
    static async getActivityById(activityId) {
        try {
            const activity = await Activity.getActivityById(activityId);
            if (!activity) {
                loggingUtils.logMessage('warn', `Activity not found: ID ${activityId}`, 'CONTROLLERS');
            }
            return activity;
        } catch (error) {
            loggingUtils.logMessage('error', `Error retrieving activity: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve activity');
        }
    }

    /**
     * Updates an existing activity.
     * @param {number} activityId - The ID of the activity.
     * @param {Object} updates - The updated fields (e.g., name, duration).
     * @returns {Promise<boolean>} True if the update was successful, false otherwise.
     */
    static async updateActivity(activityId, updates) {
        try {
            const success = await Activity.updateActivity(activityId, updates);
            loggingUtils.logMessage('info', `Activity updated: ID ${activityId}`, 'CONTROLLERS');
            return success;
        } catch (error) {
            loggingUtils.logMessage('error', `Error updating activity: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to update activity');
        }
    }

    /**
     * Deletes an activity.
     * @param {number} activityId - The ID of the activity to delete.
     * @returns {Promise<boolean>} True if the deletion was successful.
     */
    static async deleteActivity(activityId) {
        try {
            const success = await Activity.deleteActivity(activityId);
            loggingUtils.logMessage('info', `Activity deleted: ID ${activityId}`, 'CONTROLLERS');
            return success;
        } catch (error) {
            loggingUtils.logMessage('error', `Error deleting activity: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to delete activity');
        }
    }

    /**
     * Retrieves all activities, optionally applying filters.
     * @param {Object} filters - Optional filtering criteria.
     * @returns {Promise<Array>} An array of all activities.
     */
    static async getAllActivities(filters = {}) {
        try {
            let activities = await Activity.getAllActivities();

            if (Object.keys(filters).length > 0) {
                activities = filterUtils.applyFilters(activities, filters);
                loggingUtils.logMessage('info', `Filters applied to activities`, 'CONTROLLERS');
            }

            return activities;
        } catch (error) {
            loggingUtils.logMessage('error', `Error retrieving activities: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve activities');
        }
    }
}

module.exports = ActivityController;
