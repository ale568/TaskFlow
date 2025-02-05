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
});