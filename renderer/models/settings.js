const storageUtils = require('../utils/storageUtils');

class Settings {
    static dbName = 'taskflow_test_settings.sqlite'; // Default test database

    /**
     * Sets the database to use (for test or production environments).
     * @param {string} databaseName - The database file name.
     */
    static setDatabase(databaseName) {
        this.dbName = databaseName;
    }

    /**
     * Creates or updates a setting in the database.
     * @param {string} key - The setting key.
     * @param {string} value - The setting value.
     * @returns {Promise<boolean>} True if the operation was successful.
     */
    static async setSetting(key, value) {
        const existingSetting = await this.getSettingByKey(key);
        if (existingSetting) {
            return await storageUtils.updateRecord('settings', existingSetting.id, { value }, this.dbName);
        } else {
            return await storageUtils.createRecord('settings', { key, value }, this.dbName);
        }
    }

    /**
     * Retrieves a setting by key.
     * @param {string} key - The setting key.
     * @returns {Promise<Object|null>} The setting object or null if not found.
     */
    static async getSettingByKey(key) {
        const settings = await storageUtils.getAllRecords('settings', this.dbName);
        return settings.find(setting => setting.key === key) || null;
    }

    /**
     * Deletes a setting from the database.
     * @param {string} key - The setting key.
     * @returns {Promise<boolean>} True if the deletion was successful.
     */
    static async deleteSetting(key) {
        const setting = await this.getSettingByKey(key);
        if (setting) {
            return await storageUtils.deleteRecord('settings', setting.id, this.dbName);
        }
        return false;
    }

    /**
     * Retrieves all settings from the database.
     * @returns {Promise<Array>} An array of all settings.
     */
    static async getAllSettings() {
        return await storageUtils.getAllRecords('settings', this.dbName);
    }
}

module.exports = Settings;