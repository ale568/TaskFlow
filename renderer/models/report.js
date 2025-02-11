class Report {
    constructor(id, project, task, description, tag, duration, date) {
        this.id = id;
        this.project = project;
        this.task = task;
        this.description = description;
        this.tag = tag;
        this.duration = duration;
        this.date = date;
    }

    update(fields) {
        Object.assign(this, fields);
    }
}

module.exports = Report;