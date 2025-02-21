const storageUtils = require('../utils/storageUtils');

class Timer {
    static dbName = 'taskflow_test_timer.sqlite'; // Default test database

    /**
     * Sets the database to use (for test or production environments).
     * @param {string} databaseName - The database file name.
     */
    static setDatabase(databaseName) {
        this.dbName = databaseName;
    }

    /**
     * Creates a new timer entry in the database.
     * @param {number} projectId - The ID of the associated project.
     * @param {string} task - The task name associated with the timer.
     * @param {string} startTime - The start time of the timer (ISO string).
     * @param {string} status - The status of the timer ('running', 'paused', 'stopped').
     * @returns {Promise<number>} - The ID of the newly created timer.
     */
    static async createTimer(projectId, task, startTime, status) {
        return await storageUtils.createRecord('timers', {
            project_id: projectId,
            task,
            startTime,
            status
        }, this.dbName);
    }

    /**
     * Retrieves a timer entry by ID.
     * @param {number} timerId - The ID of the timer.
     * @returns {Promise<Object|null>} - The timer object or null if not found.
     */
    static async getTimerById(timerId) {
        return await storageUtils.getRecordById('timers', timerId, this.dbName);
    }

    /**
     * Updates a timer entry.
     * @param {number} timerId - The ID of the timer.
     * @param {Object} updates - The fields to update.
     * @returns {Promise<boolean>} - Whether the update was successful.
     */
    static async updateTimer(timerId, updates) {
        return await storageUtils.updateRecord('timers', timerId, updates, this.dbName);
    }

    /**
     * Deletes a timer entry.
     * @param {number} timerId - The ID of the timer.
     * @returns {Promise<boolean>} - Whether the deletion was successful.
     */
    static async deleteTimer(timerId) {
        return await storageUtils.deleteRecord('timers', timerId, this.dbName);
    }

    /**
     * Retrieves all timer entries.
     * @returns {Promise<Array>} - A list of all timer records.
     */
    static async getAllTimers() {
        return await storageUtils.getAllRecords('timers', this.dbName);
    }
}

module.exports = Timer;