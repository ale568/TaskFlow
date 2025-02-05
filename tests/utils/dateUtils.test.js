const dateUtils = require('../../renderer/utils/dateUtils');

describe('Date Utils', () => {

    test('It should format the date correctly', () => {
        const date = new Date('2025-01-10T15:40:45');
        expect(dateUtils.formatDate(date, 'YYYY-MM-DD')).toBe('2025-01-10');
        expect(dateUtils.formatDate(date, 'DD/MM/YYYY')).toBe('10/01/2025');
    });

    test('It should calculate the difference between two dates in days', () => {
        const start = new Date('2025-01-25');
        const end = new Date('2025-01-30');
        expect(dateUtils.dateInDays(start, end)).toBe(5);
    });

    test('It should verify if a date is in the future', () => {
        const futureDate = new Date(Date.now() + 10000000);
        expect(dateUtils.isFutureDate(futureDate)).toBe(true);
    });

    test('It should add and subtract days from a date', () => {
        const initialDate = new Date('2025-01-15');
        expect(dateUtils.addDays(initialDate, 5).toISOString().slice(0, 10)).toBe('2025-01-20');
        expect(dateUtils.addDays(initialDate, -4).toISOString().slice(0, 10)).toBe('2025-01-11');
    });

    test('formatDate should manage invalid input', () => {
        expect(dateUtils.formatDate(null, 'YYYY-MM-DD')).toBe(null);
        expect(dateUtils.formatDate(undefined, 'YYYY-MM-DD')).toBe(null);
        expect(dateUtils.formatDate('invalid date', 'YYYY-MM-DD')).toBe(null);
    });

    test('dateInDays should manage invalid input', () => {
        expect(dateUtils.dateInDays(null, new Date())).toBe(0);
        expect(dateUtils.dateInDays(new Date(), null)).toBe(0);
        expect(dateUtils.dateInDays(new Date('2025-02-10'), new Date('2025-02-01'))).toBe(-9);
    });

    test('isFutureDate should return false for an invalid input', () => {
        expect(dateUtils.isFutureDate(null)).toBe(false);
        expect(dateUtils.isFutureDate(new Date(Date.now() - 10000))).toBe(false); // Past date
        expect(dateUtils.isFutureDate('invalid date')).toBe(false);
    });

    test('addDays should manage invalid input', () => {
        const intialDate = new Date('2025-02-10');
        expect(dateUtils.addDays(intialDate, '5')).toBe(null); // The number of days should be an integer
        expect(dateUtils.addDays(null, 5)).toBe(null);  // The date should should be valid  
    });
});