const TimeEntry = require('../models/timeEntry');
const exportUtils = require('../utils/exportUtils');
const filterUtils = require('../utils/filterUtils');
const dialogUtils = require('../utils/dialogUtils');
const loggingUtils = require('../utils/loggingUtils');

class TimeSheetController {
    /**
     * Retrieves time entries filtered by project and/or date range.
     * @param {Object} filters - The filters for retrieving entries.
     * @returns {Promise<Array>} - A list of time entries.
     */
    static async getTimeEntries(filters = {}) {
        try {
            const entries = await TimeEntry.getAllTimeEntries();
            const filteredEntries = filterUtils.filterTimesheets(entries, filters);

            loggingUtils.logMessage('info', `Retrieved ${filteredEntries.length} time entries.`, 'CONTROLLERS');
            return filteredEntries;
        } catch (error) {
            loggingUtils.logMessage('error', `Error retrieving time entries: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve time entries');
        }
    }

    /**
     * Exports time entries in the selected format.
     * @param {string} format - The format of the export (csv, txt, json, pdf, xlsx).
     * @param {Object} filters - Filters for selecting the time entries.
     */
    static async exportTimeEntries(format, filters = {}) {
        try {
            // Retrieve filtered entries
            const entries = await this.getTimeEntries(filters);

            if (!entries.length) {
                throw new Error('No time entries available for export.');
            }

            // Ask the user where to save the file
            const filePath = await dialogUtils.showSaveDialog({
                title: 'Save Time Entries',
                defaultPath: `time_entries.${format}`,
                filters: [{ name: format.toUpperCase(), extensions: [format] }]
            });

            if (!filePath) return;

            // Call the corresponding export function
            switch (format) {
                case 'csv':
                    await exportUtils.exportCSV(entries, filePath);
                    break;
                case 'txt':
                    await exportUtils.exportTXT(entries, filePath);
                    break;
                case 'json':
                    await exportUtils.exportJSON(entries, filePath);
                    break;
                case 'pdf':
                    await exportUtils.exportPDF(entries, filePath);
                    break;
                case 'xlsx':
                    await exportUtils.exportXLSX(entries, filePath);
                    break;
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }

            loggingUtils.logMessage('info', `Time entries exported successfully to ${filePath}`, 'CONTROLLERS');
        } catch (error) {
            loggingUtils.logMessage('error', `Error exporting time entries: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to export time entries');
        }
    }
}

module.exports = TimeSheetController;