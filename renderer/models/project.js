class Project {
    constructor(name, description = null, id = null, createdAt = new Date().toISOString(), updatedAt = new Date().toISOString()) {
        if (!name || typeof name !== 'string' || name.trim() === '') {
            throw new Error('Project name is required');
        }
        this.id = id;
        this.name = name;
        this.description = description;
        this.created_at = createdAt;
        this.updated_at = updatedAt;
        this.activities = [];
    }

    addActivity(activity) {
        if (!activity.id) {
            activity.id = this.activities.length + 1;
        }
        this.activities.push(activity);
        this.updated_at = new Date().toISOString();
    }

    getTotalTime() {
        return this.activities.reduce((total, activity) => {
            const duration = activity.duration;
            return total + (isNaN(duration) || duration === null || duration === undefined ? 0 : duration);
        }, 0);
    }

    toDbObject() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }

    static createFromDbRow(row) {
        return new Project(row.name, row.description, row.id, row.created_at, row.updated_at);
    }
}

module.exports = Project;