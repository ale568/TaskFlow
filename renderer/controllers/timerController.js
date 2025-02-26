const fs = require('fs');
const path = require('path');
const Timer = require('../models/timer');

const LOG_FILE = path.resolve(__dirname, '../../logs/controllers.log');

/**
 * Logs messages to a file instead of the terminal.
 * @param {string} message - The log message.
 */
function logToFile(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

/**
 * Controller for managing timers.
 * Handles CRUD operations for timers linked to projects.
 */
class TimerController {
    /**
     * Creates a new timer.
     * @param {number} projectId - The project ID associated with the timer.
     * @param {string} task - The task name linked to the timer.
     * @param {string} startTime - The start time in ISO format.
     * @param {string} status - The initial status of the timer (`running`, `paused`, `stopped`).
     * @returns {Promise<number>} The ID of the newly created timer.
     */
    static async createTimer(projectId, task, startTime, status) {
        try {
            return await Timer.createTimer(projectId, task, startTime, status);
        } catch (error) {
            logToFile(`❌ Error creating timer: ${error.message}`);
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
            return await Timer.getTimerById(timerId);
        } catch (error) {
            logToFile(`❌ Error retrieving timer: ${error.message}`);
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
            return await Timer.updateTimer(timerId, updates);
        } catch (error) {
            logToFile(`❌ Error updating timer: ${error.message}`);
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
            return await Timer.deleteTimer(timerId);
        } catch (error) {
            logToFile(`❌ Error deleting timer: ${error.message}`);
            throw new Error('Failed to delete timer');
        }
    }

    /**
     * Retrieves all timers.
     * @returns {Promise<Array>} An array of all timers.
     */
    static async getAllTimers() {
        try {
            return await Timer.getAllTimers();
        } catch (error) {
            logToFile(`❌ Error retrieving timers: ${error.message}`);
            throw new Error('Failed to retrieve timers');
        }
    }
}

module.exports = TimerController;