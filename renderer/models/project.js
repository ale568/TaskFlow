class Project {
    constructor(name, description = null) {
        this.name = name;
        this.description = description;
        this.activities = [];
    }

    addActivity(activity) {
        this.activities.push(activity);
    }

    getTotalTime() {
        return this.activities.reduce((total, activity) => total + activity.duration, 0);
    }
}

module.exports = Project;