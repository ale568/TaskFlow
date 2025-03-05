const Timer = require('../models/timer');
const loggingUtils = require('../utils/loggingUtils');
const timerUtils = require('../utils/timerUtils'); 
const dateTimeFormatUtils = require('../utils/dateTimeFormatUtils');

class TimerController {
    /**
     * Creates a new timer.
     * @param {number} projectId - The project ID associated with the timer.
     * @param {string} task - The task name linked to the timer.
     * @param {string} status - The initial status of the timer (`running`, `paused`, `stopped`).
     * @returns {Promise<number>} The ID of the newly created timer.
     */
    static async createTimer(projectId, task, status) {
        try {
            const startTime = timerUtils.startTimer();
            const timerId = await Timer.createTimer(projectId, task, startTime, status);
            loggingUtils.logMessage('info', `Timer created: Task ${task}, Project ID ${projectId}`, 'CONTROLLERS');
            return timerId;
        } catch (error) {
            loggingUtils.logMessage('error', `Error creating timer: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to create timer');
        }
    }

    /**
     * Retrieves a timer by ID.
     * @param {number} timerId - The ID of the timer.
     * @returns {Promise<Object|null>} The timer object or null if not found.
     */
    static async getTimerById(timerId) {
        try {
            const timer = await Timer.getTimerById(timerId);
            if (!timer) {
                loggingUtils.logMessage('warn', `Timer not found: ID ${timerId}`, 'CONTROLLERS');
            }
            return timer;
        } catch (error) {
            loggingUtils.logMessage('error', `Error retrieving timer: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve timer');
        }
    }

    /**
     * Updates an existing timer.
     * @param {number} timerId - The ID of the timer.
     * @param {Object} updates - The updated fields (e.g., status, endTime).
     * @returns {Promise<boolean>} True if the update was successful, false otherwise.
     */
    static async updateTimer(timerId, updates) {
        try {
            if (updates.endTime && !dateTimeFormatUtils.isValidDate(updates.endTime)) {
                throw new Error('Invalid end time format');
            }
    
            // ⬇️ Controlliamo se il timer esiste prima di aggiornarlo
            const existingTimer = await Timer.getTimerById(timerId);
            if (!existingTimer) {
                loggingUtils.logMessage('error', `Error updating timer: Timer ID ${timerId} not found`, 'CONTROLLERS');
                return { success: false };
            }
    
            const success = await Timer.updateTimer(timerId, updates);
    
            if (!success) {
                loggingUtils.logMessage('error', `Error updating timer: Timer ID ${timerId} update failed`, 'CONTROLLERS');
                return { success: false };
            }
    
            loggingUtils.logMessage('info', `Timer updated: ID ${timerId}`, 'CONTROLLERS');
            return { success: true };
        } catch (error) {
            loggingUtils.logMessage('error', `Error updating timer: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to update timer');
        }
    }    

    /**
     * Deletes a timer.
     * @param {number} timerId - The ID of the timer to delete.
     * @returns {Promise<boolean>} True if the deletion was successful.
     */
    static async deleteTimer(timerId) {
        try {
            const success = await Timer.deleteTimer(timerId);

            if (!success) {
                loggingUtils.logMessage('error', `Error deleting timer: Timer ID ${timerId} not found`, 'CONTROLLERS');
                return false;
            }

            loggingUtils.logMessage('info', `Timer deleted: ID ${timerId}`, 'CONTROLLERS');
            return true;
        } catch (error) {
            loggingUtils.logMessage('error', `Error deleting timer: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to delete timer');
        }
    }

    /**
     * Retrieves all timers.
     * @returns {Promise<Array>} An array of all timers.
     */
    static async getAllTimers() {
        try {
            const timers = await Timer.getAllTimers();
            loggingUtils.logMessage('info', `Retrieved ${timers.length} timers`, 'CONTROLLERS');
            return timers;
        } catch (error) {
            loggingUtils.logMessage('error', `Error retrieving timers: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve timers');
        }
    }

    /**
     * Stops a timer and calculates total elapsed time.
     * @param {number} timerId - The ID of the timer.
     * @returns {Promise<string>} Total elapsed time in HH:mm:ss format.
     */
    static async stopTimer(timerId) {
        try {
            const timer = await Timer.getTimerById(timerId);
            if (!timer) {
                throw new Error(`Timer not found: ID ${timerId}`);
            }

            const elapsedTime = timerUtils.stopTimer(timer.startTime);
            await Timer.updateTimer(timerId, { status: 'stopped', elapsedTime });

            loggingUtils.logMessage('info', `Timer stopped: ID ${timerId}, Elapsed: ${elapsedTime}`, 'CONTROLLERS');
            return elapsedTime;
        } catch (error) {
            loggingUtils.logMessage('error', `Error stopping timer: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to stop timer');
        }
    }
}

module.exports = TimerController;