const dbUtils = require('../utils/dbUtils');

class AlertsController {
    async getAlerts() {
        const query = 'SELECT * FROM alerts';
        const alerts = await dbUtils.runQuery(query);
        return alerts;
    }

    async addAlert(alertData) {
        const query = 'INSERT INTO alerts (title, project, type, priority, date) VALUES (?, ?, ?, ?, ?)';
        const params = [alertData.title, alertData.project, alertData.type, alertData.priority, alertData.date];
        await dbUtils.runQuery(query, params);
    }

    async removeAlert(id) {
        const query = 'DELETE FROM alerts WHERE id = ?';
        await dbUtils.runQuery(query, [id]);
    }

    async updateAlert(id, updatedData) {
        const query = 'UPDATE alerts SET title = ?, project = ?, type = ?, priority = ?, date = ? WHERE id = ?';
        const params = [updatedData.title, updatedData.project, updatedData.type, updatedData.priority, updatedData.date, id];
        await dbUtils.runQuery(query, params);
    }

    async getAlertById(id) {
        const query = 'SELECT * FROM alerts WHERE id = ?';
        const alert = await dbUtils.runQuery(query, [id]);
        return alert[0];
    }
}

module.exports = AlertsController;