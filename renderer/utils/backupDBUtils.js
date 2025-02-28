const fs = require('fs');
const path = require('path');
const { dialog } = require('electron');
const Database = require('better-sqlite3');

class BackupDBUtils {
    constructor(dbPath) {
        this.dbPath = dbPath;
    }

    /**
     * Creates a backup of the database by allowing the user to select the destination.
     * @returns {Promise<string|null>} The backup file path or null if canceled.
     */
    async createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const { filePath } = await dialog.showSaveDialog({
            title: 'Save Database Backup',
            defaultPath: `backup_${timestamp}.sqlite3`,
            filters: [{ name: 'SQLite Database', extensions: ['sqlite3'] }]
        });

        if (!filePath) {
            console.warn('Backup canceled by the user.');
            return null;
        }

        try {
            fs.copyFileSync(this.dbPath, filePath);
            console.log(`Backup successfully created: ${filePath}`);
            return filePath;
        } catch (error) {
            console.error('Error creating backup:', error);
            throw error;
        }
    }

    /**
     * Restores the database from a selected backup file and verifies its integrity.
     * @returns {Promise<boolean>} True if successful, false otherwise.
     */
    async restoreBackup() {
        const { filePaths } = await dialog.showOpenDialog({
            title: 'Select Backup File',
            filters: [{ name: 'SQLite Database', extensions: ['sqlite3'] }],
            properties: ['openFile']
        });

        if (!filePaths || filePaths.length === 0) {
            console.warn('Restore canceled by the user.');
            return false;
        }

        const backupFilePath = filePaths[0];

        if (!fs.existsSync(backupFilePath)) {
            throw new Error('The selected backup file does not exist.');
        }

        try {
            // Copy the backup to a temporary location for verification
            const tempDBPath = this.dbPath + '.temp';
            fs.copyFileSync(backupFilePath, tempDBPath);

            // Check integrity before replacing the original database
            if (!this.verifyDatabaseIntegrity(tempDBPath)) {
                fs.unlinkSync(tempDBPath); // Remove the temporary corrupt database
                throw new Error('Database integrity check failed. Restore aborted.');
            }

            // Replace the original database only if integrity check passes
            fs.copyFileSync(tempDBPath, this.dbPath);
            fs.unlinkSync(tempDBPath);
            console.log('Database successfully restored.');
            return true;
        } catch (error) {
            console.error('Error restoring database:', error);
            return false;
        }
    }

    /**
     * Checks the integrity of a SQLite database file.
     * @param {string} dbPath - Path to the database file to check.
     * @returns {boolean} True if integrity check passes, false otherwise.
     */
    verifyDatabaseIntegrity(dbPath) {
        try {
            const db = new Database(dbPath, { readonly: true });
            const result = db.prepare('PRAGMA integrity_check;').get();
            db.close();

            if (result && result['integrity_check'] === 'ok') {
                return true;
            } else {
                console.warn('Integrity check failed:', result);
                return false;
            }
        } catch (error) {
            console.error('Error verifying database integrity:', error);
            return false;
        }
    }
}

module.exports = BackupDBUtils;