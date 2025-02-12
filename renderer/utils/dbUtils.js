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
        if (query.trim().toUpperCase().startsWith('SELECT')) {
            return stmt.all(...params) || [];
        } else {
            const result = stmt.run(...params);
            return result.changes;
        }
    } catch (error) {
        console.error('Database Error:', error);
        return { error: error.message, query }; // Added debug query
    }
}


function initializeTables() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            project TEXT NOT NULL,
            type TEXT NOT NULL,
            priority TEXT NOT NULL,
            date TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS time_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project TEXT NOT NULL,
            task TEXT NOT NULL,
            startTime TEXT NOT NULL,
            duration INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project TEXT NOT NULL,
            total_hours INTEGER NOT NULL
        );
    `);

    console.info('Tables initialized');
}

module.exports = {
    connect,
    close,
    runQuery
};
