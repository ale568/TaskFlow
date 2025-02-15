class Settings {
    constructor() {
        this.timeFormat = '24h';
        this.dateFormat = 'YYYY-MM-DD';
        this.language = 'en';
        this.notificationsEnabled = true;
    }

    setTimeFormat(format) {
        if (['12h', '24h'].includes(format)) {
            this.timeFormat = format;
        } else {
            throw new Error('Invalid time format');
        }
    }

    setDateFormat(format) {
        // Assuming valid formats are 'YYYY-MM-DD' and 'DD-MM-YYYY'
        if (['YYYY-MM-DD', 'DD-MM-YYYY', 'MM/DD/YYYY'].includes(format)) {
            this.dateFormat = format;
        } else {
            throw new Error('Invalid date format');
        }
    }

    setLanguage(language) {
        // Assuming valid languages are 'en', 'it', etc.
        if (['en', 'it'].includes(language)) {
            this.language = language;
        } else {
            throw new Error('Invalid language');
        }
    }

    setNotifications(enabled) {
        if (typeof enabled === 'boolean') {
            this.notificationsEnabled = enabled;
        } else {
            throw new Error('Invalid value for notifications');
        }
    }

    toDbObject() {
        return [
            { key: 'timeFormat', value: this.timeFormat },
            { key: 'dateFormat', value: this.dateFormat },
            { key: 'language', value: this.language },
            { key: 'notificationsEnabled', value: this.notificationsEnabled.toString() },
        ];
    }

    static createFromDbRows(dbRows) {
        const settings = new Settings();
        dbRows.forEach(row => {
            switch (row.key) {
                case 'timeFormat':
                    settings.setTimeFormat(row.value);
                    break;
                case 'dateFormat':
                    settings.setDateFormat(row.value);
                    break;
                case 'language':
                    settings.setLanguage(row.value);
                    break;
                case 'notificationsEnabled':
                    settings.setNotifications(row.value === 'true');
                    break;
                default:
                    throw new Error(`Unknown setting key: ${row.key}`);
            }
        });
        return settings;
    }
}

module.exports = Settings;