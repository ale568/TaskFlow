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

    isValid() {
        return this.project && this.task && this.startTime && this.duration;
    }

    toJSON() {
        return {
            id: this.id,
            project: this.project,
            task: this.task,
            startTime: this.startTime,
            duration: this.duration
        };
    }

    static createFromDbRow(row) {
        return new TimeEntry(row.id, row.project, row.task, row.startTime, row.duration);
    }
}

module.exports = TimeEntry;