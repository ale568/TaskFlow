const storageUtils = require('../utils/storageUtils');

class Report {
    static dbName = 'taskflow_test_reports.sqlite'; // Default test database

    /**
     * Sets the database to use (for test or production environments).
     * @param {string} databaseName - The database file name.
     */
    static setDatabase(databaseName) {
        this.dbName = databaseName;
    }

    /**
     * Creates a new report entry in the database.
     * @param {number} projectId - The project associated with the report.
     * @param {number} totalHours - The total hours recorded.
     * @param {string} startDate - The start date of the report period.
     * @param {string} endDate - The end date of the report period.
     * @returns {Promise<number>} The ID of the newly created report.
     */
    static async createReport(projectId, totalHours, startDate, endDate) {
        return await storageUtils.createRecord('reports', {
            project_id: projectId,
            total_hours: totalHours,
            startDate,
            endDate
        }, this.dbName);
    }

    /**
     * Retrieves a report by ID.
     * @param {number} reportId - The ID of the report.
     * @returns {Promise<Object|null>} The report object or null if not found.
     */
    static async getReportById(reportId) {
        return await storageUtils.getRecordById('reports', reportId, this.dbName);
    }

    /**
     * Updates a report entry in the database.
     * @param {number} reportId - The ID of the report.
     * @param {Object} updates - An object containing the fields to update.
     * @returns {Promise<boolean>} True if the update was successful, false otherwise.
     */
    static async updateReport(reportId, updates) {
        return await storageUtils.updateRecord('reports', reportId, updates, this.dbName);
    }

    /**
     * Deletes a report from the database.
     * @param {number} reportId - The ID of the report.
     * @returns {Promise<boolean>} True if the deletion was successful, false otherwise.
     */
    static async deleteReport(reportId) {
        return await storageUtils.deleteRecord('reports', reportId, this.dbName);
    }

    /**
     * Retrieves all reports from the database.
     * @returns {Promise<Array>} An array of all reports.
     */
    static async getAllReports() {
        return await storageUtils.getAllRecords('reports', this.dbName);
    }
}

module.exports = Report;