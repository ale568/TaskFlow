const dbUtils = require('./dbUtils');
const LoggingUtils = require('../utils/loggingUtils');

/**
 * Configuration object defining required and auto-generated fields for each table.
 */
const TABLE_CONFIGS = {
    projects: { requiredFields: ['name'], autoFields: ['created_at', 'updated_at'] },
    timers: { requiredFields: ['project_id', 'task', 'startTime', 'status'], autoFields: [] },
    alerts: { requiredFields: ['title', 'project_id', 'type', 'priority', 'date', 'resolved'], autoFields: [] },
    reports: { requiredFields: ['project_id', 'total_hours', 'startDate', 'endDate'], autoFields: ['created_at', 'updated_at'] },
    tags: { requiredFields: ['name', 'color'], autoFields: [] },
    settings: { requiredFields: ['key', 'value'], autoFields: [] },
    activities: { requiredFields: ['name', 'project_id', 'duration'], autoFields: ['created_at'] },
    time_entries: { requiredFields: ['project_id', 'task', 'startTime'], autoFields: ['updated_at', 'duration'] },
};

/**
 * Validates data before inserting or updating records.
 */
function validateData(table, data) {
    if (!TABLE_CONFIGS[table]) throw new Error(`Unknown table: ${table}`);

    const { requiredFields } = TABLE_CONFIGS[table];

    requiredFields.forEach(field => {
        if (!(field in data)) {
            throw new Error(`Missing required field: ${field}`);
        }

        if (['name', 'task', 'title', 'type', 'priority', 'key'].includes(field)) {
            if (typeof data[field] !== 'string' || data[field].trim() === '') {
                throw new Error(`Invalid value for field "${field}": must be a non-empty string`);
            }
        }

        if (['project_id', 'duration', 'total_hours', 'resolved'].includes(field)) {
            if (typeof data[field] !== 'number' || isNaN(data[field]) || data[field] < 0) {
                throw new Error(`Invalid value for field "${field}": must be a positive number`);
            }
        }
    });
}

class StorageUtils {
    /**
     * Creates a new record in the specified table.
     */
    static async createRecord(table, data, databaseName = 'taskflow.sqlite') {
        validateData(table, data);

        const { autoFields = [] } = TABLE_CONFIGS[table];

        const autoValues = {};
        if (autoFields.includes('created_at')) autoValues.created_at = new Date().toISOString();
        if (autoFields.includes('updated_at')) autoValues.updated_at = new Date().toISOString();

        const fields = [...Object.keys(data), ...Object.keys(autoValues)];
        const values = [...Object.values(data), ...Object.values(autoValues)];
        const placeholders = fields.map(() => '?').join(',');

        const query = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING id`;

        try {
            const result = await dbUtils.runQuery(query, values, databaseName);
            if (!result.success) throw new Error(`Failed to create record in ${table}`);
            
            LoggingUtils.logMessage('info', `Record created in ${table}, ID: ${result.lastInsertRowid}`, 'DB');
            return result.lastInsertRowid;
        } catch (error) {
            LoggingUtils.logMessage('error', `Database error inserting into ${table}: ${error.message}`, 'ERRORS');
            throw new Error(error.message);
        }
    }

    /**
     * Retrieves a record by ID.
     */
    static async getRecordById(table, id, databaseName = 'taskflow.sqlite') {
        if (!TABLE_CONFIGS[table]) throw new Error(`Unknown table: ${table}`);
        if (typeof id !== 'number' || id <= 0) throw new Error('Invalid ID: must be a positive number');

        const query = `SELECT * FROM ${table} WHERE id = ?`;
        const result = await dbUtils.runQuery(query, [id], databaseName);

        if (result.length) {
            LoggingUtils.logMessage('info', `Retrieved record from ${table}, ID: ${id}`, 'DB');
            return result[0];
        } else {
            LoggingUtils.logMessage('warn', `Record ID ${id} not found in ${table}`, 'DB');
            return null;
        }
    }

    /**
     * Retrieves all records from a table.
     */
    static async getAllRecords(table, databaseName = 'taskflow.sqlite') {
        if (!TABLE_CONFIGS[table]) throw new Error(`Unknown table: ${table}`);

        const query = `SELECT * FROM ${table}`;
        const result = await dbUtils.runQuery(query, [], databaseName);

        LoggingUtils.logMessage('info', `Retrieved all records from ${table}, count: ${result.length}`, 'DB');
        return result;
    }

    /**
     * Updates an existing record.
     */
    static async updateRecord(table, id, updates, databaseName = 'taskflow.sqlite') {
    
        const fields = Object.keys(updates).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updates), id];
    
        const query = `UPDATE ${table} SET ${fields} WHERE id = ? RETURNING *`;
    
        try {
            const result = await dbUtils.runQuery(query, values, databaseName);
            
            return result.success ? { success: true } : { success: false };
        } catch (error) {
            console.error(`[ERROR] Database update failed: ${error.message}`);
            return { success: false };
        }
    }    

    /**
     * Deletes a record by ID.
     */
    static async deleteRecord(table, id, databaseName = 'taskflow.sqlite') {
        if (!TABLE_CONFIGS[table]) throw new Error(`Unknown table: ${table}`);
        if (typeof id !== 'number' || id <= 0) throw new Error('Invalid ID: must be a positive number');

        const query = `DELETE FROM ${table} WHERE id = ?`;

        try {
            const result = await dbUtils.runQuery(query, [id], databaseName);

            if (result.success) {
                LoggingUtils.logMessage('info', `Record deleted from ${table}, ID: ${id}`, 'DB');
                return true;
            } else {
                LoggingUtils.logMessage('warn', `Failed to delete record from ${table}, ID: ${id}`, 'DB');
                return false;
            }
        } catch (error) {
            LoggingUtils.logMessage('error', `Database error deleting from ${table}: ${error.message}`, 'ERRORS');
            throw new Error(`Database error deleting from ${table}: ${error.message}`);
        }
    }
}

module.exports = StorageUtils;