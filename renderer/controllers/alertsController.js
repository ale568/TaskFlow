class AlertsController {
    constructor() {
        this.alerts = [];
    }

    addAlert(alert) {
        this.alerts.push(alert);
    }

    removeAlert(id) {
        this.alerts = this.alerts.filter(alert => alert.id !== id);
    }

    updateAlert(id, updatedData) {
        const alertIndex = this.alerts.findIndex(alert => alert.id === id);
        if (alertIndex !== -1) {
            this.alerts[alertIndex] = { ...this.alerts[alertIndex], ...updatedData };
        }
    }

    getAlerts() {
        return this.alerts;
    }

    getAlertById(id) {
        return this.alerts.find(alert => alert.id === id);
    }

    setAlerts(alerts) {
        this.alerts = alerts;
    }
}

module.exports = AlertsController;