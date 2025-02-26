const fs = require('fs');
const path = require('path');
const Settings = require('../models/settings');

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
            return await Settings.setSetting(key, value);
        } catch (error) {
            logToFile(`❌ Error setting configuration: ${error.message}`);
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
            return await Settings.getSettingByKey(key);
        } catch (error) {
            logToFile(`❌ Error retrieving setting: ${error.message}`);
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
            return await Settings.deleteSetting(key);
        } catch (error) {
            logToFile(`❌ Error deleting setting: ${error.message}`);
            throw new Error('Failed to delete setting');
        }
    }

    /**
     * Retrieves all settings from the database.
     * @returns {Promise<Array>} An array of all settings.
     */
    static async getAllSettings() {
        try {
            return await Settings.getAllSettings();
        } catch (error) {
            logToFile(`❌ Error retrieving settings: ${error.message}`);
            throw new Error('Failed to retrieve settings');
        }
    }
}

module.exports = SettingsController;