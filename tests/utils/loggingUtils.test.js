const fs = require('fs');
const path = require('path');
const loggingUtils = require('../../renderer/utils/loggingUtils');

jest.mock('fs');

describe('LoggingUtils Tests', () => {
    const mockLogPath = path.resolve(__dirname, '../../logs/system.log');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('It should log a message to the correct file', () => {
        const spy = jest.spyOn(fs, 'appendFileSync');
        loggingUtils.logMessage('INFO', 'Test log message', 'SYSTEM');

        expect(spy).toHaveBeenCalledWith(
            mockLogPath,
            expect.stringMatching(/\[INFO\] \[SYSTEM\] Test log message/),
            'utf8'
        );
    });

    test('It should log an error with stack trace', () => {
        const spy = jest.spyOn(fs, 'appendFileSync');
        const mockError = new Error('Test error');

        loggingUtils.logError(mockError, 'SYSTEM');

        expect(spy).toHaveBeenCalledWith(
            mockLogPath,
            expect.stringMatching(/\[ERROR\] \[SYSTEM\] Test error/),
            'utf8'
        );
    });

    test('It should retrieve the last N log lines', () => {
        const mockData = `
            [2024-03-02 14:15:30] [INFO] [SYSTEM] First log
            [2024-03-02 14:16:30] [ERROR] [SYSTEM] Second log
            [2024-03-02 14:17:30] [WARN] [SYSTEM] Third log
        `.trim();

        fs.readFileSync.mockReturnValue(mockData);

        const logs = loggingUtils.getRecentLogs('SYSTEM', 2);
        expect(logs.length).toBe(2);
        expect(logs[0]).toContain('Second log');
        expect(logs[1]).toContain('Third log');
    });

    test('It should handle errors when reading logs', () => {
        fs.readFileSync.mockImplementation(() => {
            throw new Error('Read error');
        });

        const logs = loggingUtils.getRecentLogs('SYSTEM');
        expect(logs[0]).toContain('Failed to read log file: Read error');
    });

    test('It should handle errors when writing logs', () => {
        fs.appendFileSync.mockImplementation(() => {
            throw new Error('Write error');
        });

        expect(() => loggingUtils.logMessage('INFO', 'Test log message', 'SYSTEM'))
            .not.toThrow();
    });

    test('It should default to SYSTEM log if an invalid category is provided', () => {
        const spy = jest.spyOn(fs, 'appendFileSync');
        loggingUtils.logMessage('INFO', 'Invalid category test', 'UNKNOWN_CATEGORY');
    
        expect(spy).toHaveBeenCalledWith(
            expect.stringMatching(/system.log$/), // Deve scrivere nel log di sistema
            expect.stringMatching(/\[INFO\] \[UNKNOWN_CATEGORY\] Invalid category test/),
            'utf8'
        );
    });

    test('It should handle errors when logging an unknown category', () => {
        fs.appendFileSync.mockImplementation(() => {
            throw new Error('Write error');
        });
    
        expect(() => loggingUtils.logMessage('INFO', 'Error handling test', 'UNKNOWN'))
            .not.toThrow();
    });
});