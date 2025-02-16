const dbUtils = require('../utils/dbUtils');

class Alert {
    constructor(id, title, project_id, type, priority, date, resolved = 0) {
        this.id = id;
        this.title = title;
        this.project_id = project_id;
        this.type = type;
        this.priority = priority;
        this.date = date;
        this.resolved = resolved;
    }

    // 🔹 **Crea un nuovo alert nel database**
    static async createAlert(title, project_id, type, priority, date) {
        if (!title || typeof title !== 'string' || title.trim() === '') {
            throw new Error('Invalid title');
        }
        if (!project_id || typeof project_id !== 'number' || project_id <= 0) {
            throw new Error('Invalid project_id');
        }

        const checkProject = await dbUtils.runQuery(`SELECT id FROM projects WHERE id = ?`, [project_id]);
        if (!checkProject || checkProject.length === 0) {
            throw new Error(`Project with id ${project_id} does not exist`);
        }

        const query = `INSERT INTO alerts (title, project_id, type, priority, date, resolved) 
                       VALUES (?, ?, ?, ?, ?, ?) RETURNING *`;
        const result = await dbUtils.runQuery(query, [title, project_id, type, priority, date, 0]);

        if (!result || !result.success) {
            throw new Error('Failed to create alert');
        }

        return new Alert(result.lastInsertRowid, title, project_id, type, priority, date, 0);
    }

    // 🔹 **Recupera un alert per ID**
    static async getAlertById(alertId) {
        if (!alertId || typeof alertId !== 'number' || alertId <= 0) {
            throw new Error('Invalid alert ID');
        }

        const query = `SELECT * FROM alerts WHERE id = ?`;
        const result = await dbUtils.runQuery(query, [alertId]);

        if (!result || result.length === 0) {
            return null;
        }

        const row = result[0];
        return new Alert(row.id, row.title, row.project_id, row.type, row.priority, row.date, row.resolved);
    }

    // 🔹 **Recupera tutti gli alert di un progetto**
    static async getAlertsByProjectId(project_id) {
        if (!project_id || typeof project_id !== 'number' || project_id <= 0) {
            throw new Error('Invalid project ID');
        }

        const query = `SELECT * FROM alerts WHERE project_id = ?`;
        const results = await dbUtils.runQuery(query, [project_id]);

        return results.map(row => new Alert(row.id, row.title, row.project_id, row.type, row.priority, row.date, row.resolved));
    }

    // 🔹 **Aggiorna un alert**
    static async updateAlert(alertId, fields) {
        if (!alertId || typeof alertId !== 'number' || alertId <= 0) {
            throw new Error('Invalid alert ID');
        }

        let updateFields = [];
        let updateValues = [];

        if (fields.title !== undefined) {
            updateFields.push('title = ?');
            updateValues.push(fields.title);
        }
        if (fields.resolved !== undefined) {
            updateFields.push('resolved = ?');
            updateValues.push(fields.resolved);
        }

        if (updateFields.length === 0) {
            throw new Error('No valid fields to update');
        }

        updateValues.push(alertId);
        const query = `UPDATE alerts SET ${updateFields.join(', ')} WHERE id = ? RETURNING *`;
        const result = await dbUtils.runQuery(query, updateValues);

        if (!result || !result.success) {
            throw new Error('Failed to update alert');
        }

        return true;
    }

    // 🔹 **Elimina un alert**
    static async deleteAlert(alertId) {
        if (!alertId || typeof alertId !== 'number' || alertId <= 0) {
            throw new Error('Invalid alert ID');
        }

        const query = `DELETE FROM alerts WHERE id = ?`;
        const result = await dbUtils.runQuery(query, [alertId]);

        return result.success;
    }
}

module.exports = Alert;
