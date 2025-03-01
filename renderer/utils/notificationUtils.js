const { Notification } = require('electron');
const path = require('path');
const loggingUtils = require('./loggingUtils');

class NotificationUtils {
    /**
     * Shows a system notification.
     * @param {string} title - The notification title.
     * @param {string} message - The message body.
     * @param {'info' | 'warning' | 'error'} type - Notification type.
     * @param {boolean} [playSound=false] - Whether to play a sound.
     */
    static showNotification(title, message, type = 'info', playSound = false) {
        try {
            const notification = new Notification({
                title,
                body: message,
                icon: path.resolve(__dirname, `../../assets/icons/${type}.png`),
            });

            notification.show();

            // Play sound if enabled
            if (playSound) {
                const soundPath = path.resolve(__dirname, `../../assets/sounds/${type}.mp3`);
                new Audio(soundPath).play().catch(() => console.warn('Sound playback failed'));
            }

            // Log notification event
            loggingUtils.logMessage('INFO', `Notification: [${type.toUpperCase()}] ${title} - ${message}`, 'NOTIFICATIONS');
        } catch (error) {
            loggingUtils.logError(error, 'NOTIFICATIONS');
        }
    }

    /**
     * Schedules a notification to be shown later.
     * @param {string} title - The notification title.
     * @param {string} message - The message body.
     * @param {'info' | 'warning' | 'error'} type - Notification type.
     * @param {number} delayMs - Delay in milliseconds.
     * @param {boolean} [playSound=false] - Whether to play a sound.
     */
    static scheduleNotification(title, message, type, delayMs, playSound = false) {
        setTimeout(() => {
            this.showNotification(title, message, type, playSound);
        }, delayMs);
    }
}

module.exports = NotificationUtils;