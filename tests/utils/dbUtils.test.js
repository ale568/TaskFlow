const db = require('../../renderer/utils/dbUtils');

describe('Database Utility - Integration Tests', () => {

    beforeAll(() => {
        db.connect(); // Assicura che il database sia attivo prima di ogni test
    });

    afterAll(() => {
        db.close(); // Chiude la connessione dopo i test
    });

    test('It should successfully connect to the database', () => {
        expect(() => db.connect()).not.toThrow();
    });

    test('It should successfully close the database connection', () => {
        db.connect(); // Assicura che sia connesso prima di chiudere
        expect(() => db.close()).not.toThrow();
    });

    const expectedTables = ['alerts', 'time_entries', 'reports', 'projects', 'tags', 'activities', 'settings', 'timers'];

    test.each(expectedTables)('It should have a table named %s', (tableName) => {
        const result = db.runQuery("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [tableName]);
        expect(result.length).toBe(1);
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

    test('It should execute an INSERT query and return result', () => {
        db.runQuery("DELETE FROM projects WHERE name = ?", ["Test Project"]); // Pulisce eventuali dati preesistenti
    
        const insertResult = db.runQuery(
            "INSERT INTO projects (name, description, created_at, updated_at) VALUES (?, ?, ?, ?)",
            ["Test Project", "A test project", "2025-02-15", "2025-02-15"]
        );
    
        expect(insertResult).toHaveProperty("success", true);
        expect(insertResult).toHaveProperty("changes", 1);
        expect(insertResult).toHaveProperty("lastInsertRowid");
        expect(insertResult.lastInsertRowid).toBeGreaterThan(0);
    });

    test('It should execute an UPDATE query and return result', () => {
        db.runQuery("INSERT INTO settings (key, value) VALUES (?, ?)", ["theme", "dark"]);
        const updateResult = db.runQuery("UPDATE settings SET value = ? WHERE key = ?", ["light", "theme"]);
        expect(updateResult.changes).toBe(1);
    });

    test('It should execute a DELETE query and return result', () => {
        db.runQuery("INSERT INTO settings (key, value) VALUES (?, ?)", ["temp", "delete_me"]);
        const deleteResult = db.runQuery("DELETE FROM settings WHERE key = ?", ["temp"]);
        expect(deleteResult.changes).toBe(1);
    });

    test('It should handle SQL errors gracefully and return error object', () => {
        const result = db.runQuery("INVALID SQL SYNTAX");
        expect(result).toHaveProperty('success', false);
        expect(result).toHaveProperty('error');
    });

    test('It should automatically reconnect if the database is not connected', () => {
        db.close();
        const result = db.runQuery("SELECT 1");
        expect(result).toBeDefined();
    });

    test('It should prevent SQL Injection attempts', () => {
        const result = db.runQuery("SELECT * FROM projects WHERE name = ?", ["' OR 1=1 --"]);
        expect(result).toEqual([]);
    });

});
