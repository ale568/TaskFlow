class Activity {
    constructor(id, name, duration, project_id = null) {
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('Invalid id');
        }
        if (typeof name !== 'string' || name.trim() === '') {
            throw new Error('Invalid name');
        }
        if (typeof duration !== 'number' || duration <= 0) {
            throw new Error('Invalid duration');
        }
        if (project_id !== null && typeof project_id !== 'number') {
            throw new Error('Invalid project_id');
        }

        this.id = id;
        this.name = name;
        this.duration = duration;
        this.project_id = project_id;
        this.createdAt = new Date();
    }

    toDbObject() {
        return {
            id: this.id,
            name: this.name,
            duration: this.duration,
            project_id: this.project_id
        };
    }

    static createFromDbRow(row) {
        return new Activity(row.id, row.name, row.duration, row.project_id);
    }
}

module.exports = Activity;