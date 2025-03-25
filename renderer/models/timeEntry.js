const storageUtils = require('../utils/storageUtils');
const dbUtils = require('../utils/dbUtils');

class TimeEntry {
    // static dbName = 'taskflow_test_timeEntry.sqlite'; - Default test database
    static dbName = 'taskflow.sqlite'; // Default test database

    /**
     * Sets the database to use (for test or production environments).
     * @param {string} databaseName - The database file name.
     */
    static setDatabase(databaseName) {
        this.dbName = databaseName;
    }

    /**
     * Creates a new time entry.
     * @param {number} project_id - The associated project ID.
     * @param {string} task - The task name.
     * @param {string} startTime - The start time (ISO format).
     * @param {string|null} endTime - The end time (ISO format or null).
     * @param {number|null} tag_id - The associated tag ID (optional).
     * @returns {Promise<number>} The ID of the newly created time entry.
     */
    static async createTimeEntry(project_id, task, startTime, endTime = null, tag_id = null) {
        return await storageUtils.createRecord('time_entries', {
            project_id,
            task,
            startTime,
            endTime,
            tag_id
        }, this.dbName);
    }

    /**
     * Retrieves a time entry by ID.
     * @param {number} id - The time entry ID.
     * @returns {Promise<Object|null>} The time entry object or null if not found.
     */
    static async getTimeEntryById(id) {
        return await storageUtils.getRecordById('time_entries', id, this.dbName);
    }

    /**
     * Updates an existing time entry.
     * @param {number} id - The time entry ID.
     * @param {Object} updates - The updated fields.
     * @returns {Promise<boolean>} True if the update was successful, false otherwise.
     */
    static async updateTimeEntry(id, updates) {
        return await storageUtils.updateRecord('time_entries', id, updates, this.dbName);
    }

    /**
     * Deletes a time entry from the database.
     * @param {number} id - The time entry ID.
     * @returns {Promise<boolean>} True if the deletion was successful.
     */
    static async deleteTimeEntry(id) {
        return await storageUtils.deleteRecord('time_entries', id, this.dbName);
    }

    /**
     * Retrieves all time entries from the database.
     * @returns {Promise<Array>} An array of all time entries.
     */
    static async getAllTimeEntries() {
        return await storageUtils.getAllRecords('time_entries', this.dbName);
    }

    static async getTimeEntriesByDateRange(startDate, endDate) {
        const query = `
            SELECT * FROM time_entries
            WHERE DATE(startTime) BETWEEN DATE(?) AND DATE(?)
            ORDER BY startTime ASC;
        `;
        const params = [startDate, endDate];
        return await dbUtils.runQuery(query, params);
    }    

    static async getDailyProjectTimeEntries() {
        const query = `
            SELECT 
                p.id AS project_id,
                p.name AS project_name,
                t.color AS project_color,
                SUM(te.duration) AS total_minutes
            FROM time_entries te
            JOIN projects p ON te.project_id = p.id
            LEFT JOIN tags t ON te.tag_id = t.id
            WHERE DATE(te.startTime) = DATE('now')
            GROUP BY p.id, p.name, t.color
            ORDER BY total_minutes DESC;

        `;
    
        try {
            const results = await dbUtils.runQuery(query, []);
            return results;
        } catch (error) {
            console.error("❌ Errore nel recupero delle entry giornaliere:", error);
            return [];
        }
    }

    static async getAggregatedTimeEntries({ projectIds, period, date }) {
        let groupByClause = '';
        let whereDateClause = '';
        const params = [];
    
        const dateObj = new Date(date);
        const isoDate = dateObj.toISOString().split('T')[0];
    
        // GROUP BY e WHERE dinamici
        switch (period) {
            case 'day':
                groupByClause = "strftime('%H', te.startTime)"; // ore
                whereDateClause = `DATE(te.startTime) = DATE(?)`;
                params.push(isoDate);
                break;
            case 'week':
                groupByClause = "strftime('%w', te.startTime)"; // giorno della settimana 0-6
                const monday = new Date(dateObj);
                monday.setDate(dateObj.getDate() - dateObj.getDay() + 1);
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                whereDateClause = `DATE(te.startTime) BETWEEN DATE(?) AND DATE(?)`;
                params.push(monday.toISOString().split('T')[0], sunday.toISOString().split('T')[0]);
            break;
            case 'month':
                groupByClause = "strftime('%d', te.startTime)"; // giorno del mese
                whereDateClause = `strftime('%Y-%m', te.startTime) = ?`;
                params.push(isoDate.substring(0, 7)); // yyyy-mm
            break;

            case 'year':
                groupByClause = "strftime('%m', te.startTime)"; // mese
                whereDateClause = `strftime('%Y', te.startTime) = ?`;
                params.push(isoDate.substring(0, 4)); // yyyy
            break;
            default:
                throw new Error(`Unsupported period type: ${period}`);
        }
    
        // project ID
        const projectFilter = projectIds.length ? `AND te.project_id IN (${projectIds.map(() => '?').join(',')})` : '';
        params.push(...projectIds);
    
        const query = `
          SELECT 
            ${groupByClause} AS label,
            SUM(te.duration) AS total_minutes
          FROM time_entries te
          WHERE ${whereDateClause}
          ${projectFilter}
          GROUP BY label
          ORDER BY label ASC;
        `;
    
        try {
          const results = await dbUtils.runQuery(query, params);
          return results;
        } catch (error) {
          console.error("❌ Errore nel recupero aggregato delle time entries:", error);
          return [];
        }
    }
    
}

module.exports = TimeEntry;