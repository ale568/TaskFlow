const db = require('../../renderer/utils/dbUtils');

describe('Database Utility', () => {

    beforeAll(() => {
        db.connect(); // Ensures that the database is active
    });

    afterAll(() => {
        db.close(); // Close connession after tests
    });

    const expectedTables = ['alerts', 'time_entries', 'reports', 'projects', 'tags', 'activities', 'settings', 'timers'];

    test.each(expectedTables)('It should have a table named %s', (tableName) => {
        const result = db.runQuery("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [tableName]);
        expect(result.length).toBe(1);
    });

    test('It should have correct columns in alerts', () => {
        const result = db.runQuery("PRAGMA table_info(alerts)");
        const columns = result.map(col => col.name);

        expect(columns).toEqual(['id', 'title', 'project_id', 'type', 'priority', 'date', 'resolved']);
    });

    test('It should have correct columns in time_entries', () => {
        const result = db.runQuery("PRAGMA table_info(time_entries)");
        const columns = result.map(col => col.name);

        expect(columns).toEqual(['id', 'project_id', 'task', 'startTime', 'endTime', 'duration', 'tag_id']);
    });

    test('It should have correct columns in projects', () => {
        const result = db.runQuery("PRAGMA table_info(projects)");
        const columns = result.map(col => col.name);

        expect(columns).toEqual(['id', 'name', 'description', 'created_at', 'updated_at']);
    });

    test('It should have correct columns in activities', () => {
        const result = db.runQuery("PRAGMA table_info(activities)");
        const columns = result.map(col => col.name);

        expect(columns).toEqual(['id', 'name', 'project_id', 'duration',]);
    });

    test('It should have correct columns in reports', () => {
        const result = db.runQuery("PRAGMA table_info(reports)");
        const columns = result.map(col => col.name);

        expect(columns).toEqual(['id', 'project_id', 'total_hours', 'startDate', 'endDate']);
    });

    test('It should have correct columns in tags', () => {
        const result = db.runQuery("PRAGMA table_info(tags)");
        const columns = result.map(col => col.name);

        expect(columns).toEqual(['id', 'name', 'color']);
    });

    test('It should have correct columns in settings', () => {
        const result = db.runQuery("PRAGMA table_info(settings)");
        const columns = result.map(col => col.name);

        expect(columns).toEqual(['id', 'key', 'value']);
    });

    test('It should have correct columns in timers', () => {
        const result = db.runQuery("PRAGMA table_info(timers)");
        const columns = result.map(col => col.name);

        expect(columns).toEqual(['id', 'project_id', 'task', 'startTime', 'endTime', 'status']);
    });

    test('It should enforce NOT NULL constraints', () => {
        const result = db.runQuery("PRAGMA table_info(time_entries)");
        const notNullColumns = result.filter(col => col.notnull === 1).map(col => col.name);

        expect(notNullColumns).toEqual(expect.arrayContaining(['project_id', 'task', 'startTime', 'duration']));
    });

    test('It should enforce foreign key constraints', () => {
        const queries = [
            { table: 'time_entries', expectedFK: 'tags' },
            { table: 'time_entries', expectedFK: 'projects' },
            { table: 'alerts', expectedFK: 'projects' },
            { table: 'activities', expectedFK: 'projects' },
            { table: 'reports', expectedFK: 'projects' },
            { table: 'timers', expectedFK:'projects' }
        ];

        queries.forEach(({ table, expectedFK}) => {
            const result = db.runQuery(`PRAGMA foreign_key_list(${table})`);
            const foreignKeys = result.map(fk => fk.table);

            expect(foreignKeys).toContain(expectedFK);
        });
    });
});
