const dbUtils = require('./dbUtils');

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
 * Helper function to validate data types before inserting into the database.
 */
function validateData(table, data) {
    if (!TABLE_CONFIGS[table]) throw new Error(`Unknown table: ${table}`);

    const { requiredFields } = TABLE_CONFIGS[table];

    requiredFields.forEach(field => {
        if (!(field in data)) {
            throw new Error(`Missing required field: ${field}`);
        }

        // Ensure specific fields have valid types
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
            return result.lastInsertRowid;
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error(error.message); // Let Jest catch this specific error
            }
            throw new Error(`Database error inserting into ${table}: ${error.message}`);
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

        return result.length ? result[0] : null;
    }

    /**
     * Retrieves all records from a table.
     */
    static async getAllRecords(table, databaseName = 'taskflow.sqlite') {
        if (!TABLE_CONFIGS[table]) throw new Error(`Unknown table: ${table}`);
    
        const query = `SELECT * FROM ${table}`;
        const result = await dbUtils.runQuery(query, [], databaseName);
    
        return result;
    }

    /**
     * Updates an existing record.
     */
    static async updateRecord(table, id, updates, databaseName = 'taskflow.sqlite') {
        if (!TABLE_CONFIGS[table]) throw new Error(`Unknown table: ${table}`);
        if (typeof id !== 'number' || id <= 0) throw new Error('Invalid ID: must be a positive number');
        if (Object.keys(updates).length === 0) throw new Error(`No fields provided to update in table: ${table}`);
    
        // Validate fields
        const validFields = TABLE_CONFIGS[table].requiredFields.concat(TABLE_CONFIGS[table].autoFields || []);
        if (table === 'time_entries') {
            validFields.push('endTime'); // Ensure endTime is recognized as a valid field for updates
        }
        for (const field of Object.keys(updates)) {
            if (!validFields.includes(field)) {
                throw new Error(`Invalid field: ${field} does not exist in ${table}`);
            }
        }
    
        const fields = Object.keys(updates).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updates), id];
    
        const query = `UPDATE ${table} SET ${fields} WHERE id = ? RETURNING *`;
    
        try {
            const result = await dbUtils.runQuery(query, values, databaseName);
            
            if (!result.success || result.changes === 0) {
                return { success: false };
            }
    
            return { success: true };
        } catch (error) {
            throw new Error(`Database error updating ${table}: ${error.message}`);
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
            return result.success;
        } catch (error) {
            throw new Error(`Database error deleting from ${table}: ${error.message}`);
        }
    }
}

module.exports = StorageUtils;