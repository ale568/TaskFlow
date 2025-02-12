const dbUtils = require('../utils/dbUtils');
const TimeEntry = require('../models/timeEntry');

class TimeSheetController {
    constructor() {
        dbUtils.connect();
    }

    async addEntry(entry) {
        const query = `
            INSERT INTO time_entries (project, task, startTime, duration)
            VALUES (?, ?, ?, ?)
        `;
        const params = [entry.project, entry.task, entry.startTime, entry.duration];
        await dbUtils.runQuery(query, params);

        const lastIdQuery = `SELECT last_insert_rowid() AS id`;
        const lastIdResult = await dbUtils.runQuery(lastIdQuery);

        return new TimeEntry(
            lastIdResult[0].id,
            entry.project,
            entry.task,
            entry.startTime,
            entry.duration
        );
    }

    async removeEntry(id) {
        const query = `DELETE FROM time_entries WHERE id = ?`;
        await dbUtils.runQuery(query, [id]);
    }

    async getEntries() {
        const query = `SELECT * FROM time_entries`;
        const rows = await dbUtils.runQuery(query);

        return rows.map(row => TimeEntry.createFromDbRow(row));
    }

    async getEntriesByProject(project) {
        const query = `SELECT * FROM time_entries WHERE project = ?`;
        const rows = await dbUtils.runQuery(query, [project]);

        return rows.map(row => TimeEntry.createFromDbRow(row));
    }

    async getTotalWorkedHours() {
        const query = `SELECT SUM(duration) as total FROM time_entries`;
        const result = await dbUtils.runQuery(query);

        return result[0]?.total || 0;
    }

    async setEntries(entries) {
        await dbUtils.runQuery(`DELETE FROM time_entries`);

        for (const entry of entries) {
            await this.addEntry(entry);
        }
    }
}

module.exports = TimeSheetController;