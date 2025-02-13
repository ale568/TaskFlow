const Database = require('better-sqlite3');
const path = require('path');

let db;

function connect() {
    if (!db) {
        const dbPath = path.resolve(__dirname, '../../data/taskflow.sqlite');
        db = new Database(dbPath, { verbose: console.log });

        console.info('Database connected');
        initializeTables();
    }
}

function close() {
    if (db) {
        db.close();
        db = null;
        console.info('Database connection closed');
    }
}

function runQuery(query, params = []) {
    if (!db) {
        console.warn('Database was not connected. Reconnecting...');
        connect();
    }

    try {
        const stmt = db.prepare(query);
        const upperQuery = query.trim().toUpperCase();
        let result;

        if (upperQuery.startsWith('SELECT')) {
            result = stmt.all(...params) || [];
            console.info('SELECT query executed:', query);
        } else if (upperQuery.startsWith('PRAGMA')) {
            result = stmt.all(...params) || [];
            console.info('PRAGMA query executed:', query);
        } else {
            const execResult = stmt.run(...params);
            console.info(`${upperQuery.split(' ')[0]} query executed:`, query);

            result = {
                success: execResult.changes > 0,
                changes: execResult.changes,
                lastInsertRowid: execResult.lastInsertRowid || null
            };
        }

        return result;
    } catch (error) {
        console.error('Database Error:', error.message);
        return { success: false, error: error.message, query };
    }
}


function initializeTables() {
    createAlertsTable();
    createTimeEntriesTable();
    createProjectsTable();
    createActivitiesTable();
    createReportsTable();
    createTagsTable();
    createSettingsTable();
    createTimersTable();
    console.info('Tables initialized');
}

function createAlertsTable() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            project_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            priority TEXT NOT NULL,
            date TEXT NOT NULL,
            resolved INTEGER DEFAULT 0 CHECK (resolved IN (0, 1)),
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
    `);
}

function createTimeEntriesTable() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS time_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            task TEXT NOT NULL,
            startTime TEXT NOT NULL,
            endTime TEXT NULL,
            duration INTEGER NOT NULL,
            tag_id INTEGER NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE SET NULL
        );
    `);
}

function createProjectsTable() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    `);
}

function createActivitiesTable() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            project_id INTEGER NOT NULL,
            duration INTEGER NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
    `);
}

function createReportsTable() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            total_hours INTEGER NOT NULL,
            startDate TEXT NOT NULL,
            endDate TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
    `);
}

function createTagsTable() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            color TEXT NOT NULL
        );
    `);
}

function createSettingsTable() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL UNIQUE,
            value TEXT NOT NULL
        );
    `);
}

function createTimersTable() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS timers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            task TEXT NOT NULL,
            startTime TEXT NOT NULL,
            endTime TEXT NULL,
            status TEXT NOT NULL CHECK (status IN ('running', 'paused', 'stopped')),
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
    `);
}

module.exports = {
    connect,
    close,
    runQuery
};