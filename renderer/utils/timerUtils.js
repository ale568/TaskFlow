const moment = require('moment');
const DateTimeFormatUtils = require('./dateTimeFormatUtils');

class TimerUtils {
    /**
     * Formats a duration given in milliseconds to HH:mm:ss format.
     * @param {number} ms - Duration in milliseconds.
     * @returns {string} Formatted duration.
     */
    static formatDuration(ms) {
        const duration = moment.duration(ms);
        const hours = String(Math.floor(duration.asHours())).padStart(2, '0');
        const minutes = String(duration.minutes()).padStart(2, '0');
        const seconds = String(duration.seconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }    

    /**
     * Calculates the elapsed time between two timestamps.
     * @param {string|Date} start - Start timestamp.
     * @param {string|Date} end - End timestamp.
     * @returns {string} Elapsed time in HH:mm:ss format.
     */
    static getElapsedTime(start, end) {
        const diffMs = DateTimeFormatUtils.dateDifference(start, end, 'milliseconds');
        return this.formatDuration(diffMs);
    }    

    /**
     * Starts a new timer and returns the start timestamp.
     * @returns {string} Start time in ISO format.
     */
    static startTimer() {
        return moment().toISOString();
    }

    /**
     * Pauses a timer and returns the elapsed time.
     * @param {string|Date} startTime - Start timestamp.
     * @returns {number} Elapsed time in milliseconds.
     */
    static pauseTimer(startTime) {
        return DateTimeFormatUtils.dateDifference(startTime, moment(), 'milliseconds');
    }

    /**
     * Resumes a paused timer by adding the elapsed time.
     * @param {number} pausedTime - Time already elapsed.
     * @returns {string} New start timestamp.
     */
    static resumeTimer(pausedTime) {
        return moment().subtract(pausedTime, 'milliseconds').toISOString();
    }

    /**
     * Stops a timer and calculates total elapsed time.
     * @param {string|Date} startTime - Start timestamp.
     * @returns {string} Total elapsed time in HH:mm:ss format.
     */
    static stopTimer(startTime) {
        return this.getElapsedTime(startTime, moment());
    }    

    /**
     * Calculates the total time from multiple intervals.
     * @param {Array} intervals - List of objects { start: Date, end: Date }.
     * @returns {string} Total time in HH:mm:ss format.
     */
    static calculateTotalTime(intervals) {
        let totalMs = intervals.reduce((sum, interval) => {
            const diffMs = moment(interval.end).diff(moment(interval.start));
            return sum + diffMs;
        }, 0);
    
        return this.formatDuration(totalMs);
    }       

    /**
     * Returns the current timestamp in milliseconds.
     * @returns {number} Current timestamp in ms.
     */
    static getCurrentTimestamp() {
        return moment().valueOf();
    }

    /**
     * Rounds a given duration to the nearest second, minute, or hour.
     * @param {number} ms - Duration in milliseconds.
     * @param {string} unit - Unit to round to ('seconds', 'minutes', 'hours').
     * @returns {number} Rounded time.
     */
    static roundTime(ms, unit = 'seconds') {
        const duration = moment.duration(ms);
        switch (unit) {
            case 'minutes': return Math.round(duration.asMinutes());
            case 'hours': return Math.round(duration.asHours());
            default: return Math.round(duration.asSeconds()); // Default to seconds
        }
    }

    /**
     * Starts a Pomodoro timer (25 min work, 5 min break).
     * @returns {Object} Pomodoro timer details.
     */
    static startPomodoroTimer() {
        const workStart = moment().toISOString();
        const workEnd = moment().add(25, 'minutes').toISOString();
        const breakStart = workEnd;
        const breakEnd = moment(breakStart).add(5, 'minutes').toISOString();

        return {
            workStart,
            workEnd,
            breakStart,
            breakEnd
        };
    }
}

module.exports = TimerUtils;