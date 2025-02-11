const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../data/taskflow.sqlite');
const db = new Database(dbPath);

// Create tables if they do not exist
db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        project TEXT,
        type TEXT,
        priority TEXT,
        date TEXT
    );
    CREATE TABLE IF NOT EXISTS time_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project TEXT,
        task TEXT,
        startTime TEXT,
        duration INTEGER
    );
    CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project TEXT,
        total_hours INTEGER
    );
`);

module.exports = db;