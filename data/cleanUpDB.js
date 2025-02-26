const fs = require('fs');
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

console.log('Cleaning up test databases...');

DATABASES.forEach(db => {
    const filePath = path.join(DB_PATH, db);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted ${db}`);
    } else {
        console.log(`⚠️ ${db} not found, skipping...`);
    }
});

console.log('Cleanup complete!');