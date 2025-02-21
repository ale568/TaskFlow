const storageUtils = require('../utils/storageUtils');

class Alert {
    static dbName = 'taskflow_test_alerts.sqlite'; // Default test database

    /**
     * Sets the database to use (for test or production environments).
     * @param {string} databaseName - The database file name.
     */
    static setDatabase(databaseName) {
        this.dbName = databaseName;
    }

    /**
     * Creates a new alert.
     * @param {string} title - The alert title.
     * @param {number} project_id - The project ID associated with the alert.
     * @param {string} type - The type of alert.
     * @param {string} priority - The priority level of the alert.
     * @param {string} date - The date of the alert.
     * @returns {Promise<number>} The ID of the newly created alert.
     */
    static async createAlert(title, project_id, type, priority, date) {
        return await storageUtils.createRecord('alerts', {
            title,
            project_id,
            type,
            priority,
            date,
            resolved: 0
        }, this.dbName);
    }

    /**
     * Retrieves an alert by ID.
     * @param {number} id - The alert ID.
     * @returns {Promise<Object|null>} The alert object or null if not found.
     */
    static async getAlertById(id) {
        return await storageUtils.getRecordById('alerts', id, this.dbName);
    }

    /**
     * Updates an alert's status (e.g., resolve it).
     * @param {number} id - The alert ID.
     * @param {Object} updates - The updated fields.
     * @returns {Promise<boolean>} True if the update was successful, false otherwise.
     */
    static async updateAlert(id, updates) {
        return await storageUtils.updateRecord('alerts', id, updates, this.dbName);
    }

    /**
     * Deletes an alert from the database.
     * @param {number} id - The alert ID.
     * @returns {Promise<boolean>} True if the deletion was successful.
     */
    static async deleteAlert(id) {
        return await storageUtils.deleteRecord('alerts', id, this.dbName);
    }

    /**
     * Retrieves all alerts from the database.
     * @returns {Promise<Array>} An array of all alerts.
     */
    static async getAllAlerts() {
        return await storageUtils.getAllRecords('alerts', this.dbName);
    }
}

module.exports = Alert;
