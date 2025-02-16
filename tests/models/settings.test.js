const Settings = require('../../renderer/models/settings');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('Settings Model - Database Integration', () => {
    let settings;

    beforeEach(async () => {
        // Resettare il database per evitare interferenze tra i test
        await dbUtils.runQuery("DELETE FROM settings;");
        await dbUtils.runQuery("INSERT INTO settings (key, value) VALUES ('timeFormat', '24h');");
        await dbUtils.runQuery("INSERT INTO settings (key, value) VALUES ('dateFormat', 'YYYY-MM-DD');");
        await dbUtils.runQuery("INSERT INTO settings (key, value) VALUES ('language', 'en');");
        await dbUtils.runQuery("INSERT INTO settings (key, value) VALUES ('notificationsEnabled', 'true');");

        settings = await Settings.loadSettings();
    });

    test('It should fetch the settings from the database', async () => {
        expect(settings.timeFormat).toBe('24h');
        expect(settings.dateFormat).toBe('YYYY-MM-DD');
        expect(settings.language).toBe('en');
        expect(settings.notificationsEnabled).toBe(true);
    });

    test('It should update a setting in the database', async () => {
        await settings.setTimeFormat('12h');
        const updatedSettings = await Settings.loadSettings();
        expect(updatedSettings.timeFormat).toBe('12h');
    });

    test('It should retrieve all settings as a database object', async () => {
        const dbObject = await settings.toDbObject();
        expect(dbObject).toEqual([
            { key: 'timeFormat', value: '24h' },
            { key: 'dateFormat', value: 'YYYY-MM-DD' },
            { key: 'language', value: 'en' },
            { key: 'notificationsEnabled', value: 'true' }
        ]);
    });

    test('It should throw an error if a setting is set to an invalid value', async () => {
        await expect(settings.setTimeFormat('invalid')).rejects.toThrow('Invalid time format');
        await expect(settings.setDateFormat(123)).rejects.toThrow('Invalid date format');
        await expect(settings.setLanguage(null)).rejects.toThrow('Invalid language');
    });

    test('It should return the correct boolean value for notifications', async () => {
        await settings.setNotifications(false);
        const updatedSettings = await Settings.loadSettings();
        expect(updatedSettings.notificationsEnabled).toBe(false);

        await settings.setNotifications(true);
        const newSettings = await Settings.loadSettings();
        expect(newSettings.notificationsEnabled).toBe(true);
    });

    test('It should return default settings if the database is empty', async () => {        // edge cases
        await dbUtils.runQuery("DELETE FROM settings;"); // Rimuoviamo tutti i valori
        const emptySettings = await Settings.loadSettings();
    
        expect(emptySettings.timeFormat).toBe('24h'); // Deve tornare ai default
        expect(emptySettings.dateFormat).toBe('YYYY-MM-DD');
        expect(emptySettings.language).toBe('en');
        expect(emptySettings.notificationsEnabled).toBe(true);
    });
    
    test('It should throw an error if a setting is updated with an invalid value', async () => {
        await expect(settings.setTimeFormat('invalid')).rejects.toThrow('Invalid time format');
        await expect(settings.setDateFormat('wrong-format')).rejects.toThrow('Invalid date format');
        await expect(settings.setLanguage('de')).rejects.toThrow('Invalid language');
    });
    
    test('It should handle invalid boolean values for notifications', async () => {
        await expect(settings.setNotifications('yes')).rejects.toThrow('Invalid value for notifications');
        await expect(settings.setNotifications(100)).rejects.toThrow('Invalid value for notifications');
    });
    
});
