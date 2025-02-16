const dbUtils = require('../utils/dbUtils');

class Activity {
    constructor(id, name, project_id, duration) {
        this.id = id;
        this.name = name;
        this.project_id = project_id;
        this.duration = duration;
    }

    // 🔹 **Crea una nuova attività nel database**
    static async createActivity(name, project_id, duration = 0) {
        if (!name || typeof name !== 'string' || name.trim() === '') {
            throw new Error('Invalid name');
        }
        if (!project_id || typeof project_id !== 'number' || project_id <= 0) {
            throw new Error('Invalid project_id');
        }
        if (typeof duration !== 'number' || duration < 0) {
            throw new Error('Invalid duration');
        }

        const checkProject = await dbUtils.runQuery(`SELECT id FROM projects WHERE id = ?`, [project_id]);
        if (!checkProject || checkProject.length === 0) {
            throw new Error(`Project with id ${project_id} does not exist`);
        }

        const query = `INSERT INTO activities (name, project_id, duration) VALUES (?, ?, ?) RETURNING *`;
        const result = await dbUtils.runQuery(query, [name, project_id, duration]);

        if (!result || !result.success) {
            throw new Error('Failed to create activity');
        }

        return new Activity(result.lastInsertRowid, name, project_id, duration);
    }

    // 🔹 **Recupera un'attività per ID**
    static async getActivityById(activityId) {
        if (!activityId || typeof activityId !== 'number' || activityId <= 0) {
            throw new Error('Invalid activity ID');
        }

        const query = `SELECT * FROM activities WHERE id = ?`;
        const result = await dbUtils.runQuery(query, [activityId]);

        if (!result || result.length === 0) {
            return null;
        }

        const row = result[0];
        return new Activity(row.id, row.name, row.project_id, row.duration);
    }

    // 🔹 **Aggiorna la durata di un'attività**
    static async updateActivityDuration(activityId, newDuration) {
        if (typeof newDuration !== 'number' || newDuration < 0) {
            throw new Error('Invalid duration');
        }

        const query = `UPDATE activities SET duration = ? WHERE id = ? RETURNING *`;
        const result = await dbUtils.runQuery(query, [newDuration, activityId]);

        if (!result || !result.success) {
            throw new Error('Failed to update activity');
        }

        return Activity.getActivityById(activityId);
    }

    // 🔹 **Elimina un'attività**
    static async deleteActivity(activityId) {
        const query = `DELETE FROM activities WHERE id = ?`;
        const result = await dbUtils.runQuery(query, [activityId]);

        return result.success;
    }
}

module.exports = Activity;
