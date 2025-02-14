class Activity {
    constructor(id, name, duration = 0, project_id = null, startTime = new Date()) {
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('Invalid id');
        }
        if (typeof name !== 'string' || name.trim() === '') {
            throw new Error('Invalid name');
        }
        if (typeof duration !== 'number' || duration < 0) {
            throw new Error('Invalid duration');
        }
        if (project_id !== null && typeof project_id !== 'number') {
            throw new Error('Invalid project_id');
        }

        this.id = id;
        this.name = name;
        this.duration = duration;
        this.project_id = project_id;
        this.startTime = startTime;
        this.endTime = new Date(this.startTime.getTime() + duration * 1000);
        this.createdAt = new Date();
    }

    toDbObject() {
        return {
            id: this.id,
            name: this.name,
            duration: this.duration,
            project_id: this.project_id,
            start_time: this.startTime.toISOString(),
            end_time: this.endTime.toISOString()
        };
    }

    static createFromDbRow(row) {
        return new Activity(row.id, row.name, row.duration, row.project_id, new Date(row.start_time));
    }
}

module.exports = Activity;