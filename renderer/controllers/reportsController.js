const Report = require('../models/report');
const exportUtils = require('../utils/exportUtils');
const loggingUtils = require('../utils/loggingUtils');
const dateTimeFormatUtils = require('../utils/dateTimeFormatUtils');
const filterUtils = require('../utils/filterUtils');
const dialogUtils = require('../utils/dialogUtils');

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
            // Validazione e formattazione delle date
            if (!dateTimeFormatUtils.isValidDate(startDate) || !dateTimeFormatUtils.isValidDate(endDate)) {
                throw new Error('Invalid date format');
            }

            const formattedStart = dateTimeFormatUtils.formatDate(startDate);
            const formattedEnd = dateTimeFormatUtils.formatDate(endDate);

            const reportId = await Report.createReport(projectId, totalHours, formattedStart, formattedEnd);
            loggingUtils.logMessage('info', `Report created successfully (ID: ${reportId})`, 'CONTROLLERS');
            return reportId;
        } catch (error) {
            loggingUtils.logMessage('error', `Error creating report: ${error.message}`, 'CONTROLLERS');
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
            const report = await Report.getReportById(reportId);
            loggingUtils.logMessage('info', `Report retrieved successfully (ID: ${reportId})`, 'CONTROLLERS');
            return report;
        } catch (error) {
            loggingUtils.logMessage('error', `Error retrieving report: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve report');
        }
    }

    /**
     * Retrieves all reports, with optional filtering.
     * @param {Object} filters - Optional filters for report retrieval.
     * @returns {Promise<Array>} An array of reports.
     */
    static async getAllReports(filters = {}) {
        try {
            let reports = await Report.getAllReports();

            // Applichiamo i filtri solo se vengono passati
            if (Object.keys(filters).length > 0) {
                reports = filterUtils.applyFilters(reports, filters);
            }

            loggingUtils.logMessage('info', `Retrieved ${reports.length} reports`, 'CONTROLLERS');
            return reports;
        } catch (error) {
            loggingUtils.logMessage('error', `Error retrieving reports: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve reports');
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
            // Validiamo e formattiamo le date se presenti
            if (updates.startDate && !dateTimeFormatUtils.isValidDate(updates.startDate)) {
                throw new Error('Invalid start date format');
            }
            if (updates.endDate && !dateTimeFormatUtils.isValidDate(updates.endDate)) {
                throw new Error('Invalid end date format');
            }

            const updated = await Report.updateReport(reportId, updates);
            loggingUtils.logMessage('info', `Report updated successfully (ID: ${reportId})`, 'CONTROLLERS');
            return updated;
        } catch (error) {
            loggingUtils.logMessage('error', `Error updating report: ${error.message}`, 'CONTROLLERS');
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
            const deleted = await Report.deleteReport(reportId);
            loggingUtils.logMessage('info', `Report deleted successfully (ID: ${reportId})`, 'CONTROLLERS');
            return deleted;
        } catch (error) {
            loggingUtils.logMessage('error', `Error deleting report: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to delete report');
        }
    }

    /**
     * Exports reports in the selected format.
     * @param {string} format - The format of the export (csv, json, pdf, xlsx).
     * @param {Object} filters - Optional filters for selecting the reports.
     */
    static async exportReports(format, filters = {}) {
        try {
            // Retrieve filtered reports
            const reports = await this.getAllReports(filters);

            if (!reports.length) {
                throw new Error('No reports available for export.');
            }

            // Ask the user where to save the file
            const filePath = await dialogUtils.showSaveDialog('Save Reports', `reports.${format}`, [format]);

            if (!filePath) return;

            // Call the corresponding export function
            switch (format) {
                case 'csv':
                    await exportUtils.exportCSV(reports, filePath);
                    break;
                case 'json':
                    await exportUtils.exportJSON(reports, filePath);
                    break;
                case 'pdf':
                    await exportUtils.exportPDF(reports, filePath);
                    break;
                case 'xlsx':
                    await exportUtils.exportXLSX(reports, filePath);
                    break;
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }

            loggingUtils.logMessage('info', `Reports exported successfully to ${filePath}`, 'CONTROLLERS');
        } catch (error) {
            loggingUtils.logMessage('error', `Error exporting reports: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to export reports');
        }
    }
}

module.exports = ReportsController;