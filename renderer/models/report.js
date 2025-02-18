const storageUtils = require('../utils/storageUtils');

class Report {
    constructor(id, project_id, total_hours, startDate, endDate) {
        this.id = id;
        this.project_id = project_id;
        this.total_hours = total_hours;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    static async createReport(project_id, total_hours, startDate, endDate) {
        const reportData = await storageUtils.createReport(project_id, total_hours, startDate, endDate);
        return reportData ? new Report(...Object.values(reportData)) : null;
    }

    static async getReportById(reportId) {
        const reportData = await storageUtils.getReportById(reportId);
        return reportData ? new Report(...Object.values(reportData)) : null;
    }

    static async getReportsByProjectId(project_id) {
        const reports = await storageUtils.getReportsByProjectId(project_id);
        return reports.map(data => new Report(...Object.values(data)));
    }

    static async updateReport(reportId, fields) {
        return await storageUtils.updateReport(reportId, fields);
    }

    static async deleteReport(reportId) {
        return await storageUtils.deleteReport(reportId);
    }
}

module.exports = Report;

