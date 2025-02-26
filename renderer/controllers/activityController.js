const fs = require('fs');
const path = require('path');
const Activity = require('../models/activity');

const LOG_FILE = path.resolve(__dirname, '../../logs/controllers.log');

/**
 * Logs messages to a file instead of the terminal.
 * @param {string} message - The log message.
 */
function logToFile(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

/**
 * Controller for managing activities.
 * Handles CRUD operations for activities linked to projects.
 */
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
            return await Activity.createActivity(name, projectId, duration);
        } catch (error) {
            logToFile(`❌ Error creating activity: ${error.message}`);
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
            return await Activity.getActivityById(activityId);
        } catch (error) {
            logToFile(`❌ Error retrieving activity: ${error.message}`);
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
            return await Activity.updateActivity(activityId, updates);
        } catch (error) {
            logToFile(`❌ Error updating activity: ${error.message}`);
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
            return await Activity.deleteActivity(activityId);
        } catch (error) {
            logToFile(`❌ Error deleting activity: ${error.message}`);
            throw new Error('Failed to delete activity');
        }
    }

    /**
     * Retrieves all activities.
     * @returns {Promise<Array>} An array of all activities.
     */
    static async getAllActivities() {
        try {
            return await Activity.getAllActivities();
        } catch (error) {
            logToFile(`❌ Error retrieving activities: ${error.message}`);
            throw new Error('Failed to retrieve activities');
        }
    }
}

module.exports = ActivityController;