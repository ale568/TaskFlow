const storageUtils = require('../utils/storageUtils');

class TimeEntry {
    static dbName = 'taskflow_test_timeEntry.sqlite'; // Default test database

    /**
     * Sets the database to use (for test or production environments).
     * @param {string} databaseName - The database file name.
     */
    static setDatabase(databaseName) {
        this.dbName = databaseName;
    }

    /**
     * Creates a new time entry.
     * @param {number} project_id - The associated project ID.
     * @param {string} task - The task name.
     * @param {string} startTime - The start time (ISO format).
     * @param {string|null} endTime - The end time (ISO format or null).
     * @param {number|null} tag_id - The associated tag ID (optional).
     * @returns {Promise<number>} The ID of the newly created time entry.
     */
    static async createTimeEntry(project_id, task, startTime, endTime = null, tag_id = null) {
        return await storageUtils.createRecord('time_entries', {
            project_id,
            task,
            startTime,
            endTime,
            tag_id
        }, this.dbName);
    }

    /**
     * Retrieves a time entry by ID.
     * @param {number} id - The time entry ID.
     * @returns {Promise<Object|null>} The time entry object or null if not found.
     */
    static async getTimeEntryById(id) {
        return await storageUtils.getRecordById('time_entries', id, this.dbName);
    }

    /**
     * Updates an existing time entry.
     * @param {number} id - The time entry ID.
     * @param {Object} updates - The updated fields.
     * @returns {Promise<boolean>} True if the update was successful, false otherwise.
     */
    static async updateTimeEntry(id, updates) {
        return await storageUtils.updateRecord('time_entries', id, updates, this.dbName);
    }

    /**
     * Deletes a time entry from the database.
     * @param {number} id - The time entry ID.
     * @returns {Promise<boolean>} True if the deletion was successful.
     */
    static async deleteTimeEntry(id) {
        return await storageUtils.deleteRecord('time_entries', id, this.dbName);
    }

    /**
     * Retrieves all time entries from the database.
     * @returns {Promise<Array>} An array of all time entries.
     */
    static async getAllTimeEntries() {
        return await storageUtils.getAllRecords('time_entries', this.dbName);
    }
}

module.exports = TimeEntry;