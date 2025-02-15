const Settings = require('../../renderer/models/settings');

describe('Settings Model', () => {

    let settings;

    beforeEach(() => {
        settings = new Settings();
    });

    test('it should create an instance with default settings', () => {
        expect(settings.timeFormat).toBe('24h');
        expect(settings.dateFormat).toBe('YYYY-MM-DD');
        expect(settings.language).toBe('en');
        expect(settings.notificationsEnabled).toBe(true);
    });

    test('It should update the time format', () => {
        settings.setTimeFormat('12h');
        expect(settings.timeFormat).toBe('12h');
    });

    test('It should update the date format', () => {
        settings.setDateFormat('MM/DD/YYYY');
        expect(settings.dateFormat).toBe('MM/DD/YYYY');
    });

    test('It should update the language', () => {
        settings.setLanguage('it');
        expect(settings.language).toBe('it');
    });

    test('It should anable or disable notifications', () => {
        settings.setNotifications(false);
        expect(settings.notificationsEnabled).toBe(false);
    });

    test('It should convert an instance to a database object', () => {
        const dbObject = settings.toDbObject();
        expect(dbObject).toEqual([
            { key: 'timeFormat', value: '24h' },
            { key: 'dateFormat', value: 'YYYY-MM-DD' },
            { key: 'language', value: 'en' },
            { key: 'notificationsEnabled', value: 'true' },
        ]);
    });

    test('It should create an instance from a database row', () => {
        const dbRows = [
            { key: 'timeFormat', value: '12h' },
            { key: 'dateFormat', value: 'DD-MM-YYYY' },
            { key: 'language', value: 'it' },
            { key: 'notificationsEnabled', value: 'false' }
        ];

        const settingsInstance = Settings.createFromDbRows(dbRows);

        expect(settingsInstance.timeFormat).toBe('12h');
        expect(settingsInstance.dateFormat).toBe('DD-MM-YYYY');
        expect(settingsInstance.language).toBe('it');
        expect(settingsInstance.notificationsEnabled).toBe(false);
    });
});