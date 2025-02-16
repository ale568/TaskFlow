const dbUtils = require('../utils/dbUtils');

class Report {
    constructor(id, project_id, total_hours, startDate, endDate) {
        this.id = id;
        this.project_id = project_id;
        this.total_hours = total_hours;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // 🔹 **Crea un nuovo report nel database**
    static async createReport(project_id, total_hours, startDate, endDate) {
        if (!project_id || typeof project_id !== 'number' || project_id <= 0) {
            throw new Error('Invalid project_id');
        }
        if (typeof total_hours !== 'number' || total_hours < 0) {
            throw new Error('Invalid total_hours');
        }
        if (!startDate || !endDate) {
            throw new Error('Both startDate and endDate are required');
        }
        if (new Date(startDate) >= new Date(endDate)) {
            throw new Error('Invalid date range');
        }

        const checkProject = await dbUtils.runQuery(`SELECT id FROM projects WHERE id = ?`, [project_id]);
        if (!checkProject || checkProject.length === 0) {
            throw new Error(`Project with id ${project_id} does not exist`);
        }

        const query = `INSERT INTO reports (project_id, total_hours, startDate, endDate) VALUES (?, ?, ?, ?) RETURNING *`;
        const result = await dbUtils.runQuery(query, [project_id, total_hours, startDate, endDate]);

        if (!result || !result.success) {
            throw new Error('Failed to create report');
        }

        return new Report(result.lastInsertRowid, project_id, total_hours, startDate, endDate);
    }

    // 🔹 **Recupera un report per ID**
    static async getReportById(reportId) {
        if (!reportId || typeof reportId !== 'number' || reportId <= 0) {
            throw new Error('Invalid report ID');
        }

        const query = `SELECT * FROM reports WHERE id = ?`;
        const result = await dbUtils.runQuery(query, [reportId]);

        if (!result || result.length === 0) {
            return null;
        }

        const row = result[0];
        return new Report(row.id, row.project_id, row.total_hours, row.startDate, row.endDate);
    }

    // 🔹 **Recupera tutti i report di un progetto**
    static async getReportsByProjectId(project_id) {
        if (!project_id || typeof project_id !== 'number' || project_id <= 0) {
            throw new Error('Invalid project ID');
        }

        const query = `SELECT * FROM reports WHERE project_id = ?`;
        const results = await dbUtils.runQuery(query, [project_id]);

        return results.map(row => new Report(row.id, row.project_id, row.total_hours, row.startDate, row.endDate));
    }

    // 🔹 **Elimina un report**
    static async deleteReport(reportId) {
        if (!reportId || typeof reportId !== 'number' || reportId <= 0) {
            throw new Error('Invalid report ID');
        }

        const query = `DELETE FROM reports WHERE id = ?`;
        const result = await dbUtils.runQuery(query, [reportId]);

        return result.success;
    }
}

module.exports = Report;
