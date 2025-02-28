const moment = require('moment-timezone');

class DateTimeFormatUtils {
    // Default formats
    static DATE_FORMATS = {
        ISO: 'YYYY-MM-DD',
        EUROPEAN: 'DD/MM/YYYY',
        US: 'MM-DD-YYYY',
        FULL_TEXT: 'dddd, DD MMM YYYY'
    };

    static TIME_FORMATS = {
        H24: 'HH:mm',
        H24_SECONDS: 'HH:mm:ss',
        H12: 'hh:mm A',
        H12_SECONDS: 'hh:mm:ss A'
    };

    /**
     * Formats a given date into the specified format.
     * @param {string|Date} date - The date to format.
     * @param {string} format - Desired format (default: ISO).
     * @returns {string} Formatted date.
     */
    static formatDate(date, format = DateTimeFormatUtils.DATE_FORMATS.ISO) {
        return moment(date).format(format);
    }

    /**
     * Formats time in 12h or 24h format.
     * @param {string|Date} date - The date to extract time from.
     * @param {boolean} format12h - Use 12-hour format if true (default: false).
     * @param {boolean} showSeconds - Include seconds in output (default: false).
     * @returns {string} Formatted time.
     */
    static formatTime(date, format12h = false, showSeconds = false) {
        const format = format12h
            ? (showSeconds ? DateTimeFormatUtils.TIME_FORMATS.H12_SECONDS : DateTimeFormatUtils.TIME_FORMATS.H12)
            : (showSeconds ? DateTimeFormatUtils.TIME_FORMATS.H24_SECONDS : DateTimeFormatUtils.TIME_FORMATS.H24);

        return moment(date).format(format);
    }

    /**
     * Gets the current date in the specified format.
     * @param {string} format - Desired format (default: ISO).
     * @returns {string} Current formatted date.
     */
    static getCurrentDate(format = DateTimeFormatUtils.DATE_FORMATS.ISO) {
        return moment().format(format);
    }

    /**
     * Gets the current time in the specified format.
     * @param {boolean} format12h - Use 12-hour format if true (default: false).
     * @param {boolean} showSeconds - Include seconds in output (default: false).
     * @returns {string} Current formatted time.
     */
    static getCurrentTime(format12h = false, showSeconds = false) {
        return this.formatTime(moment(), format12h, showSeconds);
    }

    /**
     * Converts a timestamp to a readable date format.
     * @param {number} timestamp - Unix timestamp.
     * @param {string} format - Desired format (default: ISO).
     * @returns {string} Formatted date.
     */
    static timestampToDate(timestamp, format = 'YYYY-MM-DD HH:mm:ss') {
        return moment.unix(timestamp).format(format);
    }

    /**
     * Converts a time from 24h to 12h format.
     * @param {string} time - Time in 24-hour format.
     * @returns {string} Time in 12-hour format.
     */
    static convertTo12hFormat(time) {
        return moment(time, 'HH:mm').format('hh:mm A');
    }

    /**
     * Converts a time from 12h to 24h format.
     * @param {string} time - Time in 12-hour format.
     * @returns {string} Time in 24-hour format.
     */
    static convertTo24hFormat(time) {
        return moment(time, 'hh:mm A').format('HH:mm');
    }

    /**
     * Adds time to a date.
     * @param {string|Date} date - The base date.
     * @param {number} amount - Amount of time to add.
     * @param {string} unit - Time unit ('days', 'hours', 'minutes').
     * @returns {string} Updated date.
     */
    static addTime(date, amount, unit) {
        return moment(date).add(amount, unit).format();
    }

    /**
     * Subtracts time from a date.
     * @param {string|Date} date - The base date.
     * @param {number} amount - Amount of time to subtract.
     * @param {string} unit - Time unit ('days', 'hours', 'minutes').
     * @returns {string} Updated date.
     */
    static subtractTime(date, amount, unit) {
        return moment(date).subtract(amount, unit).format();
    }

    /**
     * Calculates the difference between two dates in the specified unit.
     * @param {string|Date} startDate - Start date.
     * @param {string|Date} endDate - End date.
     * @param {string} unit - The unit ('days', 'hours', 'minutes').
     * @returns {number} Difference between dates.
     */
    static dateDifference(startDate, endDate, unit = 'days') {
        return moment(endDate).diff(moment(startDate), unit);
    }

    /**
     * Checks if a date is today.
     * @param {string|Date} date - The date to check.
     * @returns {boolean} True if today, false otherwise.
     */
    static isToday(date) {
        return moment(date).isSame(moment(), 'day');
    }

    /**
     * Checks if a date is yesterday.
     * @param {string|Date} date - The date to check.
     * @returns {boolean} True if yesterday, false otherwise.
     */
    static isYesterday(date) {
        return moment(date).isSame(moment().subtract(1, 'day'), 'day');
    }

    /**
     * Checks if a date is in the current week.
     * @param {string|Date} date - The date to check.
     * @returns {boolean} True if within the current week, false otherwise.
     */
    static isThisWeek(date) {
        return moment(date).isSame(moment(), 'week');
    }

    /**
     * Checks if a given date is valid.
     * @param {string|Date} date - The date to check.
     * @returns {boolean} True if the date is valid, false otherwise.
     */
    static isValidDate(date) {
        return moment(date, moment.ISO_8601, true).isValid();
    }

    /**
     * Returns the relative time (e.g., '3 days ago').
     * @param {string|Date} date - The reference date.
     * @returns {string} Relative time.
     */
    static timeAgo(date) {
        return moment(date).fromNow();
    }

    /**
     * Gets the start of the week for a given date.
     * @param {string|Date} date - The reference date.
     * @returns {string} Start of the week (Monday).
     */
    static getStartOfWeek(date) {
        return moment(date).startOf('isoWeek').format(this.DATE_FORMATS.ISO);
    }

    /**
     * Gets the end of the week for a given date.
     * @param {string|Date} date - The reference date.
     * @returns {string} End of the week (Sunday).
     */
    static getEndOfWeek(date) {
        return moment(date).endOf('isoWeek').format(this.DATE_FORMATS.ISO);
    }

    /**
     * Gets the start of the month for a given date.
     * @param {string|Date} date - The reference date.
     * @returns {string} Start of the month.
     */
    static getStartOfMonth(date) {
        return moment(date).startOf('month').format(this.DATE_FORMATS.ISO);
    }

    /**
     * Gets the end of the month for a given date.
     * @param {string|Date} date - The reference date.
     * @returns {string} End of the month.
     */
    static getEndOfMonth(date) {
        return moment(date).endOf('month').format(this.DATE_FORMATS.ISO);
    }

    /**
     * Gets the start of the year for a given date.
     * @param {string|Date} date - The reference date.
     * @returns {string} Start of the year.
     */
    static getStartOfYear(date) {
        return moment(date).startOf('year').format(this.DATE_FORMATS.ISO);
    }

    /**
     * Gets the end of the year for a given date.
     * @param {string|Date} date - The reference date.
     * @returns {string} End of the year.
     */
    static getEndOfYear(date) {
        return moment(date).endOf('year').format(this.DATE_FORMATS.ISO);
    }

    /**
     * Generates an array of dates within a given range.
     * @param {string|Date} startDate - The start date.
     * @param {string|Date} endDate - The end date.
     * @param {string} unit - The time unit ('days', 'hours', etc.).
     * @returns {Array} Array of formatted date strings.
     */
    static getDateRange(startDate, endDate, unit = 'days') {
        const range = [];
        let current = moment(startDate);

        while (current.isBefore(moment(endDate)) || current.isSame(moment(endDate), unit)) {
            range.push(current.format(this.DATE_FORMATS.ISO));
            current.add(1, unit);
        }

        return range;
    }

    /**
     * Gets the last N days as an array of date strings.
     * @param {number} n - Number of days.
     * @returns {Array} Array of last N days (excluding today).
     */
    static getLastNDays(n) {
        return this.getDateRange(moment().subtract(n, 'days'), moment().subtract(1, 'days'));
    }
}

module.exports = DateTimeFormatUtils;