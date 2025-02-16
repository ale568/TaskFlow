const dbUtils = require('../utils/dbUtils');

class TimeEntry {
    constructor(id, project_id, task, startTime, endTime, duration, tag_id) {
        this.id = id;
        this.project_id = project_id;
        this.task = task;
        this.startTime = startTime;
        this.endTime = endTime;
        this.duration = duration;
        this.tag_id = tag_id;
    }

    // 🔹 **Crea una nuova voce di tempo**
    static async createTimeEntry(project_id, task, startTime, tag_id = null) {
        if (!Number.isInteger(project_id) || project_id <= 0) {
            throw new Error('Invalid project ID');
        }
        if (!task || typeof task !== 'string' || task.trim() === '') {
            throw new Error('Invalid task name');
        }

        const query = `INSERT INTO time_entries (project_id, task, startTime, duration, tag_id) 
                       VALUES (?, ?, ?, 0, ?) RETURNING *`;
        const result = await dbUtils.runQuery(query, [project_id, task, startTime, tag_id]);

        if (!result || !result.success) {
            throw new Error('Failed to create time entry');
        }

        return new TimeEntry(result.lastInsertRowid, project_id, task, startTime, null, 0, tag_id);
    }

    // 🔹 **Recupera una voce di tempo per ID**
    static async getTimeEntryById(entryId) {
        if (!Number.isInteger(entryId) || entryId <= 0) {
            throw new Error('Invalid entry ID');
        }

        const query = `SELECT * FROM time_entries WHERE id = ?`;
        const result = await dbUtils.runQuery(query, [entryId]);

        if (!result || result.length === 0) {
            return null;
        }

        const row = result[0];
        return new TimeEntry(row.id, row.project_id, row.task, row.startTime, row.endTime, row.duration, row.tag_id);
    }

    // 🔹 **Recupera tutte le voci di tempo**
    static async getAllTimeEntries() {
        const query = `SELECT * FROM time_entries`;
        const results = await dbUtils.runQuery(query);

        return results.map(row => new TimeEntry(row.id, row.project_id, row.task, row.startTime, row.endTime, row.duration, row.tag_id));
    }

    // 🔹 **Aggiorna una voce di tempo**
    static async updateTimeEntry(entryId, fields) {
        if (!Number.isInteger(entryId) || entryId <= 0) {
            throw new Error('Invalid entry ID');
        }

        if (!fields || typeof fields !== 'object' || Object.keys(fields).length === 0) {
            throw new Error('No valid fields to update');
        }

        let updateFields = [];
        let updateValues = [];

        if (fields.task !== undefined) {
            if (typeof fields.task !== 'string' || fields.task.trim() === '') {
                throw new Error('Invalid task name');
            }
            updateFields.push('task = ?');
            updateValues.push(fields.task);
        }

        if (fields.endTime !== undefined) {
            updateFields.push('endTime = ?');
            updateValues.push(fields.endTime);
        }

        if (fields.duration !== undefined) {
            if (!Number.isInteger(fields.duration) || fields.duration < 0) {
                throw new Error('Invalid duration');
            }
            updateFields.push('duration = ?');
            updateValues.push(fields.duration);
        }

        updateValues.push(entryId);
        const query = `UPDATE time_entries SET ${updateFields.join(', ')} WHERE id = ? RETURNING *`;
        const result = await dbUtils.runQuery(query, updateValues);

        if (!result || !result.success) {
            throw new Error('Failed to update time entry');
        }

        return true;
    }

    // 🔹 **Elimina una voce di tempo**
    static async deleteTimeEntry(entryId) {
        if (!Number.isInteger(entryId) || entryId <= 0) {
            throw new Error('Invalid entry ID');
        }

        const query = `DELETE FROM time_entries WHERE id = ?`;
        const result = await dbUtils.runQuery(query, [entryId]);

        return result.success;
    }
}

module.exports = TimeEntry;