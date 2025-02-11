class Alert {
    constructor(id, title, project, type, priority, date) {
        this.id = id;
        this.title = title;
        this.project = project;
        this.type = type;
        this.priority = priority;
        this.date = date;
    }

    update(fields) {
        Object.assign(this, fields);
    }
}

module.exports = Alert;