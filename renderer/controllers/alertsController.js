const Alert = require('../models/alert');
const LoggingUtils = require('../utils/loggingUtils');
const DateTimeFormatUtils = require('../utils/dateTimeFormatUtils');
const FilterUtils = require('../utils/filterUtils');
const dbUtils = require('../utils/dbUtils');

/**
 * Controller for managing alerts.
 * Handles business logic, logging, filtering, and error handling.
 */
class AlertsController {
    /**
     * Creates a new alert.
     * @param {string} title - The title of the alert.
     * @param {number} projectId - The project ID the alert belongs to.
     * @param {string} type - The type of alert.
     * @param {string} priority - The priority level (`High`, `Medium`, `Low`).
     * @param {string} date - The date of the alert (any format).
     * @returns {Promise<number>} The ID of the newly created alert.
     */
    static async createAlert(title, projectId, type, priority, date) {
        try {
            const formattedDate = DateTimeFormatUtils.formatDate(date);
            const alertId = await Alert.createAlert(title, projectId, type, priority, formattedDate);
            LoggingUtils.logMessage('info', `Alert created: ID ${alertId}`, 'CONTROLLERS');
            return alertId;
        } catch (error) {
            LoggingUtils.logMessage('error', `Error creating alert: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to create alert');
        }
    }

    /**
     * Retrieves an alert by ID.
     */
    static async getAlertById(alertId) {
        try {
            const alert = await Alert.getAlertById(alertId);
            if (alert) {
                LoggingUtils.logMessage('info', `Alert retrieved: ID ${alertId}`, 'CONTROLLERS');
            } else {
                LoggingUtils.logMessage('warn', `Alert ID ${alertId} not found.`, 'CONTROLLERS');
            }
            return alert;
        } catch (error) {
            LoggingUtils.logMessage('error', `Error retrieving alert: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve alert');
        }
    }

    /**
     * Updates an existing alert.
     */
    static async updateAlert(alertId, updates) {
        try {
            if (!updates || Object.keys(updates).length === 0) {
                throw new Error('No valid update fields provided');
            }
            
            if (updates.date) {
                updates.date = DateTimeFormatUtils.formatDate(updates.date);
            }
    
            const result = await Alert.updateAlert(alertId, updates);
        
            if (!result.success) {
                throw new Error(`Failed to update alert ID ${alertId}`);
            }
    
            LoggingUtils.logMessage('info', `Alert updated: ID ${alertId}`, 'CONTROLLERS');
            return result.success;
        } catch (error) {
            LoggingUtils.logMessage('error', `Error updating alert: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to update alert');
        }
    }    

    /**
     * Deletes an alert.
     */
    static async deleteAlert(alertId) {
        try {
    
            if (!dbUtils.isConnected() || !dbUtils.getCurrentDatabase()) {  
                throw new Error('Database connection is closed');
            }
    
            const success = await Alert.deleteAlert(alertId);
    
            if (!success) {
                return false;
            }
    
            LoggingUtils.logMessage('info', `Alert deleted: ID ${alertId}`, 'CONTROLLERS');
            return success;
        } catch (error) {
            LoggingUtils.logMessage('error', `Error deleting alert: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to delete alert');
        }
    }    

    /**
     * Retrieves all alerts.
     * Optionally applies filters if provided.
     * @param {Object} filters - Optional filtering criteria.
     * @returns {Promise<Array>} The list of alerts.
     */
    static async getAllAlerts(filters = {}) {
        try {
            const alerts = await Alert.getAllAlerts();
    
            if (Object.keys(filters).length > 0) {
                const filteredAlerts = FilterUtils.filterAlerts(alerts, filters);
                LoggingUtils.logMessage('info', `Retrieved ${filteredAlerts.length} filtered alerts.`, 'CONTROLLERS');
                return filteredAlerts;
            }
    
            LoggingUtils.logMessage('info', `Retrieved ${alerts.length} alerts.`, 'CONTROLLERS');
            return alerts;
        } catch (error) {
            LoggingUtils.logMessage('error', `Error retrieving alerts: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve alerts');
        }
    }    

    /**
     * Retrieves alerts based on specific filtering criteria.
     * @param {Object} filters - Filtering criteria (e.g., { project: 1, priority: 'High' }).
     * @returns {Promise<Array>} The list of filtered alerts.
     */
    static async getFilteredAlerts(filters) {
        try {
            const alerts = await Alert.getAllAlerts();
            const filteredAlerts = FilterUtils.filterAlerts(alerts, filters);
            LoggingUtils.logMessage('info', `Retrieved ${filteredAlerts.length} alerts after filtering.`, 'CONTROLLERS');
            return filteredAlerts;
        } catch (error) {
            LoggingUtils.logMessage('error', `Error filtering alerts: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve filtered alerts');
        }
    }
}

module.exports = AlertsController;