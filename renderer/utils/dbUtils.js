const Database = require('better-sqlite3');
const path = require('path');
const LoggingUtils = require('../utils/loggingUtils');

let db;
let currentDatabase;

/**
 * Connects to a specified SQLite database and ensures tables exist.
 * Automatically selects the test database when running in test mode.
 * @param {string} [databaseName] - The database file name.
 */
function connect(databaseName) {
    try {
        if (db) {
            close();
        }

        const isTestEnv = process.env.NODE_ENV === 'test';
        currentDatabase = databaseName || (isTestEnv ? 'taskflow_test_utils.sqlite' : 'taskflow.sqlite');

        const dbPath = path.resolve(__dirname, '../../data', currentDatabase);
        db = new Database(dbPath, { verbose: null });

        db.exec('PRAGMA foreign_keys = ON;');
        db.exec('PRAGMA journal_mode = WAL;');

        LoggingUtils.logMessage('info', `Connected to database: ${currentDatabase}`, 'DATABASE');
        initializeTables();
    } catch (error) {
        LoggingUtils.logMessage('error', `Database connection failed: ${error.message}`, 'DATABASE');
        throw new Error('Failed to connect to the database');
    }
}

/**
 * Closes the database connection.
 */
function close() {
    if (db) {
        try {
            db.close();
            db = null;
            LoggingUtils.logMessage('info', 'Database connection closed', 'DATABASE');
        } catch (error) {
            LoggingUtils.logMessage('error', `Error closing database: ${error.message}`, 'DATABASE');
        }
    }
}

/**
 * Runs an SQL query asynchronously with optional parameters.
 * @param {string} query - The SQL query to execute.
 * @param {Array} [params=[]] - Query parameters.
 * @returns {Object|Array} - Query result or error object.
 */
async function runQuery(query, params = []) {
    try {
        if (!db) {
            LoggingUtils.logMessage('warn', 'Database was not connected. Reconnecting...', 'DB');
            connect(currentDatabase);
        }

        const stmt = db.prepare(query);
        const upperQuery = query.trim().toUpperCase();
        let result;

        if (upperQuery.startsWith('SELECT') || upperQuery.startsWith('PRAGMA')) {
            result = stmt.all(...params) || [];
        } else {
            const execResult = stmt.run(...params);
            result = {
                success: execResult.changes > 0,
                changes: execResult.changes,
                lastInsertRowid: execResult.lastInsertRowid || null
            };
        }

        LoggingUtils.logMessage('info', `Query executed: ${query}`, 'DB');
        return result; 
    } catch (error) {
        LoggingUtils.logMessage('error', `Database Error: ${error.message} | Query: ${query}`, 'ERRORS');
        return { success: false, error: error.message };
    }
}

/**
 * Ensures all necessary database tables exist.
 */
function initializeTables() {
    const tables = [
        `CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );`,
        `CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            project_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            priority TEXT NOT NULL,
            date TEXT NOT NULL,
            resolved INTEGER DEFAULT 0 CHECK (resolved IN (0,1)),
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );`,
        `CREATE TABLE IF NOT EXISTS time_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            task TEXT NOT NULL,
            startTime TEXT NOT NULL,
            endTime TEXT NULL,
            duration INTEGER GENERATED ALWAYS AS (strftime('%s', endTime) - strftime('%s', startTime)) VIRTUAL,
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            tag_id INTEGER NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE SET NULL
        );`,
        `CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            project_id INTEGER NOT NULL,
            duration INTEGER NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );`,
        `CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            total_hours INTEGER NOT NULL,
            startDate TEXT NOT NULL,
            endDate TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );`,
        `CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            color TEXT NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL UNIQUE,
            value TEXT NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS timers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            task TEXT NOT NULL,
            startTime TEXT NOT NULL,
            endTime TEXT NULL,
            status TEXT NOT NULL CHECK (status IN ('running', 'paused', 'stopped')),
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );`
    ];

    tables.forEach(query => db.exec(query));
    LoggingUtils.logMessage('info', 'All tables initialized successfully.', 'DATABASE');
}

/**
 * Resets the database by clearing all tables and recreating them.
 */
function resetDatabase() {
    if (!db) {
        LoggingUtils.logMessage('warn', 'No active database connection. Cannot reset.', 'DATABASE');
        return;
    }

    const tables = ['alerts', 'time_entries', 'projects', 'tags'];
    tables.forEach(table => {
        db.exec(`DELETE FROM ${table};`);
        db.exec(`DELETE FROM sqlite_sequence WHERE name='${table}';`);
    });

    initializeTables();
    LoggingUtils.logMessage('info', 'Database reset completed.', 'DATABASE');
}

/**
 * Getter to retrieve the current database name.
 */
function getCurrentDatabase() {
    return currentDatabase;
}

/**
 * Reconnects to the database (useful for test cases).
 * @param {string} databaseName - The database file name.
 */
function reconnect(databaseName = 'taskflow_test_utils.sqlite') {
    close();
    connect(databaseName);
}

/**
 * Checks if the database connection is active.
 * @returns {boolean} True if connected, false otherwise.
 */
function isConnected() {
    return db !== null;
}

module.exports = {
    connect,
    close,
    runQuery,
    resetDatabase,
    reconnect,
    getCurrentDatabase,
    isConnected
};