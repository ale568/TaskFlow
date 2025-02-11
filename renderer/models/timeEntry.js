class TimeEntry {
    constructor(id, project, task, startTime, duration) {
        this.id = id;
        this.project = project;
        this.task = task;
        this.startTime = startTime;
        this.duration = duration;
    }

    update(fields) {
        Object.assign(this, fields);
    }
}

module.exports = TimeEntry;