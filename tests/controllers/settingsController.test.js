const SettingsController = require('../../renderer/controllers/settingsController');
const Settings = require('../../renderer/models/settings');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('SettingsController - Database Operations', () => {
    beforeAll(async () => {
        Settings.setDatabase('taskflow_test_settings.sqlite'); // Set the dedicated test database
        dbUtils.connect('taskflow_test_settings.sqlite'); // Connect to the test database
    });

    test('It should create and retrieve a setting', async () => {
        const uniqueKey = `TestSetting_${Date.now()}`;
        const value = 'TestValue';

        const spy = jest.spyOn(Settings, 'setSetting');
        await SettingsController.setSetting(uniqueKey, value);

        expect(spy).toHaveBeenCalledWith(uniqueKey, value);

        const setting = await SettingsController.getSettingByKey(uniqueKey);
        expect(setting).not.toBeNull();
        expect(setting.key).toBe(uniqueKey);
        expect(setting.value).toBe(value);

        spy.mockRestore();
    });

    test('It should update an existing setting', async () => {
        const uniqueKey = `UpdatableSetting_${Date.now()}`;
        await SettingsController.setSetting(uniqueKey, 'InitialValue');

        const spy = jest.spyOn(Settings, 'setSetting');
        const updatedValue = 'UpdatedValue';
        await SettingsController.setSetting(uniqueKey, updatedValue);

        expect(spy).toHaveBeenCalledWith(uniqueKey, updatedValue);

        const updatedSetting = await SettingsController.getSettingByKey(uniqueKey);
        expect(updatedSetting.value).toBe(updatedValue);

        spy.mockRestore();
    });

    test('It should delete a setting', async () => {
        const uniqueKey = `DeleteSetting_${Date.now()}`;
        await SettingsController.setSetting(uniqueKey, 'SomeValue');

        const spy = jest.spyOn(Settings, 'deleteSetting');
        const deleted = await SettingsController.deleteSetting(uniqueKey);

        expect(spy).toHaveBeenCalledWith(uniqueKey);
        expect(deleted).toBeTruthy();

        const deletedSetting = await SettingsController.getSettingByKey(uniqueKey);
        expect(deletedSetting).toBeNull();

        spy.mockRestore();
    });

    test('It should return null for a non-existing setting', async () => {
        const spy = jest.spyOn(Settings, 'getSettingByKey');
        const setting = await SettingsController.getSettingByKey('NonExistingSetting');

        expect(spy).toHaveBeenCalledWith('NonExistingSetting');
        expect(setting).toBeNull();

        spy.mockRestore();
    });

    test('It should return false when deleting a non-existing setting', async () => {
        const spy = jest.spyOn(Settings, 'deleteSetting');
        const result = await SettingsController.deleteSetting('NonExistingSetting');

        expect(spy).toHaveBeenCalledWith('NonExistingSetting');
        expect(result).toBeFalsy();

        spy.mockRestore();
    });

    test('It should retrieve all settings', async () => {
        const keyA = `SettingA_${Date.now()}`;
        const keyB = `SettingB_${Date.now()}`;

        await SettingsController.setSetting(keyA, 'ValueA');
        await SettingsController.setSetting(keyB, 'ValueB');

        const spy = jest.spyOn(Settings, 'getAllSettings');
        const settings = await SettingsController.getAllSettings();

        expect(spy).toHaveBeenCalled();
        expect(settings.length).toBeGreaterThanOrEqual(2);

        spy.mockRestore();
    });

    test('It should handle errors when creating a setting with an invalid key', async () => {
        const spy = jest.spyOn(Settings, 'setSetting').mockImplementation(() => {
            throw new Error('Invalid key format');
        });

        await expect(SettingsController.setSetting('', 'Value'))
            .rejects.toThrow('Failed to save setting');

        spy.mockRestore();
    });

    test.skip('It should handle database connection failure gracefully', async () => {
        dbUtils.close(); // Simulate database connection failure
    
        let errorCaught = false;
        try {
            await SettingsController.setSetting('DatabaseFailSetting', 'FailValue');
        } catch (error) {
            errorCaught = true;
        }

        expect(errorCaught).toBeTruthy(); // Ensure an error was caught

        dbUtils.connect('taskflow_test_settings.sqlite'); // Restore database connection for further tests
    });    

    afterAll(async () => {
        dbUtils.close();
    });
});