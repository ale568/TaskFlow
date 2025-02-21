const Settings = require('../../renderer/models/settings');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('Settings Model - Database Operations', () => {
    beforeAll(async () => {
        Settings.setDatabase('taskflow_test_settings.sqlite'); // Set the dedicated test database
        dbUtils.connect('taskflow_test_settings.sqlite'); // Connect to the test database
        dbUtils.resetDatabase(); // Reset the database before running tests
    });

    beforeEach(async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Prevent race conditions
    });

    test('It should create and retrieve a setting', async () => {
        const success = await Settings.setSetting('theme', 'dark');

        expect(success).toBeDefined();
        const setting = await Settings.getSettingByKey('theme');
        expect(setting).not.toBeNull();
        expect(setting.value).toBe('dark');
    });

    test('It should update an existing setting', async () => {
        await Settings.setSetting('language', 'English');

        const updated = await Settings.setSetting('language', 'French');
        expect(updated.success).toBeTruthy();

        const updatedSetting = await Settings.getSettingByKey('language');
        expect(updatedSetting.value).toBe('French');
    });

    test('It should delete a setting', async () => {
        await Settings.setSetting('notifications', 'enabled');

        const deleted = await Settings.deleteSetting('notifications');
        expect(deleted).toBeTruthy();

        const deletedSetting = await Settings.getSettingByKey('notifications');
        expect(deletedSetting).toBeNull();
    });

    test('It should return null for a non-existing setting', async () => {
        const setting = await Settings.getSettingByKey('non_existing_key');
        expect(setting).toBeNull();
    });

    test('It should return false when deleting a non-existing setting', async () => {
        const result = await Settings.deleteSetting('non_existing_key');
        expect(result).toBeFalsy();
    });

    test('It should retrieve all settings', async () => {
        await Settings.setSetting('autoSave', 'true');
        await Settings.setSetting('backupFrequency', 'weekly');

        const settings = await Settings.getAllSettings();
        expect(settings.length).toBeGreaterThanOrEqual(2);
    });

    afterAll(async () => {
        dbUtils.close();
    });
});