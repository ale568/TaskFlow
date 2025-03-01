const fs = require('fs');
const path = require('path');

// Log files for different categories
const LOG_FILES = {
    DB: path.resolve(__dirname, '../../logs/db.log'),
    CONTROLLERS: path.resolve(__dirname, '../../logs/controllers.log'),
    SYSTEM: path.resolve(__dirname, '../../logs/system.log'),
    ERRORS: path.resolve(__dirname, '../../logs/errors.log'),
};

/**
 * Writes a message to a specific log file.
 * @param {string} filePath - Path to the log file.
 * @param {string} message - The log message.
 */
function logToFile(filePath, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    try {
        fs.appendFileSync(filePath, logMessage, 'utf8');
    } catch (error) {
        console.error(`Failed to write log: ${error.message}`);
    }
}

/**
 * Logs messages to the appropriate log file.
 * @param {string} level - The log level ('info', 'warn', 'error').
 * @param {string} message - The log message.
 * @param {string} [category='SYSTEM'] - The category of the log (default: 'SYSTEM').
 */
function logMessage(level, message, category = 'SYSTEM') {
    const categoryUpper = (typeof category === 'string' && category) ? category.toUpperCase() : 'SYSTEM';
    const logFile = LOG_FILES[categoryUpper] || LOG_FILES.SYSTEM;

    logToFile(logFile, `[${level}] [${categoryUpper}] ${message}`);
}

/**
 * Logs an error with stack trace.
 * @param {Error} error - The error object.
 * @param {string} category - Log category (DB, CONTROLLERS, SYSTEM, ERRORS).
 */
function logError(error, category) {
    const logFile = LOG_FILES[category.toUpperCase()] || LOG_FILES.ERRORS;
    const errorMessage = `[ERROR] [${category.toUpperCase()}] ${error.message}\nStack Trace:\n${error.stack}`;
    logToFile(logFile, errorMessage);
}

/**
 * Retrieves the last N lines from a log file.
 * @param {string} category - Log category (DB, CONTROLLERS, SYSTEM, ERRORS).
 * @param {number} limit - Number of lines to retrieve.
 * @returns {string[]} Array of log lines.
 */
function getRecentLogs(category, limit = 10) {
    const logFile = LOG_FILES[category.toUpperCase()] || LOG_FILES.SYSTEM;
    try {
        const data = fs.readFileSync(logFile, 'utf8');
        const lines = data.trim().split('\n');
        return lines.slice(-limit);
    } catch (error) {
        return [`Failed to read log file: ${error.message}`];
    }
}

module.exports = {
    logMessage,
    logError,
    getRecentLogs,
};