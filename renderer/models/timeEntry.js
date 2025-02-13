class TimeEntry {
    constructor(id, project, task, startTime, duration) {
        this.id = id || null;
        this.project = project || '';
        this.task = task !== undefined ? task : '';
        this.startTime = startTime || '';
        this.duration = duration || 0;
    }

    update(fields) {
        Object.assign(this, fields);
    }

    isValid() {
        return (
            typeof this.project === 'string' && this.project.trim() !== '' &&
            typeof this.task === 'string' && this.task.trim() !== '' &&
            typeof this.startTime === 'string' && this.startTime.trim() !== '' &&
            typeof this.duration === 'number' && this.duration > 0
        );
    }

    toJSON() {
        return {
            id: this.id,
            project: this.project || '',
            task: this.task !== undefined ? this.task : undefined,
            startTime: this.startTime || '',
            duration: this.duration || 0
        };
    }

    clone() {
        return new TimeEntry(this.id, this.project, this.task, this.startTime, this.duration);
    }

    static createFromDbRow(row) {
        if (
            !row.id ||
            typeof row.project !== 'string' || row.project.trim() === '' ||
            typeof row.task !== 'string' || row.task.trim() === '' ||
            typeof row.startTime !== 'string' || row.startTime.trim() === '' ||
            typeof row.duration !== 'number' || row.duration <= 0
        ) {
            throw new Error('Invalid data');
        }
        return new TimeEntry(row.id, row.project, row.task, row.startTime, row.duration);
    }
}

module.exports = TimeEntry;