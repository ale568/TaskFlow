const BackupController = require('../../renderer/controllers/backupController');
const BackupDBUtils = require('../../renderer/utils/backupDBUtils');
const fs = require('fs');
const path = require('path');

const LOG_FILE_PATH = path.resolve(__dirname, '../../logs/controllers.log');

/**
 * Reads the log file content.
 * @returns {string} The log file content.
 */
function readLogs() {
    return fs.existsSync(LOG_FILE_PATH) ? fs.readFileSync(LOG_FILE_PATH, 'utf8') : '';
}

describe('BackupController - Database Backup and Restore', () => {
    beforeEach(() => {
        if (fs.existsSync(LOG_FILE_PATH)) {
            fs.writeFileSync(LOG_FILE_PATH, ''); // Clear logs before each test
        }
    });

    test('It should create a database backup and log the operation', async () => {
        jest.spyOn(BackupDBUtils.prototype, 'createBackup').mockResolvedValue('/fake/path/backup.sqlite3');

        const backupPath = await BackupController.createBackup();

        expect(backupPath).toBe('/fake/path/backup.sqlite3');

        const logs = readLogs();
        expect(logs).toMatch(/Initiating database backup.../);
        expect(logs).toMatch(/Backup successfully created: \/fake\/path\/backup.sqlite3/);
        
        BackupDBUtils.prototype.createBackup.mockRestore();
    });

    test('It should log a warning when backup is canceled', async () => {
        jest.spyOn(BackupDBUtils.prototype, 'createBackup').mockResolvedValue(null);

        const backupPath = await BackupController.createBackup();

        expect(backupPath).toBeNull();

        const logs = readLogs();
        expect(logs).toMatch(/Initiating database backup.../);
        expect(logs).toMatch(/Backup operation was canceled by the user/);

        BackupDBUtils.prototype.createBackup.mockRestore();
    });

    test('It should log an error when backup fails', async () => {
        jest.spyOn(BackupDBUtils.prototype, 'createBackup').mockRejectedValue(new Error('Backup error'));

        await expect(BackupController.createBackup()).rejects.toThrow('Failed to create backup');

        const logs = readLogs();
        expect(logs).toMatch(/Error during backup: Backup error/);

        BackupDBUtils.prototype.createBackup.mockRestore();
    });

    test('It should restore a database backup and log the operation', async () => {
        jest.spyOn(BackupDBUtils.prototype, 'restoreBackup').mockResolvedValue(true);

        const success = await BackupController.restoreBackup();

        expect(success).toBe(true);

        const logs = readLogs();
        expect(logs).toMatch(/Initiating database restore.../);
        expect(logs).toMatch(/Database successfully restored/);

        BackupDBUtils.prototype.restoreBackup.mockRestore();
    });

    test('It should log a warning when restore is canceled', async () => {
        jest.spyOn(BackupDBUtils.prototype, 'restoreBackup').mockResolvedValue(false);

        const success = await BackupController.restoreBackup();

        expect(success).toBe(false);

        const logs = readLogs();
        expect(logs).toMatch(/Initiating database restore.../);
        expect(logs).toMatch(/Restore operation was canceled by the user/);

        BackupDBUtils.prototype.restoreBackup.mockRestore();
    });

    test('It should log an error when restore fails', async () => {
        jest.spyOn(BackupDBUtils.prototype, 'restoreBackup').mockRejectedValue(new Error('Restore error'));

        await expect(BackupController.restoreBackup()).rejects.toThrow('Failed to restore backup');

        const logs = readLogs();
        expect(logs).toMatch(/Error during restore: Restore error/);

        BackupDBUtils.prototype.restoreBackup.mockRestore();
    });
});