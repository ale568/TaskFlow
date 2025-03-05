const Settings = require('../models/settings');
const loggingUtils = require('../utils/loggingUtils');

/**
 * Controller for managing application settings.
 * Handles CRUD operations for settings.
 */
class SettingsController {
    /**
     * Creates or updates a setting.
     * If the setting exists, update it. Otherwise, create a new entry.
     * @param {string} key - The setting key.
     * @param {string} value - The setting value.
     * @returns {Promise<boolean>} True if the operation was successful.
     */
    static async setSetting(key, value) {
        try {
            await Settings.setSetting(key, value);
            loggingUtils.logMessage('info', `Setting updated: ${key} = ${value}`, 'CONTROLLERS');
            return true;
        } catch (error) {
            loggingUtils.logMessage('error', `Error setting configuration: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to save setting');
        }
    }

    /**
     * Retrieves a setting by key.
     * @param {string} key - The setting key.
     * @returns {Promise<Object|null>} The setting object or null if not found.
     */
    static async getSettingByKey(key) {
        try {
            const setting = await Settings.getSettingByKey(key);
            if (setting) {
                loggingUtils.logMessage('info', `Setting retrieved: ${key} = ${setting.value}`, 'CONTROLLERS');
            } else {
                loggingUtils.logMessage('warn', `Setting not found: ${key}`, 'CONTROLLERS');
            }
            return setting;
        } catch (error) {
            loggingUtils.logMessage('error', `Error retrieving setting: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve setting');
        }
    }

    /**
     * Deletes a setting from the database.
     * @param {string} key - The setting key.
     * @returns {Promise<boolean>} True if the deletion was successful.
     */
    static async deleteSetting(key) {
        try {
            const success = await Settings.deleteSetting(key);
            if (success) {
                loggingUtils.logMessage('info', `Setting deleted: ${key}`, 'CONTROLLERS');
            } else {
                loggingUtils.logMessage('warn', `Failed to delete setting: ${key}`, 'CONTROLLERS');
            }
            return success;
        } catch (error) {
            loggingUtils.logMessage('error', `Error deleting setting: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to delete setting');
        }
    }

    /**
     * Retrieves all settings from the database.
     * @returns {Promise<Array>} An array of all settings.
     */
    static async getAllSettings() {
        try {
            const settings = await Settings.getAllSettings();
            loggingUtils.logMessage('info', `Retrieved ${settings.length} settings.`, 'CONTROLLERS');
            return settings;
        } catch (error) {
            loggingUtils.logMessage('error', `Error retrieving settings: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve settings');
        }
    }
}

module.exports = SettingsController;