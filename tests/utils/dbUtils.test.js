const db = require('../../renderer/utils/dbUtils');

describe('Database Utility', () => {

    beforeAll(() => {
        db.exec('DELETE FROM alerts');          // Delete data before tests
        db.exec('DELETE FROM time_entries');
        db.exec('DELETE FROM reports');
    });

    afterAll(() => {
        db.close();     // Close db after tests
    });

    test('It should insert and retrieve an alert', () => {
        db.prepare('INSERT INTO alerts (title, project, type, priority, date) VALUES (?, ?, ?, ?, ?)')
            .run('Urgent Alert', 'ProjectA', 'Expiration', 'High', '2024-11-25');
        
        const alert = db.prepare('SELECT * FROM alerts WHERE title = ?').get('Urgent Alert');

        expect(alert).not.toBeNull();
        expect(alert.project).toBe('ProjectA');
        expect(alert.type).toBe('Expiration');
    });

    test('It should insert and retrieve a time entry', () => {
        db.prepare('INSERT INTO time_entries  (project, task, startTime, duration) VALUES (?, ?, ?, ?)')
            .run('ProjectB', 'Task1', '2025-02-10 10:00', 120);

        const entry = db.prepare('SELECT * FROM time_entries WHERE project = ?').get('ProjectB');

        expect(entry).not.toBeNull();
        expect(entry.task).toBe('Task1');
        expect(entry.duration).toBe(120);
    });

    test('It should and retrieve a report', () => {
        db.prepare('INSERT INTO reports (project, total_hours) VALUES (?, ?)').run('ProjectC', 50);

        const report = db.prepare('SELECT * FROM reports WHERE project = ?').get('ProjectC');

        expect(report).not.toBeNull();
        expect(report.total_hours).toBe(50);
    });

    test('it should delete an alert', () => {
        db.prepare('INSERT INTO alerts (title, project, type, priority, date) VALUES (?, ?, ?, ?, ?)')
            .run('Delete Me', 'ProjectA', 'Reminder', 'Medium', '2025-01-21');

        const inserted = db.prepare('SELECT * FROM alerts WHERE title = ?').get('Delete Me');

        expect(inserted).not.toBeNull();

        db.prepare('DELETE FROM alerts WHERE title = ?').run('Delete Me');

        const deleted = db.prepare('SELECT * FROM alerts WHERE title = ?').get('Delete Me');

        expect(deleted).toBeUndefined();
    });
});