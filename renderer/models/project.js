const dbUtils = require('../utils/dbUtils');

class Project {
    constructor(id, name, description, created_at, updated_at) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    // 🔹 **Crea un nuovo progetto nel database**
    static async createProject(name, description = null) {
        if (!name || typeof name !== 'string' || name.trim() === '') {
            throw new Error('Invalid project name');
        }

        const createdAt = new Date().toISOString().split('T')[0];
        const updatedAt = createdAt;

        const query = `INSERT INTO projects (name, description, created_at, updated_at) 
                       VALUES (?, ?, ?, ?) RETURNING *`;
        const result = await dbUtils.runQuery(query, [name, description, createdAt, updatedAt]);

        if (!result || !result.success) {
            throw new Error('Failed to create project');
        }

        return new Project(result.lastInsertRowid, name, description, createdAt, updatedAt);
    }

    // 🔹 **Recupera un progetto per ID**
    static async getProjectById(projectId) {
        if (!projectId || typeof projectId !== 'number' || projectId <= 0) {
            throw new Error('Invalid project ID');
        }

        const query = `SELECT * FROM projects WHERE id = ?`;
        const result = await dbUtils.runQuery(query, [projectId]);

        if (!result || result.length === 0) {
            return null;
        }

        const row = result[0];
        return new Project(row.id, row.name, row.description, row.created_at, row.updated_at);
    }

    // 🔹 **Recupera tutti i progetti**
    static async getAllProjects() {
        const query = `SELECT * FROM projects`;
        const results = await dbUtils.runQuery(query);

        return results.map(row => new Project(row.id, row.name, row.description, row.created_at, row.updated_at));
    }

    // 🔹 **Aggiorna un progetto**
    static async updateProject(projectId, fields) {
        if (!projectId || typeof projectId !== 'number' || projectId <= 0) {
            throw new Error('Invalid project ID');
        }

        let updateFields = [];
        let updateValues = [];

        if (fields.name !== undefined) {
            updateFields.push('name = ?');
            updateValues.push(fields.name);
        }
        if (fields.description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(fields.description);
        }

        if (updateFields.length === 0) {
            throw new Error('No valid fields to update');
        }

        updateValues.push(new Date().toISOString().split('T')[0]);
        updateFields.push('updated_at = ?');

        updateValues.push(projectId);
        const query = `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ? RETURNING *`;
        const result = await dbUtils.runQuery(query, updateValues);

        if (!result || !result.success) {
            throw new Error('Failed to update project');
        }

        return true;
    }

    // 🔹 **Elimina un progetto**
    static async deleteProject(projectId) {
        if (!projectId || typeof projectId !== 'number' || projectId <= 0) {
            throw new Error('Invalid project ID');
        }

        const query = `DELETE FROM projects WHERE id = ?`;
        const result = await dbUtils.runQuery(query, [projectId]);

        return result.success;
    }
}

module.exports = Project;
