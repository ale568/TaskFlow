const fs = require('fs');
const path = require('path');
const Report = require('../models/report');

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
 * Controller for managing reports.
 * Handles CRUD operations for reports linked to projects.
 */
class ReportsController {
    /**
     * Creates a new report.
     * @param {number} projectId - The project ID the report is linked to.
     * @param {number} totalHours - The total hours recorded.
     * @param {string} startDate - The start date of the report period (ISO format).
     * @param {string} endDate - The end date of the report period (ISO format).
     * @returns {Promise<number>} The ID of the newly created report.
     */
    static async createReport(projectId, totalHours, startDate, endDate) {
        try {
            return await Report.createReport(projectId, totalHours, startDate, endDate);
        } catch (error) {
            logToFile(`❌ Error creating report: ${error.message}`);
            throw new Error('Failed to create report');
        }
    }

    /**
     * Retrieves a report by ID.
     * @param {number} reportId - The ID of the report.
     * @returns {Promise<Object|null>} The report object or null if not found.
     */
    static async getReportById(reportId) {
        try {
            return await Report.getReportById(reportId);
        } catch (error) {
            logToFile(`❌ Error retrieving report: ${error.message}`);
            throw new Error('Failed to retrieve report');
        }
    }

    /**
     * Updates an existing report.
     * @param {number} reportId - The ID of the report.
     * @param {Object} updates - The updated fields (e.g., totalHours, startDate, endDate).
     * @returns {Promise<boolean>} True if the update was successful, false otherwise.
     */
    static async updateReport(reportId, updates) {
        try {
            return await Report.updateReport(reportId, updates);
        } catch (error) {
            logToFile(`❌ Error updating report: ${error.message}`);
            throw new Error('Failed to update report');
        }
    }

    /**
     * Deletes a report.
     * @param {number} reportId - The ID of the report to delete.
     * @returns {Promise<boolean>} True if the deletion was successful.
     */
    static async deleteReport(reportId) {
        try {
            return await Report.deleteReport(reportId);
        } catch (error) {
            logToFile(`❌ Error deleting report: ${error.message}`);
            throw new Error('Failed to delete report');
        }
    }

    /**
     * Retrieves all reports.
     * @returns {Promise<Array>} An array of all reports.
     */
    static async getAllReports() {
        try {
            return await Report.getAllReports();
        } catch (error) {
            logToFile(`❌ Error retrieving reports: ${error.message}`);
            throw new Error('Failed to retrieve reports');
        }
    }
}

module.exports = ReportsController;