class SettingsController {
    constructor() {
        this.defaultSettings = {
            timeFormat: '24h',
            dateFormat: 'YYYY-MM-DD',
            language: 'en',
            notificationsEnabled: true
        };
        this.settings = { ...this.defaultSettings };
    }

    getSettings() {
        return { ...this.settings };
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }

    resetSettings() {
        this.settings = { ...this.defaultSettings };
    }
}

module.exports = new SettingsController();