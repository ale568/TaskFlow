const dbUtils = require('../utils/dbUtils');

class Settings {
    constructor(timeFormat = '24h', dateFormat = 'YYYY-MM-DD', language = 'en', notificationsEnabled = true) {
        this.timeFormat = timeFormat;
        this.dateFormat = dateFormat;
        this.language = language;
        this.notificationsEnabled = notificationsEnabled;
    }

    static async loadSettings() {
        const query = 'SELECT key, value FROM settings';
        const rows = await dbUtils.runQuery(query);

        if (!rows || rows.length === 0) {
            return new Settings(); // Ritorna ai valori predefiniti
        }

        const settings = new Settings();
        for (const row of rows) {
            switch (row.key) {
                case 'timeFormat':
                    settings.timeFormat = row.value || '24h';
                    break;
                case 'dateFormat':
                    settings.dateFormat = row.value || 'YYYY-MM-DD';
                    break;
                case 'language':
                    settings.language = row.value || 'en';
                    break;
                case 'notificationsEnabled':
                    settings.notificationsEnabled = row.value === 'true';
                    break;
                default:
                    console.warn(`Unknown setting key: ${row.key}`);
            }
        }
        return settings;
    }

    async updateSetting(key, value) {
        if (!['timeFormat', 'dateFormat', 'language', 'notificationsEnabled'].includes(key)) {
            throw new Error(`Unknown setting key: ${key}`);
        }
        const query = 'UPDATE settings SET value = ? WHERE key = ?';
        await dbUtils.runQuery(query, [value, key]);
        this[key] = value;
    }

    async setTimeFormat(format) {
        if (!['12h', '24h'].includes(format)) {
            throw new Error('Invalid time format');
        }
        await this.updateSetting('timeFormat', format);
    }

    async setDateFormat(format) {
        if (!['YYYY-MM-DD', 'DD-MM-YYYY', 'MM/DD/YYYY'].includes(format)) {
            throw new Error('Invalid date format');
        }
        await this.updateSetting('dateFormat', format);
    }

    async setLanguage(language) {
        if (!['en', 'it'].includes(language)) {
            throw new Error('Invalid language');
        }
        await this.updateSetting('language', language);
    }

    async setNotifications(enabled) {
        if (typeof enabled !== 'boolean') {
            throw new Error('Invalid value for notifications');
        }
        await this.updateSetting('notificationsEnabled', enabled.toString());
    }

    async toDbObject() {
        const query = 'SELECT key, value FROM settings';
        return await dbUtils.runQuery(query);
    }
}

module.exports = Settings;
