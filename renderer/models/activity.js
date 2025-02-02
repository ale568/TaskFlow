class Activity {
    constructor(name, duration, project = null) {
        this.name = name;
        this.duration = duration;
        this.project = project;
        this.startTime = new Date();
        this.endTime = new Date(this.startTime.getTime() + duration * 1000);
    }
}

module.exports = Activity;