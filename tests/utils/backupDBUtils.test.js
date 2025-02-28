const fs = require('fs');
const { dialog } = require('electron');
const Database = require('better-sqlite3');
const BackupDBUtils = require('../../renderer/utils/backupDBUtils');

jest.mock('fs');
jest.mock('electron', () => ({
    dialog: {
        showSaveDialog: jest.fn(),
        showOpenDialog: jest.fn()
    }
}));
jest.mock('better-sqlite3');

describe('BackupDBUtils Tests', () => {
    const mockDBPath = '/mock/db.sqlite3';
    let backupUtils;

    beforeEach(() => {
        jest.clearAllMocks();
        backupUtils = new BackupDBUtils(mockDBPath);
    });

    test('It should create a backup successfully', async () => {
        dialog.showSaveDialog.mockResolvedValue({ filePath: '/mock/backup.sqlite3' });
        fs.copyFileSync.mockImplementation(() => {});

        const backupPath = await backupUtils.createBackup();

        expect(dialog.showSaveDialog).toHaveBeenCalled();
        expect(fs.copyFileSync).toHaveBeenCalledWith(mockDBPath, '/mock/backup.sqlite3');
        expect(backupPath).toBe('/mock/backup.sqlite3');
    });

    test('It should not create a backup if user cancels', async () => {
        dialog.showSaveDialog.mockResolvedValue({ filePath: null });

        const backupPath = await backupUtils.createBackup();

        expect(dialog.showSaveDialog).toHaveBeenCalled();
        expect(fs.copyFileSync).not.toHaveBeenCalled();
        expect(backupPath).toBeNull();
    });

    test('It should restore a database successfully', async () => {
        dialog.showOpenDialog.mockResolvedValue({ filePaths: ['/mock/backup.sqlite3'] });
        fs.existsSync.mockReturnValue(true);
        fs.copyFileSync.mockImplementation(() => {});
        backupUtils.verifyDatabaseIntegrity = jest.fn().mockReturnValue(true);
    
        const result = await backupUtils.restoreBackup();
    
        expect(dialog.showOpenDialog).toHaveBeenCalled();
        
        // Verifica che il backup venga prima copiato in un file temporaneo
        expect(fs.copyFileSync).toHaveBeenNthCalledWith(1, '/mock/backup.sqlite3', '/mock/db.sqlite3.temp');
        
        // Verifica che il file temporaneo venga poi copiato nel database definitivo
        expect(fs.copyFileSync).toHaveBeenNthCalledWith(2, '/mock/db.sqlite3.temp', mockDBPath);
    
        expect(result).toBe(true);
    });    

    test('It should not restore if user cancels', async () => {
        dialog.showOpenDialog.mockResolvedValue({ filePaths: [] });

        const result = await backupUtils.restoreBackup();

        expect(dialog.showOpenDialog).toHaveBeenCalled();
        expect(fs.copyFileSync).not.toHaveBeenCalled();
        expect(result).toBe(false);
    });

    test('It should not restore if backup file does not exist', async () => {
        dialog.showOpenDialog.mockResolvedValue({ filePaths: ['/mock/missing.sqlite3'] });
        fs.existsSync.mockReturnValue(false);

        await expect(backupUtils.restoreBackup()).rejects.toThrow('The selected backup file does not exist.');
    });   

    test('It should verify database integrity successfully', () => {
        const mockDB = {
            prepare: jest.fn().mockReturnValue({ get: () => ({ integrity_check: 'ok' }) }),
            close: jest.fn()
        };

        Database.mockImplementation(() => mockDB);

        const result = backupUtils.verifyDatabaseIntegrity('/mock/backup.sqlite3');

        expect(mockDB.prepare).toHaveBeenCalledWith('PRAGMA integrity_check;');
        expect(result).toBe(true);
    });

    test('It should fail integrity check if database is corrupted', () => {
        const mockDB = {
            prepare: jest.fn().mockReturnValue({ get: () => ({ integrity_check: 'error' }) }),
            close: jest.fn()
        };

        Database.mockImplementation(() => mockDB);

        const result = backupUtils.verifyDatabaseIntegrity('/mock/corrupt.sqlite3');

        expect(result).toBe(false);
    });

    test('It should handle errors in database integrity check', () => {
        Database.mockImplementation(() => {
            throw new Error('Database read error');
        });

        const result = backupUtils.verifyDatabaseIntegrity('/mock/corrupt.sqlite3');

        expect(result).toBe(false);
    });
});