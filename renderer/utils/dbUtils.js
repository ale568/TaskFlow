const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

let db;
let currentDatabase;
const LOG_FILE = path.resolve(__dirname, '../../logs/database.log');

/**
 * Logs messages to a file, but only if they indicate an error.
 * @param {string} message - The log message.
 * @param {boolean} isError - If true, logs the message. Otherwise, it does nothing.
 */
function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    
    fs.appendFileSync(LOG_FILE, logMessage);
}

/**
 * Connects to a specified SQLite database and ensures tables exist.
 * Automatically selects the test database when running in test mode.
 * @param {string} [databaseName] - The database file name.
 */
function connect(databaseName) {
    try {
        if (db) {
            close(); // Ensure no lingering connections
        }

        const isTestEnv = process.env.NODE_ENV === 'test';
        currentDatabase = databaseName || (isTestEnv ? 'taskflow_test_utils.sqlite' : 'taskflow.sqlite');

        const dbPath = path.resolve(__dirname, '../../data', currentDatabase);

        db = new Database(dbPath, { verbose: null });

        db.exec('PRAGMA foreign_keys = ON;'); // Enforce foreign key constraints
        initializeTables();
        logToFile(`✅ Connected to database: ${currentDatabase}`);
    } catch (error) {
        logToFile(`❌ Database connection failed: ${error.message}`);
        console.error(`❌ Database connection failed: ${error.message}`);
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
            logToFile('📴 Database connection closed');
        } catch (error) {
            logToFile(`⚠️ Error closing database: ${error.message}`);
        }
    }
}

/**
 * Runs an SQL query asynchronously with optional parameters.
 * @param {string} query - The SQL query to execute.
 * @param {Array} [params=[]] - Query parameters.
 * @returns {Promise<Object|Array>} - Query result or error object.
 */
async function runQuery(query, params = []) {
    try {
        if (!db) {
            logToFile('⚠️ Database was not connected. Reconnecting...');
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

        logToFile(`✅ Query executed: ${query}`);
        return result; 
    } catch (error) {
        logToFile(`❌ Database Error: ${error.message} | Query: ${query}`);
        return { success: false, error: error.message }; // Instead of throwing, return an error object
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
    logToFile('✅ All tables initialized successfully.');
}

/**
 * Resets the database by clearing all tables and recreating them.
 */
function resetDatabase() {
    if (!db) {
        logToFile('⚠️ No active database connection. Cannot reset.');
        return;
    }

    const tables = ['alerts', 'time_entries', 'projects', 'tags'];
    tables.forEach(table => {
        db.exec(`DELETE FROM ${table};`); // Delete all records
        db.exec(`DELETE FROM sqlite_sequence WHERE name='${table}';`); // Reset autoincrement IDs
    });

    initializeTables(); // Ensure tables exist after reset
    logToFile('♻️ Database reset completed.');
}

/**
 *  Getter to retrieve the current database name in dbUtils.js
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

module.exports = {
    connect,
    close,
    runQuery,
    resetDatabase,
    reconnect,
    getCurrentDatabase
};