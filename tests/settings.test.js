const Settings = require('../renderer/models/settings');

describe('Settings', () => {

    test('It should create a settings object with default values', () => {
        const settings = new Settings();
        expect(settings.timeFormat).toBe('24h');
        expect(settings.dateFormat).toBe('YYYY-MM-DD');
        expect(settings.language).toBe('en');
        expect(settings.notificationsEnabled).toBe(true);
    });

    test('It should allow to update time\'s format', () => {
        const settings = new Settings();
        settings.setTimeFormat('12h');
        expect(settings.timeFormat).toBe('12h');
    });

    test('It should allow to update date\'s format', () => {
        const settings = new Settings();
        settings.setDateFormat('DD/MM/YYYY');
        expect(settings.dateFormat).toBe('DD/MM/YYYY');
    });

    test('It should allow to update language', () => {
        const settings = new Settings();
        settings.setLanguage('it');
        expect(settings.language).toBe('it');
    });

    test('It should allow to enable and disable notifications', () => {
        const settings = new Settings();
        settings.setNotifications(false);
        expect(settings.notificationsEnabled).toBe(false);
        settings.setNotifications(true);
        expect(settings.notificationsEnabled).toBe(true);
        
    });
});