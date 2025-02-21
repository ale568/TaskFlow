const storageUtils = require('../utils/storageUtils');

class Activity {
    static dbName = 'taskflow_test_activity.sqlite'; // Default test database

    /**
     * Sets the database to use (for test or production environments).
     * @param {string} databaseName - The database file name.
     */
    static setDatabase(databaseName) {
        this.dbName = databaseName;
    }

    /**
     * Creates a new activity.
     * @param {string} name - The name of the activity.
     * @param {number} projectId - The project ID the activity belongs to.
     * @param {number} duration - The duration of the activity in minutes.
     * @returns {Promise<number>} The ID of the newly created activity.
     */
    static async createActivity(name, projectId, duration) {
        return await storageUtils.createRecord('activities', { name, project_id: projectId, duration }, this.dbName);
    }

    /**
     * Retrieves an activity by ID.
     * @param {number} id - The activity ID.
     * @returns {Promise<Object|null>} The activity data or null if not found.
     */
    static async getActivityById(id) {
        return await storageUtils.getRecordById('activities', id, this.dbName);
    }

    /**
     * Updates an existing activity.
     * @param {number} id - The ID of the activity.
     * @param {Object} updates - The fields to update.
     * @returns {Promise<boolean>} True if successful, false otherwise.
     */
    static async updateActivity(id, updates) {
        return await storageUtils.updateRecord('activities', id, updates, this.dbName);
    }

    /**
     * Deletes an activity.
     * @param {number} id - The ID of the activity to delete.
     * @returns {Promise<boolean>} True if deleted, false otherwise.
     */
    static async deleteActivity(id) {
        return await storageUtils.deleteRecord('activities', id, this.dbName);
    }

    /**
     * Retrieves all activities.
     * @returns {Promise<Array>} List of all activities.
     */
    static async getAllActivities() {
        return await storageUtils.getAllRecords('activities', this.dbName);
    }
}

module.exports = Activity;