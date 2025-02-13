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

        if (upperQuery.startsWith('SELECT')) {
            return stmt.all(...params) || [];
        } else if (upperQuery.startsWith('PRAGMA')) {
            return stmt.all(...params);
        } else {
            const result = stmt.run(...params);
            return result.changes > 0 ? result : [];
        }
    } catch (error) {
        console.error('Database Error:', error.message);
        return [];
    }
}

function initializeTables() {
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

        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            project_id INTEGER NOT NULL,
            duration INTEGER NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            total_hours INTEGER NOT NULL,
            startDate TEXT NOT NULL,
            endDate TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            color TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL UNIQUE,
            value TEXT NOT NULL
        );

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

    console.info('Tables initialized');
}

module.exports = {
    connect,
    close,
    runQuery
};
