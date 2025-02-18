const storageUtils = require('../utils/storageUtils');

class Settings {
    constructor(id, key, value) {
        this.id = id;
        this.key = key;
        this.value = value;
    }

    static async getAllSettings() {
        return await storageUtils.getAllSettings();
    }

    static async getSettingByKey(key) {
        return await storageUtils.getSettingByKey(key);
    }

    static async updateSetting(key, value) {
        return await storageUtils.updateSetting(key, value);
    }
}

module.exports = Settings;
