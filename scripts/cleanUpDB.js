const Database = require('better-sqlite3');
const path = require('path');

const DATABASES = [
    'taskflow_test_project.sqlite',
    'taskflow_test_activity.sqlite',
    'taskflow_test_alerts.sqlite',
    'taskflow_test_reports.sqlite',
    'taskflow_test_tags.sqlite',
    'taskflow_test_settings.sqlite',
    'taskflow_test_timeEntry.sqlite',
    'taskflow_test_timer.sqlite'
];

const DB_PATH = path.resolve(__dirname, '../data/');

console.log('Cleaning up test databases (resetting data without dropping tables)...');

DATABASES.forEach(dbName => {
    const dbFilePath = path.join(DB_PATH, dbName);
    
    try {
        const db = new Database(dbFilePath);
        
        // Retrieve all table names except SQLite system tables
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';").all();

        // Execute DELETE FROM on each table
        db.transaction(() => {
            tables.forEach(table => {
                db.prepare(`DELETE FROM ${table.name};`).run();
            });
        })();

        console.log(`Cleaned data from ${dbName}`);
        db.close();
    } catch (error) {
        console.error(`Error cleaning ${dbName}: ${error.message}`);
    }
});

console.log('Cleanup complete!');