const fs = require('fs');
const path = require('path');
const Alert = require('../models/alert');

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
 * Controller for managing alerts.
 * Handles CRUD operations for alerts linked to projects.
 */
class AlertsController {
    /**
     * Creates a new alert.
     * @param {string} title - The title of the alert.
     * @param {number} projectId - The project ID the alert belongs to.
     * @param {string} type - The type of alert.
     * @param {string} priority - The priority level (`High`, `Medium`, `Low`).
     * @param {string} date - The date of the alert (ISO format).
     * @returns {Promise<number>} The ID of the newly created alert.
     */
    static async createAlert(title, projectId, type, priority, date) {
        try {
            return await Alert.createAlert(title, projectId, type, priority, date);
        } catch (error) {
            logToFile(`❌ Error creating alert: ${error.message}`);
            throw new Error('Failed to create alert');
        }
    }

    /**
     * Retrieves an alert by ID.
     * @param {number} alertId - The ID of the alert.
     * @returns {Promise<Object|null>} The alert object or null if not found.
     */
    static async getAlertById(alertId) {
        try {
            return await Alert.getAlertById(alertId);
        } catch (error) {
            logToFile(`❌ Error retrieving alert: ${error.message}`);
            throw new Error('Failed to retrieve alert');
        }
    }

    /**
     * Updates an existing alert.
     * @param {number} alertId - The ID of the alert.
     * @param {Object} updates - The updated fields (e.g., resolved status).
     * @returns {Promise<boolean>} True if the update was successful, false otherwise.
     */
    static async updateAlert(alertId, updates) {
        try {
            return await Alert.updateAlert(alertId, updates);
        } catch (error) {
            logToFile(`❌ Error updating alert: ${error.message}`);
            throw new Error('Failed to update alert');
        }
    }

    /**
     * Deletes an alert.
     * @param {number} alertId - The ID of the alert to delete.
     * @returns {Promise<boolean>} True if the deletion was successful.
     */
    static async deleteAlert(alertId) {
        try {
            return await Alert.deleteAlert(alertId);
        } catch (error) {
            logToFile(`❌ Error deleting alert: ${error.message}`);
            throw new Error('Failed to delete alert');
        }
    }

    /**
     * Retrieves all alerts.
     * @returns {Promise<Array>} An array of all alerts.
     */
    static async getAllAlerts() {
        try {
            return await Alert.getAllAlerts();
        } catch (error) {
            logToFile(`❌ Error retrieving alerts: ${error.message}`);
            throw new Error('Failed to retrieve alerts');
        }
    }
}

module.exports = AlertsController;