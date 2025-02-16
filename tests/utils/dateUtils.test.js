const dateUtils = require('../../renderer/utils/dateUtils');

describe('Date Utils', () => {

    test('It should format the date correctly', () => {
        const date = new Date('2025-01-10T15:40:45');
        expect(dateUtils.formatDate(date, 'YYYY-MM-DD')).toBe('2025-01-10');
        expect(dateUtils.formatDate(date, 'DD/MM/YYYY')).toBe('10/01/2025');
        expect(dateUtils.formatDate(date, 'MM/DD/YYYY')).toBe('01/10/2025'); // Nuovo formato aggiunto
    });

    test('It should return null for unsupported date formats', () => {
        const date = new Date('2025-01-10T15:40:45');
        expect(dateUtils.formatDate(date, 'YYYY/MM/DD')).toBe(null); // Non supportato
        expect(dateUtils.formatDate(date, 'invalid-format')).toBe(null); // Non supportato
    });

    test('It should handle valid string dates', () => {
        expect(dateUtils.formatDate('2025-02-10', 'YYYY-MM-DD')).toBe('2025-02-10'); // Ora accetta stringhe valide
    });

    test('It should calculate the difference between two dates in days', () => {
        const start = new Date('2025-01-25');
        const end = new Date('2025-01-30');
        expect(dateUtils.dateInDays(start, end)).toBe(5);
    });

    test('It should return 0 for invalid date inputs in dateInDays', () => {
        expect(dateUtils.dateInDays(null, new Date())).toBe(0);
        expect(dateUtils.dateInDays(new Date(), 'invalid-date')).toBe(0);
    });

    test('It should verify if a date is in the future', () => {
        const futureDate = new Date(Date.now() + 10000000);
        expect(dateUtils.isFutureDate(futureDate)).toBe(true);
        expect(dateUtils.isFutureDate('2025-12-31')).toBe(true); // Ora accetta stringhe
    });

    test('It should return false for invalid future dates', () => {
        expect(dateUtils.isFutureDate(null)).toBe(false);
        expect(dateUtils.isFutureDate('invalid-date')).toBe(false);
    });

    test('It should add and subtract days from a date', () => {
        const initialDate = new Date('2025-01-15');
        expect(dateUtils.addDays(initialDate, 5).toISOString().slice(0, 10)).toBe('2025-01-20');
        expect(dateUtils.addDays(initialDate, -4).toISOString().slice(0, 10)).toBe('2025-01-11');
    });

    test('addDays should manage invalid input', () => {
        expect(dateUtils.addDays(null, 5)).toBe(null);
        expect(dateUtils.addDays('2025-02-10', '5')).toBe(null); // Il numero di giorni deve essere un intero
        expect(dateUtils.addDays('invalid-date', 5)).toBe(null);
    });
});
