const db = require('../../renderer/utils/dbUtils');
const fs = require('fs');
const path = require('path');

const TEST_DB_PATH = 'taskflow_test_utils.sqlite';
const LOG_FILE = path.resolve(__dirname, '../../logs/db.log');

describe('Database Utility - Integration Tests', () => {

    beforeAll(() => {
        db.connect(TEST_DB_PATH);
    });

    afterAll(() => {
        db.close();
    });

    test('It should be connected to the test database', () => {
        expect(db.getCurrentDatabase()).toBe(TEST_DB_PATH);
    });

    test('It should insert and retrieve a project', async () => {
        await db.runQuery("INSERT INTO projects (name, description) VALUES (?, ?)", ["Test Project", "A test project"]);
        
        const result = await db.runQuery("SELECT * FROM projects WHERE name = ?", ["Test Project"]);
        expect(result.length).toBe(1);
        expect(result[0].name).toBe("Test Project");
    });

    test('It should reset the database correctly', async () => {
        db.resetDatabase();

        const result = await db.runQuery("SELECT COUNT(*) as count FROM projects");
        expect(result[0].count).toBe(0);
    });

    test('It should execute two concurrent queries without data corruption', async () => {
        await Promise.all([
            db.runQuery("INSERT INTO projects (name) VALUES (?)", ["Concurrent Project 1"]),
            db.runQuery("INSERT INTO projects (name) VALUES (?)", ["Concurrent Project 2"])
        ]);

        const projects = await db.runQuery("SELECT * FROM projects WHERE name IN (?, ?)", ["Concurrent Project 1", "Concurrent Project 2"]);
        expect(projects.length).toBe(2);
    });

    test('It should connect to the default database if no name is provided', () => {
        db.close();
        
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
    
        db.connect();
        expect(db.getCurrentDatabase()).toBe('taskflow.sqlite');
    
        process.env.NODE_ENV = originalEnv;
    });

    test('It should not reconnect if already connected', () => {
        db.connect(TEST_DB_PATH);
        expect(() => db.connect(TEST_DB_PATH)).not.toThrow();
    });

    test('It should handle closing an already closed database', () => {
        db.close();
        expect(() => db.close()).not.toThrow();
    });

    test('It should return the correct current database', () => {
        expect(db.getCurrentDatabase()).toBe(TEST_DB_PATH);
    });

    test('It should handle and log SQL errors correctly', async () => {
        try {
            await db.runQuery("INVALID SQL QUERY");
        } catch (error) {
            expect(error.message).toContain("syntax error");
        }
    });

    test('It should not reset the database if no connection exists', () => {
        db.close();
        expect(() => db.resetDatabase()).not.toThrow();
    });

    test('It should log database queries to a file', async () => {
        await db.runQuery("INSERT INTO projects (name, description) VALUES ('Test Project', 'Description')");
    
        const logs = fs.readFileSync(LOG_FILE, 'utf8');
        expect(logs).toMatch(/Query executed: INSERT INTO projects/);
    });      

    test('It should log database errors to a file', async () => {
        try {
            await db.runQuery("INVALID SQL QUERY");
        } catch (error) {
            const logs = fs.readFileSync(LOG_FILE, 'utf8');
            expect(logs).toMatch(/Database Error:.*syntax error/i);
        }
    });

    test('It should throw an error if database connection fails', () => {
        db.close();
        
        const connectSpy = jest.spyOn(db, 'connect').mockImplementation(() => {
            throw new Error('Forced connection error');
        });
    
        expect(() => db.connect(TEST_DB_PATH)).toThrow('Forced connection error');
    
        connectSpy.mockRestore();
    });
    
    test('It should reconnect if a query is executed while database is closed', async () => {
        db.close(); 
        
        const logSpy = jest.spyOn(require('../../renderer/utils/loggingUtils'), 'logMessage');
        
        await db.runQuery("SELECT 1"); 
        
        expect(logSpy).toHaveBeenCalledWith('warn', 'Database was not connected. Reconnecting...', 'DB');
        
        logSpy.mockRestore();
    });

    test('It should return the current database name', () => {
        db.connect(TEST_DB_PATH);
        expect(db.getCurrentDatabase()).toBe(TEST_DB_PATH);
    });
});