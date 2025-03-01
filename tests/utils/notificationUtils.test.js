const { Notification } = require('electron');
const loggingUtils = require('../../renderer/utils/loggingUtils');
const NotificationUtils = require('../../renderer/utils/notificationUtils');

// Mock Electron's Notification API to prevent actual system popups
jest.mock('electron', () => ({
    Notification: jest.fn().mockImplementation(() => ({
        show: jest.fn(),
    })),
}));

// Mock loggingUtils to verify log messages
jest.mock('../../renderer/utils/loggingUtils', () => ({
    logMessage: jest.fn(),
    logError: jest.fn(),
}));

describe('NotificationUtils Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('It should create and show a notification', () => {
        const mockShow = jest.fn();
        Notification.mockImplementation(() => ({
            show: mockShow,
        }));

        NotificationUtils.showNotification('Test Title', 'Test Message', 'info');

        expect(Notification).toHaveBeenCalled();
        expect(mockShow).toHaveBeenCalled();
        expect(loggingUtils.logMessage).toHaveBeenCalledWith(
            'INFO',
            'Notification: [INFO] Test Title - Test Message',
            'NOTIFICATIONS'
        );
    });

    test('It should handle an error when showing a notification', () => {
        Notification.mockImplementation(() => {
            throw new Error('Notification failed');
        });

        NotificationUtils.showNotification('Error Test', 'This should fail', 'error');

        expect(loggingUtils.logError).toHaveBeenCalledWith(expect.any(Error), 'NOTIFICATIONS');
    });

    test('It should schedule a notification', () => {
        jest.useFakeTimers();

        const mockShow = jest.fn();
        Notification.mockImplementation(() => ({
            show: mockShow,
        }));

        NotificationUtils.scheduleNotification('Scheduled Test', 'Delayed message', 'info', 5000);

        jest.advanceTimersByTime(5000);

        expect(Notification).toHaveBeenCalled();
        expect(mockShow).toHaveBeenCalled();
        expect(loggingUtils.logMessage).toHaveBeenCalledWith(
            'INFO',
            'Notification: [INFO] Scheduled Test - Delayed message',
            'NOTIFICATIONS'
        );

        jest.useRealTimers();
    });
});