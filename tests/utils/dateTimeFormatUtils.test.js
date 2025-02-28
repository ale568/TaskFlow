const DateTimeFormatUtils = require('../../renderer/utils/dateTimeFormatUtils');
const moment = require('moment-timezone');

describe('DateTimeFormatUtils Tests', () => {

    test('It should format dates correctly', () => {
        const date = '2024-03-10';
        expect(DateTimeFormatUtils.formatDate(date, DateTimeFormatUtils.DATE_FORMATS.ISO)).toBe('2024-03-10');
        expect(DateTimeFormatUtils.formatDate(date, DateTimeFormatUtils.DATE_FORMATS.EUROPEAN)).toBe('10/03/2024');
        expect(DateTimeFormatUtils.formatDate(date, DateTimeFormatUtils.DATE_FORMATS.US)).toBe('03-10-2024');
    });

    test('It should format times correctly', () => {
        const date = '2024-03-10T14:30:00';
        expect(DateTimeFormatUtils.formatTime(date)).toBe('14:30');
        expect(DateTimeFormatUtils.formatTime(date, true)).toBe('02:30 PM');
        expect(DateTimeFormatUtils.formatTime(date, true, true)).toBe('02:30:00 PM');
        expect(DateTimeFormatUtils.formatTime(date, false, true)).toBe('14:30:00');
    });

    test('It should get current date and time', () => {
        const today = moment().format(DateTimeFormatUtils.DATE_FORMATS.ISO);
        expect(DateTimeFormatUtils.getCurrentDate()).toBe(today);
    });

    test('It should convert timestamp to date', () => {
        const timestamp = 1710000000; // Arbitrary timestamp
        const expectedDate = moment.unix(timestamp).format('YYYY-MM-DD HH:mm:ss');
        expect(DateTimeFormatUtils.timestampToDate(timestamp)).toBe(expectedDate);
    });

    test('It should convert between timezones', () => {
        const date = '2024-03-10T12:00:00Z';
        const convertedDate = DateTimeFormatUtils.convertTimezone(date, 'America/New_York');
        expect(convertedDate).toContain('-05:00'); // EST timezone check
    });

    test('It should calculate differences between dates', () => {
        const startDate = '2024-03-01';
        const endDate = '2024-03-10';
        expect(DateTimeFormatUtils.dateDifference(startDate, endDate, 'days')).toBe(9);
        expect(DateTimeFormatUtils.dateDifference(startDate, endDate, 'hours')).toBe(9 * 24);
    });

    test('It should manipulate dates correctly', () => {
        const date = '2024-03-10';
        expect(DateTimeFormatUtils.addTime(date, 5, 'days')).toBe(moment(date).add(5, 'days').format());
        expect(DateTimeFormatUtils.subtractTime(date, 3, 'days')).toBe(moment(date).subtract(3, 'days').format());
    });

    test('It should get start and end of the week/month/year', () => {
        const date = '2024-03-10';
        expect(DateTimeFormatUtils.getStartOfWeek(date)).toBe(moment(date).startOf('isoWeek').format('YYYY-MM-DD'));
        expect(DateTimeFormatUtils.getEndOfWeek(date)).toBe(moment(date).endOf('isoWeek').format('YYYY-MM-DD'));
        expect(DateTimeFormatUtils.getStartOfMonth(date)).toBe(moment(date).startOf('month').format('YYYY-MM-DD'));
        expect(DateTimeFormatUtils.getEndOfMonth(date)).toBe(moment(date).endOf('month').format('YYYY-MM-DD'));
        expect(DateTimeFormatUtils.getStartOfYear(date)).toBe(moment(date).startOf('year').format('YYYY-MM-DD'));
        expect(DateTimeFormatUtils.getEndOfYear(date)).toBe(moment(date).endOf('year').format('YYYY-MM-DD'));
    });

    test('It should generate correct date ranges', () => {
        const range = DateTimeFormatUtils.getDateRange('2024-03-01', '2024-03-05');
        expect(range.length).toBe(5);
        expect(range[0]).toBe('2024-03-01');
        expect(range[4]).toBe('2024-03-05');
    });

    test('It should get last N days correctly', () => {
        const last7Days = DateTimeFormatUtils.getLastNDays(7);
        expect(last7Days.length).toBe(7);
        expect(last7Days[0]).toBe(moment().subtract(7, 'days').format('YYYY-MM-DD'));
    });

    test('It should validate dates correctly', () => {
        expect(DateTimeFormatUtils.isValidDate('2024-03-10')).toBe(true);
        expect(DateTimeFormatUtils.isValidDate('2024-02-30')).toBe(false); // Invalid date
    });

    test('It should check relative dates correctly', () => {
        expect(DateTimeFormatUtils.isToday(moment().format('YYYY-MM-DD'))).toBe(true);
        expect(DateTimeFormatUtils.isYesterday(moment().subtract(1, 'days').format('YYYY-MM-DD'))).toBe(true);
        expect(DateTimeFormatUtils.isThisWeek(moment().format('YYYY-MM-DD'))).toBe(true);
    });

    test('It should return relative time correctly', () => {
        const threeDaysAgo = moment().subtract(3, 'days').format();
        expect(DateTimeFormatUtils.timeAgo(threeDaysAgo)).toContain('days ago');
    });
});