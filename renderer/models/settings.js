class Settings {
    constructor() {
        this.timeFormat = '24h';
        this.dateFormat = 'YYYY-MM-DD';
        this.language = 'en';
        this.notificationsEnabled = true;
    }

    setTimeFormat(format) {
        this.timeFormat = format;
    }

    setDateFormat(format) {
        this.dateFormat = format;
    }

    setLanguage(language) {
        this.language = language;
    }

    setNotifications(enabled) {
        this.notificationsEnabled = enabled;
    }
}

module.exports = Settings;