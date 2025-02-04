const settingsController = require('../../renderer/controllers/settingsController');

describe('Settings Controller', () => {

    beforeEach(() => {
        settingsController.resetSettings(); // Reset settings before each test
    });

    test('It should retrieve the current settings', () => {
        const settings = settingsController.getSettings();
        expect(settings.timeFormat).toBe('24h');
        expect(settings.dateFormat).toBe('YYYY-MM-DD');
        expect(settings.language).toBe('en');
        expect(settings.notificationsEnabled).toBe(true);
    });

    test('It should modify settings', () => {
        settingsController.updateSettings({timeFormat: '12h', language: 'it' });
        const updateSettings = settingsController.getSettings();
        expect(updateSettings.timeFormat).toBe('12h');
        expect(updateSettings.language).toBe('it');
    });

    test('It should preserve unchanged settings', () => {
        settingsController.updateSettings({language: 'es'});
        const updateSettings = settingsController.getSettings();
        expect(updateSettings.timeFormat).toBe('24h');
        expect(updateSettings.language).toBe('es');
    });
});