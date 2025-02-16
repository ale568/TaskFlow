const dbUtils = require('../utils/dbUtils');

class Timer {
    constructor(id, project_id, task, startTime, endTime, status) {
        this.id = id;
        this.project_id = project_id;
        this.task = task;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
    }

    // 🔹 **Crea un nuovo timer nel database**
    static async createTimer(project_id, task) {
        if (!project_id || typeof project_id !== 'number' || project_id <= 0) {
            throw new Error('Invalid project_id');
        }
        if (!task || typeof task !== 'string' || task.trim() === '') {
            throw new Error('Invalid task');
        }

        const checkProject = await dbUtils.runQuery(`SELECT id FROM projects WHERE id = ?`, [project_id]);
        if (!checkProject || checkProject.length === 0) {
            throw new Error(`Project with id ${project_id} does not exist`);
        }

        const startTime = new Date().toISOString();
        const query = `INSERT INTO timers (project_id, task, startTime, status) VALUES (?, ?, ?, 'running') RETURNING *`;
        const result = await dbUtils.runQuery(query, [project_id, task, startTime]);

        if (!result || !result.success) {
            throw new Error('Failed to create timer');
        }

        return new Timer(result.lastInsertRowid, project_id, task, startTime, null, 'running');
    }

    // 🔹 **Recupera un timer per ID**
    static async getTimerById(timerId) {
        if (timerId === null || timerId === undefined || typeof timerId !== 'number' || timerId <= 0) {
            throw new Error('Invalid timer ID');
        }

        const query = `SELECT * FROM timers WHERE id = ?`;
        const result = await dbUtils.runQuery(query, [timerId]);

        if (!result || result.length === 0) {
            return null;
        }

        const row = result[0];
        return new Timer(row.id, row.project_id, row.task, row.startTime, row.endTime, row.status);
    }

    // 🔹 **Aggiorna lo stato di un timer**
    static async updateTimerStatus(timerId, newStatus) {
        if (!['running', 'paused', 'stopped'].includes(newStatus)) {
            throw new Error('Invalid status');
        }

        let endTime = null;
        if (newStatus === 'stopped') {
            endTime = new Date().toISOString();
        }

        const query = `UPDATE timers SET status = ?, endTime = ? WHERE id = ? RETURNING *`;
        const result = await dbUtils.runQuery(query, [newStatus, endTime, timerId]);

        if (!result || !result.success) {
            throw new Error('Failed to update timer');
        }

        return Timer.getTimerById(timerId);
    }

    // 🔹 **Elimina un timer**
    static async deleteTimer(timerId) {
        const query = `DELETE FROM timers WHERE id = ?`;
        const result = await dbUtils.runQuery(query, [timerId]);

        return result.success;
    }
}

module.exports = Timer;
