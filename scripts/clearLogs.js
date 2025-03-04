const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.resolve(__dirname, '../logs');
const LOG_FILES = ['db.log', 'controllers.log', 'system.log', 'errors.log'];

/**
 * Clears all log files.
 */
function clearLogs() {
    LOG_FILES.forEach(file => {
        const filePath = path.join(LOGS_DIR, file);

        try {
            if (fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, ''); // Clears the file without deleting it
                console.log(`Cleared: ${file}`);
            } else {
                console.log(`⚠️ File not found: ${file}`);
            }
        } catch (error) {
            console.error(`Failed to clear ${file}: ${error.message}`);
        }
    });

    console.log('Log cleanup completed.');
}

clearLogs();
