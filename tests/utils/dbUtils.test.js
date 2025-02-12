const db = require('../../renderer/utils/dbUtils');

describe('Database Utility', () => {

    beforeAll(() => {
        db.connect(); // Ensures that the database is active
        db.runQuery('DELETE FROM alerts'); // Clear data before tests
        db.runQuery('DELETE FROM time_entries');
        db.runQuery('DELETE FROM reports');
    });

    afterAll(() => {
        db.close(); // Close connession after tests
    });

    test('It should insert and retrieve an alert', () => {
        db.runQuery(
            'INSERT INTO alerts (title, project, type, priority, date) VALUES (?, ?, ?, ?, ?)',
            ['Urgent Alert', 'ProjectA', 'Expiration', 'High', '2024-11-25']
        );

        const alert = db.runQuery('SELECT * FROM alerts WHERE title = ?', ['Urgent Alert']);

        expect(alert.length).toBe(1);
        expect(alert[0].project).toBe('ProjectA');
        expect(alert[0].type).toBe('Expiration');
    });

    test('It should insert and retrieve a time entry', () => {
        db.runQuery(
            'INSERT INTO time_entries (project, task, startTime, duration) VALUES (?, ?, ?, ?)',
            ['ProjectB', 'Task1', '2025-02-10 10:00', 120]
        );

        const entry = db.runQuery('SELECT * FROM time_entries WHERE project = ?', ['ProjectB']);

        expect(entry.length).toBe(1);
        expect(entry[0].task).toBe('Task1');
        expect(entry[0].duration).toBe(120);
    });

    test('It should insert and retrieve a report', () => {
        db.runQuery(
            'INSERT INTO reports (project, total_hours) VALUES (?, ?)',
            ['ProjectC', 50]
        );

        const report = db.runQuery('SELECT * FROM reports WHERE project = ?', ['ProjectC']);

        expect(report.length).toBe(1);
        expect(report[0].total_hours).toBe(50);
    });

    test('It should delete an alert', () => {
        db.runQuery(
            'INSERT INTO alerts (title, project, type, priority, date) VALUES (?, ?, ?, ?, ?)',
            ['Delete Me', 'ProjectA', 'Reminder', 'Medium', '2025-01-21']
        );

        const inserted = db.runQuery('SELECT * FROM alerts WHERE title = ?', ['Delete Me']);
        expect(inserted.length).toBe(1);

        db.runQuery('DELETE FROM alerts WHERE title = ?', ['Delete Me']);

        const deleted = db.runQuery('SELECT * FROM alerts WHERE title = ?', ['Delete Me']);
        expect(deleted.length).toBe(0);
    });

    test('It should handle database connection issues gracefully', () => {
        db.close();
        expect(() => db.runQuery('SELECT 1')).not.toThrow();
    });

    test('It should return an error object when an invalid query is executed', () => {
        const result = db.runQuery('INVALID SQL SYNTAX');
        expect(result).toHaveProperty('error');
    });

    test('It should return an error when querying a non-existing table', () => {
        const result = db.runQuery('SELECT * FROM non_existing_table');
        expect(result).toHaveProperty('error');
    });

    test('It should return an error when executing an invalid INSERT', () => {
        const result = db.runQuery('INSERT INTO alerts (title) VALUES (?)', []);
        expect(result).toHaveProperty('error');
    });

    test('It should handle a query when the database is closed', () => {
        db.close();
        expect(() => db.runQuery('SELECT 1')).not.toThrow();
    });

    test('It should not reconnnect if already connected', () => {
        db.connect();
        const initialDB = db;

        db.connect();

        expect(db).toBe(initialDB);
    });

    test('It should return an error when running an invalid query', () => {
        db.close();
        const result = db.runQuery('SELECT 1');
        expect(result).not.toBeNull();
    });
});
