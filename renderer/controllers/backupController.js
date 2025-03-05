const path = require('path');
const loggingUtils = require('../utils/loggingUtils');
const BackupDBUtils = require('../utils/backupDBUtils');

const DB_PATH = path.resolve(__dirname, '../../data/taskflow.sqlite'); // Percorso reale del database
const backupUtils = new BackupDBUtils(DB_PATH);

class BackupController {
    /**
     * Creates a backup of the database and logs the operation.
     * @returns {Promise<string|null>} The path of the backup file or null if canceled.
     */
    static async createBackup() {
        try {
            loggingUtils.logMessage('info', 'Initiating database backup...', 'CONTROLLERS');

            const backupPath = await backupUtils.createBackup();
            if (backupPath) {
                loggingUtils.logMessage('info', `Backup successfully created: ${backupPath}`, 'CONTROLLERS');
            } else {
                loggingUtils.logMessage('warn', 'Backup operation was canceled by the user.', 'CONTROLLERS');
            }
            return backupPath;
        } catch (error) {
            loggingUtils.logMessage('error', `Error during backup: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to create backup');
        }
    }

    /**
     * Restores the database from a selected backup file and logs the operation.
     * @returns {Promise<boolean>} True if successful, false otherwise.
     */
    static async restoreBackup() {
        try {
            loggingUtils.logMessage('info', 'Initiating database restore...', 'CONTROLLERS');

            const success = await backupUtils.restoreBackup();
            if (success) {
                loggingUtils.logMessage('info', 'Database successfully restored.', 'CONTROLLERS');
            } else {
                loggingUtils.logMessage('warn', 'Restore operation was canceled by the user.', 'CONTROLLERS');
            }
            return success;
        } catch (error) {
            loggingUtils.logMessage('error', `Error during restore: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to restore backup');
        }
    }
}

module.exports = BackupController;