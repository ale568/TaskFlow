const storageUtils = require('../utils/storageUtils');

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

    static async createAlert(title, project_id, type, priority, date) {
        const alertData = await storageUtils.createAlert(title, project_id, type, priority, date);
        return alertData ? new Alert(...Object.values(alertData)) : null;
    }

    static async getAlertById(alertId) {
        const alertData = await storageUtils.getAlertById(alertId);
        return alertData ? new Alert(...Object.values(alertData)) : null;
    }

    static async getAlertsByProjectId(project_id) {
        const alerts = await storageUtils.getAlertsByProjectId(project_id);
        return alerts.map(data => new Alert(...Object.values(data)));
    }

    static async updateAlert(alertId, fields) {
        return await storageUtils.updateAlert(alertId, fields);
    }

    static async deleteAlert(alertId) {
        return await storageUtils.deleteAlert(alertId);
    }
}

module.exports = Alert;

